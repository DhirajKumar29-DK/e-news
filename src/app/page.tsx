'use client';

import React, { useState } from 'react';
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
import {
  mockEntertainmentLead,
  mockEntertainmentGrid,
  mockWorldCards,
  mockCricketLead,
  mockCricketGrid,
  mockLifestyleCards,
  mockAutoCards,
  mockTechCards,
  mockEducationLead,
  mockEducationGrid,
  mockBusinessCards
} from '@/data/mockNewsData';

export default function HomePage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') {
      setSelectedCategory('all');
    } else if (slug === 'videos') {
      router.push('/videos');
    } else {
      router.push(`/category/${slug}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* 1. Exact The Daily Jagran Header & Navigation */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Hero / Top News Section (3-Column Layout) */}
      <HeroSection />

      {/* 3. ENTERTAINMENT Section (50/50 Split Layout) */}
      <SplitSection
        title="ENTERTAINMENT"
        categorySlug="entertainment"
        leadItem={mockEntertainmentLead}
        gridItems={mockEntertainmentGrid}
      />

      {/* 4. WORLD Section (4-Column Horizontal Grid) */}
      <GridSection
        title="WORLD"
        categorySlug="world"
        items={mockWorldCards}
      />

      {/* 5. EXPLAINER Section (Signature Red Striped Container + 4 Floating Cards) */}
      <ExplainerSection />

      {/* 6. CRICKET Section (50/50 Split Layout) */}
      <SplitSection
        title="CRICKET"
        categorySlug="cricket"
        leadItem={mockCricketLead}
        gridItems={mockCricketGrid}
      />

      {/* 7. LIFESTYLE Section (4-Column Horizontal Grid) */}
      <GridSection
        title="LIFESTYLE"
        categorySlug="lifestyle"
        items={mockLifestyleCards}
      />

      {/* 8. AUTO Section (4-Column Horizontal Grid) */}
      <GridSection
        title="AUTO"
        categorySlug="auto"
        items={mockAutoCards}
      />

      {/* 9. HOROSCOPE Section (Signature Red Container + 12 Zodiac Tiles) */}
      <HoroscopeSection />

      {/* 10. VIDEOS Dark Showcase Section */}
      <VideosDarkSection />

      {/* 11. TECHNOLOGY Section (4-Column Horizontal Grid) */}
      <GridSection
        title="TECH"
        categorySlug="tech"
        items={mockTechCards}
      />

      {/* 12. EDUCATION Section (50/50 Split Layout) */}
      <SplitSection
        title="EDUCATION"
        categorySlug="education"
        leadItem={mockEducationLead}
        gridItems={mockEducationGrid}
      />

      {/* 13. BUSINESS Section (4-Column Horizontal Grid) */}
      <GridSection
        title="BUSINESS"
        categorySlug="business"
        items={mockBusinessCards}
      />

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
