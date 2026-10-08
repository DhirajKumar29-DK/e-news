'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Tag } from 'lucide-react';
import { articleService, ArticleData } from '@/services/articleService';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ArticleData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      articleService.getArticles({ search: q, limit: 12 })
        .then(res => {
          if (res && res.articles) {
            setResults(res.articles);
          } else {
            setResults([]);
          }
        })
        .catch(() => setResults([]))
        .finally(() => setIsLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelectArticle = (art: ArticleData) => {
    onClose();
    router.push(`/article/${art.slug || art.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div className="bg-white dark:bg-brand-navy rounded-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3 bg-slate-50 dark:bg-slate-900">
          <Search className="w-5 h-5 text-jagran-red shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news (e.g. ISRO, Tech, Sports, Economy, Trump)..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tag Pills */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 text-xs overflow-x-auto no-scrollbar">
          <span className="font-bold text-slate-500 shrink-0 flex items-center space-x-1">
            <Tag className="w-3 h-3 text-jagran-red" />
            <span>Popular:</span>
          </span>
          {['National', 'World', 'Tech', 'Cricket', 'Business', 'Explainer'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:border-jagran-red dark:hover:border-red-400 transition-colors shrink-0 cursor-pointer"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results Payload */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
          {query.trim() === '' ? (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-8">
              Type a keyword above to search through instant news archives
            </p>
          ) : isLoading ? (
            <div className="py-8 space-y-3 animate-pulse">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
              <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
            </div>
          ) : results.length === 0 ? (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-8">
              No news articles found matching your query
            </p>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                onClick={() => handleSelectArticle(item)}
                className="p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group cursor-pointer"
              >
                <div className="flex items-center space-x-2 text-[10px] font-black uppercase text-jagran-red mb-1">
                  <span>{item.category}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-jagran-red dark:group-hover:text-red-400 transition-colors leading-snug">
                  {item.title}
                </h4>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
