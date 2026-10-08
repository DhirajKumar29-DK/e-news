'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight } from 'lucide-react';

interface SplitItem {
  id: string;
  category: string;
  title: any;
  imageUrl: string;
  timeAgo?: any;
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Half: Big Lead Feature Card (6 Cols) */}
        <div className="lg:col-span-6">
          <article
            onClick={() => router.push(`/article/${leadItem.id}`)}
            className="h-full bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all group flex flex-col justify-between"
          >
            <div className="aspect-[16/10] bg-slate-900 overflow-hidden relative">
              <img
                src={leadItem.imageUrl}
                alt={t(leadItem.title)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3.5 left-3.5 bg-jagran-red text-white text-xs font-black px-3 py-1 rounded uppercase tracking-wider">
                {leadItem.category}
              </span>
            </div>
            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <h3 className="text-xl sm:text-2xl font-extrabold font-serif text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors line-clamp-3 leading-snug">
                {t(leadItem.title)}
              </h3>
              {leadItem.timeAgo && (
                <span className="text-xs text-slate-500 font-semibold pt-2 block border-t border-slate-100 dark:border-slate-800">
                  {t(leadItem.timeAgo)}
                </span>
              )}
            </div>
          </article>
        </div>

        {/* Right Half: 2x2 Grid of 4 Cards (6 Cols) */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gridItems.map((item) => (
            <article
              key={item.id}
              onClick={() => router.push(`/article/${item.id}`)}
              className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all group flex flex-col justify-between"
            >
              <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                <img
                  src={item.imageUrl}
                  alt={t(item.title)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2.5 left-2.5 bg-slate-900/80 backdrop-blur text-white text-xs font-bold px-2.5 py-0.5 rounded uppercase">
                  {item.category}
                </span>
              </div>
              <div className="p-3.5 flex-1 flex flex-col justify-between">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors line-clamp-2 leading-snug">
                  {t(item.title)}
                </h4>
                {item.timeAgo && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-1.5 block">
                    {t(item.timeAgo)}
                  </span>
                )}
              </div>
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
