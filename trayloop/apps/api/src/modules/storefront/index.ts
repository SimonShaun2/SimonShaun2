import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './storefront.routes.js';

export async function storefrontModule(app: FastifyInstance) {
  registerRoutes(app);
}
