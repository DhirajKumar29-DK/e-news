/**
 * EPaper Service
 * Saare EPaper related API calls yahan hain.
 * Components mein directly fetch() mat karo — yeh service use karo.
 */

import { apiRequest } from './api';
import { API_BASE_URL } from '@/config/env';
import { ENDPOINTS } from '@/constants/endpoints';
import {
  SaveSlotPayload,
  SavePagesBulkPayload,
  PublishPayload,
  AIAgentPayload,
} from '@/types/epaper';

// ─── Public (Frontend) ───────────────────────────────────────────

/**
 * Sabhi states aur unki editions fetch karo
 */
export async function fetchStatesWithEditions(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.epaper.statesWithEditions}`);
  if (!res.ok) throw new Error('Failed to fetch states with editions');
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];
  return data.data;
}

/**
 * Kisi edition ke available archive dates fetch karo
 */
export async function fetchArchiveDates(editionSlug: string): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.epaper.archiveDates(editionSlug)}`);
  if (!res.ok) throw new Error('Failed to fetch archive dates');
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];
  return data.data;
}

/**
 * Kisi edition + date ka issue fetch karo
 */
export async function fetchEpaperIssue(
  editionSlug: string,
  date: string
): Promise<any | null> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.epaper.issue(editionSlug, date)}`);
  const data = await res.json();
  if (!data.success || !data.data) return null;
  return data.data;
}

/**
 * TTS audio stream URL generate karo
 */
export function getTtsAudioUrl(text: string): string {
  return `${API_BASE_URL}${ENDPOINTS.epaper.tts(text)}`;
}

// ─── Admin ────────────────────────────────────────────────────────

/**
 * Saari editions fetch karo (admin panel ke liye)
 */
export async function fetchAdminEditions(): Promise<any[]> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.epaper.editions}`);
  if (!res.ok) throw new Error('Failed to fetch editions');
  const data = await res.json();
  if (!data.success || !Array.isArray(data.data)) return [];
  return data.data;
}

/**
 * Ek slot save karo (admin canvas)
 */
export async function saveSlot(payload: SaveSlotPayload): Promise<void> {
  await apiRequest(ENDPOINTS.epaper.saveSlot, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Bulk pages save karo (admin canvas)
 */
export async function savePagesBulk(payload: SavePagesBulkPayload): Promise<void> {
  await apiRequest(ENDPOINTS.epaper.savePagesBulk, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Issue publish karo
 */
export async function publishIssue(payload: PublishPayload): Promise<any> {
  return apiRequest(ENDPOINTS.epaper.publishIssue, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Legacy publish endpoint (fallback)
 */
export async function publishLegacy(payload: PublishPayload): Promise<any> {
  return apiRequest(ENDPOINTS.epaper.publish, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * AI Assistant endpoint (generate newspaper slot content)
 */
export async function callAIAgent(payload: AIAgentPayload): Promise<any> {
  const res = await fetch(`${API_BASE_URL}${ENDPOINTS.epaper.aiAgent}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.message || `Error (${res.status})`);
  }
  return data.data;
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
    `${API_BASE_URL}${ENDPOINTS.epaper.generatePdf}`,
    {
      method: 'POST',
      headers,
      body: isFormData ? payload : JSON.stringify(payload),
    }
  );
  return response;
}
