import React, { useState, useEffect } from 'react';
import { Article } from '../types/article';
import { ExpertPanel } from './ExpertPanel';
import { DialecticalTriadView } from './DialecticalTriadView';
import { ObjectionBox } from './ObjectionBox';
import { AudioPlayerTab } from './AudioPlayerTab';
import { LanguageSelector, LANGUAGES } from './LanguageSelector';
import { ChineseRoomSimulator } from './interactive/ChineseRoomSimulator';
import { BlockUniverseSimulator } from './interactive/BlockUniverseSimulator';
import { FallacyInspector } from './interactive/FallacyInspector';
import DOMPurify from 'dompurify';
import { 
  ArrowLeft, 
  Clock, 
  Calendar, 
  ExternalLink, 
  Share2, 
  Check, 
  BookMarked,
  ShieldCheck,
  Quote,
  FileText,
  Award,
  Scale,
  Headphones,
  MessageSquareWarning,
  Sparkles,
  UserCheck,
  FlaskConical,
  Globe,
  RotateCcw
} from 'lucide-react';

interface ArticleViewProps {
  article: Article;
  onBack: () => void;
  onOpenAuthorModal: () => void;
  initialLanguage?: { code: string; name: string } | null;
}

export type ArticleTab = 'content' | 'triad' | 'experts' | 'interactive' | 'audio' | 'objections';

