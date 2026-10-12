'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { CricketMatch } from '@/types/cricket';
import { cricketService } from '@/services/cricketService';
import { ChevronLeft, ChevronRight, Calendar, Trophy, Globe, Flame, ShieldAlert, Sparkles } from 'lucide-react';

type MatchCategory = 'international' | 'domestic' | 'women' | 'league' | 'all';
type MatchStatusType = 'live' | 'upcoming' | 'recent' | 'all';

interface CategoryTab {
  id: MatchCategory;
  label: string;
  icon: any;
}

const CATEGORIES: CategoryTab[] = [
  { id: 'international', label: 'International', icon: Globe },
  { id: 'domestic', label: 'Domestic', icon: Trophy },
  { id: 'women', label: "Women's Cricket", icon: Sparkles },
  { id: 'league', label: 'T20 Leagues', icon: Flame },
  { id: 'all', label: 'All Matches', icon: ShieldAlert },
];

export const CricketMatchSlider: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<MatchCategory>('international');
  const [activeStatus, setActiveStatus] = useState<MatchStatusType>('all');
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchMatches = async (category: MatchCategory, status: MatchStatusType) => {
    setLoading(true);
    try {
      const data = await cricketService.getMatches(status, category);
      setMatches(data);
    } catch (err) {
      console.error('Error fetching matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches(activeCategory, activeStatus);
    const interval = setInterval(() => {
      cricketService.getMatches(activeStatus, activeCategory).then((data) => {
        if (data && data.length > 0) {
          setMatches(data);
        }
      });
    }, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [activeCategory, activeStatus]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 340;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const getCategoryBadgeColor = (category?: string) => {
    switch (category) {
      case 'women':
        return 'bg-pink-900/60 text-pink-300 border-pink-700/50';
      case 'domestic':
        return 'bg-amber-900/60 text-amber-300 border-amber-700/50';
      case 'league':
        return 'bg-indigo-900/60 text-indigo-300 border-indigo-700/50';
      case 'international':
      default:
        return 'bg-blue-900/60 text-blue-300 border-blue-700/50';
    }
  };

  const getCategoryBadgeName = (m: CricketMatch) => {
    if (m.category === 'women') return "Women";
    if (m.category === 'domestic') return 'Domestic';
    if (m.category === 'league') return 'League';
    return 'International';
  };

  return (
    <div className="bg-[#0b1329] border-b border-slate-800 text-white shadow-xl relative select-none">
      <div className="max-w-[1360px] mx-auto px-3 sm:px-4 py-2.5">
        
        {/* Tier 1: Category Selection Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
          
          {/* Main Category Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id);
                    if (cat.id === 'women' && activeStatus === 'live') {
                      setActiveStatus('all');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-950/60 ring-1 ring-red-400/80 scale-[1.02]'
                      : 'bg-slate-800/70 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Sub Status Filter Pills (All, Live, Upcoming, Results) */}
          <div className="flex items-center justify-between md:justify-end gap-2 shrink-0">
            <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveStatus('all')}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeStatus === 'all'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All
              </button>

              <button
                onClick={() => setActiveStatus('live')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeStatus === 'live'
                    ? 'bg-red-600 text-white shadow-sm ring-1 ring-red-400'
                    : 'text-slate-400 hover:text-red-400'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                <span>Live</span>
              </button>

              <button
                onClick={() => setActiveStatus('upcoming')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeStatus === 'upcoming'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-amber-400'
                }`}
              >
                <Calendar className="w-2.5 h-2.5" />
                <span>Upcoming</span>
              </button>

              <button
                onClick={() => setActiveStatus('recent')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${
                  activeStatus === 'recent'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-emerald-400'
                }`}
              >
                <Trophy className="w-2.5 h-2.5" />
                <span>Results</span>
              </button>
            </div>

            {/* Slider Navigation Arrows */}
            <div className="hidden sm:flex items-center gap-1 pl-1">
              <button
                onClick={() => handleScroll('left')}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleScroll('right')}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Area */}
        <div className="pt-2.5">
          {loading && matches.length === 0 ? (
            <div className="py-7 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Loading matches...</span>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400 flex flex-col items-center justify-center gap-2 bg-[#0e1630]/60 rounded-xl border border-slate-800/80 p-4">
              <p>
                {activeStatus === 'live'
                  ? `No ${activeCategory === 'women' ? "Women's" : activeCategory === 'domestic' ? 'Domestic' : 'International'} live matches currently in progress.`
                  : 'No matches found.'}
              </p>
              {activeStatus === 'live' && (
                <button
                  onClick={() => setActiveStatus('all')}
                  className="px-3 py-1 bg-red-600/90 hover:bg-red-600 text-white rounded text-xs font-semibold transition-colors"
                >
                  View all matches & results
                </button>
              )}
            </div>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth pb-1 snap-x snap-mandatory"
            >
              {matches.map((m) => {
                const badgeClass = getCategoryBadgeColor(m.category);
                const badgeLabel = getCategoryBadgeName(m);

                return (
                  <Link
                    key={m.id}
                    href={`/cricket/match/${m.id}`}
                    className="group shrink-0 w-[85vw] max-w-[320px] sm:w-[295px] snap-start bg-[#121b36] hover:bg-[#172346] border border-slate-800 hover:border-red-500/60 rounded-xl p-3 transition-all duration-200 flex flex-col justify-between shadow-md hover:shadow-lg relative overflow-hidden"
                  >
                    {/* Top Row: Category tag, Series name, Status badge */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800/80 pb-1.5 mb-2 gap-2">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${badgeClass}`}>
                          {badgeLabel}
                        </span>
                        <span className="truncate text-slate-300 font-medium text-[11px]" title={m.series}>
                          {m.series}
                        </span>
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase shrink-0 ${
                        m.status === 'LIVE'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                          : m.status === 'COMPLETED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {m.status === 'LIVE' ? '🔴 LIVE' : m.status === 'COMPLETED' ? 'RESULT' : 'SCHEDULED'}
                      </span>
                    </div>

                    {/* Team 1 Row */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={m.team1.logo || '/flags/default.png'}
                          alt={m.team1.name}
                          className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://flagcdn.com/w40/in.png';
                          }}
                        />
                        <span className={`text-xs font-semibold truncate max-w-[135px] ${
                          m.team1.isBatting ? 'text-amber-300 font-bold' : 'text-slate-100'
                        }`}>
                          {m.team1.name}
                          {m.team1.isBatting && <span className="ml-1 text-[10px] text-amber-400">*</span>}
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-slate-100 flex items-center gap-1 text-right shrink-0">
                        <span>{m.team1.score}</span>
                        {m.team1.overs && (
                          <span className="text-[10px] font-normal text-slate-400">({m.team1.overs})</span>
                        )}
                      </div>
                    </div>

                    {/* Team 2 Row */}
                    <div className="flex items-center justify-between py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <img
                          src={m.team2.logo || '/flags/default.png'}
                          alt={m.team2.name}
                          className="w-5 h-5 rounded-full object-cover border border-slate-700 shrink-0"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = 'https://flagcdn.com/w40/in.png';
                          }}
                        />
                        <span className={`text-xs font-semibold truncate max-w-[135px] ${
                          m.team2.isBatting ? 'text-amber-300 font-bold' : 'text-slate-100'
                        }`}>
                          {m.team2.name}
                          {m.team2.isBatting && <span className="ml-1 text-[10px] text-amber-400">*</span>}
                        </span>
                      </div>
                      <div className="font-mono text-xs font-bold text-slate-100 flex items-center gap-1 text-right shrink-0">
                        <span>{m.team2.score}</span>
                        {m.team2.overs && (
                          <span className="text-[10px] font-normal text-slate-400">({m.team2.overs})</span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Status / Equation line */}
                    <div className="mt-2 pt-1.5 border-t border-slate-800/80 text-[11px] text-amber-300/90 truncate font-medium flex items-center justify-between">
                      <span className="truncate">{m.statusText}</span>
                      <span className="text-[10px] text-slate-400 group-hover:text-red-400 transition-colors ml-1 shrink-0 font-semibold">
                        Scorecard →
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
