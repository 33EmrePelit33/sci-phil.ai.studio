/**
 * Internationalization (i18n) Engine
 * Science & Philosophy — sci-phil.ai.studio
 */

export type SupportedLanguage = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ru' | 'ar' | 'ja' | 'zh';

export interface UiTranslations {
  // Brand & Header
  brandTitle: string;
  brandSubtitle: string;
  searchPlaceholder: string;
  searchClear: string;
  liveAnalytics: string;
  readingLangLabel: string;
  interactiveLab: string;
  previewConsole: string;
  syncBlogger: string;
  syncing: string;

  // Navigation Links (Consistent Across All Languages)
  navHome: string;
  navCatalog: string;
  navClusters: string;
  navAuthor: string;
  navBlog: string;
  share: string;
  socraticPartner: string;
  mathFormulations: string;

  // Hero Section
  heroPill: string;
  heroTitle: string;
  heroDescription: string;
  heroUniversalNoteTitle: string;
  heroUniversalNoteDesc: string;
  heroArticlesCount: string;
  heroZeroVuln: string;
  heroOpenLab: string;
  authorTitle: string;
  authorRole: string;
  authorBio: string;
  viewAuthorProfile: string;

  // Topic Clusters
  clustersPill: string;
  clustersTitle: string;
  clustersSubtitle: string;
  clustersMapLink: string;
  pillarThesis: string;
  openPillarArticle: string;
  filterCluster: string;

  // Catalog Section
  catalogTitle: string;
  paginatedView: string;
  viewAll: string;
  examinationLang: string;
  allCategory: string;
  noArticlesFound: string;
  noArticlesDesc: string;
  resetFilters: string;
  showingRange: string;
  firstPage: string;
  prevPage: string;
  nextPage: string;
  lastPage: string;

  // Article Card
  readingTime: string;
  originalTurkish: string;
  dialecticalTriadTitle: string;
  inspectTriad: string;
  claimLabel: string;
  counterClaimLabel: string;
  notProofLabel: string;
  notProofText: string;
  readArticle: string;
  previewInLang: string;

  // Footer & Common
  close: string;
  backToArticles: string;
  openArticleDirectly: string;
  footerTagline: string;
  footerRights: string;
  restApiDocs: string;
  sitemapLink: string;
}

