import { Worker } from 'bullmq';
import type IORedis from 'ioredis';
import { logger } from '@trayloop/utils';

export function notificationWorker(connection: IORedis) {
  return new Worker(
    'notification',
    async (job) => {
      const { userId, type, subject, body } = job.data;
      logger.info('Processing notification job', { userId, type, jobId: job.id });
      // TODO: Send push notification, in-app notification, etc.
    },
    { connection },
  );
}
