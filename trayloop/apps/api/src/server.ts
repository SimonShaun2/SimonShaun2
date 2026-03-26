import { buildApp } from './index.js';
import { logger } from '@trayloop/utils';

const start = async () => {
  const app = await buildApp();
  const port = parseInt(process.env.API_PORT || '3001', 10);

  try {
    await app.listen({ port, host: '0.0.0.0' });
    logger.info(`API server running on port ${port}`);
  } catch (err) {
    app.log.error(err);
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
