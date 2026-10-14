import React, { useState } from 'react';
import { DialecticalTriad } from '../types/article';
import { 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  FileCheck2, 
  Sparkles,
  Info,
  Ban,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertOctagon,
  ArrowRight
} from 'lucide-react';

interface DialecticalTriadViewProps {
  triad: DialecticalTriad;
  articleTitle: string;
}

export const DialecticalTriadView: React.FC<DialecticalTriadViewProps> = ({ triad, articleTitle }) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Split whatIsNotEvidence by lines or bullet points for structured card display
  const nonEvidencePoints = (triad.whatIsNotEvidence || '')
    .split(/\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* High-Impact Master Banner with High Contrast */}
      <div className="relative overflow-hidden p-6 sm:p-10 rounded-3xl bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 text-white shadow-2xl border-2 border-amber-500/40">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:18px_18px] pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 backdrop-blur-md text-amber-300 text-xs font-mono font-bold tracking-wider uppercase border border-amber-500/40 shadow-sm">
            <Scale className="w-4 h-4 text-amber-400" />
            <span>Felsefi ve Epistemolojik Diyalektik Matris</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-title font-extrabold tracking-tight text-white leading-tight">
            İDDİA — KARŞI İDDİA — NEYİN KANIT OLMADIĞI
          </h2>

          <p className="text-xs sm:text-base text-neutral-300 font-sans leading-relaxed max-w-3xl">
            Bilimsel düşüncenin en temel epistemolojik disiplini: Bir tezi savunurken, karşıt savı en güçlü biçimiyle (<em>steelmanning</em>) karşılamak ve <strong className="text-rose-400">neyin kanıt sayılamayacağını</strong> tereddütsüz netleştirmek.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              1. Pozitif Sav
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-indigo-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              2. Diyalektik Antitez
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-rose-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              3. Metodolojik Sahte Deliller
            </span>
          </div>
        </div>
      </div>

      {/* The 3 Prominent Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        
        {/* 1. İDDİA (TEMEL TEZ / POZİTİF SAV) */}
        <div className="group rounded-3xl border-2 border-emerald-500/80 hover:border-emerald-500 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xl shadow-emerald-500/10 flex flex-col justify-between transition-all duration-300">
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-100 dark:border-emerald-950/60 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                1. İDDİA (TEMEL TEZ)
              </span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                POZİTİF SAV
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-4 flex items-center justify-between">
              <span>Yazarın Savunduğu Temel Önerme:</span>
              <button
                onClick={() => handleCopy('claim', triad.claim)}
                className="p-1.5 text-neutral-400 hover:text-emerald-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Tezi kopyala"
              >
                {copiedKey === 'claim' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </h3>

            <div className="p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-neutral-900 dark:text-neutral-100 text-sm sm:text-base font-reading leading-relaxed italic shadow-inner">
              "{triad.claim}"
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
            <span className="flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 shrink-0" />
              <span>Makalenin Dayandığı Ana Argüman</span>
            </span>
            <span className="text-[11px] font-mono">[01]</span>
          </div>
        </div>

        {/* 2. KARŞI İDDİA (ANTİTEZ / SKEPTİK ELEŞTİRİ) */}
        <div className="group rounded-3xl border-2 border-indigo-500/80 hover:border-indigo-500 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xl shadow-indigo-500/10 flex flex-col justify-between transition-all duration-300">
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-indigo-100 dark:border-indigo-950/60 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-indigo-600 text-white shadow-lg shadow-indigo-600/30">
                <Scale className="w-4 h-4 text-indigo-200" />
                2. KARŞI İDDİA (ANTİTEZ)
              </span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800">
                DİYALEKTİK
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mb-4 flex items-center justify-between">
              <span>Karşıt Ekolün En Güçlü Argümanı:</span>
              <button
                onClick={() => handleCopy('counterClaim', triad.counterClaim)}
                className="p-1.5 text-neutral-400 hover:text-indigo-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Karşı iddiayı kopyala"
              >
                {copiedKey === 'counterClaim' ? <Check className="w-4 h-4 text-indigo-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </h3>

            <div className="p-5 rounded-2xl bg-indigo-50/80 dark:bg-indigo-950/40 border-l-4 border-indigo-500 text-neutral-900 dark:text-neutral-100 text-sm sm:text-base font-reading leading-relaxed italic shadow-inner">
              "{triad.counterClaim}"
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
            <span className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              <span>Steelmanning (En Güçlü Karşı Sav)</span>
            </span>
            <span className="text-[11px] font-mono">[02]</span>
          </div>
        </div>

        {/* 3. NEYİN KANIT OLMADIĞI (METODOLOJİK KIRILMA & SAHTE KANITLAR) */}
        <div className="group rounded-3xl border-2 border-rose-500/90 hover:border-rose-500 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-xl shadow-rose-500/10 flex flex-col justify-between transition-all duration-300">
          <div>
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-4 border-b border-rose-100 dark:border-rose-950/60 mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-rose-600 text-white shadow-lg shadow-rose-600/30">
                <Ban className="w-4 h-4 text-rose-200" />
                3. NEYİN KANIT OLMADIĞI
              </span>
              <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                SAFSASTALAR
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-rose-900 dark:text-rose-300 tracking-tight mb-4 flex items-center justify-between">
              <span>Sahte Deliller & Kavram Yanılgıları:</span>
              <button
                onClick={() => handleCopy('whatIsNotEvidence', triad.whatIsNotEvidence)}
                className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                title="Kriterleri kopyala"
              >
                {copiedKey === 'whatIsNotEvidence' ? <Check className="w-4 h-4 text-rose-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </h3>

            {/* Structured Points */}
            <div className="space-y-3">
              {nonEvidencePoints.map((point, idx) => (
                <div 
                  key={idx}
                  className="p-3.5 rounded-2xl bg-rose-50/80 dark:bg-rose-950/40 border-l-4 border-rose-500 text-neutral-900 dark:text-neutral-200 text-xs sm:text-sm font-sans leading-relaxed flex items-start gap-2.5"
                >
                  <AlertOctagon className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs font-bold text-rose-700 dark:text-rose-400">
            <span className="flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>Epistemolojik Ayıklama Standardı</span>
            </span>
            <span className="text-[11px] font-mono">[03]</span>
          </div>
        </div>

      </div>

      {/* Epistemological Principle Box */}
      {triad.methodologicalNote && (
        <div className="p-6 sm:p-7 rounded-3xl bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 flex items-start gap-4 shadow-sm">
          <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <strong className="font-bold text-neutral-900 dark:text-neutral-100 block text-sm sm:text-base">
              Epistemolojik & Metodolojik Temellendirme:
            </strong>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
              {triad.methodologicalNote}
            </p>
          </div>
        </div>
      )}

    </div>
  );
};
