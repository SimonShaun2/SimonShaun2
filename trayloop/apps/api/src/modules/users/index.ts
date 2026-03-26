import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './users.routes.js';

export async function usersModule(app: FastifyInstance) {
  registerRoutes(app);
}
