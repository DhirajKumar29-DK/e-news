'use client';

import React, { useState, useEffect } from 'react';
import { cricketService } from '@/services/cricketService';
import { Trophy } from 'lucide-react';

export const CricketRankingsTable: React.FC = () => {
  const [format, setFormat] = useState<'t20' | 'odi' | 'test'>('t20');
  const [category, setCategory] = useState<'teams' | 'batting' | 'bowling' | 'allRounder'>('teams');
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    cricketService.getRankings(format, category).then((data) => {
      setRankings(data);
      setLoading(false);
    });
  }, [format, category]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <span className="bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded text-xs border border-amber-200 dark:border-amber-500/30">🥇 #1</span>;
    if (rank === 2) return <span className="bg-slate-100 dark:bg-slate-400/20 text-slate-800 dark:text-slate-200 font-bold px-2 py-0.5 rounded text-xs border border-slate-200 dark:border-slate-700">🥈 #2</span>;
    if (rank === 3) return <span className="bg-amber-50 dark:bg-amber-700/20 text-amber-900 dark:text-amber-400 font-bold px-2 py-0.5 rounded text-xs border border-amber-200 dark:border-amber-700/30">🥉 #3</span>;
    return <span className="text-slate-500 dark:text-slate-400 font-mono text-xs">#{rank}</span>;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-xs dark:shadow-xl space-y-5 text-slate-900 dark:text-white transition-colors duration-200">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
          <h2 className="text-base md:text-lg font-bold text-slate-900 dark:text-white">ICC Official Rankings</h2>
        </div>

        <div className="flex bg-slate-100 dark:bg-slate-850 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
          {(['t20', 'odi', 'test'] as const).map((fmt) => (
            <button
              key={fmt}
              onClick={() => setFormat(fmt)}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                format === fmt
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {fmt.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {[
          { id: 'teams', label: 'Teams' },
          { id: 'batting', label: 'Batters' },
          { id: 'bowling', label: 'Bowlers' },
          { id: 'allRounder', label: 'All-Rounders' }
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id as any)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              category === cat.id
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading rankings data...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5">Rank</th>
                <th className="py-2.5">{category === 'teams' ? 'Team' : 'Player'}</th>
                {category !== 'teams' && <th className="py-2.5">Country</th>}
                {category === 'teams' && <th className="py-2.5 text-right">Points</th>}
                <th className="py-2.5 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
              {rankings.map((r, i) => (
                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors">
                  <td className="py-3">{getRankBadge(r.rank)}</td>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <img
                      src={r.logo || r.flag}
                      alt={r.team || r.player}
                      className="w-5 h-5 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <span>{r.team || r.player}</span>
                  </td>
                  {category !== 'teams' && (
                    <td className="py-3 text-slate-600 dark:text-slate-300">{r.country}</td>
                  )}
                  {category === 'teams' && (
                    <td className="py-3 text-right font-mono text-slate-600 dark:text-slate-300">{r.points}</td>
                  )}
                  <td className="py-3 text-right font-mono font-bold text-amber-600 dark:text-amber-400">{r.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
