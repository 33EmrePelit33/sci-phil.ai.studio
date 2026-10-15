/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header, READING_LANGUAGES, ReadingLanguageOption } from './components/Header';
import { SyncStatusBanner } from './components/SyncStatusBanner';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { AuthorProfileModal } from './components/AuthorProfileModal';
import { SecurityBadgeModal } from './components/SecurityBadgeModal';
import { InteractiveLabModal } from './components/interactive/InteractiveLabModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { FeaturedShowcase } from './components/FeaturedShowcase';
import { PreviewConsoleDrawer } from './components/PreviewConsoleDrawer';
import { SocialShareModal } from './components/SocialShareModal';
import { RECOVERED_TURKISH_ARTICLES, RECOVERED_ARTICLES_UPDATED_AT } from './data/recoveredTurkishArticles';
import { FEATURED_70TH_ARTICLE } from './data/featuredArticle';
import { TOPIC_CLUSTERS } from './data/topicClusters';
import { Article, SyncStatus } from './types/article';
import { getTranslations, translateCategory } from './utils/i18n';
import { translateSiteCatalog, type SiteArticleTranslation } from './utils/siteTranslationService';
import { getTranslatedArticle } from './data/articleTranslations';
import { 
  Compass, 
  FlaskConical, 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  SearchX, 
  Sparkles,
  Globe,
  Brain,
  ShieldCheck,
  Award,
  ChartNoAxesCombined,
  Layers,
  FileCode2,
  Terminal,
  Share2
} from 'lucide-react';
import SocraticPartner from './SocraticPartner';
const ARTICLES_PER_PAGE = 24;

