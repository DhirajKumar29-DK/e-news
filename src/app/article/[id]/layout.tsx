import type { Metadata } from 'next';
import React from 'react';
import { API_BASE_URL, SITE_URL } from '@/config/env';
import { stripHtml } from '@/utils/textUtils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  if (!id) return {};

  try {
    const res = await fetch(`${API_BASE_URL}/articles/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return {};
    const json = await res.json();
    const article = json?.data;
    if (!article) return {};

    const cleanTitle = stripHtml(article.metaTitle || article.title);
    const cleanDesc = stripHtml(article.metaDescription || article.subHeadline || '') || stripHtml(article.content).slice(0, 160);
    const canonicalPath = article.canonicalUrl || `${SITE_URL}/article/${article.slug || article.id}`;

    return {
      title: `${cleanTitle} | Vartiq`,
      description: cleanDesc,
      alternates: {
        canonical: canonicalPath,
      },
      openGraph: {
        title: cleanTitle,
        description: cleanDesc,
        url: canonicalPath,
        siteName: 'Vartiq',
        locale: 'hi_IN',
        type: 'article',
        publishedTime: article.publishedAt,
        modifiedTime: article.updatedAt || article.publishedAt,
        images: article.featuredImage ? [{ url: article.featuredImage, alt: cleanTitle }] : undefined,
      },
      twitter: {
        card: 'summary_large_image',
        title: cleanTitle,
        description: cleanDesc,
        images: article.featuredImage ? [article.featuredImage] : undefined,
      },
      robots: article.isIndexed === false ? { index: false, follow: false } : { index: true, follow: true },
    };
  } catch {
    return {};
  }
}

export default function ArticleServerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
