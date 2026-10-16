import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import {
  ECOSYSTEM_PLATFORMS,
  buildRealAnalyticsPayload
} from './analytics-data.js';
import { fetchAllBloggerPosts, createArticleFromBloggerPost } from './blogger-sync.js';
import { injectSearchableArticleIndex, registerSeoRoutes, setRuntimeCatalog } from './seo.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
app.use(express.json({ limit: '1mb' }));

// The canonical authority domain is always sci-phil.ai.studio. Redirect aliases
// before registering API/static routes so every path and query string follows the 301.
const PRIMARY_DOMAIN = 'sci-phil.ai.studio';
const LEGACY_DOMAINS = new Set([
  'science-philosophy.ai.studio',
  'www.science-philosophy.ai.studio',
  'science-philosophy-emre-pelit.ai.studio',
  'www.science-philosophy-emre-pelit.ai.studio'
]);
app.use((req, res, next) => {
  const host = (req.headers.host || '').toLowerCase().replace(/:\d+$/, '');
  if (LEGACY_DOMAINS.has(host) || host === `www.${PRIMARY_DOMAIN}`) {
    return res.redirect(301, `https://${PRIMARY_DOMAIN}${req.originalUrl}`);
  }
  next();
});

// Only URLs from successful Blogger feed syncs may be assigned Sci-Phi canonicals.
let synchronizedBloggerArticles: any[] = [];
function writeBloggerCanonicalScript(synchronizedFeedArticles: any[]) {
  if (Array.isArray(synchronizedFeedArticles) && synchronizedFeedArticles.length > 0) {
    synchronizedBloggerArticles = synchronizedFeedArticles.filter((article: any) =>
      article && article.slug && (article.originalUrl || article.url)
    );
  }
  const mapping: Record<string, string> = {};
  for (const article of synchronizedBloggerArticles) {
    const sourceUrl = String(article.originalUrl || article.url || '').trim();
    if (!/^https?:\/\/emrepelit7337\.blogspot\.com\//i.test(sourceUrl)) continue;
    const normalizedSource = sourceUrl.split('#')[0];
    const canonicalTarget = `https://${PRIMARY_DOMAIN}/makale/${encodeURIComponent(String(article.slug))}`;
    mapping[normalizedSource] = canonicalTarget;
    try { mapping[`${new URL(normalizedSource).origin}${new URL(normalizedSource).pathname}`] = canonicalTarget; } catch {}
  }
  const safeMapping = JSON.stringify(mapping).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `(function(){var map=${safeMapping};var here=window.location.href.split('#')[0];var target=map[here];if(!target){var clean=window.location.origin+window.location.pathname+window.location.search;target=map[clean]||map[window.location.origin+window.location.pathname];}if(!target)return;var link=document.querySelector('link[rel=canonical]');if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link);}link.href=target;var og=document.querySelector('meta[property="og:url"]');if(og)og.content=target;})();`;
}

const PORT = Number(process.env.PORT || 3000);
const BLOG_SYNC_INTERVAL_MS = 15 * 60 * 1000;
const UMAMI_API_BASE_URL = (process.env.UMAMI_API_BASE_URL || 'https://api.umami.is/v1').replace(/\/$/, '');
const UMAMI_API_KEY = (process.env.UMAMI_API_KEY || '').trim();
const ANALYTICS_START_AT = process.env.ANALYTICS_START_AT || '2026-10-12T00:00:00+03:00';
const ANALYTICS_TIMEZONE = 'Europe/Istanbul';
const ALLOWED_ANALYTICS_HOSTS = new Set([
  'sci-phil.ai.studio', 'www.sci-phil.ai.studio',
  'emrepelit7337.blogspot.com',
  'science-philosophy.grok.me',
  'science-philosophy.ai.studio',
  'science-philosophy-emre-pelit.ai.studio'
]);

const TRACKED_SITES: Record<string, { name: string; domain: string; envKey: string }> = {
  'sci-phil': { name: 'Sci-Phi ana sitesi', domain: 'sci-phil.ai.studio', envKey: 'UMAMI_WEBSITE_ID' },
  'blogger': { name: 'Blogger Türkçe arşivi', domain: 'emrepelit7337.blogspot.com', envKey: 'UMAMI_BLOGGER_WEBSITE_ID' },
  'grokme': { name: 'Science & Philosophy Grok.me', domain: 'science-philosophy.grok.me', envKey: 'UMAMI_GROKME_WEBSITE_ID' },
  'github-pages': { name: 'GitHub Pages arşivi', domain: 'emrepelit109.github.io', envKey: 'UMAMI_GITHUB_PAGES_WEBSITE_ID' },
  'legacy-ep': { name: 'Eski AI Studio sitesi', domain: 'science-philosophy-emre-pelit.ai.studio', envKey: 'UMAMI_LEGACY_EP_WEBSITE_ID' },
  'legacy-sp': { name: 'Eski Science-Philosophy sitesi', domain: 'science-philosophy.ai.studio', envKey: 'UMAMI_LEGACY_SP_WEBSITE_ID' },
  'socratic-lab': { name: 'Sokratik Diyalog Laboratuvarı', domain: 'sci-phil.ai.studio', envKey: 'UMAMI_SOCRATIC_WEBSITE_ID' },
  'epistemic-matrix': { name: 'Epistemik Süzgeç', domain: 'sci-phil.ai.studio', envKey: 'UMAMI_EPISTEMIC_WEBSITE_ID' }
};

function getTrackedSite(key: string) {
  const definition = TRACKED_SITES[key] || TRACKED_SITES['sci-phil'];
  if (!definition) return null;
  const websiteId = (process.env[definition.envKey] || '').trim();
  return { ...definition, websiteId: websiteId || null };
}

function applyAnalyticsCors(req: express.Request, res: express.Response) {
  const origin = String(req.headers.origin || '');
  if (!origin) return;
  try {
    const host = new URL(origin).hostname.toLowerCase();
    if (ALLOWED_ANALYTICS_HOSTS.has(host)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Max-Age', '600');
    }
  } catch { /* Ignore malformed origins; no CORS access is granted. */ }
}

async function fetchUmamiSiteStats(websiteId: string | undefined, startAtIso: string) {
  if (!UMAMI_API_KEY || !websiteId || websiteId === 'YOUR_UMAMI_WEBSITE_ID') return null;
  try {
    const startAtMs = Date.parse(startAtIso);
    if (!Number.isFinite(startAtMs)) throw new Error('ANALYTICS_START_AT geçerli bir tarih değil.');
    const endAtMs = Date.now();
    const headers = { Authorization: `Bearer ${UMAMI_API_KEY}`, Accept: 'application/json' };
    const [statsRes, countriesRes] = await Promise.all([
      fetch(`${UMAMI_API_BASE_URL}/websites/${encodeURIComponent(websiteId)}/stats?startAt=${startAtMs}&endAt=${endAtMs}`, {
        headers, signal: AbortSignal.timeout(8000)
      }),
      fetch(`${UMAMI_API_BASE_URL}/websites/${encodeURIComponent(websiteId)}/metrics?startAt=${startAtMs}&endAt=${endAtMs}&type=country`, {
        headers, signal: AbortSignal.timeout(8000)
      })
    ]);
    if (!statsRes.ok) return null;
    const stats = await statsRes.json();
    const countries = countriesRes.ok ? await countriesRes.json() : [];
    return buildRealAnalyticsPayload(stats, countries, {
      startAt: startAtIso,
      endAt: new Date(endAtMs).toISOString(),
      timezone: ANALYTICS_TIMEZONE
    });
  } catch (error) {
    console.warn('[Analytics] Umami sorgusu başarısız:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function fetchMultiSiteAnalytics() {
  const definitions = Object.entries(TRACKED_SITES).map(([key, site]) => ({ key, ...site }));
  const sites = await Promise.all(definitions.map(async (definition) => {
    const websiteId = (process.env[definition.envKey] || '').trim();
    if (!websiteId || websiteId === 'YOUR_UMAMI_WEBSITE_ID') {
      return { key: definition.key, name: definition.name, domain: definition.domain, status: 'not_configured', visitors: null, pageviews: null, visits: null };
    }
    if (!UMAMI_API_KEY) {
      return { key: definition.key, name: definition.name, domain: definition.domain, status: 'api_key_missing', visitors: null, pageviews: null, visits: null };
    }
    const startAt = definition.key === 'sci-phil' ? ANALYTICS_START_AT : (ECOSYSTEM_PLATFORMS.find((item) => item.envKey === definition.envKey)?.launchAt || ANALYTICS_START_AT);
    const payload = await fetchUmamiSiteStats(websiteId, startAt);
    if (!payload) {
      return { key: definition.key, name: definition.name, domain: definition.domain, status: 'error', visitors: null, pageviews: null, visits: null };
    }
    return {
      key: definition.key, name: definition.name, domain: definition.domain, status: 'connected',
      visitors: payload.visitors, pageviews: payload.pageviews, visits: payload.visits,
      startAt: payload.startAt, endAt: payload.endAt
    };
  }));
  const connected = sites.filter((site) => site.status === 'connected');
  const sumOrNull = (key: 'visitors' | 'pageviews' | 'visits') => connected.length
    ? connected.reduce((sum, site: any) => sum + Number(site[key] || 0), 0)
    : null;
  return {
    configured: Boolean((process.env.UMAMI_WEBSITE_ID || '').trim() && UMAMI_API_KEY),
    readOnly: true,
    complete: connected.length === sites.length,
    connectedSites: connected.length,
    listedSites: sites.length,
    sites,
    totals: { visitors: sumOrNull('visitors'), pageviews: sumOrNull('pageviews'), visits: sumOrNull('visits') },
    startAt: ANALYTICS_START_AT,
    endAt: new Date().toISOString(),
    note: 'Yalnızca Umami API yanıtları kullanılır; eksik veya bağlı olmayan siteler için tahmin üretilmez. Siteler arası toplamlar aynı ziyaretçiyi tekilleştiremez.'
  };
}

app.get('/healthz', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/analytics', (_req, res) => res.redirect(301, '/analytics.html'));

app.options('/api/analytics/config', (req, res) => {
  applyAnalyticsCors(req, res);
  res.status(204).end();
});

app.get('/api/analytics/config', (req, res) => {
  applyAnalyticsCors(req, res);
  const site = getTrackedSite(String(req.query.site || 'sci-phil'));
  res.set('Cache-Control', 'no-store');
  res.json({
    enabled: Boolean(site?.websiteId),
    websiteId: site?.websiteId || null,
    domains: site?.domain || 'sci-phil.ai.studio',
    scriptUrl: process.env.UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js',
    platformCount: Object.keys(TRACKED_SITES).length
  });
});

app.get('/api/analytics/sites-summary', async (_req, res) => {
  const data = await fetchMultiSiteAnalytics();
  res.set('Cache-Control', 'no-store');
  res.json(data);
});

app.get('/api/analytics/summary', async (_req, res) => {
  const websiteId = (process.env.UMAMI_WEBSITE_ID || '').trim();
  if (!websiteId || websiteId === 'YOUR_UMAMI_WEBSITE_ID' || !UMAMI_API_KEY) {
    return res.status(503).json({
      configured: false, readOnly: true,
      startAt: ANALYTICS_START_AT,
      milestone: '12 Ekim 2026 00.00 (Türkiye saati)',
      timezone: ANALYTICS_TIMEZONE,
      error: 'Canlı analitik için UMAMI_WEBSITE_ID ve sunucu tarafında UMAMI_API_KEY yapılandırılmalıdır.'
    });
  }
  const data = await fetchUmamiSiteStats(websiteId, ANALYTICS_START_AT);
  if (!data) {
    return res.status(502).json({
      configured: true, readOnly: true,
      startAt: ANALYTICS_START_AT,
      milestone: '12 Ekim 2026 00.00 (Türkiye saati)',
      timezone: ANALYTICS_TIMEZONE,
      error: 'Umami API verisi alınamadı. Website ID, API anahtarı ve API yetkilerini kontrol edin.'
    });
  }
  res.set('Cache-Control', 'no-store');
  res.json({
    ...data,
    configured: true,
    readOnly: true,
    provider: 'Umami Cloud API',
    milestone: '12 Ekim 2026 00.00 (Türkiye saati)',
    timezone: ANALYTICS_TIMEZONE,
    refreshedAt: new Date().toISOString()
  });
});

// Gemini Durum ve Sokratik Diyalog API Uç Noktaları
app.get('/api/gemini/status', (_req, res) => {
  const googleKey = process.env.GOOGLE_API_KEY?.trim();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const activeKey = googleKey || geminiKey;
  res.json({
    configured: Boolean(activeKey && activeKey !== 'MY_GEMINI_API_KEY'),
    keySource: googleKey ? 'GOOGLE_API_KEY' : (geminiKey ? 'GEMINI_API_KEY' : null),
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash'
  });
});

// Translation endpoints use only server-side credentials and never return key material.
const targetLanguageNames: Record<string, string> = {
  tr: 'Türkçe', en: 'English', de: 'Deutsch', fr: 'Français', es: 'Español',
  ru: 'Русский', ar: 'العربية', it: 'Italiano', pt: 'Português', ja: '日本語',
  zh: '中文', ko: '한국어', nl: 'Nederlands', pl: 'Polski', hi: 'हिन्दी'
};
const languageNames = targetLanguageNames;
const siteTranslationCache = new Map<string, any>();
const articleTranslationCache = new Map<string, any>();

function stableRevision(value: unknown) {
  const raw = typeof value === 'string' ? value : JSON.stringify(value ?? {});
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function extractJsonObject(value: unknown) {
  const text = String(value || '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('Çeviri sağlayıcısı geçerli JSON döndürmedi.');
  return JSON.parse(text.slice(start, end + 1));
}

function hasCompleteArticleTranslation(value: any, source: any) {
  if (!value || typeof value.translatedTitle !== 'string' || !value.translatedTitle.trim()) return false;
  if (String(source.summary || '').trim() && (typeof value.translatedSummary !== 'string' || !value.translatedSummary.trim())) return false;
  if (String(source.content || '').trim() && (typeof value.translatedContent !== 'string' || !value.translatedContent.trim())) return false;
  const sourceTriad = source.dialecticalTriad || {};
  const resultTriad = value.translatedDialecticalTriad || {};
  return ['claim', 'counterClaim', 'whatIsNotEvidence', 'methodologicalNote']
    .every((field) => !String(sourceTriad[field] || '').trim() || Boolean(String(resultTriad[field] || '').trim()));
}

async function translateLongHtml(
  ai: GoogleGenAI,
  sourceHtml: string,
  sourceLanguage: string,
  targetLanguage: string,
  article: { title: string; summary: string; dialecticalTriad?: Record<string, string> }
) {
  const prompt = `Translate the supplied article into ${targetLanguage}, from ${sourceLanguage}. Return ONLY valid JSON with keys translatedTitle, translatedSummary, translatedContent, translatedDialecticalTriad. Keep the full article body: do not summarize, omit paragraphs, or invent content. Preserve every HTML tag, its nesting, image/source URLs, attributes, links, code, mathematical notation and embedded media; translate visible prose and human-readable alt/title text only. Preserve the dialectical-triad keys claim, counterClaim, whatIsNotEvidence, methodologicalNote. If the source field is empty, return an empty string for that field.
SOURCE JSON:
${JSON.stringify({ title: article.title, summary: article.summary, dialecticalTriad: article.dialecticalTriad || {}, content: sourceHtml })}`;
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });
  return extractJsonObject(response.text);
}

app.post('/api/gemini/translate-site', async (req, res) => {
  const requestArticles = Array.isArray(req.body?.articles) ? req.body.articles : [];
  const langCode = String(req.body?.targetLanguageCode || '').trim().toLowerCase();
  const targetLanguage = targetLanguageNames[langCode];
  if (!requestArticles.length || requestArticles.length > 400) {
    return res.status(400).json({ success: false, error: 'Çeviri isteği 1–400 makale içermelidir.' });
  }
  if (!targetLanguage) return res.status(400).json({ success: false, error: 'Desteklenmeyen hedef dil.' });

  const posts = requestArticles.map((article: any) => ({
    id: String(article?.id || '').trim(),
    slug: String(article?.slug || '').trim(),
    language: String(article?.language || 'tr').trim().toLowerCase(),
    updatedAt: String(article?.updatedAt || ''),
    title: String(article?.title || '').trim(),
    summary: String(article?.summary || '').trim(),
    categories: Array.isArray(article?.categories) ? article.categories.map((item: unknown) => String(item)) : [],
    dialecticalTriad: article?.dialecticalTriad && typeof article.dialecticalTriad === 'object' ? article.dialecticalTriad : {}
  }));
  if (posts.some((article: any) => !article.id || !article.title || article.title.length > 1000 || article.summary.length > 5000)) {
    return res.status(400).json({ success: false, error: 'Makale kimliği, başlığı veya metin uzunluğu geçersiz.' });
  }
  if (new Set(posts.map((article) => article.id)).size !== posts.length) {
    return res.status(400).json({ success: false, error: 'Çeviri isteğinde yinelenen makale kimliği var.' });
  }

  const apiKey = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({ success: false, error: 'Toplu dil çevirisi için sunucuda GOOGLE_API_KEY veya GEMINI_API_KEY yapılandırılmalıdır.' });
  }

  const translations: Record<string, any> = {};
  const needsTranslation: any[] = [];
  for (const article of posts) {
    const cacheKey = `site:${langCode}:${article.id}:${stableRevision(article)}`;
    const cached = siteTranslationCache.get(cacheKey);
    const complete = Boolean(cached && typeof cached.title === 'string' && cached.title.trim() &&
      typeof cached.summary === 'string' && cached.summary.trim());
    if (!complete) continue;
    translations[article.id] = cached;
  }
  for (const article of posts) {
    if (!translations[article.id]) needsTranslation.push(article);
  }

  const ai = new GoogleGenAI({ apiKey });
  const batchSize = 10;
  const batches: any[][] = [];
  for (let index = 0; index < needsTranslation.length; index += batchSize) batches.push(needsTranslation.slice(index, index + batchSize));
  let missingTranslationCount = 0;
  // Limit concurrency to prevent a large catalogue request from creating an API burst.
  for (let index = 0; index < batches.length; index += 3) {
    const window = batches.slice(index, index + 3);
    const results = await Promise.all(window.map(async (batch) => {
      const prompt = `Translate these article-card metadata records into ${targetLanguage}. Source language is specified per item. Return ONLY JSON as {"translations":[{"id":"exact input id","title":"translated title","summary":"translated summary","categories":["translated categories"],"dialecticalTriad":{"claim":"...","counterClaim":"...","whatIsNotEvidence":"...","methodologicalNote":"..."}}]}. Return exactly one result for each supplied id, preserve all ids unchanged, preserve meaning without adding claims. JSON input:\n${JSON.stringify(batch)}`;
      try {
        const response = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });
        const parsed = extractJsonObject(response.text);
        return Array.isArray(parsed.translations) ? parsed.translations : [];
      } catch (error) {
        console.warn('[Translation] Metadata batch failed:', error instanceof Error ? error.message : String(error));
        return [];
      }
    }));

    for (let batchIndex = 0; batchIndex < window.length; batchIndex += 1) {
      const requested = window[batchIndex];
      const returned = Array.isArray(results[batchIndex]) ? results[batchIndex] : [];
      const allowedIds = new Set(requested.map((article: any) => article.id));
      const returnedById = new Map(returned.map((item: any) => [String(item?.id || ''), item]));
      for (const article of requested) {
        const item: any = returnedById.get(article.id);
        if (!allowedIds.has(article.id) || !item || typeof item.title !== 'string' || !item.title.trim() ||
          typeof item.summary !== 'string' || !item.summary.trim()) {
          missingTranslationCount += 1;
          continue;
        }
        const translation = {
          title: item.title.trim(),
          summary: item.summary.trim(),
          categories: Array.isArray(item.categories) && item.categories.length ? item.categories.map((entry: unknown) => String(entry)) : [],
          dialecticalTriad: item.dialecticalTriad && typeof item.dialecticalTriad === 'object' ? item.dialecticalTriad : {}
        };
        translations[article.id] = translation;
        siteTranslationCache.set(`site:${langCode}:${article.id}:${stableRevision(article)}`, translation);
      }
    }
  }

  if (missingTranslationCount > 0 || posts.some((article: any) => !translations[article.id])) {
    const incompleteCount = posts.filter((article: any) => !translations[article.id]).length;
    return res.status(502).json({ success: false, error: 'Bazı makaleler çevrilemedi; eksik katalog başarılı olarak işaretlenmedi.', missingTranslationCount: Math.max(missingTranslationCount, incompleteCount) });
  }
  return res.json({ success: true, translations, articleSignature: String(req.body?.articleSignature || ''), translatedCount: posts.length });
});

app.post('/api/gemini/translate', async (req, res) => {
  const articleId = String(req.body?.articleId || '').trim();
  const slug = String(req.body?.slug || articleId).trim();
  const sourceLanguageCode = String(req.body?.sourceLanguageCode || 'tr').trim().toLowerCase();
  const langCode = String(req.body?.targetLanguageCode || '').trim().toLowerCase();
  const sourceHtml = String(req.body?.content || '');
  const title = String(req.body?.title || '').trim();
  const summary = String(req.body?.summary || '').trim();
  const dialecticalTriad = req.body?.dialecticalTriad && typeof req.body.dialecticalTriad === 'object' ? req.body.dialecticalTriad : {};
  if (!articleId || !title || title.length > 1000 || summary.length > 10000 || sourceHtml.length > 80000) {
    return res.status(400).json({ success: false, error: 'Makale alanları geçersiz veya izin verilen uzunluğu aşıyor.' });
  }
  if (!languageNames[langCode] || !languageNames[sourceLanguageCode]) {
    return res.status(400).json({ success: false, error: 'Desteklenmeyen kaynak veya hedef dil.' });
  }
  const sourceRevision = stableRevision({ sourceLanguageCode, title, summary, sourceHtml, dialecticalTriad });
  const cacheKey = `article:${articleId}:${slug}:${langCode}:${sourceRevision}`;
  const cached = articleTranslationCache.get(cacheKey);
  if (cached && cached.translatedTitle && (!summary || cached.translatedSummary) && (!sourceHtml || cached.translatedContent)) {
    return res.json({ success: true, data: cached, cached: true, sourceRevision });
  }
  const apiKey = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.status(503).json({ success: false, error: 'Makale çevirisi için sunucuda GOOGLE_API_KEY veya GEMINI_API_KEY yapılandırılmalıdır.' });
  }
  try {
    const ai = new GoogleGenAI({ apiKey });
    const sourceHtmlForTranslation = sourceHtml;
    const result = await translateLongHtml(ai, sourceHtml, languageNames[sourceLanguageCode], languageNames[langCode], { title, summary, dialecticalTriad });
    const data = {
      translatedTitle: String(result?.translatedTitle || '').trim(),
      translatedSummary: String(result?.translatedSummary || '').trim(),
      translatedContent: String(result?.translatedContent || ''),
      translatedDialecticalTriad: result?.translatedDialecticalTriad && typeof result.translatedDialecticalTriad === 'object' ? result.translatedDialecticalTriad : {}
    };
    if (!hasCompleteArticleTranslation(data, { title, summary, content: sourceHtmlForTranslation, dialecticalTriad })) {
      return res.status(502).json({ success: false, error: 'Çeviri sağlayıcısı makalenin tüm alanlarını döndürmedi; eksik çeviri kaydedilmedi.' });
    }
    articleTranslationCache.set(cacheKey, data);
    return res.json({ success: true, data, sourceRevision });
  } catch (error: any) {
    const message = String(error?.message || error || 'Çeviri başarısız.');
    console.warn('[Translation] Article translation failed:', message);
    return res.status(502).json({ success: false, error: 'Makale çevirisi tamamlanamadı. API anahtarı, model erişimi ve içerik boyutunu kontrol edin.' });
  }
});

