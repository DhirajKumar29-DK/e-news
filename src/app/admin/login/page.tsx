'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/context/AdminAuthContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const { login, isAuthenticated } = useAdminAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please enter both email/username and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email, password });
      router.push('/admin/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials or Express backend connection error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4 relative font-sans select-none overflow-hidden">
      
      {/* Background Ambient Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-100/40 blur-[140px] rounded-full pointer-events-none"></div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xl space-y-8 relative z-10 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Logo & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white shadow-lg shadow-red-600/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 uppercase tracking-tight">
              ADMIN PORTAL
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Management Portal & Backend Control
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start space-x-3 text-xs text-red-700 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email / Username Field */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
              Email or Username
            </label>
            <div className="relative flex items-center">
              <Mail className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@news.com"
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Password
              </label>
            </div>
            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 focus:border-red-600 focus:bg-white rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Connecting to Express...</span>
              </div>
            ) : (
              <>
                <span>Sign In To Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

        </form>

        {/* Footer info */}
        <div className="pt-2 text-center text-[11px] text-slate-400 font-medium">
          Protected Portal • Authorization Required
        </div>

      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <AdminAuthProvider>
      <AdminLoginForm />
    </AdminAuthProvider>
  );
}
