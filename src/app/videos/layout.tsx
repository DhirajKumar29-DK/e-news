import type { Metadata } from 'next';
import React from 'react';
import { PRODUCTION_CANONICAL_ORIGIN } from '@/utils/seoUtils';

export const metadata: Metadata = {
  title: 'News Videos & Bulletins',
  description: 'Watch latest news videos, breaking bulletins, field reports, and expert analysis on Vartiq.',
  alternates: {
    canonical: `${PRODUCTION_CANONICAL_ORIGIN}/videos`,
  },
  openGraph: {
    title: 'News Videos & Bulletins | Vartiq',
    description: 'Watch latest news videos, breaking bulletins, field reports, and expert analysis on Vartiq.',
    url: `${PRODUCTION_CANONICAL_ORIGIN}/videos`,
    siteName: 'Vartiq',
    locale: 'hi_IN',
    type: 'website',
  },
};

export default function VideosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
