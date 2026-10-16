'use client';

import React from 'react';
import { CricketMatch } from '@/types/cricket';
import { Trophy, MapPin, Activity } from 'lucide-react';

interface Props {
  match: CricketMatch;
}

export const MatchHeroBanner: React.FC<Props> = ({ match }) => {
  const getLogo = (logo?: string, name?: string) => {
    if (logo && logo.trim() !== '') return logo;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Team')}&background=0284c7&color=ffffff&bold=true&size=128`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-2xl p-5 md:p-7 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden transition-colors duration-200">
      {/* Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="font-bold text-slate-800 dark:text-slate-200">{match.series}</span>
          <span>•</span>
          <span className="text-slate-600 dark:text-slate-400">{match.matchTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>{match.venue}</span>
          </div>
          {match.status === 'LIVE' ? (
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          ) : match.status === 'COMPLETED' ? (
            <span className="bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              COMPLETED
            </span>
          ) : (
            <span className="bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* Main Teams & Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
        {/* Team 1 */}
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
          match.team1.isBatting
            ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 shadow-xs'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60'
        }`}>
          <div className="flex items-center gap-3.5">
            <img
              src={getLogo(match.team1.logo, match.team1.name)}
              alt={match.team1.name}
              className="w-12 h-12 rounded-full object-cover shadow-xs border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                {match.team1.name}
                {match.team1.isBatting && (
                  <span className="text-[10px] font-black uppercase bg-red-600 text-white px-1.5 py-0.5 rounded shadow-xs">
                    Batting
                  </span>
                )}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {match.team1.overs ? `(${match.team1.overs} ov)` : ''}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {match.team1.score || '-'}
            </span>
          </div>
        </div>

        {/* Team 2 */}
        <div className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
          match.team2.isBatting
            ? 'bg-red-50/40 dark:bg-red-950/20 border-red-200 dark:border-red-900/40 shadow-xs'
            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60'
        }`}>
          <div className="flex items-center gap-3.5">
            <img
              src={getLogo(match.team2.logo, match.team2.name)}
              alt={match.team2.name}
              className="w-12 h-12 rounded-full object-cover shadow-xs border-2 border-white dark:border-slate-700 bg-white dark:bg-slate-800"
            />
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white flex items-center gap-2">
                {match.team2.name}
                {match.team2.isBatting && (
                  <span className="text-[10px] font-black uppercase bg-red-600 text-white px-1.5 py-0.5 rounded shadow-xs">
                    Batting
                  </span>
                )}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {match.team2.overs ? `(${match.team2.overs} ov)` : ''}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl md:text-3xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {match.team2.score || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Match Equation / Summary Footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
        <div className="font-bold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-3 py-1.5 rounded-lg flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>{match.statusText}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-600 dark:text-slate-400 text-xs">
          {match.crr && (
            <div>
              <span className="text-slate-400 dark:text-slate-500">CRR: </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{match.crr}</span>
            </div>
          )}
          {match.rrr && (
            <div>
              <span className="text-slate-400 dark:text-slate-500">RRR: </span>
              <span className="font-mono font-bold text-red-600 dark:text-red-400">{match.rrr}</span>
            </div>
          )}
          {match.toss && (
            <div className="text-slate-500 dark:text-slate-400 italic">
              {match.toss}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
