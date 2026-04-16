import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
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
    const result = await service.create(request.ctx.user.id, request.validatedBody as z.infer<typeof createOrganizationSchema>);
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

  // Canonical storefront link and active location context for merchant UI
  app.get('/current/storefront-context', { preHandler: [requireAuth, requireTenant] }, async (request) => {
    const context = await service.getStorefrontContext(request.ctx.tenant!.organizationId);
    return { data: context };
  });

  // Combined merchant onboarding state for TrayLoop-owned setup flows
  app.get('/current/onboarding-status', { preHandler: [requireAuth, requireTenant] }, async (request) => {
    const context = await service.getMerchantOnboardingStatus(request.ctx.tenant!.organizationId);
    return { data: context };
  });

  // Update current organization (requires owner/admin)
  app.patch('/current', { preHandler: [requireAuth, requireTenant, requireOrgAdmin, validateBody(updateOrganizationSchema)] }, async (request, reply) => {
    const result = await service.update(request.ctx.tenant!.organizationId, request.validatedBody as z.infer<typeof updateOrganizationSchema>);
    return reply.send({ data: result });
  });

  // --- Stripe Connect ---

  // Get the persisted payment setup status.
  app.get('/current/payment-status', { preHandler: [requireAuth, requireTenant] }, async (request) => {
    try {
      const status = await getConnectStatus(request.ctx.tenant!.organizationId);
      return { data: status };
    } catch {
      return {
        data: {
          stripeAccountId: null,
          chargesEnabled: false,
          payoutsEnabled: false,
          detailsSubmitted: false,
          onboardingComplete: false,
          status: 'not_started',
          disabledReason: null,
          requirementsCurrentlyDue: [],
          requirementsPastDue: [],
          requirementsEventuallyDue: [],
        },
      };
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
    if (!process.env.MERCHANT_URL) {
      console.warn('[stripe] MERCHANT_URL not configured — using localhost fallback');
    }
    const returnUrl = body?.returnUrl || process.env.MERCHANT_URL || 'http://localhost:3003/settings';
    const refreshUrl = body?.refreshUrl || returnUrl;
    const result = await createOnboardingLink(
      request.ctx.tenant!.organizationId,
      `${returnUrl}?stripe=complete`,
      `${refreshUrl}?stripe=refresh`,
    );
    return reply.status(201).send({ data: result });
  });
}
