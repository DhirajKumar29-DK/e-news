'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { mockOpinionArticles } from '@/data/mockNewsData';
import { Quote } from 'lucide-react';

export const OpinionSection: React.FC = () => {
  const { language, t } = useLanguage();

  return (
    <section className="py-8 px-4 sm:px-8 lg:px-10 max-w-[1440px] mx-auto">
      <div className="bg-amber-50/50 dark:bg-slate-900/60 rounded-xl p-6 border border-amber-200/60 dark:border-slate-800 space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-3 border-b border-amber-200/80 dark:border-slate-800 pb-4">
          <div className="p-2 bg-amber-600 text-white rounded shadow">
            <Quote className="w-5 h-5 fill-white" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
              Editorial & Perspectives
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              In-depth analysis from leading columnists and subject matter experts
            </p>
          </div>
        </div>

        {/* Columns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {mockOpinionArticles.map((op) => (
            <article
              key={op.id}
              className="bg-white dark:bg-brand-dark-card rounded-lg p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300 px-2.5 py-0.5 rounded">
                  {op.category}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white hover:text-brand-red dark:hover:text-red-400 transition-colors">
                  <a href="#">{t(op.title)}</a>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic font-serif">
                  "{t(op.summary)}"
                </p>
              </div>

              {/* Author Info Footer */}
              {op.author && (
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={op.author.avatar}
                      alt={t(op.author.name)}
                      className="w-10 h-10 rounded-full object-cover border border-amber-400"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {t(op.author.name)}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {t(op.author.role)}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {t(op.readTime)}
                  </span>
                </div>
              )}
            </article>
          ))}
        </div>

      </div>
    </section>
  );
};
