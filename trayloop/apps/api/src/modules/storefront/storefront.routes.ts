import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { logger } from '@trayloop/utils';
import { calculatePricing } from '../../lib/pricing.js';
import { NotFoundError } from '../../lib/errors.js';
import { optionalAuth } from '../../lib/middleware/auth.js';
import { storefrontOrderParamsSchema, storefrontSlugParamsSchema } from '../../lib/params.js';
import { createOrderSchema } from '../orders/orders.schema.js';
import * as service from './storefront.service.js';

const pricingPreviewSchema = z.object({
  headcount: z.number().int().positive(),
  packages: z
    .array(
      z.object({
        packageId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
      }),
    )
    .min(1),
  addOns: z
    .array(
      z.object({
        addOnId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
      }),
    )
    .optional(),
  locationId: z.string().uuid().optional(),
});

const upsellRequestSchema = z.object({
  locationId: z.string().uuid(),
  serviceType: z.enum(['delivery', 'pickup', 'full_service', 'on_site', 'food_truck']),
  headcount: z.number().int().positive(),
  packages: z
    .array(
      z.object({
        packageId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
      }),
    )
    .min(1),
  addOns: z
    .array(
      z.object({
        addOnId: z.string().uuid(),
        quantity: z.number().int().positive().default(1),
      }),
    )
    .optional()
    .default([]),
});

const upsellTrackSchema = z.object({
  sessionKey: z.string().min(8).max(64),
  locationId: z.string().uuid().optional(),
  addOnId: z.string().uuid(),
  eventType: z.enum(['shown', 'clicked']),
  recommendationType: z.string().min(1).max(50),
  suggestedQuantity: z.number().int().positive().default(1),
  revenueCents: z.number().int().nonnegative().default(0),
  headline: z.string().max(140).optional(),
  reason: z.string().max(280).optional(),
});

const upsellSocialProofQuerySchema = z.object({
  addOnId: z.string().uuid(),
  headcount: z.coerce.number().int().positive(),
});

export function registerRoutes(app: FastifyInstance) {
  app.get('/:slug', async (request) => {
    const { slug } = storefrontSlugParamsSchema.parse(request.params);

    try {
      const storefront = await service.getStorefront(slug);
      return { data: storefront };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';

      if (message.toLowerCase().includes('not found')) {
        throw new NotFoundError('Storefront');
      }

      logger.error('Storefront endpoint error', {
        slug,
        error: message,
      });
      throw err;
    }
  });

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
        subtotal: result.subtotal,
        platformFee: result.platformFee,
        platformFeePercent: result.platformFeePercent,
        total: result.total,
        currency: result.currency,
        headcount: result.headcount,
      },
    };
  });

  app.post('/:slug/order', { preHandler: [optionalAuth] }, async (request, reply) => {
    const { slug } = storefrontSlugParamsSchema.parse(request.params);
    const body = createOrderSchema.parse(request.body);
    const customerUserId = request.ctx?.user?.role === 'customer' ? request.ctx.user.id : undefined;
    const result = await service.submitPublicOrder(slug, body, app.eventBus, customerUserId);
    return reply.status(201).send({ data: result });
  });

  app.post('/:slug/upsells', async (request) => {
    const { slug } = storefrontSlugParamsSchema.parse(request.params);
    const body = upsellRequestSchema.parse(request.body);
    const result = await service.getStorefrontUpsellRecommendations(slug, body);
    return { data: result };
  });

  app.post('/:slug/upsells/track', async (request, reply) => {
    const { slug } = storefrontSlugParamsSchema.parse(request.params);
    const body = upsellTrackSchema.parse(request.body);
    const result = await service.trackStorefrontUpsellEvent(slug, body);
    return reply.status(201).send({ data: result });
  });

  app.get('/:slug/upsells/social-proof', async (request) => {
    const { slug } = storefrontSlugParamsSchema.parse(request.params);
    const query = upsellSocialProofQuerySchema.parse(request.query);
    const result = await service.getStorefrontUpsellSocialProof(slug, query);
    return { data: result };
  });

  app.get('/:slug/often-added', async (request) => {
    const { slug } = storefrontSlugParamsSchema.parse(request.params);
    const result = await service.getStorefrontOftenAdded(slug);
    return { data: result };
  });

  app.get('/:slug/orders/:orderId/payment-status', async (request) => {
    const { slug, orderId } = storefrontOrderParamsSchema.parse(request.params);
    const result = await service.getPublicOrderPaymentStatus(slug, orderId);
    return { data: result };
  });

  app.post('/:slug/orders/:orderId/checkout', async (request, reply) => {
    const { slug, orderId } = storefrontOrderParamsSchema.parse(request.params);
    const result = await service.restartPublicOrderCheckout(slug, orderId, app.eventBus);
    return reply.status(201).send({ data: result });
  });

  app.post('/:slug/orders/:orderId/deposit-checkout', async (request, reply) => {
    const { slug, orderId } = storefrontOrderParamsSchema.parse(request.params);
    const result = await service.restartPublicOrderCheckout(slug, orderId, app.eventBus);
    return reply.status(201).send({ data: result });
  });
}
