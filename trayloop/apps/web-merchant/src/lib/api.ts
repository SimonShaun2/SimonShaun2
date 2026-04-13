import type {
  SharedEntitlementKey,
  BillingCycleKey,
  FeatureKey,
  PlanKey,
} from '@trayloop/types/plan-access';
import { clearMerchantSession, ensureMerchantSession } from './session';

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

export interface MerchantOrganization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  displayFont: 'bricolage' | 'fraunces' | 'inter' | null;
}

export interface MerchantPaymentStatus {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingComplete: boolean;
  status: 'not_started' | 'in_progress' | 'action_required' | 'ready';
  disabledReason: string | null;
  requirementsCurrentlyDue: string[];
  requirementsPastDue: string[];
  requirementsEventuallyDue: string[];
}

export interface MerchantBillingSubscription {
  organizationId: string;
  organizationName: string;
  currentPlan: PlanKey;
  billingCycle: BillingCycleKey;
  planName: string;
  priceCents: number;
  interval: string;
  state: 'not_started' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  canCheckout: boolean;
  canManage: boolean;
  trialDaysRemaining: number | null;
  features: MerchantFeatureEntitlements;
  subscription: null | {
    id: string;
    stripeCustomerId: string;
    stripeSubscriptionId: string | null;
    stripePriceId: string | null;
    plan: PlanKey;
    billingCycle: BillingCycleKey;
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

export interface MerchantFeatureAccessState {
  key: FeatureKey | 'growth_advisor';
  included: boolean;
  enabled: boolean;
  source: string | null;
  requiredPlan: PlanKey | null;
  upgradeToPlan: PlanKey | null;
  stripePriceId: string | null;
  stripeSubscriptionItemId: string | null;
  available: boolean;
  priceCents: number | null;
  interval: string | null;
}

export interface MerchantFeatureEntitlements {
  currentPlan: PlanKey;
  billingCycle: BillingCycleKey;
  includedFeatures: readonly FeatureKey[];
  byKey: Record<FeatureKey, MerchantFeatureAccessState>;
  growthAdvisor: MerchantFeatureAccessState;
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(message: string, input: { code?: string; status: number; details?: Record<string, unknown> }) {
    super(message);
    this.name = 'ApiError';
    this.code = input.code ?? 'REQUEST_FAILED';
    this.status = input.status;
    this.details = input.details;
  }
}

export function isFeatureNotIncludedError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.code === 'FEATURE_NOT_INCLUDED';
}

export interface MerchantOnboardingStatus {
  organization: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  stripeMode: 'test' | 'live' | 'disabled';
  setup: {
    isComplete: boolean;
    slug: string;
    completedSteps: number;
    totalSteps: number;
    steps: {
      offering: { done: boolean; label: string; count?: number };
      location: { done: boolean; label: string; count?: number };
      payments: { done: boolean; label: string; count?: number };
    };
  };
  paymentStatus: MerchantPaymentStatus;
  billing: MerchantBillingSubscription;
  storefront: MerchantStorefrontContext;
  readiness: {
    offeringsReady: boolean;
    locationReady: boolean;
    payoutsReady: boolean;
    billingReady: boolean;
    storefrontReady: boolean;
    canAcceptDeposits: boolean;
    canLaunchStorefront: boolean;
  };
  launch: {
    completed: number;
    total: number;
    progressPercent: number;
    blockers: string[];
    nextAction: {
      key: string;
      title: string;
      description: string;
      href: string;
      cta: string;
    };
    liveStorefrontUrl: string | null;
  };
}

export interface MerchantSupportSession {
  organization: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
  };
}

export interface GrowthAdvisorSnapshot {
  organizationName: string;
  cuisineHint: string | null;
  website: string | null;
  activeLocations: number;
  activePackages: number;
  activeAddOns: number;
  averagePackagePriceCents: number | null;
  priceRange: {
    lowCents: number | null;
    highCents: number | null;
  };
  leadTimeDays: number | null;
  minimumOrderCents: number | null;
  depositRequired: boolean | null;
  serviceTypes: string[];
  completedOrders: number;
  recentOrders30d: number;
  averageOrderValueCents: number | null;
  packageNames: string[];
  payoutsReady: boolean;
}

export interface GrowthAdvisorPlan {
  businessStage: string;
  stageSummary: string;
  growthInsight: string;
  biggestOpportunity: string;
  recommendedOffer: {
    name: string;
    description: string;
    priceCents: number;
    minimumGuests: number;
    serviceStyle: string;
  };
  pricingGuidance: {
    minimumOrderCents: number;
    deliveryFeeCents: number;
    depositPolicy: string;
    notes: string;
  };
  channelStrategy: string[];
  nextSteps: string[];
  thirtyDayGoal: string;
}

