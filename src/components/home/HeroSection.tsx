'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { videoService, VideoData } from '@/services/videoService';
import { Play, TrendingUp, Video } from 'lucide-react';

import { HomeArticlesResponse } from '@/services/articleService';
import { formatTimeAgo } from '@/utils/timeAgo';
import { stripHtml } from '@/utils/textUtils';

interface HeroSectionProps {
  dynamicData?: HomeArticlesResponse | null;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ dynamicData }) => {
  const router = useRouter();
  const { language, t } = useLanguage();
  const [latestVideos, setLatestVideos] = useState<VideoData[]>([]);

  useEffect(() => {
    let isMounted = true;
    videoService.getVideos({ limit: 4, status: 'PUBLISHED', sortBy: 'publishedAt', sortOrder: 'desc' })
      .then(res => {
        if (isMounted && res && res.videos && res.videos.length > 0) {
          setLatestVideos(res.videos.slice(0, 4));
        }
      })
      .catch(err => console.error('Error fetching latest videos for hero section:', err));
    return () => { isMounted = false; };
  }, []);

  const handleArticleClick = (id: string) => {
    router.push(`/article/${id}`);
  };

  // While data is fetching from DB, render a sleek newspaper skeleton to prevent any mock flash
  if (!dynamicData) {
    return (
      <section className="py-6 px-4 sm:px-8 lg:px-10 max-w-[1440px] mx-auto animate-pulse">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column Skeleton */}
          <div className="lg:col-span-3 space-y-4 bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="h-5 w-36 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="pt-3 space-y-2">
                  <div className="h-3 w-16 bg-red-100 dark:bg-red-950/40 rounded"></div>
                  <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Center Column Skeleton */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="aspect-[16/9] bg-slate-200 dark:bg-slate-800"></div>
              <div className="p-5 space-y-3">
                <div className="h-7 w-4/5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-4 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
              </div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex space-x-4">
                  <div className="w-28 sm:w-36 aspect-[16/10] bg-slate-200 dark:bg-slate-700 rounded-lg shrink-0"></div>
                  <div className="flex-1 space-y-2 py-1">
                    <div className="h-3 w-16 bg-red-100 dark:bg-red-950/40 rounded"></div>
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Skeleton */}
          <div className="lg:col-span-3 space-y-4">
            <div className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-video bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                ))}
              </div>
            </div>
            <div className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-3">
              <div className="h-5 w-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex space-x-2.5 items-center">
                    <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 w-12 bg-red-100 dark:bg-red-950/40 rounded"></div>
                      <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // 1. Dynamic Center Lead Story (Only from real DB)
  const leadArticle = dynamicData.leadStory ? {
    id: dynamicData.leadStory.slug || dynamicData.leadStory.id,
    title: stripHtml(dynamicData.leadStory.title),
    summary: stripHtml(dynamicData.leadStory.subHeadline) || stripHtml(dynamicData.leadStory.content).slice(0, 160) + '...',
    imageUrl: dynamicData.leadStory.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80',
    category: dynamicData.leadStory.category.toUpperCase(),
    timeAgo: formatTimeAgo(dynamicData.leadStory.publishedAt || dynamicData.leadStory.createdAt)
  } : null;

  // 2. Dynamic Center 4 Sub-leads (Only from real DB)
  const subLeads = (dynamicData.subLeads || []).map(sub => ({
    id: sub.slug || sub.id,
    title: stripHtml(sub.title),
    imageUrl: sub.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600',
    category: sub.category.toUpperCase(),
    timeAgo: formatTimeAgo(sub.publishedAt || sub.createdAt)
  }));

  // 4. Dynamic Right 1-5 Top Trending (TOP NEWS from real DB)
  const trendingList = (dynamicData.trending || []).map((item, idx) => ({
    id: item.slug || item.id,
    rank: idx + 1,
    title: stripHtml(item.title),
    category: item.category.toUpperCase(),
    timeAgo: formatTimeAgo(item.publishedAt || item.createdAt)
  }));

  // Top News & Lead Story identifiers to strictly prevent duplicate news
  const topNewsIds = new Set(trendingList.map(t => String(t.id).toLowerCase()));
  const topNewsTitles = new Set(trendingList.map(t => String(typeof t.title === 'string' ? t.title : ((t.title as any)?.en || '')).trim().toLowerCase()));
  const leadId = leadArticle ? String(leadArticle.id).toLowerCase() : '';
  const leadTitle = leadArticle ? String(typeof leadArticle.title === 'string' ? leadArticle.title : ((leadArticle.title as any)?.en || '')).trim().toLowerCase() : '';

  // 3. Dynamic Left 5 Quick Highlights: MUST NOT be in Top News and NEVER the same
  const candidateHighlights = dynamicData.quickHighlights || [];

  const filteredHighlights = (candidateHighlights as any[]).filter(item => {
    const id = String(item.slug || item.id || '').toLowerCase();
    const title = (typeof item.title === 'string' ? item.title : (item.title?.en || item.title?.hi || '')).trim().toLowerCase();
    return !topNewsIds.has(id) && !topNewsTitles.has(title) && id !== leadId && title !== leadTitle;
  });

  const leftHeadlines = (filteredHighlights as any[]).slice(0, 5).map(item => ({
    id: item.slug || item.id,
    title: item.title,
    category: (item.category || 'NEWS').toUpperCase(),
    timeAgo: formatTimeAgo(item.publishedAt || item.createdAt)
  }));

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
            {leftHeadlines.map((item) => (
              <article
                key={item.id}
                onClick={() => handleArticleClick(item.id)}
                className="py-2.5 first:pt-0 last:pb-0 cursor-pointer group"
              >
                <span className="text-xs font-black uppercase text-jagran-red block mb-0.5">
                  {item.category}
                </span>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors leading-snug">
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
          {leadArticle && (
            <article
              onClick={() => handleArticleClick(leadArticle.id)}
              className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden cursor-pointer transition-all group"
            >
              <div className="aspect-[16/9] bg-slate-900 overflow-hidden relative">
                <img
                  src={leadArticle.imageUrl}
                  alt={typeof leadArticle.title === 'string' ? leadArticle.title : t(leadArticle.title)}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3.5 left-3.5 bg-jagran-red text-white text-xs font-black px-3 py-1 rounded uppercase">
                  {leadArticle.category}
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-3">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-serif text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-tight">
                  {typeof leadArticle.title === 'string' ? leadArticle.title : t(leadArticle.title)}
                </h1>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {typeof leadArticle.summary === 'string' ? leadArticle.summary : t(leadArticle.summary)}
                </p>
                <div className="text-xs text-slate-500 pt-2.5 border-t border-slate-100 dark:border-slate-800 font-semibold">
                  <span>{typeof leadArticle.timeAgo === 'string' ? leadArticle.timeAgo : t(leadArticle.timeAgo)}</span>
                </div>
              </div>
            </article>
          )}

          {/* Stack of 4 Horizontal Sub-Lead Cards */}
          <div className="space-y-4">
            {subLeads.map((sub) => (
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
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-snug">
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

          {/* LATEST VIDEOS (2x2 Grid) - DYNAMIC FROM DATABASE */}
          <div className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-2">
            <div className="flex items-center justify-between border-b-2 border-jagran-red pb-1">
              <button
                onClick={() => router.push('/videos')}
                className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5 hover:text-jagran-red transition-colors cursor-pointer"
              >
                <Video className="w-4 h-4 text-jagran-red" />
                <span>LATEST VIDEOS</span>
              </button>
              <button
                onClick={() => router.push('/videos')}
                className="text-[11px] font-bold text-jagran-red hover:underline uppercase tracking-tight cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {latestVideos.map((vid) => {
                const thumb = vid.thumbnailUrl || (vid.youtubeId ? `https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg` : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400');
                return (
                  <div
                    key={vid.id}
                    onClick={() => router.push('/videos')}
                    className="group cursor-pointer space-y-1"
                  >
                    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden relative shadow-2xs">
                      <img src={thumb} alt={vid.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <div className="w-6 h-6 rounded-full bg-jagran-red text-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform">
                          <Play className="w-3 h-3 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors leading-tight line-clamp-2">
                      {vid.title}
                    </h4>
                  </div>
                );
              })}
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
              {trendingList.map((item) => (
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
                    <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors leading-snug">
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
