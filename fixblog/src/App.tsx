/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Header, READING_LANGUAGES, ReadingLanguageOption } from './components/Header';
import { SyncStatusBanner } from './components/SyncStatusBanner';
import { ArticleCard } from './components/ArticleCard';
import { ArticleView } from './components/ArticleView';
import { AuthorProfileModal } from './components/AuthorProfileModal';
import { SecurityBadgeModal } from './components/SecurityBadgeModal';
import { InteractiveLabModal } from './components/interactive/InteractiveLabModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { RECOVERED_TURKISH_ARTICLES, RECOVERED_ARTICLES_UPDATED_AT } from './data/recoveredTurkishArticles';
import { Article, SyncStatus } from './types/article';
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
  Award
} from 'lucide-react';

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
  const [readingLanguage, setReadingLanguage] = useState<ReadingLanguageOption>(READING_LANGUAGES[0]);
  
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  
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

  // Fetch all synchronized authentic Turkish articles from backend on mount
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles');
        if (response.ok) {
          const data = await response.json();
          // Never replace the complete packaged archive with an incomplete API response.
          if (Array.isArray(data.articles) && data.articles.length >= RECOVERED_TURKISH_ARTICLES.length) {
            setArticles(data.articles);
            setSyncStatus({
              status: 'success',
              lastSynced: data.lastSynced || RECOVERED_ARTICLES_UPDATED_AT,
              totalArticles: data.articles.length,
              sourceUrl: 'https://emrepelit7337.blogspot.com',
            });
          }
        }
      } catch (err) {
        console.warn('Initial articles fetch failed; using seed articles cache.', err);
      }
    };

    fetchArticles();
  }, []);

  // Trigger manual synchronization with emrepelit7337.blogspot.com
  const handleTriggerSync = async () => {
    setSyncStatus((prev) => ({ ...prev, status: 'syncing' }));
    try {
      const res = await fetch('/api/sync-blog', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.articles) && data.articles.length >= RECOVERED_TURKISH_ARTICLES.length) {
        setArticles(data.articles);
        setSyncStatus({
          status: 'success',
          lastSynced: data.lastSynced || RECOVERED_ARTICLES_UPDATED_AT,
          totalArticles: data.articles.length,
          sourceUrl: 'https://emrepelit7337.blogspot.com',
        });
      } else {
        // The current bundled archive remains visible if a sync endpoint fails or returns only a few seeds.
        setSyncStatus((prev) => ({
          ...prev,
          status: 'error',
          totalArticles: Math.max(prev.totalArticles, RECOVERED_TURKISH_ARTICLES.length),
          error: data.message || `Eksik senkron yanıtı: korunan ${RECOVERED_TURKISH_ARTICLES.length} makalelik arşiv değiştirilmedi.`,
        }));
      }
    } catch (error: any) {
      setSyncStatus((prev) => ({
        ...prev,
        status: 'error',
        error: error.message || 'Senkronizasyon hatası',
      }));
    }
  };

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
        const inTitle = article.title.toLowerCase().includes(q);
        const inSummary = article.summary.toLowerCase().includes(q);
        const inCategories = article.categories.some((c) => c.toLowerCase().includes(q));
        if (!inTitle && !inSummary && !inCategories) {
          return false;
        }
      }

      return true;
    });
  }, [articles, selectedCategory, searchQuery]);

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
        onReadingLanguageChange={setReadingLanguage}
        onOpenSecurityModal={() => setIsSecurityModalOpen(true)}
        onOpenAuthorModal={() => setIsAuthorModalOpen(true)}
        onOpenInteractiveLab={() => setIsLabModalOpen(true)}
        articleCount={filteredArticles.length}
      />

      {/* Sync Status Info Banner */}
      <SyncStatusBanner syncStatus={syncStatus} onRefresh={handleTriggerSync} />

      {/* Conditional rendering: Article View OR Catalog Index */}
      {selectedArticle ? (
        <ArticleView
          article={selectedArticle}
          onBack={() => {
            setSelectedArticle(null);
            setSelectedArticleInitialLang(null);
          }}
          onOpenAuthorModal={() => setIsAuthorModalOpen(true)}
          initialLanguage={selectedArticleInitialLang}
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
                  <span>Bilim, Zihin Felsefesi & Bilinç Araştırmaları • sci-phil.ai.studio</span>
                </div>

                <h1 className="font-reading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-neutral-100 leading-tight">
                  Bilim ve Zihin Felsefesi Kürsüsü
                </h1>

                <p className="text-base sm:text-lg text-neutral-300 leading-relaxed font-sans">
                  Emre Pelit tarafından kaleme alınmış <strong className="text-amber-400">orijinal Türkçe bilim ve felsefe külliyatı</strong>. Büyük Dil Modelleri’nden (LLM) nöral zaman algısına, kuantum kozmolojisinden blok evrene kadar derin düşünsel tezler.
                </p>

                {/* Multilingual Inspection Guidance Note */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-left">
                  <Globe className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <strong className="text-amber-300 block font-bold">
                      🌐 Evrensel Çok Dilli İnceleme Desteği
                    </strong>
                    <span className="text-neutral-300">
                      Uygulamada yazarın orijinal Türkçe makaleleri yer almaktadır. Dilediğiniz makaleyi tek tıkla <strong>İngilizce, Almanca, Fransızca, İspanyolca, İtalyanca, Rusça, Arapça, Japonca</strong> veya dilediğiniz dünya dilinde akademik çeviri, doğal seslendirme ve yapay zeka itiraz çözümüyle inceleyebilirsiniz.
                    </span>
                  </div>
                </div>

                {/* Badges strip */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 font-medium">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>🇹🇷 {articles.length} Orijinal Türkçe Makale</span>
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/60 text-amber-300 border border-amber-800/80 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                    <span>Sıfır Açık & Güvenli Mimari</span>
                  </span>

                  <button
                    onClick={() => setIsLabModalOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
                  >
                    <FlaskConical className="w-3.5 h-3.5" />
                    <span>İnteraktif Laboratuvarı Aç</span>
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
                    Yazar
                  </span>
                </div>

                <div>
                  <h3 className="font-title text-xl sm:text-2xl font-bold text-white group-hover:text-amber-400 transition-colors">
                    Emre Pelit
                  </h3>
                  <p className="text-xs text-amber-400/90 font-medium mt-1">
                    Bilim & Zihin Felsefesi Araştırmacısı
                  </p>
                  <p className="text-xs text-neutral-400 mt-2 line-clamp-3">
                    Büyük Dil Modelleri, yapay zeka ontolojisi, zamanın simülasyon mekaniği ve zihin felsefesi üzerine eleştirel felsefi yayınlar.
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800 text-xs text-neutral-400 flex items-center justify-between">
                  <span>Yazar Profilini İncele</span>
                  <span>→</span>
                </div>
              </div>

            </div>
          </section>

          {/* Catalog Controls: Categories, Examination Language & View Toggle */}
          <section className="mb-8 space-y-4">
            
            {/* Top Toolbar */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>Makale Dizini: <strong>{filteredArticles.length}</strong> / {articles.length} Orijinal Türkçe Makale</span>
                </h2>

                <button
                  onClick={() => setIsLabModalOpen(true)}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-colors cursor-pointer"
                >
                  <FlaskConical className="w-3 h-3 text-amber-500" />
                  <span>İnteraktif Laboratuvar</span>
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
                    Sayfalı Görünüm ({totalPages} Sayfa)
                  </button>
                  <button
                    onClick={() => setViewAll(true)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      viewAll 
                        ? 'bg-amber-600 text-white shadow-sm' 
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    Tümünü Göster ({filteredArticles.length})
                  </button>
                </div>

                {/* Global Reading Language Shortcut Pills */}
                <div className="hidden xl:flex items-center gap-1 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-xs">
                  <span className="text-[11px] font-semibold text-neutral-500 px-2 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-amber-500" />
                    <span>İnceleme:</span>
                  </span>
                  {READING_LANGUAGES.slice(0, 5).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setReadingLanguage(lang)}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                        readingLanguage.code === lang.code
                          ? 'bg-amber-600 text-white font-bold shadow-sm'
                          : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                      title={`${lang.name} dilinde incele`}
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
                  {cat}
                </button>
              ))}
            </div>
          </section>

          {/* Articles Grid */}
          {displayedArticles.length === 0 ? (
            <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-300 dark:border-neutral-800 p-8 space-y-4">
              <SearchX className="w-12 h-12 text-neutral-400 mx-auto" />
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                Aradığınız kriterlere uygun makale bulunamadı
              </h3>
              <p className="text-sm text-neutral-500 max-w-md mx-auto">
                Arama kelimenizi değiştirebilir veya kategori filtresini temizleyebilirsiniz.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Tümü');
                }}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors cursor-pointer"
              >
                Filtreleri Sıfırla
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
                  />
                ))}
              </div>

              {/* Pagination Controls when not in View-All mode */}
              {!viewAll && totalPages > 1 && (
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-sm">
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Toplam <strong>{filteredArticles.length}</strong> orijinal makaleden <strong>{(currentPage - 1) * ARTICLES_PER_PAGE + 1}</strong> - <strong>{Math.min(currentPage * ARTICLES_PER_PAGE, filteredArticles.length)}</strong> arası gösteriliyor
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* First Page */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                      title="İlk Sayfa"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </button>

                    {/* Previous Page */}
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Önceki Sayfa"
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
                      title="Sonraki Sayfa"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>

                    {/* Last Page */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Son Sayfa"
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

      {/* Author Profile Modal */}
      {isAuthorModalOpen && (
        <AuthorProfileModal
          isOpen={isAuthorModalOpen}
          onClose={() => setIsAuthorModalOpen(false)}
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
                Science & Philosophy • sci-phil.ai.studio
              </p>
              <p className="text-[11px]">
                Yazar: Emre Pelit | Orijinal Türkçe Külliyat & Çok Dilli Çeviri Motoru
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <button
              onClick={() => setIsSecurityModalOpen(true)}
              className="hover:text-emerald-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Sıfır Açık & Güvenlik</span>
            </button>
            <button
              onClick={() => setIsLabModalOpen(true)}
              className="hover:text-amber-500 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-500" />
              <span>İnteraktif Laboratuvar</span>
            </button>
            <a
              href="/analytics"
              className="hover:text-sky-500 transition-colors inline-flex items-center gap-1"
            >
              <span>Public Analytics</span>
            </a>
            <a
              href="https://emrepelit7337.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-amber-500 transition-colors"
            >
              Blog Ana Sayfa
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
