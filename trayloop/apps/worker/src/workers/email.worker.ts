import { Worker } from 'bullmq';
import type IORedis from 'ioredis';
import { logger } from '@trayloop/utils';

export function emailWorker(connection: IORedis) {
  return new Worker(
    'email',
    async (job) => {
      const { to, subject, body } = job.data;
      logger.info('Processing email job', { to, subject, jobId: job.id });
      // TODO: Integrate with email provider (SES, SendGrid, etc.)
    },
    { connection },
  );
}
