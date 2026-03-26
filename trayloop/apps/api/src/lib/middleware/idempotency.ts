import type { FastifyRequest, FastifyReply } from 'fastify';
import { db } from '@trayloop/database';
import { idempotencyKeys } from '@trayloop/database';
import { eq, and, gt } from 'drizzle-orm';

const IDEMPOTENCY_WINDOW_HOURS = 24;

/**
 * Idempotency middleware for POST endpoints.
 * Checks the Idempotency-Key header. If a matching key exists for the
 * same route + tenant within the validity window, returns the cached response.
 * Otherwise, allows the request through and caches the response after.
 */
export function requireIdempotency() {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const key = request.headers['idempotency-key'] as string | undefined;
    if (!key) return; // No key = no idempotency enforcement

    const orgId = request.ctx?.tenant?.organizationId;
    if (!orgId) return; // Pre-tenant routes skip

    const route = `${request.method} ${request.routeOptions.url}`;

    // Check for existing record
    const [existing] = await db
      .select()
      .from(idempotencyKeys)
      .where(
        and(
          eq(idempotencyKeys.key, key),
          eq(idempotencyKeys.route, route),
          eq(idempotencyKeys.organizationId, orgId),
          gt(idempotencyKeys.expiresAt, new Date()),
        ),
      )
      .limit(1);

    if (existing) {
      reply.header('x-idempotent-replay', 'true');
      return reply
        .status(parseInt(existing.statusCode, 10))
        .send(existing.responseBody);
    }

    // Store key info on request for post-response caching
    (request as any).idempotencyMeta = { key, route, orgId };
  };
}

/**
 * Register the onSend hook that caches successful responses for idempotent requests.
 * Call this once during app setup.
 */
export function registerIdempotencyHook(app: { addHook: Function }) {
  app.addHook('onSend', async (request: FastifyRequest, reply: FastifyReply, payload: string) => {
    const meta = (request as any).idempotencyMeta;
    if (!meta) return payload;

    // Only cache successful responses (2xx)
    if (reply.statusCode < 200 || reply.statusCode >= 300) return payload;

    const expiresAt = new Date(Date.now() + IDEMPOTENCY_WINDOW_HOURS * 60 * 60 * 1000);

    try {
      await db.insert(idempotencyKeys).values({
        key: meta.key,
        route: meta.route,
        organizationId: meta.orgId,
        statusCode: reply.statusCode.toString(),
        responseBody: JSON.parse(payload),
        expiresAt,
      });
    } catch {
      // Unique constraint race — another request cached first, that's fine
    }

    return payload;
  });
}
