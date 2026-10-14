import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (name) => fs.readFileSync(path.join(root, name), 'utf8');
const server = read('server.ts');
const header = read('src/components/Header.tsx');
const homepage = read('index.html');
const seo = read('seo.js');
const dashboard = read('public/analytics.html');
const liveDashboardJs = read('public/analytics-live.js');
const tracker = read('public/analytics-tracker.js');
const env = read('.env.example');
const guide = read('LIVE_ANALYTICS_KURULUM_TR.md');

test('top navigation has a Live Analytics link to the public dashboard', () => {
  assert.match(header, /href="\/analytics\.html"/);
  assert.match(header, /Live Analytics/);
  assert.match(header, /ChartNoAxesCombined/);
});

test('Umami tracker is loaded on the SPA, public dashboard, and generated SEO article pages', () => {
  assert.match(homepage, /src="\/analytics-tracker\.js"/);
  assert.match(dashboard, /src="\/analytics-tracker\.js"/);
  assert.match(seo, /src="\/analytics-tracker\.js"/);
  assert.match(seo, /class="analytics-nav" href="\/analytics\.html"/);
  assert.match(tracker, /\/api\/analytics\/config/);
  assert.match(tracker, /cloud\.umami\.is\/script\.js/);
});

test('server exposes the public tracker configuration without leaking the API key', () => {
  assert.match(server, /app\.get\('\/api\/analytics\/config'/);
  assert.match(server, /enabled: Boolean\(UMAMI_WEBSITE_ID\)/);
  assert.doesNotMatch(server.slice(server.indexOf("app.get('/api/analytics/config'"), server.indexOf("app.get('/api/analytics/summary'")), /UMAMI_API_KEY/);
});

test('server-only summary endpoint requests visitor totals and country dimension starting at milestone', () => {
  assert.match(server, /app\.get\('\/api\/analytics\/summary'/);
  assert.match(server, /ANALYTICS_START_AT/);
  assert.match(server, /\/stats\?/);
  assert.match(server, /type: 'country'/);
  assert.match(server, /Authorization: `Bearer \$\{UMAMI_API_KEY\}`/);
  assert.match(server, /Europe\/Istanbul/);
  assert.match(server, /30000/);
});

test('dashboard visibly renders unique visitors, pageviews, visits, and country counts', () => {
  for (const id of ['live-visitors', 'live-pageviews', 'live-visits', 'live-country-rows']) assert.ok(dashboard.includes(`id="${id}"`));
  assert.match(dashboard, /12 Ekim 2026/);
  assert.match(liveDashboardJs, /countries/);
  assert.match(liveDashboardJs, /setInterval\(load, 60000\)/);
  assert.match(liveDashboardJs, /Kurulum gerekli/);
});

test('analytics secrets and setup instructions are documented, including no historical backfill', () => {
  assert.match(env, /UMAMI_WEBSITE_ID/);
  assert.match(env, /UMAMI_API_KEY/);
  assert.match(env, /2026-10-12T00:00:00\+03:00/);
  assert.match(guide, /API anahtarı gizlidir/);
  assert.match(guide, /geriye dönük ziyaret verisi üretilemez/);
});
