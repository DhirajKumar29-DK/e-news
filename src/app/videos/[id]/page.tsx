'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Header, Footer, SearchModal } from '@/components/common';
import {
  ArrowLeft,
  Play,
  Share2,
  CheckCircle2,
  Clock,
  Eye,
  ChevronUp,
  Flame,
  Film
} from 'lucide-react';
import { videoService, VideoData } from '@/services/videoService';
import { buildVideoEmbedUrl, getVideoThumbnail } from '@/utils/videoUtils';

function updateVideoSEO(video: VideoData) {
  if (typeof document === 'undefined') return;
  const siteTitle = 'Vartiq';
  const pageTitle = video.metaTitle || video.title || 'Latest News Video';
  const pageDesc = video.metaDescription || video.description || 'Watch latest news videos, breaking bulletins, field reports, and expert analysis on Vartiq.';
  const pageImage = video.thumbnailUrl || (video.youtubeId ? `https://img.youtube.com/vi/${video.youtubeId}/maxresdefault.jpg` : '');
  const pageUrl = video.canonicalUrl || (typeof window !== 'undefined' ? `${window.location.origin}/videos/${encodeURIComponent(video.slug || video.id || '')}` : '');

  document.title = `${pageTitle} | ${siteTitle}`;

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

  setMeta('meta[name="description"]', 'content', pageDesc);
  setMeta('meta[name="robots"]', 'content', 'index, follow');
  if (pageUrl) setLink('canonical', pageUrl);

  setMeta('meta[property="og:title"]', 'content', pageTitle);
  setMeta('meta[property="og:description"]', 'content', pageDesc);
  setMeta('meta[property="og:type"]', 'content', 'video.other');
  if (pageUrl) setMeta('meta[property="og:url"]', 'content', pageUrl);
  setMeta('meta[property="og:site_name"]', 'content', siteTitle);
  if (pageImage) setMeta('meta[property="og:image"]', 'content', pageImage);

  setMeta('meta[name="twitter:card"]', 'content', 'summary_large_image');
  setMeta('meta[name="twitter:title"]', 'content', pageTitle);
  setMeta('meta[name="twitter:description"]', 'content', pageDesc);
  if (pageImage) setMeta('meta[name="twitter:image"]', 'content', pageImage);
}

