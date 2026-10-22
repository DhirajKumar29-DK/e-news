'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer, MobileBottomNav, SearchModal } from '@/components/common';
import { 
  FileText, 
  ShieldCheck, 
  BookOpen, 
  AlertCircle, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Home, 
  Copyright, 
  CheckCircle2, 
  Scale,
  Newspaper
} from 'lucide-react';

export default function TermsOfServicePage() {
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
        <nav aria-label="Breadcrumb" className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-500 dark:text-slate-400">
          <Link href="/" className="hover:text-jagran-red flex items-center space-x-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-jagran-red font-bold">Terms of Service</span>
        </nav>

        {/* Hero Card Header */}
        <div className="bg-white dark:bg-brand-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 px-3 py-1 rounded-full text-xs font-bold text-jagran-red">
              <Scale className="w-4 h-4" />
              <span>READER &amp; EDITORIAL TERMS OF SERVICE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-serif text-slate-900 dark:text-white tracking-tight">
              Terms of Service
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span><strong>Media Network:</strong> Vartiq News Network</span>
              <span>•</span>
              <span><strong>Platform:</strong> Web Portal, Digital E-Paper &amp; Android App</span>
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
              Welcome to <strong>Vartiq News Network</strong> (&quot;Vartiq&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). These Terms of Service govern your access to and use of our digital news website (<Link href="/" className="text-jagran-red font-semibold hover:underline">https://vartiq.com</Link>), mobile applications (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-jagran-red font-mono">com.nighwantech.vartiqnews</code>), digital newspaper editions (E-Paper), audio bulletins, video studio feeds, and related media services.
            </p>
            <p>
              By accessing, browsing, or subscribing to Vartiq News, you agree to be bound by these Terms of Service and our editorial guidelines.
            </p>
          </section>

          {/* 1. Use of Services */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <BookOpen className="w-5 h-5 text-jagran-red" />
              <h2>1. Editorial Services &amp; Reader Access</h2>
            </div>
            
            <p>Vartiq News provides digital journalism, news analysis, multimedia reporting, and digital newspaper editions across various categories (National, Bihar, World, Cricket &amp; Sports, Business, Technology, Lifestyle, and Horoscopes).</p>
            
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Personal, Non-Commercial License:</strong> You are granted a limited, personal, non-exclusive, non-transferable license to read and view our news content for personal informational use.</li>
              <li><strong>Digital E-Paper:</strong> Reading passes and subscriptions grant access to verified digital newspaper editions and archive issues. Sharing login credentials outside your household is strictly prohibited.</li>
            </ul>
          </section>

          {/* 2. Intellectual Property & Copyright */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <Copyright className="w-5 h-5 text-jagran-red" />
              <h2>2. Intellectual Property &amp; Copyright Notice</h2>
            </div>
            
            <p>
              All content published on Vartiq News—including written articles, investigative reports, photographs, graphic illustrations, logos, video bulletins, audio podcasts, and E-Paper PDF layouts—is the exclusive intellectual property of <strong>Vartiq News Network</strong> or its authorized licensors and is protected by Indian and international copyright laws.
            </p>

            <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-jagran-red p-3.5 rounded-r-xl text-xs sm:text-sm">
              <p className="font-bold text-slate-900 dark:text-white">
                Prohibited Actions:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-400 mt-1">
                <li>You may NOT scrape, mass-download, reproduce, redistribute, or republish our news articles or E-Paper pages on other websites, apps, or print media without prior written authorization.</li>
                <li>Automated bot crawling, data mining, or commercial reproduction is strictly prohibited.</li>
              </ul>
            </div>
          </section>

          {/* 3. Reader Community Guidelines */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldCheck className="w-5 h-5 text-jagran-red" />
              <h2>3. Reader Code of Conduct &amp; Comments</h2>
            </div>
            <p>We encourage healthy public debate and reader opinions. When posting comments, letters to the editor, or news tips, you agree NOT to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>Post defamatory, abusive, obscene, hateful, or communally sensitive remarks.</li>
              <li>Spread fake news, unverified rumors, or malicious misinformation.</li>
              <li>Impersonate any journalist, public figure, or third party.</li>
              <li>Upload spam, advertising promotions, or harmful software links.</li>
            </ul>
            <p className="text-xs text-slate-500 italic">
              Vartiq News reserves the right to moderate, hide, or delete any comment that violates these guidelines.
            </p>
          </section>

          {/* 4. Subscriptions & Payment Terms */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <Newspaper className="w-5 h-5 text-jagran-red" />
              <h2>4. E-Paper Subscriptions &amp; Billing</h2>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li>All digital e-paper subscription rates are transparently displayed before payment.</li>
              <li>Online transactions are processed securely through certified payment gateways (Razorpay).</li>
              <li>Subscription cancellation, renewal terms, and refund eligibility are governed by our <Link href="/refund-policy" className="text-jagran-red font-semibold hover:underline">Subscription &amp; Refund Policy</Link>.</li>
            </ul>
          </section>

          {/* 5. Editorial Fact-Checking & Corrections */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <CheckCircle2 className="w-5 h-5 text-jagran-red" />
              <h2>5. Editorial Fact-Checking &amp; Corrections Protocol</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Vartiq News adheres to strict editorial verification protocols. If a factual error is brought to our attention, our editorial team investigates and issues transparent corrections or clarifications promptly. Readers can submit correction requests to <a href="mailto:support@nighwantech.com" className="text-jagran-red font-semibold hover:underline">support@nighwantech.com</a>.
            </p>
          </section>

          {/* 6. Disclaimers & Limitation of Liability */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <AlertCircle className="w-5 h-5 text-jagran-red" />
              <h2>6. Disclaimers &amp; Limitation of Liability</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              News reports, stock market data, astrology/horoscopes, and weather feeds are provided for general informational purposes. Vartiq News Network shall not be held liable for any investment, financial, or personal decisions made on the basis of published articles or third-party advertisements.
            </p>
          </section>

          {/* 7. Governing Law */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <Scale className="w-5 h-5 text-jagran-red" />
              <h2>7. Governing Law &amp; Jurisdiction</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute or proceeding arising out of or related to these terms shall be subject to the exclusive jurisdiction of the competent courts in <strong>Patna (Bihar), India</strong>.
            </p>
          </section>

          {/* 8. Editorial Desk & Contact */}
          <section className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 font-serif font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              <Mail className="w-5 h-5 text-jagran-red" />
              <h2>8. Editorial Desk &amp; Legal Notices</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              For any editorial inquiries, legal notices, or feedback regarding these terms, please contact:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 text-xs sm:text-sm">
              <div className="space-y-2">
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <span className="font-bold text-slate-900 dark:text-white min-w-[70px]">Network:</span>
                  <span>Vartiq News Network</span>
                </div>
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <span className="font-bold text-slate-900 dark:text-white min-w-[70px]">Mobile App:</span>
                  <span>Vartiq News (<span className="font-mono text-xs text-jagran-red">com.nighwantech.vartiqnews</span>)</span>
                </div>
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <Mail className="w-4 h-4 text-jagran-red shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Editorial Email: </span>
                    <a href="mailto:support@nighwantech.com" className="text-jagran-red hover:underline font-medium">support@nighwantech.com</a>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">Newsroom Phone: </span>
                    <a href="tel:+918985025794" className="hover:text-jagran-red font-medium">+91 8985025794</a>
                  </div>
                </div>
                <div className="flex items-start space-x-2.5 text-slate-800 dark:text-slate-200">
                  <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white">News Bureau: </span>
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
