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
  BarChart3
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { PWAInstallButton } from './PWAInstallButton';
import { SyncStatus } from '../types/article';

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
  articleCount,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [showLangDropdown, setShowLangDropdown] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800/80 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          
          {/* Brand Logo & Title with Author Avatar */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Clickable Author Profile Photo */}
            <button
              onClick={onOpenAuthorModal}
              className="relative group p-0.5 rounded-2xl border-2 border-amber-500 hover:scale-105 transition-transform cursor-pointer"
              title="Yazar Profili: Emre Pelit"
            >
              <img
                src="/author.jpg"
                alt="Emre Pelit"
                className="w-11 h-11 rounded-xl object-cover bg-neutral-200 dark:bg-neutral-800 shadow-md shadow-amber-500/20"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-title text-base sm:text-xl font-bold tracking-wider text-neutral-900 dark:text-neutral-100">
                  SCIENCE & PHILOSOPHY
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                  sci-phil.ai.studio
                </span>
              </div>
              <p 
                onClick={onOpenAuthorModal}
                className="text-xs text-neutral-500 dark:text-neutral-400 font-medium hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer transition-colors"
              >
                Emre Pelit • Bilimsel & Felsefi Düşünce Portalı
              </p>
            </div>
          </div>

          {/* Search bar on desktop */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Makale, konu veya felsefi kavram ara..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-full bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                >
                  Temizle
                </button>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Global Target Reading Language Picker */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer"
                title="Tüm makaleleri incelemek istediğiniz dili seçin"
              >
                <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="hidden sm:inline">İnceleme Dili:</span>
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
                        Hedef İnceleme Dili (AI Çeviri)
                      </span>
                    </div>
                    <div className="max-h-64 overflow-y-auto space-y-0.5">
                      {READING_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
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

            {/* Interactive Lab Modal Button */}
            <button
              onClick={onOpenInteractiveLab}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/25 transition-all shadow-sm cursor-pointer"
              title="İnteraktif Deneyler & Simülasyonlar (Çin Odası, Blok Evren, vb.)"
            >
              <FlaskConical className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span className="hidden md:inline">İnteraktif Laboratuvar</span>
              <span className="md:hidden">Lab</span>
            </button>

            {/* Public read-only analytics dashboard */}
            <a
              href="/analytics"
              aria-label="Herkese açık Analytics paneli"
              title="Salt okunur Analytics paneli"
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-400/30 hover:bg-sky-500/20 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Analytics</span>
            </a>

            {/* PWA Install Button */}
            <PWAInstallButton />

            {/* Sync with Blogger Button */}
            <button
              onClick={onTriggerSync}
              disabled={syncStatus.status === 'syncing'}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-neutral-100 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-800 border border-neutral-300 dark:border-neutral-700/80 transition-colors disabled:opacity-60 cursor-pointer"
              title="emrepelit7337.blogspot.com ile senkronize et"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-amber-600 dark:text-amber-400 ${syncStatus.status === 'syncing' ? 'animate-spin' : ''}`} />
              <span className="hidden lg:inline">Blogger Senkronize ({articleCount})</span>
              <span className="lg:hidden">({articleCount})</span>
            </button>

            {/* Zero Vulnerability Security Badge Button */}
            <button
              onClick={onOpenSecurityModal}
              className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
              title="Güvenlik mimarisini görüntüle"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden xl:inline">Sıfır Açık</span>
            </button>

            {/* Original Blog Link */}
            <a
              href="https://emrepelit7337.blogspot.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300 border border-amber-400/30 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-colors"
              aria-label="Blog Ana Sayfası: emrepelit7337.blogspot.com"
              title="Blog Ana Sayfasını aç"
            >
              <span>Blog Ana Sayfa</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            {/* Mobile Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300"
              aria-label="Filtreler"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* Dark/Light Mode Switcher */}
            <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
          </div>

        </div>

        {/* Mobile search & filter expanded row */}
        {(showFilters || searchQuery) && (
          <div className="lg:hidden pb-4 pt-1 border-t border-neutral-100 dark:border-neutral-900 space-y-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Makale, konu veya felsefi kavram ara..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100"
              />
            </div>
            
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <span className="text-neutral-500 text-[11px] shrink-0 font-medium">İnceleme Dili:</span>
              {READING_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => onReadingLanguageChange(lang)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium shrink-0 transition-colors flex items-center gap-1 ${
                    readingLanguage.code === lang.code
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200'
                  }`}
                >
                  <span>{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