export default function VideoDetailPage() {
  const params = useParams();
  const router = useRouter();

  const idOrSlug = typeof params?.id === 'string' ? params.id : '';

  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [relatedVideos, setRelatedVideos] = useState<VideoData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

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

  // Fetch target video details and related videos
  useEffect(() => {
    let isMounted = true;
    if (!idOrSlug) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const video = await videoService.getVideoByIdOrSlug(idOrSlug);
        if (isMounted && video) {
          setCurrentVideo(video);
          updateVideoSEO(video);
          if (video.id) {
            videoService.incrementViews(video.id);
          }
        }
      } catch (err) {
        console.error('Error fetching video by id/slug:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [idOrSlug]);

  // Fetch related video list
  useEffect(() => {
    let isMounted = true;
    const loadRelated = async () => {
      try {
        const res = await videoService.getVideos({ limit: 25, status: 'PUBLISHED' });
        if (isMounted && res.videos && res.videos.length > 0) {
          setRelatedVideos(res.videos);
        }
      } catch (err) {
        console.warn('Error loading related videos:', err);
      }
    };
    loadRelated();
    return () => { isMounted = false; };
  }, []);

  const handleShare = () => {
    if (typeof window !== 'undefined' && currentVideo) {
      const url = `${window.location.origin}/videos/${encodeURIComponent(currentVideo.slug || currentVideo.id)}`;
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const getEmbedUrl = (v: VideoData) => {
    return buildVideoEmbedUrl(v, { autoplay: true });
  };

  const getThumbnail = (v: VideoData) => {
    return getVideoThumbnail(v, 'max');
  };

  // Filter out the active video from related list
  const filteredRelated = relatedVideos.filter(
    (v) => v.id !== currentVideo?.id && v.slug !== currentVideo?.slug
  );

  return (
    <main className="min-h-screen flex flex-col bg-slate-50 dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">

      {/* 1. Desktop Site Header */}
      <div className="hidden md:block">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          activeCategory="videos"
          onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : (slug === 'videos' ? '/videos' : `/${slug}`))}
        />

        {/* Desktop Breadcrumbs */}
        <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 sm:px-12 py-3 text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-2 font-mono">
          <Link href="/" className="hover:text-red-600 transition-colors">HOME</Link>
          <span>/</span>
          <Link href="/videos" className="hover:text-red-600 transition-colors">VIDEOS</Link>
          <span>/</span>
          <span className="text-slate-900 dark:text-slate-200 font-semibold truncate max-w-md">
            {currentVideo?.title || 'WATCH'}
          </span>
        </div>
      </div>

      {/* 2. Mobile Clean Light Sticky Header */}
      <header
        style={{ paddingTop: 'max(8px, env(safe-area-inset-top, 0px))' }}
        className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 px-3.5 py-2.5 flex items-center justify-between shadow-xs"
      >
        {/* Back to Videos List Button */}
        <button
          type="button"
          onClick={() => router.push('/videos')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>Videos</span>
        </button>

        {/* Brand Logo */}
        <Link href="/" className="flex items-center space-x-1.5">
          <div className="w-4.5 h-4.5 rounded-full bg-gradient-to-tr from-amber-500 via-orange-500 to-red-600 flex items-center justify-center shadow-md p-0.5">
            <div className="w-2 h-2 bg-yellow-200 rounded-full" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-[7.5px] font-sans font-bold text-slate-700 dark:text-slate-300 tracking-wider uppercase opacity-95">
              THE
            </span>
            <span className="text-[9.5px] font-serif font-black text-slate-900 dark:text-white tracking-wide uppercase">
              NEWSPAPER
            </span>
          </div>
        </Link>

        {/* Share Button */}
        <button
          type="button"
          onClick={handleShare}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          title="Share Video"
        >
          {isCopied ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          ) : (
            <Share2 className="w-4 h-4 stroke-[2.2]" />
          )}
        </button>
      </header>

      {/* 3. MAIN UNIFIED CONTENT: ONLY ONE VIDEO PLAYER IN THE ENTIRE DOM */}
      <div className="max-w-[1440px] mx-auto w-full py-0 md:py-8 px-0 md:px-8 lg:px-12 flex-1 pb-24 md:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 md:gap-8 items-start">

          {/* LEFT / MAIN COLUMN: THE SINGLE PLAYER + VIDEO DETAILS (8 Cols on Desktop, Full on Mobile) */}
          <div className="lg:col-span-8 space-y-0 md:space-y-6">

            {/* ONLY 1 VIDEO PLAYER IN THE ENTIRE COMPONENT (Zero ghost audio, 100% clean pause) */}
            <div className="w-full aspect-video bg-black relative overflow-hidden md:rounded-2xl shadow-xl border-y md:border border-slate-200 dark:border-slate-800">
              {isLoading ? (
                <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-slate-400 bg-slate-950">
                  <div className="w-9 h-9 border-3 border-red-600 border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-mono text-slate-400">Loading bulletin...</span>
                </div>
              ) : currentVideo ? (
                currentVideo.videoType === 'FILE' ? (
                  <video
                    key={`unified-player-${currentVideo.id}`}
                    src={currentVideo.videoUrl}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain bg-black"
                  />
                ) : (
                  <iframe
                    key={`unified-player-${currentVideo.id}`}
                    src={getEmbedUrl(currentVideo)}
                    title={currentVideo.title}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm bg-slate-950">
                  Video not found.
                </div>
              )}
            </div>

            {/* Video Headline & Information Card (Clean White / Light Theme) */}
            {currentVideo && (
              <div className="p-4 md:p-6 bg-white dark:bg-slate-900 md:rounded-2xl border-b md:border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
                
                {/* Badges Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center space-x-2">
                    <span className="bg-red-600 text-white text-[10px] md:text-xs font-black uppercase px-2.5 py-0.5 rounded shadow">
                      {currentVideo.badge || currentVideo.category?.toUpperCase() || 'NEWS VIDEO'}
                    </span>
                    {currentVideo.location && (
                      <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400">
                        {currentVideo.location}
                      </span>
                    )}
                  </div>

                  {/* Share button (Desktop & Mobile) */}
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-100 hover:bg-red-600 hover:text-white dark:bg-slate-800 dark:hover:bg-red-600 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
                  >
                    {isCopied ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Copied Link!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5" />
                        <span>Share Video</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Main Headline */}
                <h1 className="text-lg md:text-2xl lg:text-3xl font-serif font-black text-slate-900 dark:text-white leading-snug tracking-tight">
                  {currentVideo.title}
                </h1>

                {/* Statistics & Metadata Bar */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono border-t border-slate-100 dark:border-slate-800 pt-3">
                  <span className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300">
                    <Eye className="w-4 h-4 text-red-600" />
                    <span>{currentVideo.viewsCount.toLocaleString()} views</span>
                  </span>
                  {currentVideo.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Duration: {currentVideo.duration}</span>
                    </span>
                  )}
                  {currentVideo.reporterName && (
                    <span>Reported by: <strong className="text-slate-800 dark:text-slate-200">{currentVideo.reporterName}</strong></span>
                  )}
                </div>

                {/* Reporter and Description Box */}
                {currentVideo.description && (
                  <div className="bg-slate-50 dark:bg-slate-950/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-800/80 text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {currentVideo.description}
                  </div>
                )}

              </div>
            )}

          </div>

          {/* RIGHT / BELOW COLUMN: UP NEXT / MORE BULLETINS FEED (4 Cols on Desktop, Stacked on Mobile) */}
          <aside className="lg:col-span-4 p-4 md:p-0 space-y-4">
            
            <div className="flex items-center space-x-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <Flame className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
              <h2 className="text-sm md:text-base font-black font-serif uppercase tracking-tight text-slate-900 dark:text-white">
                MORE BULLETINS & VIDEOS
              </h2>
            </div>

            <div className="space-y-3.5">
              {filteredRelated.map((item) => {
                const thumb = getThumbnail(item);

                return (
                  <article
                    key={item.id}
                    onClick={() => router.push(`/videos/${encodeURIComponent(item.slug || item.id)}`)}
                    className="flex space-x-3 p-3 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md cursor-pointer transition-all group shadow-xs"
                  >
                    {/* Left Thumbnail (16:10) */}
                    <div className="w-32 md:w-36 aspect-[16/10] rounded-xl overflow-hidden bg-slate-950 relative shrink-0">
                      <img
                        src={thumb}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Red Play Button Overlay */}
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 flex items-center justify-center transition-colors">
                        <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-red-600 text-white flex items-center justify-center shadow">
                          <Play className="w-3 h-3 md:w-3.5 md:h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>

                      {/* Duration Tag */}
                      {item.duration && (
                        <span className="absolute bottom-1 right-1 bg-black/85 text-white text-[9px] font-mono font-bold px-1 py-0.5 rounded">
                          {item.duration}
                        </span>
                      )}
                    </div>

                    {/* Right Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div>
                        {item.badge && (
                          <span className="text-[9px] font-black uppercase text-red-600 dark:text-red-400 block mb-1">
                            {item.badge}
                          </span>
                        )}
                        <h3 className="text-xs font-bold font-serif leading-snug line-clamp-2 text-slate-900 dark:text-slate-100 group-hover:text-red-600 transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono pt-1">
                        <span className="truncate max-w-[90px]">{item.reporterName || item.location || 'NEWS'}</span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {item.viewsCount.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

          </aside>

        </div>
      </div>

      {/* 4. Desktop Site Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* 5. Floating Back To Top Button on Mobile & Desktop */}
      {showBackToTop && (
        <button
          type="button"
          onClick={scrollToTop}
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-40 w-11 h-11 md:w-12 md:h-12 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-2xl flex items-center justify-center transition-all duration-300 animate-in fade-in zoom-in-90 cursor-pointer border-2 border-white/40 active:scale-95"
          title="Back to Top"
          aria-label="Back to Top"
        >
          <ChevronUp className="w-6 h-6 stroke-[2.5]" />
        </button>
      )}

      {/* 6. Global Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

    </main>
  );
}
