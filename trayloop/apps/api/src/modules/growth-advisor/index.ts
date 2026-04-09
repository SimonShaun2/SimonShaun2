import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './growth-advisor.routes.js';

export async function growthAdvisorModule(app: FastifyInstance) {
  registerRoutes(app);
}
