'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Newspaper, LogOut, ChevronRight, FileText
} from 'lucide-react';
import { useAdminAuth } from '@/context/AdminAuthContext';

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAdminAuth();

  const navItems = [
    { label: 'Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Articles CMS', href: '/admin/articles', icon: FileText, badge: 'New' },
    { label: 'E-Paper Studio', href: '/admin/epaper', icon: Newspaper, badge: 'Live' },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30">
      
      {/* Brand Logo Header */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center space-x-3 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center font-black text-white text-lg font-serif shadow-lg shadow-red-600/30">
          A
        </div>
        <div>
          <h1 className="text-sm font-black font-serif uppercase tracking-wider text-white flex items-center space-x-1.5">
            <span>ASTR CONTROL</span>
            <span className="bg-red-600/30 text-red-400 text-[9px] font-mono px-1.5 py-0.2 rounded border border-red-500/30 font-bold">PRO</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Newsroom Admin Portal</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-3 space-y-1.5 overflow-y-auto no-scrollbar">
        <div className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-500 mb-2">
          Core Modules
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-red-400'} transition-colors`} />
                <span>{item.label}</span>
              </div>

              {item.badge ? (
                <span className="bg-red-500/20 text-red-400 border border-red-500/30 text-[9px] font-mono px-2 py-0.5 rounded-full font-black uppercase animate-pulse">
                  {item.badge}
                </span>
              ) : (
                <ChevronRight className={`w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100 text-white' : 'text-slate-500'}`} />
              )}
            </Link>
          );
        })}
      </div>


      {/* User Footer & Logout */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between shrink-0 bg-slate-950/40">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-800 border border-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{user?.name || 'Super Admin'}</h4>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'admin@news.com'}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-600/10 border border-transparent transition-all cursor-pointer"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

    </aside>
  );
};
