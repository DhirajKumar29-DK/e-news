import type { Metadata } from 'next';
import React from 'react';
import { PRODUCTION_CANONICAL_ORIGIN } from '@/utils/seoUtils';

export const metadata: Metadata = {
  title: 'Cricket News & Live Scores',
  description: 'Latest cricket news, live match scores, schedules, IPL updates, and rankings on Vartiq.',
  alternates: {
    canonical: `${PRODUCTION_CANONICAL_ORIGIN}/cricket`,
  },
  openGraph: {
    title: 'Cricket News & Live Scores | Vartiq',
    description: 'Latest cricket news, live match scores, schedules, IPL updates, and rankings on Vartiq.',
    url: `${PRODUCTION_CANONICAL_ORIGIN}/cricket`,
    siteName: 'Vartiq',
    locale: 'hi_IN',
    type: 'website',
  },
};

export default function CricketLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
