import React, { useState } from 'react';
import { Share2, Network, Sparkles, BookOpen, ExternalLink, ArrowRight } from 'lucide-react';

interface ConceptNode {
  id: string;
  name: string;
  category: 'bilinc' | 'fizik' | 'epistemoloji' | 'ontoloji';
  description: string;
  relatedIds: string[];
  articleQuery: string;
}

const CONCEPTS: ConceptNode[] = [
  {
    id: 'qualia',
    name: 'Fenomenal Bilinç (Qualia)',
    category: 'bilinc',
    description: 'Öznel deneyimsel his (kırmızı görmenin, acı duymanın bizzat yaşanan "neye benzediği"). Hesaplamalı makinelerin sahip olmadığı birinci şahıs perspektifi.',
    relatedIds: ['llm', 'chinese-room', 'hard-problem'],
    articleQuery: 'şuur'
  },
  {
    id: 'llm',
    name: 'Büyük Dil Modelleri (LLM)',
    category: 'bilinc',
    description: 'İstatiksel örüntü eşleme ve sembolik belirteç manipülasyonu. İnsan dilini kusursuz taklit eder ancak niyetlilik (intentionality) barındırmaz.',
    relatedIds: ['qualia', 'chinese-room'],
    articleQuery: 'LLM'
  },
  {
    id: 'chinese-room',
    name: 'Çin Odası Argümanı',
    category: 'epistemoloji',
    description: 'John Searle’ün sentaksın (sözdizimi) tek başına semantiği (anlamı) ve şuuru doğuramayacağını ispatlayan klasik düşünce deneyi.',
    relatedIds: ['llm', 'qualia'],
    articleQuery: 'şuur'
  },
  {
    id: 'block-universe',
    name: '4D Blok Evren',
    category: 'fizik',
    description: 'Einstein ve Minkowski uzay-zamanında geçmiş, şimdi ve geleceğin aynı anda var olduğu, zamanın "akmadığı" kozmik geometri.',
    relatedIds: ['neuronal-time', 'entropy'],
    articleQuery: 'zaman'
  },
  {
    id: 'neuronal-time',
    name: 'Nöronal Zaman & Postdiction',
    category: 'bilinc',
    description: 'İnsan beyninin asenkron duyusal sinyalleri (~80ms gecikmeli) eşzamanlayarak kurguladığı simülasyon arayüzü ve süreklilik illüzyonu.',
    relatedIds: ['block-universe', 'entropy'],
    articleQuery: 'nöronal'
  },
  {
    id: 'entropy',
    name: 'Termodinamik Zaman Oku',
    category: 'fizik',
    description: 'Evrendeki entropi artışının belirlediği makroskopik tek yönlülük. Beynin bellek kayıt mekanizmasının termodinamik temeli.',
    relatedIds: ['block-universe', 'neuronal-time'],
    articleQuery: 'zaman'
  },
  {
    id: 'multiverse',
    name: 'Çoklu Evren & Bilgi Matrisi',
    category: 'ontoloji',
    description: 'Kuantum olasılık dalgalarının ve kozmolojik paralel gerçekliklerin üst bilgi matrisinde (Levh-i Mahfuz) bağlantısallığı.',
    relatedIds: ['block-universe'],
    articleQuery: 'evren'
  },
  {
    id: 'creation-art',
    name: 'Yaratma Sanatı & İrade',
    category: 'ontoloji',
    description: 'İnsanın varoluşsal kaostan düzen ve anlam devşirme yetisi; yapay bolluk çağında otantik iradenin özgürleşme manifestosu.',
    relatedIds: ['qualia'],
    articleQuery: 'yaratma'
  }
];

interface KnowledgeGraphViewProps {
  onSelectConceptQuery?: (query: string) => void;
}

export const KnowledgeGraphView: React.FC<KnowledgeGraphViewProps> = ({ onSelectConceptQuery }) => {
  const [activeConceptId, setActiveConceptId] = useState<string>('qualia');
  const activeConcept = CONCEPTS.find((c) => c.id === activeConceptId) || CONCEPTS[0];

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'bilinc': return 'bg-amber-500 text-white border-amber-600';
      case 'fizik': return 'bg-indigo-500 text-white border-indigo-600';
      case 'epistemoloji': return 'bg-emerald-500 text-white border-emerald-600';
      case 'ontoloji': return 'bg-purple-500 text-white border-purple-600';
      default: return 'bg-neutral-500 text-white border-neutral-600';
    }
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
            Kavramsal Zihin Haritası
          </span>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 flex items-center gap-2">
            Emre Pelit'in Düşünsel Bağlantısallık Ağı
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Makaleler arasındaki felsefi ve bilimsel kavram köprülerini interaktif olarak keşfedin.
          </p>
        </div>
      </div>

      {/* Interactive Node Matrix */}
      <div className="p-6 rounded-2xl bg-neutral-900 text-white border border-neutral-800 relative overflow-hidden">
        {/* Subtle background graph lines */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

        <div className="relative z-10 flex flex-wrap justify-center gap-3">
          {CONCEPTS.map((concept) => {
            const isSelected = concept.id === activeConceptId;
            const isRelated = activeConcept.relatedIds.includes(concept.id);

            return (
              <button
                key={concept.id}
                onClick={() => setActiveConceptId(concept.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/40 scale-105 font-bold'
                    : isRelated
                    ? 'bg-neutral-800 border-2 border-amber-500/60 text-amber-200'
                    : 'bg-neutral-800/80 border border-neutral-700/80 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {concept.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Concept Card Detail */}
      <div className="p-5 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200/80 dark:border-neutral-700/80 space-y-4 animate-in fade-in duration-200">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getCategoryColor(activeConcept.category)}`}>
              {activeConcept.category.toUpperCase()}
            </span>
            <h4 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-1">
              {activeConcept.name}
            </h4>
          </div>

          {onSelectConceptQuery && (
            <button
              onClick={() => onSelectConceptQuery(activeConcept.articleQuery)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
            >
              <span>İlgili Makaleleri Filtrele</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <p className="text-sm font-reading text-neutral-800 dark:text-neutral-200 leading-relaxed pl-3 border-l-2 border-amber-500">
          {activeConcept.description}
        </p>

        {/* Related Connected Concepts */}
        <div className="pt-3 border-t border-neutral-200 dark:border-neutral-700 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-neutral-500 font-semibold flex items-center gap-1">
            <Network className="w-3.5 h-3.5 text-amber-500" />
            Doğrudan Bağlantılı Kavramlar:
          </span>
          {activeConcept.relatedIds.map((relId) => {
            const rel = CONCEPTS.find((c) => c.id === relId);
            if (!rel) return null;
            return (
              <button
                key={relId}
                onClick={() => setActiveConceptId(relId)}
                className="px-2.5 py-1 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-amber-500 transition-colors cursor-pointer"
              >
                {rel.name} →
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
