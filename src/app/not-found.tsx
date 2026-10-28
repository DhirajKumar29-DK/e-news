import React from 'react';
import Link from 'next/link';
import { Header, Footer } from '@/components/common';
import { X, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col bg-jagran-bg dark:bg-brand-dark-bg text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Header />
      <div className="max-w-[800px] mx-auto px-4 py-20 text-center space-y-5 flex-1 flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 flex items-center justify-center text-jagran-red mx-auto">
          <X className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-serif text-slate-900 dark:text-white">
          404 - Page Not Found
        </h1>
        <p className="text-sm text-slate-500 max-w-md">
          The article or page you are looking for does not exist, has been removed, or the link is invalid.
        </p>
        <Link
          href="/"
          className="inline-flex items-center space-x-2 px-6 py-2.5 bg-jagran-red text-white text-sm font-bold rounded-full hover:bg-red-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Homepage</span>
        </Link>
      </div>
      <Footer />
    </main>
  );
}
