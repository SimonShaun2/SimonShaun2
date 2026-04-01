const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface MerchantStorefrontContext {
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  storefrontUrl: string;
  locations: Array<{
    id: string;
    name: string;
    city: string;
    state: string;
    isDefault: boolean;
    storefrontUrl: string;
  }>;
  defaultLocationId: string | null;
  defaultLocationName: string | null;
}

export interface MerchantBillingSubscription {
  organizationId: string;
  organizationName: string;
  planName: string;
  priceCents: number;
  interval: string;
  state: 'not_started' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  canCheckout: boolean;
  canManage: boolean;
  trialDaysRemaining: number | null;
  subscription: null | {
    id: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string | null;
    stripePriceId: string | null;
    status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
    trialStart: string | null;
    trialEnd: string | null;
    currentPeriodStart: string | null;
    currentPeriodEnd: string | null;
    canceledAt: string | null;
    createdAt: string | null;
    updatedAt: string | null;
  };
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> ?? {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const orgId = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;
  if (orgId) headers['x-organization-id'] = orgId;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? 'Request failed');
  return json;
}

export async function fetchStorefrontContext(): Promise<MerchantStorefrontContext> {
  const response = await apiFetch('/api/organizations/current/storefront-context');
  return response.data;
}

export async function fetchBillingSubscription(): Promise<MerchantBillingSubscription> {
  const response = await apiFetch('/api/billing/subscription');
  return response.data;
}

export async function createBillingCheckout(input: { successUrl?: string; cancelUrl?: string } = {}) {
  const response = await apiFetch('/api/billing/checkout', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data as { url: string; sessionId: string };
}

export async function createBillingPortal(input: { returnUrl?: string } = {}) {
  const response = await apiFetch('/api/billing/portal', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data as { url: string };
}
