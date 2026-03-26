import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
import { AppError } from '../errors.js';
import { logger } from '@trayloop/utils';

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      statusCode: error.statusCode,
      message: error.message,
      code: error.code,
    });
  }

  logger.error('Unhandled error', { error: error.message, stack: error.stack });

  return reply.status(500).send({
    statusCode: 500,
    message: 'Internal server error',
    code: 'INTERNAL_ERROR',
  });
}
