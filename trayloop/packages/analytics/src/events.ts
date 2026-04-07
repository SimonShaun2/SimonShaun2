'use client';

import posthog from 'posthog-js';

type EventProperties = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function trackEvent(name: string, properties: EventProperties = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', name, properties);
  }

  if ((posthog as any).__loaded) {
    posthog.capture(name, properties);
  }
}

export function identifyAnalytics(distinctId: string, properties: EventProperties = {}) {
  if (!distinctId) {
    return;
  }

  if ((posthog as any).__loaded) {
    posthog.identify(distinctId, properties);
  }

  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('set', 'user_properties', properties);
    window.gtag('set', { user_id: distinctId });
  }
}

export function resetAnalytics() {
  if ((posthog as any).__loaded) {
    posthog.reset();
  }
}
