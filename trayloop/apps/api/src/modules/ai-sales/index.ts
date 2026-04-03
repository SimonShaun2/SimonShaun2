import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './ai-sales.routes.js';

export async function aiSalesModule(app: FastifyInstance) {
  registerRoutes(app);
}
