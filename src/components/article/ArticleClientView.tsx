'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { videoService, VideoData } from '@/services/videoService';
import { isRegularVideo } from '@/utils/videoUtils';
import { useLanguage } from '@/context/LanguageContext';
import { Header, Footer, SearchModal, AdSlot } from '@/components/common';
import { ArrowLeft, Clock, Share2, Tag, Check, Play, Copy, X } from 'lucide-react';
import { articleService, ArticleData } from '@/services/articleService';
import { formatTimeAgo } from '@/utils/timeAgo';
import { stripHtml, hasHtmlTags, formatArticleHtml } from '@/utils/textUtils';
import { SITE_URL } from '@/config/env';
import { getArticleCanonicalUrl } from '@/utils/seoUtils';
import Script from 'next/script';

interface ArticleClientViewProps {
  initialArticle?: ArticleData | null;
}

export default function ArticleClientView({ initialArticle }: ArticleClientViewProps) {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  
  const articleId = typeof params?.id === 'string' ? params.id : '';

  const [isLoadingArticle, setIsLoadingArticle] = useState(!initialArticle);
  const [dynamicArticle, setDynamicArticle] = useState<ArticleData | null>(initialArticle || null);
  const [dynamicRelated, setDynamicRelated] = useState<any[]>([]);
  const [sidebarTopNews, setSidebarTopNews] = useState<any[]>([]);
  const [latestVideos, setLatestVideos] = useState<VideoData[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !dynamicArticle) return;

    const renderTwitter = () => {
      const twttr = (window as any).twttr;
      if (!twttr || !twttr.widgets) {
        if (!document.getElementById('twitter-wjs')) {
          const script = document.createElement('script');
          script.id = 'twitter-wjs';
          script.src = 'https://platform.twitter.com/widgets.js';
          script.async = true;
          script.onload = () => {
            renderTwitter();
          };
          document.body.appendChild(script);
        }
        return;
      }

      // 1. Call native widgets.load()
      try {
        twttr.widgets.load();
      } catch (e) {
        console.error('Error loading twitter widgets:', e);
      }

      // 2. Fallback to createTweet for SPA reliability
      const tweetBlocks = document.querySelectorAll('blockquote.twitter-tweet');
      tweetBlocks.forEach((block) => {
        const parentContainer = block.closest('.twitter-tweet-container') || block;
        if (parentContainer.querySelector('iframe') || (parentContainer as HTMLElement).dataset.rendered === 'true') {
          return;
        }

        const link = block.querySelector('a');
        const href = link?.getAttribute('href') || block.textContent || '';
        const match = href.match(/status(?:es)?\/(\d+)/i);
        if (match && match[1]) {
          const tweetId = match[1];
          (parentContainer as HTMLElement).dataset.rendered = 'true';

          const mountPoint = document.createElement('div');
          mountPoint.className = 'w-full flex justify-center my-4';
          parentContainer.parentNode?.insertBefore(mountPoint, parentContainer);
          (parentContainer as HTMLElement).style.display = 'none';

          twttr.widgets.createTweet(tweetId, mountPoint, {
            theme: 'light',
            align: 'center',
            dnt: true
          }).then((el: any) => {
            if (!el) {
              (parentContainer as HTMLElement).style.display = '';
              mountPoint.remove();
            }
          }).catch(() => {
            (parentContainer as HTMLElement).style.display = '';
            mountPoint.remove();
          });
        }
      });
    };

    const t1 = setTimeout(renderTwitter, 100);
    const t2 = setTimeout(renderTwitter, 600);
    const t3 = setTimeout(renderTwitter, 1500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [dynamicArticle]);

  useEffect(() => {
    // If we already have initialArticle, only fetch related and sidebar content
    if (initialArticle && !dynamicArticle) {
      setDynamicArticle(initialArticle);
      setIsLoadingArticle(false);
    }

    if (!dynamicArticle && articleId) {
      setIsLoadingArticle(true);
      articleService.getArticleByIdOrSlug(articleId)
        .then(data => {
          if (data) {
            setDynamicArticle(data);
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
    }

    const currentArt = dynamicArticle || initialArticle;
    if (currentArt) {
      const cat = currentArt.category ? currentArt.category.toLowerCase() : undefined;
      // Fetch real related articles from DB
      articleService.getArticles({ category: cat, limit: 6 })
        .then(res => {
          if (res && res.articles) {
            const filtered = res.articles
              .filter(a => a.id !== currentArt.id && a.slug !== currentArt.slug)
              .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
              .slice(0, 3)
              .map(a => ({
                id: a.slug || a.id,
                title: a.title,
                category: a.category,
                imageUrl: a.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600',
                publishedAt: a.publishedAt
              }));
            setDynamicRelated(filtered);
          }
        })
        .catch(() => {});
    }

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

    // Fetch dynamic latest videos for sidebar (strictly regular news videos, exclude shorts)
    videoService.getVideos({ limit: 12, status: 'PUBLISHED', sortBy: 'publishedAt', sortOrder: 'desc' })
      .then(res => {
        if (res && res.videos && res.videos.length > 0) {
          const regularOnly = res.videos.filter(isRegularVideo);
          setLatestVideos(regularOnly.slice(0, 4));
        }
      })
      .catch(() => {});
  }, [articleId, initialArticle]);

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

  const [copiedCitation, setCopiedCitation] = useState(false);

  const activeArticle = dynamicArticle || initialArticle;
  const canonicalUrl = activeArticle ? getArticleCanonicalUrl(activeArticle) : `${SITE_URL}/article/${articleId}`;

  const handleCopyCitation = () => {
    const title = activeArticle ? stripHtml(activeArticle.title) : 'Article';
    const citationText = `Source: Vartiq News (${SITE_URL}) - "${title}" [Full Report: ${canonicalUrl}]`;
    navigator.clipboard.writeText(citationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(canonicalUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Full-page Loading Skeleton (Only if no initialArticle provided)
  if (isLoadingArticle && !activeArticle) {
    return (
      <main className="min-h-screen flex flex-col bg-brand-paper dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          activeCategory="all"
          onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : (slug === 'videos' ? '/videos' : `/${slug}`))}
        />

        <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-10 pt-4 pb-12 flex-1 space-y-6 animate-pulse">
          <h1 className="sr-only">Article Details - Vartiq</h1>
          {/* Breadcrumb Skeleton */}
          <div className="hidden md:flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
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
  if (!activeArticle) {
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

  // Pure Dynamic Article Representation
  const cleanSummary = stripHtml(activeArticle.subHeadline) || stripHtml(activeArticle.content.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, '').replace(/<div class="twitter-tweet-container"[\s\S]*?<\/div>/gi, '')).slice(0, 180) + '...';

  const article = {
    id: activeArticle.slug || activeArticle.id,
    title: stripHtml(activeArticle.title),
    summary: cleanSummary,
    category: (activeArticle.category || 'NEWS').toUpperCase(),
    imageUrl: activeArticle.featuredImage || '',
    imageCaption: stripHtml(activeArticle.imageCaption || ''),
    author: {
      name: stripHtml(activeArticle.authorName || 'News Desk'),
      role: 'Bureau Correspondent',
      avatar: activeArticle.authorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    },
    timeAgo: formatTimeAgo(activeArticle.publishedAt || activeArticle.createdAt),
    readTime: `${activeArticle.readTimeMinutes || 3} min read`,
    viewsCount: activeArticle.viewsCount,
    likesCount: activeArticle.likesCount || likes,
    rawContent: activeArticle.content
  };

  // Highlights list
  const highlightsList: string[] = (() => {
    if (activeArticle?.bulletPoints) {
      try {
        const parsed = JSON.parse(activeArticle.bulletPoints);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(p => stripHtml(String(p))).filter(Boolean);
        }
      } catch {
        const lines = activeArticle.bulletPoints
          .split('\n')
          .map(l => stripHtml(l.replace(/^[•\-\*]\s*/, '')))
          .filter(Boolean);
        if (lines.length > 0) return lines;
      }
    }
    const cleanFullContent = stripHtml(activeArticle.content.replace(/<blockquote[\s\S]*?<\/blockquote>/gi, '').replace(/<div class="twitter-tweet-container"[\s\S]*?<\/div>/gi, ''));
    const points: string[] = [];
    if (cleanSummary && cleanSummary !== '...') {
      points.push(cleanSummary.replace(/\.\.\.$/, ''));
    }
    
    const sentences = cleanFullContent
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 25 && s !== cleanSummary && !s.includes('Loading X Post') && !s.includes('twitter.com') && !s.includes('x.com'));

    for (const sent of sentences) {
      if (points.length >= 3) break;
      const formatted = sent.endsWith('.') ? sent : `${sent}.`;
      if (!points.includes(formatted)) {
        points.push(formatted);
      }
    }

    if (points.length === 0) {
      points.push('Digital report curated by the editorial bureau covering unfolding updates.');
    }
    return points.slice(0, 3);
  })();

  return (
    <main className="min-h-screen flex flex-col bg-brand-paper dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="all"
        onSelectCategory={(slug) => router.push(slug === 'all' ? '/' : (slug === 'videos' ? '/videos' : `/${slug}`))}
      />

      {/* Main Article Container */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-10 pt-4 pb-12 flex-1 space-y-4">
        
        {/* Back Button & Breadcrumbs */}
        <div className="hidden md:flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => router.push('/')}
            className="flex items-center space-x-1 font-bold text-jagran-red hover:underline cursor-pointer"
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
              {article.summary && (
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 font-serif italic leading-relaxed">
                  {article.summary}
                </p>
              )}

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

                {/* Action Buttons: Like, Cite & Share */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleLike}
                    className={`px-2.5 py-1.5 border rounded-md transition-all shadow-xs flex items-center space-x-1.5 text-xs font-semibold cursor-pointer ${
                      hasLiked
                        ? 'border-red-300 bg-red-50 text-jagran-red dark:bg-red-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                    }`}
                    title="Like this story"
                  >
                    <span>❤️</span>
                    <span className="text-[11px] font-bold">{likes}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyCitation}
                    className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-200 transition-all shadow-xs flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
                    title="Copy story citation and link"
                  >
                    {copiedCitation ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-600 font-bold text-[11px]">Citation Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-[11px]">Cite Story</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsShareModalOpen(true)}
                    className="p-1.5 sm:p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-md text-slate-700 dark:text-slate-200 transition-all shadow-xs flex items-center justify-center group cursor-pointer"
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
                  <img
                    src={article.imageUrl}
                    alt={article.title}
                    onError={(e) => {
                      const fig = (e.target as HTMLElement).closest('figure');
                      if (fig) fig.style.display = 'none';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
                <figcaption className="text-xs text-slate-500 dark:text-slate-400 italic break-words">
                  {article.imageCaption || `${article.title} (Bureau)`}
                </figcaption>
              </figure>
            )}

            {/* UNDER IMAGE: SPLIT INTO LEFT (RELATED ARTICLES) AND CENTER (CONTENT) */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start pt-3">
              
              {/* INNER LEFT: RELATED ARTICLES */}
              {dynamicRelated.length > 0 && (
                <aside className="md:col-span-3 space-y-4 order-2 md:order-1 border-t md:border-t-0 md:border-r border-slate-200 dark:border-slate-800 pt-6 md:pt-0 md:pr-6 lg:md:pr-8 md:sticky md:top-24 self-start">
                  <div className="border-b-2 border-jagran-red pb-1.5 flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-jagran-red" />
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      RELATED ARTICLES
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {dynamicRelated.map((rel) => (
                      <Link
                        key={rel.id}
                        href={`/article/${rel.id}`}
                        className="block py-3.5 first:pt-1 last:pb-1 group space-y-1.5 cursor-pointer"
                      >
                        <h4 className="text-xs sm:text-[13px] font-bold font-serif text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors leading-snug line-clamp-3">
                          {rel.title}
                        </h4>
                        {rel.publishedAt && (
                          <div className="flex items-center text-[10px] text-slate-400 font-medium pt-0.5">
                            <Clock className="w-2.5 h-2.5 mr-1 text-slate-400" />
                            <span>{t(formatTimeAgo(rel.publishedAt))}</span>
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </aside>
              )}

              {/* INNER RIGHT: HIGHLIGHTS BOX & ARTICLE BODY */}
              <div className={`${dynamicRelated.length > 0 ? 'md:col-span-9' : 'md:col-span-12'} space-y-5 order-1 md:order-2`}>
                
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
                  {hasHtmlTags(article.rawContent) ? (() => {
                    const formatted = formatArticleHtml(article.rawContent);
                    const firstP = formatted.toLowerCase().indexOf('</p>');
                    const secondP = firstP !== -1 ? formatted.toLowerCase().indexOf('</p>', firstP + 4) : -1;
                    if (secondP !== -1) {
                      const splitIndex = secondP + 4;
                      const firstChunk = formatted.slice(0, splitIndex);
                      const secondChunk = formatted.slice(splitIndex);

                      return (
                        <>
                          <div
                            className="article-body max-w-none space-y-4 leading-relaxed [&>p]:mb-4 [&>p]:leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:font-serif [&>h2]:text-slate-900 dark:[&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:font-serif [&>h3]:text-slate-900 dark:[&>h3]:text-white [&>h3]:mt-5 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:space-y-1.5 [&>blockquote:not(.twitter-tweet)]:border-l-4 [&>blockquote:not(.twitter-tweet)]:border-jagran-red [&>blockquote:not(.twitter-tweet)]:pl-4 [&>blockquote:not(.twitter-tweet)]:italic [&>blockquote:not(.twitter-tweet)]:text-slate-600 dark:[&>blockquote:not(.twitter-tweet)]:text-slate-400 [&_.twitter-tweet-container]:flex [&_.twitter-tweet-container]:justify-center [&_.twitter-tweet-container]:my-6 [&>img]:rounded-xl [&>img]:my-4 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium hover:[&_a]:text-blue-800 dark:hover:[&_a]:text-blue-300"
                            dangerouslySetInnerHTML={{ __html: firstChunk }}
                          />
                          <AdSlot slot="ARTICLE_INLINE" />
                          <div
                            className="article-body max-w-none space-y-4 leading-relaxed [&>p]:mb-4 [&>p]:leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:font-serif [&>h2]:text-slate-900 dark:[&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:font-serif [&>h3]:text-slate-900 dark:[&>h3]:text-white [&>h3]:mt-5 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:space-y-1.5 [&>blockquote:not(.twitter-tweet)]:border-l-4 [&>blockquote:not(.twitter-tweet)]:border-jagran-red [&>blockquote:not(.twitter-tweet)]:pl-4 [&>blockquote:not(.twitter-tweet)]:italic [&>blockquote:not(.twitter-tweet)]:text-slate-600 dark:[&>blockquote:not(.twitter-tweet)]:text-slate-400 [&_.twitter-tweet-container]:flex [&_.twitter-tweet-container]:justify-center [&_.twitter-tweet-container]:my-6 [&>img]:rounded-xl [&>img]:my-4 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium hover:[&_a]:text-blue-800 dark:hover:[&_a]:text-blue-300"
                            dangerouslySetInnerHTML={{ __html: secondChunk }}
                          />
                        </>
                      );
                    }

                    return (
                      <>
                        <div
                          className="article-body max-w-none space-y-4 leading-relaxed [&>p]:mb-4 [&>p]:leading-relaxed [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:font-serif [&>h2]:text-slate-900 dark:[&>h2]:text-white [&>h2]:mt-6 [&>h2]:mb-3 [&>h3]:text-xl [&>h3]:font-bold [&>h3]:font-serif [&>h3]:text-slate-900 dark:[&>h3]:text-white [&>h3]:mt-5 [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:ml-6 [&>ul]:space-y-1.5 [&>ol]:list-decimal [&>ol]:ml-6 [&>ol]:space-y-1.5 [&>blockquote:not(.twitter-tweet)]:border-l-4 [&>blockquote:not(.twitter-tweet)]:border-jagran-red [&>blockquote:not(.twitter-tweet)]:pl-4 [&>blockquote:not(.twitter-tweet)]:italic [&>blockquote:not(.twitter-tweet)]:text-slate-600 dark:[&>blockquote:not(.twitter-tweet)]:text-slate-400 [&_.twitter-tweet-container]:flex [&_.twitter-tweet-container]:justify-center [&_.twitter-tweet-container]:my-6 [&>img]:rounded-xl [&>img]:my-4 [&_a]:text-blue-600 dark:[&_a]:text-blue-400 [&_a]:underline [&_a]:underline-offset-2 [&_a]:font-medium hover:[&_a]:text-blue-800 dark:hover:[&_a]:text-blue-300"
                          dangerouslySetInnerHTML={{ __html: formatted }}
                        />
                        <AdSlot slot="ARTICLE_INLINE" />
                      </>
                    );
                  })() : (() => {
                    const paragraphs = article.rawContent.split(/\n\s*\n|\n/).map(p => p.trim()).filter(Boolean);
                    return (
                      <>
                        {paragraphs.map((paragraph, index) => (
                          <React.Fragment key={index}>
                            <p className="leading-relaxed">{paragraph}</p>
                            {index === 1 && <AdSlot slot="ARTICLE_INLINE" />}
                          </React.Fragment>
                        ))}
                        {paragraphs.length < 2 && <AdSlot slot="ARTICLE_INLINE" />}
                      </>
                    );
                  })()}
                </article>

                {/* Dynamic Tags Pills */}
                {activeArticle?.tags && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    {activeArticle.tags.split(',').map((tag, i) => (
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

            {/* Dynamic TOP NEWS */}
            {sidebarTopNews.length > 0 && (
              <div className="hidden lg:block space-y-3">
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

            {/* Advertisement Slot Above Latest Videos */}
            <AdSlot slot="ARTICLE_LATEST_VIDEOS" />

            {/* LATEST VIDEOS */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <button
                  onClick={() => router.push('/videos')}
                  className="text-xs font-bold text-jagran-red uppercase tracking-wider flex items-center space-x-1.5 hover:underline cursor-pointer"
                >
                  <span>LATEST VIDEOS</span>
                  <span className="text-sm">📹</span>
                </button>
                <button
                  onClick={() => router.push('/videos')}
                  className="text-[11px] font-bold text-slate-500 hover:text-jagran-red uppercase tracking-tight cursor-pointer"
                >
                  View All
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                {latestVideos.map((vid) => {
                  const thumb = vid.thumbnailUrl || (vid.youtubeId ? `https://img.youtube.com/vi/${vid.youtubeId}/mqdefault.jpg` : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400');
                  return (
                    <div
                      key={vid.id}
                      onClick={() => router.push(`/videos?v=${encodeURIComponent(vid.slug || vid.id)}&play=1`)}
                      className="group cursor-pointer space-y-1.5"
                    >
                      <div className="aspect-[16/10] bg-slate-900 rounded-xl overflow-hidden relative shadow-xs">
                        <img
                          src={thumb}
                          alt={vid.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/25 flex items-center justify-center">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#d61e24] text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                            <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                          </div>
                        </div>
                      </div>
                      <h5 className="text-xs font-bold font-serif text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors leading-snug line-clamp-2">
                        {vid.title}
                      </h5>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Sidebar Advertisement Slot */}
            <AdSlot slot="ARTICLE_SIDEBAR" className="pt-2" />

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
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(article.title + ' - ' + canonicalUrl)}`}
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
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(article.title)}&url=${encodeURIComponent(canonicalUrl)}`}
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
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`}
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
                href={`https://t.me/share/url?url=${encodeURIComponent(canonicalUrl)}&text=${encodeURIComponent(article.title)}`}
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
                  value={canonicalUrl}
                  className="flex-1 bg-transparent text-xs text-slate-600 dark:text-slate-300 outline-none truncate"
                />
                <button
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer ${
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

      {/* Advertisement Slot Above Footer */}
      <AdSlot slot="ARTICLE_BOTTOM" className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10" />

      {/* Footer */}
      <Footer />

      {/* Twitter Widgets Script for Live Embedded Tweets */}
      <Script
        id="twitter-wjs-root"
        src="https://platform.twitter.com/widgets.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).twttr?.widgets) {
            (window as any).twttr.widgets.load();
          }
        }}
      />

    </main>
  );
}
