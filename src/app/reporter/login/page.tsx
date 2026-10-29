'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock, Mail, ArrowLeft, AlertCircle, ShieldAlert,
  Clock, CheckCircle2, Sparkles, UserPlus, User, Phone,
  MapPin, UploadCloud, FileCheck, ArrowRight, X, ShieldCheck, Eye, EyeOff, Flame,
  Send, TrendingUp
} from 'lucide-react';
import { ReporterAuthProvider, useReporterAuth } from '@/context/ReporterAuthContext';
import { reporterAuthService } from '@/services/reporterAuthService';

function ReporterAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' || searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  const { login, register, isAuthenticated } = useReporterAuth();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup Form State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCity, setSignupCity] = useState('');
  const [signupDistrict, setSignupDistrict] = useState('');
  const [idProofType, setIdProofType] = useState('AADHAAR');
  const [idProofNumber, setIdProofNumber] = useState('');
  const [idProofUrl, setIdProofUrl] = useState('');
  const [idProofFileName, setIdProofFileName] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string; code?: string } | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorInfo(null);
    setFieldErrors({});
  };

  // If already authenticated, redirect straight to article add page!
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/reporter/articles/create');
    }
  }, [isAuthenticated, router]);

  // Handle Document Upload (Aadhaar / Press ID)
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;
    const file = e.target.files[0];

    // File validation
    if (file.size > 25 * 1024 * 1024) {
      setErrorInfo({ message: 'Document size must be less than 25MB.' });
      setFieldErrors(prev => ({ ...prev, idProof: 'Document size must be less than 25MB.' }));
      return;
    }

    try {
      setIsUploadingDoc(true);
      setErrorInfo(null);
      setFieldErrors(prev => ({ ...prev, idProof: '' }));
      const uploadedUrl = await reporterAuthService.uploadIdProof(file);
      setIdProofUrl(uploadedUrl);
      setIdProofFileName(file.name);
    } catch (err: any) {
      setErrorInfo({ message: err.message || 'Failed to upload document. Please try again.' });
      setFieldErrors(prev => ({ ...prev, idProof: err.message || 'Failed to upload document.' }));
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    const errors: { [key: string]: string } = {};

    if (!loginEmail.trim()) {
      errors.loginEmail = 'Please enter your registered email address.';
    }
    if (!loginPassword) {
      errors.loginPassword = 'Password is required.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorInfo({ message: Object.values(errors)[0] });
      return;
    }

    try {
      setIsSubmitting(true);
      await login({ email: loginEmail.trim(), password: loginPassword });
      router.push('/reporter/articles/create');
    } catch (err: any) {
      setErrorInfo({
        message: err.message || 'Login failed. Please check your credentials.',
        code: err.code
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Signup Submit with Complete Validation
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    const errors: { [key: string]: string } = {};

    const trimmedName = signupName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters).';
    }

    const trimmedEmail = signupEmail.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. name@domain.com).';
    }

    if (!signupPassword) {
      errors.password = 'Password is required.';
    } else if (signupPassword.length < 6) {
      errors.password = 'Password must be at least 6 characters long.';
    }

    const cleanPhone = signupPhone.trim().replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errors.phone = 'Mobile phone number is required.';
    } else if (cleanPhone.length < 10 || !/^\+?[0-9]{10,14}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit mobile phone number.';
    }

    if (!idProofUrl) {
      errors.idProof = 'Aadhaar Card or Press ID document upload is mandatory.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorMessage = Object.values(errors)[0];
      setErrorInfo({ message: firstErrorMessage });
      return;
    }

    try {
      setIsSubmitting(true);
      await reporterAuthService.register({
        name: trimmedName,
        email: trimmedEmail,
        password: signupPassword,
        phone: cleanPhone,
        city: signupCity.trim() || undefined,
        district: signupDistrict.trim() || undefined,
        idProofUrl,
        idProofType,
        idProofNumber: idProofNumber.trim() || undefined
      });

      // Show Pending Approval Confirmation Card!
      setIsSignupSuccess(true);
    } catch (err: any) {
      setErrorInfo({
        message: err.message || 'Registration failed. Please try again.',
        code: err.code
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col justify-between">
      {/* Header Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-slate-800 hover:text-red-600 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-xs font-bold uppercase tracking-wider">Back to Website</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center" title="Back to Homepage">
              <img
                src="/vartiq-logo.png"
                alt="Vartiq"
                className="h-7 sm:h-8 w-auto object-contain select-none"
              />
            </Link>
            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              Reporter Desk
            </span>
          </div>
          <button
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            {mode === 'login' ? (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Create Account</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Split Layout: Left Animated News Showcase + Right Form */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          
          {/* 1. LEFT COLUMN: Animated Newsroom Showcase (Dynamic: Login vs Signup) */}
          <div className="hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-center">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 p-8 xl:p-10 text-white shadow-2xl border border-slate-800/80 min-h-[620px] flex flex-col justify-between">
              
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
                  <span className={`w-2 h-2 rounded-full ${mode === 'login' ? 'bg-emerald-400' : 'bg-red-500'} animate-ping`} />
                  <span className={`w-1.5 h-1.5 rounded-full ${mode === 'login' ? 'bg-emerald-400' : 'bg-red-500'} -ml-2.5`} />
                  <span>{mode === 'login' ? 'Vartiq Reporter Desk' : 'Accredited News Network'}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-300 bg-slate-900/60 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{mode === 'login' ? 'Secure Newsroom Login' : 'Reporter Accreditation'}</span>
                </div>
              </div>

              {/* Centerpiece: Clean, Minimalist Editorial Newspaper & Article Scene */}
              <div className="relative z-10 my-6 flex items-center justify-center">
                {/* Visual Image Container - Clean Editorial Photography */}
                <div className="relative w-full max-w-md aspect-[4/3] rounded-2xl overflow-hidden border border-white/15 shadow-2xl group bg-slate-900">
                  <img
                    src="/images/editorial-newspaper.jpg"
                    alt="Vartiq Editorial Newspaper & Modern Journalism Desk"
                    className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                  />
                  {/* Soft Vignette / Editorial Lighting Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-black/10 pointer-events-none" />
                </div>

                {/* Floating Card 1: Top Left - Crisp Clean White Paper Card */}
                <div className="absolute -top-3 -left-3 xl:-left-6 z-20 animate-float-slow">
                  {mode === 'login' ? (
                    <div className="bg-white/95 text-slate-900 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-2xl max-w-[215px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 flex items-center space-x-1">
                          <Send className="w-3 h-3 text-emerald-600" />
                          <span>Active Desk Queue</span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold">LIVE</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        Submit stories &amp; track review in real-time
                      </p>
                      <div className="flex items-center space-x-1 text-[10px] text-emerald-700 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                        <span>Direct Editor Access</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/95 text-slate-900 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-2xl max-w-[215px] space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-wider text-red-700 flex items-center space-x-1">
                          <Flame className="w-3 h-3 text-red-600" />
                          <span>Editorial Bureau</span>
                        </span>
                        <span className="text-[9px] text-slate-500 font-bold">PRINT &amp; WEB</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900 leading-snug">
                        Ground reports published across web &amp; broadsheet
                      </p>
                      <div className="flex items-center space-x-1 text-[10px] text-red-700 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-red-600 shrink-0" />
                        <span>Accredited Byline</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Card 2: Bottom Right - Crisp Clean White Paper Card */}
                <div className="absolute -bottom-3 -right-3 xl:-right-6 z-20 animate-float-delayed">
                  {mode === 'login' ? (
                    <div className="bg-white/95 text-slate-900 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-2xl max-w-[215px] space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-red-700 font-black text-[10px] uppercase tracking-wider">
                        <TrendingUp className="w-3.5 h-3.5 text-red-600" />
                        <span>Reader Reach</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug font-semibold">
                        50,000+ daily readers engaging with your published ground reports.
                      </p>
                      <div className="text-[9.5px] text-slate-500 font-bold flex items-center space-x-1">
                        <span>Verified Author Credit</span>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white/95 text-slate-900 backdrop-blur-md border border-slate-200/90 rounded-2xl p-3.5 shadow-2xl max-w-[215px] space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-amber-700 font-black text-[10px] uppercase tracking-wider">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        <span>Verified Press Pass</span>
                      </div>
                      <p className="text-[11px] text-slate-700 leading-snug font-semibold">
                        Aadhaar &amp; Press ID verified field journalism credit.
                      </p>
                      <div className="text-[9.5px] text-amber-800 font-bold flex items-center space-x-1">
                        <span>Official Media Badge</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Badge 3: Top Right */}
                <div className="absolute top-2 -right-2 z-20 animate-float-reverse">
                  <div className="bg-slate-900/95 text-white backdrop-blur-md border border-slate-700/80 rounded-full px-3 py-1 shadow-xl flex items-center space-x-1.5 text-[10.5px] font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{mode === 'login' ? 'Avg. Edit Review: 12 mins' : 'Accredited Journalist ID'}</span>
                  </div>
                </div>

              </div>

              {/* Bottom Content & Metrics */}
              <div className="relative z-10 space-y-4 pt-2 border-t border-white/10">
                <div className="space-y-1">
                  <h3 className="text-lg xl:text-xl font-black font-serif text-white tracking-tight">
                    {mode === 'login'
                      ? 'The Editor’s Desk.'
                      : 'The Independent Press.'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {mode === 'login'
                      ? 'Sign in to access your newsroom desk, continue pending drafts, and publish verified ground reports.'
                      : 'Register as an accredited reporter. Submit your credentials to join 2,500+ verified journalists breaking impactful stories.'}
                  </p>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  {mode === 'login' ? (
                    <>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                        <p className="text-base xl:text-lg font-black text-emerald-400">12 Mins</p>
                        <p className="text-[10px] text-slate-400 font-medium">Review Time</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                        <p className="text-base xl:text-lg font-black text-red-400">Live Sync</p>
                        <p className="text-[10px] text-slate-400 font-medium">Web &amp; App</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                        <p className="text-base xl:text-lg font-black text-amber-400">100%</p>
                        <p className="text-[10px] text-slate-400 font-medium">Byline Credit</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                        <p className="text-base xl:text-lg font-black text-red-400">2,500+</p>
                        <p className="text-[10px] text-slate-400 font-medium">Reporters</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                        <p className="text-base xl:text-lg font-black text-emerald-400">100%</p>
                        <p className="text-[10px] text-slate-400 font-medium">Byline Credit</p>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 text-center backdrop-blur-sm">
                        <p className="text-base xl:text-lg font-black text-amber-400">Verified</p>
                        <p className="text-[10px] text-slate-400 font-medium">Press Pass</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* 2. RIGHT COLUMN: Login / Register Form Card */}
          <div className="lg:col-span-6 xl:col-span-5 w-full max-w-md mx-auto lg:max-w-none">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6">
          
          {isSignupSuccess ? (
            /* REGISTRATION SUCCESSFUL - PENDING APPROVAL SCREEN */
            <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 border border-amber-200 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <Clock className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Pending Admin Verification</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900 pt-1">
                  Application Submitted!
                </h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Aapka reporter account create ho gaya hai aur verification ke liye <strong>Admin Desk</strong> ko bhej diya gaya hai.
                </p>
              </div>

              {/* Summary Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Reporter Name:</span>
                  <span className="font-bold text-slate-900">{signupName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Registered Email:</span>
                  <span className="font-bold text-slate-900">{signupEmail}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>ID Proof:</span>
                  <span className="font-bold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Uploaded &amp; Submitted</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Account Status:</span>
                  <span className="font-black text-amber-600 uppercase text-[11px]">Awaiting Approval</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Admin aapka Aadhaar / Press ID verify karke account approve karega, uske baad aap Sign In karke news stories submit kar payenge.
              </p>

              <button
                type="button"
                onClick={() => {
                  setIsSignupSuccess(false);
                  setMode('login');
                  setLoginEmail(signupEmail);
                  setLoginPassword('');
                  setErrorInfo(null);
                }}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2"
              >
                <span>Go to Sign In Screen</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <>
              {/* Heading */}
              <div className="text-center space-y-1.5">
                <div className="w-12 h-12 bg-red-50 text-red-600 border border-red-200 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
                  {mode === 'login' ? (
                    <Lock className="w-6 h-6 stroke-[2.2]" />
                  ) : (
                    <Sparkles className="w-6 h-6 stroke-[2.2]" />
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black font-serif text-slate-900">
                  {mode === 'login' ? 'Reporter & Contributor Sign In' : 'Create Reporter Account'}
                </h1>
                <p className="text-xs text-slate-500 font-medium">
                  {mode === 'login'
                    ? 'Sign in to your newsroom desk to write news stories and submit reports.'
                    : 'Register as a field reporter and submit your credentials for verification.'}
                </p>
              </div>

              {/* Error / Status Notice */}
              {errorInfo && (
                <div className={`p-4 rounded-2xl border text-xs space-y-1 animate-in fade-in ${
                  errorInfo.code === 'ACCOUNT_PENDING'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}>
                  <div className="flex items-start space-x-2">
                    {errorInfo.code === 'ACCOUNT_PENDING' ? (
                      <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold">
                        {errorInfo.code === 'ACCOUNT_PENDING' ? 'Account Pending Approval: ' : 'Error: '}
                      </span>
                      <span>{errorInfo.message}</span>
                    </div>
                  </div>
                </div>
              )}

          {/* 1. LOGIN FORM */}
          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 pt-1">
              {/* Email with Floating Label */}
              <div>
                <div className="relative">
                  <input
                    type="email"
                    id="loginEmail"
                    placeholder=" "
                    value={loginEmail}
                    onChange={e => {
                      setLoginEmail(e.target.value);
                      if (fieldErrors.loginEmail) setFieldErrors(prev => ({ ...prev, loginEmail: '' }));
                    }}
                    className={`block w-full px-3.5 py-3 text-xs text-slate-900 bg-white rounded-xl border appearance-none focus:outline-none focus:ring-1 peer font-medium transition-all ${
                      fieldErrors.loginEmail
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:border-red-600 focus:ring-red-600'
                    }`}
                  />
                  <label
                    htmlFor="loginEmail"
                    className="absolute text-xs text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3 pointer-events-none"
                  >
                    Registered Email Address *
                  </label>
                </div>
                {fieldErrors.loginEmail && (
                  <p className="text-[10.5px] text-rose-600 font-semibold mt-1 px-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.loginEmail}</span>
                  </p>
                )}
              </div>

              {/* Password with Floating Label & Forgot Link */}
              <div>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="loginPassword"
                    placeholder=" "
                    value={loginPassword}
                    onChange={e => {
                      setLoginPassword(e.target.value);
                      if (fieldErrors.loginPassword) setFieldErrors(prev => ({ ...prev, loginPassword: '' }));
                    }}
                    className={`block w-full px-3.5 pr-24 py-3 text-xs text-slate-900 bg-white rounded-xl border appearance-none focus:outline-none focus:ring-1 peer font-medium transition-all ${
                      fieldErrors.loginPassword
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:border-red-600 focus:ring-red-600'
                    }`}
                  />
                  <label
                    htmlFor="loginPassword"
                    className="absolute text-xs text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3 pointer-events-none"
                  >
                    Password *
                  </label>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-2 z-10">
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1"
                      tabIndex={-1}
                      title={showLoginPassword ? 'Hide password' : 'Show password'}
                    >
                      {showLoginPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-slate-200">|</span>
                    <Link
                      href="/reporter/forgot-password"
                      className="text-[11px] font-bold text-red-600 hover:text-red-700 hover:underline"
                    >
                      Forgot?
                    </Link>
                  </div>
                </div>
                {fieldErrors.loginPassword && (
                  <p className="text-[10.5px] text-rose-600 font-semibold mt-1 px-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.loginPassword}</span>
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In &amp; Add Article</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Bottom Switcher: Don't have an account? */}
              <div className="border-t border-slate-100 pt-4 text-center">
                <p className="text-xs text-slate-500">
                  New reporter?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signup')}
                    className="font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Create Account
                  </button>
                </p>
              </div>
            </form>
          ) : (
            /* 2. SIGNUP FORM */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5 pt-1">
              
              {/* Full Name with Floating Label */}
              <div>
                <div className="relative">
                  <input
                    type="text"
                    id="signupName"
                    placeholder=" "
                    value={signupName}
                    onChange={e => {
                      setSignupName(e.target.value);
                      if (fieldErrors.name) setFieldErrors(prev => ({ ...prev, name: '' }));
                    }}
                    className={`block w-full px-3.5 py-3 text-xs text-slate-900 bg-white rounded-xl border appearance-none focus:outline-none focus:ring-1 peer font-medium transition-all ${
                      fieldErrors.name
                        ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                        : 'border-slate-300 focus:border-red-600 focus:ring-red-600'
                    }`}
                  />
                  <label
                    htmlFor="signupName"
                    className="absolute text-xs text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3 pointer-events-none"
                  >
                    Full Name *
                  </label>
                </div>
                {fieldErrors.name && (
                  <p className="text-[10.5px] text-rose-600 font-semibold mt-1 px-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.name}</span>
                  </p>
                )}
              </div>

              {/* Email & Password with Floating Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <input
                      type="email"
                      id="signupEmail"
                      placeholder=" "
                      value={signupEmail}
                      onChange={e => {
                        setSignupEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className={`block w-full px-3.5 py-3 text-xs text-slate-900 bg-white rounded-xl border appearance-none focus:outline-none focus:ring-1 peer font-medium transition-all ${
                        fieldErrors.email
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-300 focus:border-red-600 focus:ring-red-600'
                      }`}
                    />
                    <label
                      htmlFor="signupEmail"
                      className="absolute text-xs text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3 pointer-events-none truncate max-w-[85%]"
                    >
                      Email Address *
                    </label>
                  </div>
                  {fieldErrors.email && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 px-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.email}</span>
                    </p>
                  )}
                </div>

                <div>
                  <div className="relative">
                    <input
                      type={showSignupPassword ? 'text' : 'password'}
                      id="signupPassword"
                      placeholder=" "
                      value={signupPassword}
                      onChange={e => {
                        setSignupPassword(e.target.value);
                        if (fieldErrors.password) setFieldErrors(prev => ({ ...prev, password: '' }));
                      }}
                      className={`block w-full px-3.5 pr-10 py-3 text-xs text-slate-900 bg-white rounded-xl border appearance-none focus:outline-none focus:ring-1 peer font-medium transition-all ${
                        fieldErrors.password
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-300 focus:border-red-600 focus:ring-red-600'
                      }`}
                    />
                    <label
                      htmlFor="signupPassword"
                      className="absolute text-xs text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3 pointer-events-none truncate max-w-[85%]"
                    >
                      Password (Min 6) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowSignupPassword(!showSignupPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 z-10"
                      tabIndex={-1}
                      title={showSignupPassword ? 'Hide password' : 'Show password'}
                    >
                      {showSignupPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 px-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.password}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Mobile Phone & City with Floating Labels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="relative">
                    <input
                      type="tel"
                      id="signupPhone"
                      placeholder=" "
                      value={signupPhone}
                      onChange={e => {
                        setSignupPhone(e.target.value);
                        if (fieldErrors.phone) setFieldErrors(prev => ({ ...prev, phone: '' }));
                      }}
                      className={`block w-full px-3.5 py-3 text-xs text-slate-900 bg-white rounded-xl border appearance-none focus:outline-none focus:ring-1 peer font-medium transition-all ${
                        fieldErrors.phone
                          ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                          : 'border-slate-300 focus:border-red-600 focus:ring-red-600'
                      }`}
                    />
                    <label
                      htmlFor="signupPhone"
                      className="absolute text-xs text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3 pointer-events-none truncate max-w-[85%]"
                    >
                      Mobile Phone *
                    </label>
                  </div>
                  {fieldErrors.phone && (
                    <p className="text-[10.5px] text-rose-600 font-semibold mt-1 px-1 flex items-center space-x-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      <span>{fieldErrors.phone}</span>
                    </p>
                  )}
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="signupCity"
                    placeholder=" "
                    value={signupCity}
                    onChange={e => setSignupCity(e.target.value)}
                    className="block w-full px-3.5 py-3 text-xs text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                  />
                  <label
                    htmlFor="signupCity"
                    className="absolute text-xs text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3 pointer-events-none truncate max-w-[85%]"
                  >
                    City / District
                  </label>
                </div>
              </div>

              {/* Identity Document Upload (Aadhaar / Press ID) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                    Aadhaar / Press ID Proof *
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">JPG, PNG, PDF (Max 25MB)</span>
                </div>

                <div className={`flex items-center space-x-2 p-1 rounded-2xl transition-all ${
                  fieldErrors.idProof ? 'ring-2 ring-rose-400/50 bg-rose-50/30' : ''
                }`}>
                  <input
                    type="file"
                    id="idProofInput"
                    accept="image/*,application/pdf"
                    onChange={handleDocUpload}
                    disabled={isUploadingDoc}
                    className="hidden"
                  />
                  <label
                    htmlFor="idProofInput"
                    className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer shrink-0 transition-colors flex items-center space-x-1.5 shadow-xs"
                  >
                    <UploadCloud className={`w-3.5 h-3.5 ${isUploadingDoc ? 'animate-bounce' : ''}`} />
                    <span>{isUploadingDoc ? 'Uploading...' : 'Choose File'}</span>
                  </label>

                  <div className={`flex-1 px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs truncate min-w-0 ${
                    fieldErrors.idProof ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}>
                    {idProofFileName ? (
                      <span className="text-emerald-700 font-bold flex items-center space-x-1 truncate">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{idProofFileName}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">No file chosen</span>
                    )}
                  </div>

                  {idProofUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setIdProofUrl('');
                        setIdProofFileName('');
                      }}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {fieldErrors.idProof && (
                  <p className="text-[10.5px] text-rose-600 font-semibold px-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.idProof}</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isUploadingDoc}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account &amp; Start Writing</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Bottom Switcher: Already have an account? */}
              <div className="border-t border-slate-100 pt-4 text-center">
                <p className="text-xs text-slate-500">
                  Already registered as a reporter?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                  >
                    Sign In
                  </button>
                </p>
              </div>

            </form>
          )}
          </>
        )}

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-400">
        <p>© 2026 Vartiq Newsroom. Editorial Verification &amp; Contributor Desk.</p>
      </footer>
    </div>
  );
}

export default function ReporterLoginPage() {
  return (
    <ReporterAuthProvider>
      <Suspense fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ReporterAuthForm />
      </Suspense>
    </ReporterAuthProvider>
  );
}
