import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, CheckCircle, Info, Monitor } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showDesktopGuide, setShowDesktopGuide] = useState(false);

  // If already running standalone, show installed badge
  if (isInstalled) {
    return (
      <span className="hidden xl:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
        <span>PWA Yüklü</span>
      </span>
    );
  }

  // Chromium / Android / Desktop direct prompt flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md shadow-amber-600/20 transition-all cursor-pointer"
        title="Uygulamayı Cihazınıza Yükleyin (PWA)"
      >
        <Download className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Uygulamayı Yükle</span>
        <span className="sm:hidden">Yükle</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium text-xs transition-colors cursor-pointer"
          title="iOS Ana Ekrana Ekle"
        >
          <Smartphone className="w-3.5 h-3.5 text-amber-500" />
          <span>iOS'a Ekle</span>
        </button>

        {showIOSGuide && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={() => setShowIOSGuide(false)}
          >
            <div 
              className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl relative"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                <Smartphone className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-center text-neutral-900 dark:text-neutral-100">
                iPhone / iPad'e Yükleme
              </h3>

              <div className="mt-4 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 flex items-start gap-2.5">
                  <span className="font-bold text-amber-600 shrink-0">1.</span>
                  <span>Safari alt çubuğundaki <strong>Paylaş (Share)</strong> simgesine dokunun.</span>
                </div>
                <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 flex items-start gap-2.5">
                  <span className="font-bold text-amber-600 shrink-0">2.</span>
                  <span>Aşağı kaydırıp <strong>"Ana Ekrana Ekle" (Add to Home Screen)</strong> seçeneğini seçin.</span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 text-xs font-bold rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 transition-colors"
              >
                Anladım
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // General desktop/browser guide modal without alert
  return (
    <>
      <button
        onClick={() => setShowDesktopGuide(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 font-medium text-xs transition-colors cursor-pointer"
        title="PWA Olarak Yükle"
      >
        <Download className="w-3.5 h-3.5 text-amber-500" />
        <span className="hidden sm:inline">PWA Yükle</span>
      </button>

      {showDesktopGuide && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowDesktopGuide(false)}
        >
          <div 
            className="w-full max-w-sm rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowDesktopGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
              <Monitor className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-center text-neutral-900 dark:text-neutral-100">
              Uygulamayı Cihazınıza Yükleyin
            </h3>

            <div className="mt-4 space-y-2.5 text-xs text-neutral-600 dark:text-neutral-300">
              <div className="p-3 rounded-xl bg-neutral-100 dark:bg-neutral-800/60 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Tarayıcınızın adres çubuğundaki (URL bar) <strong>Yükle / Install</strong> simgesine tıklayarak uygulamayı masaüstünüze veya telefonunuza anında bağımsız uygulama olarak yükleyebilirsiniz.
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 text-center">
                Çevrimdışı okuma, hızlı erişim ve tam ekran deneyimi sağlar.
              </p>
            </div>

            <button
              onClick={() => setShowDesktopGuide(false)}
              className="mt-5 w-full py-2.5 text-xs font-bold rounded-xl bg-amber-600 text-white hover:bg-amber-700 transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      )}
    </>
  );
};
