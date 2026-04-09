import { logger } from '@trayloop/utils';

export interface GeneratedCampaignMessage {
  subject: string;
  emailBody: string;
  smsBody: string;
  timingGuidance: {
    recommendedSendWindow: string;
    tone: string;
    rationale: string;
  };
}

export interface GeneratedUpsellCopy {
  headline: string;
  reason: string;
}

export interface RevenueInsightInput {
  rangeLabel: string;
  totalRevenueCents: number;
  repeatRevenueSharePercent: number;
  avgOrderValueCents: number;
  repeatCustomerCount: number;
  totalCustomerCount: number;
  dormantRevenueCents: number;
  topCustomerConcentrationPercent: number;
  upsellRevenueCents: number;
  upsellAttachRatePercent: number;
  opportunities: Array<{
    title: string;
    description: string;
    estimatedRevenueCents: number;
  }>;
}

export interface GrowthAdvisorInput {
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
  merchantNotes?: string | null;
  packageNames: string[];
}

export interface GeneratedGrowthAdvisorPlan {
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

interface GenerateCampaignMessageInput {
  merchantName: string;
  segment: 'frequent' | 'at_risk' | 'dormant';
  campaignKind: 'reactivation' | 'reorder_reminder';
  targetCount: number;
  estimatedRevenueCents: number;
  customerSummaries: Array<{
    name: string;
    company: string | null;
    daysSinceLastOrder: number;
    avgOrderValueCents: number;
    orderCount: number;
    cadenceDays?: number | null;
    daysUntilExpectedOrder?: number | null;
  }>;
  goalNotes?: string;
  toneNotes?: string;
}

interface GenerateUpsellCopyInput {
  merchantName: string;
  addOnName: string;
  addOnDescription?: string | null;
  recommendationType: string;
  headcount: number;
  serviceType: 'delivery' | 'pickup' | 'full_service' | 'on_site' | 'food_truck';
  suggestedQuantity: number;
  unitPriceCents: number;
  orderSubtotalCents: number;
  selectedPackageNames: string[];
}

interface OpenAIErrorResponse {
  error?: {
    message?: string;
    type?: string;
    param?: string | null;
    code?: string | null;
  };
}

interface OpenAIChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

interface OpenAIResponsesApiResponse {
  output_text?: string;
  output?: Array<{
    type?: string;
    role?: string;
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

interface CampaignPromptPayload {
  brand: string;
  positioning: string;
  merchantName: string;
  campaignKind: GenerateCampaignMessageInput['campaignKind'];
  campaignKindDescription: string;
  segment: GenerateCampaignMessageInput['segment'];
  segmentDescription: string;
  targetCount: number;
  estimatedRevenue: string;
  goalNotes: string | null;
  toneNotes: string | null;
  customers: Array<{
    name: string;
    company: string | null;
    daysSinceLastOrder: number;
    averageOrderValue: string;
    completedOrders: number;
    cadenceDays?: number | null;
    daysUntilExpectedOrder?: number | null;
  }>;
  requirements: {
    outputFormat: string;
    writingStyle: string;
    constraints: string[];
  };
}

interface UpsellPromptPayload {
  brand: string;
  positioning: string;
  merchantName: string;
  addOnName: string;
  addOnDescription: string | null;
  recommendationType: string;
  serviceType: string;
  headcount: number;
  suggestedQuantity: number;
  price: string;
  orderSubtotal: string;
  selectedPackages: string[];
  requirements: {
    outputFormat: string;
    writingStyle: string;
    constraints: string[];
  };
}

interface RevenueInsightPromptPayload {
  brand: string;
  positioning: string;
  rangeLabel: string;
  metrics: {
    totalRevenue: string;
    repeatRevenueSharePercent: number;
    avgOrderValue: string;
    repeatCustomerCount: number;
    totalCustomerCount: number;
    dormantRevenue: string;
    topCustomerConcentrationPercent: number;
    upsellRevenue: string;
    upsellAttachRatePercent: number;
  };
  opportunities: Array<{
    title: string;
    description: string;
    estimatedRevenue: string;
  }>;
  requirements: {
    outputFormat: string;
    writingStyle: string;
    constraints: string[];
  };
}

interface GrowthAdvisorPromptPayload {
  brand: string;
  positioning: string;
  organization: {
    name: string;
    cuisineHint: string | null;
    website: string | null;
  };
  currentProgram: {
    activeLocations: number;
    activePackages: number;
    activeAddOns: number;
    packageNames: string[];
    averagePackagePrice: string | null;
    packagePriceRange: {
      low: string | null;
      high: string | null;
    };
    leadTimeDays: number | null;
    minimumOrder: string | null;
    depositRequired: boolean | null;
    serviceTypes: string[];
  };
  traction: {
    completedOrders: number;
    recentOrders30d: number;
    averageOrderValue: string | null;
  };
  merchantNotes: string | null;
  requirements: {
    outputFormat: string;
    writingStyle: string;
    constraints: string[];
  };
}

type ParsedCampaignPayload = Partial<GeneratedCampaignMessage> & {
  recommendedSendWindow?: string;
  recommendedTone?: string;
  timingReason?: string;
};

type ParsedUpsellPayload = Partial<GeneratedUpsellCopy>;
type ParsedRevenueInsightPayload = {
  insights?: string[];
};
type ParsedGrowthAdvisorPayload = Partial<GeneratedGrowthAdvisorPlan>;

const CAMPAIGN_RESPONSE_SCHEMA = {
  name: 'campaign_message',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      subject: { type: 'string' },
      emailBody: { type: 'string' },
      smsBody: { type: 'string' },
      recommendedSendWindow: { type: 'string' },
      recommendedTone: { type: 'string' },
      timingReason: { type: 'string' },
    },
    required: [
      'subject',
      'emailBody',
      'smsBody',
      'recommendedSendWindow',
      'recommendedTone',
      'timingReason',
    ],
  },
} as const;

const UPSELL_RESPONSE_SCHEMA = {
  name: 'upsell_copy',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      headline: { type: 'string' },
      reason: { type: 'string' },
    },
    required: ['headline', 'reason'],
  },
} as const;

