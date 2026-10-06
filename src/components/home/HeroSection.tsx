'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  mockHeroLeftHeadlines,
  mockHeroLeadArticle,
  mockHeroSubLeads,
  mockLatestVideos,
  mockRightTopNews
} from '@/data/mockNewsData';
import { Play, TrendingUp, Video } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const router = useRouter();
  const { language, t } = useLanguage();

  const handleArticleClick = (id: string) => {
    router.push(`/article/${id}`);
  };

  return (
    <section className="py-6 px-4 sm:px-8 lg:px-10 max-w-[1440px] mx-auto">
      {/* 3-Column Asymmetric Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* ========================================================= */}
        {/* 1. LEFT COLUMN: 5 TEXT-ONLY HEADLINES WITH CATEGORY TAGS (3 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 self-start space-y-3 bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="border-b-2 border-jagran-red pb-1.5 mb-1">
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-white">
              QUICK HIGHLIGHTS
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {mockHeroLeftHeadlines.map((item) => (
              <article
                key={item.id}
                onClick={() => handleArticleClick(item.id)}
                className="py-2.5 first:pt-0 last:pb-0 cursor-pointer group"
              >
                <span className="text-xs font-black uppercase text-jagran-red block mb-0.5">
                  {item.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors line-clamp-2 leading-snug">
                  {t(item.title)}
                </h3>
                <span className="text-xs text-slate-400 block mt-0.5 font-medium">
                  {t(item.timeAgo)}
                </span>
              </article>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. CENTER COLUMN: BIG 16:9 LEAD CARD + 4 SUB-LEADS (6 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-6 space-y-6">

          {/* Main 16:9 Lead Feature Story */}
          <article
            onClick={() => handleArticleClick(mockHeroLeadArticle.id)}
            className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all group"
          >
            <div className="aspect-[16/9] bg-slate-900 overflow-hidden relative">
              <img
                src={mockHeroLeadArticle.imageUrl}
                alt={t(mockHeroLeadArticle.title)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <span className="absolute top-3.5 left-3.5 bg-jagran-red text-white text-xs font-black px-3 py-1 rounded uppercase">
                {mockHeroLeadArticle.category}
              </span>
            </div>

            <div className="p-5 sm:p-6 space-y-3">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-tight">
                {t(mockHeroLeadArticle.title)}
              </h1>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-medium">
                {t(mockHeroLeadArticle.summary)}
              </p>
              <div className="text-xs text-slate-500 pt-2.5 border-t border-slate-100 dark:border-slate-800 font-semibold">
                <span>{t(mockHeroLeadArticle.timeAgo)}</span>
              </div>
            </div>
          </article>

          {/* Stack of 4 Horizontal Sub-Lead Cards */}
          <div className="space-y-4">
            {mockHeroSubLeads.map((sub) => (
              <article
                key={sub.id}
                onClick={() => handleArticleClick(sub.id)}
                className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-4 cursor-pointer transition-all group flex space-x-4 items-center"
              >
                <div className="w-28 sm:w-36 aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 shrink-0">
                  <img
                    src={sub.imageUrl}
                    alt={t(sub.title)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <span className="text-xs font-black uppercase text-jagran-red block">
                    {sub.category}
                  </span>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors line-clamp-2 leading-snug">
                    {t(sub.title)}
                  </h3>
                  <span className="text-xs text-slate-400 block font-medium">
                    {t(sub.timeAgo)}
                  </span>
                </div>
              </article>
            ))}
          </div>

        </div>

        {/* ========================================================= */}
        {/* 3. RIGHT COLUMN: 2X2 VIDEOS + 1-5 TOP NEWS (3 Cols)       */}
        {/* ========================================================= */}
        <div className="lg:col-span-3 lg:sticky lg:top-24 self-start space-y-4">

          {/* LATEST VIDEOS (2x2 Grid) */}
          <div className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b-2 border-jagran-red pb-1">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
                <Video className="w-4 h-4 text-jagran-red" />
                <span>LATEST VIDEOS</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {mockLatestVideos.slice(0, 4).map((vid) => (
                <div
                  key={vid.id}
                  onClick={() => alert(`Playing video: ${t(vid.title)}`)}
                  className="group cursor-pointer space-y-1"
                >
                  <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative">
                    <img src={vid.imageUrl} alt={t(vid.title)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="w-6 h-6 rounded-full bg-jagran-red text-white flex items-center justify-center">
                        <Play className="w-3 h-3 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors line-clamp-2 leading-tight">
                    {t(vid.title)}
                  </h4>
                </div>
              ))}
            </div>
          </div>

          {/* TOP NEWS 1 to 5 Numbered Sidebar */}
          <div className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b-2 border-jagran-red pb-1">
              <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
                <TrendingUp className="w-4 h-4 text-jagran-red" />
                <span>TOP NEWS</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {mockRightTopNews.map((item) => (
                <article
                  key={item.id}
                  onClick={() => handleArticleClick(item.id)}
                  className="py-2 first:pt-0 last:pb-0 flex space-x-2.5 items-start group cursor-pointer"
                >
                  <span className="font-serif font-black text-xl text-jagran-red/60 group-hover:text-jagran-red transition-colors w-5 shrink-0 leading-none">
                    0{item.rank}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-black uppercase text-jagran-red block mb-0.5">
                      {item.category}
                    </span>
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors line-clamp-2 leading-snug">
                      {t(item.title)}
                    </h4>
                  </div>
                </article>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
