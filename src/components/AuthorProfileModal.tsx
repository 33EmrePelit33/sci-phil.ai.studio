import React from 'react';
import { X, ExternalLink, Mail, MapPin, BookOpen, Award, Sparkles } from 'lucide-react';

interface AuthorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSocialModal?: () => void;
}

export const AuthorProfileModal: React.FC<AuthorProfileModalProps> = ({ isOpen, onClose, onOpenSocialModal }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Profile Card Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
          <div className="relative shrink-0">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-amber-500 shadow-xl shadow-amber-500/20 bg-neutral-200 dark:bg-neutral-800">
              <img
                src="/author.jpg"
                alt="Emre Pelit"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-amber-500 text-white shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold">
              <Award className="w-3.5 h-3.5 text-amber-500" />
              Yazar & Araştırmacı
            </div>
            
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Emre Pelit
            </h2>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-neutral-500 dark:text-neutral-400">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-500" />
                Mersin, Türkiye
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-mono">
                <BookOpen className="w-3.5 h-3.5 text-amber-500" />
                Scientific Searches
              </span>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 italic pt-1">
              "Çok çeşitli kaynaklardan araştırma yapan, yazıların tümüne bir dayanak noktası olan ve yazmayı seven biriyim. Bilimi sevdirme odaklı yazılar yazıyorum."
            </p>
          </div>
        </div>

        {/* Research Focus Areas */}
        <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Düşünsel & Bilimsel Araştırma Alanları
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {[
              'Yapay Zeka & Şuur Problemi',
              'Fenomenal Bilinç (Qualia)',
              'Zamanın Simülasyon Yapısı',
              'Blok Evren & Görelilik',
              'Çoklu Evren & Bilgi Matrisi',
              'Epistemoloji & Bilim Felsefesi',
              'Nöronal Zaman Algısı',
              'Varoluşsal Yaratıcılık'
            ].map((tag, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-lg text-xs font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200/60 dark:border-neutral-700/60"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Academic & Author E-E-A-T Profiles */}
        <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            Akademik &amp; Yazar Profilleri (E-E-A-T)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <a
              href="https://www.researchgate.net/profile/Emre-Pelit?ev=hdr_xprf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 hover:border-amber-500 text-neutral-700 dark:text-neutral-200 font-medium transition-colors"
            >
              <span>ResearchGate</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <a
              href="https://medium.com/@emrepelit39"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 hover:border-amber-500 text-neutral-700 dark:text-neutral-200 font-medium transition-colors"
            >
              <span>Medium</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <a
              href="https://www.linkedin.com/in/emrepelit109"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/80 hover:border-amber-500 text-neutral-700 dark:text-neutral-200 font-medium transition-colors"
            >
              <span>LinkedIn</span>
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </div>
        </div>

        {/* Links & Contacts */}
        <div className="mt-6 pt-5 border-t border-neutral-100 dark:border-neutral-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <a
            href="https://emrepelit7337.blogspot.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm transition-colors"
          >
            <span>emrepelit7337.blogspot.com Bloğu</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <a
            href="mailto:emrepelit39@gmail.com"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-amber-500" />
            <span>emrepelit39@gmail.com</span>
          </a>

          {onOpenSocialModal && (
            <button
              onClick={() => {
                onClose();
                onOpenSocialModal();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <span>🌐 Sosyal Medyada Paylaş &amp; Bilgi Notu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
