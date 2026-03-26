import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './products.routes.js';

export async function productsModule(app: FastifyInstance) {
  registerRoutes(app);
}
