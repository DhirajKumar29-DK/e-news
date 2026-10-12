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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden text-slate-100">
      <div className="flex border-b border-slate-800 bg-slate-950/70 p-2 gap-2 overflow-x-auto no-scrollbar">
        {scorecard.innings.map((inn, idx) => (
          <button
            key={idx}
            onClick={() => setActiveInningIndex(idx)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all shrink-0 ${
              activeInningIndex === idx
                ? 'bg-red-600 text-white shadow-md'
                : 'bg-slate-850 hover:bg-slate-800 text-slate-300'
            }`}
          >
            <img src={inn.teamLogo} alt={inn.teamName} className="w-5 h-5 rounded-full object-cover" />
            <span>{inn.teamName}</span>
            <span className="font-mono bg-black/30 px-2 py-0.5 rounded text-xs">{inn.totalScore}</span>
          </button>
        ))}
      </div>

      <div className="p-4 md:p-6 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Batting</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm min-w-[460px]">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="py-2.5 font-bold">Batter</th>
                <th className="py-2.5 font-bold">Dismissal</th>
                <th className="py-2.5 text-right font-bold">R</th>
                <th className="py-2.5 text-right font-bold">B</th>
                <th className="py-2.5 text-right font-bold">4s</th>
                <th className="py-2.5 text-right font-bold">6s</th>
                <th className="py-2.5 text-right font-bold">SR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {activeInning.batting.map((b, i) => (
                <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 font-semibold text-slate-100 flex items-center gap-1.5">
                    {b.name}
                  </td>
                  <td className="py-3 text-slate-400 text-xs italic max-w-xs truncate">{b.dismissal}</td>
                  <td className="py-3 text-right font-mono font-bold text-white text-sm">{b.runs}</td>
                  <td className="py-3 text-right font-mono text-slate-300">{b.balls}</td>
                  <td className="py-3 text-right font-mono text-slate-400">{b.fours}</td>
                  <td className="py-3 text-right font-mono text-slate-400">{b.sixes}</td>
                  <td className="py-3 text-right font-mono text-emerald-400 font-semibold">{b.strikeRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-slate-850/60 rounded-xl p-3 border border-slate-800 text-xs flex flex-wrap items-center justify-between gap-3">
          <div className="text-slate-400">
            <span>Extras: </span>
            <strong className="text-slate-200">{activeInning.extras}</strong>
          </div>
          <div className="text-slate-200 font-semibold">
            <span>Total: </span>
            <strong className="text-amber-400 font-mono text-sm font-bold">{activeInning.total}</strong>
          </div>
        </div>

        {activeInning.didNotBat && activeInning.didNotBat.length > 0 && (
          <div className="text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Yet to bat: </span>
            <span>{activeInning.didNotBat.join(', ')}</span>
          </div>
        )}

        {activeInning.fallOfWickets && activeInning.fallOfWickets.length > 0 && (
          <div className="pt-3 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Fall of Wickets</h4>
            <div className="flex flex-wrap gap-2">
              {activeInning.fallOfWickets.map((f, idx) => (
                <div key={idx} className="bg-slate-800 border border-slate-700/60 text-xs px-2.5 py-1 rounded-lg">
                  <span className="font-mono font-bold text-red-400">{f.score}</span>{' '}
                  <span className="text-slate-300">({f.batter}, {f.over} ov)</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-4 border-t border-slate-800 space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Bowling</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="py-2.5 font-bold">Bowler</th>
                  <th className="py-2.5 text-right font-bold">O</th>
                  <th className="py-2.5 text-right font-bold">M</th>
                  <th className="py-2.5 text-right font-bold">R</th>
                  <th className="py-2.5 text-right font-bold">W</th>
                  <th className="py-2.5 text-right font-bold">ECON</th>
                  <th className="py-2.5 text-right font-bold">0s</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {activeInning.bowling.map((bw, i) => (
                  <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 font-semibold text-slate-100">{bw.name}</td>
                    <td className="py-3 text-right font-mono text-slate-300">{bw.overs}</td>
                    <td className="py-3 text-right font-mono text-slate-400">{bw.maidens}</td>
                    <td className="py-3 text-right font-mono text-slate-300">{bw.runs}</td>
                    <td className="py-3 text-right font-mono font-bold text-red-400 text-sm">{bw.wickets}</td>
                    <td className="py-3 text-right font-mono text-emerald-400 font-semibold">{bw.economy}</td>
                    <td className="py-3 text-right font-mono text-slate-400">{bw.dots}</td>
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
