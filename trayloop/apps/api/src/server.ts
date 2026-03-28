import { buildApp } from './index.js';
import { logger } from '@trayloop/utils';
import { initStripe } from './lib/stripe.js';

const start = async () => {
  // Initialize external services
  initStripe();

  const app = await buildApp();
  const port = parseInt(process.env.API_PORT || '3001', 10);

  try {
    await app.listen({ port, host: '0.0.0.0' });
    logger.info(`API server running on port ${port}`);
  } catch (err) {
    logger.error('Failed to start server', { error: (err as Error).message });
    process.exit(1);
  }
};

const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
