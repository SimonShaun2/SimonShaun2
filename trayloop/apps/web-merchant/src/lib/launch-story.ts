'use client';

import type { MerchantOnboardingStatus } from './api';

export interface LaunchReadinessRow {
  label: string;
  ready: boolean;
  href: string;
}

export function getLaunchReadinessRows(data: MerchantOnboardingStatus): LaunchReadinessRow[] {
  return [
    { label: 'Billing', ready: data.readiness.billingReady, href: '/billing' },
    { label: 'Payouts', ready: data.readiness.payoutsReady, href: '/launch' },
    { label: 'Offerings', ready: data.readiness.offeringsReady, href: '/catalog' },
    { label: 'Operations', ready: data.readiness.locationReady, href: '/settings#operations' },
    { label: 'Storefront', ready: data.readiness.storefrontReady, href: '/storefront/customize' },
  ];
}

export function getPrimaryLaunchBlocker(data: MerchantOnboardingStatus) {
  return data.launch.blockers[0] ?? null;
}

export function getLaunchRailSummary(data: MerchantOnboardingStatus, contextLabel?: string) {
  if (data.launch.blockers.length === 0) {
    return 'This workspace is launch-ready. Review the live storefront, place a final test order, and start sharing it.';
  }

  if (contextLabel) {
    return `${contextLabel} The blocker story and next action below are coming from the same launch source used across the merchant app.`;
  }

  return 'One shared view of what is blocking launch, what is already ready, and what the operator should do next.';
}

export function getLaunchHealthLine(data: MerchantOnboardingStatus) {
  const blocker = getPrimaryLaunchBlocker(data);
  return blocker ?? 'Launch systems are aligned. Finish the final review and share the storefront.';
}
