import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { RECOVERED_TURKISH_ARTICLES } from './data/recoveredTurkishArticles';
import SocraticPartner from './SocraticPartner';
import {
  translateArticleSimultaneously,
  triggerManualBloggerSync,
  injectCosmicPhilosophyBackground,
  isTurkishContent
} from '../blogger-sync.js';

export interface Article {
  id: string;
  title: string;
  slug: string;
  published?: string;
  publishedAt?: string;
  updated?: string;
  updatedAt?: string;
  language: string;
  languageName?: string;
  categories?: string[];
  author?: string;
  originalUrl?: string;
  url?: string;
  wordCount?: number;
  readingTime?: string;
  readingMinutes?: number;
  excerpt?: string;
  summary?: string;
  claim?: string;
  counterClaim?: string;
  notProof?: string;
  content?: string;
  dialecticalTriad?: {
    claim?: string;
    counterClaim?: string;
    whatIsNotEvidence?: string;
    methodologicalNote?: string;
  };
}

type LangCode = 'tr' | 'en' | 'de' | 'fr' | 'es';

const SPEECH_LANG_MAP: Record<LangCode, string> = {
  tr: 'tr-TR',
  en: 'en-US',
  de: 'de-DE',
  fr: 'fr-FR',
  es: 'es-ES'
};

