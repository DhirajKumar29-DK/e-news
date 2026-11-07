'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowRight, ArrowLeft, Newspaper, Video, Flame, Activity } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center relative overflow-hidden px-4 py-12 select-none font-sans">
      
      {/* 1. Background radial gradient from top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-red-600/15 via-[#050505] to-[#050505] pointer-events-none" />

      {/* 2. Precision Grid lines matching 60px fabfit grid */}
      <div 
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
          backgroundSize: "60px 60px"
        }} 
      />

      {/* 3. Glowing central blur orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-red-600/20 rounded-full blur-[140px] pointer-events-none animate-pulse-soft" />

      {/* 4. Center container */}
      <div className="max-w-3xl w-full text-center relative z-10 space-y-8 flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        
        {/* Floating icon card with glow blur */}
        <div className="relative flex items-center justify-center my-2">
          {/* Blur behind icon card */}
          <div className="absolute w-36 h-36 rounded-full bg-red-600/20 blur-xl animate-pulse" />

          {/* The card itself */}
          <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-br from-zinc-900 via-[#121216] to-black border-2 border-red-500/40 flex items-center justify-center shadow-[0_0_50px_rgba(220,38,38,0.3)] relative group cursor-pointer animate-fabfit-float">
            <Newspaper className="w-14 h-14 sm:w-16 sm:h-16 text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,0.8)] transition-transform duration-300 group-hover:scale-110" />
            
            {/* Top-right ping badge */}
            <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500" />
            </span>
          </div>
        </div>

        {/* 404 tag badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-black tracking-[0.25em] uppercase shadow-[0_0_15px_rgba(220,38,38,0.2)]">
          <Flame className="w-4 h-4 text-red-500 animate-bounce" />
          <span>404 // WIRE REPORT NOT FOUND</span>
          <Activity className="w-4 h-4 text-red-500 ml-1" />
        </div>

        {/* Giant 404 + Tagline */}
        <div className="relative">
          <h1 className="font-heading text-8xl sm:text-[130px] md:text-[160px] font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-200 to-zinc-600 tracking-tighter leading-none select-none">
            404
          </h1>
          <p className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-red-500 font-black text-xs sm:text-sm tracking-[0.4em] uppercase whitespace-nowrap bg-black/80 px-4 py-1 border border-red-500/20 rounded-md backdrop-blur-md shadow-lg">
            PAGE HAS GONE OFF THE WIRE
          </p>
        </div>

        {/* Headline + description */}
        <div className="space-y-2 max-w-xl mx-auto pt-2">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            PAGE NOT FOUND
          </h2>
          <p className="text-zinc-400 text-sm sm:text-base font-medium leading-relaxed">
            We couldn&apos;t find the news wire or page you requested. Explore live video dispatches or return to the homepage to get back on track.
          </p>
        </div>

        {/* 3 Buttons in Exact Grid: grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 max-w-2xl */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full pt-4 max-w-2xl">
          
          {/* Button 1: HOME */}
          <Link 
            href="/"
            className="group relative inline-flex items-center justify-center gap-2.5 bg-red-600 text-white font-black text-xs sm:text-sm tracking-widest uppercase px-6 py-4 rounded-2xl hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_30px_rgba(220,38,38,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] hover:scale-105 cursor-pointer"
          >
            <Home className="w-4 h-4 stroke-[3]" />
            <span>HOME</span>
            <ArrowRight className="w-4 h-4 stroke-[3] transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          {/* Button 2: VIDEOS */}
          <Link 
            href="/videos"
            className="group inline-flex items-center justify-center gap-2.5 bg-zinc-900/90 border border-white/10 text-white font-bold text-xs sm:text-sm tracking-widest uppercase px-6 py-4 rounded-2xl hover:border-red-500 hover:text-red-500 transition-all duration-300 backdrop-blur-md hover:scale-105 cursor-pointer"
          >
            <Video className="w-4 h-4 text-red-500 group-hover:scale-110 transition-transform" />
            <span>VIDEOS</span>
          </Link>

          {/* Button 3: GO BACK */}
          <button 
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                if (window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = '/';
                }
              }
            }}
            className="group inline-flex items-center justify-center gap-2.5 bg-zinc-900/90 border border-white/10 text-white font-bold text-xs sm:text-sm tracking-widest uppercase px-6 py-4 rounded-2xl hover:border-red-500 hover:text-red-500 transition-all duration-300 backdrop-blur-md hover:scale-105 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-red-500 group-hover:-translate-x-1 transition-transform" />
            <span>GO BACK</span>
          </button>

        </div>

      </div>

    </div>
  );
}
