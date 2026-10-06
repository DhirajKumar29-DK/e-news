'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { mockWebStories } from '@/data/mockNewsData';
import { WebStory } from '@/types/news';
import { Layers, ChevronRight, X, ChevronLeft, Eye } from 'lucide-react';

export const WebStoriesSection: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeStory, setActiveStory] = useState<WebStory | null>(null);

  return (
    <section className="w-full bg-slate-900 text-white py-10 my-8 border-y border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-brand-red rounded-xl text-white">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-serif">
                Web Stories & Visual Reels
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 font-medium">
                Quick visual story updates with high-resolution imagery
              </p>
            </div>
          </div>
        </div>

        {/* Stories Horizontal Reel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {mockWebStories.map((story) => (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer border border-slate-800 hover:border-brand-red transition-all duration-300 hover:-translate-y-1"
            >
              <img
                src={story.imageUrl}
                alt={t(story.title)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-85 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
              
              {/* Category Tag */}
              <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5">
                <span className="bg-brand-red text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                  {story.category}
                </span>
              </div>

              {/* Slides Indicator Badge */}
              <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur text-white text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center space-x-1">
                <Layers className="w-3 h-3 text-amber-400" />
                <span>{story.slidesCount}</span>
              </div>

              {/* Title Overlay */}
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-3 leading-snug">
                  {t(story.title)}
                </h3>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Web Story Modal Reel */}
      {activeStory && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm aspect-[9/16] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 flex flex-col justify-between p-6 text-white">
            <button
              onClick={() => setActiveStory(null)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white hover:bg-brand-red transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute inset-0 z-0">
              <img src={activeStory.imageUrl} className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/30"></div>
            </div>
            
            {/* Story Reel Header */}
            <div className="relative z-10 space-y-2">
              <div className="flex space-x-1">
                {Array.from({ length: activeStory.slidesCount }).map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded ${i === 0 ? 'bg-brand-red' : 'bg-white/40'}`}></div>
                ))}
              </div>
              <span className="text-[10px] font-bold uppercase bg-brand-red text-white px-2 py-0.5 rounded-full inline-block">
                {activeStory.category}
              </span>
            </div>

            {/* Story Content Bottom */}
            <div className="relative z-10 space-y-4">
              <h3 className="text-lg font-black leading-snug text-white">
                {t(activeStory.title)}
              </h3>
              <div className="flex justify-between items-center text-xs text-slate-300 border-t border-white/20 pt-3">
                <span className="flex items-center space-x-1">
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>12.4K Views</span>
                </span>
                <span className="font-bold text-amber-400">Swipe Next →</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
