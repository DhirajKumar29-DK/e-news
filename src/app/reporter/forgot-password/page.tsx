'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Mail, ArrowLeft, AlertCircle, KeyRound, MailCheck, ExternalLink,
  Sparkles, ShieldCheck, Lock, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { reporterAuthService } from '@/services/reporterAuthService';

export default function ReporterForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    try {
      setIsSubmitting(true);
      await reporterAuthService.forgotPassword(cleanEmail);
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to request password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-800 font-sans flex flex-col">
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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-4 lg:overflow-hidden flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center lg:h-[calc(100vh-4.5rem)]">
          
          {/* 1. LEFT COLUMN: Luxury Animated Newsroom Showcase Card */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center lg:h-full">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-8 xl:p-10 text-white shadow-2xl border border-slate-800/80 h-full max-h-[620px] flex flex-col justify-between">
              
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
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 -ml-2.5" />
                  <span>Vartiq Reporter Desk</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-300 bg-slate-900/60 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Account Recovery Desk</span>
                </div>
              </div>

              {/* Centerpiece: Clean Editorial Photography Scene */}
              <div className="relative z-10 my-6 flex items-center justify-center">
                <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 shadow-2xl group bg-slate-900">
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
                        <span>Secure Recovery</span>
                      </span>
                      <span className="text-[9px] text-slate-500 font-bold">1-CLICK</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">
                      Encrypted reset link dispatched directly to your Gmail
                    </p>
                    <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>Instant Inbox Delivery</span>
                    </div>
                  </div>
                </div>

                {/* Floating Card 2: Bottom Right */}
                <div className="absolute -bottom-3 -right-3 xl:-right-6 z-20 animate-float-delayed">
                  <div className="bg-white/95 text-slate-900 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-2xl max-w-[215px] space-y-1.5">
                    <div className="flex items-center space-x-1.5 text-red-700 font-black text-[10px] uppercase tracking-wider">
                      <Lock className="w-3.5 h-3.5 text-red-600" />
                      <span>Credential Guard</span>
                    </div>
                    <p className="text-[11px] text-slate-700 leading-snug font-semibold">
                      Your newsroom byline, drafts, and article analytics remain 100% protected.
                    </p>
                    <div className="text-[9.5px] text-slate-500 font-bold flex items-center space-x-1">
                      <span>256-Bit Encrypted Token</span>
                    </div>
                  </div>
                </div>

                {/* Floating Badge 3: Top Right */}
                <div className="absolute top-2 -right-2 z-20 animate-float-reverse">
                  <div className="bg-slate-900/95 text-white backdrop-blur-md border border-slate-700/80 rounded-full px-3 py-1 shadow-xl flex items-center space-x-1.5 text-[10.5px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Active Security Gate</span>
                  </div>
                </div>
              </div>

              {/* Bottom Content & Metrics */}
              <div className="relative z-10 space-y-4 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <h3 className="text-lg xl:text-xl font-black font-serif text-white tracking-tight">
                    Recover Your Newsroom Desk.
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Verify your registered email address to receive immediate password reset instructions and regain full access to your editorial desk.
                  </p>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                    <p className="text-base xl:text-lg font-black text-amber-400">Instant</p>
                    <p className="text-[10px] text-slate-400 font-medium">Link Delivery</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                    <p className="text-base xl:text-lg font-black text-emerald-400">100%</p>
                    <p className="text-[10px] text-slate-400 font-medium">Secure Token</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                    <p className="text-base xl:text-lg font-black text-rose-400">24 / 7</p>
                    <p className="text-[10px] text-slate-400 font-medium">Editorial Desk</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* 2. RIGHT COLUMN: Password Reset Request Card */}
          <div className="w-full lg:col-span-6 xl:col-span-5 flex flex-col justify-center max-w-md mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
              
              {isSuccess ? (
                <div className="space-y-5 text-center animate-fadeIn">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                    <MailCheck className="w-7 h-7 stroke-[2.2]" />
                  </div>

                  <div className="space-y-1.5">
                    <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
                      पासवर्ड रीसेट लिंक भेज दिया गया है!
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                      Password Reset Instructions Dispatched
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 text-left">
                    <p className="leading-relaxed">
                      हमने आपके रजिस्टर्ड ईमेल <strong className="text-slate-900">{email}</strong> पर पासवर्ड रीसेट लिंक भेज दिया है।
                    </p>
                    <p className="text-[11.5px] text-slate-500 leading-relaxed">
                      कृपया अपना Gmail इनबॉक्स (या Spam फोल्डर) चेक करें और ईमेल में दिए गए <strong>"Reset My Password"</strong> बटन पर क्लिक करके तुरंत नया पासवर्ड सेट करें।
                    </p>
                  </div>

                  <div className="space-y-2.5 pt-1">
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 text-center flex items-center justify-center space-x-2 transition-all cursor-pointer"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Open Gmail Inbox (ईमेल चेक करें)</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                    </a>

                    <Link
                      href="/reporter/login"
                      className="block w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs text-center transition-colors"
                    >
                      Return to Sign In Screen
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center space-y-2">
                    <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                      <KeyRound className="w-6 h-6 stroke-[2.2]" />
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
                      Reset Reporter Password
                    </h1>
                    <p className="text-xs text-slate-500 font-medium">
                      Enter your registered email address and we will issue password reset instructions to your inbox.
                    </p>
                  </div>

                  {errorMsg && (
                    <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2 animate-fadeIn">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

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
                          placeholder="e.g. yourname@gmail.com"
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-extrabold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2 active:scale-98"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending Reset Link to Email...</span>
                        </>
                      ) : (
                        <span>Send Reset Link to Email →</span>
                      )}
                    </button>
                  </form>
                </>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
