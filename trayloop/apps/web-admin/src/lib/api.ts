import { clearAdminSession, ensureAdminSession } from './session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface AdminRevenueOrganization {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  subscriptionStatus: string | null;
  totalRevenueCents: number;
  platformFeeRevenueCents: number;
  orderCount: number;
  avgOrderValueCents: number;
  repeatCustomerCount: number;
  totalCustomerCount: number;
  lastOrderAt: string | null;
  health: 'healthy' | 'at_risk' | 'dormant' | 'new';
}

export interface AdminRevenueIntelligence {
  range: '7d' | '30d' | 'mtd' | 'prev_month';
  rangeLabel: string;
  summary: {
    totalRevenueCents: number;
    platformFeeRevenueCents: number;
    customerPaidCents: number;
    repeatRevenueCents: number;
    newRevenueCents: number;
    repeatRevenueSharePercent: number;
    repeatOrderRatePercent: number;
    avgOrderValueCents: number;
    orderCount: number;
    repeatCustomerCount: number;
    totalCustomerCount: number;
    depositConversionRatePercent: number;
    dormantRevenueCents: number;
    topCustomerConcentration: {
      top1Percent: number;
      top3Percent: number;
      top5Percent: number;
    };
    upsellRevenueCents: number;
    upsellAttachRatePercent: number;
    activeOrganizations: number;
    organizationsWithRevenue: number;
    orgHealthCounts: {
      healthy: number;
      at_risk: number;
      dormant: number;
      new: number;
    };
  };
  insights: Array<{ id: string; text: string }>;
  recommendations: Array<{ id: string; title: string; description: string; href: string; cta: string }>;
  opportunities: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    estimatedRevenueCents: number;
    action: { label: string; href: string };
  }>;
  trends: Array<{
    date: string;
    totalRevenueCents: number;
    repeatRevenueCents: number;
    newRevenueCents: number;
    orderCount: number;
    avgOrderValueCents: number;
  }>;
  organizations: AdminRevenueOrganization[];
  topCustomers: Array<{
    customerId: string;
    name: string;
    email: string;
    company: string | null;
    orderCount: number;
    totalRevenueCents: number;
    revenueInRangeCents: number;
    avgOrderValueCents: number;
    lastOrderAt: string;
    daysSinceLastOrder: number;
    segment: 'healthy' | 'at_risk' | 'dormant' | 'growth_opportunity';
    score: number;
  }>;
}

export interface AdminAutomationOrganization {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  activeRules: number;
  autopilotRules: number;
  pendingApprovalRuns: number;
  sentRuns: number;
  failedRuns: number;
  revenueInfluencedCents: number;
  lastRunAt: string | null;
}

export interface AdminAutomationIntelligence {
  summary: {
    merchantsUsingAutomation: number;
    autopilotMerchants: number;
    activeRules: number;
    pendingApprovalRuns: number;
    sentRuns: number;
    failedRuns: number;
    revenueInfluencedCents: number;
  };
  organizations: AdminAutomationOrganization[];
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  await ensureAdminSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-trayloop-session-scope': 'admin',
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });

  if (res.status === 401 || res.status === 403) {
    if (typeof window !== 'undefined') {
      clearAdminSession();
      window.location.href = '/login';
    }
    throw new Error(res.status === 403 ? 'Admin access required' : 'Unauthorized');
  }

  const json = await res.json();
  if (!res.ok) throw new Error(json.error?.message ?? 'Request failed');
  return json;
}

export async function fetchAdminRevenueIntelligence(
  range: '7d' | '30d' | 'mtd' | 'prev_month' = '30d',
): Promise<AdminRevenueIntelligence> {
  const params = new URLSearchParams({ range });
  const response = await apiFetch(`/api/admin/revenue-intelligence?${params.toString()}`);
  return response.data;
}

export async function fetchAdminAutomationIntelligence(): Promise<AdminAutomationIntelligence> {
  const response = await apiFetch('/api/admin/automation-intelligence');
  return response.data;
}