const REVENUE_INSIGHTS_RESPONSE_SCHEMA = {
  name: 'revenue_insights',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      insights: {
        type: 'array',
        items: { type: 'string' },
      },
    },
    required: ['insights'],
  },
} as const;

const GROWTH_ADVISOR_RESPONSE_SCHEMA = {
  name: 'growth_advisor',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      businessStage: { type: 'string' },
      stageSummary: { type: 'string' },
      growthInsight: { type: 'string' },
      biggestOpportunity: { type: 'string' },
      recommendedOffer: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          priceCents: { type: 'integer' },
          minimumGuests: { type: 'integer' },
          serviceStyle: { type: 'string' },
        },
        required: ['name', 'description', 'priceCents', 'minimumGuests', 'serviceStyle'],
      },
      pricingGuidance: {
        type: 'object',
        additionalProperties: false,
        properties: {
          minimumOrderCents: { type: 'integer' },
          deliveryFeeCents: { type: 'integer' },
          depositPolicy: { type: 'string' },
          notes: { type: 'string' },
        },
        required: ['minimumOrderCents', 'deliveryFeeCents', 'depositPolicy', 'notes'],
      },
      channelStrategy: {
        type: 'array',
        items: { type: 'string' },
      },
      nextSteps: {
        type: 'array',
        items: { type: 'string' },
      },
      thirtyDayGoal: { type: 'string' },
    },
    required: [
      'businessStage',
      'stageSummary',
      'growthInsight',
      'biggestOpportunity',
      'recommendedOffer',
      'pricingGuidance',
      'channelStrategy',
      'nextSteps',
      'thirtyDayGoal',
    ],
  },
} as const;

export class OpenAIRequestError extends Error {
  constructor(
    message: string,
    public status: number,
    public type?: string | null,
    public code?: string | null,
  ) {
    super(message);
    this.name = 'OpenAIRequestError';
  }
}

function getApiKey() {
  return process.env.OPENAI_API_KEY ?? null;
}

