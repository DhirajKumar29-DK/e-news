import { MetadataRoute } from 'next';
import { SITE_URL, API_BASE_URL } from '@/config/env';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = SITE_URL;
  const now = new Date();

  // Static core routes & category channels
  const categories = [
    'latest',
    'india',
    'world',
    'cricket',
    'tech',
    'business',
    'entertainment',
    'sports',
    'education',
    'auto',
    'lifestyle',
    'fashion',
    'brandverse',
    'explainer',
    'videos',
    'spiritual',
    'horoscope'
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${siteUrl}/${cat}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.8
  }));

  // Dynamic published news articles
  let articleEntries: MetadataRoute.Sitemap = [];
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || API_BASE_URL;
    const res = await fetch(`${apiUrl}/articles?status=PUBLISHED&limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.articles) {
        articleEntries = data.data.articles
          .filter((art: any) => art.isIndexed !== false)
          .map((art: any) => ({
            url: `${siteUrl}/article/${art.slug || art.id}`,
            lastModified: new Date(art.updatedAt || art.publishedAt || art.createdAt),
            changeFrequency: 'daily',
            priority: 0.7
          }));
      }
    }
  } catch (err) {
    console.warn('Could not fetch articles for sitemap:', err);
  }

  return [
    {
      url: `${siteUrl}/`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0
    },
    {
      url: `${siteUrl}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${siteUrl}/refund-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5
    },
    ...categoryEntries,
    ...articleEntries
  ];
}
