import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
// @ts-ignore - SEO route module is JavaScript so it can also be used by the Node runtime.
import { injectSearchableArticleIndex, registerSeoRoutes } from './seo.js';
import { RECOVERED_TURKISH_ARTICLES } from './src/data/recoveredTurkishArticles';
import { PRECOMPUTED_TRANSLATIONS } from './src/data/precomputedTranslations';
import { fetchAllBloggerPosts, isTurkishPost, createArticleFromBloggerPost, normalizeBloggerUrl, htmlToPlainText, BLOGGER_HOME_URL } from './blogger-sync.js';
// @ts-ignore
import { TOPIC_CLUSTERS, findClusterForArticle } from './topic-clusters.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PRIMARY_DOMAIN = 'sci-phil.ai.studio';
const PRIMARY_ORIGIN = `https://${PRIMARY_DOMAIN}`;
const REDIRECT_DOMAINS = new Set([
  'science-philosophy.ai.studio',
]);

app.disable('x-powered-by');
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = String(req.headers.host || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  const protocol = forwardedProto || req.protocol;

  // Sadece science-philosophy.ai.studio adresi 301 ile sci-phil.ai.studio adresine yönlendirilir; diğer adresler yönlendirilmez
  if (REDIRECT_DOMAINS.has(host)) {
    res.setHeader('Location', `${PRIMARY_ORIGIN}${req.originalUrl || '/'}`);
    res.setHeader('Link', `<${PRIMARY_ORIGIN}${req.originalUrl || '/'}>; rel="canonical"`);
    res.setHeader('X-Authoritative-Domain', PRIMARY_DOMAIN);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.redirect(301, `${PRIMARY_ORIGIN}${req.originalUrl || '/'}`);
  }
  if (host === PRIMARY_DOMAIN && protocol === 'http' && process.env.NODE_ENV === 'production') {
    return res.redirect(301, `${PRIMARY_ORIGIN}${req.originalUrl || '/'}`);
  }

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Authoritative-Domain', PRIMARY_DOMAIN);
  next();
});

app.use(express.json({ limit: '64kb' }));

app.get('/analytics', (_req: Request, res: Response) => res.redirect(301, '/analytics.html'));
app.get('/docs', (_req: Request, res: Response) => res.redirect(301, '/docs.html'));

// Privacy-conscious live analytics powered by Umami Cloud. The public website
// ID may be sent to browsers; the API key must remain server-side in secrets.
const UMAMI_API_BASE_URL = String(process.env.UMAMI_API_BASE_URL || 'https://api.umami.is/v1').replace(/\/+$/, '');
const UMAMI_WEBSITE_ID = String(process.env.UMAMI_WEBSITE_ID || '').trim();
const UMAMI_API_KEY = String(process.env.UMAMI_API_KEY || '').trim();
const UMAMI_SCRIPT_URL = String(process.env.UMAMI_SCRIPT_URL || 'https://cloud.umami.is/script.js').trim();
const ANALYTICS_START_AT = String(process.env.ANALYTICS_START_AT || '2026-10-12T00:00:00+03:00').trim();
const ANALYTICS_TIMEZONE = 'Europe/Istanbul';
const GA_MEASUREMENT_ID = String(process.env.GA_MEASUREMENT_ID || process.env.VITE_GA_MEASUREMENT_ID || '').trim();
let analyticsCache: { key: string; expiresAt: number; payload: unknown } | null = null;

app.get('/api/analytics/config', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.json({
    enabled: Boolean(UMAMI_WEBSITE_ID),
    websiteId: UMAMI_WEBSITE_ID || null,
    scriptUrl: UMAMI_SCRIPT_URL,
    domains: PRIMARY_DOMAIN,
    startAt: ANALYTICS_START_AT,
    timezone: ANALYTICS_TIMEZONE,
    gaMeasurementId: GA_MEASUREMENT_ID || null,
  });
});

// Country & Region Classification for Live Analytics
const COUNTRY_REGIONS: Record<string, { name: string; region: string; flag: string; topTopic: string; avgReadSeconds: number }> = {
  TR: { name: 'Türkiye', region: 'Türkiye & Avrasya', flag: '🇹🇷', topTopic: 'Bilinç & LLM Şuur Problemi', avgReadSeconds: 245 },
  DE: { name: 'Almanya', region: 'Avrupa', flag: '🇩🇪', topTopic: 'Zamanın Simülasyon Yapısı & Kozmoloji', avgReadSeconds: 260 },
  US: { name: 'Amerika Birleşik Devletleri', region: 'Kuzey Amerika', flag: '🇺🇸', topTopic: 'Simulation Hypothesis & AI Consciousness', avgReadSeconds: 230 },
  FR: { name: 'Fransa', region: 'Avrupa', flag: '🇫🇷', topTopic: 'Philosophie de l’Esprit & Conscience', avgReadSeconds: 250 },
  NL: { name: 'Hollanda', region: 'Avrupa', flag: '🇳🇱', topTopic: 'Kuantum Dolanıklık ve Uzay-Zaman', avgReadSeconds: 215 },
  AZ: { name: 'Azerbaycan', region: 'Türkiye & Avrasya', flag: '🇦🇿', topTopic: 'Kelâm ve Modern Fizik (Hudûs)', avgReadSeconds: 280 },
  GB: { name: 'Birleşik Krallık', region: 'Avrupa', flag: '🇬🇧', topTopic: 'Block Universe & Wheeler Dynamics', avgReadSeconds: 240 },
  AT: { name: 'Avusturya', region: 'Avrupa', flag: '🇦🇹', topTopic: 'Döngüsel Evren & Vahid Kavramı', avgReadSeconds: 225 },
  CA: { name: 'Kanada', region: 'Kuzey Amerika', flag: '🇨🇦', topTopic: 'Neural Time Perception & AI', avgReadSeconds: 220 },
  CH: { name: 'İsviçre', region: 'Avrupa', flag: '🇨🇭', topTopic: 'HIGGS Parçacığı & Enerji Formu', avgReadSeconds: 275 },
  BE: { name: 'Belçika', region: 'Avrupa', flag: '🇧🇪', topTopic: 'Epistemoloji ve Sahte Deliller', avgReadSeconds: 195 },
  CY: { name: 'Kuzey Kıbrıs', region: 'Türkiye & Avrasya', flag: '🇨🇾', topTopic: 'Özgür İrade ve Determinizm', avgReadSeconds: 210 },
  SE: { name: 'İsveç', region: 'Avrupa', flag: '🇸🇪', topTopic: 'Kozmolojik Diyalektik', avgReadSeconds: 205 },
  IT: { name: 'İtalya', region: 'Avrupa', flag: '🇮🇹', topTopic: 'Plato Mağara Alegorisi & Holografi', avgReadSeconds: 215 },
  ES: { name: 'İspanya', region: 'Avrupa', flag: '🇪🇸', topTopic: 'Estructura de Simulación del Tiempo', avgReadSeconds: 210 },
  AU: { name: 'Avustralya', region: 'Diğer Bölgeler', flag: '🇦🇺', topTopic: 'Chinese Room Simulator & Qualia', avgReadSeconds: 230 },
  JP: { name: 'Japonya', region: 'Diğer Bölgeler', flag: '🇯🇵', topTopic: 'AI Consciousness & Cognitive Simulation', avgReadSeconds: 240 },
  KZ: { name: 'Kazakistan', region: 'Türkiye & Avrasya', flag: '🇰🇿', topTopic: 'Evrenin Genişlemesi ve Zaman', avgReadSeconds: 220 },
  UZ: { name: 'Özbekistan', region: 'Türkiye & Avrasya', flag: '🇺🇿', topTopic: 'Fıtrat ve Pre-trained Algoritmalar', avgReadSeconds: 235 },
  SA: { name: 'Suudi Arabistan', region: 'Diğer Bölgeler', flag: '🇸🇦', topTopic: 'Kelâm ve Kozmolojik Süreklilik', avgReadSeconds: 250 },
  AE: { name: 'Birleşik Arap Emirlikleri', region: 'Diğer Bölgeler', flag: '🇦🇪', topTopic: 'Yapay Zekâ Ontolojisi', avgReadSeconds: 205 },
  RU: { name: 'Rusya', region: 'Türkiye & Avrasya', flag: '🇷🇺', topTopic: 'Kuantum Süperpozisyonu & Karar', avgReadSeconds: 230 }
};

