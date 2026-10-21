'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  const { edition } = useLanguage();

  const editorialDesks = [
    'National & Politics',
    'Global Affairs',
    'Technology & AI',
    'Business & Markets',
    'Cricket & Sports',
    'Science & Discovery'
  ];

  const editorialStandards = [
    'Independent Reporting',
    'Verified Source Protocol',
    'Corrections & Clarifications',
    'Fact-Checking Standards',
    'Reader Privacy & Security'
  ];

  return (
    <footer className="hidden md:block w-full max-w-full overflow-hidden bg-jagran-dark text-slate-300 border-t border-slate-800 transition-colors">
      
      {/* 1. TOP NEWSLETTER & GRIEVANCE STRIP (No Links) */}
      <div className="bg-slate-950 border-b border-slate-800 py-8 px-4 sm:px-8 lg:px-10">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold font-serif text-white">
              Vartiq Daily Briefing
            </h3>
            <p className="text-xs text-slate-400">
              Top curated headlines delivered straight to your news desk every morning
            </p>
          </div>

          {/* Grievance & Feedback Box (Plain text, no links) */}
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-xs text-slate-300 max-w-full min-w-0 overflow-hidden w-full sm:w-auto">
            <Mail className="w-5 h-5 text-red-500 shrink-0" />
            <div>
              <p className="font-bold text-white">Editorial Inquiries &amp; Feedback:</p>
              <p className="text-amber-400 font-mono text-[11px] select-all">
                support@nighwantech.com
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER CONTENT GRID (No Links) */}
      <div className="max-w-[1440px] mx-auto py-12 px-4 sm:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        
        {/* Col 1: Brand Info */}
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="flex items-center shrink-0" title="Vartiq">
              <img
                src="/vartiq-logo-dark.png"
                alt="Vartiq"
                className="h-[38px] md:h-[52px] w-auto object-contain select-none transform scale-x-[1.12] origin-left"
              />
            </div>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Official digital news publication of Vartiq Network. Dedicated to fearless, verified, and real-time independent journalism.
          </p>
          <div className="flex items-center space-x-2 text-emerald-400 pt-1 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Editorial Standards</span>
          </div>

          {/* Digital Edition Image Badge */}
          <div className="pt-1">
            <div className="relative rounded-lg overflow-hidden border border-slate-800 h-20">
              <img
                src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80"
                alt="Vartiq Digital Edition"
                className="w-full h-full object-cover brightness-85"
              />
              <div className="absolute inset-0 bg-slate-950/40 p-2 flex items-end justify-between">
                <span className="text-[10px] font-bold text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  Digital Edition
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Editorial Desks (Informational plain text, no links) */}
        <div className="space-y-3">
          <h3 className="font-bold text-white uppercase text-sm border-b border-slate-800 pb-2">
            Editorial Desks
          </h3>
          <ul className="space-y-2 text-slate-400">
            {editorialDesks.map((desk) => (
              <li key={desk} className="flex items-center space-x-2 text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500/80 shrink-0" />
                <span>{desk}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Publishing Principles & Standards (Plain text, no links) */}
        <div className="space-y-3">
          <h3 className="font-bold text-white uppercase text-sm border-b border-slate-800 pb-2">
            Publishing Principles
          </h3>
          <ul className="space-y-2 text-slate-400">
            {editorialStandards.map((std) => (
              <li key={std} className="flex items-center space-x-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                {std === 'Reader Privacy & Security' ? (
                  <Link href="/privacy-policy" className="hover:text-amber-400 transition-colors underline decoration-slate-600 underline-offset-2">
                    {std}
                  </Link>
                ) : (
                  <span>{std}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Col 4: Newsroom Studio */}
        <div className="space-y-3">
          <h3 className="font-bold text-white uppercase text-sm border-b border-slate-800 pb-2">
            24/7 Live Newsroom
          </h3>
          
          <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-md">
            <img
              src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"
              alt="Live News Studio Desk"
              className="w-full h-28 object-cover brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3 flex flex-col justify-end">
              <span className="inline-flex items-center space-x-1.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider w-fit mb-1 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>LIVE DESK</span>
              </span>
              <p className="text-[11px] font-bold text-white line-clamp-1">
                Vartiq Digital Studio
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-[11px]">
            Active Edition: {edition.toUpperCase()}
          </p>
        </div>

      </div>

      {/* 3. BOTTOM COPYRIGHT STRIP */}
      <div className="w-full bg-slate-950 border-t border-slate-900 pt-4 pb-20 md:pb-4 px-4 sm:px-8 lg:px-10 text-xs text-slate-400">
        <div className="max-w-[1440px] mx-auto flex flex-col md:grid md:grid-cols-3 items-center justify-between gap-3">
          {/* Left: Copyright */}
          <p className="text-center md:text-left">
            © {new Date().getFullYear()} Vartiq Network. All rights reserved.
          </p>
          
          {/* Center: Nighwan Technology */}
          <div className="flex items-center justify-center space-x-1.5 text-center">
            <span>Designed &amp; Developed by</span>
            <a href="https://nighwantech.com" target="_blank" rel="noopener noreferrer" className="font-bold text-amber-400 hover:underline">
              Nighwan Technology
            </a>
          </div>

          {/* Right: PP (Privacy Policy), RP (Refund Policy) & T&C (Terms & Conditions) */}
          <div className="flex items-center justify-center md:justify-end space-x-3 text-xs text-slate-400">
            <Link href="/privacy-policy" className="hover:text-amber-400 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-amber-400 transition-colors">
              Refund Policy
            </Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-amber-400 transition-colors">
              Terms &amp; Conditions
            </Link>
          </div>
        </div>
      </div>

    </footer>
  );
};
