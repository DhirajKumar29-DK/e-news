import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    const res = await fetch(`${apiUrl}/articles?limit=100`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      if (data?.data?.articles) {
        articleEntries = data.data.articles.map((art: any) => ({
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
    ...categoryEntries,
    ...articleEntries
  ];
}
