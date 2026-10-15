import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
// @ts-ignore - SEO route module is JavaScript so it can also be used by the Node runtime.
import { registerSeoRoutes } from './seo.js';
import { fetchAllBloggerPosts, translateNaturalText } from './blogger-sync';
// @ts-ignore
import { buildRealAnalyticsPayload } from './analytics-data.js';
import { RECOVERED_TURKISH_ARTICLES, RECOVERED_ARTICLES_UPDATED_AT } from './src/data/recoveredTurkishArticles';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PRIMARY_DOMAIN = 'sci-phil.ai.studio';
const PRIMARY_ORIGIN = `https://${PRIMARY_DOMAIN}`;
const LEGACY_DOMAINS = new Set([
  'science-philosophy.ai.studio',
  'science-philosophy-emre-pelit.ai.studio',
]);

app.disable('x-powered-by');

// Security + domain redirect middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const host = String(req.headers.host || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '');
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').split(',')[0].trim().toLowerCase();
  const protocol = forwardedProto || req.protocol;

  if (LEGACY_DOMAINS.has(host)) {
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

// Health check endpoint required by Cloud Run / AI Studio probes
app.get('/healthz', (_req: Request, res: Response) => {
  res.status(200).json({ ok: true, domain: PRIMARY_DOMAIN, port: PORT });
});

// Articles API
app.get('/api/articles', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.json({
    articles: RECOVERED_TURKISH_ARTICLES,
    count: RECOVERED_TURKISH_ARTICLES.length,
    lastSynced: RECOVERED_ARTICLES_UPDATED_AT,
    source: 'bundled-blogger-archive',
  });
});

// Background auto-sync every 10 minutes (does not block startup)
const TEN_MINUTES_MS = 10 * 60 * 1000;

async function runBackgroundBloggerSync() {
  try {
    console.log('[Auto-Sync] 10 dakikalık periyodik Blogger arka plan senkronizasyonu tetiklendi.');
    const posts = await fetchAllBloggerPosts({ forceFull: false });
    if (posts && posts.length > 0) {
      console.log(`[Auto-Sync] Başarılı: ${posts.length} yazı denetlendi / eşitlendi.`);
    }
  } catch (err) {
    console.warn('[Auto-Sync] Arka plan senkronizasyon uyarısı:', err);
  }
}

// Start background sync after server is listening
setTimeout(runBackgroundBloggerSync, 8000);
setInterval(runBackgroundBloggerSync, TEN_MINUTES_MS);

// Manual sync endpoint
app.post('/api/sync-blog', async (req: Request, res: Response) => {
  try {
    const posts = await fetchAllBloggerPosts({ forceFull: true });
    res.json({
      success: true,
      count: posts?.length ?? 0,
      message: 'Blogger senkronizasyonu kullanıcı talebiyle başarıyla tamamlandı.',
    });
  } catch (err: any) {
    console.error('[Manual-Sync] Hata:', err);
    res.status(500).json({ success: false, error: err.message || 'Senkronizasyon hatası' });
  }
});

// ---------------------------------------------------------------------------
// Instant natural-language translation endpoints
// Uses free Google Translate (via blogger-sync) for speed; no API key required.
// Optional: if GEMINI_API_KEY is set, higher-quality translation can be added later.
// ---------------------------------------------------------------------------

const translationCache = new Map<string, string>();

async function translateField(text: string | undefined, target: string, source = 'tr'): Promise<string> {
  if (!text || !String(text).trim()) return text || '';
  const key = `${source}|${target}|${text}`;
  if (translationCache.has(key)) return translationCache.get(key)!;
  try {
    const result = await translateNaturalText(text, target, source);
    translationCache.set(key, result);
    return result;
  } catch (err) {
    console.warn('[Translate] field failed:', err);
    return text;
  }
}

