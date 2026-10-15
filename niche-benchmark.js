/**
 * Real-time Synchronized Niche Benchmark Engine for sci-phil.ai.studio
 * Compares live catalog & Umami regional telemetry against peer platforms in
 * Türkiye, Europe, Asia, Americas, and Global Science & Philosophy niches.
 */

const REGION_COUNTRY_MAP = {
  turkiye: new Set(['TR']),
  europe: new Set([
    'DE', 'FR', 'GB', 'UK', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO',
    'DK', 'FI', 'PL', 'CZ', 'HU', 'RO', 'BG', 'GR', 'PT', 'IE', 'UA'
  ]),
  asia: new Set([
    'JP', 'KR', 'CN', 'TW', 'HK', 'SG', 'IN', 'ID', 'MY', 'TH', 'VN', 'PH',
    'AZ', 'KZ', 'UZ', 'IL', 'AE', 'SA', 'PK'
  ]),
  americas: new Set([
    'US', 'CA', 'MX', 'BR', 'AR', 'CL', 'CO', 'PE', 'UY', 'VE', 'EC'
  ])
};

export function computeCatalogStats(articles = []) {
  const langCounts = {};
  let totalWords = 0;
  let totalReadingMinutes = 0;
  let dialecticalCount = 0;

  for (const art of articles) {
    const lang = String(art.language || 'tr').toLowerCase();
    langCounts[lang] = (langCounts[lang] || 0) + 1;
    const words = Number(art.wordCount) || 0;
    totalWords += words;
    totalReadingMinutes += Number(art.readingTimeMinutes) || Math.max(1, Math.ceil(words / 200));
    if (art.dialecticalTriad && (art.dialecticalTriad.claim || art.dialecticalTriad.counterClaim)) {
      dialecticalCount++;
    }
  }

  const totalArticles = articles.length;
  return {
    totalArticles,
    languageBreakdown: langCounts,
    supportedLanguagesCount: Object.keys(langCounts).length,
    avgWordCount: totalArticles > 0 ? Math.round(totalWords / totalArticles) : 0,
    avgReadingTimeMinutes: totalArticles > 0 ? +(totalReadingMinutes / totalArticles).toFixed(1) : 0,
    dialecticalCoverageRatio: totalArticles > 0 ? Math.round((dialecticalCount / totalArticles) * 100) : 100
  };
}

export function aggregateRegionalVisitors(countries = []) {
  const totals = {
    turkiye: 0,
    europe: 0,
    asia: 0,
    americas: 0,
    global: 0
  };

  for (const item of countries) {
    const code = String(item.country || item.x || '').toUpperCase();
    const visitors = Number(item.visitors ?? item.y ?? 0);
    if (!Number.isFinite(visitors) || visitors <= 0) continue;

    totals.global += visitors;
    if (REGION_COUNTRY_MAP.turkiye.has(code)) totals.turkiye += visitors;
    else if (REGION_COUNTRY_MAP.europe.has(code)) totals.europe += visitors;
    else if (REGION_COUNTRY_MAP.asia.has(code)) totals.asia += visitors;
    else if (REGION_COUNTRY_MAP.americas.has(code)) totals.americas += visitors;
  }

  const share = (val) => (totals.global > 0 ? +((val / totals.global) * 100).toFixed(1) : null);

  return {
    visitors: totals,
    sharesPercent: {
      turkiye: share(totals.turkiye),
      europe: share(totals.europe),
      asia: share(totals.asia),
      americas: share(totals.americas),
      global: totals.global > 0 ? 100 : null
    }
  };
}

