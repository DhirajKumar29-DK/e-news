'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header, Footer, MobileBottomNav, SearchModal } from '@/components/common';
import { 
  ShieldCheck, 
  Lock, 
  FileText, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronRight, 
  Home, 
  Smartphone, 
  CreditCard, 
  Bell, 
  Eye, 
  UserCheck,
  Newspaper
} from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <span className="text-jagran-red font-bold">Privacy Policy</span>
        </nav>

        {/* Hero Card Header */}
        <div className="bg-white dark:bg-brand-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            <div className="inline-flex items-center space-x-2 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/50 px-3 py-1 rounded-full text-xs font-bold text-jagran-red">
              <ShieldCheck className="w-4 h-4" />
              <span>EDITORIAL &amp; READER PRIVACY POLICY</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-serif text-slate-900 dark:text-white tracking-tight">
              Privacy Policy
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
              <span><strong>Media Network:</strong> Vartiq News Network</span>
              <span>•</span>
              <span><strong>Platform:</strong> Digital News Portal, E-Paper &amp; Android App</span>
              <span>•</span>
              <span><strong>Last Updated:</strong> 2026</span>
            </div>
          </div>
        </div>

        {/* Privacy Policy Detailed Body */}
        <article className="bg-white dark:bg-brand-dark-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm space-y-10 text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
          
          {/* Introduction */}
          <section className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
            <p>
              Welcome to <strong>Vartiq News Network</strong> (&quot;Vartiq&quot;, &quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We operate the digital news portal <Link href="/" className="text-jagran-red font-semibold hover:underline">Vartiq News</Link>, the digital E-Paper platform, multimedia news bulletins, and our official mobile application (<code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-jagran-red font-mono">com.nighwantech.vartiqnews</code>).
            </p>
            <p>
              As an independent digital journalism publication, we respect your privacy and are committed to safeguarding the personal information you share with us while browsing news articles, listening to audio bulletins, reading digital e-papers, or interacting with our mobile application.
            </p>
          </section>

          {/* 1. Information We Collect */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <Newspaper className="w-5 h-5 text-jagran-red" />
              <h2>1. Information We Collect as a News Platform</h2>
            </div>
            
            <p>We collect only the essential information needed to provide you with seamless, personalized, and timely news coverage:</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white text-sm">
                  <UserCheck className="w-4 h-4 text-jagran-red" />
                  <span>a. Reader Information</span>
                </div>
                <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-disc pl-4">
                  <li>Reader Name &amp; Email address (when subscribing or commenting)</li>
                  <li>Selected Regional Edition &amp; Language preferences (English / Hindi)</li>
                  <li>Reading mode preferences (Dark / Light theme, font scaling)</li>
                  <li>Reader feedback, letters to the editor, &amp; grievance submissions</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white text-sm">
                  <CreditCard className="w-4 h-4 text-emerald-600" />
                  <span>b. E-Paper Subscription Data</span>
                </div>
                <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-disc pl-4">
                  <li>Digital subscription plans and access passes</li>
                  <li>Payments securely processed via certified gateways (Razorpay)</li>
                  <li>We <strong>NEVER</strong> store bank passwords, credit/debit card numbers, CVVs, or UPI PINs</li>
                  <li>Only standard transaction references (Order ID, payment status) are stored for account verification</li>
                </ul>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-slate-900 dark:text-white text-sm">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>c. Device &amp; App Diagnostics</span>
                </div>
                <ul className="text-xs space-y-1.5 text-slate-600 dark:text-slate-400 list-disc pl-4">
                  <li>Device model, OS version, and browser type</li>
                  <li>Anonymous reading analytics (articles read, time spent)</li>
                  <li>App crash logs to ensure high stability on Android &amp; iOS devices</li>
                  <li>Push notification tokens to deliver breaking news headlines</li>
                </ul>
              </div>
            </div>
          </section>

          {/* 2. How We Use Your Information */}
          <section className="space-y-4">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <Bell className="w-5 h-5 text-jagran-red" />
              <h2>2. How We Use Information for News Delivery</h2>
            </div>
            <p>Your data is used solely to enhance your news experience and maintain editorial operations:</p>
            <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
              <li><strong>Personalized News Feeds:</strong> Serving local city news, state bulletins (Bihar, National, World, Sports, Tech, Business), and daily horoscopes based on your selected regional edition.</li>
              <li><strong>Breaking News Notifications:</strong> Delivering urgent alerts, major policy updates, and live election/cricket coverage straight to your device. You can turn notifications on or off anytime in app settings.</li>
              <li><strong>Digital E-Paper Access:</strong> Authenticating and delivering high-resolution digital newspaper editions, PDF downloads, and archive issues.</li>
              <li><strong>Interactive Audio (TTS):</strong> Providing accessible text-to-speech audio articles for listening on-the-go.</li>
              <li><strong>Editorial Feedback &amp; Grievance Redressal:</strong> Reviewing factual correction requests, letters to the editor, and inquiries in compliance with Digital Media Ethics standards.</li>
              <li><strong>Security &amp; Abuse Prevention:</strong> Guarding our digital platforms against malicious cyber threats, unauthorized scraping, and spam comments.</li>
            </ul>
          </section>

          {/* 3. Journalistic Source Confidentiality */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldCheck className="w-5 h-5 text-jagran-red" />
              <h2>3. Journalistic Integrity &amp; Source Confidentiality</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              As a dedicated journalistic institution, Vartiq News strictly adheres to professional ethics. Confidential sources, whistleblowers, and investigative news tipsters who contact our newsroom are protected with strict journalistic privilege and confidentiality in accordance with applicable laws.
            </p>
          </section>

          {/* 4. Sharing of Information */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <Eye className="w-5 h-5 text-jagran-red" />
              <h2>4. Sharing of Information</h2>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 border-l-4 border-jagran-red p-3.5 rounded-r-xl">
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                We do NOT sell, rent, or trade reader personal information or reading history to any third-party advertisers or data brokers.
              </p>
            </div>
            <p className="text-slate-600 dark:text-slate-400">We only collaborate with essential, privacy-compliant service partners:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Content Delivery Networks (CDNs) &amp; Cloud Hosts:</strong> High-speed servers that deliver instant article images and PDF newspaper pages.</li>
              <li><strong>Payment Processors (Razorpay):</strong> Industry-standard secure payment processing for digital subscriptions.</li>
              <li><strong>Statutory Authorities:</strong> Strictly when compelled by valid legal summons, court orders, or applicable Indian law.</li>
            </ul>
          </section>

          {/* 5. Data Security */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <Lock className="w-5 h-5 text-jagran-red" />
              <h2>5. Data Security</h2>
            </div>
            <p>
              We implement comprehensive security measures to safeguard your information against unauthorized access, loss, or alteration:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>High-grade 256-bit SSL/TLS encryption for all data transmitted across web and mobile connections.</li>
              <li>Restricted, role-based newsroom access to reader subscription and customer support databases.</li>
              <li>Continuous server health and security patch updates.</li>
            </ul>
          </section>

          {/* 6. Cookies & Reader Preferences */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileText className="w-5 h-5 text-jagran-red" />
              <h2>6. Cookies &amp; Local Preferences</h2>
            </div>
            <p>Our website and mobile app use cookies and local device cache strictly to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li>Remember your selected news edition (e.g. Patna, National, Bihar) so you don&apos;t have to re-select it on every visit.</li>
              <li>Keep your preferred reading theme (Dark Mode / Light Mode) active.</li>
              <li>Maintain your logged-in session for seamless e-paper reading.</li>
            </ul>
            <p className="text-xs text-slate-500">
              You can clear cookies anytime via your browser settings without losing access to public news articles.
            </p>
          </section>

          {/* 7. Reader Rights & Account Deletion */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <UserCheck className="w-5 h-5 text-jagran-red" />
              <h2>7. Reader Rights &amp; Data Deletion Request</h2>
            </div>
            <p>You have full ownership of your personal data:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
              <li><strong>Access &amp; Review:</strong> You can request a summary of your registered reader account details.</li>
              <li><strong>Data Deletion Right:</strong> You can request the permanent removal of your account, bookmarks, and associated records by emailing us at <a href="mailto:support@nighwantech.com" className="text-jagran-red font-semibold hover:underline">support@nighwantech.com</a> with the subject <em>&quot;Account &amp; Data Deletion&quot;</em>. All requests are verified and executed within 7 business days.</li>
              <li><strong>Notification Opt-Out:</strong> You can enable or disable push alerts at any time in your mobile device settings.</li>
            </ul>
          </section>

          {/* 8. Children's Privacy */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <ShieldCheck className="w-5 h-5 text-jagran-red" />
              <h2>8. Children&apos;s Privacy</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              Vartiq News is a general public news publication. We do not intentionally collect or solicit personal identifiable information from children under the age of 13.
            </p>
          </section>

          {/* 9. Policy Updates */}
          <section className="space-y-3">
            <div className="flex items-center space-x-2.5 text-slate-900 dark:text-white font-serif font-black text-lg sm:text-xl border-b border-slate-100 dark:border-slate-800 pb-2">
              <FileText className="w-5 h-5 text-jagran-red" />
              <h2>9. Updates to This Policy</h2>
            </div>
            <p className="text-slate-600 dark:text-slate-400">
              We may update this Privacy Policy periodically to reflect technological improvements or regulatory developments. Any revisions will be published immediately on this page with an updated timestamp.
            </p>
          </section>

          {/* 10. Grievance Redressal & Editorial Contact */}
          <section className="bg-slate-50 dark:bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 font-serif font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              <Mail className="w-5 h-5 text-jagran-red" />
              <h2>10. Grievance Redressal &amp; Editorial Desk</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              In accordance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, readers can direct any complaints, news corrections, or privacy inquiries to our dedicated editorial and grievance desk:
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
