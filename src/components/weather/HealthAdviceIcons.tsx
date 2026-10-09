'use client';

import React from 'react';

export const MaskIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <rect x="8" y="14" width="24" height="15" rx="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
    <line x1="8" y1="18" x2="3" y2="15" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="25" x2="3" y2="28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="32" y1="18" x2="37" y2="15" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="32" y1="25" x2="37" y2="28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
    <line x1="14" y1="21.5" x2="26" y2="21.5" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export const OutdoorIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <circle cx="28" cy="14" r="7" fill="#F59E0B" />
    {/* Tree */}
    <path d="M16 10 C12 10 9 13 9 17 C9 20 11 22 13 23 L13 28 H19 L19 23 C21 22 23 20 23 17 C23 13 20 10 16 10 Z" fill="#22C55E" />
    <rect x="15" y="24" width="2" height="6" fill="#78350F" />
    {/* Park Bench */}
    <line x1="22" y1="26" x2="34" y2="26" stroke="#475569" strokeWidth="2" />
    <line x1="24" y1="26" x2="24" y2="30" stroke="#475569" strokeWidth="2" />
    <line x1="32" y1="26" x2="32" y2="30" stroke="#475569" strokeWidth="2" />
  </svg>
);

export const WindowIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <rect x="10" y="8" width="20" height="24" rx="2" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
    <line x1="20" y1="8" x2="20" y2="32" stroke="#0284C7" strokeWidth="2" />
    <line x1="10" y1="20" x2="30" y2="20" stroke="#0284C7" strokeWidth="2" />
    <circle cx="17" cy="20" r="1.5" fill="#F59E0B" />
    <circle cx="23" cy="20" r="1.5" fill="#F59E0B" />
  </svg>
);

export const PurifierIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <rect x="13" y="10" width="14" height="22" rx="4" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
    <circle cx="20" cy="15" r="2" fill="#38BDF8" />
    <line x1="17" y1="22" x2="23" y2="22" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="1 1" />
    <line x1="17" y1="25" x2="23" y2="25" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="1 1" />
    <line x1="17" y1="28" x2="23" y2="28" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="1 1" />
  </svg>
);

export const PlantIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    {/* Pot */}
    <path d="M14 22 L16 32 H24 L26 22 Z" fill="#EA580C" />
    {/* Stems & Leaves */}
    <path d="M20 22 V14 C17 14 15 16 15 18 C15 20 18 21 20 22 Z" fill="#22C55E" />
    <path d="M20 18 C23 18 25 15 25 13 C23 12 21 14 20 18 Z" fill="#16A34A" />
    <circle cx="20" cy="12" r="1.5" fill="#84CC16" />
  </svg>
);

export const PawIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    {/* Main Pad */}
    <ellipse cx="20" cy="24" rx="6" ry="5" fill="#EA580C" />
    {/* 4 Toes */}
    <ellipse cx="13" cy="18" rx="2.5" ry="3" fill="#F97316" />
    <ellipse cx="17.5" cy="14" rx="2.5" ry="3.5" fill="#F97316" />
    <ellipse cx="22.5" cy="14" rx="2.5" ry="3.5" fill="#F97316" />
    <ellipse cx="27" cy="18" rx="2.5" ry="3.5" fill="#F97316" />
  </svg>
);
