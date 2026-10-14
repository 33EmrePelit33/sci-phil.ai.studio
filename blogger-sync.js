/**
 * Public Blogger feed reader & synchronizer for Science & Philosophy
 * Preserves KaTeX math formula expressions, provides Turkish language filtering,
 * and maintains continuous synchronization between Blogger and sci-phil.
 */

export const BLOGGER_HOME_URL = 'https://emrepelit7337.blogspot.com';
export const BLOGGER_FEED_URL = `${BLOGGER_HOME_URL}/feeds/posts/default`;

const TURKISH_COMMON_WORDS = new Set([
  've', 'veya', 'bir', 'bu', 'şu', 'o', 'için', 'ile', 'gibi', 'olan', 'olarak', 
  'daha', 'çoktur', 'değil', 'değilse', 'ancak', 'fakat', 'ayrıca', 'her', 'bazı',
  'kadar', 'üzerinden', 'tarafından', 'arasında', 'sonra', 'önce', 'kendi', 'insan', 
  'bilim', 'felsefe', 'düşünce', 'bilgi', 'gerçek', 'gerçeklik', 'zaman', 'neden', 
  'nasıl', 'nedir', 'olabilir', 'olduğu', 'olduğunu', 'üzerinde', 'sonucunda',
  'madde', 'şuur', 'evren', 'fizik', 'biyoloji', 'varlık', 'anlam', 'durum'
]);

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
  let cleaned = String(htmlContent)
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
  const fullText = `${title || ''} ${content || ''}`.toLocaleLowerCase('tr-TR');
  const words = fullText.match(/[\p{L}\p{N}]+/gu) || [];
  if (words.length < 5) return false;

  let matches = 0;
  for (const word of words) {
    if (TURKISH_COMMON_WORDS.has(word)) matches++;
  }
  return matches >= 2;
}

const EN_COMMON_WORDS = new Set(['the', 'and', 'of', 'to', 'in', 'is', 'that', 'for', 'with', 'as', 'on', 'this', 'by', 'from', 'are', 'be', 'it', 'an', 'or', 'which', 'was', 'were', 'has', 'have', 'not', 'but', 'can', 'will', 'about', 'they']);
const DE_COMMON_WORDS = new Set(['der', 'die', 'das', 'und', 'ist', 'ein', 'eine', 'von', 'mit', 'auf', 'für', 'nicht', 'sich', 'dem', 'den', 'des', 'im', 'zu', 'als', 'auch', 'oder', 'nach', 'bei', 'aus', 'wird', 'sind', 'war']);
const FR_COMMON_WORDS = new Set(['le', 'la', 'les', 'des', 'une', 'est', 'dans', 'pour', 'que', 'qui', 'avec', 'sur', 'nous', 'cette', 'sont', 'aux', 'par', 'plus', 'comme', 'tout', 'du', 'au', 'pas', 'mais', 'son', 'ses', 'leur']);
const ES_COMMON_WORDS = new Set(['el', 'los', 'las', 'que', 'en', 'un', 'una', 'por', 'con', 'para', 'del', 'es', 'se', 'su', 'sus', 'como', 'más', 'pero', 'este', 'esta', 'esto', 'hay', 'son', 'y']);

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

  const text = `${post.title || ''} ${htmlToPlainText(post.contentHtml || post.summaryHtml || '')}`.toLocaleLowerCase('tr-TR');
  const words = text.match(/[a-zà-ÿğüşöçıîâû]{2,}/gi) || [];
  let trScore = 0;
  let enScore = 0;
  let deScore = 0;
  let frScore = 0;
  let esScore = 0;
  for (const w of words) {
    if (TURKISH_COMMON_WORDS.has(w)) trScore++;
    if (EN_COMMON_WORDS.has(w)) enScore++;
    if (DE_COMMON_WORDS.has(w)) deScore++;
    if (FR_COMMON_WORDS.has(w)) frScore++;
    if (ES_COMMON_WORDS.has(w)) esScore++;
  }
  const maxForeign = Math.max(enScore, deScore, frScore, esScore);
  const hasTrUniqueChars = /[ğışçĞŞÇıİ]/.test(text);

  if (trScore >= 2 && trScore > maxForeign) return true;
  if (hasTrUniqueChars && maxForeign === 0) return true;
  if (hasTrUniqueChars && trScore >= maxForeign && trScore > 0) return true;
  return false;
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

export async function fetchAllBloggerPosts() {
  const PAGE_SIZE = 150;
  let allPosts = [];
  let startIndex = 1;
  const maxIterations = 10;
  let iteration = 0;

  try {
    while (iteration < maxIterations) {
      iteration++;
      const url = `${BLOGGER_HOME_URL}/feeds/posts/default?alt=json&start-index=${startIndex}&max-results=${PAGE_SIZE}`;
      const res = await fetch(url, {
        headers: { Accept: 'application/json, application/atom+xml, */*' },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        console.warn(`[Blogger sync] HTTP ${res.status} when fetching feed at start-index ${startIndex}.`);
        break;
      }
      const data = await res.json();
      const parsed = parseBloggerFeedPayload(data);
      if (!parsed.length) break;

      allPosts = allPosts.concat(parsed);
      startIndex += parsed.length;

      const totalResults = Number(data?.feed?.openSearch$totalResults?.$t || 0);
      if (totalResults > 0 && allPosts.length >= totalResults) {
        break;
      }
      if (parsed.length < PAGE_SIZE) {
        break;
      }
    }
    return allPosts;
  } catch (err) {
    console.error('[Blogger sync] Error fetching Blogger posts with pagination:', err);
    // If pagination error occurs but some posts were fetched, return them
    return allPosts;
  }
}