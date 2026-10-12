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
import { categoryService, CategoryData } from '@/services/categoryService';
import { formatTimeAgo } from '@/utils/timeAgo';
import { stripHtml } from '@/utils/textUtils';

export default function HomePage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [homeData, setHomeData] = useState<HomeArticlesResponse | null>(null);
  const [allArticlesMap, setAllArticlesMap] = useState<Record<string, ArticleData[]>>({});
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [, setTick] = useState(0);

  useEffect(() => {
    // 1. Load categories instantly from cache, then refresh from API
    const cached = categoryService.getCachedCategories();
    if (cached.length > 0) setCategories(cached);
    categoryService.getCategories().then(cats => {
      if (cats.length > 0) setCategories(cats);
    });

    // 2. Fetch both home aggregated data and all published articles across pages
    Promise.all([
      articleService.getHomeArticles(),
      articleService.getArticles({ limit: 100, page: 1, status: 'PUBLISHED' })
    ])
      .then(async ([hData, firstPageData]) => {
        setHomeData(hData);

        let allList = firstPageData?.articles || [];
        if (firstPageData?.pagination && firstPageData.pagination.totalPages > 1) {
          try {
            const extraPages = [];
            for (let p = 2; p <= firstPageData.pagination.totalPages; p++) {
              extraPages.push(articleService.getArticles({ limit: 100, page: p, status: 'PUBLISHED' }));
            }
            const extraResults = await Promise.all(extraPages);
            extraResults.forEach(res => {
              if (res?.articles) allList = allList.concat(res.articles);
            });
          } catch (e) {
            console.error('Error fetching additional pages:', e);
          }
        }

        const map: Record<string, ArticleData[]> = {};
        allList.forEach(art => {
          const rawKey = (art.category || '').toLowerCase().trim();
          if (!rawKey) return;
          if (!map[rawKey]) map[rawKey] = [];
          map[rawKey].push(art);
        });

        // Always sort each category by publishedAt descending
        Object.keys(map).forEach(cat => {
          map[cat].sort((a, b) => {
            const timeA = new Date(a.publishedAt || a.createdAt).getTime();
            const timeB = new Date(b.publishedAt || b.createdAt).getTime();
            return timeB - timeA;
          });
        });

        // Merge aliases
        // 1. india and national
        if (map['india'] || map['national']) {
          const combined = [...(map['india'] || []), ...(map['national'] || [])].sort((a, b) =>
            new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
          );
          map['india'] = combined;
          map['national'] = combined;
        }

        // 2. world and global
        if (map['world'] || map['global']) {
          const combinedWorld = [...(map['world'] || []), ...(map['global'] || [])].sort((a, b) =>
            new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime()
          );
          map['world'] = combinedWorld;
          map['global'] = combinedWorld;
        }

        setAllArticlesMap(map);
      })
      .catch(err => console.error('Failed to load home articles:', err));

    // Auto-update relative time stamps every 60 seconds
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 60000);

    // Real-time listener when admin reorders or toggles showOnHome in CategoryManagerModal
    const handleCategoryUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCategories(e.detail);
      } else {
        categoryService.getCategories().then(cats => {
          if (cats && cats.length > 0) setCategories(cats);
        });
      }
    };
    window.addEventListener('categories_changed', handleCategoryUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('categories_changed', handleCategoryUpdate);
    };
  }, []);

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') {
      setSelectedCategory('all');
    } else if (slug === 'videos') {
      router.push('/videos');
    } else if (slug === 'cricket') {
      router.push('/cricket');
    } else {
      router.push(`/${slug}`);
    }
  };

  // Robust multi-key lookup: allArticlesMap + homeData.categories + category aliases
  const resolveArticleList = (catKey: string): ArticleData[] => {
    const key = catKey.toLowerCase().trim();
    const altKey =
      key === 'world' ? 'global' :
      key === 'global' ? 'world' :
      key === 'national' ? 'india' :
      key === 'india' ? 'national' : null;

    const matchedCat = categories.find(c => c.slug.toLowerCase() === key);
    const catNameKey = matchedCat ? matchedCat.name.toLowerCase().trim() : null;

    const candidates: ArticleData[] = [
      ...(allArticlesMap[key] || []),
      ...(altKey && allArticlesMap[altKey] ? allArticlesMap[altKey] : []),
      ...(catNameKey && allArticlesMap[catNameKey] ? allArticlesMap[catNameKey] : []),
      ...(homeData?.categories?.[key] || []),
      ...(altKey && homeData?.categories?.[altKey] ? homeData.categories[altKey] : [])
    ];

    // Deduplicate by id / slug
    const seen = new Set<string>();
    const deduplicated: ArticleData[] = [];
    for (const art of candidates) {
      if (art && (art.id || art.slug)) {
        const idKey = art.id || art.slug;
        if (!seen.has(idKey)) {
          seen.add(idKey);
          deduplicated.push(art);
        }
      }
    }

    return deduplicated;
  };

  const getCategoryGridItems = (catKey: string) => {
    const list = resolveArticleList(catKey);
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
    const list = resolveArticleList(catKey);
    if (list && list.length > 0) {
      const lead = list[0];
      const rest = list.slice(1, 5);
      return {
        lead: {
          id: lead.slug || lead.id,
          category: lead.category.toUpperCase(),
          title: stripHtml(lead.title),
          summary: stripHtml(lead.subHeadline) || stripHtml(lead.content).slice(0, 180) + '...',
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

  // Dynamic Section Renderer: Chooses the optimal layout based on category type
  const renderCategorySection = (cat: CategoryData) => {
    const slug = cat.slug.toLowerCase().trim();
    const name = cat.name.toUpperCase();

    // 1. Horoscope Special Section
    if (slug === 'horoscope' || slug === 'rashifal') {
      return <HoroscopeSection key={cat.id || slug} />;
    }

    // 2. Split Layout (50/50: 1 Lead Story + 4 Cards = 5 Cards)
    // Preferred for marquee categories: entertainment, cricket, education, india, national
    const isSplitCandidate = ['entertainment', 'cricket', 'education', 'india', 'national'].includes(slug);
    if (isSplitCandidate) {
      const splitItems = getCategorySplitItems(slug);
      if (splitItems.lead) {
        return (
          <SplitSection
            key={cat.id || slug}
            title={name}
            categorySlug={slug}
            leadItem={splitItems.lead}
            gridItems={splitItems.grid}
          />
        );
      }
    }

    // 3. Grid Layout (4-Column Horizontal Cards)
    // For world, global, lifestyle, auto, tech, business, sports, spiritual, fashion, etc.
    const gridItems = getCategoryGridItems(slug);
    if (gridItems.length > 0) {
      return (
        <GridSection
          key={cat.id || slug}
          title={name}
          categorySlug={slug}
          items={gridItems}
        />
      );
    }

    return null;
  };

  // Filter dynamic categories from Admin (excluding explainer & videos which are fixed at Slot 4 and Slot 9)
  const dynamicHomeCategories = categories
    .filter(c =>
      c.isActive &&
      c.showOnHome !== false &&
      c.slug !== 'all' &&
      c.slug !== 'latest' &&
      c.slug !== 'explainer' &&
      c.slug !== 'explainers' &&
      c.slug !== 'videos' &&
      c.slug !== 'video'
    )
    .sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0));

  const explainerItems = getCategoryGridItems('explainer');

  // Build the final ordered homepage sections:
  // Slot 4 is FIXED for EXPLAINER
  // Slot 9 is FIXED for VIDEOS
  // All other dynamic categories from admin flow sequentially and auto-shift!
  const finalHomeSections: React.ReactNode[] = [];
  let dynamicCursor = 0;
  const targetTotalSlots = dynamicHomeCategories.length + 2;

  for (let slot = 1; slot <= targetTotalSlots; slot++) {
    if (slot === 4) {
      // Slot 4: Fixed EXPLAINER
      if (explainerItems.length > 0) {
        finalHomeSections.push(
          <ExplainerSection key="fixed-slot-4-explainer" items={explainerItems} />
        );
      }
    } else if (slot === 9) {
      // Slot 9: Fixed VIDEOS SHOWCASE
      finalHomeSections.push(
        <VideosDarkSection key="fixed-slot-9-videos" />
      );
    } else {
      // Dynamic slots: pull next category in admin order
      if (dynamicCursor < dynamicHomeCategories.length) {
        const cat = dynamicHomeCategories[dynamicCursor];
        const node = renderCategorySection(cat);
        if (node) {
          finalHomeSections.push(node);
        }
        dynamicCursor++;
      }
    }
  }

  // Any remaining dynamic categories
  while (dynamicCursor < dynamicHomeCategories.length) {
    const cat = dynamicHomeCategories[dynamicCursor];
    const node = renderCategorySection(cat);
    if (node) {
      finalHomeSections.push(node);
    }
    dynamicCursor++;
  }

  return (
    <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* Accessible & SEO-Optimized Semantic H1 Heading */}
      <h1 className="sr-only">The Daily Jagran - Latest Breaking News, National &amp; Global Updates</h1>

      {/* 1. Header & Navigation */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Hero / Top News Section (3-Column Layout with skeleton loader) */}
      <HeroSection dynamicData={homeData} />

      {/* 3. DYNAMIC HOMEPAGE SECTIONS: Explainer at #4, Videos at #9, others auto-adjusted in Admin Order */}
      {finalHomeSections}

      {/* 4. Exact The Daily Jagran Dark Footer */}
      <Footer />

      {/* 16. Search Overlay Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* 17. Persistent Mobile App-Style Bottom Navigation Bar */}
      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />

    </main>
  );
}
