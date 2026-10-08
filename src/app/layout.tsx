import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'The Daily Jagran | Latest News, India, World, Cricket, Tech & Breaking Updates',
    template: '%s | The Daily Jagran'
  },
  description: 'Stay ahead with The Daily Jagran. Comprehensive breaking news from India and across the globe, in-depth politics, cricket match coverage, tech breakthroughs, markets, education, and lifestyle reports.',
  keywords: [
    'Daily Jagran',
    'Latest News',
    'India News',
    'Breaking News Today',
    'Cricket News',
    'World News',
    'Tech & Science',
    'Business & Stock Market',
    'Education & Exams',
    'Entertainment News',
    'Vande Bharat',
    'ISRO Missions'
  ],
  authors: [{ name: 'The Daily Jagran Editorial Bureau', url: siteUrl }],
  creator: 'The Daily Jagran Media Network',
  publisher: 'The Daily Jagran',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'The Daily Jagran',
    title: 'The Daily Jagran | Latest News, Breaking Stories & Global Coverage',
    description: 'Trusted 24/7 digital news reporting from India and around the world covering politics, business, sports, entertainment, technology, and lifestyle.',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80',
        width: 1200,
        height: 630,
        alt: 'The Daily Jagran - Leading Digital News Portal'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'The Daily Jagran | Latest News & Breaking Stories',
    description: 'Real-time breaking news, geopolitical analysis, cricket scores, and lifestyle trends from The Daily Jagran.',
    creator: '@TheDailyJagran',
    images: ['https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&q=80']
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLdOrg = {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    'name': 'The Daily Jagran',
    'url': siteUrl,
    'logo': {
      '@type': 'ImageObject',
      'url': 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=400',
      'width': 400,
      'height': 120
    },
    'sameAs': [
      'https://twitter.com/TheDailyJagran',
      'https://facebook.com/TheDailyJagran',
      'https://instagram.com/TheDailyJagran'
    ],
    'publishingPrinciples': `${siteUrl}/editorial-guidelines`,
    'correctionsPolicy': `${siteUrl}/corrections`
  };

  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'The Daily Jagran',
    'url': siteUrl,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${siteUrl}/latest?search={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Merriweather:wght@400;700;900&family=Mukta:wght@400;500;600;700;800&family=Noto+Serif+Devanagari:wght@400;600;700;900&display=swap"
          rel="stylesheet"
        />
        {/* Schema.org NewsMediaOrganization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrg) }}
        />
        {/* Schema.org WebSite SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
      </head>
      <body suppressHydrationWarning className="antialiased selection:bg-red-500 selection:text-white">
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