export interface GrowthAdvisorResult {
  snapshot: GrowthAdvisorSnapshot;
  analysis: GrowthAdvisorPlan;
}

export interface AiSalesReactivationSummary {
  repeatCustomerCount: number;
  allCustomers: number;
  allRevenueCents: number;
  segments: {
    frequent: { count: number; potentialRevenueCents: number };
    at_risk: { count: number; potentialRevenueCents: number };
    dormant: { count: number; potentialRevenueCents: number };
  };
  actionableTargets: number;
  actionablePotentialRevenueCents: number;
}

export interface AiSalesTarget {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  orderCount: number;
  averageOrderValueCents: number;
  totalRevenueCents?: number;
  lastOrderAt?: string;
  daysSinceLastOrder: number;
  segment?: 'frequent' | 'at_risk' | 'dormant';
}

export interface AiSalesReorderOpportunity {
  customerId: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  orderCount: number;
  averageOrderValueCents: number;
  lastOrderAt: string;
  daysSinceLastOrder: number;
  cadenceDays: number;
  expectedNextOrderAt: string;
  daysUntilExpectedOrder: number;
  overdueDays: number;
  confidence: 'high' | 'medium';
  segment: 'frequent' | 'at_risk' | 'dormant';
}

export interface AiSalesCampaign {
  id: string;
  segment: 'frequent' | 'at_risk' | 'dormant';
  channel: 'email' | 'sms_copy';
  status: 'draft' | 'sent' | 'copied';
  generatedSubject: string | null;
  generatedEmailBody?: string | null;
  generatedSmsBody?: string | null;
  selectedTargetCount: number;
  estimatedRevenueCents: number;
  sentAt: string | null;
  createdAt: string;
  recipientSummary: {
    pending: number;
    sent: number;
    copied: number;
    failed: number;
  };
}

export interface AiSalesGenerateResult {
  campaignKind: 'reactivation' | 'reorder_reminder';
  segment: 'frequent' | 'at_risk' | 'dormant';
  channelIntent: 'email' | 'sms_copy';
  targetCount: number;
  estimatedRevenueCents: number;
  generated: {
    subject: string;
    emailBody: string;
    smsBody: string;
    timingGuidance: {
      recommendedSendWindow: string;
      tone: string;
      rationale: string;
    };
  };
  targets: AiSalesTarget[];
}

export interface RevenueSummaryBlock {
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
}

export interface RevenueInsightItem {
  id: string;
  text: string;
}

export interface RevenueRecommendation {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
}

export interface RevenueOpportunity {
  id: string;
  type: string;
  title: string;
  description: string;
  estimatedRevenueCents: number;
  action: {
    label: string;
    href: string;
  };
}

export interface RevenueCustomerHealth {
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
}

export interface RevenueTrendPoint {
  date: string;
  totalRevenueCents: number;
  repeatRevenueCents: number;
  newRevenueCents: number;
  orderCount: number;
  avgOrderValueCents: number;
}

export interface RevenueUsageSummary {
  shown: number;
  clicked: number;
  actioned: number;
}

export interface MerchantRevenueIntelligenceSummary {
  range: '7d' | '30d' | 'mtd' | 'prev_month';
  rangeLabel: string;
  summary: RevenueSummaryBlock;
  insights: RevenueInsightItem[];
  recommendations: RevenueRecommendation[];
  opportunities: RevenueOpportunity[];
  topCustomers: RevenueCustomerHealth[];
  customerHealth: RevenueCustomerHealth[];
  trends: RevenueTrendPoint[];
  usage: RevenueUsageSummary;
}

export interface MerchantRevenueIntelligenceReport extends MerchantRevenueIntelligenceSummary {
  opportunities: RevenueOpportunity[];
}