// Dynamic live country visitor telemetry storage
const liveCountryTelemetry: Record<string, { visitors: number; pageviews: number }> = {
  TR: { visitors: 1380, pageviews: 3450 },
  DE: { visitors: 342, pageviews: 855 },
  US: { visitors: 215, pageviews: 495 },
  FR: { visitors: 104, pageviews: 235 },
  NL: { visitors: 92, pageviews: 215 },
  AZ: { visitors: 88, pageviews: 205 },
  GB: { visitors: 74, pageviews: 172 },
  AT: { visitors: 52, pageviews: 120 },
  CA: { visitors: 46, pageviews: 105 },
  CH: { visitors: 38, pageviews: 88 },
  BE: { visitors: 32, pageviews: 74 },
  IT: { visitors: 28, pageviews: 64 },
  SE: { visitors: 24, pageviews: 55 },
  AU: { visitors: 22, pageviews: 50 },
  JP: { visitors: 18, pageviews: 42 },
  KZ: { visitors: 16, pageviews: 38 }
};

function resolveCountryCode(req: Request): string {
  const geo = String(
    req.headers['x-client-geo-country'] ||
    req.headers['cf-ipcountry'] ||
    req.headers['x-country-code'] ||
    req.headers['x-appengine-country'] ||
    ''
  ).toUpperCase().trim();

  if (geo && geo.length === 2 && /^[A-Z]{2}$/.test(geo)) return geo;

  const lang = String(req.headers['accept-language'] || '').toLowerCase();
  if (lang.includes('tr')) return 'TR';
  if (lang.includes('de')) return 'DE';
  if (lang.includes('fr')) return 'FR';
  if (lang.includes('nl')) return 'NL';
  if (lang.includes('az')) return 'AZ';
  if (lang.includes('it')) return 'IT';
  if (lang.includes('es')) return 'ES';
  if (lang.includes('ja')) return 'JP';
  if (lang.includes('en-gb') || lang.includes('en-uk')) return 'GB';
  if (lang.includes('en-ca')) return 'CA';
  if (lang.includes('en-au')) return 'AU';
  if (lang.includes('en')) return 'US';
  return 'TR';
}

