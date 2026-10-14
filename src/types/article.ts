export type Language = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ar' | 'ru' | 'ja' | 'zh' | 'all';

export interface DialecticalTriad {
  claim: string;             // İddia (Temel Tez)
  counterClaim: string;      // Karşı İddia (Antitez)
  whatIsNotEvidence: string; // Neyin Kanıt Olmadığı (Metodolojik Ayrım & Sahte Deliller)
  methodologicalNote?: string;
}

export interface ObjectionMessage {
  id: string;
  userObjection: string;
  submittedAt: string;
  aiResponse?: {
    concessions: string;      // Hak Verilen / Geçerli Noktalar
    rebuttal: string;         // Makale Savunması ve Karşı Cevap
    epistemologicalSynthesis: string; // Epistemolojik Sentez
    recommendedThinkers: string[];   // İlgili Düşünürler & Literatür
  };
  isLoading?: boolean;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  cleanText?: string;
  publishedAt: string;
  updatedAt: string;
  url: string;
  originalUrl?: string;
  author: string;
  authorAvatar?: string;
  categories: string[];
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ar' | 'ru' | 'ja' | 'zh';
  readingTimeMinutes: number;
  viewCount?: number;
  dialecticalTriad: DialecticalTriad;
  sourceBlog: string; // 'emrepelit7337.blogspot.com'
  objections?: ObjectionMessage[];
}

export interface SyncStatus {
  lastSynced: string | null;
  totalArticles: number;
  status: 'idle' | 'syncing' | 'success' | 'error';
  sourceUrl: string;
  error?: string;
}
