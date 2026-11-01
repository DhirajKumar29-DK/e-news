import { apiRequest } from './api';
import { ENDPOINTS } from '@/constants/endpoints';

export interface ModelOption {
  id: string;
  name: string;
  context: string;
  isVerified?: boolean;
}

export interface ProviderStatus {
  hasApiKey: boolean;
  maskedKey: string;
  selectedModel: string;
  cachedModels: ModelOption[];
  isVerified: boolean;
  lastTestedAt?: string | null;
  lastLatencyMs?: number | null;
}

export interface AiSettingsData {
  activeProvider: 'gemini' | 'groq' | 'openai' | 'claude' | 'deepseek' | string;
  enabled: boolean;
  temperature: number;
  maxTokens: number;
  topP: number;
  languageOverride: string;
  customWelcomeGreeting?: string;
  providers: Record<string, ProviderStatus>;
  updatedAt?: string;
}

export interface AiSettingsResponse {
  success: boolean;
  message: string;
  data: AiSettingsData;
}

export interface TestConnectionPayload {
  provider: string;
  model?: string;
  apiKey?: string;
}

export interface TestConnectionResult {
  success: boolean;
  provider: string;
  model: string;
  latencyMs?: number;
  message: string;
  error?: string;
  sampleResponse?: string;
}

export interface FetchModelsResponse {
  success: boolean;
  message: string;
  data: {
    provider: string;
    models: ModelOption[];
  };
}

export interface AiTokenUsageData {
  provider: string;
  activeProvider: string;
  date: string;
  today: {
    tokensUsed: number;
    promptTokens: number;
    completionTokens: number;
    requestCount: number;
    percentageUsed: number | null;
    quotaLimit: number | null;
    remainingTokens: number | null;
  };
  quotaSpec: {
    quotaType: 'DAILY' | 'WALLET';
    name: string;
    dailyQuotaTokens?: number | null;
    dailyQuotaLabel: string;
    resetSchedule: string;
    billingType: string;
    quotaBadge: string;
    isFree: boolean;
  };
  lifetime: {
    totalTokens: number;
    totalRequests: number;
  };
  allProvidersToday: Record<string, {
    tokensUsed: number;
    requestCount: number;
  }>;
}

export const aiSettingsService = {
  async getSettings(): Promise<AiSettingsData> {
    const res = await apiRequest<AiSettingsResponse>(ENDPOINTS.aiSettings.get, {
      method: 'GET'
    });
    return res.data;
  },

  async fetchModels(provider: string, apiKey?: string): Promise<ModelOption[]> {
    const res = await apiRequest<FetchModelsResponse>(ENDPOINTS.aiSettings.models, {
      method: 'POST',
      body: JSON.stringify({ provider, apiKey })
    });
    return res.data?.models || [];
  },

  async updateSettings(payload: any): Promise<AiSettingsData> {
    const res = await apiRequest<AiSettingsResponse>(ENDPOINTS.aiSettings.update, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
    return res.data;
  },

  async testConnection(payload: TestConnectionPayload): Promise<TestConnectionResult> {
    const res = await apiRequest<{ success: boolean; data: TestConnectionResult; message: string }>(
      ENDPOINTS.aiSettings.testConnection,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    return res.data;
  },

  async revealKey(provider: string): Promise<string> {
    const res = await apiRequest<{ success: boolean; data: { apiKey: string } }>(
      ENDPOINTS.aiSettings.revealKey,
      {
        method: 'POST',
        body: JSON.stringify({ provider })
      }
    );
    return res.data?.apiKey || '';
  },

  async getUsageStats(provider?: string): Promise<AiTokenUsageData> {
    const url = typeof (ENDPOINTS.aiSettings as any).usage === 'function'
      ? (ENDPOINTS.aiSettings as any).usage(provider)
      : (ENDPOINTS.aiSettings as any).usage;
    const res = await apiRequest<{ success: boolean; data: AiTokenUsageData }>(url, {
      method: 'GET'
    });
    return res.data;
  }
};
