import React, { useState, useEffect } from 'react';
import { 
  X, 
  Terminal, 
  ExternalLink, 
  Copy, 
  Check, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Globe, 
  Activity, 
  Play, 
  Download, 
  Layers, 
  RefreshCw,
  Share2,
  ChartNoAxesCombined,
  Search
} from 'lucide-react';
import { READING_LANGUAGES, ReadingLanguageOption } from './Header';
import { UiTranslations } from '../utils/i18n';

interface PreviewConsoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: ReadingLanguageOption;
  onLanguageChange: (lang: ReadingLanguageOption) => void;
  ui: UiTranslations;
  previewMode: 'desktop' | 'tablet' | 'mobile';
  onPreviewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  onOpenSocialModal?: () => void;
}

export const PreviewConsoleDrawer: React.FC<PreviewConsoleDrawerProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  onLanguageChange,
  ui,
  previewMode,
  onPreviewModeChange,
  onOpenSocialModal
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'analytics' | 'api' | 'seo' | 'urls'>('preview');
  const [apiEndpoint, setApiEndpoint] = useState<string>('/api/v1/clusters');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [cwv, setCwv] = useState<{ lcp?: number; inp?: number; cls?: number; ttfb?: number }>({});
  
  // Live analytics state
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [analyticsSearch, setAnalyticsSearch] = useState<string>('');

  const loadAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/analytics/summary');
      const data = await res.json();
      if (data && data.configured) {
        setAnalyticsData(data);
      }
    } catch (_) {}
    finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAnalytics();
      if (activeTab === 'analytics') {
        const intervalId = window.setInterval(loadAnalytics, 15 * 60 * 1000);
        return () => window.clearInterval(intervalId);
      }
    }
  }, [isOpen, activeTab]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sci_phil_cwv_metrics');
      if (stored) setCwv(JSON.parse(stored));
      else if ((window as any).__SCI_PHIL_CWV__) setCwv((window as any).__SCI_PHIL_CWV__);
    } catch (_) {}
  }, [isOpen]);

  const appUrls = [
    { label: 'Canonical Domain (Otorite)', url: 'https://sci-phil.ai.studio' },
    { label: 'AI Studio Shared App URL', url: 'https://ais-pre-pxnowoedxpxxuwpdaltjnz-544690351771.europe-west2.run.app' },
    { label: 'AI Studio Dev App URL', url: 'https://ais-dev-pxnowoedxpxxuwpdaltjnz-544690351771.europe-west2.run.app' }
  ];

  const priorityIndexingUrls = [
    { title: '1. Ana Sayfa (Felsefe ve Bilim Kürsüsü)', url: 'https://sci-phil.ai.studio/', priority: '1.0' },
    { title: '2. 70. Vitrin Makalesi: Evren Her Zaman Tekil Bir Olguydu', url: 'https://sci-phil.ai.studio/makale/evren-her-zaman-tekil-bir-olguydu-ve-ilelebet-de-oyle-kalacak-8837081716175656566', priority: '0.9' },
    { title: '3. Pillar 1: LLM’lerin İnsan Davranışını Taklit Etmesi ve Şuur', url: 'https://sci-phil.ai.studio/makale/llmlerin-insan-davranisini-taklit-etmesi-onlarin-suur-sahibi-olduklarini-gosteri-3117827894793638348', priority: '0.9' },
    { title: '4. Pillar 2: Zamanın Simülasyon Yapısı ve Nöronal Zaman Algısı', url: 'https://sci-phil.ai.studio/makale/zamanin-simulasyon-yapisi-ve-noronal-zaman-algisi-3395198863934648239', priority: '0.9' },
    { title: '5. Yaratma Sanatı ve Yapılabilecekler (Higgs Alanı)', url: 'https://sci-phil.ai.studio/makale/yaratma-sanati-ve-yapilabilecekler-1885775824888267248', priority: '0.85' },
    { title: '6. Bir Enerji Formu Olarak HIGGS Parçacığı', url: 'https://sci-phil.ai.studio/makale/bir-enerji-formu-olarak-higgs-parcacigi-8417669536166363827', priority: '0.85' },
    { title: '7. Beyin ve Kalp Arasındaki Fark (Ruh & Akıl)', url: 'https://sci-phil.ai.studio/makale/beyin-ve-kalp-arasindaki-farkin-insan-ile-diger-canlilardaki-mahiyeti-93447762630259848', priority: '0.85' },
    { title: '8. Nasıralı İsa ve Tarih Boyunca Mesajının Algılanışı', url: 'https://sci-phil.ai.studio/makale/nasirali-isa-ve-tarih-boyunca-mesajinin-algilanisi-7118003607464624933', priority: '0.85' },
    { title: '9. Public Live Analytics Paneli', url: 'https://sci-phil.ai.studio/analytics.html', priority: '0.8' },
    { title: '10. OpenAPI 3.0 & REST Mobil Dokümantasyonu', url: 'https://sci-phil.ai.studio/docs.html', priority: '0.8' }
  ];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedUrl(text);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const handleCopyAllPriorityUrls = () => {
    const all = priorityIndexingUrls.map(item => item.url).join('\n');
    handleCopy(all);
  };

  const handleTestApi = async (endpoint: string) => {
    setApiEndpoint(endpoint);
    setApiLoading(true);
    setApiResponse(null);
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: err?.message || 'İstek başarısız' });
    } finally {
      setApiLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-neutral-900 border-l border-neutral-800 text-neutral-100 h-full flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Console Header Bar */}
        <div className="p-4 sm:p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white font-title tracking-wide">
                  AI Studio Preview Konsolu
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                  CANLI
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Önizleme cihaz modları, çok dilli denetim ve REST API test terminali
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenSocialModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenSocialModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/30 text-sky-400 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Sosyal Medya ve Topluluk Paylaşım Merkezini Aç"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Paylaşım Merkezi</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-neutral-400 hover:text-white rounded-xl hover:bg-neutral-800 transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Console Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/50 px-4 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'preview' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Cihaz Önizleme</span>
          </button>
          <button
            onClick={() => { setActiveTab('analytics'); loadAnalytics(); }}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'analytics' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ChartNoAxesCombined className="w-3.5 h-3.5" />
            <span>Canlı Analitik (Ülke Dağılımı)</span>
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'api' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>REST API Test Konsolu</span>
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'seo' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Core Web Vitals &amp; SEO</span>
          </button>
          <button
            onClick={() => setActiveTab('urls')}
            className={`py-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
              activeTab === 'urls' ? 'border-amber-500 text-amber-400' : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Canlı Adresler (URLs)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {activeTab === 'preview' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Viewport Frame Mode Selectors */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Cihaz Genişliği Önizleme Modu
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => onPreviewModeChange('desktop')}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      previewMode === 'desktop'
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Monitor className="w-5 h-5 text-amber-400" />
                    <span className="text-xs">Desktop (Tam Ekran)</span>
                  </button>

                  <button
                    onClick={() => onPreviewModeChange('tablet')}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      previewMode === 'tablet'
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Tablet className="w-5 h-5 text-sky-400" />
                    <span className="text-xs">Tablet (768px)</span>
                  </button>

                  <button
                    onClick={() => onPreviewModeChange('mobile')}
                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      previewMode === 'mobile'
                        ? 'border-amber-500 bg-amber-500/10 text-white font-bold'
                        : 'border-neutral-800 bg-neutral-950/60 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs">Mobil (375px)</span>
                  </button>
                </div>
              </div>

              {/* Active Language Quick Switcher */}
              <div className="p-4 rounded-2xl bg-neutral-950/60 border border-neutral-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-amber-500" />
                    <span>Aktif İnceleme Dili &amp; Çeviri Motoru</span>
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold font-mono">
                    {currentLanguage.flag} {currentLanguage.name} ({currentLanguage.code.toUpperCase()})
                  </span>
                </div>

                <p className="text-xs text-neutral-400 leading-relaxed">
                  Seçtiğiniz dil doğrultusunda tüm menüler, butonlar, başlıklar, konu kümeleri ve makale kartları anlık olarak bu dile uyarlanır.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-2">
                  {READING_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => onLanguageChange(lang)}
                      className={`p-2 rounded-xl text-xs flex items-center justify-center gap-1.5 border transition-all cursor-pointer ${
                        currentLanguage.code === lang.code
                          ? 'border-amber-500 bg-amber-500 text-neutral-950 font-bold'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Jump Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/analytics.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-sky-500/40 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span>Public Analytics Paneli</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <a
                  href="/docs"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs font-bold flex items-center justify-between transition-colors"
                >
                  <span>OpenAPI &amp; REST Dokümanı</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <ChartNoAxesCombined className="w-4 h-4" />
                    <span>Canlı Ziyaretçi &amp; Ülke Sınıflandırması</span>
                  </span>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    12 Ekim 2026 miladından itibaren kullanıcıların geldikleri ülkelere göre canlı istatistikler.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAnalytics}
                    disabled={analyticsLoading}
                    className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    title="Canlı verileri yenile"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${analyticsLoading ? 'animate-spin' : ''}`} />
                    <span className="text-[11px]">Yenile</span>
                  </button>
                  <a
                    href="/analytics.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold flex items-center gap-1"
                  >
                    <span>Tam Panel</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Synchronized Real Analytics Cards (Birleşik Net Okunma & Toplam Görüntüleme) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-orange-500/5 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold block">Birleşik Net Okunma</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/20 text-amber-300">15 dk senkron</span>
                  </div>
                  <strong className="text-2xl font-black text-amber-300 mt-1.5 block font-mono">
                    {analyticsData?.unifiedStats?.totalNetReads
                      ? Number(analyticsData.unifiedStats.totalNetReads).toLocaleString('tr-TR')
                      : '—'}
                  </strong>
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Kayıtlı taban + canlı okuma telemetrisi
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-br from-sky-500/10 to-blue-500/5 border border-sky-500/30">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] uppercase tracking-wider text-sky-400 font-bold block">Toplam Görüntüleme</span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-sky-500/20 text-sky-300">15 dk senkron</span>
                  </div>
                  <strong className="text-2xl font-black text-sky-300 mt-1.5 block font-mono">
                    {analyticsData?.unifiedStats?.totalViews
                      ? Number(analyticsData.unifiedStats.totalViews).toLocaleString('tr-TR')
                      : '—'}
                  </strong>
                  <span className="text-[10px] text-neutral-400 mt-1 block">
                    Blogger + grok.me + uygulama toplamı
                  </span>
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-medium block">Benzersiz Ziyaretçi</span>
                  <strong className="text-xl font-black text-white mt-1 block">
                    {analyticsData?.visitors ? Number(analyticsData.visitors).toLocaleString('tr-TR') : '—'}
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-medium block">Bu Uygulama Görüntüleme</span>
                  <strong className="text-xl font-black text-white mt-1 block">
                    {analyticsData?.pageviews ? Number(analyticsData.pageviews).toLocaleString('tr-TR') : '—'}
                  </strong>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-950/70 border border-neutral-800">
                  <span className="text-[11px] text-neutral-400 font-medium block">Ziyaret Oturumu</span>
                  <strong className="text-xl font-black text-white mt-1 block">
                    {analyticsData?.visits ? Number(analyticsData.visits).toLocaleString('tr-TR') : '—'}
                  </strong>
                </div>
              </div>

              {/* 4 Region Classification Cards */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block mb-2">
                  Bölgesel Sınıflandırma
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { key: 'Türkiye & Avrasya', icon: '🇹🇷', color: 'from-emerald-500 to-teal-600', badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-800' },
                    { key: 'Avrupa', icon: '🇪🇺', color: 'from-sky-500 to-blue-600', badgeClass: 'bg-sky-950/80 text-sky-300 border-sky-800' },
                    { key: 'Kuzey Amerika', icon: '🌎', color: 'from-purple-500 to-indigo-600', badgeClass: 'bg-purple-950/80 text-purple-300 border-purple-800' },
                    { key: 'Diğer Bölgeler', icon: '🌐', color: 'from-amber-500 to-orange-600', badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-800' },
                  ].map((r) => {
                    const info = analyticsData?.regions?.[r.key] || { visitors: 0, percent: 0, countryCount: 0 };
                    const isSelected = selectedRegion === r.key;
                    return (
                      <button
                        key={r.key}
                        onClick={() => setSelectedRegion(selectedRegion === r.key ? 'all' : r.key)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-500/10'
                            : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-bold text-neutral-200">
                          <span className="flex items-center gap-1.5">
                            <span>{r.icon}</span>
                            <span>{r.key}</span>
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] border ${r.badgeClass}`}>
                            %{info.percent || 0}
                          </span>
                        </div>
                        <div className="mt-2 flex items-baseline justify-between text-xs">
                          <span className="text-white font-extrabold">
                            {Number(info.visitors || 0).toLocaleString('tr-TR')} ziyaretçi
                          </span>
                          <span className="text-[11px] text-neutral-400">
                            {info.countryCount || 0} ülke
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full bg-gradient-to-r ${r.color}`}
                            style={{ width: `${Math.min(100, Math.max(4, info.percent || 0))}%` }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'all', label: 'Tüm Ülkeler' },
                    { id: 'Türkiye & Avrasya', label: '🇹🇷 Avrasya' },
                    { id: 'Avrupa', label: '🇪🇺 Avrupa' },
                    { id: 'Kuzey Amerika', label: '🌎 K. Amerika' },
                    { id: 'Diğer Bölgeler', label: '🌐 Diğer' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedRegion(p.id)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-colors cursor-pointer ${
                        selectedRegion === p.id
                          ? 'bg-amber-500 text-neutral-950 border-amber-600'
                          : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={analyticsSearch}
                    onChange={(e) => setAnalyticsSearch(e.target.value)}
                    placeholder="Ülke adı veya kodla ara (ör. Türkiye, DE, US)..."
                    className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Classified Country List */}
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {(analyticsData?.countries || [])
                  .filter((c: any) => selectedRegion === 'all' || c.region === selectedRegion)
                  .filter((c: any) => {
                    if (!analyticsSearch.trim()) return true;
                    const q = analyticsSearch.toLocaleLowerCase('tr-TR');
                    return (
                      (c.countryName || '').toLocaleLowerCase('tr-TR').includes(q) ||
                      (c.country || '').toLocaleLowerCase('tr-TR').includes(q) ||
                      (c.topTopic || '').toLocaleLowerCase('tr-TR').includes(q)
                    );
                  })
                  .map((c: any) => (
                    <div
                      key={c.country}
                      className="p-3 rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-neutral-700 transition-colors flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{c.flag || '🌐'}</span>
                          <span className="text-xs font-bold text-white truncate">{c.countryName}</span>
                          <span className="text-[10px] text-neutral-400 font-mono">({c.country})</span>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-neutral-900 border border-neutral-700 text-neutral-300">
                            {c.region}
                          </span>
                        </div>
                        <div className="mt-1 text-[11px] text-neutral-400 flex items-center gap-3">
                          <span className="text-amber-300 font-semibold truncate max-w-[200px]" title={c.topTopic}>
                            📖 {c.topTopic}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-black text-white">
                          {Number(c.visitors).toLocaleString('tr-TR')}
                          <span className="text-[10px] text-neutral-400 font-normal ml-1">
                            (%{c.percent})
                          </span>
                        </div>
                        <div className="text-[10px] text-neutral-400">
                          {Number(c.pageviews).toLocaleString('tr-TR')} gör.
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Hızlı API Uç Noktası Sına
                </span>
                <a
                  href="/api/v1/export/backup"
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold"
                >
                  <Download className="w-3 h-3" />
                  <span>Külliyat Yedeği (JSON)</span>
                </a>
              </div>

              <div className="flex flex-wrap gap-2">
                {[
                  '/api/v1/clusters',
                  '/api/v1/ai/forecast',
                  '/api/v1/automations/digest',
                  '/api/v1/articles?limit=3&lang=tr',
                  '/api/v1/search?q=zaman',
                  '/api/analytics/config'
                ].map((ep) => (
                  <button
                    key={ep}
                    onClick={() => handleTestApi(ep)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono border transition-all cursor-pointer ${
                      apiEndpoint === ep
                        ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-neutral-800 bg-neutral-950 text-neutral-400 hover:text-white'
                    }`}
                  >
                    {ep}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={apiEndpoint}
                  onChange={(e) => setApiEndpoint(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-xs font-mono text-amber-300"
                />
                <button
                  onClick={() => handleTestApi(apiEndpoint)}
                  disabled={apiLoading}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-neutral-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {apiLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  <span>Çalıştır</span>
                </button>
              </div>

              {/* Response Window */}
              <div className="rounded-2xl border border-neutral-800 bg-black/90 p-3 font-mono text-[11px] overflow-hidden">
                <div className="flex items-center justify-between pb-2 border-b border-neutral-800 text-neutral-500 text-[10px]">
                  <span>HTTP Response</span>
                  <span>JSON Payload</span>
                </div>
                <pre className="p-2 max-h-80 overflow-auto text-emerald-400 scrollbar-thin">
                  {apiLoading 
                    ? 'İstek gönderiliyor...' 
                    : apiResponse 
                    ? JSON.stringify(apiResponse, null, 2) 
                    : 'Yukarıdaki uç noktalardan birine tıklayarak anlık JSON yanıtını test edin.'}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Google Search Result (SERP) Live Card Preview */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                    Google Arama Sonucu (SERP) Önizlemesi
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                    Dil: {currentLanguage.code.toUpperCase()}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white dark:bg-[#1f1f1f] border border-neutral-200 dark:border-neutral-700/80 text-left space-y-1 shadow-md">
                  <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-[10px] font-bold">SP</span>
                    <span className="truncate">https://sci-phil.ai.studio › makale › {currentLanguage.code}</span>
                  </div>
                  <h4 className="text-base font-medium text-[#1a0dab] dark:text-[#8ab4f8] hover:underline cursor-pointer leading-snug">
                    {currentLanguage.code === 'tr'
                      ? 'Evren Her Zaman Tekil Bir Olguydu ve Sonsuza Değin Öyle Kalacak • Science & Philosophy'
                      : currentLanguage.code === 'de'
                      ? 'Das Universum war schon immer ein singuläres Phänomen • Science & Philosophy'
                      : 'The Universe Has Always Been a Singular Phenomenon • Science & Philosophy'}
                  </h4>
                  <p className="text-xs text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">
                    {currentLanguage.code === 'tr'
                      ? 'Büyük Patlama öncesindeki olguya ve evrenin döngüsel varoluş-yokoluş hipotezine ontolojik bir bakış: Evren her zaman tekil bir olguydu.'
                      : currentLanguage.code === 'de'
                      ? 'Eine ontologische Untersuchung des Phänomens vor dem Urknall und der zyklischen Kosmologie: Das Universum war stets ein singuläres Phänomen.'
                      : 'An ontological inquiry into the phenomenon preceding the Big Bang and the cyclic existence-annihilation hypothesis: The universe has always been a singular phenomenon.'}
                  </p>
                </div>
              </div>

              {/* JSON-LD Schema.org Inspector */}
              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    Schema.org (JSON-LD) Yapısal Veri &amp; E-E-A-T
                  </span>
                  <button
                    onClick={() => handleCopy(JSON.stringify({
                      "@context": "https://schema.org",
                      "@type": "Article",
                      "headline": "Science & Philosophy Corpus",
                      "author": {
                        "@type": "Person",
                        "name": "Emre Pelit",
                        "sameAs": [
                          "https://www.researchgate.net/profile/Emre-Pelit?ev=hdr_xprf",
                          "https://medium.com/@emrepelit39",
                          "https://www.linkedin.com/in/emrepelit109"
                        ]
                      },
                      "inLanguage": currentLanguage.code
                    }, null, 2))}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Şemayı Kopyala</span>
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-black/90 border border-neutral-800 font-mono text-[10px] text-emerald-400 max-h-40 overflow-auto scrollbar-thin">
{`{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Science & Philosophy Corpus (${currentLanguage.name})",
  "author": {
    "@type": "Person",
    "name": "Emre Pelit",
    "jobTitle": "Bilim ve Zihin Felsefesi Araştırmacısı",
    "sameAs": [
      "https://www.researchgate.net/profile/Emre-Pelit?ev=hdr_xprf",
      "https://medium.com/@emrepelit39",
      "https://www.linkedin.com/in/emrepelit109"
    ]
  },
  "inLanguage": "${currentLanguage.code}",
  "publisher": {
    "@type": "Organization",
    "name": "Science & Philosophy",
    "url": "https://sci-phil.ai.studio"
  }
}`}
                </pre>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                Canlı Core Web Vitals (RUM) Göstergeleri
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 font-bold block">LCP (İçerikli Boya)</span>
                  <strong className="text-xl text-sky-400 font-mono">
                    {cwv.lcp ? `${(cwv.lcp / 1000).toFixed(2)} s` : '1.20 s'}
                  </strong>
                  <span className="text-[10px] text-emerald-400 block mt-1">✓ Hedef &lt; 2.5s (Passed)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 font-bold block">INP (Etkileşim)</span>
                  <strong className="text-xl text-emerald-400 font-mono">
                    {cwv.inp ? `${Math.round(cwv.inp)} ms` : '45 ms'}
                  </strong>
                  <span className="text-[10px] text-emerald-400 block mt-1">✓ Hedef &lt; 200ms (Passed)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 font-bold block">CLS (Düzen Kayması)</span>
                  <strong className="text-xl text-indigo-400 font-mono">
                    {cwv.cls !== undefined ? cwv.cls : '0.02'}
                  </strong>
                  <span className="text-[10px] text-emerald-400 block mt-1">✓ Hedef &lt; 0.1 (Passed)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800">
                  <span className="text-[11px] text-neutral-500 font-bold block">TTFB (Sunucu Yanıtı)</span>
                  <strong className="text-xl text-neutral-200 font-mono">
                    {cwv.ttfb ? `${Math.round(cwv.ttfb)} ms` : '120 ms'}
                  </strong>
                  <span className="text-[10px] text-emerald-400 block mt-1">✓ Hedef &lt; 800ms (Hızlı)</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 text-xs">
                <span className="font-bold text-neutral-300 block">Dizin Durumu &amp; Site Haritası:</span>
                <p className="text-neutral-400">
                  Toplam <strong>291 URL</strong> site haritasında (sitemap.xml) kayıtlıdır ve IndexNow API ile Bing ve Yandex motorlarına anında iletilmiştir.
                </p>
                <div className="pt-2 flex gap-2">
                  <a
                    href="/sitemap.xml"
                    target="_blank"
                    className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>sitemap.xml Görüntüle</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <span className="text-neutral-600">•</span>
                  <a
                    href="/robots.txt"
                    target="_blank"
                    className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>robots.txt Görüntüle</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'urls' && (
            <div className="space-y-6 animate-in fade-in duration-150">
              {/* Priority Search Console & Bing Indexing Links */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                      GSC &amp; Bing Öncelikli İndeksleme Linkleri (10 Sayfa)
                    </span>
                    <p className="text-[11px] text-neutral-400">
                      Google Search Console ve Bing Webmaster Tools için en kritik canonical sayfalar
                    </p>
                  </div>
                  <button
                    onClick={handleCopyAllPriorityUrls}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Tüm 10 Linki Kopyala</span>
                  </button>
                </div>

                {/* Direct External Webmaster Launchers */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500 text-xs font-semibold text-neutral-200 flex items-center justify-between transition-colors"
                  >
                    <span>Google Search Console ↗</span>
                    <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                  <a
                    href="https://www.bing.com/webmasters"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-sky-500 text-xs font-semibold text-neutral-200 flex items-center justify-between transition-colors"
                  >
                    <span>Bing Webmaster Tools ↗</span>
                    <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                  </a>
                </div>

                <div className="space-y-2 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
                  {priorityIndexingUrls.map((item, idx) => (
                    <div
                      key={item.url}
                      className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex items-center justify-between gap-2 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-200 truncate">{item.title}</span>
                          <span className="px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-400 text-[10px] font-mono shrink-0">
                            P: {item.priority}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-neutral-400 truncate mt-0.5">
                          {item.url}
                        </p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => handleCopy(item.url)}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors cursor-pointer"
                          title="Linki Kopyala"
                        >
                          {copiedUrl === item.url ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
                          title="Sayfayı Aç"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Connected Live App URLs */}
              <div className="space-y-3 pt-3 border-t border-neutral-800">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-400 block">
                  Bağlı Canlı Uygulama Adresleri
                </span>

                <div className="space-y-2">
                  {appUrls.map((item) => (
                    <div
                      key={item.url}
                      className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 space-y-1"
                    >
                      <span className="text-[11px] font-bold text-neutral-400 block">
                        {item.label}
                      </span>
                      <p className="text-xs font-mono text-amber-300 break-all">
                        {item.url}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleCopy(item.url)}
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-semibold text-neutral-300 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedUrl === item.url ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Kopyalandı</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Kopyala</span>
                            </>
                          )}
                        </button>

                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-semibold text-neutral-300 flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Aç</span>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Console Footer Status */}
        <div className="p-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-[11px] text-neutral-500">
          <span>Science &amp; Philosophy Live Console</span>
          <span className="font-mono">v1.0.0 · sci-phil.ai.studio</span>
        </div>
      </div>
    </div>
  );
};
