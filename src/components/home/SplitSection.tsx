'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Clock } from 'lucide-react';

interface SplitItem {
  id: string;
  category: string;
  title: any;
  summary?: any;
  imageUrl: string;
  timeAgo?: any;
  readTime?: any;
}

interface SplitSectionProps {
  title: string;
  categorySlug: string;
  leadItem: SplitItem;
  gridItems: SplitItem[];
}

export const SplitSection: React.FC<SplitSectionProps> = ({
  title,
  categorySlug,
  leadItem,
  gridItems
}) => {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <section className="py-6 px-4 sm:px-8 lg:px-10 max-w-[1440px] mx-auto">
      {/* Section Header */}
      <div className="flex items-center justify-between border-b-2 border-jagran-red pb-2 mb-6">
        <h2 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        <button
          onClick={() => router.push(`/${categorySlug}`)}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-jagran-red hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
          title={`View all ${title}`}
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 50/50 Split Layout */}
      <div className="w-full min-w-0 max-w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Half: Big Lead Feature Card (6 Cols) */}
        <div className="w-full min-w-0 lg:col-span-6">
          <article
            onClick={() => router.push(`/article/${leadItem.id}`)}
            className="h-full bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all group flex flex-col justify-between"
          >
            <div className="aspect-[16/10] bg-slate-900 overflow-hidden relative">
              <img
                src={leadItem.imageUrl}
                alt={t(leadItem.title)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3.5 left-3.5 bg-jagran-red text-white text-xs font-black px-3 py-1 rounded uppercase tracking-wider">
                {leadItem.category}
              </span>
            </div>
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2.5">
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-serif text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors line-clamp-3 leading-snug">
                  {t(leadItem.title)}
                </h3>
                {leadItem.summary && (
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 sm:line-clamp-4 leading-relaxed font-normal">
                    {t(leadItem.summary)}
                  </p>
                )}
              </div>
              {leadItem.timeAgo && (
                <div className="text-xs text-slate-500 font-semibold pt-2.5 flex items-center space-x-1.5 border-t border-slate-100 dark:border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{t(leadItem.timeAgo)}</span>
                  {leadItem.readTime && (
                    <>
                      <span>•</span>
                      <span>{t(leadItem.readTime)}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </article>
        </div>

        {/* Mobile View (< sm): 5-6 horizontal cards below lead */}
        <div className="block sm:hidden w-full space-y-3">
          {gridItems.map((item) => (
            <article
              key={item.id}
              onClick={() => router.push(`/article/${item.id}`)}
              className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all group flex flex-row items-center p-2.5 gap-3"
            >
              <div className="w-28 h-20 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden relative shrink-0">
                <img
                  src={item.imageUrl}
                  alt={t(item.title)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase text-jagran-red block mb-1">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors line-clamp-3 leading-snug">
                    {t(item.title)}
                  </h4>
                </div>
                {item.timeAgo && (
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 font-medium pt-1 flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{t(item.timeAgo)}</span>
                    {item.readTime && (
                      <>
                        <span>•</span>
                        <span>{t(item.readTime)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Desktop View (sm+): Exact 2x2 Grid of 4 Cards (100% UNCHANGED) */}
        <div className="hidden sm:grid w-full min-w-0 lg:col-span-6 grid-cols-2 gap-3 sm:gap-4">
          {gridItems.slice(0, 4).map((item) => (
            <article
              key={item.id}
              onClick={() => router.push(`/article/${item.id}`)}
              className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all group flex flex-col items-stretch justify-between"
            >
              <div className="w-full aspect-[16/10] bg-slate-100 dark:bg-slate-800 overflow-hidden relative shrink-0">
                <img
                  src={item.imageUrl}
                  alt={t(item.title)}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-2.5 py-0.5 rounded uppercase">
                  {item.category}
                </span>
              </div>
              <div className="flex-1 min-w-0 p-3.5 flex flex-col justify-between">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors line-clamp-3 leading-snug">
                    {t(item.title)}
                  </h4>
                </div>
                {item.timeAgo && (
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-1.5 flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{t(item.timeAgo)}</span>
                    {item.readTime && (
                      <>
                        <span>•</span>
                        <span>{t(item.readTime)}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
