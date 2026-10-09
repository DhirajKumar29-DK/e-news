'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer, MobileBottomNav, SearchModal } from '@/components/common';
import {
  weatherService,
  CityForecastData,
  MainCityWeather
} from '@/services/weatherService';
import { CitySelector } from '@/components/weather/CitySelector';
import { MainCityCard } from '@/components/weather/MainCityCard';
import { WeatherIcon } from '@/components/weather/WeatherIcon';
import { WeatherNewsSection } from '@/components/weather/WeatherNewsSection';
import { WeatherAvatar } from '@/components/weather/WeatherAvatar';
import {
  SunriseIcon,
  SunsetIcon,
  WindsockIcon,
  PressureGaugeIcon,
  TempRangeIcon,
  UvIndexIcon,
  WeatherVaneIcon,
  DropletIcon
} from '@/components/weather/MetricTiles';
import {
  MaskIcon,
  OutdoorIcon,
  WindowIcon,
  PurifierIcon,
  PlantIcon,
  PawIcon
} from '@/components/weather/HealthAdviceIcons';
import {
  Sun,
  Wind,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Leaf,
  MapPin
} from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CityWeatherDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const rawSlug = resolvedParams.slug;
  const router = useRouter();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [forecastData, setForecastData] = useState<CityForecastData | null>(null);
  const [mainCities, setMainCities] = useState<MainCityWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'weather' | 'aqi'>('weather');
  const [refreshing, setRefreshing] = useState(false);

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') {
      router.push('/');
    } else if (slug === 'videos') {
      router.push('/videos');
    } else if (slug === 'weather') {
      router.push('/weather');
    } else {
      router.push(`/${slug}`);
    }
  };

  const loadData = async () => {
    try {
      const data = await weatherService.getCityForecast(rawSlug);
      setForecastData(data);

      const mainList = await weatherService.getMainCitiesWeather();
      setMainCities(mainList);
    } catch (err) {
      console.error('Failed to load forecast data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    loadData();
  }, [rawSlug]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 font-sans">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          activeCategory="weather"
          onSelectCategory={handleSelectCategory}
        />
        <div className="flex-1 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
          <div className="h-10 w-64 bg-gray-200 animate-pulse rounded-lg mb-6" />
          <div className="h-[480px] bg-sky-100/60 animate-pulse rounded-3xl" />
        </div>
        <Footer />
      </main>
    );
  }

  if (!forecastData) {
    return (
      <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 font-sans">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          activeCategory="weather"
          onSelectCategory={handleSelectCategory}
        />
        <div className="flex-1 max-w-xl mx-auto px-4 py-20 text-center">
          <div className="bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
            <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">City Weather Not Found</h2>
            <p className="text-gray-500 mb-6">
              We couldn't retrieve forecast data for this city. Please choose from our main cities.
            </p>
            <Link
              href="/weather"
              className="inline-flex items-center justify-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-full transition-colors"
            >
              Explore All Cities
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const { city, current, aqi, weeklyForecast } = forecastData;

  // Determine dynamic AQI theme matching reference screenshots (Good=Green, Moderate=Yellow, Poor=Peach, Unhealthy=Rose/Pink, Severe=Purple, Hazardous=Maroon)
  const aqiVal = aqi.value || 120;

  const getAqiTheme = (val: number) => {
    if (val <= 50) {
      return {
        level: 'Good',
        gradient: 'from-[#D1FBE3] via-[#E8FDF0] to-[#F4FDF7]',
        borderColor: 'border-emerald-200/60',
        gaugeArcColor: '#22C55E',
        textColor: 'text-emerald-700',
        markerBg: 'bg-emerald-600',
        avatarMood: 'happy' as const,
        advice: {
          mask: { title: 'Wear Mask', desc: 'Not needed' },
          outdoor: { title: 'Stay Outdoor', desc: 'Enjoy' },
          windows: { title: 'Windows', desc: 'Open' },
          purifier: { title: 'Purifier', desc: 'Off' },
          plants: { title: 'Plants', desc: 'Good to Have' },
          pets: { title: 'Pets', desc: 'Enjoy Outdoors' },
          sentence: 'Air quality is considered satisfactory, and air pollution poses little or no risk for outdoor activities.'
        }
      };
    }
    if (val <= 100) {
      return {
        level: 'Moderate',
        gradient: 'from-[#FEF3C7] via-[#FFFBEB] to-[#FFFDF7]',
        borderColor: 'border-amber-200/60',
        gaugeArcColor: '#F59E0B',
        textColor: 'text-amber-700',
        markerBg: 'bg-amber-500',
        avatarMood: 'happy' as const,
        advice: {
          mask: { title: 'Wear Mask', desc: 'Optional' },
          outdoor: { title: 'Stay Outdoor', desc: 'Normal' },
          windows: { title: 'Windows', desc: 'Can Open' },
          purifier: { title: 'Purifier', desc: 'Optional' },
          plants: { title: 'Plants', desc: 'Must Have' },
          pets: { title: 'Pets', desc: 'Normal' },
          sentence: 'Air quality is acceptable; however, sensitive people may experience minor respiratory discomfort.'
        }
      };
    }
    if (val <= 150) {
      // Like Mumbai in previous screenshot
      return {
        level: 'Poor',
        gradient: 'from-[#FDE3CD] via-[#FFF0E4] to-[#FFF9F5]',
        borderColor: 'border-orange-200/60',
        gaugeArcColor: '#E67E22',
        textColor: 'text-orange-700',
        markerBg: 'bg-orange-600',
        avatarMood: 'coughing' as const,
        advice: {
          mask: { title: 'Wear Mask', desc: 'Recommended' },
          outdoor: { title: 'Stay Outdoor', desc: 'Cautious' },
          windows: { title: 'Windows', desc: 'Closed' },
          purifier: { title: 'Purifier', desc: 'Turn On' },
          plants: { title: 'Plants', desc: 'Must Have' },
          pets: { title: 'Pets', desc: 'Limit Outdoors' },
          sentence: 'Breathing may become slightly uncomfortable, especially for those with respiratory issues.'
        }
      };
    }
    if (val <= 200) {
      // Like Chandigarh in current screenshot: Rose / Pink gradient with Masked avatar
      return {
        level: 'Unhealthy',
        gradient: 'from-[#FDE2E4] via-[#FEE9E7] to-[#FFF1F2]',
        borderColor: 'border-rose-200/60',
        gaugeArcColor: '#E11D48',
        textColor: 'text-rose-600',
        markerBg: 'bg-rose-600',
        avatarMood: 'masked' as const,
        advice: {
          mask: { title: 'Wear Mask', desc: 'Strongly recommended' },
          outdoor: { title: 'Stay Indoor', desc: 'Must' },
          windows: { title: 'Windows', desc: 'Closed' },
          purifier: { title: 'Purifier', desc: 'Turn On' },
          plants: { title: 'Plants', desc: 'Must Have' },
          pets: { title: 'Pets', desc: 'Keep Indoors' },
          sentence: 'This air quality is particularly risky for children, pregnant women, and the elderly. Limit outdoor activities.'
        }
      };
    }
    if (val <= 300) {
      return {
        level: 'Severe',
        gradient: 'from-[#F3E8FF] via-[#FAF5FF] to-[#FCF8FF]',
        borderColor: 'border-purple-200/60',
        gaugeArcColor: '#9333EA',
        textColor: 'text-purple-700',
        markerBg: 'bg-purple-600',
        avatarMood: 'masked' as const,
        advice: {
          mask: { title: 'Wear Mask', desc: 'N95 Mandatory' },
          outdoor: { title: 'Stay Indoor', desc: 'Strictly Advised' },
          windows: { title: 'Windows', desc: 'Tightly Closed' },
          purifier: { title: 'Purifier', desc: 'High Power On' },
          plants: { title: 'Plants', desc: 'Must Have' },
          pets: { title: 'Pets', desc: 'Keep Indoors' },
          sentence: 'Severe pollution levels. Triggers respiratory illnesses across healthy individuals. Avoid going outdoors.'
        }
      };
    }
    return {
      level: 'Hazardous',
      gradient: 'from-[#FFE4E6] via-[#FED7AA] to-[#FEE2E2]',
      borderColor: 'border-red-300/60',
      gaugeArcColor: '#881337',
      textColor: 'text-red-950',
      markerBg: 'bg-red-800',
      avatarMood: 'masked' as const,
      advice: {
        mask: { title: 'Wear Mask', desc: 'N95 Mandatory' },
        outdoor: { title: 'Stay Indoor', desc: 'Emergency' },
        windows: { title: 'Windows', desc: 'Tightly Closed' },
        purifier: { title: 'Purifier', desc: 'Run Continuously' },
        plants: { title: 'Plants', desc: 'Must Have' },
        pets: { title: 'Pets', desc: 'Strictly Indoors' },
        sentence: 'Hazardous emergency air conditions. High health alert for all individuals; avoid any outdoor exposure.'
      }
    };
  };

  const aqiTheme = getAqiTheme(aqiVal);
  const aqiLabel = aqiTheme.level;

  // Calculate pointer position on the spectrum bar (0 to 300+ scale)
  const markerPercent = Math.min(100, Math.max(3, (aqiVal / 300) * 100));

  return (
    <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* 1. Global Header Navigation */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="weather"
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Main Weather & AQI Dashboard */}
      <div className="flex-1 w-full bg-[#FAFAFA] dark:bg-transparent pb-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
          
          {/* Top Bar: City Name + Pill Tabs (Weather | AQI) + State/City Dropdowns */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6">
            {/* Title */}
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-[40px] font-black text-gray-950 dark:text-white tracking-tight uppercase leading-tight">
                {city.name} Weather Today
              </h1>
            </div>

            {/* Pill Tab Switcher: ☀️ Weather | 💨 AQI */}
            <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-full border border-gray-200/90 dark:border-gray-700 shadow-sm">
              <button
                onClick={() => setActiveTab('weather')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'weather'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Sun size={16} />
                <span>Weather</span>
              </button>

              <button
                onClick={() => setActiveTab('aqi')}
                className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs sm:text-sm font-bold transition-all ${
                  activeTab === 'aqi'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                <Wind size={16} />
                <span>AQI</span>
              </button>
            </div>

            {/* Cascading State & City Dropdowns + Refresh */}
            <div className="flex items-center gap-2.5 self-start lg:self-auto">
              <CitySelector initialCitySlug={city.slug} />
              <button
                onClick={handleRefresh}
                title="Refresh Weather Data"
                disabled={refreshing}
                className="p-1.5 rounded-full border border-gray-300/80 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-gray-400 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin text-red-600' : ''} />
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              VIEW 1: WEATHER TAB ACTIVE (Scenic Sky Blue Gradient Container)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'weather' && (
            <div className="relative rounded-3xl p-5 md:p-8 bg-gradient-to-b from-[#A7E4FD] via-[#BDEEFE] to-[#D5F5FE] border border-sky-200/60 shadow-sm overflow-hidden mb-12">
              
              {/* Background Cloud Accents */}
              <div className="absolute top-10 right-20 w-48 h-16 bg-white/40 rounded-full blur-xl pointer-events-none" />
              <div className="absolute bottom-20 left-1/3 w-72 h-20 bg-white/50 rounded-full blur-2xl pointer-events-none" />

              {/* Upper Section: 3-column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative z-10">
                
                {/* 1. Left Floating Card: City Temp & Avatar */}
                <div className="lg:col-span-3 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-gray-800 font-bold text-sm mb-3">
                      <MapPin size={15} className="text-gray-600" />
                      <span>{city.name}</span>
                    </div>

                    <div className="my-2">
                      <WeatherIcon name={current.conditionIcon || current.condition} size={42} />
                    </div>

                    <div className="text-4xl sm:text-[44px] font-black text-gray-900 tracking-tight leading-none mt-1">
                      {current.temp} <span className="text-2xl font-bold">°c</span>
                    </div>

                    <div className="text-xs font-semibold text-gray-600 mt-2">
                      {current.condition}
                    </div>
                    <div className="text-xs text-gray-500 font-medium">
                      Feels like: <strong>{current.feelsLike}°c</strong>
                    </div>
                  </div>

                  {/* Character Avatar */}
                  <div className="my-3 flex justify-center">
                    <WeatherAvatar mood="happy" className="w-16 h-24" />
                  </div>

                  <div className="text-[11px] text-gray-400 font-medium pt-2 border-t border-gray-100">
                    Last Updated: {current.lastUpdated || '8 minutes ago'}
                  </div>
                </div>

                {/* 2. Center: 2x4 Grid of Weather Metric Tiles */}
                <div className="lg:col-span-5 grid grid-cols-2 gap-3">
                  {/* Sunrise */}
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                    <SunriseIcon className="w-7 h-7 shrink-0" />
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block">Sunrise</span>
                      <span className="text-xs font-bold text-gray-900">{current.sunrise}</span>
                    </div>
                  </div>

                  {/* Sunset */}
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                    <SunsetIcon className="w-7 h-7 shrink-0" />
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block">Sunset</span>
                      <span className="text-xs font-bold text-gray-900">{current.sunset}</span>
                    </div>
                  </div>

                  {/* Wind */}
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                    <WindsockIcon className="w-7 h-7 shrink-0" />
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block">Wind</span>
                      <span className="text-xs font-bold text-gray-900">{current.windSpeed} km/h</span>
                    </div>
                  </div>

                  {/* Pressure */}
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                    <PressureGaugeIcon className="w-7 h-7 shrink-0" />
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block">Pressure</span>
                      <span className="text-xs font-bold text-gray-900">{current.pressure}</span>
                    </div>
                  </div>

                  {/* Temperature Min/Max */}
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                    <TempRangeIcon className="w-7 h-7 shrink-0" />
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block">Temperature</span>
                      <span className="text-xs font-bold text-gray-900">
                        ↑ {current.maxTemp}°c ↓ {current.minTemp}°c
                      </span>
                    </div>
                  </div>

                  {/* UV Index */}
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                    <UvIndexIcon className="w-7 h-7 shrink-0" />
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block">UV Index</span>
                      <span className="text-xs font-bold text-gray-900">{current.uvIndex}</span>
                    </div>
                  </div>

                  {/* Humidity */}
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                    <DropletIcon className="w-7 h-7 shrink-0" />
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block">Humidity</span>
                      <span className="text-xs font-bold text-gray-900">{current.humidity}%</span>
                    </div>
                  </div>

                  {/* Direction */}
                  <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                    <WeatherVaneIcon className="w-7 h-7 shrink-0" />
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium block">Direction</span>
                      <span className="text-xs font-bold text-gray-900">{current.windDirection}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Right: Air Quality Index Card */}
                <div className="lg:col-span-4 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-serif text-lg font-bold text-gray-900">
                        Air Quality Index
                      </h3>
                      <button
                        onClick={() => setActiveTab('aqi')}
                        className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>

                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl sm:text-[46px] font-black text-gray-900 leading-none">
                        {aqi.value}
                      </span>
                      <span className="text-sm font-bold text-gray-500 uppercase">AQI</span>
                    </div>

                    <div className="space-y-1.5 text-xs text-gray-600 font-medium border-t border-b border-gray-100 py-3 mb-4">
                      <div className="flex justify-between">
                        <span>PM 2.5:</span>
                        <strong className="text-gray-900">{aqi.pm25} µg/m³</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>PM 10:</span>
                        <strong className="text-gray-900">{aqi.pm10} µg/m³</strong>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-800 font-medium">
                    Air quality index is : <strong className="font-bold text-amber-700">{aqiLabel}</strong>
                  </div>
                </div>

              </div>

              {/* Lower Section: 7-Day Forecast Cards Strip */}
              <div className="mt-6 pt-5 border-t border-white/50 relative z-10">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {weeklyForecast.slice(1, 7).map((day) => (
                    <div
                      key={day.date}
                      className="bg-white/90 backdrop-blur-sm rounded-xl p-3 text-center border border-white/70 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="text-xs font-bold text-gray-900 leading-tight">
                        {day.dayName}
                      </div>
                      <div className="text-[11px] text-gray-400 font-medium mb-2">
                        {day.date.split('-').reverse().join(' ')}
                      </div>

                      <div className="my-1.5 flex justify-center">
                        <WeatherIcon name={day.icon} size={28} />
                      </div>

                      <div className="text-sm font-black text-gray-900 mt-1">
                        {day.temp} <span className="text-xs font-semibold text-gray-500">°c</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Right: Powered By Badge */}
              <div className="flex justify-end items-center gap-1.5 text-[11px] text-gray-500 font-medium mt-4">
                <span className="text-gray-400">Powered By:</span>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/80 border border-sky-200 text-sky-800 font-bold text-[10px]">
                  <span>AQI</span>
                  <Leaf size={10} className="text-emerald-500" />
                </div>
              </div>

            </div>
          )}


          {/* ══════════════════════════════════════════════════════════════
              VIEW 2: AQI TAB ACTIVE (Dynamic Theme Color based on AQI: Green/Amber/Peach/Rose/Purple/Maroon)
             ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'aqi' && (
            <div className={`relative rounded-3xl p-5 md:p-8 bg-gradient-to-b ${aqiTheme.gradient} border ${aqiTheme.borderColor} shadow-sm overflow-hidden mb-12 transition-all duration-300`}>
              
              {/* Upper Section: 3-column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch relative z-10">
                
                {/* 1. Left Card: Half-circle AQI Gauge & Dynamic Avatar */}
                <div className="lg:col-span-3 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div className="text-center">
                    {/* Semicircle Gauge SVG */}
                    <div className="relative w-36 h-20 mx-auto mt-1 mb-2">
                      <svg viewBox="0 0 100 55" className="w-full h-full">
                        {/* Background Arc */}
                        <path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          stroke="#F3F4F6"
                          strokeWidth="9"
                          strokeLinecap="round"
                        />
                        {/* Colored Progress Arc */}
                        <path
                          d="M 10 50 A 40 40 0 0 1 90 50"
                          fill="none"
                          stroke={aqiTheme.gaugeArcColor}
                          strokeWidth="9"
                          strokeLinecap="round"
                          strokeDasharray="125"
                          strokeDashoffset={Math.max(0, 125 - (aqiVal / 300) * 125)}
                        />
                      </svg>
                      {/* Gauge Value inside */}
                      <div className="absolute inset-0 flex flex-col items-center justify-end pb-1">
                        <span className="text-2xl font-black text-gray-900 leading-none">
                          {aqi.value}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">AQI</span>
                      </div>
                    </div>

                    <div className={`text-xs font-bold uppercase tracking-wide ${aqiTheme.textColor}`}>
                      {aqiLabel}
                    </div>

                    <div className="font-bold text-gray-900 text-sm mt-3">
                      {city.name}
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium">
                      Thursday, 9 October
                    </div>
                  </div>

                  {/* Dynamic Avatar (Happy / Coughing / Masked with pink kurta) */}
                  <div className="my-2 flex justify-center">
                    <WeatherAvatar mood={aqiTheme.avatarMood} className="w-16 h-24" />
                  </div>

                  <div className="text-[11px] text-gray-400 font-medium pt-2 border-t border-gray-100 text-center">
                    Last Updated: 8 minutes ago
                  </div>
                </div>

                {/* 2. Center: Health Advice (6 Dynamic Tiles Grid + Advisory note) */}
                <div className="lg:col-span-6 flex flex-col justify-between">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-gray-900 mb-3">
                      Health Advice
                    </h3>

                    {/* 6 Advice Tiles */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Wear Mask */}
                      <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                        <MaskIcon className="w-7 h-7 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{aqiTheme.advice.mask.title}</span>
                          <span className="text-[11px] text-gray-500 font-medium">{aqiTheme.advice.mask.desc}</span>
                        </div>
                      </div>

                      {/* Stay Outdoor / Stay Indoor */}
                      <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                        <OutdoorIcon className="w-7 h-7 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{aqiTheme.advice.outdoor.title}</span>
                          <span className="text-[11px] text-gray-500 font-medium">{aqiTheme.advice.outdoor.desc}</span>
                        </div>
                      </div>

                      {/* Windows */}
                      <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                        <WindowIcon className="w-7 h-7 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{aqiTheme.advice.windows.title}</span>
                          <span className="text-[11px] text-gray-500 font-medium">{aqiTheme.advice.windows.desc}</span>
                        </div>
                      </div>

                      {/* Purifier */}
                      <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                        <PurifierIcon className="w-7 h-7 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{aqiTheme.advice.purifier.title}</span>
                          <span className="text-[11px] text-gray-500 font-medium">{aqiTheme.advice.purifier.desc}</span>
                        </div>
                      </div>

                      {/* Plants */}
                      <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                        <PlantIcon className="w-7 h-7 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{aqiTheme.advice.plants.title}</span>
                          <span className="text-[11px] text-gray-500 font-medium">{aqiTheme.advice.plants.desc}</span>
                        </div>
                      </div>

                      {/* Pets */}
                      <div className="bg-white/85 backdrop-blur-md rounded-xl p-3 border border-white/80 shadow-sm flex items-center gap-3">
                        <PawIcon className="w-7 h-7 shrink-0" />
                        <div>
                          <span className="text-xs font-bold text-gray-900 block">{aqiTheme.advice.pets.title}</span>
                          <span className="text-[11px] text-gray-500 font-medium">{aqiTheme.advice.pets.desc}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Advisory Sentence */}
                  <div className="mt-4 p-3 bg-white/70 rounded-xl text-xs text-gray-700 font-medium leading-relaxed">
                    {aqiTheme.advice.sentence}
                  </div>
                </div>

                {/* 3. Right: Weather Snapshot Card */}
                <div className="lg:col-span-3 bg-white/90 backdrop-blur-md rounded-2xl p-5 border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.04)] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-serif text-lg font-bold text-gray-900">
                        Weather
                      </h3>
                      <button
                        onClick={() => setActiveTab('weather')}
                        className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 transition-colors"
                      >
                        <ExternalLink size={13} />
                      </button>
                    </div>

                    <div className="flex items-center gap-3 my-2">
                      <WeatherIcon name={current.conditionIcon || current.condition} size={36} />
                      <div>
                        <div className="text-3xl font-black text-gray-900 leading-tight">
                          {current.temp}°C
                        </div>
                        <span className="text-xs font-semibold text-gray-500 block">
                          {current.condition}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mini Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100 text-center">
                    <div>
                      <span className="text-[10px] text-gray-400 font-medium block">Wind</span>
                      <strong className="text-xs text-gray-900 block mt-0.5">{current.windSpeed} km/h</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-medium block">Pressure</span>
                      <strong className="text-xs text-gray-900 block mt-0.5">{current.pressure}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-medium block">UV Index</span>
                      <strong className="text-xs text-gray-900 block mt-0.5">{current.uvIndex}</strong>
                    </div>
                  </div>
                </div>

              </div>

              {/* Middle Section: 6 Pollutant Metrics Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 relative z-10">
                {/* PM 2.5 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/80 shadow-sm">
                  <span className="text-[10px] text-gray-400 font-medium block leading-tight">Particulate Matter</span>
                  <span className="text-[11px] text-gray-500 font-bold block">(PM 2.5)</span>
                  <div className="text-xl font-black text-gray-900 mt-2">
                    {aqi.pm25} <span className="text-[10px] font-normal text-gray-400">µg/m³</span>
                  </div>
                </div>

                {/* PM 10 */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/80 shadow-sm">
                  <span className="text-[10px] text-gray-400 font-medium block leading-tight">Particulate Matter</span>
                  <span className="text-[11px] text-gray-500 font-bold block">(PM 10)</span>
                  <div className="text-xl font-black text-gray-900 mt-2">
                    {aqi.pm10} <span className="text-[10px] font-normal text-gray-400">µg/m³</span>
                  </div>
                </div>

                {/* Carbon Monoxide */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/80 shadow-sm">
                  <span className="text-[10px] text-gray-400 font-medium block leading-tight">Carbon Monoxide</span>
                  <span className="text-[11px] text-gray-500 font-bold block">(CO)</span>
                  <div className="text-xl font-black text-gray-900 mt-2">
                    284 <span className="text-[10px] font-normal text-gray-400">ppb</span>
                  </div>
                </div>

                {/* Sulfur Dioxide */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/80 shadow-sm">
                  <span className="text-[10px] text-gray-400 font-medium block leading-tight">Sulfur Dioxide</span>
                  <span className="text-[11px] text-gray-500 font-bold block">(SO2)</span>
                  <div className="text-xl font-black text-gray-900 mt-2">
                    2 <span className="text-[10px] font-normal text-gray-400">ppb</span>
                  </div>
                </div>

                {/* Nitrogen Dioxide */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/80 shadow-sm">
                  <span className="text-[10px] text-gray-400 font-medium block leading-tight">Nitrogen Dioxide</span>
                  <span className="text-[11px] text-gray-500 font-bold block">(NO2)</span>
                  <div className="text-xl font-black text-gray-900 mt-2">
                    9 <span className="text-[10px] font-normal text-gray-400">ppb</span>
                  </div>
                </div>

                {/* Ozone */}
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 border border-white/80 shadow-sm">
                  <span className="text-[10px] text-gray-400 font-medium block leading-tight">Ozone</span>
                  <span className="text-[11px] text-gray-500 font-bold block">(O3)</span>
                  <div className="text-xl font-black text-gray-900 mt-2">
                    26 <span className="text-[10px] font-normal text-gray-400">ppb</span>
                  </div>
                </div>
              </div>

              {/* Lower Section: Continuous AQI Spectrum Bar with Dynamic Marker */}
              <div className="mt-8 pt-4 border-t border-white/60 relative z-10">
                {/* Labels above bar */}
                <div className="flex justify-between text-[11px] font-bold text-gray-600 px-1 mb-1.5">
                  <span className="text-emerald-700">Good</span>
                  <span className="text-amber-600">Moderate</span>
                  <span className="text-orange-600">Poor</span>
                  <span className="text-rose-600">Unhealthy</span>
                  <span className="text-purple-700">Severe</span>
                  <span className="text-red-900">Hazardous</span>
                </div>

                {/* Bar */}
                <div className="relative h-2.5 w-full rounded-full bg-gradient-to-r from-[#4ADE80] via-[#FACC15] via-[#FB923C] via-[#F87171] via-[#C084FC] to-[#881337]">
                  {/* Pin Pointer Marker with Dynamic Color */}
                  <div
                    className={`absolute -top-1 w-4 h-4 ${aqiTheme.markerBg} border-2 border-white rounded-full shadow-md -translate-x-1/2 transition-all`}
                    style={{ left: `${markerPercent}%` }}
                  />
                </div>

                {/* Scale ticks */}
                <div className="flex justify-between text-[10px] font-bold text-gray-400 px-0.5 mt-1">
                  <span>0</span>
                  <span>50</span>
                  <span>100</span>
                  <span>150</span>
                  <span>200</span>
                  <span>250</span>
                  <span>300+</span>
                </div>
              </div>

              {/* Bottom Right: Powered By Badge */}
              <div className="flex justify-end items-center gap-1.5 text-[11px] text-gray-500 font-medium mt-4">
                <span className="text-gray-400">Powered By:</span>
                <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/80 border border-orange-200 text-orange-800 font-bold text-[10px]">
                  <span>AQI</span>
                  <Leaf size={10} className="text-emerald-500" />
                </div>
              </div>

            </div>
          )}


          {/* ══════════════════════════════════════════════════════════════
              WEATHER OF OTHER MAIN CITIES (5-Column Grid)
             ══════════════════════════════════════════════════════════════ */}
          {mainCities.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Weather Of Other Main Cities
                </h2>
                <Link
                  href="/weather"
                  className="text-xs text-red-600 font-bold hover:underline"
                >
                  View All Cities →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {mainCities
                  .filter((c) => c.slug !== city.slug)
                  .slice(0, 5)
                  .map((mc) => (
                    <MainCityCard key={mc.id} city={mc} />
                  ))}
              </div>
            </section>
          )}

          {/* ══════════════════════════════════════════════════════════════
              WEATHER NEWS SECTION
             ══════════════════════════════════════════════════════════════ */}
          <WeatherNewsSection />

        </div>
      </div>

      {/* 3. Global Footer */}
      <Footer />

      {/* 4. Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 5. Mobile Bottom Navigation */}
      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />
    </main>
  );
}
