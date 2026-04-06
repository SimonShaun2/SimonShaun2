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

type ParsedCampaignPayload = Partial<GeneratedCampaignMessage> & {
  recommendedSendWindow?: string;
  recommendedTone?: string;
  timingReason?: string;
};

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
