import { CategoryTab, WeatherInfo, WebStory } from '@/types/news';

// 1. Static City Weather
export const mockWeather: WeatherInfo = {
  city: { en: 'New Delhi' },
  temp: '32°C',
  condition: { en: 'Partly Cloudy' },
  iconName: 'SunCloud'
};

// 2. Navigation Category Tabs
export const mockCategoryTabs: CategoryTab[] = [
  { id: 'cat-all', label: { en: 'HOME' }, slug: 'all' },
  { id: 'cat-latest', label: { en: 'LATEST NEWS' }, slug: 'latest' },
  { id: 'cat-india', label: { en: 'INDIA' }, slug: 'india' },
  { id: 'cat-world', label: { en: 'WORLD' }, slug: 'world' },
  { id: 'cat-ent', label: { en: 'ENTERTAINMENT' }, slug: 'entertainment' },
  { id: 'cat-life', label: { en: 'LIFESTYLE' }, slug: 'lifestyle' },
  { id: 'cat-biz', label: { en: 'BUSINESS' }, slug: 'business' },
  { id: 'cat-edu', label: { en: 'EDUCATION' }, slug: 'education' },
  { id: 'cat-cric', label: { en: 'CRICKET' }, slug: 'cricket' },
  { id: 'cat-tech', label: { en: 'TECH' }, slug: 'tech' },
  { id: 'cat-sports', label: { en: 'SPORTS' }, slug: 'sports' },
  { id: 'cat-auto', label: { en: 'AUTO' }, slug: 'auto' },
  { id: 'cat-spiritual', label: { en: 'SPIRITUAL' }, slug: 'spiritual' },
  { id: 'cat-horoscope', label: { en: 'HOROSCOPE' }, slug: 'horoscope' }
];

// 3. Topic Pills (empty - can be populated dynamically if needed)
export const mockInFocusPills: { id: string; name: string; articleId?: string }[] = [];

// 4. Horoscope Section (12 Static Zodiac Signs)
export const mockHoroscopeSigns = [
  { name: 'ARIES', date: 'MAR 21 - APR 19', icon: '♈', color: 'from-red-500 to-rose-600' },
  { name: 'TAURUS', date: 'APR 20 - MAY 20', icon: '♉', color: 'from-amber-500 to-orange-600' },
  { name: 'GEMINI', date: 'MAY 21 - JUN 21', icon: '♊', color: 'from-yellow-500 to-amber-600' },
  { name: 'CANCER', date: 'JUN 21 - JUL 22', icon: '♋', color: 'from-emerald-500 to-teal-600' },
  { name: 'LEO', date: 'JUL 23 - AUG 22', icon: '♌', color: 'from-orange-500 to-red-600' },
  { name: 'VIRGO', date: 'AUG 23 - SEP 22', icon: '♍', color: 'from-teal-500 to-cyan-600' },
  { name: 'LIBRA', date: 'SEP 23 - OCT 22', icon: '♎', color: 'from-blue-500 to-indigo-600' },
  { name: 'SCORPIO', date: 'OCT 23 - NOV 21', icon: '♏', color: 'from-purple-500 to-pink-600' },
  { name: 'SAGITTARIUS', date: 'NOV 22 - DEC 21', icon: '♐', color: 'from-indigo-500 to-purple-600' },
  { name: 'CAPRICORN', date: 'DEC 22 - JAN 19', icon: '♑', color: 'from-slate-600 to-slate-800' },
  { name: 'AQUARIUS', date: 'JAN 20 - FEB 18', icon: '♒', color: 'from-cyan-500 to-blue-600' },
  { name: 'PISCES', date: 'FEB 19 - MAR 20', icon: '♓', color: 'from-violet-500 to-fuchsia-600' }
];



// 6. Web Stories
export const mockWebStories: WebStory[] = [
  {
    id: 'ws-1',
    title: { en: 'Chandrayaan-4: Complete Master Plan for Lunar Sample Return' },
    imageUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&q=80',
    slidesCount: 6,
    category: 'Space'
  },
  {
    id: 'ws-2',
    title: { en: 'Indias 5 New Semiconductor Plants: Locations and Fabrication Details' },
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
    slidesCount: 5,
    category: 'Tech'
  },
  {
    id: 'ws-3',
    title: { en: 'Vande Bharat Sleeper Express: 10 Luxury Features That Will Amaze You' },
    imageUrl: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=600&q=80',
    slidesCount: 7,
    category: 'Infra'
  },
  {
    id: 'ws-4',
    title: { en: 'Asia Cup 2026: Top 5 X-Factor Players in Team India' },
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=600&q=80',
    slidesCount: 5,
    category: 'Sports'
  }
];
