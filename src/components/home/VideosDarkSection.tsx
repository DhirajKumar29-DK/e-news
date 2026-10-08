'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { mockLatestVideos } from '@/data/mockNewsData';
import { Play, Film } from 'lucide-react';

export const VideosDarkSection: React.FC = () => {
  const { language, t } = useLanguage();
  const [selectedVideo, setSelectedVideo] = useState(mockLatestVideos[0]);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleSelectVideo = (vid: typeof mockLatestVideos[0]) => {
    setSelectedVideo(vid);
    setIsPlaying(true);
  };

  return (
    <section className="bg-[#111827] text-white py-12 px-4 sm:px-8 lg:px-10 my-8 border-y border-slate-800">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-jagran-red text-white rounded-xl">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-serif uppercase tracking-tight">
                VIDEOS
              </h2>
              <p className="text-xs text-slate-400 font-medium">
                Ground reports, press conferences, and trending visual bulletins
              </p>
            </div>
          </div>
        </div>

        {/* Video Player + 2-Column Grid Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          
          {/* Main Left Video Player (Cinematic Player with Interactive Embed 7 Cols) */}
          <div className="lg:col-span-7 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800/90 group flex flex-col justify-between">
            <div className="aspect-video relative overflow-hidden bg-slate-950">
              {isPlaying && selectedVideo.videoUrl ? (
                <iframe
                  src={selectedVideo.videoUrl}
                  title={t(selectedVideo.title)}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <>
                  <img
                    src={selectedVideo.imageUrl}
                    alt={t(selectedVideo.title)}
                    className="w-full h-full object-cover opacity-85 group-hover:opacity-95 group-hover:scale-105 transition-all duration-700"
                  />
                  <div
                    onClick={() => setIsPlaying(true)}
                    className="absolute inset-0 bg-gradient-to-t from-slate-950 via-black/30 to-transparent flex items-center justify-center cursor-pointer"
                  >
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-jagran-red text-white flex items-center justify-center group-hover:scale-110 transition-all duration-300 border-2 border-white/20">
                      <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                    </div>
                  </div>
                </>
              )}

              {/* Category Pill Top Left */}
              <div className="absolute top-3 left-3 pointer-events-none">
                <span className="bg-jagran-red text-white text-[11px] font-black uppercase px-3 py-1 rounded-full tracking-wider">
                  FEATURED BULLETIN
                </span>
              </div>

              {/* Duration Pill Top Right */}
              <div className="absolute top-3 right-3 pointer-events-none">
                <span className="bg-black/80 backdrop-blur text-white text-xs font-mono font-bold px-3 py-1 rounded-full border border-white/10">
                  {selectedVideo.duration}
                </span>
              </div>
            </div>

            {/* Bottom Title Area */}
            <div className="p-5 sm:p-6 bg-slate-950 border-t border-slate-900 space-y-2">
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black font-serif text-white group-hover:text-amber-300 transition-colors leading-snug">
                {t(selectedVideo.title)}
              </h3>
            </div>
          </div>

          {/* Right Video Cards Grid: 2 Columns of Compact Cards (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">
                MORE VIDEOS
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">
                {mockLatestVideos.length} Clips
              </span>
            </div>

            {/* 2-Column Grid of Small Cards */}
            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 no-scrollbar">
              {mockLatestVideos.map((vid) => {
                const isSelected = vid.id === selectedVideo.id;
                return (
                  <div
                    key={vid.id}
                    onClick={() => handleSelectVideo(vid)}
                    className={`rounded-xl border transition-all cursor-pointer flex flex-col justify-between overflow-hidden group ${
                      isSelected
                        ? 'bg-slate-900 border-2 border-jagran-red ring-2 ring-jagran-red/30'
                        : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    {/* Top Thumbnail */}
                    <div className="aspect-[16/10] bg-slate-950 overflow-hidden relative">
                      <img
                        src={vid.imageUrl}
                        alt={t(vid.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-jagran-red text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>
                      <span className="absolute bottom-1.5 right-1.5 bg-black/80 backdrop-blur text-white text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                        {vid.duration}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="p-2.5 flex-1 flex flex-col justify-between space-y-1">
                      <h5 className={`text-xs font-bold leading-snug ${isSelected ? 'text-amber-300 font-serif' : 'text-slate-200 group-hover:text-white'}`}>
                        {t(vid.title)}
                      </h5>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
