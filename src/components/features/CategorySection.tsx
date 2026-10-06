'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { mockCategoryArticles } from '@/data/mockNewsData';
import { ArrowRight, Clock } from 'lucide-react';

interface CategorySectionProps {
  selectedCategorySlug: string;
}

export const CategorySection: React.FC<CategorySectionProps> = ({ selectedCategorySlug }) => {
  const { language, t } = useLanguage();
  const router = useRouter();

  const handleArticleClick = (id: string) => {
    router.push(`/article/${id}`);
  };

  const categoriesToShow = selectedCategorySlug === 'all'
    ? Object.keys(mockCategoryArticles)
    : [selectedCategorySlug].filter(slug => mockCategoryArticles[slug]);

  const categoryTitles: Record<string, { en: string }> = {
    national: { en: 'National News' },
    tech: { en: 'Tech & Science' },
    sports: { en: 'Sports Spotlight' },
    world: { en: 'World News' },
    entertainment: { en: 'Entertainment' }
  };

  return (
    <section className="py-8 px-4 sm:px-8 lg:px-10 max-w-[1440px] mx-auto space-y-12">
      {categoriesToShow.map((catKey) => {
        const articles = mockCategoryArticles[catKey] || [];
        if (articles.length === 0) return null;

        const mainCatArticle = articles[0];
        const sideCatArticles = articles.slice(1);

        return (
          <div key={catKey} className="border-t border-slate-200 dark:border-slate-800 pt-6">
            
            {/* Category Section Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <span className="w-2.5 h-6 bg-brand-red rounded-full"></span>
                <h2 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white">
                  {t(categoryTitles[catKey] || { en: catKey })}
                </h2>
              </div>
              <a
                href="#"
                className="text-xs sm:text-sm font-semibold text-brand-red dark:text-red-400 hover:underline flex items-center space-x-1"
              >
                <span>View All</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Asymmetrical Grid: 1 Primary Card + Supporting List */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              
              {/* Primary Card (7 Cols) */}
              <article
                onClick={() => handleArticleClick(mainCatArticle.id)}
                className="lg:col-span-7 bg-white dark:bg-brand-dark-card rounded-lg border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col group cursor-pointer"
              >
                <div className="aspect-[16/9] bg-slate-100 overflow-hidden relative">
                  <img
                    src={mainCatArticle.imageUrl}
                    alt={t(mainCatArticle.title)}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-brand-navy text-white text-xs font-bold px-2.5 py-1 rounded shadow">
                    {mainCatArticle.category}
                  </span>
                </div>
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-red dark:group-hover:text-red-400 transition-colors">
                      {t(mainCatArticle.title)}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                      {t(mainCatArticle.summary)}
                    </p>
                  </div>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{t(mainCatArticle.timeAgo)}</span>
                    </span>
                    <span>{t(mainCatArticle.readTime)}</span>
                  </div>
                </div>
              </article>

              {/* Supporting Secondary Cards (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                {sideCatArticles.map((art) => (
                  <article
                    key={art.id}
                    onClick={() => handleArticleClick(art.id)}
                    className="bg-white dark:bg-brand-dark-card rounded-lg border border-slate-200 dark:border-slate-800 p-4 shadow-sm flex space-x-4 items-center group cursor-pointer"
                  >
                    <div className="w-28 sm:w-32 aspect-square rounded overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={art.imageUrl}
                        alt={t(art.title)}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase text-brand-red block mb-1">
                        {art.category}
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-red dark:group-hover:text-red-400 transition-colors line-clamp-2">
                        {t(art.title)}
                      </h4>
                      <div className="mt-2 text-[11px] text-slate-500 flex items-center space-x-2">
                        <span>{t(art.timeAgo)}</span>
                        <span>•</span>
                        <span>{t(art.readTime)}</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

            </div>

          </div>
        );
      })}
    </section>
  );
};
