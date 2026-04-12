'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  fetchBillingSubscription,
  type MerchantBillingSubscription,
  type MerchantFeatureAccessState,
} from '../lib/api';
import { hasMerchantSession } from '../lib/session';
import {
  getNextPlan,
  type FeatureKey,
  type PlanKey,
} from '@trayloop/types/plan-access';
import { getFeatureUpgradeCta } from '../lib/feature-access-display';

interface PlanAccessContextValue {
  billing: MerchantBillingSubscription | null;
  loading: boolean;
  error: string;
  refresh: () => Promise<void>;
  currentPlan: PlanKey | null;
  hasFeature: (featureKey: FeatureKey) => boolean;
  getFeature: (featureKey: FeatureKey) => MerchantFeatureAccessState | null;
  getUpgradePlan: (featureKey: FeatureKey) => PlanKey | null;
}

const PlanAccessContext = createContext<PlanAccessContextValue | null>(null);

function getFallbackUpgradePlan(currentPlan: PlanKey | null) {
  return currentPlan ? getNextPlan(currentPlan) : null;
}

export function PlanAccessProvider({ children }: { children: ReactNode }) {
  const [billing, setBilling] = useState<MerchantBillingSubscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function refresh() {
    if (!hasMerchantSession()) {
      setBilling(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const next = await fetchBillingSubscription();
      setBilling(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load plan access');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<PlanAccessContextValue>(() => {
    const currentPlan = billing?.currentPlan ?? null;

    return {
      billing,
      loading,
      error,
      refresh,
      currentPlan,
      hasFeature(featureKey) {
        return Boolean(billing?.features?.byKey?.[featureKey]?.enabled);
      },
      getFeature(featureKey) {
        return billing?.features?.byKey?.[featureKey] ?? null;
      },
      getUpgradePlan(featureKey) {
        return billing?.features?.byKey?.[featureKey]?.upgradeToPlan
          ?? getFallbackUpgradePlan(currentPlan);
      },
    };
  }, [billing, loading, error]);

  return (
    <PlanAccessContext.Provider value={value}>
      {children}
    </PlanAccessContext.Provider>
  );
}

export function usePlanAccess() {
  const context = useContext(PlanAccessContext);

  if (!context) {
    throw new Error('usePlanAccess must be used within PlanAccessProvider');
  }

  return context;
}

export function useFeatureAccess(featureKey: FeatureKey) {
  const context = usePlanAccess();
  const feature = context.getFeature(featureKey);
  const upgradePlan = context.getUpgradePlan(featureKey);
  const upgradeCta = getFeatureUpgradeCta({
    upgradePlan,
  });

  return {
    loading: context.loading,
    error: context.error,
    currentPlan: context.currentPlan,
    enabled: Boolean(feature?.enabled),
    included: Boolean(feature?.included),
    feature,
    requiredPlan: feature?.requiredPlan ?? null,
    upgradePlan,
    upgradeHref: upgradeCta.href,
    upgradeLabel: upgradeCta.label,
  };
}
