import type { FastifyInstance } from 'fastify';
import { logger } from '@trayloop/utils';
import crypto from 'crypto';

export function registerRequestLogger(app: FastifyInstance) {
  // Assign request ID and start timer
  app.addHook('onRequest', async (request) => {
    (request as any).requestId = request.headers['x-request-id'] as string ?? crypto.randomUUID();
    (request as any).startTime = Date.now();
  });

  // Log after response is sent
  app.addHook('onResponse', async (request, reply) => {
    const durationMs = Date.now() - ((request as any).startTime ?? Date.now());
    const requestId = (request as any).requestId;

    logger.info('request completed', {
      requestId,
      method: request.method,
      path: request.url,
      statusCode: reply.statusCode.toString(),
      durationMs,
    });
  });

  // Log errors with request context
  app.addHook('onError', async (request, _reply, error) => {
    const requestId = (request as any).requestId;

    logger.error('request error', {
      requestId,
      method: request.method,
      path: request.url,
      error: error.message,
    });
  });
}
