import React, { useState } from 'react';
import { ChineseRoomSimulator } from './ChineseRoomSimulator';
import { BlockUniverseSimulator } from './BlockUniverseSimulator';
import { FallacyInspector } from './FallacyInspector';
import { KnowledgeGraphView } from './KnowledgeGraphView';
import { SocraticPartner } from './SocraticPartner';
import { SocraticDialogueArena } from './SocraticDialogueArena';
import { X, Sparkles, Cpu, Clock, AlertTriangle, Network, MessageSquare, Brain } from 'lucide-react';

interface InteractiveLabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterByQuery?: (query: string) => void;
}

export type LabTab = 'chinese-room' | 'time' | 'fallacy' | 'graph' | 'socrates' | 'socratic-partner';

export const InteractiveLabModal: React.FC<InteractiveLabModalProps> = ({
  isOpen,
  onClose,
  onFilterByQuery,
}) => {
  const [activeLabTab, setActiveLabTab] = useState<LabTab>('socratic-partner');

  if (!isOpen) return null;

  const tabs = [
    { id: 'socratic-partner', label: 'Sokratik Partner (Epistemik Matris)', icon: Brain },
    { id: 'chinese-room', label: 'Çin Odası & Qualia', icon: Cpu },
    { id: 'time', label: 'Zaman & Blok Evren', icon: Clock },
    { id: 'fallacy', label: 'Safsata Denetleyicisi', icon: AlertTriangle },
    { id: 'graph', label: 'Kavramsal Zihin Haritası', icon: Network },
    { id: 'socrates', label: 'Düşünür Arenası', icon: MessageSquare },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-5 sm:p-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 pb-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center gap-3">
          <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-md shadow-amber-500/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              İnteraktif Bilim & Felsefe Laboratuvarı
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-800">
                5 Simülasyon
              </span>
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Emre Pelit'in makale konularını etkileşimli deneylerle keşfedin.
            </p>
          </div>
        </div>

        {/* Lab Navigation Tabs */}
        <div className="mb-6 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeLabTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveLabTab(tab.id as LabTab)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20 scale-[1.02]'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 border border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Lab Component */}
        <div className="animate-in fade-in duration-200">
          {activeLabTab === 'chinese-room' && <ChineseRoomSimulator />}
          {activeLabTab === 'time' && <BlockUniverseSimulator />}
          {activeLabTab === 'fallacy' && <FallacyInspector />}
          {activeLabTab === 'graph' && (
            <KnowledgeGraphView
              onSelectConceptQuery={(q) => {
                if (onFilterByQuery) {
                  onFilterByQuery(q);
                  onClose();
                }
              }}
            />
          )}
          {activeLabTab === 'socratic-partner' && <SocraticPartner />}
          {activeLabTab === 'socrates' && <SocraticDialogueArena />}
        </div>

      </div>
    </div>
  );
};
