'use client';

import { useCallback, useEffect, useState } from 'react';
import { fetchOnboardingStatus, type MerchantOnboardingStatus } from './api';

export function useLaunchStatus() {
  const [data, setData] = useState<MerchantOnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    }
    setError('');

    try {
      const next = await fetchOnboardingStatus();
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load launch status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh(true);
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}
