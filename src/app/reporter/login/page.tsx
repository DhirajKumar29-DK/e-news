'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Lock, Mail, ArrowLeft, AlertCircle, ShieldAlert,
  Clock, CheckCircle2, Sparkles, UserPlus, User, Phone,
  MapPin, UploadCloud, FileCheck, ArrowRight, X, ShieldCheck, Eye, EyeOff, Flame,
  Send, TrendingUp, ChevronDown, ChevronUp, Trash2, Check, FileText, Share2, Store, PhoneCall,
  Home, XCircle, MessageCircle
} from 'lucide-react';
import { ReporterAuthProvider, useReporterAuth } from '@/context/ReporterAuthContext';
import { PasswordStrengthIndicator, evaluatePassword } from '@/components/common/PasswordStrengthIndicator';
import { reporterAuthService } from '@/services/reporterAuthService';

function ReporterAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' || searchParams.get('tab') === 'signup' ? 'signup' : 'login';

  const { login, isAuthenticated } = useReporterAuth();

  // Mode: 'login' | 'signup'
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Login Form State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Signup Form State: Section A (Basic Info)
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCity, setSignupCity] = useState('');
  const [signupDistrict, setSignupDistrict] = useState('');

  // Email OTP Verification State
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');

  // Section B: Reporter Role & Agreements
  const [isReporterAnswer, setIsReporterAnswer] = useState<'yes' | 'no' | null>(null);
  const [showTermsDetails, setShowTermsDetails] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Section C: 4 Documents
  const [documents, setDocuments] = useState({
    pressIdUrl: '',
    aadharFrontUrl: '',
    aadharBackUrl: '',
    panUrl: '',
    reporterProofUrl: '',
  });
  const [uploadingDocField, setUploadingDocField] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{ message: string; code?: string } | null>(null);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showSignupConfirmPassword, setShowSignupConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  const switchMode = (newMode: 'login' | 'signup') => {
    setMode(newMode);
    setErrorInfo(null);
    setFieldErrors({});
    setOtpError('');
  };

  // If already authenticated, redirect straight to article add page!
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/reporter/articles/create');
    }
  }, [isAuthenticated, router]);

  // Restore remembered email on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEmail = localStorage.getItem('reporter_remember_email');
      if (savedEmail) {
        setLoginEmail(savedEmail);
        setRememberMe(true);
      }
    }
  }, []);

  // Countdown timer for OTP resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (otpCountdown > 0) {
      timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [otpCountdown]);

  // Handle Send OTP to Email
  const handleSendOtp = async () => {
    setOtpError('');
    const trimmedEmail = signupEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setOtpError('Please enter a valid email address first.');
      return;
    }

    try {
      setIsSendingOtp(true);
      await reporterAuthService.sendEmailOtp(trimmedEmail);
      setOtpSent(true);
      setOtpCountdown(60);
    } catch (err: any) {
      setOtpError(err.message || 'Failed to send OTP to email. Please try again.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Verify OTP
  const handleVerifyOtp = async () => {
    setOtpError('');
    const trimmedEmail = signupEmail.trim().toLowerCase();
    const cleanOtp = otpInput.trim();

    if (cleanOtp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP.');
      return;
    }

    try {
      setIsVerifyingOtp(true);
      const verified = await reporterAuthService.verifyEmailOtp(trimmedEmail, cleanOtp);
      if (verified) {
        setIsEmailVerified(true);
        setOtpSent(false);
        setOtpError('');
      } else {
        setOtpError('Invalid OTP entered. Please verify and try again.');
      }
    } catch (err: any) {
      setOtpError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle Individual Document Upload
  const handleDocUpload = async (field: keyof typeof documents, file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      setErrorInfo({ message: 'Document size must be less than 25MB.' });
      return;
    }

    try {
      setUploadingDocField(field);
      setErrorInfo(null);
      const uploadedUrl = await reporterAuthService.uploadIdProof(file);
      setDocuments(prev => ({ ...prev, [field]: uploadedUrl }));
    } catch (err: any) {
      setErrorInfo({ message: err.message || 'Failed to upload document. Please try again.' });
    } finally {
      setUploadingDocField(null);
    }
  };

  const handleRemoveDoc = (field: keyof typeof documents) => {
    setDocuments(prev => ({ ...prev, [field]: '' }));
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

      if (typeof window !== 'undefined') {
        if (rememberMe) {
          localStorage.setItem('reporter_remember_email', loginEmail.trim());
        } else {
          localStorage.removeItem('reporter_remember_email');
        }
      }

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

  // Handle Signup Submit with Full English Validation
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorInfo(null);
    const errors: { [key: string]: string } = {};

    const trimmedName = signupName.trim();
    if (!trimmedName || trimmedName.length < 2) {
      errors.name = 'Please enter your full name (at least 2 characters).';
    }

    const trimmedEmail = signupEmail.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!emailRegex.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. name@gmail.com).';
    } else if (!isEmailVerified) {
      errors.email = 'Please verify your email address with OTP before submitting.';
    }

    if (!signupPassword) {
      errors.password = 'Password is required.';
    } else {
      const pEval = evaluatePassword(signupPassword);
      if (!pEval.isValid) {
        errors.password = 'Password must include at least 6 characters, one letter, one number, and one special character (!@#$%).';
      } else if (!signupConfirmPassword) {
        errors.confirmPassword = 'Confirm password is required.';
      } else if (signupPassword !== signupConfirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    const cleanPhone = signupPhone.trim().replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10) {
      errors.phone = 'Please enter a valid 10-digit mobile phone number.';
    }

    

    // Check mandatory documents
    if (!documents.pressIdUrl) {
      errors.pressId = 'News Reporter ID Card is required.';
    }
    if (!documents.aadharFrontUrl || !documents.aadharBackUrl) {
      errors.aadhar = 'Aadhaar Card (Front and Back) is required.';
    }
    if (!documents.reporterProofUrl) {
      errors.proof = 'Reporter ground reporting proof document is required.';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstErrorMessage = Object.values(errors)[0];
      setErrorInfo({ message: firstErrorMessage });
      return;
    }

    try {
      setIsSubmitting(true);
      // Serialized multi-document JSON string stored in idProofUrl
      const docsJson = JSON.stringify(documents);

      await reporterAuthService.register({
        name: trimmedName,
        email: trimmedEmail,
        password: signupPassword,
        phone: cleanPhone,
        city: signupCity.trim() || undefined,
        district: signupDistrict.trim() || undefined,
        idProofUrl: docsJson,
        idProofType: 'REPORTER_BADGE',
        bio: 'Accredited News Reporter application.'
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
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-slate-50 text-slate-800 font-sans flex flex-col">
      {/* Top Left Back to Home (Clean, No Navbar Bar) */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2 shrink-0">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-red-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 flex items-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-14 items-center">
          
          {/* 1. LEFT COLUMN: STICKY Animated Newsroom Showcase Card (Login & Signup) */}
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
                  <span className={`w-2 h-2 rounded-full ${mode === 'login' ? 'bg-emerald-400' : 'bg-red-500'} animate-ping`} />
                  <span className={`w-1.5 h-1.5 rounded-full ${mode === 'login' ? 'bg-emerald-400' : 'bg-red-500'} -ml-2.5`} />
                  <span>{mode === 'login' ? 'Vartiq Reporter Desk' : 'Accredited News Network'}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-medium text-slate-300 bg-slate-900/60 backdrop-blur-md border border-slate-800 px-3 py-1.5 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{mode === 'login' ? 'Secure Newsroom Login' : 'Reporter Accreditation'}</span>
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

                {/* Floating Card 2: Bottom Right */}
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
              <div className="relative z-10 space-y-3.5 pt-3 border-t border-white/10 pb-2">
                <div className="space-y-1">
                  <h3 className="text-lg xl:text-xl font-black font-serif text-white tracking-tight">
                    {mode === 'login' ? 'The Editor’s Desk.' : 'The Independent Press.'}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {mode === 'login'
                      ? 'Sign in to access your newsroom desk, continue pending drafts, and publish verified ground reports.'
                      : 'Register as an accredited reporter. Submit your credentials to join 2,500+ verified journalists breaking impactful stories.'}
                  </p>
                </div>

                {/* 3 Metric Pills */}
                <div className="grid grid-cols-3 gap-3 pt-1 pb-1">
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
                        <p className="text-base xl:text-lg font-black text-rose-400">2,500+</p>
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

          {/* 2. RIGHT COLUMN: Login / Register Form Card (Scrollable) */}
          <div className="lg:col-span-6 xl:col-span-5 w-full max-w-lg mx-auto lg:max-w-none lg:h-full lg:overflow-y-auto pr-1 flex flex-col justify-center">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-8 space-y-6 my-auto">
          
          {isSignupSuccess ? (
            /* REGISTRATION SUCCESSFUL - PENDING APPROVAL SCREEN */
            <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 border border-amber-200 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                <Clock className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-[10px] font-black uppercase tracking-wider">
                  <Clock className="w-3.5 h-3.5 text-amber-700" />
                  <span>Application Under Review</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900 pt-1">
                  Application Submitted Successfully!
                </h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your reporter application and identification credentials have been securely submitted to the administrative team for verification.
                </p>
              </div>

              {/* Next Steps Guidance Card */}
              <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-left text-xs text-amber-950 space-y-2 max-w-sm mx-auto">
                <div className="font-bold flex items-center gap-1.5 text-amber-900 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Next Steps:</span>
                </div>
                <div className="text-[11.5px] text-amber-900/90 leading-relaxed space-y-1.5">
                  <p>1. <strong>Document Verification:</strong> The administrative desk will verify your uploaded press credentials and ID proofs.</p>
                  <p>2. <strong>Email Notification:</strong> Once your application is approved, an official confirmation email will be sent to <strong>{signupEmail}</strong>.</p>
                  <p>3. <strong>Newsroom Sign In:</strong> After administrator approval, you will be able to sign in to your reporter desk with your email and password.</p>
                </div>
              </div>

              {/* Fraud Safety Alert Card */}
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex items-center space-x-1.5 text-rose-800 font-bold">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Official Accreditation is 100% Free</span>
                </div>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  No fee is ever charged to become an accredited reporter on e-News. If anyone asks you for money, please inform our team immediately.
                </p>
                <a
                  href="tel:+918985025794"
                  className="inline-flex items-center space-x-1.5 text-[11px] font-bold text-rose-900 bg-rose-200/60 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-rose-800" />
                  <span>Call Fraud Helpline</span>
                </a>
              </div>

              {/* Summary Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left text-xs space-y-2 max-w-sm mx-auto">
                <div className="flex justify-between items-center text-slate-500">
                  <span>Reporter Name:</span>
                  <span className="font-bold text-slate-900">{signupName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Registered Mobile:</span>
                  <span className="font-bold text-slate-900">+91 {signupPhone}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Verified Email:</span>
                  <span className="font-bold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{signupEmail}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Documents:</span>
                  <span className="font-bold text-emerald-700 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Uploaded for Review</span>
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-500">
                  <span>Account Status:</span>
                  <span className="font-black text-amber-700 uppercase text-[11px] bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                    Under Review
                  </span>
                </div>
              </div>

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
                <span>Go to Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : errorInfo && (errorInfo.code === 'ACCOUNT_SUSPENDED' || (errorInfo.message && errorInfo.message.toLowerCase().includes('suspended'))) ? (
            /* DEDICATED ACCOUNT SUSPENDED SCREEN - NO EMAIL/PASSWORD INPUTS SHOWN */
            <div className="text-center py-4 space-y-5 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-rose-600 text-white flex items-center justify-center mx-auto shadow-[0_8px_24px_rgba(225,29,72,0.35)]">
                <ShieldAlert className="w-8 h-8 stroke-[2.2]" />
              </div>

              <div className="space-y-1.5">
                <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  <span>Account Suspended</span>
                </span>
                <h2 className="text-xl sm:text-2xl font-black font-serif text-slate-900 pt-1">
                  Account Has Been Suspended
                </h2>
                <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                  Your reporter account ({loginEmail || 'associated with this email'}) has been suspended by the administration desk. You cannot sign in or post news stories until an administrator reactivates your account.
                </p>
              </div>

              {/* Contact Support Section */}
              <div className="p-5 bg-gradient-to-b from-rose-50/90 via-white to-rose-50/40 border border-rose-200 rounded-2xl text-left space-y-3.5 max-w-sm mx-auto shadow-xs">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Contact Support Team
                  </span>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    Reach out to the administrative desk to appeal the suspension or request account reactivation:
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {/* WhatsApp Direct Contact */}
                  <a
                    href={`https://wa.me/918985025794?text=${encodeURIComponent(`Hello Admin, my reporter account (${loginEmail || 'registered email'}) has been suspended. Please review my account for reactivation.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs group cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>WhatsApp Admin</span>
                  </a>

                  {/* Email Support */}
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=support@nighwantech.com&su=${encodeURIComponent(`Reporter Account Suspension Inquiry - ${loginEmail || ''}`)}&body=${encodeURIComponent(`Hello Administrator,\n\nMy reporter account (${loginEmail || ''}) has been suspended. Please review my case for account reactivation.\n\nThank you.`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs group cursor-pointer"
                  >
                    <Mail className="w-4 h-4 transition-transform group-hover:scale-110" />
                    <span>Gmail Support</span>
                  </a>
                </div>
              </div>

              {/* Back to Sign In / Try Another Account Button */}
              <div className="pt-2 max-w-sm mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    setErrorInfo(null);
                    setLoginPassword('');
                  }}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Try Another Account / Back to Sign In</span>
                </button>
              </div>
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

              {/* Non-Suspended Error Notice */}
              {errorInfo && (
                errorInfo.code === 'ACCOUNT_PENDING' ? (
                  <div className="p-4 rounded-2xl border text-xs space-y-1.5 animate-in fade-in text-left bg-amber-50 border-amber-200 text-amber-950">
                    <div className="flex items-start space-x-2.5">
                      <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-sm">Account Under Review</div>
                        <p className="mt-1 leading-relaxed text-xs">
                          Your reporter application is currently under review by the administrator. Once approved, you will receive an email confirmation and can sign in to your desk.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl border text-xs space-y-1.5 animate-in fade-in text-left bg-rose-50 border-rose-200 text-rose-800">
                    <div className="flex items-start space-x-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold text-sm">Authentication Error</div>
                        <p className="mt-1 leading-relaxed text-xs">{errorInfo.message}</p>
                      </div>
                    </div>
                  </div>
                )
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
                    autoComplete="username"
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
                    autoComplete="current-password"
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
                      className="text-slate-400 hover:text-slate-600 transition-colors p-1 cursor-pointer"
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

              {/* Remember Me Option */}
              <div className="flex items-center justify-between pt-0.5 px-0.5">
                <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-red-600 border-slate-300 focus:ring-red-500 cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50 mt-1 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing In...</span>
                  </>
                ) : (
                  <span>Sign In</span>
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
            /* 2. SIGNUP FORM (ALL ENGLISH & FULL VALIDATION) */
            <form onSubmit={handleSignupSubmit} className="space-y-4 pt-1">
              
              {/* Full Name */}
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

              {/* Email Address with OTP Verification Row */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="relative flex-1">
                    <input
                      type="email"
                      id="signupEmail"
                      placeholder=" "
                      disabled={isEmailVerified}
                      value={signupEmail}
                      onChange={e => {
                        setSignupEmail(e.target.value);
                        if (fieldErrors.email) setFieldErrors(prev => ({ ...prev, email: '' }));
                      }}
                      className={`block w-full px-3.5 py-3 text-xs text-slate-900 bg-white rounded-xl border appearance-none focus:outline-none focus:ring-1 peer font-medium transition-all ${
                        isEmailVerified
                          ? 'border-emerald-500 bg-emerald-50/20 text-emerald-900 font-bold'
                          : fieldErrors.email
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

                  {/* Send / Resend OTP Button */}
                  {!isEmailVerified ? (
                    <button
                      type="button"
                      disabled={!signupEmail.trim() || isSendingOtp || otpCountdown > 0}
                      onClick={handleSendOtp}
                      className={`px-3.5 py-3 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                        signupEmail.trim() && otpCountdown === 0 && !isSendingOtp
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      }`}
                    >
                      {isSendingOtp
                        ? 'Sending...'
                        : otpCountdown > 0
                        ? `Resend in ${otpCountdown}s`
                        : otpSent
                        ? 'Resend OTP'
                        : 'Verify Email (OTP)'}
                    </button>
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 text-xs font-bold flex items-center space-x-1.5 shrink-0 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Email Verified</span>
                    </div>
                  )}
                </div>

                {/* OTP Input Box if OTP Sent */}
                {otpSent && !isEmailVerified && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2 animate-in fade-in">
                    <div className="text-[11px] font-bold text-amber-900">
                      Enter 6-digit OTP sent to {signupEmail}:
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="6-digit OTP"
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-amber-600"
                      />
                      <button
                        type="button"
                        disabled={otpInput.length !== 6 || isVerifyingOtp}
                        onClick={handleVerifyOtp}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        {isVerifyingOtp ? 'Verifying...' : 'Verify OTP'}
                      </button>
                    </div>
                  </div>
                )}

                {otpError && (
                  <p className="text-[10.5px] text-rose-600 font-semibold px-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{otpError}</span>
                  </p>
                )}
                {fieldErrors.email && (
                  <p className="text-[10.5px] text-rose-600 font-semibold px-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.email}</span>
                  </p>
                )}
              </div>

              {/* Mobile Phone */}
              <div>
                <div className="relative">
                  <input
                    type="tel"
                    id="signupPhone"
                    placeholder=" "
                    maxLength={10}
                    value={signupPhone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setSignupPhone(val);
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
                    Mobile Phone (+91) *
                  </label>
                </div>
                {fieldErrors.phone && (
                  <p className="text-[10.5px] text-rose-600 font-semibold mt-1 px-1 flex items-center space-x-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>

              {/* Password & Confirm Password (Instagram-style Validation) */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Create Password */}
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
                        Create Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 z-10 cursor-pointer"
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

                  {/* Confirm Password */}
                  <div>
                    <div className="relative">
                      <input
                        type={showSignupConfirmPassword ? 'text' : 'password'}
                        id="signupConfirmPassword"
                        placeholder=" "
                        value={signupConfirmPassword}
                        onChange={e => {
                          setSignupConfirmPassword(e.target.value);
                          if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }}
                        className={`block w-full px-3.5 pr-10 py-3 text-xs text-slate-900 bg-white rounded-xl border appearance-none focus:outline-none focus:ring-1 peer font-medium transition-all ${
                          fieldErrors.confirmPassword
                            ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500'
                            : 'border-slate-300 focus:border-red-600 focus:ring-red-600'
                        }`}
                      />
                      <label
                        htmlFor="signupConfirmPassword"
                        className="absolute text-xs text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3 pointer-events-none truncate max-w-[85%]"
                      >
                        Confirm Password *
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowSignupConfirmPassword(!showSignupConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1 z-10 cursor-pointer"
                        tabIndex={-1}
                        title={showSignupConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showSignupConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-[10.5px] text-rose-600 font-semibold mt-1 px-1 flex items-center space-x-1">
                        <AlertCircle className="w-3 h-3 shrink-0" />
                        <span>{fieldErrors.confirmPassword}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Instagram-style Password Strength Indicator & Security Checklist */}
                <PasswordStrengthIndicator
                  password={signupPassword}
                  confirmPassword={signupConfirmPassword}
                  showMatch={true}
                />
              </div>

              {/* City & District */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    City / Town
                  </label>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    id="signupDistrict"
                    placeholder=" "
                    value={signupDistrict}
                    onChange={e => setSignupDistrict(e.target.value)}
                    className="block w-full px-3.5 py-3 text-xs text-slate-900 bg-white rounded-xl border border-slate-300 appearance-none focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 peer font-medium transition-all"
                  />
                  <label
                    htmlFor="signupDistrict"
                    className="absolute text-xs text-slate-400 duration-200 transform -translate-y-1/2 top-1/2 z-10 origin-[0] bg-white px-1.5 peer-focus:px-1.5 peer-focus:text-red-600 peer-focus:top-0 peer-focus:text-[10px] peer-focus:font-bold peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-bold peer-[:not(:placeholder-shown)]:text-slate-600 start-3 pointer-events-none truncate max-w-[85%]"
                  >
                    District / State
                  </label>
                </div>
              </div>

              {/* Section B: Are you a news reporter? */}
              <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    Are you a news reporter? *
                  </label>
                </div>
                <div className="flex items-center space-x-6 pt-1">
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="isReporter"
                      checked={isReporterAnswer === 'yes'}
                      onChange={() => { setIsReporterAnswer('yes'); setErrorInfo(null); }}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span>Yes, I am a news reporter</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="radio"
                      name="isReporter"
                      checked={isReporterAnswer === 'no'}
                      onChange={() => { setIsReporterAnswer('no'); setErrorInfo(null); }}
                      className="w-4 h-4 text-red-600 focus:ring-red-500"
                    />
                    <span>No</span>
                  </label>
                </div>
              </div>

              {isReporterAnswer === 'yes' && (
                <>
                {/* Section C: 4 Structured Document Upload Slots */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                    Upload Accreditation Documents *
                  </label>
                  <span className="text-[10px] text-slate-400 font-medium">JPG, PNG, PDF (Max 25MB)</span>
                </div>

                {/* 1. News Reporter ID Card */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      1. News Reporter ID Card <span className="text-red-500">*</span>
                    </span>
                    {documents.pressIdUrl && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Upload complete</span>
                      </span>
                    )}
                  </div>
                  {documents.pressIdUrl ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                      <span className="text-emerald-800 font-medium truncate">Reporter ID Card Uploaded</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc('pressIdUrl')}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center space-x-2 py-2 px-3 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg bg-slate-50 cursor-pointer text-xs font-bold text-slate-700 transition-colors">
                      <UploadCloud className="w-4 h-4 text-slate-500" />
                      <span>{uploadingDocField === 'pressIdUrl' ? 'Uploading...' : 'Upload Press / Reporter ID Card'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        disabled={uploadingDocField !== null}
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleDocUpload('pressIdUrl', e.target.files[0])}
                      />
                    </label>
                  )}
                  {fieldErrors.pressId && (
                    <p className="text-[10.5px] text-rose-600 font-semibold">{fieldErrors.pressId}</p>
                  )}
                </div>

                {/* 2. Aadhaar Card (Front & Back) */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-2 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      2. Aadhaar Card (Front &amp; Back) <span className="text-red-500">*</span>
                    </span>
                    {documents.aadharFrontUrl && documents.aadharBackUrl && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Upload complete</span>
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Front */}
                    <div>
                      {documents.aadharFrontUrl ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                          <span className="text-emerald-800 font-medium truncate">Aadhaar Front</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc('aadharFrontUrl')}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg bg-slate-50 cursor-pointer text-xs font-bold text-slate-700">
                          <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                          <span>{uploadingDocField === 'aadharFrontUrl' ? 'Uploading...' : 'Front Side'}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            disabled={uploadingDocField !== null}
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleDocUpload('aadharFrontUrl', e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>

                    {/* Back */}
                    <div>
                      {documents.aadharBackUrl ? (
                        <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                          <span className="text-emerald-800 font-medium truncate">Aadhaar Back</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDoc('aadharBackUrl')}
                            className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex items-center justify-center space-x-1.5 py-2 px-3 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg bg-slate-50 cursor-pointer text-xs font-bold text-slate-700">
                          <UploadCloud className="w-3.5 h-3.5 text-slate-500" />
                          <span>{uploadingDocField === 'aadharBackUrl' ? 'Uploading...' : 'Back Side'}</span>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            disabled={uploadingDocField !== null}
                            className="hidden"
                            onChange={e => e.target.files?.[0] && handleDocUpload('aadharBackUrl', e.target.files[0])}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                  {fieldErrors.aadhar && (
                    <p className="text-[10.5px] text-rose-600 font-semibold">{fieldErrors.aadhar}</p>
                  )}
                </div>

                {/* 3. PAN Card (Optional) */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      3. PAN Card <span className="text-slate-400 font-normal">(Optional)</span>
                    </span>
                    {documents.panUrl && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Upload complete</span>
                      </span>
                    )}
                  </div>
                  {documents.panUrl ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                      <span className="text-emerald-800 font-medium truncate">PAN Card Uploaded</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc('panUrl')}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center space-x-2 py-2 px-3 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg bg-slate-50 cursor-pointer text-xs font-bold text-slate-700">
                      <UploadCloud className="w-4 h-4 text-slate-500" />
                      <span>{uploadingDocField === 'panUrl' ? 'Uploading...' : 'Upload PAN Card'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        disabled={uploadingDocField !== null}
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleDocUpload('panUrl', e.target.files[0])}
                      />
                    </label>
                  )}
                </div>

                {/* 4. Reporter Related Documents / Ground Proof */}
                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1.5 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">
                      4. Ground Reporting Proof <span className="text-red-500">*</span>
                    </span>
                    {documents.reporterProofUrl && (
                      <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1">
                        <Check className="w-3 h-3" />
                        <span>Upload complete</span>
                      </span>
                    )}
                  </div>
                  <p className="text-[10.5px] text-slate-500">
                    Upload photo, video, or newspaper byline clipping proving field reporting work.
                  </p>
                  {documents.reporterProofUrl ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs">
                      <span className="text-emerald-800 font-medium truncate">Work Proof Document Uploaded</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDoc('reporterProofUrl')}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex items-center justify-center space-x-2 py-2 px-3 border border-dashed border-slate-300 hover:border-slate-400 rounded-lg bg-slate-50 cursor-pointer text-xs font-bold text-slate-700">
                      <UploadCloud className="w-4 h-4 text-slate-500" />
                      <span>{uploadingDocField === 'reporterProofUrl' ? 'Uploading...' : 'Upload Field Reporting Proof'}</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf,video/*"
                        disabled={uploadingDocField !== null}
                        className="hidden"
                        onChange={e => e.target.files?.[0] && handleDocUpload('reporterProofUrl', e.target.files[0])}
                      />
                    </label>
                  )}
                  {fieldErrors.proof && (
                    <p className="text-[10.5px] text-rose-600 font-semibold">{fieldErrors.proof}</p>
                  )}
                </div>
              </div>

              {/* Section D: Fraud Safety Notice (English) */}
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-1">
                <p className="font-bold text-rose-800 flex items-center space-x-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Fraud Alert: Accreditation is 100% Free</span>
                </p>
                <p className="text-[11px] text-rose-700 leading-relaxed">
                  No fee is charged to become an accredited reporter on e-News. If anyone asks you for money, please report it immediately.
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || uploadingDocField !== null}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting Application...</span>
                  </>
                ) : (
                  <span>Submit Application</span>
                )}
              </button>
                </>
              )}

              {isReporterAnswer === 'no' && (
                <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center space-y-4 animate-in fade-in duration-300">
                  <div className="w-14 h-14 mx-auto rounded-full bg-red-100 flex items-center justify-center text-red-600 shadow-xs">
                    <XCircle className="w-8 h-8" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="inline-block px-3 py-1 rounded-full bg-red-600 text-white text-[11px] font-black uppercase tracking-wider">
                      Accreditation Rejected
                    </span>
                    <h3 className="text-base font-bold text-slate-900 pt-1">
                      Thank you for providing the information
                    </h3>
                    <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
                      The e-News reporter accreditation program is strictly for active journalists and field reporters. You can still contribute to your community by reading, discussing, and sharing verified local news.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-100/70 border border-rose-200 text-left text-xs space-y-1">
                    <p className="font-bold text-rose-900 flex items-center space-x-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>Notice: Free Reporter Access</span>
                    </p>
                    <p className="text-[11px] text-rose-700 leading-relaxed">
                      No fee is charged to become a reporter on e-News. If anyone asks you for money, please report it immediately.
                    </p>
                  </div>
                </div>
              )}

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
