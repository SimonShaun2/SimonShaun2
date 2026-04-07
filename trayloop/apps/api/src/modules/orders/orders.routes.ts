import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody, validateParams } from '../../lib/middleware/validate.js';
import { requireIdempotency } from '../../lib/middleware/idempotency.js';
import { customerIdParamsSchema, idParamsSchema } from '../../lib/params.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  orderListQuerySchema,
  sendDepositLinkSchema,
  reorderSchema,
} from './orders.schema.js';
import * as service from './orders.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  // List orders with filtering + pagination
  app.get('/', async (request) => {
    const query = orderListQuerySchema.parse(request.query);
    const result = await service.listByOrg(request.ctx.tenant!.organizationId, query);
    return { data: result.orders, meta: result.pagination };
  });

  // List orders by customer
  app.get('/customer/:customerId', { preHandler: [validateParams(customerIdParamsSchema)] }, async (request) => {
    const { customerId } = (request as any).validatedParams as { customerId: string };
    const result = await service.listByCustomer(customerId);
    return { data: result };
  });

  // Get order stats (must be before /:id)
  app.get('/stats', async (request) => {
    const orgId = request.ctx.tenant!.organizationId;
    const stats = await service.getOrderStats(orgId);
    return { data: stats };
  });

  // Get order detail
  app.get('/:id', { preHandler: [validateParams(idParamsSchema)] }, async (request) => {
    const { id } = (request as any).validatedParams as { id: string };
    const order = await service.getById(id, request.ctx.tenant!.organizationId);
    return { data: order };
  });

  // Create order (idempotent)
  app.post('/', { preHandler: [requireIdempotency(), validateBody(createOrderSchema)] }, async (request, reply) => {
    const result = await service.create(
      request.ctx.tenant!.organizationId,
      (request as any).validatedBody,
      (app as any).eventBus,
    );
    return reply.status(201).send({ data: result });
  });

  // Update order status
  app.patch('/:id/status', { preHandler: [validateParams(idParamsSchema), validateBody(updateOrderStatusSchema)] }, async (request, reply) => {
    const { id } = (request as any).validatedParams as { id: string };
    const result = await service.updateStatus(
      id,
      request.ctx.tenant!.organizationId,
      (request as any).validatedBody,
      (app as any).eventBus,
    );
    return reply.send({ data: result });
  });

  // Send deposit link
  app.post('/:id/send-deposit-link', { preHandler: [validateParams(idParamsSchema)] }, async (request, reply) => {
    const { id } = (request as any).validatedParams as { id: string };
    const body = sendDepositLinkSchema.parse(request.body ?? {});
    const result = await service.sendDepositLink(
      id,
      request.ctx.tenant!.organizationId,
      body,
      (app as any).eventBus,
    );
    return reply.status(201).send({ data: result });
  });

  // Mark order as paid
  app.patch('/:id/mark-paid', { preHandler: [validateParams(idParamsSchema)] }, async (request, reply) => {
    const { id } = (request as any).validatedParams as { id: string };
    const result = await service.markPaid(
      id,
      request.ctx.tenant!.organizationId,
      (app as any).eventBus,
    );
    return reply.send({ data: result });
  });

  // Reorder from existing order (idempotent)
  app.post('/:id/reorder', { preHandler: [validateParams(idParamsSchema), requireIdempotency()] }, async (request, reply) => {
    const { id } = (request as any).validatedParams as { id: string };
    const body = reorderSchema.parse(request.body);
    const result = await service.reorder(
      id,
      request.ctx.tenant!.organizationId,
      body,
      (app as any).eventBus,
    );
    return reply.status(201).send({ data: result });
  });

  // Refund deposit
  app.post('/:id/refund-deposit', { preHandler: [validateParams(idParamsSchema)] }, async (request, reply) => {
    const { id } = (request as any).validatedParams as { id: string };
    const result = await service.refundDeposit(
      id,
      request.ctx.tenant!.organizationId,
      (app as any).eventBus,
    );
    return reply.send({ data: result });
  });
}
