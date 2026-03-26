import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './customers.routes.js';

export async function customersModule(app: FastifyInstance) {
  registerRoutes(app);
}