app.post('/api/gemini/socratic', async (req, res) => {
  const claim = String(req.body?.claim || '').trim();
  if (!claim) {
    return res.status(400).json({ error: 'Lütfen sorgulanacak bir iddia girin.' });
  }
  if (claim.length > 2000) {
    return res.status(400).json({ error: 'İddia metni çok uzun (maksimum 2000 karakter).' });
  }

  const apiKey = (process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY || '').trim();
  const fallbackPayload = {
    reply: `İddianız dikkat çekici: "${claim.slice(0, 120)}...". Peki bu önermenin dayandığı en temel ön kabulün yanlışlanabilirlik ölçütü nedir?`,
    matrix: {
      claim,
      counterClaim: 'Gözlemlenen korelasyonun, ölçüm aracının veya öznel kavramsal çerçevenin sınırlarından kaynaklanma ihtimali.',
      notProof: 'Pratik yaygınlık veya sezgisel tutarlılık, tek başına ontolojik zorunluluğun kanıtı değildir.'
    },
    source: 'fallback'
  };

  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return res.json(fallbackPayload);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Kullanıcı iddiası: "${claim}"
Lütfen Türkçe olarak Sokratik bir sorgulama yap ve yanıtı kesinlikle aşağıdaki JSON formatında döndür:
{
  "reply": "Sokratik derinleştirici soru",
  "matrix": {
    "claim": "Kullanıcının iddiasının özeti",
    "counterClaim": "Sokratik karşı tez",
    "notProof": "Neyin kanıt olmadığı"
  }
}`;
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-3.8-flash',
      contents: prompt,
      config: { responseMimeType: 'application/json' }
    });
    const parsed = JSON.parse(response.text || '{}');
    return res.json({
      reply: parsed.reply || fallbackPayload.reply,
      matrix: {
        claim: parsed.matrix?.claim || claim,
        counterClaim: parsed.matrix?.counterClaim || fallbackPayload.matrix.counterClaim,
        notProof: parsed.matrix?.notProof || fallbackPayload.matrix.notProof
      },
      source: 'gemini'
    });
  } catch (error: any) {
    const providerMessage = String(error?.message || error || '');
    if (/401|403|unauthori[sz]ed|api.?key|authentication|permission/i.test(providerMessage)) {
      const safeMessage = 'Gemini kimlik doğrulaması başarısız. GOOGLE_API_KEY veya GEMINI_API_KEY değerini sunucunun gizli değişkenlerinde kontrol edin; anahtarı frontend koduna koymayın.';
      const sanitizedMessage = safeMessage.replace(apiKey, '[REDACTED]');
      return res.status(502).json({ error: sanitizedMessage });
    }
    return res.json(fallbackPayload);
  }
});

// Katalog ve Blogger Senkronizasyon Uç Noktaları
let blogSyncState: { status: string; lastSyncedAt: string | null; syncedCount: number; error: string | null } = {
  status: 'pending', lastSyncedAt: null, syncedCount: 0, error: null
};
function currentBlogSyncStatus() {
  return { ...blogSyncState };
}
function readCatalog() {
  const catalogPath = path.join(__dirname, 'catalog.json');
  if (fs.existsSync(catalogPath)) {
    try {
      return JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
    } catch {}
  }
  return { total: 0, posts: [] };
}

// SEO pages, robots.txt and sitemap.xml use the same runtime catalogue as the API.
// This works on read-only hosting and immediately includes Blogger posts after sync.
let runtimeProjectCatalog = readCatalog();
setRuntimeCatalog(runtimeProjectCatalog);
registerSeoRoutes(app, { includeHome: false });

app.get('/api/seo/status', (_req, res) => {
  const posts = Array.isArray(runtimeProjectCatalog.posts) ? runtimeProjectCatalog.posts : [];
  const articleCount = posts.filter((post: any) => post && post.slug && post.title).length;
  res.json({
    canonicalOrigin: `https://${PRIMARY_DOMAIN}`,
    sitemapUrl: `https://${PRIMARY_DOMAIN}/sitemap.xml`,
    sitemapUrlCount: articleCount + 2,
    articleCount,
    robotsUrl: `https://${PRIMARY_DOMAIN}/robots.txt`,
    indexNowKeyFileAvailableInPackage: fs.existsSync(path.join(__dirname, 'public', '5d3436c931b6024c.txt')),
    indexNowSubmissionStatus: 'not_verified',
    searchConsoleConnected: false,
    bingWebmasterConnected: false,
    reportDataAvailable: false,
    projectionsAvailable: false,
    note: 'Bu sunucu Google Search Console veya Bing hesabına bağlı değildir. Sitemap URL listesi indekslenmiş sayfa sayısı değildir; gönderimler ve indeks durumu ilgili webmaster panellerinde doğrulanmalıdır.',
    refreshedAt: new Date().toISOString()
  });
});

