import React, { useMemo } from 'react';
import { Article } from '../types/article';
import { 
  Sparkles, 
  ArrowRight, 
  Clock, 
  Calendar, 
  Tag, 
  ExternalLink, 
  Globe, 
  BookOpen, 
  Layers, 
  Quote 
} from 'lucide-react';
import { ReadingLanguageOption } from './Header';
import { UiTranslations, getTranslations, translateCategory } from '../utils/i18n';
import { getTranslatedArticle } from '../data/articleTranslations';
import type { SiteArticleTranslation } from '../utils/siteTranslationService';

interface FeaturedShowcaseProps {
  article: Article;
  onSelect: (article: Article) => void;
  onSelectWithLanguage?: (article: Article, lang: { code: string; name: string }) => void;
  readingLanguage?: ReadingLanguageOption;
  ui?: UiTranslations;
  siteTranslation?: SiteArticleTranslation;
}

export const FeaturedShowcase: React.FC<FeaturedShowcaseProps> = ({
  article,
  onSelect,
  onSelectWithLanguage,
  readingLanguage,
  ui: propUi,
  siteTranslation,
}) => {
  const langCode = readingLanguage?.code || 'tr';
  const ui = propUi || getTranslations(langCode);

  const displayArticle = useMemo(() => {
    const fallback = getTranslatedArticle(article, langCode);
    if (langCode === 'tr' || !siteTranslation) return fallback;
    return {
      ...fallback,
      title: siteTranslation.title || fallback.title,
      summary: siteTranslation.summary || fallback.summary,
      categories: siteTranslation.categories?.length ? siteTranslation.categories : fallback.categories,
      dialecticalTriad: { ...fallback.dialecticalTriad, ...(siteTranslation.dialecticalTriad || {}) },
    };
  }, [article, langCode, siteTranslation]);

  const publishedDateFormatted = React.useMemo(() => {
    try {
      if (!article.publishedAt) return '13 Ekim 2026';
      const date = new Date(article.publishedAt);
      return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return '13 Ekim 2026';
    }
  }, [article.publishedAt]);

  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-900/95 to-neutral-950 border-2 border-amber-500/50 p-6 sm:p-10 mb-12 shadow-2xl transition-all hover:border-amber-400 group">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-amber-600/5 rounded-full blur-2xl pointer-events-none" />

      {/* Top Header Strip */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-neutral-800">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 text-xs font-bold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span>{langCode === 'tr' ? 'Vitrin Makalesi • 70. Orijinal Türkçe Makale' : `${displayArticle.categories?.[0] || 'Cosmology'} • Featured Pillar Treatise`}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 text-emerald-400 border border-emerald-800/80 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>{langCode === 'tr' ? 'Blogger Canlı Yayında' : 'Live Blogger Feed'}</span>
          </span>
          <span className="hidden sm:inline text-neutral-500">•</span>
          <span className="flex items-center gap-1 text-neutral-300 font-medium">
            <Calendar className="w-3.5 h-3.5 text-neutral-400" />
            <span>{publishedDateFormatted}</span>
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-6">
        
        {/* Left Column: Title, Metadata, Excerpt */}
        <div className="lg:col-span-8 space-y-5">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap text-xs text-amber-400/90 font-semibold">
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                <span>{translateCategory(article.categories?.[0] || 'Kozmoloji', langCode)}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-neutral-300 font-normal">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>{article.readingTimeMinutes || 5} {ui.readingTime}</span>
              </span>
              <span>•</span>
              <span className="text-neutral-400 font-normal">
                {ui.authorTitle}: <strong className="text-neutral-200">Emre Pelit</strong>
              </span>
            </div>

            <h2 
              onClick={() => onSelect(article)}
              className="font-reading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors leading-snug cursor-pointer"
            >
              {displayArticle.title}
            </h2>
          </div>

          {/* Dialectical Tez Kutusu */}
          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-950/70 border border-neutral-800 space-y-2 text-left">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <Quote className="w-3.5 h-3.5" />
              <span>{ui.pillarThesis}</span>
            </div>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans">
              {displayArticle.dialecticalTriad?.claim || displayArticle.summary}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onSelect(article)}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <BookOpen className="w-4 h-4" />
              <span>{ui.readArticle} &amp; {ui.inspectTriad}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onSelectWithLanguage && (
              <div className="inline-flex items-center gap-1 p-1 rounded-2xl bg-neutral-800/80 border border-neutral-700/80 text-xs flex-wrap">
                <span className="px-2.5 text-neutral-400 font-medium flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden sm:inline">{ui.examinationLang}</span>
                </span>
                <button
                  onClick={() => onSelectWithLanguage(article, { code: 'en', name: 'English' })}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-neutral-700 text-neutral-200 font-medium transition-colors cursor-pointer"
                  title="İngilizce olarak anında incele (0ms)"
                >
                  🇬🇧 EN
                </button>
                <button
                  onClick={() => onSelectWithLanguage(article, { code: 'de', name: 'Deutsch' })}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-neutral-700 text-neutral-200 font-medium transition-colors cursor-pointer"
                  title="Almanca olarak anında incele (0ms)"
                >
                  🇩🇪 DE
                </button>
                <button
                  onClick={() => onSelectWithLanguage(article, { code: 'fr', name: 'Français' })}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-neutral-700 text-neutral-200 font-medium transition-colors cursor-pointer"
                  title="Fransızca olarak anında incele (0ms)"
                >
                  🇫🇷 FR
                </button>
                <button
                  onClick={() => onSelectWithLanguage(article, { code: 'es', name: 'Spanish' })}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-neutral-700 text-neutral-200 font-medium transition-colors cursor-pointer"
                  title="İspanyolca olarak anında incele (0ms)"
                >
                  🇪🇸 ES
                </button>
                <button
                  onClick={() => onSelectWithLanguage(article, { code: 'ru', name: 'Russian' })}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-neutral-700 text-neutral-200 font-medium transition-colors cursor-pointer"
                  title="Rusça olarak anında incele (0ms)"
                >
                  🇷🇺 RU
                </button>
                <button
                  onClick={() => onSelectWithLanguage(article, { code: 'ar', name: 'Arabic' })}
                  className="px-2.5 py-1.5 rounded-xl hover:bg-neutral-700 text-neutral-200 font-medium transition-colors cursor-pointer"
                  title="Arapça olarak anında incele (0ms)"
                >
                  🇸🇦 AR
                </button>
              </div>
            )}

            {article.url && (
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-neutral-800/60 hover:bg-neutral-800 border border-neutral-700 text-neutral-300 hover:text-white text-xs font-semibold transition-colors"
                title="Blogger orijinal sayfasına git"
              >
                <span>Blogger Orijinal Kaynak</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* Right Column: Featured Visual / Triad Card */}
        <div className="lg:col-span-4">
          <div 
            onClick={() => onSelect(article)}
            className="relative rounded-2xl overflow-hidden border border-amber-500/30 bg-neutral-950 p-4 space-y-3 cursor-pointer group-hover:border-amber-400/60 transition-colors shadow-xl"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-neutral-900">
              <img
                src="https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgNzvyEgMrqQpmMrV9SQQ-XI-QeaFNvrjcFZTGVU_tEcnSLozt9-nOHhOXUl0MTlTz3j5P85cbHcRS7N5EjD9OZqJ3Btt1Cfv_5G5ULklHW5VVFa1RaujE5O_Zap_kE2waV29v46oxBimxk4fNo0F0W4vKJWyVnKmxzLr7xMFZoYHRH_f5rbPvoHU3me0cj/s1600/image.png"
                alt="Evren Her Zaman Tekil Bir Olguydu"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-amber-300 font-bold px-2 py-1 rounded-lg bg-neutral-950/80 backdrop-blur-sm border border-amber-500/20">
                <span>Döngüsel Evren & Vahid</span>
                <span>70. Makale</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-neutral-400">
              <div className="flex items-center justify-between font-medium text-neutral-300">
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Kozmolojik Diyalektik</span>
                </span>
                <span className="text-amber-400 font-bold">13 Ekim 2026</span>
              </div>
              <p className="text-[11px] text-neutral-400 line-clamp-2">
                "Büyük Patlama öncesi olgu, âlemler arası ontolojik eşitlik ve var oluş-yok oluş döngüsü."
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
