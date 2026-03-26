import Fastify from 'fastify';
import cors from '@fastify/cors';
import { EventBus } from './lib/event-bus/index.js';
import { errorHandler } from './lib/middleware/error-handler.js';
import { usersModule } from './modules/users/index.js';
import { productsModule } from './modules/products/index.js';
import { ordersModule } from './modules/orders/index.js';
import { paymentsModule } from './modules/payments/index.js';
import { notificationsModule } from './modules/notifications/index.js';

export async function buildApp() {
  const app = Fastify({ logger: true });
  const eventBus = new EventBus();

  await app.register(cors, { origin: true });

  // Decorate app with shared services
  app.decorate('eventBus', eventBus);

  // Global error handler
  app.setErrorHandler(errorHandler);

  // Health check
  app.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

  // Register domain modules
  await app.register(usersModule, { prefix: '/api/users' });
  await app.register(productsModule, { prefix: '/api/products' });
  await app.register(ordersModule, { prefix: '/api/orders' });
  await app.register(paymentsModule, { prefix: '/api/payments' });
  await app.register(notificationsModule, { prefix: '/api/notifications' });

  // Initialize event handlers after all modules are registered
  eventBus.initialize();

  return app;
}
