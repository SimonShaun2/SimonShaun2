import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import * as service from './billing.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.get('/org/:orgId/invoices', { preHandler: [requireAuth] }, async (request) => {
    const { orgId } = request.params as { orgId: string };
    const invoices = await service.listInvoices(orgId);
    return { data: invoices };
  });

  app.get('/customer/:customerId/invoices', { preHandler: [requireAuth] }, async (request) => {
    const { customerId } = request.params as { customerId: string };
    const invoices = await service.listCustomerInvoices(customerId);
    return { data: invoices };
  });

  app.post('/invoices/:id/send', { preHandler: [requireAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.sendInvoice(id);
    return reply.send({ data: { message: 'Invoice sent' } });
  });

  app.get('/org/:orgId/summary', { preHandler: [requireAuth] }, async (request) => {
    const { orgId } = request.params as { orgId: string };
    const summary = await service.getBillingSummary(orgId);
    return { data: summary };
  });
}
