'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { mockBreakingTicker } from '@/data/mockNewsData';
import { Radio, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';

export const BreakingTicker: React.FC = () => {
  const { language, t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockBreakingTicker.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const currentItem = mockBreakingTicker[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mockBreakingTicker.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + mockBreakingTicker.length) % mockBreakingTicker.length);
  };

  return (
    <div className="bg-brand-navy dark:bg-slate-950 text-white border-b border-slate-800 py-2 px-4 sm:px-8 lg:px-10">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        
        {/* Left Badge */}
        <div className="flex items-center space-x-2 shrink-0">
          <span className="bg-brand-red text-white px-2.5 py-1 rounded font-bold uppercase tracking-wider flex items-center space-x-1.5 shadow-sm text-xs">
            <Radio className="w-3.5 h-3.5 animate-live-pulse" />
            <span>LIVE</span>
          </span>
          <span className="hidden md:inline-block bg-slate-800 text-slate-300 text-xs px-2 py-0.5 rounded font-medium">
            {currentItem.category}
          </span>
        </div>

        {/* Center Headline Slider */}
        <div className="flex-1 overflow-hidden min-h-[24px] flex items-center">
          <a
            href="#"
            className="truncate font-medium text-slate-100 hover:text-amber-300 transition-colors block w-full"
            title={t(currentItem.headline)}
          >
            {t(currentItem.headline)}
          </a>
        </div>

        {/* Right Play/Pause Controls */}
        <div className="flex items-center space-x-1.5 text-slate-400 shrink-0">
          <button
            onClick={handlePrev}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Previous"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title={isPaused ? 'Resume Ticker' : 'Pause Ticker'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={handleNext}
            className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors"
            title="Next"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
