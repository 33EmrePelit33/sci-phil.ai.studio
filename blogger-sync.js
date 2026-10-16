/**
 * Public Blogger feed reader, Turkish original article filter, cosmic background injector &
 * React-safe simultaneous natural-language translator for Science & Philosophy (sci-phil.ai.studio).
 */

export const BLOGGER_HOME_URL = 'https://emrepelit7337.blogspot.com';
export const BLOGGER_FEED_URL = `${BLOGGER_HOME_URL}/feeds/posts/default`;
export const AUTO_SYNC_INTERVAL_MS = 10 * 60 * 1000;

const TURKISH_COMMON_WORDS = new Set([
  've', 'veya', 'bir', 'bu', 'şu', 'o', 'için', 'ile', 'gibi', 'olan', 'olarak',
  'daha', 'çoktur', 'değil', 'değilse', 'ancak', 'fakat', 'ayrıca', 'her', 'bazı',
  'kadar', 'üzerinden', 'tarafından', 'arasında', 'sonra', 'önce', 'kendi', 'insan',
  'bilim', 'felsefe', 'düşünce', 'bilgi', 'gerçek', 'gerçeklik', 'zaman', 'neden',
  'nasıl', 'nedir', 'olabilir', 'olduğu', 'olduğunu', 'üzerinde', 'sonucunda',
  'madde', 'şuur', 'evren', 'fizik', 'biyoloji', 'varlık', 'anlam', 'durum'
]);

const EN_COMMON_WORDS = new Set([
  'the', 'and', 'of', 'to', 'in', 'is', 'that', 'for', 'with', 'as', 'on', 'this',
  'by', 'from', 'are', 'be', 'it', 'an', 'or', 'which', 'was', 'were', 'has',
  'have', 'not', 'but', 'can', 'will', 'about', 'they'
]);

const DE_COMMON_WORDS = new Set([
  'der', 'die', 'das', 'und', 'ist', 'ein', 'eine', 'von', 'mit', 'auf', 'für',
  'nicht', 'sich', 'dem', 'den', 'des', 'im', 'zu', 'als', 'auch', 'oder', 'nach',
  'bei', 'aus', 'wird', 'sind', 'war'
]);

const FR_COMMON_WORDS = new Set([
  'le', 'la', 'les', 'des', 'une', 'est', 'dans', 'pour', 'que', 'qui', 'avec',
  'sur', 'nous', 'cette', 'sont', 'aux', 'par', 'plus', 'comme', 'tout', 'du',
  'au', 'pas', 'mais', 'son', 'ses', 'leur'
]);

const ES_COMMON_WORDS = new Set([
  'el', 'los', 'las', 'que', 'en', 'un', 'una', 'por', 'con', 'para', 'del', 'es',
  'se', 'su', 'sus', 'como', 'más', 'pero', 'este', 'esta', 'esto', 'hay', 'son', 'y'
]);

const syncStateCache = {
  etag: null,
  lastModified: null,
  lastSyncTime: null,
  postsById: new Map(),
  allPostsSorted: []
};

const translationMemoryCache = new Map();

export function decodeEntities(str) {
  if (!str) return '';
  return String(str)
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

export function cleanAndFilterHtml(htmlContent) {
  if (!htmlContent) return '';
  const cleaned = String(htmlContent)
    .replace(/style="[^"]*"/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<font\b[^>]*>(.*?)<\/font>/gi, '$1');
  return cleaned.trim();
}

export function htmlToPlainText(value) {
  if (!value) return '';
  return decodeEntities(
    String(value)
      .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
      .replace(/<(script|style|noscript|svg|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, ' ')
      .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|blockquote|tr)>/gi, ' ')
      .replace(/<[^>]*>/g, ' ')
  )
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function slugifyTurkish(title) {
  return String(title ?? '')
    .toLocaleLowerCase('tr-TR')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/i̇/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ş/g, 's')
    .replace(/ü/g, 'u')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 90) || 'blogger-turkce-makale';
}

export function normalizeBloggerUrl(url) {
  if (!url) return '';
  try {
    const u = new URL(url);
    u.hash = '';
    u.search = '';
    return u.toString().replace(/\/$/, '').toLowerCase();
  } catch {
    return String(url || '').split('?')[0].split('#')[0].replace(/\/$/, '').toLowerCase();
  }
}

