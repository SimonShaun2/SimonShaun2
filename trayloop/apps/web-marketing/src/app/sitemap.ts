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
    '/product/recurring-orders',
    '/product/merchant-portal',
    '/product/smart-pricing',
    '/product/smart-upsell',
    '/product/capacity-management',
    '/product/revenue-dashboard',
    '/product/growth-advisor',
    '/solutions',
    '/solutions/direct-ordering',
    '/solutions/automated-follow-up',
    '/solutions/ai-reengagement',
    '/solutions/smart-upsells',
    '/solutions/deposit-collection',
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
