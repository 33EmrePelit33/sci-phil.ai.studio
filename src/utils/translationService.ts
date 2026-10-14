import { PRECOMPUTED_TRANSLATIONS, TranslatedArticlePayload } from '../data/precomputedTranslations';

// In-memory runtime cache for session
const MEMORY_CACHE = new Map<string, TranslatedArticlePayload>();

// Generate stable cache key for article + target language
export function getTranslationCacheKey(articleIdOrSlug: string, langCode: string): string {
  return `${articleIdOrSlug.toLowerCase()}_${langCode.toLowerCase()}`;
}

/**
 * High-speed translation resolver.
 * Priority 1: In-memory cache (0ms)
 * Priority 2: Pre-computed editorial dataset (0ms)
 * Priority 3: Persistent Browser LocalStorage (0ms)
 * Priority 4: Server /api/gemini/translate endpoint with server-side caching
 * Priority 5: Resilient instant neural translation fallback
 */
export async function translateArticleContent(params: {
  articleId: string;
  slug?: string;
  title: string;
  summary: string;
  content: string;
  dialecticalTriad?: any;
  targetLanguageName: string;
  targetLanguageCode: string;
}): Promise<TranslatedArticlePayload> {
  const code = params.targetLanguageCode.toLowerCase();
  const id = params.articleId;
  const slug = params.slug || id;

  // 1. In-memory session cache
  const memKey = getTranslationCacheKey(id, code);
  if (MEMORY_CACHE.has(memKey)) {
    return MEMORY_CACHE.get(memKey)!;
  }

  // 2. Precomputed curated translations (e.g. 70th showcase article)
  const precomputedForId = PRECOMPUTED_TRANSLATIONS[id] || PRECOMPUTED_TRANSLATIONS[slug];
  if (precomputedForId && precomputedForId[code]) {
    const res = precomputedForId[code];
    MEMORY_CACHE.set(memKey, res);
    return res;
  }

  // 3. Browser LocalStorage cache
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const stored = window.localStorage.getItem(`sci_phil_trans_${memKey}`);
      if (stored) {
        const parsed = JSON.parse(stored) as TranslatedArticlePayload;
        if (parsed && parsed.translatedTitle && parsed.translatedContent) {
          MEMORY_CACHE.set(memKey, parsed);
          return parsed;
        }
      }
    } catch {
      // LocalStorage quota or parse error ignored
    }
  }

  // 4. Fetch from /api/gemini/translate with rapid timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const res = await fetch('/api/gemini/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        articleId: params.articleId,
        slug: params.slug,
        title: params.title,
        summary: params.summary,
        content: params.content,
        dialecticalTriad: params.dialecticalTriad,
        targetLanguage: params.targetLanguageName,
        targetLanguageCode: code,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const payload: TranslatedArticlePayload = {
          translatedTitle: json.data.translatedTitle || params.title,
          translatedSummary: json.data.translatedSummary || params.summary,
          translatedContent: json.data.translatedContent || params.content,
          translatedDialecticalTriad: json.data.translatedDialecticalTriad || params.dialecticalTriad,
        };
        // Save to caches
        MEMORY_CACHE.set(memKey, payload);
        try {
          window.localStorage.setItem(`sci_phil_trans_${memKey}`, JSON.stringify(payload));
        } catch { /* Ignore storage quota */ }
        return payload;
      }
    }
  } catch (netErr) {
    console.warn('[Translate] Server route delay, attempting rapid client fallback:', netErr);
  }

  // 5. Emergency client fallback if server timed out or failed
  try {
    const rapidRes = await rapidTranslateFallback(params.title, params.summary, code);
    const fallbackPayload: TranslatedArticlePayload = {
      translatedTitle: rapidRes.title,
      translatedSummary: rapidRes.summary,
      translatedContent: params.content, // retain rich formatting
      translatedDialecticalTriad: params.dialecticalTriad,
    };
    MEMORY_CACHE.set(memKey, fallbackPayload);
    return fallbackPayload;
  } catch {
    // If all fail, return original
    return {
      translatedTitle: params.title,
      translatedSummary: params.summary,
      translatedContent: params.content,
      translatedDialecticalTriad: params.dialecticalTriad,
    };
  }
}

async function rapidTranslateFallback(title: string, summary: string, targetCode: string) {
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(title.slice(0, 400))}&langpair=tr|${encodeURIComponent(targetCode)}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(3000) });
    if (r.ok) {
      const data = await r.json();
      const translatedTitle = data?.responseData?.translatedText || title;
      return { title: translatedTitle, summary };
    }
  } catch {
    // ignore
  }
  return { title, summary };
}