function getModel() {
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

export function isOpenAIEnabled() {
  return Boolean(getApiKey());
}

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

function buildCampaignPrompt(input: GenerateCampaignMessageInput): CampaignPromptPayload {
  const customerSnapshot = input.customerSummaries.slice(0, 8).map((customer) => ({
    name: customer.name,
    company: customer.company,
    daysSinceLastOrder: customer.daysSinceLastOrder,
    averageOrderValue: formatCurrency(customer.avgOrderValueCents),
    completedOrders: customer.orderCount,
    cadenceDays: customer.cadenceDays ?? null,
    daysUntilExpectedOrder: customer.daysUntilExpectedOrder ?? null,
  }));

  const segmentDescription =
    input.segment === 'frequent'
      ? 'repeat customers who order regularly and may be approaching their next reorder window'
      : input.segment === 'at_risk'
        ? 'repeat customers who have not ordered in 14 to 29 days'
        : 'repeat customers who have not ordered in 30 or more days';

  const campaignKindDescription =
    input.campaignKind === 'reorder_reminder'
      ? 'This is a reorder reminder timed around the customer expected next catering purchase.'
      : 'This is a reactivation message intended to restart repeat catering demand.';

  return {
    brand: 'TrayLoop',
    positioning:
      'TrayLoop is the system that helps restaurants generate predictable catering revenue. Avoid buzzwords and generic AI language.',
    merchantName: input.merchantName,
    campaignKind: input.campaignKind,
    campaignKindDescription,
    segment: input.segment,
    segmentDescription,
    targetCount: input.targetCount,
    estimatedRevenue: formatCurrency(input.estimatedRevenueCents),
    goalNotes: input.goalNotes?.trim() || null,
    toneNotes: input.toneNotes?.trim() || null,
    customers: customerSnapshot,
    requirements: {
      outputFormat:
        'Return strict JSON with keys subject, emailBody, smsBody, recommendedSendWindow, recommendedTone, timingReason. emailBody and smsBody should be plain text.',
      writingStyle:
        'Write concise, warm, operator-friendly outreach that sounds like a real merchant, not a robot. Focus on catering needs, repeat business, and helpful service.',
      constraints: [
        'Do not mention AI.',
        'Do not use emojis.',
        'Do not sound salesy or spammy.',
        'Do not promise discounts unless explicitly told to do so.',
        'Email should be 90-160 words.',
        'SMS should be under 320 characters.',
        'Recommended send guidance should be practical and specific.',
      ],
    },
  };
}

function formatServiceType(serviceType: GenerateUpsellCopyInput['serviceType']) {
  if (serviceType === 'full_service') return 'full service';
  if (serviceType === 'on_site') return 'on-site';
  if (serviceType === 'food_truck') return 'food truck';
  return serviceType;
}

function buildUpsellPrompt(input: GenerateUpsellCopyInput): UpsellPromptPayload {
  return {
    brand: 'TrayLoop',
    positioning:
      'TrayLoop helps restaurants generate predictable catering revenue. The copy should feel helpful, direct, and grounded in a real catering order.',
    merchantName: input.merchantName,
    addOnName: input.addOnName,
    addOnDescription: input.addOnDescription?.trim() || null,
    recommendationType: input.recommendationType,
    serviceType: formatServiceType(input.serviceType),
    headcount: input.headcount,
    suggestedQuantity: input.suggestedQuantity,
    price: formatCurrency(input.unitPriceCents * input.suggestedQuantity),
    orderSubtotal: formatCurrency(input.orderSubtotalCents),
    selectedPackages: input.selectedPackageNames.slice(0, 5),
    requirements: {
      outputFormat: 'Return strict JSON with keys headline and reason.',
      writingStyle:
        'Write short storefront upsell copy that feels like a useful recommendation during checkout, not an ad.',
      constraints: [
        'Do not mention AI.',
        'Do not use emojis.',
        'Headline must be under 60 characters.',
        'Reason must be under 120 characters.',
        'Do not be cheesy, generic, or spammy.',
      ],
    },
  };
}

function buildRevenueInsightPrompt(input: RevenueInsightInput): RevenueInsightPromptPayload {
  return {
    brand: 'TrayLoop',
    positioning:
      'TrayLoop is the system that helps restaurants generate predictable catering revenue. Summaries should sound like a sharp operator, not a generic analytics dashboard.',
    rangeLabel: input.rangeLabel,
    metrics: {
      totalRevenue: formatCurrency(input.totalRevenueCents),
      repeatRevenueSharePercent: input.repeatRevenueSharePercent,
      avgOrderValue: formatCurrency(input.avgOrderValueCents),
      repeatCustomerCount: input.repeatCustomerCount,
      totalCustomerCount: input.totalCustomerCount,
      dormantRevenue: formatCurrency(input.dormantRevenueCents),
      topCustomerConcentrationPercent: input.topCustomerConcentrationPercent,
      upsellRevenue: formatCurrency(input.upsellRevenueCents),
      upsellAttachRatePercent: input.upsellAttachRatePercent,
    },
    opportunities: input.opportunities.slice(0, 4).map((opportunity) => ({
      title: opportunity.title,
      description: opportunity.description,
      estimatedRevenue: formatCurrency(opportunity.estimatedRevenueCents),
    })),
    requirements: {
      outputFormat: 'Return strict JSON with one key: insights, an array of 3 to 5 strings.',
      writingStyle:
        'Write short, plainspoken operator insights that explain what happened and what to do next.',
      constraints: [
        'Do not mention AI.',
        'Do not use emojis.',
        'Each insight must be one sentence.',
        'Keep each insight under 150 characters.',
        'Avoid generic analytics filler.',
        'Focus on revenue, repeat business, concentration risk, and checkout lift.',
      ],
    },
  };
}

function buildGrowthAdvisorPrompt(input: GrowthAdvisorInput): GrowthAdvisorPromptPayload {
  return {
    brand: 'TrayLoop',
    positioning:
      'TrayLoop helps restaurants launch and grow catering revenue with stronger storefronts, better offers, and repeat-order systems.',
    organization: {
      name: input.organizationName,
      cuisineHint: input.cuisineHint,
      website: input.website,
    },
    currentProgram: {
      activeLocations: input.activeLocations,
      activePackages: input.activePackages,
      activeAddOns: input.activeAddOns,
      packageNames: input.packageNames.slice(0, 6),
      averagePackagePrice: input.averagePackagePriceCents != null ? formatCurrency(input.averagePackagePriceCents) : null,
      packagePriceRange: {
        low: input.priceRange.lowCents != null ? formatCurrency(input.priceRange.lowCents) : null,
        high: input.priceRange.highCents != null ? formatCurrency(input.priceRange.highCents) : null,
      },
      leadTimeDays: input.leadTimeDays,
      minimumOrder: input.minimumOrderCents != null ? formatCurrency(input.minimumOrderCents) : null,
      depositRequired: input.depositRequired,
      serviceTypes: input.serviceTypes,
    },
    traction: {
      completedOrders: input.completedOrders,
      recentOrders30d: input.recentOrders30d,
      averageOrderValue: input.averageOrderValueCents != null ? formatCurrency(input.averageOrderValueCents) : null,
    },
    merchantNotes: input.merchantNotes?.trim() || null,
    requirements: {
      outputFormat:
        'Return strict JSON with businessStage, stageSummary, growthInsight, biggestOpportunity, recommendedOffer, pricingGuidance, channelStrategy, nextSteps, and thirtyDayGoal.',
      writingStyle:
        'Write like a sharp catering operator and launch strategist. Keep advice specific, direct, and practical for a restaurant team.',
      constraints: [
        'Do not mention AI.',
        'Do not use emojis.',
        'Be specific to restaurant catering, not general restaurant advice.',
        'Assume Growth Advisor is a premium add-on, so the recommendations should feel high-value.',
        'Channel strategy should be 3 short bullets or fewer.',
        'Next steps should be exactly 3 concrete actions.',
        'Recommended pricing should be realistic for B2B catering and easy to implement.',
      ],
    },
  };
}

function parseOpenAIError(text: string): OpenAIErrorResponse['error'] {
  try {
    const parsed = JSON.parse(text) as OpenAIErrorResponse;
    return parsed.error;
  } catch {
    return undefined;
  }
}

async function throwOpenAIResponseError(response: Response): Promise<never> {
  const body = await response.text();
  const error = parseOpenAIError(body);

  logger.error('OpenAI campaign generation failed', {
    status: response.status,
    model: getModel(),
    type: error?.type ?? null,
    code: error?.code ?? null,
    body: body.slice(0, 500),
  });

  throw new OpenAIRequestError(
    error?.message || `OpenAI request failed with status ${response.status}.`,
    response.status,
    error?.type,
    error?.code,
  );
}

function extractResponsesText(data: OpenAIResponsesApiResponse): string | null {
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text;
  }

  const message = data.output?.find((item) => item.type === 'message');
  const textParts = message?.content
    ?.filter((part) => part.type === 'output_text' && typeof part.text === 'string')
    .map((part) => part.text ?? '')
    .join('');

  return textParts?.trim() || null;
}