export const UI_TRANSLATIONS: Record<SupportedLanguage, UiTranslations> = {
  tr: {
    navHome: 'Ana Sayfa',
    navCatalog: 'Katalog',
    navClusters: 'Konu Kümeleri',
    navAuthor: 'Yazar',
    navBlog: 'Blog',
    share: 'Paylaş',
    socraticPartner: 'Sokratik Partner',
    mathFormulations: 'Matematiksel Formülasyonlar',
    brandTitle: 'SCIENCE & PHILOSOPHY',
    brandSubtitle: 'Emre Pelit • Bilimsel & Felsefi Düşünce Portalı',
    searchPlaceholder: 'Makale, konu veya felsefi kavram ara...',
    searchClear: 'Temizle',
    liveAnalytics: 'Live Analytics',
    readingLangLabel: 'İnceleme Dili',
    interactiveLab: 'İnteraktif Laboratuvar',
    previewConsole: 'Preview Konsolu',
    syncBlogger: 'Blogger Senkronizasyonu',
    syncing: 'Senkronize ediliyor...',

    heroPill: 'Bilim, Zihin Felsefesi & Bilinç Araştırmaları • sci-phil.ai.studio',
    heroTitle: 'Bilim ve Zihin Felsefesi Kürsüsü',
    heroDescription: 'Emre Pelit tarafından kaleme alınmış orijinal Türkçe bilim ve felsefe külliyatı. Büyük Dil Modelleri’nden (LLM) nöral zaman algısına, kuantum kozmolojisinden blok evrene kadar derin düşünsel tezler.',
    heroUniversalNoteTitle: '🌐 Evrensel Çok Dilli İnceleme Desteği',
    heroUniversalNoteDesc: 'Uygulamada yazarın orijinal Türkçe makaleleri yer almaktadır. Dilediğiniz makaleyi tek tıkla dünya dillerinde akademik çeviri, doğal seslendirme ve yapay zeka itiraz çözümüyle inceleyebilirsiniz.',
    heroArticlesCount: 'Orijinal Türkçe Makale',
    heroZeroVuln: 'Sıfır Açık & Güvenli Mimari',
    heroOpenLab: 'İnteraktif Laboratuvarı Aç',
    authorTitle: 'Emre Pelit',
    authorRole: 'Bilim & Zihin Felsefesi Araştırmacısı',
    authorBio: 'Büyük Dil Modelleri, yapay zeka ontolojisi, zamanın simülasyon mekaniği ve zihin felsefesi üzerine eleştirel felsefi yayınlar.',
    viewAuthorProfile: 'Yazar Profilini İncele',

    clustersPill: 'Düşünsel Mimari & Topic Clusters',
    clustersTitle: '5 Temel Konu Kümesi ve Pillar Sayfa Ağı',
    clustersSubtitle: 'Bilim ve felsefe külliyatının iç içe geçmiş ontolojik konu kümeleri ve temel diyalektik pillar makaleleri.',
    clustersMapLink: 'İç Linkleme Haritası',
    pillarThesis: 'Pillar Tez',
    openPillarArticle: 'Pillar Makaleyi Aç',
    filterCluster: 'Filtrele',

    catalogTitle: 'Makale Dizini',
    paginatedView: 'Sayfalı Görünüm',
    viewAll: 'Tümünü Göster',
    examinationLang: 'İnceleme:',
    allCategory: 'Tümü',
    noArticlesFound: 'Aradığınız kriterlere uygun makale bulunamadı',
    noArticlesDesc: 'Arama kelimenizi değiştirebilir veya kategori filtresini temizleyebilirsiniz.',
    resetFilters: 'Filtreleri Sıfırla',
    showingRange: 'arası gösteriliyor',
    firstPage: 'İlk Sayfa',
    prevPage: 'Önceki Sayfa',
    nextPage: 'Sonraki Sayfa',
    lastPage: 'Son Sayfa',

    readingTime: 'dk okuma',
    originalTurkish: 'Orijinal Türkçe',
    dialecticalTriadTitle: 'Diyalektik Üçlü (Tez • Antitez • Sahte Deliller)',
    inspectTriad: 'İncele ↗',
    claimLabel: 'İddia:',
    counterClaimLabel: 'Karşı İddia:',
    notProofLabel: 'Neyin Kanıtı Değildir:',
    notProofText: 'Sahte deliller ve metodolojik safsatalar ayıklanmıştır',
    readArticle: 'Makaleyi Oku',
    previewInLang: 'dilinde incele',

    close: 'Kapat',
    backToArticles: 'Tüm makaleler arşivine dön',
    openArticleDirectly: 'Makaleyi Doğrudan Aç',
    footerTagline: 'Yazar: Emre Pelit | Orijinal Türkçe Külliyat & Çok Dilli Çeviri Motoru',
    footerRights: 'Tüm hakları saklıdır.',
    restApiDocs: 'REST API & Mobil Dokümantasyon',
    sitemapLink: 'Sitemap.xml'
  },

  en: {
    navHome: 'Home',
    navCatalog: 'Catalog',
    navClusters: 'Topic Clusters',
    navAuthor: 'Author',
    navBlog: 'Blog',
    share: 'Share',
    socraticPartner: 'Socratic Partner',
    mathFormulations: 'Mathematical Formulations',
    brandTitle: 'SCIENCE & PHILOSOPHY',
    brandSubtitle: 'Emre Pelit • Scientific & Philosophical Research Portal',
    searchPlaceholder: 'Search articles, topics or philosophical concepts...',
    searchClear: 'Clear',
    liveAnalytics: 'Live Analytics',
    readingLangLabel: 'Review Language',
    interactiveLab: 'Interactive Lab',
    previewConsole: 'Preview Console',
    syncBlogger: 'Sync Blogger Feed',
    syncing: 'Synchronizing...',

    heroPill: 'Science, Philosophy of Mind & Consciousness • sci-phil.ai.studio',
    heroTitle: 'Chair of Science and Philosophy of Mind',
    heroDescription: 'Rigorous philosophical and scientific corpus authored by Emre Pelit. Exploring Large Language Models (LLM), neuronal time perception, quantum cosmology, and the block universe hypothesis.',
    heroUniversalNoteTitle: '🌐 Universal Multilingual Inspection Support',
    heroUniversalNoteDesc: 'The archive contains the author’s original treatises. You can inspect any article instantly in international languages with academic translations, speech synthesis, and AI objection analysis.',
    heroArticlesCount: 'Original Treatises',
    heroZeroVuln: 'Zero Vulnerability Secure Architecture',
    heroOpenLab: 'Launch Interactive Lab',
    authorTitle: 'Emre Pelit',
    authorRole: 'Researcher in Philosophy of Mind & Science',
    authorBio: 'Critical publications on Large Language Models, ontology of AI, mechanics of time simulation, and philosophy of consciousness.',
    viewAuthorProfile: 'View Author Profile',

    clustersPill: 'Conceptual Architecture & Topic Clusters',
    clustersTitle: '5 Core Topic Clusters & Pillar Network',
    clustersSubtitle: 'Interconnected ontological subject clusters anchored by fundamental dialectical pillar treatises.',
    clustersMapLink: 'Interlinking Map',
    pillarThesis: 'Pillar Thesis',
    openPillarArticle: 'Open Pillar Treatise',
    filterCluster: 'Filter Cluster',

    catalogTitle: 'Article Catalog',
    paginatedView: 'Paginated View',
    viewAll: 'Show All',
    examinationLang: 'Review:',
    allCategory: 'All',
    noArticlesFound: 'No articles match your criteria',
    noArticlesDesc: 'You can adjust your search terms or reset category filters.',
    resetFilters: 'Reset Filters',
    showingRange: 'showing items',
    firstPage: 'First Page',
    prevPage: 'Previous Page',
    nextPage: 'Next Page',
    lastPage: 'Last Page',

    readingTime: 'min read',
    originalTurkish: 'Original Treaty',
    dialecticalTriadTitle: 'Dialectical Triad (Thesis • Antithesis • Spurious Evidence)',
    inspectTriad: 'Inspect ↗',
    claimLabel: 'Claim:',
    counterClaimLabel: 'Counterclaim:',
    notProofLabel: 'What is Not Proof:',
    notProofText: 'Spurious arguments and methodological fallacies eliminated',
    readArticle: 'Read Treatise',
    previewInLang: 'Review in',

    close: 'Close',
    backToArticles: 'Back to archive',
    openArticleDirectly: 'Open Treatise Directly',
    footerTagline: 'Author: Emre Pelit | Scientific Corpus & Multilingual Neural Engine',
    footerRights: 'All rights reserved.',
    restApiDocs: 'REST API & Mobile Docs',
    sitemapLink: 'Sitemap.xml'
  },

  de: {
    navHome: 'Startseite',
    navCatalog: 'Katalog',
    navClusters: 'Themencluster',
    navAuthor: 'Autor',
    navBlog: 'Blog',
    share: 'Teilen',
    socraticPartner: 'Sokratischer Partner',
    mathFormulations: 'Mathematische Formulierungen',
    brandTitle: 'SCIENCE & PHILOSOPHY',
    brandSubtitle: 'Emre Pelit • Wissenschaftliches & Philosophisches Portal',
    searchPlaceholder: 'Artikel, Themen oder Begriffe suchen...',
    searchClear: 'Löschen',
    liveAnalytics: 'Live-Analytik',
    readingLangLabel: 'Prüfsprache',
    interactiveLab: 'Interaktives Labor',
    previewConsole: 'Vorschau-Konsole',
    syncBlogger: 'Blogger synchronisieren',
    syncing: 'Synchronisiere...',

    heroPill: 'Wissenschaft, Philosophie des Geistes & Bewusstsein • sci-phil.ai.studio',
    heroTitle: 'Lehrstuhl für Wissenschaft und Philosophie des Geistes',
    heroDescription: 'Wissenschaftliches und philosophisches Werk von Emre Pelit. Von großen Sprachmodellen (LLM) über neuronale Zeitwahrnehmung bis hin zur Quantenkosmologie und Blockuniversum-Hypothese.',
    heroUniversalNoteTitle: '🌐 Mehrsprachige Prüfungsunterstützung',
    heroUniversalNoteDesc: 'Das Archiv enthält die Originalabhandlungen des Autors. Jeder Artikel kann in weltweiten Sprachen mit akademischer Übersetzung und KI-Einwandlösung geprüft werden.',
    heroArticlesCount: 'Originalabhandlungen',
    heroZeroVuln: 'Sichere Architektur ohne Schwachstellen',
    heroOpenLab: 'Interaktives Labor öffnen',
    authorTitle: 'Emre Pelit',
    authorRole: 'Forscher für Philosophie des Geistes',
    authorBio: 'Kritische Veröffentlichungen zu LLMs, Ontologie der KI, Zeitsimulation und Bewusstseinsphilosophie.',
    viewAuthorProfile: 'Autorenprofil ansehen',

    clustersPill: 'Konzeptionelle Architektur & Themencluster',
    clustersTitle: '5 Kern-Themencluster & Säulennetzwerk',
    clustersSubtitle: 'Vernetzte ontologische Themenbereiche mit grundlegenden dialektischen Säulenabhandlungen.',
    clustersMapLink: 'Verlinkungskarte',
    pillarThesis: 'Säulenthese',
    openPillarArticle: 'Säulenartikel öffnen',
    filterCluster: 'Filtern',

    catalogTitle: 'Artikelkatalog',
    paginatedView: 'Seitenansicht',
    viewAll: 'Alle anzeigen',
    examinationLang: 'Sprache:',
    allCategory: 'Alle',
    noArticlesFound: 'Keine passenden Artikel gefunden',
    noArticlesDesc: 'Bitte ändern Sie den Suchbegriff oder setzen Sie den Filter zurück.',
    resetFilters: 'Filter zurücksetzen',
    showingRange: 'angezeigt',
    firstPage: 'Erste Seite',
    prevPage: 'Vorherige Seite',
    nextPage: 'Nächste Seite',
    lastPage: 'Letzte Seite',

    readingTime: 'Min. Lesezeit',
    originalTurkish: 'Originalwerk',
    dialecticalTriadTitle: 'Dialektische Triade (These • Antithese • Scheinnachweise)',
    inspectTriad: 'Prüfen ↗',
    claimLabel: 'These:',
    counterClaimLabel: 'Gegenthese:',
    notProofLabel: 'Was kein Beweis ist:',
    notProofText: 'Scheinargumente und methodische Trugschlüsse bereinigt',
    readArticle: 'Artikel lesen',
    previewInLang: 'Prüfen auf',

    close: 'Schließen',
    backToArticles: 'Zurück zum Archiv',
    openArticleDirectly: 'Artikel direkt öffnen',
    footerTagline: 'Autor: Emre Pelit | Wissenschaftliches Werk & Mehrsprachige Engine',
    footerRights: 'Alle Rechte vorbehalten.',
    restApiDocs: 'REST-API & Dokumentation',
    sitemapLink: 'Sitemap.xml'
  },

  fr: {
    navHome: 'Accueil',
    navCatalog: 'Catalogue',
    navClusters: 'Grappes de sujets',
    navAuthor: 'Auteur',
    navBlog: 'Blog',
    share: 'Partager',
    socraticPartner: 'Partenaire socratique',
    mathFormulations: 'Formulations mathématiques',
    brandTitle: 'SCIENCE & PHILOSOPHY',
    brandSubtitle: 'Emre Pelit • Portail de Pensée Scientifique et Philosophique',
    searchPlaceholder: 'Rechercher des articles, concepts...',
    searchClear: 'Effacer',
    liveAnalytics: 'Analytique en direct',
    readingLangLabel: 'Langue d’examen',
    interactiveLab: 'Laboratoire interactif',
    previewConsole: 'Console d’aperçu',
    syncBlogger: 'Synchroniser Blogger',
    syncing: 'Synchronisation...',

    heroPill: 'Science, Philosophie de l’Esprit & Conscience • sci-phil.ai.studio',
    heroTitle: 'Chaire de Science et Philosophie de l’Esprit',
    heroDescription: 'Corpus philosophique et scientifique rédigé par Emre Pelit. Des modèles de langage (LLM) à la perception neuronale du temps et à la cosmologie quantique.',
    heroUniversalNoteTitle: '🌐 Support d’Examen Multilingue Universel',
    heroUniversalNoteDesc: 'Consultez chaque article dans les langues mondiales avec traduction académique et résolution d’objections par IA.',
    heroArticlesCount: 'Traités Originaux',
    heroZeroVuln: 'Architecture sécurisée zéro faille',
    heroOpenLab: 'Ouvrir le laboratoire',
    authorTitle: 'Emre Pelit',
    authorRole: 'Chercheur en Philosophie de l’Esprit',
    authorBio: 'Publications critiques sur les LLM, l’ontologie de l’IA et la mécanique de la simulation du temps.',
    viewAuthorProfile: 'Profil de l’auteur',

    clustersPill: 'Architecture Conceptuelle & Topic Clusters',
    clustersTitle: '5 Groupes Thématiques & Piliers',
    clustersSubtitle: 'Réseau de thèmes ontologiques interconnectés et articles piliers fondamentaux.',
    clustersMapLink: 'Carte des liens',
    pillarThesis: 'Thèse pilier',
    openPillarArticle: 'Ouvrir l’article pilier',
    filterCluster: 'Filtrer',

    catalogTitle: 'Catalogue d’Articles',
    paginatedView: 'Vue paginée',
    viewAll: 'Afficher tout',
    examinationLang: 'Examen :',
    allCategory: 'Tous',
    noArticlesFound: 'Aucun article trouvé',
    noArticlesDesc: 'Modifiez votre recherche ou réinitialisez les filtres.',
    resetFilters: 'Réinitialiser',
    showingRange: 'éléments affichés',
    firstPage: 'Première page',
    prevPage: 'Page précédente',
    nextPage: 'Page suivante',
    lastPage: 'Dernière page',

    readingTime: 'min de lecture',
    originalTurkish: 'Traité original',
    dialecticalTriadTitle: 'Triade Dialectique (Thèse • Antithèse • Fausses Preuves)',
    inspectTriad: 'Examiner ↗',
    claimLabel: 'Thèse :',
    counterClaimLabel: 'Antithèse :',
    notProofLabel: 'Ce qui ne prouve rien :',
    notProofText: 'Sophismes méthodologiques et faux arguments écartés',
    readArticle: 'Lire l’article',
    previewInLang: 'Consulter en',

    close: 'Fermer',
    backToArticles: 'Retour aux archives',
    openArticleDirectly: 'Ouvrir directement',
    footerTagline: 'Auteur : Emre Pelit | Corpus Scientifique & Moteur Multilingue',
    footerRights: 'Tous droits réservés.',
    restApiDocs: 'API REST & Documentation',
    sitemapLink: 'Sitemap.xml'
  },

  es: {
    navHome: 'Inicio',
    navCatalog: 'Catálogo',
    navClusters: 'Grupos de temas',
    navAuthor: 'Autor',
    navBlog: 'Blog',
    share: 'Compartir',
    socraticPartner: 'Compañero socrático',
    mathFormulations: 'Formulaciones matemáticas',
    brandTitle: 'SCIENCE & PHILOSOPHY',
    brandSubtitle: 'Emre Pelit • Portal de Pensamiento Científico y Filosófico',
    searchPlaceholder: 'Buscar artículos, temas o conceptos...',
    searchClear: 'Limpiar',
    liveAnalytics: 'Analítica en vivo',
    readingLangLabel: 'Idioma de examen',
    interactiveLab: 'Laboratorio interactivo',
    previewConsole: 'Consola de vista previa',
    syncBlogger: 'Sincronizar Blogger',
    syncing: 'Sincronizando...',

    heroPill: 'Ciencia, Filosofía de la Mente & Conciencia • sci-phil.ai.studio',
    heroTitle: 'Cátedra de Ciencia y Filosofía de la Mente',
    heroDescription: 'Obra científica y filosófica rigurosa de Emre Pelit. Desde los grandes modelos de lenguaje (LLM) hasta la percepción neuronal del tiempo y el universo en bloque.',
    heroUniversalNoteTitle: '🌐 Soporte de Examen Multilingüe Universal',
    heroUniversalNoteDesc: 'Examine cualquier tratado en idiomas globales con traducción académica y resolución dialéctica por IA.',
    heroArticlesCount: 'Tratados Originales',
    heroZeroVuln: 'Arquitectura Segura Sin Vulnerabilidades',
    heroOpenLab: 'Abrir laboratorio interactivo',
    authorTitle: 'Emre Pelit',
    authorRole: 'Investigador en Filosofía de la Mente',
    authorBio: 'Publicaciones críticas sobre modelos de lenguaje, ontología de la IA y mecánica del tiempo.',
    viewAuthorProfile: 'Ver perfil del autor',

    clustersPill: 'Arquitectura Conceptual & Topic Clusters',
    clustersTitle: '5 Grupos Temáticos & Red de Pilares',
    clustersSubtitle: 'Grupos ontológicos interconectados apoyados por tratados pilares dialécticos.',
    clustersMapLink: 'Mapa de enlaces',
    pillarThesis: 'Tesis pilar',
    openPillarArticle: 'Abrir artículo pilar',
    filterCluster: 'Filtrar',

    catalogTitle: 'Catálogo de Artículos',
    paginatedView: 'Vista paginada',
    viewAll: 'Mostrar todos',
    examinationLang: 'Examen:',
    allCategory: 'Todos',
    noArticlesFound: 'No se encontraron artículos',
    noArticlesDesc: 'Modifique los términos de búsqueda o restablezca los filtros.',
    resetFilters: 'Restablecer filtros',
    showingRange: 'elementos mostrados',
    firstPage: 'Primera página',
    prevPage: 'Página anterior',
    nextPage: 'Página siguiente',
    lastPage: 'Última página',

    readingTime: 'min de lectura',
    originalTurkish: 'Tratado original',
    dialecticalTriadTitle: 'Tríada Dialéctica (Tesis • Antítesis • Falsas Pruebas)',
    inspectTriad: 'Examinar ↗',
    claimLabel: 'Tesis:',
    counterClaimLabel: 'Antítesis:',
    notProofLabel: 'Qué no es prueba:',
    notProofText: 'Falacias metodológicas y argumentos engañosos eliminados',
    readArticle: 'Leer tratado',
    previewInLang: 'Examinar en',

    close: 'Cerrar',
    backToArticles: 'Volver al archivo',
    openArticleDirectly: 'Abrir tratado directamente',
    footerTagline: 'Autor: Emre Pelit | Corpus Científico & Motor Multilingüe',
    footerRights: 'Todos los derechos reservados.',
    restApiDocs: 'API REST & Documentación',
    sitemapLink: 'Sitemap.xml'
  },

  it: {
    navHome: 'Home',
    navCatalog: 'Catalogo',
    navClusters: 'Cluster di argomenti',
    navAuthor: 'Autore',
    navBlog: 'Blog',
    share: 'Condividi',
    socraticPartner: 'Partner socratico',
    mathFormulations: 'Formulazioni matematiche',
    brandTitle: 'SCIENCE & PHILOSOPHY',
    brandSubtitle: 'Emre Pelit • Portale di Pensiero Scientifico e Filosofico',
    searchPlaceholder: 'Cerca articoli, argomenti o concetti...',
    searchClear: 'Cancella',
    liveAnalytics: 'Analytics dal vivo',
    readingLangLabel: 'Lingua di esame',
    interactiveLab: 'Laboratorio interattivo',
    previewConsole: 'Console di anteprima',
    syncBlogger: 'Sincronizza Blogger',
    syncing: 'Sincronizzazione...',

    heroPill: 'Scienza, Filosofia della Mente & Coscienza • sci-phil.ai.studio',
    heroTitle: 'Cattedra di Scienza e Filosofia della Mente',
    heroDescription: 'Corpus scientifico e filosofico di Emre Pelit. Dai modelli linguistici (LLM) alla percezione temporale neuronale e cosmologia quantistica.',
    heroUniversalNoteTitle: '🌐 Supporto di Esame Multilingue Universale',
    heroUniversalNoteDesc: 'Esamina qualsiasi articolo nelle lingue del mondo con traduzione accademica istantanea.',
    heroArticlesCount: 'Trattati originali',
    heroZeroVuln: 'Architettura sicura e robusta',
    heroOpenLab: 'Apri il laboratorio',
    authorTitle: 'Emre Pelit',
    authorRole: 'Ricercatore in Filosofia della Mente',
    authorBio: 'Pubblicazioni critiche su intelligenza artificiale, tempo e coscienza.',
    viewAuthorProfile: 'Profilo autore',

    clustersPill: 'Architettura Concettuale & Topic Clusters',
    clustersTitle: '5 Cluster Tematici & Rete di Pilastri',
    clustersSubtitle: 'Cluster ontologici interconnessi con articoli pilastro dialettici.',
    clustersMapLink: 'Mappa dei link',
    pillarThesis: 'Tesi pilastro',
    openPillarArticle: 'Apri articolo pilastro',
    filterCluster: 'Filtra',

    catalogTitle: 'Indice degli Articoli',
    paginatedView: 'Vista impaginata',
    viewAll: 'Mostra tutto',
    examinationLang: 'Esame:',
    allCategory: 'Tutti',
    noArticlesFound: 'Nessun articolo trovato',
    noArticlesDesc: 'Modifica la ricerca o ripristina i filtri.',
    resetFilters: 'Ripristina filtri',
    showingRange: 'elementi visualizzati',
    firstPage: 'Prima pagina',
    prevPage: 'Pagina precedente',
    nextPage: 'Pagina successiva',
    lastPage: 'Ultima pagina',

    readingTime: 'min di lettura',
    originalTurkish: 'Trattato originale',
    dialecticalTriadTitle: 'Triade Dialettica (Tesi • Antitesi • False Prove)',
    inspectTriad: 'Esamina ↗',
    claimLabel: 'Tesi:',
    counterClaimLabel: 'Antitesi:',
    notProofLabel: 'Cosa non è prova:',
    notProofText: 'Argomenti fallaci eliminati metodologicamente',
    readArticle: 'Leggi articolo',
    previewInLang: 'Esamina in',

    close: 'Chiudi',
    backToArticles: 'Torna all’archivio',
    openArticleDirectly: 'Apri direttamente',
    footerTagline: 'Autore: Emre Pelit | Corpus Filosofico & Motore Neurale',
    footerRights: 'Tutti i diritti riservati.',
    restApiDocs: 'API REST & Documentazione',
    sitemapLink: 'Sitemap.xml'
  },

  ru: {
    navHome: 'Главная',
    navCatalog: 'Каталог',
    navClusters: 'Тематические кластеры',
    navAuthor: 'Автор',
    navBlog: 'Блог',
    share: 'Поделиться',
    socraticPartner: 'Сократический партнёр',
    mathFormulations: 'Математические формулировки',
    brandTitle: 'SCIENCE & PHILOSOPHY',
    brandSubtitle: 'Эмре Пелит • Портал научной и философской мысли',
    searchPlaceholder: 'Поиск статей, тем или концепций...',
    searchClear: 'Очистить',
    liveAnalytics: 'Живая аналитика',
    readingLangLabel: 'Язык изучения',
    interactiveLab: 'Интерактивная лаборатория',
    previewConsole: 'Консоль предпросмотра',
    syncBlogger: 'Синхронизация с Blogger',
    syncing: 'Синхронизация...',

    heroPill: 'Наука, философия разума и сознание • sci-phil.ai.studio',
    heroTitle: 'Кафедра науки и философии разума',
    heroDescription: 'Философские и научные труды Эмре Пелита. От больших языковых моделей (LLM) до нейронного восприятия времени и квантовой космологии.',
    heroUniversalNoteTitle: '🌐 Универсальная многоязычная поддержка',
    heroUniversalNoteDesc: 'Исследуйте оригинальные трактаты с академическим переводом на любой язык мира.',
    heroArticlesCount: 'Оригинальных трактатов',
    heroZeroVuln: 'Безопасная архитектура',
    heroOpenLab: 'Открыть лабораторию',
    authorTitle: 'Эмре Пелит',
    authorRole: 'Исследователь философии разума и науки',
    authorBio: 'Критические публикации об ИИ, симуляции времени и онтологии сознания.',
    viewAuthorProfile: 'Профиль автора',

    clustersPill: 'Концептуальная архитектура & Кластеры тем',
    clustersTitle: '5 ключевых тематических кластеров',
    clustersSubtitle: 'Взаимосвязанные онтологические направления и опорные статьи.',
    clustersMapLink: 'Карта ссылок',
    pillarThesis: 'Опорный тезис',
    openPillarArticle: 'Открыть опорную статью',
    filterCluster: 'Фильтр',

    catalogTitle: 'Каталог статей',
    paginatedView: 'Постраничный вид',
    viewAll: 'Показать все',
    examinationLang: 'Язык:',
    allCategory: 'Все',
    noArticlesFound: 'Статьи не найдены',
    noArticlesDesc: 'Измените запрос или сбросьте фильтры.',
    resetFilters: 'Сбросить фильтры',
    showingRange: 'показано',
    firstPage: 'Первая страница',
    prevPage: 'Предыдущая',
    nextPage: 'Следующая',
    lastPage: 'Последняя страница',

    readingTime: 'мин чтения',
    originalTurkish: 'Оригинал',
    dialecticalTriadTitle: 'Диалектическая триада (Тезис • Антитезис • Ложные доказательства)',
    inspectTriad: 'Изучить ↗',
    claimLabel: 'Тезис:',
    counterClaimLabel: 'Антитезис:',
    notProofLabel: 'Что не является доказательством:',
    notProofText: 'Ложные аргументы и софизмы исключены',
    readArticle: 'Читать статью',
    previewInLang: 'Читать на',

    close: 'Закрыть',
    backToArticles: 'Назад в архив',
    openArticleDirectly: 'Открыть напрямую',
    footerTagline: 'Автор: Эмре Пелит | Научный архив и языковой движок',
    footerRights: 'Все права защищены.',
    restApiDocs: 'REST API и документация',
    sitemapLink: 'Sitemap.xml'
  },

  ar: {
    navHome: 'الرئيسية',
    navCatalog: 'الكتالوج',
    navClusters: 'مجموعات المواضيع',
    navAuthor: 'المؤلف',
    navBlog: 'المدونة',
    share: 'مشاركة',
    socraticPartner: 'الشريك السقراطي',
    mathFormulations: 'الصياغات الرياضية',
    brandTitle: 'SCIENCE & PHILOSOPHY',
    brandSubtitle: 'إمري بيليت • بوابة الفكر العلمي والفلسفي',
    searchPlaceholder: 'ابحث عن المقالات أو المفاهيم الفلسفية...',
    searchClear: 'مسح',
    liveAnalytics: 'التحليلات الحية',
    readingLangLabel: 'لغة الفحص',
    interactiveLab: 'المختبر التفاعلي',
    previewConsole: 'لوحة المعاينة',
    syncBlogger: 'مزامنة بلوجر',
    syncing: 'جارِ المزامنة...',

    heroPill: 'العلوم، فلسفة العقل والوعي • sci-phil.ai.studio',
    heroTitle: 'كرسي العلوم وفلسفة العقل',
    heroDescription: 'أبحاث علمية وفلسفية رصينة بقلم إمري بيليت. من النماذج اللغوية الكبيرة (LLM) إلى إدراك الزمن العصبي ونظرية الكون الكتلي.',
    heroUniversalNoteTitle: '🌐 دعم الفحص متعدد اللغات',
    heroUniversalNoteDesc: 'افحص أي أطروحة بأي لغة عالمية مع ترجمة أكاديمية وحل الاعتراضات بالذكاء الاصطناعي.',
    heroArticlesCount: 'أطروحة أصلية',
    heroZeroVuln: 'بنية آمنة بدون ثغرات',
    heroOpenLab: 'فتح المختبر التفاعلي',
    authorTitle: 'إمري بيليت',
    authorRole: 'باحث في فلسفة العقل والعلوم',
    authorBio: 'منشورات نقدية حول الوعي، محاكاة الزمن والذكاء الاصطناعي.',
    viewAuthorProfile: 'عرض ملف الكاتب',

    clustersPill: 'الهندسة الفكرية ومجموعات المواضيع',
    clustersTitle: '5 مجموعات مواضيع أساسية وشبكة المقالات المحورية',
    clustersSubtitle: 'مجموعات أنطولوجية مترابطة مدعومة بمقالات فلسفية رصينة.',
    clustersMapLink: 'خريطة الروابط',
    pillarThesis: 'الأطروحة المحورية',
    openPillarArticle: 'فتح المقالة المحورية',
    filterCluster: 'تصفية',

    catalogTitle: 'فهرس المقالات',
    paginatedView: 'عرض بالصفحات',
    viewAll: 'عرض الكل',
    examinationLang: 'اللغة:',
    allCategory: 'الكل',
    noArticlesFound: 'لم يتم العثور على مقالات',
    noArticlesDesc: 'يرجى تغيير كلمات البحث أو إعادة ضبط التصنيفات.',
    resetFilters: 'إعادة الضبط',
    showingRange: 'المعروض',
    firstPage: 'الصفحة الأولى',
    prevPage: 'السابق',
    nextPage: 'التالي',
    lastPage: 'الصفحة الأخيرة',

    readingTime: 'دقيقة قراءة',
    originalTurkish: 'أطروحة أصلية',
    dialecticalTriadTitle: 'الثلاثية الجدلية (الأطروحة • نقيضها • ما ليس دليلاً)',
    inspectTriad: 'فحص ↗',
    claimLabel: 'الادعاء:',
    counterClaimLabel: 'الادعاء المضاد:',
    notProofLabel: 'ما لا يعد دليلاً:',
    notProofText: 'تم استبعاد الحجج الواهية والمغالطات المنهجية',
    readArticle: 'قراءة المقال',
    previewInLang: 'فحص باللغة',

    close: 'إغلاق',
    backToArticles: 'العودة للأرشيف',
    openArticleDirectly: 'فتح المقال مباشرة',
    footerTagline: 'الكاتب: إمري بيليت | أرشيف الفكر العلمي ومحرك الترجمة',
    footerRights: 'جميع الحقوق محفوظة.',
    restApiDocs: 'واجهة REST API والتوثيق',
    sitemapLink: 'Sitemap.xml'
  },

  ja: {
    navHome: 'ホーム',
    navCatalog: 'カタログ',
    navClusters: 'トピッククラスター',
    navAuthor: '著者',
    navBlog: 'ブログ',
    share: '共有',
    socraticPartner: 'ソクラテス的パートナー',
    mathFormulations: '数学的定式化',
    brandTitle: 'SCIENCE & PHILOSOPHY',
    brandSubtitle: 'エムレ・ペリット • 科学と心の哲学研究ポータル',
    searchPlaceholder: '論文、テーマ、哲学的概念を検索...',
    searchClear: 'クリア',
    liveAnalytics: 'ライブ解析',
    readingLangLabel: '閲覧言語',
    interactiveLab: '対話型ラボ',
    previewConsole: 'プレビューコンソール',
    syncBlogger: 'Blogger同期',
    syncing: '同期中...',

    heroPill: '科学・心の哲学・意識研究 • sci-phil.ai.studio',
    heroTitle: '科学と心の哲学講座',
    heroDescription: 'エムレ・ペリットによる独自の哲学的・科学的著作群。大規模言語モデル（LLM）から神経時間知覚、量子宇宙論、ブロック宇宙仮説まで。',
    heroUniversalNoteTitle: '🌐 多言語閲覧対応',
    heroUniversalNoteDesc: '世界の主要言語で学術翻訳およびAI反論検証を行い、あらゆる論文を閲覧できます。',
    heroArticlesCount: '篇のオリジナル論文',
    heroZeroVuln: 'ゼロ脆弱性安全アーキテクチャ',
    heroOpenLab: 'インタラクティブラボを開く',
    authorTitle: 'エムレ・ペリット',
    authorRole: '心の哲学・科学研究者',
    authorBio: 'LLM、AIオントロジー、時間のシミュレーション機構に関する批判的著作。',
    viewAuthorProfile: '著者プロフィール',

    clustersPill: '概念構造 & トピッククラスター',
    clustersTitle: '5つの主要トピッククラスターと柱となる論文網',
    clustersSubtitle: '相互に関連するオントロジー的テーマ群と中核論文。',
    clustersMapLink: '内部リンクマップ',
    pillarThesis: '中核テーゼ',
    openPillarArticle: '柱となる論文を開く',
    filterCluster: '絞り込み',

    catalogTitle: '論文インデックス',
    paginatedView: 'ページ表示',
    viewAll: 'すべて表示',
    examinationLang: '言語:',
    allCategory: 'すべて',
    noArticlesFound: '該当する論文は見つかりませんでした',
    noArticlesDesc: '検索語句を変更するか、フィルターをリセットしてください。',
    resetFilters: 'フィルターリセット',
    showingRange: '件を表示中',
    firstPage: '最初のページ',
    prevPage: '前へ',
    nextPage: '次へ',
    lastPage: '最後のページ',

    readingTime: '分で読了',
    originalTurkish: 'オリジナル原著',
    dialecticalTriadTitle: '弁証法的トリアード（テーゼ・アンチテーゼ・偽証の排除）',
    inspectTriad: '詳しく ↗',
    claimLabel: '主張:',
    counterClaimLabel: '反論:',
    notProofLabel: '証拠とならないもの:',
    notProofText: '擬似論拠と方法論的誤謬を排除済み',
    readArticle: '論文を読む',
    previewInLang: 'で閲覧',

    close: '閉じる',
    backToArticles: 'アーカイブへ戻る',
    openArticleDirectly: '論文を直接開く',
    footerTagline: '著者: エムレ・ペリット | 科学・哲学著作 & 多言語エンジン',
    footerRights: '無断転載を禁じます。',
    restApiDocs: 'REST API & ドキュメント',
    sitemapLink: 'Sitemap.xml'
  },

  zh: {
    navHome: '首页',
    navCatalog: '目录',
    navClusters: '主题集群',
    navAuthor: '作者',
    navBlog: '博客',
    share: '分享',
    socraticPartner: '苏格拉底式伙伴',
    mathFormulations: '数学公式',
    brandTitle: 'SCIENCE & PHILOSOPHY',
    brandSubtitle: '埃姆雷·佩利特 • 科学与心灵哲学研究门户',
    searchPlaceholder: '搜索文章、主题或哲学概念...',
    searchClear: '清除',
    liveAnalytics: '实时分析',
    readingLangLabel: '研读语言',
    interactiveLab: '互动实验室',
    previewConsole: '预览控制台',
    syncBlogger: '同步博客',
    syncing: '正在同步...',

    heroPill: '科学、心灵哲学与意识研究 • sci-phil.ai.studio',
    heroTitle: '科学与心灵哲学讲席',
    heroDescription: '埃姆雷·佩利特所著的哲学与科学著作集。涵盖大语言模型（LLM）、神经时间感知、量子宇宙学与块状宇宙假说。',
    heroUniversalNoteTitle: '🌐 通用多语言研读支持',
    heroUniversalNoteDesc: '一键使用学术级翻译在世界各种主要语言中研读任何论文。',
    heroArticlesCount: '篇原创论文',
    heroZeroVuln: '零漏洞安全架构',
    heroOpenLab: '启动互动实验室',
    authorTitle: '埃姆雷·佩利特',
    authorRole: '心灵哲学与科学研究学者',
    authorBio: '关于大语言模型、人工智能本体论及时间模拟机制的批判性著作。',
    viewAuthorProfile: '查看学者主页',

    clustersPill: '概念架构与主题聚类',
    clustersTitle: '5大核心主题聚类与支柱论文网络',
    clustersSubtitle: '由基本辩证支柱论文支撑的互联本体论主题集群。',
    clustersMapLink: '内链拓扑图',
    pillarThesis: '支柱论点',
    openPillarArticle: '研读支柱文章',
    filterCluster: '筛选',

    catalogTitle: '文章目录',
    paginatedView: '分页浏览',
    viewAll: '显示全部',
    examinationLang: '研读语言:',
    allCategory: '全部',
    noArticlesFound: '未找到符合条件的文章',
    noArticlesDesc: '您可以修改搜索词或重置分类筛选器。',
    resetFilters: '重置筛选',
    showingRange: '显示条目',
    firstPage: '第一页',
    prevPage: '上一页',
    nextPage: '下一页',
    lastPage: '末页',

    readingTime: '分钟阅读',
    originalTurkish: '原创原典',
    dialecticalTriadTitle: '辩证三元组（正题 • 反题 • 伪证排除）',
    inspectTriad: '研读 ↗',
    claimLabel: '主张:',
    counterClaimLabel: '反对主张:',
    notProofLabel: '非证据范畴:',
    notProofText: '已剔除虚假证据与方法论谬误',
    readArticle: '阅读论文',
    previewInLang: '以研读',

    close: '关闭',
    backToArticles: '返回文章档案',
    openArticleDirectly: '直接打开论文',
    footerTagline: '作者：埃姆雷·佩利特 | 科学与哲学论著 & 多语言引擎',
    footerRights: '版权所有。',
    restApiDocs: 'REST API 与开发文档',
    sitemapLink: 'Sitemap.xml'
  }
};

