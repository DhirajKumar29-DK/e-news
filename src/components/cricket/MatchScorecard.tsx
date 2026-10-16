'use client';

import React, { useState } from 'react';
import { ScorecardData } from '@/types/cricket';

interface Props {
  scorecard: ScorecardData;
}

export const MatchScorecard: React.FC<Props> = ({ scorecard }) => {
  const [activeInningIndex, setActiveInningIndex] = useState(0);
  const activeInning = scorecard.innings[activeInningIndex] || scorecard.innings[0];

  if (!activeInning) return null;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* 1. INNINGS SELECTION PILLS (EXACT MATCH TO IMAGE 1 BENCHMARK) */}
      <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {scorecard.innings.map((inn, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveInningIndex(idx)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-2 ${
              activeInningIndex === idx
                ? 'bg-[#122e62] dark:bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <span>{inn.teamName} Innings</span>
            {inn.totalScore && (
              <span className="font-mono text-[11px] opacity-80">({inn.totalScore})</span>
            )}
          </button>
        ))}
      </div>

      <div className="p-3 sm:p-5 space-y-4">
        {/* 2. BATTING TABLE (DISMISSAL DIRECTLY UNDER PLAYER NAME - FITS 100% ON MOBILE) */}
        <div>
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider bg-slate-50/60 dark:bg-slate-800/40">
                <th className="py-2.5 px-2 font-bold">Player Name</th>
                <th className="py-2.5 px-1.5 text-right font-bold w-9 sm:w-12">R</th>
                <th className="py-2.5 px-1.5 text-right font-bold w-8 sm:w-11">B</th>
                <th className="py-2.5 px-1.5 text-right font-bold w-7 sm:w-10">4S</th>
                <th className="py-2.5 px-1.5 text-right font-bold w-7 sm:w-10">6S</th>
                <th className="py-2.5 px-1.5 text-right font-bold w-12 sm:w-16">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-sans">
              {activeInning.batting.map((b, i) => {
                const isNotOut = (b.dismissal || '').toLowerCase().includes('not out');
                return (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-2">
                      <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                        {b.name}
                      </div>
                      <div
                        className={`text-[11px] leading-tight mt-0.5 ${
                          isNotOut
                            ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                            : 'text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {isNotOut ? 'Not Out' : b.dismissal}
                      </div>
                    </td>
                    <td className="py-2.5 px-1.5 text-right font-mono font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                      {b.runs}
                    </td>
                    <td className="py-2.5 px-1.5 text-right font-mono text-slate-600 dark:text-slate-400 text-xs sm:text-sm">
                      {b.balls}
                    </td>
                    <td className="py-2.5 px-1.5 text-right font-mono text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                      {b.fours}
                    </td>
                    <td className="py-2.5 px-1.5 text-right font-mono text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                      {b.sixes}
                    </td>
                    <td className="py-2.5 px-1.5 text-right font-mono text-slate-700 dark:text-slate-300 font-medium text-xs sm:text-sm">
                      {b.strikeRate}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 3. EXTRAS & TOTAL SUMMARY CARD */}
        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span>Extras: <strong className="text-slate-800 dark:text-slate-200 font-semibold">{activeInning.extras}</strong></span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60 font-bold text-slate-900 dark:text-white">
            <span>Total:</span>
            <span className="font-mono text-sm font-black">{activeInning.total}</span>
          </div>
        </div>

        {/* 4. YET TO BAT */}
        {activeInning.didNotBat && activeInning.didNotBat.length > 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400 py-1">
            <span className="font-bold text-slate-700 dark:text-slate-300">Yet to bat: </span>
            <span>{activeInning.didNotBat.join(', ')}</span>
          </div>
        )}

        {/* 5. FALL OF WICKETS */}
        {activeInning.fallOfWickets && activeInning.fallOfWickets.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              Fall of Wickets
            </h4>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {activeInning.fallOfWickets.map((f, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1.5"
                >
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">{f.score}</span>
                  <span className="text-slate-600 dark:text-slate-300 text-[11px]">({f.batter}, {f.over} ov)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. BOWLING TABLE (COMPACT 7-COLUMN MOBILE FRIENDLY) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Bowling
          </h3>
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] sm:text-[11px] uppercase tracking-wider bg-slate-50/60 dark:bg-slate-800/40">
                  <th className="py-2 px-1.5 sm:px-2 font-bold">Bowler</th>
                  <th className="py-2 px-1 text-right font-bold w-7 sm:w-10">O</th>
                  <th className="py-2 px-1 text-right font-bold w-6 sm:w-8">M</th>
                  <th className="py-2 px-1 text-right font-bold w-7 sm:w-10">R</th>
                  <th className="py-2 px-1 text-right font-bold w-7 sm:w-10">W</th>
                  <th className="py-2 px-1.5 text-right font-bold w-12 sm:w-16">Econ</th>
                  <th className="py-2 px-1 text-right font-bold w-6 sm:w-8">0s</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-sans">
                {activeInning.bowling.map((bw, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-1.5 sm:px-2 font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                      {bw.name}
                    </td>
                    <td className="py-2.5 px-1 text-right font-mono text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{bw.overs}</td>
                    <td className="py-2.5 px-1 text-right font-mono text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{bw.maidens}</td>
                    <td className="py-2.5 px-1 text-right font-mono text-slate-700 dark:text-slate-300 text-xs sm:text-sm">{bw.runs}</td>
                    <td className="py-2.5 px-1 text-right font-mono font-black text-red-600 dark:text-red-400 text-xs sm:text-sm">{bw.wickets}</td>
                    <td className="py-2.5 px-1.5 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm">{bw.economy}</td>
                    <td className="py-2.5 px-1 text-right font-mono text-slate-500 dark:text-slate-400 text-xs sm:text-sm">{bw.dots}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
