import { apiRequest } from './api';

export interface HoroscopeData {
  id?: string;
  sign: string;
  signName: string;
  hindiName?: string | null;
  dateRange?: string | null;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'LOVE';
  luckyColour?: string | null;
  luckyGemstone?: string | null;
  luckyDay?: string | null;
  luckyNumber?: string | null;
  rulingPlanet?: string | null;
  compatibleSign?: string | null;
  prediction: string;
  remedy?: string | null;
  date?: string | null;
  updatedAt?: string;
}

export const horoscopeService = {
  // 1. Get Horoscope for a specific sign and period
  async getHoroscope(sign: string, period: string = 'DAILY'): Promise<HoroscopeData> {
    const res = await apiRequest<{ success: boolean; data: HoroscopeData }>(
      `/horoscope?sign=${encodeURIComponent(sign.toLowerCase())}&period=${encodeURIComponent(period.toUpperCase())}`
    );
    return res.data;
  },

  // 2. Get all 12 signs for a given period
  async getAllHoroscopes(period: string = 'DAILY'): Promise<HoroscopeData[]> {
    const res = await apiRequest<{ success: boolean; data: HoroscopeData[] }>(
      `/horoscope/all?period=${encodeURIComponent(period.toUpperCase())}`
    );
    return res.data;
  },

  // 3. Upsert / Update Horoscope (Admin)
  async updateHoroscope(data: Partial<HoroscopeData>): Promise<HoroscopeData> {
    const res = await apiRequest<{ success: boolean; message: string; data: HoroscopeData }>(
      '/horoscope',
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    return res.data;
  }
};
