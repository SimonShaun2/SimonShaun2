import Fastify from 'fastify';
import cors from '@fastify/cors';
import { EventBus } from './lib/event-bus/index.js';
import { errorHandler } from './lib/middleware/error-handler.js';
import { registerRequestLogger } from './lib/middleware/request-logger.js';
import { registerIdempotencyHook } from './lib/middleware/idempotency.js';
import './lib/context.js';
import { authModule } from './modules/auth/index.js';
import { organizationsModule } from './modules/organizations/index.js';
import { membershipsModule } from './modules/memberships/index.js';
import { locationsModule } from './modules/locations/index.js';
import { catalogsModule } from './modules/catalogs/index.js';
import { packagesModule } from './modules/packages/index.js';
import { addOnsModule } from './modules/add-ons/index.js';
import { customersModule } from './modules/customers/index.js';
import { ordersModule } from './modules/orders/index.js';
import { recurringOrdersModule } from './modules/recurring-orders/index.js';
import { paymentsModule } from './modules/payments/index.js';
import { billingModule } from './modules/billing/index.js';
import { followUpsModule } from './modules/follow-ups/index.js';
import { notificationsModule } from './modules/notifications/index.js';
import { adminModule } from './modules/admin/index.js';
import { storefrontModule } from './modules/storefront/index.js';
import { webhookModule } from './modules/webhooks/index.js';

export async function buildApp() {
  const app = Fastify({ logger: false }); // We use our own logger
  const eventBus = new EventBus();

  // Global middleware
  await app.register(cors, { origin: true });
  registerRequestLogger(app);
  registerIdempotencyHook(app);

  app.decorate('eventBus', eventBus);
  app.setErrorHandler(errorHandler);

  // Health check
  app.get('/health', async () => {
    const { isStripeEnabled } = await import('./lib/stripe.js');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        stripe: isStripeEnabled() ? 'connected' : 'not configured',
      },
    };
  });

  // Auth
  await app.register(authModule, { prefix: '/api/auth' });

  // Organization management
  await app.register(organizationsModule, { prefix: '/api/organizations' });
  await app.register(membershipsModule, { prefix: '/api/memberships' });
  await app.register(locationsModule, { prefix: '/api/locations' });

  // Catalog & packages
  await app.register(catalogsModule, { prefix: '/api/catalogs' });
  await app.register(packagesModule, { prefix: '/api/packages' });
  await app.register(addOnsModule, { prefix: '/api/add-ons' });

  // Customers
  await app.register(customersModule, { prefix: '/api/customers' });

  // Orders
  await app.register(ordersModule, { prefix: '/api/orders' });
  await app.register(recurringOrdersModule, { prefix: '/api/recurring-orders' });

  // Payments & billing
  await app.register(paymentsModule, { prefix: '/api/payments' });
  await app.register(billingModule, { prefix: '/api/billing' });

  // Follow-ups & notifications
  await app.register(followUpsModule, { prefix: '/api/follow-ups' });
  await app.register(notificationsModule, { prefix: '/api/notifications' });

  // Webhooks (raw body parsing — must be in own scope)
  await app.register(webhookModule, { prefix: '/api/webhooks' });

  // Public storefront
  await app.register(storefrontModule, { prefix: '/api/storefront' });

  // Platform admin
  await app.register(adminModule, { prefix: '/api/admin' });

  // Initialize event handlers after all modules are registered
  eventBus.initialize();

  return app;
}
