'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Header, Footer, SearchModal } from '@/components/common';
import { mockCategoryArticles, mockTrendingNews, mockTopNewsSidebar } from '@/data/mockNewsData';
import { ArrowLeft, Clock, TrendingUp, Sparkles, ChevronRight, Bookmark, HelpCircle, ArrowRight, Home } from 'lucide-react';

import VideosPage from '@/app/videos/page';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [feedVisibleCount, setFeedVisibleCount] = useState(9);

  const slug = typeof params?.slug === 'string' ? params.slug.toLowerCase() : 'national';

  if (slug === 'videos') {
    return <VideosPage />;
  }

  const categoryNames: Record<string, string> = {
    latest: 'Latest News',
    national: 'National News',
    india: 'India',
    world: 'World News',
    tech: 'Tech & Science',
    sports: 'Sports',
    cricket: 'Cricket News',
    business: 'Business',
    entertainment: 'Entertainment',
    lifestyle: 'Lifestyle & Health',
    education: 'Education & Career',
    auto: 'Auto',
    spiritual: 'Spiritual',
    horoscope: 'Horoscope News',
    opinion: 'Opinion & Analysis',
    explainer: 'Explainer & Deep Analysis'
  };

  const subFilters: Record<string, string[]> = {
    entertainment: ['ALL', 'BOLLYWOOD', 'HOLLYWOOD', 'OTT', 'BOX OFFICE', 'CELEBS'],
    sports: ['ALL', 'CRICKET', 'FOOTBALL', 'BADMINTON', 'TENNIS', 'ISL'],
    tech: ['ALL', 'AI TECH', 'SMARTPHONES', 'GADGETS', 'CYBERSECURITY'],
    business: ['ALL', 'STOCK MARKET', 'IPO', 'REAL ESTATE', 'STARTUPS'],
    explainer: ['ALL', 'GEOPOLITICS', 'HEALTH & MEDICINE', 'ENVIRONMENT', 'PERSONAL FINANCE', 'ECONOMY & TAX', 'ARTIFICIAL INTELLIGENCE'],
    opinion: ['ALL', 'GEOPOLITICS', 'HEALTH & MEDICINE', 'ENVIRONMENT', 'PERSONAL FINANCE', 'ECONOMY & TAX', 'ARTIFICIAL INTELLIGENCE'],
    horoscope: ['ALL', 'LOVE HOROSCOPE', 'DAILY HOROSCOPE', 'WEEKLY HOROSCOPE', 'ZODIAC SIGNS']
  };

  const currentFilters = subFilters[slug] || ['ALL', 'FEATURED', 'TRENDING', 'EXPLAINERS'];

  const rawArticles = mockCategoryArticles[slug] || mockCategoryArticles['national'] || [];

  const articles = activeFilter === 'ALL'
    ? rawArticles
    : rawArticles.filter(a => a.category.toUpperCase() === activeFilter);

  const displayArticles = articles.length > 0 ? articles : rawArticles;
  const leadArticle = displayArticles[0];
  const feedArticles = displayArticles.slice(1);

  const categorySidebarNews: Record<string, { id: string; trendingRank: number; category: string; title: { en: string; hi?: string } }[]> = {
    entertainment: [
      {
        id: 'ent-1',
        trendingRank: 1,
        category: 'BOLLYWOOD',
        title: {
          en: 'Singham Again teaser launch date confirmed: Ajay Devgn, Deepika Padukone ready for Diwali clash'
        }
      },
      {
        id: 'ent-2',
        trendingRank: 2,
        category: 'HOLLYWOOD',
        title: {
          en: 'Avatar 3 title officially announced by James Cameron: Fire and Ash to hit global theatres'
        }
      },
      {
        id: 'ent-3',
        trendingRank: 3,
        category: 'OTT',
        title: {
          en: 'Mirzapur Season 4 release timeline revealed by makers, Pankaj Tripathi returns as Kaleen Bhaiya'
        }
      },
      {
        id: 'ent-4',
        trendingRank: 4,
        category: 'CELEBS',
        title: {
          en: 'Shah Rukh Khan undergoes minor surgery in US for eye treatment, returns safely to Mumbai'
        }
      },
      {
        id: 'ent-5',
        trendingRank: 5,
        category: 'BOX OFFICE',
        title: {
          en: 'Stree 2 completes 50 days in cinemas, becomes highest grossing Hindi film of recent era'
        }
      }
    ]
  };

  const currentSidebarNews = categorySidebarNews[slug] || rawArticles.slice(0, 5).map((art, idx) => ({
    id: art.id,
    trendingRank: idx + 1,
    category: art.category,
    title: art.title
  }));

  return (
    <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">

      {/* Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory={slug}
        onSelectCategory={(catSlug) => router.push(catSlug === 'all' ? '/' : `/category/${catSlug}`)}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-6 flex-1 space-y-6">

        {(slug === 'explainer' || slug === 'opinion') ? (
          <div className="space-y-6 pb-10">

            {/* Banner Header */}
            <div className="bg-gradient-to-r from-red-700 via-rose-600 to-red-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -right-8 -bottom-10 text-9xl font-black font-serif text-white/5 select-none pointer-events-none uppercase">
                Explainer
              </div>
              <div className="flex items-center space-x-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur rounded-xl shadow-inner">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight">
                    Explainer & Analysis
                  </h1>
                  <p className="text-sm sm:text-base text-white/90 font-medium pt-1">
                    Deep dive and comprehensive analysis behind the headlines
                  </p>
                </div>
              </div>
            </div>

            {/* Sub-category Filter Chips */}
            <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2 border-b border-slate-200 dark:border-slate-800">
              {currentFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${activeFilter === filter
                      ? 'bg-jagran-red text-white border-jagran-red shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-jagran-red/50 hover:text-jagran-red'
                    }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Grid of ALL Explainer Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              {displayArticles.map((card) => (
                <article
                  key={card.id}
                  onClick={() => router.push(`/article/${card.id}`)}
                  className="bg-white dark:bg-brand-dark-card text-slate-900 dark:text-slate-100 rounded-xl overflow-hidden hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
                >
                  {/* Card Image Header */}
                  <div className="aspect-[16/10] overflow-hidden bg-slate-900 relative">
                    <img
                      src={card.imageUrl}
                      alt={t(card.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-red-700 text-white text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-widest shadow">
                      EXPLAINED
                    </span>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-xs font-black uppercase tracking-wider text-red-700 dark:text-red-400 block">
                        {card.category}
                      </span>
                      <h3 className="text-base font-black font-serif text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                        {t(card.title)}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed font-medium">
                        {t(card.summary)}
                      </p>
                    </div>

                    {/* Footer Bar */}
                    <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                      <span className="flex items-center space-x-1.5 text-slate-500 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{t(card.readTime)}</span>
                      </span>
                      <span className="flex items-center space-x-1 text-red-700 dark:text-red-400 font-black group-hover:translate-x-1 transition-transform">
                        <span>Read Analysis</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

          </div>
        ) : (
          /* Standard 2-Column Category View */
          <div className="space-y-6">
            {/* Category Header & Sub-filters */}
            <div className="space-y-4 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
                <button onClick={() => router.push('/')} className="hover:text-jagran-red flex items-center space-x-1" title="Home">
                  <Home className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                </button>
                <span>/</span>
                <span className="uppercase text-jagran-red font-extrabold tracking-wider">{slug}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="w-3 h-8 bg-jagran-red rounded"></span>
                <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 dark:text-white uppercase tracking-tight">
                  {categoryNames[slug] || slug.toUpperCase()}
                </h1>
              </div>

              {/* Sub-category Filter Chips */}
              <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar pt-1">
                {currentFilters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border ${activeFilter === filter
                        ? 'bg-jagran-red text-white border-jagran-red shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-jagran-red/50 hover:text-jagran-red'
                      }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Column Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Main Feed Column (8 Cols) */}
              <div className="lg:col-span-8 space-y-8">

                {/* Primary Category Lead Article */}
                {leadArticle && (
                  <article
                    onClick={() => router.push(`/article/${leadArticle.id}`)}
                    className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="aspect-[16/9] bg-slate-900 overflow-hidden relative">
                      <img
                        src={leadArticle.imageUrl}
                        alt={t(leadArticle.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-jagran-red text-white text-xs font-bold px-3 py-1 rounded shadow uppercase tracking-wide">
                        {leadArticle.category}
                      </span>
                    </div>
                    <div className="p-6 space-y-3">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-tight font-serif">
                        {t(leadArticle.title)}
                      </h2>
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {t(leadArticle.summary)}
                      </p>
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{t(leadArticle.timeAgo)}</span>
                        </span>
                        <span className="font-semibold text-jagran-red hover:underline flex items-center space-x-1">
                          <span>Read Full Story</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </article>
                )}

                {/* Stacked Feed Articles List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Recent Category Updates
                    </h3>
                  </div>

                  {feedArticles.slice(0, feedVisibleCount).map((art) => (
                    <article
                      key={art.id}
                      onClick={() => router.push(`/article/${art.id}`)}
                      className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all group flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 items-start"
                    >
                      <div className="w-full sm:w-48 aspect-[16/10] rounded-lg overflow-hidden bg-slate-100 shrink-0">
                        <img
                          src={art.imageUrl}
                          alt={t(art.title)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <span className="text-[10px] font-bold uppercase text-jagran-red block">
                          {art.category}
                        </span>
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors line-clamp-2 leading-snug">
                          {t(art.title)}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                          {t(art.summary)}
                        </p>
                        <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1">
                          <div className="flex items-center space-x-2">
                            <span>{t(art.timeAgo)}</span>
                            <span>•</span>
                            <span>{t(art.readTime)}</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}

                  {/* Load More Button for standard category feed */}
                  {feedVisibleCount < feedArticles.length && (
                    <div className="pt-4 pb-2 text-center">
                      <button
                        onClick={() => setFeedVisibleCount((prev) => prev + 10)}
                        className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 hover:border-jagran-red hover:text-jagran-red dark:hover:text-jagran-red shadow-sm hover:shadow transition-all group inline-flex items-center space-x-2"
                      >
                        <span>Load More News</span>
                        <ChevronRight className="w-4 h-4 text-jagran-red group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* Right Top News Sidebar (4 Cols) - STICKY */}
              <div className="lg:col-span-4 space-y-6 sticky top-32 self-start z-10">

                {/* Top Category News Box */}
                <div className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 mb-4">
                    <h3 className="text-base font-extrabold flex items-center space-x-2 text-slate-900 dark:text-white">
                      <TrendingUp className="w-4 h-4 text-jagran-red" />
                      <span>Top {categoryNames[slug] || slug.toUpperCase()} News</span>
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {currentSidebarNews.map((item) => (
                      <article
                        key={item.id}
                        onClick={() => router.push(`/article/${item.id}`)}
                        className="flex space-x-3 items-start group cursor-pointer border-b border-slate-100 dark:border-slate-800/60 pb-3 last:border-0 last:pb-0"
                      >
                        <span className="font-serif font-black text-2xl text-jagran-red/40 group-hover:text-jagran-red transition-colors w-6 shrink-0">
                          0{item.trendingRank}
                        </span>
                        <div className="flex-1">
                          <span className="text-[10px] font-bold uppercase text-jagran-red block mb-0.5">
                            {item.category}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors line-clamp-2">
                            {t(item.title)}
                          </h4>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <Footer />
    </main>
  );
}
