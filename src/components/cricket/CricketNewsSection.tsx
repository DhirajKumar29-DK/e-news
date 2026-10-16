'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { articleService, ArticleData } from '@/services/articleService';
import { Newspaper, ChevronRight, Clock } from 'lucide-react';
import { formatTimeAgo } from '@/utils/timeAgo';

export const CricketNewsSection: React.FC = () => {
  const [articles, setArticles] = useState<ArticleData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    articleService.getArticles({ category: 'cricket', limit: 6 })
      .then((res) => {
        setArticles(res.articles || []);
      })
      .catch((err) => {
        console.error('Failed to load cricket articles:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (!loading && articles.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-xs dark:shadow-xl space-y-5 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-red-600" />
          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">Latest Cricket News & Match Reports</h2>
        </div>
        <Link href="/category/cricket" className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 flex items-center gap-1 font-semibold">
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((art) => (
          <Link
            key={art.id}
            href={`/article/${art.slug}`}
            className="group bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 hover:border-red-500/50 rounded-xl overflow-hidden transition-all duration-200 flex flex-col shadow-xs"
          >
            {art.featuredImage && (
              <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-950 relative">
                <img
                  src={art.featuredImage}
                  alt={art.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
            <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2">
              <h3 className="font-bold text-xs md:text-sm text-slate-900 dark:text-slate-100 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors line-clamp-2">
                {art.title}
              </h3>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <Clock className="w-3 h-3" />
                <span>{formatTimeAgo(art.createdAt).en}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
