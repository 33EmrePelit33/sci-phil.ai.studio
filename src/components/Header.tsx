import React, { useState } from 'react';
import { 
  RefreshCw, 
  ShieldCheck, 
  Search, 
  BookOpen, 
  ExternalLink, 
  Sparkles, 
  SlidersHorizontal, 
  FlaskConical,
  Globe,
  ChartNoAxesCombined,
  Terminal,
  Share2,
  Home,
  Layers,
  User,
  Menu,
  X
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { PWAInstallButton } from './PWAInstallButton';
import { SyncStatus } from '../types/article';
import { UiTranslations, getTranslations } from '../utils/i18n';

export interface ReadingLanguageOption {
  code: string;
  name: string;
  native: string;
  flag: string;
}

export const READING_LANGUAGES: ReadingLanguageOption[] = [
  { code: 'tr', name: 'Türkçe', native: 'Türkçe (Orijinal)', flag: '🇹🇷' },
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { code: 'ja', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'zh', name: 'Chinese', native: '中文', flag: '🇨🇳' },
];

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  syncStatus: SyncStatus;
  onTriggerSync: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  readingLanguage: ReadingLanguageOption;
  onReadingLanguageChange: (lang: ReadingLanguageOption) => void;
  onOpenSecurityModal: () => void;
  onOpenAuthorModal: () => void;
  onOpenInteractiveLab: () => void;
  onOpenPreviewConsole?: () => void;
  onOpenSocialModal?: () => void;
  onOpenAnalyticsModal?: () => void;
  ui?: UiTranslations;
  articleCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  syncStatus,
  onTriggerSync,
  searchQuery,
  onSearchChange,
  readingLanguage,
  onReadingLanguageChange,
  onOpenSecurityModal,
  onOpenAuthorModal,
  onOpenInteractiveLab,
  onOpenPreviewConsole,
  onOpenSocialModal,
  onOpenAnalyticsModal,
  ui: propUi,
  articleCount,
}) => {
  const ui = propUi || getTranslations(readingLanguage.code);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/95 dark:bg-neutral-950/95 backdrop-blur-md shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* ÜST KATMAN: Logo, Arama Çubuğu & Hızlı Araçlar */}
        <div className="flex items-center justify-between min-h-[4.25rem] py-2 gap-3">
          
          {/* Brand Logo & Title with Author Avatar */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Clickable Author Profile Photo */}
            <button
              onClick={onOpenAuthorModal}
              className="relative group p-0.5 rounded-2xl border-2 border-amber-500 hover:scale-105 transition-transform cursor-pointer"
              title="Yazar Profili: Emre Pelit"
              aria-label="Yazar profilini aç"
            >
              <img
                src="/author.jpg"
                alt="Emre Pelit"
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover bg-neutral-200 dark:bg-neutral-800 shadow-md shadow-amber-500/20"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="font-title text-base sm:text-xl font-bold tracking-wider text-neutral-900 dark:text-neutral-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                >
                  SCIENCE &amp; PHILOSOPHY
                </a>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                  sci-phil.ai.studio
                </span>
              </div>
              <p 
                onClick={onOpenAuthorModal}
                className="text-xs text-neutral-500 dark:text-neutral-400 font-medium hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              >
                {ui.brandSubtitle}
              </p>
            </div>
          </div>

          {/* Canlı Arama Çubuğu (Desktop) */}
          <div className="hidden lg:flex items-center flex-1 max-w-sm mx-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder={ui.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-1.5 text-xs rounded-full bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  {ui.searchClear}
                </button>
              )}
            </div>
          </div>

          {/* Sağ Hızlı Araçlar */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* AI Studio Live Preview Console Button */}
            <button
              onClick={onOpenPreviewConsole}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/40 text-purple-700 dark:text-purple-300 transition-all cursor-pointer shadow-sm hover:scale-[1.02]"
              title="AI Studio Önizleme & Preview Konsolu (Cihaz görünümü, SEO, Core Web Vitals, API)"
            >
              <Terminal className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span className="hidden sm:inline">{ui.previewConsole}</span>
              <span className="sm:hidden">Preview</span>
            </button>

            {/* Live Analytics — first-party dashboard */}
            <a
              href="/analytics.html"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && onOpenAnalyticsModal) {
                  e.preventDefault();
                  onOpenAnalyticsModal();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/40 text-sky-800 dark:text-sky-300 transition-colors shadow-sm cursor-pointer"
              title="Canlı ziyaretçi, sayfa görüntüleme ve kümülatif istatistikler panelini aç"
              aria-label="Canlı Analytics panelini aç"
            >
              <ChartNoAxesCombined className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{ui.liveAnalytics}</span>
              <span className="sm:hidden">Stats</span>
            </a>
            
            {/* Global Target Reading Language Picker */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer"
                title={`${ui.readingLangLabel}: ${readingLanguage.name}`}
              >
                <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden xl:inline">{ui.readingLangLabel}:</span>
                <span className="font-bold">{readingLanguage.flag} {readingLanguage.name}</span>
              </button>

              {showLangDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLangDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 p-2 animate-in fade-in duration-150">
                    <div className="px-2.5 py-1.5 border-b border-neutral-100 dark:border-neutral-800 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                        {ui.readingLangLabel} (AI Çeviri)
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-0.5">
                      {READING_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          data-lang={lang.code}
                          data-language={lang.code}
                          onClick={() => {
                            onReadingLanguageChange(lang);
                            setShowLangDropdown(false);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                            readingLanguage.code === lang.code
                              ? 'bg-amber-500/20 text-amber-900 dark:text-amber-200 font-bold'
                              : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.native}</span>
                          </span>
                          {lang.code === 'tr' && (
                            <span className="text-[9px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              ORİJİNAL
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Dark/Light Mode Switcher */}
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />

            {/* Mobil Menü Açma/Kapama Butonu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
              aria-label="Üst Menüyü Aç"
              title="Gezinti Menüsü"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* ENTEGRE ÜST MENÜ GEZİNTİ BAR (DESKTOP NAV) */}
        <nav 
          aria-label="Ana Gezinti Menüsü"
          className="hidden lg:flex items-center justify-between border-t border-neutral-200/60 dark:border-neutral-800/60 py-2 text-xs"
        >
          <div className="flex items-center gap-1 xl:gap-2 flex-wrap">
            {/* Ana Sayfa */}
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>{ui.navHome || 'Ana Sayfa'}</span>
            </button>

            {/* Makale Külliyatı */}
            <button
              onClick={() => scrollToSection('kulliyat')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>{ui.navCatalog || 'Makale Külliyatı'}</span>
              <span className="px-1.5 py-0.2 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] font-mono font-bold">
                {articleCount}
              </span>
            </button>

            {/* Konu Kümeleri */}
            <button
              onClick={() => scrollToSection('kumeler')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>{ui.navClusters || ui.clustersPill || 'Konu Kümeleri'}</span>
            </button>

            {/* İnteraktif Laboratuvar */}
            <button
              onClick={onOpenInteractiveLab}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border border-amber-500/30 transition-all cursor-pointer"
              title="İnteraktif Deneyler & Simülasyonlar (Çin Odası, Blok Evren, Safsata Dedektörü)"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>{ui.interactiveLab}</span>
            </button>

            {/* Yazar Profili (E-E-A-T) */}
            <button
              onClick={onOpenAuthorModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" />
              <span>{ui.navAuthor || 'Yazar: Emre Pelit'}</span>
            </button>

            {/* Canlı Analitik Paneli */}
            <a
              href="/analytics.html"
              onClick={(e) => {
                if (!e.ctrlKey && !e.metaKey && onOpenAnalyticsModal) {
                  e.preventDefault();
                  onOpenAnalyticsModal();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold bg-sky-500/10 text-sky-800 dark:text-sky-300 hover:bg-sky-500/20 border border-sky-500/30 transition-all cursor-pointer"
              title="Kümülatif Analitik Panelini Aç (Birleşik Net Okuma & Kümülatif Toplam Görüntüleme)"
            >
              <ChartNoAxesCombined className="w-3.5 h-3.5 text-sky-500" />
              <span>{ui.liveAnalytics || 'Canlı Analitik'}</span>
            </a>

            {/* Blog Ana Sayfa (emrepelit7337.blogspot.com) */}
            <a
              href="https://emrepelit7337.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl font-medium text-amber-800 dark:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 transition-colors"
              title="Orijinal Blogger Ana Sayfası"
            >
              <span>Blog Ana Sayfa</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Sağ Bilgi & Eylem Rozetleri */}
          <div className="flex items-center gap-2">
            {/* Sıfır Açık Güvenlik Rozeti */}
            <button
              onClick={onOpenSecurityModal}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer shrink-0 font-medium"
              title="Güvenlik mimarisini görüntüle"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{ui.heroZeroVuln || 'Sıfır Açık'}</span>
            </button>

            {/* Blogger Senkronizasyonu */}
            <button
              onClick={onTriggerSync}
              disabled={syncStatus.status === 'syncing'}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/80 transition-colors disabled:opacity-60 cursor-pointer"
              title="emrepelit7337.blogspot.com ile anlık senkronizasyon"
            >
              <RefreshCw className={`w-3 h-3 text-amber-600 dark:text-amber-400 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
              <span>{syncStatus.status === 'syncing' ? ui.syncing : ui.syncBlogger}</span>
            </button>

            {/* Sosyal Paylaşım Merkezi */}
            {onOpenSocialModal && (
              <button
                onClick={onOpenSocialModal}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/30 hover:bg-sky-500/20 transition-colors cursor-pointer font-medium"
                title="Sosyal Medya ve Topluluk Paylaşım Merkezi"
              >
                <Share2 className="w-3 h-3 text-sky-500" />
                <span>{ui.share || 'Paylaş'}</span>
              </button>
            )}
          </div>
        </nav>

        {/* MOBİL VE TABLET ENTEGRE MENÜ ÇEKMECESİ */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-neutral-200 dark:border-neutral-800 space-y-4 animate-in fade-in duration-200">
            
            {/* Mobil Arama Çubuğu */}
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder={ui.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>

            {/* Mobil Gezinti Bağlantıları */}
            <div className="grid grid-cols-2 gap-2 text-xs font-medium">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200"
              >
                <Home className="w-4 h-4 text-amber-500" />
                <span>{ui.navHome || 'Ana Sayfa'}</span>
              </button>

              <button
                onClick={() => scrollToSection('kulliyat')}
                className="flex items-center justify-between p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200"
              >
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-amber-500" />
                  <span>{ui.navCatalog || 'Külliyat'}</span>
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-400 font-mono font-bold text-[10px]">
                  {articleCount}
                </span>
              </button>

              <button
                onClick={() => scrollToSection('kumeler')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200"
              >
                <Layers className="w-4 h-4 text-indigo-500" />
                <span>{ui.navClusters || 'Konu Kümeleri'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenInteractiveLab();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30 font-semibold"
              >
                <FlaskConical className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>{ui.interactiveLab || 'İnteraktif Lab'}</span>
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthorModal();
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200"
              >
                <User className="w-4 h-4 text-sky-500" />
                <span>{ui.navAuthor || 'Yazar Profili'}</span>
              </button>

              <a
                href="/analytics.html"
                onClick={(e) => {
                  if (!e.ctrlKey && !e.metaKey && onOpenAnalyticsModal) {
                    e.preventDefault();
                    setMobileMenuOpen(false);
                    onOpenAnalyticsModal();
                  }
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-sky-500/15 text-sky-800 dark:text-sky-300 border border-sky-500/30 font-semibold cursor-pointer"
              >
                <ChartNoAxesCombined className="w-4 h-4 text-sky-500" />
                <span>{ui.liveAnalytics || 'Live Analytics'}</span>
              </a>

              <a
                href="https://emrepelit7337.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 col-span-2"
              >
                <span>Blog Ana Sayfa · Orijinal Blogger Blogu (emrepelit7337.blogspot.com)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Mobil Hedef Dil Şeridi */}
            <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <span className="text-[11px] font-semibold text-neutral-500 block mb-2">
                Hedef İnceleme Dili (AI Çeviri):
              </span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {READING_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onReadingLanguageChange(lang);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors flex items-center gap-1 ${
                      readingLanguage.code === lang.code
                        ? 'bg-amber-600 text-white font-bold shadow-sm'
                        : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200'
                    }`}
                  >
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </header>
  );
};
