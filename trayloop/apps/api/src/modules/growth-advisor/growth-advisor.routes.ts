import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import { requireAuth } from '../../lib/middleware/auth.js';
import { requireTenant } from '../../lib/middleware/tenant.js';
import { validateBody } from '../../lib/middleware/validate.js';
import { ForbiddenError } from '../../lib/errors.js';
import { isGrowthAdvisorEnabledForOrganization } from '../../lib/organization-features.js';
import { analyzeGrowthAdvisorSchema } from './growth-advisor.schema.js';
import * as service from './growth-advisor.service.js';

export function registerRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);
  app.addHook('preHandler', requireTenant);

  app.post('/analyze', { preHandler: [validateBody(analyzeGrowthAdvisorSchema)] }, async (request) => {
    const organizationId = request.ctx.tenant!.organizationId;
    const growthAdvisorEnabled = await isGrowthAdvisorEnabledForOrganization(organizationId);

    if (!growthAdvisorEnabled) {
      throw new ForbiddenError('Growth Advisor is not enabled for this merchant yet. Add it during onboarding to unlock it.');
    }

    const result = await service.generateGrowthAdvisorPlan(
      organizationId,
      request.validatedBody as z.infer<typeof analyzeGrowthAdvisorSchema>,
    );

    return { data: result };
  });
}
