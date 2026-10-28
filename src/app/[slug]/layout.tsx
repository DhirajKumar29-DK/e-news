import type { Metadata } from 'next';
import React from 'react';
import { PRODUCTION_CANONICAL_ORIGIN } from '@/utils/seoUtils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cleanSlug = (slug || '').toLowerCase().trim();
  const titleSlug = cleanSlug ? cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1).replace(/-/g, ' ') : 'News';
  const canonicalUrl = `${PRODUCTION_CANONICAL_ORIGIN}/${cleanSlug}`;

  return {
    title: `${titleSlug} News`,
    description: `Stay updated with latest ${titleSlug} news, breaking reports, analysis and headlines on Vartiq.`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${titleSlug} News | Vartiq`,
      description: `Stay updated with latest ${titleSlug} news, breaking reports, analysis and headlines on Vartiq.`,
      url: canonicalUrl,
      siteName: 'Vartiq',
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${titleSlug} News | Vartiq`,
      description: `Stay updated with latest ${titleSlug} news, breaking reports, analysis and headlines on Vartiq.`,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
