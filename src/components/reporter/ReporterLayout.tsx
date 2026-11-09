'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText, Plus, User, LogOut, CheckCircle2,
  LayoutDashboard, ChevronRight, ShieldCheck, ArrowLeft, Video, PlaySquare
} from 'lucide-react';
import { ReporterAuthProvider, useReporterAuth } from '@/context/ReporterAuthContext';

function ReporterShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { reporter, logout, isLoading } = useReporterAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading Reporter Desk...</p>
        </div>
      </div>
    );
  }

  const navLinks = [
    { href: '/reporter/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/reporter/articles/create', label: 'Write Story', icon: Plus },
    { href: '/reporter/videos/create', label: 'Post Video', icon: Video },
    { href: '/reporter/articles', label: 'My Articles', icon: FileText },
    { href: '/reporter/videos', label: 'My Videos', icon: PlaySquare },
    { href: '/reporter/profile', label: 'Profile & Settings', icon: User }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      
      {/* Mobile Reporter Bar (shown only on mobile/tablet screens < lg) */}
      {/* WhatsApp / Instagram style sticky header: Starts at top-0, spans full width, opaque background so scrolled content NEVER bleeds through or mashes up with phone status bar! */}
      <div
        style={{
          paddingTop: 'max(env(safe-area-inset-top, 0px), 12px)'
        }}
        className="lg:hidden sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 py-2.5 shadow-xs"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
              {reporter?.name?.charAt(0) || 'R'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-slate-900 truncate">
                  {reporter?.name || 'Reporter'}
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-700 text-[9px] font-black uppercase tracking-wider shrink-0">
                  <ShieldCheck className="w-2.5 h-2.5 text-red-600" />
                  <span>Reporter Desk</span>
                </span>
              </div>
              <div className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified Reporter</span>
              </div>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Action Tabs with horizontal scrolling */}
        <div className="flex items-center space-x-1.5 overflow-x-auto no-scrollbar pt-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 ${
                  isActive
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Reporter Workspace Layout */}
      <div className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-28 sm:py-6">
        
        {/* Desktop 2-Column Grid (Left Sidebar + Right Main Content) */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          
          {/* LEFT SIDEBAR (The Organized Reporter Navigation Panel) */}
          <aside className="hidden lg:flex flex-col w-72 shrink-0 space-y-4 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto no-scrollbar">
            
            {/* 1. Back to Home Navigation Card */}
            <Link
              href="/"
              className="bg-white hover:bg-slate-50/90 rounded-2xl border border-slate-200 p-3.5 shadow-xs flex items-center space-x-3 text-xs font-bold text-slate-700 hover:text-red-600 transition-all group cursor-pointer sticky top-0 z-10"
              title="Back to Home Page"
            >
              <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center group-hover:bg-red-50 group-hover:border-red-200 transition-colors shrink-0">
                <ArrowLeft className="w-4 h-4 text-slate-600 group-hover:text-red-600 transition-colors" />
              </div>
              <span className="truncate">Back to Home</span>
            </Link>

            {/* 2. Reporter Profile & Accreditation Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3.5">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-red-600/20 shrink-0">
                  {reporter?.name?.charAt(0) || 'R'}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-black text-slate-900 truncate">
                    {reporter?.name || 'Reporter'}
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified Reporter</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">
                    {reporter?.city ? `${reporter.city}, ${reporter.district || 'India'}` : 'Vartiq Field Bureau'}
                  </div>
                </div>
              </div>

              {/* Desk Badge */}
              <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[10px] font-black uppercase tracking-wider w-full justify-center">
                <ShieldCheck className="w-3.5 h-3.5 text-red-600" />
                <span>Accredited Reporter Desk</span>
              </div>
            </div>

            {/* 3. Quick Actions: Write Story & Post Video */}
            <div className="space-y-2">
              <Link
                href="/reporter/articles/create"
                className="flex items-center justify-center space-x-2 w-full py-3 px-4 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer group"
              >
                <Plus className="w-4 h-4 stroke-[3] group-hover:rotate-90 transition-transform" />
                <span>Write New Story</span>
              </Link>
              <Link
                href="/reporter/videos/create"
                className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-xs transition-all cursor-pointer group border border-slate-700"
              >
                <Video className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform" />
                <span>Post Video Report</span>
              </Link>
            </div>

            {/* 4. Main Navigation Links */}
            <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs space-y-1">
              <div className="px-3 pt-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                Desk Navigation
              </div>
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? 'bg-red-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isActive ? 'text-white/80' : 'text-slate-300'}`} />
                  </Link>
                );
              })}
            </div>

            {/* 5. Sign Out Button */}
            <button
              onClick={logout}
              className="flex items-center justify-between w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              <div className="flex items-center space-x-2">
                <LogOut className="w-4 h-4" />
                <span>Sign Out of Desk</span>
              </div>
              <span className="text-[10px] text-slate-400 font-normal">Active Session</span>
            </button>

          </aside>

          {/* RIGHT MAIN CONTENT AREA */}
          <main className="flex-1 min-w-0 w-full space-y-6">
            {children}
          </main>

        </div>

      </div>



    </div>
  );
}

export function ReporterLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReporterAuthProvider>
      <ReporterShell>{children}</ReporterShell>
    </ReporterAuthProvider>
  );
}
