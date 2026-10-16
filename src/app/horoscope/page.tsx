'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SearchModal } from '@/components/common/SearchModal';
import { horoscopeService, HoroscopeData } from '@/services/horoscopeService';
import { articleService, ArticleData } from '@/services/articleService';
import {
  Sparkles, Heart, Star, ChevronRight, Home, Calendar, Clock, Eye,
  Compass, RefreshCw, ArrowRight, ShieldCheck, TrendingUp,
  Palette, Gem, Zap, Activity, Check, Copy
} from 'lucide-react';
import { stripHtml } from '@/utils/textUtils';

// 12 Zodiac signs with details
const ZODIAC_SIGNS = [
  { id: 'aries', name: 'Aries', hindi: 'मेष', dates: 'MAR 21 - APR 19' },
  { id: 'taurus', name: 'Taurus', hindi: 'वृषभ', dates: 'APR 20 - MAY 20' },
  { id: 'gemini', name: 'Gemini', hindi: 'मिथुन', dates: 'MAY 21 - JUN 21' },
  { id: 'cancer', name: 'Cancer', hindi: 'कर्क', dates: 'JUN 21 - JUL 22' },
  { id: 'leo', name: 'Leo', hindi: 'सिंह', dates: 'JUL 23 - AUG 22' },
  { id: 'virgo', name: 'Virgo', hindi: 'कन्या', dates: 'AUG 23 - SEP 22' },
  { id: 'libra', name: 'Libra', hindi: 'तुला', dates: 'SEP 23 - OCT 22' },
  { id: 'scorpio', name: 'Scorpio', hindi: 'वृश्चिक', dates: 'OCT 23 - NOV 21' },
  { id: 'sagittarius', name: 'Sagittarius', hindi: 'धनु', dates: 'NOV 22 - DEC 21' },
  { id: 'capricorn', name: 'Capricorn', hindi: 'मकर', dates: 'DEC 22 - JAN 19' },
  { id: 'aquarius', name: 'Aquarius', hindi: 'कुंभ', dates: 'JAN 20 - FEB 18' },
  { id: 'pisces', name: 'Pisces', hindi: 'मीन', dates: 'FEB 19 - MAR 20' },
];

const isValidImageUrl = (url?: string | null) => {
  if (!url) return false;
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/') || url.startsWith('data:');
};

const getSignImage = (signId: string, dynamicUrl?: string | null): string | null => {
  if (dynamicUrl && isValidImageUrl(dynamicUrl)) {
    return dynamicUrl;
  }
  return null;
};

