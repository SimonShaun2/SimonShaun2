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

declare module 'fastify' {
  interface FastifyRequest {
    ctx: RequestContext;
  }
}