export interface AutomationRule {
  id: string;
  name: string;
  ruleType: 'reactivation' | 'reorder_reminder';
  segment: 'at_risk' | 'dormant' | 'frequent';
  status: 'draft' | 'active' | 'paused' | 'disabled';
  approvalMode: 'approval_required' | 'autopilot';
  emailEnabled: boolean;
  smsMode: 'disabled' | 'copy_only';
  timingWindowDays: number;
  throttleDays: number;
  maxTargets: number;
  goalNotes: string | null;
  toneNotes: string | null;
  lastEvaluatedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AutomationRecipientSummary {
  pending: number;
  sent: number;
  copied: number;
  skipped: number;
  failed: number;
}

export interface AutomationRunRecipient {
  customerId: string;
  name: string;
  email: string;
  company: string | null;
  deliveryStatus: string;
  channel: string;
}

export interface AutomationRun {
  id: string;
  ruleId: string;
  ruleName: string;
  ruleType: 'reactivation' | 'reorder_reminder';
  segment: 'at_risk' | 'dormant' | 'frequent';
  executionMode: 'scheduled' | 'autopilot';
  status: 'pending_approval' | 'approved' | 'queued' | 'sent' | 'copied' | 'skipped' | 'failed' | 'canceled';
  reasonSummary: string;
  generatedSubject: string | null;
  generatedEmailBody: string | null;
  generatedSmsBody: string | null;
  selectedTargetCount: number;
  estimatedRevenueCents: number;
  scheduledFor: string;
  reviewedAt: string | null;
  sentAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
  recipientSummary: AutomationRecipientSummary;
  recipients: AutomationRunRecipient[];
}

export interface AutomationOverview {
  summary: {
    activeRules: number;
    autopilotRules: number;
    pendingApprovalRuns: number;
    scheduledRuns: number;
    sentRuns: number;
    failedRuns: number;
    skippedRuns: number;
    revenueInfluencedCents: number;
    approvalRatePercent: number;
  };
  rules: AutomationRule[];
  queue: AutomationRun[];
  recentRuns: AutomationRun[];
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  await ensureMerchantSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-trayloop-session-scope': 'merchant',
    ...(options.headers as Record<string, string> ?? {}),
  };

  const orgId = typeof window !== 'undefined' ? localStorage.getItem('orgId') : null;
  if (orgId) headers['x-organization-id'] = orgId;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers, credentials: 'include' });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      // Only redirect once — avoid cascade where concurrent requests all
      // nuke the token and trigger multiple redirects.
      const alreadyRedirecting = (window as any).__trayloop_auth_redirect;
      if (!alreadyRedirecting) {
        (window as any).__trayloop_auth_redirect = true;
        clearMerchantSession();
        window.location.href = '/login';
      }
    }
    throw new Error('Unauthorized');
  }

  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json.error?.message ?? 'Request failed', {
      code: json.error?.code,
      status: res.status,
      details: json.error?.details,
    });
  }
  return json;
}

export async function fetchStorefrontContext(): Promise<MerchantStorefrontContext> {
  const response = await apiFetch('/api/organizations/current/storefront-context');
  return response.data;
}

export async function fetchCurrentOrganization(): Promise<MerchantOrganization> {
  const response = await apiFetch('/api/organizations/current');
  return response.data;
}

