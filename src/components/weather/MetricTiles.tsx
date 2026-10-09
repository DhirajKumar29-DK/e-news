'use client';

import React from 'react';

export const WindsockIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="10" y1="6" x2="10" y2="34" strokeWidth="2.5" className="text-gray-400" />
    <path d="M10 10 L30 14 L28 22 L10 20 Z" fill="#EF4444" stroke="#DC2626" />
    <path d="M16 11 L16 21" stroke="#FFFFFF" strokeWidth="2" />
    <path d="M22 12.5 L22 21.5" stroke="#FFFFFF" strokeWidth="2" />
  </svg>
);

export const SunriseIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <path d="M14 22 C14 16.5 17.5 12 20 12 C22.5 12 26 16.5 26 22 Z" fill="#F59E0B" />
    <line x1="20" y1="8" x2="20" y2="4" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="10" y1="12" x2="7" y2="9" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <line x1="30" y1="12" x2="33" y2="9" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M6 26 Q 13 22 20 26 T 34 26" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M8 32 Q 14 28 20 32 T 32 32" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const SunsetIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <path d="M14 22 C14 16.5 17.5 12 20 12 C22.5 12 26 16.5 26 22 Z" fill="#EA580C" />
    <line x1="20" y1="16" x2="20" y2="20" stroke="#EA580C" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M6 26 Q 13 22 20 26 T 34 26" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M8 32 Q 14 28 20 32 T 32 32" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const PressureGaugeIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <circle cx="20" cy="20" r="14" stroke="#64748B" strokeWidth="2.5" />
    <path d="M12 24 A 10 10 0 1 1 28 24" stroke="#CBD5E1" strokeWidth="2" strokeDasharray="2 3" />
    <line x1="20" y1="20" x2="26" y2="14" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="20" cy="20" r="2.5" fill="#1E293B" />
  </svg>
);

export const TempRangeIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <circle cx="16" cy="22" r="11" stroke="#38BDF8" strokeWidth="2" fill="#E0F2FE" />
    <path d="M12 16 Q 16 18 19 16" stroke="#0284C7" strokeWidth="1.5" />
    {/* Thermometer */}
    <rect x="25" y="10" width="6" height="18" rx="3" fill="#FFFFFF" stroke="#F43F5E" strokeWidth="2" />
    <circle cx="28" cy="28" r="4.5" fill="#F43F5E" />
    <line x1="28" y1="16" x2="28" y2="28" stroke="#F43F5E" strokeWidth="2" />
  </svg>
);

export const UvIndexIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <circle cx="16" cy="24" r="8" fill="#F59E0B" />
    <line x1="16" y1="12" x2="16" y2="8" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="16" x2="5" y2="13" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    {/* Sensor */}
    <rect x="26" y="16" width="6" height="16" rx="2" fill="#6366F1" />
    <line x1="29" y1="16" x2="29" y2="10" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const WeatherVaneIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" stroke="#475569" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="20" y1="14" x2="20" y2="34" strokeWidth="2.5" />
    {/* Compass Cross */}
    <line x1="12" y1="26" x2="28" y2="26" />
    <line x1="20" y1="20" x2="20" y2="30" />
    {/* Rooster */}
    <path d="M16 14 C16 10 20 8 22 10 C24 8 26 10 24 14 Z" fill="#64748B" />
    <line x1="14" y1="14" x2="26" y2="14" />
  </svg>
);

export const DropletIcon = ({ className = 'w-6 h-6' }: { className?: string }) => (
  <svg viewBox="0 0 40 40" fill="none" className={className}>
    <circle cx="20" cy="20" r="14" fill="#E0F2FE" />
    <path d="M20 10 C20 10 13 18 13 23 C13 27 16 30 20 30 C24 30 27 27 27 23 C27 18 20 10 20 10 Z" fill="#0284C7" />
  </svg>
);
