'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Bell, Moon, Sun, ShieldCheck, User, LogOut, ExternalLink, RefreshCw
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';
import { useRouter } from 'next/navigation';

interface AdminHeaderProps {
  title?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title = 'Dashboard Overview' }) => {
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20 shrink-0">
      
      {/* Active Page Title & Breadcrumb */}
      <div className="flex items-center space-x-3">
        <h1 className="text-base font-black font-serif text-slate-900 uppercase tracking-wide">
          {title}
        </h1>
        <span className="text-slate-300 font-bold">•</span>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          Tue, Sep 22, 2026 {timeStr && `| ${timeStr}`}
        </span>
      </div>

      {/* Action Tools */}
      <div className="flex items-center space-x-3 sm:space-x-4">
        
        {/* View Public Website Link Button */}
        <button
          onClick={() => window.open('/', '_blank')}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
          title="Open Public News Site"
        >
          <ExternalLink className="w-3.5 h-3.5 text-red-600" />
          <span>Live Site</span>
        </button>

        {/* Notifications Bell Button */}
        <button
          onClick={() => alert('Notifications: Express server connected, E-Paper Page 1 published.')}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 relative transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-600"></span>
        </button>

        <div className="h-6 w-px bg-slate-200 hidden sm:block"></div>

        {/* Admin Profile & Logout */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-100 border border-slate-200 px-3 py-1 rounded-xl text-xs">
            <User className="w-3.5 h-3.5 text-red-600" />
            <span className="font-bold text-slate-800 max-w-[120px] truncate">
              {user?.name || 'Super Admin'}
            </span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-xl bg-red-50 hover:bg-red-600 text-red-600 hover:text-white border border-red-200 transition-colors"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

      </div>

    </header>
  );
};