function parseGeneratedContent(content: string): GeneratedCampaignMessage {
  let parsed: ParsedCampaignPayload;
  try {
    parsed = JSON.parse(content) as ParsedCampaignPayload;
  } catch {
    throw new Error('OpenAI returned malformed campaign content.');
  }

  if (
    !parsed.subject ||
    !parsed.emailBody ||
    !parsed.smsBody ||
    !parsed.recommendedSendWindow ||
    !parsed.recommendedTone ||
    !parsed.timingReason
  ) {
    throw new Error('OpenAI returned incomplete campaign content.');
  }

  return {
    subject: parsed.subject.trim(),
    emailBody: parsed.emailBody.trim(),
    smsBody: parsed.smsBody.trim(),
    timingGuidance: {
      recommendedSendWindow: parsed.recommendedSendWindow.trim(),
      tone: parsed.recommendedTone.trim(),
      rationale: parsed.timingReason.trim(),
    },
  };
}

function parseGeneratedUpsellContent(content: string): GeneratedUpsellCopy {
  let parsed: ParsedUpsellPayload;
  try {
    parsed = JSON.parse(content) as ParsedUpsellPayload;
  } catch {
    throw new Error('OpenAI returned malformed upsell content.');
  }

  if (!parsed.headline || !parsed.reason) {
    throw new Error('OpenAI returned incomplete upsell content.');
  }

  return {
    headline: parsed.headline.trim(),
    reason: parsed.reason.trim(),
  };
}

