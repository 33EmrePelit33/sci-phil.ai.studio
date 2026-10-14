import React, { useState, useEffect, useRef } from 'react';
import { Article } from '../types/article';
import { 
  Play, 
  Pause, 
  Square, 
  Volume2, 
  VolumeX, 
  FastForward, 
  Sparkles, 
  Headphones, 
  Radio,
  Sliders
} from 'lucide-react';

interface AudioPlayerTabProps {
  article: Article;
  currentLanguage?: string;
}

export const AudioPlayerTab: React.FC<AudioPlayerTabProps> = ({ article, currentLanguage }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const [currentSentence, setCurrentSentence] = useState<string>('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Extract clean text from HTML content
  const cleanArticleText = () => {
    const raw = article.title + '. ' + article.summary + '. ' + article.content.replace(/<[^>]+>/g, ' ');
    return raw.replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  };

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSpeechSupported(false);
      return;
    }

    const loadVoices = () => {
      const available = window.speechSynthesis.getVoices();
      setVoices(available);

      // Pick matching voice for article language or translated language
      const activeLang = (currentLanguage || article.language || 'tr').toLowerCase();
      const langPrefix = activeLang.slice(0, 2);
      const matched = available.find((v) => v.lang.toLowerCase().startsWith(langPrefix)) || 
                      available.find((v) => v.lang.toLowerCase().startsWith('tr')) || 
                      available[0];
      if (matched) {
        setSelectedVoice(matched.name);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [article.id, article.language, currentLanguage]);

  const handlePlay = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      return;
    }

    window.speechSynthesis.cancel();

    const text = cleanArticleText();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;

    // Apply voice
    if (selectedVoice) {
      const voiceObj = voices.find((v) => v.name === selectedVoice);
      if (voiceObj) utterance.voice = voiceObj;
    }

    utterance.onboundary = (event) => {
      if (event.name === 'sentence' || event.name === 'word') {
        const charIdx = event.charIndex;
        const slice = text.slice(charIdx, charIdx + 80);
        setCurrentSentence(slice + '...');
      }
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setCurrentSentence('');
    };

    utterance.onerror = (e) => {
      console.warn('Speech error:', e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.pause();
    setIsPlaying(false);
    setIsPaused(true);
  };

  const handleStop = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentSentence('');
  };

  const changeRate = (newRate: number) => {
    setRate(newRate);
    if (isPlaying) {
      handleStop();
      setTimeout(handlePlay, 100);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Player Showcase Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-600/5 to-neutral-900/5 dark:to-neutral-900 border border-amber-500/30 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform ${
              isPlaying ? 'bg-amber-600 scale-105 shadow-amber-500/30' : 'bg-neutral-800'
            }`}>
              <Headphones className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                  Doğal Dilde Sesli Makale
                </span>
                {isPlaying && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold animate-pulse">
                    <Radio className="w-3.5 h-3.5" />
                    Oynatılıyor
                  </span>
                )}
              </div>
              <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 mt-1">
                {article.title}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Tahmini Seslendirme Süresi: ~{article.readingTimeMinutes} dakika • Yazar: Emre Pelit
              </p>
            </div>
          </div>

          {/* Equalizer Visualizer Bars */}
          {isPlaying && (
            <div className="flex items-end gap-1 h-8 px-4">
              <span className="w-1 bg-amber-500 rounded-full animate-bounce h-4" />
              <span className="w-1 bg-amber-500 rounded-full animate-bounce h-7 delay-75" />
              <span className="w-1 bg-amber-500 rounded-full animate-bounce h-5 delay-150" />
              <span className="w-1 bg-amber-500 rounded-full animate-bounce h-8 delay-100" />
              <span className="w-1 bg-amber-500 rounded-full animate-bounce h-3 delay-200" />
            </div>
          )}

        </div>

        {/* Playback Controls Toolbar */}
        <div className="mt-8 pt-6 border-t border-neutral-200/60 dark:border-neutral-800/60 flex flex-wrap items-center justify-between gap-4">
          
          {/* Main Buttons */}
          <div className="flex items-center gap-3">
            {!isPlaying ? (
              <button
                onClick={handlePlay}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-600/30 transition-all cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isPaused ? 'Devam Et' : 'Sesli Dinle'}</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-950 font-bold text-sm shadow-md transition-all cursor-pointer"
              >
                <Pause className="w-4 h-4 fill-current" />
                <span>Duraklat</span>
              </button>
            )}

            {(isPlaying || isPaused) && (
              <button
                onClick={handleStop}
                className="p-3 rounded-2xl border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                title="Durdur"
              >
                <Square className="w-4 h-4 fill-current" />
              </button>
            )}
          </div>

          {/* Speed Selectors */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs">
            <span className="text-[11px] font-semibold text-neutral-400 px-2 flex items-center gap-1">
              <FastForward className="w-3 h-3" /> Hız:
            </span>
            {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
              <button
                key={s}
                onClick={() => changeRate(s)}
                className={`px-2.5 py-1 rounded-lg font-mono font-medium transition-colors ${
                  rate === s
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Voice Switcher if available */}
          {voices.length > 0 && (
            <div className="flex items-center gap-2 text-xs">
              <span className="text-neutral-500 text-[11px]">Ses:</span>
              <select
                value={selectedVoice}
                onChange={(e) => setSelectedVoice(e.target.value)}
                className="p-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 text-xs font-sans max-w-[200px] truncate"
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

        </div>

        {/* Live Reading Sentence Subtitle Box */}
        {currentSentence && (
          <div className="mt-5 p-3 rounded-xl bg-white/80 dark:bg-neutral-900/80 border border-amber-300 dark:border-amber-800 text-xs text-neutral-800 dark:text-neutral-200 font-reading italic">
            <span className="text-amber-600 dark:text-amber-400 font-sans font-bold not-italic mr-1.5">
              Okunan Kısım:
            </span>
            "{currentSentence}"
          </div>
        )}

      </div>

    </div>
  );
};