export function isTurkishContent(title, content) {
  const fullText = `${title || ''} ${htmlToPlainText(content || '')}`.toLocaleLowerCase('tr-TR');
  const words = fullText.match(/[\p{L}\p{N}]+/gu) || [];
  if (words.length < 3) return true;

  let trScore = 0;
  let foreignScore = 0;
  for (const word of words) {
    if (TURKISH_COMMON_WORDS.has(word)) trScore++;
    if (
      EN_COMMON_WORDS.has(word) ||
      DE_COMMON_WORDS.has(word) ||
      FR_COMMON_WORDS.has(word) ||
      ES_COMMON_WORDS.has(word)
    ) {
      foreignScore++;
    }
  }
  const hasTrChars = /[çğıöşü]/.test(fullText);
  if (trScore >= 2 && trScore >= foreignScore) return true;
  if (hasTrChars && foreignScore <= 2) return true;
  return false;
}

export function isTurkishPost(post) {
  if (!post) return false;
  const labels = Array.isArray(post.labels) ? post.labels : [];
  if (labels.some(l => /^(english|ingilizce|en|deutsch|almanca|de|french|français|fransızca|fr|spanish|español|ispanyolca|es)$/i.test(String(l).trim()))) {
    return false;
  }
  if (post.declaredLanguage && !/^tr/i.test(post.declaredLanguage)) {
    return false;
  }
  if (labels.some(l => /^(türkçe|turkce|tr)$/i.test(String(l).trim()))) {
    return true;
  }
  if (post.declaredLanguage && /^tr/i.test(post.declaredLanguage)) {
    return true;
  }

  return isTurkishContent(post.title || '', post.contentHtml || post.summaryHtml || post.content || '');
}

function parseEntryId(rawId) {
  if (!rawId) return '';
  const postMatch = String(rawId).match(/post-(\d+)/);
  if (postMatch) return postMatch[1];
  const numMatch = String(rawId).match(/(\d+)$/);
  if (numMatch) return numMatch[1];
  return String(rawId).replace(/^tag:.*:/, '');
}

export function parseBloggerFeedPayload(payload) {
  if (typeof payload === 'string') {
    const trimmed = payload.trim();
    if (trimmed.startsWith('<')) {
      return parseAtomXmlFeed(trimmed);
    }
    try {
      payload = JSON.parse(trimmed);
    } catch {
      return [];
    }
  }

  const entries = payload?.feed?.entry;
  if (!Array.isArray(entries)) return [];

  return entries.map(entry => {
    const links = Array.isArray(entry?.link) ? entry.link : (entry?.link ? [entry.link] : []);
    const altLink = links.find(l => l?.rel === 'alternate')?.href || links[0]?.href || '';
    const rawId = entry?.id?.$t || entry?.id || '';
    const id = parseEntryId(rawId);
    const title = entry?.title?.$t || '';
    const rawContent = entry?.content?.$t || '';
    const rawSummary = entry?.summary?.$t || '';
    const hasFullContent = Boolean(rawContent && rawContent.length > 0);
    const contentHtml = cleanAndFilterHtml(rawContent || rawSummary);
    const summaryHtml = cleanAndFilterHtml(rawSummary);
    const categories = Array.isArray(entry?.category) ? entry.category : (entry?.category ? [entry.category] : []);
    const labels = categories.map(c => c?.term || c?.['@term']).filter(Boolean);
    const authors = Array.isArray(entry?.author) ? entry.author : (entry?.author ? [entry.author] : []);
    const author = authors[0]?.name?.$t || 'Emre Pelit';

    return {
      id,
      title,
      rawContent,
      contentHtml,
      summaryHtml,
      hasFullContent,
      url: altLink,
      publishedAt: entry?.published?.$t || new Date().toISOString(),
      updatedAt: entry?.updated?.$t || entry?.published?.$t || new Date().toISOString(),
      author,
      labels,
      declaredLanguage: entry?.['xml:lang'] || ''
    };
  });
}

