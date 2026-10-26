'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, X, Newspaper, Trophy } from 'lucide-react';

interface ExitConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmExit: () => void;
}

export const ExitConfirmationModal: React.FC<ExitConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirmExit,
}) => {
  const router = useRouter();

  // Handle ESC key to dismiss
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener('keydown', handleKeyDown);
    // Lock body scroll while modal is visible
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleNavigateToEPaper = () => {
    onClose();
    router.push('/epaper');
  };

  const handleNavigateToCricket = () => {
    onClose();
    router.push('/cricket');
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Exit Application Confirmation"
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Dialog Card */}
      <div
        className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-6 relative overflow-hidden transition-all transform animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle decorative top glow */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-red-500/10 dark:from-red-500/15 to-transparent pointer-events-none" />

        {/* Close (X) button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4 stroke-[2.5]" />
        </button>

        {/* Brand Icon & Heading */}
        <div className="text-center relative pt-2">
          {/* Logo Badge */}
          <div className="flex items-center justify-center mb-3">
            <img
              src="/vartiq-logo.png"
              alt="Vartiq"
              className="h-10 w-auto object-contain select-none dark:hidden"
            />
            <img
              src="/vartiq-logo-dark.png"
              alt="Vartiq"
              className="h-10 w-auto object-contain select-none hidden dark:block"
            />
          </div>

          <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
            Do you want to leave?
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed max-w-[260px] mx-auto">
            Stay connected for the latest news, live scores, and breaking updates.
          </p>
        </div>

        {/* Quick Value Engagement Cards (NO ADS) */}
        <div className="grid grid-cols-2 gap-2.5 my-4 pt-1">
          {/* Option 1: ePaper */}
          <button
            type="button"
            onClick={handleNavigateToEPaper}
            className="flex flex-col items-center p-3 rounded-2xl bg-red-50/70 hover:bg-red-100/80 dark:bg-red-950/30 dark:hover:bg-red-950/50 border border-red-200/80 dark:border-red-900/40 text-center transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-jagran-red shadow-xs mb-1.5 group-hover:scale-110 transition-transform">
              <Newspaper className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Today&apos;s E-Paper
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Digital Edition
            </span>
          </button>

          {/* Option 2: Live Cricket */}
          <button
            type="button"
            onClick={handleNavigateToCricket}
            className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/60 text-center transition-all cursor-pointer group active:scale-95"
          >
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-amber-500 shadow-xs mb-1.5 group-hover:scale-110 transition-transform">
              <Trophy className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-tight">
              Live Cricket
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
              Scores & Updates
            </span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-1">
          {/* Primary Stay Button */}
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 via-[#E43854] to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-red-500/25 active:scale-[0.98] transition-transform flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>No, Keep Reading</span>
          </button>

          {/* Secondary Exit App Button */}
          <button
            type="button"
            onClick={onConfirmExit}
            className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 font-semibold text-xs rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Yes, Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
