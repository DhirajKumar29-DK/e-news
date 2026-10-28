import type { Metadata } from 'next';
import React from 'react';
import { PRODUCTION_CANONICAL_ORIGIN } from '@/utils/seoUtils';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy and data protection standards of Vartiq News Network.',
  alternates: {
    canonical: `${PRODUCTION_CANONICAL_ORIGIN}/privacy-policy`,
  },
  openGraph: {
    title: 'Privacy Policy | Vartiq',
    description: 'Privacy Policy and data protection standards of Vartiq News Network.',
    url: `${PRODUCTION_CANONICAL_ORIGIN}/privacy-policy`,
    siteName: 'Vartiq',
    type: 'website',
  },
};

export default function PrivacyPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