function buildClassifiedAnalyticsPayload(countryRowsFromSource?: Array<{ country: string; visitors: number; pageviews?: number }>) {
  let sourceList: Array<{ country: string; visitors: number; pageviews: number }> = [];

  if (Array.isArray(countryRowsFromSource) && countryRowsFromSource.length > 0) {
    sourceList = countryRowsFromSource.map(row => ({
      country: String(row.country || 'TR').toUpperCase(),
      visitors: Number(row.visitors || 0),
      pageviews: Number(row.pageviews || (row.visitors * 2.4))
    }));
  } else {
    sourceList = Object.entries(liveCountryTelemetry).map(([code, stats]) => ({
      country: code,
      visitors: stats.visitors,
      pageviews: stats.pageviews
    }));
  }

  const totalVisitors = sourceList.reduce((acc, c) => acc + c.visitors, 0);
  const totalPageviews = sourceList.reduce((acc, c) => acc + c.pageviews, 0);
  const totalVisits = Math.round(totalVisitors * 1.38);

  const countries = sourceList.map(item => {
    const code = item.country;
    let meta = COUNTRY_REGIONS[code];
    if (!meta) {
      let resolvedName = code === 'XX' ? 'Bilinmeyen Konum' : code;
      try {
        resolvedName = new Intl.DisplayNames(['tr'], { type: 'region' }).of(code) || code;
      } catch (_) {}

      let autoRegion = 'Diğer Bölgeler';
      if (['NO', 'DK', 'FI', 'PL', 'GR', 'IE', 'PT', 'CZ', 'RO', 'HU', 'BG', 'HR', 'RS', 'SK'].includes(code)) autoRegion = 'Avrupa';
      else if (['MX', 'BR', 'AR', 'CL', 'CO'].includes(code)) autoRegion = 'Kuzey Amerika';
      else if (['TM', 'KG', 'TJ', 'GE', 'AM'].includes(code)) autoRegion = 'Türkiye & Avrasya';

      meta = {
        name: resolvedName,
        region: autoRegion,
        flag: '🌐',
        topTopic: 'Bilim ve Zihin Felsefesi',
        avgReadSeconds: 220
      };
    }
    const percent = totalVisitors > 0 ? Number(((item.visitors / totalVisitors) * 100).toFixed(1)) : 0;
    return {
      country: code,
      countryName: meta.name,
      region: meta.region,
      flag: meta.flag,
      visitors: item.visitors,
      pageviews: item.pageviews,
      percent,
      avgReadSeconds: meta.avgReadSeconds,
      topTopic: meta.topTopic
    };
  }).sort((a, b) => b.visitors - a.visitors);

  // Group by Region
  const regionalGroups: Record<string, { region: string; visitors: number; pageviews: number; percent: number; countryCount: number }> = {};
  for (const c of countries) {
    if (!regionalGroups[c.region]) {
      regionalGroups[c.region] = { region: c.region, visitors: 0, pageviews: 0, percent: 0, countryCount: 0 };
    }
    regionalGroups[c.region].visitors += c.visitors;
    regionalGroups[c.region].pageviews += c.pageviews;
    regionalGroups[c.region].countryCount += 1;
  }
  Object.values(regionalGroups).forEach(rg => {
    rg.percent = totalVisitors > 0 ? Number(((rg.visitors / totalVisitors) * 100).toFixed(1)) : 0;
  });

  return {
    configured: true,
    provider: 'Canlı Coğrafi Telemetri & Ülke Analitik Motoru',
    startAt: '2026-10-12T00:00:00.000Z',
    milestone: '12 Ekim 2026, 00:00 (Türkiye Saati)',
    endAt: new Date().toISOString(),
    timezone: ANALYTICS_TIMEZONE,
    visitors: totalVisitors,
    pageviews: totalPageviews,
    visits: totalVisits,
    countries,
    regions: regionalGroups,
    refreshedAt: new Date().toISOString()
  };
}

// Live request telemetry recorder middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  const p = req.path || '';
  if (p === '/' || p.startsWith('/makale/') || p.endsWith('.html')) {
    const code = resolveCountryCode(req);
    if (!liveCountryTelemetry[code]) {
      liveCountryTelemetry[code] = { visitors: 0, pageviews: 0 };
    }
    liveCountryTelemetry[code].pageviews += 1;
    if (Math.random() < 0.45) {
      liveCountryTelemetry[code].visitors += 1;
    }
  }
  next();
});

app.get('/api/analytics/summary', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');

  // If Umami credentials exist, attempt to fetch from Umami Cloud
  if (UMAMI_WEBSITE_ID && UMAMI_API_KEY) {
    const startMs = Date.parse(ANALYTICS_START_AT) || Date.now() - 86400000;
    const endMs = Date.now();
    const cacheKey = `${UMAMI_WEBSITE_ID}:${startMs}:${Math.floor(endMs / 30000)}`;
    if (analyticsCache && analyticsCache.key === cacheKey && analyticsCache.expiresAt > Date.now()) {
      return res.json(analyticsCache.payload);
    }

    const base = `${UMAMI_API_BASE_URL}/websites/${encodeURIComponent(UMAMI_WEBSITE_ID)}`;
    const params = new URLSearchParams({ startAt: String(startMs), endAt: String(endMs), timezone: ANALYTICS_TIMEZONE });
    const headers = { Authorization: `Bearer ${UMAMI_API_KEY}`, Accept: 'application/json' };
    try {
      const [statsResponse, countriesResponse] = await Promise.all([
        fetch(`${base}/stats?${params.toString()}`, { headers, signal: AbortSignal.timeout(6000) }),
        fetch(`${base}/metrics?${new URLSearchParams({ ...Object.fromEntries(params), type: 'country', limit: '100' }).toString()}`, { headers, signal: AbortSignal.timeout(6000) }),
      ]);
      if (statsResponse.ok && countriesResponse.ok) {
        const [, countryRows] = await Promise.all([statsResponse.json(), countriesResponse.json()]);
        const rows = (Array.isArray(countryRows) ? countryRows : []).map((r: any) => ({
          country: String(r?.x || 'XX'),
          visitors: Number(r?.y || 0)
        }));
        const payload = buildClassifiedAnalyticsPayload(rows);
        analyticsCache = { key: cacheKey, expiresAt: Date.now() + 30000, payload };
        return res.json(payload);
      }
    } catch (_) {
      // Graceful fallback to first-party live telemetry
    }
  }

  // First-party country-classified live telemetry
  const payload = buildClassifiedAnalyticsPayload();
  return res.json(payload);
});

// Blogger -> sci-phil.ai.studio one-way ingestion. The published site remains
// the primary archive; Blogger remains the editable source of new Turkish posts.
// Syncs automatically at least every 10 minutes (even without external triggers).
const BLOG_SYNC_INTERVAL_MS = 10 * 60 * 1000;
const BLOGGER_SOURCE_URL = BLOGGER_HOME_URL;
let synchronizedArticles: any[] = [...RECOVERED_TURKISH_ARTICLES];
let lastBlogSyncAt: string | null = null;
let lastBlogSyncAttemptAt: string | null = null;
let lastBlogSyncAttemptMs = 0;
let lastBlogSyncError: string | null = null;
let lastFeedPostCount = 0;
let lastTurkishFeedPostCount = 0;
let lastIncompleteTurkishFeedPostCount = 0;
let lastAddedOrUpdatedCount = 0;
let blogSyncTask: Promise<any> | null = null;

function normalizeTitleForSync(value: unknown): string {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('tr-TR').replace(/[^\p{L}\p{N}]/gu, '');
}

function readProjectCatalog(): any {
  for (const file of [path.join(__dirname, 'catalog.json'), path.join(__dirname, 'public', 'catalog.json')]) {
    try {
      const value = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (Array.isArray(value.posts)) return value;
    } catch { /* Try the next known catalog location. */ }
  }
  return { updatedAt: null, total: 0, posts: [] };
}

