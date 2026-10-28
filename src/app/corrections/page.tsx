import type { Metadata } from 'next';
import React from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/common';
import { AlertCircle, CheckCircle2, Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import { PRODUCTION_CANONICAL_ORIGIN } from '@/utils/seoUtils';

export const metadata: Metadata = {
  title: 'Corrections & Clarifications Policy',
  description: 'Policy and process for reporting factual corrections and editorial clarifications on Vartiq News.',
  alternates: {
    canonical: `${PRODUCTION_CANONICAL_ORIGIN}/corrections`,
  },
  openGraph: {
    title: 'Corrections & Clarifications Policy | Vartiq',
    description: 'Policy and process for reporting factual corrections and editorial clarifications on Vartiq News.',
    url: `${PRODUCTION_CANONICAL_ORIGIN}/corrections`,
    siteName: 'Vartiq',
    type: 'website',
  },
};

export default function CorrectionsPolicyPage() {
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
          <span className="font-semibold text-slate-700 dark:text-slate-300">Corrections Policy</span>
        </div>

        <header className="space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 rounded-full text-xs font-bold">
            <RefreshCw className="w-4 h-4" />
            <span>Accountability &amp; Accuracy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900 dark:text-white">
            Corrections &amp; Clarifications Policy
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-serif">
            Transparency is central to our journalistic integrity. We acknowledge and rectify factual errors promptly.
          </p>
        </header>

        <section className="bg-white dark:bg-brand-dark-card rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-jagran-red" />
              <span>Correction Protocol</span>
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              When a factual error is discovered in an article published on Vartiq, our editorial team reviews the claim against primary evidence and updates the story with full transparency.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Prompt Review</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  Reported inaccuracies are forwarded directly to the handling desk and supervising editor for immediate fact-checking.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Editorial Clarifications</h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  Substantive corrections to names, dates, figures, or key facts are indicated with an editor note or clarification at the bottom of the article.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center space-x-2">
              <Mail className="w-4 h-4 text-jagran-red" />
              <span>How to Submit a Correction</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              If you believe a published story contains a factual error, please email our editorial desk with:
            </p>
            <ul className="list-disc ml-6 space-y-1 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <li>The exact URL of the article on Vartiq</li>
              <li>The specific statement or data point in question</li>
              <li>Reference to the authoritative source or official document</li>
            </ul>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pt-1">
              Send correction requests to:{' '}
              <a href="mailto:support@nighwantech.com" className="font-semibold text-jagran-red hover:underline">
                support@nighwantech.com
              </a>
            </p>
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
