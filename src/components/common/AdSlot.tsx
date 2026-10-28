'use client';

import React, { useState, useEffect, useRef } from 'react';
import { adService, AdvertisementData, AdSlotType } from '@/services/adService';
import { getFullMediaUrl } from '@/config/env';

interface AdSlotProps {
  slot: AdSlotType;
  className?: string;
}

export const AdSlot: React.FC<AdSlotProps> = ({ slot, className = '' }) => {
  const [ad, setAd] = useState<AdvertisementData | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const scriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;

    adService.getPublicAd(slot)
      .then((data) => {
        if (isMounted) {
          setAd(data);
          setIsLoaded(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setAd(null);
          setIsLoaded(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [slot]);

  // Execute custom AdSense / script code safely in DOM
  useEffect(() => {
    if (!ad || ad.type !== 'SCRIPT' || !ad.scriptCode || !scriptContainerRef.current) return;

    const container = scriptContainerRef.current;
    container.innerHTML = '';

    const range = document.createRange();
    range.selectNode(container);
    const documentFragment = range.createContextualFragment(ad.scriptCode);
    container.appendChild(documentFragment);

    // If Google AdSense is detected, trigger push
    try {
      const w = window as any;
      if (w.adsbygoogle && Array.isArray(w.adsbygoogle)) {
        w.adsbygoogle.push({});
      }
    } catch {}
  }, [ad]);

  // If loading or no active ad, cleanly collapse with 0px height
  if (!isLoaded || !ad) {
    return null;
  }

  const handleAdClick = () => {
    if (ad.id) {
      adService.recordClick(ad.id);
    }
  };

  // 1. Direct Image Banner Ad
  if (ad.type === 'IMAGE' && ad.imageUrl) {
    const fullImageUrl = getFullMediaUrl(ad.imageUrl);

    return (
      <div className={`w-full flex flex-col items-center justify-center my-3 select-none ${className}`}>
        {/* Micro sponsored label */}
        <div className="w-full max-w-4xl flex items-center justify-between px-1 mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          <span>Advertisement</span>
          <span className="text-[8px] font-medium text-slate-300 dark:text-slate-600">Sponsored</span>
        </div>

        <div className="w-full max-w-4xl rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-transform hover:opacity-95">
          <a
            href={ad.targetUrl || '#'}
            target="_blank"
            rel="noopener noreferrer sponsored"
            onClick={handleAdClick}
            className="block w-full cursor-pointer overflow-hidden"
            title={ad.title}
          >
            <img
              src={fullImageUrl}
              alt={ad.title || 'Sponsored Advertisement'}
              className="w-full h-auto max-h-[200px] md:max-h-[240px] object-contain mx-auto"
              loading="lazy"
            />
          </a>
        </div>
      </div>
    );
  }

  // 2. Google AdSense / Custom Script Ad
  if (ad.type === 'SCRIPT' && ad.scriptCode) {
    return (
      <div className={`w-full flex flex-col items-center justify-center my-3 select-none ${className}`}>
        <div className="w-full max-w-4xl flex items-center justify-between px-1 mb-1 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
          <span>Advertisement</span>
          <span className="text-[8px] font-medium text-slate-300 dark:text-slate-600">Sponsored</span>
        </div>

        <div
          ref={scriptContainerRef}
          className="w-full max-w-4xl min-h-[90px] flex items-center justify-center rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 text-center"
        />
      </div>
    );
  }

  return null;
};