function parseAtomXmlFeed(xml) {
  const entries = [];
  const entryMatches = xml.match(/<entry[\s\S]*?<\/entry>/gi) || [];

  for (const entryXml of entryMatches) {
    const idMatch = entryXml.match(/<id[^>]*>([\s\S]*?)<\/id>/i);
    const rawId = idMatch ? idMatch[1].trim() : '';
    const id = parseEntryId(rawId);

    const titleMatch = entryXml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    const title = titleMatch ? decodeEntities(titleMatch[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, '$1').trim()) : '';

    const altLinkMatch = entryXml.match(/<link\b[^>]*?rel="alternate"[^>]*?href="([^"]+)"/i)
      || entryXml.match(/<link\b[^>]*?href="([^"]+)"[^>]*?rel="alternate"/i)
      || entryXml.match(/<link\b[^>]*?href="([^"]+)"/i);
    const url = altLinkMatch ? altLinkMatch[1] : '';

    const contentMatch = entryXml.match(/<content[^>]*>([\s\S]*?)<\/content>/i);
    const rawContent = contentMatch ? decodeEntities(contentMatch[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, '$1').trim()) : '';
    const hasFullContent = Boolean(rawContent && rawContent.length > 0);

    const summaryMatch = entryXml.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
    const rawSummary = summaryMatch ? decodeEntities(summaryMatch[1].replace(/^<!\[CDATA\[([\s\S]*?)\]\]>$/i, '$1').trim()) : '';

    const pubMatch = entryXml.match(/<published[^>]*>([\s\S]*?)<\/published>/i);
    const publishedAt = pubMatch ? pubMatch[1].trim() : new Date().toISOString();

    const updMatch = entryXml.match(/<updated[^>]*>([\s\S]*?)<\/updated>/i);
    const updatedAt = updMatch ? updMatch[1].trim() : publishedAt;

    const authMatch = entryXml.match(/<author>[\s\S]*?<name[^>]*>([\s\S]*?)<\/name>[\s\S]*?<\/author>/i);
    const author = authMatch ? decodeEntities(authMatch[1].trim()) : 'Emre Pelit';

    const labels = [];
    const catMatches = entryXml.match(/<category\b[^>]*?term="([^"]+)"/gi) || [];
    for (const cat of catMatches) {
      const termMatch = cat.match(/term="([^"]+)"/i);
      if (termMatch) labels.push(decodeEntities(termMatch[1]));
    }

    entries.push({
      id,
      title,
      rawContent,
      contentHtml: cleanAndFilterHtml(rawContent || rawSummary),
      summaryHtml: cleanAndFilterHtml(rawSummary),
      hasFullContent,
      url,
      publishedAt,
      updatedAt,
      author,
      labels,
      declaredLanguage: ''
    });
  }

  return entries;
}

export function createArticleFromBloggerPost(post, options = {}) {
  const { existing, reservedSlugs = new Set() } = options;
  const id = String(post.id || '');
  let slug = existing?.slug;

  if (!slug) {
    const baseSlug = slugifyTurkish(post.title);
    slug = id ? `${baseSlug}-${id}` : baseSlug;
    if (reservedSlugs.has(slug)) {
      let suffix = 2;
      while (reservedSlugs.has(`${slug}-${suffix}`)) suffix++;
      slug = `${slug}-${suffix}`;
    }
  }

  const content = post.contentHtml || post.summaryHtml || '';
  const plain = htmlToPlainText(content);
  const words = (plain.match(/[\p{L}\p{N}]+/gu) || []).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    id: id || existing?.id || String(Date.now()),
    title: post.title || 'Başlıksız Makale',
    slug,
    publishedAt: post.publishedAt || existing?.publishedAt || new Date().toISOString(),
    updatedAt: post.updatedAt || existing?.updatedAt || post.publishedAt || new Date().toISOString(),
    language: 'tr',
    languageName: 'Türkçe',
    author: post.author || existing?.author || 'Emre Pelit',
    categories: post.labels?.length ? post.labels : (existing?.categories?.length ? existing.categories : ['Blogger Türkçe Makaleleri']),
    url: post.url || existing?.url || '',
    originalUrl: post.url || existing?.originalUrl || existing?.url || '',
    content: content || existing?.content || '',
    summary: post.summaryHtml ? htmlToPlainText(post.summaryHtml) : (existing?.summary || plain.slice(0, 280)),
    wordCount: words,
    readingTimeMinutes,
    readingTime: `${readingTimeMinutes} dk`,
    dialecticalTriad: existing?.dialecticalTriad || {
      claim: post.title || '',
      counterClaim: '',
      whatIsNotEvidence: 'Bir iddia veya yorum tek başına bağımsız kanıt değildir; dayanakları ayrıca incelenmelidir.',
      methodologicalNote: ''
    }
  };
}