export function getTranslations(langCode: string): UiTranslations {
  const code = (langCode || 'tr').toLowerCase() as SupportedLanguage;
  return UI_TRANSLATIONS[code] || UI_TRANSLATIONS.en || UI_TRANSLATIONS.tr;
}

export const CATEGORY_TRANSLATIONS: Record<string, Partial<Record<SupportedLanguage, string>>> = {
  'Tümü': {
    tr: 'Tümü', en: 'All', de: 'Alle', fr: 'Tous', es: 'Todos', it: 'Tutti', ru: 'Все', ar: 'الكل', ja: 'すべて', zh: '全部'
  },
  'Yapay Zeka': {
    tr: 'Yapay Zeka', en: 'Artificial Intelligence', de: 'Künstliche Intelligenz', fr: 'Intelligence Artificielle', es: 'Inteligencia Artificial', it: 'Intelligenza Artificiale', ru: 'Искусственный интеллект', ar: 'الذكاء الاصطناعي', ja: '人工知能', zh: '人工智能'
  },
  'Kuantum': {
    tr: 'Kuantum', en: 'Quantum Physics', de: 'Quantenphysik', fr: 'Physique quantique', es: 'Física cuántica', it: 'Fisica quantistica', ru: 'Квантовая физика', ar: 'فيزياء الكم', ja: '量子物理学', zh: '量子物理'
  },
  'Zaman': {
    tr: 'Zaman', en: 'Time & Temporality', de: 'Zeit', fr: 'Temps', es: 'Tiempo', it: 'Tempo', ru: 'Время', ar: 'الزمان', ja: '時間', zh: '时间'
  },
  'Simülasyon': {
    tr: 'Simülasyon', en: 'Simulation', de: 'Simulation', fr: 'Simulation', es: 'Simulación', it: 'Simulazione', ru: 'Симуляция', ar: 'المحاكاة', ja: 'シミュレーション', zh: '模拟'
  },
  'Bilim & Felsefe': {
    tr: 'Bilim & Felsefe', en: 'Science & Philosophy', de: 'Wissenschaft & Philosophie', fr: 'Science & Philosophie', es: 'Ciencia y Filosofía', it: 'Scienza e Filosofia', ru: 'Наука и философия', ar: 'العلوم والفلسفة', ja: '科学と哲学', zh: '科学与哲学'
  },
  'Kelâm': {
    tr: 'Kelâm', en: 'Kalam & Theology', de: 'Kalam & Theologie', fr: 'Kalam & Théologie', es: 'Kalam y Teología', it: 'Kalam e Teologia', ru: 'Калам и богословие', ar: 'علم الكلام', ja: 'カラームと神学', zh: '凯俩目与神学'
  },
  'Kelam': {
    tr: 'Kelam', en: 'Kalam & Theology', de: 'Kalam & Theologie', fr: 'Kalam & Théologie', es: 'Kalam y Teología', it: 'Kalam e Teologia', ru: 'Калам и богословие', ar: 'علم الكلام', ja: 'カラームと神学', zh: '凯俩目与神学'
  },
  'Kozmoloji': {
    tr: 'Kozmoloji', en: 'Cosmology', de: 'Kosmologie', fr: 'Cosmologie', es: 'Cosmología', it: 'Cosmologia', ru: 'Космология', ar: 'علم الكون', ja: '宇宙論', zh: '宇宙学'
  },
  'Din ve Bilim': {
    tr: 'Din ve Bilim', en: 'Religion & Science', de: 'Religion & Wissenschaft', fr: 'Religion & Science', es: 'Religión y Ciencia', it: 'Religione e Scienza', ru: 'Религия и наука', ar: 'الدين والعلم', ja: '宗教と科学', zh: '宗教与科学'
  },
  'Genel': {
    tr: 'Genel', en: 'General', de: 'Allgemein', fr: 'Général', es: 'General', it: 'Generale', ru: 'Общее', ar: 'عام', ja: '一般', zh: '综合'
  },
  'Zihin Felsefesi': {
    tr: 'Zihin Felsefesi', en: 'Philosophy of Mind', de: 'Philosophie des Geistes', fr: "Philosophie de l'esprit", es: 'Filosofía de la mente', it: 'Filosofia della mente', ru: 'Философия сознания', ar: 'فلسفة العقل', ja: '心の哲学', zh: '心灵哲学'
  },
  'Bilinç': {
    tr: 'Bilinç', en: 'Consciousness & Qualia', de: 'Bewusstsein & Qualia', fr: 'Conscience & Qualia', es: 'Conciencia y Qualia', it: 'Coscienza e Qualia', ru: 'Сознание и квалиа', ar: 'الوعي والكواليا', ja: '意識とクオリア', zh: '意识与感受质'
  },
  'Epistemoloji': {
    tr: 'Epistemoloji', en: 'Epistemology', de: 'Erkenntnistheorie', fr: 'Épistémologie', es: 'Epistemología', it: 'Epistemologia', ru: 'Эпистемология', ar: 'نظرية المعرفة', ja: '認識論', zh: '认识论'
  },
  'Bilişsel Bilim': {
    tr: 'Bilişsel Bilim', en: 'Cognitive Science', de: 'Kognitionswissenschaft', fr: 'Sciences cognitives', es: 'Ciencia cognitiva', it: 'Scienze cognitive', ru: 'Когнитивная наука', ar: 'العلوم المعرفية', ja: '認知科学', zh: '认知科学'
  },
  'Teorik Fizik': {
    tr: 'Teorik Fizik', en: 'Theoretical Physics', de: 'Theoretische Physik', fr: 'Physique théorique', es: 'Física teórica', it: 'Fisica teorica', ru: 'Теоретическая физика', ar: 'الفيزياء النظرية', ja: '理論物理学', zh: '理论物理'
  },
  'Ontoloji': {
    tr: 'Ontoloji', en: 'Ontology', de: 'Ontologie', fr: 'Ontologie', es: 'Ontología', it: 'Ontologia', ru: 'Онтология', ar: 'علم الوجود', ja: '存在論', zh: '本体论'
  }
};

export function translateCategory(category: string, langCode: string): string {
  if (!category) return '';
  const lang = (langCode || 'tr').toLowerCase() as SupportedLanguage;
  if (lang === 'tr') return category;
  const match = CATEGORY_TRANSLATIONS[category];
  if (match && match[lang]) return match[lang]!;
  return category;
}
