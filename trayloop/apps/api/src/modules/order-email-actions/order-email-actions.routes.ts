import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { verifyOrderActionToken } from '../../lib/order-action-tokens.js';
import { getMerchantDashboardUrl } from '../../lib/notifications.js';
import { renderOrderActionResultHtml } from '../../lib/order-ticket-email.js';
import * as orderService from '../orders/orders.service.js';

const tokenQuerySchema = z.object({
  token: z.string().min(20),
});

export function registerRoutes(app: FastifyInstance) {
  app.get('/accept', async (request, reply) => {
    try {
      const { token } = tokenQuerySchema.parse(request.query);
      const payload = await verifyOrderActionToken(token, 'accept_order');
      const result = await orderService.acceptOrderFromEmail(
        payload.orderId,
        payload.organizationId,
        (app as any).eventBus,
      );

      const dashboardUrl = getMerchantDashboardUrl(`/orders/${result.orderId}`);

      if (result.requiresDepositReview) {
        return reply.type('text/html').send(
          renderOrderActionResultHtml({
            title: 'Deposit review still needed',
            body: `Order ${result.orderNumber} still needs the merchant to send a deposit request before it can move into confirmed status.`,
            dashboardUrl,
            success: false,
          }),
        );
      }

      if (result.alreadyHandled) {
        return reply.type('text/html').send(
          renderOrderActionResultHtml({
            title: 'Order already handled',
            body: `Order ${result.orderNumber} is already ${result.status.replace('_', ' ')} in TrayLoop.`,
            dashboardUrl,
            success: true,
          }),
        );
      }

      return reply.type('text/html').send(
        renderOrderActionResultHtml({
          title: 'Order accepted',
          body: `Order ${result.orderNumber} was confirmed successfully and the dashboard has been updated.`,
          dashboardUrl,
          success: true,
        }),
      );
    } catch (error) {
      return reply.code(400).type('text/html').send(
        renderOrderActionResultHtml({
          title: 'Unable to process this email action',
          body: error instanceof Error ? error.message : 'This email action link could not be completed.',
          dashboardUrl: getMerchantDashboardUrl('/'),
          success: false,
        }),
      );
    }
  });
}
