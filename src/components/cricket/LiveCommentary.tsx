'use client';

import React, { useState } from 'react';
import { CommentaryItem } from '@/types/cricket';
import { ChevronDown, Sparkles, Sun, MapPin, Award, RefreshCw } from 'lucide-react';

interface Props {
  commentary: CommentaryItem[];
}

export const LiveCommentary: React.FC<Props> = ({ commentary }) => {
  const [visibleCount, setVisibleCount] = useState<number>(15);
  const [showPreMatch, setShowPreMatch] = useState<boolean>(true);

  const preMatchItems = commentary.filter(c => c.isPreMatch);
  const ballItems = commentary.filter(c => !c.isPreMatch);

  const displayedBalls = ballItems.slice(0, visibleCount);
  const hasMore = visibleCount < ballItems.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 15);
  };

  const getBadgeStyle = (item: CommentaryItem) => {
    if (item.isWicket) return 'bg-red-600 text-white font-extrabold animate-pulse';
    if (item.isSix) return 'bg-purple-600 text-white font-bold';
    if (item.isBoundary) return 'bg-emerald-600 text-white font-bold';
    if (item.runs === 0 || item.badge === '0') return 'bg-slate-800 text-slate-400 border border-slate-700 font-medium';
    return 'bg-blue-600/30 text-blue-300 border border-blue-500/40 font-semibold';
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 shadow-xl space-y-6 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0" />
          <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-white">
            Ball-by-Ball Live Commentary
          </h3>
        </div>
        <span className="text-xs text-slate-400 font-mono">
          {ballItems.length} Balls Logged
        </span>
      </div>

      {/* Pre-Match Reports (Pitch, Weather, Toss) */}
      {preMatchItems.length > 0 && (
        <div className="bg-slate-850/80 rounded-xl border border-slate-700/70 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowPreMatch(!showPreMatch)}
            className="w-full flex items-center justify-between p-3.5 bg-slate-800/80 hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Pre-Match Show, Pitch Report & Weather Conditions</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showPreMatch ? 'rotate-180' : ''}`} />
          </button>

          {showPreMatch && (
            <div className="p-4 space-y-3 divide-y divide-slate-800 text-xs">
              {preMatchItems.map((pm, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex items-start gap-2.5">
                  <span className="text-base shrink-0">{pm.badge}</span>
                  <p className="text-slate-200 leading-relaxed font-sans">{pm.overSummary}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ball-by-Ball Commentary Stream */}
      <div className="space-y-3">
        {displayedBalls.map((comm, idx) => {
          if (comm.isOverEnd) {
            return (
              <div
                key={comm.id || idx}
                className="bg-slate-850/90 border border-amber-500/30 rounded-xl p-3 text-xs md:text-sm font-semibold text-amber-300 shadow-sm flex items-center gap-2"
              >
                <span>{comm.overSummary}</span>
              </div>
            );
          }

          return (
            <div
              key={comm.id || idx}
              className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-850/60 border border-slate-800/40 hover:border-slate-800 transition-colors"
            >
              {/* Ball Badge */}
              <div className="flex flex-col items-center shrink-0 w-12">
                <span className="font-mono text-xs font-bold text-slate-400">{comm.over}</span>
                <span className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs shadow-sm ${getBadgeStyle(
                  comm
                )}`}>
                  {comm.badge || comm.runs || '•'}
                </span>
                {comm.speed && (
                  <span className="text-[9px] font-mono text-slate-500 mt-1 whitespace-nowrap">
                    {comm.speed}
                  </span>
                )}
              </div>

              {/* Ball Details */}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-200">
                  {comm.bowler && comm.batsman ? (
                    <>
                      <span className="text-white font-bold">{comm.bowler}</span>
                      <span className="text-slate-500 font-normal">to</span>
                      <span className="text-white font-bold">{comm.batsman}</span>
                    </>
                  ) : (
                    <span className="text-white font-bold">Over {comm.over}</span>
                  )}

                  {comm.isBoundary && (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border border-emerald-500/30">
                      FOUR
                    </span>
                  )}
                  {comm.isSix && (
                    <span className="bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border border-purple-500/30">
                      SIX
                    </span>
                  )}
                  {comm.isWicket && (
                    <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border border-red-500/30">
                      WICKET
                    </span>
                  )}

                  {comm.score && (
                    <span className="ml-auto font-mono text-[11px] text-slate-400 font-bold bg-slate-800 px-2 py-0.5 rounded">
                      {comm.score}
                    </span>
                  )}
                </div>

                <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-sans">
                  {comm.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Load More Button */}
      {hasMore ? (
        <div className="pt-2 text-center">
          <button
            onClick={handleLoadMore}
            className="px-6 py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white rounded-xl text-xs font-bold border border-slate-700/80 transition-all inline-flex items-center gap-2 shadow-sm hover:border-red-500 cursor-pointer"
          >
            <ChevronDown className="w-4 h-4 text-red-400" />
            <span>Load Earlier Overs & Commentary ({ballItems.length - visibleCount} more)</span>
          </button>
        </div>
      ) : ballItems.length > 0 && (
        <div className="pt-2 text-center text-xs text-slate-500 border-t border-slate-800">
          Showing complete ball-by-ball commentary timeline
        </div>
      )}
    </div>
  );
};
