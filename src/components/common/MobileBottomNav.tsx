'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { VideoModal } from './VideoModal';
import { Play, Trophy, Sparkles, Zap, Search } from 'lucide-react';

interface MobileBottomNavProps {
  onOpenSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSearch }) => {
  const { language } = useLanguage();
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  return (
    <>
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-jagran-dark text-white border-t border-slate-800 shadow-2xl px-2 py-2">
        <div className="flex items-center justify-around text-center text-[10px] font-bold uppercase tracking-wider">
          
          {/* Videos Button */}
          <button
            onClick={() => setIsVideoModalOpen(true)}
            className="flex flex-col items-center space-y-1 text-slate-300 hover:text-jagran-red transition-colors"
          >
            <Play className="w-4 h-4 fill-current text-amber-400" />
            <span>VIDEOS</span>
          </button>

          {/* Cric Daily */}
          <a href="/category/cricket" className="flex flex-col items-center space-y-1 text-slate-300 hover:text-jagran-red transition-colors">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>CRIC DAILY</span>
          </a>

          {/* Astro Daily */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 1200, behavior: 'smooth' }); }} className="flex flex-col items-center space-y-1 text-slate-300 hover:text-jagran-red transition-colors">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>ASTRO</span>
          </a>

          {/* Flash Updates */}
          <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 600, behavior: 'smooth' }); }} className="flex flex-col items-center space-y-1 text-slate-300 hover:text-jagran-red transition-colors">
            <Zap className="w-4 h-4 text-jagran-red" />
            <span>FLASH</span>
          </a>

          {/* Search Modal Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex flex-col items-center space-y-1 text-slate-300 hover:text-jagran-red transition-colors"
          >
            <Search className="w-4 h-4 text-slate-200" />
            <span>SEARCH</span>
          </button>

        </div>
      </div>

      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
    </>
  );
};
