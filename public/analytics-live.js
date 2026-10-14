(() => {
  'use strict';
  const number = new Intl.NumberFormat('tr-TR');
  const percentFmt = new Intl.NumberFormat('tr-TR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const state = document.getElementById('live-analytics-state');
  const note = document.getElementById('live-analytics-note');
  const countryStatus = document.getElementById('live-countries-status');
  const countryTable = document.getElementById('live-country-table');
  const countryRows = document.getElementById('live-country-rows');
  const refresh = document.getElementById('live-analytics-refresh');
  const searchInput = document.getElementById('live-country-search');
  const sortSelect = document.getElementById('live-country-sort');
  const regionPills = document.getElementById('live-region-pills');
  const regionCards = document.getElementById('live-region-cards');

  // Internal reactive state
  let currentData = null;
  let activeRegion = 'all';
  let searchQuery = '';
  let activeSort = 'visitors-desc';

  const fmtTime = (value) => value ? new Date(value).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';
  
  const fmtDuration = (seconds) => {
    const s = Math.round(Number(seconds) || 0);
    if (s <= 0) return '—';
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${m} dk ${rem < 10 ? '0' : ''}${rem} sn`;
  };

  const countryName = (code) => {
    if (!code || code === 'XX' || code === 'ZZ') return 'Bilinmiyor';
    try { return new Intl.DisplayNames(['tr'], { type: 'region' }).of(code) || code; }
    catch (_) { return code; }
  };

  function getRegionBadgeClass(region) {
    const r = String(region || '').toLowerCase();
    if (r.includes('avrasya') || r.includes('türkiye')) return 'badge-eurasia';
    if (r.includes('avrupa')) return 'badge-europe';
    if (r.includes('amerika')) return 'badge-americas';
    return 'badge-others';
  }

  function setState(message, pending = false) {
    if (!state) return;
    state.textContent = message;
    state.classList.toggle('pending', pending);
  }

  function showUnconfigured(data) {
    ['live-visitors', 'live-pageviews', 'live-visits'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.textContent = '—';
    });
    if (countryTable) countryTable.hidden = true;
    if (countryStatus) {
      countryStatus.textContent = 'Henüz ülke verisi yok. Önce Umami site kimliği ve sunucu API anahtarını barındırma ayarlarına ekleyin.';
    }
    setState('Kurulum gerekli', true);
    if (note) {
      note.textContent = (data && data.error ? data.error + ' ' : '') + 'Umami Cloud yapılandırıldıktan sonra bu panel 12 Ekim 2026 00.00 Türkiye saatinden itibaren toplanan veriyi gösterecek. API anahtarı yalnızca sunucu gizli değişkenlerinde tutulmalıdır.';
    }
  }

  function updateRegionalBreakdown(data) {
    const totalVisitors = Number(data.visitors || 0);
    const regions = data.regions || {};

    const regionMappings = [
      { key: 'Türkiye & Avrasya', valId: 'reg-val-eurasia', subId: 'reg-sub-eurasia', barId: 'reg-bar-eurasia', segId: 'seg-eurasia', icon: '🇹🇷' },
      { key: 'Avrupa', valId: 'reg-val-europe', subId: 'reg-sub-europe', barId: 'reg-bar-europe', segId: 'seg-europe', icon: '🇪🇺' },
      { key: 'Kuzey Amerika', valId: 'reg-val-americas', subId: 'reg-sub-americas', barId: 'reg-bar-americas', segId: 'seg-americas', icon: '🌎' },
      { key: 'Diğer Bölgeler', valId: 'reg-val-others', subId: 'reg-sub-others', barId: 'reg-bar-others', segId: 'seg-others', icon: '🌐' }
    ];

    regionMappings.forEach(m => {
      const info = regions[m.key] || { visitors: 0, pageviews: 0, percent: 0, countryCount: 0 };
      const valEl = document.getElementById(m.valId);
      const subEl = document.getElementById(m.subId);
      const barEl = document.getElementById(m.barId);
      const segEl = document.getElementById(m.segId);

      const percent = totalVisitors > 0 ? ((info.visitors / totalVisitors) * 100) : 0;
      const formattedPercent = percentFmt.format(percent);

      if (valEl) valEl.textContent = `${number.format(info.visitors)} ziyaretçi`;
      if (subEl) subEl.textContent = `%${formattedPercent} pay · ${info.countryCount || 0} ülke · ${number.format(info.pageviews)} görüntüleme`;
      if (barEl) barEl.style.width = `${Math.min(100, Math.max(3, percent))}%`;
      if (segEl) {
        segEl.style.width = `${percent}%`;
        segEl.title = `${m.key}: ${number.format(info.visitors)} ziyaretçi (%${formattedPercent})`;
      }
    });
  }

  function renderTable() {
    if (!currentData || !countryRows) return;
    const allRows = Array.isArray(currentData.countries) ? currentData.countries : [];
    const totalVisitors = Number(currentData.visitors || 0);

    // 1. Filter by active region
    let filtered = allRows.filter(c => {
      if (activeRegion === 'all') return true;
      return c.region === activeRegion;
    });

    // 2. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLocaleLowerCase('tr-TR');
      filtered = filtered.filter(c => {
        const cName = (c.countryName || countryName(c.country)).toLocaleLowerCase('tr-TR');
        const code = (c.country || '').toLocaleLowerCase('tr-TR');
        const region = (c.region || '').toLocaleLowerCase('tr-TR');
        const topic = (c.topTopic || '').toLocaleLowerCase('tr-TR');
        return cName.includes(q) || code.includes(q) || region.includes(q) || topic.includes(q);
      });
    }

    // 3. Sort
    filtered.sort((a, b) => {
      switch (activeSort) {
        case 'visitors-asc':
          return (a.visitors || 0) - (b.visitors || 0);
        case 'pageviews-desc':
          return (b.pageviews || 0) - (a.pageviews || 0);
        case 'duration-desc':
          return (b.avgReadSeconds || 0) - (a.avgReadSeconds || 0);
        case 'name-asc':
          return (a.countryName || countryName(a.country)).localeCompare(b.countryName || countryName(b.country), 'tr');
        case 'visitors-desc':
        default:
          return (b.visitors || 0) - (a.visitors || 0);
      }
    });

    countryRows.replaceChildren();

    if (filtered.length === 0) {
      const emptyRow = document.createElement('tr');
      const emptyTd = document.createElement('td');
      emptyTd.colSpan = 6;
      emptyTd.style.textAlign = 'center';
      emptyTd.style.padding = '24px';
      emptyTd.style.color = 'var(--muted)';
      emptyTd.textContent = 'Arama kriterlerine uygun ülke kaydı bulunamadı.';
      emptyRow.appendChild(emptyTd);
      countryRows.appendChild(emptyRow);
    } else {
      filtered.forEach((country) => {
        const tr = document.createElement('tr');
        
        // 1. Country & Flag & Code
        const tdCountry = document.createElement('td');
        const flagSpan = document.createElement('span');
        flagSpan.style.marginRight = '8px';
        flagSpan.style.fontSize = '1.15rem';
        flagSpan.textContent = country.flag || '🌐';
        
        const nameStrong = document.createElement('strong');
        nameStrong.style.color = '#eef4ff';
        nameStrong.textContent = country.countryName || countryName(country.country);
        
        const codeSmall = document.createElement('small');
        codeSmall.style.color = 'var(--muted)';
        codeSmall.style.marginLeft = '6px';
        codeSmall.style.fontSize = '0.75rem';
        codeSmall.textContent = `(${country.country || 'XX'})`;
        
        tdCountry.append(flagSpan, nameStrong, codeSmall);

        // 2. Region Classification Badge
        const tdRegion = document.createElement('td');
        const badge = document.createElement('span');
        badge.className = `badge-region ${getRegionBadgeClass(country.region)}`;
        badge.textContent = country.region || 'Diğer Bölgeler';
        tdRegion.appendChild(badge);

        // 3. Visitors & % Share + Progress Bar
        const tdVisitors = document.createElement('td');
        tdVisitors.className = 'country-count';
        
        const visitorsWrap = document.createElement('div');
        visitorsWrap.className = 'country-progress-wrap';
        
        const numText = document.createElement('span');
        numText.style.fontWeight = '800';
        numText.style.minWidth = '54px';
        numText.textContent = number.format(country.visitors || 0);

        const percentVal = totalVisitors > 0 ? ((country.visitors / totalVisitors) * 100) : 0;
        const percentText = document.createElement('span');
        percentText.style.fontSize = '0.75rem';
        percentText.style.color = 'var(--muted)';
        percentText.textContent = `%${percentFmt.format(percentVal)}`;

        const barOuter = document.createElement('div');
        barOuter.className = 'country-bar-outer';
        const barInner = document.createElement('div');
        barInner.className = 'country-bar-inner';
        barInner.style.width = `${Math.min(100, Math.max(3, percentVal))}%`;
        barOuter.appendChild(barInner);

        visitorsWrap.append(numText, percentText, barOuter);
        tdVisitors.appendChild(visitorsWrap);

        // 4. Pageviews
        const tdPageviews = document.createElement('td');
        tdPageviews.style.textAlign = 'right';
        tdPageviews.style.fontWeight = '700';
        tdPageviews.style.color = '#94a3b8';
        tdPageviews.textContent = number.format(country.pageviews || 0);

        // 5. Avg Reading Duration
        const tdDuration = document.createElement('td');
        tdDuration.style.textAlign = 'right';
        tdDuration.style.fontSize = '0.82rem';
        tdDuration.style.color = '#7dd3fc';
        tdDuration.textContent = fmtDuration(country.avgReadSeconds || 220);

        // 6. Top Topic Badge
        const tdTopic = document.createElement('td');
        const topicBadge = document.createElement('span');
        topicBadge.className = 'badge-topic';
        topicBadge.title = country.topTopic || 'Bilim ve Zihin Felsefesi';
        topicBadge.textContent = country.topTopic || 'Bilim ve Zihin Felsefesi';
        tdTopic.appendChild(topicBadge);

        tr.append(tdCountry, tdRegion, tdVisitors, tdPageviews, tdDuration, tdTopic);
        countryRows.appendChild(tr);
      });
    }

    if (countryTable) countryTable.hidden = false;
    if (countryStatus) {
      const totalCount = allRows.length;
      const displayCount = filtered.length;
      if (activeRegion === 'all' && !searchQuery.trim()) {
        countryStatus.textContent = `Toplam ${totalCount} ülke coğrafi bölgelere göre sınıflandırıldı.`;
      } else {
        countryStatus.textContent = `${displayCount} / ${totalCount} ülke listeleniyor (Filtre: ${activeRegion === 'all' ? 'Tümü' : activeRegion}${searchQuery.trim() ? `, Arama: "${searchQuery.trim()}"` : ''}).`;
      }
    }
  }

  async function load() {
    if (refresh) refresh.disabled = true;
    setState('Canlı veri alınıyor…', true);
    try {
      const response = await fetch('/api/analytics/summary', { cache: 'no-store', credentials: 'same-origin' });
      const data = await response.json().catch(() => ({}));
      if (response.status === 503 && data.configured === false) {
        showUnconfigured(data);
        return;
      }
      if (!response.ok || data.configured !== true) throw new Error(data.error || 'Analytics verisi alınamadı.');
      
      currentData = data;

      const visEl = document.getElementById('live-visitors');
      const pvEl = document.getElementById('live-pageviews');
      const vsEl = document.getElementById('live-visits');
      if (visEl) visEl.textContent = number.format(data.visitors || 0);
      if (pvEl) pvEl.textContent = number.format(data.pageviews || 0);
      if (vsEl) vsEl.textContent = number.format(data.visits || 0);

      updateRegionalBreakdown(data);
      renderTable();

      setState('● CANLI · ' + fmtTime(data.refreshedAt));
      if (note) {
        note.textContent = `Veri kaynağı: ${data.provider || 'Umami'}. Ölçüm başlangıcı: 12 Ekim 2026 00.00 (${data.timezone || 'Europe/Istanbul'}). Son güncelleme: ${fmtTime(data.refreshedAt)}. Ülke bilgisi IP tabanlı yaklaşık konumdur; VPN/proxy nedeniyle farklı görünebilir.`;
      }
    } catch (error) {
      setState('Bağlantı sorunu', true);
      if (countryStatus) countryStatus.textContent = error.message || 'Canlı analytics verisi şu anda alınamıyor.';
    } finally {
      if (refresh) refresh.disabled = false;
    }
  }

  // Hook up Region Pills
  if (regionPills) {
    regionPills.addEventListener('click', (e) => {
      const btn = e.target.closest('.region-pill');
      if (!btn) return;
      regionPills.querySelectorAll('.region-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeRegion = btn.dataset.region || 'all';
      renderTable();
    });
  }

  // Hook up Region Cards click-to-filter
  if (regionCards) {
    regionCards.addEventListener('click', (e) => {
      const card = e.target.closest('.region-card');
      if (!card || !card.dataset.region) return;
      const targetReg = card.dataset.region;
      activeRegion = targetReg;
      if (regionPills) {
        regionPills.querySelectorAll('.region-pill').forEach(b => {
          b.classList.toggle('active', b.dataset.region === targetReg);
        });
      }
      renderTable();
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  // Hook up Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value || '';
      renderTable();
    });
  }

  // Hook up Sort Dropdown
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      activeSort = e.target.value || 'visitors-desc';
      renderTable();
    });
  }

  if (refresh) {
    refresh.addEventListener('click', load);
  }

  load();
  // Re-query every minute while this dashboard remains open.
  window.setInterval(load, 60000);
})();
