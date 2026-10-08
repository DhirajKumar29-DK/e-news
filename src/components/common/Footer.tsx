'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { Globe, ShieldCheck, Mail, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  const { edition } = useLanguage();

  const sisterPortals = [
    { name: 'Jagran News', url: 'https://www.jagran.com' },
    { name: 'Punjabi Jagran', url: '#' },
    { name: 'Jagran Josh', url: '#' },
    { name: 'Her Zindagi', url: '#' },
    { name: 'Only My Health', url: '#' },
    { name: 'Jagran TV', url: '#' }
  ];

  return (
    <footer className="bg-jagran-dark text-slate-300 border-t border-slate-800 transition-colors">
      
      {/* 1. TOP NEWSLETTER & GRIEVANCE STRIP */}
      <div className="bg-slate-950 border-b border-slate-800 py-8 px-4 sm:px-8 lg:px-10">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold font-serif text-white">
              Subscribe to The Daily Jagran Briefing
            </h3>
            <p className="text-xs text-slate-400">
              Top curated headlines delivered straight to your inbox every morning
            </p>
          </div>

          {/* Grievance Email Box */}
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-800 px-4 py-3 rounded-xl text-xs text-slate-300">
            <Mail className="w-5 h-5 text-jagran-red shrink-0" />
            <div>
              <p className="font-bold text-white">Grievances & Feedback:</p>
              <a href="mailto:grievance@dailyjagran.com" className="text-amber-400 hover:underline">
                grievance@dailyjagran.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN FOOTER LINKS & SISTER NETWORKS GRID */}
      <div className="max-w-[1440px] mx-auto py-12 px-4 sm:px-8 lg:px-10 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        
        {/* Col 1: Brand Info */}
        <div className="space-y-3">
          <h2 className="text-xl font-black font-serif text-white uppercase">
            THE <span className="text-[#E43854]">DAILY JAGRAN</span>
          </h2>
          <p className="text-slate-400 leading-relaxed">
            Official digital news publication of Jagran Media Network. Connect, share, thrive together.
          </p>
          <div className="flex items-center space-x-2 text-emerald-400 pt-1 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Editorial Standards</span>
          </div>

          {/* Newspaper Print/E-Paper Image Badge */}
          <div className="pt-1">
            <div className="relative rounded-lg overflow-hidden border border-slate-800 h-20 group">
              <img
                src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=600&q=80"
                alt="Digital Edition Newspaper"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-85"
              />
              <div className="absolute inset-0 bg-slate-950/40 p-2 flex items-end justify-between">
                <span className="text-[10px] font-bold text-amber-400 bg-slate-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                  E-Paper Edition
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Col 2: Sister Networks */}
        <div className="space-y-3">
          <h3 className="font-bold text-white uppercase text-sm border-b border-slate-800 pb-2">
            Network Portals
          </h3>
          <ul className="space-y-2 text-slate-400">
            {sisterPortals.map((p) => (
              <li key={p.name}>
                <a href={p.url} className="hover:text-amber-400 transition-colors flex items-center space-x-1">
                  <span>{p.name}</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Col 3: Editorial Policy & Trust */}
        <div className="space-y-3">
          <h3 className="font-bold text-white uppercase text-sm border-b border-slate-800 pb-2">
            Editorial Policy
          </h3>
          <ul className="space-y-2 text-slate-400">
            <li><a href="#" className="hover:text-amber-400 transition-colors">Code of Ethics</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Corrections Policy</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Ad Policy</a></li>
            <li><a href="#" className="hover:text-amber-400 transition-colors">Archives</a></li>
          </ul>
        </div>

        {/* Col 4: Newsroom Studio */}
        <div className="space-y-3">
          <h3 className="font-bold text-white uppercase text-sm border-b border-slate-800 pb-2">
            24/7 Live Newsroom
          </h3>
          
          {/* News-related Image Card */}
          <div className="relative rounded-xl overflow-hidden border border-slate-800 shadow-md group">
            <img
              src="https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80"
              alt="Live News Studio Desk"
              className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent p-3 flex flex-col justify-end">
              <span className="inline-flex items-center space-x-1.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider w-fit mb-1 shadow">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>LIVE DESK</span>
              </span>
              <p className="text-[11px] font-bold text-white line-clamp-1">
                The Daily Jagran Digital Studio
              </p>
            </div>
          </div>

          <p className="text-slate-400 text-[11px]">
            Active Edition: {edition.toUpperCase()}
          </p>
        </div>

      </div>

      {/* 3. BOTTOM COPYRIGHT STRIP */}
      <div className="bg-slate-950 border-t border-slate-900 py-4 px-4 sm:px-8 lg:px-10 text-center text-xs text-slate-400">
        <div className="max-w-[1440px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Jagran Media Network. All rights reserved.</p>
          
          {/* Designed & Developed by Nighwan Technology */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-400">
            <span>Designed &amp; Developed by</span>
            <a
              href="https://www.nighwantech.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-amber-400 hover:text-amber-300 transition-colors inline-flex items-center gap-1 group cursor-pointer"
              title="Nighwan Technology Official Website"
            >
              <span className="group-hover:underline">Nighwan Technology</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-amber-400/80 group-hover:text-amber-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>

          <p className="text-[11px] text-slate-500">
            The Daily Jagran Digital News Network
          </p>
        </div>
      </div>

    </footer>
  );
};
