import type { FastifyInstance } from 'fastify';
import * as service from './storefront.service.js';

export function registerRoutes(app: FastifyInstance) {
  // Public endpoint — no auth required
  app.get('/:slug', async (request) => {
    const { slug } = request.params as { slug: string };
    const storefront = await service.getStorefront(slug);
    return { data: storefront };
  });
}
