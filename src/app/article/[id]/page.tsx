'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { mockLatestVideos } from '@/data/mockNewsData';
import { useLanguage } from '@/context/LanguageContext';
import { Header, Footer, SearchModal } from '@/components/common';
import { ArrowLeft, Clock, Share2, Tag, Check, Play, Copy, X } from 'lucide-react';
import { articleService, ArticleData } from '@/services/articleService';
import { formatTimeAgo } from '@/utils/timeAgo';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  
  const articleId = typeof params?.id === 'string' ? params.id : '';

  const [isLoadingArticle, setIsLoadingArticle] = useState(true);
  const [dynamicArticle, setDynamicArticle] = useState<ArticleData | null>(null);
  const [dynamicRelated, setDynamicRelated] = useState<any[]>([]);
  const [sidebarTopNews, setSidebarTopNews] = useState<any[]>([]);

  useEffect(() => {
    if (!articleId) {
      setIsLoadingArticle(false);
      return;
    }

    setIsLoadingArticle(true);

    // Fetch primary article
    articleService.getArticleByIdOrSlug(articleId)
      .then(data => {
        if (data) {
          setDynamicArticle(data);
          if (typeof document !== 'undefined') {
            document.title = `${data.title} | The Daily Jagran`;
            let metaDesc = document.querySelector('meta[name="description"]');
            if (!metaDesc) {
              metaDesc = document.createElement('meta');
              metaDesc.setAttribute('name', 'description');
              document.head.appendChild(metaDesc);
            }
            metaDesc.setAttribute('content', data.subHeadline || data.content.slice(0, 160));
          }
          const cat = data.category ? data.category.toLowerCase() : undefined;
          
          // Fetch real related articles from DB
          articleService.getArticles({ category: cat, limit: 6 })
            .then(res => {
              if (res && res.articles) {
                const filtered = res.articles
                  .filter(a => a.id !== data.id && a.slug !== data.slug)
                  .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
                  .slice(0, 3)
                  .map(a => ({
                    id: a.slug || a.id,
                    title: a.title,
                    publishedAt: a.publishedAt
                  }));
                setDynamicRelated(filtered);
              }
            })
            .catch(() => {});
        } else {
          setDynamicArticle(null);
        }
      })
      .catch(err => {
        console.error('Failed to load article from DB:', err);
        setDynamicArticle(null);
      })
      .finally(() => {
        setIsLoadingArticle(false);
      });

    // Fetch dynamic top news for right sidebar
    articleService.getArticles({ isTrending: true, limit: 5 })
      .then(res => {
        if (res && res.articles && res.articles.length > 0) {
          setSidebarTopNews(res.articles.slice(0, 5).map(a => ({
            id: a.slug || a.id,
            title: a.title,
            category: a.category
          })));
        } else {
          // Fallback to recent published articles from DB
          articleService.getArticles({ limit: 5, sortBy: 'publishedAt', sortOrder: 'desc' })
            .then(recentRes => {
              if (recentRes && recentRes.articles) {
                setSidebarTopNews(recentRes.articles.slice(0, 5).map(a => ({
                  id: a.slug || a.id,
                  title: a.title,
                  category: a.category
                })));
              }
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [articleId]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [likes, setLikes] = useState(120);
  const [hasLiked, setHasLiked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (dynamicArticle?.likesCount) {
      setLikes(dynamicArticle.likesCount);
    }
  }, [dynamicArticle]);

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    } else {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Full-page Loading Skeleton (Prevents ANY mock news flash)
  if (isLoadingArticle) {
    return (
      <main className="min-h-screen flex flex-col bg-brand-paper dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          activeCategory="all"
          onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : (slug === 'videos' ? '/videos' : `/${slug}`))}
        />

        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-10 pt-4 pb-12 flex-1 space-y-6 animate-pulse">
          <h1 className="sr-only">Article Details - The Daily Jagran</h1>
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 9 Columns Skeleton */}
            <div className="lg:col-span-9 space-y-5">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="h-5 w-20 bg-red-200 dark:bg-red-950/60 rounded"></div>
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
                </div>
                <div className="h-8 sm:h-10 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-8 sm:h-10 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="h-5 w-5/6 bg-slate-200 dark:bg-slate-700 rounded"></div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-md"></div>
                </div>
              </div>

              {/* Image Skeleton */}
              <div className="w-full aspect-[16/9] bg-slate-200 dark:bg-slate-800 rounded-lg"></div>

              {/* Split Content Skeleton */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
                <div className="md:col-span-3 space-y-3">
                  <div className="h-4 w-28 bg-red-200 dark:bg-red-950/60 rounded"></div>
                  {[1, 2, 3].map(i => (
                    <div key={i} className="py-2 space-y-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-3.5 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  ))}
                </div>

                <div className="md:col-span-9 space-y-4">
                  {/* Highlights Box Skeleton */}
                  <div className="p-4 bg-slate-100 dark:bg-slate-800/60 rounded-xl space-y-2">
                    <div className="h-4 w-24 bg-red-200 dark:bg-red-950/60 rounded"></div>
                    <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-3.5 w-4/5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>

                  {/* Body Paragraphs Skeleton */}
                  <div className="space-y-3 pt-2">
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 w-11/12 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 w-4/5 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                    <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 3 Columns Skeleton */}
            <div className="lg:col-span-3 space-y-5">
              <div className="p-4 bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="h-4 w-24 bg-red-200 dark:bg-red-950/60 rounded"></div>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex space-x-2.5 items-start py-1">
                    <div className="h-5 w-4 bg-red-100 dark:bg-red-950/40 rounded"></div>
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-full bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-3.5 w-2/3 bg-slate-200 dark:bg-slate-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    );
  }

  // Not Found State
  if (!dynamicArticle) {
    return (
      <main className="min-h-screen flex flex-col bg-brand-paper dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          activeCategory="all"
          onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : (slug === 'videos' ? '/videos' : `/${slug}`))}
        />
        <div className="max-w-[800px] mx-auto px-4 py-20 text-center space-y-5 flex-1 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-jagran-red mx-auto">
            <X className="w-8 h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 dark:text-white">
            Article Not Found
          </h1>
          <p className="text-sm text-slate-500 max-w-md">
            The article you are looking for does not exist or may have been updated.
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2.5 bg-jagran-red text-white text-sm font-bold rounded-full hover:bg-red-700 transition-colors cursor-pointer"
          >
            Back to Homepage
          </button>
        </div>
        <Footer />
      </main>
    );
  }

  // Pure Dynamic Article Representation (Zero mock news)
  const article = {
    id: dynamicArticle.slug || dynamicArticle.id,
    title: dynamicArticle.title,
    summary: dynamicArticle.subHeadline || dynamicArticle.content.slice(0, 160) + '...',
    category: dynamicArticle.category.toUpperCase(),
    imageUrl: dynamicArticle.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80',
    imageCaption: dynamicArticle.imageCaption || '',
    author: {
      name: dynamicArticle.authorName || 'News Bureau',
      role: 'Bureau Correspondent',
      avatar: dynamicArticle.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    timeAgo: formatTimeAgo(dynamicArticle.publishedAt || dynamicArticle.createdAt),
    readTime: `${dynamicArticle.readTimeMinutes || 3} min read`,
    viewsCount: dynamicArticle.viewsCount,
    likesCount: dynamicArticle.likesCount || likes,
    content: dynamicArticle.content.split('\n').map(p => p.trim()).filter(Boolean)
  };

  // Highlights list (from DB bulletPoints or dynamic content lines)
  const highlightsList: string[] = (() => {
    if (dynamicArticle?.bulletPoints) {
      try {
        const parsed = JSON.parse(dynamicArticle.bulletPoints);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        const lines = dynamicArticle.bulletPoints.split('\n').map(l => l.replace(/^[•\-\*]\s*/, '').trim()).filter(Boolean);
        if (lines.length > 0) return lines;
      }
    }
    const points: string[] = [];
    if (article.summary) points.push(article.summary);
    if (article.content[0]) {
      const sentence = article.content[0].split('. ')[0];
      if (sentence && sentence !== article.summary) points.push(sentence.endsWith('.') ? sentence : `${sentence}.`);
    }
    if (article.content[1]) {
      const sentence = article.content[1].split('. ')[0];
      if (sentence) points.push(sentence.endsWith('.') ? sentence : `${sentence}.`);
    } else {
      points.push('Digital report curated by the editorial bureau covering unfolding updates.');
    }
    return points.slice(0, 3);
  })();

  return (
    <main className="min-h-screen flex flex-col bg-brand-paper dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Schema.org NewsArticle Structured Data for Google News SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            'headline': article.title,
            'description': article.summary,
            'image': [article.imageUrl],
            'datePublished': dynamicArticle?.publishedAt || dynamicArticle?.createdAt,
            'dateModified': dynamicArticle?.updatedAt || dynamicArticle?.publishedAt,
            'author': [{
              '@type': 'Person',
              'name': article.author.name
            }],
            'publisher': {
              '@type': 'NewsMediaOrganization',
              'name': 'The Daily Jagran',
              'url': 'http://localhost:3000'
            },
            'mainEntityOfPage': {
              '@type': 'WebPage',
              '@id': typeof window !== 'undefined' ? window.location.href : `http://localhost:3000/article/${articleId}`
            }
          })
        }}
      />
      {/* Schema.org BreadcrumbList for Rich Snippets */}
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
                'name': article.category,
                'item': `http://localhost:3000/${article.category.toLowerCase()}`
              },
              {
                '@type': 'ListItem',
                'position': 3,
                'name': article.title,
                'item': typeof window !== 'undefined' ? window.location.href : `http://localhost:3000/article/${articleId}`
              }
            ]
          })
        }}
      />

      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="all"
        onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : (slug === 'videos' ? '/videos' : `/${slug}`))}
      />

      {/* Main Article Container */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-10 pt-4 pb-12 flex-1 space-y-4">
        
        {/* Back Button & Breadcrumbs */}
        <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-1 font-bold text-jagran-red hover:underline"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Back to Homepage</span>
          </button>
          
          <div className="flex items-center space-x-2 font-medium">
            <span>Home</span>
            <span>/</span>
            <span className="uppercase text-jagran-red font-bold">{article.category}</span>
            <span>/</span>
            <span className="text-slate-400 uppercase">NEWS</span>
          </div>
        </div>

        {/* 2-COLUMN MACRO GRID: LEFT 9 COLS | RIGHT 3 COLS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT 9 COLUMNS: ARTICLE HEADER, HERO IMAGE & INNER SPLIT */}
          <div className="lg:col-span-9 space-y-5">
            
            {/* Article Top Headline Header */}
            <header className="space-y-3">
              <div className="flex items-center space-x-2">
                <span className="bg-jagran-red text-white text-[11px] font-black px-2.5 py-0.5 rounded-sm uppercase tracking-wide">
                  {article.category}
                </span>
                <span className="text-xs text-slate-500 font-semibold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t(article.timeAgo)}</span>
                </span>
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                  • {article.readTime}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[34px] font-bold font-serif text-slate-900 dark:text-white leading-tight">
                {article.title}
              </h1>

              {/* Sub-headline / Summary Deck */}
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-serif italic leading-relaxed">
                {article.summary}
              </p>

              {/* Author Byline & Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    By <span className="text-jagran-red font-bold">{article.author.name}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {t(article.timeAgo)} • Source: Digital Bureau
                  </div>
                </div>

                {/* Share Button */}
                <div className="flex items-center">
                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-1.5 sm:p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-200 transition-all shadow-xs flex items-center justify-center group"
                    title="Share Article"
                  >
                    <Share2 className="w-4 h-4 group-hover:text-jagran-red transition-colors" />
                  </button>
                </div>
              </div>
            </header>

            {/* Featured Hero Image & Caption */}
            {article.imageUrl && (
              <figure className="space-y-1.5">
                <div className="w-full aspect-[16/9] overflow-hidden bg-slate-900 rounded-none sm:rounded-sm">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover" />
                </div>
                <figcaption className="text-xs text-slate-500 dark:text-slate-400 italic">
                  {article.imageCaption || `${article.title} (Bureau)`}
                </figcaption>
              </figure>
            )}

            {/* UNDER IMAGE: SPLIT INTO LEFT (RELATED ARTICLES) AND CENTER (CONTENT) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start pt-2">
              
              {/* INNER LEFT: RELATED ARTICLES */}
              {dynamicRelated.length > 0 && (
                <aside className="md:col-span-3 space-y-3">
                  <div className="border-b border-slate-200 dark:border-slate-800 pb-1.5">
                    <h3 className="text-xs font-bold text-jagran-red uppercase tracking-wider">
                      RELATED ARTICLES
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dynamicRelated.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => router.push(`/article/${rel.id}`)}
                        className="py-3 first:pt-0 last:pb-0 cursor-pointer group"
                      >
                        <h4 className="text-xs sm:text-[13px] font-bold font-serif text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors leading-snug">
                          {rel.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                </aside>
              )}

              {/* INNER CENTER: HIGHLIGHTS BOX & ARTICLE BODY */}
              <div className={`${dynamicRelated.length > 0 ? 'md:col-span-9' : 'md:col-span-12'} space-y-5`}>
                
                {/* HIGHLIGHTS Box */}
                {highlightsList.length > 0 && (
                  <div className="border-l-4 border-jagran-red bg-amber-50/60 dark:bg-slate-800/60 p-4 sm:p-5 rounded-r-lg space-y-2.5">
                    <div className="text-xs font-black uppercase text-jagran-red tracking-wider flex items-center space-x-1.5">
                      <span>HIGHLIGHTS</span>
                    </div>
                    <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                      {highlightsList.map((point, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-jagran-red shrink-0 mt-1.5" />
                          <span className="leading-relaxed">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Article Body Content */}
                <article className="space-y-4 text-base sm:text-lg leading-relaxed text-slate-800 dark:text-slate-200 font-serif">
                  {article.content.map((paragraph, index) => (
                    <p key={index} className="leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </article>

                {/* Dynamic Tags Pills */}
                {dynamicArticle?.tags && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    {dynamicArticle.tags.split(',').map((tag, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                      >
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>
                )}

              </div>

            </div>

          </div>

          {/* RIGHT 3 COLUMNS: TOP NEWS + LATEST VIDEOS */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 self-start space-y-5">
            
            {/* Dynamic TOP NEWS with 1 to 5 Red Numbers */}
            {sidebarTopNews.length > 0 && (
              <div className="space-y-3">
                <div className="border-b border-slate-200 dark:border-slate-800 pb-2">
                  <h3 className="text-xs font-bold text-jagran-red uppercase tracking-wider">
                    TOP NEWS
                  </h3>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sidebarTopNews.map((item, idx) => (
                    <article
                      key={item.id}
                      onClick={() => router.push(`/article/${item.id}`)}
                      className="py-2.5 first:pt-0 last:pb-0 flex items-start space-x-2.5 cursor-pointer group"
                    >
                      <span className="text-jagran-red font-serif font-black text-lg sm:text-xl w-4 shrink-0 leading-tight">
                        {idx + 1}
                      </span>
                      <h4 className="text-xs sm:text-[13px] font-bold font-serif text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors leading-snug">
                        {item.title}
                      </h4>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* LATEST VIDEOS: Max 4 Videos in 2x2 Grid */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center space-x-1.5 border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-jagran-red uppercase tracking-wider">
                  LATEST VIDEOS
                </h3>
                <span className="text-sm">📹</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {mockLatestVideos.slice(0, 4).map((vid) => (
                  <div
                    key={vid.id}
                    onClick={() => router.push('/videos')}
                    className="group cursor-pointer space-y-1.5"
                  >
                    <div className="aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden relative shadow-xs">
                      <img
                        src={vid.imageUrl}
                        alt={t(vid.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#d61e24] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                          <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                        </div>
                      </div>
                    </div>
                    <h5 className="text-xs font-bold font-serif text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors leading-snug">
                      {t(vid.title)}
                    </h5>
                  </div>
                ))}
              </div>
            </div>

          </aside>

        </div>
      </div>

      {/* Search Overlay */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Share Article Modal Overlay */}
      {isShareModalOpen && (
        <div 
          onClick={() => setIsShareModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-red-50 dark:bg-red-950/50 flex items-center justify-center text-jagran-red">
                  <Share2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white font-serif">
                  Share this Article
                </h3>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Article Mini Preview */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-black uppercase text-jagran-red tracking-wider">
                {article.category}
              </span>
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-snug">
                {article.title}
              </h4>
            </div>

            {/* Social Share Buttons Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - ' + (typeof window !== 'undefined' ? window.location.href : ''))}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800/40 hover:bg-emerald-100 dark:hover:bg-emerald-950/50 transition-colors font-semibold text-xs"
              >
                <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.974.531 1.874.814 2.791.814 3.18 0 5.767-2.587 5.768-5.766 0-3.18-2.587-5.766-5.768-5.766zm9.969 5.766c0 5.518-4.482 10-10 10-1.748 0-3.385-.451-4.819-1.242l-5.181 1.358 1.385-5.056c-.886-1.488-1.385-3.228-1.385-5.06 0-5.518 4.482-10 10-10 5.518 0 10 4.482 10 10z"/>
                </svg>
                <span>WhatsApp</span>
              </a>

              {/* X / Twitter */}
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-semibold text-xs"
              >
                <svg className="w-4 h-4 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span>X (Twitter)</span>
              </a>

              {/* Facebook */}
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/40 hover:bg-blue-100 dark:hover:bg-blue-950/50 transition-colors font-semibold text-xs"
              >
                <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.595 0 9 1.582 9 4.615V8z"/>
                </svg>
                <span>Facebook</span>
              </a>

              {/* Telegram */}
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(article.title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2.5 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-700 dark:text-sky-400 border border-sky-200/80 dark:border-sky-800/40 hover:bg-sky-100 dark:hover:bg-sky-950/50 transition-colors font-semibold text-xs"
              >
                <svg className="w-5 h-5 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18.894-1.289 5.86-1.848 8.441-.237 1.091-.689 1.455-1.127 1.491-.951.087-1.67-.629-2.592-1.233-1.442-.946-2.257-1.534-3.655-2.456-1.616-1.065-.568-1.65.353-2.607.241-.25 4.433-4.062 4.514-4.407.01-.044.02-.209-.079-.297-.099-.088-.243-.058-.348-.035-.148.034-2.51 1.597-7.086 4.686-.67.46-1.278.685-1.821.673-.6-.013-1.753-.339-2.612-.619-1.053-.342-1.889-.523-1.816-1.104.038-.303.456-.613 1.254-.932 4.908-2.138 8.182-3.548 9.823-4.23 4.67-1.944 5.642-2.283 6.273-2.294.139-.002.449.033.65.197.17.139.217.327.24.459.022.132.051.428.028.665z"/>
                </svg>
                <span>Telegram</span>
              </a>

            </div>

            {/* Copy Link Input Bar */}
            <div className="pt-2">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                Or copy article link
              </label>
              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-1.5 pl-3 rounded-xl border border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? window.location.href : ''}
                  className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-300 outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                    copied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-jagran-red text-white hover:bg-red-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

    </main>
  );
}