function parseGeneratedRevenueInsightsContent(content: string): string[] {
  const parsed = JSON.parse(content) as ParsedRevenueInsightPayload;
  const insights = Array.isArray(parsed.insights)
    ? parsed.insights
        .map((value) => (typeof value === 'string' ? value.trim() : ''))
        .filter(Boolean)
    : [];

  if (insights.length === 0) {
    throw new Error('OpenAI returned an invalid revenue insight response.');
  }

  return insights.slice(0, 5);
}

function parseGeneratedGrowthAdvisorContent(content: string): GeneratedGrowthAdvisorPlan {
  const parsed = JSON.parse(content) as ParsedGrowthAdvisorPayload;

  if (
    !parsed.businessStage ||
    !parsed.stageSummary ||
    !parsed.growthInsight ||
    !parsed.biggestOpportunity ||
    !parsed.recommendedOffer ||
    !parsed.pricingGuidance ||
    !Array.isArray(parsed.channelStrategy) ||
    !Array.isArray(parsed.nextSteps) ||
    !parsed.thirtyDayGoal
  ) {
    throw new Error('OpenAI returned an invalid growth advisor response.');
  }

  return {
    businessStage: parsed.businessStage.trim(),
    stageSummary: parsed.stageSummary.trim(),
    growthInsight: parsed.growthInsight.trim(),
    biggestOpportunity: parsed.biggestOpportunity.trim(),
    recommendedOffer: {
      name: parsed.recommendedOffer.name.trim(),
      description: parsed.recommendedOffer.description.trim(),
      priceCents: Math.max(0, Math.round(parsed.recommendedOffer.priceCents)),
      minimumGuests: Math.max(1, Math.round(parsed.recommendedOffer.minimumGuests)),
      serviceStyle: parsed.recommendedOffer.serviceStyle.trim(),
    },
    pricingGuidance: {
      minimumOrderCents: Math.max(0, Math.round(parsed.pricingGuidance.minimumOrderCents)),
      deliveryFeeCents: Math.max(0, Math.round(parsed.pricingGuidance.deliveryFeeCents)),
      depositPolicy: parsed.pricingGuidance.depositPolicy.trim(),
      notes: parsed.pricingGuidance.notes.trim(),
    },
    channelStrategy: parsed.channelStrategy
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 3),
    nextSteps: parsed.nextSteps
      .map((item) => (typeof item === 'string' ? item.trim() : ''))
      .filter(Boolean)
      .slice(0, 3),
    thirtyDayGoal: parsed.thirtyDayGoal.trim(),
  };
}

async function requestResponsesApi(
  apiKey: string,
  prompt: CampaignPromptPayload,
): Promise<GeneratedCampaignMessage> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.7,
      instructions:
        'You write high-converting outreach for restaurants trying to win repeat catering orders. Return only valid JSON.',
      input: JSON.stringify(prompt),
      text: {
        format: {
          type: 'json_schema',
          name: CAMPAIGN_RESPONSE_SCHEMA.name,
          strict: CAMPAIGN_RESPONSE_SCHEMA.strict,
          schema: CAMPAIGN_RESPONSE_SCHEMA.schema,
        },
      },
    }),
  });

  if (!response.ok) {
    await throwOpenAIResponseError(response);
  }

  const data = (await response.json()) as OpenAIResponsesApiResponse;
  const content = extractResponsesText(data);

  if (!content) {
    throw new Error('OpenAI returned an empty campaign response.');
  }

  return parseGeneratedContent(content);
}

