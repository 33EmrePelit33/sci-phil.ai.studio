import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const fullCatalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));
const recovered = JSON.parse(fs.readFileSync(path.join(root, 'src/data/turkishCatalog.json'), 'utf8'));
const app = fs.readFileSync(path.join(root, 'src/App.tsx'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.ts'), 'utf8');

test('restores at least 68 complete, unique Turkish articles in the frontend bundle', () => {
  assert.ok(recovered.length >= 68, `expected at least 68, got ${recovered.length}`);
  assert.ok(recovered.every(p => p.language === 'tr' && p.title && p.slug && p.content));
  assert.equal(new Set(recovered.map(p => p.slug)).size, recovered.length);
  assert.equal(recovered.length, fullCatalog.posts.filter(p => p.language === 'tr' && p.title && p.slug && p.content).length);
});

test('React starts from the recovered archive and does not shrink on a short API response', () => {
  assert.match(app, /useState<Article\[]>\(RECOVERED_TURKISH_ARTICLES\)/);
  assert.match(app, /data\.articles\.length >= RECOVERED_TURKISH_ARTICLES\.length/);
});

test('server exposes the article API expected by the React application', () => {
  assert.match(server, /app\.get\('\/api\/articles'/);
  assert.match(server, /articles: synchronizedArticles/);
  assert.match(server, /syncStatus: currentBlogSyncStatus\(\)/);
  assert.match(server, /app\.post\('\/api\/sync-blog'/);
});
