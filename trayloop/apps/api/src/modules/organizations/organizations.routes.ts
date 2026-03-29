import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant, requireOrgAdmin } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { createOrganizationSchema, updateOrganizationSchema } from './organizations.schema.js';
import * as service from './organizations.service.js';
import { getConnectStatus, createConnectAccount, syncConnectStatus, createOnboardingLink } from '../../lib/stripe-connect.js';

export function registerRoutes(app: FastifyInstance) {
  // List organizations the authenticated user belongs to
  app.get('/me', { preHandler: [requireAuth] }, async (request) => {
    const orgs = await service.listByUser(request.ctx.user.id);
    return { data: orgs };
  });

  // Create a new organization (authenticated user becomes owner)
  app.post('/', { preHandler: [requireAuth, validateBody(createOrganizationSchema)] }, async (request, reply) => {
    const result = await service.create(request.ctx.user.id, (request as any).validatedBody);
    return reply.status(201).send({ data: result });
  });

  // Get current organization (from tenant context)
  app.get('/current', { preHandler: [requireAuth, requireTenant] }, async (request) => {
    const org = await service.getById(request.ctx.tenant!.organizationId);
    return { data: org };
  });

  // Get setup status for onboarding checklist
  app.get('/current/setup-status', { preHandler: [requireAuth, requireTenant] }, async (request) => {
    const status = await service.getSetupStatus(request.ctx.tenant!.organizationId);
    return { data: status };
  });

  // Update current organization (requires owner/admin)
  app.patch('/current', { preHandler: [requireAuth, requireTenant, requireOrgAdmin, validateBody(updateOrganizationSchema)] }, async (request, reply) => {
    const result = await service.update(request.ctx.tenant!.organizationId, (request as any).validatedBody);
    return reply.send({ data: result });
  });

  // --- Stripe Connect ---

  // Get payment setup status — guaranteed 200, never throws
  app.get('/current/payment-status', { preHandler: [requireAuth, requireTenant] }, async (request) => {
    const fallback = {
      data: {
        stripeAccountId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        onboardingComplete: false,
      },
    };

    try {
      const orgId = request.ctx.tenant!.organizationId;

      // Inline query — only references stripe_account_id (safe column)
      const { db } = await import('@trayloop/database');
      const { organizations: orgs } = await import('@trayloop/database');
      const { eq } = await import('drizzle-orm');

      const [org] = await db
        .select({ stripeAccountId: orgs.stripeAccountId })
        .from(orgs)
        .where(eq(orgs.id, orgId))
        .limit(1);

      if (!org || !org.stripeAccountId) {
        return fallback;
      }

      return {
        data: {
          stripeAccountId: org.stripeAccountId,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          onboardingComplete: false,
        },
      };
    } catch {
      return fallback;
    }
  });

  // Create or retrieve Stripe Connect account (owner/admin only)
  app.post('/current/payment-setup', { preHandler: [requireAuth, requireTenant, requireOrgAdmin] }, async (request, reply) => {
    const result = await createConnectAccount(request.ctx.tenant!.organizationId);
    return reply.status(201).send({ data: result });
  });

  // Sync Stripe Connect status from Stripe (owner/admin only)
  app.post('/current/payment-status/sync', { preHandler: [requireAuth, requireTenant, requireOrgAdmin] }, async (request) => {
    const status = await getConnectStatus(request.ctx.tenant!.organizationId);
    if (!status.stripeAccountId) {
      return { data: status };
    }
    const synced = await syncConnectStatus(request.ctx.tenant!.organizationId, status.stripeAccountId);
    return { data: synced };
  });

  // Create Stripe-hosted onboarding link (owner/admin only)
  app.post('/current/payment-onboarding-link', { preHandler: [requireAuth, requireTenant, requireOrgAdmin] }, async (request, reply) => {
    const body = request.body as { returnUrl?: string; refreshUrl?: string } | undefined;
    const baseUrl = body?.returnUrl || process.env.MERCHANT_URL || 'http://localhost:3003/settings';
    const result = await createOnboardingLink(
      request.ctx.tenant!.organizationId,
      `${baseUrl}?stripe=complete`,
      `${baseUrl}?stripe=refresh`,
    );
    return reply.status(201).send({ data: result });
  });
}