const UI_TRANSLATIONS: Record<LangCode, {
  brandSubtitle: string;
  navArticles: string;
  navSocratic: string;
  navSector: string;
  navAnalytics: string;
  syncBtn: string;
  syncingBtn: string;
  heroBadge: string;
  heroTitle: string;
  heroDesc: string;
  searchPlaceholder: string;
  allCategories: string;
  statsArticles: string;
  statsWords: string;
  statsSource: string;
  readArticleBtn: string;
  openSectorEvalBtn: string;
  closeModalBtn: string;
  originalBloggerBtn: string;
  listenModeBtn: string;
  pauseListenBtn: string;
  resumeListenBtn: string;
  stopListenBtn: string;
  listeningNowLabel: string;
  claimLabel: string;
  counterClaimLabel: string;
  notProofLabel: string;
  sectorDefTitle: string;
  sectorEvalTitle: string;
  sectorImpactLabel: string;
  sectorMethodLabel: string;
  sectorRiskLabel: string;
  socraticSectionTitle: string;
  socraticSectionDesc: string;
  footerRights: string;
  translatingNotice: string;
  wordsUnit: string;
  trOriginalBadge: string;
}> = {
  tr: {
    brandSubtitle: 'Bilim, Kozmoloji ve Felsefe Portalı • Emre Pelit',
    navArticles: 'Orijinal Makaleler',
    navSocratic: 'Sokratik Laboratuvar',
    navSector: 'Sektör Analizi',
    navAnalytics: 'Live Analytics',
    syncBtn: 'Blogger Eşitle',
    syncingBtn: 'Eşitleniyor...',
    heroBadge: 'emrepelit7337.blogspot.com Orijinal Türkçe Makale Külliyatı • Anlık Çeviri & Dinleme Modu',
    heroTitle: 'Bilim, Teorik Fizik, Kozmoloji ve Epistemolojik Felsefe',
    heroDesc: 'Emre Pelit’in emrepelit7337.blogspot.com bloğundaki orijinal Türkçe makalelerinin tamamı burada yer alır. Üstteki dil çubuğundan istediğiniz dili seçerek tüm makaleleri kendi dilinizde okuyabilir veya Dinleme Modu ile sesli dinleyebilirsiniz.',
    searchPlaceholder: 'Orijinal makalelerde, kavramlarda veya teoremlerde ara...',
    allCategories: 'Tüm Kategoriler',
    statsArticles: 'Orijinal Türkçe Makale',
    statsWords: 'Toplam Kelime',
    statsSource: 'Birincil Kaynak',
    readArticleBtn: 'Makaleyi Oku',
    openSectorEvalBtn: 'Detaylı Değerlendirmeyi Aç',
    closeModalBtn: 'Kapat',
    originalBloggerBtn: 'Blogger Orijinali ↗',
    listenModeBtn: 'Dinleme Modu',
    pauseListenBtn: 'Duraklat',
    resumeListenBtn: 'Devam Et',
    stopListenBtn: 'Durdur',
    listeningNowLabel: 'Sesli Okunuyor',
    claimLabel: 'Temel İddia (Tez)',
    counterClaimLabel: 'Sokratik Karşı Tez',
    notProofLabel: 'Neyin Kanıtı Değildir?',
    sectorDefTitle: 'Sektör Tanımı',
    sectorEvalTitle: 'Sektör Değerlendirmesi',
    sectorImpactLabel: 'Disipliner Katkı & Kapsam:',
    sectorMethodLabel: 'Kanıt & Yöntem Çerçevesi:',
    sectorRiskLabel: 'Epistemik Sınır & Kontrol Ölçütleri:',
    socraticSectionTitle: 'Sokratik Düşünce Partneri & Epistemik Süzgeç',
    socraticSectionDesc: 'Bilimsel veya felsefi iddialarınızı diyalektik yöntemle sınayın; karşı tez ve kanıt sınırlarını anında analiz edin.',
    footerRights: 'Tüm hakları saklıdır. emrepelit7337.blogspot.com orijinal Türkçe makale senkronizasyonu aktiftir.',
    translatingNotice: 'Orijinal Türkçe makaleler ve site içeriği seçilen doğal dile çevriliyor...',
    wordsUnit: 'kelime',
    trOriginalBadge: 'Orijinal TR Kaynak'
  },
  en: {
    brandSubtitle: 'Science, Cosmology & Philosophy Portal • Emre Pelit',
    navArticles: 'Original Articles',
    navSocratic: 'Socratic Laboratory',
    navSector: 'Sector Analysis',
    navAnalytics: 'Live Analytics',
    syncBtn: 'Sync Blogger',
    syncingBtn: 'Syncing...',
    heroBadge: 'emrepelit7337.blogspot.com Original Turkish Corpus • Instant Translation & Listening Mode',
    heroTitle: 'Science, Theoretical Physics, Cosmology & Epistemological Philosophy',
    heroDesc: 'All original Turkish articles from Emre Pelit’s emrepelit7337.blogspot.com blog are hosted here. Use the language bar above to read any article in your preferred language or listen with Audio Mode.',
    searchPlaceholder: 'Search original articles, concepts, or theorems...',
    allCategories: 'All Categories',
    statsArticles: 'Original Turkish Articles',
    statsWords: 'Total Words',
    statsSource: 'Primary Source',
    readArticleBtn: 'Read Article',
    openSectorEvalBtn: 'Open Detailed Evaluation',
    closeModalBtn: 'Close',
    originalBloggerBtn: 'Blogger Original ↗',
    listenModeBtn: 'Listening Mode',
    pauseListenBtn: 'Pause',
    resumeListenBtn: 'Resume',
    stopListenBtn: 'Stop',
    listeningNowLabel: 'Audio Playing',
    claimLabel: 'Core Claim (Thesis)',
    counterClaimLabel: 'Socratic Counter-Thesis',
    notProofLabel: 'What Is It Not Proof Of?',
    sectorDefTitle: 'Sector Definition',
    sectorEvalTitle: 'Sector Evaluation',
    sectorImpactLabel: 'Disciplinary Contribution & Scope:',
    sectorMethodLabel: 'Evidence & Methodological Framework:',
    sectorRiskLabel: 'Epistemic Limits & Control Criteria:',
    socraticSectionTitle: 'Socratic Thought Partner & Epistemic Filter',
    socraticSectionDesc: 'Test your scientific or philosophical claims through dialectical inquiry; analyze counter-theses and evidentiary boundaries instantly.',
    footerRights: 'All rights reserved. Synchronized with emrepelit7337.blogspot.com original Turkish articles.',
    translatingNotice: 'Translating original Turkish articles and site content into natural English...',
    wordsUnit: 'words',
    trOriginalBadge: 'Translated from TR Original'
  },
  de: {
    brandSubtitle: 'Portal für Wissenschaft, Kosmologie & Philosophie • Emre Pelit',
    navArticles: 'Originalartikel',
    navSocratic: 'Sokratisches Labor',
    navSector: 'Sektoranalyse',
    navAnalytics: 'Live Analytics',
    syncBtn: 'Blogger Sync',
    syncingBtn: 'Synchronisiere...',
    heroBadge: 'emrepelit7337.blogspot.com Türkische Originalartikel • Sofortübersetzung & Hörmodus',
    heroTitle: 'Wissenschaft, Theoretische Physik, Kosmologie & Erkenntnistheorie',
    heroDesc: 'Alle türkischen Originalartikel aus Emre Pelits Blog emrepelit7337.blogspot.com befinden sich hier. Wählen Sie oben Ihre Sprache zum Lesen oder nutzen Sie den Hörmodus.',
    searchPlaceholder: 'Originalartikel, Konzepte oder Theoreme suchen...',
    allCategories: 'Alle Kategorien',
    statsArticles: 'Türkische Originalartikel',
    statsWords: 'Wörter Gesamt',
    statsSource: 'Primärquelle',
    readArticleBtn: 'Artikel lesen',
    openSectorEvalBtn: 'Detaillierte Bewertung öffnen',
    closeModalBtn: 'Schließen',
    originalBloggerBtn: 'Blogger-Original ↗',
    listenModeBtn: 'Hörmodus',
    pauseListenBtn: 'Pause',
    resumeListenBtn: 'Fortsetzen',
    stopListenBtn: 'Stopp',
    listeningNowLabel: 'Wird vorgelesen',
    claimLabel: 'Kernbehauptung (These)',
    counterClaimLabel: 'Sokratische Gegenthese',
    notProofLabel: 'Wofür ist es kein Beweis?',
    sectorDefTitle: 'Sektordefinition',
    sectorEvalTitle: 'Sektorbewertung',
    sectorImpactLabel: 'Disziplinärer Beitrag & Umfang:',
    sectorMethodLabel: 'Evidenz- & Methodenrahmen:',
    sectorRiskLabel: 'Epistemische Grenzen & Prüfkriterien:',
    socraticSectionTitle: 'Sokratischer Denkpartner & Epistemischer Filter',
    socraticSectionDesc: 'Prüfen Sie Ihre wissenschaftlichen oder philosophischen Thesen dialektisch.',
    footerRights: 'Alle Rechte vorbehalten. Synchronisiert mit emrepelit7337.blogspot.com.',
    translatingNotice: 'Türkische Originalartikel werden ins Deutsche übersetzt...',
    wordsUnit: 'Wörter',
    trOriginalBadge: 'Aus dem TR-Original'
  },
  fr: {
    brandSubtitle: 'Portail Science, Cosmologie & Philosophie • Emre Pelit',
    navArticles: 'Articles Originaux',
    navSocratic: 'Laboratoire Socratique',
    navSector: 'Analyse Sectorielle',
    navAnalytics: 'Live Analytics',
    syncBtn: 'Sync Blogger',
    syncingBtn: 'Synchronisation...',
    heroBadge: 'Articles Originaux Turcs emrepelit7337.blogspot.com • Traduction & Mode Écoute',
    heroTitle: 'Science, Physique Théorique, Cosmologie & Philosophie Épistémologique',
    heroDesc: 'Tous les articles originaux en turc du blog emrepelit7337.blogspot.com d’Emre Pelit sont réunis ici. Utilisez la barre de langue pour lire ou écouter chaque article dans la langue de votre choix.',
    searchPlaceholder: 'Rechercher dans les articles originaux, concepts ou théorèmes...',
    allCategories: 'Toutes les catégories',
    statsArticles: 'Articles Originaux (TR)',
    statsWords: 'Mots au Total',
    statsSource: 'Source Primaire',
    readArticleBtn: 'Lire l’article',
    openSectorEvalBtn: 'Ouvrir l’évaluation détaillée',
    closeModalBtn: 'Fermer',
    originalBloggerBtn: 'Original Blogger ↗',
    listenModeBtn: 'Mode Écoute',
    pauseListenBtn: 'Pause',
    resumeListenBtn: 'Reprendre',
    stopListenBtn: 'Arrêter',
    listeningNowLabel: 'Lecture audio en cours',
    claimLabel: 'Affirmation Centrale (Thèse)',
    counterClaimLabel: 'Contre-thèse Socratique',
    notProofLabel: 'De quoi n’est-ce pas la preuve ?',
    sectorDefTitle: 'Définition du Secteur',
    sectorEvalTitle: 'Évaluation du Secteur',
    sectorImpactLabel: 'Contribution Disciplinaire & Portée :',
    sectorMethodLabel: 'Cadre Méthodologique & Preuves :',
    sectorRiskLabel: 'Limites Épistémiques & Critères de Contrôle :',
    socraticSectionTitle: 'Partenaire de Réflexion Socratique & Filtre Épistémique',
    socraticSectionDesc: 'Testez vos affirmations scientifiques ou philosophiques par le dialogue dialectique.',
    footerRights: 'Tous droits réservés. Synchronisé avec emrepelit7337.blogspot.com.',
    translatingNotice: 'Traduction des articles originaux turcs en français...',
    wordsUnit: 'mots',
    trOriginalBadge: 'Traduit de l’original TR'
  },
  es: {
    brandSubtitle: 'Portal de Ciencia, Cosmología y Filosofía • Emre Pelit',
    navArticles: 'Artículos Originales',
    navSocratic: 'Laboratorio Socrático',
    navSector: 'Análisis Sectorial',
    navAnalytics: 'Live Analytics',
    syncBtn: 'Sincronizar Blog',
    syncingBtn: 'Sincronizando...',
    heroBadge: 'Artículos Originales en Turco de emrepelit7337.blogspot.com • Traducción y Modo Escucha',
    heroTitle: 'Ciencia, Física Teórica, Cosmología y Filosofía Epistemológica',
    heroDesc: 'Todos los artículos originales en turco del blog emrepelit7337.blogspot.com de Emre Pelit están aquí. Seleccione cualquier idioma en la barra superior para leer o escuchar con el Modo Escucha.',
    searchPlaceholder: 'Buscar en artículos originales, conceptos o teoremas...',
    allCategories: 'Todas las categorías',
    statsArticles: 'Artículos Originales (TR)',
    statsWords: 'Palabras Totales',
    statsSource: 'Fuente Primaria',
    readArticleBtn: 'Leer artículo',
    openSectorEvalBtn: 'Abrir evaluación detallada',
    closeModalBtn: 'Cerrar',
    originalBloggerBtn: 'Original en Blogger ↗',
    listenModeBtn: 'Modo Escucha',
    pauseListenBtn: 'Pausar',
    resumeListenBtn: 'Reanudar',
    stopListenBtn: 'Detener',
    listeningNowLabel: 'Reproduciendo audio',
    claimLabel: 'Afirmación Central (Tesis)',
    counterClaimLabel: 'Contratesis Socrática',
    notProofLabel: '¿De qué no es prueba?',
    sectorDefTitle: 'Definición del Sector',
    sectorEvalTitle: 'Evaluación del Sector',
    sectorImpactLabel: 'Contribución Disciplinaria y Alcance:',
    sectorMethodLabel: 'Marco de Evidencia y Metodología:',
    sectorRiskLabel: 'Límites Epistémicos y Criterios de Control:',
    socraticSectionTitle: 'Compañero de Pensamiento Socrático y Filtro Epistémico',
    socraticSectionDesc: 'Ponga a prueba sus afirmaciones científicas o filosóficas mediante el análisis dialéctico.',
    footerRights: 'Todos los derechos reservados. Sincronizado con emrepelit7337.blogspot.com.',
    translatingNotice: 'Traduciendo artículos originales en turco al español...',
    wordsUnit: 'palabras',
    trOriginalBadge: 'Traducido del original TR'
  }
};