export const ArticleView: React.FC<ArticleViewProps> = ({ 
  article, 
  onBack, 
  onOpenAuthorModal,
  initialLanguage 
}) => {
  const [activeTab, setActiveTab] = useState<ArticleTab>('content');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans'>('serif');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Dynamic live translated content state
  const [displayArticle, setDisplayArticle] = useState<Article>(article);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedLang, setTranslatedLang] = useState<string>(article.language || 'tr');
  const [translatedLangName, setTranslatedLangName] = useState<string>('Türkçe');

  useEffect(() => {
    setDisplayArticle(article);
    setTranslatedLang(article.language || 'tr');
    setTranslatedLangName('Türkçe');
    setActiveTab('content');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress((window.scrollY / totalHeight) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // If an initial reading language was chosen, auto translate
    if (initialLanguage && initialLanguage.code !== 'tr') {
      handleTranslate(initialLanguage.name, initialLanguage.code);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, [article.id]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return iso;
    }
  };

  // Handle on-demand translation to any natural language
  const handleTranslate = async (targetLangName: string, targetLangCode: string) => {
    if (targetLangCode.toLowerCase() === translatedLang.toLowerCase() && translatedLang !== 'tr') return;

    if (targetLangCode.toLowerCase() === 'tr') {
      handleResetOriginal();
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/gemini/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          title: article.title,
          summary: article.summary,
          content: article.content,
          dialecticalTriad: article.dialecticalTriad,
          targetLanguage: targetLangName,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        setDisplayArticle({
          ...article,
          title: data.data.translatedTitle || article.title,
          summary: data.data.translatedSummary || article.summary,
          content: data.data.translatedContent || article.content,
          dialecticalTriad: data.data.translatedDialecticalTriad || article.dialecticalTriad,
        });
        setTranslatedLang(targetLangCode);
        setTranslatedLangName(targetLangName);
      }
    } catch (err) {
      console.warn('Translation failed:', err);
    } finally {
      setIsTranslating(false);
    }
  };

  // Reset to original Turkish article text
  const handleResetOriginal = () => {
    setDisplayArticle(article);
    setTranslatedLang('tr');
    setTranslatedLangName('Türkçe (Orijinal)');
  };

  // Secure sanitization with DOMPurify against any potential XSS
  const sanitizedContent = DOMPurify.sanitize(displayArticle.content, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'large': return 'text-xl leading-relaxed';
      case 'xlarge': return 'text-2xl leading-loose';
      default: return 'text-lg leading-relaxed';
    }
  };

  const tabsConfig = [
    { id: 'content', label: 'Makale Metni', icon: FileText, count: null },
    { id: 'triad', label: 'İddia — Karşı İddia — Neyin Kanıt Olmadığı', icon: Scale, count: 'Diyalektik' },
    { id: 'experts', label: 'Uzman Görüşleri & Sektör', icon: Award, count: article.expertOpinions?.length || 3 },
    { id: 'interactive', label: 'İnteraktif Deney & Simülasyon', icon: FlaskConical, count: 'Deney' },
    { id: 'audio', label: 'Doğal Dilde Sesli Dinle', icon: Headphones, count: null },
    { id: 'objections', label: 'İtiraz Kutusu (Gen AI)', icon: MessageSquareWarning, count: 'Canlı' },
  ];

  // Quick translation presets
  const popularLanguages = [
    { code: 'tr', name: 'Türkçe', flag: '🇹🇷', label: 'Orijinal' },
    { code: 'en', name: 'English', flag: '🇬🇧', label: 'English' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪', label: 'Deutsch' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', label: 'Français' },
    { code: 'es', name: 'Español', flag: '🇪🇸', label: 'Español' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹', label: 'Italiano' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺', label: 'Русский' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', label: 'العربية' },
    { code: 'ja', name: '日本語', flag: '🇯🇵', label: '日本語' },
    { code: 'zh', name: '中文', flag: '🇨🇳', label: '中文' },
  ];

  // Determine appropriate interactive tool based on article title
  const isConsciousnessArticle = displayArticle.title.toLowerCase().includes('llm') || displayArticle.title.toLowerCase().includes('şuur') || displayArticle.title.toLowerCase().includes('bilinç');
  const isTimeArticle = displayArticle.title.toLowerCase().includes('zaman') || displayArticle.title.toLowerCase().includes('time') || displayArticle.title.toLowerCase().includes('zeit');

  return (
    <div className="min-h-screen bg-neutral-50/70 dark:bg-neutral-950 transition-colors pb-24">
      {/* Scroll Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-amber-500 z-50 transition-all duration-150"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Top Nav & Breadcrumb */}
      <div className="border-b border-neutral-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-md sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
          
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tüm Makalelere Dön ({article.categories[0] || 'Dizin'})</span>
          </button>

          {/* Action Toolbar: Natural Language Selector, Font controls & Share */}
          <div className="flex items-center gap-2 flex-wrap">
            
            {/* Natural Language Translator */}
            <LanguageSelector
              currentLanguage={translatedLang}
              onTranslate={handleTranslate}
              isTranslating={isTranslating}
              onResetOriginal={handleResetOriginal}
            />

            {/* Typography Controls */}
            <div className="hidden sm:flex items-center rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 p-0.5 text-xs">
              <button
                onClick={() => setFontFamily(fontFamily === 'serif' ? 'sans' : 'serif')}
                className="px-2.5 py-1 rounded-lg font-medium text-[11px] text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {fontFamily === 'serif' ? 'Serif' : 'Sans'}
              </button>
              <span className="text-neutral-300 dark:text-neutral-700">|</span>
              <button
                onClick={() => setFontSize(fontSize === 'normal' ? 'large' : fontSize === 'large' ? 'xlarge' : 'normal')}
                className="px-2.5 py-1 rounded-lg font-medium text-[11px] text-neutral-700 dark:text-neutral-300 hover:bg-white dark:hover:bg-neutral-700 transition-colors cursor-pointer"
              >
                {fontSize === 'normal' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
              </button>
            </div>

            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
              title="Bağlantıyı Paylaş"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 lg:pt-8">
        
        {/* Prominent Multilingual Reader Banner */}
        <div className="mb-6 p-4 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-indigo-500/10 border border-amber-500/30 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-700 dark:text-amber-300">
              <Globe className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 uppercase tracking-wider">
                  Çok Dilli İnceleme Merkezi
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  🇹🇷 Orijinal: Türkçe
                </span>
                {translatedLang !== 'tr' && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/40 font-bold">
                    Aktif Çeviri: {translatedLangName}
                  </span>
                )}
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-400">
                Makale metnini, iddia-karşı iddia üçlüsünü ve uzman görüşlerini istediğiniz dilde anında inceleyin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {popularLanguages.map((pl) => (
              <button
                key={pl.code}
                onClick={() => handleTranslate(pl.name, pl.code)}
                disabled={isTranslating}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1 ${
                  translatedLang === pl.code
                    ? 'bg-amber-600 text-white font-bold shadow-md scale-105'
                    : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700'
                }`}
              >
                <span>{pl.flag}</span>
                <span>{pl.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Article Header Card */}
        <header className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {displayArticle.categories.map((cat, idx) => (
              <span
                key={idx}
                className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/60"
              >
                {cat}
              </span>
            ))}
            <span className="text-xs font-mono uppercase px-2.5 py-1 rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold">
              {translatedLang.toUpperCase()}
            </span>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/60">
              <ShieldCheck className="w-3.5 h-3.5" />
              Sıfır Açık & DOMPurify Güvenli
            </span>
          </div>

          <h1 className="font-reading text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 leading-tight">
            {displayArticle.title}
          </h1>

          {/* Author Strip with Emre Pelit Photo Avatar */}
          <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-4 text-xs text-neutral-500 dark:text-neutral-400">
            <div 
              onClick={onOpenAuthorModal}
              className="flex items-center gap-3.5 group cursor-pointer"
              title="Yazar profilini ve biyografisini görüntüle"
            >
              <div className="relative">
                <img
                  src="/author.jpg"
                  alt="Emre Pelit"
                  className="w-12 h-12 rounded-full object-cover border-2 border-amber-500 shadow-md group-hover:scale-105 transition-transform"
                />
                <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-amber-500 text-white">
                  <UserCheck className="w-3 h-3" />
                </span>
              </div>
              <div>
                <span className="font-bold text-neutral-900 dark:text-neutral-100 text-sm block group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {displayArticle.author}
                </span>
                <span className="text-neutral-400 dark:text-neutral-500 text-xs">
                  Bilim & Felsefe Araştırmacısı (Biyografiyi Gör ↗)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span>{formatDate(displayArticle.publishedAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-neutral-400" />
                <span>~{displayArticle.readingTimeMinutes} dk okuma</span>
              </div>
            </div>
          </div>

          {/* Source Blog Link */}
          <div className="mt-5 p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/70 dark:border-neutral-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <BookMarked className="w-4 h-4 text-amber-500" />
              <span>
                Blogger Orijinal Kaynak: <strong className="font-mono text-neutral-900 dark:text-neutral-100">emrepelit7337.blogspot.com</strong>
              </span>
            </div>
            <a
              href={displayArticle.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold hover:underline"
            >
              <span>Blogspot'ta Aç</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </header>

        {/* Feature Tabs Navigation Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-neutral-200 dark:border-neutral-800 scrollbar-none">
          {tabsConfig.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ArticleTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20 scale-[1.02]'
                    : 'bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-amber-500'}`} />
                <span>{tab.label}</span>
                {tab.count && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-amber-700 text-white'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content Display */}
        <div>
          
          {/* TAB 1: Makale Metni (Article Content) */}
          {activeTab === 'content' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Main Content Body */}
              <main className="lg:col-span-8 bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm space-y-8">
                
                {/* Epistemological Summary / Lead abstract */}
                <div className="p-6 rounded-2xl bg-amber-50/60 dark:bg-neutral-950/60 border-l-4 border-amber-500 shadow-inner">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-2 mb-2">
                    <Quote className="w-4 h-4 text-amber-500" />
                    Epistemolojik Özet
                  </h3>
                  <p className="text-base sm:text-lg italic text-neutral-800 dark:text-neutral-200 leading-relaxed font-reading">
                    "{displayArticle.summary}"
                  </p>
                </div>

                {/* HTML Article Content */}
                <div 
                  className={`prose prose-neutral dark:prose-invert max-w-none 
                    ${fontFamily === 'serif' ? 'font-reading' : 'font-sans'} 
                    ${getFontSizeClass()}
                    prose-headings:font-reading prose-headings:font-bold prose-headings:tracking-tight
                    prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-neutral-900 dark:prose-h2:text-neutral-100
                    prose-p:text-neutral-800 dark:prose-p:text-neutral-300 prose-p:leading-relaxed
                    prose-blockquote:border-l-4 prose-blockquote:border-amber-500 prose-blockquote:bg-amber-500/5 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-xl
                    prose-img:rounded-2xl prose-img:shadow-lg prose-img:border prose-img:border-neutral-200 dark:prose-img:border-neutral-800
                  `}
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />

                {/* Citation footer */}
                <footer className="pt-8 border-t border-neutral-200 dark:border-neutral-800 text-xs text-neutral-500 dark:text-neutral-400 space-y-2">
                  <div className="flex items-center gap-2 font-bold text-neutral-700 dark:text-neutral-300">
                    <BookMarked className="w-4 h-4 text-amber-500" />
                    <span>Akademik Referans & Alıntı Formatı</span>
                  </div>
                  <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700/80">
                    <p className="font-mono text-[11px] select-all bg-white dark:bg-neutral-900 p-2.5 rounded border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300">
                      Pelit, E. ({new Date(displayArticle.publishedAt).getFullYear()}). {displayArticle.title}. Science & Philosophy. https://sci-phil.ai.studio
                    </p>
                  </div>
                </footer>
              </main>

              {/* Side Cards: Prominent Triad & Interactive Lab Jump */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* 1. Prominent Dialectical Triad Side Card */}
                <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border-2 border-amber-500/40 shadow-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Scale className="w-5 h-5 text-amber-500" />
                      <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                        Diyalektik Üçlü Matrisi
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400">
                      ÖZET
                    </span>
                  </div>

                  <div className="text-xs space-y-3">
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-500">
                      <strong className="text-emerald-800 dark:text-emerald-300 font-bold block mb-1">
                        1. İddia (Tez):
                      </strong>
                      <p className="text-neutral-700 dark:text-neutral-300 line-clamp-2 italic">
                        "{displayArticle.dialecticalTriad?.claim}"
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 border-l-4 border-indigo-500">
                      <strong className="text-indigo-800 dark:text-indigo-300 font-bold block mb-1">
                        2. Karşı İddia (Antitez):
                      </strong>
                      <p className="text-neutral-700 dark:text-neutral-300 line-clamp-2 italic">
                        "{displayArticle.dialecticalTriad?.counterClaim}"
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border-l-4 border-rose-500">
                      <strong className="text-rose-800 dark:text-rose-300 font-bold block mb-1">
                        3. Neyin Kanıt Olmadığı:
                      </strong>
                      <p className="text-neutral-700 dark:text-neutral-300 line-clamp-2">
                        {displayArticle.dialecticalTriad?.whatIsNotEvidence?.slice(0, 100)}...
                      </p>
                    </div>

                    <button
                      onClick={() => setActiveTab('triad')}
                      className="w-full py-2.5 px-3 rounded-xl bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950 text-xs font-bold text-center hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Tüm Diyalektik Matrisi İncele →
                    </button>
                  </div>
                </div>

                {/* 2. Interactive Experiment Card */}
                <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-amber-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                      İnteraktif Deney
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Bu makalenin felsefi konusunu etkileşimli simülasyonla doğrudan deneyimleyin.
                  </p>
                  <button
                    onClick={() => setActiveTab('interactive')}
                    className="w-full py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-sm transition-colors text-center cursor-pointer"
                  >
                    Simülasyonu Başlat
                  </button>
                </div>

                {/* 3. Objection Box Quick Access */}
                <div className="p-5 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquareWarning className="w-4 h-4 text-indigo-500" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 dark:text-neutral-100">
                      Felsefi İtiraz Kutusu
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    Makaledeki savlara itirazınızı yazın; Gen AI yapay zeka makale kapsamıyla yanıtlasın.
                  </p>
                  <button
                    onClick={() => setActiveTab('objections')}
                    className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-colors text-center cursor-pointer"
                  >
                    İtiraz Kutusunu Aç
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB 2: İddia — Karşı İddia — Neyin Kanıt Olmadığı */}
          {activeTab === 'triad' && (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm">
              <DialecticalTriadView
                triad={displayArticle.dialecticalTriad}
                articleTitle={displayArticle.title}
              />
            </div>
          )}

          {/* TAB 3: Uzman Görüşleri & Sektör Analizi */}
          {activeTab === 'experts' && (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm max-w-4xl mx-auto">
              <ExpertPanel article={displayArticle} />
            </div>
          )}

          {/* TAB 4: İnteraktif Deney & Simülasyon */}
          {activeTab === 'interactive' && (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm max-w-5xl mx-auto">
              {isConsciousnessArticle ? (
                <ChineseRoomSimulator />
              ) : isTimeArticle ? (
                <BlockUniverseSimulator />
              ) : (
                <FallacyInspector />
              )}
            </div>
          )}

          {/* TAB 5: Doğal Dilde Sesli Dinle */}
          {activeTab === 'audio' && (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm max-w-3xl mx-auto">
              <AudioPlayerTab article={displayArticle} currentLanguage={translatedLang} />
            </div>
          )}

          {/* TAB 6: İtiraz Kutusu (Gen AI) */}
          {activeTab === 'objections' && (
            <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-10 border border-neutral-200/90 dark:border-neutral-800/90 shadow-sm max-w-4xl mx-auto">
              <ObjectionBox article={displayArticle} />
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
