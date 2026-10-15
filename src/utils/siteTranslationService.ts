import type { Article } from '../types/article';
import type { ReadingLanguageOption } from '../components/Header';

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

function catalogueSignature(articles: Article[]): string {
  const raw = articles
    .map((article) => `${article.id}:${article.slug}:${article.language || 'tr'}:${article.updatedAt || article.publishedAt || ''}:${article.title}:${article.summary}:${article.categories.join(',')}:${JSON.stringify(article.dialecticalTriad || {})}`)
    .join('|');
  // Small deterministic signature; this is a cache version, not a security hash.
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${articles.length}-${(hash >>> 0).toString(36)}`;
}

function storageKey(languageCode: string): string {
  return `sci_phil_site_catalog_v3_${languageCode.toLowerCase()}`;
}

export async function translateSiteCatalog(
  articles: Article[],
  language: ReadingLanguageOption,
  onProgress?: (percent: number) => void,
): Promise<Record<string, SiteArticleTranslation>> {
  if (language.code === 'tr') return {};
  const signature = catalogueSignature(articles);
  const key = storageKey(language.code);

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
    // Local storage can be blocked or filled; continue with the live route.
  }

  onProgress?.(20);
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
    signal: AbortSignal.timeout(240_000),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || payload.success !== true || !payload.translations) {
    throw new Error(payload.error || `Çeviri sunucusu HTTP ${response.status} yanıtı verdi.`);
  }

  const translations = payload.translations as Record<string, SiteArticleTranslation>;
  const missing = articles.filter((article) => !translations[article.id] && !translations[article.slug]);
  if (missing.length > 0) {
    throw new Error(`Tam dil geçişi için ${missing.length} makale çevirisi eksik. Özgün dilde kalındı; yeniden deneyin.`);
  }
  onProgress?.(95);
  const cache: CachedSiteTranslations = { signature, translations, savedAt: new Date().toISOString() };
  try {
    window.localStorage.setItem(key, JSON.stringify(cache));
  } catch {
    // Translation can still be used in this tab when local storage has no capacity.
  }
  onProgress?.(100);
  return translations;
}
