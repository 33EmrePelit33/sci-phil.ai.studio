import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('global language selection batches all article-card metadata and persists translated catalogues', () => {
  const app = read('src/App.tsx');
  const service = read('src/utils/siteTranslationService.ts');
  const server = read('server.ts');
  assert.match(app, /handleReadingLanguageChange/);
  assert.match(app, /siteTranslation=\{siteTranslations\[article\.id\]/);
  assert.match(app, /translatedCategoryLabels/);
  assert.match(service, /localStorage\.setItem\(key, JSON\.stringify\(cache\)\)/);
  assert.match(server, /app\.post\('\/api\/gemini\/translate-site'/);
  assert.match(server, /const requestArticles = Array\.isArray\(req\.body\?\.articles\)/);
  assert.match(server, /targetLanguageNames\[langCode\]/);
  assert.match(service, /articles: articles\.map/);
});

test('full article prose has an HTML-preserving translation path and source-sensitive cache keys', () => {
  const route = read('server.ts');
  const client = read('src/utils/translationService.ts');
  assert.match(route, /translateLongHtml\(ai, sourceHtml/);
  assert.match(route, /Preserve every HTML tag/);
  assert.match(route, /sourceRevision/);
  assert.match(route, /languageNames\[langCode\]/);
  assert.match(route, /Desteklenmeyen kaynak veya hedef dil/);
  assert.match(client, /translationSourceRevision/);
});

test('Blogger server sync is scheduled every 15 minutes and browser refreshes on return', () => {
  const server = read('server.ts');
  const app = read('src/App.tsx');
  assert.match(server, /const BLOG_SYNC_INTERVAL_MS = 15 \* 60 \* 1000/);
  assert.match(server, /setInterval\(\(\) => \{\s*syncBloggerCatalogue\(false\)/);
  assert.match(server, /\}, BLOG_SYNC_INTERVAL_MS\)/);
  assert.match(app, /setInterval\(\(\) => \{ void fetchArticles\(\); \}, 60 \* 1000\)/);
  assert.match(app, /addEventListener\('focus', refreshOnReturn\)/);
});



test('global language cache is versioned and source language participates in article translation', () => {
  const service = read('src/utils/translationService.ts');
  const siteService = read('src/utils/siteTranslationService.ts');
  const articleView = read('src/components/ArticleView.tsx');
  assert.match(service, /sourceLanguageCode: params\.sourceLanguageCode \|\| 'tr'/);
  assert.match(service, /v2_\$\{articleIdOrSlug/);
  assert.match(siteService, /sci_phil_site_catalog_v3_/);
  assert.match(articleView, /sourceLanguageCode: article\.language \|\| 'tr'/);
  assert.match(articleView, /setTranslationError/);
});

test('failed global catalogue translation does not label incomplete results successful', () => {
  const server = read('server.ts');
  const app = read('src/App.tsx');
  const service = read('src/utils/siteTranslationService.ts');
  assert.match(server, /missingTranslationCount > 0/);
  assert.match(server, /if \(!complete\) continue/);
  assert.match(app, /Keep the previously selected language and its complete catalogue/);
  assert.match(service, /Tam dil geçişi için/);
});


test('global translation endpoint translates the exact active catalogue IDs sent by the UI', () => {
  const server = read('server.ts');
  const service = read('src/utils/siteTranslationService.ts');
  assert.match(server, /posts = requestArticles\.map/);
  assert.match(server, /new Set\(posts\.map\(\(article\) => article\.id\)\)\.size !== posts\.length/);
  assert.match(server, /missingTranslationCount > 0/);
  assert.match(service, /articles: articles\.map/);
  assert.match(service, /const missing = articles\.filter\(\(article\) => !translations\[article\.id\] && !translations\[article\.slug\]\)/);
});


test('active non-Turkish language refreshes translations when the Blogger catalogue changes without retry storms', () => {
  const app = read('src/App.tsx');
  assert.match(app, /autoTranslationAttemptRef/);
  assert.match(app, /Yeni veya güncellenen makaleler/);
  assert.match(app, /hasMissingTranslations/);
  assert.match(app, /\[articles, readingLanguage, siteTranslations, syncStatus\.status\]/);
});