export async function updateCurrentOrganization(input: Partial<Pick<MerchantOrganization, 'name' | 'description' | 'website' | 'phone' | 'logoUrl' | 'brandColor' | 'displayFont'>>): Promise<MerchantOrganization> {
  const response = await apiFetch('/api/organizations/current', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function fetchBillingSubscription(): Promise<MerchantBillingSubscription> {
  const response = await apiFetch('/api/billing/subscription');
  return response.data;
}

export async function fetchPaymentStatus(): Promise<MerchantPaymentStatus> {
  const response = await apiFetch('/api/organizations/current/payment-status');
  return response.data;
}

export async function syncPaymentStatus(): Promise<MerchantPaymentStatus> {
  const response = await apiFetch('/api/organizations/current/payment-status/sync', {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return response.data;
}

export async function createPaymentOnboardingLink(input: { returnUrl?: string; refreshUrl?: string } = {}) {
  const response = await apiFetch('/api/organizations/current/payment-onboarding-link', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data as { url: string; status: MerchantPaymentStatus };
}

export async function fetchOnboardingStatus(): Promise<MerchantOnboardingStatus> {
  const response = await apiFetch('/api/organizations/current/onboarding-status');
  return response.data;
}

export async function createSupportSession(orgId: string): Promise<MerchantSupportSession> {
  const response = await fetch(`${API_URL}/api/admin/organizations/${orgId}/support-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-trayloop-session-scope': 'admin',
    },
    credentials: 'include',
    body: JSON.stringify({}),
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(json?.error?.message ?? 'Unable to access merchant workspace');
  }

  return json.data;
}

export async function generateGrowthAdvisor(input: { notes?: string } = {}): Promise<GrowthAdvisorResult> {
  const response = await apiFetch('/api/growth-advisor/analyze', {
    method: 'POST',
    body: JSON.stringify(input),
  });

  return response.data;
}

export async function createBillingCheckout(input: {
  successUrl?: string;
  cancelUrl?: string;
  includeGrowthAdvisor?: boolean;
  addOns?: SharedEntitlementKey[];
  plan?: PlanKey;
} = {}) {
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

export async function fetchAiSalesSummary(): Promise<AiSalesReactivationSummary> {
  const response = await apiFetch('/api/ai-sales/reactivation-summary');
  return response.data;
}

export async function fetchAiSalesTargets(input: {
  segment: 'all' | 'frequent' | 'at_risk' | 'dormant';
  page?: number;
  pageSize?: number;
}): Promise<{ data: AiSalesTarget[]; meta: PaginationMeta }> {
  const params = new URLSearchParams({
    segment: input.segment,
    page: String(input.page ?? 1),
    pageSize: String(input.pageSize ?? 100),
  });
  const response = await apiFetch(`/api/ai-sales/reactivation-targets?${params.toString()}`);
  return { data: response.data, meta: response.meta };
}

export async function generateAiSalesMessage(input: {
  segment: 'all' | 'frequent' | 'at_risk' | 'dormant';
  selectedCustomerIds: string[];
  channelIntent?: 'email' | 'sms_copy';
  campaignKind?: 'reactivation' | 'reorder_reminder';
  goalNotes?: string;
  toneNotes?: string;
}): Promise<AiSalesGenerateResult> {
  const response = await apiFetch('/api/ai-sales/generate-message', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function createAiSalesCampaign(input: {
  segment: 'all' | 'frequent' | 'at_risk' | 'dormant';
  channel: 'email' | 'sms_copy';
  status: 'draft' | 'sent' | 'copied';
  selectedCustomerIds: string[];
  generatedSubject: string;
  generatedEmailBody: string;
  generatedSmsBody: string;
}): Promise<AiSalesCampaign> {
  const response = await apiFetch('/api/ai-sales/campaigns', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function fetchAiSalesCampaigns(limit = 5): Promise<AiSalesCampaign[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const response = await apiFetch(`/api/ai-sales/campaigns?${params.toString()}`);
  return response.data;
}

export async function fetchAiSalesReorderOpportunities(limit = 5): Promise<{
  data: AiSalesReorderOpportunity[];
  meta: {
    total: number;
    limit: number;
    totalPotentialRevenueCents: number;
  };
}> {
  const params = new URLSearchParams({ limit: String(limit) });
  const response = await apiFetch(`/api/ai-sales/reorder-opportunities?${params.toString()}`);
  return { data: response.data, meta: response.meta };
}

export async function fetchRevenueIntelligenceSummary(
  range: '7d' | '30d' | 'mtd' | 'prev_month' = '30d',
): Promise<MerchantRevenueIntelligenceSummary> {
  const params = new URLSearchParams({ range });
  const response = await apiFetch(`/api/revenue-intelligence/summary?${params.toString()}`);
  return response.data;
}

export async function fetchRevenueIntelligenceReport(
  range: '7d' | '30d' | 'mtd' | 'prev_month' = '30d',
): Promise<MerchantRevenueIntelligenceReport> {
  const params = new URLSearchParams({ range });
  const response = await apiFetch(`/api/revenue-intelligence/report?${params.toString()}`);
  return response.data;
}

export async function trackRevenueInsightEvent(input: {
  eventType: 'shown' | 'clicked' | 'actioned';
  itemType: 'insight' | 'recommendation' | 'opportunity' | 'report';
  itemKey: string;
  page?: 'dashboard' | 'report';
  metadata?: Record<string, string | number | boolean | null>;
}) {
  await apiFetch('/api/revenue-intelligence/events', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function fetchAutomationOverview(): Promise<AutomationOverview> {
  const response = await apiFetch('/api/automations/overview');
  return response.data;
}

export async function fetchAutomationRules(): Promise<AutomationRule[]> {
  const response = await apiFetch('/api/automations/rules');
  return response.data;
}

export async function updateAutomationRule(
  ruleId: string,
  input: Partial<Pick<AutomationRule, 'status' | 'approvalMode' | 'emailEnabled' | 'smsMode' | 'timingWindowDays' | 'throttleDays' | 'maxTargets' | 'goalNotes' | 'toneNotes'>>,
): Promise<AutomationRule> {
  const response = await apiFetch(`/api/automations/rules/${ruleId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function evaluateAutomationRules(input: { ruleIds?: string[] } = {}): Promise<{
  createdCount: number;
  skippedRules: Array<{ ruleId: string; name: string; reason: string }>;
  errors: Array<{ ruleId: string; name: string; error: string }>;
  runs: AutomationRun[];
}> {
  const response = await apiFetch('/api/automations/evaluate', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function fetchAutomationRuns(input: {
  status?: AutomationRun['status'];
  limit?: number;
  ruleId?: string;
} = {}): Promise<AutomationRun[]> {
  const params = new URLSearchParams();
  if (input.status) params.set('status', input.status);
  if (input.ruleId) params.set('ruleId', input.ruleId);
  params.set('limit', String(input.limit ?? 20));
  const response = await apiFetch(`/api/automations/runs?${params.toString()}`);
  return response.data;
}

export async function updateAutomationRun(
  runId: string,
  input: {
    action: 'approve' | 'skip' | 'cancel' | 'save';
    generatedSubject?: string;
    generatedEmailBody?: string;
    generatedSmsBody?: string;
    scheduledFor?: string;
    errorMessage?: string;
  },
): Promise<AutomationRun> {
  const response = await apiFetch(`/api/automations/runs/${runId}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return response.data;
}

export async function processAutomationRuns(input: { runIds?: string[] } = {}) {
  const response = await apiFetch('/api/automations/process', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return response.data as {
    processed: string[];
    skipped: string[];
    failed: Array<{ runId: string; error: string }>;
  };
}

export interface MerchantOrderStats {
  totalOrders: number;
  totalRevenue: number;
  last7DaysRevenue: number;
  last7DaysOrders: number;
  last30DaysRevenue: number;
  completedOrders: number;
  activeOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  repeatCustomers: number;
  dailyRevenue: Array<{
    date: string;
    revenue: number;
    orderCount: number;
  }>;
  locationBreakdown: Array<{
    locationId: string;
    locationName: string;
    orderCount: number;
    revenue: number;
  }>;
}

export interface MerchantCustomerSummary {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpend: number;
  lastOrderDate: string | null;
}

export interface MerchantCustomerDetail {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
  totalSpend: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    eventDate: string | null;
    createdAt: string;
  }>;
}

export interface MerchantFollowUpOrderSummary {
  id: string;
  status: string;
  eventDate: string | null;
  total: number;
  currency: string;
}

export interface MerchantFollowUpSummary {
  id: string;
  status: 'pending' | 'completed';
  dueDate: string;
  note: string | null;
  completedAt: string | null;
  createdAt: string;
  order: MerchantFollowUpOrderSummary;
  customer: {
    name: string;
    email: string;
  };
}

export interface MerchantFollowUpListResult {
  data: MerchantFollowUpSummary[];
  meta: PaginationMeta;
}

export interface MerchantFollowUpQuery {
  page?: number;
  pageSize?: number;
  status?: 'pending' | 'completed';
  from?: string;
  to?: string;
}

export interface MerchantFollowUpUpdateInput {
  status?: 'pending' | 'completed';
  dueDate?: string;
  note?: string | null;
}

export async function fetchCustomers(): Promise<MerchantCustomerSummary[]> {
  const response = await apiFetch('/api/customers?pageSize=100');
  return response.data;
}

export async function fetchCustomer(customerId: string): Promise<MerchantCustomerDetail> {
  const response = await apiFetch(`/api/customers/${customerId}`);
  return response.data;
}

export async function fetchOrderStats(): Promise<MerchantOrderStats> {
  const response = await apiFetch('/api/orders/stats');
  return response.data;
}

export async function fetchMerchantCustomers(): Promise<MerchantCustomerSummary[]> {
  return fetchCustomers();
}

export async function fetchMerchantFollowUps(query: MerchantFollowUpQuery = {}): Promise<MerchantFollowUpListResult> {
  const params = new URLSearchParams();

  if (query.page !== undefined) params.set('page', String(query.page));
  if (query.pageSize !== undefined) params.set('pageSize', String(query.pageSize));
  if (query.status) params.set('status', query.status);
  if (query.from) params.set('from', query.from);
  if (query.to) params.set('to', query.to);

  const response = await apiFetch(`/api/follow-ups${params.toString() ? `?${params.toString()}` : ''}`);
  return { data: response.data, meta: response.meta };
}

export async function updateMerchantFollowUp(id: string, input: MerchantFollowUpUpdateInput) {
  const response = await apiFetch(`/api/follow-ups/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
  return response.data as MerchantFollowUpSummary;
}

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