function buildLocalizedSectorAnalysis(article: Article, lang: LangCode) {
  const cat = (article.categories && article.categories[0]) || 'Bilim & Felsefe';
  const title = article.title || '';

  const templates: Record<LangCode, {
    sectorDef: string;
    impact: string;
    method: string;
    risk: string;
  }> = {
    tr: {
      sectorDef: `${cat} — Teorik Fizik, Kozmoloji, Bilişsel Bilimler ve Epistemolojik Felsefe Disiplinlerarası Araştırma Alanı.`,
      impact: `"${title}" başlıklı bu çalışmada savunulan tez, gözlemlenebilir fiziksel süreçler ile ontolojik/kavramsal modeller arasında analitik bir köprü kurmaktadır.`,
      method: `Matematiksel tutarlılık, teorik modelleme ve tümevarımsal akıl yürütme birlikte değerlendirilmeli; analojiler doğrudan ampirik ölçümle karıştırılmamalıdır.`,
      risk: `Kavramsal modellerin tek başına nihai deneysel kanıt sayılmaması, yanlışlanabilirlik ve bağımsız gözlem ölçütleriyle denetlenmesi gerekir.`
    },
    en: {
      sectorDef: `${cat} — Interdisciplinary Research Domain in Theoretical Physics, Cosmology, Cognitive Science, and Epistemological Philosophy.`,
      impact: `The thesis advanced in "${title}" establishes an analytical bridge between observable physical processes and ontological/conceptual models.`,
      method: `Mathematical consistency, theoretical modeling, and inductive reasoning must be evaluated together without conflating analogies with direct empirical measurement.`,
      risk: `Conceptual models alone should not be treated as final experimental proof and must be audited against falsifiability and independent observational criteria.`
    },
    de: {
      sectorDef: `${cat} — Interdisziplinäres Forschungsfeld der Theoretischen Physik, Kosmologie, Kognitionswissenschaft und Erkenntnistheorie.`,
      impact: `Die in "${title}" vertretene These schlägt eine analytische Brücke zwischen beobachtbaren physikalischen Prozessen und ontologischen Modellen.`,
      method: `Mathematische Konsistenz, theoretische Modellierung und induktive Schlussfolgerungen müssen gemeinsam geprüft werden.`,
      risk: `Begriffliche Analogien dürfen nicht mit direkten empirischen Messungen gleichgesetzt werden und erfordern Falsifizierbarkeitskriterien.`
    },
    fr: {
      sectorDef: `${cat} — Domaine de recherche interdisciplinaire en physique théorique, cosmologie, sciences cognitives et philosophie épistémologique.`,
      impact: `La thèse défendue dans « ${title} » établit un pont analytique entre les processus physiques observables et les modèles ontologiques.`,
      method: `La cohérence mathématique, la modélisation théorique et le raisonnement inductif doivent être évalués conjointement.`,
      risk: `Les modèles conceptuels ne constituent pas à eux seuls une preuve expérimentale finale et nécessitent des critères de réfutabilité.`
    },
    es: {
      sectorDef: `${cat} — Dominio de investigación interdisciplinaria en física teórica, cosmología, ciencia cognitiva y filosofía epistemológica.`,
      impact: `La tesis defendida en "${title}" establece un puente analítico entre los procesos físicos observables y los modelos ontológicos.`,
      method: `La consistencia matemática, la modelización teórica y el razonamiento inductivo deben evaluarse conjuntamente.`,
      risk: `Los modelos conceptuales por sí solos no constituyen prueba experimental definitiva y requieren criterios de falsabilidad.`
    }
  };

  return templates[lang] || templates.en;
}

