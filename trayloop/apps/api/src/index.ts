import Fastify from 'fastify';
import cors from '@fastify/cors';
import { EventBus } from './lib/event-bus/index.js';
import { errorHandler } from './lib/middleware/error-handler.js';
import { registerRequestLogger } from './lib/middleware/request-logger.js';
import { registerIdempotencyHook } from './lib/middleware/idempotency.js';
import { applySecurityHeaders, enforceRateLimit, getAllowedOrigins } from './lib/security.js';
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
import { aiSalesModule } from './modules/ai-sales/index.js';
import { automationsModule } from './modules/automations/index.js';
import { revenueIntelligenceModule } from './modules/revenue-intelligence/index.js';
import { adminModule } from './modules/admin/index.js';
import { storefrontModule } from './modules/storefront/index.js';
import { webhookModule } from './modules/webhooks/index.js';

export async function buildApp() {
  const app = Fastify({
    logger: false,
    trustProxy: true,
    bodyLimit: 1024 * 1024,
  });
  const eventBus = new EventBus();
  const allowedOrigins = getAllowedOrigins();

  // Global middleware
  await app.register(cors, {
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key', 'x-organization-id'],
    maxAge: 86400,
  });
  app.addHook('onRequest', applySecurityHeaders);
  app.addHook('onRequest', enforceRateLimit);
  registerRequestLogger(app);
  registerIdempotencyHook(app);

  app.decorate('eventBus', eventBus);
  app.setErrorHandler(errorHandler);

  // Health check
  app.get('/health', async () => {
    const { isStripeEnabled } = await import('./lib/stripe.js');
    const { isEmailEnabled } = await import('./lib/email.js');
    const { isSmsEnabled } = await import('./lib/sms.js');
    const { isOpenAIEnabled } = await import('./lib/openai.js');
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        stripe: isStripeEnabled() ? 'connected' : 'not configured',
        email: isEmailEnabled() ? 'connected' : 'not configured',
        sms: isSmsEnabled() ? 'connected' : 'not configured',
        openai: isOpenAIEnabled() ? 'connected' : 'not configured',
      },
    };
  });

  // Auth
  await app.register(authModule, { prefix: '/api/auth' });

  // Public + route-scoped auth modules
  await app.register(organizationsModule, { prefix: '/api/organizations' });

  await app.register(paymentsModule, { prefix: '/api/payments' });
  await app.register(billingModule, { prefix: '/api/billing' });

  // Webhooks (raw body parsing — must be in own scope)
  await app.register(webhookModule, { prefix: '/api/webhooks' });

  // Public storefront
  await app.register(storefrontModule, { prefix: '/api/storefront' });

  // Protected modules live in an isolated scope so auth hooks cannot bleed onto public routes.
  await app.register(async (protectedApp) => {
    await protectedApp.register(membershipsModule, { prefix: '/api/memberships' });
    await protectedApp.register(locationsModule, { prefix: '/api/locations' });
    await protectedApp.register(catalogsModule, { prefix: '/api/catalogs' });
    await protectedApp.register(packagesModule, { prefix: '/api/packages' });
    await protectedApp.register(addOnsModule, { prefix: '/api/add-ons' });
    await protectedApp.register(customersModule, { prefix: '/api/customers' });
    await protectedApp.register(ordersModule, { prefix: '/api/orders' });
    await protectedApp.register(recurringOrdersModule, { prefix: '/api/recurring-orders' });
    await protectedApp.register(followUpsModule, { prefix: '/api/follow-ups' });
    await protectedApp.register(notificationsModule, { prefix: '/api/notifications' });
    await protectedApp.register(aiSalesModule, { prefix: '/api/ai-sales' });
    await protectedApp.register(automationsModule, { prefix: '/api/automations' });
    await protectedApp.register(revenueIntelligenceModule, { prefix: '/api/revenue-intelligence' });
    await protectedApp.register(adminModule, { prefix: '/api/admin' });
  });

  // Initialize event handlers after all modules are registered
  eventBus.initialize();

  return app;
}
