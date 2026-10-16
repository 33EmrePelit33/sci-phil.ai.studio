import React, { useState, useEffect, useMemo, useCallback } from 'react';
import SocraticPartner from './SocraticPartner';
import {
  translateArticleSimultaneously,
  translateNaturalText,
  triggerManualBloggerSync,
  injectCosmicPhilosophyBackground
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
  allLanguagesBadge: string;
  statsArticles: string;
  statsWords: string;
  statsLanguages: string;
  readArticleBtn: string;
  openSectorEvalBtn: string;
  closeModalBtn: string;
  originalBloggerBtn: string;
  listenArticleBtn: string;
  stopListenBtn: string;
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
}> = {
  tr: {
    brandSubtitle: 'Bilim, Kozmoloji ve Felsefe Portalı • Emre Pelit',
    navArticles: 'Makale Külliyatı',
    navSocratic: 'Sokratik Laboratuvar',
    navSector: 'Sektör Analizi',
    navAnalytics: 'Live Analytics',
    syncBtn: 'Blogger Eşitle',
    syncingBtn: 'Eşitleniyor...',
    heroBadge: 'Blogger (Time & Entropy) ile Otomatik Senkronize • Çok Dilli Külliyat',
    heroTitle: 'Bilim, Teorik Fizik, Kozmoloji ve Epistemolojik Felsefe',
    heroDesc: 'Emre Pelit’in kuantum mekaniği, kara delik termodinamiği, Higgs alanı, nöronal zaman algısı, yapay zekâ bilinci ve kelâm-felsefe sentezleri üzerine çok dilli makale arşivi ve Sokratik analiz merkezi.',
    searchPlaceholder: 'Makale, teorem, kavram veya kategori ara...',
    allCategories: 'Tüm Kategoriler',
    allLanguagesBadge: 'Tüm Makaleler Hedef Dile Çevrildi',
    statsArticles: 'Toplam Makale',
    statsWords: 'Akademik Kelime',
    statsLanguages: 'Aktif Dil',
    readArticleBtn: 'Makaleyi Oku',
    openSectorEvalBtn: 'Detaylı Değerlendirmeyi Aç',
    closeModalBtn: 'Kapat',
    originalBloggerBtn: 'Blogger Kaynağı ↗',
    listenArticleBtn: 'Sesli Dinle',
    stopListenBtn: 'Durdur',
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
    footerRights: 'Tüm hakları saklıdır. Katalog ve Blogger senkronizasyonu aktiftir.',
    translatingNotice: 'Tüm sayfa içeriği seçilen doğal dile çevriliyor...',
    wordsUnit: 'kelime'
  },
  en: {
    brandSubtitle: 'Science, Cosmology & Philosophy Portal • Emre Pelit',
    navArticles: 'Article Corpus',
    navSocratic: 'Socratic Laboratory',
    navSector: 'Sector Analysis',
    navAnalytics: 'Live Analytics',
    syncBtn: 'Sync Blogger',
    syncingBtn: 'Syncing...',
    heroBadge: 'Auto-Synchronized with Blogger (Time & Entropy) • Multilingual Corpus',
    heroTitle: 'Science, Theoretical Physics, Cosmology & Epistemological Philosophy',
    heroDesc: 'Emre Pelit’s multilingual article archive and Socratic analysis hub on quantum mechanics, black hole thermodynamics, the Higgs field, neuronal time perception, AI consciousness, and philosophical synthesis.',
    searchPlaceholder: 'Search articles, theorems, concepts, or categories...',
    allCategories: 'All Categories',
    allLanguagesBadge: 'All Articles Translated to Target Language',
    statsArticles: 'Total Articles',
    statsWords: 'Academic Words',
    statsLanguages: 'Active Languages',
    readArticleBtn: 'Read Article',
    openSectorEvalBtn: 'Open Detailed Evaluation',
    closeModalBtn: 'Close',
    originalBloggerBtn: 'Blogger Source ↗',
    listenArticleBtn: 'Listen Audio',
    stopListenBtn: 'Stop Audio',
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
    footerRights: 'All rights reserved. Catalog and Blogger synchronization active.',
    translatingNotice: 'Translating entire site content into natural English...',
    wordsUnit: 'words'
  },
  de: {
    brandSubtitle: 'Portal für Wissenschaft, Kosmologie & Philosophie • Emre Pelit',
    navArticles: 'Artikelkorpus',
    navSocratic: 'Sokratisches Labor',
    navSector: 'Sektoranalyse',
    navAnalytics: 'Live Analytics',
    syncBtn: 'Blogger Sync',
    syncingBtn: 'Synchronisiere...',
    heroBadge: 'Automatisch synchronisiert mit Blogger (Time & Entropy) • Mehrsprachiges Archiv',
    heroTitle: 'Wissenschaft, Theoretische Physik, Kosmologie & Erkenntnistheorie',
    heroDesc: 'Mehrsprachiges Artikelarchiv und sokratisches Analysezentrum von Emre Pelit über Quantenmechanik, Thermodynamik Schwarzer Löcher, Higgs-Feld, neuronale Zeitwahrnehmung und KI-Bewusstsein.',
    searchPlaceholder: 'Artikel, Theoreme, Konzepte oder Kategorien suchen...',
    allCategories: 'Alle Kategorien',
    allLanguagesBadge: 'Alle Artikel in die Zielsprache übersetzt',
    statsArticles: 'Artikel Gesamt',
    statsWords: 'Akademische Wörter',
    statsLanguages: 'Aktive Sprachen',
    readArticleBtn: 'Artikel lesen',
    openSectorEvalBtn: 'Detaillierte Bewertung öffnen',
    closeModalBtn: 'Schließen',
    originalBloggerBtn: 'Blogger-Quelle ↗',
    listenArticleBtn: 'Vorlesen',
    stopListenBtn: 'Stoppen',
    claimLabel: 'Kernbehauptung (These)',
    counterClaimLabel: 'Sokratische Gegenthese',
    notProofLabel: 'Wofür ist es kein Beweis?',
    sectorDefTitle: 'Sektordefinition',
    sectorEvalTitle: 'Sektorbewertung',
    sectorImpactLabel: 'Disziplinärer Beitrag & Umfang:',
    sectorMethodLabel: 'Evidenz- & Methodenrahmen:',
    sectorRiskLabel: 'Epistemische Grenzen & Prüfkriterien:',
    socraticSectionTitle: 'Sokratischer Denkpartner & Epistemischer Filter',
    socraticSectionDesc: 'Prüfen Sie Ihre wissenschaftlichen oder philosophischen Thesen dialektisch und analysieren Sie Gegenthesen sofort.',
    footerRights: 'Alle Rechte vorbehalten. Katalog- und Blogger-Synchronisation aktiv.',
    translatingNotice: 'Gesamter Seiteninhalt wird ins Deutsche übersetzt...',
    wordsUnit: 'Wörter'
  },
  fr: {
    brandSubtitle: 'Portail Science, Cosmologie & Philosophie • Emre Pelit',
    navArticles: 'Corpus d’Articles',
    navSocratic: 'Laboratoire Socratique',
    navSector: 'Analyse Sectorielle',
    navAnalytics: 'Live Analytics',
    syncBtn: 'Sync Blogger',
    syncingBtn: 'Synchronisation...',
    heroBadge: 'Synchronisé automatiquement avec Blogger (Time & Entropy) • Corpus Multilingue',
    heroTitle: 'Science, Physique Théorique, Cosmologie & Philosophie Épistémologique',
    heroDesc: 'Archive multilingue et centre d’analyse socratique d’Emre Pelit sur la mécanique quantique, la thermodynamique des trous noirs, le champ de Higgs, la perception neuronale du temps et la conscience de l’IA.',
    searchPlaceholder: 'Rechercher des articles, théorèmes, concepts ou catégories...',
    allCategories: 'Toutes les catégories',
    allLanguagesBadge: 'Tous les articles traduits dans la langue cible',
    statsArticles: 'Total des Articles',
    statsWords: 'Mots Académiques',
    statsLanguages: 'Langues Actives',
    readArticleBtn: 'Lire l’article',
    openSectorEvalBtn: 'Ouvrir l’évaluation détaillée',
    closeModalBtn: 'Fermer',
    originalBloggerBtn: 'Source Blogger ↗',
    listenArticleBtn: 'Écouter',
    stopListenBtn: 'Arrêter',
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
    footerRights: 'Tous droits réservés. Synchronisation du catalogue et de Blogger active.',
    translatingNotice: 'Traduction de tout le contenu du site en français...',
    wordsUnit: 'mots'
  },
  es: {
    brandSubtitle: 'Portal de Ciencia, Cosmología y Filosofía • Emre Pelit',
    navArticles: 'Corpus de Artículos',
    navSocratic: 'Laboratorio Socrático',
    navSector: 'Análisis Sectorial',
    navAnalytics: 'Live Analytics',
    syncBtn: 'Sincronizar Blog',
    syncingBtn: 'Sincronizando...',
    heroBadge: 'Sincronizado automáticamente con Blogger (Time & Entropy) • Corpus Multilingüe',
    heroTitle: 'Ciencia, Física Teórica, Cosmología y Filosofía Epistemológica',
    heroDesc: 'Archivo multilingüe de artículos y centro de análisis socrático de Emre Pelit sobre mecánica cuántica, agujeros negros, el campo de Higgs, percepción neuronal del tiempo y conciencia de la IA.',
    searchPlaceholder: 'Buscar artículos, teoremas, conceptos o categorías...',
    allCategories: 'Todas las categorías',
    allLanguagesBadge: 'Todos los artículos traducidos al idioma de destino',
    statsArticles: 'Total de Artículos',
    statsWords: 'Palabras Académicas',
    statsLanguages: 'Idiomas Activos',
    readArticleBtn: 'Leer artículo',
    openSectorEvalBtn: 'Abrir evaluación detallada',
    closeModalBtn: 'Cerrar',
    originalBloggerBtn: 'Fuente Blogger ↗',
    listenArticleBtn: 'Escuchar',
    stopListenBtn: 'Detener',
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
    footerRights: 'Todos los derechos reservados. Sincronización activa.',
    translatingNotice: 'Traduciendo todo el contenido del sitio al español...',
    wordsUnit: 'palabras'
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

export default function App() {
  const [lang, setLang] = useState<LangCode>(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('sciphil_lang') : null;
    if (saved && /^(tr|en|de|fr|es)$/i.test(saved)) return saved.toLowerCase() as LangCode;
    return 'tr';
  });

  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [rawArticles, setRawArticles] = useState<Article[]>([]);
  const [translatedArticlesMap, setTranslatedArticlesMap] = useState<Record<string, Article>>({});
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [sectorModalArticle, setSectorModalArticle] = useState<Article | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const ui = UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.tr;

  useEffect(() => {
    injectCosmicPhilosophyBackground();
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', darkMode);
      document.body.classList.toggle('light-theme', !darkMode);
    }
  }, [darkMode]);

  const loadArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/articles');
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.posts || data?.articles || []);
        if (list.length > 0) {
          setRawArticles(list);
          return;
        }
      }
    } catch {}

    try {
      const fallbackRes = await fetch('/catalog.json');
      if (fallbackRes.ok) {
        const cat = await fallbackRes.json();
        setRawArticles(cat?.posts || cat?.articles || []);
      }
    } catch (err) {
      console.error('Katalog yükleme hatası:', err);
    }
  }, []);

  useEffect(() => {
    loadArticles();
    const interval = setInterval(loadArticles, 60000);
    return () => clearInterval(interval);
  }, [loadArticles]);

  // Dil seçildiğinde tüm görünür makaleleri ve açık modalı hedef doğal dile çevir
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      try {
        localStorage.setItem('sciphil_lang', lang);
      } catch {}
    }

    if (!rawArticles.length) return;

    let cancelled = false;
    async function translateCatalogForTargetLang() {
      setIsTranslating(true);
      try {
        // Hedef dilde zaten doğal olarak yazılmış olanları koru, diğerlerini paralel çevir
        const toTranslate = rawArticles.slice(0, 60);
        const batchResults = await Promise.all(
          toTranslate.map(async (art) => {
            const cacheKey = `${lang}_${art.id}`;
            if ((art.language || 'tr').toLowerCase() === lang) {
              return [cacheKey, art] as const;
            }
            const translated = await translateArticleSimultaneously(art, lang);
            return [cacheKey, translated] as const;
          })
        );

        if (!cancelled) {
          setTranslatedArticlesMap((prev) => {
            const next = { ...prev };
            for (const [k, v] of batchResults) {
              next[k] = v;
            }
            return next;
          });
        }
      } catch (e) {
        console.warn('Paralel çeviri uyarısı:', e);
      } finally {
        if (!cancelled) setIsTranslating(false);
      }
    }

    translateCatalogForTargetLang();
    return () => {
      cancelled = true;
    };
  }, [lang, rawArticles]);

  const handleLanguageChange = (nextLang: LangCode) => {
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
      await loadArticles();
    } finally {
      setIsSyncing(false);
    }
  };

  // Katalogdaki makalelerin hedef dile çevrilmiş listesi
  const localizedArticles = useMemo(() => {
    return rawArticles.map((art) => {
      const key = `${lang}_${art.id}`;
      return translatedArticlesMap[key] || art;
    });
  }, [rawArticles, translatedArticlesMap, lang]);

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
    return rawArticles.reduce((sum, a) => sum + (Number(a.wordCount) || 0), 0);
  }, [rawArticles]);

  const openArticleDetail = async (article: Article) => {
    setSelectedArticle(article);
    if ((article.language || 'tr').toLowerCase() !== lang) {
      const fullyTranslated = await translateArticleSimultaneously(article, lang);
      setTranslatedArticlesMap((prev) => ({
        ...prev,
        [`${lang}_${article.id}`]: fullyTranslated
      }));
      setSelectedArticle(fullyTranslated);
    }
  };

  const toggleSpeech = (article: Article) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const plain = (article.content || article.excerpt || article.summary || '')
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    const utterance = new SpeechSynthesisUtterance(`${article.title}. ${plain}`);
    utterance.lang = lang === 'tr' ? 'tr-TR' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : 'en-US';
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen text-slate-100 flex flex-col">
      {/* SABİT ÜST MENÜ (HER DİLDE YAPISI VE KONUMU DEĞİŞMEZ) */}
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Sol: Marka & Logo */}
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

          {/* Orta: Sabit Gezinme Menüsü */}
          <nav className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-300">
            <a href="#articles-section" className="hover:text-sky-400 transition-colors">
              {ui.navArticles}
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

          {/* Sağ: Dil Seçici + Blogger Sync + Tema */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1 text-xs font-bold" translate="no">
              {(['tr', 'en', 'de', 'fr', 'es'] as LangCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => handleLanguageChange(code)}
                  className={`px-2 py-1 rounded uppercase transition-all ${
                    lang === code
                      ? 'bg-sky-600 text-white shadow'
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

      {/* Çeviri Bildirim Çubuğu */}
      {isTranslating && (
        <div className="bg-sky-950/90 border-b border-sky-500/30 text-sky-200 text-xs py-2 px-4 text-center font-medium animate-pulse">
          ⚡ {ui.translatingNotice}
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
              <strong className="text-2xl font-black text-sky-400 font-mono" translate="no">{rawArticles.length || 294}</strong>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">{ui.statsWords}</span>
              <strong className="text-2xl font-black text-emerald-400 font-mono" translate="no">{totalWords.toLocaleString('tr-TR')}</strong>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">{ui.statsLanguages}</span>
              <strong className="text-2xl font-black text-indigo-400 font-mono" translate="no">TR • EN • DE • FR • ES</strong>
            </div>
            <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-[11px] uppercase tracking-wider text-slate-400 block">{ui.navAnalytics}</span>
              <a href="/analytics.html" className="text-sm font-bold text-amber-400 hover:text-amber-300">
                Read-Only Konsol ↗
              </a>
            </div>
          </div>
        </section>

        {/* 2. SOKRATİK DİYALOG LABORATUVARI */}
        <section id="socratic-section" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{ui.socraticSectionTitle}</h2>
              <p className="text-xs sm:text-sm text-slate-400">{ui.socraticSectionDesc}</p>
            </div>
          </div>
          <SocraticPartner lang={lang} />
        </section>

        {/* 3. ARAMA, KATEGORİ FİLTRESİ VE MAKALE KÜLLİYATI */}
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

          {/* Makale Kartları Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArticles.map((art) => {
              const sector = buildLocalizedSectorAnalysis(art, lang);
              const claimText = art.claim || art.dialecticalTriad?.claim || art.title;
              const notProofText =
                art.notProof ||
                art.dialecticalTriad?.whatIsNotEvidence ||
                'Yazarın analojisi bağımsız deneyle doğrulanmadıkça tek başına mutlak kanıt sayılmaz.';

              return (
                <article
                  key={art.id}
                  className="rounded-2xl bg-slate-900/80 border border-slate-800/90 hover:border-sky-500/40 transition-all p-6 flex flex-col justify-between space-y-5 shadow-xl backdrop-blur-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2 text-[11px]">
                      <span className="px-2.5 py-0.5 rounded bg-sky-500/15 text-sky-300 font-semibold">
                        {(art.categories && art.categories[0]) || 'Bilim & Felsefe'}
                      </span>
                      <span className="text-slate-400 font-mono" translate="no">
                        {art.wordCount || 250} {ui.wordsUnit} • {art.readingTime || '2 dk'}
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

                    <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                      {art.excerpt || art.summary || ''}
                    </p>

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

                    {/* Sektör Tanımı & Kısa Sektör Değerlendirmesi */}
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

      {/* MAKALE DETAY MODALI */}
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
                  if (isSpeaking && typeof window !== 'undefined') window.speechSynthesis?.cancel();
                  setIsSpeaking(false);
                  setSelectedArticle(null);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200"
              >
                ✕ {ui.closeModalBtn}
              </button>
            </div>

            {/* Sesli Okuma ve Kaynak Bağlantıları */}
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => toggleSpeech(selectedArticle)}
                className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 font-bold text-white"
              >
                🔊 {isSpeaking ? ui.stopListenBtn : ui.listenArticleBtn}
              </button>
              {selectedArticle.originalUrl && (
                <a
                  href={selectedArticle.originalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 font-bold"
                >
                  {ui.originalBloggerBtn}
                </a>
              )}
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

      {/* ALT BİLGİ (FOOTER) */}
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
            <a href="https://emrepelit7337.blogspot.com" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300">
              Blogger ↗
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}