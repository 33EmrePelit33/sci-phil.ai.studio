import React, { useMemo } from 'react';
import { SectorEvaluation } from './SectorEvaluation';
import { Article } from '../types/article';
import { Clock, ArrowRight, Scale, Globe } from 'lucide-react';
import { ReadingLanguageOption } from './Header';
import { UiTranslations, getTranslations, translateCategory } from '../utils/i18n';
import { getTranslatedArticle } from '../data/articleTranslations';

interface ArticleCardProps {
  article: Article;
  onSelect: (article: Article) => void;
  onSelectWithLanguage?: (article: Article, langCode: string, langName: string) => void;
  readingLanguage?: ReadingLanguageOption;
  ui?: UiTranslations;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ 
  article, 
  onSelect, 
  onSelectWithLanguage,
  readingLanguage,
  ui: propUi
}) => {
  const langCode = readingLanguage?.code || 'tr';
  const ui = propUi || getTranslations(langCode);

  // Compute translated article when target reading language is selected
  const displayArticle = useMemo(() => {
    return getTranslatedArticle(article, langCode);
  }, [article, langCode]);

  const categoryName = translateCategory(article.categories[0] || 'Bilim & Felsefe', langCode);

  const quickLanguages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  ];

  return (
    <article 
      onClick={() => onSelect(article)}
      className="group relative flex flex-col justify-between rounded-3xl border border-neutral-200/90 dark:border-neutral-800/90 bg-white dark:bg-neutral-900/90 p-6 sm:p-7 shadow-sm hover:shadow-2xl hover:border-amber-400 dark:hover:border-amber-500/80 transition-all duration-300 cursor-pointer"
    >
      <div>
        {/* Top Meta Badges: Category & Authentic / Translated Language Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60 shadow-sm">
              {categoryName}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60 flex items-center gap-1 font-mono">
              <span>{readingLanguage?.flag || '🇹🇷'}</span>
              <span>{langCode === 'tr' ? ui.originalTurkish : readingLanguage?.name}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-neutral-400" />
            <span>{displayArticle.readingTimeMinutes} {ui.readingTime}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-reading text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
          {displayArticle.title}
        </h3>

        {/* Excerpt / Summary */}
        <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400 line-clamp-2 leading-relaxed font-sans font-normal">
          {displayArticle.summary}
        </p>

        {/* Dialectical Triad Prominent Preview Block */}
        <div className="mt-4 p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950/70 border border-neutral-200/80 dark:border-neutral-800/80 space-y-1.5 text-xs">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 pb-1 border-b border-neutral-200/60 dark:border-neutral-800/60">
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              <span>{ui.dialecticalTriadTitle}</span>
            </span>
            <span className="text-[10px] text-neutral-400 font-normal">{ui.inspectTriad}</span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-700 dark:text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <strong className="text-emerald-700 dark:text-emerald-400 font-semibold shrink-0">{ui.claimLabel}</strong>
            <span className="truncate italic">
              "{displayArticle.dialecticalTriad?.claim?.slice(0, 60) || 'Temel tez temellendirilmiştir'}..."
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-neutral-700 dark:text-neutral-300">
            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
            <strong className="text-indigo-700 dark:text-indigo-400 font-semibold shrink-0">{ui.counterClaimLabel}</strong>
            <span className="truncate italic">
              "{displayArticle.dialecticalTriad?.counterClaim?.slice(0, 60) || 'Karşı sav diyalektiği'}..."
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-rose-700 dark:text-rose-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
            <strong className="shrink-0">{ui.notProofLabel}</strong>
            <span className="truncate">
              {ui.notProofText}
            </span>
          </div>
        </div>

        {/* Per-article sector definition and analysis */}
        <SectorEvaluation article={article} compact />

        {/* Quick Language Translation Strip */}
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="mt-3.5 pt-2.5 border-t border-neutral-100 dark:border-neutral-800/60 flex items-center justify-between gap-1 text-[11px]"
        >
          <span className="text-neutral-400 dark:text-neutral-500 flex items-center gap-1 text-[10px] font-medium shrink-0">
            <Globe className="w-3 h-3 text-amber-500" />
            <span>{ui.examinationLang}</span>
          </span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {quickLanguages.map((ql) => (
              <button
                key={ql.code}
                onClick={() => onSelectWithLanguage ? onSelectWithLanguage(article, ql.code, ql.name) : onSelect(article)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono transition-colors ${
                  langCode === ql.code
                    ? 'bg-amber-500 text-neutral-950 border border-amber-600'
                    : 'bg-neutral-100 hover:bg-amber-100 dark:bg-neutral-800 dark:hover:bg-amber-950/60 text-neutral-600 hover:text-amber-800 dark:text-neutral-300 dark:hover:text-amber-300 border border-neutral-200 dark:border-neutral-700/60'
                }`}
                title={`${ql.name} ${ui.previewInLang}`}
              >
                {ql.code.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Area with Author Avatar */}
      <div className="mt-4 pt-3.5 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-wrap items-center justify-between gap-3">
        {/* Author Avatar & Sector Evaluation Tag */}
        <div className="flex items-center gap-2.5">
          <img
            src="/author.jpg"
            alt="Emre Pelit"
            className="w-8 h-8 rounded-full object-cover border-2 border-amber-500 shadow-sm"
          />
          <div className="text-xs">
            <span className="font-bold text-neutral-900 dark:text-neutral-100 block leading-tight">
              {article.author}
            </span>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
              {ui.authorRole}
            </span>
          </div>
        </div>

        {/* Action Link */}
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform">
          <span>{ui.readArticle}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </article>
  );
};
