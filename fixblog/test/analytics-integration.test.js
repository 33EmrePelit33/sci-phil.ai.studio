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
  assert.match(header, /href="\/analytics"/);
  assert.match(header, /<span>Analytics<\/span>/);
  assert.match(app, /href="\/analytics"/);
  assert.match(server, /app\.get\('\/analytics'/);
  assert.match(server, /sendFile\(path\.join\(__dirname, 'public', 'analytics\.html'\)\)/);
  assert.doesNotMatch(server, /app\.get\('\/analytics'.*auth|app\.get\('\/analytics'.*login/i);
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
  assert.match(panel, /ortalama okuma süresi mevcut sayaç kaynaklarından güvenilir biçimde alınmadığı/);
});
