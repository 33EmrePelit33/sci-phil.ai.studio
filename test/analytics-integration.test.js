import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const panel = fs.readFileSync(path.join(root, 'public/analytics.html'), 'utf8');
const dashboard = fs.readFileSync(path.join(root, 'public/analytics-dashboard.js'), 'utf8');
const header = fs.readFileSync(path.join(root, 'src/components/Header.tsx'), 'utf8');
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.ts'), 'utf8');

test('Analytics panel is public, read-only, and reachable from the site UI', () => {
  assert.match(panel, /READ ONLY · SALT OKUNUR/);
  assert.match(panel, /id="analytics-refresh"/);
  assert.match(header, /href="\/analytics\.html"/);
  assert.match(app, /href="\/analytics\.html"/);
  assert.match(server, /app\.get\('\/analytics'.*res\.redirect\(301, '\/analytics\.html'\)/);
});

test('Analytics only reads counters, does not write counters, and refreshes periodically', () => {
  assert.match(dashboard, /\/get\//);
  assert.doesNotMatch(dashboard, /\/hit\//);
  assert.match(dashboard, /refreshMs: 60_000/);
  assert.match(dashboard, /live === null/);
});

test('Analytics avoids unverifiable rankings and hard-coded metric fallbacks', () => {
  assert.doesNotMatch(panel, /#1 \(Lider\)|Top 3|İlk %0\.5|Global Benchmarks/);
  assert.doesNotMatch(dashboard, /145200|57932|78104/);
  assert.match(panel, /ortalama ziyaret süresi|Ziyaret Süresi/i);
  assert.match(dashboard, /Gösterilen değer/);
  assert.doesNotMatch(dashboard, /14\.2|~2450|296\/296|12-19 Ekim 2026/);
  assert.doesNotMatch(panel, /14\.2|2,450|296 \/ 296|296\/296|12-19 Ekim 2026|LCP 1\.2s|otoriteyi %35/);
  assert.match(panel, /analytics\.html/);
  assert.match(panel, /Doğrulanmış haftalık rapor henüz mevcut değil/);
});

test('legacy Live Stats asset does not inject fallback metrics and refreshes once per minute', () => {
  const legacyWidget = fs.readFileSync(path.join(root, 'public/live-stats.js'), 'utf8');
  assert.match(legacyWidget, /refreshMs: 60_000/);
  assert.match(legacyWidget, /value === null \? '—'/);
  assert.doesNotMatch(legacyWidget, /blogger_post_reads_baseline:25431|total_net_reads_baseline:57941|78119/);
  assert.doesNotMatch(legacyWidget, /15 dakikada bir|900000/);
});

test('SEO automation endpoints do not claim unverified indexing, traffic, or Core Web Vitals values', () => {
  assert.match(server, /projectionsAvailable: false/);
  assert.match(server, /searchConsoleConnected: false/);
  assert.match(server, /reportDataAvailable: false/);
  assert.doesNotMatch(server, /estimatedImpressions|indexedPagesTarget|sitemapStatus: "Success|bingIndexNowStatus: "Active/);
});
