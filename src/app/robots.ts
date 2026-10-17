import { MetadataRoute } from 'next';
import { SITE_URL } from '@/config/env';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = SITE_URL;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/api/']
    },
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
