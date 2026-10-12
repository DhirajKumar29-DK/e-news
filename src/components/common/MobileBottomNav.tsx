'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { VideoModal } from './VideoModal';
import { Home, Play, Trophy, Sparkles, Search } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenSearch?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const { language } = useLanguage();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <>
      <nav
        aria-label="Mobile Bottom Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg text-white border-t border-slate-800/90 shadow-2xl px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0.5rem))]"
      >
        <div className="flex items-center justify-around text-center text-[10px] font-bold uppercase tracking-wider">
          
          {/* Home Tab */}
          <Link
            href="/"
            className={`flex flex-col items-center space-y-1 transition-colors ${
              pathname === '/' ? 'text-jagran-red font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Home className="w-4 h-4" />
            <span>HOME</span>
          </Link>

          {/* Cricket Daily Tab */}
          <Link
            href="/cricket"
            className={`flex flex-col items-center space-y-1 transition-colors ${
              pathname?.startsWith('/cricket') ? 'text-jagran-red font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>CRICKET</span>
          </Link>

          {/* Videos Modal Trigger */}
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="flex flex-col items-center space-y-1 text-slate-400 hover:text-jagran-red transition-colors"
          >
            <Play className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>VIDEOS</span>
          </button>

          {/* Astro / Horoscope Tab */}
          <Link
            href="/horoscope"
            className={`flex flex-col items-center space-y-1 transition-colors ${
              pathname?.startsWith('/horoscope') ? 'text-jagran-red font-black' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>ASTRO</span>
          </Link>

          {/* Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex flex-col items-center space-y-1 text-slate-400 hover:text-white transition-colors"
          >
            <Search className="w-4 h-4 text-slate-300" />
            <span>SEARCH</span>
          </button>

        </div>
      </nav>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
    </>
  );
};