// Default Astrological Traits for all 12 Zodiac signs (Astrology Reference)
const DEFAULT_SIGN_TRAITS: Record<string, {
  luckyColour: string;
  luckyGemstone: string;
  luckyDay: string;
  luckyNumber: string;
  rulingPlanet: string;
  compatibleSign: string;
}> = {
  aries: {
    luckyColour: 'Red',
    luckyGemstone: 'Carnelian, Bloodstone',
    luckyDay: 'Tuesday & Saturday',
    luckyNumber: '1, 9',
    rulingPlanet: 'Mars',
    compatibleSign: 'Leo & Sagittarius'
  },
  taurus: {
    luckyColour: 'White and Green',
    luckyGemstone: 'Diamond, Coral, Emerald',
    luckyDay: 'Mondays, Fridays, Saturdays',
    luckyNumber: '1, 9',
    rulingPlanet: 'Venus',
    compatibleSign: 'Scorpio, Virgo'
  },
  gemini: {
    luckyColour: 'Light Yellow & Green',
    luckyGemstone: 'Emerald, Agate',
    luckyDay: 'Wednesday',
    luckyNumber: '5, 3',
    rulingPlanet: 'Mercury',
    compatibleSign: 'Libra & Aquarius'
  },
  cancer: {
    luckyColour: 'Silver & Cream',
    luckyGemstone: 'Pearl, Moonstone',
    luckyDay: 'Monday & Thursday',
    luckyNumber: '2, 7',
    rulingPlanet: 'Moon',
    compatibleSign: 'Scorpio & Pisces'
  },
  leo: {
    luckyColour: 'Gold & Orange',
    luckyGemstone: 'Ruby, Amber',
    luckyDay: 'Sunday',
    luckyNumber: '1, 5',
    rulingPlanet: 'Sun',
    compatibleSign: 'Aries & Sagittarius'
  },
  virgo: {
    luckyColour: 'Green & White',
    luckyGemstone: 'Emerald, Sapphire',
    luckyDay: 'Wednesday',
    luckyNumber: '3, 5',
    rulingPlanet: 'Mercury',
    compatibleSign: 'Taurus & Capricorn'
  },
  libra: {
    luckyColour: 'Pastel Blue & Rose Pink',
    luckyGemstone: 'Diamond, Opal',
    luckyDay: 'Friday',
    luckyNumber: '6, 7',
    rulingPlanet: 'Venus',
    compatibleSign: 'Gemini & Aquarius'
  },
  scorpio: {
    luckyColour: 'Deep Red & Maroon',
    luckyGemstone: 'Red Coral, Topaz',
    luckyDay: 'Tuesday',
    luckyNumber: '8, 9',
    rulingPlanet: 'Mars & Pluto',
    compatibleSign: 'Cancer & Pisces'
  },
  sagittarius: {
    luckyColour: 'Golden Yellow & Purple',
    luckyGemstone: 'Yellow Sapphire, Turquoise',
    luckyDay: 'Thursday',
    luckyNumber: '3, 9',
    rulingPlanet: 'Jupiter',
    compatibleSign: 'Aries & Leo'
  },
  capricorn: {
    luckyColour: 'Navy Blue & Charcoal',
    luckyGemstone: 'Blue Sapphire, Onyx',
    luckyDay: 'Saturday',
    luckyNumber: '4, 8',
    rulingPlanet: 'Saturn',
    compatibleSign: 'Taurus & Virgo'
  },
  aquarius: {
    luckyColour: 'Electric Blue & Aquamarine',
    luckyGemstone: 'Amethyst, Blue Sapphire',
    luckyDay: 'Saturday',
    luckyNumber: '4, 7',
    rulingPlanet: 'Saturn & Uranus',
    compatibleSign: 'Gemini & Libra'
  },
  pisces: {
    luckyColour: 'Sea Green & Yellow',
    luckyGemstone: 'Yellow Sapphire, Aquamarine',
    luckyDay: 'Thursday',
    luckyNumber: '3, 7',
    rulingPlanet: 'Jupiter & Neptune',
    compatibleSign: 'Cancer & Scorpio'
  }
};

const PERIOD_TABS: Array<{ id: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'LOVE'; label: string }> = [
  { id: 'DAILY', label: 'DAILY' },
  { id: 'WEEKLY', label: 'WEEKLY' },
  { id: 'MONTHLY', label: 'MONTHLY' },
  { id: 'YEARLY', label: 'YEARLY' },
  { id: 'LOVE', label: 'LOVE' },
];

function HoroscopeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const signParam = searchParams.get('sign');

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSign, setActiveSign] = useState(() => {
    if (signParam && ZODIAC_SIGNS.some(s => s.id === signParam.toLowerCase())) {
      return signParam.toLowerCase();
    }
    return 'aries';
  });
  const [activePeriod, setActivePeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'LOVE'>('DAILY');

  const [horoscopeData, setHoroscopeData] = useState<HoroscopeData | null>(null);
  const [allSignsMap, setAllSignsMap] = useState<Record<string, HoroscopeData>>({});
  const [loading, setLoading] = useState(true);

  // Fetch all 12 signs to get dynamic images and icons from MySQL database
  useEffect(() => {
    let isMounted = true;
    async function loadAllSigns() {
      try {
        const data = await horoscopeService.getAllHoroscopes('DAILY');
        if (isMounted && Array.isArray(data)) {
          const map: Record<string, HoroscopeData> = {};
          data.forEach((item) => {
            if (item.sign) {
              map[item.sign.toLowerCase()] = item;
            }
          });
          setAllSignsMap(map);
        }
      } catch (err) {
        console.error('Error fetching all horoscopes:', err);
      }
    }
    loadAllSigns();
    return () => { isMounted = false; };
  }, []);

  // Horoscope News Articles & Top News from database (10 per page)
  const [newsArticles, setNewsArticles] = useState<ArticleData[]>([]);
  const [topArticles, setTopArticles] = useState<ArticleData[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (signParam && ZODIAC_SIGNS.some(s => s.id === signParam.toLowerCase())) {
      setActiveSign(signParam.toLowerCase());
    }
  }, [signParam]);

  const selectedSignMeta = ZODIAC_SIGNS.find(s => s.id === activeSign) || ZODIAC_SIGNS[0];
  const defaultTraits = DEFAULT_SIGN_TRAITS[activeSign] || DEFAULT_SIGN_TRAITS.aries;

  // Fetch Active Horoscope Data from Express Backend API
  useEffect(() => {
    let isMounted = true;
    async function loadHoroscope() {
      try {
        setLoading(true);
        const data = await horoscopeService.getHoroscope(activeSign, activePeriod);
        if (isMounted) {
          setHoroscopeData(data);
        }
      } catch (err) {
        console.error('Error fetching horoscope:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadHoroscope();
    return () => { isMounted = false; };
  }, [activeSign, activePeriod]);

  // Fetch Horoscope News Articles from database (Strict 10 limit on page 1)
  useEffect(() => {
    async function loadArticles() {
      try {
        setArticlesLoading(true);
        const [horoscopeRes, generalRes] = await Promise.all([
          articleService.getArticles({ category: 'horoscope', page: 1, limit: 10 }),
          articleService.getArticles({ limit: 6, isTrending: true })
        ]);
        setNewsArticles(horoscopeRes.articles || []);
        if (horoscopeRes.pagination) {
          setTotalPages(horoscopeRes.pagination.totalPages || 1);
        }
        setTopArticles(generalRes.articles || []);
      } catch (err) {
        console.error('Error loading horoscope news:', err);
      } finally {
        setArticlesLoading(false);
      }
    }
    loadArticles();
  }, []);

  // Handle Load More click for Horoscope
  const handleLoadMore = async () => {
    if (isLoadingMore || page >= totalPages) return;
    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      const res = await articleService.getArticles({
        category: 'horoscope',
        page: nextPage,
        limit: 10
      });
      if (res.articles && res.articles.length > 0) {
        setNewsArticles((prev) => [...prev, ...res.articles]);
        setPage(nextPage);
        if (res.pagination) {
          setTotalPages(res.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Error loading more articles:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const getSignImage = (signId: string): string | null => {
    const s = signId.toLowerCase();
    if (s === activeSign && horoscopeData) {
      const activeUrl = horoscopeData.iconUrl || (horoscopeData as any)?.image || (isValidImageUrl(horoscopeData.hindiName) ? horoscopeData.hindiName : null);
      if (activeUrl && isValidImageUrl(activeUrl)) return activeUrl;
    }
    const signData = allSignsMap[s];
    if (signData) {
      const dynamicUrl = signData.iconUrl || (signData as any)?.image || (isValidImageUrl(signData.hindiName) ? signData.hindiName : null);
      if (dynamicUrl && isValidImageUrl(dynamicUrl)) return dynamicUrl;
    }
    return null;
  };

  const [copied, setCopied] = useState(false);

  const handleCopyReading = () => {
    const textToCopy = `${selectedSignMeta.name} (${activePeriod}) Horoscope:\n${horoscopeData?.prediction || ''}\n\nLucky Colour: ${horoscopeData?.luckyColour || defaultTraits.luckyColour}\nLucky Number: ${horoscopeData?.luckyNumber || defaultTraits.luckyNumber}\nRemedy: ${horoscopeData?.remedy || ''}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const activeImage = getSignImage(activeSign);

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <Header
        activeCategory="horoscope"
        onOpenSearch={() => setIsSearchOpen(true)}
        onSelectCategory={(slug) => {
          if (slug === 'all') {
            router.push('/');
          } else if (slug === 'videos') {
            router.push('/videos');
          } else if (slug === 'horoscope') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            router.push(`/${slug}`);
          }
        }}
      />

      {/* 1. TOP MAROON 12 ZODIAC CAROUSEL STRIP (Unique Luxury 3D Medallions - Screenshot 1 & 3) */}
      <section className="bg-gradient-to-r from-[#5C0E1A] via-[#6B111E] to-[#4A0A12] text-white pt-6 pb-7 px-4 shadow-lg relative overflow-hidden">
        {/* Subtle Constellation Dot Grid Pattern */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-3 py-3">
            {ZODIAC_SIGNS.map((sign) => {
              const isSelected = sign.id === activeSign;
              return (
                <button
                  key={sign.id}
                  onClick={() => {
                    setActiveSign(sign.id);
                    if (typeof window !== 'undefined') {
                      window.history.replaceState(null, '', `/horoscope?sign=${sign.id}`);
                    }
                  }}
                  className={`flex flex-col items-center shrink-0 px-3 py-2.5 rounded-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#35070E] border-2 border-amber-400 shadow-lg shadow-black/40'
                      : 'border-2 border-transparent hover:bg-white/10 opacity-90 hover:opacity-100 group'
                  }`}
                >
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden flex items-center justify-center transition-transform ${
                      isSelected
                        ? 'border-2 border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                        : 'border-2 border-white/80 shadow-xs group-hover:scale-105'
                    }`}
                  >
                    {getSignImage(sign.id) ? (
                      <img
                        src={getSignImage(sign.id)!}
                        alt={sign.name}
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : null}
                  </div>
                  <span className={`text-xs sm:text-sm font-black mt-2 tracking-tight ${
                    isSelected ? 'text-amber-300' : 'text-white'
                  }`}>
                    {sign.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Content Body */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-10">

        {/* 2. BREADCRUMB */}
        <nav className="hidden md:flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
          <Link href="/" className="hover:text-red-600 flex items-center space-x-1">
            <Home className="w-3.5 h-3.5" />
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/horoscope" className="hover:text-red-600">
            HOROSCOPE
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-800 font-black">
            {selectedSignMeta.name} {activePeriod}
          </span>
        </nav>

        {/* 3. SHOWCASE SPOTLIGHT: Celestial Luxury Cosmic Card (Unique & Luxury - Screenshot 2) */}
        <section className="relative rounded-3xl overflow-hidden shadow-2xl border border-amber-400/25 bg-gradient-to-br from-[#0B0F19] via-[#12192E] to-[#1E1238] text-white p-6 sm:p-10 lg:p-12">
          {/* Subtle Celestial Constellation Grid & Ambient Astral Glow */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: 3D Zodiac Medallion Relic with Glowing Cosmic Halo (Centered) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center text-center self-center my-auto">
              <div className="relative group">
                {/* Glowing Outer Astral Aura */}
                <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/30 via-yellow-400/20 to-purple-600/30 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition duration-500" />

                {/* Framed Circular Medallion (Centered) */}
                <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full p-2.5 bg-gradient-to-b from-amber-400/40 via-white/5 to-amber-600/40 border border-amber-400/50 shadow-2xl backdrop-blur-md flex items-center justify-center">
                  {activeImage ? (
                    <img
                      src={activeImage}
                      alt={selectedSignMeta.name}
                      className="w-full h-full object-cover rounded-full shadow-inner transform group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : null}
                </div>
              </div>
            </div>

            {/* Right: Heading + 6 Glassmorphic Power Attribute Tiles (2 columns, 3 rows = 6 tiles total) */}
            <div className="lg:col-span-7 space-y-6 my-auto">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif tracking-tight leading-tight text-white">
                  <span className="bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-400 bg-clip-text text-transparent">
                    {selectedSignMeta.name}
                  </span>{' '}
                  <span>
                    {activePeriod === 'DAILY' ? 'Daily' : activePeriod.charAt(0) + activePeriod.slice(1).toLowerCase()} Horoscope
                  </span>
                </h1>

                <p className="text-xs sm:text-sm text-slate-400 font-medium tracking-wide flex items-center space-x-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Planetary Alignment Active Today</span>
                </p>
              </div>

              {/* 6 Glassmorphic Power Attribute Tiles (1 line 2 box, total 3 lines of 2 = 6 tiles) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-6">
                {/* 1. Lucky Colour */}
                <div className="group bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 hover:border-emerald-400/50 rounded-2xl p-4 transition-all duration-300 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-300">LUCKY COLOUR</span>
                    <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                      <Palette className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-black text-emerald-300">
                    {loading ? '...' : (horoscopeData?.luckyColour || defaultTraits.luckyColour)}
                  </p>
                </div>

                {/* 2. Lucky Gemstone */}
                <div className="group bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 hover:border-cyan-400/50 rounded-2xl p-4 transition-all duration-300 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-300">LUCKY GEMSTONE</span>
                    <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400">
                      <Gem className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-black text-white">
                    {loading ? '...' : (horoscopeData?.luckyGemstone || defaultTraits.luckyGemstone)}
                  </p>
                </div>

                {/* 3. Lucky Day */}
                <div className="group bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 hover:border-amber-400/50 rounded-2xl p-4 transition-all duration-300 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-300">LUCKY DAY</span>
                    <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-black text-white">
                    {loading ? '...' : (horoscopeData?.luckyDay || defaultTraits.luckyDay)}
                  </p>
                </div>

                {/* 4. Lucky Number */}
                <div className="group bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 hover:border-purple-400/50 rounded-2xl p-4 transition-all duration-300 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-300">LUCKY NUMBER</span>
                    <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-black text-amber-300">
                    {loading ? '...' : (horoscopeData?.luckyNumber || defaultTraits.luckyNumber)}
                  </p>
                </div>

                {/* 5. Ruling Planet */}
                <div className="group bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 hover:border-rose-400/50 rounded-2xl p-4 transition-all duration-300 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-300">RULING PLANET</span>
                    <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400">
                      <Compass className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-black text-white">
                    {loading ? '...' : (horoscopeData?.rulingPlanet || defaultTraits.rulingPlanet)}
                  </p>
                </div>

                {/* 6. Compatible Zodiac Sign */}
                <div className="group bg-white/[0.05] hover:bg-white/[0.09] backdrop-blur-md border border-white/10 hover:border-pink-400/50 rounded-2xl p-4 transition-all duration-300 shadow-sm">
                  <div className="flex items-center justify-between text-slate-400 text-xs font-bold mb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-300">COMPATIBLE SIGN</span>
                    <div className="p-1.5 rounded-lg bg-pink-500/20 text-pink-400">
                      <Heart className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-base sm:text-lg font-black text-white">
                    {loading ? '...' : (horoscopeData?.compatibleSign || defaultTraits.compatibleSign)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TIMEFRAME TABS & ELEVATED PREDICTION READING DESK (Saturday Luxury Design) */}
        <section className="space-y-6">
          {/* Modern Floating Capsule Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="bg-slate-100 p-1.5 rounded-2xl inline-flex items-center gap-1.5 border border-slate-200 shadow-2xs overflow-x-auto max-w-full">
              {PERIOD_TABS.map((tab) => {
                const isActive = tab.id === activePeriod;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePeriod(tab.id)}
                    className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center space-x-2 shrink-0 ${
                      isActive
                        ? 'bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white shadow-md shadow-red-600/25 scale-102'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                    }`}
                  >
                    <span>
                      {tab.id === 'DAILY' && '☀️'}
                      {tab.id === 'WEEKLY' && '🗓️'}
                      {tab.id === 'MONTHLY' && '🌙'}
                      {tab.id === 'YEARLY' && '🪐'}
                      {tab.id === 'LOVE' && '💖'}
                    </span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Elevated Reading Deck Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-md relative overflow-hidden space-y-7">
            {/* Ambient Card Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-50/50 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header Row: Transit Indicator */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-5 border-b border-slate-100 relative z-10">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-slate-700">Celestial Transit Forecast</span>
                  <span>•</span>
                  <span>{selectedSignMeta.name}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
                  {selectedSignMeta.name} {activePeriod.charAt(0) + activePeriod.slice(1).toLowerCase()} Cosmic Guidance
                </h3>
              </div>
            </div>

            {loading ? (
              <div className="py-16 text-center text-slate-400 text-xs font-semibold flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-red-600" />
                <span>Aligning planetary transits & constellations...</span>
              </div>
            ) : (
              <div className="space-y-6 relative z-10">
                {/* Main Prediction Paragraph in High-End Editorial Style */}
                <div className="relative pl-6 sm:pl-8 border-l-4 border-red-500/40">
                  <span className="absolute -top-3 -left-3 text-4xl font-serif text-red-300/40 select-none">&ldquo;</span>
                  <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-sans font-normal antialiased">
                    {horoscopeData?.prediction || `${selectedSignMeta.name} daily transit indicates positive energy, focus on consistency, and clear communication.`}
                  </p>
                </div>

                {/* Highlighted Sacred Vedic Remedy Card */}
                {horoscopeData?.remedy && (
                  <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-rose-500/10 border-l-4 border-amber-500 border-y border-r border-amber-200/70 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-2">
                    <div className="flex items-center space-x-2 text-amber-800 font-extrabold text-xs sm:text-sm uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Sacred Vedic Remedy & Alignment</span>
                    </div>
                    <p className="text-sm sm:text-base font-semibold text-slate-800 leading-relaxed pl-6">
                      {horoscopeData.remedy}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* 5. BOTTOM SECTION: "HOROSCOPE NEWS" + "TOP NEWS" SIDEBAR */}
        <section className="pt-6 border-t border-slate-200 space-y-6">
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 tracking-tight">
              HOROSCOPE NEWS
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Left 8 Cols: Horoscope News Feed */}
            <div className="lg:col-span-8 space-y-6 divide-y divide-slate-100">
              {articlesLoading ? (
                <div className="p-12 text-center text-slate-400 text-xs font-semibold">
                  Loading Horoscope News Stories...
                </div>
              ) : newsArticles.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100">
                  <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-700">No Horoscope Articles Published Yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Publish your first astrology article with category &quot;Horoscope&quot; in Admin CMS!
                  </p>
                </div>
              ) : (
                <>
                  {(() => {
                    const leadArticle = newsArticles[0] || null;
                    const feedArticles = newsArticles.slice(1);

                    return (
                      <>
                        {leadArticle && (
                          <article
                            onClick={() => router.push(`/article/${leadArticle.slug || leadArticle.id}`)}
                            className="w-full min-w-0 max-w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-all duration-300 group mb-6"
                          >
                            <div className="aspect-[16/9] w-full bg-slate-900 overflow-hidden relative">
                              <img
                                src={leadArticle.featuredImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80'}
                                alt={stripHtml(leadArticle.title)}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <span className="absolute top-3 left-3 bg-[#8E192B] text-white text-[11px] font-black px-3 py-1 rounded shadow uppercase tracking-wider">
                                {leadArticle.subCategory || 'HOROSCOPE'}
                              </span>
                            </div>

                            <div className="p-5 sm:p-6 space-y-3">
                              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white group-hover:text-[#8E192B] transition-colors leading-tight font-serif">
                                {stripHtml(leadArticle.title)}
                              </h2>
                              {leadArticle.subHeadline && (
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                                  {stripHtml(leadArticle.subHeadline)}
                                </p>
                              )}
                              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-[#8E192B]" />
                                  <span>
                                    {new Date(leadArticle.publishedAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </span>
                                <span className="font-bold text-[#8E192B] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                                  <span>Read Full Story</span>
                                  <ChevronRight className="w-4 h-4" />
                                </span>
                              </div>
                            </div>
                          </article>
                        )}

                        <div className="space-y-4 pt-2">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                              Recent Astrology Stories
                            </h3>
                          </div>

                          {feedArticles.map((art) => (
                            <article
                              key={art.id}
                              onClick={() => router.push(`/article/${art.slug || art.id}`)}
                              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-3 sm:p-4 shadow-sm hover:shadow-md cursor-pointer transition-all duration-200 group flex flex-row items-center gap-3 sm:gap-4"
                            >
                              {/* Left: Thumbnail Image */}
                              <div className="w-28 h-20 sm:w-44 sm:h-28 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200/80">
                                <img
                                  src={art.featuredImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80'}
                                  alt={stripHtml(art.title)}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              {/* Right: Article Details */}
                              <div className="flex-1 space-y-1.5 sm:space-y-2 min-w-0">
                                <span className="text-[10px] sm:text-xs font-black uppercase text-[#8E192B] block tracking-wider">
                                  {art.subCategory || 'Astro Forecast'}
                                </span>
                                <h3 className="text-xs sm:text-base font-bold font-serif text-slate-900 dark:text-white group-hover:text-[#8E192B] transition-colors leading-snug line-clamp-2 sm:line-clamp-3">
                                  {stripHtml(art.title)}
                                </h3>
                                {art.subHeadline && (
                                  <p className="hidden md:line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                                    {stripHtml(art.subHeadline)}
                                  </p>
                                )}
                                <div className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-2 pt-0.5">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  <span>
                                    {new Date(art.publishedAt).toLocaleDateString('en-US', {
                                      month: 'short',
                                      day: 'numeric',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>

                        {/* Load More Button for Horoscope */}
                        {page < totalPages && (
                          <div className="pt-6 text-center border-t border-slate-100">
                            <button
                              onClick={handleLoadMore}
                              disabled={isLoadingMore}
                              className="inline-flex items-center space-x-2 px-8 py-3 rounded-full bg-slate-900 hover:bg-[#8E192B] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs hover:shadow-md disabled:opacity-60 cursor-pointer"
                            >
                              {isLoadingMore ? (
                                <>
                                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                                  <span>Loading Articles...</span>
                                </>
                              ) : (
                                <>
                                  <span>Load More Stories</span>
                                  <ChevronRight className="w-3.5 h-3.5" />
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </>
              )}
            </div>

            {/* Right 4 Cols: TOP NEWS Sticky Sidebar (Hidden on Mobile, Visible on Desktop) */}
            <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-28 self-start space-y-5 border-l border-slate-100 lg:pl-8">
              <div className="border-b border-red-600 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-red-600 flex items-center space-x-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>TOP NEWS</span>
                </h3>
              </div>

              <div className="space-y-4 divide-y divide-slate-100">
                {topArticles.map((topArt, index) => (
                  <div key={topArt.id} className="pt-4 first:pt-0 flex items-start space-x-3.5 group">
                    <span className="text-xl font-serif font-black text-red-600/90 shrink-0 w-5">
                      {index + 1}
                    </span>
                    <Link
                      href={`/article/${topArt.slug || topArt.id}`}
                      className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-red-600 transition-colors line-clamp-3 leading-snug"
                    >
                      {stripHtml(topArt.title)}
                    </Link>
                  </div>
                ))}
              </div>
            </aside>
          </div>
        </section>

      </main>

      <Footer />
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
}

export default function HoroscopePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <HoroscopeContent />
    </Suspense>
  );
}
