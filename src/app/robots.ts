import { MetadataRoute } from 'next';
import { PRODUCTION_CANONICAL_ORIGIN } from '@/utils/seoUtils';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/'],
    },
    sitemap: `${PRODUCTION_CANONICAL_ORIGIN}/sitemap.xml`,
  };
}
