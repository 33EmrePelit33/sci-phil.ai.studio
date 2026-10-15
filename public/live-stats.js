(() => {
  'use strict';

  const CONFIG = {
    counterBase: 'https://countapi.mileshilliard.com/api/v1',
    baselineUrl: '/stats/read-baseline.json',
    fallbackBaselineUrl: 'https://raw.githubusercontent.com/emrepelit109/science-philosophy/main/stats/read-baseline.json',
    minimumReadSeconds: 10,
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
  async function json(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }
  async function getBaseline() {
    try {
      return await json(`${CONFIG.baselineUrl}?ts=${Date.now()}`);
    } catch (_) {
      return json(`${CONFIG.fallbackBaselineUrl}?ts=${Date.now()}`);
    }
  }
  async function getCounter(key) {
    try {
      const data = await json(`${CONFIG.counterBase}/get/${encodeURIComponent(key)}`);
      const value = Number(data.value);
      return Number.isFinite(value) && value >= 0 ? value : null;
    } catch (_) {
      return null;
    }
  }
  async function hit(key) {
    const data = await json(`${CONFIG.counterBase}/hit/${encodeURIComponent(key)}`);
    const value = Number(data.value);
    if (!Number.isFinite(value) || value < 0) throw new Error('Invalid counter response');
    return value;
  }
  function hostType() {
    const host = location.hostname;
    if (host === 'emrepelit7337.blogspot.com' || host.endsWith('.blogspot.com')) return 'blogger';
    if (host === 'science-philosophy.grok.me' || host === 'www.science-philosophy.grok.me') return 'source';
    if (host === 'emrepelit109.github.io') return 'pages';
    if (host === 'sci-phil.ai.studio' || host === 'www.sci-phil.ai.studio') return 'app';
    return null;
  }
  function keyFor(kind) {
    const type = hostType();
    return type ? CONFIG.counters[type + (kind === 'views' ? 'Views' : 'Net')] : null;
  }
  function storageKey() {
    return `sp:netread:${new Date().toISOString().slice(0, 10)}:${location.pathname || '/'}`;
  }
  function alreadyRead() {
    try { return localStorage.getItem(storageKey()) === '1'; } catch (_) { return false; }
  }
  function markRead() {
    try { localStorage.setItem(storageKey(), '1'); } catch (_) { /* Storage may be disabled. */ }
  }
  function initTracking() {
    if (window.__spTrackingStarted || !hostType()) return;
    window.__spTrackingStarted = true;
    const viewsKey = keyFor('views');
    if (viewsKey) hit(viewsKey).catch(() => {});
    if (alreadyRead()) return;

    let visibleSince = document.hidden ? null : Date.now();
    let visibleMilliseconds = 0;
    let timer = null;
    let counted = false;
    const count = () => {
      if (counted || alreadyRead() || document.hidden || visibleMilliseconds < CONFIG.minimumReadSeconds * 1000) return;
      const readsKey = keyFor('net');
      if (!readsKey) return;
      counted = true;
      hit(readsKey).then(markRead).catch(() => { counted = false; });
    };
    const schedule = () => {
      if (timer) clearTimeout(timer);
      const remaining = Math.max(0, CONFIG.minimumReadSeconds * 1000 - visibleMilliseconds);
      if (!document.hidden && !counted) timer = setTimeout(() => {
        if (visibleSince !== null) visibleMilliseconds += Date.now() - visibleSince;
        visibleSince = Date.now();
        count();
      }, remaining);
    };
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (visibleSince !== null) visibleMilliseconds += Date.now() - visibleSince;
        visibleSince = null;
        if (timer) clearTimeout(timer);
        timer = null;
      } else {
        visibleSince = Date.now();
        if (visibleMilliseconds >= CONFIG.minimumReadSeconds * 1000) count();
        else schedule();
      }
    });
    schedule();
  }
  function addStyle() {
    if (document.getElementById('sp-live-style')) return;
    const style = document.createElement('style');
    style.id = 'sp-live-style';
    style.textContent = '#sp-live-root{position:fixed;right:18px;bottom:18px;z-index:2147483647;font-family:system-ui,-apple-system,Segoe UI,sans-serif}#sp-live-toggle{border:0;border-radius:999px;padding:12px 16px;background:#111827;color:#fff;font-weight:800;box-shadow:0 8px 28px #0005;cursor:pointer;border:1px solid #3b82f6}#sp-live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#28d17c;margin-right:8px}#sp-live-panel{display:none;width:min(480px,calc(100vw - 36px));margin-bottom:10px;background:#0f1629;color:#eef2ff;border:1px solid #34446e;border-radius:16px;padding:14px;box-shadow:0 16px 45px #0007}#sp-live-panel.open{display:block}#sp-live-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin-top:10px}.sp-live-stat{padding:10px;border:1px solid #263555;border-radius:10px;background:#121b30}.sp-live-stat small{display:block;color:#aeb9d6;font-size:.74rem}.sp-live-stat strong{display:block;margin-top:3px;font-size:1rem}#sp-live-note{margin-top:10px;color:#aeb9d6;font-size:.78rem;line-height:1.45}.sp-live-links{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.sp-live-links a{display:block;text-align:center;padding:9px 8px;border:1px solid #34446e;background:#1d2945;color:#dfe8ff;border-radius:10px;text-decoration:none;font-weight:700;font-size:.78rem}.sp-live-links a:hover{background:#263858}#sp-live-refresh{margin-top:10px;width:100%;border:1px solid #34446e;background:#1d2945;color:#dfe8ff;border-radius:10px;padding:9px 12px;font-weight:700;cursor:pointer}';
    document.head.appendChild(style);
  }
  function readBaselineValue(baseline, key) {
    const value = baseline?.[key];
    if (value === null || value === undefined || value === '') return null;
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? number : null;
  }
  function plusLive(base, live) {
    return base === null || live === null ? null : base + live;
  }
  function show(value) { return value === null ? '—' : nf.format(value); }
  async function load(panel, status, refresh) {
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;
    refresh.disabled = true;
    status.textContent = 'Veriler alınıyor…';
    try {
      const baseline = await getBaseline();
      const names = Object.keys(CONFIG.counters);
      const values = await Promise.all(names.map(name => getCounter(CONFIG.counters[name])));
      const live = Object.fromEntries(names.map((name, index) => [name, values[index]]));
      const getBase = (key) => readBaselineValue(baseline, key);
      const bloggerNet = plusLive(getBase('blogger_post_reads_baseline'), live.bloggerNet);
      const bloggerViews = plusLive(getBase('blogger_page_views_baseline'), live.bloggerViews);
      const websiteNet = plusLive(getBase('website_web_reads_baseline'), live.sourceNet);
      const websiteViews = plusLive(getBase('website_page_views_baseline'), live.sourceViews);
      const pagesNet = plusLive(getBase('github_pages_net_read_baseline'), live.pagesNet);
      const pagesViews = plusLive(getBase('github_pages_page_views_baseline'), live.pagesViews);
      const appNet = plusLive(getBase('website_app_reads_baseline'), live.appNet);
      const appViews = plusLive(getBase('ai_studio_page_views_baseline'), live.appViews);
      const bottomNet = getBase('article_bottom_reads_baseline');
      const sum = (items) => items.some(value => value === null) ? null : items.reduce((total, value) => total + value, 0);
      const totalNet = sum([bloggerNet, websiteNet, pagesNet, appNet, bottomNet]);
      const totalViews = sum([bloggerViews, websiteViews, pagesViews, appViews]);

      panel.innerHTML = '<strong>Science &amp; Philosophy — Birleşik İstatistik</strong>' +
        '<div id="sp-live-grid">' +
        `<div class="sp-live-stat"><small>Blogger okunmaları</small><strong>${show(bloggerNet)}</strong></div>` +
        `<div class="sp-live-stat"><small>Grok.me yazı okunmaları</small><strong>${show(websiteNet)}</strong></div>` +
        `<div class="sp-live-stat"><small>Yazı altı okumalar (kayıtlı taban)</small><strong>${show(bottomNet)}</strong></div>` +
        `<div class="sp-live-stat"><small>Uygulama okunmaları</small><strong>${show(appNet)}</strong></div>` +
        `<div class="sp-live-stat"><small>BİRLEŞİK NET OKUNMA</small><strong>${show(totalNet)}</strong></div>` +
        `<div class="sp-live-stat"><small>TOPLAM GÖRÜNTÜLEME</small><strong>${show(totalViews)}</strong></div>` +
        '</div><div class="sp-live-links"><a href="https://emrepelit7337.blogspot.com/" target="_blank" rel="noopener noreferrer">Blog Ana Sayfası</a>' +
        '<a href="https://analytics.google.com/analytics/web/" target="_blank" rel="noopener noreferrer">Google Analytics</a>' +
        '<a href="/analytics.html">Public Analytics</a></div>' +
        '<div id="sp-live-note">Sayaçlar bir dakikada bir yeniden okunur. Kesinti veya eksik başlangıç verisi olduğunda ilgili değer “—” olarak gösterilir; eksik veriler sıfır varsayılmaz.</div>' +
        '<button id="sp-live-refresh" type="button">↻ Yenile</button>';
      const partial = values.some(value => value === null) || [bloggerNet, bloggerViews, websiteNet, websiteViews, pagesNet, pagesViews, appNet, appViews, bottomNet].some(value => value === null);
      status.textContent = `${partial ? '● KISMİ VERİ · ' : '● CANLI · '}${new Date().toLocaleTimeString('tr-TR')}`;
      status.style.color = partial ? '#fbbf24' : '#28d17c';
    } catch (_) {
      panel.innerHTML = '<div>Başlangıç verisi alınamadığı için istatistikler gösterilemiyor. Bağlantınızı kontrol edip yeniden deneyin.</div>';
      status.textContent = '● VERİ ALINAMADI';
      status.style.color = '#fbbf24';
    } finally {
      refresh.disabled = false;
      const newRefresh = panel.querySelector('#sp-live-refresh');
      if (newRefresh) newRefresh.addEventListener('click', () => load(panel, status, newRefresh));
      requestAnimationFrame(() => window.scrollTo({ left: scrollX, top: scrollY, behavior: 'auto' }));
    }
  }
  function mount() {
    if (document.getElementById('sp-live-root')) return;
    addStyle();
    initTracking();
    const root = document.createElement('div');
    root.id = 'sp-live-root';
    root.innerHTML = '<div id="sp-live-panel"><div id="sp-live-status">Hazır</div></div><button id="sp-live-toggle" type="button"><span id="sp-live-dot"></span>Live Stats</button>';
    document.body.appendChild(root);
    const panel = root.querySelector('#sp-live-panel');
    const toggle = root.querySelector('#sp-live-toggle');
    const status = root.querySelector('#sp-live-status');
    toggle.addEventListener('click', () => {
      const open = panel.classList.toggle('open');
      if (open) load(panel, status, panel.querySelector('#sp-live-refresh') || toggle);
    });
    setInterval(() => {
      if (panel.classList.contains('open')) load(panel, status, panel.querySelector('#sp-live-refresh') || toggle);
    }, CONFIG.refreshMs);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount, { once: true });
  else mount();
  window.SciencePhilosophyLiveStats = { mount };
})();
