'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { reporterAuthService } from '@/services/reporterAuthService';

export default function ReporterForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setDevToken(null);

    if (!email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await reporterAuthService.forgotPassword(email.trim());
      setSuccessMsg(res.message);
      if (res.data?.resetToken) {
        setDevToken(res.data.resetToken);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/reporter/login" className="flex items-center space-x-2 text-slate-800 hover:text-red-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Login</span>
          </Link>
          <Link href="/" className="flex items-center" title="Back to Homepage">
            <img
              src="/vartiq-logo.png"
              alt="Vartiq"
              className="h-7 w-auto object-contain select-none"
            />
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <KeyRound className="w-6 h-6 stroke-[2.2]" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
              Reset Reporter Password
            </h1>
            <p className="text-xs text-slate-500 font-medium">
              Enter your registered email address and we will issue password reset instructions.
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">Reset Instructions Issued</span>
                  <p className="text-[11px] text-emerald-700 leading-relaxed">
                    {successMsg}
                  </p>
                </div>
              </div>

              {process.env.NODE_ENV !== 'production' && devToken && (
                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold block text-[11px] uppercase tracking-wider text-amber-800">
                      Local Testing Direct Link
                    </span>
                    <span className="text-[10px] text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full font-semibold">
                      Dev Only
                    </span>
                  </div>
                  <p className="text-[11px] text-amber-700 leading-relaxed">
                    Live production server par ye box automatically hide ho jata hai aur reset link seedha reporter ke Gmail inbox me send hota hai.
                  </p>
                  <Link
                    href={`/reporter/reset-password?token=${devToken}`}
                    className="inline-block px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shadow-xs transition-colors"
                  >
                    Click to Reset Password Now →
                  </Link>
                </div>
              )}

              <Link
                href="/reporter/login"
                className="block w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition-colors"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
                  Registered Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. rahul.reporter@gmail.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Requesting Reset...' : 'Request Password Reset'}
              </button>
            </form>
          )}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>© 2026 Vartiq Newsroom. Security &amp; Credentials Desk.</p>
      </footer>
    </div>
  );
}