export default function App() {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  const [articles, setArticles] = useState<Article[]>(RECOVERED_TURKISH_ARTICLES);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [selectedArticleInitialLang, setSelectedArticleInitialLang] = useState<{ code: string; name: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  
  // Global target reading language preference: default is Turkish (Original)
  const [readingLanguage, setReadingLanguage] = useState<ReadingLanguageOption>(() => {
    try {
      const savedCode = localStorage.getItem('sci-phil-reading-language');
      return READING_LANGUAGES.find((item) => item.code === savedCode) || READING_LANGUAGES[0];
    } catch {
      return READING_LANGUAGES[0];
    }
  });
  const [siteTranslations, setSiteTranslations] = useState<Record<string, SiteArticleTranslation>>({});
  const [isChangingLanguage, setIsChangingLanguage] = useState(false);
  const [languageNotice, setLanguageNotice] = useState('');
  const [translationPercent, setTranslationPercent] = useState(0);
  const languageRequestId = useRef(0);
  const autoTranslationAttemptRef = useRef('');
  
  // UI Translations dictionary according to selected reading language
  const ui = useMemo(() => getTranslations(readingLanguage.code), [readingLanguage.code]);

  // AI Studio Preview Console Modal / Drawer & Viewport Modes
  const [isPreviewConsoleOpen, setIsPreviewConsoleOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isSocraticOpen, setIsSocraticOpen] = useState(false);
  
  // Pagination & Display View: Page mode or View-All mode
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [viewAll, setViewAll] = useState<boolean>(false);

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    status: 'idle',
    lastSynced: null,
    totalArticles: RECOVERED_TURKISH_ARTICLES.length,
    sourceUrl: 'https://emrepelit7337.blogspot.com',
  });

  // Apply dark class to <html> element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.lang = readingLanguage.code;
    document.documentElement.dir = readingLanguage.code === 'ar' ? 'rtl' : 'ltr';
  }, [readingLanguage.code]);

  // Fetch the bundled archive merged with the live Blogger feed. The server and
  // client refresh at one-minute intervals; focus/visibility events refresh promptly.
  useEffect(() => {
    let isMounted = true;
    let requestInFlight = false;

    const fetchArticles = async () => {
      if (requestInFlight) return;
      requestInFlight = true;
      try {
        const response = await fetch('/api/articles', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Makale arşivi HTTP ${response.status} yanıtı verdi.`);
        const data = await response.json();
        if (!isMounted || !Array.isArray(data.articles) || data.articles.length < RECOVERED_TURKISH_ARTICLES.length) return;

        setArticles(data.articles);
        const remoteStatus = data.syncStatus || {};
        setSyncStatus({
          status: remoteStatus.status === 'error' ? 'error' : remoteStatus.status === 'syncing' ? 'syncing' : remoteStatus.lastSynced ? 'success' : 'idle',
          lastSynced: remoteStatus.lastSynced || data.lastSynced || null,
          totalArticles: data.articles.length,
          sourceUrl: 'https://emrepelit7337.blogspot.com',
          error: remoteStatus.error || undefined,
        });
      } catch (err) {
        console.warn('Blogger arşivi alınamadı; paketlenmiş Türkçe makaleler kullanılmaya devam ediyor.', err);
        if (isMounted) {
          setSyncStatus((prev) => ({
            ...prev,
            status: 'error',
            error: err instanceof Error ? err.message : 'Blogger arşivi alınamadı.',
          }));
        }
      } finally {
        requestInFlight = false;
      }
    };

    void fetchArticles();
    const refreshTimer = window.setInterval(() => { void fetchArticles(); }, 60 * 1000);
    const refreshOnReturn = () => { if (document.visibilityState === 'visible') void fetchArticles(); };
    window.addEventListener('focus', refreshOnReturn);
    document.addEventListener('visibilitychange', refreshOnReturn);
    return () => {
      isMounted = false;
      window.clearInterval(refreshTimer);
      window.removeEventListener('focus', refreshOnReturn);
      document.removeEventListener('visibilitychange', refreshOnReturn);
    };
  }, []);

  // When a one-minute Blogger refresh adds or updates posts while a non-Turkish
  // language is active, translate the new catalogue before treating it as complete.
  // The signature guard prevents retry storms when the external translation service fails.
  useEffect(() => {
    if (readingLanguage.code === 'tr' || syncStatus.status === 'idle' || syncStatus.status === 'syncing' || isChangingLanguage) return;
    if (!articles.length) return;
    const hasMissingTranslations = articles.some((article) => !siteTranslations[article.id] && !siteTranslations[article.slug]);
    if (!hasMissingTranslations) return;

    const catalogueKey = `${readingLanguage.code}:${articles.map((article) => JSON.stringify([article.id, article.updatedAt || article.publishedAt || '', article.title, article.summary, article.categories, article.dialecticalTriad])).join('|')}`;
    if (autoTranslationAttemptRef.current === catalogueKey) return;
    autoTranslationAttemptRef.current = catalogueKey;

    let cancelled = false;
    const requestId = ++languageRequestId.current;
    setIsChangingLanguage(true);
    setTranslationPercent(8);
    setLanguageNotice(`Yeni veya güncellenen makaleler ${readingLanguage.native} diline çevriliyor…`);
    void translateSiteCatalog(articles, readingLanguage, (percent) => {
      if (!cancelled && requestId === languageRequestId.current) setTranslationPercent(percent);
    }).then((translations) => {
      if (cancelled || requestId !== languageRequestId.current) return;
      setSiteTranslations(translations);
      setLanguageNotice(`Site arayüzü ve ${Object.keys(translations).length} makalenin dizin metni ${readingLanguage.native} dilinde hazır.`);
    }).catch((error) => {
      if (cancelled || requestId !== languageRequestId.current) return;
      const detail = error instanceof Error ? error.message : 'Çeviri servisine ulaşılamadı.';
      setLanguageNotice(`Yeni makalelerin tam çevirisi tamamlanamadı: ${detail}`);
    }).finally(() => {
      if (!cancelled && requestId === languageRequestId.current) {
        setIsChangingLanguage(false);
        setTranslationPercent(100);
      }
    });
    return () => { cancelled = true; };
  }, [articles, readingLanguage, siteTranslations, syncStatus.status]);

  // Trigger an immediate server-side Blogger feed refresh.
  const handleTriggerSync = async () => {
    setSyncStatus((prev) => ({ ...prev, status: 'syncing', error: undefined }));
    try {
      const res = await fetch('/api/sync-blog', { method: 'POST', cache: 'no-store' });
      const data = await res.json();
      if (Array.isArray(data.articles) && data.articles.length >= RECOVERED_TURKISH_ARTICLES.length) {
        setArticles(data.articles);
      }
      const remoteStatus = data.syncStatus || {};
      if (res.ok && data.success) {
        setSyncStatus({
          status: 'success',
          lastSynced: remoteStatus.lastSynced || data.lastSynced || new Date().toISOString(),
          totalArticles: Array.isArray(data.articles) ? data.articles.length : RECOVERED_TURKISH_ARTICLES.length,
          sourceUrl: 'https://emrepelit7337.blogspot.com',
        });
      } else {
        setSyncStatus({
          status: 'error',
          lastSynced: remoteStatus.lastSynced || data.lastSynced || null,
          totalArticles: Array.isArray(data.articles) ? data.articles.length : RECOVERED_TURKISH_ARTICLES.length,
          sourceUrl: 'https://emrepelit7337.blogspot.com',
          error: data.message || remoteStatus.error || 'Blogger senkronizasyonu tamamlanamadı; korunan makale arşivi görünür durumda.',
        });
      }
    } catch (error: any) {
      setSyncStatus((prev) => ({
        ...prev,
        status: 'error',
        error: error?.message || 'Senkronizasyon hatası',
      }));
    }
  };

  // Translate the whole catalogue as one language transition. The UI dictionary
  // switches at once; all article-card metadata is swapped in a single state update.
  const handleReadingLanguageChange = async (lang: ReadingLanguageOption) => {
    if (lang.code === readingLanguage.code && !isChangingLanguage && (lang.code === 'tr' || articles.every((article) => Boolean(siteTranslations[article.id] || siteTranslations[article.slug])))) return;
    const requestId = ++languageRequestId.current;
    setLanguageNotice('');
    if (lang.code === 'tr') {
      setReadingLanguage(lang);
      if (selectedArticle) setSelectedArticleInitialLang({ code: lang.code, name: lang.name });
      setSiteTranslations({});
      setIsChangingLanguage(false);
      setTranslationPercent(0);
      try { localStorage.setItem('sci-phil-reading-language', 'tr'); } catch { /* storage may be disabled */ }
      return;
    }

    setIsChangingLanguage(true);
    setTranslationPercent(8);
    setLanguageNotice(`Tüm makale dizini ${lang.native} diline hazırlanıyor…`);
    try {
      const translations = await translateSiteCatalog(articles, lang, (percent) => { if (requestId === languageRequestId.current) setTranslationPercent(percent); });
      if (requestId !== languageRequestId.current) return;
      if (translations && Object.keys(translations).length) {
        setSiteTranslations(translations);
        setReadingLanguage(lang);
        if (selectedArticle) setSelectedArticleInitialLang({ code: lang.code, name: lang.name });
        try { localStorage.setItem('sci-phil-reading-language', lang.code); } catch { /* storage may be disabled */ }
        const translatedCount = Object.keys(translations).length;
        setLanguageNotice(translatedCount < articles.length
          ? `${translatedCount}/${articles.length} makalenin dizin metni çevrildi; çevrilemeyen kayıtlar özgün hâliyle korunuyor.`
          : `Site arayüzü ve ${translatedCount} makalenin dizin metni ${lang.native} diline çevrildi.`);
      } else {
        throw new Error('Çeviri servisi hedef dilde tam makale dizini döndürmedi. Özgün dil korunuyor.');
      }
    } catch (error) {
      if (requestId !== languageRequestId.current) return;
      console.warn('[Site translation] Translation request failed:', error);
      // Keep the previously selected language and its complete catalogue; never
      // label untranslated source text as a successful language change.
      const detail = error instanceof Error ? error.message : 'Çeviri servisine ulaşılamadı.';
      setLanguageNotice(`${detail} Sunucu Secrets ayarında GEMINI_API_KEY değerini ve model erişimini kontrol edin.`);
    } finally {
      if (requestId === languageRequestId.current) {
        setIsChangingLanguage(false);
        setTranslationPercent(100);
      }
    }
  };

  const articleCatalogRevision = useMemo(
    () => articles.map((article) => `${article.id}:${article.updatedAt || article.publishedAt || ''}:${article.title}`).join('|'),
    [articles],
  );

  // Restore the saved reading language after the article list has loaded. The
  // translation service uses a catalogue signature, so new Blogger posts refresh it.
  useEffect(() => {
    if (readingLanguage.code !== 'tr' && !isChangingLanguage && !articles.every((article) => Boolean(siteTranslations[article.id] || siteTranslations[article.slug]))) {
      void handleReadingLanguageChange(readingLanguage);
    }
    // Catalogue revision changes only when post identity/content metadata changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [articleCatalogRevision, readingLanguage.code]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory]);

  // Extract unique categories across all articles with counts
  const categories = useMemo(() => {
    const counts: Record<string, number> = {};
    articles.forEach((a) => {
      a.categories.forEach((c) => {
        counts[c] = (counts[c] || 0) + 1;
      });
    });
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return ['Tümü', ...sorted];
  }, [articles]);

  // Keep original category IDs for filtering, but show the translated label
  // in the category bar so category navigation changes with the selected language.
  const translatedCategoryLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    articles.forEach((article) => {
      const translated = siteTranslations[article.id] || siteTranslations[article.slug];
      article.categories.forEach((sourceCategory, index) => {
        const translatedLabel = translated?.categories?.[index];
        labels[sourceCategory] = translatedLabel || labels[sourceCategory] || translateCategory(sourceCategory, readingLanguage.code);
      });
    });
    return labels;
  }, [articles, siteTranslations, readingLanguage.code]);

  // Filter articles by search and category (All articles are pure Turkish originals)
  const filteredArticles = useMemo(() => {
    return articles.filter((article) => {
      // Category filter
      if (selectedCategory !== 'Tümü' && !article.categories.includes(selectedCategory)) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const translated = siteTranslations[article.id] || siteTranslations[article.slug];
        const fallbackArticle = readingLanguage.code !== 'tr' ? getTranslatedArticle(article, readingLanguage.code) : article;
        const inTitle = article.title.toLowerCase().includes(q) || String(translated?.title || fallbackArticle.title).toLowerCase().includes(q);
        const inSummary = article.summary.toLowerCase().includes(q) || String(translated?.summary || fallbackArticle.summary).toLowerCase().includes(q);
        const translatedCategories = translated?.categories || fallbackArticle.categories || [];
        const inCategories = [...article.categories, ...translatedCategories].some((c) => c.toLowerCase().includes(q));
        if (!inTitle && !inSummary && !inCategories) {
          return false;
        }
      }

      return true;
    });
  }, [articles, selectedCategory, searchQuery, readingLanguage.code, siteTranslations]);

  // Total pages calculation
  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / ARTICLES_PER_PAGE));

  // Current page items
  const displayedArticles = useMemo(() => {
    if (viewAll) {
      return filteredArticles;
    }
    const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
    return filteredArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
  }, [filteredArticles, currentPage, viewAll]);

  // Vitrin Makalesi (70. Orijinal Türkçe Makale): Canlı senkronizasyon ve vitrin sunumu
  const featuredArticle = useMemo<Article>(() => {
    const found70th = articles.find(a => 
      a.id === '8837081716175656566' || 
      a.title.includes('Evren Her Zaman Tekil Bir Olguydu') || 
      a.slug.includes('evren-her-zaman-tekil')
    );
    return found70th || FEATURED_70TH_ARTICLE;
  }, [articles]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Open article normally with global reading language
  const handleSelectArticle = (article: Article) => {
    setSelectedArticle(article);
    if (readingLanguage.code !== 'tr') {
      setSelectedArticleInitialLang({ code: readingLanguage.code, name: readingLanguage.name });
    } else {
      setSelectedArticleInitialLang(null);
    }
  };

  // Open article with specific language chip from card
  const handleSelectArticleWithLanguage = (article: Article, langCode: string, langName: string) => {
    setSelectedArticle(article);
    setSelectedArticleInitialLang({ code: langCode, name: langName });
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Header Bar */}
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        syncStatus={syncStatus}
        onTriggerSync={handleTriggerSync}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        readingLanguage={readingLanguage}
        onReadingLanguageChange={(lang) => { void handleReadingLanguageChange(lang); }}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenAuthorModal={() => setIsAuthorModalOpen(true)}
        onOpenInteractiveLab={() => setIsLabModalOpen(true)}
        onOpenPreviewConsole={() => setIsPreviewConsoleOpen(true)}
        onOpenSocialModal={() => setIsSocialModalOpen(true)}
        ui={ui}
        articleCount={filteredArticles.length}
      />

      {/* Sync Status Info Banner */}
      <SyncStatusBanner syncStatus={syncStatus} onRefresh={handleTriggerSync} />
      {(isChangingLanguage || languageNotice) && (
        <div className={`mx-auto mt-3 w-[calc(100%-2rem)] max-w-7xl rounded-xl border px-4 py-3 text-xs ${isChangingLanguage ? 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200' : 'border-neutral-200 bg-white text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300'}`} role="status" aria-live="polite">
          <div className="flex items-center gap-2">
            {isChangingLanguage && <Globe className="h-4 w-4 animate-pulse shrink-0" />}
            <span className="flex-1">{isChangingLanguage ? `${languageNotice} ${translationPercent}%` : languageNotice}</span>
            {!isChangingLanguage && <button type="button" onClick={() => setLanguageNotice('')} className="text-xs underline">Kapat</button>}
          </div>
          {isChangingLanguage && <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-amber-200 dark:bg-amber-900"><div className="h-full rounded-full bg-amber-600 transition-all duration-300" style={{ width: `${translationPercent}%` }} /></div>}
        </div>
      )}

      {/* Preview Viewport Frame Indicator when in Tablet or Mobile Mode */}
      {previewMode !== 'desktop' && (
        <div className="bg-amber-500 text-neutral-950 text-xs font-bold py-1.5 px-4 text-center flex items-center justify-center gap-2">
          <span>AI Studio Preview Modu: {previewMode === 'mobile' ? 'Mobil (375px)' : 'Tablet (768px)'}</span>
          <button
            onClick={() => setPreviewMode('desktop')}
            className="underline hover:opacity-80 text-[11px] font-mono cursor-pointer"
          >
            Tam Ekran Desktop'a Dön
          </button>
        </div>
      )}

      {/* Conditional rendering: Article View OR Catalog Index */}
      <div className={
        previewMode === 'mobile'
          ? 'w-full max-w-[420px] mx-auto border-x-4 border-amber-500/40 shadow-2xl rounded-3xl overflow-hidden my-4 bg-neutral-900/10 min-h-screen flex flex-col'
          : previewMode === 'tablet'
          ? 'w-full max-w-[820px] mx-auto border-x-4 border-amber-500/40 shadow-2xl rounded-3xl overflow-hidden my-4 bg-neutral-900/10 min-h-screen flex flex-col'
          : 'w-full flex-1 flex flex-col'
      }>
      {selectedArticle ? (
        <ArticleView
          article={selectedArticle}
          onBack={() => {
            setSelectedArticle(null);
            setSelectedArticleInitialLang(null);
          }}
          onOpenAuthorModal={() => setIsAuthorModalOpen(true)}
          initialLanguage={selectedArticleInitialLang || { code: readingLanguage.code, name: readingLanguage.name }}
        />
      ) : (
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 w-full">
          
          {/* Hero Section with Emre Pelit Author Profile Card & Interactive Lab Quick Access */}
          <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-neutral-900 via-neutral-900 to-neutral-950 text-white p-6 sm:p-10 lg:p-14 mb-12 shadow-2xl border border-neutral-800">
            {/* Background subtle geometry */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
              
              <div className="max-w-2xl space-y-5 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider flex-wrap">
                  <Compass className="w-4 h-4 text-amber-400" />
                  <span>{ui.heroPill}</span>
                </div>

                <h1 className="font-reading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100 leading-tight">
                  {ui.heroTitle}
                </h1>

                <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-sans">
                  {ui.heroDescription}
                </p>

                {/* Multilingual Inspection Guidance Note */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-left">
                  <Globe className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="text-amber-300 block font-bold">
                      {ui.heroUniversalNoteTitle}
                    </strong>
                    <span className="text-neutral-300">
                      {ui.heroUniversalNoteDesc}
                    </span>
                  </div>
                </div>

                {/* Badges strip */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>{readingLanguage.flag} {articles.length} {ui.heroArticlesCount}</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-800/80 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>{ui.heroZeroVuln}</span>
                  </span>

                  <button
                    onClick={() => setIsLabModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>{ui.heroOpenLab}</span>
                  </button>
                </div>
              </div>

              {/* Author Showcase Card (Clickable) */}
              <div
                onClick={() => setIsAuthorModalOpen(true)}
                className="group relative w-full max-w-sm rounded-3xl bg-neutral-950/80 border-2 border-amber-500/40 p-6 sm:p-8 text-center space-y-4 hover:border-amber-400 transition-all hover:scale-[1.02] shadow-2xl cursor-pointer"
              >
                <div className="relative inline-block">
                  <img
                    src="/author.jpg"
                    alt="Emre Pelit"
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover mx-auto border-3 border-amber-500 shadow-xl group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-amber-500 text-neutral-950 font-black text-[10px] tracking-wider uppercase">
                    {ui.authorTitle}
                  </span>
                </div>

                <div>
                  <h3 className="font-title text-xl sm:text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    {ui.authorTitle}
                  </h3>
                  <p className="text-xs text-amber-400/90 font-medium mt-1">
                    {ui.authorRole}
                  </p>
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-3">
                    {ui.authorBio}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
                  <span>{ui.viewAuthorProfile}</span>
                  <span>→</span>
                </div>
              </div>

            </div>
          </section>

          {/* 70. Orijinal Türkçe Makale - Vitrin Bölümü */}
          <FeaturedShowcase
            article={featuredArticle}
            onSelect={handleSelectArticle}
            onSelectWithLanguage={(art, lang) => handleSelectArticleWithLanguage(art, lang.code, lang.name)}
            readingLanguage={readingLanguage}
            ui={ui}
            siteTranslation={siteTranslations[featuredArticle.id] || siteTranslations[featuredArticle.slug]}
          />

          {/* Konu Kümeleri (Topic Clusters) ve Pillar Sayfa Kürsüsü */}
          <section className="mb-10 p-6 sm:p-8 rounded-3xl bg-neutral-900/90 border border-neutral-800 text-white shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{ui.clustersPill}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-title text-neutral-100">
                  {ui.clustersTitle}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  {ui.clustersSubtitle}
                </p>
              </div>
              <a
                href="/analytics.html"
                className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold shrink-0"
              >
                <span>{ui.clustersMapLink}</span>
                <span>→</span>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TOPIC_CLUSTERS.map((cluster) => {
                const pillarArt = articles.find(a => a.slug === cluster.pillarSlug);
                const clusterName = readingLanguage.code !== 'tr' ? (cluster.nameEn || cluster.name) : cluster.name;
                return (
                  <div
                    key={cluster.id}
                    className="p-5 rounded-2xl bg-neutral-950/60 border border-neutral-800 hover:border-amber-500/50 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                        {ui.pillarThesis}
                      </span>
                      <h3 className="font-bold text-sm text-neutral-200 group-hover:text-amber-300 transition-colors line-clamp-2">
                        {clusterName}
                      </h3>
                      <p className="text-xs text-neutral-400 mt-2 line-clamp-2 leading-relaxed">
                        {cluster.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          if (pillarArt) {
                            handleSelectArticle(pillarArt);
                          } else {
                            setSearchQuery(cluster.keywords[0]);
                          }
                        }}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>{ui.openPillarArticle}</span>
                        <span>→</span>
                      </button>
                      <button
                        onClick={() => {
                          setSearchQuery(cluster.keywords[0]);
                          window.scrollTo({ top: 850, behavior: 'smooth' });
                        }}
                        className="text-[11px] px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                        title={ui.filterCluster}
                      >
                        {ui.filterCluster}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Catalog Controls: Categories, Examination Language & View Toggle */}
          <section className="mb-8 space-y-4">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>{ui.catalogTitle}: <strong>{filteredArticles.length}</strong> / {articles.length} {ui.heroArticlesCount}</span>
                </h2>

                <button
                  onClick={() => setIsLabModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <FlaskConical className="w-3 h-3 text-amber-500" />
                  <span>{ui.interactiveLab}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* View All vs Paginated Toggle */}
                <div className="flex items-center rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-0.5 text-xs">
                  <button
                    onClick={() => setViewAll(false)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      !viewAll 
                        ? 'bg-amber-600 text-white shadow-sm' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {ui.paginatedView} ({totalPages})
                  </button>
                  <button
                    onClick={() => setViewAll(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      viewAll 
                        ? 'bg-amber-600 text-white shadow-sm' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    {ui.viewAll} ({filteredArticles.length})
                  </button>
                </div>

                {/* Global Reading Language Shortcut Pills */}
                <div className="hidden xl:flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
                  <span className="text-[11px] font-semibold text-neutral-500 px-2 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    <span>{ui.examinationLang}</span>
                  </span>
                  {READING_LANGUAGES.slice(0, 5).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { void handleReadingLanguageChange(lang); }}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        readingLanguage.code === lang.code
                          ? 'bg-amber-600 text-white font-bold shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      title={`${lang.name} ${ui.previewInLang}`}
                    >
                      <span>{lang.flag} {lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Category Pills Slider */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950 shadow-sm font-semibold scale-[1.02]'
                      : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
                  }`}
                >
                  {cat === 'Tümü' ? ui.allCategory : (translatedCategoryLabels[cat] || translateCategory(cat, readingLanguage.code))}
                </button>
              ))}
            </div>
          </section>

          {/* Articles Grid */}
          {displayedArticles.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8 space-y-4">
              <SearchX className="w-12 h-12 text-neutral-400 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                {ui.noArticlesFound}
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                {ui.noArticlesDesc}
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Tümü');
                }}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
              >
                {ui.resetFilters}
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {displayedArticles.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onSelect={handleSelectArticle}
                    onSelectWithLanguage={handleSelectArticleWithLanguage}
                    readingLanguage={readingLanguage}
                    ui={ui}
                    siteTranslation={siteTranslations[article.id] || siteTranslations[article.slug]}
                  />
                ))}
              </div>

              {/* Pagination Controls when not in View-All mode */}
              {!viewAll && totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    <strong>{filteredArticles.length}</strong> {ui.heroArticlesCount} — <strong>{(currentPage - 1) * ARTICLES_PER_PAGE + 1}</strong> - <strong>{Math.min(currentPage * ARTICLES_PER_PAGE, filteredArticles.length)}</strong> {ui.showingRange}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* First Page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                      title={ui.firstPage}
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                      title={ui.prevPage}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1 px-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                        .map((page, index, array) => {
                          const showEllipsis = index > 0 && page - array[index - 1] > 1;
                          return (
                            <React.Fragment key={page}>
                              {showEllipsis && (
                                <span className="px-1 text-xs text-neutral-400">...</span>
                              )}
                              <button
                                onClick={() => handlePageChange(page)}
                                className={`w-8 h-8 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                  currentPage === page
                                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 font-bold scale-105'
                                    : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
                                }`}
                              >
                                {page}
                              </button>
                            </React.Fragment>
                          );
                        })}
                    </div>

                    {/* Next Page */}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                      title={ui.nextPage}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                      title={ui.lastPage}
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

        </main>
      )}
      </div>

      {/* Floating Preview Konsolu launcher for rapid access in AI Studio */}
            {/* Socratic Thought Partner launcher */}
      <button
        onClick={() => setIsSocraticOpen(true)}
        className="fixed bottom-6 left-6 z-40 p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-sky-400 border border-sky-500/50 shadow-2xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer group"
        title="Sokratik Düşünce Partneri"
        aria-label="Sokratik Partneri Aç"
      >
        <Brain className="w-5 h-5 text-sky-400" />
        <span className="text-xs font-bold font-title pr-1 hidden sm:inline text-white">
          Sokratik Partner
        </span>
      </button>

<button
        onClick={() => setIsPreviewConsoleOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-neutral-900 hover:bg-neutral-800 text-amber-400 border border-amber-500/50 shadow-2xl hover:scale-105 transition-all flex items-center gap-2 cursor-pointer group"
        title="AI Studio Preview Konsolunu Aç"
        aria-label="Preview Konsolunu Aç"
      >
        <Terminal className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold font-title pr-1 hidden sm:inline text-white">
          {ui.previewConsole}
        </span>
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
      </button>

      {/* AI Studio Live Preview & Audit Console Drawer */}
      <PreviewConsoleDrawer
        isOpen={isPreviewConsoleOpen}
        onClose={() => setIsPreviewConsoleOpen(false)}
        currentLanguage={readingLanguage}
        onLanguageChange={(lang) => { void handleReadingLanguageChange(lang); }}
        ui={ui}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onOpenSocialModal={() => setIsSocialModalOpen(true)}
      />

      {/* Author Profile Modal */}
      {isAuthorModalOpen && (
        <AuthorProfileModal
          isOpen={isAuthorModalOpen}
          onClose={() => setIsAuthorModalOpen(false)}
          onOpenSocialModal={() => setIsSocialModalOpen(true)}
        />
      )}

      {/* Social Media & Broadcast Center Modal */}
      {isSocialModalOpen && (
        <SocialShareModal
          isOpen={isSocialModalOpen}
          onClose={() => setIsSocialModalOpen(false)}
          canonicalUrl="https://sci-phil.ai.studio"
        />
      )}

      {/* Security Audit Verification Modal */}
      {isSecurityModalOpen && (
        <SecurityBadgeModal
          isOpen={isSecurityModalOpen}
          onClose={() => setIsSecurityModalOpen(false)}
        />
      )}

      {/* Interactive Philosophy & Science Lab Modal */}
      {isLabModalOpen && (
        <InteractiveLabModal
          isOpen={isLabModalOpen}
          onClose={() => setIsLabModalOpen(false)}
        />
      )}

            {/* Socratic Thought Partner Modal */}
      {isSocraticOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsSocraticOpen(false)}
              className="absolute top-2 right-2 z-10 p-2 rounded-full bg-slate-800 text-white hover:bg-slate-700"
              aria-label="Kapat"
            >
              ✕
            </button>
            <SocraticPartner lang={readingLanguage.code === 'en' ? 'en' : 'tr'} />
          </div>
        </div>
      )}

{/* Portal Footer */}
      <footer className="border-t border-neutral-200/80 dark:border-neutral-800/80 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-sm mt-auto py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
          <div className="flex items-center gap-3">
            <img
              src="/author.jpg"
              alt="Emre Pelit"
              className="w-8 h-8 rounded-full object-cover border border-amber-500/60"
            />
            <div>
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">
                Science &amp; Philosophy • sci-phil.ai.studio
              </p>
              <p className="text-[11px]">
                {ui.footerTagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsSocialModalOpen(true)}
              className="hover:text-sky-400 transition-colors flex items-center gap-1 font-semibold text-sky-400 cursor-pointer"
              title="Sosyal Medya ve Topluluk Paylaşım Merkezi"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Sosyal Paylaşım</span>
            </button>
            <button
              onClick={() => setIsPreviewConsoleOpen(true)}
              className="hover:text-amber-500 transition-colors flex items-center gap-1 font-semibold text-amber-500 cursor-pointer"
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>{ui.previewConsole}</span>
            </button>
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="hover:text-emerald-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>{ui.heroZeroVuln}</span>
            </button>
            <button
              onClick={() => setIsLabModalOpen(true)}
              className="hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
              <span>{ui.interactiveLab}</span>
            </button>
            <a
              href="/analytics.html"
              className="hover:text-amber-500 transition-colors flex items-center gap-1 font-medium"
              title="Herkese açık salt okunur analytics paneli"
            >
              <ChartNoAxesCombined className="w-3.5 h-3.5 text-sky-400" />
              <span>{ui.liveAnalytics}</span>
            </a>
            <a
              href="/docs"
              className="hover:text-amber-500 transition-colors flex items-center gap-1 font-medium"
              title="OpenAPI ve Mobil REST API Dokümantasyonu"
            >
              <FileCode2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>{ui.restApiDocs}</span>
            </a>
            <a
              href="/sitemap.xml"
              className="hover:text-amber-500 transition-colors"
              title="XML Site Haritası"
            >
              {ui.sitemapLink}
            </a>
            <a
              href="https://emrepelit7337.blogspot.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-500 transition-colors"
            >
              emrepelit7337.blogspot.com
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
