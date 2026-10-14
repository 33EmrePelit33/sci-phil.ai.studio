import React from 'react';
import { SyncStatus } from '../types/article';
import { CheckCircle2, AlertCircle, RefreshCw, Radio } from 'lucide-react';

interface SyncStatusBannerProps {
  syncStatus: SyncStatus;
  onRefresh: () => void;
}

export const SyncStatusBanner: React.FC<SyncStatusBannerProps> = ({ syncStatus, onRefresh }) => {
  const formatTime = (isoString: string | null) => {
    if (!isoString) return 'Az önce senkronize edildi';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + date.toLocaleDateString('tr-TR') + ')';
    } catch {
      return isoString;
    }
  };

  return (
    <div className="w-full bg-neutral-100/70 dark:bg-neutral-900/50 border-b border-neutral-200/60 dark:border-neutral-800/60 text-xs py-2 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-neutral-600 dark:text-neutral-400">
          <span className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
            <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
            Canlı Blog Senkronizasyonu:
          </span>
          <a
            href="https://emrepelit7337.blogspot.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-600 dark:text-amber-400 hover:underline font-mono"
          >
            emrepelit7337.blogspot.com
          </a>
          <span className="text-neutral-400 dark:text-neutral-600">•</span>
          <span>{syncStatus.totalArticles} makale senkronize</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-500">
            Son Senkronizasyon: {formatTime(syncStatus.lastSynced)}
          </span>
          {syncStatus.status === 'syncing' ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Senkronize ediliyor...
            </span>
          ) : syncStatus.status === 'error' ? (
            <span className="inline-flex items-center gap-1 text-[11px] text-rose-500 font-medium">
              <AlertCircle className="w-3 h-3" />
              Bağlantı denendi
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              Güncel
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
