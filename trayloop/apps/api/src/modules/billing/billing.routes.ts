import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import * as service from './billing.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.get('/invoices', async (request) => {
    const invoices = await service.listInvoices(request.ctx.tenant!.organizationId);
    return { data: invoices };
  });

  app.get('/customer/:customerId/invoices', async (request) => {
    const { customerId } = request.params as { customerId: string };
    const invoices = await service.listCustomerInvoices(customerId);
    return { data: invoices };
  });

  app.post('/invoices/:id/send', async (request, reply) => {
    const { id } = request.params as { id: string };
    await service.sendInvoice(id);
    return reply.send({ data: { message: 'Invoice sent' } });
  });

  app.get('/summary', async (request) => {
    const summary = await service.getBillingSummary(request.ctx.tenant!.organizationId);
    return { data: summary };
  });
}
