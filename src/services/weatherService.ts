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

function getCleanUrl(url: string): string {
  if (!url) return '';
  if (typeof window !== 'undefined') {
    if (url.includes(':5000/api/')) {
      return url.replace(/https?:\/\/[^/]+:5000\/api\//, '/api/');
    }
    if (url.startsWith('/api')) {
      return url;
    }
  }
  return url;
}

async function fetchWithCache<T>(url: string): Promise<T> {
  const cleanUrl = getCleanUrl(url);
  const cached = cache.get(cleanUrl);
  const now = Date.now();
  if (cached && (now - cached.timestamp < CACHE_TTL_MS)) {
    return cached.data;
  }

  try {
    const res = await fetch(cleanUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (json.success && json.data) {
      cache.set(cleanUrl, { data: json.data, timestamp: now });
      return json.data;
    }
    throw new Error(json.message || 'Failed to fetch weather data');
  } catch (err) {
    console.warn(`[weatherService] fetch error on ${cleanUrl}:`, err);
    throw err;
  }
}

// Top 15 State & UT Capitals of India with New Delhi & Patna as top priority
export const STATE_CAPITALS_ORDER: string[] = [
  'new-delhi',           // Delhi (National Capital) - #1 Priority
  'patna',               // Bihar - #2 Priority
  'lucknow',             // Uttar Pradesh
  'mumbai',              // Maharashtra
  'jaipur',              // Rajasthan
  'kolkata',             // West Bengal
  'bengaluru',           // Karnataka
  'chennai',             // Tamil Nadu
  'hyderabad',           // Telangana
  'ranchi',              // Jharkhand
  'raipur',              // Chhattisgarh
  'chandigarh',          // Punjab & Haryana
  'bhubaneswar',         // Odisha
  'dehradun',            // Uttarakhand
  'shimla'               // Himachal Pradesh
];

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

  // 3. Get Main Cities grid with live weather + AQI (Strictly 15 State Capitals, New Delhi & Patna first)
  async getMainCitiesWeather(): Promise<MainCityWeather[]> {
    try {
      const rawCities = await fetchWithCache<MainCityWeather[]>(`${API_BASE_URL}/weather/main-cities`);
      const bySlug = new Map(rawCities.map((c) => [c.slug.toLowerCase(), c]));

      // Filter and order strictly the 15 state capitals
      const orderedList: MainCityWeather[] = [];
      for (const slug of STATE_CAPITALS_ORDER) {
        const found = bySlug.get(slug);
        if (found) {
          orderedList.push(found);
        }
      }

      return orderedList.slice(0, 15);
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
  },

  // 5. Get live temperature string for city & optional date (e.g. "32°C")
  async getCityTemperature(cityName?: string, dateStr?: string): Promise<string> {
    try {
      const slug = resolveCitySlug(cityName);
      const forecast = await this.getCityForecast(slug);
      if (!forecast) return '31°C';

      // Clean date string to YYYY-MM-DD
      const targetDate = dateStr
        ? (dateStr.includes('T') ? dateStr.split('T')[0] : dateStr.trim())
        : new Date().toISOString().split('T')[0];

      let tempVal: string | number | undefined;

      // Match exact date if provided in weeklyForecast
      if (forecast.weeklyForecast && Array.isArray(forecast.weeklyForecast)) {
        const match = forecast.weeklyForecast.find((d) => d.date === targetDate || d.date.startsWith(targetDate));
        if (match) {
          tempVal = match.temp || match.maxTemp;
        }
      }

      // Fallback to current live temperature
      if (!tempVal && forecast.current) {
        tempVal = forecast.current.temp;
      }

      if (tempVal !== undefined && tempVal !== null && tempVal !== '') {
        const num = Math.round(Number(tempVal));
        if (!isNaN(num)) return `${num}°C`;
      }
      return '31°C';
    } catch {
      return '31°C';
    }
  }
};

export const POPULAR_WEATHER_CITIES: string[] = [
  'पटना',
  'दिल्ली NCR',
  'आगरा',
  'लखनऊ',
  'मुजफ्फरपुर',
  'गया',
  'भागलपुर',
  'राँची',
  'जयपुर',
  'भोपाल',
  'इंदौर',
  'वाराणसी',
  'कानपुर',
  'गोरखपुर',
  'मेरठ',
  'प्रयागराज',
  'बरेली',
  'अयोध्या',
  'देहरादून',
  'रायपुर',
  'चंडीगढ़',
  'मुंबई',
  'कोलकाता'
];

const HINDI_CITY_TO_SLUG: Record<string, string> = {
  'आगरा': 'agra', 'agra': 'agra',
  'पटना': 'patna', 'patna': 'patna', 'patna-main': 'patna',
  'दिल्ली': 'delhi', 'दिल्ली ncr': 'delhi', 'दिल्ली एनसीआर': 'delhi', 'delhi': 'delhi', 'delhi ncr': 'delhi', 'delhi-ncr': 'delhi', 'नई दिल्ली': 'delhi', 'new delhi': 'delhi', 'new-delhi': 'delhi',
  'लखनऊ': 'lucknow', 'lucknow': 'lucknow',
  'वाराणसी': 'varanasi', 'बनारस': 'varanasi', 'varanasi': 'varanasi', 'काशी': 'varanasi',
  'कानपुर': 'kanpur', 'kanpur': 'kanpur',
  'प्रयागराज': 'prayagraj', 'इलाहाबाद': 'prayagraj', 'prayagraj': 'prayagraj',
  'मेरठ': 'meerut', 'meerut': 'meerut',
  'गोरखपुर': 'gorakhpur', 'gorakhpur': 'gorakhpur',
  'बरेली': 'bareilly', 'bareilly': 'bareilly',
  'अलीगढ़': 'aligarh', 'aligarh': 'aligarh',
  'अयोध्या': 'ayodhya', 'ayodhya': 'ayodhya', 'फैजाबाद': 'ayodhya',
  'मुजफ्फरपुर': 'muzaffarpur', 'muzaffarpur': 'muzaffarpur',
  'गया': 'gaya', 'gaya': 'gaya',
  'भागलपुर': 'bhagalpur', 'bhagalpur': 'bhagalpur',
  'राँची': 'ranchi', 'रांची': 'ranchi', 'ranchi': 'ranchi',
  'जयपुर': 'jaipur', 'jaipur': 'jaipur',
  'भोपाल': 'bhopal', 'bhopal': 'bhopal',
  'इंदौर': 'indore', 'indore': 'indore',
  'रायपुर': 'raipur', 'raipur': 'raipur',
  'देहरादून': 'dehradun', 'dehradun': 'dehradun',
  'चंडीगढ़': 'chandigarh', 'chandigarh': 'chandigarh',
  'कोलकाता': 'kolkata', 'kolkata': 'kolkata',
  'मुंबई': 'mumbai', 'mumbai': 'mumbai',
  'अहमदाबाद': 'ahmedabad', 'ahmedabad': 'ahmedabad',
  'पुणे': 'pune', 'pune': 'pune',
  'दरभंगा': 'darbhanga', 'darbhanga': 'darbhanga',
  'पूर्णिया': 'purnia', 'purnia': 'purnia',
  'बेगूसराय': 'begusarai', 'begusarai': 'begusarai',
  'कटिहार': 'katihar', 'katihar': 'katihar',
  'मोतिहारी': 'motihari', 'motihari': 'motihari',
  'सीवान': 'siwan', 'siwan': 'siwan',
  'समस्तीपुर': 'samastipur', 'samastipur': 'samastipur',
  'छपरा': 'chhapra', 'chhapra': 'chhapra',
  'आरा': 'arrah', 'arrah': 'arrah',
  'नोएडा': 'noida', 'noida': 'noida',
  'गाजियाबाद': 'ghaziabad', 'ghaziabad': 'ghaziabad',
  'हरिद्वार': 'haridwar', 'haridwar': 'haridwar',
  'मथुरा': 'mathura', 'mathura': 'mathura',
  'ग्वालियर': 'gwalior', 'gwalior': 'gwalior',
  'जबलपुर': 'jabalpur', 'jabalpur': 'jabalpur',
  'उज्जैन': 'ujjain', 'ujjain': 'ujjain'
};

export function resolveCitySlug(cityName?: string): string {
  if (!cityName) return 'patna';
  let clean = cityName
    .toLowerCase()
    .trim()
    .replace(/^(अपना|shahar|city)\s+/i, '')
    .replace(/\(.*?\)/g, '')
    .replace(/मुख्य|संस्करण|सिटी|bulletin|news/g, '')
    .trim();

  if (HINDI_CITY_TO_SLUG[clean]) return HINDI_CITY_TO_SLUG[clean];
  for (const [key, slug] of Object.entries(HINDI_CITY_TO_SLUG)) {
    if (clean === key || clean.includes(key)) return slug;
  }
  return clean.replace(/\s+/g, '-');
}