/**
 * Bir makalenin emrepelit7337.blogspot.com kaynaklı orijinal Türkçe makale olup olmadığını doğrular
 */
function isOriginalTurkishArticle(art: Article): boolean {
  const declaredLang = String(art.language || '').toLowerCase().trim();
  if (declaredLang && declaredLang !== 'tr') return false;
  return isTurkishContent(art.title || '', art.content || art.excerpt || art.summary || '');
}

/**
 * HTML içeriğini cümle bazlı temiz seslendirme parçalarına ayırır (Tarayıcı TTS kesilmelerini önler)
 */
function splitArticleIntoSpeechChunks(article: Article): string[] {
  const rawHtml = `${article.title || ''}. ${article.content || article.excerpt || article.summary || ''}`;
  const plain = rawHtml
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();

  const sentences = plain.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [plain];
  const chunks: string[] = [];
  let current = '';

  for (const s of sentences) {
    const trimmed = s.trim();
    if (!trimmed) continue;
    if ((current + ' ' + trimmed).length <= 220) {
      current = current ? `${current} ${trimmed}` : trimmed;
    } else {
      if (current) chunks.push(current);
      current = trimmed;
    }
  }
  if (current) chunks.push(current);
  return chunks.length > 0 ? chunks : [article.title || ''];
}


// Global language selection handler
function handleReadingLanguageChange(code: string) {
  // Keep the previously selected language and its complete catalogue
  console.log('Language change:', code);
}

const autoTranslationAttemptRef = { current: 0 };
const hasMissingTranslations = false;
// Yeni veya güncellenen makaleler için otomatik çeviri
// [articles, readingLanguage, siteTranslations, syncStatus.status]

// siteTranslation={siteTranslations[article.id]
// translatedCategoryLabels

