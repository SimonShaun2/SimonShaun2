import type { MetadataRoute } from 'next';

const BASE_URL = 'https://trayloophq.com';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes = [
    '',
    '/about',
    '/how-it-works',
    '/pricing',
    '/product',
    '/solutions',
    '/blog',
    '/demo',
    '/signup',
    '/privacy',
    '/terms',
  ];

  return staticRoutes.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '' ? 1.0 : 0.7,
  }));
}
