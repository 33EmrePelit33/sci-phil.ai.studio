/**
 * Science & Philosophy - Article Catalog & Search Engine
 * Manages article index, dynamic multi-filter search, category grouping, and pagination.
 */

import { slugifyTurkish, htmlToPlainText } from './blogger-sync.js';

export class ArticleCatalog {
  constructor(articles = []) {
    this.rawArticles = [];
    this.catalog = [];
    this.categories = new Set();
    this.tags = new Set();
    
    if (articles.length > 0) {
      this.loadArticles(articles);
    }
  }

  /**
   * Normalizes and loads article dataset into catalog memory
   */
  loadArticles(items) {
    this.rawArticles = Array.isArray(items) ? items : [];
    this.categories.clear();
    this.tags.clear();

    this.catalog = this.rawArticles.map(item => {
      const title = item.title || 'Başlıksız Makale';
      const slug = item.slug || slugifyTurkish(title);
      const plainContent = htmlToPlainText(item.contentHtml || item.rawContent || '');
      const category = item.category || this.detectCategory(title, plainContent);
      const tags = Array.isArray(item.tags) ? item.tags : this.extractTags(title, plainContent);

      this.categories.add(category);
      tags.forEach(tag => this.tags.add(tag));

      return {
        id: item.id || slug,
        title,
        slug,
        category,
        tags,
        contentHtml: item.contentHtml || '',
        plainText: plainContent,
        excerpt: plainContent.slice(0, 220) + (plainContent.length > 220 ? '...' : ''),
        publishedAt: item.publishedAt || new Date().toISOString(),
        sourceUrl: item.url || item.sourceUrl || '',
        author: item.author || 'Emre Pelit',
        language: item.language || 'tr'
      };
    });

    // Sort catalog by date descending
    this.catalog.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
  }

  /**
   * Automatic category classification based on content keywords
   */
  detectCategory(title, text) {
    const fullText = `${title} ${text}`.toLowerCase('tr-TR');
    
    if (/fizik|kuantum|termodinamik|higgs|kara delik|entropi|görelilik/.test(fullText)) {
      return 'Teorik Fizik & Kozmoloji';
    }
    if (/epistemoloji|epistemolojik|bilgi felsefesi|şuur|bilinç|zihin|felsefe/.test(fullText)) {
      return 'Felsefe & Zihin';
    }
    if (/kelam|kelâm|ilahiyat|tanrı|vahid|yaratılış|din/.test(fullText)) {
      return 'Kelâm & Teoloji';
    }
    if (/yapay zeka|llm|algoritma|model|bilgisayar|yazılım/.test(fullText)) {
      return 'Yapay Zeka & Teknoloji';
    }
    return 'Genel Bilim';
  }

  /**
   * Automatic tag extraction from content
   */
  extractTags(title, text) {
    const fullText = `${title} ${text}`.toLowerCase('tr-TR');
    const potentialTags = [
      'Entropi', 'Kuantum', 'Higgs', 'Zihin', 'Şuur', 'Kelâm', 
      'Evren', 'LLM', 'Görelesellik', 'Epistemoloji', 'Karadelik'
    ];
    return potentialTags.filter(tag => fullText.includes(tag.toLowerCase('tr-TR')));
  }

  /**
   * Filter and search through the catalog
   */
  filter({ query = '', category = null, tag = null, language = null }) {
    let results = [...this.catalog];

    if (category) {
      results = results.filter(item => item.category === category);
    }

    if (tag) {
      results = results.filter(item => item.tags.includes(tag));
    }

    if (language) {
      results = results.filter(item => item.language === language);
    }

    if (query && query.trim() !== '') {
      const cleanQuery = query.toLocaleLowerCase('tr-TR').trim();
      results = results.filter(item => 
        item.title.toLocaleLowerCase('tr-TR').includes(cleanQuery) ||
        item.plainText.toLocaleLowerCase('tr-TR').includes(cleanQuery) ||
        item.tags.some(t => t.toLocaleLowerCase('tr-TR').includes(cleanQuery))
      );
    }

    return results;
  }

  /**
   * Get paginated dataset for UI views
   */
  getPaginated({ page = 1, pageSize = 10, items = null }) {
    const targetItems = items || this.catalog;
    const totalItems = targetItems.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const currentPage = Math.max(1, Math.min(page, totalPages));
    
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedItems = targetItems.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      pagination: {
        currentPage,
        pageSize,
        totalItems,
        totalPages,
        hasNext: currentPage < totalPages,
        hasPrev: currentPage > 1
      }
    };
  }

  /**
   * Find single article by slug
   */
  getBySlug(slug) {
    return this.catalog.find(item => item.slug === slug) || null;
  }

  getCategoriesList() {
    return Array.from(this.categories);
  }

  getTagsList() {
    return Array.from(this.tags);
  }
}