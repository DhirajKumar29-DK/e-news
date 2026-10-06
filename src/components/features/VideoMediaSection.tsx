'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { mockVideoArticles } from '@/data/mockNewsData';
import { Play, Film, X } from 'lucide-react';

export const VideoMediaSection: React.FC = () => {
  const { language, t } = useLanguage();
  const [activeVideoModal, setActiveVideoModal] = useState<string | null>(null);

  const activeArticle = mockVideoArticles.find(v => v.id === activeVideoModal);

  return (
    <section className="bg-brand-navy text-white py-12 px-4 sm:px-8 lg:px-10 border-y border-slate-800 my-8">
      <div className="max-w-[1440px] mx-auto space-y-6">
        
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-brand-red rounded text-white shadow">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif">
                Video Desk & Visual Reports
              </h2>
              <p className="text-xs text-slate-400">
                Direct reports and visual analysis from ground zero
              </p>
            </div>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockVideoArticles.map((vid) => (
            <div
              key={vid.id}
              onClick={() => setActiveVideoModal(vid.id)}
              className="group bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-brand-red transition-all cursor-pointer shadow-lg flex flex-col justify-between"
            >
              <div className="aspect-video relative bg-slate-950 overflow-hidden">
                <img
                  src={vid.imageUrl}
                  alt={t(vid.title)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-brand-red text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <Play className="w-6 h-6 fill-white ml-1" />
                  </div>
                </div>
                <span className="absolute bottom-3 right-3 bg-black/80 backdrop-blur text-white text-xs font-mono font-bold px-2.5 py-1 rounded border border-white/10">
                  {vid.videoDuration}
                </span>
                <span className="absolute top-3 left-3 bg-brand-gold text-slate-950 text-xs font-extrabold px-2.5 py-0.5 rounded uppercase tracking-wider">
                  {vid.category}
                </span>
              </div>

              <div className="p-4">
                <h3 className="text-base sm:text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                  {t(vid.title)}
                </h3>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Video Modal Trigger */}
      {activeVideoModal && activeArticle && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full p-4 relative text-white shadow-2xl">
            <button
              onClick={() => setActiveVideoModal(null)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-800 hover:bg-brand-red transition-colors text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-video bg-black rounded overflow-hidden flex items-center justify-center mb-4 relative">
              <img src={activeArticle.imageUrl} className="w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-slate-950/70">
                <Play className="w-16 h-16 text-brand-red animate-bounce mb-2" />
                <p className="text-sm font-semibold text-amber-300">
                  Simulated Video Player Stream
                </p>
                <p className="text-xs text-slate-400 mt-1">({activeArticle.videoDuration})</p>
              </div>
            </div>
            <h3 className="text-lg font-bold text-white">{t(activeArticle.title)}</h3>
          </div>
        </div>
      )}
    </section>
  );
};