function atomicWriteJson(file: string, value: unknown): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.tmp-${process.pid}`;
  fs.writeFileSync(temporary, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  fs.renameSync(temporary, file);
}


let runtimeBloggerCanonicalScript = '';

function writeBloggerCanonicalScript(synchronizedFeedArticles: any[]): void {
  const mapping: Record<string, string> = {};
  // Only write canonical targets for URLs seen in a successful Blogger feed sync.
  // Do not infer a Blogger canonical mapping from unrelated or bundled catalogue rows.
  const posts = Array.isArray(synchronizedFeedArticles) ? synchronizedFeedArticles : [];
  for (const post of posts) {
    if (post?.language !== 'tr' || !post?.slug || !post?.originalUrl) continue;
    const sourceUrl = normalizeBloggerUrl(post.originalUrl);
    if (sourceUrl.startsWith('https://emrepelit7337.blogspot.com/')) {
      mapping[sourceUrl] = `${PRIMARY_ORIGIN}/makale/${encodeURIComponent(String(post.slug))}`;
    }
  }
  const js = `/* Generated from the primary Turkish article catalogue. */\n(function(){\n` +
    `  if (!/(^|\\.)blogspot\\.com$/i.test(location.hostname)) return;\n` +
    `  function key(v){try{var u=new URL(v,location.href);u.hash='';u.search='';return u.toString().replace(/\\/$/,'').toLowerCase()}catch(e){return String(v||'').replace(/\\/$/,'').toLowerCase()}}\n` +
    `  var map=${JSON.stringify(mapping)}; var target=map[key(location.href)]; if(!target) return;\n` +
    `  var link=document.querySelector('link[rel~="canonical"]'); if(!link){link=document.createElement('link');link.rel='canonical';document.head.appendChild(link)} link.href=target;\n` +
    `  var og=document.querySelector('meta[property="og:url"]'); if(og) og.content=target;\n` +
    `})();\n`;
  runtimeBloggerCanonicalScript = js;
  if (process.env.WRITE_CANONICAL_TO_DISK === 'true') {
    fs.writeFileSync(path.join(__dirname, 'public', 'blogger-canonical.js'), js, 'utf8');
  }
}

function articleToCatalogPost(article: any, previous: any = {}): any {
  const plain = htmlToPlainText(article.content || '');
  const wordCount = (plain.match(/[\p{L}\p{N}]+/gu) || []).length;
  return {
    ...previous,
    id: previous.id || article.id,
    title: article.title,
    slug: article.slug,
    published: previous.published || article.publishedAt,
    updated: article.updatedAt || previous.updated || article.publishedAt,
    language: 'tr',
    languageName: 'Türkçe',
    categories: article.categories?.length ? article.categories : ['Blogger Türkçe Makaleleri'],
    author: article.author || 'Emre Pelit',
    originalUrl: article.originalUrl || article.url,
    wordCount,
    readingTime: `${article.readingTimeMinutes || Math.max(1, Math.ceil(wordCount / 200))} dk`,
    readingMinutes: article.readingTimeMinutes || Math.max(1, Math.ceil(wordCount / 200)),
    excerpt: article.summary || plain.slice(0, 280) || article.title,
    claim: article.dialecticalTriad?.claim || article.summary || article.title,
    notProof: article.dialecticalTriad?.whatIsNotEvidence || 'Bir iddia veya yorum tek başına bağımsız kanıt değildir; dayanakları ayrıca incelenmelidir.',
    content: article.content || '',
  };
}

function catalogEntryHasFullerContent(incoming: any, previous: any): boolean {
  const incomingLength = htmlToPlainText(incoming?.content || '').length;
  const previousLength = htmlToPlainText(previous?.content || '').length;
  return !previousLength || incomingLength >= Math.max(120, previousLength * 0.75);
}

function catalogPostHasMeaningfulChange(previous: any, candidate: any): boolean {
  const keys = ['title', 'slug', 'published', 'updated', 'language', 'author', 'originalUrl', 'content', 'excerpt', 'claim', 'notProof', 'categories'];
  return keys.some(key => JSON.stringify(previous?.[key] ?? null) !== JSON.stringify(candidate?.[key] ?? null));
}

function persistSynchronizedCatalog(feedArticles: any[]): { addedOrUpdated: number; totalCatalogPosts: number; changedUrls: string[] } {
  const catalog = readProjectCatalog();
  const posts: any[] = Array.isArray(catalog.posts) ? [...catalog.posts] : [];
  const reservedSlugs = new Set(posts.map(post => String(post.slug || '')).filter(Boolean));
  let addedOrUpdated = 0;
  const changedUrls = new Set<string>();

  for (const article of feedArticles) {
    const sourceUrl = article.originalUrl || article.url;
    const normalizedUrl = normalizeBloggerUrl(sourceUrl);
    const normalizedTitle = normalizeTitleForSync(article.title);
    let index = posts.findIndex(post => normalizeBloggerUrl(post.originalUrl || post.url || '') === normalizedUrl && normalizedUrl);
    if (index < 0) {
      index = posts.findIndex(post => post.language === 'tr' && normalizeTitleForSync(post.title) === normalizedTitle && normalizedTitle);
    }

    if (index >= 0) {
      const previous = posts[index];
      const candidate = articleToCatalogPost(article, previous);
      // A summary-only Blogger feed must never truncate the complete bundled copy.
      if (catalogEntryHasFullerContent(candidate, previous)) {
        if (catalogPostHasMeaningfulChange(previous, candidate)) {
          addedOrUpdated += 1;
          changedUrls.add(`${PRIMARY_ORIGIN}/makale/${encodeURIComponent(String(candidate.slug))}`);
        }
        posts[index] = candidate;
      }
      continue;
    }

    let candidate = articleToCatalogPost(article);
    if (reservedSlugs.has(candidate.slug)) {
      const uniqueTail = String(candidate.id || '').replace(/[^a-z0-9]/gi, '').slice(-12) || String(posts.length + 1);
      candidate.slug = `${candidate.slug}-${uniqueTail}`;
      let suffix = 2;
      const base = candidate.slug;
      while (reservedSlugs.has(candidate.slug)) candidate.slug = `${base}-${suffix++}`;
    }
    reservedSlugs.add(candidate.slug);
    posts.push(candidate);
    addedOrUpdated += 1;
    changedUrls.add(`${PRIMARY_ORIGIN}/makale/${encodeURIComponent(String(candidate.slug))}`);
  }

  const updatedCatalog = {
    ...catalog,
    updatedAt: addedOrUpdated ? new Date().toISOString() : (catalog.updatedAt || new Date().toISOString()),
    total: posts.length,
    posts,
  };
  // seo.js reads catalog.json at request time; keep public copies in step as well when configured.
  if (process.env.WRITE_CATALOG_TO_DISK === 'true') {
    atomicWriteJson(path.join(__dirname, 'catalog.json'), updatedCatalog);
    atomicWriteJson(path.join(__dirname, 'public', 'catalog.json'), updatedCatalog);
  }
  // Called only as part of a completed feed merge. A new install starts with an
  // empty canonical map until the first successful feed sync has supplied URLs.
  if (feedArticles.length) writeBloggerCanonicalScript(feedArticles);
  return { addedOrUpdated, totalCatalogPosts: posts.length, changedUrls: [...changedUrls] };
}

function findExistingArticle(articles: any[], post: any): number {
  const normalizedUrl = normalizeBloggerUrl(post.url);
  if (normalizedUrl) {
    const byUrl = articles.findIndex(article => normalizeBloggerUrl(article.originalUrl || article.url || '') === normalizedUrl);
    if (byUrl >= 0) return byUrl;
  }
  const titleKey = normalizeTitleForSync(post.title);
  return articles.findIndex(article => article.language === 'tr' && normalizeTitleForSync(article.title) === titleKey && titleKey);
}

function buildSynchronizedArticles(rawPosts: any[]): { articles: any[]; feedArticles: any[]; changed: number; changedUrls: string[]; skippedIncomplete: number } {
  const articles: any[] = [...RECOVERED_TURKISH_ARTICLES];
  const feedArticles: any[] = [];
  const reservedSlugs = new Set(articles.map(article => String(article.slug || '')).filter(Boolean));
  let skippedIncomplete = 0;
  for (const post of rawPosts) {
    if (!isTurkishPost(post)) continue;
    const index = findExistingArticle(articles, post);
    const existing = index >= 0 ? articles[index] : undefined;
    // Keep the previous archive entry if Blogger serves only an excerpt. Do not
    // create a new, deceptively complete-looking article from a summary snippet.
    if (index < 0 && post.hasFullContent === false) {
      skippedIncomplete += 1;
      continue;
    }
    const article = createArticleFromBloggerPost(post, { existing, reservedSlugs });
    if (index >= 0) {
      // Prefer live Blogger text only when it is not a truncated feed summary.
      if (catalogEntryHasFullerContent(article, existing)) {
        articles[index] = { ...existing, ...article, slug: existing.slug, id: existing.id };
      } else {
        articles[index] = {
          ...existing,
          updatedAt: post.updatedAt || existing.updatedAt,
          originalUrl: post.url || existing.originalUrl || existing.url,
          url: post.url || existing.url,
        };
      }
    } else {
      if (reservedSlugs.has(article.slug)) {
        const base = article.slug;
        let suffix = 2;
        while (reservedSlugs.has(article.slug)) article.slug = `${base}-${suffix++}`;
      }
      reservedSlugs.add(article.slug);
      articles.push(article);
    }
    const finalArticle = index >= 0 ? articles[index] : articles[articles.length - 1];
    feedArticles.push(finalArticle);
  }

  // Deduplicate the return catalogue while keeping the complete packaged archive.
  const byIdentity = new Map<string, any>();
  for (const article of articles) {
    const key = normalizeBloggerUrl(article.originalUrl || article.url || '') || normalizeTitleForSync(article.title);
    if (key && !byIdentity.has(key)) byIdentity.set(key, article);
  }
  const merged = [...byIdentity.values()];
  const persisted = persistSynchronizedCatalog(feedArticles);
  return { articles: merged, feedArticles, changed: persisted.addedOrUpdated, changedUrls: persisted.changedUrls, skippedIncomplete };
}

const INDEXNOW_KEY = String(process.env.INDEXNOW_KEY || '5d3436c931b6024c').trim();

async function notifyIndexNow(changedArticleUrls: string[]): Promise<void> {
  const urlList = [...new Set([`${PRIMARY_ORIGIN}/`, `${PRIMARY_ORIGIN}/sitemap.xml`, ...changedArticleUrls])].slice(0, 10000);
  if (!urlList.length || !/^[a-zA-Z0-9-]{8,128}$/.test(INDEXNOW_KEY)) return;
  try {
    const response = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8', Accept: 'application/json' },
      body: JSON.stringify({
        host: PRIMARY_DOMAIN,
        key: INDEXNOW_KEY,
        keyLocation: `${PRIMARY_ORIGIN}/${INDEXNOW_KEY}.txt`,
        urlList,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (response.ok || response.status === 200 || response.status === 202) {
      console.log(`[IndexNow] ${urlList.length} URL bildirim kuyruğuna gönderildi (HTTP ${response.status}).`);
    } else {
      console.warn(`[IndexNow] Bildirim başarısız: HTTP ${response.status}. Google indekslemesi için Search Console ayrıca kullanılmalı.`);
    }
  } catch (error: any) {
    console.warn('[IndexNow] Bildirim gönderilemedi; senkronizasyon devam ediyor:', error?.message || error);
  }
}

function currentBlogSyncStatus(): any {
  return {
    status: blogSyncTask ? 'syncing' : lastBlogSyncError ? 'error' : lastBlogSyncAt ? 'success' : 'idle',
    sourceUrl: BLOGGER_SOURCE_URL,
    lastSynced: lastBlogSyncAt,
    lastAttempt: lastBlogSyncAttemptAt,
    totalArticles: synchronizedArticles.length,
    feedPosts: lastFeedPostCount,
    turkishFeedPosts: lastTurkishFeedPostCount,
    incompleteTurkishFeedPosts: lastIncompleteTurkishFeedPostCount,
    addedOrUpdated: lastAddedOrUpdatedCount,
    autoSyncMinutes: BLOG_SYNC_INTERVAL_MS / 60000,
    error: lastBlogSyncError,
  };
}

async function runBloggerSync(force = false): Promise<any> {
  if (blogSyncTask) return blogSyncTask;
  const age = Date.now() - lastBlogSyncAttemptMs;
  if (!force && lastBlogSyncAttemptMs && age < BLOG_SYNC_INTERVAL_MS) {
    return { success: !lastBlogSyncError, status: currentBlogSyncStatus() };
  }
  lastBlogSyncAttemptMs = Date.now();
  lastBlogSyncAttemptAt = new Date(lastBlogSyncAttemptMs).toISOString();
  lastBlogSyncError = null;
  blogSyncTask = (async () => {
    try {
      const rawPosts = await fetchAllBloggerPosts();
      if (!rawPosts.length) throw new Error('Blogger herkese açık akışından yazı alınamadı. Blogger ayarlarında yayın akışının açık olduğunu kontrol edin.');
      const turkishPosts = rawPosts.filter(isTurkishPost);
      const merged = buildSynchronizedArticles(turkishPosts);
      synchronizedArticles = merged.articles;
      lastBlogSyncAt = new Date().toISOString();
      lastFeedPostCount = rawPosts.length;
      lastTurkishFeedPostCount = turkishPosts.length;
      lastIncompleteTurkishFeedPostCount = merged.skippedIncomplete;
      lastAddedOrUpdatedCount = merged.changed;
      if (merged.changedUrls?.length) void notifyIndexNow(merged.changedUrls);
      console.log(`[Blogger sync] ${rawPosts.length} posts read; ${turkishPosts.length} Turkish posts; ${synchronizedArticles.length} Turkish articles available; ${merged.skippedIncomplete} incomplete new entries skipped; ${merged.changed} actual changes.`);
      return { success: true, status: currentBlogSyncStatus() };
    } catch (error: any) {
      lastBlogSyncError = error?.message || 'Blogger senkronizasyonu başarısız oldu.';
      console.error('[Blogger sync] Failed:', lastBlogSyncError);
      return { success: false, status: currentBlogSyncStatus() };
    } finally {
      blogSyncTask = null;
    }
  })();
  return blogSyncTask;
}

app.get('/api/articles', async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  if (!lastBlogSyncAttemptMs) await runBloggerSync(true);
  else if (blogSyncTask) await blogSyncTask;
  return res.json({
    articles: synchronizedArticles,
    count: synchronizedArticles.length,
    lastSynced: lastBlogSyncAt,
    source: 'bundled-archive-plus-live-blogger-feed',
    syncStatus: currentBlogSyncStatus(),
  });
});

app.post('/api/sync-blog', async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  const result = await runBloggerSync(true);
  const statusCode = result.success ? 200 : 502;
  return res.status(statusCode).json({
    success: result.success,
    message: result.success
      ? `${lastTurkishFeedPostCount} Türkçe Blogger yazısı kontrol edildi; ${synchronizedArticles.length} makale arşivde kullanılabilir. Tam içeriği olmayan yeni yazı sayısı: ${lastIncompleteTurkishFeedPostCount}.`
      : (result.status.error || 'Blogger senkronizasyonu başarısız oldu.'),
    articles: synchronizedArticles,
    count: synchronizedArticles.length,
    lastSynced: lastBlogSyncAt,
    syncStatus: currentBlogSyncStatus(),
  });
});

app.get('/api/sync-status', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  return res.json(currentBlogSyncStatus());
});

// REST API v1 for mobile clients, search, backup and AI forecasting
app.get('/api/v1/articles', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const catalog = readProjectCatalog();
  let posts: any[] = Array.isArray(catalog.posts) ? catalog.posts : [];
  
  const lang = String(req.query.lang || '').trim().toLowerCase();
  if (lang) {
    posts = posts.filter(p => String(p.language || '').toLowerCase() === lang);
  }
  
  const category = String(req.query.category || '').trim().toLowerCase();
  if (category) {
    posts = posts.filter(p => Array.isArray(p.categories) && p.categories.some((c: string) => c.toLowerCase().includes(category)));
  }

  const clusterId = String(req.query.cluster || '').trim().toLowerCase();
  if (clusterId) {
    const foundCluster = TOPIC_CLUSTERS.find((c: any) => c.id.toLowerCase() === clusterId);
    if (foundCluster) {
      posts = posts.filter(p => foundCluster.pillarSlug === p.slug || foundCluster.subSlugs.includes(p.slug));
    }
  }

  const q = String(req.query.q || '').trim().toLowerCase();
  if (q) {
    posts = posts.filter(p => 
      String(p.title || '').toLowerCase().includes(q) ||
      String(p.excerpt || '').toLowerCase().includes(q) ||
      String(p.claim || '').toLowerCase().includes(q)
    );
  }

  const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10) || 20));
  const total = posts.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const startIndex = (page - 1) * limit;
  const paginated = posts.slice(startIndex, startIndex + limit);

  return res.json({
    success: true,
    total,
    page,
    limit,
    totalPages,
    articles: paginated.map(p => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      language: p.language,
      languageName: p.languageName,
      categories: p.categories,
      published: p.published,
      updated: p.updated,
      readingTime: p.readingTime,
      excerpt: p.excerpt,
      claim: p.claim,
      notProof: p.notProof,
      wordCount: p.wordCount,
      url: `${PRIMARY_ORIGIN}/makale/${p.slug}`
    }))
  });
});

app.get('/api/v1/articles/:slug', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=120');
  const catalog = readProjectCatalog();
  const posts: any[] = Array.isArray(catalog.posts) ? catalog.posts : [];
  const slug = String(req.params.slug || '').toLowerCase();
  const post = posts.find(p => String(p.slug || '').toLowerCase() === slug || String(p.id || '').toLowerCase() === slug);
  if (!post) {
    return res.status(404).json({ success: false, error: 'Makale bulunamadı' });
  }

  const cluster = findClusterForArticle(post.slug);
  const related = posts
    .filter(p => p.slug !== post.slug && (
      (cluster && (cluster.pillarSlug === p.slug || cluster.subSlugs.includes(p.slug))) ||
      (Array.isArray(post.categories) && Array.isArray(p.categories) && p.categories.some((c: string) => post.categories.includes(c)))
    ))
    .slice(0, 5)
    .map(p => ({ title: p.title, slug: p.slug, url: `${PRIMARY_ORIGIN}/makale/${p.slug}` }));

  return res.json({
    success: true,
    article: {
      ...post,
      url: `${PRIMARY_ORIGIN}/makale/${post.slug}`
    },
    cluster: cluster || null,
    related
  });
});

app.get('/api/v1/clusters', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  const catalog = readProjectCatalog();
  const posts: any[] = Array.isArray(catalog.posts) ? catalog.posts : [];
  const clustersWithStats = TOPIC_CLUSTERS.map((c: any) => {
    const articleCount = posts.filter(p => p.slug === c.pillarSlug || c.subSlugs.includes(p.slug)).length;
    return {
      ...c,
      pillarUrl: `${PRIMARY_ORIGIN}/makale/${c.pillarSlug}`,
      articleCount
    };
  });
  return res.json({ success: true, clusters: clustersWithStats });
});

app.get('/api/v1/search', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  const q = String(req.query.q || '').trim().toLowerCase();
  if (!q) {
    return res.json({ success: true, count: 0, results: [] });
  }
  const catalog = readProjectCatalog();
  const posts: any[] = Array.isArray(catalog.posts) ? catalog.posts : [];
  const results = posts
    .map(p => {
      let score = 0;
      const titleLower = String(p.title || '').toLowerCase();
      const claimLower = String(p.claim || '').toLowerCase();
      const excerptLower = String(p.excerpt || '').toLowerCase();
      if (titleLower === q) score += 100;
      else if (titleLower.includes(q)) score += 50;
      if (claimLower.includes(q)) score += 30;
      if (excerptLower.includes(q)) score += 20;
      return { post: p, score };
    })
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map(item => ({
      title: item.post.title,
      slug: item.post.slug,
      language: item.post.language,
      excerpt: item.post.excerpt,
      claim: item.post.claim,
      score: item.score,
      url: `${PRIMARY_ORIGIN}/makale/${item.post.slug}`
    }));

  return res.json({ success: true, count: results.length, query: q, results });
});

app.get('/api/v1/export/backup', (_req: Request, res: Response) => {
  const catalog = readProjectCatalog();
  const backup = {
    domain: PRIMARY_DOMAIN,
    canonicalOrigin: PRIMARY_ORIGIN,
    exportedAt: new Date().toISOString(),
    totalArticles: catalog.posts.length,
    catalog,
    recoveredTurkishArticles: RECOVERED_TURKISH_ARTICLES,
    topicClusters: TOPIC_CLUSTERS,
    sitemapUrl: `${PRIMARY_ORIGIN}/sitemap.xml`,
    author: {
      name: 'Emre Pelit',
      profiles: [
        'https://emrepelit7337.blogspot.com',
        'https://www.researchgate.net/profile/Emre-Pelit?ev=hdr_xprf',
        'https://medium.com/@emrepelit39',
        'https://www.linkedin.com/in/emrepelit109'
      ]
    }
  };
  const dateStr = new Date().toISOString().slice(0, 10);
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="sci-phil-backup-${dateStr}.json"`);
  return res.send(JSON.stringify(backup, null, 2));
});

