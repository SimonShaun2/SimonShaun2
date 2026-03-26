import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './auth.routes.js';

export async function authModule(app: FastifyInstance) {
  registerRoutes(app);
}
