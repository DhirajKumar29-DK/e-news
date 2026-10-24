'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Header, Footer, SearchModal } from '@/components/common';
import { Play, Eye, Clock, Share2, Film, Sparkles, Filter, CheckCircle2, X, ChevronUp, ChevronDown, Flame } from 'lucide-react';
import { videoService, VideoData } from '@/services/videoService';
import { buildVideoEmbedUrl, getVideoThumbnail, getYouTubeId, isRegularVideo, isShortVideo } from '@/utils/videoUtils';

function updateVideoSEO(video: VideoData) {
  if (typeof document === 'undefined') return;
  const siteTitle = 'Vartiq';
  const pageTitle = video.metaTitle || video.title || 'Latest News Video';
  const pageDesc = video.metaDescription || video.description || 'Watch latest news videos, breaking bulletins, field reports, and expert analysis on Vartiq.';
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

  // Mobile-only dual tab switcher: 'shorts' vs 'videos' (matches Dainik Jagran reference)
  const [mobileSubTab, setMobileSubTab] = useState<'shorts' | 'videos'>('shorts');
  const [shortsList, setShortsList] = useState<VideoData[]>([]);
  const [activeShortIndex, setActiveShortIndex] = useState<number>(0);
  const [isShortPaused, setIsShortPaused] = useState(false);

  const reelContainerRef = useRef<HTMLDivElement>(null);
  const shortIframeRef = useRef<HTMLIFrameElement>(null);
  const lastTapTimeRef = useRef<number>(0);
  const isShortPausedRef = useRef(false);

  useEffect(() => {
    isShortPausedRef.current = isShortPaused;
  }, [isShortPaused]);

  // Send commands to YouTube IFrame API via postMessage
  const sendYtCommand = (command: 'pauseVideo' | 'playVideo') => {
    const iframe = shortIframeRef.current;
    if (!iframe || !iframe.contentWindow) return;
    try {
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: command, args: '' }), '*');
      iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: command, args: [] }), '*');
    } catch (err) {
      console.warn('YouTube postMessage error:', err);
    }
  };

  // Toggle Play / Pause with 350ms debounce to prevent touch-click double triggers
  const toggleShortPlayPause = () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 350) return;
    lastTapTimeRef.current = now;

    setIsShortPaused(prev => {
      const nextPaused = !prev;
      sendYtCommand(nextPaused ? 'pauseVideo' : 'playVideo');
      return nextPaused;
    });
  };

  // Strict screen check: mobile view and shorts ONLY exist when screen is < 768px
  // When resized or switched to desktop, mobile view unmounts completely, killing all iframe audio instantly
  const [isMobileScreen, setIsMobileScreen] = useState<boolean>(false);
  const [hasMounted, setHasMounted] = useState<boolean>(false);

  useEffect(() => {
    setHasMounted(true);
    const checkScreen = () => {
      if (typeof window !== 'undefined') {
        setIsMobileScreen(window.innerWidth < 768);
      }
    };
    checkScreen();
    window.addEventListener('resize', checkScreen);
    return () => window.removeEventListener('resize', checkScreen);
  }, []);

  // Auto-play loop: seamlessly replays the same video when finished without flashing pause icon
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        let data = event.data;
        if (typeof data === 'string' && data.startsWith('{')) {
          data = JSON.parse(data);
        }
        if (!data || isShortPausedRef.current) return;

        const iframe = shortIframeRef.current;
        if (!iframe || !iframe.contentWindow) return;

        // When video reaches ENDED (0), call playVideo directly without seekTo to prevent pause HUD icon
        if ((data.event === 'onStateChange' && (data.info === 0 || data.info === '0')) || data.info?.playerState === 0) {
          iframe.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
        }
      } catch {
        // Ignore unparseable postMessages
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const scrollDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Instant scroll tracker: directly changes activeShortIndex when user scrolls to any card
  const handleContainerScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const height = container.clientHeight;
    if (!height) return;

    const newIndex = Math.round(container.scrollTop / height);
    if (newIndex >= 0 && newIndex < shortsList.length && newIndex !== activeShortIndex) {
      if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
      scrollDebounceRef.current = setTimeout(() => {
        setActiveShortIndex(newIndex);
        setIsShortPaused(false);
      }, 50);
    }
  };

  // IntersectionObserver to accurately detect which short is in view (1 scroll = 1 video, no skipping)
  useEffect(() => {
    if (!hasMounted || !isMobileScreen || mobileSubTab !== 'shorts' || shortsList.length === 0) return;

    const container = reelContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const idx = Number(entry.target.getAttribute('data-index'));
            if (!isNaN(idx)) {
              setActiveShortIndex(prev => {
                if (prev !== idx) {
                  setIsShortPaused(false);
                  return idx;
                }
                return prev;
              });
            }
          }
        });
      },
      {
        root: container,
        threshold: [0.5]
      }
    );

    const slides = container.querySelectorAll('[data-index]');
    slides.forEach((slide) => observer.observe(slide));

    return () => observer.disconnect();
  }, [hasMounted, isMobileScreen, mobileSubTab, shortsList]);

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

  // On Mobile: Clicking any video opens in the popup modal player
  const handleMobileVideoClick = (vid: VideoData) => {
    handleOpenModalVideo(vid);
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'Latest News Videos, Bulletins & Visual Reports | Vartiq';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', 'Watch top news videos, breaking bulletins, field reports, and expert analysis on Vartiq.');
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
          // STRICT RULE: Only include regular long videos here, exclude all Shorts
          const cleanTrending = (data.trendingVideos || []).filter(isRegularVideo);
          const adminLead = (data.heroVideo && isRegularVideo(data.heroVideo))
            ? data.heroVideo
            : (cleanTrending[0] || FALLBACK_VIDEOS[0]);
          setLeadVideo(adminLead);

          setTrendingList(cleanTrending.length > 0 ? cleanTrending.slice(0, 5) : FALLBACK_VIDEOS);

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

  // Fetch all videos from backend (splits strictly into regular videos & shorts)
  useEffect(() => {
    let isMounted = true;
    const loadAllVideos = async () => {
      try {
        const data = await videoService.getVideos({ limit: 60, status: 'PUBLISHED' });
        if (isMounted) {
          const cleanRegularVideos = (data.videos || []).filter(isRegularVideo);
          const cleanShorts = (data.videos || []).filter(isShortVideo);
          setGridVideos(cleanRegularVideos.length > 0 ? cleanRegularVideos : FALLBACK_VIDEOS);
          setShortsList(cleanShorts);

          // If a video is requested via ?v= in URL and modal is not open yet, open it
          if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const target = params.get('v');
            if (target) {
              const decodedTarget = decodeURIComponent(target).toLowerCase();
              const matched = (data.videos || []).find((v) => 
                (v.id && v.id.toLowerCase() === decodedTarget) || 
                (v.slug && v.slug.toLowerCase() === decodedTarget)
              );
              if (matched) {
                if (leadVideo && (matched.id === leadVideo.id || matched.slug === leadVideo.slug)) {
                  setIsPlayingLead(true);
                } else {
                  setModalVideo(matched);
                }
                updateVideoSEO(matched);
              }
            }
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

  // Opens non-lead videos in popup modal, while lead video plays exclusively in Hero stage
  const handleOpenModalVideo = (vid: VideoData) => {
    // If clicked video is the Lead video, play it exclusively in the Hero Cinema Stage
    if (leadVideo && (vid.id === leadVideo.id || vid.slug === leadVideo.slug)) {
      setModalVideo(null);
      setIsPlayingLead(true);
      if (typeof window !== 'undefined') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const newUrl = `${window.location.pathname}?v=${encodeURIComponent(vid.slug || vid.id || '')}&play=1`;
        window.history.replaceState({}, '', newUrl);
      }
      return;
    }

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

  // Combine and deduplicate videos - lead video goes first, followed by published videos (STRICTLY REGULAR ONLY)
  const allVideos = useMemo(() => {
    const map = new Map<string, VideoData>();
    const hasDbVideos = gridVideos && gridVideos.length > 0;

    if (hasDbVideos) {
      if (leadVideo && isRegularVideo(leadVideo)) map.set(leadVideo.id, leadVideo);
      gridVideos.filter(isRegularVideo).forEach(v => {
        if (!map.has(v.id)) map.set(v.id, v);
      });
      trendingList.filter(isRegularVideo).forEach(v => {
        if (!map.has(v.id)) map.set(v.id, v);
      });
    } else {
      if (leadVideo && isRegularVideo(leadVideo)) map.set(leadVideo.id, leadVideo);
      FALLBACK_VIDEOS.filter(isRegularVideo).forEach(v => {
        if (!map.has(v.id)) map.set(v.id, v);
      });
    }
    return Array.from(map.values()).filter(isRegularVideo);
  }, [leadVideo, trendingList, gridVideos]);

  // Extract ONLY Video Categories that come from backend video records (no navbar categories!)
  const videoCategories = useMemo(() => {
    const catMap = new Map<string, { slug: string; name: string }>();

    allVideos.forEach((vid) => {
      if (vid.category && vid.category.trim() && vid.category.toLowerCase() !== 'shorts') {
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

  // Filter videos by selected video category (strictly regular videos only)
  const filteredVideos = useMemo(() => {
    return allVideos.filter(isRegularVideo).filter((vid) => {
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
      {/* MOBILE VIEW (DUAL-TAB: SHORTS VS VIDEOS - PHONE ONLY)    */}
      {/* ======================================================== */}
      {hasMounted && isMobileScreen && (
        <div className={`md:hidden flex flex-col bg-black ${mobileSubTab === 'shorts' ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}>
        
        {/* Fixed Top Pill Switcher: [ Shorts | Videos ] - 100% Fixed and Solid */}
        <div className="fixed top-0 inset-x-0 h-[52px] z-40 bg-white dark:bg-slate-950 pt-2.5 pb-2 px-4 flex justify-center border-b border-slate-200 dark:border-slate-800 shadow-sm shrink-0">
          <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-full flex items-center space-x-1 border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setMobileSubTab('shorts')}
              className={`flex items-center space-x-1.5 px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mobileSubTab === 'shorts'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Shorts</span>
            </button>
            <button
              type="button"
              onClick={() => setMobileSubTab('videos')}
              className={`flex items-center space-x-1.5 px-5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mobileSubTab === 'videos'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Videos</span>
            </button>
          </div>
        </div>

        {/* 1. SHORTS FULL-SCREEN VERTICAL REEL VIEW (Native Snap-Scroll: 1 Scroll = Exactly 1 Video) */}
        {mobileSubTab === 'shorts' ? (
          <div
            ref={reelContainerRef}
            onScroll={handleContainerScroll}
            className="fixed top-[52px] bottom-[58px] inset-x-0 w-full overflow-y-scroll snap-y snap-mandatory bg-black select-none no-scrollbar"
            style={{
              scrollSnapType: 'y mandatory',
              WebkitOverflowScrolling: 'touch',
              overscrollBehaviorY: 'contain'
            }}
          >
            {shortsList.length > 0 ? (
              shortsList.map((short, idx) => {
                const isCurrent = idx === activeShortIndex;
                const originParam = typeof window !== 'undefined' && window.location.origin
                  ? `&origin=${encodeURIComponent(window.location.origin)}`
                  : '';

                return (
                  <div
                    key={`short-slide-${short.id || short.youtubeId || idx}`}
                    data-index={idx}
                    className="w-full h-full snap-start snap-always shrink-0 relative overflow-hidden bg-black flex items-center justify-center"
                    style={{
                      height: '100%',
                      scrollSnapAlign: 'start',
                      scrollSnapStop: 'always'
                    }}
                  >
                    {isCurrent ? (
                      /* Live YouTube IFrame Embed (Mounted ONLY for current visible short - Stops all other audio) */
                      <iframe
                        ref={shortIframeRef}
                        key={`yt-active-${short.youtubeId}`}
                        src={`https://www.youtube.com/embed/${short.youtubeId}?autoplay=1&playsinline=1&controls=0&modestbranding=1&rel=0&enablejsapi=1&iv_load_policy=3&fs=0&disablekb=1&cc_load_policy=0${originParam}`}
                        title={short.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="w-full h-full border-0 pointer-events-none"
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          objectFit: 'cover'
                        }}
                        onLoad={() => {
                          if (shortIframeRef.current?.contentWindow) {
                            shortIframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'listening' }), '*');
                          }
                        }}
                      />
                    ) : (
                      /* High-Res Preview Poster for inactive shorts (Ultra-smooth 60fps native scroll, zero memory & zero audio) */
                      <div className="absolute inset-0 w-full h-full bg-black flex items-center justify-center overflow-hidden">
                        <img
                          src={getVideoThumbnail(short, 'max')}
                          alt={short.title}
                          className="w-full h-full object-cover opacity-85"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Tap Surface: Clicking toggles Play / Pause */}
                    <div
                      onClick={toggleShortPlayPause}
                      className="absolute inset-0 z-20 cursor-pointer flex items-center justify-center"
                    >
                      {/* When Paused: Display Sleek Glassmorphic Play Icon */}
                      {isCurrent && isShortPaused && (
                        <div className="w-16 h-16 rounded-full bg-black/65 border border-white/40 text-white flex items-center justify-center shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-75 duration-200 pointer-events-none">
                          <Play className="w-8 h-8 fill-white text-white ml-1" />
                        </div>
                      )}
                    </div>

                    {/* Bottom Headline & Metadata Overlay matching reference */}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 pb-4 pt-16 flex items-end justify-between gap-3 z-30 pointer-events-auto">
                      <div className="flex-1 pr-2">
                        {short.location && (
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-[11px] font-semibold text-slate-300 drop-shadow-sm">
                              {short.location}
                            </span>
                          </div>
                        )}
                        <h2 className="text-white font-bold text-sm sm:text-base leading-snug drop-shadow-md line-clamp-2 font-serif">
                          {short.title}
                        </h2>
                      </div>

                      {/* Share Button on Bottom Right */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const url = short.youtubeId
                            ? `https://www.youtube.com/shorts/${short.youtubeId}`
                            : (short.videoUrl || window.location.href);
                          if (navigator.share) {
                            navigator.share({ title: short.title, url }).catch(() => {});
                          } else {
                            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(short.title + ' ' + url)}`, '_blank');
                          }
                        }}
                        className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-md text-white flex items-center justify-center shadow-lg transition active:scale-90 shrink-0 cursor-pointer"
                        title="Share Short"
                      >
                        <Share2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-400 py-20 space-y-3">
                <Flame className="w-12 h-12 mx-auto text-red-500 animate-pulse" />
                <p className="font-bold text-sm text-white">Loading Shorts Feed...</p>
              </div>
            )}
          </div>
        ) : (
          /* 2. REGULAR VIDEOS FEED: Categories + 16:9 Landscape Video List */
          <div className="flex flex-col flex-1 bg-white dark:bg-slate-950 pt-[52px]">
            {/* Category Strip */}
            <div className="sticky top-[52px] z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 transition-colors shadow-xs">
              <div className="flex items-center space-x-6 px-4 overflow-x-auto no-scrollbar text-sm font-semibold pt-2">
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
            </div>

            {/* 16:9 Video Cards List */}
            <div className="px-4 py-4 pb-28 space-y-6 flex-1">
              {filteredVideos.length > 0 ? (
                filteredVideos.map((vid) => {
                  const thumb = getThumbnail(vid);
                  const isLead = leadVideo?.id === vid.id;

                  return (
                    <article key={vid.id} className="space-y-2.5">
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

                        <div className="absolute top-2.5 left-2.5">
                          <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded shadow ${
                            isLead ? 'bg-red-600 text-white' : 'bg-black/75 backdrop-blur-sm text-slate-100'
                          }`}>
                            {isLead ? 'EXCLUSIVE LEAD' : (vid.badge || vid.category?.toUpperCase() || 'NEWS')}
                          </span>
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-14 h-9.5 bg-[#ea2e2e] hover:bg-red-600 rounded-xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105 active:scale-95">
                            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                          </div>
                        </div>

                        <div className="absolute bottom-2.5 left-3 flex items-center space-x-1.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.85)] pointer-events-none">
                          <img
                            src="/vartiq-icon.png"
                            alt="Vartiq"
                            className="w-5 h-5 rounded-md object-cover shadow"
                          />
                          <span className="text-[10px] font-black font-serif text-white tracking-wide uppercase">
                            VARTIQ
                          </span>
                        </div>

                        {vid.duration && (
                          <span className="absolute bottom-2.5 right-2.5 bg-black/80 backdrop-blur-sm text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow">
                            {vid.duration}
                          </span>
                        )}
                      </div>

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
          </div>
        )}

        {/* Floating Back To Top Button on Mobile */}
        {showBackToTop && mobileSubTab === 'videos' && (
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
      )}

      {/* ======================================================== */}
      {/* DESKTOP VIEW (FULL CINEMA THEATRE + SHOWCASE)           */}
      {/* ======================================================== */}
      {(!hasMounted || !isMobileScreen) && (
        <div className="hidden md:flex md:flex-col min-h-screen">
        
        {/* 1. Desktop Header */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          activeCategory="videos"
          onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : (slug === 'videos' ? '/videos' : `/${slug}`))}
        />

        {/* 2. Top Cinema Stage (EXCLUSIVE LEAD VIDEO ONLY) - Centered & Sleek Light-Black Charcoal Stage */}
        <section className="w-full bg-gradient-to-b from-[#141824] via-[#1b2234] to-[#10141f] text-white py-6 sm:py-8 px-4 sm:px-6 lg:px-8 border-b border-slate-700/60 relative overflow-hidden shadow-sm">
          {/* Subtle Ambient Studio Lighting */}
          <div className="absolute inset-0 bg-[radial-gradient(#475569_1px,transparent_1px)] [background-size:20px_20px] opacity-25 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[300px] bg-red-600/12 blur-[100px] pointer-events-none rounded-full" />
          <div className="absolute -top-12 right-1/4 w-[350px] h-[200px] bg-blue-500/10 blur-[90px] pointer-events-none rounded-full" />

          {/* Centered Main Container: 100% Horizontally Centered */}
          <div className="w-full max-w-[820px] mx-auto flex flex-col items-center justify-center relative z-10">

            {/* Main Featured Cinema Screen Container: Sleek & Perfectly Proportioned */}
            <div className="w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-700/80 shadow-[0_15px_40px_rgba(0,0,0,0.6)] relative group">
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

                        {/* Channel Badge Overlay - Non-blocking pointer events, line-clamp-2 */}
                        <div className="absolute top-0 left-0 right-0 p-3.5 sm:p-4 bg-gradient-to-b from-black/85 via-black/45 to-transparent flex items-start justify-between pointer-events-none z-10">
                          <div className="space-y-1 max-w-[90%]">
                            <div className="flex items-center space-x-2">
                              <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded tracking-wider shadow">
                                {leadVideo.badge || 'EXCLUSIVE LEAD'}
                              </span>
                              <span className="text-[10px] sm:text-[11px] font-mono text-slate-300">
                                {leadVideo.location || 'NEWS BROADCAST'}
                              </span>
                            </div>
                            <h2 className="text-sm sm:text-base lg:text-lg font-bold font-serif text-white tracking-tight leading-snug drop-shadow-md line-clamp-2">
                              {leadVideo.title}
                            </h2>
                          </div>
                        </div>

                        {/* Play Button Center Overlay */}
                        <div
                          onClick={handlePlayLead}
                          className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-2xl group-hover:scale-105 transition-all duration-300 border-2 border-white/30 backdrop-blur-xs">
                            <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-white ml-0.5" />
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sub Bar below video with reporter and action controls */}
                  <div className="px-5 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800/90 flex flex-wrap items-center justify-between gap-3">
                    <div className="space-y-0.5 min-w-0 max-w-md lg:max-w-lg">
                      <h3 className="text-xs sm:text-sm font-bold text-white truncate">
                        {leadVideo.title}
                      </h3>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-mono">
                        {leadVideo.reporterName && (
                          <span className="truncate">Reported by: <strong className="text-slate-200">{leadVideo.reporterName}</strong></span>
                        )}
                        {leadVideo.duration && (
                          <span className="flex items-center gap-1 shrink-0"><Clock className="w-3 h-3" /> {leadVideo.duration}</span>
                        )}
                        <span className="flex items-center gap-1 shrink-0"><Eye className="w-3 h-3 text-red-500" /> {leadVideo.viewsCount.toLocaleString()} views</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => handleShare(leadVideo, e)}
                        className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold rounded-lg text-slate-200 transition-colors cursor-pointer border border-slate-700/70 hover:border-slate-500 shadow-sm"
                        title="Share Video"
                      >
                        {copiedId === leadVideo.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
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
                    <div className="p-3.5 space-y-2.5 flex-1 flex flex-col justify-between">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-amber-300 transition-colors leading-snug line-clamp-2">
                        {vid.title}
                      </h4>

                      <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
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
      )}

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
