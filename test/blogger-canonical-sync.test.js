import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const server = fs.readFileSync(new URL('../server.ts', import.meta.url), 'utf8');

test('Blogger canonical mapping is built from successful feed-synchronized rows, not the full catalog', () => {
  assert.match(server, /function writeBloggerCanonicalScript\(synchronizedFeedArticles: any\[\]\)/);
  assert.match(server, /writeBloggerCanonicalScript\(feedArticles\)/);
  const functionBlock = server.match(/function writeBloggerCanonicalScript\([\s\S]*?\n\}/)?.[0] || '';
  assert.match(functionBlock, /Array\.isArray\(synchronizedFeedArticles\)/);
  assert.doesNotMatch(functionBlock, /catalog\.posts/);
});

test('canonical map ships empty and is populated only at runtime after feed synchronization', () => {
  const js = fs.readFileSync(new URL('../public/blogger-canonical.js', import.meta.url), 'utf8');
  assert.match(js, /var map=\{\}/);
  assert.doesNotMatch(js, /emrepelit7337\.blogspot\.com\/(?:\d{4}\/|p\/)/);
});

test('static robots files point to the primary sitemap', () => {
  for (const file of ['../robots.txt', '../public/robots.txt']) {
    const text = fs.readFileSync(new URL(file, import.meta.url), 'utf8');
    assert.match(text, /Sitemap:\s*https:\/\/sci-phil\.ai\.studio\/sitemap\.xml/);
  }
});

test('exact Google verification endpoint exists as a public build asset', () => {
  const file = new URL('../public/google5d3436c931b6024c.html', import.meta.url);
  const text = fs.readFileSync(file, 'utf8').trim();
  assert.equal(text, 'google-site-verification: google5d3436c931b6024c');
});
