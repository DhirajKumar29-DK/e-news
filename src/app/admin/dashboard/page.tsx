'use client';

import React from 'react';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  FileText, Newspaper, TrendingUp, Server, Eye, Sparkles,
  CheckCircle, Zap
} from 'lucide-react';

function FullCleanDashboardInner() {
  const { user, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-800 font-sans">
        <div className="flex items-center space-x-3 text-sm font-semibold">
          <div className="w-5 h-5 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Production Admin Portal...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex font-sans select-none">
      
      {/* 1. LEFT COLLAPSIBLE SIDEBAR */}
      <AdminSidebar />

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <AdminHeader title="Dashboard Overview" />

        {/* Dashboard Main Workspace */}
        <div className="p-6 sm:p-8 space-y-8 flex-1">
          
          {/* WELCOME HERO BANNER */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            
            <div className="space-y-2 relative z-10">
              <div className="inline-flex items-center space-x-2 bg-red-50 border border-red-200 px-3 py-1 rounded-full text-xs font-bold text-red-600">
                <Sparkles className="w-3.5 h-3.5 text-red-600" />
                <span>E-News Production Suite</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black font-serif text-slate-900 tracking-tight">
                Welcome Back, {user?.name || 'Super Admin'}! 👏
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-xl font-medium">
                Manage overall news portal operations, view real-time reader analytics, and monitor Express backend server health.
              </p>
            </div>


          </div>

          {/* 4 KPI METRIC STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            {/* Stat 1 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Published Articles</span>
                <div className="p-2.5 rounded-xl bg-red-50 text-red-600 border border-red-100">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-serif text-slate-900">1,420</div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+12.4% vs last week</span>
                </div>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Today E-Paper Edition</span>
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Newspaper className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-serif text-slate-900">Patna (16 Pgs)</div>
                <div className="text-[11px] font-bold text-amber-600 flex items-center space-x-1 mt-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>3 Slots Published</span>
                </div>
              </div>
            </div>

            {/* Stat 3 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Live Daily Readers</span>
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Eye className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-serif text-slate-900">128.4K</div>
                <div className="text-[11px] font-bold text-emerald-600 flex items-center space-x-1 mt-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+18.2% peak traffic</span>
                </div>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-sm hover:border-slate-300 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Express Server Health</span>
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Server className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-black font-serif text-emerald-600">99.9%</div>
                <div className="text-[11px] font-bold text-slate-500 flex items-center space-x-1 mt-1">
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span>24ms API Latency (Port 5000)</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>


    </div>
  );
}

export default function FullAdminDashboard() {
  return (
    <AdminAuthProvider>
      <FullCleanDashboardInner />
    </AdminAuthProvider>
  );
}