export async function fetchAllBloggerPosts(options = {}) {
  const PAGE_SIZE = 150;
  const { forceFull = false, updatedMin = syncStateCache.lastSyncTime, timeoutMs = 10000 } = options;

  try {
    if (!forceFull && updatedMin && syncStateCache.postsById.size > 0) {
      const deltaUrl = `${BLOGGER_FEED_URL}?alt=json&updated-min=${encodeURIComponent(updatedMin)}&max-results=${PAGE_SIZE}`;
      const deltaRes = await fetch(deltaUrl, {
        headers: { Accept: 'application/json, application/atom+xml, */*' },
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (deltaRes.ok) {
        const deltaData = await deltaRes.json();
        const deltaPosts = parseBloggerFeedPayload(deltaData);
        for (const post of deltaPosts) {
          if (post.id && isTurkishPost(post)) syncStateCache.postsById.set(post.id, post);
        }
        syncStateCache.lastSyncTime = new Date().toISOString();
        syncStateCache.allPostsSorted = Array.from(syncStateCache.postsById.values()).sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        return syncStateCache.allPostsSorted;
      }
    }

    const firstUrl = `${BLOGGER_FEED_URL}?alt=json&start-index=1&max-results=${PAGE_SIZE}`;
    const firstRes = await fetch(firstUrl, {
      headers: { Accept: 'application/json, application/atom+xml, */*' },
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (!firstRes.ok) {
      return syncStateCache.allPostsSorted;
    }

    const firstData = await firstRes.json();
    const firstBatch = parseBloggerFeedPayload(firstData);
    const totalResults = Number(firstData?.feed?.openSearch$totalResults?.$t || firstBatch.length);

    let allPosts = [...firstBatch];

    if (totalResults > firstBatch.length && firstBatch.length === PAGE_SIZE) {
      const pagePromises = [];
      const maxTotal = Math.min(totalResults, PAGE_SIZE * 10);

      for (let startIndex = PAGE_SIZE + 1; startIndex <= maxTotal; startIndex += PAGE_SIZE) {
        const pageUrl = `${BLOGGER_FEED_URL}?alt=json&start-index=${startIndex}&max-results=${PAGE_SIZE}`;
        pagePromises.push(
          fetch(pageUrl, {
            headers: { Accept: 'application/json, application/atom+xml, */*' },
            signal: AbortSignal.timeout(timeoutMs)
          })
            .then(r => (r.ok ? r.json() : null))
            .then(d => (d ? parseBloggerFeedPayload(d) : []))
            .catch(() => [])
        );
      }

      const remainingBatches = await Promise.all(pagePromises);
      for (const batch of remainingBatches) {
        if (batch.length) allPosts = allPosts.concat(batch);
      }
    }

    const turkishOnly = allPosts.filter(isTurkishPost);
    for (const post of turkishOnly) {
      if (post.id) syncStateCache.postsById.set(post.id, post);
    }
    syncStateCache.lastSyncTime = new Date().toISOString();
    syncStateCache.allPostsSorted = Array.from(syncStateCache.postsById.values()).sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    return syncStateCache.allPostsSorted;
  } catch (err) {
    console.error('[Blogger sync] Error fetching Blogger posts:', err);
    return syncStateCache.allPostsSorted;
  }
}

export async function triggerManualBloggerSync() {
  try {
    const res = await fetch('/api/sync-blog', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sciphil:blog-synced', { detail: data }));
      }
      return { success: true, ...data };
    }
    const freshPosts = await fetchAllBloggerPosts({ forceFull: true });
    return { success: true, count: freshPosts.length };
  } catch (err) {
    return { success: false, error: err };
  }
}

function hashText(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function maskFormulasAndCode(html) {
  const tokens = [];
  const masked = String(html || '').replace(
    /(<span\b[^>]*class="[^"]*katex[^"]*"[\s\S]*?<\/span>|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|<code\b[\s\S]*?<\/code>|<pre\b[\s\S]*?<\/pre>)/gi,
    (match) => {
      const idx = tokens.length;
      tokens.push(match);
      return `__MATH_TOKEN_${idx}__`;
    }
  );
  return { masked, tokens };
}

export function unmaskFormulasAndCode(text, tokens) {
  if (!tokens || !tokens.length) return text;
  return String(text || '').replace(/__\s*MATH_TOKEN_(\d+)\s*__/g, (_, idx) => tokens[Number(idx)] ?? '');
}

export async function translateNaturalText(text, targetLang, sourceLang = 'tr') {
  if (!text || !String(text).trim() || !targetLang) return text;
  const cleanTarget = String(targetLang).toLowerCase().slice(0, 2);
  if (cleanTarget === 'tr' && sourceLang === 'tr') return text;

  const cacheKey = `tr2_${cleanTarget}_${hashText(text)}`;

  if (translationMemoryCache.has(cacheKey)) {
    return translationMemoryCache.get(cacheKey);
  }

  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(cacheKey);
      if (stored) {
        translationMemoryCache.set(cacheKey, stored);
        return stored;
      }
    } catch {}
  }

  const { masked, tokens } = maskFormulasAndCode(text);

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${cleanTarget}&dt=t&q=${encodeURIComponent(masked)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return text;

    const data = await res.json();
    const rawTranslated = Array.isArray(data?.[0])
      ? data[0].map(part => part?.[0] || '').join('')
      : masked;

    const finalResult = unmaskFormulasAndCode(rawTranslated, tokens);
    translationMemoryCache.set(cacheKey, finalResult);

    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(cacheKey, finalResult);
      } catch {}
    }
    return finalResult;
  } catch {
    return text;
  }
}

