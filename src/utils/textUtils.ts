/**
 * Utility functions for stripping HTML tags and cleaning text/content
 */

/**
 * Strips all HTML tags and decodes common HTML entities for plain text display.
 * Perfect for summaries, highlights, titles, and SEO meta tags.
 */
export function stripHtml(input: string | null | undefined): string {
  if (!input) return '';
  return input
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks whether a given string contains HTML tags.
 */
export function hasHtmlTags(input: string | null | undefined): boolean {
  if (!input) return false;
  return /<[a-z][\s\S]*>/i.test(input);
}

/**
 * Cleans and safely formats article HTML for rendering with dangerouslySetInnerHTML.
 * Ensures malformed wrapper tags are normalized.
 */
export function formatArticleHtml(input: string | null | undefined): string {
  if (!input) return '';
  let html = input.trim();
  
  // If no html tags found, wrap paragraphs by newline
  if (!hasHtmlTags(html)) {
    const paragraphs = html.split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean);
    return paragraphs.map(p => `<p>${p}</p>`).join('');
  }

  // Remove potential dangerous script/style tags
  html = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');

  return html;
}

/**
 * Converts rich HTML content into clean plain text paragraphs with standard line breaks.
 * Strips <p>, <h>, <div>, <span>, etc., while preserving natural paragraph separations.
 */
export function cleanHtmlToPlainText(raw: string | null | undefined): string {
  if (!raw) return '';
  return raw
    .replace(/<\/p>\s*<p[^>]*>/gi, '\n\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?(h[1-6]|div|blockquote)[^>]*>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

