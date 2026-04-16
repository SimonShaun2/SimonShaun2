import type { FastifyInstance } from 'fastify';
import { logger } from '@trayloop/utils';
import crypto from 'crypto';

export function registerRequestLogger(app: FastifyInstance) {
  app.addHook('onRequest', async (request) => {
    request.requestId = request.headers['x-request-id'] as string ?? crypto.randomUUID();
    request.startTime = Date.now();
  });

  app.addHook('onResponse', async (request, reply) => {
    const durationMs = Date.now() - (request.startTime ?? Date.now());
    const requestId = request.requestId;

    logger.info('request completed', {
      requestId,
      method: request.method,
      path: request.url,
      statusCode: reply.statusCode.toString(),
      durationMs,
    });
  });

  app.addHook('onError', async (request, _reply, error) => {
    const requestId = request.requestId;

    logger.error('request error', {
      requestId,
      method: request.method,
      path: request.url,
      error: error.message,
    });
  });
}
