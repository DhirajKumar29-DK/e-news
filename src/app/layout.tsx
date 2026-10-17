import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { CapacitorBridge, GlobalMobileBottomNav } from '@/components/common';
import { SITE_URL } from '@/config/env';

const siteUrl = SITE_URL;

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Vartiq | Latest News, India & World Updates',
    template: '%s | Vartiq'
  },
  description: 'Stay ahead with Vartiq. Trusted breaking news from India and the world covering politics, cricket, business, tech, and entertainment.',
  keywords: [
    'Vartiq',
    'Vartiq News',
    'वार्तिक',
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
  authors: [{ name: 'Vartiq Editorial Bureau', url: siteUrl }],
  creator: 'Vartiq Media Network',
  publisher: 'Vartiq',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/vartiq-icon.png', type: 'image/png' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    shortcut: '/vartiq-icon.png',
    apple: '/vartiq-icon.png'
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: siteUrl,
    siteName: 'Vartiq',
    title: 'Vartiq | Latest News, Breaking Stories & Global Coverage',
    description: 'Trusted 24/7 digital news reporting from India and around the world covering politics, business, sports, entertainment, technology, and lifestyle.',
    images: [
      {
        url: '/vartiq-logo.png',
        width: 1200,
        height: 630,
        alt: 'Vartiq - Leading Digital News Portal'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vartiq | Latest News & Breaking Stories',
    description: 'Real-time breaking news, geopolitical analysis, cricket scores, and lifestyle trends from Vartiq.',
    creator: '@VartiqNews',
    images: ['/vartiq-logo.png']
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
    'name': 'Vartiq',
    'url': siteUrl,
    'logo': {
      '@type': 'ImageObject',
      'url': `${siteUrl}/vartiq-logo.png`,
      'width': 400,
      'height': 120
    },
    'sameAs': [
      'https://twitter.com/VartiqNews',
      'https://facebook.com/VartiqNews',
      'https://instagram.com/VartiqNews'
    ],
    'publishingPrinciples': `${siteUrl}/editorial-guidelines`,
    'correctionsPolicy': `${siteUrl}/corrections`
  };

  const jsonLdWebsite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'Vartiq',
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
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
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
          <CapacitorBridge />
          <LanguageProvider>
            {children}
            <GlobalMobileBottomNav />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