export default function App() {
  const [lang, setLang] = useState<LangCode>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sciphil_lang') : null;
    if (saved && /^(tr|en|de|fr|es)$/i.test(saved)) return saved.toLowerCase() as LangCode;
    return 'tr';
  });

  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [rawTurkishArticles, setRawTurkishArticles] = useState<Article[]>(RECOVERED_TURKISH_ARTICLES);
  const [translatedArticlesMap, setTranslatedArticlesMap] = useState<Record<string, Article>>({});
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [sectorModalArticle, setSectorModalArticle] = useState<Article | null>(null);

  // GELİŞMİŞ DİNLEME MODU (TTS) STATE'LERİ
  const [activeAudioArticleId, setActiveAudioArticleId] = useState<string | null>(null);
  const [isAudioPaused, setIsAudioPaused] = useState<boolean>(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechProgress, setSpeechProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const speechSessionRef = useRef<number>(0);

  const ui = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.tr;

  // setInterval(() => { void fetchArticles(); }, 60 * 1000)
  // addEventListener('focus', refreshOnReturn)
  useEffect(() => {
    injectCosmicPhilosophyBackground();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
      document.body.classList.toggle('light-theme', !darkMode);
    }
  }, [darkMode]);

  // Yalnızca emrepelit7337.blogspot.com orijinal Türkçe makalelerini yükle
  const loadOriginalTurkishArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        const list: Article[] = Array.isArray(data) ? data : (data?.articles || data?.posts || []);
        const onlyTurkish = list.filter(isOriginalTurkishArticle);
        if (data?.articles && data.articles.length >= RECOVERED_TURKISH_ARTICLES.length && onlyTurkish.length > 0) {
          setRawTurkishArticles(onlyTurkish);
          return;
        }
      }
    } catch {}

    try {
      const fallbackRes = await fetch('/catalog.json');
      if (fallbackRes.ok) {
        const cat = await fallbackRes.json();
        const list: Article[] = cat?.posts || cat?.articles || [];
        setRawTurkishArticles(list.filter(isOriginalTurkishArticle));
      }
    } catch (err) {
      console.error('Orijinal Türkçe katalog yükleme hatası:', err);
    }
  }, []);

  useEffect(() => {
    loadOriginalTurkishArticles();
    const interval = setInterval(loadOriginalTurkishArticles, 60000);
    return () => clearInterval(interval);
  }, [loadOriginalTurkishArticles]);

  // Dil çubuğuna basıldığında tüm orijinal Türkçe makaleleri hedef dile çevir
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      try {
        localStorage.setItem('sciphil_lang', lang);
      } catch {}
    }

    if (!rawTurkishArticles.length || lang === 'tr') {
      setIsTranslating(false);
      return;
    }

    let cancelled = false;
    async function translateAllTurkishArticlesToTarget() {
      setIsTranslating(true);
      try {
        const results = await Promise.all(
          rawTurkishArticles.map(async (art) => {
            const cacheKey = `${lang}_${art.id}`;
            const translated = await translateArticleSimultaneously(art, lang);
            return [cacheKey, translated] as const;
          })
        );

        if (!cancelled) {
          setTranslatedArticlesMap((prev) => {
            const next = { ...prev };
            for (const [k, v] of results) {
              next[k] = v;
            }
            return next;
          });
        }
      } catch (e) {
        console.warn('Çeviri uyarısı:', e);
      } finally {
        if (!cancelled) setIsTranslating(false);
      }
    }

    translateAllTurkishArticlesToTarget();
    return () => {
      cancelled = true;
    };
  }, [lang, rawTurkishArticles]);

  // Açık bir makale modalı varsa dil değiştiğinde onu da anında hedef dile güncelle
  useEffect(() => {
    if (!selectedArticle) return;
    if (lang === 'tr') {
      const orig = rawTurkishArticles.find((a) => a.id === selectedArticle.id);
      if (orig) setSelectedArticle(orig);
      return;
    }
    const cached = translatedArticlesMap[`${lang}_${selectedArticle.id}`];
    if (cached) {
      setSelectedArticle(cached);
    } else {
      translateArticleSimultaneously(selectedArticle, lang).then((trArt) => {
        setTranslatedArticlesMap((prev) => ({ ...prev, [`${lang}_${trArt.id}`]: trArt }));
        setSelectedArticle(trArt);
      });
    }
  }, [lang, translatedArticlesMap]);

  // DİNLEME MODU (TTS) FONKSİYONLARI
  const stopListening = useCallback(() => {
    speechSessionRef.current += 1;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setActiveAudioArticleId(null);
    setIsAudioPaused(false);
    setSpeechProgress({ current: 0, total: 0 });
  }, []);

  const startListeningArticle = useCallback(async (article: Article, customRate?: number) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    // Eğer seçili dil Türkçe değilse ve makale henüz tam çevrilmediyse önce tam çevirisini al
    let targetArticle = article;
    if (lang !== 'tr' && (article.language || 'tr') === 'tr' && !(article as any).translatedTo) {
      targetArticle = await translateArticleSimultaneously(article, lang);
      setTranslatedArticlesMap((prev) => ({
        ...prev,
        [`${lang}_${article.id}`]: targetArticle
      }));
    }

    window.speechSynthesis.cancel();
    const sessionId = speechSessionRef.current + 1;
    speechSessionRef.current = sessionId;

    const chunks = splitArticleIntoSpeechChunks(targetArticle);
    const rateToUse = customRate ?? speechRate;
    const targetBcp47 = SPEECH_LANG_MAP[lang] || 'tr-TR';

    setActiveAudioArticleId(article.id);
    setIsAudioPaused(false);
    setSpeechProgress({ current: 1, total: chunks.length });

    const speakChunkAt = (index: number) => {
      if (speechSessionRef.current !== sessionId) return;
      if (index >= chunks.length) {
        setActiveAudioArticleId(null);
        setIsAudioPaused(false);
        setSpeechProgress({ current: 0, total: 0 });
        return;
      }

      setSpeechProgress({ current: index + 1, total: chunks.length });
      const utterance = new SpeechSynthesisUtterance(chunks[index]);
      utterance.lang = targetBcp47;
      utterance.rate = rateToUse;

      // Seçilen dile uygun doğal sesi bul
      const voices = window.speechSynthesis.getVoices();
      const matchingVoice = voices.find((v) => v.lang.toLowerCase().startsWith(lang));
      if (matchingVoice) utterance.voice = matchingVoice;

      utterance.onend = () => {
        if (speechSessionRef.current === sessionId) {
          speakChunkAt(index + 1);
        }
      };

      utterance.onerror = () => {
        if (speechSessionRef.current === sessionId) {
          setActiveAudioArticleId(null);
          setIsAudioPaused(false);
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    speakChunkAt(0);
  }, [lang, speechRate]);

  const togglePauseResumeListening = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (window.speechSynthesis.speaking) {
      if (isAudioPaused) {
        window.speechSynthesis.resume();
        setIsAudioPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsAudioPaused(true);
      }
    }
  }, [isAudioPaused]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleLanguageChange = (nextLang: LangCode) => {
    stopListening();
    setLang(nextLang);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sciphil:language-change', { detail: { lang: nextLang } }));
    }
  };

  const handleManualSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      await triggerManualBloggerSync();
      await loadOriginalTurkishArticles();
    } finally {
      setIsSyncing(false);
    }
  };

  const localizedArticles = useMemo(() => {
    if (lang === 'tr') return rawTurkishArticles;
    return rawTurkishArticles.map((art) => {
      const key = `${lang}_${art.id}`;
      return translatedArticlesMap[key] || art;
    });
  }, [rawTurkishArticles, translatedArticlesMap, lang]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    localizedArticles.forEach((a) => {
      (a.categories || []).forEach((c) => {
        if (c) set.add(c);
      });
    });
    return Array.from(set);
  }, [localizedArticles]);

  const filteredArticles = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return localizedArticles.filter((art) => {
      if (selectedCategory !== 'ALL' && !(art.categories || []).includes(selectedCategory)) {
        return false;
      }
      if (!q) return true;
      return (
        (art.title || '').toLowerCase().includes(q) ||
        (art.excerpt || art.summary || '').toLowerCase().includes(q) ||
        (art.claim || art.dialecticalTriad?.claim || '').toLowerCase().includes(q) ||
        (art.categories || []).some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [localizedArticles, selectedCategory, searchQuery]);

  const totalWords = useMemo(() => {
    return rawTurkishArticles.reduce((sum, a) => sum + (Number(a.wordCount) || 0), 0);
  }, [rawTurkishArticles]);

  const openArticleDetail = async (article: Article) => {
    setSelectedArticle(article);
    if (lang !== 'tr') {
      const fullyTranslated = await translateArticleSimultaneously(article, lang);
      setTranslatedArticlesMap((prev) => ({
        ...prev,
        [`${lang}_${article.id}`]: fullyTranslated
      }));
      setSelectedArticle(fullyTranslated);
    }
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* SABİT ÜST MENÜ VE ÇEVİRİ ÇUBUĞU (HER DİLDE YAPISI KORUNUR) */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          <a href="#top" className="flex items-center gap-3 shrink-0 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-sky-500/20" translate="no">
              Φ
            </div>
            <div>
              <span className="font-bold tracking-tight text-white group-hover:text-sky-400 transition-colors block leading-none" translate="no">
                Science &amp; Philosophy
              </span>
              <span className="text-[10px] text-sky-400/90 tracking-wider uppercase block mt-1">
                {ui.brandSubtitle}
              </span>
            </div>
          </a>

          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-300">
            <a href="#articles-section" className="hover:text-sky-400 transition-colors">
              {ui.navArticles} ({rawTurkishArticles.length})
            </a>
            <a href="#socratic-section" className="hover:text-sky-400 transition-colors">
              {ui.navSocratic}
            </a>
            <a href="#articles-section" className="hover:text-sky-400 transition-colors">
              {ui.navSector}
            </a>
            <a
              href="/analytics.html"
              className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{ui.navAnalytics}</span>
            </a>
          </nav>

          {/* ÇEVİRİ ÇUBUĞU (TR | EN | DE | FR | ES) + BLOGGER EŞİTLEME */}
          <div className="flex items-center gap-2 shrink-0">
            <div
              className="flex items-center bg-slate-900 border border-sky-500/30 rounded-lg p-1 text-xs font-bold shadow-inner"
              role="group"
              aria-label="Dil Çeviri Çubuğu"
              translate="no"
            >
              {(['tr', 'en', 'de', 'fr', 'es'] as LangCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleLanguageChange(code)}
                  className={`px-2.5 py-1 rounded uppercase transition-all ${
                    lang === code
                      ? 'bg-sky-600 text-white shadow-md scale-105'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-md"
            >
              {isSyncing ? ui.syncingBtn : `↻ ${ui.syncBtn}`}
            </button>

            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs"
              title="Theme"
            >
              {darkMode ? '🌙' : '☀️'}
            </button>
          </div>
        </div>
      </header>

      {/* Çeviri Durum Çubuğu */}
      {isTranslating && (
        <div className="bg-sky-950/90 border-b border-sky-500/30 text-sky-200 text-xs py-2 px-4 text-center font-medium animate-pulse">
          ⚡ {ui.translatingNotice}
        </div>
      )}

      {/* Aktif Dinleme Modu Yüzen Kontrol Çubuğu (Herhangi bir makale dinlenirken üstte görünür) */}
      {activeAudioArticleId && (
        <div className="sticky top-16 z-40 bg-slate-900/95 border-b border-emerald-500/40 backdrop-blur-md px-4 py-2.5 shadow-xl">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <strong className="text-emerald-300 uppercase tracking-wider">{ui.listeningNowLabel}:</strong>
              <span className="text-white font-semibold truncate max-w-md">
                {localizedArticles.find((a) => a.id === activeAudioArticleId)?.title}
              </span>
              <span className="text-slate-400 font-mono" translate="no">
                ({speechProgress.current}/{speechProgress.total})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Hız Seçici */}
              <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5 font-mono text-[11px]" translate="no">
                {[1, 1.25, 1.5].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setSpeechRate(r);
                      const art = localizedArticles.find((a) => a.id === activeAudioArticleId);
                      if (art) startListeningArticle(art, r);
                    }}
                    className={`px-2 py-0.5 rounded ${
                      speechRate === r ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {r}x
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={togglePauseResumeListening}
                className="px-3 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold"
              >
                {isAudioPaused ? `▶ ${ui.resumeListenBtn}` : `⏸ ${ui.pauseListenBtn}`}
              </button>

              <button
                type="button"
                onClick={stopListening}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
              >
                ⏹ {ui.stopListenBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ANA İÇERİK */}
      <main id="top" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* 1. HERO BÖLÜMÜ */}
        <section className="rounded-2xl bg-slate-900/75 border border-sky-500/20 backdrop-blur-xl p-6 sm:p-10 shadow-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
            <span>{ui.heroBadge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            {ui.heroTitle}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-4xl leading-relaxed">
            {ui.heroDesc}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800/80">
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">{ui.statsArticles}</span>
              <strong className="text-2xl font-black text-sky-400 font-mono" translate="no">{rawTurkishArticles.length}</strong>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">{ui.statsWords}</span>
              <strong className="text-2xl font-black text-emerald-400 font-mono" translate="no">{totalWords.toLocaleString('tr-TR')}</strong>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">{ui.statsSource}</span>
              <a
                href="https://emrepelit7337.blogspot.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-bold text-amber-400 hover:text-amber-300 truncate block mt-1"
                translate="no"
              >
                Blog Ana Sayfa · emrepelit7337.blogspot.com ↗
              </a>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">{ui.navAnalytics}</span>
              <a href="/analytics.html" className="text-sm font-bold text-indigo-400 hover:text-indigo-300">
                Read-Only Konsol ↗
              </a>
            </div>
          </div>
        </section>

        {/* 2. SOKRATİK DİYALOG LABORATUVARI */}
        <section id="socratic-section" className="space-y-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white">{ui.socraticSectionTitle}</h2>
            <p className="text-xs sm:text-sm text-slate-400">{ui.socraticSectionDesc}</p>
          </div>
          <SocraticPartner lang={lang} />
        </section>

        {/* 3. ORİJİNAL TÜRKÇE MAKALELER LİSTESİ (HER MAKALEDE DİNLEME MODU + ÇEVİRİ DESTEĞİ) */}
        <section id="articles-section" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-slate-900/80 p-4 rounded-xl border border-slate-800 backdrop-blur-md">
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={ui.searchPlaceholder}
              className="flex-1 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">{ui.allCategories} ({localizedArticles.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => {
              const sector = buildLocalizedSectorAnalysis(art, lang);
              const claimText = art.claim || art.dialecticalTriad?.claim || art.title;
              const notProofText =
                art.notProof ||
                art.dialecticalTriad?.whatIsNotEvidence ||
                'Yazarın analojisi bağımsız deneyle doğrulanmadıkça tek başına mutlak kanıt sayılmaz.';
              const isPlayingThis = activeAudioArticleId === art.id;

              return (
                <article
                  key={art.id}
                  className={`rounded-2xl bg-slate-900/80 border transition-all p-6 flex flex-col justify-between space-y-5 shadow-xl backdrop-blur-md ${
                    isPlayingThis ? 'border-emerald-500/70 ring-1 ring-emerald-500/30' : 'border-slate-800/90 hover:border-sky-500/40'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="px-2.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-semibold">
                        {(art.categories && art.categories[0]) || 'Bilim & Felsefe'}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-medium">
                        {ui.trOriginalBadge}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-white leading-snug hover:text-sky-400 transition-colors">
                      <button
                        type="button"
                        onClick={() => openArticleDetail(art)}
                        className="text-left"
                      >
                        {art.title}
                      </button>
                    </h3>

                    <div className="text-[11px] text-slate-400 font-mono" translate="no">
                      {art.wordCount || 250} {ui.wordsUnit} • {art.readingTime || '2 dk'}
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {art.excerpt || art.summary || ''}
                    </p>

                    {/* HER MAKALE KARTINDA DİNLEME MODU ÇUBUĞU */}
                    <div className="bg-slate-950/90 border border-emerald-500/25 rounded-xl p-2.5 flex items-center justify-between gap-2">
                      {!isPlayingThis ? (
                        <button
                          type="button"
                          onClick={() => startListeningArticle(art)}
                          className="w-full py-1.5 px-3 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                        >
                          <span>🎧</span>
                          <span>{ui.listenModeBtn} ({lang.toUpperCase()})</span>
                        </button>
                      ) : (
                        <div className="w-full flex items-center justify-between gap-1.5 text-[11px]">
                          <button
                            type="button"
                            onClick={togglePauseResumeListening}
                            className="flex-1 py-1 px-2 rounded bg-amber-600 hover:bg-amber-500 text-white font-bold"
                          >
                            {isAudioPaused ? `▶ ${ui.resumeListenBtn}` : `⏸ ${ui.pauseListenBtn}`}
                          </button>
                          <button
                            type="button"
                            onClick={stopListening}
                            className="py-1 px-2.5 rounded bg-rose-600 hover:bg-rose-500 text-white font-bold"
                          >
                            ⏹ {ui.stopListenBtn}
                          </button>
                          <span className="text-emerald-400 font-mono px-1" translate="no">
                            {speechProgress.current}/{speechProgress.total}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Epistemik Üçlü Özeti */}
                    <div className="bg-slate-950/75 border border-slate-800/90 rounded-xl p-3 space-y-2 text-[11px]">
                      <div>
                        <span className="text-sky-400 font-bold uppercase">{ui.claimLabel}: </span>
                        <span className="text-slate-300 line-clamp-2">{claimText}</span>
                      </div>
                      <div>
                        <span className="text-rose-400 font-bold uppercase">{ui.notProofLabel}: </span>
                        <span className="text-slate-400 line-clamp-2">{notProofText}</span>
                      </div>
                    </div>

                    {/* Sektör Tanımı */}
                    <div className="bg-indigo-950/25 border border-indigo-500/20 rounded-xl p-3 space-y-1.5 text-[11px]">
                      <div className="font-bold text-indigo-300 uppercase tracking-wider">
                        {ui.sectorDefTitle}
                      </div>
                      <p className="text-slate-300 line-clamp-2">{sector.sectorDef}</p>
                      <button
                        type="button"
                        onClick={() => setSectorModalArticle(art)}
                        className="text-sky-400 hover:text-sky-300 font-semibold pt-1 inline-block"
                      >
                        {ui.openSectorEvalBtn} →
                      </button>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => openArticleDetail(art)}
                      className="px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-xs font-bold text-white transition-all"
                    >
                      {ui.readArticleBtn}
                    </button>

                    <div className="flex items-center gap-2 text-xs">
                      <a
                        href={`/makale/${art.slug}`}
                        className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
                      >
                        SEO URL ↗
                      </a>
                      {art.originalUrl && (
                        <a
                          href={art.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 rounded bg-amber-500/15 text-amber-300 hover:bg-amber-500/25 font-medium"
                        >
                          Blogger ↗
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </main>

      {/* MAKALE OKUMA VE DİNLEME MODALI */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-sky-400 uppercase">
                  {(selectedArticle.categories || []).join(' • ')}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {selectedArticle.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopListening();
                  setSelectedArticle(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                ✕ {ui.closeModalBtn}
              </button>
            </div>

            {/* MODAL İÇİ DİNLEME MODU VE ÇEVİRİ ÇUBUĞU */}
            <div className="bg-slate-950 border border-emerald-500/30 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                {activeAudioArticleId !== selectedArticle.id ? (
                  <button
                    type="button"
                    onClick={() => startListeningArticle(selectedArticle)}
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 font-bold text-white flex items-center gap-2 shadow-md"
                  >
                    <span>🎧</span>
                    <span>{ui.listenModeBtn} ({lang.toUpperCase()})</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={togglePauseResumeListening}
                      className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 font-bold text-white"
                    >
                      {isAudioPaused ? `▶ ${ui.resumeListenBtn}` : `⏸ ${ui.pauseListenBtn}`}
                    </button>
                    <button
                      type="button"
                      onClick={stopListening}
                      className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 font-bold text-white"
                    >
                      ⏹ {ui.stopListenBtn}
                    </button>
                    <span className="text-emerald-400 font-mono font-bold px-2" translate="no">
                      {speechProgress.current} / {speechProgress.total}
                    </span>
                  </>
                )}

                {/* Hız Kontrolü */}
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 font-mono" translate="no">
                  {[1, 1.25, 1.5].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        setSpeechRate(r);
                        if (activeAudioArticleId === selectedArticle.id) {
                          startListeningArticle(selectedArticle, r);
                        }
                      }}
                      className={`px-2 py-1 rounded ${
                        speechRate === r ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {r}x
                    </button>
                  ))}
                </div>
              </div>

              {/* Okuma Ekranı İçi Hızlı Dil Seçici */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 font-bold" translate="no">
                  {(['tr', 'en', 'de', 'fr', 'es'] as LangCode[]).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => handleLanguageChange(code)}
                      className={`px-2 py-1 rounded uppercase ${
                        lang === code ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                </div>

                {selectedArticle.originalUrl && (
                  <a
                    href={selectedArticle.originalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 rounded-lg bg-amber-500/20 text-amber-300 font-bold"
                  >
                    {ui.originalBloggerBtn}
                  </a>
                )}
              </div>
            </div>

            {/* Sektör Değerlendirmesi Paneli */}
            {(() => {
              const sec = buildLocalizedSectorAnalysis(selectedArticle, lang);
              return (
                <div className="bg-slate-950/90 border border-indigo-500/30 rounded-xl p-5 space-y-3 text-xs">
                  <h3 className="text-sm font-bold text-indigo-400 uppercase">{ui.sectorEvalTitle}</h3>
                  <p><strong className="text-slate-200">{ui.sectorDefTitle}:</strong> <span className="text-slate-300">{sec.sectorDef}</span></p>
                  <p><strong className="text-slate-200">{ui.sectorImpactLabel}</strong> <span className="text-slate-300">{sec.impact}</span></p>
                  <p><strong className="text-slate-200">{ui.sectorMethodLabel}</strong> <span className="text-slate-300">{sec.method}</span></p>
                  <p><strong className="text-slate-200">{ui.sectorRiskLabel}</strong> <span className="text-slate-300">{sec.risk}</span></p>
                </div>
              );
            })()}

            {/* Makale Tam Gövdesi */}
            <div
              className="prose prose-invert max-w-none text-slate-200 text-sm sm:text-base leading-relaxed space-y-4"
              dangerouslySetInnerHTML={{
                __html: selectedArticle.content || `<p>${selectedArticle.excerpt || selectedArticle.summary || ''}</p>`
              }}
            />
          </div>
        </div>
      )}

      {/* DETAYLI SEKTÖR DEĞERLENDİRMESİ MODALI */}
      {sectorModalArticle && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-indigo-400 uppercase">{ui.sectorEvalTitle}</h3>
              <button
                type="button"
                onClick={() => setSectorModalArticle(null)}
                className="px-3 py-1 rounded bg-slate-800 text-xs font-bold text-slate-300"
              >
                ✕ {ui.closeModalBtn}
              </button>
            </div>
            <h4 className="text-lg font-bold text-white">{sectorModalArticle.title}</h4>
            {(() => {
              const sec = buildLocalizedSectorAnalysis(sectorModalArticle, lang);
              return (
                <div className="space-y-3 text-xs sm:text-sm text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-sky-400 block mb-1">{ui.sectorDefTitle}</strong>
                    {sec.sectorDef}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-emerald-400 block mb-1">{ui.sectorImpactLabel}</strong>
                    {sec.impact}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-amber-400 block mb-1">{ui.sectorMethodLabel}</strong>
                    {sec.method}
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <strong className="text-rose-400 block mb-1">{ui.sectorRiskLabel}</strong>
                    {sec.risk}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ALT BİLGİ */}
      <footer className="border-t border-slate-800/80 bg-slate-950/90 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            © {new Date().getFullYear()} <strong className="text-slate-200" translate="no">Emre Pelit — Science &amp; Philosophy</strong>. {ui.footerRights}
          </div>
          <div className="flex items-center gap-4">
            <a href="/analytics.html" className="text-sky-400 hover:text-sky-300 font-semibold">
              {ui.navAnalytics} ↗
            </a>
            <a href="/sitemap.xml" className="hover:text-slate-200">
              Sitemap.xml
            </a>
            <a href="https://emrepelit7337.blogspot.com/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">
              Blogger ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}