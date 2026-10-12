'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer, SearchModal, MobileBottomNav } from '@/components/common';
import { LiveScoreStrip, CricketRankingsTable, CricketNewsSection } from '@/components/cricket';
import { Trophy, ArrowLeft } from 'lucide-react';

export default function RankingsPage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') router.push('/');
    else if (slug === 'cricket') router.push('/cricket');
    else router.push(`/${slug}`);
  };

  return (
    <main className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory="cricket"
        onSelectCategory={handleSelectCategory}
      />

      <LiveScoreStrip />

      <div className="max-w-7xl mx-auto px-4 py-6 w-full space-y-6 flex-1">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <Link href="/cricket" className="hover:text-white flex items-center gap-1 font-semibold">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Cricket Center
          </Link>
        </div>

        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Trophy className="w-6 h-6 text-amber-400" />
            ICC Official Rankings
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Latest International Cricket Council rankings across T20I, ODI, and Test formats
          </p>
        </div>

        <CricketRankingsTable />

        <CricketNewsSection />
      </div>

      <Footer />
      <MobileBottomNav />
      {isSearchOpen && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </main>
  );
}
