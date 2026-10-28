export const PRODUCTION_CANONICAL_ORIGIN = 'https://news.aiwcrm.in';

/**
 * Returns the authoritative self-canonical URL for an article.
 * Format: https://news.aiwcrm.in/article/:slug (or :id)
 * Consistent across Admin UI, SSR HTML, and XML Sitemap.
 */
export function getArticleCanonicalUrl(article?: { slug?: string | null; id?: string | null } | null): string {
  if (!article) return `${PRODUCTION_CANONICAL_ORIGIN}/`;
  const identifier = (article.slug || article.id || '').trim();
  if (!identifier) return `${PRODUCTION_CANONICAL_ORIGIN}/`;
  const clean = identifier.replace(/^\/+/, '').replace(/\/+$/, '');
  return `${PRODUCTION_CANONICAL_ORIGIN}/article/${clean}`;
}

/**
 * Generates preview slug from headline for UI display before save.
 */
export function slugifyHeadline(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

/**
 * Ensures media URLs used in Open Graph and JSON-LD are genuine, valid absolute public URLs.
 * If the image is missing, empty, or points to an unverified development host (localhost/render),
 * returns undefined so structured data cleanly omits the image rather than inventing one.
 */
export function getSafeMediaUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  const trimmed = url.trim();
  if (!trimmed) return undefined;

  // Obsolete development/testing hostnames: omit from structured data
  if (
    trimmed.startsWith('http://localhost') ||
    trimmed.startsWith('https://localhost') ||
    trimmed.includes('onrender.com')
  ) {
    return undefined;
  }

  // Valid absolute public URL (CDN, S3, production backend, verified external source)
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Relative upload paths on production backend
  const clean = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  return `https://backendnews.aiwcrm.in${clean}`;
}
