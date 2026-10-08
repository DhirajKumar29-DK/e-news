'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, Clock } from 'lucide-react';

interface GridItem {
  id: string;
  category: string;
  title: any;
  imageUrl: string;
  timeAgo?: any;
}

interface GridSectionProps {
  title: string;
  categorySlug: string;
  items: GridItem[];
}

export const GridSection: React.FC<GridSectionProps> = ({
  title,
  categorySlug,
  items
}) => {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <section className="py-6 px-4 sm:px-8 lg:px-10 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-jagran-red pb-2 mb-6">
        <h2 className="text-2xl sm:text-3xl font-black font-serif uppercase tracking-tight text-slate-900 dark:text-white">
          {title}
        </h2>
        <button
          onClick={() => router.push(`/${categorySlug}`)}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-jagran-red hover:text-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
          title={`View all ${title}`}
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 4-Column Horizontal Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {items.map((item) => (
          <article
            key={item.id}
            onClick={() => router.push(`/article/${item.id}`)}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 overflow-hidden cursor-pointer transition-all group flex flex-col justify-between"
          >
            <div className="aspect-[16/9] bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
              <img
                src={item.imageUrl}
                alt={t(item.title)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2.5 left-2.5 bg-slate-950/85 text-white text-[10px] sm:text-[11px] font-black px-2.5 py-1 rounded uppercase tracking-wider">
                {item.category}
              </span>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <h3 className="text-sm sm:text-base font-serif font-bold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-snug">
                {t(item.title)}
              </h3>
              {item.timeAgo && (
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center text-[11px] text-slate-500 font-medium">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mr-1 shrink-0" />
                  <span>{t(item.timeAgo)}</span>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
