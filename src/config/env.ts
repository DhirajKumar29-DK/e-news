/**
 * Application Environment Configuration
 * 
 * Works seamlessly in:
 * 1. Local Development (http://localhost:5000)
 * 2. Render / Railway / Custom Backend deployment (e.g. https://api.yourdomain.com)
 * 3. Custom Domain (Vercel + Custom Domain)
 */

const isClient = typeof window !== 'undefined';

export const BACKEND_URL: string = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (isClient ? window.location.origin : 'https://backendnews.aiwcrm.in')
).replace(/\/$/, '');

export const API_BASE_URL: string = (
  process.env.NEXT_PUBLIC_API_URL ||
  (isClient ? '/api/v1' : `${BACKEND_URL}/api/v1`)
).replace(/\/$/, '');

/**
 * Automatically resolves the public site URL:
 * 1. NEXT_PUBLIC_SITE_URL if configured (e.g. https://yourcustomdomain.com)
 * 2. VERCEL_PROJECT_PRODUCTION_URL or VERCEL_URL provided automatically by Vercel
 * 3. Client-side browser origin
 * 4. Production fallback: https://e-news-ebon.vercel.app
 * 5. Localhost fallback: http://localhost:3000
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const raw = process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, '');
    return raw.startsWith('http') ? raw : `https://${raw}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, '')}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, '')}`;
  }
  if (isClient && window.location.origin && !window.location.origin.includes('localhost')) {
    return window.location.origin.replace(/\/$/, '');
  }
  if (process.env.NODE_ENV === 'production') {
    return 'https://news.aiwcrm.in';
  }
  return 'http://localhost:3000';
}

export const SITE_URL: string = getSiteUrl();

/**
 * Converts any media path (uploaded PDF, generated page WebP, article photo)
 * to a full, valid URL whether running locally or on a custom domain.
 */
export function getFullMediaUrl(path?: string | null): string {
  if (!path) return '';
  // Fix historical localhost URLs in database
  if (path.startsWith('http://localhost:5000/')) {
    path = path.replace('http://localhost:5000/', `${BACKEND_URL}/`);
  }
  // Already a full URL (CDN, Cloudinary, S3, external source, or data URL)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  // In local development, fetch directly from local backend server
  if (isClient && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return `http://localhost:5000${cleanPath}`;
  }

  // If path is an upload (/uploads/...), route through /backend-uploads/ proxy on client
  if (cleanPath.startsWith('/uploads/')) {
    const sub = cleanPath.slice('/uploads/'.length);
    return `/backend-uploads/${sub}`;
  }

  let hostUrl = BACKEND_URL;
  if (isClient && window.location.hostname && window.location.hostname !== 'localhost') {
    hostUrl = window.location.origin;
  }
  return `${hostUrl}${cleanPath}`;
}
