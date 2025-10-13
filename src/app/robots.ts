import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://decosol.pl';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          // Private/client/admin spaces
          '/client/',
          '/admin/',
          // API routes
          '/api/',
          // Auth
          '/login',
        ],
      },
    ],
    sitemap: [`${baseUrl}/sitemap.xml`],
    host: baseUrl.replace(/\/$/, ''),
  };
}
