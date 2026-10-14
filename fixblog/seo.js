import path from 'node:path';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SITE_URL = 'https://sci-phil.ai.studio';

function readCatalog() {
  const candidates = [path.join(__dirname, 'catalog.json'), path.join(__dirname, 'public', 'catalog.json')];
  for (const file of candidates) {
    try {
      const data = JSON.parse(readFileSync(file, 'utf8'));
      if (Array.isArray(data.posts)) return data;
    } catch (_) { /* Try the next known catalogue location. */ }
  }
  return { posts: [], updatedAt: null };
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function plainText(value) {
  return String(value ?? '')
    .replace(/<(script|style|noscript|svg|iframe|object|embed)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&').replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'").replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim();
}

function safeArticleHtml(value) {
  let html = String(value ?? '');
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(/<(script|style|iframe|object|embed|form|textarea|select|svg|math|template)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '');
  html = html.replace(/<(script|style|iframe|object|embed|form|input|button|textarea|select|svg|math|template)\b[^>]*\/?\s*>/gi, '');
  html = html.replace(/\s+on[a-z0-9_-]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  html = html.replace(/\s+(srcdoc|formaction)\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  html = html.replace(/(href|src|xlink:href)\s*=\s*(["'])\s*(?:javascript|vbscript|data):.*?\2/gi, '$1="#"');
  return html;
}

function isoDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function articlePath(post) {
  return `/makale/${encodeURIComponent(String(post.slug || `makale-${post.id || ''}`).trim())}`;
}

function xmlEscape(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

function getBaseUrl(_req) {
  // Canonical URLs must not be derived from arbitrary Host/X-Forwarded-* headers.
  return SITE_URL;
}

function renderSitemap(catalog, baseUrl = SITE_URL) {
  const posts = Array.isArray(catalog.posts) ? catalog.posts : [];
  const entries = [{ loc: `${baseUrl}/`, lastmod: isoDate(catalog.updatedAt), priority: '1.0', changefreq: 'daily', title: 'Science & Philosophy | Emre Pelit' }];
  for (const post of posts) {
    if (!post?.slug || !post?.title) continue;
    entries.push({
      loc: `${baseUrl}${articlePath(post)}`,
      lastmod: isoDate(post.updated || post.published || catalog.updatedAt),
      priority: '0.8',
      changefreq: 'weekly',
      title: String(post.title || '').trim()
    });
  }
  entries.push({ loc: `${baseUrl}/analytics.html`, lastmod: isoDate(catalog.updatedAt), priority: '0.7', changefreq: 'daily', title: 'Analytics & Global Benchmarks' });
  const urlEntries = entries.map(({ loc, lastmod, priority, changefreq, title }) => 
    `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n    <changefreq>${changefreq || 'weekly'}</changefreq>\n    <priority>${priority || '0.8'}</priority>\n    <image:image>\n      <image:loc>${baseUrl}/emre-pelit.jpg</image:loc>\n      <image:title>${xmlEscape(title || 'Emre Pelit')}</image:title>\n    </image:image>\n  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n${urlEntries}\n</urlset>\n`;
}

function renderArchiveCards(posts) {
  return posts.slice().sort((a, b) => new Date(b.published || 0) - new Date(a.published || 0)).map(post => {
    const href = escapeHtml(articlePath(post));
    const title = escapeHtml(post.title || 'Başlıksız makale');
    const lang = escapeHtml(post.languageName || post.language || 'Dil belirtilmemiş');
    const category = escapeHtml((post.categories || ['Bilim & Felsefe'])[0]);
    const excerpt = escapeHtml(plainText(post.excerpt || post.claim || post.content).slice(0, 190));
    const reading = escapeHtml(post.readingTime || '3 dk');
    return `<article class="article-card seo-article-card"><div class="card-meta"><span>⏱️ ${reading}</span> · <span class="lang-tag">${lang}</span> · <span style="color:#38bdf8;font-weight:600">${category}</span></div><h3 class="card-title"><a class="seo-article-link" href="${href}" style="color:inherit;text-decoration:none">${title}</a></h3><p class="card-snippet">${excerpt}</p><div class="card-footer"><span style="font-size:.8rem;color:#94a3b8">✍️ Emre Pelit</span><a href="${href}" class="btn-read-label" aria-label="${title} makalesini oku" style="text-decoration:none">Makaleyi oku →</a></div></article>`;
  }).join('\n');
}

// Replace the entire card container, even when index.html contains stale static cards.
function replaceArticleGrid(html, cards) {
  const opening = /<div\b(?=[^>]*\bid=["']article-grid["'])(?=[^>]*\bclass=["'][^"']*\barticles-grid\b[^"']*["'])[^>]*>/i.exec(html);
  if (!opening) return html;
  const tags = /<\/?div\b[^>]*>/gi;
  tags.lastIndex = opening.index;
  let depth = 0;
  let match;
  while ((match = tags.exec(html))) {
    if (/^<\s*\/div/i.test(match[0])) depth--;
    else if (!/\/\s*>$/.test(match[0])) depth++;
    if (depth === 0) {
      return html.slice(0, opening.index + opening[0].length) + cards + html.slice(match.index);
    }
  }
  return html;
}

function renderArticlePage(post, posts, baseUrl = SITE_URL) {
  const lang = /^[a-z]{2}$/i.test(String(post.language || '')) ? String(post.language).toLowerCase() : 'tr';
  const canonical = `${baseUrl}${articlePath(post)}`;
  const originalTitle = String(post.title || 'Science & Philosophy');
  const pageTitle = escapeHtml(`${originalTitle} | Science & Philosophy – Emre Pelit`);
  const description = escapeHtml(plainText(post.excerpt || post.claim || post.content || originalTitle).slice(0, 300));
  const publishedIso = post.published && !Number.isNaN(new Date(post.published).getTime()) ? new Date(post.published).toISOString() : undefined;
  const updatedIso = post.updated && !Number.isNaN(new Date(post.updated).getTime()) ? new Date(post.updated).toISOString() : publishedIso;
  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'Article', headline: originalTitle,
    description: plainText(post.excerpt || post.claim || post.content || originalTitle).slice(0, 300),
    datePublished: publishedIso, dateModified: updatedIso,
    author: { '@type': 'Person', name: 'Emre Pelit', url: `${baseUrl}/` },
    publisher: { '@type': 'Person', name: 'Emre Pelit', url: `${baseUrl}/` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }, image: `${baseUrl}/emre-pelit.jpg`,
    inLanguage: lang, articleSection: Array.isArray(post.categories) ? post.categories : ['Bilim & Felsefe']
  }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
  const content = safeArticleHtml(post.content || `<p>${escapeHtml(post.excerpt || '')}</p>`);
  const epistemology = [
    post.claim ? `<section class="epistemology"><h2>Temel iddia</h2><p>${escapeHtml(post.claim)}</p></section>` : '',
    post.counterClaim ? `<section class="epistemology"><h2>Karşı iddia</h2><p>${escapeHtml(post.counterClaim)}</p></section>` : '',
    post.notProof ? `<section class="epistemology"><h2>Neyin kanıtı değildir?</h2><p>${escapeHtml(post.notProof)}</p></section>` : ''
  ].join('');
  const index = posts.findIndex(item => item.slug === post.slug);
  const prev = index > 0 ? posts[index - 1] : null;
  const next = index >= 0 && index < posts.length - 1 ? posts[index + 1] : null;
  const prevLink = prev ? `<a rel="prev" href="${escapeHtml(articlePath(prev))}">← ${escapeHtml(prev.title)}</a>` : '';
  const nextLink = next ? `<a rel="next" href="${escapeHtml(articlePath(next))}">${escapeHtml(next.title)} →</a>` : '';
  const sourceLink = post.originalUrl && /^https:\/\//i.test(post.originalUrl) ? `<a href="${escapeHtml(post.originalUrl)}" target="_blank" rel="noopener noreferrer">Orijinal Blogger yazısı ↗</a>` : '';
  const articleData = JSON.stringify({
    title: originalTitle, content: String(post.content || ''), language: lang,
    claim: String(post.claim || ''), counterClaim: String(post.counterClaim || ''),
    notProof: String(post.notProof || ''), fromToEvolution: String(post.fromToEvolution || '')
  }).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');

  return `<!doctype html>
<html lang="${lang}"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${pageTitle}</title><meta name="description" content="${description}"><meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">
<link rel="canonical" href="${escapeHtml(canonical)}"><meta name="author" content="Emre Pelit">
<meta property="og:type" content="article"><meta property="og:site_name" content="Science &amp; Philosophy | Emre Pelit"><meta property="og:title" content="${escapeHtml(originalTitle)}"><meta property="og:description" content="${description}"><meta property="og:url" content="${escapeHtml(canonical)}"><meta property="og:image" content="${baseUrl}/emre-pelit.jpg"><meta property="og:locale" content="${lang === 'tr' ? 'tr_TR' : lang}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escapeHtml(originalTitle)}"><meta name="twitter:description" content="${description}">
<script type="application/ld+json">${jsonLd}</script>
<style>
:root{color-scheme:dark;--bg:#0b1120;--panel:#131c31;--line:#263550;--text:#f1f5f9;--muted:#aab8d0;--blue:#38bdf8;--gold:#d4af37}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:17px/1.8 system-ui,-apple-system,"Segoe UI",sans-serif}.wrap{width:min(900px,calc(100% - 32px));margin:auto}.top{padding:20px 0;border-bottom:1px solid var(--line)}.brand{color:var(--gold);font-weight:800;text-decoration:none}.crumbs{color:var(--muted);font-size:.9rem;margin:24px 0}.crumbs a,.nav a{color:var(--blue)}h1{font-size:clamp(2rem,5vw,3.2rem);line-height:1.2;margin:0 0 18px}h2{line-height:1.3}a{overflow-wrap:anywhere}.meta{color:var(--muted);font-size:.94rem;margin:14px 0 26px}.reader-tools{border:1px solid var(--line);background:var(--panel);border-radius:14px;padding:16px;margin:26px 0;display:flex;gap:10px;flex-wrap:wrap;align-items:center}.reader-tools button,.reader-tools select{background:#1b2a44;color:var(--text);border:1px solid #385174;border-radius:8px;padding:10px 12px;font:inherit}.status{flex-basis:100%;color:var(--muted);font-size:.9rem}.epistemology{margin:18px 0;padding:16px;border:1px solid #365070;border-radius:12px;background:#101a2d}.epistemology h2{font-size:1.05rem;margin:0 0 6px;color:var(--gold)}.article-body{overflow-wrap:anywhere}.article-body img,.article-body video{max-width:100%;height:auto}.article-body pre{max-width:100%;overflow:auto;background:#111b2e;padding:12px;border-radius:8px}.article-body table{display:block;max-width:100%;overflow:auto;border-collapse:collapse}.article-body td,.article-body th{padding:6px;border:1px solid var(--line)}.article-body blockquote{border-left:3px solid var(--blue);padding-left:16px;color:var(--muted)}.nav{display:flex;justify-content:space-between;gap:20px;flex-wrap:wrap;padding:30px 0}.nav a{max-width:48%}footer{border-top:1px solid var(--line);padding:24px 0 40px;color:var(--muted);font-size:.9rem}@media(prefers-color-scheme:light){:root{color-scheme:light;--bg:#f8fafc;--panel:#fff;--line:#dce4ef;--text:#0f172a;--muted:#526174}}
</style></head><body>
<header class="top"><div class="wrap"><a class="brand" href="/">Science &amp; Philosophy · Emre Pelit</a></div></header>
<main class="wrap"><nav class="crumbs" aria-label="Ekmek kırıntısı"><a href="/">Ana sayfa</a> / <a href="/#kulliyat">Bilim ve Felsefe Makaleleri</a></nav>
<article><header><h1 id="article-title">${escapeHtml(originalTitle)}</h1><div class="meta">Yazar: Emre Pelit · Dil: ${escapeHtml(post.languageName || lang)} · Yayın: ${escapeHtml(String(post.published || '').slice(0, 10) || 'Tarih belirtilmemiş')} · Okuma süresi: ${escapeHtml(post.readingTime || '3 dk')}</div></header>
${epistemology}<div class="reader-tools" role="group" aria-label="Makale çeviri ve sesli okuma araçları"><label for="translate-language">Dil:</label><select id="translate-language"><option value="tr">Türkçe</option><option value="en">English</option><option value="de">Deutsch</option><option value="fr">Français</option><option value="es">Español</option><option value="pt">Português</option></select><button id="translate-article" type="button">🌐 Dile çevir</button><button id="speak-article" type="button">🔊 Sesli oku</button><button id="pause-article" type="button">⏸ Duraklat / sürdür</button><button id="stop-article" type="button">⏹ Durdur</button><p id="reader-status" class="status" role="status" aria-live="polite">Sesli okuma tarayıcı/işletim sistemi seslerine bağlıdır. Çeviri için sunucuda GEMINI_API_KEY ayarlanmalıdır.</p></div>
<div id="article-body" class="article-body">${content}</div><p>${sourceLink}</p></article>
<nav class="nav" aria-label="Diğer makaleler">${prevLink}${nextLink}</nav><p><a href="/">← Tüm makaleler arşivine dön</a> · <a href="/analytics.html">Salt okunur Analytics paneli</a></p></main><footer><div class="wrap">© 2026 Emre Pelit · Science &amp; Philosophy</div></footer>
<script id="article-data" type="application/json">${articleData}</script><script>
(function(){const data=JSON.parse(document.getElementById('article-data').textContent);const language=document.getElementById('translate-language');const status=document.getElementById('reader-status');const title=document.getElementById('article-title');const body=document.getElementById('article-body');const originalTitle=data.title;const originalContent=data.content;const badTags='script,style,iframe,object,embed,form,textarea,select,svg,math,template';
function safeHTML(value){const doc=new DOMParser().parseFromString(String(value||''),'text/html');doc.querySelectorAll(badTags).forEach(el=>el.remove());doc.querySelectorAll('*').forEach(el=>Array.from(el.attributes).forEach(attr=>{const name=attr.name.toLowerCase(),val=attr.value.trim();if(name.startsWith('on')||name==='srcdoc'||name==='formaction')el.removeAttribute(attr.name);else if(['href','src','xlink:href'].includes(name)&&/^(javascript|vbscript|data):/i.test(val))el.removeAttribute(attr.name);}));return doc.body.innerHTML;}
document.getElementById('translate-article').addEventListener('click',async function(){if(language.value===data.language){status.textContent='Makale zaten bu dilde. Başka bir dil seçebilirsiniz.';return;}this.disabled=true;status.textContent='Çeviri hazırlanıyor…';try{const response=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetLang:language.value,title:originalTitle,content:originalContent,claim:data.claim,counterClaim:data.counterClaim,notProof:data.notProof,fromToEvolution:data.fromToEvolution})});const result=await response.json();if(!response.ok)throw new Error(result.error||'Çeviri hizmeti yanıt vermedi.');title.textContent=result.translation.title;body.innerHTML=safeHTML(result.translation.content);document.documentElement.lang=language.value;status.textContent='Çeviri gösteriliyor. Sayfa yenilenirse orijinal metin geri gelir.';}catch(error){status.textContent=error.message||'Çeviri tamamlanamadı.';}finally{this.disabled=false;}});
document.getElementById('speak-article').addEventListener('click',function(){if(!('speechSynthesis'in window)){status.textContent='Bu tarayıcı sesli okumayı desteklemiyor.';return;}window.speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance((title.textContent+' . '+body.innerText).slice(0,120000));utterance.lang=language.value||data.language||'tr';utterance.onstart=()=>status.textContent='Sesli okuma başladı.';utterance.onend=()=>status.textContent='Sesli okuma tamamlandı.';utterance.onerror=()=>status.textContent='Sesli okuma tamamlanamadı.';window.speechSynthesis.speak(utterance);});
document.getElementById('pause-article').addEventListener('click',function(){if(!('speechSynthesis'in window))return;if(window.speechSynthesis.paused)window.speechSynthesis.resume();else if(window.speechSynthesis.speaking)window.speechSynthesis.pause();});document.getElementById('stop-article').addEventListener('click',function(){if('speechSynthesis'in window)window.speechSynthesis.cancel();status.textContent='Sesli okuma durduruldu.';});})();
</script></body></html>`;
}

export function registerSeoRoutes(app, options = {}) {
  const includeHome = options.includeHome !== false;
  app.get('/robots.txt', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/

User-agent: Googlebot
Allow: /

User-agent: Googlebot-Image
Allow: /

User-agent: Googlebot-Mobile
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Yandex
Allow: /

User-agent: YandexBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: Slurp
Allow: /

Host: ${baseUrl}
Sitemap: ${baseUrl}/sitemap.xml
`;
    res.type('text/plain; charset=utf-8').set('Cache-Control', 'public, max-age=600').send(robotsTxt);
  });

  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = getBaseUrl(req);
    res.set('Cache-Control', 'public, max-age=300').type('application/xml; charset=utf-8').send(renderSitemap(readCatalog(), baseUrl));
  });

  app.get('/makale/:slug', (req, res) => {
    const baseUrl = getBaseUrl(req);
    const catalog = readCatalog();
    const posts = Array.isArray(catalog.posts) ? catalog.posts : [];
    const requestedSlug = String(req.params.slug || '').toLowerCase();
    const post = posts.find(item =>
      String(item.slug || '').toLowerCase() === requestedSlug ||
      String(item.id || '').toLowerCase() === requestedSlug
    );
    if (!post) return res.status(404).type('text/plain; charset=utf-8').send('404 - Makale bulunamadı');
    // Older /makale/<id> links remain useful, but each one points to the canonical slug.
    const canonicalPath = articlePath(post);
    if (req.params.slug !== post.slug) return res.redirect(301, canonicalPath);
    res.set('Cache-Control', 'public, max-age=300').type('html; charset=utf-8').send(renderArticlePage(post, posts, baseUrl));
  });

  if (includeHome) {
    app.get('/', (_req, res) => {
      try {
        const catalog = readCatalog();
        const posts = Array.isArray(catalog.posts) ? catalog.posts.filter(p => p && p.slug && p.title) : [];
        let page = readFileSync(path.join(__dirname, 'index.html'), 'utf8');
        const cards = renderArchiveCards(posts);
        page = replaceArticleGrid(page, cards);
        res.set('Cache-Control', 'public, max-age=300').type('html; charset=utf-8').send(page);
      } catch (err) {
        res.status(500).type('text/plain; charset=utf-8').send('Site ana sayfası hazırlanamadı.');
      }
    });
  }
}
