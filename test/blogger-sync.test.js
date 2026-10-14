import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseBloggerFeedPayload,
  isTurkishPost,
  slugifyTurkish,
  createArticleFromBloggerPost,
  htmlToPlainText,
} from '../blogger-sync.js';

const turkishEntry = {
  id: { $t: 'tag:blogger.com,1999:blog-123.post-456' },
  title: { $t: 'Bilim ve Felsefede Gerçeklik Nedir?' },
  content: { $t: '<p>Bu makalede bilim ve felsefe üzerinden gerçekliğin ne olduğu, bilginin nasıl oluştuğu ve insan düşüncesinin rolü ele alınmaktadır.</p>' },
  summary: { $t: '<p>Bilim ve felsefede gerçeklik üzerine bir inceleme.</p>' },
  published: { $t: '2026-10-12T10:30:00+03:00' },
  updated: { $t: '2026-10-12T11:00:00+03:00' },
  author: [{ name: { $t: 'Emre Pelit' } }],
  category: [{ term: 'Felsefe' }, { term: 'Türkçe' }],
  link: [{ rel: 'alternate', type: 'text/html', href: 'https://emrepelit7337.blogspot.com/2026/10/ornek.html' }],
};

test('parses Blogger JSON feed entries and selects the alternate URL', () => {
  const posts = parseBloggerFeedPayload({ feed: { entry: [turkishEntry] } });
  assert.equal(posts.length, 1);
  assert.equal(posts[0].id, '456');
  assert.equal(posts[0].url, 'https://emrepelit7337.blogspot.com/2026/10/ornek.html');
  assert.equal(posts[0].hasFullContent, true);
  assert.equal(posts[0].author, 'Emre Pelit');
  assert.deepEqual(posts[0].labels, ['Felsefe', 'Türkçe']);
});

test('parses Blogger Atom XML posts', () => {
  const xml = `<?xml version="1.0"?><feed xmlns="http://www.w3.org/2005/Atom"><entry><id>tag:blogger.com,1999:blog-1.post-7</id><title>Türkçe yazı</title><link rel="alternate" type="text/html" href="https://emrepelit7337.blogspot.com/2026/10/test.html"/><published>2026-10-12T00:00:00Z</published><updated>2026-10-12T00:00:00Z</updated><author><name>Emre Pelit</name></author><category term="Türkçe"/><content type="html">&lt;p&gt;Bu yazı bilim ve felsefe hakkındadır.&lt;/p&gt;</content></entry></feed>`;
  const posts = parseBloggerFeedPayload(xml);
  assert.equal(posts.length, 1);
  assert.equal(posts[0].id, '7');
  assert.match(posts[0].contentHtml, /<p>Bu yazı bilim/);
  assert.equal(posts[0].url, 'https://emrepelit7337.blogspot.com/2026/10/test.html');
});

test('Turkish label admits a post and explicit non-Turkish language label rejects it', () => {
  assert.equal(isTurkishPost({ ...parseBloggerFeedPayload({ feed: { entry: [turkishEntry] } })[0] }), true);
  const english = { title: 'A short example', contentHtml: '<p>This article studies scientific reasoning and philosophy.</p>', summaryHtml: '', labels: ['English'], declaredLanguage: '' };
  assert.equal(isTurkishPost(english), false);
});

test('heuristic detects Turkish prose without requiring a Turkish label', () => {
  const post = {
    title: 'Bilim ve gerçeklik', labels: [],
    contentHtml: '<p>Bu makalede bilim ve felsefe üzerinden insan düşüncesinin nasıl geliştiği incelenmektedir. Bilgi, gerçeklik ve zaman üzerine farklı açıklamalar ele alınır.</p>',
    summaryHtml: '', declaredLanguage: '',
  };
  assert.equal(isTurkishPost(post), true);
});

test('creates a hosted-ready Article record while preserving the Blogger source URL', () => {
  const post = parseBloggerFeedPayload({ feed: { entry: [turkishEntry] } })[0];
  const article = createArticleFromBloggerPost(post, { reservedSlugs: new Set() });
  assert.equal(article.language, 'tr');
  assert.equal(article.id, '456');
  assert.match(article.slug, /^bilim-ve-felsefede-gerceklik-nedir-456$/);
  assert.equal(article.url, post.url);
  assert.equal(article.originalUrl, post.url);
  assert.match(article.content, /<p>/);
  assert.ok(article.readingTimeMinutes >= 1);
});

test('Turkish slug normalization and HTML text extraction are stable', () => {
  assert.equal(slugifyTurkish('Çığ, Şüphe ve Üçlü Önerme'), 'cig-suphe-ve-uclu-onerme');
  assert.equal(htmlToPlainText('<p>Merhaba&nbsp;dünya &amp; bilim</p>'), 'Merhaba dünya & bilim');
});
