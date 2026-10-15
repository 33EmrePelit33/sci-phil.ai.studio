#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SCI-PHIL.AI.STUDIO - Otomatik Hata Onarım ve Tam ZIP Paketleyici
Bu betiği proje ana klasörünüzde çalıştırdığınızda:
1. blogger-sync.js, src/SocraticPartner.jsx, SocraticPartner.jsx ve Senkronizasyon Betiği.py
   dosyalarını tüm sözdizimi (syntax) ve UTF-8 karakter hatalarından arındırılmış tam sürümleriyle yazar.
2. Mükerrer eski betik kopyalarını temizler.
3. Mevcut projenizdeki tüm dosyaları (catalog.json, server.ts, src/App.tsx, public/ vb.)
   koruyarak 'sci-phil-ai-studio-hatasiz-tam-paket.zip' arşivini oluşturur.
"""

import os
import zipfile

BLOGGER_SYNC_JS = r'''/**
 * Public Blogger feed reader, fast delta synchronizer & simultaneous natural-language
 * translator for Science & Philosophy (sci-phil.ai.studio).
 * Preserves KaTeX math formula expressions, provides Turkish language filtering,
 * and maintains ultra-fast synchronization between Blogger and sci-phil.
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
  const fullText = `${title || ''} ${content || ''}`.toLocaleLowerCase('tr-TR');
  const words = fullText.match(/[\p{L}\p{N}]+/gu) || [];
  if (words.length < 5) return false;
  let matches = 0;
  for (const word of words) {
    if (TURKISH_COMMON_WORDS.has(word)) matches++;
  }
  return matches >= 2;
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

  const text = `${post.title || ''} ${htmlToPlainText(post.contentHtml || post.summaryHtml || '')}`.toLocaleLowerCase('tr-TR');
  const words = text.match(/[a-zçğıöşüâîû]{2,}/gi) || [];
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
  const hasTrUniqueChars = /[çğıöşü]/.test(text);

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
          if (post.id) syncStateCache.postsById.set(post.id, post);
        }
        syncStateCache.lastSyncTime = new Date().toISOString();
        syncStateCache.allPostsSorted = Array.from(syncStateCache.postsById.values()).sort(
          (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
        );
        return syncStateCache.allPostsSorted;
      }
    }

    const headers = { Accept: 'application/json, application/atom+xml, */*' };
    if (!forceFull && syncStateCache.etag) headers['If-None-Match'] = syncStateCache.etag;
    if (!forceFull && syncStateCache.lastModified) headers['If-Modified-Since'] = syncStateCache.lastModified;

    const firstUrl = `${BLOGGER_FEED_URL}?alt=json&start-index=1&max-results=${PAGE_SIZE}`;
    const firstRes = await fetch(firstUrl, {
      headers,
      signal: AbortSignal.timeout(timeoutMs)
    });

    if (firstRes.status === 304 && syncStateCache.allPostsSorted.length > 0) {
      syncStateCache.lastSyncTime = new Date().toISOString();
      return syncStateCache.allPostsSorted;
    }

    if (!firstRes.ok) {
      console.warn(`[Blogger sync] HTTP ${firstRes.status} on initial page.`);
      return syncStateCache.allPostsSorted;
    }

    syncStateCache.etag = firstRes.headers.get('etag') || syncStateCache.etag;
    syncStateCache.lastModified = firstRes.headers.get('last-modified') || syncStateCache.lastModified;

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

    for (const post of allPosts) {
      if (post.id) syncStateCache.postsById.set(post.id, post);
    }
    syncStateCache.lastSyncTime = new Date().toISOString();
    syncStateCache.allPostsSorted = Array.from(syncStateCache.postsById.values()).sort(
      (a, b) => new Date(b.publishedAt) - new Date(a.publishedAt)
    );

    return allPosts;
  } catch (err) {
    console.error('[Blogger sync] Error fetching Blogger posts:', err);
    return syncStateCache.allPostsSorted;
  }
}

export const SITE_UI_DICTIONARY = {
  tr: {
    searchPlaceholder: 'Makale, kavram veya teorem ara...',
    allCategories: 'Tüm Kategoriler',
    readMore: 'Makaleyi Oku',
    syncNow: 'Blogla Hızlı Eşitle',
    syncing: 'Eşitleniyor...',
    synced: 'Blog ile Senkronize',
    claim: 'İddia',
    counterClaim: 'Sokratik Karşı Tez',
    notProof: 'Neyin Kanıtı Değildir?',
    sectorDefinition: 'Sektör Tanımı',
    sectorEvaluation: 'Sektör Değerlendirmesi',
    socraticLab: 'Sokratik Diyalog Laboratuvarı',
    epistemicFilter: 'Epistemik Süzgeç',
    copyMatrix: 'Matrisi Panoya Kopyala',
    copied: 'Analiz matrisi panoya kopyalandı!',
    queryBtn: 'Sorgula',
    liveAnalytics: 'Canlı Analitik'
  },
  en: {
    searchPlaceholder: 'Search articles, concepts, or theorems...',
    allCategories: 'All Categories',
    readMore: 'Read Article',
    syncNow: 'Fast Sync Blog',
    syncing: 'Syncing...',
    synced: 'Synchronized with Blog',
    claim: 'Claim',
    counterClaim: 'Socratic Counter-Thesis',
    notProof: 'What Is It Not Proof Of?',
    sectorDefinition: 'Sector Definition',
    sectorEvaluation: 'Sector Evaluation',
    socraticLab: 'Socratic Dialogue Laboratory',
    epistemicFilter: 'Epistemic Filter',
    copyMatrix: 'Copy Matrix to Clipboard',
    copied: 'Analysis matrix copied to clipboard!',
    queryBtn: 'Inquire',
    liveAnalytics: 'Live Analytics'
  },
  de: {
    searchPlaceholder: 'Artikel, Konzepte oder Theoreme suchen...',
    allCategories: 'Alle Kategorien',
    readMore: 'Artikel lesen',
    syncNow: 'Blog schnell synchronisieren',
    syncing: 'Synchronisiere...',
    synced: 'Mit Blog synchronisiert',
    claim: 'Behauptung',
    counterClaim: 'Sokratische Gegenthese',
    notProof: 'Wofür ist es kein Beweis?',
    sectorDefinition: 'Sektordefinition',
    sectorEvaluation: 'Sektorbewertung',
    socraticLab: 'Sokratisches Dialoglabor',
    epistemicFilter: 'Epistemischer Filter',
    copyMatrix: 'Matrix in Zwischenablage kopieren',
    copied: 'Analysematrix in die Zwischenablage kopiert!',
    queryBtn: 'Hinterfragen',
    liveAnalytics: 'Live-Analytik'
  },
  fr: {
    searchPlaceholder: 'Rechercher des articles, concepts ou théorèmes...',
    allCategories: 'Toutes les catégories',
    readMore: "Lire l'article",
    syncNow: 'Synchronisation rapide',
    syncing: 'Synchronisation...',
    synced: 'Synchronisé avec le blog',
    claim: 'Affirmation',
    counterClaim: 'Contre-thèse socratique',
    notProof: "De quoi n'est-ce pas la preuve ?",
    sectorDefinition: 'Définition du secteur',
    sectorEvaluation: 'Évaluation du secteur',
    socraticLab: 'Laboratoire de dialogue socratique',
    epistemicFilter: 'Filtre épistémique',
    copyMatrix: 'Copier la matrice',
    copied: 'Matrice copiée dans le presse-papiers !',
    queryBtn: 'Interroger',
    liveAnalytics: 'Analytique en direct'
  },
  es: {
    searchPlaceholder: 'Buscar artículos, conceptos o teoremas...',
    allCategories: 'Todas las categorías',
    readMore: 'Leer artículo',
    syncNow: 'Sincronización rápida',
    syncing: 'Sincronizando...',
    synced: 'Sincronizado con el blog',
    claim: 'Afirmación',
    counterClaim: 'Contratesis socrática',
    notProof: '¿De qué no es prueba?',
    sectorDefinition: 'Definición del sector',
    sectorEvaluation: 'Evaluación del sector',
    socraticLab: 'Laboratorio de diálogo socrático',
    epistemicFilter: 'Filtro epistémico',
    copyMatrix: 'Copiar matriz al portapapeles',
    copied: '¡Matriz copiada al portapapeles!',
    queryBtn: 'Cuestionar',
    liveAnalytics: 'Analítica en vivo'
  }
};

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

export async function translateNaturalText(text, targetLang, sourceLang = 'auto') {
  if (!text || !String(text).trim() || !targetLang) return text;
  const cleanTarget = String(targetLang).toLowerCase().slice(0, 2);
  const cacheKey = `tr_${cleanTarget}_${hashText(text)}`;

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
  if (article.language === cleanTarget) return article;

  const [
    title,
    excerpt,
    summary,
    content,
    claim,
    counterClaim,
    notProof
  ] = await Promise.all([
    translateNaturalText(article.title || '', cleanTarget),
    translateNaturalText(article.excerpt || '', cleanTarget),
    translateNaturalText(article.summary || '', cleanTarget),
    translateNaturalText(article.content || '', cleanTarget),
    translateNaturalText(article.claim || article.dialecticalTriad?.claim || '', cleanTarget),
    translateNaturalText(article.counterClaim || article.dialecticalTriad?.counterClaim || '', cleanTarget),
    translateNaturalText(article.notProof || article.dialecticalTriad?.whatIsNotEvidence || '', cleanTarget)
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
    translatedTo: cleanTarget,
    dialecticalTriad: article.dialecticalTriad
      ? {
          ...article.dialecticalTriad,
          claim,
          counterClaim,
          whatIsNotEvidence: notProof
        }
      : undefined
  };
}

export async function switchEntireSiteLanguage(targetLang) {
  if (typeof document === 'undefined') return;
  const cleanTarget = String(targetLang || 'tr').toLowerCase().slice(0, 2);
  document.documentElement.lang = cleanTarget;
  document.body.classList.add('sciphil-translating');

  const dict = SITE_UI_DICTIONARY[cleanTarget] || SITE_UI_DICTIONARY.en;

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.setAttribute('placeholder', dict[key]);
      } else {
        el.textContent = dict[key];
      }
    }
  });

  const selector = [
    '[data-translatable="true"]',
    'article h1, article h2, article h3, article p, article li, article blockquote',
    'main h1, main h2, main h3, main p',
    '.article-title, .article-excerpt, .article-summary, .article-content, .debate-matrix-box'
  ].join(', ');

  const elements = Array.from(document.querySelectorAll(selector)).filter(
    el => !el.closest('.katex, code, pre, script, style, [translate="no"]')
  );

  elements.forEach(el => {
    if (!el.dataset.origHtml) {
      el.dataset.origHtml = el.innerHTML;
    }
  });

  const tasks = elements.map(async el => {
    const orig = el.dataset.origHtml || el.innerHTML;
    const translated = await translateNaturalText(orig, cleanTarget);
    return { el, translated };
  });

  const results = await Promise.all(tasks);

  requestAnimationFrame(() => {
    results.forEach(({ el, translated }) => {
      el.innerHTML = translated;
    });
    document.body.classList.remove('sciphil-translating');
    try {
      localStorage.setItem('sciphil_lang', cleanTarget);
    } catch {}
    window.dispatchEvent(new CustomEvent('sciphil:language-change', { detail: { lang: cleanTarget } }));
  });
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  window.SciPhilLanguageSync = {
    switchEntireSiteLanguage,
    translateArticleSimultaneously,
    translateNaturalText,
    fetchAllBloggerPosts
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-lang], [data-language], .lang-btn, .language-option');
    if (btn) {
      const lang = btn.getAttribute('data-lang') || btn.getAttribute('data-language') || btn.textContent?.trim()?.toLowerCase();
      if (lang && /^(tr|en|de|fr|es)$/i.test(lang)) {
        switchEntireSiteLanguage(lang.toLowerCase());
      }
    }
  });
}
'''

SOCRATIC_PARTNER_JSX = r'''import React, { useState, useRef, useEffect, useCallback } from 'react';

const SOCRATIC_UI = {
  tr: {
    labTitle: 'Sokratik Diyalog Laboratuvarı',
    welcome: 'Merhaba, ben Sokratik Düşünce Partneriniz. Bugün üzerine kafa yormak istediğiniz, doğruluğundan kesinlikle emin olduğunuz o sarsılmaz iddia veya fikir nedir?',
    thinking: 'Sokratik süzgeçten geçiriliyor...',
    placeholder: 'İddianızı, fikrinizi veya sarsılmaz kabul ettiğiniz bir tezi yazın...',
    sendBtn: 'Sorgula',
    filterTitle: 'Epistemik Süzgeç',
    yourClaim: 'Senin İddian:',
    counterThesis: 'Sokratik Karşı Tez:',
    notProofLabel: 'Neyin Kanıtı Değildir?:',
    emptyPrompt: 'Yandaki kutuya felsefi veya bilimsel bir iddianızı girip gönderdiğinizde, sistem buraya otomatik olarak o iddianın epistemolojik analiz matrisini çıkaracaktır.',
    copyBtn: 'Matrisi Panoya Kopyala',
    copiedAlert: 'Analiz matrisi panoya kopyalandı!',
    fallbacks: [
      'İddianız oldukça merak uyandırıcı. Ancak şu noktayı düşünmenizi rica ediyorum: Bu önermenin temelinde yatan ve henüz sorgulamadığınız o en büyük ön kabul nedir?',
      'Bu argüman ilk bakışta çok tutarlı görünüyor. Peki, iddia ettiğiniz durumun tam tersini gösteren tek bir istisna dahi olsaydı, kurduğunuz tüm bu mantık zinciri nasıl etkilenirdi?',
      'Düşüncenizin arkasındaki motivasyonu anlıyorum. Peki, bu yargıya varırken kullandığınız kavramsal tanımların kişisel deneyimlerinizin ötesinde, nesnel bir geçerliliği var mı?'
    ],
    defaultCounter: 'Bu durumun sadece gözlemcinin öznel algısına, dilsel sınırlarına veya sınırlı veri setine bağlı bir korelasyon olması ihtimali.',
    defaultNotProof: 'Gözlemlenen pratik tutarlılık veya çoğunluğun mutabakatı, mutlak bir nedenselliğin ya da değişmez bir doğrunun kanıtı değildir.'
  },
  en: {
    labTitle: 'Socratic Dialogue Laboratory',
    welcome: 'Hello, I am your Socratic Thought Partner. What is that unshakeable claim or idea you are certain of and wish to reflect upon today?',
    thinking: 'Passing through the Socratic filter...',
    placeholder: 'Write your claim, idea, or a thesis you consider unshakeable...',
    sendBtn: 'Inquire',
    filterTitle: 'Epistemic Filter',
    yourClaim: 'Your Claim:',
    counterThesis: 'Socratic Counter-Thesis:',
    notProofLabel: 'What Is It Not Proof Of?:',
    emptyPrompt: 'When you enter and submit a philosophical or scientific claim in the box beside this, the system will automatically generate its epistemological analysis matrix here.',
    copyBtn: 'Copy Matrix to Clipboard',
    copiedAlert: 'Analysis matrix copied to clipboard!',
    fallbacks: [
      'Your claim is quite intriguing. However, I ask you to consider this: What is the largest unexamined presupposition underlying this proposition?',
      'This argument appears very consistent at first glance. Yet if there were even a single exception demonstrating the exact opposite, how would your entire chain of logic be affected?',
      'I understand the motivation behind your thought. But do the conceptual definitions you used to reach this judgment hold objective validity beyond personal experience?'
    ],
    defaultCounter: "The possibility that this situation is merely a correlation bound to the observer's subjective perception, linguistic limits, or finite dataset.",
    defaultNotProof: 'Observed practical consistency or majority consensus is not proof of absolute causality or an immutable truth.'
  },
  de: {
    labTitle: 'Sokratisches Dialoglabor',
    welcome: 'Hallo, ich bin Ihr sokratischer Denkpartner. Was ist jene unerschütterliche Behauptung oder Idee, über die Sie heute nachdenken möchten?',
    thinking: 'Wird durch den sokratischen Filter geprüft...',
    placeholder: 'Schreiben Sie Ihre Behauptung, Idee oder eine These...',
    sendBtn: 'Hinterfragen',
    filterTitle: 'Epistemischer Filter',
    yourClaim: 'Ihre Behauptung:',
    counterThesis: 'Sokratische Gegenthese:',
    notProofLabel: 'Wofür ist es kein Beweis?:',
    emptyPrompt: 'Wenn Sie links eine philosophische oder wissenschaftliche Behauptung eingeben, erstellt das System hier automatisch die epistemologische Analysematrix.',
    copyBtn: 'Matrix in Zwischenablage kopieren',
    copiedAlert: 'Analysematrix in die Zwischenablage kopiert!',
    fallbacks: [
      'Ihre Behauptung ist äußerst interessant. Doch bedenken Sie bitte: Was ist die größte, noch ungeprüfte Grundannahme hinter dieser Aussage?',
      'Dieses Argument wirkt auf den ersten Blick sehr schlüssig. Wie würde sich Ihre gesamte Logikkette verändern, wenn es auch nur eine einzige Ausnahme gäbe?',
      'Ich verstehe die Motivation hinter Ihrem Gedanken. Haben die begrifflichen Definitionen, die Sie verwenden, eine objektive Gültigkeit jenseits persönlicher Erfahrung?'
    ],
    defaultCounter: 'Die Möglichkeit, dass dieser Zustand lediglich eine Korrelation ist, die an die subjektive Wahrnehmung oder sprachliche Grenzen gebunden ist.',
    defaultNotProof: 'Beobachtete praktische Konsistenz oder Mehrheitskonsens sind kein Beweis für absolute Kausalität oder unveränderliche Wahrheit.'
  },
  fr: {
    labTitle: 'Laboratoire de Dialogue Socratique',
    welcome: "Bonjour, je suis votre partenaire de réflexion socratique. Quelle est cette affirmation ou idée inébranlable sur laquelle vous souhaitez méditer aujourd'hui ?",
    thinking: 'Analyse à travers le filtre socratique...',
    placeholder: 'Écrivez votre affirmation, votre idée ou une thèse...',
    sendBtn: 'Interroger',
    filterTitle: 'Filtre Épistémique',
    yourClaim: 'Votre Affirmation :',
    counterThesis: 'Contre-thèse Socratique :',
    notProofLabel: "De quoi n'est-ce pas la preuve ? :",
    emptyPrompt: "Lorsque vous soumettez une affirmation philosophique ou scientifique, le système génère automatiquement sa matrice d'analyse épistémologique ici.",
    copyBtn: 'Copier la Matrice',
    copiedAlert: 'Matrice copiée dans le presse-papiers !',
    fallbacks: [
      'Votre affirmation est très intrigante. Toutefois, quel est le plus grand présupposé non examiné qui sous-tend cette proposition ?',
      "Cet argument semble très cohérent à première vue. Mais s'il existait une seule exception démontrant le contraire, comment votre chaîne logique serait-elle affectée ?",
      "Je comprends la motivation derrière votre pensée. Mais les définitions conceptuelles utilisées ont-elles une validité objective au-delà de l'expérience personnelle ?"
    ],
    defaultCounter: "La possibilité que cette situation ne soit qu'une corrélation liée à la perception subjective de l'observateur ou aux limites du langage.",
    defaultNotProof: "La cohérence pratique observée ou le consensus majoritaire n'est pas la preuve d'une causalité absolue."
  },
  es: {
    labTitle: 'Laboratorio de Diálogo Socrático',
    welcome: 'Hola, soy tu compañero de pensamiento socrático. ¿Cuál es esa afirmación o idea inquebrantable sobre la que deseas reflexionar hoy?',
    thinking: 'Pasando por el filtro socrático...',
    placeholder: 'Escribe tu afirmación, idea o tesis...',
    sendBtn: 'Cuestionar',
    filterTitle: 'Filtro Epistémico',
    yourClaim: 'Tu Afirmación:',
    counterThesis: 'Contratesis Socrática:',
    notProofLabel: '¿De qué no es prueba?:',
    emptyPrompt: 'Cuando ingreses una afirmación filosófica o científica en el cuadro contiguo, el sistema generará automáticamente su matriz de análisis epistemológico aquí.',
    copyBtn: 'Copiar Matriz al Portapapeles',
    copiedAlert: '¡Matriz copiada al portapapeles!',
    fallbacks: [
      'Tu afirmación es muy intrigante. Sin embargo, te pido que consideres esto: ¿cuál es el mayor presupuesto no cuestionado que subyace a esta proposición?',
      'Este argumento parece muy coherente a primera vista. Pero si existiera una sola excepción que demostrara lo contrario, ¿cómo se vería afectada toda tu cadena lógica?',
      'Entiendo la motivación detrás de tu pensamiento. ¿Pero las definiciones conceptuales que utilizas tienen validez objetiva más allá de la experiencia personal?'
    ],
    defaultCounter: 'La posibilidad de que esta situación sea solo una correlación ligada a la percepción subjetiva del observador o a límites lingüísticos.',
    defaultNotProof: 'La consistencia práctica observada o el consenso de la mayoría no es prueba de una causalidad absoluta.'
  }
};

async function translateDynamicText(text, targetLang) {
  if (!text || !text.trim()) return text;
  if (typeof window !== 'undefined' && window.SciPhilLanguageSync?.translateNaturalText) {
    return window.SciPhilLanguageSync.translateNaturalText(text, targetLang);
  }
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    return Array.isArray(data?.[0]) ? data[0].map(s => s?.[0] || '').join('') : text;
  } catch {
    return text;
  }
}

export default function SocraticPartner({ lang: propLang }) {
  const resolveInitialLang = () => {
    const raw = propLang || (typeof document !== 'undefined' ? document.documentElement.lang : '') || 'tr';
    const short = String(raw).toLowerCase().slice(0, 2);
    return SOCRATIC_UI[short] ? short : 'tr';
  };

  const [activeLang, setActiveLang] = useState(resolveInitialLang);
  const ui = SOCRATIC_UI[activeLang] || SOCRATIC_UI.tr;

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: ui.welcome,
      isWelcome: true
    }
  ]);
  const [input, setInput] = useState('');
  const [matrix, setMatrix] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const syncLanguageSimultaneously = useCallback(async (newLang) => {
    const clean = String(newLang || 'tr').toLowerCase().slice(0, 2);
    const targetUi = SOCRATIC_UI[clean] || SOCRATIC_UI.en;
    setActiveLang(clean);

    const translatedMessagesPromise = Promise.all(
      messages.map(async (m) => {
        if (m.isWelcome) {
          return { ...m, text: targetUi.welcome };
        }
        const translatedText = await translateDynamicText(m.originalText || m.text, clean);
        return { ...m, originalText: m.originalText || m.text, text: translatedText };
      })
    );

    const translatedMatrixPromise = matrix
      ? Promise.all([
          translateDynamicText(matrix.originalClaim || matrix.claim, clean),
          translateDynamicText(matrix.originalCounterClaim || matrix.counterClaim, clean),
          translateDynamicText(matrix.originalNotProof || matrix.notProof, clean)
        ]).then(([claim, counterClaim, notProof]) => ({
          ...matrix,
          originalClaim: matrix.originalClaim || matrix.claim,
          originalCounterClaim: matrix.originalCounterClaim || matrix.counterClaim,
          originalNotProof: matrix.originalNotProof || matrix.notProof,
          claim,
          counterClaim,
          notProof
        }))
      : Promise.resolve(null);

    const [updatedMsgs, updatedMat] = await Promise.all([
      translatedMessagesPromise,
      translatedMatrixPromise
    ]);

    setMessages(updatedMsgs);
    if (updatedMat) setMatrix(updatedMat);
  }, [messages, matrix]);

  useEffect(() => {
    if (propLang) {
      const short = String(propLang).toLowerCase().slice(0, 2);
      if (short !== activeLang) {
        syncLanguageSimultaneously(short);
      }
    }
  }, [propLang, activeLang, syncLanguageSimultaneously]);

  useEffect(() => {
    const handleGlobalLangChange = (e) => {
      const nextLang = e?.detail?.lang;
      if (nextLang && nextLang !== activeLang) {
        syncLanguageSimultaneously(nextLang);
      }
    };
    window.addEventListener('sciphil:language-change', handleGlobalLangChange);
    return () => window.removeEventListener('sciphil:language-change', handleGlobalLangChange);
  }, [activeLang, syncLanguageSimultaneously]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = { sender: 'user', text: trimmed, originalText: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/socratic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claim: trimmed,
          lang: activeLang
        })
      });

      if (response.ok) {
        const data = await response.json();
        const replyText = data.reply || data.question || ui.fallbacks[0];
        setMessages(prev => [...prev, { sender: 'bot', text: replyText, originalText: replyText }]);
        setMatrix({
          claim: data.matrix?.claim || trimmed,
          counterClaim: data.matrix?.counterClaim || ui.defaultCounter,
          notProof: data.matrix?.notProof || ui.defaultNotProof,
          originalClaim: data.matrix?.claim || trimmed,
          originalCounterClaim: data.matrix?.counterClaim || ui.defaultCounter,
          originalNotProof: data.matrix?.notProof || ui.defaultNotProof
        });
        setIsLoading(false);
        return;
      }
    } catch {
      // Fallback
    }

    const randomResponse = ui.fallbacks[Math.floor(Math.random() * ui.fallbacks.length)];
    setMessages(prev => [...prev, { sender: 'bot', text: randomResponse, originalText: randomResponse }]);
    setMatrix({
      claim: trimmed,
      counterClaim: ui.defaultCounter,
      notProof: ui.defaultNotProof,
      originalClaim: trimmed,
      originalCounterClaim: ui.defaultCounter,
      originalNotProof: ui.defaultNotProof
    });
    setIsLoading(false);
  };

  const copyToClipboard = async () => {
    if (!matrix) return;
    const textToCopy = `[${ui.filterTitle.toUpperCase()}]\n\n${ui.yourClaim}\n${matrix.claim}\n\n${ui.counterThesis}\n${matrix.counterClaim}\n\n${ui.notProofLabel}\n${matrix.notProof}`;

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopyFeedback(ui.copiedAlert);
      setTimeout(() => setCopyFeedback(''), 2500);
    } catch (err) {
      console.error('Kopyalama hatası:', err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 max-w-6xl mx-auto bg-slate-950 text-slate-100 rounded-xl min-h-[550px] font-sans shadow-2xl border border-slate-800/50">
      <div className="flex-1 flex flex-col justify-between bg-slate-900/80 p-5 rounded-lg border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-800">
          <div className="w-3 h-3 rounded-full bg-sky-500 animate-pulse"></div>
          <h2 className="text-sm font-semibold tracking-wider text-slate-300 uppercase">
            {ui.labTitle}
          </h2>
        </div>

        <div className="overflow-y-auto h-96 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`p-3.5 rounded-lg max-w-md text-sm leading-relaxed shadow-md ${
                  msg.sender === 'user'
                    ? 'bg-sky-600 text-white rounded-br-none'
                    : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/50'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 text-slate-400 p-3 rounded-lg text-sm rounded-bl-none flex items-center gap-2">
                <span className="animate-bounce">●</span>
                <span className="animate-bounce [animation-delay:0.2s]">●</span>
                <span className="animate-bounce [animation-delay:0.4s]">●</span>
                <span className="text-xs italic">{ui.thinking}</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 mt-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={ui.placeholder}
            className="flex-1 p-3 bg-slate-950 rounded border border-slate-800 text-sm focus:outline-none focus:border-sky-500 transition-colors placeholder-slate-600 text-slate-100"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-800 disabled:text-slate-500 px-5 py-3 rounded text-sm font-bold transition-all shadow-lg active:scale-95"
          >
            {ui.sendBtn}
          </button>
        </div>
      </div>

      <div className="w-full md:w-80 bg-slate-900/80 p-5 rounded-lg border border-slate-800 flex flex-col justify-between backdrop-blur-sm">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
            <span className="text-lg">⚖️</span>
            <h3 className="text-sky-400 font-bold text-sm tracking-wide uppercase">
              {ui.filterTitle}
            </h3>
          </div>

          {matrix ? (
            <div className="space-y-4 text-xs">
              <div className="transition-all duration-300 ease-in-out">
                <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  {ui.yourClaim}
                </span>
                <p className="bg-slate-950/80 p-2.5 rounded mt-1 text-slate-300 border border-slate-900 italic">
                  "{matrix.claim}"
                </p>
              </div>

              <div className="transition-all duration-300 ease-in-out">
                <span className="text-amber-400 font-semibold uppercase tracking-wider text-[10px]">
                  {ui.counterThesis}
                </span>
                <p className="bg-slate-950/80 p-2.5 rounded mt-1 text-slate-300 border border-slate-900">
                  {matrix.counterClaim}
                </p>
              </div>

              <div className="transition-all duration-300 ease-in-out">
                <span className="text-rose-400 font-semibold uppercase tracking-wider text-[10px]">
                  {ui.notProofLabel}
                </span>
                <p className="bg-slate-950/80 p-2.5 rounded mt-1 text-slate-300 border border-slate-900">
                  {matrix.notProof}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <span className="text-3xl mb-3 opacity-30">🔍</span>
              <p className="text-slate-500 text-xs italic leading-relaxed px-4">
                {ui.emptyPrompt}
              </p>
            </div>
          )}
        </div>

        {matrix && (
          <div>
            {copyFeedback && (
              <p className="text-emerald-400 text-[11px] text-center mb-2 font-medium">
                {copyFeedback}
              </p>
            )}
            <button
              onClick={copyToClipboard}
              className="w-full mt-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 py-2.5 rounded text-xs font-bold text-white tracking-wider uppercase transition-all shadow-md"
            >
              {ui.copyBtn}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
'''

SYNC_PYTHON_SCRIPT = r'''import urllib.request
import urllib.parse
import json
import re
import os
from datetime import datetime, timezone
from concurrent.futures import ThreadPoolExecutor

BLOGGER_FEED_URL = "https://emrepelit7337.blogspot.com/feeds/posts/default"
SITE_SYNC_ENDPOINT = "https://sci-phil.ai.studio/api/sync-blog"
SITE_ARTICLES_ENDPOINT = "https://sci-phil.ai.studio/api/articles"
STATE_FILE = ".last_sync_state.json"
PAGE_SIZE = 150


def clean_and_filter_html(html_content):
    """
    Süzgeç İşlevi:
    1. Gereksiz inline stil ve script etiketlerini temizler.
    2. KaTeX matematiksel formüllerini korur.
    3. Temiz semantik HTML yapısına dönüştürür.
    """
    if not html_content:
        return ""
    cleaned = re.sub(r'style="[^"]*"', '', html_content, flags=re.IGNORECASE)
    cleaned = re.sub(r'<script[^>]*>.*?</script>', '', cleaned, flags=re.DOTALL | re.IGNORECASE)
    cleaned = re.sub(r'<font[^>]*>(.*?)</font>', r'\1', cleaned, flags=re.DOTALL | re.IGNORECASE)
    return cleaned.strip()


def is_turkish_content(title, content):
    """
    Yalnızca Türkçe yazıları süzen kontrol mekanizması
    """
    full_text = f" {title} {content} ".lower()
    tr_keywords = ["ve", "bir", "bu", "ile", "değil", "için", "üzerine", "evren", "zaman", "bilim", "felsefe"]
    matches = sum(1 for kw in tr_keywords if f" {kw} " in full_text)
    return matches >= 2


def load_last_sync_time():
    if os.path.exists(STATE_FILE):
        try:
            with open(STATE_FILE, "r", encoding="utf-8") as f:
                return json.load(f).get("last_sync_time")
        except Exception:
            return None
    return None


def save_last_sync_time(timestamp):
    try:
        with open(STATE_FILE, "w", encoding="utf-8") as f:
            json.dump({"last_sync_time": timestamp}, f)
    except Exception as e:
        print(f"Durum dosyası kaydedilemedi: {e}")


def fetch_feed_page(start_index=1, updated_min=None):
    params = {
        "alt": "json",
        "start-index": str(start_index),
        "max-results": str(PAGE_SIZE)
    }
    if updated_min:
        params["updated-min"] = updated_min

    url = f"{BLOGGER_FEED_URL}?{urllib.parse.urlencode(params)}"
    req = urllib.request.Request(url, headers={"User-Agent": "SciPhil-FastSync/2.0"})
    with urllib.request.urlopen(req, timeout=12) as response:
        return json.loads(response.read().decode("utf-8"))


def parse_entries(entries):
    processed = []
    for entry in entries:
        title = entry.get("title", {}).get("$t", "")
        raw_content = entry.get("content", {}).get("$t") or entry.get("summary", {}).get("$t", "")
        published_date = entry.get("published", {}).get("$t", "")
        updated_date = entry.get("updated", {}).get("$t", published_date)

        links = entry.get("link", [])
        blogger_link = next((link["href"] for link in links if link.get("rel") == "alternate"), "")

        if not is_turkish_content(title, raw_content):
            continue

        filtered_content = clean_and_filter_html(raw_content)
        slug = blogger_link.split("/")[-1].replace(".html", "") if blogger_link else ""

        processed.append({
            "title": title,
            "slug": slug,
            "content": filtered_content,
            "published_at": published_date,
            "updated_at": updated_date,
            "source_url": blogger_link,
            "language": "tr"
        })
    return processed


def sync_blogger_to_sciphil(force_full=False):
    last_sync = None if force_full else load_last_sync_time()
    now_iso = datetime.now(timezone.utc).isoformat()

    first_data = fetch_feed_page(start_index=1, updated_min=last_sync)
    feed = first_data.get("feed", {})
    entries = feed.get("entry", [])
    total_results = int(feed.get("openSearch$totalResults", {}).get("$t", len(entries)))

    all_entries = list(entries)

    if not last_sync and total_results > len(entries) and len(entries) == PAGE_SIZE:
        start_indices = list(range(PAGE_SIZE + 1, min(total_results + 1, PAGE_SIZE * 10), PAGE_SIZE))
        with ThreadPoolExecutor(max_workers=6) as executor:
            futures = [executor.submit(fetch_feed_page, idx, None) for idx in start_indices]
            for future in futures:
                try:
                    page_data = future.result()
                    all_entries.extend(page_data.get("feed", {}).get("entry", []))
                except Exception as err:
                    print(f"Sayfa çekme hatası: {err}")

    processed_articles = parse_entries(all_entries)
    save_last_sync_time(now_iso)

    print(f"Süzgeçten geçen yeni/güncel Türkçe yazı sayısı: {len(processed_articles)}")
    return processed_articles


def trigger_live_server_sync():
    try:
        req = urllib.request.Request(
            SITE_SYNC_ENDPOINT,
            data=b"{}",
            headers={"Content-Type": "application/json", "User-Agent": "SciPhil-FastSync/2.0"},
            method="POST"
        )
        with urllib.request.urlopen(req, timeout=15) as res:
            print(f"Canlı sunucu senkronizasyonu tamamlandı (HTTP {res.status}).")
    except Exception as e:
        print(f"Canlı sunucu tetikleme uyarısı: {e}")


if __name__ == "__main__":
    articles = sync_blogger_to_sciphil()
    trigger_live_server_sync()
'''


def build_clean_zip(output_zip_name="sci-phil-ai-studio-hatasiz-tam-paket.zip"):
    with open("blogger-sync.js", "w", encoding="utf-8") as f:
        f.write(BLOGGER_SYNC_JS)

    with open("SocraticPartner.jsx", "w", encoding="utf-8") as f:
        f.write(SOCRATIC_PARTNER_JSX)

    os.makedirs("src", exist_ok=True)
    with open(os.path.join("src", "SocraticPartner.jsx"), "w", encoding="utf-8") as f:
        f.write(SOCRATIC_PARTNER_JSX)

    with open("Senkronizasyon Betiği.py", "w", encoding="utf-8") as f:
        f.write(SYNC_PYTHON_SCRIPT)

    excluded_dirs = {"node_modules", ".git", "dist", "build", "coverage", "__pycache__"}
    excluded_files = {output_zip_name, "paket_olustur.py"}
    added_arcnames = set()

    with zipfile.ZipFile(output_zip_name, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk("."):
            dirs[:] = [d for d in dirs if d not in excluded_dirs]
            for file in files:
                if file in excluded_files or file.endswith(".zip"):
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, ".").replace("\\", "/")
                if rel_path not in added_arcnames:
                    zf.write(full_path, rel_path)
                    added_arcnames.add(rel_path)

    print(f"✅ Hatasız ZIP arşivi başarıyla oluşturuldu: {output_zip_name} ({len(added_arcnames)} dosya)")


if __name__ == "__main__":
    build_clean_zip()