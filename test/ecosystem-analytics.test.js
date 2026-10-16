import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ECOSYSTEM_PLATFORMS,
  buildRealAnalyticsPayload,
  buildSynchronizedCumulativeSummary,
  mergePlatformHybridMetrics
} from '../analytics-data.js';

describe('Sci-Phil 8-Platform & Grok.me Hibrit Analitik Testleri', () => {
  test('ECOSYSTEM_PLATFORMS tam 8 siteyi ve science-philosophy.grok.me alan adını içermeli', () => {
    assert.equal(ECOSYSTEM_PLATFORMS.length, 8);
    const grokSite = ECOSYSTEM_PLATFORMS.find((p) => p.domain === 'science-philosophy.grok.me');
    assert.ok(grokSite, 'science-philosophy.grok.me platform listesinde bulunmalı');
    assert.ok(grokSite.launchAt, 'Grok.me açılış tarihi tanımlı olmalı');

    for (const site of ECOSYSTEM_PLATFORMS) {
      assert.ok(Number.isFinite(Date.parse(site.launchAt)), `${site.key} geçerli bir açılış tarihine sahip olmalı`);
    }
  });

  test('Grok.me Baseline + CountAPI değerlerini kullanır ama ziyaretçi ve oturum sayısını tahmin etmez', () => {
    const grokDef = ECOSYSTEM_PLATFORMS.find((p) => p.key === 'grokme');
    const merged = mergePlatformHybridMetrics(grokDef, {
      umamiData: null,
      baseline: { website_web_reads_baseline: 9640, website_page_views_baseline: 12580 },
      liveCounters: {
        'science-philosophy-grokme-web-reads-2026-09-26-7c2f9a': 360,
        'science-philosophy-grokme-page-views-2026-09-26-8e4d1c': 420
      }
    });

    assert.equal(merged.configured, true);
    assert.equal(merged.netReads, 10000);
    assert.equal(merged.pageviews, 13000);
    assert.equal(merged.visitors, null, 'Umami ziyaretçi verisi yoksa ziyaretçi sayısı tahmin edilmemeli');
    assert.equal(merged.visits, null, 'Umami oturum verisi yoksa oturum sayısı tahmin edilmemeli');
    assert.equal(merged.avgReadSeconds, null, 'ortalama süre tahmin edilmemeli');
    assert.ok(merged.recordedMetricCount >= 4);
    assert.ok(merged.recordedMetrics.includes('Arşiv Baseline Kaydı'));
    assert.ok(merged.recordedMetrics.includes('Canlı CountAPI Sayacı'));
  });

  test('buildSynchronizedCumulativeSummary yalnızca kayıtlı metrikleri hatasız toplamalı', () => {
    const sampleSites = ECOSYSTEM_PLATFORMS.map((p, idx) =>
      mergePlatformHybridMetrics(p, {
        umamiData: { visitors: (idx + 1) * 100, visits: (idx + 1) * 120, netReads: (idx + 1) * 150, pageviews: (idx + 1) * 200 }
      })
    );
    const summary = buildSynchronizedCumulativeSummary(sampleSites);

    assert.equal(summary.siteCount, 8);
    assert.equal(summary.cumulativeVisitors, 3600);
    assert.equal(summary.cumulativeSessions, 4320);
    assert.equal(summary.unifiedNetReads, 5400);
    assert.equal(summary.cumulativeTotalPageviews, 7200);
  });

  test('buildRealAnalyticsPayload ülke dağılımlarını ve oranlarını doğru hesaplamalı', () => {
    const payload = buildRealAnalyticsPayload(
      { visitors: 1000, pageviews: 2500, visits: 1400, totaltime: 140000 },
      [
        { country: 'TR', visitors: 700, pageviews: 1800 },
        { country: 'DE', visitors: 300, pageviews: 700 }
      ],
      { startAt: '2026-04-24T00:00:00+03:00' }
    );

    assert.equal(payload.configured, true);
    assert.equal(payload.visitors, 1000);
    assert.equal(payload.pageviews, 2500);
    assert.equal(payload.averageDurationSeconds, 100);
    assert.equal(payload.countries.length, 2);
    assert.equal(payload.countries[0].country, 'TR');
    assert.equal(payload.countries[0].percent, 70);
  });
});