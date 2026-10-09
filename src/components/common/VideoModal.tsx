'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { X, Play, Film, Eye, Clock, Share2, Sparkles } from 'lucide-react';
import { videoService, VideoData } from '@/services/videoService';

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

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    const fetchVideos = async () => {
      try {
        const res = await videoService.getVideos({ limit: 25, status: 'PUBLISHED' });
        if (isMounted && res.videos && res.videos.length > 0) {
          setVideos(res.videos);
          if (initialVideoId) {
            const match = res.videos.find(v => v.id === initialVideoId || v.slug === initialVideoId);
            setActiveVideo(match || res.videos[0]);
          } else {
            setActiveVideo(res.videos[0]);
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
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categories = ['ALL', 'INDIA', 'WORLD', 'TECH', 'BUSINESS', 'SPORTS'];

  const filteredVideos = selectedCategory === 'ALL'
    ? videos
    : videos.filter(v => v.category?.toUpperCase() === selectedCategory);

  const handleSelectVideo = (v: VideoData) => {
    setActiveVideo(v);
    setIsPlaying(false);
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

  const getEmbedUrl = (v: VideoData) => {
    if (v.youtubeId) {
      return `https://www.youtube-nocookie.com/embed/${v.youtubeId}?rel=0`;
    }
    return v.videoUrl;
  };

  const getThumbnail = (v: VideoData) => {
    if (v.thumbnailUrl) return v.thumbnailUrl;
    if (v.youtubeId) return `https://img.youtube.com/vi/${v.youtubeId}/mqdefault.jpg`;
    return 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in duration-300">
      
      {/* Modal Card Container */}
      <div className="bg-slate-950 text-white w-full max-w-[1280px] max-h-[92vh] rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Top Header Strip */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-gradient-to-r from-red-600 to-rose-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow">
              <Film className="w-3.5 h-3.5" />
              <span>LIVE VIDEO HUB</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline font-medium">
              Ground Reports & News Broadcasts
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
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
              <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 relative group shadow-2xl">
                {isPlaying ? (
                  activeVideo.videoType === 'FILE' ? (
                    <video
                      src={activeVideo.videoUrl}
                      controls
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <iframe
                      src={getEmbedUrl(activeVideo)}
                      title={activeVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
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
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {activeVideo.description}
                  </p>
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
