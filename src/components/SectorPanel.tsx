import React from 'react';
import type { Article } from '../types/article';
import { SectorEvaluation } from './SectorEvaluation';

interface SectorPanelProps {
  article: Article;
}

export const SectorPanel: React.FC<SectorPanelProps> = ({ article }) => (
  <aside className="w-full space-y-5">
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">Sektör Tanımı ve Sektör Değerlendirmesi</h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Bu bölüm makalenin konusu ve savunduğu tezden hareketle ilgili sektörü tanımlar; olası katkıyı, kanıt ihtiyacını, sınırları ve uygulama risklerini inceler. Belirli kişilere veya kurumlara ait görüşleri temsil etmez.
      </p>
    </div>
    <SectorEvaluation article={article} />
  </aside>
);
