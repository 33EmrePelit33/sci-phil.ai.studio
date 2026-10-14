import { Article } from '../types/article';
import { SEED_ARTICLES } from './seedArticles';
import { FEATURED_70TH_ARTICLE } from './featuredArticle';
import turkishCatalog from './turkishCatalog.json';

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

const baseArticles: Article[] = posts.map(post => {
  const seed = SEED_ARTICLES.find(article => normalizeTitle(article.title) === normalizeTitle(post.title));
  const publishedAt = asText(post.published) || seed?.publishedAt || '';
  const updatedAt = asText(post.updated) || seed?.updatedAt || publishedAt;
  return {
    ...(seed ?? {} as Article),
    id: asText(post.id) || seed?.id || post.slug,
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
    dialecticalTriad: {
      claim: seed?.dialecticalTriad?.claim || asText(post.claim) || asText(post.excerpt) || post.title,
      counterClaim: seed?.dialecticalTriad?.counterClaim || '',
      whatIsNotEvidence: seed?.dialecticalTriad?.whatIsNotEvidence || asText(post.notProof) || '',
      methodologicalNote: seed?.dialecticalTriad?.methodologicalNote,
    },
    sourceBlog: 'emrepelit7337.blogspot.com',
    objections: seed?.objections || [],
  };
});

/**
 * Offline-safe complete article archive (all 70 original Turkish articles)
 * combined with the live Blogger feed for continuous synchronization.
 */
export const RECOVERED_TURKISH_ARTICLES: Article[] = [
  ...(baseArticles.some(a => a.id === FEATURED_70TH_ARTICLE.id || a.slug === FEATURED_70TH_ARTICLE.slug)
    ? []
    : [FEATURED_70TH_ARTICLE]),
  ...baseArticles
];

export const RECOVERED_ARTICLES_UPDATED_AT = RECOVERED_TURKISH_ARTICLES
  .map(article => article.updatedAt || article.publishedAt)
  .filter(Boolean)
  .sort()
  .at(-1) || null;
