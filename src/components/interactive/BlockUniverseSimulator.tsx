import React, { useState } from 'react';
import { Clock, Eye, Volume2, Zap, Sparkles, Activity, Layers, RotateCcw } from 'lucide-react';

export const BlockUniverseSimulator: React.FC = () => {
  const [spacetimeCoord, setSpacetimeCoord] = useState<number>(50); // 0 = Geçmiş, 50 = Şimdi, 100 = Gelecek
  const [stressLevel, setStressLevel] = useState<number>(20); // 0 - 100 (Adrenalin & Amigdala)
  const [viewMode, setViewMode] = useState<'block' | 'neuronal'>('neuronal');

  // Calculations based on neurobiology
  const visualLatency = 80; // ms
  const auditoryLatency = 30; // ms
  const subjectiveSpeed = Math.max(0.3, Number((1 - (stressLevel / 150)).toFixed(2))); // Zamanın öznel akış hızı katsayısı
  const memoryDensityPerSec = Math.round(15 + (stressLevel * 0.45)); // saniyede amigdala anı kare kaydı

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
            Fizik & Nörobiyoloji Laboratuvarı
          </span>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 flex items-center gap-2">
            Zamanın Simülasyon Yapısı & 4D Blok Evren
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Fiziksel uzay-zamanda zaman akmaz; beyin gecikmeli duyuları eşzamanlayarak bir "şimdi" kurgular.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center rounded-xl bg-neutral-100 dark:bg-neutral-800 p-1 text-xs">
          <button
            onClick={() => setViewMode('neuronal')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              viewMode === 'neuronal'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Nöronal Gecikme & Postdiction
          </button>
          <button
            onClick={() => setViewMode('block')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              viewMode === 'block'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            4D Blok Evren (Einstein)
          </button>
        </div>
      </div>

      {viewMode === 'neuronal' ? (
        /* Neuronal Latency View */
        <div className="space-y-6">
          
          {/* Visual Latency Diagram */}
          <div className="p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/80 dark:border-neutral-700/80 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              Asenkron Duyusal Girdiler ve Beynin 80ms Ardıl Kurgusu (Postdiction)
            </h4>

            <div className="space-y-3 text-xs">
              {/* Işık / Görme */}
              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0 flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
                  <Eye className="w-3.5 h-3.5 text-amber-500" /> Görme (Işık):
                </span>
                <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 h-4 rounded-full overflow-hidden relative">
                  <div className="bg-amber-500 h-full w-[80%] rounded-full animate-pulse flex items-center justify-end pr-2 text-[10px] text-white font-mono font-bold">
                    ~80 ms Gecikme
                  </div>
                </div>
              </div>

              {/* Ses / İşitme */}
              <div className="flex items-center gap-3">
                <span className="w-24 shrink-0 flex items-center gap-1 font-semibold text-neutral-700 dark:text-neutral-300">
                  <Volume2 className="w-3.5 h-3.5 text-indigo-500" /> İşitme (Ses):
                </span>
                <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 h-4 rounded-full overflow-hidden relative">
                  <div className="bg-indigo-500 h-full w-[30%] rounded-full flex items-center justify-end pr-2 text-[10px] text-white font-mono font-bold">
                    ~30 ms
                  </div>
                </div>
              </div>

              {/* Beynin Sentez Eşiği */}
              <div className="flex items-center gap-3 pt-2">
                <span className="w-24 shrink-0 font-bold text-emerald-600 dark:text-emerald-400">
                  Kurgulanan "Şimdi":
                </span>
                <div className="flex-1 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold">
                  Beyin yaklaşık 80-100 milisaniye geriden gelen bir simülasyon filmini "anlık gerçeklik" olarak bilince yansıtır!
                </div>
              </div>
            </div>
          </div>

          {/* Adrenaline / Stress Slider */}
          <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Stres, Tehlike ve Amigdala Uyarımı: Zaman Neden Yavaşlar?
                </h4>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                  Kaydırıcıyı artırarak beyindeki kayıt yoğunluğunu değiştirin.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
                Stres Seviyesi: %{stressLevel}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={stressLevel}
              onChange={(e) => setStressLevel(parseInt(e.target.value, 10))}
              className="w-full accent-amber-600 cursor-pointer"
            />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 text-center">
                <span className="text-[11px] text-neutral-500 block mb-0.5">Saniyedeki Anı Kayıt Yoğunluğu:</span>
                <strong className="text-base font-mono text-amber-600 dark:text-amber-400">
                  {memoryDensityPerSec} kare / sn
                </strong>
              </div>

              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200/60 dark:border-neutral-700/60 text-center">
                <span className="text-[11px] text-neutral-500 block mb-0.5">Öznel Zaman Akış Hızı:</span>
                <strong className="text-base font-mono text-indigo-600 dark:text-indigo-400">
                  {subjectiveSpeed}x (Yavaşlama Algısı)
                </strong>
              </div>
            </div>

            <p className="text-[11px] text-neutral-600 dark:text-neutral-400 italic">
              *David Eagleman deneyleri: Tehlike anında zaman fiziksel olarak yavaşlamaz; amigdala belleğe olağanüstü yüksek yoğunlukta anı kaydettiği için geriye dönük hatırlamada olaylar daha uzun sürmüş gibi hissedilir.
            </p>
          </div>

        </div>
      ) : (
        /* Block Universe View */
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-neutral-900 text-white border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-400" />
                4 Boyutlu Minkowski Uzay-Zaman Bloğu
              </h4>
              <span className="text-xs font-mono text-neutral-400">
                Koordinat: t = {spacetimeCoord}
              </span>
            </div>

            {/* 4D Spacetime Block Visualization */}
            <div className="relative h-28 bg-gradient-to-r from-blue-950 via-amber-950 to-purple-950 rounded-2xl border border-neutral-700 overflow-hidden flex items-center px-4">
              {/* Coordinate Cursor */}
              <div 
                className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_15px_#f59e0b] transition-all"
                style={{ left: `${spacetimeCoord}%` }}
              >
                <div className="absolute -top-1 -left-2 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-black">
                  t
                </div>
              </div>

              <div className="w-full flex justify-between text-xs font-mono text-neutral-300 font-bold z-10 px-2 pointer-events-none">
                <span>GEÇMİŞ (Past)</span>
                <span>GÖZLEMCİ "ŞİMDİ"Sİ</span>
                <span>GELECEK (Future)</span>
              </div>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={spacetimeCoord}
              onChange={(e) => setSpacetimeCoord(parseInt(e.target.value, 10))}
              className="w-full accent-amber-500 cursor-pointer"
            />

            <p className="text-xs text-neutral-300 leading-relaxed">
              Einstein'ın Görelilik Kuramı'na göre geçmiş, şimdi ve gelecek uzay-zaman dokusunda aynı anda mevcuttur. Tıpkı bir sinema filmi şeridindeki tüm karelerin makarada hazır beklemesi gibi; zamanın "akması" değil, bilincin bu koordinatlarda ilerlemesi söz konusudur.
            </p>
          </div>
        </div>
      )}

      {/* Synthesis Conclusion */}
      <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-neutral-800 dark:text-neutral-200 space-y-1">
          <strong className="font-bold text-amber-900 dark:text-amber-300 block">
            Emre Pelit'in Çıkarımı:
          </strong>
          <p className="leading-relaxed">
            Zaman, evrenin temel bir tuğlası değildir. İnsan bilinci, termodinamik entropi artışını ve asenkron duyusal gecikmeleri anlamlandırmak için kendi biyolojik simülasyon arayüzünü (zaman algısını) kurgular.
          </p>
        </div>
      </div>

    </div>
  );
};
