'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { HelpCircle, ChevronRight, Clock, ArrowRight } from 'lucide-react';

interface ExplainerSectionProps {
  items?: any[];
  title?: string;
  categorySlug?: string;
}

export const ExplainerSection: React.FC<ExplainerSectionProps> = ({ items, title, categorySlug }) => {
  const router = useRouter();
  const { language, t } = useLanguage();

  if (!items || items.length === 0) {
    return null;
  }

  const displayCards = items.slice(0, 4);
  const displayTitle = title || 'Explainer';
  const targetSlug = categorySlug || 'explainer';

  return (
    <section className="py-6 px-4 sm:px-8 lg:px-10 max-w-[1440px] mx-auto">
      <div className="bg-gradient-to-r from-red-700 via-rose-600 to-red-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">

        {/* Background Watermark */}
        <div className="absolute -right-8 -bottom-10 text-9xl font-black font-serif text-white/5 select-none pointer-events-none uppercase">
          {displayTitle}
        </div>

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-white/20 backdrop-blur rounded-xl shadow-inner">
              <HelpCircle className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
                {displayTitle}
              </h2>
              <p className="text-sm text-white/90 font-semibold">
                Deep dive and comprehensive analysis behind the headlines
              </p>
            </div>
          </div>

          <button
            onClick={() => router.push(`/${targetSlug}`)}
            className="self-start sm:self-auto px-5 py-2.5 bg-white text-red-700 hover:bg-slate-950 hover:text-white border-2 border-white font-black text-xs sm:text-sm rounded-full transition-all duration-300 flex items-center space-x-2 group cursor-pointer"
          >
            <span className="tracking-wide">Explore All Stories</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Mobile Layout (< sm): 1 Big Lead Card + 3 Horizontal Row Cards */}
        <div className="block sm:hidden space-y-3 relative z-10">
          {/* 1st Card: Lead Explainer Card */}
          {displayCards[0] && (
            <article
              onClick={() => router.push(`/article/${displayCards[0].id}`)}
              className="bg-white text-slate-900 rounded-xl overflow-hidden cursor-pointer transition-all group flex flex-col justify-between border border-slate-100"
            >
              <div className="aspect-[16/10] overflow-hidden bg-slate-900 relative">
                <img
                  src={displayCards[0].imageUrl}
                  alt={t(displayCards[0].title)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-red-700 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest">
                  EXPLAINED
                </span>
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-red-700 block">
                    {displayCards[0].category}
                  </span>
                  <h3 className="text-base font-black font-serif text-slate-900 group-hover:text-red-700 transition-colors leading-snug">
                    {t(displayCards[0].title)}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-medium">
                    {t(displayCards[0].summary)}
                  </p>
                </div>
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center space-x-1.5 text-slate-500 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{displayCards[0].timeAgo ? t(displayCards[0].timeAgo) : t(displayCards[0].readTime || '3 min read')}</span>
                  </span>
                  <span className="flex items-center space-x-1 text-red-700 font-black group-hover:translate-x-1 transition-transform">
                    <span>Read Analysis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          )}

          {/* 2nd, 3rd, 4th, 5th, 6th Cards: Horizontal Row (Left Image, Right Text) */}
          {items.slice(1).map((card) => (
            <article
              key={card.id}
              onClick={() => router.push(`/article/${card.id}`)}
              className="bg-white text-slate-900 rounded-xl overflow-hidden cursor-pointer transition-all group flex flex-row items-center p-2.5 gap-3 border border-slate-100"
            >
              <div className="w-28 h-20 rounded-lg overflow-hidden shrink-0 relative bg-slate-900">
                <img
                  src={card.imageUrl}
                  alt={t(card.title)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-1.5 left-1.5 bg-red-700 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                  EXPLAINED
                </span>
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-red-700 block mb-0.5">
                    {card.category}
                  </span>
                  <h4 className="text-xs font-serif font-bold text-slate-900 group-hover:text-red-700 transition-colors leading-snug line-clamp-2">
                    {t(card.title)}
                  </h4>
                </div>
                <div className="pt-1 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{card.timeAgo ? t(card.timeAgo) : t(card.readTime || '3 min read')}</span>
                  </span>
                  <span className="text-red-700 font-black flex items-center space-x-0.5 text-[10px]">
                    <span>Read</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Desktop / Tablet Grid (sm:grid) - 100% UNCHANGED */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {items.slice(0, 4).map((card) => (
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
