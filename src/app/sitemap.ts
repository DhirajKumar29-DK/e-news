import { MetadataRoute } from 'next';
import { API_BASE_URL } from '@/config/env';
import { PRODUCTION_CANONICAL_ORIGIN, getArticleCanonicalUrl } from '@/utils/seoUtils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = PRODUCTION_CANONICAL_ORIGIN;
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
    'horoscope',
  ];

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${origin}/${cat}`,
    lastModified: now,
    changeFrequency: 'hourly',
    priority: 0.8,
  }));

  // Dynamic published news articles with full multi-page pagination
  const articleEntries: MetadataRoute.Sitemap = [];
  const seenUrls = new Set<string>();

  let currentPage = 1;
  let totalPages = 1;
  const limit = 100;

  while (currentPage <= totalPages) {
    try {
      const res = await fetch(
        `${API_BASE_URL}/articles?status=PUBLISHED&limit=${limit}&page=${currentPage}`,
        { next: { revalidate: 3600 } }
      );

      if (!res.ok) {
        console.error(`[Sitemap] Failed to fetch articles on page ${currentPage}: HTTP ${res.status}`);
        break;
      }

      const json = await res.json();
      const articles = json?.data?.articles || [];
      const pagination = json?.data?.pagination;

      if (pagination?.totalPages && typeof pagination.totalPages === 'number') {
        totalPages = pagination.totalPages;
      }

      for (const art of articles) {
        // Exclude unpublished articles and explicitly non-indexed articles
        if (art.status !== 'PUBLISHED' || art.isIndexed === false) {
          continue;
        }

        const canonicalUrl = getArticleCanonicalUrl(art);

        if (!seenUrls.has(canonicalUrl)) {
          seenUrls.add(canonicalUrl);
          const rawDate = art.updatedAt || art.publishedAt || art.createdAt;
          const parsedDate = rawDate ? new Date(rawDate) : now;
          const lastModified = isNaN(parsedDate.getTime()) ? now : parsedDate;

          articleEntries.push({
            url: canonicalUrl,
            lastModified,
            changeFrequency: 'daily',
            priority: 0.7,
          });
        }
      }

      // Safeguard against infinite pagination
      if (articles.length === 0) break;
      currentPage++;
    } catch (err) {
      console.error(`[Sitemap] Network/parse error on page ${currentPage}:`, err);
      break;
    }
  }

  return [
    {
      url: `${origin}/`,
      lastModified: now,
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: `${origin}/editorial-guidelines`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${origin}/corrections`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${origin}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${origin}/refund-policy`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${origin}/terms`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...categoryEntries,
    ...articleEntries,
  ];
}
