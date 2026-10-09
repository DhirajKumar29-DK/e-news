'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Header, Footer, SearchModal } from '@/components/common';
import { Play, Eye, Clock, Share2, Film, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { videoService, VideoData } from '@/services/videoService';

export default function VideosPage() {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Dynamic state
  const [featuredHero, setFeaturedHero] = useState<VideoData | null>(null);
  const [trendingList, setTrendingList] = useState<VideoData[]>([]);
  const [gridVideos, setGridVideos] = useState<VideoData[]>([]);
  const [activeHero, setActiveHero] = useState<VideoData | null>(null);
  const [isPlayingHero, setIsPlayingHero] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Latest News Videos, Bulletins & Visual Reports | The Daily Jagran';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Watch top news videos, breaking bulletins, field reports, and expert analysis on The Daily Jagran.');
      }
    }
  }, []);

  // Fetch featured and trending videos on mount
  useEffect(() => {
    let isMounted = true;
    const loadFeaturedAndTrending = async () => {
      try {
        const data = await videoService.getFeaturedAndTrending();
        if (isMounted) {
          const hero = data.heroVideo || (data.trendingVideos && data.trendingVideos[0]) || null;
          setFeaturedHero(hero);
          setActiveHero(hero);
          setTrendingList(data.trendingVideos ? data.trendingVideos.slice(0, 5) : []);
        }
      } catch (err) {
        console.error('Error fetching featured videos:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadFeaturedAndTrending();
    return () => { isMounted = false; };
  }, []);

  // Fetch all videos
  useEffect(() => {
    let isMounted = true;
    const loadAllVideos = async () => {
      try {
        const data = await videoService.getVideos({ limit: 30, status: 'PUBLISHED' });
        if (isMounted) {
          setGridVideos(data.videos || []);
        }
      } catch (err) {
        console.error('Error loading videos:', err);
      }
    };
    loadAllVideos();
    return () => { isMounted = false; };
  }, []);

  const handleSelectVideo = (vid: VideoData) => {
    setActiveHero(vid);
    setIsPlayingHero(false);
    if (vid.id) {
      videoService.incrementViews(vid.id);
    }
    window.scrollTo({ top: 100, behavior: 'smooth' });
  };

  const handleShare = (vid: VideoData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/videos?v=${vid.slug || vid.id}`;
      navigator.clipboard.writeText(url);
      setCopiedId(vid.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getEmbedUrl = (video: VideoData) => {
    if (video.youtubeId) {
      return `https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`;
    }
    return video.videoUrl;
  };

  const getThumbnail = (video: VideoData) => {
    if (video.thumbnailUrl) return video.thumbnailUrl;
    if (video.youtubeId) return `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg`;
    return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';
  };

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* 1. Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="videos"
        onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : (slug === 'videos' ? '/videos' : `/${slug}`))}
      />

      {/* 2. Top Dark Cinema Stage */}
      <section className="w-full bg-[#070b13] text-white py-10 px-4 sm:px-8 lg:px-12 border-b border-slate-800 relative overflow-hidden">
        {/* Ambient background grid */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-red-600/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="max-w-[1440px] mx-auto relative flex flex-col lg:flex-row items-center justify-center gap-8">
          
          {/* Vertical Large Watermark 'VIDEOS' Text on Left */}
          <div className="hidden lg:flex items-center justify-center select-none shrink-0 pr-4">
            <h1 className="text-8xl font-black tracking-widest text-slate-700/25 uppercase font-serif [writing-mode:vertical-lr] rotate-180 leading-none">
              VIDEOS
            </h1>
          </div>

          {/* Main Featured Cinema Screen Container */}
          <div className="w-full max-w-[1040px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl relative group">
            {activeHero ? (
              <>
                <div className="aspect-video relative overflow-hidden bg-black">
                  {isPlayingHero ? (
                    activeHero.videoType === 'FILE' ? (
                      <video
                        src={activeHero.videoUrl}
                        controls
                        className="w-full h-full object-contain bg-black"
                      />
                    ) : (
                      <iframe
                        src={getEmbedUrl(activeHero)}
                        title={activeHero.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )
                  ) : (
                    <>
                      <img
                        src={getThumbnail(activeHero)}
                        alt={activeHero.title}
                        className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
                      />

                      {/* Channel Badge Overlay */}
                      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-start justify-between">
                        <div className="space-y-1 max-w-[85%]">
                          <div className="flex items-center space-x-2">
                            <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider shadow">
                              {activeHero.badge || 'SPECIAL REPORT'}
                            </span>
                            <span className="text-[11px] font-mono text-slate-300">
                              {activeHero.location || 'NEWS BROADCAST'}
                            </span>
                          </div>
                          <h2 className="text-lg sm:text-2xl lg:text-3xl font-black font-serif text-white tracking-tight leading-tight pt-1 drop-shadow-md">
                            {activeHero.title}
                          </h2>
                          {activeHero.location && (
                            <p className="text-[11px] sm:text-xs font-mono text-amber-400 font-bold tracking-wide pt-0.5">
                              {activeHero.location}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Play Button Center Overlay */}
                      <div
                        onClick={() => {
                          setIsPlayingHero(true);
                          if (activeHero.id) videoService.incrementViews(activeHero.id);
                        }}
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      >
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-all duration-300 border-4 border-white/20">
                          <Play className="w-10 h-10 sm:w-12 sm:h-12 fill-white ml-1" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Sub Bar below video with reporter and action controls */}
                <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-900 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-bold text-white line-clamp-1">
                      {activeHero.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                      {activeHero.reporterName && <span>Reported by: <strong className="text-slate-200">{activeHero.reporterName}</strong></span>}
                      {activeHero.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {activeHero.duration}</span>}
                      <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {activeHero.viewsCount.toLocaleString()} views</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={(e) => handleShare(activeHero, e)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-200 transition-colors"
                    >
                      {copiedId === activeHero.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied Link!</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Share</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="aspect-video flex items-center justify-center text-slate-500">
                <p>Loading cinema broadcast...</p>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. Top 5 Trending Countdown Strip (1 to 5) */}
      {trendingList.length > 0 && (
        <section className="w-full bg-[#0c111d] text-white py-12 px-4 sm:px-8 lg:px-12 border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-2.5">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <h2 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white">
                  TOP 5 TRENDING BULLETINS
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline-block">
                UPDATED REAL-TIME
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {trendingList.map((item, idx) => {
                const rank = idx + 1;
                const thumb = getThumbnail(item);
                const isCurrent = activeHero?.id === item.id;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleSelectVideo(item)}
                    className={`relative rounded-xl overflow-hidden border cursor-pointer transition-all flex flex-col justify-between group ${
                      isCurrent
                        ? 'bg-slate-900 border-2 border-red-500 ring-2 ring-red-500/20'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {/* Big Watermark Rank Number */}
                    <span className="absolute top-1 right-2 text-6xl font-black font-serif text-white/5 pointer-events-none group-hover:text-red-500/10 transition-colors">
                      {rank}
                    </span>

                    <div className="aspect-[16/10] bg-slate-950 relative overflow-hidden">
                      <img
                        src={thumb}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg">
                          <Play className="w-4 h-4 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Rank Tag Top Left */}
                      <span className="absolute top-2 left-2 bg-black/80 backdrop-blur text-white text-[10px] font-black px-2 py-0.5 rounded font-mono">
                        #{rank}
                      </span>

                      {/* Duration Bottom Right */}
                      {item.duration && (
                        <span className="absolute bottom-2 right-2 bg-black/85 backdrop-blur text-white text-[10px] font-mono px-1.5 py-0.5 rounded">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between relative z-10">
                      <div>
                        {item.badge && (
                          <span className="text-[10px] font-black uppercase text-red-400 block mb-1">
                            {item.badge}
                          </span>
                        )}
                        <h4 className="text-xs font-bold leading-snug line-clamp-3 group-hover:text-amber-300 transition-colors">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-800/60">
                        <span>{item.reporterName || item.location || 'NEWS REPORT'}</span>
                        <span>{item.viewsCount.toLocaleString()} views</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 4. Video Gallery */}
      <section className="max-w-[1440px] mx-auto w-full py-12 px-4 sm:px-8 lg:px-12 space-y-8 flex-1">
        
        {/* Gallery Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <h3 className="text-2xl font-black font-serif uppercase tracking-tight text-slate-900 dark:text-white">
            ALL VIDEO BULLETINS
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Latest visual reports, ground coverage, and video broadcasts
          </p>
        </div>

        {/* 4-Column Video Cards Grid */}
        {gridVideos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {gridVideos.map((vid) => {
              const thumb = getThumbnail(vid);
              const isSelected = activeHero?.id === vid.id;

              return (
                <article
                  key={vid.id}
                  onClick={() => handleSelectVideo(vid)}
                  className={`group rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                    isSelected
                      ? 'border-2 border-red-500 shadow-xl ring-2 ring-red-500/20 bg-slate-50 dark:bg-slate-900'
                      : 'border-slate-200 dark:border-slate-800/90 bg-white dark:bg-slate-900/60 hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Thumbnail Stage */}
                  <div className="aspect-[16/10] bg-slate-950 relative overflow-hidden">
                    <img
                      src={thumb}
                      alt={vid.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Centered Play overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                      <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>

                    {/* Badge Pill */}
                    {vid.badge && (
                      <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow">
                        {vid.badge}
                      </span>
                    )}

                    {/* Duration Pill */}
                    {vid.duration && (
                      <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-white/10">
                        {vid.duration}
                      </span>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono mb-1.5">
                        <span className="uppercase font-bold text-red-600 dark:text-red-400">{vid.badge || 'VIDEO'}</span>
                        {vid.location && <span className="truncate max-w-[140px]">{vid.location}</span>}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                        {vid.title}
                      </h4>

                      {vid.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                          {vid.description}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span>{vid.reporterName ? `By ${vid.reporterName}` : 'News Desk'}</span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {vid.viewsCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center space-y-3">
            <Film className="w-12 h-12 mx-auto text-slate-400 animate-bounce" />
            <p className="text-base font-bold text-slate-600 dark:text-slate-300">
              No videos found in this category yet.
            </p>
            <p className="text-xs text-slate-400">
              Check back soon or select another category above.
            </p>
          </div>
        )}

      </section>

      {/* 5. Footer */}
      <Footer />

      {/* 6. Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

    </main>
  );
}
