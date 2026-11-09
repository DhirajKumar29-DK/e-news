'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { X, Play, Film, Eye, Clock, Share2, Sparkles, Maximize2, Minimize2 } from 'lucide-react';
import { videoService, VideoData } from '@/services/videoService';
import { buildVideoEmbedUrl, getVideoThumbnail, isRegularVideo } from '@/utils/videoUtils';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoId?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, initialVideoId }) => {
  const { language, t } = useLanguage();

  const [videos, setVideos] = useState<VideoData[]>([]);
  const [activeVideo, setActiveVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const videoStageRef = useRef<HTMLDivElement>(null);
  const [isLandscapeMode, setIsLandscapeMode] = useState<boolean>(false);
  const justSwitchedToLandscapeRef = useRef(false);

  // Automatic Landscape Orientation on Fullscreen: When user taps fullscreen, lock or rotate to landscape
  useEffect(() => {
    if (!isOpen) return;

    const handleFullscreenChange = async () => {
      const isFullscreen = Boolean(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      );

      if (isFullscreen) {
        const isPortrait = typeof window !== 'undefined' && window.innerHeight > window.innerWidth;
        if (typeof window !== 'undefined' && window.screen?.orientation) {
          try {
            await (window.screen.orientation as any).lock?.('landscape');
          } catch {}
        }
        if (isPortrait) {
          justSwitchedToLandscapeRef.current = true;
          try {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
              await (document as any).webkitExitFullscreen();
            }
          } catch {}
          setIsLandscapeMode(true);
        }
      } else {
        if (!justSwitchedToLandscapeRef.current) {
          if (typeof window !== 'undefined' && window.screen?.orientation) {
            try {
              (window.screen.orientation as any).unlock?.();
            } catch {}
          }
        } else {
          justSwitchedToLandscapeRef.current = false;
        }
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
      if (typeof window !== 'undefined' && window.screen?.orientation) {
        try {
          (window.screen.orientation as any).unlock?.();
        } catch {}
      }
    };
  }, [isOpen]);

  // Back button / Escape listener to smoothly exit Landscape mode
  useEffect(() => {
    if (!isLandscapeMode) return;
    const handleBack = (e: Event) => {
      e.preventDefault();
      setIsLandscapeMode(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLandscapeMode(false);
      }
    };
    window.addEventListener('app_back_pressed', handleBack);
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('app_back_pressed', handleBack);
      window.removeEventListener('keydown', handleKey);
    };
  }, [isLandscapeMode]);

  const handleToggleLandscape = async () => {
    try {
      if (!isLandscapeMode) {
        setIsLandscapeMode(true);
        if (typeof window !== 'undefined' && window.screen?.orientation) {
          try {
            await (window.screen.orientation as any).lock?.('landscape');
          } catch {}
        }
      } else {
        setIsLandscapeMode(false);
        if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
          try {
            if (document.exitFullscreen) {
              await document.exitFullscreen();
            } else if ((document as any).webkitExitFullscreen) {
              await (document as any).webkitExitFullscreen();
            }
          } catch {}
        }
        if (typeof window !== 'undefined' && window.screen?.orientation) {
          try {
            (window.screen.orientation as any).unlock?.();
          } catch {}
        }
      }
    } catch (err) {
      console.warn('Landscape toggle error:', err);
    }
  };

  const getLandscapeStyle = (): React.CSSProperties | undefined => {
    if (!isLandscapeMode) return undefined;

    if (typeof window !== 'undefined' && window.innerWidth > window.innerHeight) {
      return {
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 99999,
        backgroundColor: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };
    }

    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      width: '100dvh',
      height: '100dvw',
      transform: 'translate(-50%, -50%) rotate(90deg)',
      transformOrigin: 'center center',
      zIndex: 99999,
      backgroundColor: '#000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    };
  };

  const handleClose = () => {
    setIsLandscapeMode(false);
    if (typeof document !== 'undefined' && (document.fullscreenElement || (document as any).webkitFullscreenElement)) {
      try {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        }
      } catch {}
    }
    if (typeof window !== 'undefined' && window.screen?.orientation) {
      try {
        (window.screen.orientation as any).unlock?.();
      } catch {}
    }
    onClose();
  };

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchVideos = async () => {
      try {
        const res = await videoService.getVideos({ limit: 35, status: 'PUBLISHED' });
        if (isMounted && res.videos && res.videos.length > 0) {
          const cleanVideos = res.videos.filter(isRegularVideo);
          setVideos(cleanVideos);
          if (initialVideoId) {
            const match = cleanVideos.find(v => v.id === initialVideoId || v.slug === initialVideoId);
            setActiveVideo(match || cleanVideos[0]);
          } else {
            setActiveVideo(cleanVideos[0]);
          }
        }
      } catch (err) {
        console.warn('VideoModal: could not load remote videos:', err);
      }
    };

    fetchVideos();
    return () => { isMounted = false; };
  }, [isOpen, initialVideoId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    const handleBack = (e: Event) => {
      e.preventDefault();
      handleClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('app_back_pressed', handleBack);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('app_back_pressed', handleBack);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['ALL', 'INDIA', 'WORLD', 'TECH', 'BUSINESS', 'SPORTS'];

  const filteredVideos = selectedCategory === 'ALL'
    ? videos
    : videos.filter(v => v.category?.toUpperCase() === selectedCategory);

  const handleSelectVideo = (v: VideoData) => {
    setActiveVideo(v);
    setIsPlaying(true);
    if (v.id) videoService.incrementViews(v.id);
  };

  const handleCopyLink = () => {
    if (typeof window !== 'undefined' && activeVideo) {
      const url = `${window.location.origin}/videos?v=${activeVideo.slug || activeVideo.id}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getEmbedUrl = (v: VideoData, options: { autoplay?: boolean } = {}) => {
    return buildVideoEmbedUrl(v, options);
  };

  const getThumbnail = (v: VideoData) => {
    return getVideoThumbnail(v, 'mq');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-6 bg-black md:bg-black/90 md:backdrop-blur-md transition-opacity animate-in fade-in duration-300">
      
      {/* Modal Card Container: Full Screen on Mobile, Cinema Card on Desktop */}
      <div className="bg-slate-950 text-white w-full h-[100dvh] md:h-auto md:max-w-[1280px] md:max-h-[92vh] rounded-none md:rounded-2xl border-0 md:border md:border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Top Header Strip with Safe-Area Inset */}
        <div 
          style={{
            paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)'
          }}
          className="px-4 py-3 sm:px-5 sm:py-3.5 border-b border-slate-800/80 bg-slate-900/90 flex items-center justify-between shrink-0"
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
              <Film className="w-3.5 h-3.5" />
              <span>LIVE VIDEO HUB</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline font-medium">
              Ground Reports & News Broadcasts
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleToggleLandscape}
              className="p-1.5 sm:p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer shadow flex items-center justify-center gap-1.5 px-3"
              title={isLandscapeMode ? "Exit Landscape (सामान्य दृश्य)" : "Landscape Mode (बड़ा / रोटेट करें)"}
              aria-label="Toggle Landscape Fullscreen"
            >
              {isLandscapeMode ? (
                <>
                  <Minimize2 className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] text-slate-200 font-bold">Portrait</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 text-amber-400" />
                  <span className="text-[11px] text-slate-200 font-bold">Landscape</span>
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              className="p-1.5 sm:p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Close Video Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Body (Grid Layout) */}
        {activeVideo ? (
          <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 items-start">
            
            {/* Left Main Video Cinema Screen (7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div 
                ref={videoStageRef}
                style={getLandscapeStyle()}
                className={`bg-black relative overflow-hidden flex items-center justify-center shrink-0 transition-all duration-300 ${
                  isLandscapeMode
                    ? 'w-full h-full'
                    : 'aspect-video w-full rounded-xl border border-slate-800 shadow-2xl'
                }`}
              >
                {isPlaying ? (
                  activeVideo.videoType === 'FILE' ? (
                    <video
                      key={`modal-file-${activeVideo.id}`}
                      src={activeVideo.videoUrl}
                      controls
                      autoPlay
                      playsInline
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <iframe
                      key={`modal-iframe-${activeVideo.id}`}
                      src={getEmbedUrl(activeVideo, { autoplay: true })}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  )
                ) : (
                  <>
                    <img
                      src={getThumbnail(activeVideo)}
                      alt={activeVideo.title}
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
                    />
                    <div
                      onClick={() => {
                        setIsPlaying(true);
                        if (activeVideo.id) videoService.incrementViews(activeVideo.id);
                      }}
                      className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-center justify-center cursor-pointer"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl border-2 border-white/20">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                      </div>
                    </div>
                  </>
                )}

                {/* Landscape Overlay Controls */}
                {isLandscapeMode ? (
                  <div className="absolute top-3 left-4 right-4 z-40 flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center space-x-2 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-xl">
                      <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                      <span className="text-xs font-bold text-white truncate max-w-[220px] sm:max-w-md font-serif">
                        {activeVideo.title}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={handleToggleLandscape}
                      className="flex items-center space-x-1.5 bg-black/85 hover:bg-red-600 text-white px-4 py-1.5 rounded-full backdrop-blur-md border border-white/30 shadow-2xl transition-all cursor-pointer text-xs font-bold active:scale-95"
                      title="Exit Landscape (सामान्य दृश्य)"
                    >
                      <Minimize2 className="w-4 h-4 text-amber-400" />
                      <span>Exit Fullscreen</span>
                    </button>
                  </div>
                ) : (
                  /* Floating Landscape Button on Bottom Right */
                  <button
                    type="button"
                    onClick={handleToggleLandscape}
                    className="absolute bottom-3 right-3 z-30 px-2.5 py-1.5 rounded-lg bg-black/80 hover:bg-black text-white hover:text-amber-400 backdrop-blur-md shadow-2xl border border-white/25 flex items-center space-x-1.5 cursor-pointer transition active:scale-95 group"
                    title="Landscape Mode (बड़ा / रोटेट करें)"
                  >
                    <Maximize2 className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-[11px] font-bold text-white tracking-wide">Landscape</span>
                  </button>
                )}

                {/* Category Badge Top Left */}
                <div className="absolute top-3 left-3 pointer-events-none">
                  <span className="bg-red-600 text-white text-[11px] font-black uppercase px-3 py-1 rounded-md tracking-wider shadow">
                    {activeVideo.badge || activeVideo.category?.toUpperCase() || 'NEWS'}
                  </span>
                </div>

                {/* Duration Badge Top Right */}
                {activeVideo.duration && (
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <span className="bg-black/80 backdrop-blur text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-white/10">
                      {activeVideo.duration}
                    </span>
                  </div>
                )}
              </div>

              {/* Active Video Details Bar */}
              <div className="bg-slate-900/60 rounded-xl p-4 sm:p-5 border border-slate-800 space-y-3">
                <h2 className="text-lg sm:text-2xl font-black font-serif text-white leading-snug">
                  {activeVideo.title}
                </h2>

                {activeVideo.description && (
                  <div className="space-y-1">
                    <p className={`text-xs sm:text-sm text-slate-300 dark:text-slate-400 leading-relaxed ${
                      isDescExpanded ? '' : 'line-clamp-3'
                    }`}>
                      {activeVideo.description}
                    </p>
                    {activeVideo.description.length > 100 && (
                      <button
                        type="button"
                        onClick={() => setIsDescExpanded(prev => !prev)}
                        className="text-xs font-bold text-red-500 hover:text-red-400 cursor-pointer pt-0.5 inline-flex items-center gap-1"
                      >
                        {isDescExpanded ? 'Show Less' : 'Show More'}
                      </button>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center space-x-4">
                    <span className="flex items-center space-x-1.5 font-bold text-amber-400 font-mono">
                      <Eye className="w-4 h-4" />
                      <span>{activeVideo.viewsCount.toLocaleString()} views</span>
                    </span>
                    {activeVideo.reporterName && (
                      <span className="text-slate-300">
                        By <strong>{activeVideo.reporterName}</strong>
                      </span>
                    )}
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copied ? 'Copied Link!' : 'Share'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Right Playlist Sidebar (5 Cols) */}
            <div className="lg:col-span-5 space-y-4">
              
              {/* Category Filter Horizontal Pills */}
              <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-red-600 text-white'
                        : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Playlist Cards Stack */}
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1 no-scrollbar">
                {filteredVideos.map((vid) => {
                  const isActive = vid.id === activeVideo.id;
                  const thumb = getThumbnail(vid);

                  return (
                    <div
                      key={vid.id}
                      onClick={() => handleSelectVideo(vid)}
                      className={`p-2.5 rounded-xl border cursor-pointer transition-all flex space-x-3.5 items-center group ${
                        isActive
                          ? 'bg-slate-900 border-2 border-red-500 ring-2 ring-red-500/20'
                          : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      {/* Thumbnail */}
                      <div className="w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-slate-950 shrink-0 relative">
                        <img
                          src={thumb}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-red-600 text-white'}`}>
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          </div>
                        </div>
                        {vid.duration && (
                          <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono font-bold px-1 rounded">
                            {vid.duration}
                          </span>
                        )}
                      </div>

                      {/* Text Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-black uppercase text-red-400 block">
                          {vid.category || 'NEWS'}
                        </span>
                        <h4 className={`text-xs font-bold leading-snug line-clamp-2 ${isActive ? 'text-amber-300 font-serif' : 'text-slate-200 group-hover:text-white'}`}>
                          {vid.title}
                        </h4>
                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                          <span>{vid.viewsCount.toLocaleString()} views</span>
                          <span>•</span>
                          <span className="capitalize">{vid.badge || vid.category}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

          </div>
        ) : (
          <div className="p-20 text-center text-slate-500">
            <p>Loading video library...</p>
          </div>
        )}

      </div>
    </div>
  );
};
