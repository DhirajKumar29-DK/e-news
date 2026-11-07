'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock, ArrowLeft, CheckCircle2, AlertCircle, KeyRound, Eye, EyeOff,
  Sparkles, ShieldCheck
} from 'lucide-react';
import { reporterAuthService } from '@/services/reporterAuthService';
import { PasswordStrengthIndicator, evaluatePassword } from '@/components/common/PasswordStrengthIndicator';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const pEval = evaluatePassword(newPassword);
    if (!pEval.isValid) {
      setErrorMsg('Password must include at least 6 characters, one letter, one number, and one special symbol (!@#$%).');
      return;
    }

    if (!confirmPassword) {
      setErrorMsg('Please confirm your new password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your confirm password.');
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
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
          <KeyRound className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
          Create New Password
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Choose a secure, strong password for your Vartiq newsroom reporter account.
        </p>
      </div>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg ? (
        <div className="space-y-4 text-center animate-fadeIn">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-bold">{successMsg}</span>
          </div>

          <Link
            href="/reporter/login"
            className="block w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 text-center transition-all cursor-pointer"
          >
            Sign In with New Password →
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              New Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showNewPassword ? 'text' : 'password'}
                required
                placeholder="Enter new password"
                value={newPassword}
                onChange={e => {
                  setNewPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 transition-colors cursor-pointer"
                tabIndex={-1}
                title={showNewPassword ? 'Hide password' : 'Show password'}
              >
                {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-600">
              Confirm New Password *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => {
                  setConfirmPassword(e.target.value);
                  if (errorMsg) setErrorMsg(null);
                }}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 transition-colors cursor-pointer"
                tabIndex={-1}
                title={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Instagram-style Password Strength Indicator & Real-time Checklist */}
          <PasswordStrengthIndicator
            password={newPassword}
            confirmPassword={confirmPassword}
            showMatch={true}
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50 active:scale-98"
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Left Clean Back to Login Link */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 shrink-0">
        <Link
          href="/reporter/login"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Sign In</span>
        </Link>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          
          {/* 1. LEFT COLUMN: Luxury Animated Newsroom Showcase Card */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-7 xl:p-8 text-white shadow-2xl border border-slate-800/80 min-h-[580px] flex flex-col justify-between">
              
              {/* Glowing Background Radial Effects */}
              <div className="absolute -top-24 -right-24 w-80 h-80 bg-red-600/25 rounded-full blur-3xl pointer-events-none animate-pulse-soft" />
              <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-rose-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-soft" style={{ animationDelay: '2s' }} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Grid Background Pattern */}
              <div 
                className="absolute inset-0 opacity-[0.07] pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
                  backgroundSize: '24px 24px'
                }}
              />

              {/* Top Banner Tag */}
              <div className="relative z-10 flex items-center justify-between">
                <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-red-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 -ml-2.5" />
                  <span>Vartiq Reporter Desk</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-300 bg-slate-900/60 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Security &amp; Credentials</span>
                </div>
              </div>

              {/* Centerpiece: Clean Editorial Photography Scene */}
              <div className="relative z-10 my-3 sm:my-4 flex items-center justify-center">
                <div className="relative w-full max-w-sm aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 shadow-2xl group bg-slate-900">
                  <img
                    src="/images/editorial-newspaper.jpg"
                    alt="Vartiq Editorial Newspaper & Modern Journalism Desk"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10 pointer-events-none" />
                </div>

                {/* Floating Card 1: Top Left */}
                <div className="absolute -top-3 -left-3 xl:-left-6 z-20 animate-float-slow">
                  <div className="bg-white/95 text-slate-900 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-2xl max-w-[215px] space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        <span>Verified Token</span>
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold">SECURE</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      Authorized password update session
                    </p>
                    <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>End-to-End Encryption</span>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2: Bottom Right */}
                <div className="absolute -bottom-3 -right-3 xl:-right-6 z-20 animate-float-delayed">
                  <div className="bg-white/95 text-slate-900 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-2xl max-w-[215px] space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-red-700 font-black text-[10px] uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5 text-red-600" />
                      <span>Reporter Vault</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-snug font-semibold">
                      Your identity and published archives remain protected.
                    </p>
                    <div className="text-[9.5px] text-slate-500 font-bold flex items-center space-x-1">
                      <span>Live Auth Synchronized</span>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 3: Top Right */}
                <div className="absolute top-2 -right-2 z-20 animate-float-reverse">
                  <div className="bg-slate-900/95 text-white backdrop-blur-md border border-slate-700/80 rounded-full px-3 py-1 shadow-xl flex items-center space-x-1.5 text-[10.5px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Password Gate Active</span>
                  </div>
                </div>
              </div>

              {/* Bottom Content & Metrics */}
              <div className="relative z-10 space-y-3.5 pt-3 border-t border-white/10 pb-2">
                <div className="space-y-1">
                  <h3 className="text-lg xl:text-xl font-black font-serif text-white tracking-tight">
                    Secure Newsroom Desk Access.
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Set a strong, new password to access your accredited author profile, stories, and editorial publishing queue.
                  </p>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3 pt-1 pb-1">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                    <p className="text-base xl:text-lg font-black text-emerald-400">Encrypted</p>
                    <p className="text-[10px] text-slate-400 font-medium">Bcrypt Hash</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                    <p className="text-base xl:text-lg font-black text-red-400">Direct</p>
                    <p className="text-[10px] text-slate-400 font-medium">Sign In</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                    <p className="text-base xl:text-lg font-black text-amber-400">100%</p>
                    <p className="text-[10px] text-slate-400 font-medium">Data Safe</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 2. RIGHT COLUMN: Password Reset Form Card */}
          <div className="w-full lg:col-span-6 xl:col-span-5 flex flex-col justify-center max-w-md mx-auto">
            <Suspense fallback={<div className="p-12 text-center text-xs font-bold text-slate-400">Loading reset session...</div>}>
              <ResetPasswordForm />
            </Suspense>
          </div>

        </div>
      </main>
    </div>
  );
}
