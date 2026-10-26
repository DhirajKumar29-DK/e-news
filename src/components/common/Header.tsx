'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import {
  mockCategoryTabs,
  mockInFocusPills
} from '@/data/mockNewsData';
import { articleService } from '@/services/articleService';
import { categoryService, CategoryData } from '@/services/categoryService';
import { prewarmBackend } from '@/services/epaperService';
import { VideoModal } from './VideoModal';
import { Search, Video, User, Home, Sun, Moon, FileText, Newspaper, Menu, X, ChevronDown, Languages, Globe, Play, Sparkles, MoreVertical, CloudSun } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  showInFocus?: boolean;
}

function getLiveFormattedDateTime(lang: string = 'en'): string {
  const now = new Date();
  if (lang === 'hi') {
    const daysHi = ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'];
    const monthsHi = ['जनवरी', 'फरवरी', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुलाई', 'अगस्त', 'सितंबर', 'अक्टूबर', 'नवंबर', 'दिसंबर'];
    const dayName = daysHi[now.getDay()];
    const dateNum = now.getDate();
    const monthName = monthsHi[now.getMonth()];
    const year = now.getFullYear();
    const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
    return `${dayName}, ${dateNum} ${monthName} ${year} | अपडेटेड ${timeString} IST`;
  }
  const daysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dayName = daysEn[now.getDay()];
  const dateNum = now.getDate();
  const monthName = monthsEn[now.getMonth()];
  const year = now.getFullYear();
  const timeString = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase();
  return `${dayName}, ${monthName} ${dateNum}, ${year} | Updated ${timeString} IST`;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, activeCategory, onSelectCategory, showInFocus }) => {
  const router = useRouter();
  const pathname = usePathname();
  const shouldShowInFocus = showInFocus !== undefined ? showInFocus : (pathname === '/');
  const { theme, toggleTheme } = useTheme();
  const { language, supportedLanguages, t, toggleLanguage, isTranslating } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [formattedDate, setFormattedDate] = useState<string>('');
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollPos, setPrevScrollPos] = useState(0);

  // Inline Search State (Dynamic from real DB)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);

  // MORE Dropdown State (Hover & Click support)
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreDropdownRef = useRef<HTMLLIElement>(null);

  // Mobile Category Pill Bar Scroll Container Ref
  const mobileCategoryContainerRef = useRef<HTMLDivElement>(null);

  const isTabActive = (tabSlug?: string, currentActive?: string) => {
    if (!tabSlug || !currentActive) return false;
    const s = tabSlug.toLowerCase().trim();
    const a = currentActive.toLowerCase().trim();
    if (s === a) return true;
    if ((s === 'india' && a === 'national') || (s === 'national' && a === 'india')) return true;
    if ((s === 'world' && a === 'global') || (s === 'global' && a === 'world')) return true;
    return false;
  };

  // Dynamic Navigation Categories
  const [navCategories, setNavCategories] = useState<CategoryData[]>([]);

  useEffect(() => {
    const syncCategories = () => {
      const cached = categoryService.getCachedCategories();
      if (cached && cached.length > 0) {
        setNavCategories(cached);
      }
    };

    // 1. Initial cached + fresh network sync
    syncCategories();
    categoryService.getCategories().then((cats) => {
      if (cats && cats.length > 0) {
        setNavCategories(cats);
      }
    }).catch(() => {});

    // 2. Real-time sync when admin updates/reorders categories
    const handleCategoryUpdate = (e: any) => {
      if (e?.detail && Array.isArray(e.detail)) {
        setNavCategories(e.detail);
      } else {
        syncCategories();
      }
    };

    window.addEventListener('categories_changed', handleCategoryUpdate);
    window.addEventListener('storage', syncCategories);

    return () => {
      window.removeEventListener('categories_changed', handleCategoryUpdate);
      window.removeEventListener('storage', syncCategories);
    };
  }, []);

  const currentLangObj = supportedLanguages.find(l => l.code === language) || supportedLanguages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
      if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock background scroll when mobile drawer is open in Header
  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);

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

    const preventBackgroundTouch = (e: TouchEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest('.header-drawer-scrollable')) {
        return;
      }
      if (e.cancelable) {
        e.preventDefault();
      }
    };

    window.addEventListener('touchmove', preventBackgroundTouch, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchmove', preventBackgroundTouch);
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
      document.body.style.position = prevBodyPosition;
      document.body.style.top = prevBodyTop;
      document.body.style.width = prevBodyWidth;
      window.scrollTo(0, scrollY);
    };
  }, [mobileMenuOpen]);

  const popularTags = ['ISRO', 'Tech', 'Cricket', 'Economy', 'G20', 'Trump', 'NEET'];

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      articleService.getArticles({ search: q, limit: 6 })
        .then(res => {
          if (res && res.articles) {
            setSearchResults(res.articles.map(a => ({
              id: a.slug || a.id,
              title: { en: a.title, hi: a.title },
              category: (a.category || 'NEWS').toUpperCase(),
              timeAgo: { en: 'Updated' }
            })));
          }
        })
        .catch(() => setSearchResults([]));
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredSearchResults = searchResults;

  useEffect(() => {
    // 1. Immediately set real-time dynamic date & time
    setFormattedDate(getLiveFormattedDateTime(language));

    // 2. Real-time live clock ticking every 1 second (1000ms):
    // Updates live time automatically and auto-transitions day/date at midnight without refreshing!
    const clockTimer = setInterval(() => {
      setFormattedDate(getLiveFormattedDateTime(language));
    }, 1000);

    // Silently pre-warm backend so ePaper / API is instantly awake
    prewarmBackend();

    return () => clearInterval(clockTimer);
  }, [language]);

  const handleOpenEPaper = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('epaper_selected_date');
        sessionStorage.removeItem('epaper_user_picked_date');
      } catch {}
    }
    router.push('/epaper');
  };

  useEffect(() => {
    const handleScroll = () => {
      // On mobile screens, keep header always visible so status bar is protected and nav is always accessible
      if (window.innerWidth < 768) {
        setIsVisible(true);
        return;
      }

      const currentScrollPos = window.scrollY;

      // Keep navbar visible in the starting section (first 300px of scrolling)
      if (currentScrollPos <= 300) {
        setIsVisible(true);
      } else if (currentScrollPos > prevScrollPos && currentScrollPos - prevScrollPos > 15) {
        // Hide navbar only after 2-3 scroll steps past 300px threshold
        setIsVisible(false);
      } else if (prevScrollPos - currentScrollPos > 10) {
        // Bring navbar back on scrolling up
        setIsVisible(true);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  // Exact calculation to center active category pill inside mobile navbar
  const centerActivePill = (behavior: ScrollBehavior = 'auto') => {
    const container = mobileCategoryContainerRef.current;
    if (!container) return;

    if (!activeCategory || activeCategory === 'all') {
      container.scrollTo({ left: 0, behavior });
      return;
    }

    const activeEl = container.querySelector('[data-active="true"]') as HTMLElement | null;
    if (!activeEl) return;

    const containerRect = container.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    // Absolute offset inside scrollable content
    const currentScroll = container.scrollLeft;
    const activeOffset = activeRect.left - containerRect.left + currentScroll;
    const targetScroll = Math.max(0, activeOffset - (containerRect.width / 2) + (activeRect.width / 2));

    container.scrollTo({
      left: targetScroll,
      behavior
    });
  };

  // Keep mobile category navbar centered / scrolled to the active selected category without jumping
  useEffect(() => {
    // Instant centering on render / category change so it never animates from Home
    centerActivePill('auto');
    const raf = requestAnimationFrame(() => {
      centerActivePill('auto');
    });
    return () => cancelAnimationFrame(raf);
  }, [activeCategory, navCategories]);

  return (
    <>
      <header
        style={{
          paddingTop: 'max(30px, env(safe-area-inset-top, 0px))'
        }}
        className={`site-header sticky top-0 z-40 w-full bg-white dark:bg-brand-navy border-b border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out lg:!pt-0 ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>

        {/* 1. TOP BLACK TIMESTAMP STRIP */}
        <div className="bg-black text-white text-[11px] py-0.5 hidden lg:block border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 flex items-center justify-between min-h-[24px]">
            <span suppressHydrationWarning className="font-sans font-medium tracking-tight text-slate-200 flex items-center my-auto">
              {formattedDate}
            </span>
            <div className="flex items-center space-x-3.5 text-[11px] my-auto">
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-1 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
              <span className="opacity-40">•</span>
              <button
                onClick={handleOpenEPaper}
                onMouseEnter={prewarmBackend}
                className="text-slate-300 hover:text-amber-400 font-medium cursor-pointer notranslate"
                translate="no"
              >
                {language === 'hi' ? 'ई-पेपर' : 'E-Paper'}
              </button>
              <span className="opacity-40">•</span>
              <button
                onClick={toggleLanguage}
                disabled={isTranslating}
                className="flex items-center space-x-1 text-slate-300 hover:text-amber-400 transition-colors font-medium cursor-pointer"
                title={language === 'hi' ? 'Switch website to English' : 'वेबसाइट को हिन्दी में बदलें'}
              >
                <Globe className={`w-3.5 h-3.5 text-slate-300 ${isTranslating ? 'animate-spin text-amber-400' : ''}`} />
                <span>{language === 'hi' ? 'English' : 'हिन्दी'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* 2. MAIN LOGO & ACTION BAR (3-Column Centered Layout) */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-1.5 sm:py-2 flex items-center justify-between gap-3 sm:gap-4">

          {/* Left Column: Brand Logo */}
          <div className="flex items-center shrink-0">
            {/* Hamburger hidden on mobile per user request */}

            <div
              onClick={() => onSelectCategory('all')}
              className="flex items-center cursor-pointer shrink-0"
              title="Vartiq"
            >
              <img
                src="/vartiq-logo.png"
                alt="Vartiq"
                className="h-[38px] md:h-[52px] w-auto object-contain select-none transform scale-x-[1.12] origin-left dark:hidden"
              />
              <img
                src="/vartiq-logo-dark.png"
                alt="Vartiq"
                className="h-[38px] md:h-[52px] w-auto object-contain select-none transform scale-x-[1.12] origin-left hidden dark:block"
              />
            </div>
          </div>

          {/* Center Column: EXACT YouTube Style Live Search Bar + Attached Dropdown (No Modal Popups!) */}
          <div ref={searchRef} className="flex-1 max-w-md lg:max-w-2xl mx-2 sm:mx-6 hidden sm:flex items-center space-x-3 relative">

            {/* YouTube Attached Input & Search Button Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (filteredSearchResults.length > 0) {
                  router.push(`/article/${filteredSearchResults[0].id}`);
                  setIsSearchFocused(false);
                }
              }}
              className="flex-1 flex items-center h-10 group relative"
            >
              {/* Left Input Field with Rounded-Left Corners */}
              <div className="flex-1 flex items-center h-full px-4 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-l-full focus-within:border-jagran-red dark:focus-within:border-jagran-red group-hover:border-slate-400 dark:group-hover:border-slate-600 transition-colors">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsSearchFocused(true);
                  }}
                  onFocus={() => setIsSearchFocused(true)}
                  placeholder="Search news..."
                  className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-500 font-normal cursor-text"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Right Attached Search Button with Rounded-Right Corners */}
              <button
                type="submit"
                className="h-full px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-l-0 border-slate-300 dark:border-slate-700 rounded-r-full flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer transition-colors"
                title="Search"
              >
                <Search className="w-5 h-5 stroke-[2]" />
              </button>
            </form>

            {/* ATTACHED YOUTUBE-STYLE LIVE SEARCH SUGGESTIONS DROPDOWN (No Modal Backdrop!) */}
            {isSearchFocused && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in duration-150">

                {/* Popular Tags Bar */}
                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800 flex items-center space-x-2 text-xs">
                  <span className="font-bold text-slate-500 uppercase text-[10px]">Popular:</span>
                  <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
                    {popularTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => {
                          setSearchQuery(tag);
                          setIsSearchFocused(true);
                        }}
                        className="px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-jagran-red hover:text-jagran-red text-slate-700 dark:text-slate-200 font-medium text-[11px] transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Matching Results List */}
                <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                  {searchQuery.trim() === '' ? (
                    <div className="p-4 text-center text-xs text-slate-400 font-medium">
                      Type to search latest news stories...
                    </div>
                  ) : filteredSearchResults.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500 font-medium">
                      No matching stories found
                    </div>
                  ) : (
                    filteredSearchResults.slice(0, 5).map(art => (
                      <div
                        key={art.id}
                        onClick={() => {
                          router.push(`/article/${art.id}`);
                          setIsSearchFocused(false);
                          setSearchQuery('');
                        }}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/70 cursor-pointer transition-colors flex items-start space-x-3 group"
                      >
                        <Search className="w-4 h-4 text-slate-400 group-hover:text-jagran-red mt-0.5 shrink-0" />
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <span className="text-[10px] font-black uppercase text-jagran-red block">
                            {art.category}
                          </span>
                          <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-jagran-red transition-colors leading-snug">
                            {t(art.title)}
                          </h4>
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            )}

          </div>

          {/* Right Column: Actions (ePaper, Videos, User Profile) */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">

            {/* ePaper Action Pill Button */}
            <button
              onClick={handleOpenEPaper}
              onMouseEnter={prewarmBackend}
              className="hidden sm:flex items-center space-x-2 h-9 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-jagran-red border border-red-200 dark:border-red-900/50 rounded-lg text-xs font-bold transition-all shadow-xs group cursor-pointer"
              title="Read Today's ePaper Edition"
            >
              <Newspaper className="w-4 h-4 text-jagran-red group-hover:scale-110 transition-transform" />
              <span className="tracking-wide notranslate" translate="no">
                {language === 'hi' ? 'ई-पेपर' : 'ePaper'}
              </span>
            </button>

            {/* Enhanced Live Videos Action Pill Button */}
            <button
              onClick={() => router.push('/videos')}
              className="hidden sm:flex items-center space-x-2 h-9 px-3 bg-[#E43854] hover:bg-[#c92a44] text-white rounded-md text-xs font-bold transition-all shadow-xs group cursor-pointer"
              title="Watch Live Video Bulletins"
            >
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Play className="w-2.5 h-2.5 fill-white ml-0.5 text-white" />
              </div>
              <span className="tracking-wide notranslate" translate="no">
                {language === 'hi' ? 'वीडियो' : 'Videos'}
              </span>
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping ml-0.5" />
            </button>

            {/* Mobile ePaper Quick Action Button (compact & small) */}
            <button
              onClick={handleOpenEPaper}
              onMouseEnter={prewarmBackend}
              className="sm:hidden flex items-center space-x-1.5 h-7 px-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-jagran-red border border-red-200 dark:border-red-900/50 rounded-md text-[10px] font-extrabold transition-all shadow-2xs shrink-0 cursor-pointer"
              title="ePaper"
            >
              <Newspaper className="w-3.5 h-3.5 text-jagran-red" />
              <span className="tracking-tight notranslate" translate="no">
                {language === 'hi' ? 'ई-पेपर' : 'ePaper'}
              </span>
            </button>

            {/* Mobile Day/Night Theme Toggle Icon Button */}
            <button
              onClick={toggleTheme}
              className="sm:hidden flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs shrink-0 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Moon className="w-3.5 h-3.5 text-slate-700 dark:text-slate-300" />
              )}
            </button>

            {/* Mobile Language Switcher Button */}
            <button
              onClick={toggleLanguage}
              disabled={isTranslating}
              className="sm:hidden flex items-center justify-center px-2 h-7 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs shrink-0 cursor-pointer text-[10px] font-black notranslate"
              translate="no"
              title={language === 'hi' ? 'Switch to English' : 'हिन्दी में बदलें'}
              aria-label="Toggle Language"
            >
              <Globe className={`w-3 h-3 mr-1 text-slate-600 dark:text-slate-400 ${isTranslating ? 'animate-spin text-jagran-red' : ''}`} />
              <span className="notranslate" translate="no">{language === 'hi' ? 'EN' : 'हि'}</span>
            </button>
          </div>

        </div>

        {/* 3. MOBILE ALWAYS-VISIBLE SWIPEABLE CATEGORY PILL BAR (App-like UX like LiveHindustan / Jagran) */}
        <div className="xl:hidden w-full max-w-full overflow-hidden bg-[#FFF4F4] dark:bg-slate-900 border-y border-[#FFE2E2] dark:border-slate-800 py-1.5 px-3">
          <div ref={mobileCategoryContainerRef} suppressHydrationWarning className="relative flex items-center space-x-1.5 overflow-x-auto no-scrollbar">
            {/* Home Pill (Icon Only on Mobile) */}
            <button
              onClick={() => {
                if (mobileCategoryContainerRef.current) {
                  mobileCategoryContainerRef.current.scrollTo({ left: 0, behavior: 'smooth' });
                }
                onSelectCategory('all');
              }}
              data-active={activeCategory === 'all' ? 'true' : 'false'}
              className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-bold transition-all flex items-center justify-center ${
                activeCategory === 'all'
                  ? 'bg-jagran-red text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}
              title="Home"
              aria-label="Home"
            >
              <Home className="w-3.5 h-3.5" />
            </button>

            {/* Dynamic Category Pills */}
            {(navCategories.length > 0
              ? navCategories.filter(c => c.slug !== 'all' && c.isActive)
              : mockCategoryTabs.filter((t: any) => t.slug !== 'all').map((t: any) => ({
                  id: t.id,
                  name: t.label.en,
                  slug: t.slug
                }))
            ).map((tab: any) => {
              const isActive = isTabActive(tab.slug, activeCategory);
              return (
                <button
                  key={`mobile-pill-${tab.id || tab.slug}`}
                  data-active={isActive ? 'true' : 'false'}
                  onClick={() => {
                    onSelectCategory(tab.slug);
                  }}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-jagran-red text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:text-jagran-red'
                  }`}
                >
                  {String(tab.name || tab.label?.en || tab.slug || '').toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. DESKTOP CATEGORIES NAVIGATION STRIP (Soft Pink Tint bg-[#FFF4F4]) */}
        <nav className="hidden xl:block bg-[#FFF4F4] dark:bg-slate-900 border-y border-[#FFE2E2] dark:border-slate-800 py-1 relative z-30 overflow-visible">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 relative overflow-visible">
            <ul className="flex items-center justify-between text-[12px] lg:text-[13px] font-bold text-slate-800 dark:text-slate-200">
              {/* Home Icon */}
              <li className="shrink-0">
                <button
                  onClick={() => onSelectCategory('all')}
                  className="py-2 px-2 flex items-center hover:opacity-80 transition-opacity"
                  title="Home"
                >
                  <svg className="w-5 h-5 text-slate-950 fill-slate-950 dark:text-white dark:fill-white" viewBox="0 0 24 24">
                    <path d="M12 3L2 12h3v8h5v-6h4v6h5v-8h3L12 3zm5 3h2v4.25l-2-1.8V6z" />
                  </svg>
                </button>
              </li>

              {/* Dynamic Categories: First 11 in Main Strip */}
              {(navCategories.length > 0
                ? navCategories.filter(c => c.slug !== 'all' && c.isActive).slice(0, 11)
                : mockCategoryTabs.filter((t: any) => t.slug !== 'all').slice(0, 11).map((t: any) => ({
                    id: t.id,
                    name: t.label.en,
                    slug: t.slug
                  }))
              ).map((tab: any) => {
                const isActive = isTabActive(tab.slug, activeCategory);
                return (
                  <li key={tab.id || tab.slug} className="whitespace-nowrap shrink-0">
                    <button
                      onClick={() => onSelectCategory(tab.slug)}
                      className={`block w-full text-left py-2 px-2 lg:px-2.5 transition-colors uppercase tracking-tight ${
                        isActive
                          ? 'text-jagran-red font-black'
                          : 'text-slate-800 dark:text-slate-200 hover:text-jagran-red'
                      }`}
                    >
                      {String(tab.name || tab.label?.en || tab.slug || '').toUpperCase()}
                    </button>
                  </li>
                );
              })}

              {/* Desktop: MORE dropdown */}
              <li
                ref={moreDropdownRef}
                onMouseEnter={() => setIsMoreOpen(true)}
                onMouseLeave={() => setIsMoreOpen(false)}
                className="relative group whitespace-nowrap shrink-0"
              >
                {(() => {
                  const moreList = (navCategories.length > 0
                    ? navCategories.filter(c => c.slug !== 'all' && c.isActive).slice(11)
                    : mockCategoryTabs.filter((t: any) => t.slug !== 'all').slice(11).map((t: any) => ({
                        id: t.id,
                        name: t.label.en,
                        slug: t.slug
                      }))
                  );
                  const isMoreCategoryActive = moreList.some((c: any) => isTabActive(c.slug, activeCategory));
                  return (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsMoreOpen(prev => !prev);
                        }}
                        className={`flex items-center space-x-0.5 py-2 px-2 lg:px-2.5 transition-colors uppercase tracking-tight cursor-pointer select-none ${
                          isMoreOpen || isMoreCategoryActive
                            ? 'text-jagran-red font-black'
                            : 'text-slate-800 dark:text-slate-200 hover:text-jagran-red'
                        }`}
                        aria-expanded={isMoreOpen}
                      >
                        <span className="font-bold text-[12px] lg:text-[13px]">MORE</span>
                        <MoreVertical className="w-3.5 h-3.5 -mr-1 text-slate-900 dark:text-slate-200" />
                      </button>

                      {/* Dropdown Menu */}
                      <div
                        className={`absolute right-0 top-full z-[9999] min-w-[150px] ${
                          isMoreOpen ? 'block' : 'hidden group-hover:block'
                        }`}
                        style={{ marginTop: '0px' }}
                      >
                        <div className="bg-[#FFF4F4] dark:bg-slate-900 border border-[#FFE2E2] dark:border-slate-800 shadow-lg py-1.5 px-1 divide-y divide-[#ffe2e2]/60 dark:divide-slate-800 max-h-72 overflow-y-auto">
                          {moreList.map((cat: any) => {
                            const isCatActive = isTabActive(cat.slug, activeCategory);
                            return (
                              <button
                                key={cat.id || cat.slug}
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  onSelectCategory(cat.slug);
                                  setIsMoreOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors uppercase whitespace-nowrap block ${
                                  isCatActive
                                    ? 'text-jagran-red bg-red-50 dark:bg-red-950/40'
                                    : 'text-slate-700 dark:text-slate-300 hover:text-jagran-red hover:bg-white/60 dark:hover:bg-slate-800'
                                }`}
                              >
                                {String(cat.name || cat.label?.en || cat.slug || '').toUpperCase()}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </li>
            </ul>
          </div>
        </nav>

        {/* 5. NATIVE MOBILE APP DRAWER MODAL OVERLAY */}
        {mobileMenuOpen && (
          <div className="xl:hidden fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
            {/* Dark Backdrop */}
            <div
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-fade-in touch-none cursor-pointer"
            />

            {/* Drawer Content - Slides in from the RIGHT */}
            <div className="relative w-[85vw] max-w-xs bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl z-10 overflow-hidden border-l border-slate-200 dark:border-slate-800 animate-in slide-in-from-right duration-200">
              {/* Drawer Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
                <Link href="/" onClick={() => setMobileMenuOpen(false)} className="flex items-center shrink-0" title="Vartiq">
                  <img
                    src="/vartiq-logo.png"
                    alt="Vartiq"
                    className="h-9 sm:h-10 w-auto object-contain select-none transform scale-x-[1.15] origin-left dark:hidden"
                  />
                  <img
                    src="/vartiq-logo-dark.png"
                    alt="Vartiq"
                    className="h-9 sm:h-10 w-auto object-contain select-none transform scale-x-[1.15] origin-left hidden dark:block"
                  />
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Quick Actions */}
              <div className="p-3 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-2 bg-slate-50/50 dark:bg-slate-900">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenEPaper();
                  }}
                  className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-jagran-red border border-red-200 dark:border-red-900/50 text-xs font-bold"
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>ePaper</span>
                </button>
                <button
                  onClick={() => {
                    toggleTheme();
                  }}
                  className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold"
                >
                  {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
              </div>

              {/* Drawer Categories Scroll List */}
              <div className="flex-1 overflow-y-auto overscroll-contain header-drawer-scrollable p-3 space-y-1 touch-pan-y">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1">
                  All Sections
                </div>
                <button
                  onClick={() => {
                    onSelectCategory('all');
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold uppercase transition-colors ${
                    activeCategory === 'all'
                      ? 'bg-red-50 dark:bg-red-950/40 text-jagran-red font-black'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <Home className="w-4 h-4 text-slate-400" />
                    <span>Home</span>
                  </span>
                </button>

                {(navCategories.length > 0
                  ? navCategories.filter(c => c.slug !== 'all' && c.isActive)
                  : mockCategoryTabs.filter((t: any) => t.slug !== 'all').map((t: any) => ({
                      id: t.id,
                      name: t.label.en,
                      slug: t.slug
                    }))
                ).map((cat: any) => {
                  const isActive = isTabActive(cat.slug, activeCategory);
                  return (
                    <button
                      key={`drawer-${cat.id || cat.slug}`}
                      onClick={() => {
                        onSelectCategory(cat.slug);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold uppercase transition-colors ${
                        isActive
                          ? 'bg-red-50 dark:bg-red-950/40 text-jagran-red font-black'
                          : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <span>{String(cat.name || cat.label?.en || cat.slug || '').toUpperCase()}</span>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-jagran-red" />}
                    </button>
                  );
                })}
              </div>

              {/* Drawer Footer */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
                <span>Vartiq News • 2026</span>
                <button
                  onClick={() => router.push('/videos')}
                  className="text-jagran-red font-bold hover:underline"
                >
                  Live TV
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 4. "IN FOCUS" TOPIC PILLS BAR (Temporarily commented out for preview) */}
      {/* {shouldShowInFocus && (
        <div className="w-full bg-white dark:bg-brand-navy border-b border-slate-200 dark:border-slate-800 py-2 sm:py-2.5">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 flex items-center justify-start space-x-2.5 text-xs overflow-x-auto no-scrollbar">
            <div className="font-extrabold text-slate-900 dark:text-white shrink-0 pr-1 text-xs uppercase tracking-wider">
              In Focus:
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              {mockInFocusPills.map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => router.push(`/article/${pill.articleId || 'hl-1'}`)}
                  className="px-3 py-1 rounded-full bg-[#f2f2f2] hover:bg-black hover:text-white dark:bg-slate-800 dark:hover:bg-jagran-red dark:hover:text-white text-slate-800 dark:text-slate-200 font-semibold text-[11px] whitespace-nowrap transition-colors cursor-pointer"
                >
                  {pill.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )} */}

      {/* Live Video Hub Modal */}
      <VideoModal isOpen={isVideoModalOpen} onClose={() => setIsVideoModalOpen(false)} />
    </>
  );
};
