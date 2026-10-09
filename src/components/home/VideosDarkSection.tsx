'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { Play, Film, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { videoService, VideoData } from '@/services/videoService';

export const VideosDarkSection: React.FC = () => {
  const { language, t } = useLanguage();
  const [featuredVideo, setFeaturedVideo] = useState<VideoData | null>(null);
  const [playlist, setPlaylist] = useState<VideoData[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchVideos = async () => {
      try {
        const data = await videoService.getFeaturedAndTrending();
        if (isMounted) {
          const hero = data.heroVideo || (data.trendingVideos && data.trendingVideos[0]) || null;
          const list = data.trendingVideos || [];
          setFeaturedVideo(hero);
          setSelectedVideo(hero);
          setPlaylist(list);
        }
      } catch (err) {
        console.warn('Failed to fetch videos from API, using fallback:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchVideos();
    return () => { isMounted = false; };
  }, []);

  const handleSelectVideo = (vid: VideoData) => {
    setSelectedVideo(vid);
    setIsPlaying(false);
    if (vid.id) {
      videoService.incrementViews(vid.id);
    }
  };

  const getEmbedUrl = (video: VideoData) => {
    if (video.youtubeId) {
      return `https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`;
    }
    return video.videoUrl;
  };

  const currentVideo = selectedVideo || featuredVideo;

  return (
    <section className="bg-[#0b0f19] text-white py-12 px-4 sm:px-8 lg:px-10 my-8 border-y border-slate-800 relative overflow-hidden">
      {/* Background subtle glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-[1440px] mx-auto space-y-6 relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-red-600 to-rose-600 text-white rounded-xl shadow-lg shadow-red-600/20">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight text-white">
                  NEWS VIDEOS & BULLETINS
                </h2>
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase hidden sm:inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> STREAMING
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Ground reports, press conferences, and trending visual investigations
              </p>
            </div>
          </div>

          <Link
            href="/videos"
            className="flex items-center space-x-1.5 text-xs font-bold text-red-400 hover:text-white px-3 py-1.5 rounded-lg bg-red-600/10 hover:bg-red-600 transition-all border border-red-500/20"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Video Player + Playlist Grid Cards */}
        {currentVideo ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
            
            {/* Main Left Video Player (Cinematic Player with Interactive Embed 7 Cols) */}
            <div className="lg:col-span-7 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/90 shadow-2xl flex flex-col justify-between group">
              <div className="aspect-video relative overflow-hidden bg-black">
                {isPlaying ? (
                  currentVideo.videoType === 'FILE' ? (
                    <video
                      src={currentVideo.videoUrl}
                      controls
                      className="w-full h-full object-contain bg-black"
                    />
                  ) : (
                    <iframe
                      src={getEmbedUrl(currentVideo)}
                      title={currentVideo.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                ) : (
                  <>
                    <img
                      src={
                        currentVideo.thumbnailUrl ||
                        (currentVideo.youtubeId ? `https://img.youtube.com/vi/${currentVideo.youtubeId}/maxresdefault.jpg` : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80')
                      }
                      alt={currentVideo.title}
                      className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
                    />
                    <div
                      onClick={() => {
                        setIsPlaying(true);
                        if (currentVideo.id) videoService.incrementViews(currentVideo.id);
                      }}
                      className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/40 to-transparent flex items-center justify-center cursor-pointer"
                    >
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center group-hover:scale-110 transition-all duration-300 border-2 border-white/20 shadow-2xl shadow-red-600/40">
                        <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                      </div>
                    </div>
                  </>
                )}

                {/* Badge / Category Pill Top Left */}
                <div className="absolute top-3 left-3 pointer-events-none flex items-center space-x-2">
                  <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow-md">
                    {currentVideo.badge || currentVideo.category.toUpperCase()}
                  </span>
                  {currentVideo.location && (
                    <span className="bg-black/70 backdrop-blur text-slate-300 text-[10px] font-mono px-2 py-0.5 rounded border border-white/10 hidden sm:inline-block">
                      {currentVideo.location}
                    </span>
                  )}
                </div>

                {/* Duration Pill Top Right */}
                {currentVideo.duration && (
                  <div className="absolute top-3 right-3 pointer-events-none">
                    <span className="bg-black/80 backdrop-blur text-white text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/10">
                      {currentVideo.duration}
                    </span>
                  </div>
                )}
              </div>

              {/* Bottom Title & Details */}
              <div className="p-5 sm:p-6 bg-slate-950 border-t border-slate-900 space-y-2">
                <h3 className="text-xl sm:text-2xl font-black font-serif text-white group-hover:text-amber-300 transition-colors leading-snug">
                  {currentVideo.title}
                </h3>
                {currentVideo.description && (
                  <p className="text-xs sm:text-sm text-slate-400 line-clamp-2 leading-relaxed">
                    {currentVideo.description}
                  </p>
                )}
                <div className="flex items-center space-x-4 pt-1 text-[11px] text-slate-400 font-mono">
                  {currentVideo.reporterName && (
                    <span>By <strong className="text-slate-200">{currentVideo.reporterName}</strong></span>
                  )}
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5 text-slate-500" />
                    <span>{currentVideo.viewsCount.toLocaleString()} views</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Right Video Cards Grid: 2 Columns of Compact Cards (5 Cols) */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                  MORE IN THIS STREAM
                </h4>
                <span className="text-[10px] text-slate-400 font-mono">
                  {playlist.length} Videos
                </span>
              </div>

              {/* 2-Column Grid of Small Cards */}
              <div className="grid grid-cols-2 gap-3 max-h-[510px] overflow-y-auto pr-1 no-scrollbar">
                {playlist.map((vid) => {
                  const isSelected = vid.id === currentVideo.id;
                  const thumb = vid.thumbnailUrl || (vid.youtubeId ? `https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg` : 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=400&q=80');

                  return (
                    <div
                      key={vid.id}
                      onClick={() => handleSelectVideo(vid)}
                      className={`rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                        isSelected
                          ? 'bg-slate-900 border-2 border-red-500 ring-2 ring-red-500/20'
                          : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      {/* Top Thumbnail */}
                      <div className="aspect-[16/10] bg-slate-950 overflow-hidden relative">
                        <img
                          src={thumb}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                          </div>
                        </div>
                        {vid.duration && (
                          <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                            {vid.duration}
                          </span>
                        )}
                        {vid.badge && (
                          <span className="absolute top-1.5 left-1.5 bg-red-600/90 text-white text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                            {vid.badge}
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                        <h5 className={`text-xs font-bold leading-snug line-clamp-2 ${isSelected ? 'text-amber-300 font-serif' : 'text-slate-200 group-hover:text-white'}`}>
                          {vid.title}
                        </h5>
                        <p className="text-[10px] text-slate-400 capitalize">
                          {vid.category}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        ) : (
          <div className="py-16 text-center text-slate-500">
            <p>Loading news video broadcasts...</p>
          </div>
        )}

      </div>
    </section>
  );
};
