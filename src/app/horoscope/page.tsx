'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { SearchModal } from '@/components/common/SearchModal';
import { horoscopeService, HoroscopeData } from '@/services/horoscopeService';
import { articleService, ArticleData } from '@/services/articleService';
import {
  Sparkles, Heart, Star, ChevronRight, Home, Calendar, Clock, Eye,
  Compass, RefreshCw, ArrowRight, ShieldCheck, TrendingUp
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

export default function HoroscopePage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSign, setActiveSign] = useState('aries');
  const [activePeriod, setActivePeriod] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'LOVE'>('DAILY');

  const [horoscopeData, setHoroscopeData] = useState<HoroscopeData | null>(null);
  const [loading, setLoading] = useState(true);

  // Horoscope News Articles & Top News from database (10 per page)
  const [newsArticles, setNewsArticles] = useState<ArticleData[]>([]);
  const [topArticles, setTopArticles] = useState<ArticleData[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const selectedSignMeta = ZODIAC_SIGNS.find(s => s.id === activeSign) || ZODIAC_SIGNS[0];
  const defaultTraits = DEFAULT_SIGN_TRAITS[activeSign] || DEFAULT_SIGN_TRAITS.aries;

  // Fetch Horoscope Data from Express Backend API
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

  // High Quality Mascot SVG illustrations for all 12 signs matching reference aesthetic
  const renderZodiacVector = (signId: string, sizeClass = 'w-12 h-12') => {
    const s = signId.toUpperCase();
    switch (s) {
      case 'ARIES':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Horn inner collar / loops */}
            <ellipse cx="23" cy="38" rx="7" ry="10" fill="#142848" />
            <ellipse cx="77" cy="38" rx="7" ry="10" fill="#142848" />

            {/* Ram Head in warm terracotta red */}
            <path
              d="M38 34C38 27 62 27 62 34C64 50 62 70 50 77C38 70 36 50 38 34Z"
              fill="#BF5147"
              stroke="#142848"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Left curled golden horn wrapping around */}
            <path
              d="M37 32C26 18 10 23 8 37C6 52 18 60 26 53C29 49 28 43 24 44C19 45 17 52 14 46C11 40 14 29 24 27C32 25 36 30 38 35Z"
              fill="#F5CD82"
              stroke="#142848"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Right curled golden horn wrapping around */}
            <path
              d="M63 32C74 18 90 23 92 37C94 52 82 60 74 53C71 49 72 43 76 44C81 45 83 52 86 46C89 40 86 29 76 27C68 25 64 30 62 35Z"
              fill="#F5CD82"
              stroke="#142848"
              strokeWidth="3.5"
              strokeLinejoin="round"
            />

            {/* Ram Muzzle / Snout in golden cream */}
            <path
              d="M44 68C44 63 47 61 50 61C53 61 56 63 56 68C56 74 53 76 50 76C47 76 44 74 44 68Z"
              fill="#F5CD82"
              stroke="#142848"
              strokeWidth="2.5"
            />
            {/* Cute nostril dots */}
            <ellipse cx="48" cy="69" rx="1.2" ry="1" fill="#BF5147" />
            <ellipse cx="52" cy="69" rx="1.2" ry="1" fill="#BF5147" />

            {/* Ram Eyes */}
            <ellipse cx="43" cy="48" rx="2.5" ry="3.5" fill="#142848" />
            <ellipse cx="57" cy="48" rx="2.5" ry="3.5" fill="#142848" />
          </svg>
        );
      case 'TAURUS':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Golden horns curving up */}
            <path
              d="M28 36C22 20 25 10 33 13C40 16 34 26 30 30"
              fill="#F5CD82"
              stroke="#142848"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            <path
              d="M72 36C78 20 75 10 67 13C60 16 66 26 70 30"
              fill="#F5CD82"
              stroke="#142848"
              strokeWidth="3.5"
              strokeLinecap="round"
            />
            {/* Bull Head */}
            <path
              d="M50 76C62 76 70 64 70 48C70 36 62 32 50 32C38 32 30 36 30 48C30 64 38 76 50 76Z"
              fill="#748DC7"
              stroke="#142848"
              strokeWidth="3.5"
            />
            {/* Ears */}
            <ellipse cx="23" cy="48" rx="7" ry="4" fill="#F472B6" stroke="#142848" strokeWidth="2.5" transform="rotate(-15 23 48)" />
            <ellipse cx="77" cy="48" rx="7" ry="4" fill="#F472B6" stroke="#142848" strokeWidth="2.5" transform="rotate(15 77 48)" />
            {/* Eyes */}
            <ellipse cx="42" cy="46" rx="2.8" ry="3.8" fill="#142848" />
            <ellipse cx="58" cy="46" rx="2.8" ry="3.8" fill="#142848" />
            {/* Muzzle */}
            <ellipse cx="50" cy="62" rx="10" ry="7" fill="#F5CD82" stroke="#142848" strokeWidth="2.5" />
            <ellipse cx="46" cy="62" rx="1.5" ry="1.2" fill="#142848" />
            <ellipse cx="54" cy="62" rx="1.5" ry="1.2" fill="#142848" />
          </svg>
        );
      case 'GEMINI':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Left twin */}
            <path
              d="M34 26C24 26 18 36 20 50C22 62 32 68 42 66C42 54 40 44 34 36C38 34 37 26 34 26Z"
              fill="#2DD4BF"
              stroke="#142848"
              strokeWidth="3.5"
            />
            <ellipse cx="28" cy="45" rx="2.4" ry="3.2" fill="#142848" />
            {/* Right twin */}
            <path
              d="M66 26C76 26 82 36 80 50C78 62 68 68 58 66C58 54 60 44 66 36C62 34 63 26 66 26Z"
              fill="#F472B6"
              stroke="#142848"
              strokeWidth="3.5"
            />
            <ellipse cx="72" cy="45" rx="2.4" ry="3.2" fill="#142848" />
            {/* Celestial star */}
            <circle cx="50" cy="38" r="4" fill="#F5CD82" stroke="#142848" strokeWidth="2" />
          </svg>
        );
      case 'CANCER':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Crab Body */}
            <ellipse cx="50" cy="54" rx="22" ry="16" fill="#F87171" stroke="#142848" strokeWidth="3.5" />
            {/* Left Pincer */}
            <path
              d="M34 46C24 36 20 22 36 26C42 32 36 42 34 46Z"
              fill="#EF4444"
              stroke="#142848"
              strokeWidth="3.5"
            />
            {/* Right Pincer */}
            <path
              d="M66 46C76 36 80 22 64 26C58 32 64 42 66 46Z"
              fill="#EF4444"
              stroke="#142848"
              strokeWidth="3.5"
            />
            {/* Eyes */}
            <circle cx="43" cy="48" r="3.2" fill="#142848" />
            <circle cx="57" cy="48" r="3.2" fill="#142848" />
            {/* Mouth */}
            <path d="M46 58C48 61 52 61 54 58" stroke="#142848" strokeWidth="2.5" strokeLinecap="round" />
            {/* Legs */}
            <path d="M28 58L18 61M30 65L20 70M72 58L82 61M70 65L80 70" stroke="#142848" strokeWidth="3" strokeLinecap="round" />
          </svg>
        );
      case 'LEO':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Fluffy Golden Mane */}
            <circle cx="50" cy="50" r="30" fill="#F59E0B" stroke="#142848" strokeWidth="3.5" />
            {/* Warm Face */}
            <circle cx="50" cy="52" r="19" fill="#FDE047" stroke="#142848" strokeWidth="2.5" />
            {/* Ears */}
            <circle cx="34" cy="30" r="5" fill="#F59E0B" stroke="#142848" strokeWidth="2.5" />
            <circle cx="66" cy="30" r="5" fill="#F59E0B" stroke="#142848" strokeWidth="2.5" />
            {/* Eyes */}
            <ellipse cx="43" cy="48" rx="2.5" ry="3.5" fill="#142848" />
            <ellipse cx="57" cy="48" rx="2.5" ry="3.5" fill="#142848" />
            {/* Nose & Mouth */}
            <path d="M46 55L54 55L50 60Z" fill="#D97706" stroke="#142848" strokeWidth="2" strokeLinejoin="round" />
            <path d="M47 62C49 64 51 64 53 62" stroke="#142848" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      case 'VIRGO':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Maiden Silhouette with floral halo */}
            <path
              d="M30 50C30 30 40 22 50 22C60 22 70 30 70 50C70 64 62 76 50 76C38 76 30 64 30 50Z"
              fill="#38BDF8"
              stroke="#142848"
              strokeWidth="3.5"
            />
            {/* Face */}
            <circle cx="50" cy="46" r="13" fill="#FED7AA" stroke="#142848" strokeWidth="2.5" />
            {/* Gentle Eyes */}
            <path d="M43 45C44 47 47 47 48 45M52 45C53 47 56 47 57 45" stroke="#142848" strokeWidth="2.5" strokeLinecap="round" />
            {/* Smile */}
            <path d="M47 53C49 55 51 55 53 53" stroke="#E11D48" strokeWidth="2.5" strokeLinecap="round" />
            {/* Flower in hair */}
            <circle cx="60" cy="36" r="4" fill="#F472B6" stroke="#142848" strokeWidth="2" />
          </svg>
        );
      case 'LIBRA':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Balance Beam */}
            <path d="M24 74H76" stroke="#142848" strokeWidth="4" strokeLinecap="round" />
            <path d="M50 28V74" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
            <path d="M28 38L50 28L72 38" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
            {/* Pans */}
            <path d="M28 38L20 54H36L28 38Z" fill="#F5CD82" stroke="#142848" strokeWidth="3" strokeLinejoin="round" />
            <path d="M72 38L64 54H80L72 38Z" fill="#F5CD82" stroke="#142848" strokeWidth="3" strokeLinejoin="round" />
            {/* Crown Apex */}
            <circle cx="50" cy="24" r="4.5" fill="#F5CD82" stroke="#142848" strokeWidth="2.5" />
          </svg>
        );
      case 'SCORPIO':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Curled Stinger Tail */}
            <path
              d="M45 70C45 78 55 78 60 72C65 67 65 57 55 52L50 48"
              stroke="#EF4444"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path d="M60 72L68 76L65 68Z" fill="#B91C1C" stroke="#142848" strokeWidth="2" strokeLinejoin="round" />
            {/* Body */}
            <ellipse cx="42" cy="46" rx="14" ry="11" fill="#DC2626" stroke="#142848" strokeWidth="3.5" />
            {/* Pincers */}
            <path d="M32 38C22 30 26 18 38 24C40 30 34 38 32 38Z" fill="#F87171" stroke="#142848" strokeWidth="2.5" />
            <path d="M52 38C62 30 58 18 46 24C44 30 50 38 52 38Z" fill="#F87171" stroke="#142848" strokeWidth="2.5" />
            {/* Eyes */}
            <circle cx="38" cy="43" r="2.5" fill="#142848" />
            <circle cx="46" cy="43" r="2.5" fill="#142848" />
          </svg>
        );
      case 'SAGITTARIUS':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Bow */}
            <path d="M30 42C44 42 56 54 56 68" stroke="#8B5CF6" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            {/* Arrow */}
            <path d="M26 74L74 26" stroke="#F97316" strokeWidth="5" strokeLinecap="round" />
            <path d="M54 26H74V46" stroke="#F97316" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="74" cy="26" r="4" fill="#F5CD82" />
          </svg>
        );
      case 'CAPRICORN':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Horns */}
            <path d="M38 34C32 16 42 14 44 28" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" />
            <path d="M62 34C68 16 58 14 56 28" stroke="#1D4ED8" strokeWidth="5" strokeLinecap="round" />
            {/* Head */}
            <path
              d="M50 74C60 74 68 62 68 48C68 36 60 32 50 32C40 32 32 36 32 48C32 62 40 74 50 74Z"
              fill="#60A5FA"
              stroke="#142848"
              strokeWidth="3.5"
            />
            {/* Eyes */}
            <ellipse cx="43" cy="46" rx="2.8" ry="3.8" fill="#142848" />
            <ellipse cx="57" cy="46" rx="2.8" ry="3.8" fill="#142848" />
            {/* Beard */}
            <path d="M47 74L50 82L53 74Z" fill="#F5CD82" stroke="#142848" strokeWidth="2" />
          </svg>
        );
      case 'AQUARIUS':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Urn */}
            <path d="M55 24L40 36V48" stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
            <path d="M34 32C26 24 48 20 53 34L46 46" fill="#FBBF24" stroke="#142848" strokeWidth="3" strokeLinejoin="round" />
            {/* Water Waves */}
            <path d="M24 58C34 52 40 64 50 58C60 52 66 64 76 58" stroke="#0EA5E9" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M24 68C34 62 40 74 50 68C60 62 66 74 76 68" stroke="#0EA5E9" strokeWidth="4.5" strokeLinecap="round" />
          </svg>
        );
      case 'PISCES':
        return (
          <svg className={sizeClass} viewBox="0 0 100 100" fill="none">
            {/* Two Koi Fish */}
            <path d="M28 34C42 34 44 52 28 66C48 62 48 40 28 34Z" fill="#3B82F6" stroke="#142848" strokeWidth="3" />
            <path d="M72 34C58 34 56 52 72 66C52 62 52 40 72 34Z" fill="#60A5FA" stroke="#142848" strokeWidth="3" />
            <path d="M22 50H78" stroke="#142848" strokeWidth="3.5" strokeLinecap="round" />
            <circle cx="36" cy="46" r="2.5" fill="#142848" />
            <circle cx="64" cy="54" r="2.5" fill="#142848" />
          </svg>
        );
      default:
        return null;
    }
  };

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

      {/* 1. TOP MAROON-RED WAVY CAROUSEL (Dainik Jagran Signature 12 Zodiac Strip) */}
      <section className="bg-gradient-to-r from-[#6B111E] via-[#8E192B] to-[#5C0E1A] text-white pt-6 pb-7 px-4 shadow-md relative overflow-hidden">
        {/* Subtle wavy pattern background */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar gap-2 sm:gap-3 py-1">
            {ZODIAC_SIGNS.map((sign) => {
              const isSelected = sign.id === activeSign;
              return (
                <button
                  key={sign.id}
                  onClick={() => setActiveSign(sign.id)}
                  className={`flex flex-col items-center shrink-0 p-2 sm:p-2.5 rounded-2xl transition-all cursor-pointer group ${isSelected
                      ? 'bg-black/25 backdrop-blur-xs ring-2 ring-white/90 scale-105'
                      : 'hover:bg-white/10 opacity-90 hover:opacity-100'
                    }`}
                >
                  <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center p-2.5 shadow-sm transition-transform ${isSelected ? 'bg-white shadow-md scale-105' : 'bg-white/95 group-hover:scale-105'
                    }`}>
                    {renderZodiacVector(sign.id, 'w-10 h-10 sm:w-11 sm:h-11')}
                  </div>
                  <span className="text-xs sm:text-sm font-bold mt-1.5 text-white tracking-tight">
                    {sign.name}
                  </span>
                  <span className="text-[10px] text-white/80 font-mono tracking-tighter">
                    {sign.dates}
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
        <nav className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
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

        {/* 3. SHOWCASE SPOTLIGHT: Mascot (Left) + Title & 6 Soft-Pink Cards (Right) */}
        <section className="bg-gradient-to-br from-[#FFF5F7] via-[#FFF9FA] to-[#FFF3F6] rounded-3xl p-6 sm:p-10 lg:p-12 border border-pink-100/90 shadow-2xs relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left: Big Zodiac Mascot Illustration (Clean, sitting naturally on soft blush canvas) */}
            <div className="lg:col-span-4 flex flex-col items-center justify-center">
              <div className="w-48 h-48 sm:w-60 sm:h-60 lg:w-72 lg:h-72 flex items-center justify-center filter drop-shadow-md transition-transform hover:scale-105 duration-300">
                {renderZodiacVector(activeSign, 'w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64')}
              </div>
            </div>

            {/* Right: Title Header + 6 Soft-Pink Astrological Attributes Cards */}
            <div className="lg:col-span-8 space-y-6">
              <div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-serif text-slate-900 tracking-tight leading-tight">
                  {selectedSignMeta.name} {activePeriod === 'DAILY' ? 'Daily' : activePeriod.charAt(0) + activePeriod.slice(1).toLowerCase()} Horoscope
                </h1>
                <p className="text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-widest mt-1.5">
                  {selectedSignMeta.dates} • {selectedSignMeta.hindi} राशिफल
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                {/* Card 1: Lucky Colour */}
                <div className="bg-[#FDEEF3] hover:bg-[#FCDFE8] border border-pink-100/70 rounded-2xl p-4 sm:p-4.5 space-y-1 transition-all duration-200 shadow-2xs hover:shadow-xs">
                  <span className="text-xs sm:text-[13px] font-medium text-slate-600 block">
                    Lucky Colour
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {loading ? '...' : (horoscopeData?.luckyColour || defaultTraits.luckyColour)}
                  </p>
                </div>

                {/* Card 2: Lucky Gemstone */}
                <div className="bg-[#FDEEF3] hover:bg-[#FCDFE8] border border-pink-100/70 rounded-2xl p-4 sm:p-4.5 space-y-1 transition-all duration-200 shadow-2xs hover:shadow-xs">
                  <span className="text-xs sm:text-[13px] font-medium text-slate-600 block">
                    Lucky Gemstone
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {loading ? '...' : (horoscopeData?.luckyGemstone || defaultTraits.luckyGemstone)}
                  </p>
                </div>

                {/* Card 3: Lucky Day */}
                <div className="bg-[#FDEEF3] hover:bg-[#FCDFE8] border border-pink-100/70 rounded-2xl p-4 sm:p-4.5 space-y-1 transition-all duration-200 shadow-2xs hover:shadow-xs">
                  <span className="text-xs sm:text-[13px] font-medium text-slate-600 block">
                    Lucky Day
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {loading ? '...' : (horoscopeData?.luckyDay || defaultTraits.luckyDay)}
                  </p>
                </div>

                {/* Card 4: Lucky Number */}
                <div className="bg-[#FDEEF3] hover:bg-[#FCDFE8] border border-pink-100/70 rounded-2xl p-4 sm:p-4.5 space-y-1 transition-all duration-200 shadow-2xs hover:shadow-xs">
                  <span className="text-xs sm:text-[13px] font-medium text-slate-600 block">
                    Lucky Number
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {loading ? '...' : (horoscopeData?.luckyNumber || defaultTraits.luckyNumber)}
                  </p>
                </div>

                {/* Card 5: Ruling Planet */}
                <div className="bg-[#FDEEF3] hover:bg-[#FCDFE8] border border-pink-100/70 rounded-2xl p-4 sm:p-4.5 space-y-1 transition-all duration-200 shadow-2xs hover:shadow-xs">
                  <span className="text-xs sm:text-[13px] font-medium text-slate-600 block">
                    Ruling Planet
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {loading ? '...' : (horoscopeData?.rulingPlanet || defaultTraits.rulingPlanet)}
                  </p>
                </div>

                {/* Card 6: Compatible Zodiac Sign */}
                <div className="bg-[#FDEEF3] hover:bg-[#FCDFE8] border border-pink-100/70 rounded-2xl p-4 sm:p-4.5 space-y-1 transition-all duration-200 shadow-2xs hover:shadow-xs">
                  <span className="text-xs sm:text-[13px] font-medium text-slate-600 block">
                    Compatible Zodiac Sign
                  </span>
                  <p className="text-base sm:text-lg font-bold text-slate-900">
                    {loading ? '...' : (horoscopeData?.compatibleSign || defaultTraits.compatibleSign)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. TIMEFRAME TABS & DETAILED PREDICTION + REMEDY */}
        <section className="space-y-6">
          {/* Tabs: DAILY | WEEKLY | MONTHLY | YEARLY | LOVE */}
          <div className="border-b border-slate-200 flex items-center space-x-6 sm:space-x-10 text-xs sm:text-sm font-bold tracking-wider">
            {PERIOD_TABS.map((tab) => {
              const isActive = tab.id === activePeriod;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePeriod(tab.id)}
                  className={`pb-3 relative transition-colors cursor-pointer ${isActive
                      ? 'text-[#8E192B] font-black'
                      : 'text-slate-500 hover:text-slate-900'
                    }`}
                >
                  <span>{tab.label}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8E192B] rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Prediction Reading Container */}
          <div className="bg-slate-50/50 rounded-3xl p-6 sm:p-8 border border-slate-100 space-y-5">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-semibold flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-pink-600" />
                <span>Reading Stars & Transits...</span>
              </div>
            ) : (
              <>
                {/* Main Prediction Paragraph */}
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed font-sans font-normal">
                  {horoscopeData?.prediction}
                </p>

                {/* Highlights Bottom Section */}
                <div className="pt-4 border-t border-slate-200/80 space-y-1.5 text-xs sm:text-sm">
                  {horoscopeData?.luckyColour && (
                    <p className="text-slate-800">
                      <span className="font-bold text-slate-900">Lucky Colour: </span>
                      <span className="text-slate-700">{horoscopeData.luckyColour}</span>
                    </p>
                  )}
                  {horoscopeData?.luckyNumber && (
                    <p className="text-slate-800">
                      <span className="font-bold text-slate-900">Lucky Number: </span>
                      <span className="text-slate-700">{horoscopeData.luckyNumber}</span>
                    </p>
                  )}
                  {horoscopeData?.remedy && (
                    <p className="text-slate-800 pt-1">
                      <span className="font-bold text-slate-900">Remedy: </span>
                      <span className="text-slate-700">{horoscopeData.remedy}</span>
                    </p>
                  )}
                </div>
              </>
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
                  <div className="space-y-6 divide-y divide-slate-100">
                    {newsArticles.map((art) => (
                      <article key={art.id} className="pt-6 first:pt-0 flex flex-col sm:flex-row gap-5 group">
                        {/* Thumbnail */}
                        <div className="w-full sm:w-56 h-36 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/80">
                          <img
                            src={art.featuredImage || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&q=80'}
                            alt={art.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        {/* Article Details */}
                        <div className="min-w-0 flex-1 space-y-2">
                          <Link href={`/article/${art.slug || art.id}`}>
                            <h3 className="text-base sm:text-lg font-bold font-serif text-slate-900 group-hover:text-[#8E192B] transition-colors leading-snug">
                              {stripHtml(art.title)}
                            </h3>
                          </Link>
                          {art.subHeadline && (
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {stripHtml(art.subHeadline)}
                            </p>
                          )}
                          <div className="flex items-center space-x-3 text-[11px] text-slate-400 font-medium pt-1">
                            <span className="uppercase font-mono text-[#8E192B] font-bold">
                              {art.subCategory || 'Astro Forecast'}
                            </span>
                            <span>•</span>
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
              )}
            </div>

            {/* Right 4 Cols: TOP NEWS Sticky Sidebar (1, 2, 3...) */}
            <aside className="lg:col-span-4 lg:sticky lg:top-28 self-start space-y-5 border-l border-slate-100 lg:pl-8">
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
