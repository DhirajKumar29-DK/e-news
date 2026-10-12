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
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Team')}&background=1e293b&color=ffffff&bold=true&size=128`;
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white rounded-2xl p-5 md:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Meta Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3 mb-5 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-200">{match.series}</span>
          <span>•</span>
          <span>{match.matchTitle}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>{match.venue}</span>
          </div>
          {match.status === 'LIVE' ? (
            <span className="flex items-center gap-1.5 bg-red-600 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
              LIVE
            </span>
          ) : match.status === 'COMPLETED' ? (
            <span className="bg-emerald-700/80 text-emerald-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              COMPLETED
            </span>
          ) : (
            <span className="bg-amber-600/80 text-amber-100 text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
              UPCOMING
            </span>
          )}
        </div>
      </div>

      {/* Main Teams & Scores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Team 1 */}
        <div className={`flex items-center justify-between p-4 rounded-xl border ${
          match.team1.isBatting
            ? 'bg-slate-800/80 border-red-500/40 shadow-lg'
            : 'bg-slate-850/50 border-slate-800'
        }`}>
          <div className="flex items-center gap-3.5">
            <img
              src={getLogo(match.team1.logo, match.team1.name)}
              alt={match.team1.name}
              className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-slate-700"
            />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                {match.team1.name}
                {match.team1.isBatting && (
                  <span className="text-[10px] font-bold uppercase bg-red-500 text-white px-1.5 py-0.5 rounded">
                    Batting
                  </span>
                )}
              </h2>
              <span className="text-xs text-slate-400">{match.team1.overs ? `(${match.team1.overs} ov)` : ''}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
              {match.team1.score || '-'}
            </span>
          </div>
        </div>

        {/* Team 2 */}
        <div className={`flex items-center justify-between p-4 rounded-xl border ${
          match.team2.isBatting
            ? 'bg-slate-800/80 border-red-500/40 shadow-lg'
            : 'bg-slate-850/50 border-slate-800'
        }`}>
          <div className="flex items-center gap-3.5">
            <img
              src={getLogo(match.team2.logo, match.team2.name)}
              alt={match.team2.name}
              className="w-12 h-12 rounded-full object-cover shadow-md border-2 border-slate-700"
            />
            <div>
              <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                {match.team2.name}
                {match.team2.isBatting && (
                  <span className="text-[10px] font-bold uppercase bg-red-500 text-white px-1.5 py-0.5 rounded">
                    Batting
                  </span>
                )}
              </h2>
              <span className="text-xs text-slate-400">{match.team2.overs ? `(${match.team2.overs} ov)` : ''}</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl md:text-3xl font-extrabold font-mono text-white tracking-tight">
              {match.team2.score || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Live Match Equation / Summary Footer */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm">
        <div className="font-semibold text-amber-300 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          <span>{match.statusText}</span>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-slate-300 text-xs">
          {match.crr && (
            <div>
              <span className="text-slate-500">CRR: </span>
              <span className="font-mono font-bold text-slate-200">{match.crr}</span>
            </div>
          )}
          {match.rrr && (
            <div>
              <span className="text-slate-500">RRR: </span>
              <span className="font-mono font-bold text-red-400">{match.rrr}</span>
            </div>
          )}
          {match.toss && (
            <div className="text-slate-400 italic">
              {match.toss}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