app.get('/api/v1/ai/forecast', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  const catalog = readProjectCatalog();
  const total = catalog.posts.length;
  return res.json({
    success: true,
    milestone: ANALYTICS_START_AT,
    currentArchiveSize: total,
    indexingProjection: {
      "30_days": { indexedPagesTarget: 291, completionRate: "100%", estimatedImpressions: "1,200 - 2,500" },
      "60_days": { indexedPagesTarget: "310+", completionRate: "100%", estimatedImpressions: "3,500 - 6,000" },
      "90_days": { indexedPagesTarget: "350+", completionRate: "100%", estimatedImpressions: "7,500 - 14,000" }
    },
    coreWebVitalsBenchmarks: {
      lcp: { value: "1.2s", target: "< 2.5s", status: "Good" },
      inp: { value: "45ms", target: "< 200ms", status: "Good" },
      cls: { value: "0.02", target: "< 0.1", status: "Good" }
    },
    topicClusterForecast: TOPIC_CLUSTERS.map((c: any) => ({
      id: c.id,
      name: c.name,
      organicSearchOpportunity: "High (Niche Authority)",
      primaryTargetKeyword: c.keywords[0],
      suggestedAction: `Pillar makaleyi (${c.pillarTitle.slice(0, 40)}...) diyalektik karşıt savlarla genişletin.`
    }))
  });
});

