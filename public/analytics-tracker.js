/* First-party loader for Umami and Google Analytics 4 (GA4). No private key is sent to the browser. */
(() => {
  'use strict';
  if (window.__SCI_PHIL_ANALYTICS_LOADER__) return;
  window.__SCI_PHIL_ANALYTICS_LOADER__ = true;

  let configBase = window.location.origin;
  let siteKey = 'sci-phil';
  try {
    const loaderUrl = new URL(document.currentScript && document.currentScript.src || '/analytics-tracker.js', window.location.href);
    configBase = loaderUrl.origin;
    siteKey = loaderUrl.searchParams.get('site') || 'sci-phil';
  } catch (_) { /* Keep the same-origin primary-site defaults. */ }
  const configUrl = new URL('/api/analytics/config', configBase);
  configUrl.searchParams.set('site', siteKey);

  fetch(configUrl.toString(), { cache: 'no-store', mode: configBase === window.location.origin ? 'same-origin' : 'cors' })
    .then((response) => {
      if (!response.ok) throw new Error('Analytics config unavailable');
      return response.json();
    })
    .then((config) => {
      if (!config) return;

      // 1. Umami Cloud Tracker
      if (config.enabled === true && config.websiteId && !document.querySelector('script[data-sci-phil-umami="true"]')) {
        const script = document.createElement('script');
        script.defer = true;
        script.src = config.scriptUrl || 'https://cloud.umami.is/script.js';
        script.dataset.websiteId = config.websiteId;
        script.dataset.domains = config.domains || 'sci-phil.ai.studio';
        script.dataset.sciPhilUmami = 'true';
        script.addEventListener('error', () => console.warn('[Analytics] Umami tracker failed to load.'));
        document.head.appendChild(script);
      }

      // 2. Google Analytics 4 (GA4) / Google Tag
      const gaId = config.gaMeasurementId || (window.__SCI_PHIL_GA_ID__ || '');
      if (gaId && !document.querySelector('script[data-sci-phil-ga="true"]')) {
        const gaScript = document.createElement('script');
        gaScript.async = true;
        gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
        gaScript.dataset.sciPhilGa = 'true';
        document.head.appendChild(gaScript);

        window.dataLayer = window.dataLayer || [];
        function gtag(){window.dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', gaId, {
          cookie_flags: 'SameSite=None;Secure',
          anonymize_ip: true,
          send_page_view: true
        });
      }
    })
    .catch(() => {
      // Analytics is non-essential and must never prevent the website from loading.
    });
})();

