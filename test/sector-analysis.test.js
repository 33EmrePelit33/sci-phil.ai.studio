import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const sectorComponent = fs.readFileSync(path.join(root, 'src/components/SectorEvaluation.tsx'), 'utf8');
const sectorPanel = fs.readFileSync(path.join(root, 'src/components/SectorPanel.tsx'), 'utf8');
const cards = fs.readFileSync(path.join(root, 'src/components/ArticleCard.tsx'), 'utf8');
const articleView = fs.readFileSync(path.join(root, 'src/components/ArticleView.tsx'), 'utf8');
const types = fs.readFileSync(path.join(root, 'src/types/article.ts'), 'utf8');
const seed = fs.readFileSync(path.join(root, 'src/data/seedArticles.ts'), 'utf8');
const recovered = fs.readFileSync(path.join(root, 'src/data/recoveredTurkishArticles.ts'), 'utf8');
const seo = fs.readFileSync(path.join(root, 'seo.js'), 'utf8');
const catalog = JSON.parse(fs.readFileSync(path.join(root, 'catalog.json'), 'utf8'));
const { registerSeoRoutes } = await import('../seo.js');

test('every article card includes a sector definition and sector assessment', () => {
  assert.match(cards, /<SectorEvaluation article=\{article\} compact \/>/);
  assert.match(sectorComponent, /Sektör Tanımı/);
  assert.match(sectorComponent, /Sektör Değerlendirmesi/);
  assert.match(sectorComponent, /article\.dialecticalTriad\?\.claim/);
  assert.match(sectorComponent, /article\.content/);
  assert.match(sectorComponent, /Olası katkı|Sektörel bağlantı ve olası katkı/);
  assert.match(sectorComponent, /Sınırlar, riskler ve kontrol ölçütleri/);
});

test('article details show the sector panel and no longer expose the old professional-review tab', () => {
  assert.match(sectorPanel, /<SectorEvaluation article=\{article\} \/>/);
  assert.match(articleView, /label: 'Sektör Tanımı ve Değerlendirmesi'/);
  assert.match(articleView, /activeTab === 'sector'/);
  assert.doesNotMatch(articleView, /activeTab === 'experts'/);
  assert.doesNotMatch(articleView, /Mesleki Tez Değerlendirmesi/);
});

test('fabricated named expert records and opinion schema are removed from article seed data and types', () => {
  for (const text of [seed, recovered, types]) {
    assert.doesNotMatch(text, /expertOpinions|expertName|expertRole|consensusScore|GeminiExpertAnalysisResponse/);
  }
  assert.doesNotMatch(seed, /Dr\. Alperen Yılmaz|Elizabeth Vance|Metehan Çelik|Selin Korkmaz|Zeynep Bilge|TÜBİTAK BİLGEM|Oxford Felsefe Enstitüsü/);
  assert.doesNotMatch(seo, /PROFESSIONAL_REVIEW_COPY|buildProfessionalEvaluationHtml|professional-review-card|3 mesleki bakış açısı/);
  assert.doesNotMatch(sectorComponent, /expertName|affiliation|konsensüs|uzmanlık merceği/);
});

test('every direct article route renders a sector definition and assessment in all catalogue languages', () => {
  const handlers = new Map();
  registerSeoRoutes({ get: (route, handler) => handlers.set(route, handler) }, { includeHome: false });
  const handler = handlers.get('/makale/:slug');
  assert.equal(typeof handler, 'function');
  const expected = {
    tr: ['Sektör Tanımı', 'Sektör Değerlendirmesi'],
    en: ['Sector Definition', 'Sector Assessment'],
    de: ['Sektorbeschreibung', 'Sektorbewertung'],
    fr: ['Définition du secteur', 'Évaluation sectorielle'],
    es: ['Definición del sector', 'Evaluación sectorial'],
  };
  for (const [lang, labels] of Object.entries(expected)) {
    const post = catalog.posts.find((item) => item.language === lang && item.slug && item.title);
    assert.ok(post, `missing catalogue article for ${lang}`);
    const res = {
      statusCode: 200, body: '',
      set() { return this; }, type() { return this; },
      send(body) { this.body = body; return this; },
      status(code) { this.statusCode = code; return this; },
      redirect(code, url) { this.statusCode = code; this.redirectUrl = url; return this; },
    };
    handler({ params: { slug: post.slug } }, res);
    assert.equal(res.statusCode, 200);
    assert.match(res.body, /class="sector-analysis"/);
    assert.ok(res.body.includes(labels[0]), `missing sector definition in ${lang}`);
    assert.ok(res.body.includes(labels[1]), `missing sector assessment in ${lang}`);
    assert.match(res.body, /sector-kicker/);
    assert.doesNotMatch(res.body, /professional-review|Sektörel ve Profesyonel Tez Değerlendirmesi/);
  }
  // Check coverage, not merely the five language examples above: each of the
  // 289 direct catalogue routes must receive the same sector-analysis section.
  for (const post of catalog.posts) {
    const lang = Object.hasOwn(expected, String(post.language || '').toLowerCase())
      ? String(post.language).toLowerCase() : 'tr';
    const res = {
      statusCode: 200, body: '',
      set() { return this; }, type() { return this; },
      send(body) { this.body = body; return this; },
      status(code) { this.statusCode = code; return this; },
      redirect(code, url) { this.statusCode = code; this.redirectUrl = url; return this; },
    };
    handler({ params: { slug: post.slug } }, res);
    assert.equal(res.statusCode, 200, `route failed: ${post.slug}`);
    assert.match(res.body, /class="sector-analysis"/, `sector panel missing: ${post.slug}`);
    assert.ok(res.body.includes(expected[lang][0]), `sector definition language mismatch: ${post.slug}`);
    assert.ok(res.body.includes(expected[lang][1]), `sector evaluation language mismatch: ${post.slug}`);
  }
});

test('catalog still retains all 289 articles for sector coverage', () => {
  assert.equal(catalog.posts.length, 289);
  assert.ok(catalog.posts.every((post) => post.slug && post.title));
});
