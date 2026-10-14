import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, FileCode, Globe, X, Server } from 'lucide-react';

interface SecurityBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityBadgeModal: React.FC<SecurityBadgeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Kapat"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
              Sıfır Güvenlik Açığı Mimarisi
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Doğrulandı
              </span>
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Uluslararası OWASP ve AI Studio güvenlik standartlarına tam uyumluluk
            </p>
          </div>
        </div>

        <div className="space-y-4 text-sm text-neutral-700 dark:text-neutral-300">
          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">1. Gemini API Anahtarı İzolasyonu</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Gemini API anahtarı hiçbir koşulda istemci (browser) tarafına iletilmez. Tüm yapay zeka sorguları güvenli Node.js Express backend proxy üzerinden yürütülür.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex items-start gap-3">
            <FileCode className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">2. DOMPurify XSS ve HTML Temizliği</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                emrepelit7337.blogspot.com akışından çekilen tüm makale gövdeleri render edilmeden önce DOMPurify ile katı profilde filtrelenir; tehlikeli script ve iframe etiketleri tamamen engellenir.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex items-start gap-3">
            <Server className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">3. HTTP Güvenlik Başlıkları & CSP</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                Sunucu düzeyinde <code className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[11px]">X-Content-Type-Options: nosniff</code>, <code className="px-1 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded text-[11px]">X-Frame-Options: SAMEORIGIN</code> ve Content-Security-Policy başlıkları ile clickjacking ve MIME sızmaları önlenir.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-700/60 flex items-start gap-3">
            <Globe className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">4. Güvenli Blogspot Senkronizasyonu</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1">
                emrepelit7337.blogspot.com resmi RSS/JSON feed API üzerinden HTTPS protokolü ile okunur, önbelleğe alınır ve istemciye güvenli şemayla sunulur.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-neutral-200 dark:border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Güvenlik denetimi aktif ve devrede
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 hover:bg-neutral-800 dark:hover:bg-white transition-colors"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
};
