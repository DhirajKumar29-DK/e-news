'use client';

import React, { useState, useMemo } from 'react';
import { CommentaryItem } from '@/types/cricket';
import { ChevronDown, Trophy, Award, Radio, Info } from 'lucide-react';

interface Props {
  commentary: CommentaryItem[];
}

export const LiveCommentary: React.FC<Props> = ({ commentary }) => {
  const [visibleCount, setVisibleCount] = useState<number>(20);
  const [selectedInning, setSelectedInning] = useState<string>('all');

  // Filter only real commentary items (no pre-match accordion, no 📌 milestone note cards)
  const cleanItems = useMemo(() => {
    return (commentary || []).filter(c => {
      if (!c) return false;
      if (c.isPreMatch || c.type === 'prematch') return false;
      if (c.type === 'milestone') return false;
      if (c.isOverEnd && c.overSummary && c.overSummary.includes('📌')) return false;
      if (!c.text && !c.over) return false;
      return true;
    });
  }, [commentary]);

  // Detect unique innings present in clean items
  const availableInnings = useMemo(() => {
    const set = new Set<string>();
    cleanItems.forEach(b => {
      if (b.inning) set.add(String(b.inning));
    });
    return Array.from(set).sort((a, b) => parseInt(b, 10) - parseInt(a, 10));
  }, [cleanItems]);

  // Filter by selected inning if user clicked an inning tab
  const filteredItems = useMemo(() => {
    if (selectedInning === 'all' || availableInnings.length <= 1) {
      return cleanItems;
    }
    return cleanItems.filter(b => String(b.inning || '1') === selectedInning);
  }, [cleanItems, selectedInning, availableInnings]);

  const displayedItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 20);
  };

  const getBadgeStyle = (item: CommentaryItem) => {
    if (item.isWicket) return 'bg-red-600 text-white font-extrabold shadow-xs';
    if (item.isSix) return 'bg-purple-600 text-white font-bold shadow-xs';
    if (item.isBoundary) return 'bg-emerald-600 text-white font-bold shadow-xs';
    if (item.runs === 0 || item.badge === '0') return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold';
    return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 font-bold';
  };

  // Helper to detect presentation / post-match / award highlight in editorial commentary
  const getEditorialHighlight = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('player of the match') || lower.includes('man of the match')) {
      return { label: 'Player of the Match', icon: Award, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60' };
    }
    if (lower.includes('presentation ceremony') || lower.includes('signing off') || lower.includes('captain')) {
      return { label: 'Presentation & Post-Match', icon: Trophy, color: 'text-red-500 bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-800/60' };
    }
    if (lower.includes('ball-by-ball updates are unavailable') || lower.includes('match note')) {
      return { label: 'Match Notice', icon: Info, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800/60' };
    }
    return { label: 'Live Update', icon: Radio, color: 'text-slate-500 bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700' };
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 md:p-6 shadow-xs space-y-5 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping shrink-0" />
          <h3 className="text-sm md:text-base font-bold uppercase tracking-wider text-slate-900 dark:text-white">
            Ball-by-Ball Live Commentary
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {/* Inning filter tabs if multiple innings exist */}
          {availableInnings.length > 1 && (
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setSelectedInning('all'); setVisibleCount(20); }}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  selectedInning === 'all'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                All
              </button>
              {availableInnings.map(inn => (
                <button
                  key={inn}
                  type="button"
                  onClick={() => { setSelectedInning(inn); setVisibleCount(20); }}
                  className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                    selectedInning === inn
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {inn === '2' ? '2nd Inn' : inn === '1' ? '1st Inn' : `Inn ${inn}`}
                </button>
              ))}
            </div>
          )}

          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono ml-auto sm:ml-0">
            {filteredItems.length} Entries Logged
          </span>
        </div>
      </div>

      {/* Commentary Stream */}
      {displayedItems.length === 0 ? (
        <div className="py-12 text-center text-slate-400 dark:text-slate-500 text-sm">
          No commentary logged yet for this match. Live updates will appear here automatically.
        </div>
      ) : (
        <div className="space-y-3">
          {displayedItems.map((comm, idx) => {
            // Check if item is ball-by-ball or editorial / presentation
            const isBall = comm.type === 'ball' || Boolean(comm.over);

            if (!isBall) {
              const highlight = getEditorialHighlight(comm.text || '');
              const Icon = highlight.icon;

              return (
                <div
                  key={comm.id || `edit_${idx}`}
                  className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3.5 md:p-4 space-y-2 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${highlight.color}`}>
                      <Icon className="w-3.5 h-3.5 shrink-0" />
                      <span>{highlight.label}</span>
                    </span>
                    {comm.timestamp && (
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
                        {new Date(comm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                  <p className="text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-sans font-medium whitespace-pre-line">
                    {comm.text}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={comm.id || `${comm.inning}_${comm.over}_${comm.ball}_${idx}`}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                {/* Ball Badge */}
                <div className="flex flex-col items-center shrink-0 w-11">
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-slate-400">
                    {comm.over}
                  </span>
                  <span
                    className={`mt-1 w-7 h-7 rounded-full flex items-center justify-center text-xs ${getBadgeStyle(
                      comm
                    )}`}
                  >
                    {comm.badge || comm.runs || '•'}
                  </span>
                  {comm.speed && (
                    <span className="text-[9px] font-mono text-slate-400 dark:text-slate-500 mt-1 whitespace-nowrap">
                      {comm.speed}
                    </span>
                  )}
                </div>

                {/* Ball Details */}
                <div className="flex-1 space-y-1.5 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {comm.bowler && comm.batsman ? (
                      <>
                        <span className="text-slate-900 dark:text-white font-bold">{comm.bowler}</span>
                        <span className="text-slate-400 dark:text-slate-500 font-normal">to</span>
                        <span className="text-slate-900 dark:text-white font-bold">{comm.batsman}</span>
                      </>
                    ) : (
                      <span className="text-slate-900 dark:text-white font-bold">Over {comm.over}</span>
                    )}

                    {comm.isBoundary && (
                      <span className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border border-emerald-200 dark:border-emerald-800/60">
                        FOUR
                      </span>
                    )}
                    {comm.isSix && (
                      <span className="bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border border-purple-200 dark:border-purple-800/60">
                        SIX
                      </span>
                    )}
                    {comm.isWicket && (
                      <span className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase border border-red-200 dark:border-red-800/60">
                        WICKET
                      </span>
                    )}

                    {comm.score && (
                      <span className="ml-auto font-mono text-[11px] text-slate-600 dark:text-slate-300 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                        {comm.score}
                      </span>
                    )}
                  </div>

                  <p className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                    {comm.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Load More Button */}
      {hasMore ? (
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleLoadMore}
            className="px-6 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
          >
            <ChevronDown className="w-4 h-4 text-red-600 dark:text-red-400" />
            <span>Load Earlier Entries ({filteredItems.length - visibleCount} more)</span>
          </button>
        </div>
      ) : (
        displayedItems.length > 0 && (
          <div className="pt-2 text-center text-xs text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800">
            Showing complete commentary timeline
          </div>
        )
      )}
    </div>
  );
};
