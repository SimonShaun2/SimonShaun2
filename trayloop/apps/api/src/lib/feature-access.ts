import type { FeatureKey } from '@trayloop/types';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { FeatureNotIncludedError, ForbiddenError } from './errors.js';
import { getOrganizationFeatureEntitlements } from './organization-features.js';

export async function assertOrganizationFeatureAccess(orgId: string, featureKey: FeatureKey) {
  const entitlements = await getOrganizationFeatureEntitlements(orgId);
  const feature = entitlements.byKey[featureKey];

  if (!feature?.enabled) {
    throw new FeatureNotIncludedError({
      featureKey,
      currentPlan: entitlements.currentPlan,
      requiredPlan: feature?.requiredPlan ?? null,
      upgradeToPlan: feature?.upgradeToPlan ?? null,
    });
  }

  return feature;
}

export async function assertOrganizationHasAnyFeature(orgId: string, featureKeys: FeatureKey[]) {
  const entitlements = await getOrganizationFeatureEntitlements(orgId);
  const matched = featureKeys.find((featureKey) => entitlements.byKey[featureKey]?.enabled);

  if (!matched) {
    const primaryFeature = entitlements.byKey[featureKeys[0]!] ?? null;

    throw new FeatureNotIncludedError({
      featureKey: featureKeys.join(','),
      currentPlan: entitlements.currentPlan,
      requiredPlan: primaryFeature?.requiredPlan ?? null,
      upgradeToPlan: primaryFeature?.upgradeToPlan ?? null,
    });
  }

  return entitlements.byKey[matched]!;
}

export function requireFeature(featureKey: FeatureKey) {
  return async function featureAccessPreHandler(request: FastifyRequest, _reply: FastifyReply) {
    const organizationId = request.ctx?.tenant?.organizationId;

    if (!organizationId) {
      throw new ForbiddenError('Tenant context required before checking feature access');
    }

    await assertOrganizationFeatureAccess(organizationId, featureKey);
  };
}

export function requireAnyFeature(featureKeys: FeatureKey[]) {
  return async function featureAccessPreHandler(request: FastifyRequest, _reply: FastifyReply) {
    const organizationId = request.ctx?.tenant?.organizationId;

    if (!organizationId) {
      throw new ForbiddenError('Tenant context required before checking feature access');
    }

    await assertOrganizationHasAnyFeature(organizationId, featureKeys);
  };
}
