import React, { useState } from 'react';
import { Globe, Sparkles, RefreshCw, Check, ArrowRight, RotateCcw } from 'lucide-react';

interface LanguageSelectorProps {
  currentLanguage: string;
  onTranslate: (targetLangName: string, targetLangCode: string) => Promise<void>;
  isTranslating: boolean;
  onResetOriginal?: () => void;
}

export const LANGUAGES = [
  { code: 'tr', label: 'Türkçe', native: 'Türkçe' },
  { code: 'en', label: 'English', native: 'English' },
  { code: 'de', label: 'German', native: 'Deutsch' },
  { code: 'fr', label: 'French', native: 'Français' },
  { code: 'es', label: 'Spanish', native: 'Español' },
  { code: 'it', label: 'Italian', native: 'Italiano' },
  { code: 'ru', label: 'Russian', native: 'Русский' },
  { code: 'ar', label: 'Arabic', native: 'العربية' },
  { code: 'ja', label: 'Japanese', native: '日本語' },
  { code: 'zh', label: 'Chinese', native: '中文' },
  { code: 'pt', label: 'Portuguese', native: 'Português' },
  { code: 'nl', label: 'Dutch', native: 'Nederlands' },
  { code: 'ko', label: 'Korean', native: '한국어' },
  { code: 'la', label: 'Latin', native: 'Lingua Latina' },
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  currentLanguage,
  onTranslate,
  isTranslating,
  onResetOriginal,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customLanguage, setCustomLanguage] = useState('');

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customLanguage.trim()) return;
    setIsOpen(false);
    onTranslate(customLanguage.trim(), customLanguage.trim().slice(0, 3).toLowerCase());
    setCustomLanguage('');
  };

  const getLanguageLabel = (code: string) => {
    const found = LANGUAGES.find((l) => l.code === code.toLowerCase());
    return found ? found.native : code.toUpperCase();
  };

  return (
    <div className="relative inline-block text-left">
      <div className="flex items-center gap-1">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isTranslating}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/60 text-xs font-bold text-amber-900 dark:text-amber-200 shadow-sm transition-all cursor-pointer"
          title="Makaleyi istediğiniz herhangi bir doğal dile çevirin"
        >
          {isTranslating ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600 dark:text-amber-400" />
          ) : (
            <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          )}
          <span>{isTranslating ? 'Çevriliyor...' : `Dili Değiştir: ${getLanguageLabel(currentLanguage)}`}</span>
        </button>

        {onResetOriginal && currentLanguage !== 'tr' && (
          <button
            onClick={onResetOriginal}
            className="p-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            title="Orijinal dile geri dön"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-2xl z-50 p-3 animate-in fade-in duration-150">
            <div className="px-2 py-1.5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Doğal Dil Seçimi
              </span>
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950">
                Gemini 3.8 Flash
              </span>
            </div>

            {/* Custom Language Form */}
            <form onSubmit={handleCustomSubmit} className="mb-2">
              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  placeholder="Başka bir dil yazın (ör: Antik Yunanca)..."
                  value={customLanguage}
                  onChange={(e) => setCustomLanguage(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  disabled={!customLanguage.trim()}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            <div className="max-h-60 overflow-y-auto py-1 space-y-0.5 scrollbar-thin">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setIsOpen(false);
                    onTranslate(lang.label, lang.code);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors cursor-pointer ${
                    currentLanguage.toLowerCase() === lang.code
                      ? 'bg-amber-500/15 text-amber-900 dark:text-amber-200 font-bold'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-neutral-400 uppercase w-5 text-left">
                      {lang.code}
                    </span>
                    <span>{lang.native}</span>
                  </span>
                  {currentLanguage.toLowerCase() === lang.code && (
                    <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
