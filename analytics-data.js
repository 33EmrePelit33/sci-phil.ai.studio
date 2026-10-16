const REGION_COUNTRIES = {
  'Türkiye & Avrasya': new Set(['TR', 'AZ', 'KZ', 'UZ', 'TM', 'KG', 'TJ', 'GE', 'AM']),
  'Avrupa': new Set(['DE', 'FR', 'NL', 'GB', 'AT', 'CH', 'BE', 'CY', 'SE', 'IT', 'ES', 'NO', 'DK', 'FI', 'PL', 'GR', 'IE', 'PT', 'CZ', 'RO', 'HU', 'BG', 'HR', 'RS', 'SK']),
  'Kuzey Amerika': new Set(['US', 'CA', 'MX'])
};

export const ECOSYSTEM_PLATFORMS = [
  {
    key: 'sciphi',
    name: 'Science & Philosophy (Ana Portal)',
    domain: 'sci-phil.ai.studio',
    launchAt: '2026-04-24T00:00:00+03:00',
    envKey: 'UMAMI_WEBSITE_ID',
    baselineNetKey: 'website_app_reads_baseline',
    baselineViewsKey: 'ai_studio_page_views_baseline',
    counterNet: 'science-philosophy-grokme-app-reads-2026-09-30-a91f4e',
    counterViews: 'science-philosophy-ai-studio-page-views-2026-10-11-2c8a71'
  },
  {
    key: 'blogger',
    name: 'Blogger Türkçe & Çok Dilli Arşiv',
    domain: 'emrepelit7337.blogspot.com',
    launchAt: '2026-04-01T00:00:00+03:00',
    envKey: 'UMAMI_BLOGGER_WEBSITE_ID',
    baselineNetKey: 'blogger_post_reads_baseline',
    baselineViewsKey: 'blogger_page_views_baseline',
    counterNet: 'science-philosophy-blogger-new-post-reads-2026-09-30-b4e71c',
    counterViews: 'science-philosophy-blogger-page-views-2026-09-30-c73a2d'
  },
  {
    key: 'grokme',
    name: 'Science & Philosophy Grok.me',
    domain: 'science-philosophy.grok.me',
    launchAt: '2026-09-26T00:00:00+03:00',
    envKey: 'UMAMI_GROKME_WEBSITE_ID',
    baselineNetKey: 'website_web_reads_baseline',
    baselineViewsKey: 'website_page_views_baseline',
    counterNet: 'science-philosophy-grokme-web-reads-2026-09-26-7c2f9a',
    counterViews: 'science-philosophy-grokme-page-views-2026-09-26-8e4d1c'
  },
  {
    key: 'githubpages',
    name: 'GitHub Pages Web Arşivi',
    domain: 'emrepelit109.github.io/science-philosophy',
    launchAt: '2026-09-26T00:00:00+03:00',
    envKey: 'UMAMI_GITHUB_PAGES_WEBSITE_ID',
    baselineNetKey: 'github_pages_net_read_baseline',
    baselineViewsKey: 'github_pages_page_views_baseline',
    counterNet: 'science-philosophy-github-pages-web-reads-2026-09-26-41a6d2',
    counterViews: 'science-philosophy-github-pages-page-views-2026-09-26-5b7a2e'
  },
  {
    key: 'legacy_ep',
    name: 'AI Studio (Emre Pelit Portal)',
    domain: 'science-philosophy-emre-pelit.ai.studio',
    launchAt: '2026-04-15T00:00:00+03:00',
    envKey: 'UMAMI_LEGACY_EP_WEBSITE_ID',
    baselineNetKey: 'article_bottom_reads_baseline',
    baselineViewsKey: null,
    counterNet: null,
    counterViews: null
  },
  {
    key: 'legacy_sp',
    name: 'AI Studio (Klasik Science-Philosophy)',
    domain: 'science-philosophy.ai.studio',
    launchAt: '2026-04-18T00:00:00+03:00',
    envKey: 'UMAMI_LEGACY_SP_WEBSITE_ID'
  },
  {
    key: 'socratic_lab',
    name: 'Sokratik Diyalog Laboratuvarı',
    domain: 'sci-phil.ai.studio/#socratic',
    launchAt: '2026-07-01T00:00:00+03:00',
    envKey: 'UMAMI_SOCRATIC_WEBSITE_ID'
  },
  {
    key: 'epistemic_matrix',
    name: 'Epistemik Süzgeç & Sektör Analizi',
    domain: 'sci-phil.ai.studio/#epistemic',
    launchAt: '2026-08-10T00:00:00+03:00',
    envKey: 'UMAMI_EPISTEMIC_WEBSITE_ID'
  }
];

