import express, { Request, Response, NextFunction } from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
// @ts-ignore - SEO route module is JavaScript so it can also be used by the Node runtime.
import { registerSeoRoutes } from './seo.js';
import { RECOVERED_TURKISH_ARTICLES, RECOVERED_ARTICLES_UPDATED_AT } from './src/data/recoveredTurkishArticles';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = Number(process.env.PORT) || 3000;
const PRIMARY_DOMAIN = 'sci-phil.ai.studio';
const PRIMARY_ORIGIN = `https://${PRIMARY_DOMAIN}`;
const LEGACY_DOMAINS = new Set([
  'science-philosophy.ai.studio',
]);

app.disable('x-powered-by');
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

// Serve the complete bundled Turkish article archive. The old build only had a
// three-entry seed cache while the frontend expected an /api/articles endpoint.
app.get('/api/articles', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=300');
  return res.json({
    articles: RECOVERED_TURKISH_ARTICLES,
    count: RECOVERED_TURKISH_ARTICLES.length,
    lastSynced: RECOVERED_ARTICLES_UPDATED_AT,
    source: 'bundled-blogger-archive',
  });
});

// Dynamic SEO endpoints: robots.txt, a 291-URL sitemap, and crawlable server-rendered articles.
// Keep the existing React/Vite homepage; the previous standalone homepage is deliberately not mounted.
registerSeoRoutes(app, { includeHome: false });

app.get('/analytics', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  return res.sendFile(path.join(__dirname, 'public', 'analytics.html'));
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
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.sendFile(indexPath);
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
