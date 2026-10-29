'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { reporterAuthService } from '@/services/reporterAuthService';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!token) {
      setErrorMsg('Invalid or missing password reset token.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await reporterAuthService.resetPassword(token, newPassword);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password. Link may be expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
          <KeyRound className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
          Create New Password
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Choose a secure password for your Vartiq reporter account.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg ? (
        <div className="space-y-4 text-center">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>

          <Link
            href="/reporter/login"
            className="block w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 text-center transition-all"
          >
            Sign In with New Password
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              New Password (min 6 chars) *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ReporterResetPasswordPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/reporter/login" className="flex items-center space-x-2 text-slate-800 hover:text-red-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Login</span>
          </Link>
          <span className="text-sm font-black font-serif tracking-tight text-slate-900">VARTIQ</span>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-slate-400">Loading reset session...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>© 2026 Vartiq Newsroom. Security &amp; Credentials Desk.</p>
      </footer>
    </div>
  );
}