export async function translateArticleSimultaneously(article, targetLang) {
  if (!article || !targetLang) return article;
  const cleanTarget = String(targetLang).toLowerCase().slice(0, 2);
  if (cleanTarget === 'tr') return article;

  const [
    title,
    excerpt,
    summary,
    content,
    claim,
    counterClaim,
    notProof,
    translatedCats
  ] = await Promise.all([
    translateNaturalText(article.title || '', cleanTarget, 'tr'),
    translateNaturalText(article.excerpt || article.summary || '', cleanTarget, 'tr'),
    translateNaturalText(article.summary || article.excerpt || '', cleanTarget, 'tr'),
    translateNaturalText(article.content || '', cleanTarget, 'tr'),
    translateNaturalText(article.claim || article.dialecticalTriad?.claim || article.title || '', cleanTarget, 'tr'),
    translateNaturalText(article.counterClaim || article.dialecticalTriad?.counterClaim || '', cleanTarget, 'tr'),
    translateNaturalText(article.notProof || article.dialecticalTriad?.whatIsNotEvidence || '', cleanTarget, 'tr'),
    Promise.all((article.categories || ['Bilim & Felsefe']).map((c) => translateNaturalText(c, cleanTarget, 'tr')))
  ]);

  return {
    ...article,
    title,
    excerpt,
    summary,
    content,
    claim,
    counterClaim,
    notProof,
    categories: translatedCats,
    translatedTo: cleanTarget,
    dialecticalTriad: {
      ...(article.dialecticalTriad || {}),
      claim,
      counterClaim,
      whatIsNotEvidence: notProof
    }
  };
}

export async function switchEntireSiteLanguage(targetLang) {
  if (typeof document === 'undefined') return;
  const cleanTarget = String(targetLang || 'tr').toLowerCase().slice(0, 2);
  document.documentElement.lang = cleanTarget;

  try {
    localStorage.setItem('sciphil_lang', cleanTarget);
  } catch {}

  window.dispatchEvent(new CustomEvent('sciphil:language-change', { detail: { lang: cleanTarget } }));

  const staticNodes = Array.from(
    document.querySelectorAll('[data-translatable="true"]')
  ).filter(el => !el.closest('#root'));

  await Promise.all(
    staticNodes.map(async (el) => {
      if (!el.dataset.origHtml) {
        el.dataset.origHtml = el.innerHTML;
      }
      if (cleanTarget === 'tr') {
        el.innerHTML = el.dataset.origHtml;
      } else {
        const tr = await translateNaturalText(el.dataset.origHtml, cleanTarget, 'tr');
        if (tr) el.innerHTML = tr;
      }
    })
  );
}

