import React, { useState } from 'react';
import { Article, ObjectionMessage } from '../types/article';
import { 
  MessageSquareWarning, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  ShieldAlert, 
  BookOpen, 
  RefreshCw,
  Lightbulb,
  MessageCircle,
  HelpCircle
} from 'lucide-react';

interface ObjectionBoxProps {
  article: Article;
}

export const ObjectionBox: React.FC<ObjectionBoxProps> = ({ article }) => {
  const [objectionText, setObjectionText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ObjectionMessage[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Pre-prepared insightful objections to help readers start
  const sampleObjections = [
    article.title.toLowerCase().includes('llm') || article.title.toLowerCase().includes('şuur')
      ? 'Eğer bir yapay zeka her soruya bilinçli bir insan gibi yanıt veriyorsa, onun içinde ayrıca görünmez bir "qualia" aramak bilime aykırı değil mi?'
      : 'Kuantum düzeyinde zaman simetriktir ama termodinamikte entropi neden tek yönde artıyor?',
    'İnsan beyni de sonuçta sadece bir biyolojik veri işlemci değil mi? Neden silikon ağlardan üstün olsun?',
    'Çin Odası argümanı tüm sistemi değil sadece içerideki operatörü ele aldığı için hatalı değil mi?'
  ];

  const handleSubmitObjection = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const textToSend = (customText || objectionText).trim();
    if (!textToSend) return;

    const messageId = `obj-${Date.now()}`;
    const newMsg: ObjectionMessage = {
      id: messageId,
      userObjection: textToSend,
      submittedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      isLoading: true,
    };

    setMessages((prev) => [newMsg, ...prev]);
    setObjectionText('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/resolve-objection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleTitle: article.title,
          articleContent: article.summary,
          userObjection: textToSend,
          language: article.language,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'İtiraz yanıtlanırken bir hata oluştu.');
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, isLoading: false, aiResponse: data.data }
            : msg
        )
      );
    } catch (err: any) {
      console.error('Objection API error:', err);
      setError(err.message || 'Yapay zeka yanıtı alınamadı.');
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Box Header */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-amber-500/5 to-transparent border border-indigo-500/20">
        <div className="flex items-start gap-3.5 mb-3">
          <div className="p-2.5 rounded-xl bg-indigo-600 text-white shrink-0 shadow-sm shadow-indigo-600/20">
            <MessageSquareWarning className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              Düşünsel İtiraz & Diyalektik Sorgulama Kutusu
              <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-300 dark:border-indigo-800">
                Gen AI ile Yanıtlanır
              </span>
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">
              Bu makaledeki herhangi bir teze, argümana veya kavrama dilediğiniz gibi itiraz edebilirsiniz. 
              <strong> Gemini 3.8 Flash</strong>, yazarın makale içeriği ve güncel bilimsel/felsefi literatür kapsamında itirazınızı derinlemesine yanıtlayacaktır.
            </p>
          </div>
        </div>

        {/* Quick Sample Objection Prompts */}
        <div className="mt-3 pt-3 border-t border-indigo-200/40 dark:border-indigo-800/40">
          <span className="text-[11px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1 mb-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            Örnek İtiraz Başlıkları (Tıklayıp Deneyin):
          </span>
          <div className="flex flex-wrap gap-2">
            {sampleObjections.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setObjectionText(sample);
                  handleSubmitObjection(undefined, sample);
                }}
                disabled={isLoading}
                className="text-left text-xs px-3 py-1.5 rounded-xl bg-white/80 dark:bg-neutral-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 border border-neutral-200 dark:border-neutral-700/80 text-neutral-700 dark:text-neutral-300 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                "{sample.slice(0, 75)}..."
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Input Form */}
      <form onSubmit={(e) => handleSubmitObjection(e)} className="space-y-3">
        <div className="relative">
          <textarea
            value={objectionText}
            onChange={(e) => setObjectionText(e.target.value)}
            placeholder="Bu makalenin tezine veya çıkarımlarına karşı kendi itirazınızı yazın... (Örn: 'Bence burada Searle’ün yaklaşımı yetersiz çünkü...')"
            rows={4}
            className="w-full p-4 text-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-sans"
          />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-[11px] text-neutral-400">
            {objectionText.length} / 1000 karakter • Saygılı ve akademik üslup tavsiye edilir
          </span>

          <button
            type="submit"
            disabled={isLoading || !objectionText.trim()}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Gen AI İtirazı Değerlendiriyor...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>İtirazımı Gönder & Gen AI Yanıtlasın</span>
              </>
            )}
          </button>
        </div>

        {error && (
          <p className="p-3 text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-800">
            {error}
          </p>
        )}
      </form>

      {/* Objection Thread / History */}
      {messages.length > 0 && (
        <div className="space-y-5 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-indigo-500" />
            Makale Üzerine Yapılan İtirazlar ve Gen AI Diyalektik Yanıtları ({messages.length})
          </h4>

          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 p-5 shadow-sm space-y-4 animate-in fade-in duration-200"
            >
              {/* Reader's Objection */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center text-neutral-700 dark:text-neutral-300 font-bold text-xs shrink-0 mt-0.5">
                  Siz
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-neutral-900 dark:text-neutral-100">
                      Okuyucu İtirazı
                    </span>
                    <span className="text-neutral-400 text-[11px] font-mono">
                      {msg.submittedAt}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-800 dark:text-neutral-200 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-200/60 dark:border-neutral-700/60 font-sans leading-relaxed">
                    "{msg.userObjection}"
                  </p>
                </div>
              </div>

              {/* Gen AI Response */}
              {msg.isLoading ? (
                <div className="ml-11 p-4 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 flex items-center gap-3 text-xs text-indigo-700 dark:text-indigo-300">
                  <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-indigo-500" />
                  <span>Makale argümanları ve güncel felsefe literatürü taranıyor, yanıt oluşturuluyor...</span>
                </div>
              ) : msg.aiResponse ? (
                <div className="ml-0 sm:ml-11 space-y-3 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 dark:text-indigo-300">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Gen AI Akademik Kürsü Cevabı:</span>
                  </div>

                  {/* 1. Hak Verilen Noktalar */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 text-xs">
                    <span className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      İtirazın Haklı ve Değerli Bulunan Yönü:
                    </span>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                      {msg.aiResponse.concessions}
                    </p>
                  </div>

                  {/* 2. Makalenin Savunması / Çürütme */}
                  <div className="p-3.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-200/60 dark:border-indigo-800/40 text-xs">
                    <span className="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5 mb-1">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Makale Kapsamında Çürütme & Karşı-Argüman:
                    </span>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                      {msg.aiResponse.rebuttal}
                    </p>
                  </div>

                  {/* 3. Epistemolojik Sentez */}
                  <div className="p-3.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-800/40 text-xs">
                    <span className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5 mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Felsefi & Epistemolojik Sentez:
                    </span>
                    <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed font-sans">
                      {msg.aiResponse.epistemologicalSynthesis}
                    </p>
                  </div>

                  {/* 4. İlgili Düşünürler */}
                  {msg.aiResponse.recommendedThinkers && msg.aiResponse.recommendedThinkers.length > 0 && (
                    <div className="flex items-center flex-wrap gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400 pt-1">
                      <span className="font-semibold flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-500" />
                        İlgili Düşünürler:
                      </span>
                      {msg.aiResponse.recommendedThinkers.map((th, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-neutral-100 dark:bg-neutral-800 font-mono text-[10px] text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700"
                        >
                          {th}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