async function requestChatCompletionsApi(
  apiKey: string,
  prompt: CampaignPromptPayload,
): Promise<GeneratedCampaignMessage> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.7,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You write high-converting outreach for restaurants trying to win repeat catering orders. Return only valid JSON.',
        },
        {
          role: 'user',
          content: JSON.stringify(prompt),
        },
      ],
    }),
  });

  if (!response.ok) {
    await throwOpenAIResponseError(response);
  }

  const data = (await response.json()) as OpenAIChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('OpenAI returned an invalid campaign response.');
  }

  return parseGeneratedContent(content);
}

async function requestUpsellResponsesApi(
  apiKey: string,
  prompt: UpsellPromptPayload,
): Promise<GeneratedUpsellCopy> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.5,
      instructions:
        'You write concise storefront upsell copy for restaurant catering checkout. Return only valid JSON.',
      input: JSON.stringify(prompt),
      text: {
        format: {
          type: 'json_schema',
          name: UPSELL_RESPONSE_SCHEMA.name,
          strict: UPSELL_RESPONSE_SCHEMA.strict,
          schema: UPSELL_RESPONSE_SCHEMA.schema,
        },
      },
    }),
  });

  if (!response.ok) {
    await throwOpenAIResponseError(response);
  }

  const data = (await response.json()) as OpenAIResponsesApiResponse;
  const content = extractResponsesText(data);

  if (!content) {
    throw new Error('OpenAI returned an empty upsell response.');
  }

  return parseGeneratedUpsellContent(content);
}

async function requestUpsellChatCompletionsApi(
  apiKey: string,
  prompt: UpsellPromptPayload,
): Promise<GeneratedUpsellCopy> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You write concise storefront upsell copy for restaurant catering checkout. Return only valid JSON.',
        },
        {
          role: 'user',
          content: JSON.stringify(prompt),
        },
      ],
    }),
  });

  if (!response.ok) {
    await throwOpenAIResponseError(response);
  }

  const data = (await response.json()) as OpenAIChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('OpenAI returned an invalid upsell response.');
  }

  return parseGeneratedUpsellContent(content);
}

async function requestRevenueInsightResponsesApi(
  apiKey: string,
  prompt: RevenueInsightPromptPayload,
): Promise<string[]> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      input: [
        {
          role: 'system',
          content:
            'You summarize catering revenue intelligence for restaurant operators. Return only valid JSON that matches the schema.',
        },
        {
          role: 'user',
          content: JSON.stringify(prompt),
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: REVENUE_INSIGHTS_RESPONSE_SCHEMA.name,
          strict: REVENUE_INSIGHTS_RESPONSE_SCHEMA.strict,
          schema: REVENUE_INSIGHTS_RESPONSE_SCHEMA.schema,
        },
      },
    }),
  });

  if (!response.ok) {
    await throwOpenAIResponseError(response);
  }

  const data = (await response.json()) as OpenAIResponsesApiResponse;
  const content = extractResponsesText(data);

  if (!content) {
    throw new Error('OpenAI returned an empty revenue insight response.');
  }

  return parseGeneratedRevenueInsightsContent(content);
}

async function requestRevenueInsightChatCompletionsApi(
  apiKey: string,
  prompt: RevenueInsightPromptPayload,
): Promise<string[]> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.4,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You summarize revenue intelligence for restaurant operators. Return only valid JSON.',
        },
        {
          role: 'user',
          content: JSON.stringify(prompt),
        },
      ],
    }),
  });

  if (!response.ok) {
    await throwOpenAIResponseError(response);
  }

  const data = (await response.json()) as OpenAIChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('OpenAI returned an invalid revenue insight response.');
  }

  return parseGeneratedRevenueInsightsContent(content);
}

