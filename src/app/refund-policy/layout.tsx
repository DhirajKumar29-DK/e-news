import type { Metadata } from 'next';
import React from 'react';
import { PRODUCTION_CANONICAL_ORIGIN } from '@/utils/seoUtils';

export const metadata: Metadata = {
  title: 'Refund Policy',
  description: 'Cancellation and refund policies for Vartiq News digital subscriptions and services.',
  alternates: {
    canonical: `${PRODUCTION_CANONICAL_ORIGIN}/refund-policy`,
  },
  openGraph: {
    title: 'Refund Policy | Vartiq',
    description: 'Cancellation and refund policies for Vartiq News digital subscriptions and services.',
    url: `${PRODUCTION_CANONICAL_ORIGIN}/refund-policy`,
    siteName: 'Vartiq',
    type: 'website',
  },
};

export default function RefundPolicyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