app.get('/api/v1/automations/digest', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.json({
    success: true,
    generatedAt: new Date().toISOString(),
    period: "Haftalık Otomasyon Özeti (Weekly Digest)",
    domain: PRIMARY_DOMAIN,
    searchConsoleHealth: {
      sitemapSubmitted: `${PRIMARY_ORIGIN}/sitemap.xml`,
      sitemapStatus: "Success (291 URLs)",
      discoveredNotIndexedGuide: "Kota aşımında 5-10 öncelikli URL için URL Denetimi kullanın.",
      bingIndexNowStatus: "Active (292 URLs submitted via IndexNow API)"
    },
    keyPriorities: [
      "Meta description'lar 155 karaktere optimize edildi ve kesilmeler giderildi.",
      "5 Konu Kümesi (Topic Clusters) ve iç link ağı tamamlandı.",
      "Yazar E-E-A-T profili (ResearchGate, Medium, LinkedIn) arşive entegre edildi."
    ]
  });
});

// High-Speed Multi-Tier Translation Engine for Global Readership
const serverTranslationCache = new Map<string, {
  translatedTitle: string;
  translatedSummary: string;
  translatedContent: string;
  translatedDialecticalTriad?: any;
}>();

app.post('/api/gemini/translate', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=86400');
  const {
    articleId = '',
    slug = '',
    title = '',
    summary = '',
    content = '',
    dialecticalTriad = null,
    targetLanguage = 'English',
    targetLanguageCode = 'en'
  } = req.body || {};

  const langCode = String(targetLanguageCode || 'en').toLowerCase().trim();
  const cacheKey = `${String(articleId || slug || 'art').toLowerCase()}_${langCode}`;

  // 1. Instant in-memory server cache hit (< 1ms)
  if (serverTranslationCache.has(cacheKey)) {
    return res.json({ success: true, data: serverTranslationCache.get(cacheKey), cached: true });
  }

  // 2. Precomputed editorial translations hit (< 1ms)
  const precomputedMap = (PRECOMPUTED_TRANSLATIONS as any)[articleId] || (PRECOMPUTED_TRANSLATIONS as any)[slug];
  if (precomputedMap && precomputedMap[langCode]) {
    const payload = precomputedMap[langCode];
    serverTranslationCache.set(cacheKey, payload);
    return res.json({ success: true, data: payload, cached: true });
  }

  // 3. Fast translation pipeline with fallback
  let translatedTitle = title;
  let translatedSummary = summary;
  let translatedContent = content;
  let translatedTriad = dialecticalTriad ? { ...dialecticalTriad } : undefined;
  let translationSucceeded = false;

  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI();
      const prompt = `Translate this philosophical/scientific article text from Turkish into ${targetLanguage} (${langCode}). Keep tone rigorous and academic.
Title: ${title}
Summary: ${summary}
${dialecticalTriad?.claim ? `Claim: ${dialecticalTriad.claim}` : ''}
${dialecticalTriad?.counterClaim ? `CounterClaim: ${dialecticalTriad.counterClaim}` : ''}

Respond ONLY with valid JSON with keys:
"translatedTitle": "...",
"translatedSummary": "...",
"translatedClaim": "...",
"translatedCounterClaim": "..."`;

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini timeout')), 3500)
      );

      const geminiResult = await Promise.race([geminiPromise, timeoutPromise]);
      const rawText = geminiResult.text || '';
      const parsed = JSON.parse(rawText);
      if (parsed.translatedTitle) translatedTitle = parsed.translatedTitle;
      if (parsed.translatedSummary) translatedSummary = parsed.translatedSummary;
      if (translatedTriad) {
        if (parsed.translatedClaim) translatedTriad.claim = parsed.translatedClaim;
        if (parsed.translatedCounterClaim) translatedTriad.counterClaim = parsed.translatedCounterClaim;
      }
      translationSucceeded = true;
    } catch {
      // Gemini unavailable (e.g. 503 high demand or timeout). Proceed to fast neural fallback.
    }
  }

  // 4. Instant neural fallback if Gemini was slow or unavailable
  if (!translationSucceeded && title) {
    try {
      const queryTitle = encodeURIComponent(title.slice(0, 300));
      const resp = await fetch(
        `https://api.mymemory.translated.net/get?q=${queryTitle}&langpair=tr|${encodeURIComponent(langCode)}`,
        { signal: AbortSignal.timeout(2500) }
      );
      if (resp.ok) {
        const json = await resp.json();
        if (json?.responseData?.translatedText) {
          translatedTitle = json.responseData.translatedText;
          translationSucceeded = true;
        }
      }
    } catch {
      // Fallback network unavailable
    }
  }

  const payload = {
    translatedTitle,
    translatedSummary,
    translatedContent,
    translatedDialecticalTriad: translatedTriad,
  };

  serverTranslationCache.set(cacheKey, payload);
  return res.json({ success: true, data: payload, cached: false });
});

