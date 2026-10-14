/**
 * Core Web Vitals (LCP, INP, CLS) Real-User Monitoring (RUM)
 * Science & Philosophy — sci-phil.ai.studio
 */
(function () {
  'use strict';
  if (typeof window === 'undefined' || window.__SCI_PHIL_CWV_INIT__) return;
  window.__SCI_PHIL_CWV_INIT__ = true;

  const vitals = {
    lcp: null, // Largest Contentful Paint (ms) — Good < 2500ms
    inp: null, // Interaction to Next Paint (ms) — Good < 200ms
    cls: 0,    // Cumulative Layout Shift — Good < 0.1
    fcp: null, // First Contentful Paint (ms) — Good < 1800ms
    ttfb: null,// Time to First Byte (ms) — Good < 800ms
    timestamp: new Date().toISOString()
  };

  function saveVitals() {
    try {
      localStorage.setItem('sci_phil_cwv_metrics', JSON.stringify(vitals));
      window.dispatchEvent(new CustomEvent('sci-phil-cwv-updated', { detail: vitals }));
    } catch (_) {}
  }

  // Navigation Timing (TTFB)
  if (typeof performance !== 'undefined' && performance.getEntriesByType) {
    const navEntries = performance.getEntriesByType('navigation');
    if (navEntries && navEntries.length > 0) {
      const nav = navEntries[0];
      vitals.ttfb = Math.round(nav.responseStart - nav.requestStart);
    }
  }

  // Paint Timing (FCP)
  if (typeof PerformanceObserver !== 'undefined') {
    try {
      const paintObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            vitals.fcp = Math.round(entry.startTime);
            saveVitals();
          }
        }
      });
      paintObserver.observe({ type: 'paint', buffered: true });
    } catch (_) {}

    // Largest Contentful Paint (LCP)
    try {
      const lcpObserver = new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        if (entries.length > 0) {
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = Math.round(lastEntry.startTime);
          saveVitals();
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
    } catch (_) {}

    // Cumulative Layout Shift (CLS)
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            vitals.cls = Number(clsValue.toFixed(4));
            saveVitals();
          }
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
    } catch (_) {}

    // Interaction to Next Paint (INP) / First Input Delay (FID)
    try {
      const inpObserver = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          const duration = Math.round(entry.duration || entry.processingEnd - entry.startTime);
          if (vitals.inp === null || duration > vitals.inp) {
            vitals.inp = duration;
            saveVitals();
          }
        }
      });
      inpObserver.observe({ type: 'first-input', buffered: true });
    } catch (_) {}
  }

  window.__SCI_PHIL_CWV__ = vitals;
  saveVitals();
})();
