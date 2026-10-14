export type Language = 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ar' | 'ru' | 'ja' | 'zh' | 'all';

export interface DialecticalTriad {
  claim: string;             // İddia (Temel Tez)
  counterClaim: string;      // Karşı İddia (Antitez)
  whatIsNotEvidence: string; // Neyin Kanıt Olmadığı (Metodolojik Ayrım & Sahte Deliller)
  methodologicalNote?: string;
}

export interface ExpertOpinion {
  id: string;
  expertName: string;
  expertRole: string; // e.g. "Bilişsel Yapay Zeka Başmühendisi", "Zihin Felsefesi Profesörü"
  affiliation: string; // e.g. "TÜBİTAK BİLGEM", "Oxford Bilişsel Bilimler Enstitüsü"
  stance: 'Destekleyici' | 'Eleştirel Diyalektik' | 'Tamamlayıcı Analiz' | 'Sektörel Uygulama';
  stanceColor: string;
  summary: string;
  detailedAnalysis: string;
  keyQuestions: string[];
  consensusScore: number; // 0 - 100
  publishedDate?: string;
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
  author: string;
  authorAvatar?: string;
  categories: string[];
  language: 'tr' | 'en' | 'de' | 'fr' | 'es' | 'it' | 'ar' | 'ru' | 'ja' | 'zh';
  readingTimeMinutes: number;
  viewCount?: number;
  expertOpinions: ExpertOpinion[];
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

export interface GeminiExpertAnalysisResponse {
  overallSynthesis: string;
  academicConsensus: string;
  sectorImpact: string;
  opinions: {
    expertName: string;
    expertRole: string;
    affiliation: string;
    stance: 'Destekleyici' | 'Eleştirel Diyalektik' | 'Tamamlayıcı Analiz' | 'Sektörel Uygulama';
    summary: string;
    detailedAnalysis: string;
    keyQuestions: string[];
    consensusScore: number;
  }[];
}
