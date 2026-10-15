(() => {
  'use strict';

  const CONFIG = {
    counterBase: 'https://countapi.mileshilliard.com/api/v1',
    baselineUrl: '/stats/read-baseline.json',
    fallbackBaselineUrl: 'https://raw.githubusercontent.com/emrepelit109/science-philosophy/main/stats/read-baseline.json',
    // Auto-refresh every minute.
    refreshMs: 60_000,
    counters: {
      bloggerNet: 'science-philosophy-blogger-new-post-reads-2026-09-30-b4e71c',
      bloggerViews: 'science-philosophy-blogger-page-views-2026-09-30-c73a2d',
      sourceNet: 'science-philosophy-grokme-web-reads-2026-09-26-7c2f9a',
      sourceViews: 'science-philosophy-grokme-page-views-2026-09-26-8e4d1c',
      pagesNet: 'science-philosophy-github-pages-web-reads-2026-09-26-41a6d2',
      pagesViews: 'science-philosophy-github-pages-page-views-2026-09-26-5b7a2e',
      appNet: 'science-philosophy-grokme-app-reads-2026-09-30-a91f4e',
      appViews: 'science-philosophy-ai-studio-page-views-2026-10-11-2c8a71'
    }
  };

  const nf = new Intl.NumberFormat('tr-TR');
  const languageNames = {
    tr: 'Türkçe', en: 'İngilizce', de: 'Almanca', fr: 'Fransızca', es: 'İspanyolca',
    pt: 'Portekizce', it: 'İtalyanca', ru: 'Rusça', ar: 'Arapça', ja: 'Japonca', zh: 'Çince'
  };
  const $ = id => document.getElementById(id);

  async function getJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  async function getBaseline() {
    try {
      return await getJson(`${CONFIG.baselineUrl}?ts=${Date.now()}`);
    } catch (_) {
      return getJson(`${CONFIG.fallbackBaselineUrl}?ts=${Date.now()}`);
    }
  }

  async function getCounter(key) {
    try {
      const data = await getJson(`${CONFIG.counterBase}/get/${encodeURIComponent(key)}`);
      const value = Number(data.value);
      return Number.isFinite(value) && value >= 0 ? value : null;
    } catch (_) {
      return null;
    }
  }

  function valueWithLive(base, live) {
    const baseValue = Number(base);
    if (!Number.isFinite(baseValue) || live === null || !Number.isFinite(live)) return null;
    return baseValue + live;
  }

  function showNumber(id, value) {
    const el = $(id);
    if (el) el.textContent = value === null || value === undefined ? '—' : nf.format(value);
  }

  function renderLanguages(catalog) {
    const target = $('language-breakdown');
    const posts = Array.isArray(catalog?.posts) ? catalog.posts : null;
    if (!target) return;
    target.replaceChildren();
    if (!posts) {
      const p = document.createElement('p');
      p.className = 'status error';
      p.textContent = 'Makale kataloğu yüklenemedi.';
      target.appendChild(p);
      return;
    }

    const counts = new Map();
    for (const post of posts) {
      const code = String(post.language || 'tr').toLowerCase();
      counts.set(code, (counts.get(code) || 0) + 1);
    }
    const total = posts.length;
    [...counts.entries()].sort((a, b) => b[1] - a[1]).forEach(([code, count]) => {
      const row = document.createElement('div');
      row.className = 'language-row';
      const label = document.createElement('span');
      label.textContent = languageNames[code] || code.toUpperCase();
      const bar = document.createElement('div');
      bar.className = 'bar';
      bar.setAttribute('role', 'img');
      bar.setAttribute('aria-label', `${label.textContent}: ${count} makale`);
      const fill = document.createElement('div');
      fill.className = 'fill';
      fill.style.width = `${total ? (count / total) * 100 : 0}%`;
      bar.appendChild(fill);
      const number = document.createElement('span');
      number.className = 'language-count';
      number.textContent = nf.format(count);
      row.append(label, bar, number);
      target.appendChild(row);
    });
  }

  async function loadAnalytics() {
    const button = $('analytics-refresh');
    const status = $('analytics-status');
    if (!button || !status || button.disabled) return;

    button.disabled = true;
    status.className = 'status';
    status.textContent = 'İstatistikler gerçek verilere senkronize ediliyor…';

    try {
      const [base, counterResults, catalogResult] = await Promise.all([
        getBaseline(),
        Promise.all(Object.entries(CONFIG.counters).map(async ([name, key]) => [name, await getCounter(key)])),
        getJson(`/catalog.json?ts=${Date.now()}`).catch(() => null)
      ]);
      const live = Object.fromEntries(counterResults);

      const readBaseline = (key) => {
        const value = base?.[key];
        if (value === null || value === undefined || value === '') return null;
        const number = Number(value);
        return Number.isFinite(number) && number >= 0 ? number : null;
      };
      const baseBloggerNet = readBaseline('blogger_post_reads_baseline');
      const baseBloggerViews = readBaseline('blogger_page_views_baseline');
      const baseSourceNet = readBaseline('website_web_reads_baseline');
      const baseSourceViews = readBaseline('website_page_views_baseline');
      const basePagesNet = readBaseline('github_pages_net_read_baseline');
      const basePagesViews = readBaseline('github_pages_page_views_baseline');
      const baseBottomNet = readBaseline('article_bottom_reads_baseline');
      const baseAppNet = readBaseline('website_app_reads_baseline');
      const baseAppViews = readBaseline('ai_studio_page_views_baseline');

      const addLiveCounter = (baseline, current) => valueWithLive(baseline, current);
      const bloggerNet = addLiveCounter(baseBloggerNet, live.bloggerNet);
      const bloggerViews = addLiveCounter(baseBloggerViews, live.bloggerViews);
      const sourceNet = addLiveCounter(baseSourceNet, live.sourceNet);
      const sourceViews = addLiveCounter(baseSourceViews, live.sourceViews);
      const pagesNet = addLiveCounter(basePagesNet, live.pagesNet);
      const pagesViews = addLiveCounter(basePagesViews, live.pagesViews);
      const appNet = addLiveCounter(baseAppNet, live.appNet);
      const appViews = addLiveCounter(baseAppViews, live.appViews);
      const bottomNet = baseBottomNet;

      // A combined total is shown only when each live counter that contributes to it is available.
      const sumIfComplete = (values) => values.every((value) => value !== null && Number.isFinite(value))
        ? values.reduce((sum, value) => sum + value, 0)
        : null;
      const totalNet = sumIfComplete([bloggerNet, sourceNet, pagesNet, appNet, bottomNet]);
      const totalViews = sumIfComplete([bloggerViews, sourceViews, pagesViews, appViews]);

      showNumber('total-net', totalNet);
      showNumber('total-views', totalViews);
      showNumber('blogger-net', bloggerNet);
      showNumber('source-net', sourceNet);
      showNumber('pages-net', pagesNet);
      showNumber('app-net', appNet);
      showNumber('app-views', appViews);
      showNumber('bottom-net', bottomNet);

      const missingCounters = Object.values(live).some((value) => value === null);
      const missingBase = [baseBloggerNet, baseBloggerViews, baseSourceNet, baseSourceViews, basePagesNet, basePagesViews, baseBottomNet, baseAppNet, baseAppViews].some((value) => value === null);
      if (catalogResult && Array.isArray(catalogResult.posts)) {
        const posts = catalogResult.posts;
        showNumber('article-total', posts.length);
        const totalWords = posts.reduce((sum, post) => sum + (Number(post.wordCount) || 0), 0);
        showNumber('total-words', totalWords);
        const categories = new Set(posts.flatMap(post => Array.isArray(post.categories) ? post.categories : []));
        showNumber('total-categories', categories.size);
        const updatedAt = catalogResult.updatedAt ? new Date(catalogResult.updatedAt) : null;
        $('catalog-updated').textContent = updatedAt && !Number.isNaN(updatedAt.getTime())
          ? updatedAt.toLocaleDateString('tr-TR') : 'Belirtilmedi';
        renderLanguages(catalogResult);
      } else {
        ['article-total', 'total-words', 'total-categories'].forEach(id => showNumber(id, null));
        $('catalog-updated').textContent = '—';
        renderLanguages(null);
      }

      if (missingBase) {
        status.textContent = 'Başlangıç sayaç dosyası eksik veya geçersiz. Doğrulanamayan toplamlar — olarak gösterilir.';
        status.className = 'status error';
      } else if (missingCounters) {
        status.textContent = `Bazı canlı sayaçlara ulaşılamadı; doğrulanamayan toplamlar — olarak gösteriliyor. Son kontrol: ${new Date().toLocaleTimeString('tr-TR')}`;
        status.className = 'status error';
      } else {
        status.textContent = `Sayaçlar güncellendi · 60 saniyede bir otomatik yenilenir. Son güncelleme: ${new Date().toLocaleTimeString('tr-TR')}`;
        status.className = 'status';
      }
    } catch (_) {
      status.className = 'status error';
      status.textContent = 'İstatistikler yüklenemedi. Başlangıç dosyası veya canlı sayaç servisi yanıt vermiyor.';
      ['total-net', 'total-views', 'blogger-net', 'source-net', 'pages-net', 'app-net', 'app-views', 'bottom-net'].forEach(id => showNumber(id, null));
    } finally {
      button.disabled = false;
    }
  }

  // Core Web Vitals Live RUM Reader
  function updateCwvDisplay() {
    try {
      const stored = localStorage.getItem('sci_phil_cwv_metrics');
      const vitals = stored ? JSON.parse(stored) : (window.__SCI_PHIL_CWV__ || {});
      if (vitals.lcp !== null && vitals.lcp !== undefined) {
        const lcpEl = $('cwv-lcp-val');
        if (lcpEl) lcpEl.textContent = `${(vitals.lcp / 1000).toFixed(2)} s`;
      }
      if (vitals.inp !== null && vitals.inp !== undefined) {
        const inpEl = $('cwv-inp-val');
        if (inpEl) inpEl.textContent = `${Math.round(vitals.inp)} ms`;
      }
      if (vitals.cls !== null && vitals.cls !== undefined) {
        const clsEl = $('cwv-cls-val');
        if (clsEl) clsEl.textContent = Number(vitals.cls).toFixed(2);
      }
      if (vitals.ttfb !== null && vitals.ttfb !== undefined) {
        const ttfbEl = $('cwv-ttfb-val');
        if (ttfbEl) ttfbEl.textContent = `${Math.round(vitals.ttfb)} ms`;
      }
    } catch (_) {}
  }

  window.addEventListener('sci-phil-cwv-updated', updateCwvDisplay);
  updateCwvDisplay();

  // Exports contain only the values currently displayed by live counters.
  function currentSnapshot() {
    const fields = [
      ['Toplam net okunma', 'total-net'], ['Toplam görüntüleme', 'total-views'],
      ['Blogger net okunma', 'blogger-net'], ['Kaynak site net okunma', 'source-net'],
      ['GitHub Pages net okunma', 'pages-net'], ['Uygulama net okunma', 'app-net'],
      ['Uygulama görüntüleme', 'app-views'], ['Makale altı okunma', 'bottom-net'],
      ['Makale sayısı', 'article-total'], ['Toplam kelime', 'total-words'],
      ['Kategori sayısı', 'total-categories']
    ];
    return { generatedAt: new Date().toISOString(), rows: fields.map(([label, id]) => ({ label, value: $(id)?.textContent?.trim() || '—' })) };
  }

  $('export-csv-btn')?.addEventListener('click', () => {
    const snapshot = currentSnapshot();
    const escapeCsv = (value) => `"${String(value).replace(/"/g, '""')}"`;
    const rows = [['Ölçüm', 'Gösterilen değer', 'Rapor zamanı'], ...snapshot.rows.map((row) => [row.label, row.value, snapshot.generatedAt])];
    const csvContent = '\ufeff' + rows.map((row) => row.map(escapeCsv).join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sci-phil-analytics-${snapshot.generatedAt.slice(0, 10)}.csv`;
    document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(url);
  });

  $('copy-sheets-btn')?.addEventListener('click', async () => {
    const snapshot = currentSnapshot();
    const tsv = [['Ölçüm', 'Gösterilen değer', 'Rapor zamanı'], ...snapshot.rows.map((row) => [row.label, row.value, snapshot.generatedAt])]
      .map((row) => row.join('\t')).join('\n');
    try {
      await navigator.clipboard.writeText(tsv);
      const feedback = $('sheets-feedback');
      if (feedback) { feedback.style.display = 'block'; setTimeout(() => { feedback.style.display = 'none'; }, 4000); }
    } catch (_) {
      alert('Panoya kopyalanamadı; tarayıcı izinlerini kontrol edin.');
    }
  });

  $('analytics-refresh')?.addEventListener('click', loadAnalytics);
  loadAnalytics();
  window.setInterval(() => {
    if (!document.hidden) loadAnalytics();
  }, CONFIG.refreshMs);
})();
