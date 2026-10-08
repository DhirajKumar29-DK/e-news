'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { HelpCircle, ChevronRight, Clock, ArrowRight } from 'lucide-react';

interface ExplainerSectionProps {
  items?: any[];
}

export const ExplainerSection: React.FC<ExplainerSectionProps> = ({ items }) => {
  const router = useRouter();
  const { language, t } = useLanguage();

  if (!items || items.length === 0) {
    return null;
  }

  const displayCards = items.slice(0, 4);

  return (
    <section className="py-6 px-4 sm:px-8 lg:px-10 max-w-[1440px] mx-auto">
      <div className="bg-gradient-to-r from-red-700 via-rose-600 to-red-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        
        {/* Background Watermark */}
        <div className="absolute -right-8 -bottom-10 text-9xl font-black font-serif text-white/5 select-none pointer-events-none uppercase">
          Explainer
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 backdrop-blur rounded-xl shadow-inner">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
                Explainer
              </h2>
              <p className="text-sm text-white/90 font-semibold">
                Deep dive and comprehensive analysis behind the headlines
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push('/explainer')}
            className="self-start sm:self-auto px-5 py-2.5 bg-white text-red-700 hover:bg-slate-950 hover:text-white border-2 border-white font-black text-xs sm:text-sm rounded-full transition-all duration-300 flex items-center space-x-2 group cursor-pointer"
          >
            <span className="tracking-wide">Explore All Stories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Premium White Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {displayCards.map((card) => (
            <article
              key={card.id}
              onClick={() => router.push(`/article/${card.id}`)}
              className="bg-white text-slate-900 rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between border border-slate-100"
            >
              {/* Card Image Header */}
              <div className="aspect-[16/10] overflow-hidden bg-slate-900 relative">
                <img
                  src={card.imageUrl}
                  alt={t(card.title)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-red-700 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest">
                  EXPLAINED
                </span>
              </div>

              {/* Card Content Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <span className="text-xs font-black uppercase tracking-wider text-red-700 block">
                    {card.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-black font-serif text-slate-900 group-hover:text-red-700 transition-colors leading-snug">
                    {t(card.title)}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {t(card.summary)}
                  </p>
                </div>

                {/* Footer Bar */}
                <div className="pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1.5 text-slate-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{card.timeAgo ? t(card.timeAgo) : t(card.readTime || '3 min read')}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-red-700 font-black group-hover:translate-x-1 transition-transform">
                    <span>Read Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
