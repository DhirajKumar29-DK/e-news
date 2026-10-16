'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Header, Footer, SearchModal } from '@/components/common';
import { Play, Eye, Clock, Share2, Film, Sparkles, Filter, CheckCircle2, X, ChevronUp } from 'lucide-react';
import { videoService, VideoData } from '@/services/videoService';
import { buildVideoEmbedUrl, getVideoThumbnail, getYouTubeId } from '@/utils/videoUtils';

function updateVideoSEO(video: VideoData) {
  if (typeof document === 'undefined') return;
  const siteTitle = 'The News Paper';
  const pageTitle = video.metaTitle || video.title || 'Latest News Video';
  const pageDesc = video.metaDescription || video.description || 'Watch latest news videos, breaking bulletins, field reports, and expert analysis on The News Paper.';
  const pageImage = video.thumbnailUrl || (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg` : '');
  const pageUrl = video.canonicalUrl || (typeof window !== 'undefined' ? `${window.location.origin}/videos?v=${encodeURIComponent(video.slug || video.id || '')}` : '');
  const pageKeywords = video.metaKeywords || video.tags || '';

  // Title
  document.title = `${pageTitle} | ${siteTitle}`;

  // Helper to upsert meta tag
  const setMeta = (selector: string, attr: string, value: string) => {
    let el = document.querySelector(selector) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      const parts = selector.replace('meta[', '').replace(']', '').split('=');
      if (parts.length === 2) {
        el.setAttribute(parts[0], parts[1].replace(/"/g, ''));
      }
      document.head.appendChild(el);
    }
    el.setAttribute(attr, value);
  };

  const setLink = (rel: string, href: string) => {
    let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
    if (!el) {
      el = document.createElement('link');
      el.setAttribute('rel', rel);
      document.head.appendChild(el);
    }
    el.setAttribute('href', href);
  };

  // Standard SEO
  setMeta('meta[name="description"]', 'content', pageDesc);
  if (pageKeywords) setMeta('meta[name="keywords"]', 'content', pageKeywords);
  setMeta('meta[name="robots"]', 'content', 'index, follow');

  // Canonical URL
  if (pageUrl) setLink('canonical', pageUrl);

  // Open Graph
  setMeta('meta[property="og:title"]', 'content', pageTitle);
  setMeta('meta[property="og:description"]', 'content', pageDesc);
  setMeta('meta[property="og:type"]', 'content', 'video.other');
  if (pageUrl) setMeta('meta[property="og:url"]', 'content', pageUrl);
  setMeta('meta[property="og:site_name"]', 'content', siteTitle);
  if (pageImage) setMeta('meta[property="og:image"]', 'content', pageImage);

  // Twitter Card
  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', pageTitle);
  setMeta('meta[name="twitter:description"]', 'content', pageDesc);
  if (pageImage) setMeta('meta[name="twitter:image"]', 'content', pageImage);
}

// Fallback high-impact news videos matching reference feed (only used if DB has 0 videos)
const FALLBACK_VIDEOS: VideoData[] = [
  {
    id: 'v-nasa-space-earth',
    title: 'Earth From Space: Real-time Ultra HD Views from International Space Station | NASA Live Feed',
    slug: 'earth-from-space-ultra-hd-iss-nasa-live-feed',
    videoType: 'YOUTUBE',
    videoUrl: 'https://www.youtube.com/watch?v=dp8PhLsUcFE',
    youtubeId: 'dp8PhLsUcFE',
    thumbnailUrl: 'https://img.youtube.com/vi/dp8PhLsUcFE/maxresdefault.jpg',
    duration: '12:45',
    category: 'technology',
    subCategory: 'Space & Science',
    badge: 'EXCLUSIVE',
    location: 'NASA / SPACE STATION',
    reporterName: 'Science & Aerospace Desk',
    viewsCount: 428000,
    likesCount: 19500,
    isFeaturedHero: true,
    isTrending: true,
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'v-world-news-bulletin',
    title: 'Global News Roundup: Key Economic Shifts & Strategic International Summits Breakdown',
    slug: 'global-news-roundup-key-economic-shifts-summits',
    videoType: 'YOUTUBE',
    videoUrl: 'https://www.youtube.com/watch?v=sP9aZlBw6wE',
    youtubeId: 'sP9aZlBw6wE',
    thumbnailUrl: 'https://img.youtube.com/vi/sP9aZlBw6wE/maxresdefault.jpg',
    duration: '18:12',
    category: 'world',
    subCategory: 'World Affairs',
    badge: 'WORLD DESK',
    location: 'GLOBAL DESK',
    reporterName: 'International Bureau',
    viewsCount: 315000,
    likesCount: 14200,
    isFeaturedHero: false,
    isTrending: true,
    status: 'PUBLISHED',
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

interface VideosPageProps {
  initialVideoId?: string;
}

export default function VideosPage({ initialVideoId }: VideosPageProps = {}) {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 1. Lead Video: Strictly locks to the latest Admin-selected Lead video (isFeaturedHero: true)
  const [leadVideo, setLeadVideo] = useState<VideoData | null>(null);
  const [isPlayingLead, setIsPlayingLead] = useState(false);

  // 2. Popup Modal Video: Every other video opens and plays inside this popup modal
  const [modalVideo, setModalVideo] = useState<VideoData | null>(null);

  const [trendingList, setTrendingList] = useState<VideoData[]>([]);
  const [gridVideos, setGridVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter state for Video-only categories
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('latest');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Scroll listener for floating Back To Top button
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowBackToTop(window.scrollY > 280);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // On Mobile: Clicking any video opens a dedicated new watch page and starts playing immediately
  const handleMobileVideoClick = (vid: VideoData) => {
    setIsPlayingLead(false);
    setModalVideo(null);
    router.push(`/videos/${encodeURIComponent(vid.slug || vid.id)}`);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Latest News Videos, Bulletins & Visual Reports | The News Paper';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Watch top news videos, breaking bulletins, field reports, and expert analysis on The News Paper.');
      }
    }
  }, []);

  // Fetch featured and trending videos on mount
  useEffect(() => {
    let isMounted = true;
    const loadFeaturedAndTrending = async () => {
      try {
        const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const targetIdOrSlug = initialVideoId || urlParams?.get('v');

        const data = await videoService.getFeaturedAndTrending();
        if (isMounted) {
          // Strictly identify the admin-selected Lead Video (isFeaturedHero: true)
          const adminLead = data.heroVideo || (data.trendingVideos && data.trendingVideos[0]) || FALLBACK_VIDEOS[0];
          setLeadVideo(adminLead);

          setTrendingList(data.trendingVideos && data.trendingVideos.length > 0 ? data.trendingVideos.slice(0, 5) : FALLBACK_VIDEOS);

          // Handle target video from URL query if specified
          if (targetIdOrSlug) {
            try {
              const specificVideo = await videoService.getVideoByIdOrSlug(targetIdOrSlug);
              if (specificVideo && isMounted) {
                if (adminLead && (specificVideo.id === adminLead.id || specificVideo.slug === adminLead.slug)) {
                  // If requested video is the lead video
                  if (urlParams?.get('play') === '1' || Boolean(initialVideoId)) {
                    setIsPlayingLead(true);
                  }
                  updateVideoSEO(adminLead);
                } else {
                  // Non-lead video requested via URL: opens cleanly in popup modal
                  setModalVideo(specificVideo);
                  updateVideoSEO(specificVideo);
                }
              }
            } catch (err) {
              console.warn('Could not load target video:', err);
            }
          } else {
            if (adminLead) updateVideoSEO(adminLead);
          }
        }
      } catch (err) {
        console.error('Error fetching featured videos:', err);
        if (isMounted) {
          setLeadVideo(FALLBACK_VIDEOS[0]);
          setTrendingList(FALLBACK_VIDEOS);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadFeaturedAndTrending();
    return () => { isMounted = false; };
  }, [initialVideoId]);

  // Fetch all videos from backend
  useEffect(() => {
    let isMounted = true;
    const loadAllVideos = async () => {
      try {
        const data = await videoService.getVideos({ limit: 50, status: 'PUBLISHED' });
        if (isMounted) {
          if (data.videos && data.videos.length > 0) {
            setGridVideos(data.videos);
          } else {
            setGridVideos(FALLBACK_VIDEOS);
          }
        }
      } catch (err) {
        console.error('Error loading videos:', err);
        if (isMounted) {
          setGridVideos(FALLBACK_VIDEOS);
        }
      }
    };
    loadAllVideos();
    return () => { isMounted = false; };
  }, []);

  // Escape key listener for popup modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalVideo(null);
      }
    };
    if (modalVideo) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [modalVideo]);

  // Opens any other video in the popup modal player with 100% clean audio isolation
  const handleOpenModalVideo = (vid: VideoData) => {
    // 1. Instantly stop lead cinema player to prevent dual audio / echo
    setIsPlayingLead(false);
    // 2. Open popup modal for this video
    setModalVideo(vid);
    // 3. Increment views count
    if (vid.id) {
      videoService.incrementViews(vid.id);
    }
    // 4. Update SEO meta
    updateVideoSEO(vid);
    // 5. Update browser URL history without reload
    if (typeof window !== 'undefined') {
      const newUrl = `${window.location.pathname}?v=${encodeURIComponent(vid.slug || vid.id || '')}`;
      window.history.replaceState({}, '', newUrl);
    }
  };

  // Closes modal and unmounts player completely, terminating all sound instantly
  const handleCloseModal = () => {
    setModalVideo(null);
  };

  // Handle Play on the exclusive Lead cinema player
  const handlePlayLead = () => {
    setModalVideo(null); // Ensure modal is closed
    setIsPlayingLead(true);
    if (leadVideo?.id) {
      videoService.incrementViews(leadVideo.id);
    }
    if (leadVideo) {
      updateVideoSEO(leadVideo);
      if (typeof window !== 'undefined') {
        const newUrl = `${window.location.pathname}?v=${encodeURIComponent(leadVideo.slug || leadVideo.id || '')}`;
        window.history.replaceState({}, '', newUrl);
      }
    }
  };

  const handleStopLead = () => {
    setIsPlayingLead(false);
  };

  const handleShare = (vid: VideoData, e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/videos?v=${encodeURIComponent(vid.slug || vid.id || '')}`;
      navigator.clipboard.writeText(url);
      setCopiedId(vid.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const getEmbedUrl = (video: VideoData, options: { autoplay?: boolean } = {}) => {
    return buildVideoEmbedUrl(video, options);
  };

  const getThumbnail = (video: VideoData) => {
    return getVideoThumbnail(video, 'max');
  };

  // Combine and deduplicate videos - lead video goes first, followed by published videos
  const allVideos = useMemo(() => {
    const map = new Map<string, VideoData>();
    const hasDbVideos = gridVideos && gridVideos.length > 0;

    if (hasDbVideos) {
      if (leadVideo) map.set(leadVideo.id, leadVideo);
      gridVideos.forEach(v => {
        if (!map.has(v.id)) map.set(v.id, v);
      });
      trendingList.forEach(v => {
        if (!map.has(v.id)) map.set(v.id, v);
      });
    } else {
      if (leadVideo) map.set(leadVideo.id, leadVideo);
      FALLBACK_VIDEOS.forEach(v => {
        if (!map.has(v.id)) map.set(v.id, v);
      });
    }
    return Array.from(map.values());
  }, [leadVideo, trendingList, gridVideos]);

  // Extract ONLY Video Categories that come from backend video records (no navbar categories!)
  const videoCategories = useMemo(() => {
    const catMap = new Map<string, { slug: string; name: string }>();

    allVideos.forEach((vid) => {
      if (vid.category && vid.category.trim()) {
        const raw = vid.category.trim();
        const slug = raw.toLowerCase();
        if (!catMap.has(slug)) {
          const name = raw.charAt(0).toUpperCase() + raw.slice(1);
          catMap.set(slug, { slug, name });
        }
      }
    });

    return Array.from(catMap.values());
  }, [allVideos]);

  // Filter videos by selected video category
  const filteredVideos = useMemo(() => {
    return allVideos.filter((vid) => {
      // Video Category filter
      if (activeCategoryTab !== 'latest') {
        const vCat = vid.category?.trim().toLowerCase() || '';
        if (vCat !== activeCategoryTab) {
          return false;
        }
      }
      return true;
    });
  }, [allVideos, activeCategoryTab]);

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* ======================================================== */}
      {/* MOBILE VIEW (BACKEND VIDEO-ONLY CATEGORIES & CLEAN FEED) */}
      {/* ======================================================== */}
      <div className="md:hidden flex flex-col min-h-screen bg-white dark:bg-slate-950">
        
        {/* Sticky Top Bar: Shows ONLY Video Categories from Backend */}
        <header
          style={{ paddingTop: 'max(10px, env(safe-area-inset-top, 0px))' }}
          className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs"
        >
          {/* Main Video Category Strip (From Backend Videos Only) */}
          <div className="flex items-center space-x-6 px-4 overflow-x-auto no-scrollbar text-sm font-semibold pt-2">
            
            {/* 1. Latest Tab (Shows all latest videos) */}
            <button
              type="button"
              onClick={() => setActiveCategoryTab('latest')}
              className={`pb-2.5 whitespace-nowrap transition-colors relative cursor-pointer ${
                activeCategoryTab === 'latest'
                  ? 'text-red-600 dark:text-red-500 font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>Latest</span>
              {activeCategoryTab === 'latest' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-red-600 rounded-full" />
              )}
            </button>

            {/* 2. Video Categories directly from Backend Video Records */}
            {videoCategories.map((cat) => {
              const isActive = activeCategoryTab === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setActiveCategoryTab(cat.slug)}
                  className={`pb-2.5 whitespace-nowrap transition-colors relative cursor-pointer ${
                    isActive
                      ? 'text-red-600 dark:text-red-500 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{cat.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-red-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* VIDEOS FEED: Single-column 16:9 vertical cards with center red play button */}
        <div className="px-4 py-4 pb-28 space-y-6 flex-1">
          {filteredVideos.length > 0 ? (
            filteredVideos.map((vid) => {
              const thumb = getThumbnail(vid);
              const isLead = leadVideo?.id === vid.id;

              return (
                <article key={vid.id} className="space-y-2.5">
                  {/* 16:9 Thumbnail Stage: Tapping opens new dedicated video watch page */}
                  <div
                    onClick={() => handleMobileVideoClick(vid)}
                    className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-950 shadow-md cursor-pointer group select-none"
                  >
                    <img
                      src={thumb}
                      alt={vid.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
                      loading="lazy"
                    />

                    {/* Badge Top Left */}
                    <div className="absolute top-2.5 left-2.5">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow ${
                        isLead ? 'bg-red-600 text-white' : 'bg-black/75 backdrop-blur-sm text-slate-100'
                      }`}>
                        {isLead ? 'EXCLUSIVE LEAD' : (vid.badge || vid.category?.toUpperCase() || 'NEWS')}
                      </span>
                    </div>

                    {/* Center YouTube-style Red Play Button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-14 h-9.5 bg-[#ea2e2e] hover:bg-red-600 rounded-xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105 active:scale-95">
                        <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                      </div>
                    </div>

                    {/* Watermark Logo Bottom-Left: The News Paper */}
                    <div className="absolute bottom-2.5 left-3 flex items-center space-x-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] pointer-events-none">
                      <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-md p-0.5">
                        <div className="w-2 h-2 bg-yellow-200 rounded-full" />
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="text-[7.5px] font-sans font-bold text-white tracking-wider uppercase opacity-95">
                          THE
                        </span>
                        <span className="text-[9.5px] font-serif font-black text-white tracking-wide uppercase">
                          NEWSPAPER
                        </span>
                      </div>
                    </div>

                    {/* Duration Badge Bottom-Right */}
                    {vid.duration && (
                      <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                        {vid.duration}
                      </span>
                    )}
                  </div>

                  {/* Headline Below Thumbnail */}
                  <h2
                    onClick={() => handleMobileVideoClick(vid)}
                    className="font-serif font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-3 cursor-pointer hover:text-red-600 transition-colors"
                  >
                    {vid.title}
                  </h2>
                </article>
              );
            })
          ) : (
            <div className="py-20 text-center space-y-3">
              <Film className="w-12 h-12 mx-auto text-slate-400" />
              <p className="text-base font-bold text-slate-700 dark:text-slate-300">
                No videos found in this category yet.
              </p>
              <button
                type="button"
                onClick={() => setActiveCategoryTab('latest')}
                className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition-colors cursor-pointer"
              >
                View All Videos
              </button>
            </div>
          )}
        </div>

        {/* Floating Back To Top Button on Mobile */}
        {showBackToTop && (
          <button
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-20 right-4 z-40 w-11 h-11 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl flex items-center justify-center transition-all duration-300 animate-in fade-in zoom-in-90 cursor-pointer border-2 border-white/40 active:scale-95"
            title="Back to Top"
            aria-label="Back to Top"
          >
            <ChevronUp className="w-6 h-6 stroke-[2.5]" />
          </button>
        )}

      </div>

      {/* ======================================================== */}
      {/* DESKTOP VIEW (FULL CINEMA THEATRE + SHOWCASE)           */}
      {/* ======================================================== */}
      <div className="hidden md:flex md:flex-col min-h-screen">
        
        {/* 1. Desktop Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          activeCategory="videos"
          onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : (slug === 'videos' ? '/videos' : `/${slug}`))}
        />

        {/* 2. Top Dark Cinema Stage (EXCLUSIVE LEAD VIDEO ONLY) */}
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

            {/* Main Featured Cinema Screen Container: Dedicated SOLELY to the Admin Lead Video */}
            <div className="w-full max-w-[1040px] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl relative group">
              {leadVideo ? (
                <>
                  <div className="aspect-video relative overflow-hidden bg-black">
                    {isPlayingLead && !modalVideo ? (
                      <>
                        {leadVideo.videoType === 'FILE' ? (
                          <video
                            key={`lead-file-${leadVideo.id}`}
                            src={leadVideo.videoUrl}
                            controls
                            autoPlay
                            playsInline
                            className="w-full h-full object-contain bg-black"
                          />
                        ) : (
                          <iframe
                            key={`lead-iframe-${leadVideo.id}`}
                            src={getEmbedUrl(leadVideo, { autoplay: true })}
                            title={leadVideo.title}
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                          />
                        )}

                        {/* Floating Stop / Close Video Button for Lead Player */}
                        <button
                          type="button"
                          onClick={handleStopLead}
                          className="absolute top-3 right-3 z-30 bg-black/80 hover:bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center space-x-1.5 backdrop-blur-md transition-all shadow-lg cursor-pointer border border-white/10"
                          title="Stop Lead Video"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Stop Video</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <img
                          src={getThumbnail(leadVideo)}
                          alt={leadVideo.title}
                          className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
                        />

                        {/* Channel Badge Overlay */}
                        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-start justify-between">
                          <div className="space-y-1 max-w-[85%]">
                            <div className="flex items-center space-x-2">
                              <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider shadow">
                                {leadVideo.badge || 'EXCLUSIVE LEAD'}
                              </span>
                              <span className="text-[11px] font-mono text-slate-300">
                                {leadVideo.location || 'NEWS BROADCAST'}
                              </span>
                            </div>
                            <h2 className="text-lg sm:text-2xl lg:text-3xl font-black font-serif text-white tracking-tight leading-tight pt-1 drop-shadow-md">
                              {leadVideo.title}
                            </h2>
                            {leadVideo.location && (
                              <p className="text-[11px] sm:text-xs font-mono text-amber-400 font-bold tracking-wide pt-0.5">
                                {leadVideo.location}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Play Button Center Overlay */}
                        <div
                          onClick={handlePlayLead}
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
                        {leadVideo.title}
                      </h3>
                      <div className="flex items-center space-x-4 text-xs text-slate-400 font-mono">
                        {leadVideo.reporterName && <span>Reported by: <strong className="text-slate-200">{leadVideo.reporterName}</strong></span>}
                        {leadVideo.duration && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {leadVideo.duration}</span>}
                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {leadVideo.viewsCount.toLocaleString()} views</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => handleShare(leadVideo, e)}
                        className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-200 transition-colors cursor-pointer"
                      >
                        {copiedId === leadVideo.id ? (
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

        {/* 3. Top 5 Trending Countdown Strip (1 to 5): Clicking opens video in Popup Modal */}
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
                  const isCurrentModal = modalVideo?.id === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleOpenModalVideo(item)}
                      className={`relative rounded-xl overflow-hidden border cursor-pointer transition-all flex flex-col justify-between group ${
                        isCurrentModal
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

        {/* 4. Desktop Video Gallery: Clicking any card opens in Popup Modal */}
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
                const isCurrentModal = modalVideo?.id === vid.id;
                const isLead = leadVideo?.id === vid.id;

                return (
                  <article
                    key={vid.id}
                    onClick={() => handleOpenModalVideo(vid)}
                    className={`group rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                      isCurrentModal
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
                      <span className={`absolute top-2.5 left-2.5 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow ${
                        isLead ? 'bg-red-600 text-white' : 'bg-black/70 backdrop-blur-sm text-white'
                      }`}>
                        {isLead ? 'LEAD VIDEO' : (vid.badge || vid.category?.toUpperCase() || 'VIDEO')}
                      </span>

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

        {/* 5. Desktop Footer */}
        <Footer />

      </div>

      {/* ======================================================== */}
      {/* GLOBAL POPUP VIDEO MODAL (Guarantees zero ghost audio)   */}
      {/* ======================================================== */}
      {modalVideo && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseModal();
            }
          }}
        >
          <div className="bg-slate-950 text-white w-full max-w-4xl max-h-[92vh] rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
            
            {/* Modal Top Bar */}
            <div className="px-4 py-3 sm:px-6 sm:py-3.5 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2.5 min-w-0 pr-4">
                <span className="bg-red-600 text-white text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded tracking-wider shadow shrink-0">
                  {modalVideo.badge || modalVideo.category?.toUpperCase() || 'NEWS VIDEO'}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-200 truncate font-serif">
                  {modalVideo.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 sm:p-2 rounded-full bg-slate-800 hover:bg-red-600 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0 shadow"
                title="Close Video"
                aria-label="Close Video"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 16:9 Cinema Player Stage with unique key per video for clean teardown */}
            <div className="aspect-video w-full bg-black relative overflow-hidden flex items-center justify-center">
              {modalVideo.videoType === 'FILE' ? (
                <video
                  key={`modal-file-${modalVideo.id}`}
                  src={modalVideo.videoUrl}
                  controls
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain bg-black"
                />
              ) : (
                <iframe
                  key={`modal-iframe-${modalVideo.id}`}
                  src={getEmbedUrl(modalVideo, { autoplay: true })}
                  title={modalVideo.title}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              )}
            </div>

            {/* Modal Info Bar & Actions */}
            <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-900 overflow-y-auto space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <h2 className="text-base sm:text-xl font-bold font-serif text-white leading-snug">
                    {modalVideo.title}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-mono">
                    {modalVideo.location && (
                      <span className="text-amber-400 font-bold">{modalVideo.location}</span>
                    )}
                    {modalVideo.reporterName && (
                      <span>Reported by: <strong className="text-slate-200">{modalVideo.reporterName}</strong></span>
                    )}
                    {modalVideo.duration && (
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {modalVideo.duration}</span>
                    )}
                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {modalVideo.viewsCount.toLocaleString()} views</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleShare(modalVideo, e)}
                  className="flex items-center justify-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-200 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  {copiedId === modalVideo.id ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied Link!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share Video</span>
                    </>
                  )}
                </button>
              </div>

              {modalVideo.description && (
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed pt-2 border-t border-slate-900">
                  {modalVideo.description}
                </p>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

    </main>
  );
}
