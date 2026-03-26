import { Worker } from 'bullmq';
import type IORedis from 'ioredis';
import { logger } from '@trayloop/utils';

export function orderWorker(connection: IORedis) {
  return new Worker(
    'order-processing',
    async (job) => {
      const { orderId, action } = job.data;
      logger.info('Processing order job', { orderId, action, jobId: job.id });
      // TODO: Handle inventory updates, fulfillment, etc.
    },
    { connection },
  );
}
