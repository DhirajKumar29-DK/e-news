'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { Header, Footer, SearchModal, MobileBottomNav } from '@/components/common';
import { Clock, TrendingUp, ChevronRight, HelpCircle, ArrowRight, Home, RefreshCw } from 'lucide-react';
import { articleService, ArticleData } from '@/services/articleService';
import { categoryService, CategoryData } from '@/services/categoryService';
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

  const [categories, setCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    const cached = categoryService.getCachedCategories();
    if (cached && cached.length > 0) setCategories(cached);

    categoryService.getCategories().then(cats => {
      if (cats && cats.length > 0) setCategories(cats);
    }).catch(() => {});

    const handleCatsChanged = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) setCategories(e.detail);
    };
    window.addEventListener('categories_changed', handleCatsChanged);
    return () => window.removeEventListener('categories_changed', handleCatsChanged);
  }, []);

  const matchedCategory = categories.find(c => c.slug?.toLowerCase() === slug.toLowerCase());
  const currentCategoryName = matchedCategory?.name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ') : 'News');

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
  const [allCategorySubCats, setAllCategorySubCats] = useState<string[]>([]);
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
      const catTitle = currentCategoryName;
      document.title = `${catTitle} News - Latest Breaking Updates | Vartiq`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `Read latest ${catTitle} news, analysis, reports, and real-time updates on Vartiq.`);
      }
    }

    // Fetch exact same homepage TOP NEWS for the sidebar
    articleService.getHomeArticles()
      .then((homeRes) => {
        if (homeRes && homeRes.trending && homeRes.trending.length > 0) {
          setTopNewsArticles(homeRes.trending.slice(0, 5));
        } else {
          articleService.getArticles({ limit: 5, sortBy: 'publishedAt', sortOrder: 'desc' })
            .then((topRes: any) => {
              if (topRes.articles && topRes.articles.length > 0) {
                setTopNewsArticles(topRes.articles);
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {
        articleService.getArticles({ limit: 5, sortBy: 'publishedAt', sortOrder: 'desc' })
          .then((topRes: any) => {
            if (topRes.articles && topRes.articles.length > 0) {
              setTopNewsArticles(topRes.articles);
            }
          })
          .catch(() => {});
      });

    articleService.getArticles({
      category: isLatest ? undefined : slug,
      limit: 50,
      status: 'PUBLISHED'
    }).then(res => {
      if (res.articles && res.articles.length > 0) {
        const subs = Array.from(
          new Set(
            res.articles
              .filter(a => isLatest || (a.category || '').toLowerCase() === slug.toLowerCase())
              .map(a => (a.subCategory || '').trim())
              .filter(Boolean)
          )
        );
        setAllCategorySubCats(subs);
      }
    }).catch(() => {});

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

  // Dynamically extract unique subcategories from articles in this category (case-insensitive deduplication)
  const dynamicSubCategories = Array.from(
    new Set(
      [
        ...allCategorySubCats,
        ...rawArticles.map(a => (a.subCategory || '').trim())
      ]
        .map(s => (s || '').trim().toUpperCase())
        .filter(Boolean)
    )
  );

  const currentFilters = dynamicSubCategories.length > 0
    ? ['ALL', ...dynamicSubCategories]
    : [];

  // Sub-filter: strictly match subCategory tag, never bleed across
  const articles = activeFilter.toUpperCase() === 'ALL'
    ? rawArticles
    : rawArticles.filter(a => {
        const subCat = (a.subCategory || '').trim().toUpperCase();
        const tags = ((a.subTags || []) as string[]).map(t => t.trim().toUpperCase());
        return subCat === activeFilter.toUpperCase() || tags.includes(activeFilter.toUpperCase());
      });

  const displayArticles = articles;
  const leadArticle = displayArticles[0];
  const feedArticles = displayArticles.slice(1);

  const sidebarSource = topNewsArticles.length > 0 ? topNewsArticles : rawArticles.slice(0, 5);
  const currentSidebarNews = sidebarSource.slice(0, 5).map((art, idx) => ({
    id: art.slug || art.id,
    trendingRank: idx + 1,
    category: typeof art.category === 'string' ? art.category.toUpperCase() : 'NEWS',
    title: typeof art.title === 'string' ? art.title : ((art.title as any)?.en || '')
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
                'name': currentCategoryName,
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

      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-8 lg:px-10 py-4 sm:py-6 flex-1 space-y-6 min-w-0">

        {isLoading ? (
          <div className="space-y-6 animate-pulse py-4">
            <h1 className="sr-only">{currentCategoryName} - Vartiq</h1>
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
        ) : (
          <div className="space-y-6">
            {/* Header: Explainer/Opinion Banner OR Standard Category Header */}
            {(slug === 'explainer' || slug === 'opinion') ? (
              <div className="bg-gradient-to-r from-red-700 via-rose-600 to-red-800 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-lg mb-4">
                <div className="absolute -right-8 -bottom-10 text-9xl font-black font-serif text-white/5 select-none pointer-events-none uppercase">
                  {slug}
                </div>
                <div className="flex items-center space-x-4 relative z-10">
                  <div className="p-3 bg-white/20 backdrop-blur rounded-xl shadow-inner">
                    <HelpCircle className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight">
                      {currentCategoryName}
                    </h1>
                    <p className="text-sm sm:text-base text-white/90 font-medium pt-1">
                      Deep dive and comprehensive analysis behind the headlines
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-b-2 border-slate-200 dark:border-slate-800 pb-2.5 sm:pb-3 mb-2 sm:mb-4">
                {/* Desktop-only Breadcrumb */}
                <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 font-medium mb-2">
                  <button onClick={() => router.push('/')} className="hover:text-jagran-red flex items-center space-x-1" title="Home">
                    <Home className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
                  </button>
                  <span>/</span>
                  <span className="uppercase text-jagran-red font-extrabold tracking-wider">{slug}</span>
                </div>

                {/* Category Title: Displayed above ALL subcategory chips on both Mobile & Desktop */}
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <span className="w-1.5 h-5 sm:h-6 bg-jagran-red rounded-full inline-block shrink-0" />
                  <h1 className="text-lg sm:text-2xl font-black font-serif text-slate-900 dark:text-white uppercase tracking-tight">
                    {currentCategoryName}
                  </h1>
                </div>
              </div>
            )}

            {/* Sub-category Filter Chips (Dynamic from backend articles) */}
            {currentFilters.length > 1 && (
              <div className="w-full max-w-full min-w-0 overflow-hidden pt-1 pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-0.5">
                  {currentFilters.map((filter, idx) => {
                    const isSelected = activeFilter.toUpperCase() === filter.toUpperCase();
                    return (
                      <button
                        key={`cat-filter-${filter}-${idx}`}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                          isSelected
                            ? 'bg-jagran-red text-white border-jagran-red shadow-sm'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-jagran-red/50 hover:text-jagran-red'
                        }`}
                      >
                        {filter.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2-Column Grid Layout */}
            <div className="w-full min-w-0 max-w-full grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">

              {/* Main Feed Column (8 Cols) */}
              <div className="w-full min-w-0 lg:col-span-8 space-y-6 sm:space-y-8">

                {/* Primary Category Lead Article */}
                {leadArticle && (
                  <article
                    onClick={() => router.push(`/article/${leadArticle.id}`)}
                    className="w-full min-w-0 max-w-full bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all group"
                  >
                    <div className="aspect-[16/9] bg-slate-900 overflow-hidden relative">
                      <img
                        src={leadArticle.imageUrl}
                        alt={t(leadArticle.title)}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=1200&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 bg-jagran-red text-white text-xs font-bold px-3 py-1 rounded shadow uppercase tracking-wide">
                        {leadArticle.subCategory || leadArticle.category}
                      </span>
                    </div>
                    <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
                      <h2 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-snug sm:leading-tight font-serif break-words">
                        {t(leadArticle.title)}
                      </h2>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3 break-words">
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

                {/* Stacked Feed Articles List: LEFT Image, RIGHT Text (Desktop & Mobile) */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-600 dark:text-slate-400">
                      Recent {currentCategoryName} Updates
                    </h3>
                  </div>

                  {displayArticles.length === 0 && (
                    <div className="py-12 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                        No articles available in {currentCategoryName} right now. Check back soon!
                      </p>
                    </div>
                  )}

                  {feedArticles.map((art) => (
                    <article
                      key={art.id}
                      onClick={() => router.push(`/article/${art.id}`)}
                      className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-xs hover:shadow-md cursor-pointer transition-all group flex flex-row items-center gap-3 sm:gap-4"
                    >
                      {/* Left: Thumbnail Image */}
                      <div className="w-28 h-20 sm:w-44 sm:h-28 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80 dark:border-slate-700">
                        <img
                          src={art.imageUrl}
                          alt={t(art.title)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&q=80';
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Right: Article Details */}
                      <div className="flex-1 min-w-0 space-y-1.5 sm:space-y-2">
                        <span className="text-[10px] sm:text-xs font-black uppercase text-jagran-red tracking-wider block">
                          {art.subCategory || art.category}
                        </span>
                        <h4 className="text-xs sm:text-base font-bold font-serif text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-snug line-clamp-2 sm:line-clamp-3">
                          {t(art.title)}
                        </h4>
                        <div className="flex items-center space-x-2 text-[10px] sm:text-xs text-slate-400 font-medium">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{t(art.timeAgo)}</span>
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

              {/* Right Top News Sidebar (4 Cols) - HIDDEN ON MOBILE, STICKY ON DESKTOP */}
              <aside className="hidden lg:block w-full min-w-0 lg:col-span-4 space-y-6 lg:sticky lg:top-24 self-start">

                {/* TOP NEWS 1 to 5 Numbered Sidebar (Exact Same as Homepage) */}
                <div className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between border-b-2 border-jagran-red pb-1">
                    <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center space-x-1.5">
                      <TrendingUp className="w-4 h-4 text-jagran-red" />
                      <span>TOP NEWS</span>
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {currentSidebarNews.map((item) => (
                      <article
                        key={item.id}
                        onClick={() => router.push(`/article/${item.id}`)}
                        className="py-2.5 first:pt-0 last:pb-0 flex space-x-2.5 items-start group cursor-pointer"
                      >
                        <span className="font-serif font-black text-xl text-jagran-red/60 group-hover:text-jagran-red transition-colors w-5 shrink-0 leading-none">
                          0{item.trendingRank}
                        </span>
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] sm:text-xs font-black uppercase text-jagran-red block mb-0.5">
                            {item.category}
                          </span>
                          <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors leading-snug line-clamp-2">
                            {t(item.title)}
                          </h4>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>

              </aside>

            </div>
          </div>
        )}

      </div>

      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <Footer />
    </main>
  );
}
