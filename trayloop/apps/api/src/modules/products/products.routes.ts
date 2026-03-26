import type { FastifyInstance } from 'fastify';
import { validateBody } from '../../lib/middleware/validate.js';
import { requireAuth } from '../../lib/middleware/auth.js';
import { createProductSchema } from './products.schema.js';
import * as service from './products.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/', async (request) => {
    const products = await service.listProducts();
    return { data: products };
  });

  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const product = await service.getProduct(id);
    return { data: product };
  });

  app.post('/', { preHandler: [requireAuth, validateBody(createProductSchema)] }, async (request, reply) => {
    const product = await service.createProduct((request as any).user.sub, (request as any).validatedBody);
    return reply.status(201).send({ data: product });
  });
}
