import type { FastifyRequest } from 'fastify';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../errors.js';

export function validateBody<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest) => {
    try {
      (request as any).validatedBody = schema.parse(request.body);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(error.errors.map((e) => e.message).join(', '));
      }
      throw error;
    }
  };
}

export function validateParams<T>(schema: ZodSchema<T>) {
  return async (request: FastifyRequest) => {
    try {
      (request as any).validatedParams = schema.parse(request.params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(error.errors.map((e) => e.message).join(', '));
      }
      throw error;
    }
  };
}