// Bulk site catalogue translation (called when language button is pressed)
app.post('/api/gemini/translate-site', async (req: Request, res: Response) => {
  try {
    const { targetLanguageCode, articles } = req.body || {};
    if (!targetLanguageCode || !Array.isArray(articles)) {
      return res.status(400).json({ success: false, error: 'targetLanguageCode and articles[] required' });
    }
    const target = String(targetLanguageCode).toLowerCase().slice(0, 2);
    if (target === 'tr') {
      return res.json({ success: true, translations: {} });
    }

    const translations: Record<string, any> = {};
    // Translate in small parallel batches to stay fast and polite to the free endpoint
    const BATCH = 4;
    for (let i = 0; i < articles.length; i += BATCH) {
      const batch = articles.slice(i, i + BATCH);
      await Promise.all(batch.map(async (article: any) => {
        const id = article.id || article.slug;
        if (!id) return;
        const srcLang = (article.language || 'tr').toLowerCase().slice(0, 2);
        const [title, summary, ...cats] = await Promise.all([
          translateField(article.title, target, srcLang),
          translateField(article.summary, target, srcLang),
          ...(Array.isArray(article.categories) ? article.categories.map((c: string) => translateField(c, target, srcLang)) : []),
        ]);
        const triad = article.dialecticalTriad || {};
        const [claim, counterClaim, whatIsNotEvidence, methodologicalNote] = await Promise.all([
          translateField(triad.claim, target, srcLang),
          translateField(triad.counterClaim, target, srcLang),
          translateField(triad.whatIsNotEvidence, target, srcLang),
          translateField(triad.methodologicalNote, target, srcLang),
        ]);
        translations[id] = {
          title: title || article.title,
          summary: summary || article.summary,
          categories: cats.filter(Boolean),
          dialecticalTriad: {
            claim,
            counterClaim,
            whatIsNotEvidence,
            methodologicalNote,
          },
        };
      }));
    }

    return res.json({ success: true, translations, count: Object.keys(translations).length });
  } catch (err: any) {
    console.error('[translate-site] error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Translation failed' });
  }
});

// Single full-article translation (used when opening an article in a non-Turkish language)
app.post('/api/gemini/translate', async (req: Request, res: Response) => {
  try {
    const {
      title = '',
      summary = '',
      content = '',
      dialecticalTriad = {},
      targetLanguageCode = 'en',
      sourceLanguageCode = 'tr',
    } = req.body || {};
    const target = String(targetLanguageCode).toLowerCase().slice(0, 2);
    const source = String(sourceLanguageCode).toLowerCase().slice(0, 2);

    const [translatedTitle, translatedSummary, translatedContent, claim, counterClaim, whatIsNotEvidence, methodologicalNote] = await Promise.all([
      translateField(title, target, source),
      translateField(summary, target, source),
      translateField(content, target, source),
      translateField(dialecticalTriad?.claim, target, source),
      translateField(dialecticalTriad?.counterClaim, target, source),
      translateField(dialecticalTriad?.whatIsNotEvidence, target, source),
      translateField(dialecticalTriad?.methodologicalNote, target, source),
    ]);

    return res.json({
      success: true,
      data: {
        translatedTitle,
        translatedSummary,
        translatedContent,
        translatedDialecticalTriad: {
          claim,
          counterClaim,
          whatIsNotEvidence,
          methodologicalNote,
        },
      },
    });
  } catch (err: any) {
    console.error('[translate] error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Translation failed' });
  }
});

// Register SEO routes (sitemap, robots, server-rendered articles)
registerSeoRoutes(app, { includeHome: false });


// ---------------------------------------------------------------------------
// Analytics API — statistics from 24 April 2026 onwards, synchronized with live data
// emrepelitscienceonly.com.tr is intentionally excluded
// ---------------------------------------------------------------------------
const ANALYTICS_START_AT = process.env.ANALYTICS_START_AT || '2026-04-24T00:00:00+03:00';
const UMAMI_API_BASE = (process.env.UMAMI_API_BASE_URL || 'https://api.umami.is/v1').replace(/\/$/, '');
const UMAMI_API_KEY = process.env.UMAMI_API_KEY || '';

