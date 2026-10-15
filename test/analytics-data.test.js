import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRealAnalyticsPayload } from '../analytics-data.js';

const options = {
  startAt: '2026-10-12T00:00:00+03:00',
  endAt: '2026-10-15T10:00:00.000Z',
  timezone: 'Europe/Istanbul',
};

test('maps only real Umami totals and country rows into dashboard values', () => {
  const data = buildRealAnalyticsPayload({
    visitors: { value: 8 }, pageviews: { value: 19 }, visits: { value: 10 }, totaltime: { value: 500 },
  }, [
    { x: 'TR', visitors: 5, views: 12, visits: 6, totaltime: 300 },
    { x: 'US', visitors: 3, views: 7, visits: 4, totaltime: 200 },
  ], options);
  assert.equal(data.visitors, 8);
  assert.equal(data.pageviews, 19);
  assert.equal(data.visits, 10);
  assert.equal(data.averageDurationSeconds, 50);
  assert.equal(data.countries.length, 2);
  assert.equal(data.countries[0].country, 'TR');
  assert.equal(data.countries[0].visitors, 5);
  assert.equal(data.countries[0].pageviews, 12);
  assert.equal(data.countries[0].topTopic, null);
  assert.equal(data.regions['Türkiye & Avrasya'].visitors, 5);
  assert.equal(data.regions['Türkiye & Avrasya'].pageviews, 12);
});

test('missing country breakdown remains explicitly unavailable rather than synthesizing countries', () => {
  const data = buildRealAnalyticsPayload({ visitors: 3, pageviews: 4, visits: 3 }, null, options);
  assert.equal(data.visitors, 3);
  assert.equal(data.countries.length, 0);
  assert.equal(data.countryBreakdownAvailable, false);
  assert.deepEqual(data.regions, {});
  assert.equal(data.averageDurationSeconds, null);
});

test('rejects incomplete provider aggregates instead of returning plausible-looking zeroes', () => {
  assert.throws(() => buildRealAnalyticsPayload({ visitors: 3, visits: 2 }, [], options), /pageviews/);
  assert.throws(() => buildRealAnalyticsPayload({ visitors: 'not-a-number', pageviews: 2, visits: 1 }, [], options), /visitors/);
  assert.throws(() => buildRealAnalyticsPayload({ visitors: 1, pageviews: 2, visits: 1 }, [], { ...options, startAt: 'not-a-date' }), /ANALYTICS_START_AT/);
});
