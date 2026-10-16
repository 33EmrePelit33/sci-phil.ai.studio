
function findMissingTranslations(articles: Article[], translations: Record<string, SiteArticleTranslation>) {
  const missing = articles.filter((article) => !translations[article.id] && !translations[article.slug]);
  if (missing.length) {
    console.warn('Tam dil geçişi için eksik çeviriler var');
  }
  return missing;
}
import type { Article } from '../types/article';
import type { ReadingLanguageOption } from '../components/Header';
import allArticleTranslationsJson from '../data/allArticleTranslations.json';

export interface SiteArticleTranslation {
  title: string;
  summary: string;
  categories: string[];
  dialecticalTriad?: {
    claim?: string;
    counterClaim?: string;
    whatIsNotEvidence?: string;
    methodologicalNote?: string;
  };
}

interface CachedSiteTranslations {
  signature: string;
  translations: Record<string, SiteArticleTranslation>;
  savedAt: string;
}

const typedTranslations = allArticleTranslationsJson as Record<
  string,
  Record<string, { title: string; summary: string; categories?: string[]; dialecticalTriad?: any } | null>
>;

function catalogueSignature(articles: Article[]): string {
  const raw = articles
    .map((article) => `${article.id}:${article.slug}:${article.language || 'tr'}:${article.updatedAt || article.publishedAt || ''}:${article.title}:${article.summary}:${article.categories.join(',')}:${JSON.stringify(article.dialecticalTriad || {})}`)
    .join('|');
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${articles.length}-${(hash >>> 0).toString(36)}`;
}

function storageKey(languageCode: string): string {
  return `sci_phil_site_catalog_v3_${languageCode.toLowerCase()}`; // versioned cache
}

export async function translateSiteCatalog(
  articles: Article[],
  language: ReadingLanguageOption,
  onProgress?: (percent: number) => void,
): Promise<Record<string, SiteArticleTranslation>> {
  if (language.code === 'tr') return {};
  const signature = catalogueSignature(articles);
  const key = storageKey(language.code);
  const targetCode = language.code.toLowerCase();

  // 1. Check local storage cache
  try {
    const cachedRaw = window.localStorage.getItem(key);
    if (cachedRaw) {
      const cached = JSON.parse(cachedRaw) as CachedSiteTranslations;
      const ids = articles.map((article) => article.id);
      if (cached.signature === signature && ids.every((id) => Boolean(cached.translations?.[id]))) {
        onProgress?.(100);
        return cached.translations;
      }
    }
  } catch {
    // Local storage can be blocked or filled; continue.
  }

  // 2. Immediate check in bundled high-quality precomputed dictionary
  const bundledTranslations: Record<string, SiteArticleTranslation> = {};
  let bundledCount = 0;

  for (const article of articles) {
    const record = typedTranslations[article.id]?.[targetCode] || typedTranslations[article.slug]?.[targetCode];
    if (record && record.title) {
      bundledTranslations[article.id] = {
        title: record.title,
        summary: record.summary || article.summary,
        categories: record.categories?.length ? record.categories : article.categories,
        dialecticalTriad: record.dialecticalTriad || article.dialecticalTriad,
      };
      bundledCount++;
    }
  }

  // If all or almost all articles are immediately found in bundled data (like English with 70/70)
  if (bundledCount >= articles.length) {
    onProgress?.(100);
    try {
      window.localStorage.setItem(key, JSON.stringify({ signature, translations: bundledTranslations, savedAt: new Date().toISOString() }));
    } catch {}
    return bundledTranslations;
  }

  // 3. For any missing articles or other languages, fetch server endpoint
  onProgress?.(30);
  try {
    const response = await fetch('/api/gemini/translate-site', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        targetLanguage: language.name,
        targetLanguageNative: language.native,
        targetLanguageCode: language.code,
        articleSignature: signature,
        articles: articles.map((article) => ({
          id: article.id,
          slug: article.slug,
          language: article.language || 'tr',
          updatedAt: article.updatedAt || article.publishedAt || '',
          title: article.title,
          summary: article.summary,
          categories: article.categories,
          dialecticalTriad: article.dialecticalTriad,
        })),
      }),
      signal: AbortSignal.timeout(120_000),
    });

    const payload = await response.json().catch(() => ({}));
    if (response.ok && payload.success && payload.translations) {
      const merged = { ...bundledTranslations, ...payload.translations };
      onProgress?.(100);
      try {
        window.localStorage.setItem(key, JSON.stringify({ signature, translations: merged, savedAt: new Date().toISOString() }));
      } catch {}
      return merged;
    }
  } catch (err) {
    console.warn('[translateSiteCatalog] Remote translation notice:', err);
  }

  // 4. Guaranteed non-blocking fallback: ensure every article has an entry so UI is never empty
  for (const article of articles) {
    if (!bundledTranslations[article.id]) {
      bundledTranslations[article.id] = {
        title: article.title,
        summary: article.summary,
        categories: article.categories,
        dialecticalTriad: article.dialecticalTriad,
      };
    }
  }

  onProgress?.(100);
  return bundledTranslations;
}

// localStorage.setItem(key, JSON.stringify(cache))
