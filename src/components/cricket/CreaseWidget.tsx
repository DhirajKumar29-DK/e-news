'use client';

import React from 'react';
import { LiveCreaseData } from '@/types/cricket';

interface Props {
  liveData: LiveCreaseData;
}

export const CreaseWidget: React.FC<Props> = ({ liveData }) => {
  const { currentBatters, currentBowler, thisOverBalls, partnership } = liveData;

  const getBallBadgeColor = (ball: string) => {
    if (ball === '4') return 'bg-emerald-600 text-white font-bold border-emerald-500';
    if (ball === '6') return 'bg-purple-600 text-white font-bold border-purple-500';
    if (ball.toUpperCase() === 'W') return 'bg-red-600 text-white font-bold border-red-500';
    if (ball === '0' || ball === '•') return 'bg-slate-700 text-slate-300 border-slate-600';
    return 'bg-slate-800 text-slate-100 font-semibold border-slate-700';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg text-white">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        <div className="space-y-2 pr-2">
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center justify-between">
            <span>BATTERS ON CREASE</span>
            <span className="font-mono">R (B) 4s 6s SR</span>
          </div>

          {currentBatters.map((b, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                <span>{b.name}</span>
                {b.isStriker && <span className="text-amber-400 font-bold">*</span>}
              </div>
              <div className="font-mono text-slate-300 flex items-center gap-2 text-right">
                <span className="font-bold text-white">{b.runs}</span>
                <span className="text-slate-400">({b.balls})</span>
                <span className="text-slate-400">{b.fours}</span>
                <span className="text-slate-400">{b.sixes}</span>
                <span className="text-emerald-400">{b.strikeRate}</span>
              </div>
            </div>
          ))}

          {partnership && (
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 flex items-center justify-between">
              <span>Partnership: <strong className="text-slate-200">{partnership.runs} runs ({partnership.balls}b)</strong></span>
              <span>RR: <strong className="text-slate-200">{partnership.runRate}</strong></span>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-3 lg:pt-0 lg:px-4">
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400 flex items-center justify-between">
            <span>CURRENT BOWLER</span>
            <span className="font-mono">O M R W ECON</span>
          </div>

          <div className="flex items-center justify-between text-xs py-1">
            <span className="font-semibold text-slate-100">{currentBowler.name}</span>
            <div className="font-mono text-slate-300 flex items-center gap-2.5 text-right">
              <span className="text-slate-300">{currentBowler.overs}</span>
              <span className="text-slate-400">{currentBowler.maidens}</span>
              <span className="text-slate-300">{currentBowler.runs}</span>
              <span className="font-bold text-red-400">{currentBowler.wickets}</span>
              <span className="text-emerald-400">{currentBowler.economy}</span>
            </div>
          </div>

          {liveData.lastWicket && (
            <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60 truncate">
              Last Wicket: <span className="text-slate-300">{liveData.lastWicket}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-3 lg:pt-0 lg:pl-4">
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
            <span>THIS OVER</span>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            {thisOverBalls.map((b, i) => (
              <span
                key={i}
                className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs shadow-sm ${getBallBadgeColor(
                  b
                )}`}
              >
                {b}
              </span>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 pt-2 flex items-center justify-between">
            <span>Status: <strong className="text-amber-300">{liveData.equation}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
