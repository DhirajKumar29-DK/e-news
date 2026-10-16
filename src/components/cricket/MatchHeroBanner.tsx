'use client';

import React from 'react';
import { CricketMatch } from '@/types/cricket';
import { Share2 } from 'lucide-react';

interface Props {
  match: CricketMatch;
}

export const MatchHeroBanner: React.FC<Props> = ({ match }) => {
  const getLogo = (logo?: string, name?: string) => {
    if (logo && logo.trim() !== '') return logo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Team')}&background=0284c7&color=ffffff&bold=true&size=128`;
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: `${match.team1.name} vs ${match.team2.name}`,
          text: `${match.matchTitle} - ${match.series}: ${match.team1.name} (${match.team1.score}) vs ${match.team2.name} (${match.team2.score})`,
          url: typeof window !== 'undefined' ? window.location.href : '',
        });
      } catch {
        // user closed share dialog
      }
    }
  };

  const isCompleted = match.status === 'COMPLETED';
  const isLive = match.status === 'LIVE';

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. NAVY BLUE TOP BANNER (MATCH TITLE & STATUS - EXACT IMAGE 1 STYLE) */}
      <div className="bg-[#0f2853] text-white px-3.5 py-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-bold truncate">
            {match.series}{match.matchTitle ? ` • ${match.matchTitle}` : ''}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleShare}
            className="p-1 rounded-md hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            title="Share Match"
          >
            <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          <span
            className={`text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md uppercase tracking-wide ${
              isLive
                ? 'bg-red-600 text-white animate-pulse'
                : isCompleted
                ? 'bg-blue-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {isCompleted ? 'Results' : match.status}
          </span>
        </div>
      </div>

      {/* 2. MATCH TEAMS & SCORES COMPACT ROW */}
      <div className="p-3.5 sm:p-5">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          {/* Team 1 (Left) */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
            <img
              src={getLogo(match.team1.logo, match.team1.name)}
              alt={match.team1.name}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
            />
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-base text-slate-900 dark:text-white truncate">
                {match.team1.name}
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-mono font-black text-sm sm:text-xl text-slate-900 dark:text-white">
                  {match.team1.score || '-'}
                </span>
                {match.team1.overs && (
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ({match.team1.overs} ov)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* VS Center Badge */}
          <div className="shrink-0 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] sm:text-xs font-bold text-slate-400 dark:text-slate-500 uppercase">
            Vs
          </div>

          {/* Team 2 (Right) */}
          <div className="flex items-center justify-end gap-2.5 sm:gap-3 flex-1 min-w-0 text-right">
            <div className="min-w-0">
              <div className="font-bold text-xs sm:text-base text-slate-900 dark:text-white truncate">
                {match.team2.name}
              </div>
              <div className="flex items-baseline justify-end gap-1">
                <span className="font-mono font-black text-sm sm:text-xl text-slate-900 dark:text-white">
                  {match.team2.score || '-'}
                </span>
                {match.team2.overs && (
                  <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">
                    ({match.team2.overs} ov)
                  </span>
                )}
              </div>
            </div>
            <img
              src={getLogo(match.team2.logo, match.team2.name)}
              alt={match.team2.name}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 shadow-xs shrink-0"
            />
          </div>
        </div>

        {/* 3. MATCH RESULT BANNER */}
        {match.statusText && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 italic">
              {match.statusText}
            </p>
          </div>
        )}

        {/* 4. PLAYER OF THE MATCH (IF AWARDED - MATCHING IMAGE 1) */}
        {match.playerOfTheMatch && (
          <div className="mt-2.5 p-2 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/40 rounded-xl flex items-center justify-center gap-2 text-xs font-bold text-blue-900 dark:text-blue-300">
            <span>🏆 PLAYER OF THE MATCH</span>
            <span className="text-slate-900 dark:text-white">{match.playerOfTheMatch}</span>
          </div>
        )}

        {/* 5. TOSS / EQUATION ROW */}
        {(match.toss || match.crr || match.rrr) && (
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
            {match.toss && <span className="italic">{match.toss}</span>}
            {match.crr && <span>CRR: <strong className="text-slate-700 dark:text-slate-300">{match.crr}</strong></span>}
            {match.rrr && <span>RRR: <strong className="text-red-600 dark:text-red-400">{match.rrr}</strong></span>}
          </div>
        )}
      </div>
    </div>
  );
};