export function numberFrom(value) {
  const candidate = value && typeof value === 'object' && Object.prototype.hasOwnProperty.call(value, 'value')
    ? value.value
    : value;
  if (candidate === null || candidate === undefined || candidate === '') return null;
  const number = Number(candidate);
  return Number.isFinite(number) && number >= 0 ? number : null;
}

function countryCodeFrom(row) {
  return String(row?.country ?? row?.countryCode ?? row?.code ?? row?.x ?? 'XX').trim().toUpperCase() || 'XX';
}

function countryNameFrom(row, code) {
  const suppliedName = row?.countryName ?? row?.label;
  if (typeof suppliedName === 'string' && suppliedName.trim()) return suppliedName.trim();
  try {
    return new Intl.DisplayNames(['tr'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

function regionFrom(code) {
  for (const [region, codes] of Object.entries(REGION_COUNTRIES)) {
    if (codes.has(code)) return region;
  }
  return 'Diğer Bölgeler';
}

function flagFrom(code) {
  if (!/^[A-Z]{2}$/.test(code)) return '\uD83C\uDF10';
  return String.fromCodePoint(...Array.from(code, (letter) => 127397 + letter.charCodeAt(0)));
}

function requiredMetric(stats, name) {
  const value = numberFrom(stats?.[name]);
  if (value === null) throw new Error(`Umami yanıtında geçerli ${name} sayacı bulunamadı.`);
  return value;
}

export function buildRealAnalyticsPayload(statsPayload, countryRows, options = {}) {
  const stats = statsPayload?.data && typeof statsPayload.data === 'object' ? statsPayload.data : statsPayload;
  const startAt = String(options.startAt || '2026-04-01T00:00:00+03:00');
  const startMs = Date.parse(startAt);
  if (!Number.isFinite(startMs)) throw new Error('ANALYTICS_START_AT geçerli bir tarih değil.');

  const visitors = requiredMetric(stats, 'visitors');
  const pageviews = requiredMetric(stats, 'pageviews');
  const visits = requiredMetric(stats, 'visits');
  const netReads = numberFrom(stats?.netReads);
  const totalTime = numberFrom(stats?.totaltime);

  const rows = Array.isArray(countryRows) ? countryRows : [];
  const countries = rows
    .map((row) => {
      const code = countryCodeFrom(row);
      const rowVisitors = numberFrom(row?.visitors ?? row?.uniqueVisitors ?? row?.y);
      const rowPageviews = numberFrom(row?.pageviews ?? row?.views ?? row?.y);
      const rowVisits = numberFrom(row?.visits);
      const rowTime = numberFrom(row?.totaltime);
      const averageDuration = rowTime !== null && rowVisits !== null && rowVisits > 0
        ? Math.round(rowTime / rowVisits)
        : null;
      return {
        country: code,
        countryName: countryNameFrom(row, code),
        region: regionFrom(code),
        flag: flagFrom(code),
        visitors: rowVisitors,
        pageviews: rowPageviews,
        visits: rowVisits,
        percent: visitors > 0 && rowVisitors !== null ? Number(((rowVisitors / visitors) * 100).toFixed(1)) : null,
        avgReadSeconds: averageDuration,
        topTopic: null
      };
    })
    .filter((row) => row.visitors !== null || row.pageviews !== null)
    .sort((a, b) => (b.visitors ?? -1) - (a.visitors ?? -1));

  const countryTotals = new Map();
  for (const country of countries) {
    const region = country.region;
    const current = countryTotals.get(region) || {
      region,
      visitors: 0,
      pageviews: 0,
      pageviewsKnown: true,
      percent: 0,
      countryCount: 0
    };
    if (country.visitors !== null) current.visitors += country.visitors;
    if (country.pageviews === null) current.pageviewsKnown = false;
    else current.pageviews += country.pageviews;
    current.countryCount += 1;
    countryTotals.set(region, current);
  }

  for (const region of countryTotals.values()) {
    region.percent = visitors > 0 ? Number(((region.visitors / visitors) * 100).toFixed(1)) : 0;
    if (!region.pageviewsKnown) region.pageviews = null;
    delete region.pageviewsKnown;
  }

  return {
    configured: true,
    readOnly: true,
    provider: 'Umami Cloud API',
    startAt: new Date(startMs).toISOString(),
    milestone: 'Umami API ölçümü — başlangıç tarihi yapılandırmadan alınır',
    endAt: String(options.endAt || new Date().toISOString()),
    timezone: String(options.timezone || 'Europe/Istanbul'),
    visitors,
    pageviews,
    visits,
    netReads,
    averageDurationSeconds: totalTime !== null && visits > 0 ? Math.round(totalTime / visits) : null,
    countryBreakdownAvailable: countries.length > 0,
    countries,
    regions: Object.fromEntries(countryTotals),
    refreshedAt: String(options.endAt || new Date().toISOString())
  };
}

export function buildSynchronizedCumulativeSummary(sitePayloads = []) {
  const validSites = Array.isArray(sitePayloads) ? sitePayloads : [];
  const sumKnown = (key) => {
    const values = validSites.map((site) => numberFrom(site?.[key])).filter((value) => value !== null);
    return values.length ? values.reduce((sum, value) => sum + value, 0) : null;
  };

  return {
    readOnly: true,
    synchronized: true,
    siteCount: validSites.length,
    configuredSiteCount: validSites.filter((site) => site?.configured === true).length,
    cumulativeTotalPageviews: sumKnown('pageviews'),
    unifiedNetReads: sumKnown('netReads'),
    cumulativeVisitors: sumKnown('visitors'),
    cumulativeSessions: sumKnown('visits'),
    sites: validSites
  };
}

/**
 * Her sitenin Umami + Baseline + CountAPI verilerini birleştirir ve kaç farklı istatistiği kayıtlıysa hesaplar.
 */
export function mergePlatformHybridMetrics(platformDef, { umamiData = null, baseline = {}, liveCounters = {} } = {}) {
  const baselineNetValue = platformDef.baselineNetKey ? numberFrom(baseline[platformDef.baselineNetKey]) : null;
  const baselineViewsValue = platformDef.baselineViewsKey ? numberFrom(baseline[platformDef.baselineViewsKey]) : null;
  const liveNetValue = platformDef.counterNet ? numberFrom(liveCounters[platformDef.counterNet]) : null;
  const liveViewsValue = platformDef.counterViews ? numberFrom(liveCounters[platformDef.counterViews]) : null;
  const hasCounterNet = baselineNetValue !== null || liveNetValue !== null;
  const hasCounterViews = baselineViewsValue !== null || liveViewsValue !== null;
  const counterTotalNet = (baselineNetValue ?? 0) + (liveNetValue ?? 0);
  const counterTotalViews = (baselineViewsValue ?? 0) + (liveViewsValue ?? 0);

  const umamiPageviews = numberFrom(umamiData?.pageviews);
  const umamiNetReads = numberFrom(umamiData?.netReads);
  const umamiVisitors = numberFrom(umamiData?.visitors);
  const umamiVisits = numberFrom(umamiData?.visits);
  const umamiDuration = numberFrom(umamiData?.averageDurationSeconds ?? umamiData?.avgReadSeconds);

  const pageviewCandidates = [umamiPageviews, hasCounterViews ? counterTotalViews : null].filter((value) => value !== null);
  const netReadCandidates = [umamiNetReads, hasCounterNet ? counterTotalNet : null].filter((value) => value !== null);
  const finalPageviews = pageviewCandidates.length ? Math.max(...pageviewCandidates) : null;
  const finalNetReads = netReadCandidates.length ? Math.max(...netReadCandidates) : null;

  const recordedMetrics = [];
  if (umamiVisitors !== null) recordedMetrics.push('Tekil Ziyaretçi (Umami)');
  if (umamiVisits !== null) recordedMetrics.push('Oturum Sayısı (Umami)');
  if (finalNetReads !== null) recordedMetrics.push('Kaydedilmiş Net Okunma');
  if (finalPageviews !== null) recordedMetrics.push('Toplam Görüntüleme');
  if (baselineNetValue !== null || baselineViewsValue !== null) recordedMetrics.push('Arşiv Baseline Kaydı');
  if (liveNetValue !== null || liveViewsValue !== null) recordedMetrics.push('Canlı CountAPI Sayacı');
  if (umamiData && (umamiPageviews !== null || umamiVisitors !== null || umamiVisits !== null)) recordedMetrics.push('Umami Cloud Telemetrisi');
  if (umamiDuration !== null) recordedMetrics.push('Ortalama Okuma Süresi');

  return {
    key: platformDef.key,
    name: platformDef.name,
    domain: platformDef.domain,
    launchAt: platformDef.launchAt,
    configured: Boolean(recordedMetrics.length),
    sourceType: umamiData ? 'Umami + Kaydedilmiş Sayaçlar' : (hasCounterNet || hasCounterViews ? 'Kayıtlı Baseline + Canlı Sayaç' : 'Senkronize Beklemede'),
    visitors: umamiVisitors,
    visits: umamiVisits,
    netReads: finalNetReads,
    pageviews: finalPageviews,
    baselineNet: baselineNetValue,
    baselineViews: baselineViewsValue,
    liveCounterNet: liveNetValue,
    liveCounterViews: liveViewsValue,
    avgReadSeconds: umamiDuration,
    recordedMetricCount: recordedMetrics.length,
    recordedMetrics
  };
}

