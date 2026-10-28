import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { API_BASE_URL } from '@/config/env';
import { stripHtml } from '@/utils/textUtils';
import { PRODUCTION_CANONICAL_ORIGIN, getArticleCanonicalUrl, getSafeMediaUrl } from '@/utils/seoUtils';
import ArticleClientView from '@/components/article/ArticleClientView';
import { ArticleData } from '@/services/articleService';

interface PageProps {
  params: Promise<{ id: string }>;
}

// Deduplicated server-side article fetcher via React cache()
const getArticle = cache(async (idOrSlug: string): Promise<ArticleData | null> => {
  if (!idOrSlug) return null;
  try {
    const res = await fetch(`${API_BASE_URL}/articles/${idOrSlug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data || null;
  } catch (err) {
    console.error('Failed to fetch article on server:', err);
    return null;
  }
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return {
      title: 'Article Not Found | Vartiq',
      description: 'The requested article could not be found.',
      robots: { index: false, follow: false },
    };
  }

  const cleanTitle = stripHtml(article.metaTitle || article.title);
  const cleanDesc =
    stripHtml(article.metaDescription || article.subHeadline || '') ||
    stripHtml(article.content || '').slice(0, 160);
  const canonicalUrl = getArticleCanonicalUrl(article);
  const isIndexable = article.isIndexed !== false;
  const safeImage = getSafeMediaUrl(article.featuredImage);

  return {
    title: cleanTitle,
    description: cleanDesc,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: cleanTitle,
      description: cleanDesc,
      url: canonicalUrl,
      siteName: 'Vartiq',
      locale: 'hi_IN',
      type: 'article',
      publishedTime: article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
      modifiedTime: (article.updatedAt || article.publishedAt)
        ? new Date(article.updatedAt || article.publishedAt).toISOString()
        : undefined,
      images: safeImage ? [{ url: safeImage, alt: cleanTitle }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: cleanTitle,
      description: cleanDesc,
      images: safeImage ? [safeImage] : undefined,
    },
    robots: isIndexable
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        }
      : {
          index: false,
          follow: true,
        },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    return notFound();
  }

  const canonicalUrl = getArticleCanonicalUrl(article);
  const cleanTitle = stripHtml(article.metaTitle || article.title);
  const cleanDesc =
    stripHtml(article.metaDescription || article.subHeadline || '') ||
    stripHtml(article.content || '').slice(0, 160);
  const safeImage = getSafeMediaUrl(article.featuredImage);

  // Authoritative NewsArticle JSON-LD schema with real available article data
  const newsArticleSchema = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    'headline': cleanTitle,
    'description': cleanDesc,
    'image': safeImage ? [safeImage] : undefined,
    'datePublished': article.publishedAt ? new Date(article.publishedAt).toISOString() : undefined,
    'dateModified': (article.updatedAt || article.publishedAt)
      ? new Date(article.updatedAt || article.publishedAt).toISOString()
      : undefined,
    'author': [
      {
        '@type': 'Person',
        'name': stripHtml(article.authorName || 'News Desk'),
      },
    ],
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': 'Vartiq',
      'url': PRODUCTION_CANONICAL_ORIGIN,
      'logo': {
        '@type': 'ImageObject',
        'url': `${PRODUCTION_CANONICAL_ORIGIN}/vartiq-icon.png`,
      },
    },
  };

  // Safe JSON-LD serialization: escapes '<' to prevent script breakout
  const safeJsonLd = JSON.stringify(newsArticleSchema).replace(/</g, '\\u003c');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd }}
      />
      <ArticleClientView initialArticle={article} />
    </>
  );
}
