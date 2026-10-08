'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { mockLatestVideos } from '@/data/mockNewsData';
import { X, Play, Film, Eye, Clock, Share2, Sparkles, Volume2 } from 'lucide-react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVideoId?: string;
}

export const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, initialVideoId }) => {
  const { language, t } = useLanguage();

  const [activeVideo, setActiveVideo] = useState(
    mockLatestVideos.find(v => v.id === initialVideoId) || mockLatestVideos[0]
  );
  const [isPlaying, setIsPlaying] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialVideoId) {
      const match = mockLatestVideos.find(v => v.id === initialVideoId);
      if (match) {
        setActiveVideo(match);
        setIsPlaying(true);
      }
    }
  }, [initialVideoId]);

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

  const categories = ['ALL', 'INFRASTRUCTURE', 'SPACE & TECH', 'CRICKET', 'AUTO', 'DEFENCE', 'WORLD'];

  const filteredVideos = selectedCategory === 'ALL'
    ? mockLatestVideos
    : mockLatestVideos.filter(v => v.category === selectedCategory);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md transition-opacity animate-in fade-in duration-300">
      
      {/* Modal Card Container */}
      <div className="bg-slate-950 text-white w-full max-w-[1280px] max-h-[92vh] rounded-2xl border border-slate-800 flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* Top Header Strip */}
        <div className="px-5 py-3.5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-jagran-red text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <Film className="w-3.5 h-3.5" />
              <span>LIVE VIDEO HUB</span>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline font-medium">
              The Newspaper Exclusive Video Bulletins
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Close Video Hub"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Content Body (Grid Layout) */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 items-start">
          
          {/* Left Main Video Cinema Screen (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-video bg-black rounded-xl overflow-hidden border border-slate-800 relative group shadow-2xl">
              {isPlaying && activeVideo.videoUrl ? (
                <iframe
                  src={activeVideo.videoUrl}
                  title={t(activeVideo.title)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={activeVideo.imageUrl}
                    alt={t(activeVideo.title)}
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
                  />
                  <div
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-jagran-red text-white flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-xl border-2 border-white/20">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                    </div>
                  </div>
                </>
              )}

              {/* Category Badge Top Left */}
              <div className="absolute top-3 left-3 pointer-events-none">
                <span className="bg-jagran-red text-white text-[11px] font-black uppercase px-3 py-1 rounded-md tracking-wider shadow">
                  {activeVideo.category || 'NEWS'}
                </span>
              </div>

              {/* Duration Badge Top Right */}
              <div className="absolute top-3 right-3 pointer-events-none">
                <span className="bg-black/80 backdrop-blur text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md border border-white/10">
                  {activeVideo.duration}
                </span>
              </div>
            </div>

            {/* Active Video Details Bar */}
            <div className="bg-slate-900/60 rounded-xl p-4 sm:p-5 border border-slate-800 space-y-3">
              <h2 className="text-lg sm:text-2xl font-black font-serif text-white leading-snug">
                {t(activeVideo.title)}
              </h2>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <div className="flex items-center space-x-4">
                  <span className="flex items-center space-x-1.5 font-bold text-amber-400">
                    <Eye className="w-4 h-4" />
                    <span>{activeVideo.views || '120K'} views</span>
                  </span>
                  {activeVideo.timeAgo && (
                    <span className="flex items-center space-x-1.5 font-medium">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t(activeVideo.timeAgo)}</span>
                    </span>
                  )}
                </div>

                <button
                  onClick={handleCopyLink}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copied ? 'Copied!' : 'Share'}</span>
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-jagran-red text-white'
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
                return (
                  <div
                    key={vid.id}
                    onClick={() => {
                      setActiveVideo(vid);
                      setIsPlaying(true);
                    }}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all flex space-x-3.5 items-center group ${
                      isActive
                        ? 'bg-slate-900 border-2 border-jagran-red ring-2 ring-jagran-red/30'
                        : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div className="w-24 sm:w-28 aspect-video rounded-lg overflow-hidden bg-slate-950 shrink-0 relative">
                      <img
                        src={vid.imageUrl}
                        alt={t(vid.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-jagran-red text-white'}`}>
                          <Play className="w-3 h-3 fill-current ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-mono font-bold px-1 rounded">
                        {vid.duration}
                      </span>
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-black uppercase text-jagran-red block">
                        {vid.category || 'NEWS'}
                      </span>
                      <h4 className={`text-xs font-bold leading-snug ${isActive ? 'text-amber-300 font-serif' : 'text-slate-200 group-hover:text-white'}`}>
                        {t(vid.title)}
                      </h4>
                      <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium">
                        <span>{vid.views || '100K'} views</span>
                        <span>•</span>
                        <span>{t(vid.timeAgo || { en: 'Recently' })}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
