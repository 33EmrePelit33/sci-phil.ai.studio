const REGION_COUNTRIES = {
  'Türkiye & Avrasya': new Set(['TR', 'AZ', 'KZ', 'UZ', 'TM', 'KG', 'TJ', 'GE', 'AM']),
  Avrupa: new Set(['DE', 'FR', 'NL', 'GB', 'AT', 'CH', 'BE', 'CY', 'SE', 'IT', 'ES', 'NO', 'DK', 'FI', 'PL', 'GR', 'IE', 'PT', 'CZ', 'RO', 'HU', 'BG', 'HR', 'RS', 'SK']),
  'Kuzey Amerika': new Set(['US', 'CA', 'MX']),
};

function numberFrom(value) {
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
  if (!/^[A-Z]{2}$/.test(code)) return '🌐';
  return String.fromCodePoint(...Array.from(code, (letter) => 127397 + letter.charCodeAt(0)));
}

function requiredMetric(stats, name) {
  const value = numberFrom(stats?.[name]);
  if (value === null) throw new Error(`Umami yanıtında geçerli ${name} sayacı bulunamadı.`);
  return value;
}

/** Build a dashboard payload only from values returned by the analytics provider. */
export function buildRealAnalyticsPayload(statsPayload, countryRows, options = {}) {
  const stats = statsPayload?.data && typeof statsPayload.data === 'object' ? statsPayload.data : statsPayload;
  const startAt = String(options.startAt || '');
  const startMs = Date.parse(startAt);
  if (!Number.isFinite(startMs)) throw new Error('ANALYTICS_START_AT geçerli bir tarih değil.');

  const visitors = requiredMetric(stats, 'visitors');
  const pageviews = requiredMetric(stats, 'pageviews');
  const visits = requiredMetric(stats, 'visits');
  const totalTime = numberFrom(stats?.totaltime);

  const rows = Array.isArray(countryRows) ? countryRows : [];
  const countries = rows.map((row) => {
    const code = countryCodeFrom(row);
    const rowVisitors = numberFrom(row?.visitors ?? row?.uniqueVisitors ?? row?.y);
    const rowPageviews = numberFrom(row?.pageviews ?? row?.views);
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
      topTopic: null,
    };
  }).filter((row) => row.visitors !== null || row.pageviews !== null)
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
      countryCount: 0,
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
    provider: 'Umami Cloud API',
    startAt: new Date(startMs).toISOString(),
    milestone: '24 Nisan 2026, 00:00 (Türkiye Saati)',
    endAt: String(options.endAt || new Date().toISOString()),
    timezone: String(options.timezone || 'Europe/Istanbul'),
    visitors,
    pageviews,
    visits,
    averageDurationSeconds: totalTime !== null && visits > 0 ? Math.round(totalTime / visits) : null,
    countryBreakdownAvailable: countries.length > 0,
    countries,
    regions: Object.fromEntries(countryTotals),
    refreshedAt: String(options.endAt || new Date().toISOString()),
  };
}