app.get('/blogger-canonical.js', (_req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  res.type('application/javascript; charset=utf-8').send(writeBloggerCanonicalScript(synchronizedBloggerArticles));
});

app.get('/', (_req, res) => {
  try {
    const distIndex = path.join(__dirname, 'dist', 'index.html');
    const rootIndex = path.join(__dirname, 'index.html');
    const source = fs.existsSync(distIndex) ? distIndex : rootIndex;
    let page = fs.readFileSync(source, 'utf8');
    page = injectSearchableArticleIndex(page, runtimeProjectCatalog);
    res.set('Cache-Control', 'public, max-age=300');
    res.type('html; charset=utf-8').send(page);
  } catch {
    res.status(500).type('text/plain; charset=utf-8').send('Site ana sayfası hazırlanamadı.');
  }
});

app.get('/catalog.json', (_req, res) => {
  res.json(runtimeProjectCatalog);
});

app.get('/api/articles', (_req, res) => {
  const posts = Array.isArray(runtimeProjectCatalog.posts) ? runtimeProjectCatalog.posts : [];
  const synchronizedArticles = posts;
  res.json({ articles: synchronizedArticles, synchronizedArticles, total: synchronizedArticles.length, syncStatus: currentBlogSyncStatus() });
});

async function syncBloggerCatalogue(forceFull = true) {
  const feedPosts = await fetchAllBloggerPosts({ forceFull });
  const currentCatalog = runtimeProjectCatalog || readCatalog();
  const existingPosts = Array.isArray(currentCatalog.posts) ? currentCatalog.posts : [];
  const byId = new Map(existingPosts.map((post: any) => [String(post.id), post]));
  const reservedSlugs = new Set(existingPosts.map((post: any) => String(post.slug)));
  const feedArticles: any[] = [];

  for (const post of feedPosts) {
    const existing = byId.get(String(post.id));
    const article = createArticleFromBloggerPost(post, { existing, reservedSlugs });
    reservedSlugs.add(article.slug);
    byId.set(String(article.id), article);
    feedArticles.push(article);
  }
  if (feedArticles.length > 0) writeBloggerCanonicalScript(feedArticles);
  blogSyncState = { status: feedArticles.length ? 'synced' : 'empty_feed', lastSyncedAt: new Date().toISOString(), syncedCount: feedArticles.length, error: null };

  const merged = Array.from(byId.values());
  const changed = JSON.stringify(existingPosts) !== JSON.stringify(merged);
  const updatedCatalog = {
    ...currentCatalog,
    total: merged.length,
    posts: merged,
    updatedAt: changed ? new Date().toISOString() : (currentCatalog.updatedAt || null)
  };
  runtimeProjectCatalog = updatedCatalog;
  setRuntimeCatalog(updatedCatalog);
  // runtime catalogue remains updated even when the hosting filesystem is read-only.

  // Persist only when explicitly enabled; many hosted deployments use read-only filesystems.
  if (changed && process.env.WRITE_CATALOG_TO_DISK === 'true') {
    try {
      fs.writeFileSync(path.join(__dirname, 'catalog.json'), `${JSON.stringify(updatedCatalog, null, 2)}\n`, 'utf8');
    } catch (error: any) {
      console.warn('[Blogger sync] Catalogue updated in memory; disk write unavailable:', error?.message || error);
    }
  }
  return { feedPosts, updatedCatalog, changed };
}

