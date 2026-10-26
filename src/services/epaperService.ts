/**
 * EPaper Service
 * Saare EPaper related API calls yahan hain.
 * Components mein directly fetch() mat karo — yeh service use karo.
 */

import { apiRequest } from './api';
import { API_BASE_URL, BACKEND_URL } from '@/config/env';
import { ENDPOINTS } from '@/constants/endpoints';
import {
  SaveSlotPayload,
  SavePagesBulkPayload,
  PublishPayload,
  AIAgentPayload,
} from '@/types/epaper';

// ─── In-memory Cache & Request Deduplication ─────────────────────
const responseCache = new Map<string, { data: any; expiry: number }>();
const inFlightRequests = new Map<string, Promise<any>>();

function getCleanUrl(url: string): string {
  if (!url) return '';
  if (typeof window !== 'undefined') {
    if (BACKEND_URL && url.startsWith(`${BACKEND_URL}/api/`)) {
      return url.replace(BACKEND_URL, '');
    }
    if (url.includes(':5000/api/')) {
      return url.replace(/https?:\/\/[^/]+:5000\/api\//, '/api/');
    }
    if (url.startsWith('/api')) {
      return url;
    }
  }
  return url;
}

async function cachedFetch(url: string, ttlMs: number = 60000): Promise<any> {
  const cleanUrl = getCleanUrl(url);
  const now = Date.now();
  const cached = responseCache.get(cleanUrl);
  if (cached && cached.expiry > now) {
    return cached.data;
  }

  // Return existing in-flight promise if same request is already pending
  if (inFlightRequests.has(cleanUrl)) {
    return inFlightRequests.get(cleanUrl)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(cleanUrl);
      if (!res.ok) {
        console.warn(`[epaperService] HTTP ${res.status} on ${cleanUrl}`);
        return null;
      }
      const data = await res.json();
      if (data && data.success) {
        responseCache.set(cleanUrl, { data, expiry: now + ttlMs });
      }
      return data;
    } catch (err) {
      console.warn(`[epaperService] network error on ${cleanUrl}:`, err);
      return null;
    } finally {
      inFlightRequests.delete(cleanUrl);
    }
  })();

  inFlightRequests.set(cleanUrl, promise);
  return promise;
}

/**
 * Invalidate cache on admin modifications
 */
export function invalidateEpaperCache(pattern?: string) {
  if (!pattern) {
    responseCache.clear();
  } else {
    responseCache.forEach((_, key) => {
      if (key.includes(pattern)) responseCache.delete(key);
    });
  }
}

/**
 * Silently wake up the Render backend in the background so it's ready when user clicks ePaper
 */
export function prewarmBackend() {
  if (typeof window === 'undefined') return;
  fetchStatesWithEditions().catch(() => {});
}

// ─── Public (Frontend) ───────────────────────────────────────────

/**
 * Sabhi states aur unki editions fetch karo (Cached 5 minutes)
 */
export async function fetchStatesWithEditions(): Promise<any[]> {
  try {
    const url = `${API_BASE_URL}${ENDPOINTS.epaper.statesWithEditions}`;
    const data = await cachedFetch(url, 300000);
    if (!data?.success || !Array.isArray(data.data)) return [];
    return data.data;
  } catch (err) {
    console.error('fetchStatesWithEditions error:', err);
    return [];
  }
}

/**
 * Kisi edition ke available archive dates fetch karo (Cached 3 minutes)
 */
export async function fetchArchiveDates(editionSlug: string): Promise<any[]> {
  try {
    const url = `${API_BASE_URL}${ENDPOINTS.epaper.archiveDates(editionSlug)}`;
    const data = await cachedFetch(url, 180000);
    if (!data?.success || !Array.isArray(data.data)) return [];
    return data.data;
  } catch (err) {
    console.error('fetchArchiveDates error:', err);
    return [];
  }
}

/**
 * Kisi edition + date ka issue fetch karo (Cached 60 seconds with instant deduplication)
 */
export async function fetchEpaperIssue(
  editionSlug: string,
  date: string
): Promise<any | null> {
  try {
    const url = `${API_BASE_URL}${ENDPOINTS.epaper.issue(editionSlug, date)}`;
    const data = await cachedFetch(url, 60000);
    if (!data?.success || !data.data) return null;
    return data.data;
  } catch (err) {
    console.error('fetchEpaperIssue error:', err);
    return null;
  }
}

/**
 * TTS audio stream URL generate karo
 */
export function getTtsAudioUrl(text: string): string {
  return getCleanUrl(`${API_BASE_URL}${ENDPOINTS.epaper.tts(text)}`);
}

// ─── Admin ────────────────────────────────────────────────────────

/**
 * Saari editions fetch karo (admin panel ke liye)
 */
export async function fetchAdminEditions(): Promise<any[]> {
  try {
    const res = await fetch(getCleanUrl(`${API_BASE_URL}${ENDPOINTS.epaper.editions}`));
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.success || !Array.isArray(data.data)) return [];
    return data.data;
  } catch (err) {
    console.warn('fetchAdminEditions error:', err);
    return [];
  }
}

/**
 * Ek slot save karo (admin canvas)
 */
export async function saveSlot(payload: SaveSlotPayload): Promise<void> {
  invalidateEpaperCache('issue');
  await apiRequest(ENDPOINTS.epaper.saveSlot, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Bulk pages save karo (admin canvas)
 */
export async function savePagesBulk(payload: SavePagesBulkPayload): Promise<void> {
  invalidateEpaperCache('issue');
  await apiRequest(ENDPOINTS.epaper.savePagesBulk, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Issue publish karo
 */
export async function publishIssue(payload: PublishPayload): Promise<any> {
  invalidateEpaperCache();
  return apiRequest(ENDPOINTS.epaper.publishIssue, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Legacy publish endpoint (fallback)
 */
export async function publishLegacy(payload: PublishPayload): Promise<any> {
  invalidateEpaperCache();
  return apiRequest(ENDPOINTS.epaper.publish, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * AI Assistant endpoint (generate newspaper slot content)
 */
export async function callAIAgent(payload: AIAgentPayload): Promise<any> {
  try {
    const res = await fetch(getCleanUrl(`${API_BASE_URL}${ENDPOINTS.epaper.aiAgent}`), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || `Error (${res.status})`);
    }
    return data.data;
  } catch (err) {
    console.warn('callAIAgent error:', err);
    return null;
  }
}

/**
 * PDF generate karo (multipart/form-data)
 */
export async function generatePdf(payload: any): Promise<Response> {
  const token =
    typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const isFormData = typeof FormData !== 'undefined' && payload instanceof FormData;

  const headers: Record<string, string> = {};
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(
    getCleanUrl(`${API_BASE_URL}${ENDPOINTS.epaper.generatePdf}`),
    {
      method: 'POST',
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    }
  );
  return response;
}
