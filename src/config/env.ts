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
  (isClient ? window.location.origin : 'http://localhost:5000')
).replace(/\/$/, '');

export const API_BASE_URL: string = (
  process.env.NEXT_PUBLIC_API_URL ||
  (isClient ? '/api/v1' : 'http://localhost:5000/api/v1')
).replace(/\/$/, '');

/**
 * Converts any media path (uploaded PDF, generated page WebP, article photo)
 * to a full, valid URL whether running locally or on a custom domain.
 */
export function getFullMediaUrl(path?: string | null): string {
  if (!path) return '';
  // Already a full URL (CDN, Cloudinary, S3, external source, or data URL)
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;

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
