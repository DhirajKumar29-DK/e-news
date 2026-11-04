'use client';

import React from 'react';
import { Check, AlertCircle, ShieldCheck } from 'lucide-react';

export interface PasswordCriteriaItem {
  id: string;
  label: string;
  met: boolean;
}

export interface PasswordEvaluation {
  criteria: PasswordCriteriaItem[];
  score: number; // 0 to 4
  isValid: boolean;
  strengthLabel: string;
  strengthColor: string; // Tailwind bg color class
  strengthTextColor: string; // Tailwind text color class
  hasMinLength: boolean;
  hasLetter: boolean;
  hasNumber: boolean;
  hasSpecial: boolean;
}

/**
 * Instagram / Modern security password evaluator
 * Rules:
 * 1. At least 6 characters (standard min)
 * 2. At least one letter (a-z or A-Z)
 * 3. At least one number (0-9)
 * 4. At least one special character (!@#$%^&*...)
 */
export function evaluatePassword(password: string): PasswordEvaluation {
  const safePassword = password || '';
  const hasMinLength = safePassword.length >= 6;
  const hasLetter = /[a-zA-Z]/.test(safePassword);
  const hasNumber = /[0-9]/.test(safePassword);
  const hasSpecial = /[!@#$%^&*(),.?":{}|<>_\-+=\\/\[\]~`]/.test(safePassword);

  const criteria: PasswordCriteriaItem[] = [
    { id: 'length', label: 'At least 6 characters', met: hasMinLength },
    { id: 'letter', label: 'At least 1 letter (a-z, A-Z)', met: hasLetter },
    { id: 'number', label: 'At least 1 number (0-9)', met: hasNumber },
    { id: 'special', label: 'At least 1 special symbol (!@#$...)', met: hasSpecial },
  ];

  const score = criteria.filter(c => c.met).length;
  const isValid = score === 4;

  let strengthLabel = 'Very Weak';
  let strengthColor = 'bg-rose-500';
  let strengthTextColor = 'text-rose-600';

  if (score === 0) {
    strengthLabel = safePassword.length > 0 ? 'Very Weak' : 'Enter Password';
    strengthColor = 'bg-slate-300';
    strengthTextColor = 'text-slate-400';
  } else if (score === 1) {
    strengthLabel = 'Weak';
    strengthColor = 'bg-rose-500';
    strengthTextColor = 'text-rose-600';
  } else if (score === 2) {
    strengthLabel = 'Fair';
    strengthColor = 'bg-amber-500';
    strengthTextColor = 'text-amber-600';
  } else if (score === 3) {
    strengthLabel = 'Good';
    strengthColor = 'bg-sky-500';
    strengthTextColor = 'text-sky-600';
  } else if (score === 4) {
    strengthLabel = 'Strong';
    strengthColor = 'bg-emerald-500';
    strengthTextColor = 'text-emerald-600';
  }

  return {
    criteria,
    score,
    isValid,
    strengthLabel,
    strengthColor,
    strengthTextColor,
    hasMinLength,
    hasLetter,
    hasNumber,
    hasSpecial
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  confirmPassword?: string;
  showMatch?: boolean;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  confirmPassword,
  showMatch = false,
  className = ''
}: PasswordStrengthIndicatorProps) {
  const evalResult = evaluatePassword(password);
  const isTyping = (password || '').length > 0;

  const isMatching =
    confirmPassword !== undefined &&
    confirmPassword.length > 0 &&
    password === confirmPassword;

  const isMismatch =
    confirmPassword !== undefined &&
    confirmPassword.length > 0 &&
    password !== confirmPassword;

  return (
    <div className={`space-y-2.5 pt-1.5 ${className}`}>
      {/* Strength Bar & Label (Visible when user starts typing) */}
      {isTyping && (
        <div className="space-y-1.5 animate-fadeIn">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-semibold text-slate-500">Password Strength:</span>
            <span className={`font-black uppercase tracking-wider text-[10px] ${evalResult.strengthTextColor}`}>
              {evalResult.strengthLabel}
            </span>
          </div>

          {/* 4 Segmented Strength Bars */}
          <div className="grid grid-cols-4 gap-1.5">
            {[1, 2, 3, 4].map(step => (
              <div
                key={step}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  evalResult.score >= step ? evalResult.strengthColor : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Instagram-style Checklist (Clean, High-Trust Pills/Items) */}
      <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-200/80 space-y-1.5">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-0.5 flex items-center justify-between">
          <span>Security Requirements</span>
          {evalResult.isValid && (
            <span className="text-emerald-600 font-extrabold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              <span>All Met</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-0.5">
          {evalResult.criteria.map(c => (
            <div
              key={c.id}
              className={`flex items-center space-x-1.5 text-[11px] transition-colors ${
                c.met ? 'text-emerald-700 font-semibold' : 'text-slate-400 font-normal'
              }`}
            >
              {c.met ? (
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              ) : (
                <span className="w-3.5 h-3.5 rounded-full bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                </span>
              )}
              <span className="truncate">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Confirm Password Match Status */}
      {showMatch && confirmPassword !== undefined && confirmPassword.length > 0 && (
        <div className="animate-fadeIn pt-0.5">
          {isMatching ? (
            <p className="text-[11px] text-emerald-700 font-bold flex items-center space-x-1.5 bg-emerald-50 border border-emerald-200/80 px-2.5 py-1.5 rounded-lg">
              <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3] shrink-0" />
              <span>Passwords match perfectly</span>
            </p>
          ) : isMismatch ? (
            <p className="text-[11px] text-rose-600 font-bold flex items-center space-x-1.5 bg-rose-50 border border-rose-200/80 px-2.5 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span>Passwords do not match yet</span>
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}

