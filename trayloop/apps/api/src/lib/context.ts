import type { EventBus } from './event-bus/index.js';

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  supportOrganizationId?: string;
  supportMemberRole?: string;
}

export interface TenantContext {
  organizationId: string;
  memberRole: string;
}

export interface RequestContext {
  user: AuthUser;
  tenant?: TenantContext;
}

export interface IdempotencyMeta {
  key: string;
  route: string;
  orgId: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    ctx: RequestContext;
    validatedBody: unknown;
    validatedParams: unknown;
    requestId: string;
    startTime: number;
    idempotencyMeta?: IdempotencyMeta;
  }

  interface FastifyInstance {
    eventBus: EventBus;
  }
}
