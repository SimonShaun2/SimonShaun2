'use client';

import { useEffect, useMemo, useState } from 'react';

interface LaunchReviewState {
  storefrontReviewed: boolean;
  readyToShare: boolean;
}

const DEFAULT_STATE: LaunchReviewState = {
  storefrontReviewed: false,
  readyToShare: false,
};

function storageKey(orgId: string) {
  return `trayloop-launch-review:${orgId}`;
}

export function useLaunchReview(orgId: string | null | undefined) {
  const [state, setState] = useState<LaunchReviewState>(DEFAULT_STATE);

  useEffect(() => {
    if (typeof window === 'undefined' || !orgId) {
      setState(DEFAULT_STATE);
      return;
    }

    try {
      const raw = window.localStorage.getItem(storageKey(orgId));
      if (!raw) {
        setState(DEFAULT_STATE);
        return;
      }

      const parsed = JSON.parse(raw) as Partial<LaunchReviewState>;
      setState({
        storefrontReviewed: Boolean(parsed.storefrontReviewed),
        readyToShare: Boolean(parsed.readyToShare),
      });
    } catch {
      setState(DEFAULT_STATE);
    }
  }, [orgId]);

  function update(next: Partial<LaunchReviewState>) {
    if (!orgId || typeof window === 'undefined') {
      return;
    }

    setState((current) => {
      const merged = { ...current, ...next };
      window.localStorage.setItem(storageKey(orgId), JSON.stringify(merged));
      return merged;
    });
  }

  const approved = useMemo(() => state.storefrontReviewed && state.readyToShare, [state]);

  return {
    state,
    approved,
    setStorefrontReviewed: (value: boolean) => update({ storefrontReviewed: value }),
    setReadyToShare: (value: boolean) => update({ readyToShare: value }),
  };
}