async function requestGrowthAdvisorResponsesApi(
  apiKey: string,
  prompt: GrowthAdvisorPromptPayload,
): Promise<GeneratedGrowthAdvisorPlan> {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.6,
      input: [
        {
          role: 'system',
          content:
            'You are TrayLoop Growth Advisor. You help restaurant teams launch and grow catering revenue with specific, operator-grade guidance. Return only valid JSON that matches the schema.',
        },
        {
          role: 'user',
          content: JSON.stringify(prompt),
        },
      ],
      text: {
        format: {
          type: 'json_schema',
          name: GROWTH_ADVISOR_RESPONSE_SCHEMA.name,
          strict: GROWTH_ADVISOR_RESPONSE_SCHEMA.strict,
          schema: GROWTH_ADVISOR_RESPONSE_SCHEMA.schema,
        },
      },
    }),
  });

  if (!response.ok) {
    await throwOpenAIResponseError(response);
  }

  const data = (await response.json()) as OpenAIResponsesApiResponse;
  const content = extractResponsesText(data);

  if (!content) {
    throw new Error('OpenAI returned an empty growth advisor response.');
  }

  return parseGeneratedGrowthAdvisorContent(content);
}

async function requestGrowthAdvisorChatCompletionsApi(
  apiKey: string,
  prompt: GrowthAdvisorPromptPayload,
): Promise<GeneratedGrowthAdvisorPlan> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are TrayLoop Growth Advisor. You help restaurant teams launch and grow catering revenue with specific, operator-grade guidance. Return only valid JSON.',
        },
        {
          role: 'user',
          content: JSON.stringify(prompt),
        },
      ],
    }),
  });

  if (!response.ok) {
    await throwOpenAIResponseError(response);
  }

  const data = (await response.json()) as OpenAIChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== 'string' || !content.trim()) {
    throw new Error('OpenAI returned an invalid growth advisor response.');
  }

  return parseGeneratedGrowthAdvisorContent(content);
}

function shouldFallbackToChat(error: unknown) {
  if (!(error instanceof OpenAIRequestError)) {
    return false;
  }

  if (error.status === 404) {
    return true;
  }

  if (error.status !== 400 && error.status !== 422) {
    return false;
  }

  const details = `${error.message} ${error.type ?? ''} ${error.code ?? ''}`.toLowerCase();

  return (
    details.includes('response_format') ||
    details.includes('json_schema') ||
    details.includes('unsupported') ||
    details.includes('unknown parameter') ||
    details.includes('text.format')
  );
}

export async function generateCampaignMessage(
  input: GenerateCampaignMessageInput,
): Promise<GeneratedCampaignMessage> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY to enable AI campaigns.');
  }

  const prompt = buildCampaignPrompt(input);

  try {
    return await requestResponsesApi(apiKey, prompt);
  } catch (error) {
    if (!shouldFallbackToChat(error)) {
      throw error;
    }

    logger.warn('Responses API campaign generation failed, falling back to chat completions', {
      model: getModel(),
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return requestChatCompletionsApi(apiKey, prompt);
  }
}

export async function generateUpsellCopy(
  input: GenerateUpsellCopyInput,
): Promise<GeneratedUpsellCopy> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY to enable AI upsell copy.');
  }

  const prompt = buildUpsellPrompt(input);

  try {
    return await requestUpsellResponsesApi(apiKey, prompt);
  } catch (error) {
    if (!shouldFallbackToChat(error)) {
      throw error;
    }

    logger.warn('Responses API upsell generation failed, falling back to chat completions', {
      model: getModel(),
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return requestUpsellChatCompletionsApi(apiKey, prompt);
  }
}

export async function generateRevenueInsights(
  input: RevenueInsightInput,
): Promise<string[]> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY to enable revenue insights.');
  }

  const prompt = buildRevenueInsightPrompt(input);

  try {
    return await requestRevenueInsightResponsesApi(apiKey, prompt);
  } catch (error) {
    if (!shouldFallbackToChat(error)) {
      throw error;
    }

    logger.warn('Responses API revenue insight generation failed, falling back to chat completions', {
      model: getModel(),
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return requestRevenueInsightChatCompletionsApi(apiKey, prompt);
  }
}

export async function generateGrowthAdvisor(
  input: GrowthAdvisorInput,
): Promise<GeneratedGrowthAdvisorPlan> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY to enable Growth Advisor.');
  }

  const prompt = buildGrowthAdvisorPrompt(input);

  try {
    return await requestGrowthAdvisorResponsesApi(apiKey, prompt);
  } catch (error) {
    if (!shouldFallbackToChat(error)) {
      throw error;
    }

    logger.warn('Responses API growth advisor generation failed, falling back to chat completions', {
      model: getModel(),
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return requestGrowthAdvisorChatCompletionsApi(apiKey, prompt);
  }
}
