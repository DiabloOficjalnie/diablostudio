import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://decosol.pl';

  const routes: string[] = [
    '/',
    '/valuation',
    '/colors',
    '/realizations',
    '/blog',
    '/edukacja',
    '/reviews',
    '/contact',
    '/privacy',
    '/terms',
    '/cookies',
  ];

  const now = new Date();

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '/' ? 'weekly' : 'monthly',
    priority: route === '/' ? 1 : 0.7,
  }));
}
