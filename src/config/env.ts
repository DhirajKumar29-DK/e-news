/**
 * Application Environment Configuration
 * 
 * Works seamlessly in:
 * 1. Local Development (http://localhost:5000)
 * 2. Render / Railway / Custom Backend deployment (e.g. https://api.yourdomain.com)
 * 3. Custom Domain (Vercel + Custom Domain)
 */

export const BACKEND_URL: string = (
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  'http://localhost:5000'
).replace(/\/$/, '');

export const API_BASE_URL: string = (
  process.env.NEXT_PUBLIC_API_URL ||
  `${BACKEND_URL}/api/v1`
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
  return `${BACKEND_URL}${cleanPath}`;
}
