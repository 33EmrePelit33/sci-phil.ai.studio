import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Sparkles, HelpCircle, ArrowRight, BookOpen, AlertOctagon } from 'lucide-react';

interface FallacyItem {
  name: string;
  category: string;
  sampleClaim: string;
  flawAnalysis: string;
  correctedArgument: string;
}

const COMMON_FALLACIES: FallacyItem[] = [
  {
    name: 'Antropomorfizm (İnsansılaştırma Safsatası)',
    category: 'Bilişsel & Felsefi',
    sampleClaim: 'Yapay zeka "ben çok korkuyorum" dediğine göre kesinlikle bilinçli ve acı çekiyor.',
    flawAnalysis: 'Bir sistemin insan dilindeki duygusal kalıpları istatistiksel olarak birleştirmesi, onun biyolojik homeostaza veya fenomenal qualia\'ya sahip olduğunu kanıtlamaz. İnsani özellikleri insan-dışı sistemlere yansıtma hatasıdır.',
    correctedArgument: 'Model yüksek doğrulukla insan korku ifadelerini simüle edebilmektedir; ancak bu sentaktik bir örüntüdür, ontolojik şuur kanıtı değildir.'
  },
  {
    name: 'Kategori Hatası (Category Mistake - Ryle)',
    category: 'Mantıksal & Epistemolojik',
    sampleClaim: 'Bir bilgisayarın tüm transistörlerini ve matris çarpımlarını inceledik ama şuurunu bulamadık; demek ki şuur diye bir şey yoktur.',
    flawAnalysis: 'Tıpkı bir üniversitenin kütüphanesini ve binalarını gezip "Peki üniversite nerede?" diye sormak gibidir. Şuur, transistörlerin yanında bir parça değil; bütünsel organizasyonun fenomenolojik bir durumudur.',
    correctedArgument: 'Hesaplamalı bileşenlerin mekanik yapısı, sistemin birinci şahıs perspektifine sahip olup olmadığını doğrudan fiziki bir parça olarak göstermez.'
  },
  {
    name: 'Saman Adam (Straw Man)',
    category: 'Diyalektik',
    sampleClaim: 'Yapay zekanın şuuru yoktur diyenler, teknolojinin gelişmesini ve AGI hedefini tamamen reddediyor.',
    flawAnalysis: 'Karşı tarafın "zekanın şuurdan ayrışabilirliği" tezini çarpıtarak "teknoloji düşmanlığı" gibi kolay çürütülecek bir karikatüre dönüştürme hatasıdır.',
    correctedArgument: 'Zeka ve hesaplama olağanüstü hızla gelişirken, fenomenal bilincin bu süreçten bağımsız olabileceği savunulmaktadır.'
  },
  {
    name: 'Post Hoc Ergo Propter Hoc (Sahte Nedensellik)',
    category: 'Metodolojik',
    sampleClaim: 'Modelin parametre sayısı 100 milyardan 1 trilyona çıkınca soru çözme becerisi arttı; 10 trilyon olunca kendi kendine şuur doğacaktır.',
    flawAnalysis: 'Niceliksel ölçekleme ile niteliksel fenomenolojik sıçrama arasında nedensel bir garanti yoktur. Korelasyon, qualia doğuşunun kanıtı değildir.',
    correctedArgument: 'Parametre artışı istatistiksel kapasiteyi genişletir; ancak öznel birinci şahıs deneyiminin ortaya çıkışı için farklı bir ontolojik temel gerekebilir.'
  }
];

export const FallacyInspector: React.FC = () => {
  const [selectedFallacy, setSelectedFallacy] = useState<FallacyItem>(COMMON_FALLACIES[0]);
  const [customArgument, setCustomArgument] = useState<string>('');
  const [analyzing, setAnalyzing] = useState<boolean>(false);
  const [customResult, setCustomResult] = useState<any>(null);

  const handleInspectCustom = async () => {
    if (!customArgument.trim()) return;
    setAnalyzing(true);
    setCustomResult(null);

    try {
      const res = await fetch('/api/gemini/resolve-objection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: 'Mantıksal Safsata Denetimi',
          articleContent: 'Epistemolojik tutarlılık, safsata analizi ve diyalektik geçerlilik',
          userObjection: `Aşağıdaki argümanı felsefi safsatalar (fallacy) ve epistemolojik tutarlılık açısından incele: "${customArgument}"`,
          language: 'tr',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCustomResult(data.data);
      }
    } catch (e) {
      console.warn('Fallacy check error:', e);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
          Mantık & Epistemoloji Aracı
        </span>
        <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 flex items-center gap-2">
          Diyalektik Safsata & Argüman Denetleyicisi
        </h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Tartışmalarda en sık yapılan mantık hatalarını inceleyin veya kendi argümanınızı test edin.
        </p>
      </div>

      {/* Preset Fallacy Tabs */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
          Yaygın Felsefi & Bilimsel Safsata Örnekleri:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {COMMON_FALLACIES.map((f) => (
            <button
              key={f.name}
              onClick={() => {
                setSelectedFallacy(f);
                setCustomResult(null);
              }}
              className={`p-3 rounded-2xl text-left text-xs border transition-all ${
                selectedFallacy.name === f.name
                  ? 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-200 font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-neutral-400 mb-0.5 font-mono">
                {f.category}
              </div>
              <div className="line-clamp-1">{f.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Detailed Analysis of Selected Fallacy */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-rose-500" />
            <h4 className="font-bold text-sm text-neutral-900 dark:text-neutral-100">
              {selectedFallacy.name}
            </h4>
          </div>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 font-medium">
            Safsata Tipi
          </span>
        </div>

        {/* Claim */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Hatalı Argüman / İddia:
          </span>
          <p className="text-xs font-reading italic text-neutral-800 dark:text-neutral-200 pl-3 border-l-2 border-rose-500 py-0.5">
            "{selectedFallacy.sampleClaim}"
          </p>
        </div>

        {/* Flaw */}
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Neden Safsata Sayılır? (Metodolojik Kırılma):
          </span>
          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {selectedFallacy.flawAnalysis}
          </p>
        </div>

        {/* Corrected Form */}
        <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs">
          <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Sağlamlaştırılmış Epistemolojik Sav:
          </span>
          <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {selectedFallacy.correctedArgument}
          </p>
        </div>
      </div>

      {/* Custom Argument Inspection Section */}
      <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
        <label className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Kendi Argümanınızı veya İddianızı Denetletin (Gen AI):
        </label>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={customArgument}
            onChange={(e) => setCustomArgument(e.target.value)}
            placeholder="Örn: 'Bilinç sadece beyin dalgalarından ibarettir çünkü EEG ölçümleri bunu gösterir'..."
            className="flex-1 px-4 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={handleInspectCustom}
            disabled={analyzing || !customArgument.trim()}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-neutral-900 dark:bg-amber-500 text-white dark:text-neutral-950 shadow-sm transition-colors disabled:opacity-50 cursor-pointer"
          >
            {analyzing ? 'Denetleniyor...' : 'Denetle'}
          </button>
        </div>

        {customResult && (
          <div className="mt-3 p-4 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 space-y-2 text-xs animate-in fade-in duration-200">
            <div>
              <strong className="text-neutral-900 dark:text-neutral-100 block mb-0.5">Argümanın İncelenmesi:</strong>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{customResult.rebuttal}</p>
            </div>
            <div>
              <strong className="text-emerald-700 dark:text-emerald-300 block mb-0.5">Sentez:</strong>
              <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">{customResult.epistemologicalSynthesis}</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