export function injectCosmicPhilosophyBackground() {
  if (typeof document === 'undefined' || document.getElementById('sciphil-cosmic-bg-style')) return;

  const style = document.createElement('style');
  style.id = 'sciphil-cosmic-bg-style';
  style.textContent = `
    :root {
      --sciphil-cosmic-dark: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1440' height='900' viewBox='0 0 1440 900'%3E%3Cdefs%3E%3CradialGradient id='n1' cx='18%25' cy='22%25' r='55%25'%3E%3Cstop offset='0%25' stop-color='%230284c7' stop-opacity='0.20'/%3E%3Cstop offset='50%25' stop-color='%234f46e5' stop-opacity='0.09'/%3E%3Cstop offset='100%25' stop-color='%23020617' stop-opacity='0'/%3E%3C/radialGradient%3E%3CradialGradient id='n2' cx='84%25' cy='74%25' r='50%25'%3E%3Cstop offset='0%25' stop-color='%237c3aed' stop-opacity='0.18'/%3E%3Cstop offset='55%25' stop-color='%230ea5e9' stop-opacity='0.07'/%3E%3Cstop offset='100%25' stop-color='%23020617' stop-opacity='0'/%3E%3C/radialGradient%3E%3Cpattern id='grid' width='96' height='96' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 96 0 L 0 0 0 96' fill='none' stroke='%2338bdf8' stroke-width='0.4' stroke-opacity='0.12'/%3E%3Ccircle cx='48' cy='48' r='1.1' fill='%237dd3fc' fill-opacity='0.28'/%3E%3Ccircle cx='16' cy='80' r='0.7' fill='%23c4b5fd' fill-opacity='0.22'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='1440' height='900' fill='%23020617'/%3E%3Crect width='1440' height='900' fill='url(%23n1)'/%3E%3Crect width='1440' height='900' fill='url(%23n2)'/%3E%3Crect width='1440' height='900' fill='url(%23grid)'/%3E%3Cg stroke='%2338bdf8' stroke-opacity='0.11' fill='none'%3E%3Cellipse cx='720' cy='450' rx='540' ry='195' transform='rotate(-14 720 450)'/%3E%3Cellipse cx='720' cy='450' rx='370' ry='130' transform='rotate(20 720 450)'/%3E%3C/g%3E%3C/svg%3E");
      --sciphil-cosmic-light: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1440' height='900' viewBox='0 0 1440 900'%3E%3Cdefs%3E%3CradialGradient id='ln1' cx='20%25' cy='20%25' r='55%25'%3E%3Cstop offset='0%25' stop-color='%230284c7' stop-opacity='0.10'/%3E%3Cstop offset='100%25' stop-color='%23f8fafc' stop-opacity='0'/%3E%3C/radialGradient%3E%3Cpattern id='lgrid' width='96' height='96' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 96 0 L 0 0 0 96' fill='none' stroke='%230284c7' stroke-width='0.45' stroke-opacity='0.10'/%3E%3Ccircle cx='48' cy='48' r='1.1' fill='%230284c7' fill-opacity='0.20'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='1440' height='900' fill='%23f8fafc'/%3E%3Crect width='1440' height='900' fill='url(%23ln1)'/%3E%3Crect width='1440' height='900' fill='url(%23lgrid)'/%3E%3C/svg%3E");
    }

    body {
      background-image: var(--sciphil-cosmic-dark) !important;
      background-size: cover !important;
      background-position: center center !important;
      background-attachment: fixed !important;
    }

    body.light-theme {
      background-image: var(--sciphil-cosmic-light) !important;
    }
  `;
  document.head.appendChild(style);
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.SciPhilLanguageSync = {
    switchEntireSiteLanguage,
    translateArticleSimultaneously,
    translateNaturalText,
    fetchAllBloggerPosts,
    triggerManualBloggerSync,
    injectCosmicPhilosophyBackground
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCosmicPhilosophyBackground);
  } else {
    injectCosmicPhilosophyBackground();
  }

  setInterval(() => {
    triggerManualBloggerSync();
  }, AUTO_SYNC_INTERVAL_MS);
}