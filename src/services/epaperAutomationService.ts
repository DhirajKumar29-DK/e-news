import { API_BASE_URL, BACKEND_URL } from '@/config/env';
import { ENDPOINTS } from '@/constants/endpoints';

export interface PageBlueprint {
  id?: number;
  configId?: number;
  pageNumber: number;
  pageTitle: string;
  headerType: 'grand' | 'folio' | string;
  targetTopic: string;
  slotCount: number;
  order: number;
  isActive: boolean;
}

export interface AutomationConfig {
  id: number;
  editionSlug: string;
  isEnabled: boolean;
  scheduleTime: string;
  timezone: string;
  targetCity: string;
  totalPages: number;
  autoPublish: boolean;
  createdAt?: string;
  updatedAt?: string;
  blueprints: PageBlueprint[];
}

export interface ScheduleJobLog {
  id: number;
  configId?: number;
  editionSlug: string;
  targetDate: string;
  status: 'GENERATING' | 'AWAITING_APPROVAL' | 'PUBLISHED' | 'FAILED' | string;
  pagesGenerated: number;
  totalPages: number;
  errorMessage?: string | null;
  executionLog?: any;
  startedAt: string;
  completedAt?: string | null;
}

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

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export const epaperAutomationService = {
  /**
   * Fetch current automation config & page blueprints for an edition
   */
  async getConfig(editionSlug: string = 'patna-main'): Promise<AutomationConfig> {
    const endpoint = ENDPOINTS.epaper.automationConfig(editionSlug);
    const url = getCleanUrl(`${API_BASE_URL}${endpoint}`);
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch automation config');
    }
    return json.data;
  },

  /**
   * Save / update automation config & blueprints
   */
  async updateConfig(payload: {
    editionSlug: string;
    isEnabled?: boolean;
    scheduleTime?: string;
    targetCity?: string;
    autoPublish?: boolean;
    blueprints?: PageBlueprint[];
  }): Promise<AutomationConfig> {
    const endpoint = ENDPOINTS.epaper.updateAutomationConfig;
    const url = getCleanUrl(`${API_BASE_URL}${endpoint}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update automation config');
    }
    return json.data;
  },

  /**
   * Fetch generation execution job logs
   */
  async getHistory(editionSlug: string = 'patna-main', limit: number = 15): Promise<ScheduleJobLog[]> {
    const endpoint = ENDPOINTS.epaper.automationHistory(editionSlug, limit);
    const url = getCleanUrl(`${API_BASE_URL}${endpoint}`);
    const res = await fetch(url, {
      method: 'GET',
      headers: getAuthHeaders(),
      cache: 'no-store'
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to fetch automation history');
    }
    return json.data || [];
  },

  /**
   * Manually trigger full edition generation
   */
  async triggerGeneration(editionSlug: string = 'patna-main', targetDate?: string): Promise<any> {
    const endpoint = ENDPOINTS.epaper.automationTrigger;
    const url = getCleanUrl(`${API_BASE_URL}${endpoint}`);
    const res = await fetch(url, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        editionSlug,
        targetDate: targetDate || new Date().toISOString().split('T')[0],
        async: true
      })
    });
    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to trigger edition generation');
    }
    return json.data;
  }
};
