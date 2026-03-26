import { logger } from '@trayloop/utils';
import { createRedisConnection } from './config/index.js';
import { emailWorker } from './workers/email.worker.js';
import { orderWorker } from './workers/order-processing.worker.js';
import { notificationWorker } from './workers/notification.worker.js';

async function start() {
  const connection = createRedisConnection();

  const workers = [
    emailWorker(connection),
    orderWorker(connection),
    notificationWorker(connection),
  ];

  logger.info(`Worker started with ${workers.length} job processors`);

  const shutdown = async () => {
    logger.info('Worker shutting down...');
    await Promise.all(workers.map((w) => w.close()));
    await connection.quit();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

start();
