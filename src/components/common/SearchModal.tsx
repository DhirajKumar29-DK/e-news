'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { mockLeadStory, mockSubLeads, mockFastUpdates, mockTrendingNews } from '@/data/mockNewsData';
import { Search, X, ChevronRight, Tag } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const allArticles = [
    mockLeadStory,
    ...mockSubLeads,
    ...mockTrendingNews,
    ...mockFastUpdates.map(f => ({
      id: f.id,
      title: f.headline,
      summary: f.headline,
      category: f.category,
      imageUrl: '',
      publishedAt: '',
      timeAgo: { hi: f.timestamp, en: f.timestamp },
      readTime: { hi: '', en: '' }
    }))
  ];

  const filtered = query.trim() === ''
    ? []
    : allArticles.filter(art => {
        const titleText = t(art.title).toLowerCase();
        const catText = art.category.toLowerCase();
        const searchLower = query.toLowerCase();
        return titleText.includes(searchLower) || catText.includes(searchLower);
      });

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-start justify-center pt-16 px-4">
      <div className="bg-white dark:bg-brand-navy rounded-xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-3 bg-slate-50 dark:bg-slate-900">
          <Search className="w-5 h-5 text-brand-red shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search news (e.g. ISRO, Tech, Sports, Economy)..."
            className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 text-sm sm:text-base focus:outline-none"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tag Pills */}
        <div className="p-3 bg-slate-100 dark:bg-slate-950/60 border-b border-slate-200 dark:border-slate-800 flex items-center space-x-2 text-xs overflow-x-auto no-scrollbar">
          <span className="font-bold text-slate-500 shrink-0 flex items-center space-x-1">
            <Tag className="w-3 h-3 text-brand-red" />
            <span>Popular:</span>
          </span>
          {['ISRO', 'Tech', 'Cricket', 'Economy', 'G20'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 hover:border-brand-red dark:hover:border-red-400 transition-colors shrink-0"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Search Results Payload */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-3">
          {query.trim() === '' ? (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-8">
              Type a keyword above to search through instant news archives
            </p>
          ) : filtered.length === 0 ? (
            <p className="text-center text-xs text-slate-500 dark:text-slate-400 py-8">
              No news articles found matching your query
            </p>
          ) : (
            filtered.map((item) => (
              <a
                key={item.id}
                href="#"
                onClick={onClose}
                className="block p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700 group"
              >
                <div className="flex items-center space-x-2 text-[10px] font-bold uppercase text-brand-red mb-1">
                  <span>{item.category}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-red dark:group-hover:text-red-400 transition-colors">
                  {t(item.title)}
                </h4>
              </a>
            ))
          )}
        </div>

      </div>
    </div>
  );
};
