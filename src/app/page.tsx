'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header, Footer, MobileBottomNav, SearchModal } from '@/components/common';
import {
  HeroSection,
  SplitSection,
  GridSection,
  ExplainerSection,
  HoroscopeSection,
  VideosDarkSection
} from '@/components/home';
import { articleService, HomeArticlesResponse, ArticleData } from '@/services/articleService';
import { formatTimeAgo } from '@/utils/timeAgo';
import { stripHtml } from '@/utils/textUtils';

export default function HomePage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [homeData, setHomeData] = useState<HomeArticlesResponse | null>(null);
  const [allArticlesMap, setAllArticlesMap] = useState<Record<string, ArticleData[]>>({});
  const [, setTick] = useState(0);

  useEffect(() => {
    // 1. Fetch both home aggregated data and all published articles
    Promise.all([
      articleService.getHomeArticles(),
      articleService.getArticles({ limit: 100 })
    ])
      .then(([hData, allData]) => {
        setHomeData(hData);

        const map: Record<string, ArticleData[]> = {};
        (allData?.articles || []).forEach(art => {
          const cat = (art.category || '').toLowerCase();
          if (!map[cat]) map[cat] = [];
          map[cat].push(art);
        });

        // Always sort each category by publishedAt descending so newest article is guaranteed to appear first
        Object.keys(map).forEach(cat => {
          map[cat].sort((a, b) => {
            const timeA = new Date(a.publishedAt || a.createdAt).getTime();
            const timeB = new Date(b.publishedAt || b.createdAt).getTime();
            return timeB - timeA;
          });
        });

        // Merge india and national so both keys have full access to Indian news
        if (map['india'] || map['national']) {
          const combined = [...(map['india'] || []), ...(map['national'] || [])].sort((a, b) => 
            new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
          );
          map['india'] = combined;
          map['national'] = combined;
        }

        setAllArticlesMap(map);
      })
      .catch(err => console.error('Failed to load home dynamic articles:', err));

    // Auto-update relative time stamps every 60 seconds (1 min ago -> 2 min ago -> 1 hour ago)
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') {
      setSelectedCategory('all');
    } else if (slug === 'videos') {
      router.push('/videos');
    } else {
      router.push(`/${slug}`);
    }
  };

  const getCategoryGridItems = (catKey: string) => {
    const list = allArticlesMap[catKey] || homeData?.categories?.[catKey];
    if (list && list.length > 0) {
      return list.slice(0, 4).map(a => ({
        id: a.slug || a.id,
        category: a.category.toUpperCase(),
        title: stripHtml(a.title),
        summary: stripHtml(a.subHeadline) || stripHtml(a.content).slice(0, 140) + '...',
        imageUrl: a.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600',
        timeAgo: formatTimeAgo(a.publishedAt || a.createdAt),
        readTime: `${a.readTimeMinutes || 3} min read`
      }));
    }
    return [];
  };

  const getCategorySplitItems = (catKey: string) => {
    const list = allArticlesMap[catKey] || homeData?.categories?.[catKey];
    if (list && list.length > 0) {
      const lead = list[0];
      // Take full 4 items for the right-hand 2x2 grid (1 lead + 4 grid cards = 5 cards total)
      const rest = list.slice(1, 5);
      return {
        lead: {
          id: lead.slug || lead.id,
          category: lead.category.toUpperCase(),
          title: stripHtml(lead.title),
          imageUrl: lead.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600',
          timeAgo: formatTimeAgo(lead.publishedAt || lead.createdAt)
        },
        grid: rest.map(r => ({
          id: r.slug || r.id,
          category: r.category.toUpperCase(),
          title: stripHtml(r.title),
          imageUrl: r.featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600',
          timeAgo: formatTimeAgo(r.publishedAt || r.createdAt)
        }))
      };
    }
    return { lead: null, grid: [] };
  };

  const entItems = getCategorySplitItems('entertainment');
  const eduItems = getCategorySplitItems('education');
  const cricketItems = getCategorySplitItems('cricket');
  const worldItems = getCategoryGridItems('world');
  const explainerItems = getCategoryGridItems('explainer');
  const lifestyleItems = getCategoryGridItems('lifestyle');
  const autoItems = getCategoryGridItems('auto');
  const techItems = getCategoryGridItems('tech');
  const businessItems = getCategoryGridItems('business');

  return (
    <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Accessible & SEO-Optimized Semantic H1 Heading */}
      <h1 className="sr-only">The Daily Jagran - Latest Breaking News, National & Global Updates</h1>

      {/* 1. Exact The Daily Jagran Header & Navigation */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Hero / Top News Section (3-Column Layout - Shows skeleton while loading, then real DB data) */}
      <HeroSection dynamicData={homeData} />

      {/* 3. ENTERTAINMENT Section (50/50 Split Layout) */}
      {entItems.lead && (
        <SplitSection
          title="ENTERTAINMENT"
          categorySlug="entertainment"
          leadItem={entItems.lead}
          gridItems={entItems.grid}
        />
      )}

      {/* 4. WORLD Section (4-Column Horizontal Grid) */}
      {worldItems.length > 0 && (
        <GridSection
          title="WORLD"
          categorySlug="world"
          items={worldItems}
        />
      )}

      {/* 5. EXPLAINER Section (Signature Red Striped Container + 4 Floating Cards) */}
      {explainerItems.length > 0 && (
        <ExplainerSection items={explainerItems} />
      )}

      {/* 6. CRICKET Section (50/50 Split Layout) */}
      {cricketItems.lead && (
        <SplitSection
          title="CRICKET"
          categorySlug="cricket"
          leadItem={cricketItems.lead}
          gridItems={cricketItems.grid}
        />
      )}

      {/* 7. LIFESTYLE Section (4-Column Horizontal Grid) */}
      {lifestyleItems.length > 0 && (
        <GridSection
          title="LIFESTYLE"
          categorySlug="lifestyle"
          items={lifestyleItems}
        />
      )}

      {/* 8. AUTO Section (4-Column Horizontal Grid) */}
      {autoItems.length > 0 && (
        <GridSection
          title="AUTO"
          categorySlug="auto"
          items={autoItems}
        />
      )}

      {/* 9. HOROSCOPE Section (Signature Red Container + 12 Zodiac Tiles) */}
      <HoroscopeSection />

      {/* 10. VIDEOS Dark Showcase Section */}
      <VideosDarkSection />

      {/* 11. TECHNOLOGY Section (4-Column Horizontal Grid) */}
      {techItems.length > 0 && (
        <GridSection
          title="TECH"
          categorySlug="tech"
          items={techItems}
        />
      )}

      {/* 12. EDUCATION Section (50/50 Split Layout) */}
      {eduItems.lead && (
        <SplitSection
          title="EDUCATION"
          categorySlug="education"
          leadItem={eduItems.lead}
          gridItems={eduItems.grid}
        />
      )}

      {/* 13. BUSINESS Section (4-Column Horizontal Grid) */}
      {businessItems.length > 0 && (
        <GridSection
          title="BUSINESS"
          categorySlug="business"
          items={businessItems}
        />
      )}

      {/* 14. Exact The Daily Jagran Dark Footer */}
      <Footer />

      {/* 17. Search Overlay Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 18. Persistent Mobile App-Style Bottom Navigation Bar */}
      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />

    </main>
  );
}
