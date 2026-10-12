'use client';

import React from 'react';
import { MatchInfoData } from '@/types/cricket';
import { Users, Shield, Briefcase, UserCheck } from 'lucide-react';

interface Props {
  info: MatchInfoData;
}

export const MatchSquads: React.FC<Props> = ({ info }) => {
  const { team1, team2 } = info.teams;

  const renderTeamSection = (team: typeof team1) => (
    <div className="bg-slate-850/60 rounded-xl p-4 md:p-5 border border-slate-800 space-y-5">
      {/* Team Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <h4 className="font-bold text-sm md:text-base text-white">{team.name} Playing XI</h4>
        </div>
        <span className="text-[11px] font-bold bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
          11 Players
        </span>
      </div>

      {/* Playing XI List */}
      <div className="divide-y divide-slate-800/60">
        {team.playingXI.map((p, i) => (
          <div key={i} className="py-2.5 flex items-center justify-between text-xs hover:bg-slate-800/30 px-2 rounded-lg transition-colors">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-slate-500 text-[11px] w-4">{i + 1}</span>
              <span className="font-semibold text-slate-200">{p.name}</span>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
              p.role.includes('Keeper')
                ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20'
                : p.role.includes('All-Rounder')
                ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                : p.role.includes('Bowler')
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {p.role}
            </span>
          </div>
        ))}
      </div>

      {/* Bench / Reserves */}
      {team.bench && team.bench.length > 0 && (
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <UserCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Bench / Squad Reserves</span>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {team.bench.map((bName, bIdx) => (
              <span
                key={bIdx}
                className="bg-slate-800 text-slate-300 text-[11px] px-2.5 py-1 rounded-md border border-slate-700/60"
              >
                {bName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Support Staff & Coaches */}
      {team.supportStaff && (
        <div className="pt-3 border-t border-slate-800 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Briefcase className="w-3.5 h-3.5 text-emerald-400" />
            <span>Coaching & Support Staff</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {team.supportStaff.headCoach && (
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Head Coach</span>
                <span className="text-white font-semibold">{team.supportStaff.headCoach}</span>
              </div>
            )}
            {team.supportStaff.battingCoach && (
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Batting Coach</span>
                <span className="text-white font-semibold">{team.supportStaff.battingCoach}</span>
              </div>
            )}
            {team.supportStaff.bowlingCoach && (
              <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Bowling Coach</span>
                <span className="text-white font-semibold">{team.supportStaff.bowlingCoach}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-6 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-red-500" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
            Playing XI, Bench & Support Staff
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderTeamSection(team1)}
        {renderTeamSection(team2)}
      </div>
    </div>
  );
};
