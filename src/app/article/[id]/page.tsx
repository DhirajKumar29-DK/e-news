'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getArticleById, mockCategoryArticles, mockSubLeads } from '@/data/mockNewsData';
import { useLanguage } from '@/context/LanguageContext';
import { Header, Footer, SearchModal } from '@/components/common';
import { ArrowLeft, Clock, Share2, Bookmark, ThumbsUp, Eye, MessageSquare, Tag, Type, Check } from 'lucide-react';

export default function ArticlePage() {
  const params = useParams();
  const router = useRouter();
  const { language, t } = useLanguage();
  
  const articleId = typeof params?.id === 'string' ? params.id : 'lead-1';
  const article = getArticleById(articleId) || getArticleById('lead-1')!;

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [likes, setLikes] = useState(article.likesCount || 420);
  const [hasLiked, setHasLiked] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [copied, setCopied] = useState(false);

  // Compute related stories matching active article's category across all sections
  const activeCategoryLower = (article.category || '').toLowerCase();

  let categoryKey = activeCategoryLower;
  if (articleId.startsWith('exp') || ['explainer', 'explainers', 'analysis', 'editorial', 'opinion'].includes(activeCategoryLower)) {
    categoryKey = 'explainer';
  } else if (articleId.startsWith('ent') || ['entertainment', 'bollywood', 'hollywood', 'movies', 'ott', 'celebs', 'box office'].includes(activeCategoryLower)) {
    categoryKey = 'entertainment';
  } else if (articleId.startsWith('w-') || ['world', 'us politics', 'middle east', 'europe', 'asia pacific', 'geopolitics'].includes(activeCategoryLower)) {
    categoryKey = 'world';
  } else if (articleId.startsWith('tech') || ['tech', 'ai tech', 'smartphones', 'gadgets', 'cybersecurity', 'hardware', 'science'].includes(activeCategoryLower)) {
    categoryKey = 'tech';
  } else if (articleId.startsWith('cric') || ['sports', 'cricket', 'match report', 'ipl 2026', 'icc rankings', 'womens cricket', 'champions trophy'].includes(activeCategoryLower)) {
    categoryKey = 'sports';
  } else if (articleId.startsWith('biz') || ['business', 'stock market', 'ipo watch', 'real estate', 'banking', 'markets'].includes(activeCategoryLower)) {
    categoryKey = 'business';
  } else if (articleId.startsWith('edu') || ['education', 'exam updates', 'scholarships', 'board exams', 'higher ed', 'careers'].includes(activeCategoryLower)) {
    categoryKey = 'education';
  } else if (articleId.startsWith('life') || ['lifestyle', 'health', 'travel', 'fashion', 'wellness'].includes(activeCategoryLower)) {
    categoryKey = 'lifestyle';
  } else if (articleId.startsWith('auto') || ['auto', 'electric cars', 'new launch', 'bikes', 'safety'].includes(activeCategoryLower)) {
    categoryKey = 'auto';
  }

  const poolArticles = mockCategoryArticles[categoryKey] || mockCategoryArticles['national'] || [];
  
  const relatedStories = poolArticles.filter(item => item.id !== article.id).slice(0, 5);
  const displayRelated = relatedStories.length > 0 ? relatedStories : mockSubLeads;

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

  const fontClasses = {
    normal: 'text-base sm:text-lg leading-relaxed',
    large: 'text-lg sm:text-xl leading-relaxed',
    xlarge: 'text-xl sm:text-2xl leading-relaxed'
  };

  return (
    <main className="min-h-screen flex flex-col bg-brand-paper dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Top Header */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="all"
        onSelectCategory={() => router.push('/')}
      />

      {/* Main Article Container (2-Column Grid Layout) */}
      <div className="max-w-[1440px] w-full mx-auto px-4 sm:px-8 lg:px-10 pt-4 pb-12 flex-1 space-y-6">
        
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
          </div>
        </div>

        {/* 2-Column Main Layout: Left 8 Cols (Article) | Right 4 Cols (Related Top Stories) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: MAIN ARTICLE STORY CONTENT (8 Cols)          */}
          {/* ========================================================= */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Article Headline Header */}
            <header className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="bg-jagran-red text-white text-xs font-black px-3 py-1 rounded uppercase tracking-wide">
                  {article.category}
                </span>
                <span className="text-xs text-slate-500 font-semibold flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t(article.timeAgo)}</span>
                </span>
                <span className="text-xs text-slate-500 font-semibold hidden sm:inline">
                  • {t(article.readTime)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black font-serif text-slate-900 dark:text-white leading-tight">
                {t(article.title)}
              </h1>

              {/* Summary / Sub-heading */}
              <p className="text-base sm:text-xl font-medium text-slate-600 dark:text-slate-300 italic border-l-4 border-jagran-red pl-4 py-1">
                {t(article.summary)}
              </p>

              {/* Author & Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                {article.author ? (
                  <div className="flex items-center space-x-3">
                    <img
                      src={article.author.avatar}
                      alt={t(article.author.name)}
                      className="w-11 h-11 rounded-full object-cover border border-amber-400"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {t(article.author.name)}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {t(article.author.role)}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"
                      alt="Bureau"
                      className="w-11 h-11 rounded-full object-cover border border-amber-400"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        The Newspaper Bureau
                      </h4>
                      <p className="text-xs text-slate-500">
                        Special News Bureau
                      </p>
                    </div>
                  </div>
                )}

                {/* Font Adjuster & Controls */}
                <div className="flex items-center space-x-2 ml-auto">
                  <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-bold">
                    <Type className="w-3.5 h-3.5 text-slate-500 ml-1" />
                    <button
                      onClick={() => setFontSize('normal')}
                      className={`px-2 py-0.5 rounded ${fontSize === 'normal' ? 'bg-jagran-red text-white' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      A
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`px-2 py-0.5 rounded ${fontSize === 'large' ? 'bg-jagran-red text-white' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      A+
                    </button>
                  </div>

                  <button
                    onClick={handleCopyLink}
                    className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </header>

            {/* Main Hero Image */}
            {article.imageUrl && (
              <figure className="space-y-2">
                <div className="aspect-[16/9] rounded-xl overflow-hidden bg-slate-900">
                  <img src={article.imageUrl} alt={t(article.title)} className="w-full h-full object-cover" />
                </div>
                {article.imageCaption && (
                  <figcaption className="text-xs text-center text-slate-500 italic">
                    {t(article.imageCaption)}
                  </figcaption>
                )}
              </figure>
            )}

            {/* Body Content Paragraphs with Left Related Articles Sidebar (Matching Jagran Horoscope Layout) */}
            <div className={article.category === 'HOROSCOPE' ? "grid grid-cols-1 md:grid-cols-12 gap-8 items-start pt-2" : "space-y-6"}>
              
              {/* Horoscope Specific Inline Related Articles Left Sidebar */}
              {article.category === 'HOROSCOPE' && (
                <div className="md:col-span-4 bg-slate-50 dark:bg-slate-900/90 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3 shrink-0">
                  <h4 className="text-xs font-black text-jagran-red uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                    Related Articles
                  </h4>
                  <div className="space-y-3.5">
                    {displayRelated.map((rel) => (
                      <div
                        key={rel.id}
                        onClick={() => router.push(`/article/${rel.id}`)}
                        className="cursor-pointer group space-y-1 border-b border-slate-100 dark:border-slate-800/60 pb-2.5 last:border-0 last:pb-0"
                      >
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-jagran-red transition-colors line-clamp-2 leading-snug">
                          {t(rel.title)}
                        </h5>
                        <span className="text-[10px] text-slate-400 font-medium block">
                          {t(rel.timeAgo)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <article className={`space-y-6 text-slate-800 dark:text-slate-200 font-serif ${fontClasses[fontSize]} ${article.category === 'HOROSCOPE' ? 'md:col-span-8' : ''}`}>
                {article.content && article.content['en'] ? (
                  article.content['en'].map((para, idx) => {
                    const colonIndex = para.indexOf(':');
                    if (colonIndex > 0 && colonIndex < 45 && (para.toLowerCase().includes('horoscope') || para.toLowerCase().includes('today'))) {
                      const heading = para.substring(0, colonIndex + 1);
                      const body = para.substring(colonIndex + 1);
                      return (
                        <p key={idx} className="leading-relaxed">
                          <strong className="font-bold font-sans text-slate-900 dark:text-white block sm:inline mr-1 text-base sm:text-lg">
                            {heading}
                          </strong>
                          <span>{body}</span>
                        </p>
                      );
                    }
                    return (
                      <p key={idx} className="leading-relaxed">
                        {para}
                      </p>
                    );
                  })
                ) : (
                  <>
                    <p>{t(article.summary)}</p>
                    <p>
                      This special digital report was prepared by leading tech and economic correspondents. Continuous developments are unfolding and further official updates will be published.
                    </p>
                  </>
                )}
              </article>
            </div>

            {/* Reaction & Engagement Bar */}
            <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-bold text-xs transition-colors ${
                    hasLiked ? 'bg-jagran-red text-white' : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{likes} Likes</span>
                </button>

                <span className="text-xs text-slate-500 font-medium flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{article.viewsCount || 14200} Readers</span>
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-500">Share:</span>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors"
                >
                  {copied ? 'Copied!' : 'WhatsApp'}
                </button>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: RELATED TOP STORIES SIDEBAR (4 Cols)        */}
          {/* ========================================================= */}
          <div className="lg:col-span-4 lg:sticky lg:top-4 self-start space-y-4">
            <div className="bg-white dark:bg-brand-dark-card rounded-xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
              <div className="border-b-2 border-jagran-red pb-2 flex items-center justify-between">
                <h3 className="text-base font-black font-serif text-slate-900 dark:text-white uppercase tracking-wide">
                  Related Top Stories
                </h3>
              </div>

              <div className="space-y-4">
                {displayRelated.map((sub) => (
                  <article
                    key={sub.id}
                    onClick={() => router.push(`/article/${sub.id}`)}
                    className="p-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl border border-slate-200/80 dark:border-slate-800 cursor-pointer transition-all hover:border-jagran-red group flex space-x-3.5 items-center"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      <img src={sub.imageUrl} alt={t(sub.title)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <span className="text-[10px] font-black uppercase text-jagran-red block">{sub.category}</span>
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white group-hover:text-jagran-red transition-colors line-clamp-2 leading-snug">
                        {t(sub.title)}
                      </h4>
                      <span className="text-[10px] text-slate-400 block font-medium">{t(sub.timeAgo)}</span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Search Overlay */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Footer */}
      <Footer />

    </main>
  );
}
