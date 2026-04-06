import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './revenue-intelligence.routes.js';

export async function revenueIntelligenceModule(app: FastifyInstance) {
  registerRoutes(app);
}
