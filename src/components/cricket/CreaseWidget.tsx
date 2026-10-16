'use client';

import React from 'react';
import { LiveCreaseData } from '@/types/cricket';

interface Props {
  liveData: LiveCreaseData;
}

export const CreaseWidget: React.FC<Props> = ({ liveData }) => {
  if (!liveData || !liveData.currentBatters || liveData.currentBatters.length === 0) {
    return null;
  }

  const { currentBatters, currentBowler, thisOverBalls, partnership } = liveData;

  const getBallBadgeColor = (ball: string) => {
    if (ball === '4') return 'bg-emerald-600 text-white font-bold border-emerald-600';
    if (ball === '6') return 'bg-purple-600 text-white font-bold border-purple-600';
    if (ball.toUpperCase() === 'W') return 'bg-red-600 text-white font-bold border-red-600';
    if (ball === '0' || ball === '•') return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    return 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold border-slate-200 dark:border-slate-700';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800">
        <div className="space-y-2 pr-2">
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>BATTERS ON CREASE</span>
            <span className="font-mono text-slate-400 dark:text-slate-500">R (B) 4s 6s SR</span>
          </div>

          {currentBatters.map((b, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs py-1">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <span>{b.name}</span>
                {b.isStriker && <span className="text-amber-500 font-black text-sm">*</span>}
              </div>
              <div className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-2 text-right">
                <span className="font-black text-slate-900 dark:text-white text-sm">{b.runs}</span>
                <span className="text-slate-400 dark:text-slate-500">({b.balls})</span>
                <span className="text-slate-500 dark:text-slate-400">{b.fours}</span>
                <span className="text-slate-500 dark:text-slate-400">{b.sixes}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{b.strikeRate}</span>
              </div>
            </div>
          ))}

          {partnership && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span>Partnership: <strong className="text-slate-800 dark:text-slate-200">{partnership.runs} runs ({partnership.balls}b)</strong></span>
              <span>RR: <strong className="text-slate-800 dark:text-slate-200">{partnership.runRate}</strong></span>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-3 lg:pt-0 lg:px-4">
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>CURRENT BOWLER</span>
            <span className="font-mono text-slate-400 dark:text-slate-500">O M R W ECON</span>
          </div>

          {currentBowler ? (
            <div className="flex items-center justify-between text-xs py-1">
              <span className="font-bold text-slate-900 dark:text-white">{currentBowler.name}</span>
              <div className="font-mono text-slate-600 dark:text-slate-400 flex items-center gap-2.5 text-right">
                <span className="text-slate-800 dark:text-slate-200 font-medium">{currentBowler.overs}</span>
                <span className="text-slate-400 dark:text-slate-500">{currentBowler.maidens}</span>
                <span className="text-slate-800 dark:text-slate-200 font-medium">{currentBowler.runs}</span>
                <span className="font-black text-red-600 dark:text-red-400 text-sm">{currentBowler.wickets}</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{currentBowler.economy}</span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500 dark:text-slate-400 py-2 italic">
              Bowler yet to be recorded
            </div>
          )}

          {liveData.lastWicket && (
            <div className="text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800 truncate">
              Last Wicket: <span className="text-slate-800 dark:text-slate-200 font-medium">{liveData.lastWicket}</span>
            </div>
          )}
        </div>

        <div className="space-y-2 pt-3 lg:pt-0 lg:pl-4">
          <div className="text-[11px] font-bold tracking-wider uppercase text-slate-500 dark:text-slate-400">
            <span>THIS OVER</span>
          </div>

          {thisOverBalls && thisOverBalls.length > 0 ? (
            <div className="flex items-center gap-2 pt-1 flex-wrap">
              {thisOverBalls.map((b, i) => (
                <span
                  key={i}
                  className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs shadow-xs ${getBallBadgeColor(
                    b
                  )}`}
                >
                  {b}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs text-slate-400 dark:text-slate-500 py-1 italic">
              Waiting for over to begin
            </div>
          )}

          {liveData.equation && (
            <div className="text-[11px] text-slate-600 dark:text-slate-400 pt-2 flex items-center justify-between">
              <span className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 px-2.5 py-1 rounded-md text-amber-900 dark:text-amber-300 font-semibold w-full truncate">
                Status: <strong className="font-bold">{liveData.equation}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
