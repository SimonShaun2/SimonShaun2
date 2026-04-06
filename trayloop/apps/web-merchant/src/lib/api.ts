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

export async function fetchPaymentStatus(): Promise<MerchantPaymentStatus> {
  const response = await apiFetch('/api/organizations/current/payment-status');
  return response.data;
}

export async function syncPaymentStatus(): Promise<MerchantPaymentStatus> {
  const response = await apiFetch('/api/organizations/current/payment-status/sync', {
    method: 'POST',
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

interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
