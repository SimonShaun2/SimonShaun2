import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './follow-ups.routes.js';

export async function followUpsModule(app: FastifyInstance) {
  registerRoutes(app);
}
