'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { CricketMatch } from '@/types/cricket';
import { cricketService } from '@/services/cricketService';
import { Radio, ChevronRight } from 'lucide-react';

export const LiveScoreStrip: React.FC = () => {
  const [matches, setMatches] = useState<CricketMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const data = await cricketService.getMatches('all');
      setMatches(data);
      setLoading(false);
    };
    fetchMatches();

    const interval = setInterval(fetchMatches, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && matches.length === 0) {
    return (
      <div className="bg-slate-900 text-white py-2.5 px-4 text-xs flex items-center justify-center gap-2">
        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
        <span>Loading live cricket scores...</span>
      </div>
    );
  }

  if (matches.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800 text-white shadow-inner">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0 bg-red-600/90 text-white text-[11px] font-bold px-2 py-1 rounded tracking-wide uppercase shadow-sm">
          <Radio className="w-3.5 h-3.5 animate-pulse text-white" />
          <span>MATCHES</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {matches.map((m) => (
            <Link
              key={m.id}
              href={`/cricket/match/${m.id}`}
              className="group flex items-center gap-3.5 bg-slate-850 hover:bg-slate-800 border border-slate-700/60 hover:border-red-500/50 rounded-lg px-3 py-1.5 transition-all duration-200 shrink-0"
            >
              <div className="flex flex-col gap-0.5 min-w-[125px]">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="truncate max-w-[85px]">{m.matchTitle}</span>
                  {m.status === 'LIVE' ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      LIVE
                    </span>
                  ) : m.status === 'COMPLETED' ? (
                    <span className="text-[10px] font-semibold text-emerald-400">RESULT</span>
                  ) : (
                    <span className="text-[10px] font-medium text-amber-400">UPCOMING</span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <div className="flex items-center gap-1.5">
                    <img src={m.team1.logo} alt={m.team1.name} className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-xs font-semibold text-slate-100">{m.team1.shortName}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-200">{m.team1.score || '-'}</span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <img src={m.team2.logo} alt={m.team2.name} className="w-4 h-4 rounded-full object-cover" />
                    <span className="text-xs font-semibold text-slate-100">{m.team2.shortName}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-200">{m.team2.score || '-'}</span>
                </div>
              </div>

              <div className="border-l border-slate-700/60 pl-2 text-[10px] text-slate-400 max-w-[110px] truncate leading-tight group-hover:text-red-400 transition-colors">
                {m.statusText}
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/cricket/schedule"
          className="shrink-0 text-xs text-red-400 hover:text-red-300 font-semibold flex items-center gap-0.5 ml-auto pl-2 whitespace-nowrap"
        >
          View All <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
