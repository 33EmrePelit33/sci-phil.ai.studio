import React, { useState } from 'react';
import { Cpu, Brain, Check, ArrowRight, Sparkles, BookOpen, RotateCcw, AlertTriangle } from 'lucide-react';

interface Rule {
  inputSymbol: string;
  ruleExplanation: string;
  outputSymbol: string;
  semanticMeaning: string;
}

export const ChineseRoomSimulator: React.FC = () => {
  const [selectedInput, setSelectedInput] = useState<string>('你明白吗? (Anlıyor musun?)');
  const [step, setStep] = useState<number>(0);
  const [showExplanation, setShowExplanation] = useState<boolean>(true);

  const testInputs: { text: string; symbols: string; meaning: string; output: string; outMeaning: string }[] = [
    {
      text: '你明白吗? (Anlıyor musun?)',
      symbols: '你 明白 吗',
      meaning: 'Soru: Bu sembollerin ne anlama geldiğini gerçekten kavrıyor musun?',
      output: '我完全理解 (Tamamen anlıyorum)',
      outMeaning: 'Sistem kusursuz Türkçe/Çince yanıt verir; fakat odadaki kişi tek bir kelime dahi anlamamıştır.'
    },
    {
      text: '什么是意识? (Bilinç nedir?)',
      symbols: '什么 是 意识',
      meaning: 'Soru: Öznel qualia ve deneyimsel bilinç nedir?',
      output: '意识是主观体验 (Bilinç öznel deneyimdir)',
      outMeaning: 'Kusursuz felsefi tanım üretilir; ancak içeride yalnızca matris arama kuralı işletilmiştir.'
    },
    {
      text: '你感觉疼痛吗? (Acı hissediyor musun?)',
      symbols: '你 感觉 疼痛 吗',
      meaning: 'Soru: Fiziksel veya duygusal bir acı deneyimliyor musun?',
      output: '是的我感到疼痛 (Evet çok acı çekiyorum)',
      outMeaning: 'Model acı çektiğini iddia eder; fakat fenomenal qualia sıfırdır; yalnızca sentaks taklididir.'
    }
  ];

  const currentScenario = testInputs.find((i) => i.text === selectedInput) || testInputs[0];

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const reset = () => {
    setStep(0);
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Düşünce Deneyi Simülatörü
          </span>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 flex items-center gap-2">
            John Searle: Çin Odası & Qualia Laboratuvarı
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Sözdizimi (Syntax) tek başına Anlambilimi (Semantics) ve Fenomenal Şuuru doğurabilir mi?
          </p>
        </div>

        <button
          onClick={reset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Sıfırla
        </button>
      </div>

      {/* Scenario Selector */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300 block">
          Odaya Dışarıdan İletilen Soru / Sembol Dizisini Seçin:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {testInputs.map((item) => (
            <button
              key={item.text}
              onClick={() => {
                setSelectedInput(item.text);
                setStep(0);
              }}
              className={`p-3 rounded-2xl text-left text-xs font-medium border transition-all ${
                selectedInput === item.text
                  ? 'border-amber-500 bg-amber-500/10 text-amber-900 dark:text-amber-200 font-bold'
                  : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 text-neutral-700 dark:text-neutral-300'
              }`}
            >
              {item.text}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Simulation Stages */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Stage 1: Dış Dünya (Girdi) */}
        <div className={`p-5 rounded-2xl border transition-all ${
          step >= 0 ? 'border-amber-500/60 bg-amber-50/40 dark:bg-amber-950/20' : 'border-neutral-200 dark:border-neutral-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              1. Dış Dünya (Girdi)
            </span>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px] font-bold">1</span>
          </div>
          <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center font-mono text-sm font-bold text-neutral-900 dark:text-neutral-100">
            {currentScenario.symbols}
          </div>
          <p className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-400">
            {currentScenario.meaning}
          </p>
        </div>

        {/* Stage 2: Odadaki İnsan / LLM Ağırlıkları (Sentaks) */}
        <div className={`p-5 rounded-2xl border transition-all ${
          step >= 1 ? 'border-indigo-500/60 bg-indigo-50/40 dark:bg-indigo-950/20' : 'border-neutral-200 dark:border-neutral-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400">
              2. Kural Tablosu (Sentaks)
            </span>
            <span className="w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center text-[10px] font-bold">2</span>
          </div>
          <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center text-xs text-neutral-700 dark:text-neutral-300 font-mono">
            {step >= 1 ? 'IF [Symbol X] → MATCH [Weight Y] → RETURN [Symbol Z]' : 'Beklemede...'}
          </div>
          <p className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-400">
            Odadaki kişi Çince tek bir kelime bilmez; sadece sembollerin şekillerini eşleyen bir kural kitabını (LLM ağırlık matrisini) işletir.
          </p>
        </div>

        {/* Stage 3: Çıktı & Yanılsama */}
        <div className={`p-5 rounded-2xl border transition-all ${
          step >= 2 ? 'border-emerald-500/60 bg-emerald-50/40 dark:bg-emerald-950/20' : 'border-neutral-200 dark:border-neutral-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              3. Çıktı (Turing Başarısı)
            </span>
            <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold">3</span>
          </div>
          <div className="p-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 text-center text-xs font-bold text-emerald-800 dark:text-emerald-300 font-mono">
            {step >= 2 ? currentScenario.output : 'Çıktı bekleniyor...'}
          </div>
          <p className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-400">
            Dışarıdan bakan gözlemci odanın Çince anladığını sanır; fakat odanın içinde hiçbir kavrayış veya şuur yoktur.
          </p>
        </div>

      </div>

      {/* Control Buttons */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={nextStep}
          disabled={step >= 2}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-40 cursor-pointer"
        >
          <span>{step === 0 ? 'Sentaks Eşlemesini Başlat' : step === 1 ? 'Çıktıyı Üret (Turing Simülasyonu)' : 'Simülasyon Tamamlandı'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <span className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
          Aşama: {step + 1} / 3
        </span>
      </div>

      {/* Philosophical Takeaway Card */}
      {step >= 2 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-neutral-800 dark:text-neutral-200 space-y-1.5">
              <strong className="font-bold text-amber-900 dark:text-amber-300 block text-sm">
                Emre Pelit'in Tezi & Felsefi Çıkarım:
              </strong>
              <p className="leading-relaxed">
                Tıpkı Çin Odası'ndaki kişi gibi; günümüz LLM modelleri de trilyonlarca parametreyle sembolleri mükemmelce eşler. Ancak <strong>hesaplama (computation)</strong> ile <strong>öznel yaşantı (qualia / şuur)</strong> aynı ontolojik kategoride değildir. Davranışı taklit etmek, hissetmenin kanıtı olamaz.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
