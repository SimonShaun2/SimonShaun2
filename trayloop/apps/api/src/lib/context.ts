export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export interface TenantContext {
  organizationId: string;
  memberRole: string;
}

export interface RequestContext {
  user: AuthUser;
  tenant?: TenantContext;
}

declare module 'fastify' {
  interface FastifyRequest {
    ctx: RequestContext;
  }
}