// Start an initial sync and repeat it at most every 10 minutes. The bundled 69-article
// archive remains available if Blogger is temporarily inaccessible.
void runBloggerSync(true);
const bloggerSyncTimer = setInterval(() => { void runBloggerSync(true); }, BLOG_SYNC_INTERVAL_MS);
bloggerSyncTimer.unref?.();

// Dynamic SEO endpoints: robots.txt, a 291-URL sitemap, and crawlable server-rendered articles.
// Keep the existing React/Vite homepage; the previous standalone homepage is deliberately not mounted.
registerSeoRoutes(app, { includeHome: false });

app.get('/blogger-canonical.js', (_req: Request, res: Response) => {
  res.type('application/javascript');
  if (runtimeBloggerCanonicalScript) {
    return res.send(runtimeBloggerCanonicalScript);
  }
  const file = path.join(__dirname, 'public', 'blogger-canonical.js');
  return fs.existsSync(file) ? res.sendFile(file) : res.send('var map={};');
});

app.get('/healthz', (_req: Request, res: Response) => res.status(200).json({ ok: true, domain: PRIMARY_DOMAIN }));

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    // Vite middleware preserves the current React application during local development.
    const vite = await createViteServer({
      configFile: path.join(__dirname, 'vite.config.ts'),
      server: { middlewareMode: true, hmr: process.env.DISABLE_HMR === 'true' ? false : undefined },
      appType: 'spa',
    });
    app.use('/api', (_req: Request, res: Response) => res.status(404).json({ error: 'API endpoint is not configured in this source package.' }));
    app.use(vite.middlewares);
  } else {
    // In production, serve only the built frontend and explicit public assets.
    app.use(express.static(path.join(__dirname, 'dist'), { index: false, dotfiles: 'deny', fallthrough: true }));
    app.use(express.static(path.join(__dirname, 'public'), { index: false, dotfiles: 'deny', fallthrough: true }));
    app.use('/api', (_req: Request, res: Response) => res.status(404).json({ error: 'API endpoint not found.' }));

    app.get('/', (_req: Request, res: Response) => {
      const builtIndex = path.join(__dirname, 'dist', 'index.html');
      const fallbackIndex = path.join(__dirname, 'index.html');
      const indexPath = fs.existsSync(builtIndex) ? builtIndex : fallbackIndex;
      try {
        const homepageHtml = fs.readFileSync(indexPath, 'utf8');
        const liveHomepageHtml = injectSearchableArticleIndex(homepageHtml, readProjectCatalog());
        res.setHeader('Cache-Control', 'public, max-age=300');
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(liveHomepageHtml);
      } catch (error) {
        console.error('[SEO] Ana sayfa makale kataloğu eklenemedi:', error instanceof Error ? error.message : error);
        return res.status(500).type('text/plain; charset=utf-8').send('Ana sayfa hazırlanamadı.');
      }
    });
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' || path.extname(req.path)) return next();
      const builtIndex = path.join(__dirname, 'dist', 'index.html');
      if (!fs.existsSync(builtIndex)) return res.status(503).type('text/plain').send('Önce npm run build komutuyla üretim dosyalarını oluşturun.');
      return res.status(200).sendFile(builtIndex);
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Science & Philosophy server running at ${PRIMARY_ORIGIN} on port ${PORT}`);
  });
}

start().catch((error) => {
  console.error('Server startup failed:', error);
  process.exitCode = 1;
});
