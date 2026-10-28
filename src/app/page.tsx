import type { Metadata } from 'next';
import { PRODUCTION_CANONICAL_ORIGIN } from '@/utils/seoUtils';
import HomeClientView from '@/components/home/HomeClientView';

export const metadata: Metadata = {
  title: 'Vartiq | Latest News, India & World Updates',
  description: 'Stay ahead with Vartiq. Trusted breaking news from India and the world covering politics, cricket, business, tech, and entertainment.',
  alternates: {
    canonical: PRODUCTION_CANONICAL_ORIGIN,
  },
  openGraph: {
    title: 'Vartiq | Latest News, India & World Updates',
    description: 'Stay ahead with Vartiq. Trusted breaking news from India and the world covering politics, cricket, business, tech, and entertainment.',
    url: PRODUCTION_CANONICAL_ORIGIN,
    siteName: 'Vartiq',
    locale: 'hi_IN',
    type: 'website',
  },
};

export default function HomePage() {
  return <HomeClientView />;
}
