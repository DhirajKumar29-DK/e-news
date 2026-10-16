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
      <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 p-2 gap-2 overflow-x-auto no-scrollbar">
        {scorecard.innings.map((inn, idx) => (
          <button
            key={idx}
            onClick={() => setActiveInningIndex(idx)}
            className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 cursor-pointer ${
              activeInningIndex === idx
                ? 'bg-red-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <img src={inn.teamLogo} alt={inn.teamName} className="w-5 h-5 rounded-full object-cover shadow-xs border border-white dark:border-slate-700" />
            <span>{inn.teamName}</span>
            <span className="font-mono bg-black/10 dark:bg-white/10 px-2 py-0.5 rounded text-xs">{inn.totalScore}</span>
          </button>
        ))}
      </div>

      <div className="p-4 md:p-6 space-y-4">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Batting</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm min-w-[460px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                <th className="py-2.5 px-2 font-bold">Batter</th>
                <th className="py-2.5 px-2 font-bold">Dismissal</th>
                <th className="py-2.5 px-2 text-right font-bold">R</th>
                <th className="py-2.5 px-2 text-right font-bold">B</th>
                <th className="py-2.5 px-2 text-right font-bold">4s</th>
                <th className="py-2.5 px-2 text-right font-bold">6s</th>
                <th className="py-2.5 px-2 text-right font-bold">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-sans">
              {activeInning.batting.map((b, i) => (
                <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">
                    {b.name}
                  </td>
                  <td className="py-3 px-2 text-slate-500 dark:text-slate-400 text-xs italic max-w-xs truncate">{b.dismissal}</td>
                  <td className="py-3 px-2 text-right font-mono font-black text-slate-900 dark:text-white text-sm">{b.runs}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-600 dark:text-slate-400">{b.balls}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-500 dark:text-slate-400">{b.fours}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-500 dark:text-slate-400">{b.sixes}</td>
                  <td className="py-3 px-2 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">{b.strikeRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="text-slate-600 dark:text-slate-400">
            <span>Extras: </span>
            <strong className="text-slate-900 dark:text-white font-semibold">{activeInning.extras}</strong>
          </div>
          <div className="text-slate-700 dark:text-slate-300 font-semibold">
            <span>Total: </span>
            <strong className="text-slate-900 dark:text-white font-mono text-sm font-black">{activeInning.total}</strong>
          </div>
        </div>

        {activeInning.didNotBat && activeInning.didNotBat.length > 0 && (
          <div className="text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-700 dark:text-slate-300">Yet to bat: </span>
            <span>{activeInning.didNotBat.join(', ')}</span>
          </div>
        )}

        {activeInning.fallOfWickets && activeInning.fallOfWickets.length > 0 && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">Fall of Wickets</h4>
            <div className="flex flex-wrap gap-2">
              {activeInning.fallOfWickets.map((f, idx) => (
                <div key={idx} className="bg-slate-100 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs px-2.5 py-1 rounded-lg">
                  <span className="font-mono font-bold text-red-600 dark:text-red-400">{f.score}</span>{' '}
                  <span className="text-slate-700 dark:text-slate-300 font-medium">({f.batter}, {f.over} ov)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bowling Table */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Bowling</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider bg-slate-50/50 dark:bg-slate-800/40">
                  <th className="py-2.5 px-2 font-bold">Bowler</th>
                  <th className="py-2.5 px-2 text-right font-bold">O</th>
                  <th className="py-2.5 px-2 text-right font-bold">M</th>
                  <th className="py-2.5 px-2 text-right font-bold">R</th>
                  <th className="py-2.5 px-2 text-right font-bold">W</th>
                  <th className="py-2.5 px-2 text-right font-bold">ECON</th>
                  <th className="py-2.5 px-2 text-right font-bold">0s</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 font-sans">
                {activeInning.bowling.map((bw, i) => (
                  <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-2 font-bold text-slate-900 dark:text-white">{bw.name}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700 dark:text-slate-300">{bw.overs}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-500 dark:text-slate-400">{bw.maidens}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-700 dark:text-slate-300">{bw.runs}</td>
                    <td className="py-3 px-2 text-right font-mono font-black text-red-600 dark:text-red-400 text-sm">{bw.wickets}</td>
                    <td className="py-3 px-2 text-right font-mono text-emerald-600 dark:text-emerald-400 font-bold">{bw.economy}</td>
                    <td className="py-3 px-2 text-right font-mono text-slate-500 dark:text-slate-400">{bw.dots}</td>
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
