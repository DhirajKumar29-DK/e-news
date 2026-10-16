'use client';

import React from 'react';
import { MatchInfoData } from '@/types/cricket';
import { Users, Shield, UserCheck } from 'lucide-react';

interface Props {
  info: MatchInfoData;
}

export const MatchSquads: React.FC<Props> = ({ info }) => {
  const { team1, team2 } = info.teams;

  const renderTeamSection = (team: typeof team1) => (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 md:p-5 border border-slate-200 dark:border-slate-800 space-y-5 transition-colors duration-200">
      {/* Team Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500" />
          <h4 className="font-bold font-serif text-sm md:text-base text-slate-900 dark:text-white">{team.name} Playing XI</h4>
        </div>
        {team.playingXI && team.playingXI.length > 0 ? (
          <span className="text-[11px] font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800/60">
            {team.playingXI.length} Players
          </span>
        ) : (
          <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
            To be announced
          </span>
        )}
      </div>

      {/* Playing XI List */}
      {team.playingXI && team.playingXI.length > 0 ? (
        <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
          {team.playingXI.map((p, i) => (
            <div key={i} className="py-2.5 flex items-center justify-between text-xs hover:bg-white dark:hover:bg-slate-850 px-2 rounded-lg transition-colors">
              <div className="flex items-center gap-2.5">
                <span className="font-mono text-slate-400 dark:text-slate-500 text-[11px] w-4">{i + 1}</span>
                <span className="font-bold text-slate-900 dark:text-white">{p.name}</span>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                p.role.includes('Keeper')
                  ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60'
                  : p.role.includes('All-Rounder')
                  ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60'
                  : p.role.includes('Bowler')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
              }`}>
                {p.role}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400 italic">
          Official playing XI has not been announced yet. Squad lineups will be confirmed at the toss.
        </div>
      )}

      {/* Bench / Reserves */}
      {team.bench && team.bench.length > 0 && (
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Bench / Squad Reserves</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {team.bench.map((bName, bIdx) => (
              <span
                key={bIdx}
                className="text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2 py-1 rounded-md"
              >
                {bName}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <Users className="w-5 h-5 text-red-600 dark:text-red-400" />
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-white">
          Team Lineups & Playing XIs
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderTeamSection(team1)}
        {renderTeamSection(team2)}
      </div>
    </div>
  );
};