const ANALYTICS_SITES = [
  { key: 'sciphil', name: 'sci-phil.ai.studio', domain: 'sci-phil.ai.studio', env: 'UMAMI_WEBSITE_ID', launchDate: '2026-04-24T00:00:00+03:00', launchLabel: '24 Nisan 2026' },
  { key: 'blogger', name: 'Blogger (Time & Entropy)', domain: 'emrepelit7337.blogspot.com', env: 'UMAMI_BLOGGER_WEBSITE_ID', launchDate: '2026-01-15T00:00:00+03:00', launchLabel: '15 Ocak 2026' },
  { key: 'grokme', name: 'Science & Philosophy Grok.me', domain: 'science-philosophy.grok.me', env: 'UMAMI_GROKME_WEBSITE_ID', launchDate: '2026-09-26T00:00:00+03:00', launchLabel: '26 Eylül 2026' },
  { key: 'github', name: 'GitHub Pages', domain: process.env.UMAMI_GITHUB_PAGES_DOMAIN || 'github.io', env: 'UMAMI_GITHUB_PAGES_WEBSITE_ID', launchDate: '2026-09-26T00:00:00+03:00', launchLabel: '26 Eylül 2026' },
  { key: 'alias', name: 'science-philosophy.ai.studio', domain: 'science-philosophy-emre-pelit.ai.studio', env: 'UMAMI_ALIAS_WEBSITE_ID', launchDate: '2026-10-12T00:00:00+03:00', launchLabel: '12 Ekim 2026' },
].filter(site => !/emrepelitscienceonly\.com\.tr/i.test(site.domain));

async function fetchUmamiStats(websiteId: string, startAt: string, endAt: string) {
  if (!UMAMI_API_KEY || !websiteId) return null;
  const url = `${UMAMI_API_BASE}/websites/${websiteId}/stats?startAt=${encodeURIComponent(startAt)}&endAt=${encodeURIComponent(endAt)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${UMAMI_API_KEY}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Umami stats ${res.status}`);
  return res.json();
}

async function fetchUmamiCountries(websiteId: string, startAt: string, endAt: string) {
  if (!UMAMI_API_KEY || !websiteId) return [];
  const url = `${UMAMI_API_BASE}/websites/${websiteId}/metrics?type=country&startAt=${encodeURIComponent(startAt)}&endAt=${encodeURIComponent(endAt)}&limit=100`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${UMAMI_API_KEY}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  const json = await res.json();
  return Array.isArray(json) ? json : (json.data || []);
}

app.get('/api/analytics/summary', async (_req: Request, res: Response) => {
  const startAt = ANALYTICS_START_AT;
  const endAt = new Date().toISOString();
  const mainWebsiteId = process.env.UMAMI_WEBSITE_ID || '';

  if (!UMAMI_API_KEY || !mainWebsiteId) {
    return res.status(503).json({
      configured: false,
      error: 'Umami yapılandırması eksik. UMAMI_API_KEY ve UMAMI_WEBSITE_ID sunucu değişkenlerini ayarlayın.',
      startAt,
      milestone: '24 Nisan 2026, 00:00 (Türkiye Saati)',
    });
  }

  try {
    const [stats, countries] = await Promise.all([
      fetchUmamiStats(mainWebsiteId, startAt, endAt),
      fetchUmamiCountries(mainWebsiteId, startAt, endAt),
    ]);

    const payload = buildRealAnalyticsPayload(stats, countries, {
      startAt,
      endAt,
      timezone: 'Europe/Istanbul',
    });

    // Ensure milestone is the requested date
    payload.milestone = '24 Nisan 2026, 00:00 (Türkiye Saati)';
    payload.startAt = startAt;
    return res.json(payload);
  } catch (err: any) {
    console.error('[analytics/summary]', err);
    return res.status(500).json({
      configured: true,
      error: err.message || 'Analytics verisi alınamadı',
      startAt,
    });
  }
});

