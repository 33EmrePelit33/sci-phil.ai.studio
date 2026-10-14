import React from 'react';
import { Article } from '../types/article';
import { ProfessionalEvaluation } from './ProfessionalEvaluation';

interface ExpertPanelProps {
  article: Article;
}

/**
 * Article-specific professional-perspective analysis.
 * The displayed viewpoints are analytical lenses, not fabricated quotations
 * or endorsements attributed to named people or institutions.
 */
export const ExpertPanel: React.FC<ExpertPanelProps> = ({ article }) => (
  <aside className="w-full space-y-5">
    <div>
      <h2 className="text-lg sm:text-xl font-bold text-neutral-900 dark:text-neutral-100">
        Sektörel ve Profesyonel Değerlendirme
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Makalenin savı; uygulama, araştırma yöntemi ve risk/yönetişim ölçütleriyle ayrı ayrı incelenir. Her değerlendirme ilgili makalenin başlık, özet, tez ve içerik alanlarına göre hazırlanır.
      </p>
    </div>
    <ProfessionalEvaluation article={article} />
  </aside>
);
