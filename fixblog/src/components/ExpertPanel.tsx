import React, { useState } from 'react';
import { Article, ExpertOpinion } from '../types/article';
import { 
  Sparkles, 
  BrainCircuit, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  Flame, 
  Award,
  RefreshCw,
  Lightbulb
} from 'lucide-react';

interface ExpertPanelProps {
  article: Article;
}

interface GeminiLiveResult {
  overallSynthesis: string;
  academicConsensus: string;
  sectorImpact: string;
  opinions: {
    expertName: string;
    expertRole: string;
    affiliation: string;
    stance: 'Destekleyici' | 'Eleştirel Diyalektik' | 'Tamamlayıcı Analiz' | 'Sektörel Uygulama';
    summary: string;
    detailedAnalysis: string;
    keyQuestions: string[];
    consensusScore: number;
  }[];
}

export const ExpertPanel: React.FC<ExpertPanelProps> = ({ article }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isLoadingGemini, setIsLoadingGemini] = useState(false);
  const [geminiResult, setGeminiResult] = useState<GeminiLiveResult | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const copyOpinion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerateGeminiOpinions = async () => {
    setIsLoadingGemini(true);
    setGeminiError(null);

    try {
      const response = await fetch('/api/gemini/expert-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleTitle: article.title,
          articleSummary: article.summary,
          category: article.categories[0] || 'Felsefe ve Bilim',
          language: article.language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Gemini uzman analizi alınamadı.');
      }

      setGeminiResult(data.data);
    } catch (err: any) {
      console.error('Error generating expert analysis:', err);
      setGeminiError(err.message || 'Yapay zeka analizi sırasında bir hata meydana geldi.');
    } finally {
      setIsLoadingGemini(false);
    }
  };

  const getStanceBadgeClass = (stance: string) => {
    switch (stance) {
      case 'Destekleyici':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'Eleştirel Diyalektik':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/70 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      case 'Tamamlayıcı Analiz':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/70 dark:text-sky-300 border-sky-300 dark:border-sky-800';
      case 'Sektörel Uygulama':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/70 dark:text-purple-300 border-purple-300 dark:border-purple-800';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    }
  };

  // Base opinions from article metadata
  const opinions: ExpertOpinion[] = article.expertOpinions || [];

  return (
    <aside className="w-full space-y-6">
      
      {/* Panel Header */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-transparent border border-amber-500/20 dark:border-amber-500/20">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500 text-white shadow-sm shadow-amber-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
                Sektör & Akademi Uzman Görüşleri
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Bu makale konusundaki güncel düşünsel ve endüstriyel yaklaşımlar
              </p>
            </div>
          </div>
        </div>

        {/* Action: Generate Live AI Sector Analysis with Gemini */}
        <button
          onClick={handleGenerateGeminiOpinions}
          disabled={isLoadingGemini}
          className="w-full mt-2 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs bg-neutral-900 hover:bg-neutral-800 dark:bg-amber-500 dark:hover:bg-amber-400 text-white dark:text-neutral-950 shadow-md shadow-neutral-900/10 transition-all duration-200 disabled:opacity-60 cursor-pointer"
        >
          {isLoadingGemini ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-amber-400 dark:text-neutral-950" />
              <span>Gemini 3.8 Uzman Paneli Analiz Ediyor...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400 dark:text-neutral-950" />
              <span>Gemini ile Canlı Yeni Uzman Değerlendirmesi Üret</span>
            </>
          )}
        </button>

        {geminiError && (
          <p className="mt-2 text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-800">
            {geminiError}
          </p>
        )}
      </div>

      {/* Live Gemini Synthesis Card if loaded */}
      {geminiResult && (
        <div className="p-5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border-2 border-amber-500/40 space-y-4 animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60 dark:border-amber-800/60">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                Gemini 3.8 Canlı Akademik Heyet Sentezi
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/70 text-amber-900 dark:text-amber-200 font-mono font-semibold">
              2026 Konsensüsü
            </span>
          </div>

          <div className="space-y-3 text-xs text-neutral-800 dark:text-neutral-200">
            <div>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">
                Genel Değerlendirme & Tezin Katkısı:
              </span>
              <p className="leading-relaxed opacity-90">{geminiResult.overallSynthesis}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-amber-200/50 dark:border-amber-800/40">
              <span className="font-semibold text-amber-900 dark:text-amber-300 block mb-1">
                Akademik Görüş Birliği:
              </span>
              <p className="leading-relaxed">{geminiResult.academicConsensus}</p>
            </div>

            <div className="p-3 rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-amber-200/50 dark:border-amber-800/40">
              <span className="font-semibold text-purple-900 dark:text-purple-300 block mb-1">
                Reel Sektör & Endüstriyel Etki:
              </span>
              <p className="leading-relaxed">{geminiResult.sectorImpact}</p>
            </div>
          </div>

          {/* Render opinions returned by Gemini */}
          <div className="pt-2 space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Gemini Tarafından Belirlenen Uzman Perspektifleri ({geminiResult.opinions.length})
            </h4>

            {geminiResult.opinions.map((op, idx) => {
              const liveId = `gemini-op-${idx}`;
              const isExpanded = expandedId === liveId;

              return (
                <div
                  key={liveId}
                  className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 shadow-sm hover:border-amber-400 dark:hover:border-amber-600 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                        {op.expertName}
                      </h4>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                        {op.expertRole}
                      </p>
                      <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                        {op.affiliation}
                      </p>
                    </div>

                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getStanceBadgeClass(op.stance)}`}>
                      {op.stance}
                    </span>
                  </div>

                  <p className="text-xs text-neutral-700 dark:text-neutral-300 font-reading italic my-2 pl-2 border-l-2 border-amber-500/50">
                    "{op.summary}"
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-neutral-100 dark:border-neutral-800/80 text-xs">
                    <div className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      <Flame className="w-3 h-3" />
                      <span>%{op.consensusScore} Konsensüs</span>
                    </div>

                    <button
                      onClick={() => toggleExpand(liveId)}
                      className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 font-medium cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Detayı Gizle <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Akademik Detay <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs animate-in fade-in duration-200">
                      <div>
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 block mb-1">
                          Ayrıntılı İnceleme:
                        </span>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                          {op.detailedAnalysis}
                        </p>
                      </div>

                      {op.keyQuestions && op.keyQuestions.length > 0 && (
                        <div className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200/60 dark:border-neutral-700/60">
                          <span className="font-semibold text-neutral-700 dark:text-neutral-300 flex items-center gap-1 mb-1.5">
                            <HelpCircle className="w-3 h-3 text-amber-500" />
                            Tartışmaya Açtığı Sorular:
                          </span>
                          <ul className="list-disc pl-4 space-y-1 text-neutral-600 dark:text-neutral-400 text-[11px]">
                            {op.keyQuestions.map((q, qIdx) => (
                              <li key={qIdx}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Standard Curated Expert Opinions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-amber-500" />
            Kalıcı Uzman & Sektör İncelemeleri ({opinions.length})
          </h4>
          <span className="text-[11px] text-neutral-400">
            Hakemli Değerlendirme
          </span>
        </div>

        {opinions.length === 0 ? (
          <div className="p-6 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 text-center text-xs text-neutral-500">
            <Lightbulb className="w-6 h-6 mx-auto mb-2 text-amber-500 opacity-60" />
            <p>Bu makale için henüz önceden işlenmiş görüş bulunmuyor.</p>
            <p className="mt-1">Yukarıdaki "Gemini ile Canlı Üret" butonuna tıklayarak anında uzman analizi oluşturabilirsiniz.</p>
          </div>
        ) : (
          opinions.map((opinion) => {
            const isExpanded = expandedId === opinion.id;

            return (
              <div
                key={opinion.id}
                className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-5 shadow-sm hover:border-amber-400 dark:hover:border-amber-600/70 transition-all duration-200"
              >
                {/* Header: Name, Role, Affiliation & Stance */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                      {opinion.expertName}
                    </h4>
                    <p className="text-xs text-amber-700 dark:text-amber-400 font-medium">
                      {opinion.expertRole}
                    </p>
                    <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-0.5">
                      {opinion.affiliation}
                    </p>
                  </div>

                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border shrink-0 ${getStanceBadgeClass(opinion.stance)}`}>
                    {opinion.stance}
                  </span>
                </div>

                {/* Stance Quote / Summary */}
                <blockquote className="my-3 p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800/40 border-l-3 border-amber-500 text-xs text-neutral-700 dark:text-neutral-300 font-reading leading-relaxed italic">
                  "{opinion.summary}"
                </blockquote>

                {/* Consensus Gauge & Action Toolbar */}
                <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800 text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>%{opinion.consensusScore} Güvenilirlik</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyOpinion(opinion.id, `${opinion.expertName} (${opinion.expertRole}): ${opinion.summary}`)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                      title="Görüşü Kopyala"
                    >
                      {copiedId === opinion.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    <button
                      onClick={() => toggleExpand(opinion.id)}
                      className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium cursor-pointer"
                    >
                      {isExpanded ? (
                        <>Kapat <ChevronUp className="w-3.5 h-3.5" /></>
                      ) : (
                        <>Genişlet <ChevronDown className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Detailed Analysis */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 space-y-3 text-xs animate-in fade-in duration-200">
                    <div>
                      <span className="font-semibold text-neutral-900 dark:text-neutral-100 block mb-1">
                        Sektörel ve Akademik Açıklama:
                      </span>
                      <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed font-sans">
                        {opinion.detailedAnalysis}
                      </p>
                    </div>

                    {opinion.keyQuestions && opinion.keyQuestions.length > 0 && (
                      <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200 flex items-center gap-1.5 mb-2">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                          Gündeme Taşınan Kritik Sorular:
                        </span>
                        <ul className="space-y-1.5 pl-3 list-disc text-neutral-600 dark:text-neutral-400 text-[11px]">
                          {opinion.keyQuestions.map((q, idx) => (
                            <li key={idx} className="leading-snug">{q}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </aside>
  );
};