app.get('/api/analytics/sites-summary', async (_req: Request, res: Response) => {
  const endAt = new Date().toISOString();
  const sites = [];
  let totalVisitors = 0, totalPageviews = 0, totalVisits = 0;

  for (const site of ANALYTICS_SITES) {
    const websiteId = process.env[site.env] || '';
    const siteStart = site.launchDate || ANALYTICS_START_AT;
    const entry: any = {
      key: site.key,
      name: site.name,
      domain: site.domain,
      launchDate: siteStart,
      launchLabel: site.launchLabel,
      status: websiteId ? (UMAMI_API_KEY ? 'connected' : 'api_key_missing') : 'not_configured',
      visitors: null,
      pageviews: null,
      visits: null,
      netReads: null,
      cumulativeViews: null,
    };

    if (websiteId && UMAMI_API_KEY) {
      try {
        const stats = await fetchUmamiStats(websiteId, siteStart, endAt);
        const data = stats?.data || stats || {};
        entry.visitors = Number(data.visitors) || 0;
        entry.pageviews = Number(data.pageviews) || 0;
        entry.visits = Number(data.visits) || 0;
        entry.cumulativeViews = entry.pageviews;
        entry.netReads = entry.visits || entry.pageviews;
        totalVisitors += entry.visitors;
        totalPageviews += entry.pageviews;
        totalVisits += entry.visits;
      } catch (err: any) {
        entry.status = 'error';
        entry.error = err.message;
      }
    }
    sites.push(entry);
  }

  return res.json({
    success: true,
    startAt: ANALYTICS_START_AT,
    milestone: 'Her site kendi açılış tarihinden itibaren',
    sites,
    totals: {
      visitors: totalVisitors,
      pageviews: totalPageviews,
      visits: totalVisits,
      cumulativeViews: totalPageviews,
      netReads: totalVisits,
    },
  });
});


// Baseline: all data up to the snapshot is frozen; new data is added on top
app.get('/api/analytics/baseline', (_req: Request, res: Response) => {
  const baselinePath = path.join(__dirname, 'public', 'stats', 'analytics-baseline.json');
  if (fs.existsSync(baselinePath)) {
    res.setHeader('Cache-Control', 'no-store');
    return res.sendFile(baselinePath);
  }
  return res.json({
    snapshotAt: '2026-10-15T17:02:00+03:00',
    sites: {},
    totals: { cumulativeViews: 0, unifiedNetReads: 0 },
  });
});

app.get('/analytics', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  const analyticsPath = path.join(__dirname, 'public', 'analytics.html');
  if (fs.existsSync(analyticsPath)) {
    return res.sendFile(analyticsPath);
  }
  return res.status(404).send('Analytics page not found');
});

async function start() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    // Development: Vite middleware
    try {
      const vite = await createViteServer({
        configFile: path.join(__dirname, 'vite.config.ts'),
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.warn('[Vite] Development middleware failed to start, falling back to static:', viteErr);
      app.use(express.static(path.join(__dirname, 'public')));
      app.use(express.static(path.join(__dirname)));
    }
  } else {
    // Production: serve built assets
    const distPath = path.join(__dirname, 'dist');
    const publicPath = path.join(__dirname, 'public');

    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath, { index: false, dotfiles: 'deny', fallthrough: true }));
    }
    if (fs.existsSync(publicPath)) {
      app.use(express.static(publicPath, { index: false, dotfiles: 'deny', fallthrough: true }));
    }

    // SPA fallback for frontend routes
    app.get('*', (req: Request, res: Response, next: NextFunction) => {
      if (req.method !== 'GET' || path.extname(req.path)) return next();

      const builtIndex = path.join(distPath, 'index.html');
      const rootIndex = path.join(__dirname, 'index.html');

      if (fs.existsSync(builtIndex)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.sendFile(builtIndex);
      }
      if (fs.existsSync(rootIndex)) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.sendFile(rootIndex);
      }
      return res.status(503).type('text/plain').send('Önce npm run build komutuyla üretim dosyalarını oluşturun.');
    });
  }

  // Critical: listen on the PORT provided by Cloud Run / AI Studio
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Science & Philosophy server running at ${PRIMARY_ORIGIN} on port ${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
    process.exit(1);
  });
}

start().catch((error) => {
  console.error('Server startup failed:', error);
  process.exitCode = 1;
});
