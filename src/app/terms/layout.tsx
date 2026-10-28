import type { Metadata } from 'next';
import React from 'react';
import { PRODUCTION_CANONICAL_ORIGIN } from '@/utils/seoUtils';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms and Conditions governing the use of Vartiq News digital publications and services.',
  alternates: {
    canonical: `${PRODUCTION_CANONICAL_ORIGIN}/terms`,
  },
  openGraph: {
    title: 'Terms of Service | Vartiq',
    description: 'Terms and Conditions governing the use of Vartiq News digital publications and services.',
    url: `${PRODUCTION_CANONICAL_ORIGIN}/terms`,
    siteName: 'Vartiq',
    type: 'website',
  },
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