app.post('/api/sync-blog', async (_req, res) => {
  try {
    const result = await syncBloggerCatalogue(true);
    res.json({
      success: true,
      syncedCount: result.feedPosts.length,
      totalCatalog: result.updatedCatalog.posts.length,
      changed: result.changed
    });
  } catch (err: any) {
    blogSyncState = { ...blogSyncState, status: 'error', error: String(err?.message || 'Sync error') };
    res.status(500).json({ success: false, error: err?.message || 'Sync error' });
  }
});

// Refresh the Blogger archive on startup and every 15 minutes. A failed fetch
// never replaces the complete local catalogue with an empty response.
if (process.env.NODE_ENV !== 'test') {
  syncBloggerCatalogue(true).catch((err: any) => { blogSyncState = { ...blogSyncState, status: 'error', error: String(err?.message || err) }; console.warn('[Blogger sync] Startup sync failed:', err?.message || err); });
  const bloggerSyncTimer = setInterval(() => {
    syncBloggerCatalogue(false).catch((err: any) => { blogSyncState = { ...blogSyncState, status: 'error', error: String(err?.message || err) }; console.warn('[Blogger sync] Scheduled sync failed:', err?.message || err); });
  }, BLOG_SYNC_INTERVAL_MS);
  bloggerSyncTimer.unref?.();
}

// Statik Dosyalar
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'dist')));

app.get('/analytics.html', (_req, res) => {
  const pubFile = path.join(__dirname, 'public', 'analytics.html');
  const rootFile = path.join(__dirname, 'analytics.html');
  if (fs.existsSync(pubFile)) return res.sendFile(pubFile);
  if (fs.existsSync(rootFile)) return res.sendFile(rootFile);
  res.status(404).send('Analytics panel not found');
});

app.use('/api/*', (_req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

app.get('*', (_req, res) => {
  const distIndex = path.join(__dirname, 'dist', 'index.html');
  const rootIndex = path.join(__dirname, 'index.html');
  if (fs.existsSync(distIndex)) return res.sendFile(distIndex);
  if (fs.existsSync(rootIndex)) return res.sendFile(rootIndex);
  res.status(404).send('Not found');
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Sci-Phi Server running on http://0.0.0.0:${PORT}`);
  });
}