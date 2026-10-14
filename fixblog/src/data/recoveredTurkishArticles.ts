import { Article, ExpertOpinion } from '../types/article';
import { SEED_ARTICLES } from './seedArticles';
import turkishCatalog from './turkishCatalog.json';
import generatedExpertOpinions from './generatedExpertOpinions.json';

type CatalogPost = {
  id: string | number;
  title: string;
  slug: string;
  published?: string;
  updated?: string;
  language?: string;
  categories?: string[];
  author?: string;
  originalUrl?: string;
  wordCount?: number;
  readingMinutes?: number;
  excerpt?: string;
  claim?: string;
  notProof?: string;
  content?: string;
};

const normalizeTitle = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLocaleLowerCase('tr-TR')
  .replace(/[^\p{L}\p{N}]/gu, '');

const asText = (value: unknown): string => String(value ?? '').trim();
const posts = (turkishCatalog as CatalogPost[]).filter(post =>
  post.language === 'tr' && post.title && post.slug && post.content
);

/**
 * Offline-safe article archive restored from catalog.json. The frontend used to
 * fall back to only three seed entries because /api/articles was missing.
 * Every article now has expert opinions evaluating its theses from subject-matter experts.
 */
export const RECOVERED_TURKISH_ARTICLES: Article[] = posts.map(post => {
  const seed = SEED_ARTICLES.find(article => normalizeTitle(article.title) === normalizeTitle(post.title));
  const publishedAt = asText(post.published) || seed?.publishedAt || '';
  const updatedAt = asText(post.updated) || seed?.updatedAt || publishedAt;
  const postId = asText(post.id) || post.slug;
  const generated = (generatedExpertOpinions as Record<string, ExpertOpinion[]>)[postId] || [];
  // Prefer seed opinions if present, otherwise use generated expert evaluations
  const expertOpinions: ExpertOpinion[] = (seed?.expertOpinions && seed.expertOpinions.length > 0)
    ? seed.expertOpinions
    : generated;
  return {
    ...(seed ?? {} as Article),
    id: postId,
    title: post.title,
    slug: post.slug,
    summary: asText(post.excerpt) || seed?.summary || post.title,
    content: asText(post.content) || seed?.content || '',
    cleanText: seed?.cleanText,
    publishedAt,
    updatedAt,
    url: asText(post.originalUrl) || seed?.url || `https://sci-phil.ai.studio/makale/${post.slug}`,
    author: asText(post.author) || seed?.author || 'Emre Pelit',
    authorAvatar: seed?.authorAvatar || '/author.jpg',
    categories: Array.isArray(post.categories) && post.categories.length ? post.categories : (seed?.categories || ['Genel']),
    language: 'tr',
    readingTimeMinutes: Math.max(1, Number(post.readingMinutes) || seed?.readingTimeMinutes || Math.ceil((Number(post.wordCount) || 180) / 200)),
    viewCount: seed?.viewCount ?? 0,
    expertOpinions,
    dialecticalTriad: {
      claim: seed?.dialecticalTriad?.claim || asText(post.claim) || asText(post.excerpt) || post.title,
      counterClaim: seed?.dialecticalTriad?.counterClaim || 'Bu teze karşı alternatif açıklamalar ve metodolojik itirazlar mevcut literatürde tartışılmaktadır; tez, bu karşı görüşlerle diyalektik bir çerçevede ele alınmalıdır.',
      whatIsNotEvidence: seed?.dialecticalTriad?.whatIsNotEvidence || asText(post.notProof) || 'Tekil örnekler, anekdotal gözlemler veya popüler yorumlar tek başına tezin kanıtı sayılamaz.',
      methodologicalNote: seed?.dialecticalTriad?.methodologicalNote || 'Tezin değerlendirilmesinde kavramsal netlik, ampirik test edilebilirlik ve alternatif hipotezlerin sistematik karşılaştırılması esastır.',
    },
    sourceBlog: 'emrepelit7337.blogspot.com',
    objections: seed?.objections || [],
  };
});

export const RECOVERED_ARTICLES_UPDATED_AT = RECOVERED_TURKISH_ARTICLES
  .map(article => article.updatedAt || article.publishedAt)
  .filter(Boolean)
  .sort()
  .at(-1) || null;
