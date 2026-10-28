import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/common';
import { ShieldCheck, BookOpen, CheckCircle2, Mail, ArrowLeft } from 'lucide-react';
import { PRODUCTION_CANONICAL_ORIGIN } from '@/utils/seoUtils';

export const metadata: Metadata = {
  title: 'Editorial Guidelines & Standards',
  description: 'Editorial guidelines, sourcing standards, and publishing principles of Vartiq News Network.',
  alternates: {
    canonical: `${PRODUCTION_CANONICAL_ORIGIN}/editorial-guidelines`,
  },
  openGraph: {
    title: 'Editorial Guidelines & Standards | Vartiq',
    description: 'Editorial guidelines, sourcing standards, and publishing principles of Vartiq News Network.',
    url: `${PRODUCTION_CANONICAL_ORIGIN}/editorial-guidelines`,
    siteName: 'Vartiq',
    type: 'website',
  },
};

export default function EditorialGuidelinesPage() {
  return (
    <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Header />

      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 space-y-8">
        <div className="flex items-center space-x-2 text-xs text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-3">
          <Link href="/" className="flex items-center space-x-1 font-bold text-jagran-red hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">Editorial Guidelines</span>
        </div>

        <header className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-red-50 dark:bg-red-950/40 text-jagran-red rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>Vartiq Editorial Bureau</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Editorial Guidelines &amp; Publishing Standards
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
            Our commitment to factual accuracy, independent verification, and responsible journalism.
          </p>
        </header>

        <section className="bg-white dark:bg-brand-dark-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-jagran-red" />
              <span>Core Principles</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Vartiq News operates under principles of objectivity, truthfulness, and fairness. Our digital newsroom reports breaking news and developing stories across national, international, business, technology, cricket, and cultural domains.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Verified Source Protocol</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  Every factual claim, quantitative statistic, or attribution is cross-referenced with primary public records, verified agency feeds, or authorized organizational statements. Unconfirmed rumors are explicitly demarcated as developing or unverified.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Independence and Neutrality</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  Editorial decisions are made solely by our editorial desk without commercial or political bias. Commercial features or partner content are clearly segregated and labeled.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Attribution and Copyright</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  Quotes, external excerpts, photographic material, and social media embeds are credited to their primary creators, agencies, or official public releases.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Mail className="w-4 h-4 text-jagran-red" />
              <span>Editorial Inquiries &amp; Feedback</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              For questions regarding our editorial process, contact our news desk at{' '}
              <a href="mailto:support@nighwantech.com" className="font-semibold text-jagran-red hover:underline">
                support@nighwantech.com
              </a>.
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
