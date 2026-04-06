import fp from 'fastify-plugin';
import type { FastifyInstance } from 'fastify';
import { registerRoutes } from './automations.routes.js';

export const automationsModule = fp(async (app: FastifyInstance) => {
  registerRoutes(app);
});
