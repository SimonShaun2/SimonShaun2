import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { calculatePricing } from '../../lib/pricing.js';
import { createOrderSchema } from '../orders/orders.schema.js';
import * as service from './storefront.service.js';

const pricingPreviewSchema = z.object({
  headcount: z.number().int().positive(),
  packages: z.array(z.object({
    packageId: z.string().uuid(),
    quantity: z.number().int().positive().default(1),
  })).min(1),
  addOns: z.array(z.object({
    addOnId: z.string().uuid(),
    quantity: z.number().int().positive().default(1),
  })).optional(),
  locationId: z.string().uuid().optional(),
});

export function registerRoutes(app: FastifyInstance) {
  // Public endpoint — no auth required
  app.get('/:slug', async (request) => {
    const { slug } = request.params as { slug: string };
    const storefront = await service.getStorefront(slug);
    return { data: storefront };
  });

  // Public pricing preview
  app.post('/pricing', async (request) => {
    const input = pricingPreviewSchema.parse(request.body);
    const result = await calculatePricing(input);
    return {
      data: {
        items: result.lineItems.map((item) => ({
          type: item.type,
          name: item.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        packageSubtotal: result.packageSubtotal,
        addOnSubtotal: result.addOnSubtotal,
        total: result.total,
        currency: result.currency,
        headcount: result.headcount,
      },
    };
  });

  // Public order submission — resolves org from slug, no auth needed
  app.post('/:slug/order', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const body = createOrderSchema.parse(request.body);
    const result = await service.submitPublicOrder(slug, body, (app as any).eventBus);
    return reply.status(201).send({ data: result });
  });
}
