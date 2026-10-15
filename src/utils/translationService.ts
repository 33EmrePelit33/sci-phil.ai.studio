import { PRECOMPUTED_TRANSLATIONS, TranslatedArticlePayload } from '../data/precomputedTranslations';

// In-memory runtime cache for session
const MEMORY_CACHE = new Map<string, TranslatedArticlePayload>();

// Generate stable cache key for article + target language
export function getTranslationCacheKey(articleIdOrSlug: string, langCode: string, sourceRevision = ''): string {
  return `v2_${articleIdOrSlug.toLowerCase()}_${langCode.toLowerCase()}${sourceRevision ? `_${sourceRevision}` : ''}`;
}

function translationSourceRevision(params: {
  title: string;
  summary: string;
  content: string;
  sourceLanguageCode?: string;
  dialecticalTriad?: any;
}): string {
  const raw = JSON.stringify({ sourceLanguageCode: params.sourceLanguageCode || 'tr', title: params.title, summary: params.summary, content: params.content, dialecticalTriad: params.dialecticalTriad || {} });
  let hash = 2166136261;
  for (let i = 0; i < raw.length; i += 1) {
    hash ^= raw.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}


/**
 * High-speed translation resolver.
 * Priority 1: In-memory cache (0ms)
 * Priority 2: Pre-computed editorial dataset (0ms)
 * Priority 3: Persistent Browser LocalStorage (0ms)
 * Priority 4: Server /api/gemini/translate endpoint with server-side caching
 * Translation failures remain visible instead of presenting untranslated prose as translated
 */
export async function translateArticleContent(params: {
  articleId: string;
  slug?: string;
  sourceLanguageCode?: string;
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
  const sourceRevision = translationSourceRevision(params);
  const memKey = getTranslationCacheKey(id, code, sourceRevision);
  if (MEMORY_CACHE.has(memKey)) {
    return MEMORY_CACHE.get(memKey)!;
  }

  // 2. Precomputed curated translations (e.g. 70th showcase article)
  const precomputedForId = PRECOMPUTED_TRANSLATIONS[id] || PRECOMPUTED_TRANSLATIONS[slug];
  if ((params.sourceLanguageCode || 'tr').toLowerCase() === 'tr' && precomputedForId && precomputedForId[code]) {
    const res = precomputedForId[code];
    // Only use a curated result when the full body exists; otherwise request a complete live translation.
    if (typeof res.translatedTitle === 'string' && res.translatedTitle.trim()
      && typeof res.translatedContent === 'string'
      && (!params.content.trim() || res.translatedContent.trim())) {
      MEMORY_CACHE.set(memKey, res);
      return res;
    }
  }

  // 3. Browser LocalStorage cache
  if (typeof window !== 'undefined') {
    try {
      const stored = window.localStorage.getItem(`sci_phil_trans_${memKey}`);
      if (stored) {
        const parsed = JSON.parse(stored) as TranslatedArticlePayload;
        const complete = parsed && typeof parsed.translatedTitle === 'string' && parsed.translatedTitle.trim()
          && (!params.summary.trim() || (typeof parsed.translatedSummary === 'string' && parsed.translatedSummary.trim()))
          && (!params.content.trim() || (typeof parsed.translatedContent === 'string' && parsed.translatedContent.trim()))
          && (!params.dialecticalTriad?.claim?.trim() || parsed.translatedDialecticalTriad?.claim?.trim())
          && (!params.dialecticalTriad?.counterClaim?.trim() || parsed.translatedDialecticalTriad?.counterClaim?.trim())
          && (!params.dialecticalTriad?.whatIsNotEvidence?.trim() || parsed.translatedDialecticalTriad?.whatIsNotEvidence?.trim())
          && (!params.dialecticalTriad?.methodologicalNote?.trim() || parsed.translatedDialecticalTriad?.methodologicalNote?.trim());
        if (complete) {
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
    const timeoutId = setTimeout(() => controller.abort(), 240000);

    let res: Response;
    try {
      res = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: params.articleId,
          slug: params.slug,
          sourceLanguageCode: params.sourceLanguageCode || 'tr',
          title: params.title,
          summary: params.summary,
          content: params.content,
          dialecticalTriad: params.dialecticalTriad,
          targetLanguage: params.targetLanguageName,
          targetLanguageCode: code,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const payload: TranslatedArticlePayload = {
          translatedTitle: json.data.translatedTitle || '',
          translatedSummary: json.data.translatedSummary || '',
          translatedContent: json.data.translatedContent ?? '',
          translatedDialecticalTriad: json.data.translatedDialecticalTriad,
        };
        const hasAllRequiredFields = Boolean(payload.translatedTitle.trim())
          && (!params.summary.trim() || Boolean(payload.translatedSummary.trim()))
          && (!params.content.trim() || Boolean(payload.translatedContent.trim()))
          && (!params.dialecticalTriad?.claim?.trim() || Boolean(payload.translatedDialecticalTriad?.claim?.trim()))
          && (!params.dialecticalTriad?.counterClaim?.trim() || Boolean(payload.translatedDialecticalTriad?.counterClaim?.trim()))
          && (!params.dialecticalTriad?.whatIsNotEvidence?.trim() || Boolean(payload.translatedDialecticalTriad?.whatIsNotEvidence?.trim()))
          && (!params.dialecticalTriad?.methodologicalNote?.trim() || Boolean(payload.translatedDialecticalTriad?.methodologicalNote?.trim()));
        if (!hasAllRequiredFields) throw new Error('Çeviri sunucusu makalenin tüm alanlarını çevirmedi.');
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

  throw new Error('Tam makale çevirisi alınamadı. GEMINI_API_KEY, bağlantı ve model erişimini kontrol edip yeniden deneyin.');
}

