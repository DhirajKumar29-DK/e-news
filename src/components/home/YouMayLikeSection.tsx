'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { mockYouMayLike } from '@/data/mockNewsData';
import { BookmarkPlus } from 'lucide-react';

export const YouMayLikeSection: React.FC = () => {
  const router = useRouter();
  const { language, t } = useLanguage();

  return (
    <section className="py-8 px-4 sm:px-8 lg:px-10 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b-2 border-jagran-red pb-3 mb-6">
        <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 dark:text-white flex items-center space-x-2">
          <BookmarkPlus className="w-6 h-6 text-jagran-red" />
          <span>You May Like</span>
        </h2>
        <span className="text-xs font-black uppercase text-slate-400">
          RECOMMENDED FOR YOU
        </span>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockYouMayLike.map((item) => (
          <article
            key={item.id}
            onClick={() => router.push(`/article/lead-bmw`)}
            className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all group flex flex-col justify-between"
          >
            <div className="aspect-[16/10] bg-slate-100 overflow-hidden">
              <img
                src={item.imageUrl}
                alt={t(item.title)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-4.5 flex-1 flex flex-col justify-between space-y-2.5">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors line-clamp-3 leading-snug">
                {t(item.title)}
              </h3>
              <span className="text-xs font-bold text-slate-500 uppercase block pt-2 border-t border-slate-100 dark:border-slate-800">
                {item.source}
              </span>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};
