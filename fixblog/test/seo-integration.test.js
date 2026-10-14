import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const site = 'https://sci-phil.ai.studio';
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));
const sitemap = fs.readFileSync(path.join(root, 'public/sitemap.xml'), 'utf8');
const robots = fs.readFileSync(path.join(root, 'public/robots.txt'), 'utf8');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const server = fs.readFileSync(path.join(root, 'server.ts'), 'utf8');

test('article catalogue has 289 unique slugged entries', () => {
  assert.equal(catalog.posts.length, 289);
  const slugs = catalog.posts.map(p => p.slug);
  assert.ok(slugs.every(s => typeof s === 'string' && s.length > 0));
  assert.equal(new Set(slugs.map(s => s.toLowerCase())).size, slugs.length);
});

test('sitemap has homepage, every article, and analytics (291 URLs)', () => {
  const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
  assert.equal(urls.length, 291);
  assert.equal(urls[0], `${site}/`);
  assert.ok(urls.includes(`${site}/analytics`));
  assert.ok(urls.every(u => u.startsWith(site + '/')));
  assert.ok(urls.every(u => !u.includes('#')));
  assert.ok(urls.some(u => u.includes('/makale/')));
});

test('robots.txt references the primary sitemap and does not block the whole site', () => {
  assert.match(robots, /User-agent: \*\s+Allow: \//);
  assert.match(robots, new RegExp(`Sitemap: ${site.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap\\.xml`));
  assert.match(robots, /Disallow: \/api\//);
  assert.doesNotMatch(robots, /Disallow: \/\*\?\*/);
});

test('homepage has valid JSON-LD, correct canonical and 289 crawlable article links', () => {
  assert.match(html, new RegExp(`<link rel="canonical" href="${site.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/"`));
  const schema = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
  assert.ok(schema);
  assert.doesNotThrow(() => JSON.parse(schema[1]));
  assert.equal((html.match(/<li><a href="\/makale\//g) || []).length, 289);
});

test('server uses exact legacy-host 301 rules and leaves the React homepage mounted', () => {
  assert.match(server, /const PRIMARY_DOMAIN = 'sci-phil\.ai\.studio'/);
  assert.match(server, /science-philosophy\.ai\.studio/);
  assert.match(server, /registerSeoRoutes\(app, \{ includeHome: false \}\)/);
  assert.match(server, /res\.redirect\(301/);
  assert.doesNotMatch(server, /!host\.includes\(PRIMARY_DOMAIN\)/);
});
