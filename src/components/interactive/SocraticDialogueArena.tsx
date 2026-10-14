import React, { useState } from 'react';
import { MessageSquareCode, Sparkles, Send, RefreshCw, BookOpen, User, RotateCcw } from 'lucide-react';

interface Philosopher {
  id: string;
  name: string;
  title: string;
  avatarText: string;
  openingQuote: string;
}

const PHILOSOPHERS: Philosopher[] = [
  {
    id: 'searle',
    name: 'John Searle',
    title: 'Çin Odası Kuramcısı & Zihin Felsefecisi',
    avatarText: 'JS',
    openingQuote: 'Sözdizimi anlambilimi doğuramaz. Bir program sembolleri ne kadar hızlı eşlerse eşlesin, sembollerin ne anlama geldiğini kavrayamaz.'
  },
  {
    id: 'chalmers',
    name: 'David Chalmers',
    title: 'Fenomenal Bilinç & Zor Problem Kuramcısı',
    avatarText: 'DC',
    openingQuote: 'Fonksiyonel yetenekler açıklanabilir; fakat bir şeyi içeriden hissetmenin (qualia) neden var olduğunu açıklamak neden bu kadar zordur?'
  },
  {
    id: 'einstein',
    name: 'Albert Einstein',
    title: 'Genel Görelilik & 4D Blok Evren',
    avatarText: 'AE',
    openingQuote: 'Geçmiş, şimdi ve gelecek arasındaki ayrım ne kadar inatçı olursa olsun yalnızca bir illüzyondan ibarettir.'
  },
  {
    id: 'socrates',
    name: 'Sokrates',
    title: 'Diyalektik Sorgulama & Atina Felsefesi',
    avatarText: 'SK',
    openingQuote: 'Bildiğim tek şey, hiçbir şey bilmediğimdir. Öyleyse gel, bildiğini sandığın bu kavramı birlikte sorgulayalım.'
  }
];

export const SocraticDialogueArena: React.FC = () => {
  const [selectedPhil, setSelectedPhil] = useState<Philosopher>(PHILOSOPHERS[0]);
  const [inputQuestion, setInputQuestion] = useState<string>('');
  const [chatLog, setChatLog] = useState<{ sender: 'user' | 'philosopher'; text: string }[]>([
    { sender: 'philosopher', text: PHILOSOPHERS[0].openingQuote }
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSelectPhil = (p: Philosopher) => {
    setSelectedPhil(p);
    setChatLog([{ sender: 'philosopher', text: p.openingQuote }]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const query = inputQuestion.trim();
    if (!query) return;

    const userEntry = { sender: 'user' as const, text: query };
    setChatLog((prev) => [...prev, userEntry]);
    setInputQuestion('');
    setLoading(true);

    try {
      const res = await fetch('/api/gemini/resolve-objection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleTitle: `${selectedPhil.name} ile Sokratik Tartışma`,
          articleContent: `Filozof persona: ${selectedPhil.name} (${selectedPhil.title}). Üslup: Akademik, Sokratik, derinlikli ve düşündürücü sorular içeren bir diyalog.`,
          userObjection: query,
          language: 'tr',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.data) {
        const philReply = `${data.data.concessions}\n\n${data.data.rebuttal}\n\nSoru: ${data.data.epistemologicalSynthesis}`;
        setChatLog((prev) => [...prev, { sender: 'philosopher', text: philReply }]);
      } else {
        setChatLog((prev) => [
          ...prev,
          { sender: 'philosopher', text: `Bu savınız düşündürücü. Ancak kavramın özüne indiğimizde, bilginin sınırlarını nasıl temellendiriyorsunuz?` }
        ]);
      }
    } catch {
      setChatLog((prev) => [
        ...prev,
        { sender: 'philosopher', text: `Bu savınız düşündürücü. Ancak kavramın özüne indiğimizde, bilginin sınırlarını nasıl temellendiriyorsunuz?` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Header */}
      <div className="pb-4 border-b border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            Diyalektik Tartışma Odası
          </span>
          <h3 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 mt-1 flex items-center gap-2">
            Sokratik Diyalog Laboratuvarı (Gen AI)
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Tarihin ve modern bilimin büyük düşünürleriyle makale tezlerini birebir tartışın.
          </p>
        </div>

        <button
          onClick={() => setChatLog([{ sender: 'philosopher', text: selectedPhil.openingQuote }])}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Sohbeti Temizle
        </button>
      </div>

      {/* Philosopher Picker */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {PHILOSOPHERS.map((phil) => (
          <button
            key={phil.id}
            onClick={() => handleSelectPhil(phil)}
            className={`p-3 rounded-2xl border text-left transition-all ${
              selectedPhil.id === phil.id
                ? 'border-amber-500 bg-amber-500/10 font-bold text-amber-950 dark:text-amber-200 shadow-sm'
                : 'border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
            }`}
          >
            <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs mb-2">
              {phil.avatarText}
            </div>
            <div className="text-xs font-bold leading-tight">{phil.name}</div>
            <div className="text-[10px] text-neutral-500 line-clamp-1 mt-0.5">{phil.title}</div>
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="h-80 overflow-y-auto p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/40 border border-neutral-200 dark:border-neutral-700 space-y-4">
        {chatLog.map((entry, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${entry.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {entry.sender === 'philosopher' && (
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                {selectedPhil.avatarText}
              </div>
            )}

            <div
              className={`p-3.5 rounded-2xl max-w-xl text-xs sm:text-sm font-sans leading-relaxed ${
                entry.sender === 'user'
                  ? 'bg-neutral-900 text-white dark:bg-amber-500 dark:text-neutral-950 rounded-tr-none'
                  : 'bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-800 rounded-tl-none font-reading whitespace-pre-line'
              }`}
            >
              {entry.text}
            </div>

            {entry.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-neutral-300 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 p-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{selectedPhil.name} derin felsefi akıl yürütmesini hazırlıyor...</span>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={inputQuestion}
          onChange={(e) => setInputQuestion(e.target.value)}
          placeholder={`${selectedPhil.name}'e bir tez veya felsefi soru yöneltin...`}
          className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
        <button
          type="submit"
          disabled={loading || !inputQuestion.trim()}
          className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span className="hidden sm:inline">Sor</span>
        </button>
      </form>

    </div>
  );
};
