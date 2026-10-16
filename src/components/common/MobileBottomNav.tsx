'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { VideoModal } from './VideoModal';
import { categoryService, CategoryData } from '@/services/categoryService';
import { mockCategoryTabs } from '@/data/mockNewsData';
import {
  Home,
  Search,
  Play,
  Menu,
  X,
  Sun,
  ChevronRight
} from 'lucide-react';

interface MobileBottomNavProps {
  onOpenSearch?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenSearch }) => {
  const pathname = usePathname();
  const router = useRouter();

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categories, setCategories] = useState<CategoryData[]>([]);

  // Load and listen for categories
  useEffect(() => {
    const cached = categoryService.getCachedCategories();
    if (cached && cached.length > 0) {
      setCategories(cached.filter(c => c.slug !== 'all' && c.isActive));
    } else {
      setCategories(
        mockCategoryTabs
          .filter(t => t.slug !== 'all')
          .map(t => ({
            id: t.id,
            name: String(t.label?.en || t.slug || ''),
            slug: t.slug,
            order: 0,
            isActive: true
          }))
      );
    }

    categoryService
      .getCategories()
      .then(cats => {
        if (cats && cats.length > 0) {
          setCategories(cats.filter(c => c.slug !== 'all' && c.isActive));
        }
      })
      .catch(() => {});

    const handleCatsChanged = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setCategories(e.detail.filter((c: any) => c.slug !== 'all' && c.isActive));
      }
    };
    window.addEventListener('categories_changed', handleCatsChanged);
    return () => window.removeEventListener('categories_changed', handleCatsChanged);
  }, []);

  // Back button & Escape key handling to close drawer cleanly + background scroll lock
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };

    const handleBack = (e: Event) => {
      e.preventDefault();
      setIsMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('app_back_pressed', handleBack);

    // Save scroll position and style values to prevent iOS/Android background scrolling
    const scrollY = window.scrollY;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    const prevBodyPosition = document.body.style.position;
    const prevBodyTop = document.body.style.top;
    const prevBodyWidth = document.body.style.width;

    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    // Prevent background touchmove scrolling outside of the drawer's scrollable container
    const preventBackgroundTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.drawer-scrollable')) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    window.addEventListener('touchmove', preventBackgroundTouch, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('app_back_pressed', handleBack);
      window.removeEventListener('touchmove', preventBackgroundTouch);

      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [isMenuOpen]);

  return (
    <>
      {/* 4-Item Mobile Bottom Navigation Bar: Home | Search | Videos | Menu (Hamburger) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        style={{
          paddingBottom: 'max(12px, calc(env(safe-area-inset-bottom, 0px) + 6px))'
        }}
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg text-slate-700 dark:text-white border-t border-slate-200/90 dark:border-slate-800/90 shadow-2xl px-2 pt-2 transition-colors duration-200"
      >
        <div className="grid grid-cols-4 items-center text-center text-[10px] font-bold uppercase tracking-wider">
          
          {/* 1. Home Tab */}
          <Link
            href="/"
            className={`flex flex-col items-center justify-center py-1 space-y-1 transition-colors ${
              pathname === '/'
                ? 'text-jagran-red font-black'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Home className="w-5 h-5 stroke-[2.2]" />
            <span>HOME</span>
          </Link>

          {/* 2. Search Tab */}
          <button
            type="button"
            onClick={onOpenSearch}
            className="flex flex-col items-center justify-center py-1 space-y-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Search className="w-5 h-5 stroke-[2.2]" />
            <span>SEARCH</span>
          </button>

          {/* 3. Videos Tab */}
          <Link
            href="/videos"
            className={`flex flex-col items-center justify-center py-1 space-y-1 transition-colors cursor-pointer ${
              pathname?.startsWith('/videos')
                ? 'text-jagran-red font-black'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Play
              className={`w-5 h-5 ${
                pathname?.startsWith('/videos')
                  ? 'fill-[#E43854] text-[#E43854]'
                  : 'fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400'
              }`}
            />
            <span>VIDEOS</span>
          </Link>

          {/* 4. Menu (Hamburger) Tab */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1 space-y-1 transition-colors cursor-pointer ${
              isMenuOpen
                ? 'text-jagran-red font-black'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
            <span>MENU</span>
          </button>

        </div>
      </nav>

      {/* Video Bulletin / Player Modal */}
      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />

      {/* Native Mobile App Drawer Modal Overlay */}
      {isMenuOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation Menu"
          className="md:hidden fixed inset-0 z-[100] flex justify-end animate-in fade-in duration-200"
        >
          {/* Backdrop */}
          <div
            onClick={() => setIsMenuOpen(false)}
            className="fixed inset-0 bg-black/60 dark:bg-black/75 backdrop-blur-sm cursor-pointer touch-none"
          />

          {/* Drawer Content - Slides in from the RIGHT */}
          <div className="relative w-[85vw] max-w-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-white h-full flex flex-col shadow-2xl z-10 overflow-hidden border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200 transition-colors">
            {/* Drawer Header with Safe-Area Padding to prevent overlapping Android Clock / Battery */}
            <div
              style={{
                paddingTop: 'max(46px, calc(env(safe-area-inset-top, 0px) + 16px))',
                paddingBottom: '14px',
                paddingLeft: '16px',
                paddingRight: '16px'
              }}
              className="border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950 shrink-0"
            >
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-jagran-red to-orange-500 flex items-center justify-center shadow-md">
                  <Sun className="w-4 h-4 text-white stroke-[2.5]" />
                </div>
                <div>
                  <span className="text-[9px] font-black uppercase text-[#E43854] block leading-none">THE</span>
                  <span className="text-base font-black font-serif text-slate-900 dark:text-white leading-none">NEWSPAPER</span>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Categories Scroll List */}
            <div className="flex-1 overflow-y-auto overscroll-contain drawer-scrollable p-3 pb-8 space-y-1 touch-pan-y">
              <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 py-1.5">
                ALL SECTIONS
              </div>

              {/* Home */}
              <button
                onClick={() => {
                  router.push('/');
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                  pathname === '/'
                    ? 'bg-red-50 dark:bg-red-950/50 text-jagran-red font-black border border-red-200 dark:border-red-900/40'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span className="flex items-center space-x-2.5">
                  <Home className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                  <span>Home</span>
                </span>
                {pathname === '/' && <span className="w-2 h-2 rounded-full bg-jagran-red" />}
              </button>

              {/* Dynamic categories list */}
              {categories.map((cat) => {
                const isCatActive = pathname === `/${cat.slug}` || pathname === `/category/${cat.slug}`;
                return (
                  <button
                    key={`menu-${cat.id || cat.slug}`}
                    onClick={() => {
                      router.push(`/${cat.slug}`);
                      setIsMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer ${
                      isCatActive
                        ? 'bg-red-50 dark:bg-red-950/50 text-jagran-red font-black border border-red-200 dark:border-red-900/40'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <span>{cat.name}</span>
                    {isCatActive ? (
                      <span className="w-2 h-2 rounded-full bg-jagran-red" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