export function buildNicheBenchmarkReport({
  articles = [],
  umamiSummary = null,
  syncStatus = null,
  socraticEnabled = true
}) {
  const catalogStats = computeCatalogStats(articles);
  const regionalTraffic = aggregateRegionalVisitors(umamiSummary?.countries || []);
  const trArticles = catalogStats.languageBreakdown.tr || 0;
  const euArticles =
    (catalogStats.languageBreakdown.en || 0) +
    (catalogStats.languageBreakdown.de || 0) +
    (catalogStats.languageBreakdown.fr || 0) +
    (catalogStats.languageBreakdown.es || 0);

  const regions = [
    {
      id: 'turkiye',
      title: 'Türkiye Niş Analizi',
      badge: 'TR Odak',
      liveVisitors: umamiSummary?.configured ? regionalTraffic.visitors.turkiye : null,
      liveTrafficSharePercent: umamiSummary?.configured ? regionalTraffic.sharesPercent.turkiye : null,
      indexedLocalArticles: trArticles,
      bloggerSyncActive: Boolean(syncStatus?.lastSuccessAt),
      sciPhilProfile: {
        name: 'sci-phil.ai.studio (Emre Pelit)',
        languages: 'Türkçe (Ana Arşiv) + 4 Küresel Dil',
        articleCount: trArticles,
        epistemicTools: 'Sokratik Diyalog Laboratuvarı + Epistemik Matris + Sektör Değerlendirmesi',
        mathRendering: 'Tam KaTeX Matematik/Fizik Semantik Desteği',
        syncMechanism: 'emrepelit7337.blogspot.com Canlı JSON/Atom Feed (15 dk periyot)'
      },
      peers: [
        {
          name: 'PhilPapers (Türkiye Trafiği)',
          domain: 'philpapers.org',
          focus: 'Akademik felsefe makale dizini ve bibliyografya',
          languages: 'İngilizce ağırlıklı',
          interactiveEpistemicMatrix: 'Yok (Statik Arşiv)',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Akademik indeks hacmi yüksek; sci-phil özgün Türkçe teorik fizik, kelâm ve Sokratik matris senteziyle ayrışır.'
        },
        {
          name: 'Türk Felsefe Kurumu',
          domain: 'tfk.org.tr',
          focus: 'Kurumsal felsefe etkinlikleri ve yayınları',
          languages: 'Türkçe / İngilizce',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Kurumsal temsil odaklı; sci-phil sürekli güncellenen dijital makale kataloğu ve PWA hızıyla öne çıkar.'
        },
        {
          name: 'Felsefe.gen.tr & Evrim Ağacı',
          domain: 'felsefe.gen.tr / evrimagaci.org',
          focus: 'Genel felsefe tarihi ve popüler bilim ansiklopedisi',
          languages: 'Türkçe',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Geniş kitle popüler bilim/felsefe odaklı; sci-phil her makalede İddia-Karşı Tez-Kanıt Sınırı üçlüsü sunar.'
        }
      ]
    },
    {
      id: 'europe',
      title: 'Avrupa Niş Analizi',
      badge: 'EU Çok Dilli',
      liveVisitors: umamiSummary?.configured ? regionalTraffic.visitors.europe : null,
      liveTrafficSharePercent: umamiSummary?.configured ? regionalTraffic.sharesPercent.europe : null,
      indexedLocalArticles: euArticles,
      sciPhilProfile: {
        name: 'sci-phil.ai.studio (Avrupa Yayını)',
        languages: 'İngilizce (EN), Almanca (DE), Fransızca (FR), İspanyolca (ES)',
        articleCount: euArticles,
        epistemicTools: '5 Dilde Yerelleştirilmiş Sektör Analizi + Sokratik Sorgulama',
        mathRendering: 'KaTeX + SSR SEO Sayfaları (/makale/<slug>)',
        syncMechanism: 'IndexNow (Seznam & Bing/Yandex EU) + Sitemap'
      },
      peers: [
        {
          name: 'Philosophy Now (Birleşik Krallık)',
          domain: 'philosophynow.org',
          focus: 'Popüler felsefe dergisi ve süreli yayın arşivi',
          languages: 'İngilizce',
          interactiveEpistemicMatrix: 'Yok (Dergi Formatı)',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Abonelik duvarlı dergi modeli; sci-phil açık erişimli, 4 Avrupa dilinde doğrudan indekslenen SSR sayfalar sunar.'
        },
        {
          name: 'Spektrum der Wissenschaft (Almanya)',
          domain: 'spektrum.de',
          focus: 'Doğa bilimleri, fizik ve bilim felsefesi haberleri',
          languages: 'Almanca',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Kısmi (Editöryal)',
          comparisonNote: 'Almanca bilim medyasının referansı; sci-phil Almanca katalog girdilerinde doğrudan metodolojik ve sektörel analiz üretir.'
        },
        {
          name: 'IAI TV - Institute of Art and Ideas',
          domain: 'iai.tv',
          focus: 'Avrupa merkezli felsefe-bilim video ve denemeleri',
          languages: 'İngilizce',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Video tartışma odaklı; sci-phil yazılı analitik derinlik ve yapay zekâ destekli Sokratik test laboratuvarı sağlar.'
        }
      ]
    },
    {
      id: 'asia',
      title: 'Asya Niş Analizi',
      badge: 'Asia & Naver IndexNow',
      liveVisitors: umamiSummary?.configured ? regionalTraffic.visitors.asia : null,
      liveTrafficSharePercent: umamiSummary?.configured ? regionalTraffic.sharesPercent.asia : null,
      indexedLocalArticles: catalogStats.totalArticles,
      sciPhilProfile: {
        name: 'sci-phil.ai.studio (Asya Erişimi)',
        languages: 'İngilizce + Türkçe (Türk Devletleri & Küresel Akademi)',
        articleCount: catalogStats.totalArticles,
        epistemicTools: 'Epistemik Süzgeç + Sesli Makale Okuma (Web Speech API)',
        mathRendering: 'KaTeX Kuantum, Karadelik Termodinamiği ve Kozmoloji Denklemleri',
        syncMechanism: 'Naver Search Advisor IndexNow + Yandex/Bing Asya Düğümleri'
      },
      peers: [
        {
          name: 'Asia Research News',
          domain: 'asiaresearchnews.com',
          focus: 'Asya araştırma kurumları bilim bültenleri',
          languages: 'İngilizce',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Kurumsal Bülten',
          comparisonNote: 'Haber bülteni yapısında; sci-phil kuramsal fizik ve bilinç felsefesinde derin tez/antitez incelemesi yapar.'
        },
        {
          name: 'Science Portal Japan (JST)',
          domain: 'scienceportal.jst.go.jp',
          focus: 'Japonya bilim ve teknoloji politikaları / araştırmaları',
          languages: 'Japonca / İngilizce',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Politika Odaklı',
          comparisonNote: 'Ulusal bilim portalı; sci-phil bağımsız epistemolojik çerçeve ve çok dilli PWA deneyimi sunar.'
        },
        {
          name: 'Philosophy East and West (Dijital)',
          domain: 'uhpress.hawaii.edu / jstor',
          focus: 'Asya ve karşılaştırmalı dünya felsefesi',
          languages: 'İngilizce',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Klasik akademik dergi; sci-phil Kelâm geleneği ile modern kuantum fiziğini anlık etkileşimli arayüzde buluşturur.'
        }
      ]
    },
    {
      id: 'americas',
      title: 'Amerika Niş Analizi',
      badge: 'US / Americas',
      liveVisitors: umamiSummary?.configured ? regionalTraffic.visitors.americas : null,
      liveTrafficSharePercent: umamiSummary?.configured ? regionalTraffic.sharesPercent.americas : null,
      indexedLocalArticles: (catalogStats.languageBreakdown.en || 0) + (catalogStats.languageBreakdown.es || 0),
      sciPhilProfile: {
        name: 'sci-phil.ai.studio (Kuzey & Güney Amerika)',
        languages: 'İngilizce (EN) & İspanyolca (ES)',
        articleCount: (catalogStats.languageBreakdown.en || 0) + (catalogStats.languageBreakdown.es || 0),
        epistemicTools: `Canlı Sokratik Partner (${socraticEnabled ? 'Aktif' : 'Yedek Mod'}) + Kanıt/Risk Perspektifi`,
        mathRendering: 'KaTeX + PWA Çevrimdışı Kurulum',
        syncMechanism: 'Bing / DuckDuckGo / Copilot IndexNow + Google Sitemap'
      },
      peers: [
        {
          name: 'Stanford Encyclopedia of Philosophy (SEP)',
          domain: 'plato.stanford.edu',
          focus: 'Hakemli akademik felsefe ansiklopedisi',
          languages: 'İngilizce',
          interactiveEpistemicMatrix: 'Yok (Ansiklopedik Metin)',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Dünyanın en kapsamlı felsefe ansiklopedisi; sci-phil ansiklopedik özet yerine özgün tez savunusu ve diyalektik matris sunar.'
        },
        {
          name: 'Quanta Magazine',
          domain: 'quantamagazine.org',
          focus: 'Teorik fizik, matematik, biyoloji ve bilgisayar bilimi',
          languages: 'İngilizce',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Bilim gazeteciliğinde zirve; sci-phil fizik konularını doğrudan felsefi ontoloji ve sektör risk analiziyle birleştirir.'
        },
        {
          name: 'Nautilus & IEP',
          domain: 'nautil.us / iep.utm.edu',
          focus: 'Disiplinlerarası bilim-felsefe denemeleri',
          languages: 'İngilizce',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Yalnızca İngilizce yayın yapar; sci-phil Amerika kıtası için hem İngilizce hem İspanyolca yerel SEO sayfaları barındırır.'
        }
      ]
    },
    {
      id: 'global',
      title: 'Global Niş Analizi',
      badge: 'Küresel Sentez',
      liveVisitors: umamiSummary?.configured ? regionalTraffic.visitors.global : null,
      liveTrafficSharePercent: umamiSummary?.configured ? regionalTraffic.sharesPercent.global : null,
      indexedLocalArticles: catalogStats.totalArticles,
      sciPhilProfile: {
        name: 'sci-phil.ai.studio (Global)',
        languages: '5 Dil (TR, EN, DE, FR, ES)',
        articleCount: catalogStats.totalArticles,
        epistemicTools: `%${catalogStats.dialecticalCoverageRatio} Diyalektik Üçlü + Sektör Değerlendirmesi + Sokratik AI`,
        mathRendering: 'Tam KaTeX + Dinamik Sitemap (291+ URL)',
        syncMechanism: 'Blogger Otomatik Sync + Çoklu IndexNow + Umami Canlı Telemetri'
      },
      peers: [
        {
          name: 'Aeon Magazine',
          domain: 'aeon.co',
          focus: 'Küresel felsefe, bilim ve kültür denemeleri',
          languages: 'İngilizce',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Uzun metin deneme standardı; sci-phil 5 dilde simültane katalog ve yapılandırılmış kanıt/yöntem matrisiyle ayrışır.'
        },
        {
          name: 'PhilPapers Global',
          domain: 'philpapers.org',
          focus: 'Küresel felsefe veri tabanı',
          languages: 'Çok dilli dizin (Arayüz EN)',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Yok',
          comparisonNote: 'Dizinleme platformu; sci-phil özgün tam metin üretimi ve canlı Sokratik sorgulama arayüzü sunar.'
        },
        {
          name: 'Big Think',
          domain: 'bigthink.com',
          focus: 'Popüler bilim, felsefe ve gelecek teknolojileri',
          languages: 'İngilizce',
          interactiveEpistemicMatrix: 'Yok',
          sectorEvaluation: 'Kısmi (İş Dünyası)',
          comparisonNote: 'Medya/video odaklı; sci-phil her makalede metodolojik kontrol ölçütleri ve akademik formülasyon korur.'
        }
      ]
    }
  ];

  return {
    generatedAt: new Date().toISOString(),
    reportingStartAt: process.env.ANALYTICS_START_AT || '2026-10-12T00:00:00+03:00',
    umamiConfigured: Boolean(umamiSummary?.configured),
    catalogStats,
    regionalTraffic,
    bloggerSync: {
      feedUrl: 'https://emrepelit7337.blogspot.com/feeds/posts/default',
      lastAttemptAt: syncStatus?.lastAttemptAt || null,
      lastSuccessAt: syncStatus?.lastSuccessAt || null,
      turkishCount: trArticles
    },
    regions
  };
}