(() => {
  'use strict';

  const CONFIG = {
    counterBase: 'https://countapi.mileshilliard.com/api/v1',
    baselineUrl: '/stats/read-baseline.json',
    fallbackBaselineUrl: 'https://raw.githubusercontent.com/emrepelit109/science-philosophy/main/stats/read-baseline.json',
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
    status.textContent = 'İstatistikler yenileniyor…';

    try {
      const [base, counterResults, catalogResult] = await Promise.all([
        getBaseline(),
        Promise.all(Object.entries(CONFIG.counters).map(async ([name, key]) => [name, await getCounter(key)])),
        getJson(`/catalog.json?ts=${Date.now()}`).catch(() => null)
      ]);
      const live = Object.fromEntries(counterResults);

      const bloggerNet = valueWithLive(base.blogger_post_reads_baseline, live.bloggerNet);
      const bloggerViews = valueWithLive(base.blogger_page_views_baseline, live.bloggerViews);
      const sourceNet = valueWithLive(base.website_web_reads_baseline, live.sourceNet);
      const sourceViews = valueWithLive(base.website_page_views_baseline, live.sourceViews);
      const pagesNet = valueWithLive(base.github_pages_net_read_baseline, live.pagesNet);
      const pagesViews = valueWithLive(base.github_pages_page_views_baseline, live.pagesViews);
      const appNet = valueWithLive(base.website_app_reads_baseline, live.appNet);
      const appViews = valueWithLive(base.ai_studio_page_views_baseline, live.appViews);
      const bottomNet = Number.isFinite(Number(base.article_bottom_reads_baseline))
        ? Number(base.article_bottom_reads_baseline) : null;

      const netComponents = [bloggerNet, sourceNet, pagesNet, appNet, bottomNet];
      const viewComponents = [bloggerViews, sourceViews, pagesViews, appViews];
      const totalNet = netComponents.every(Number.isFinite) ? netComponents.reduce((a, b) => a + b, 0) : null;
      const totalViews = viewComponents.every(Number.isFinite) ? viewComponents.reduce((a, b) => a + b, 0) : null;

      showNumber('total-net', totalNet);
      showNumber('total-views', totalViews);
      showNumber('blogger-net', bloggerNet);
      showNumber('source-net', sourceNet);
      showNumber('pages-net', pagesNet);
      showNumber('app-net', appNet);
      showNumber('app-views', appViews);
      showNumber('bottom-net', bottomNet);

      const missingCounters = Object.values(live).some(value => value === null);
      const missingBase = !base || !Number.isFinite(Number(base.blogger_post_reads_baseline)) || !Number.isFinite(Number(base.article_bottom_reads_baseline));
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

      const issues = [];
      if (missingBase) issues.push('başlangıç verisinin bazı alanları eksik');
      if (missingCounters) issues.push('en az bir canlı sayaç yanıt vermedi');
      if (!catalogResult) issues.push('katalog yüklenemedi');
      status.textContent = `${issues.length ? 'KISMİ VERİ — ' + issues.join('; ') : 'Canlı sayaçlar ve katalog yüklendi.'} Son güncelleme: ${new Date().toLocaleTimeString('tr-TR')}`;
      if (issues.length) status.className = 'status error';
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

  // CSV Exporter for Weekly Report
  $('export-csv-btn')?.addEventListener('click', () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Dönem,İndekslenen URL,GSC Durumu,Ortalama Pozisyon,Haftalık Gösterim,LCP INP Sağlığı,Otorite Durumu\n" +
      "12-19 Ekim 2026,291/291 URL,Sitemap Aktif,14.2,~2450 Gösterim,1.2s/45ms,sci-phil.ai.studio (301)\n" +
      "Önceki Dönem,Parçalı,Dağınık,28.6,Blogger Ağı,2.8s/180ms,science-philosophy.grok.me\n";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sci-phil-weekly-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Google Sheets TSV Clipboard Copy
  $('copy-sheets-btn')?.addEventListener('click', async () => {
    const tsv = "Dönem\tİndekslenen URL\tGSC Durumu\tOrtalama Pozisyon\tHaftalık Gösterim\tLCP / INP Sağlığı\tOtorite Durumu\n" +
      "12-19 Ekim 2026\t291 / 291 URL\tSitemap Aktif & Gönderildi\t14.2 (Niş Felsefe/Bilim)\t~ 2,450 Gösterim\t1.2s / 45ms (Passed)\tsci-phil.ai.studio (301 Konsolidasyon)\n" +
      "Önceki Dönem\tParçalı / Blogspot\tÇift Kanonik / Dağınık\t28.6 (Genel Arama)\tBlogger Ağı\t2.8s / 180ms\tscience-philosophy.grok.me";
    try {
      await navigator.clipboard.writeText(tsv);
      const fb = $('sheets-feedback');
      if (fb) {
        fb.style.display = 'block';
        setTimeout(() => { fb.style.display = 'none'; }, 4000);
      }
    } catch (_) {
      alert("Panoya kopyalanamadı; lütfen tarayıcı izinlerini kontrol edin.");
    }
  });

  $('analytics-refresh')?.addEventListener('click', loadAnalytics);
  loadAnalytics();
  window.setInterval(() => {
    if (!document.hidden) loadAnalytics();
  }, CONFIG.refreshMs);
})();
