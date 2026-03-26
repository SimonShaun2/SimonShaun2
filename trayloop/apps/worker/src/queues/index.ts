import { Queue } from 'bullmq';
import type IORedis from 'ioredis';

export function createQueues(connection: IORedis) {
  return {
    email: new Queue('email', { connection }),
    orderProcessing: new Queue('order-processing', { connection }),
    notification: new Queue('notification', { connection }),
  };
}
