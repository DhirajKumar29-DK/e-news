'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer, MobileBottomNav, SearchModal } from '@/components/common';
import { 
  RotateCcw, 
  ShieldCheck, 
  CreditCard, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Home, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Newspaper
} from 'lucide-react';

export default function RefundPolicyPage() {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleSelectCategory = (slug: string) => {
    if (slug === 'all') {
      router.push('/');
    } else if (slug === 'videos') {
      router.push('/videos');
    } else {
      router.push(`/${slug}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      
      {/* 1. Global Header Navigation */}
      <Header
        onOpenSearch={() => setIsSearchOpen(true)}
        activeCategory=""
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Main Content Container */}
      <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex-1 space-y-8">
        
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-jagran-red flex items-center space-x-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-jagran-red font-bold">Refund Policy</span>
        </nav>

        {/* Hero Card Header */}
        <div className="bg-white dark:bg-brand-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 px-3 py-1 rounded-full text-xs font-bold text-jagran-red">
              <RotateCcw className="w-4 h-4" />
              <span>SUBSCRIPTION &amp; E-PAPER BILLING TERMS</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-serif text-slate-900 dark:text-white tracking-tight">
              Subscription &amp; Refund Policy
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span><strong>Media Network:</strong> Vartiq News Network</span>
              <span>•</span>
              <span><strong>Platform:</strong> Digital News, E-Paper Passes &amp; Mobile App</span>
              <span>•</span>
              <span><strong>Last Updated:</strong> 2026</span>
            </div>
          </div>
        </div>

        {/* Detailed Body */}
        <article className="bg-white dark:bg-brand-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          
          {/* Introduction */}
          <section className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
            <p>
              At <strong>Vartiq News Network</strong>, we are committed to providing transparent, verified journalism and high-quality digital newspaper experiences. Because our digital news feeds, multimedia bulletins, and regional E-Paper editions are accessible instantly upon activation, we have established this comprehensive Subscription &amp; Refund Policy.
            </p>
          </section>

          {/* 1. Subscription & Cancellation Policy */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <Newspaper className="w-5 h-5 text-jagran-red" />
              <h2>1. E-Paper Subscription &amp; Cancellation Policy</h2>
            </div>

            <div className="space-y-4 pt-1">
              {/* a. Digital Nature */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-jagran-red" />
                  <span>a. Instant Digital Delivery</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  Digital newspaper editions, historical archive issues, and premium articles are delivered electronically and consumed immediately upon subscription activation or purchase of a daily/monthly pass.
                </p>
              </div>

              {/* b. Cancellation Anytime */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-jagran-red" />
                  <span>b. Cancellation of Recurring Plans</span>
                </h3>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  <li>Subscribers may cancel recurring subscription renewals at any time by visiting their reader profile settings or by sending an email to <a href="mailto:support@nighwantech.com" className="text-jagran-red font-semibold hover:underline">support@nighwantech.com</a>.</li>
                  <li>Upon cancellation, all future auto-debits will cease immediately.</li>
                  <li>You will continue to have uninterrupted access to your active e-paper plan until the end of your paid billing period.</li>
                </ul>
              </div>

              {/* c. Non-Refundable Active Periods */}
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1.5">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base flex items-center space-x-2">
                  <span className="w-2 h-2 rounded-full bg-jagran-red" />
                  <span>c. Pro-Rated Refunds</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                  We do not provide partial or pro-rated refunds for the remaining days of an active subscription month or year once the period has commenced.
                </p>
              </div>
            </div>
          </section>

          {/* 2. Non-Refundable Items */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <CreditCard className="w-5 h-5 text-jagran-red" />
              <h2>2. Non-Refundable Digital Services</h2>
            </div>
            
            <p className="text-slate-600 dark:text-slate-400">
              The following digital purchases are non-refundable once processed:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm pt-1">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Single-day or Monthly E-Paper passes once viewed</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Downloaded PDF newspaper issues &amp; edition clips</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Sponsored articles or editorial classifieds already published</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Non-refundable banking/gateway convenience charges</span>
              </div>
            </div>
          </section>

          {/* 3. Refund Eligibility & Exceptions */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldCheck className="w-5 h-5 text-jagran-red" />
              <h2>3. Refund Eligibility &amp; Exceptions</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              We understand technical glitches can occur. Full or partial refunds will be gladly approved under the following conditions:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Duplicate Payment:</strong> Your bank account or UPI was charged more than once for the same subscription period due to a gateway error.</li>
              <li><strong>Technical Non-Activation:</strong> Your payment was debited, but your subscription pass failed to activate on our servers, and our technical support could not resolve it within 24 hours.</li>
              <li><strong>Extended Platform Outage:</strong> Prolonged server downtime on our end that prevented paid subscribers from accessing digital editions for multiple consecutive days.</li>
            </ul>
          </section>

          {/* 4. Priority Reader Support & Issue Resolution */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileText className="w-5 h-5 text-jagran-red" />
              <h2>4. Issue Resolution &amp; Reader Support</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Our first priority is ensuring you never miss a daily edition:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>If you experience difficulty opening today&apos;s digital paper, our support desk will instantly email you the high-resolution edition PDF or resolve account access.</li>
              <li>Subscription pass validity is automatically extended if our servers undergo scheduled system maintenance.</li>
            </ul>
          </section>

          {/* 5. Refund Processing Timeline */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <Clock className="w-5 h-5 text-jagran-red" />
              <h2>5. Refund Processing via Razorpay</h2>
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-4 rounded-xl space-y-2">
              <p className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                Direct Source Credit:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
                <li>Approved refunds are submitted directly through Razorpay to your original mode of payment (UPI, Net Banking, Credit/Debit Card).</li>
                <li>Refund timeline is typically <strong>7 to 10 working days</strong> according to Reserve Bank of India (RBI) payment clearing guidelines.</li>
                <li>You will receive an official refund transaction receipt with an RRN (Refund Reference Number).</li>
              </ul>
            </div>
          </section>

          {/* 6. Billing Help Desk */}
          <section className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 font-serif font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              <Mail className="w-5 h-5 text-jagran-red" />
              <h2>6. Subscription &amp; Billing Inquiries</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              If you have any questions about your subscription pass, payment receipts, or wish to report a duplicate charge, please contact our reader billing desk:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs sm:text-sm">
              <div className="space-y-2">
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <span className="font-bold text-slate-900 dark:text-white min-w-[70px]">Network:</span>
                  <span>Vartiq News Network</span>
                </div>
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <span className="font-bold text-slate-900 dark:text-white min-w-[70px]">Platform:</span>
                  <span>Vartiq News (<span className="font-mono text-xs text-jagran-red">com.nighwantech.vartiqnews</span>)</span>
                </div>
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <Mail className="w-4 h-4 text-jagran-red shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Billing Email: </span>
                    <a href="mailto:support@nighwantech.com" className="text-jagran-red hover:underline font-medium">support@nighwantech.com</a>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Help Desk Phone: </span>
                    <a href="tel:+918985025794" className="hover:text-jagran-red font-medium">+91 8985025794</a>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Bureau Office: </span>
                    <span>Patna (Bihar), India</span>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <span className="font-bold text-slate-900 dark:text-white min-w-[70px]">Website: </span>
                  <Link href="/" className="text-jagran-red hover:underline font-medium">
                    https://vartiq.com
                  </Link>
                </div>
              </div>
            </div>
          </section>

        </article>

      </div>

      {/* 3. Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* 4. Global Footer Navigation */}
      <Footer />

      {/* 5. Mobile Navigation Bar */}
      <MobileBottomNav onOpenSearch={() => setIsSearchOpen(true)} />

    </main>
  );
}
