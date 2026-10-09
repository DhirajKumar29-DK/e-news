'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { articleService, ArticleData } from '@/services/articleService';
import { Clock } from 'lucide-react';

export const WeatherNewsSection: React.FC = () => {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadNews() {
      try {
        // Try to fetch weather articles first
        let res = await articleService.getArticles({ search: 'weather', limit: 8, status: 'PUBLISHED' });
        let news = res?.articles || [];

        // If less than 4 articles found, fallback to latest articles
        if (news.length < 4) {
          const fallbackRes = await articleService.getArticles({ limit: 8, status: 'PUBLISHED' });
          news = fallbackRes?.articles || [];
        }

        if (mounted) {
          setArticles(news);
          setLoading(false);
        }
      } catch (err) {
        console.warn('Failed to load weather news:', err);
        if (mounted) setLoading(false);
      }
    }
    loadNews();
    return () => {
      mounted = false;
    };
  }, []);

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
      return `${Math.floor(diff / 86400)}d ago`;
    } catch {
      return '';
    }
  };

  const stripHtml = (html: string) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').trim();
  };

  if (!loading && articles.length === 0) {
    return null;
  }

  return (
    <section className="mt-12 mb-16">
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-gray-200">
        <div className="w-1.5 h-6 bg-red-600 rounded-full" />
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          Weather News
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-100 rounded-xl overflow-hidden h-64 border border-gray-200" />
            ))
          : articles.map((article) => {
              const link = `/article/${article.slug || article.id}`;
              const img =
                article.featuredImage ||
                'https://images.unsplash.com/photo-1592210454359-9043f067919b?w=600&auto=format&fit=crop&q=80';
              return (
                <Link
                  key={article.id}
                  href={link}
                  className="group bg-white rounded-xl border border-gray-200 hover:border-gray-300 overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 flex flex-col"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                    <img
                      src={img}
                      alt={stripHtml(article.title)}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded tracking-wider uppercase">
                      {article.category}
                    </span>
                  </div>

                  <div className="p-4 flex flex-col justify-between flex-1">
                    <h3 className="font-bold text-gray-900 group-hover:text-red-600 transition-colors line-clamp-2 text-sm leading-snug mb-2">
                      {stripHtml(article.title)}
                    </h3>

                    <div className="flex items-center text-xs text-gray-500 font-medium mt-auto pt-2 border-t border-gray-100">
                      <Clock size={13} className="mr-1 text-gray-400" />
                      <span>{formatTimeAgo(article.publishedAt || article.createdAt)}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
};
