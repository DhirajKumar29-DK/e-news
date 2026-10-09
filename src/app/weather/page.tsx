'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer, MobileBottomNav, SearchModal } from '@/components/common';
import { weatherService, MainCityWeather } from '@/services/weatherService';
import { CitySelector } from '@/components/weather/CitySelector';
import { MainCityCard } from '@/components/weather/MainCityCard';
import { WeatherNewsSection } from '@/components/weather/WeatherNewsSection';
import { RefreshCw, Leaf } from 'lucide-react';

export default function WeatherHubPage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cities, setCities] = useState<MainCityWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCities = async () => {
    try {
      const data = await weatherService.getMainCitiesWeather();
      setCities(data);
    } catch (err) {
      console.error('Failed to load main cities weather:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCities();
  };

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

  return (
    <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* 1. Global Header Navigation */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="weather"
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Main Page Content */}
      <div className="flex-1 w-full bg-[#FAFAFA] dark:bg-transparent pb-16">
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-8">
          
          {/* Top Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-200/90 dark:border-gray-800">
            <div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-[42px] font-black text-gray-950 dark:text-white tracking-tight uppercase leading-none">
                WEATHER CONDITIONS
              </h1>
            </div>

            {/* Right State & City Dropdowns + Refresh */}
            <div className="flex items-center gap-2.5 self-start sm:self-auto">
              <CitySelector />
              <button
                onClick={handleRefresh}
                title="Refresh Live Data"
                disabled={refreshing}
                className="p-1.5 rounded-full border border-gray-300/80 dark:border-gray-700 bg-white dark:bg-slate-800 hover:border-gray-400 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white shadow-sm transition-all disabled:opacity-50"
              >
                <RefreshCw size={14} className={refreshing ? 'animate-spin text-red-600' : ''} />
              </button>
            </div>
          </div>

          {/* Section Header: Weather Of Main Cities */}
          <div className="flex items-center justify-between mt-7 mb-5">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Weather Of Main Cities
            </h2>

            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
              <span className="text-gray-400">Powered By:</span>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950 border border-sky-200/70 dark:border-sky-800 text-sky-700 dark:text-sky-300 font-bold text-[11px]">
                <span className="tracking-wider">AQI</span>
                <Leaf size={11} className="text-emerald-500" />
              </div>
            </div>
          </div>

          {/* City Cards Grid with Warm Ambient Glow Background */}
          <div className="relative p-2 sm:p-4 rounded-3xl bg-gradient-to-b from-[#FFF8F5]/80 via-[#FFF4EE]/40 to-transparent dark:from-slate-900/40 dark:via-slate-900/20 dark:to-transparent">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 15 }).map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 h-40 flex flex-col justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-10 bg-gray-200 dark:bg-slate-700 rounded-lg" />
                      <div className="space-y-1.5 flex-1">
                        <div className="h-4 w-20 bg-gray-200 dark:bg-slate-700 rounded" />
                        <div className="h-3 w-12 bg-gray-100 dark:bg-slate-600 rounded" />
                      </div>
                    </div>
                    <div className="flex justify-around items-center pt-2">
                      <div className="h-6 w-14 bg-gray-200 dark:bg-slate-700 rounded" />
                      <div className="h-6 w-14 bg-gray-200 dark:bg-slate-700 rounded" />
                    </div>
                    <div className="h-5 w-full bg-gray-200 dark:bg-slate-700 rounded-b-2xl -mx-4 -mb-4 mt-2" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-4.5">
                {cities.map((city) => (
                  <MainCityCard key={city.id} city={city} />
                ))}
              </div>
            )}
          </div>

          {/* Weather News Section */}
          <div className="mt-14">
            <WeatherNewsSection />
          </div>

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
