'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Header, Footer, SearchModal } from '@/components/common';
import { Clock, TrendingUp, ChevronRight, HelpCircle, ArrowRight, Home, RefreshCw } from 'lucide-react';
import { articleService, ArticleData } from '@/services/articleService';
import VideosPage from '@/app/videos/page';

import { formatTimeAgo } from '@/utils/timeAgo';
import { stripHtml } from '@/utils/textUtils';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const slug = typeof params?.slug === 'string' ? params.slug.toLowerCase() : 'national';
  const isLatest = slug === 'latest' || slug === 'latest-news';

  if (slug === 'videos') {
    return <VideosPage />;
  }

  const categoryNames: Record<string, string> = {
    latest: 'Latest News',
    'latest-news': 'Latest News',
    national: 'National News',
    india: 'India',
    world: 'World News',
    tech: 'Tech & Science',
    sports: 'Sports',
    cricket: 'Cricket News',
    business: 'Business',
    entertainment: 'Entertainment',
    lifestyle: 'Lifestyle & Health',
    fashion: 'Fashion & Beauty',
    brandverse: 'Brandverse',
    education: 'Education & Career',
    auto: 'Auto',
    spiritual: 'Spiritual',
    horoscope: 'Horoscope News',
    opinion: 'Opinion & Analysis',
    explainer: 'Explainer & Deep Analysis'
  };

  const subFilters: Record<string, string[]> = {
    latest: ['ALL', 'WORLD', 'INDIA', 'BUSINESS', 'TECH', 'SPORTS', 'ENTERTAINMENT', 'FASHION'],
    'latest-news': ['ALL', 'WORLD', 'INDIA', 'BUSINESS', 'TECH', 'SPORTS', 'ENTERTAINMENT', 'FASHION'],
    india: ['ALL', 'NATIONAL', 'SCIENCE', 'RAILWAYS', 'AGRICULTURE', 'ECONOMY'],
    national: ['ALL', 'JUDICIARY', 'SPACE MISSION', 'INFRASTRUCTURE', 'DEFENCE'],
    world: ['ALL', 'GEOPOLITICS', 'GLOBAL ECONOMY', 'SCIENCE', 'ENVIRONMENT', 'SPACE'],
    entertainment: ['ALL', 'BOLLYWOOD', 'HOLLYWOOD', 'OTT', 'BOX OFFICE', 'CELEBS'],
    fashion: ['ALL', 'TRENDS', 'CELEBRITY STYLE', 'BEAUTY & SKINCARE', 'FASHION WEEKS', 'ACCESSORIES'],
    brandverse: ['ALL', 'ASTRO APPS', 'PERSONAL FINANCE', 'CONSTRUCTION EXPO', 'CLEAN MOBILITY'],
    sports: ['ALL', 'CRICKET', 'FOOTBALL', 'BADMINTON', 'TENNIS', 'ISL'],
    cricket: ['ALL', 'IPL', 'TEST', 'ODI', 'T20', 'DOMESTIC'],
    tech: ['ALL', 'AI TECH', 'SMARTPHONES', 'GADGETS', 'CYBERSECURITY'],
    business: ['ALL', 'STOCK MARKET', 'IPO', 'REAL ESTATE', 'STARTUPS'],
    lifestyle: ['ALL', 'HEALTH', 'WELLNESS', 'FITNESS', 'FOOD', 'TRAVEL'],
    auto: ['ALL', 'ELECTRIC VEHICLES', 'CARS', 'BIKES', 'AUTO TECH'],
    explainer: ['ALL', 'GEOPOLITICS', 'HEALTH & MEDICINE', 'ENVIRONMENT', 'PERSONAL FINANCE', 'ECONOMY & TAX', 'ARTIFICIAL INTELLIGENCE'],
    opinion: ['ALL', 'GEOPOLITICS', 'HEALTH & MEDICINE', 'ENVIRONMENT', 'PERSONAL FINANCE', 'ECONOMY & TAX', 'ARTIFICIAL INTELLIGENCE'],
    spiritual: ['ALL', 'TEMPLES', 'FESTIVALS', 'RITUALS', 'VEDAS & PHILOSOPHY', 'ASTRO & FAITH'],
    horoscope: ['ALL', 'LOVE HOROSCOPE', 'DAILY HOROSCOPE', 'WEEKLY HOROSCOPE', 'ZODIAC SIGNS']
  };

  const currentFilters = subFilters[slug] || ['ALL', 'FEATURED', 'TRENDING', 'EXPLAINERS'];

  // Helper to format date like THU, 08 OCT 2026 06:14 PM (IST) matching screenshot
  const formatBrandverseDate = (dateStr?: string) => {
    if (!dateStr) return 'THU, 08 OCT 2026 06:14 PM (IST)';
    try {
      const d = new Date(dateStr);
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'Asia/Kolkata' }).toUpperCase();
      const day = String(d.toLocaleDateString('en-US', { day: '2-digit', timeZone: 'Asia/Kolkata' })).padStart(2, '0');
      const month = d.toLocaleDateString('en-US', { month: 'short', timeZone: 'Asia/Kolkata' }).toUpperCase();
      const year = d.toLocaleDateString('en-US', { year: 'numeric', timeZone: 'Asia/Kolkata' });
      const time = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' }).toUpperCase();
      return `${dayName}, ${day} ${month} ${year} ${time} (IST)`;
    } catch {
      return 'THU, 08 OCT 2026 06:14 PM (IST)';
    }
  };

  // Helper to map backend ArticleData into UI format
  const mapArticle = (a: ArticleData) => {
    const cleanTitle = stripHtml(a.title);
    const cleanSum = stripHtml(a.subHeadline) || stripHtml(a.content).slice(0, 160) + '...';
    return {
      id: a.slug || a.id,
      title: { en: cleanTitle, hi: cleanTitle },
      summary: { en: cleanSum, hi: cleanSum },
      imageUrl: a.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80',
      category: (a.category || 'LATEST').toUpperCase(),
      subCategory: a.subCategory || '',
      publishedAt: a.publishedAt || a.createdAt,
      timeAgo: formatTimeAgo(a.publishedAt || a.createdAt),
      readTime: { en: `${a.readTimeMinutes || 3} min read`, hi: `${a.readTimeMinutes || 3} मिनट पढ़ें` },
      subTags: [
        ...(a.subCategory ? [a.subCategory.toUpperCase()] : []),
        ...(a.category ? [a.category.toUpperCase()] : [])
      ]
    };
  };

  // Dynamic backend articles & Pagination states (10 per load from DB)
  const [dynamicArticles, setDynamicArticles] = useState<any[]>([]);
  const [topNewsArticles, setTopNewsArticles] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Reusable batch fetcher for 10 articles per page from database strictly for current category
  const fetchCategoryBatch = async (pageNum: number) => {
    if (isLatest) {
      return articleService.getArticles({
        page: pageNum,
        limit: 10,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });
    } else {
      return articleService.getArticles({
        category: slug,
        page: pageNum,
        limit: 10,
        sortBy: 'publishedAt',
        sortOrder: 'desc'
      });
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setPage(1);

    if (typeof document !== 'undefined') {
      const catTitle = categoryNames[slug] || slug.toUpperCase();
      document.title = `${catTitle} News - Latest Breaking Updates | The Daily Jagran`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Read latest ${catTitle} news, analysis, reports, and real-time updates on The Daily Jagran.`);
      }
    }

    // Also fetch general top news for the sidebar
    articleService.getArticles({ limit: 5, sortBy: 'publishedAt', sortOrder: 'desc' })
      .then((topRes: any) => {
        if (topRes.articles && topRes.articles.length > 0) {
          setTopNewsArticles(topRes.articles);
        }
      })
      .catch(() => {});

    fetchCategoryBatch(1)
      .then((res: any) => {
        if (res.articles && res.articles.length > 0) {
          // Strict category isolation: Guarantee 0 articles from other categories leak in
          const isolatedArticles = isLatest
            ? res.articles
            : res.articles.filter((a: ArticleData) => (a.category || '').toLowerCase() === slug.toLowerCase());

          setDynamicArticles(isolatedArticles.map(mapArticle));
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages || 1);
          }
        } else {
          setDynamicArticles([]);
          setTotalPages(1);
        }
      })
      .catch(() => {
        setDynamicArticles([]);
        setTotalPages(1);
      })
      .finally(() => setIsLoading(false));
  }, [slug, isLatest]);

  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages) return;
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const res = await fetchCategoryBatch(nextPage);
      if (res.articles && res.articles.length > 0) {
        // Strict category isolation for next batch
        const isolatedArticles = isLatest
          ? res.articles
          : res.articles.filter((a: ArticleData) => (a.category || '').toLowerCase() === slug.toLowerCase());

        const newMapped = isolatedArticles.map(mapArticle);
        setDynamicArticles((prev) => [...prev, ...newMapped]);
        setPage(nextPage);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Error loading more category articles:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const rawArticles = dynamicArticles;

  // Sub-filter: strictly match subCategory tag, never bleed across
  const articles = activeFilter === 'ALL'
    ? rawArticles
    : rawArticles.filter(a => {
        const subCat = (a.subCategory || '').toUpperCase();
        const tags = (a.subTags || []) as string[];
        return subCat === activeFilter || tags.includes(activeFilter);
      });

  const displayArticles = articles;
  const leadArticle = displayArticles[0];
  const feedArticles = displayArticles.slice(1);

  const sidebarSource = (slug === 'brandverse' && topNewsArticles.length > 0) ? topNewsArticles : (rawArticles.slice(0, 5).length > 0 ? rawArticles : topNewsArticles);
  const currentSidebarNews = sidebarSource.slice(0, 5).map((art, idx) => ({
    id: art.id,
    trendingRank: idx + 1,
    category: typeof art.category === 'string' ? art.category : 'NEWS',
    title: typeof art.title === 'string' ? { en: art.title } : art.title
  }));

  return (
    <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">

      {/* Header */}
      {/* Schema.org BreadcrumbList for Category Page */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            'itemListElement': [
              {
                '@type': 'ListItem',
                'position': 1,
                'name': 'Home',
                'item': 'http://localhost:3000'
              },
              {
                '@type': 'ListItem',
                'position': 2,
                'name': categoryNames[slug] || slug.toUpperCase(),
                'item': `http://localhost:3000/${slug}`
              }
            ]
          })
        }}
      />

      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory={slug}
        onSelectCategory={(catSlug) => router.push(catSlug === 'all' ? '/' : (catSlug === 'videos' ? '/videos' : `/${catSlug}`))}
      />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-6 flex-1 space-y-6">

        {isLoading ? (
          <div className="space-y-6 animate-pulse py-4">
            <h1 className="sr-only">{categoryNames[slug] || slug.toUpperCase()} - The Daily Jagran</h1>
            <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-4">
                <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
                <div className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
              <div className="lg:col-span-4 space-y-4">
                <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
              </div>
            </div>
          </div>
        ) : (slug === 'explainer' || slug === 'opinion') ? (
          <div className="space-y-6 pb-10">

            {/* Banner Header */}
            <div className="bg-gradient-to-r from-red-700 via-rose-600 to-red-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg">
              <div className="absolute -right-8 -bottom-10 text-9xl font-black font-serif text-white/5 select-none pointer-events-none uppercase">
                {slug}
              </div>
              <div className="flex items-center space-x-4 relative z-10">
                <div className="p-3 bg-white/20 backdrop-blur rounded-xl shadow-inner">
                  <HelpCircle className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight">
                    {categoryNames[slug]}
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
                      <h3 className="text-base font-black font-serif text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400 transition-colors leading-snug">
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

            {/* Load More Button for Explainer/Opinion view */}
            {page < totalPages && (
              <div className="pt-6 pb-2 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={isLoadingMore}
                  className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 hover:border-jagran-red hover:text-jagran-red dark:hover:text-jagran-red shadow-sm hover:shadow transition-all group inline-flex items-center space-x-2 disabled:opacity-60 cursor-pointer"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-jagran-red" />
                      <span>Loading Analysis...</span>
                    </>
                  ) : (
                    <>
                      <span>Load More Analysis</span>
                      <ChevronRight className="w-4 h-4 text-jagran-red group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            )}

          </div>
        ) : (
          /* Standard 2-Column Category View (EXACT MATCH TO https://e-news-ebon.vercel.app/category/world) */
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

                  {feedArticles.map((art) => (
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
                        <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-snug">
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

                  {/* Load More Button connected to Database Pagination */}
                  {page < totalPages && (
                    <div className="pt-4 pb-2 text-center">
                      <button
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                        className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-slate-300 dark:border-slate-700 hover:border-jagran-red hover:text-jagran-red dark:hover:text-jagran-red shadow-sm hover:shadow transition-all group inline-flex items-center space-x-2 disabled:opacity-60 cursor-pointer"
                      >
                        {isLoadingMore ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-jagran-red" />
                            <span>Loading More News...</span>
                          </>
                        ) : (
                          <>
                            <span>Load More News</span>
                            <ChevronRight className="w-4 h-4 text-jagran-red group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
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
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-snug">
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
