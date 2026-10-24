'use client';

import React, { useState, useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

const REFRESH_THRESHOLD = 70; // px pull distance needed to trigger refresh
const MAX_PULL = 110; // max rubberband pull distance

export const PullToRefresh: React.FC = () => {
  const { language } = useLanguage();
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasVibrated, setHasVibrated] = useState(false);

  const startYRef = useRef(0);
  const isPullingRef = useRef(false);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    isRefreshingRef.current = isRefreshing;
  }, [isRefreshing]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleTouchStart = (e: TouchEvent) => {
      if (isRefreshingRef.current) return;

      // Only initiate pull-to-refresh if user is at the very top of the page
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
      if (scrollTop <= 2) {
        startYRef.current = e.touches[0].clientY;
        isPullingRef.current = true;
        setHasVibrated(false);
      } else {
        isPullingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current || isRefreshingRef.current) return;

      const currentY = e.touches[0].clientY;
      const diff = currentY - startYRef.current;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

      // If user is pulling downward while at the top of the viewport
      if (diff > 0 && scrollTop <= 2) {
        // Natural rubberband resistance physics formula
        const damping = 0.42;
        const calculatedDistance = Math.min(diff * damping, MAX_PULL);
        setPullDistance(calculatedDistance);

        // Haptic feedback once threshold is crossed
        if (calculatedDistance >= REFRESH_THRESHOLD && !hasVibrated) {
          if (typeof window !== 'undefined' && 'vibrate' in window.navigator) {
            try {
              window.navigator.vibrate(15);
            } catch {
              // ignore
            }
          }
          setHasVibrated(true);
        }
      } else {
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current || isRefreshingRef.current) {
        isPullingRef.current = false;
        return;
      }

      isPullingRef.current = false;

      setPullDistance((prevDistance) => {
        if (prevDistance >= REFRESH_THRESHOLD) {
          // Trigger refresh like in real native mobile apps!
          setIsRefreshing(true);
          setTimeout(() => {
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }, 650);
          return 56;
        } else {
          // Return back to top smoothly
          return 0;
        }
      });
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [hasVibrated]);

  if (pullDistance === 0 && !isRefreshing) {
    return null;
  }

  const isReady = pullDistance >= REFRESH_THRESHOLD;
  const progressRatio = Math.min(pullDistance / REFRESH_THRESHOLD, 1);
  const rotationDegrees = isRefreshing ? 0 : progressRatio * 360;

  return (
    <div
      className="md:hidden fixed left-0 right-0 z-[99999] pointer-events-none flex justify-center transition-transform duration-150 ease-out"
      style={{
        top: 'max(env(safe-area-inset-top, 0px), 12px)',
        transform: `translateY(${pullDistance}px)`,
      }}
      aria-live="polite"
    >
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-2xl rounded-full px-4 py-2 flex items-center space-x-2.5 animate-in fade-in zoom-in-95 duration-150">
        {/* Animated Refresh Spinner */}
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          <RotateCw
            className={`w-4 h-4 text-red-600 dark:text-red-500 transition-transform ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isRefreshing ? undefined : `rotate(${rotationDegrees}deg)`,
            }}
          />
        </div>

        {/* Status Text */}
        <span className="text-[11px] font-bold tracking-tight text-slate-800 dark:text-slate-200 whitespace-nowrap">
          {isRefreshing
            ? (language === 'hi' ? 'रिफ्रेश हो रहा है...' : 'Refreshing news feed...')
            : isReady
            ? (language === 'hi' ? 'छोड़ें रिफ्रेश करने के लिए' : 'Release to refresh')
            : (language === 'hi' ? 'नीचे खींचें रिफ्रेश करने के लिए' : 'Pull down to refresh')}
        </span>
      </div>
    </div>
  );
};
