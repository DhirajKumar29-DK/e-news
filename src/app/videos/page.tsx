'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Header, Footer, SearchModal } from '@/components/common';
import { Play, Eye, Clock, Share2, Sun } from 'lucide-react';

export default function VideosPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Latest News Videos, Bulletins & Visual Reports | The Daily Jagran';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Watch top news videos, breaking bulletins, field reports, and expert analysis on The Daily Jagran.');
      }
    }
  }, []);

  // Default Featured Video
  const defaultHero = {
    id: 'v-hero-1',
    title: {
      en: 'LARGEST Attack On Russia! 1000+ Drones Hit Moscow On Final Day Of Elections | WATCH'
    },
    location: 'DATE - 20/09/2026 | MOSCOW, RUSSIA',
    duration: '04:10',
    views: '480K',
    timeAgo: { en: '2 hours ago' },
    imageUrl: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'
  };

  const [activeHero, setActiveHero] = useState(defaultHero);
  const [isPlayingHero, setIsPlayingHero] = useState(true);

  // 1 to 5 Trending Videos (With giant background numbers 1, 2, 3, 4, 5)
  const trendingVideos = [
    {
      rank: 1,
      id: 'tr-1',
      badge: 'BREAKING NEWS',
      title: {
        en: "'8 BALLISTIC MISSILES, DIRECT SHOT!': Saudi Capital Breached! | Iran Houthi Claim Attack On Airport"
      },
      location: 'DATE - 20/09/2026 | RIYADH, SAUDI ARABIA',
      timeAgo: { en: '14 hours ago' },
      imageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://www.youtube-nocookie.com/embed/L_LUpnjgPso?autoplay=1'
    },
    {
      rank: 2,
      id: 'tr-2',
      badge: 'IRAN WAR ENDS?',
      title: {
        en: "US Iran War Update: Tehran's 7 Conditions To Avoid Escalation and Re-Engage In Talks With US"
      },
      location: 'DATE - 20/09/2026 | TEHRAN, IRAN',
      timeAgo: { en: '14 hours ago' },
      imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'
    },
    {
      rank: 3,
      id: 'tr-3',
      badge: 'AT RUSSIA OIL REFINERY',
      title: {
        en: 'Russia Pipeline Choked! Heavy Smoke Plumes Rise Above Damaged Moscow Refinery'
      },
      location: 'DATE - 20/09/2026 | MOSCOW, RUSSIA',
      timeAgo: { en: '14 hours ago' },
      imageUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://www.youtube-nocookie.com/embed/L_LUpnjgPso?autoplay=1'
    },
    {
      rank: 4,
      id: 'tr-4',
      badge: 'LIVE UPDATE',
      title: {
        en: 'Russia Oil Refinery Explosion Live: Massive Drone Attack Hits Moscow Oil Refinery Site'
      },
      location: 'DATE - 20/09/2026 | MOSCOW, RUSSIA',
      timeAgo: { en: '15 hours ago' },
      imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'
    },
    {
      rank: 5,
      id: 'tr-5',
      badge: 'BREAKING NEWS',
      title: {
        en: 'Iran Proxy Army Top Brass Killed! Chief & 6 Aides Wiped Out! | Saudi Revenge On Iran Proxy!'
      },
      location: 'DATE - 20/09/2026 | MIDDLE EAST',
      timeAgo: { en: '15 hours ago' },
      imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://www.youtube-nocookie.com/embed/L_LUpnjgPso?autoplay=1'
    }
  ];

  // Grid Video News Gallery (4-Column Grid)
  const gridVideos = [
    {
      id: 'grid-1',
      badge: 'EXPLOSIVE FOOTAGE!',
      title: {
        en: 'Shocking Footage! US Military Says It Killed 4 in Anti-Drug Strike Operation in the Caribbean Sea'
      },
      location: 'DATE - 20/09/2026 | CARIBBEAN SEA',
      timeAgo: { en: '16 hours ago' },
      imageUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4eff56022?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'
    },
    {
      id: 'grid-2',
      badge: 'BOOM! SAUDI UNDER FIRE?',
      title: {
        en: 'Will Iran and Its Ally Take Over Saudi Arabia? 2 Military Operations Launch Saudi Vs Houthis'
      },
      location: 'DATE - 20/09/2026 | SAUDI ARABIA',
      timeAgo: { en: '16 hours ago' },
      imageUrl: 'https://images.unsplash.com/photo-1512719355433-e029c72e2cf5?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://www.youtube-nocookie.com/embed/L_LUpnjgPso?autoplay=1'
    },
    {
      id: 'grid-3',
      badge: 'US MILITARY STRIKES',
      title: {
        en: 'US Anti Drug Strike Operation Live: US Releases Video Of Deadly Caribbean Strike'
      },
      location: 'DATE - 20/09/2026 | WASHINGTON D.C.',
      timeAgo: { en: '16 hours ago' },
      imageUrl: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1'
    },
    {
      id: 'grid-4',
      badge: 'MASSIVE RALLY',
      title: {
        en: 'Pro Palestine protest: Ed Sheeran Concert Rally Follows Controversial Tour Fallout'
      },
      location: 'DATE - 20/09/2026 | LONDON, UK',
      timeAgo: { en: '18 hours ago' },
      imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
      videoUrl: 'https://www.youtube-nocookie.com/embed/L_LUpnjgPso?autoplay=1'
    }
  ];

  const handleSelectVideo = (vid: any) => {
    setActiveHero({
      id: vid.id,
      title: vid.title,
      location: vid.location || 'DATE - 20/09/2026 | WORLD',
      duration: '04:10',
      views: '250K',
      timeAgo: vid.timeAgo,
      imageUrl: vid.imageUrl,
      videoUrl: vid.videoUrl
    });
    setIsPlayingHero(true);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* 1. Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="videos"
        onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : (slug === 'videos' ? '/videos' : `/${slug}`))}
      />

      {/* 2. Top Dark Pinstriped Hero Featured Video Banner */}
      <section className="w-full bg-[#0a0e17] text-white py-8 px-4 sm:px-8 lg:px-12 border-b border-slate-800 relative overflow-hidden">
        {/* Repeating vertical pinstripes background */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative flex flex-col lg:flex-row items-center justify-center gap-8">
          
          {/* Vertical Large Watermark 'VIDEOS' Text on Left */}
          <div className="hidden lg:flex items-center justify-center select-none shrink-0 pr-4">
            <h1 className="text-8xl font-black tracking-widest text-slate-600/30 uppercase font-serif [writing-mode:vertical-lr] rotate-180 leading-none">
              VIDEOS
            </h1>
          </div>

          {/* Main Featured Cinema Screen Container */}
          <div className="w-full max-w-[1020px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl relative group">
            <div className="aspect-video relative overflow-hidden bg-black">
              {isPlayingHero ? (
                <iframe
                  src={activeHero.videoUrl}
                  title={t(activeHero.title)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={activeHero.imageUrl}
                    alt={t(activeHero.title)}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700"
                  />

                  {/* Top Channel Logo & Text Banner Overlay */}
                  <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-start justify-between">
                    <div className="space-y-1 max-w-[85%]">
                      <div className="flex items-center space-x-2">
                        <div className="w-7 h-7 rounded-full bg-jagran-red flex items-center justify-center text-white">
                          <Sun className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase text-white tracking-widest">
                          THE NEWSPAPER
                        </span>
                      </div>
                      <h2 className="text-lg sm:text-2xl lg:text-3xl font-black font-serif text-white tracking-tight leading-tight pt-1 drop-shadow-md">
                        {t(activeHero.title)}
                      </h2>
                      <p className="text-[11px] sm:text-xs font-mono text-amber-400 font-bold tracking-wide pt-0.5">
                        {activeHero.location}
                      </p>
                    </div>
                  </div>

                  {/* Play Button Center Overlay */}
                  <div
                    onClick={() => setIsPlayingHero(true)}
                    className="absolute inset-0 flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-jagran-red/90 hover:bg-jagran-red text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300 border-4 border-white/20">
                      <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-white ml-1" />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* 3. TRENDING Section (With Giant Numbers 1, 2, 3, 4, 5) */}
      <section className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-10 py-10 space-y-6">
        
        <div className="border-b-4 border-jagran-red pb-2">
          <h2 className="text-3xl font-black font-serif text-slate-900 dark:text-white uppercase tracking-tight">
            TRENDING
          </h2>
        </div>

        {/* 5 Horizontal Trending Video Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 items-start">
          {trendingVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => handleSelectVideo(vid)}
              className="relative group cursor-pointer space-y-3"
            >
              {/* Giant Background Number Behind Card */}
              <div className="absolute -top-7 -left-4 text-7xl font-serif font-black text-slate-200/90 dark:text-slate-800/90 select-none z-0">
                {vid.rank}
              </div>

              {/* Card Container (Z-10 relative) */}
              <div className="relative z-10 space-y-2.5">
                
                {/* Thumbnail with Red Badge Embedded */}
                <div className="aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden relative border border-slate-200 dark:border-slate-800">
                  <img
                    src={vid.imageUrl}
                    alt={t(vid.title)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Red Breaking News Badge Banner Embedded Top Left */}
                  <div className="absolute top-2 left-2 right-2 flex items-center">
                    <span className="bg-jagran-red text-white text-[10px] font-black uppercase px-2 py-0.5 rounded shadow tracking-wider line-clamp-1">
                      {vid.badge}
                    </span>
                  </div>

                  {/* Small Center Play Circle */}
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-jagran-red text-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <Play className="w-4 h-4 fill-white ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Title & Time */}
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-snug">
                    {t(vid.title)}
                  </h3>
                  <span className="text-xs text-slate-400 block font-medium">
                    {t(vid.timeAgo)}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>

      </section>

      {/* 4. Bottom 4-Column Video Grid Gallery */}
      <section className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-10 pb-16 space-y-6 border-t border-slate-200 dark:border-slate-800 pt-8">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {gridVideos.map((vid) => (
            <div
              key={vid.id}
              onClick={() => handleSelectVideo(vid)}
              className="bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-3 cursor-pointer group hover:border-jagran-red transition-all"
            >
              {/* Thumbnail with Badge */}
              <div className="aspect-[16/10] bg-slate-900 rounded-lg overflow-hidden relative">
                <img
                  src={vid.imageUrl}
                  alt={t(vid.title)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 left-2">
                  <span className="bg-jagran-red text-white text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider">
                    {vid.badge}
                  </span>
                </div>
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <div className="w-9 h-9 rounded-full bg-jagran-red text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-white ml-0.5" />
                  </div>
                </div>
              </div>

              {/* Title & Time */}
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-snug">
                  {t(vid.title)}
                </h4>
                <span className="text-[11px] text-slate-400 block font-medium">
                  {t(vid.timeAgo)}
                </span>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Footer */}
      <Footer />
    </main>
  );
}
