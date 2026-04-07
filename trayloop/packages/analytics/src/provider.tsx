'use client';

import { useEffect } from 'react';
import posthog from 'posthog-js';

let posthogInitialized = false;

interface AnalyticsProviderProps {
  appName: string;
}

export function AnalyticsProvider({ appName }: AnalyticsProviderProps) {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
    const env = process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development';

    if (!key) {
      return;
    }

    if (!posthogInitialized) {
      posthog.init(key, {
        api_host: host,
        capture_pageview: true,
        capture_pageleave: true,
        autocapture: true,
        person_profiles: 'identified_only',
        loaded(instance) {
          instance.register({
            trayloop_app: appName,
            trayloop_env: env,
          });
        },
      });
      posthogInitialized = true;
      return;
    }

    posthog.register({
      trayloop_app: appName,
      trayloop_env: env,
    });
  }, [appName]);

  return null;
}
