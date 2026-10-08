'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import {
  mockCategoryTabs,
  mockInFocusPills
} from '@/data/mockNewsData';
import { articleService } from '@/services/articleService';
import { prewarmBackend } from '@/services/epaperService';
import { VideoModal } from './VideoModal';
import { Search, Video, User, Home, Sun, Moon, FileText, Menu, X, ChevronDown, Languages, Globe, Play, Sparkles, MoreVertical } from 'lucide-react';

interface HeaderProps {
  onOpenSearch: () => void;
  activeCategory: string;
  onSelectCategory: (slug: string) => void;
  showInFocus?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onOpenSearch, activeCategory, onSelectCategory, showInFocus }) => {
  const router = useRouter();
  const pathname = usePathname();
  const shouldShowInFocus = showInFocus !== undefined ? showInFocus : (pathname === '/');
  const { theme, toggleTheme } = useTheme();
  const { language, supportedLanguages, t, toggleLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [formattedDate, setFormattedDate] = useState('Sun, Sep 20, 2026 | Updated 04:14 PM IST');
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
    const currentDate = new Date();
    const timeString = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toUpperCase();
    setFormattedDate(`Sun, Sep 20, 2026 | Updated ${timeString} IST`);

    // Silently pre-warm backend so ePaper / API is instantly awake
    prewarmBackend();
  }, []);

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

  return (
    <>
      <header className={`sticky top-0 z-40 w-full bg-white dark:bg-brand-navy border-b border-slate-200 dark:border-slate-800 transition-transform duration-300 ease-in-out ${isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}>

        {/* 1. TOP BLACK TIMESTAMP STRIP */}
        <div className="bg-black text-white text-[11px] py-1.5 hidden lg:block border-b border-slate-800">
          <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 flex items-center justify-between min-h-[30px]">
            <span suppressHydrationWarning className="font-sans font-medium tracking-tight text-slate-200 flex items-center my-auto">
              {formattedDate}
            </span>
            <div className="flex items-center space-x-3.5 text-[11px] my-auto">
              <button
                onClick={toggleTheme}
                className="flex items-center space-x-1 text-slate-300 hover:text-amber-400 transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-300" />}
                <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
              <span className="opacity-40">•</span>
              <button
                onClick={handleOpenEPaper}
                onMouseEnter={prewarmBackend}
                className="text-slate-300 hover:text-amber-400 font-medium"
              >
                E-Paper
              </button>
            </div>
          </div>
        </div>

        {/* 2. MAIN LOGO & ACTION BAR (3-Column Centered Layout) */}
        <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 py-3 lg:py-3.5 flex items-center justify-between gap-4">

          {/* Left Column: Brand Logo with Sun Emblem */}
          <div className="flex items-center space-x-3 shrink-0">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded text-slate-800 dark:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div
              onClick={() => onSelectCategory('all')}
              className="flex items-center space-x-2.5 cursor-pointer group"
            >
              {/* The Daily Jagran Sun Icon */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-gradient-to-tr from-amber-500 via-jagran-red to-orange-500 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
                <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
              </div>
              <div>
                <span className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-[#E43854] block leading-none pb-0.5">
                  THE
                </span>
                <span className="text-2xl sm:text-3xl font-black font-serif tracking-tight text-slate-900 dark:text-white group-hover:text-[#E43854] transition-colors leading-none">
                  NEWSPAPER
                </span>
              </div>
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
              className="hidden sm:flex items-center space-x-2 h-9 px-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-bold transition-all shadow-xs group cursor-pointer"
              title="Read Today's ePaper"
            >
              <FileText className="w-4 h-4 text-jagran-red group-hover:scale-110 transition-transform" />
              <span className="tracking-wide">ePaper</span>
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
              <span className="tracking-wide">Videos</span>
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping ml-0.5" />
            </button>

            {/* Mobile ePaper Quick Action Button */}
            <button
              onClick={handleOpenEPaper}
              onMouseEnter={prewarmBackend}
              className="sm:hidden flex items-center space-x-1.5 h-8 px-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 text-jagran-red border border-red-200 dark:border-red-900/50 rounded-md text-[11px] font-bold transition-all shadow-2xs"
              title="ePaper"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>ePaper</span>
            </button>

            {/* Mobile Search Button (Visible on smallest screens) */}
            <button
              onClick={onOpenSearch}
              className="sm:hidden w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300"
              title="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* User Profile Avatar */}
            <button
              onClick={() => alert('User login profile')}
              className="w-9 h-9 rounded-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center transition-colors"
              title="User Account"
            >
              <User className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 3. CATEGORIES NAVIGATION STRIP (Soft Pink Tint bg-[#FFF4F4], equal spacing across full width) */}
        <nav className={`${mobileMenuOpen ? 'block' : 'hidden'} lg:block bg-[#FFF4F4] dark:bg-slate-900 border-y border-[#FFE2E2] dark:border-slate-800 py-1 relative z-50 overflow-visible`}>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-8 lg:px-10 relative overflow-visible">
            <ul className="flex flex-col lg:flex-row items-stretch lg:items-center lg:justify-between overflow-x-auto lg:overflow-visible no-scrollbar text-[12px] lg:text-[13px] font-bold text-slate-800 dark:text-slate-200">
              {/* Home Icon (Exact Chimney Solid Home Icon Match) */}
              <li className="hidden lg:block shrink-0">
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

              {/* Mobile Drawer E-Paper Link */}
              <li className="lg:hidden border-b border-red-100 dark:border-slate-800 pb-1 mb-1">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleOpenEPaper();
                  }}
                  className="w-full flex items-center space-x-2 py-2 px-2 text-jagran-red font-black uppercase tracking-tight text-xs"
                >
                  <FileText className="w-4 h-4" />
                  <span>डिजिटल ई-पेपर (ePaper)</span>
                </button>
              </li>

              {mockCategoryTabs.filter((t: any) => t.slug !== 'all').map((tab: any) => {
                const isActive = activeCategory === tab.slug;
                return (
                  <li key={tab.id} className="whitespace-nowrap shrink-0">
                    <button
                      onClick={() => {
                        onSelectCategory(tab.slug);
                        setMobileMenuOpen(false);
                      }}
                      className={`block w-full text-left py-2 px-2 lg:px-2.5 transition-colors uppercase tracking-tight ${isActive
                        ? 'text-jagran-red font-black'
                        : 'text-slate-800 dark:text-slate-200 hover:text-jagran-red'
                        }`}
                    >
                      {tab.label.en}
                    </button>
                  </li>
                );
              })}

              {/* Mobile Only: Fashion & Beauty Link */}
              <li className="lg:hidden whitespace-nowrap shrink-0">
                <button
                  onClick={() => {
                    onSelectCategory('fashion');
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-1.5 w-full text-left py-2 px-2 transition-colors uppercase tracking-tight ${
                    activeCategory === 'fashion'
                      ? 'text-jagran-red font-black'
                      : 'text-slate-800 dark:text-slate-200 hover:text-jagran-red'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>FASHION & BEAUTY</span>
                </button>
              </li>

              {/* Desktop: MORE dropdown with Hover & Click (Matching exact portal design) */}
              <li
                ref={moreDropdownRef}
                onMouseEnter={() => setIsMoreOpen(true)}
                onMouseLeave={() => setIsMoreOpen(false)}
                className="hidden lg:block relative group whitespace-nowrap shrink-0"
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsMoreOpen(prev => !prev);
                  }}
                  className={`flex items-center space-x-0.5 py-2 px-2 lg:px-2.5 transition-colors uppercase tracking-tight cursor-pointer select-none ${
                    isMoreOpen || activeCategory === 'fashion'
                      ? 'text-jagran-red font-black'
                      : 'text-slate-800 dark:text-slate-200 hover:text-jagran-red'
                  }`}
                  aria-expanded={isMoreOpen}
                >
                  <span className="font-bold text-[12px] lg:text-[13px]">MORE</span>
                  <MoreVertical className="w-3.5 h-3.5 -mr-1 text-slate-900 dark:text-slate-200" />
                </button>

                {/* Dropdown Menu (Exact match to screenshot with #FFF4F4 background) */}
                <div
                  className={`absolute right-0 top-full z-[9999] min-w-[140px] ${
                    isMoreOpen ? 'block' : 'hidden group-hover:block'
                  }`}
                  style={{ marginTop: '0px' }}
                >
                  <div className="bg-[#FFF4F4] dark:bg-slate-900 border border-[#FFE2E2] dark:border-slate-800 shadow-lg py-1.5 px-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onSelectCategory('fashion');
                        setIsMoreOpen(false);
                      }}
                      className={`block w-full text-left py-2 px-3 text-[12px] lg:text-[13px] uppercase tracking-tight font-bold transition-colors cursor-pointer ${
                        activeCategory === 'fashion'
                          ? 'text-jagran-red font-black'
                          : 'text-slate-800 dark:text-slate-200 hover:text-jagran-red hover:bg-[#ffe8e8] dark:hover:bg-slate-800'
                      }`}
                    >
                      FASHION
                    </button>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </nav>

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
