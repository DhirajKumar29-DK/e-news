'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer, SearchModal, MobileBottomNav } from '@/components/common';
import { CricketMatchSlider } from '@/components/cricket/CricketMatchSlider';
import { articleService, ArticleData } from '@/services/articleService';
import { cricketService } from '@/services/cricketService';
import { formatTimeAgoString } from '@/utils/timeAgo';
import { stripHtml } from '@/utils/textUtils';
import {
  ChevronRight,
  Clock,
  TrendingUp,
  Calendar,
  Trophy,
  Award,
  RefreshCw
} from 'lucide-react';

function renderText(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (typeof val === 'object') return val.en || val.hi || Object.values(val)[0] || '';
  return String(val);
}

export default function CricketHubPage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [topNewsList, setTopNewsList] = useState<any[]>([]);
  const [topRankings, setTopRankings] = useState<any[]>([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    fetchArticles(1);
    fetchTopNewsAndRankings();
  }, []);

  const fetchTopNewsAndRankings = async () => {
    try {
      // 1. Fetch exact same TOP NEWS from homepage
      const homeRes = await articleService.getHomeArticles();
      if (homeRes && homeRes.trending && homeRes.trending.length > 0) {
        setTopNewsList(homeRes.trending.slice(0, 5));
      } else {
        // Fallback to top recent articles
        const fallback = await articleService.getArticles({ limit: 5, sortBy: 'publishedAt', sortOrder: 'desc' });
        const list = (fallback as any)?.articles || (fallback as any)?.data?.articles || [];
        setTopNewsList(list.slice(0, 5));
      }

      // 2. Fetch official ICC Men's T20I Team Rankings
      const rankData = await cricketService.getRankings('t20', 'teams');
      if (rankData && rankData.length > 0) {
        setTopRankings(rankData.slice(0, 5));
      }
    } catch (err) {
      console.error('Error fetching top news or rankings:', err);
    }
  };

  const fetchArticles = async (pageNum: number) => {
    try {
      if (pageNum === 1) setLoadingArticles(true);
      else setLoadingMore(true);

      // Attempt to load articles for category 'cricket'
      const res = await articleService.getArticles({
        category: 'cricket',
        page: pageNum,
        limit: 10,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });

      let list = (res as any)?.articles || (res as any)?.data?.articles || (res as any)?.data || [];

      // Fallback to all published articles if category 'cricket' has 0 articles in DB
      if (list.length === 0 && pageNum === 1) {
        const fallbackRes = await articleService.getArticles({
          page: 1,
          limit: 12,
          sortBy: 'publishedAt',
          sortOrder: 'desc'
        });
        list = (fallbackRes as any)?.articles || (fallbackRes as any)?.data?.articles || [];
      }

      if (pageNum === 1) {
        setArticles(list);
      } else {
        setArticles((prev) => [...prev, ...list]);
      }

      if (list.length < 10) {
        setHasMore(false);
      }
    } catch (err) {
      console.error('Failed to load articles:', err);
    } finally {
      setLoadingArticles(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (loadingMore || !hasMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchArticles(nextPage);
  };

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') router.push('/');
    else if (slug === 'cricket') router.push('/cricket');
    else router.push(`/${slug}`);
  };

  const [activeFilter, setActiveFilter] = useState('ALL');

  const dynamicSubCategories = Array.from(
    new Set(
      articles
        .map(a => (renderText(a.subCategory) || '').trim())
        .filter(Boolean)
    )
  );

  const currentFilters = dynamicSubCategories.length > 0
    ? ['ALL', ...dynamicSubCategories.map(s => s.toUpperCase())]
    : [];

  const displayArticles = activeFilter.toUpperCase() === 'ALL'
    ? articles
    : articles.filter(a => {
        const subCat = (renderText(a.subCategory) || '').trim().toUpperCase();
        return subCat === activeFilter.toUpperCase();
      });

  const leadArticle = displayArticles[0] || null;
  const feedArticles = displayArticles.slice(1);

  return (
    <main className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      {/* 1. Global Navigation Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="cricket"
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Top Cricket Match Carousel Slider (Live Hindustan / Cricbuzz Style) */}
      <CricketMatchSlider />

      {/* 3. Blue Cricket Sub-Navigation Bar: SCHEDULE & RANKING */}
      <nav className="bg-[#1c3aa9] text-white shadow-md border-y border-blue-900/50">
        <div className="max-w-[1360px] mx-auto px-4">
          <div className="flex items-center space-x-6 sm:space-x-10 overflow-x-auto no-scrollbar py-2.5 text-xs sm:text-sm font-black tracking-wider uppercase">
            <Link
              href="/cricket/schedule"
              className="hover:text-amber-300 transition-colors py-1 whitespace-nowrap flex items-center gap-1.5"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>SCHEDULE</span>
            </Link>

            <Link
              href="/cricket/rankings"
              className="hover:text-amber-300 transition-colors py-1 whitespace-nowrap flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5" />
              <span>RANKING</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* 4. Main Body Section: Real Articles Feed & Sidebar (Replacing Image 2) */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 py-6 w-full flex-1">
        
        {/* Section Header */}
        <div className="flex items-center justify-between border-b-2 border-slate-200 dark:border-slate-800 pb-3 mb-6">
          <div className="flex items-center gap-3">
            <span className="w-1.5 h-6 bg-red-600 rounded-full inline-block" />
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase font-serif">
              Cricket News & Updates
            </h1>
          </div>

          <Link
            href="/category/cricket"
            className="text-xs md:text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Sub-Category Filter Chips */}
        {currentFilters.length > 1 && (
          <div className="w-full max-w-full min-w-0 overflow-hidden pt-1 pb-4 mb-2 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
              {currentFilters.map((filter) => {
                const isSelected = activeFilter.toUpperCase() === filter.toUpperCase();
                return (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-red-600/50 hover:text-red-600'
                    }`}
                  >
                    {filter.toUpperCase()}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Loading Skeleton */}
        {loadingArticles && articles.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse py-4">
            <div className="lg:col-span-8 space-y-4">
              <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
              <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
            </div>
            <div className="lg:col-span-4 space-y-4">
              <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            </div>
          </div>
        ) : (
          /* 2-Column Grid Layout */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Main Feed Column (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Primary Lead Article Card */}
              {leadArticle && (
                <article
                  onClick={() => router.push(`/article/${leadArticle.slug || leadArticle.id}`)}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group"
                >
                  <div className="aspect-[16/9] w-full bg-slate-900 overflow-hidden relative">
                    <img
                      src={
                        leadArticle.featuredImage ||
                        'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80'
                      }
                      alt={renderText(leadArticle.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-black px-3 py-1 rounded shadow uppercase tracking-wider">
                      {renderText(leadArticle.category) || 'CRICKET'}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6 space-y-3">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-red-600 transition-colors leading-tight font-serif">
                      {renderText(leadArticle.title)}
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                      {stripHtml(renderText(leadArticle.subHeadline || leadArticle.content || ''))}
                    </p>
                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        <span>{formatTimeAgoString(leadArticle.publishedAt || leadArticle.createdAt)}</span>
                      </span>
                      <span className="font-bold text-red-600 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                        <span>Read Full Story</span>
                        <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </article>
              )}

              {/* Stacked Feed Articles List */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Latest Stories & Coverage
                  </h3>
                </div>

                {feedArticles.map((art) => (
                  <article
                    key={art.id}
                    onClick={() => router.push(`/article/${art.slug || art.id}`)}
                    className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-row items-center gap-3 sm:gap-4"
                  >
                    <div className="w-28 h-20 sm:w-44 sm:h-28 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80">
                      <img
                        src={
                          art.featuredImage ||
                          'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&q=80'
                        }
                        alt={renderText(art.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                      <span className="text-[10px] sm:text-xs font-black uppercase text-red-600 block tracking-wider">
                        {renderText(art.subCategory || art.category) || 'CRICKET'}
                      </span>
                      <h3 className="text-xs sm:text-base font-bold font-serif text-slate-900 dark:text-white group-hover:text-red-600 transition-colors leading-snug line-clamp-2 sm:line-clamp-3">
                        {renderText(art.title)}
                      </h3>
                      <p className="hidden md:line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                        {stripHtml(renderText(art.subHeadline || art.content || ''))}
                      </p>
                      <div className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-2 pt-0.5">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span>{formatTimeAgoString(art.publishedAt || art.createdAt)}</span>
                        <span>•</span>
                        <span>{art.readTimeMinutes || 3} min read</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && (
                <div className="pt-4 pb-2 text-center">
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className="px-8 py-3 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-black text-xs uppercase tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 hover:border-red-600 hover:text-red-600 dark:hover:text-red-500 shadow-sm hover:shadow transition-all group inline-flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {loadingMore ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
                        <span>Loading Stories...</span>
                      </>
                    ) : (
                      <>
                        <span>Load More Stories</span>
                        <ChevronRight className="w-4 h-4 text-red-600 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar Column (4 Cols): Exactly Matching Homepage TOP NEWS */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* TOP NEWS Box (Hidden on Mobile, Visible on Desktop) */}
              <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-2">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-red-600" />
                    <span>TOP NEWS</span>
                  </h3>
                </div>

                <div className="space-y-3 pt-1 divide-y divide-slate-100 dark:divide-slate-800/80">
                  {topNewsList.map((item, idx) => (
                    <article
                      key={item.id}
                      onClick={() => router.push(`/article/${item.slug || item.id}`)}
                      className="flex space-x-3 items-start cursor-pointer group pt-2.5 first:pt-0"
                    >
                      <span className="font-mono text-base sm:text-lg font-black text-slate-300 dark:text-slate-700 w-6 shrink-0 group-hover:text-red-600 transition-colors">
                        0{idx + 1}
                      </span>
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-black uppercase text-red-600 block">
                          {renderText(item.category)}
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                          {renderText(item.title)}
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-medium">
                          {formatTimeAgoString(item.publishedAt || item.createdAt)}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              {/* ICC Rankings Widget (Live Top Teams with Direct Link to Full 10 Rankings) */}
              <div className="bg-gradient-to-br from-[#0c1630] to-[#142247] text-white border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
                      ICC Men's Rankings
                    </h3>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-bold">
                    T20I
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  {topRankings.map((r) => (
                    <div
                      key={r.rank}
                      className="flex items-center justify-between bg-slate-800/60 p-2 rounded-lg border border-slate-700/50"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`font-mono font-bold w-4 text-center ${
                          r.rank === 1 ? 'text-amber-400 font-extrabold' : 'text-slate-400'
                        }`}>
                          {r.rank}
                        </span>
                        {r.logo && (
                          <img
                            src={r.logo}
                            alt={r.team}
                            className="w-4 h-4 rounded-full object-cover border border-slate-600"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://flagcdn.com/w40/in.png';
                            }}
                          />
                        )}
                        <span className="font-semibold text-white">{r.team}</span>
                      </div>
                      <span className="font-mono text-slate-300 font-bold">{r.rating} pts</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/cricket/rankings"
                  className="block text-center text-xs font-bold text-amber-400 hover:text-amber-300 pt-2 border-t border-slate-800 transition-colors"
                >
                  View Full Top 10 Standings & Player Rankings →
                </Link>
              </div>

            </div>
          </div>
        )}
      </div>

      <Footer />
      <MobileBottomNav />
      {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </main>
  );
}
