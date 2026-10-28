import { API_BASE_URL } from '@/config/env';
import { apiRequest } from './api';

export type AdSlotType =
  | 'HOMEPAGE_TOP'
  | 'LATEST_VIDEOS_TOP'
  | 'HOMEPAGE_SECTION_1'
  | 'HOMEPAGE_SECTION_2'
  | 'HOMEPAGE_SECTION_3'
  | 'HOMEPAGE_SECTION_4'
  | 'HOMEPAGE_SECTION_5'
  | 'HOMEPAGE_SECTION_6'
  | 'HOMEPAGE_SECTION_7'
  | 'HOMEPAGE_SECTION_8'
  | 'HOMEPAGE_BEFORE_VIDEOS'
  | 'HOMEPAGE_BOTTOM'
  | 'ARTICLE_INLINE'
  | 'ARTICLE_SIDEBAR'
  | 'ARTICLE_LATEST_VIDEOS'
  | 'ARTICLE_BOTTOM'
  | string;
export type AdFormatType = 'IMAGE' | 'SCRIPT';

export interface AdvertisementData {
  id: string;
  title: string;
  slot: AdSlotType;
  type: AdFormatType;
  imageUrl?: string | null;
  targetUrl?: string | null;
  scriptCode?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  viewsCount: number;
  clicksCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdsQuery {
  slot?: AdSlotType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface AdsResponse {
  ads: AdvertisementData[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const adService = {
  // Public: Get active ad for a slot
  async getPublicAd(slot: AdSlotType): Promise<AdvertisementData | null> {
    try {
      const res = await apiRequest<{ success: boolean; data: AdvertisementData | null }>(
        `/ads/public?slot=${encodeURIComponent(slot)}`
      );
      return res.data;
    } catch {
      return null;
    }
  },

  // Public: Record click
  async recordClick(id: string): Promise<void> {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;
      fetch(`${apiUrl}/ads/${id}/click`, { method: 'POST', keepalive: true }).catch(() => {});
    } catch {}
  },

  // Admin: List all ads
  async getAllAds(query: AdsQuery = {}): Promise<AdsResponse> {
    const params = new URLSearchParams();
    if (query.slot) params.append('slot', query.slot);
    if (typeof query.isActive !== 'undefined') params.append('isActive', String(query.isActive));
    if (query.page) params.append('page', String(query.page));
    if (query.limit) params.append('limit', String(query.limit));

    const res = await apiRequest<{ success: boolean; data: AdsResponse }>(
      `/ads?${params.toString()}`
    );
    return res.data;
  },

  // Admin: Get single ad
  async getAdById(id: string): Promise<AdvertisementData> {
    const res = await apiRequest<{ success: boolean; data: AdvertisementData }>(
      `/ads/${id}`
    );
    return res.data;
  },

  // Admin: Create new ad
  async createAd(data: Partial<AdvertisementData>): Promise<AdvertisementData> {
    const res = await apiRequest<{ success: boolean; data: AdvertisementData }>('/ads', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // Admin: Update ad
  async updateAd(id: string, data: Partial<AdvertisementData>): Promise<AdvertisementData> {
    const res = await apiRequest<{ success: boolean; data: AdvertisementData }>(`/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // Admin: Delete ad
  async deleteAd(id: string): Promise<void> {
    await apiRequest(`/ads/${id}`, {
      method: 'DELETE'
    });
  },

  // Admin: Upload image banner
  async uploadBanner(file: File): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;
    const res = await fetch(`${apiUrl}/ads/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Ad banner upload failed');
    }
    return data.data.imageUrl;
  }
};
