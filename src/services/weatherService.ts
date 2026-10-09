/**
 * Weather Service
 * Connects to e-news-backend (/api/v1/weather) with in-memory caching and fallback data.
 */

import { API_BASE_URL } from '@/config/env';

export interface WeatherState {
  id: string;
  name: string;
  slug: string;
  order: number;
  cities?: WeatherCity[];
}

export interface WeatherCity {
  id: string;
  stateId: string;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  monumentIcon?: string;
  isMainCity?: boolean;
  stateName?: string;
}

export interface MainCityWeather {
  id: string;
  name: string;
  slug: string;
  stateName: string;
  stateSlug: string;
  latitude: number;
  longitude: number;
  monumentIcon?: string;
  temp: string;
  humidity: number;
  condition: string;
  conditionIcon: string;
  aqi: number;
  aqiStatus: string;
  aqiBadge: string;
  aqiColor: string;
  aqiBg: string;
  pm25: number;
  pm10: number;
}

export interface DayForecast {
  date: string;
  dayName: string;
  formattedDate: string;
  maxTemp: string;
  minTemp: string;
  temp: string;
  condition: string;
  icon: string;
}

export interface CityForecastData {
  city: {
    id: string;
    name: string;
    slug: string;
    stateName: string;
    stateSlug: string;
    latitude: number;
    longitude: number;
    monumentIcon?: string;
  };
  current: {
    temp: string;
    feelsLike: number;
    condition: string;
    conditionIcon: string;
    humidity: number;
    windSpeed: string;
    windDirection: string;
    pressure: string;
    uvIndex: string;
    minTemp: string;
    maxTemp: string;
    sunrise: string;
    sunset: string;
    lastUpdated: string;
  };
  aqi: {
    value: number;
    status: string;
    badge: string;
    color: string;
    bg: string;
    pm25: number;
    pm10: number;
  };
  weeklyForecast: DayForecast[];
}

// In-memory cache for ultra-fast instant UI rendering
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

async function fetchWithCache<T>(url: string): Promise<T> {
  const cached = cache.get(url);
  const now = Date.now();
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.success && json.data) {
    cache.set(url, { data: json.data, timestamp: now });
    return json.data;
  }
  throw new Error(json.message || 'Failed to fetch weather data');
}

export const weatherService = {
  // 1. Get all states with nested cities
  async getStates(): Promise<WeatherState[]> {
    try {
      return await fetchWithCache<WeatherState[]>(`${API_BASE_URL}/weather/states`);
    } catch (err) {
      console.warn('Failed to fetch states from backend:', err);
      return [];
    }
  },

  // 2. Get cities by stateId
  async getCities(stateId?: string): Promise<WeatherCity[]> {
    try {
      const url = stateId
        ? `${API_BASE_URL}/weather/cities?stateId=${encodeURIComponent(stateId)}`
        : `${API_BASE_URL}/weather/cities`;
      return await fetchWithCache<WeatherCity[]>(url);
    } catch (err) {
      console.warn('Failed to fetch cities from backend:', err);
      return [];
    }
  },

  // 3. Get Main Cities grid with live weather + AQI
  async getMainCitiesWeather(): Promise<MainCityWeather[]> {
    try {
      return await fetchWithCache<MainCityWeather[]>(`${API_BASE_URL}/weather/main-cities`);
    } catch (err) {
      console.warn('Failed to fetch main cities weather from backend:', err);
      return [];
    }
  },

  // 4. Get detailed city weather forecast & AQI by city slug
  async getCityForecast(citySlug: string): Promise<CityForecastData | null> {
    try {
      return await fetchWithCache<CityForecastData>(`${API_BASE_URL}/weather/forecast/${encodeURIComponent(citySlug)}`);
    } catch (err) {
      console.warn(`Failed to fetch forecast for ${citySlug}:`, err);
      return null;
    }
  }
};
