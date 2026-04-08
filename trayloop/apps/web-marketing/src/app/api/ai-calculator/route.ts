// Requires OPENAI_API_KEY environment variable. Set in Vercel dashboard.

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AiCalculatorRequestBody {
  prompt?: unknown;
}

interface AiCalculatorResult {
  monthlyRevenue: number;
  commissionRate: number;
  businessType: string;
  location: string | null;
  marketplace: string | null;
  marketplaceLossMonthly: number;
  trayLoopCost: number;
  monthlySavings: number;
  annualSavings: number;
  insight: string;
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
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
}

const AI_CALCULATOR_RESPONSE_SCHEMA = {
  name: 'ai_calculator_result',
  strict: true,
  schema: {
    type: 'object',
    additionalProperties: false,
    properties: {
      monthlyRevenue: { type: 'number' },
      commissionRate: { type: 'number' },
      businessType: { type: 'string' },
      location: {
        anyOf: [{ type: 'string' }, { type: 'null' }],
      },
      marketplace: {
        anyOf: [{ type: 'string' }, { type: 'null' }],
      },
      marketplaceLossMonthly: { type: 'number' },
      trayLoopCost: { type: 'number' },
      monthlySavings: { type: 'number' },
      annualSavings: { type: 'number' },
      insight: { type: 'string' },
    },
    required: [
      'monthlyRevenue',
      'commissionRate',
      'businessType',
      'location',
      'marketplace',
      'marketplaceLossMonthly',
      'trayLoopCost',
      'monthlySavings',
      'annualSavings',
      'insight',
    ],
  },
} as const;

class OpenAIRequestError extends Error {
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

  console.error('AI calculator OpenAI request failed', {
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

function buildCalculatorPrompt(prompt: string) {
  return {
    product: 'TrayLoop',
    task: 'Analyze a catering business description and estimate marketplace commission losses.',
    userPrompt: prompt,
    assumptions: {
      defaultCommissionRateByMarketplace: {
        EzCater: 20,
        'DoorDash Work': 25,
        'Uber Eats catering': 30,
        unknownMarketplace: 20,
        noMarketplaceMentioned: 0,
      },
      trayLoopMonthlyCost: 49,
    },
    requirements: {
      extraction: [
        'Extract monthlyRevenue as an integer USD amount.',
        'Extract commissionRate as a percentage between 0 and 100.',
        'Extract businessType as a concise business label such as BBQ restaurant, pizza shop, food truck, deli, or bakery.',
        'Extract location if a city, region, or market is mentioned; otherwise return null.',
        'Extract marketplace if a platform is mentioned; otherwise return null.',
      ],
      reasoning: [
        'If the user does not specify commission rate, assume 20% for EzCater, 25% for DoorDash Work, 30% for Uber Eats catering, 20% for an unknown marketplace, and 0% if no marketplace is mentioned.',
        'Do not make up a revenue number. If monthly revenue is unclear, set monthlyRevenue to 0.',
        'trayLoopCost must always be 49.',
        'marketplaceLossMonthly should represent monthlyRevenue multiplied by commissionRate / 100.',
        'monthlySavings should represent marketplaceLossMonthly minus 49.',
        'annualSavings should represent monthlySavings multiplied by 12.',
      ],
      writing: [
        'Keep insight to 1-2 sentences.',
        'Make the insight specific and grounded in the business type, location, ordering behavior, or marketplace context.',
        'Never mention AI.',
        'Never use emojis.',
      ],
      output: 'Return strict JSON only.',
    },
  };
}

function parseString(value: unknown, fallback?: string) {
  if (typeof value === 'string' && value.trim()) {
    return value.trim();
  }

  return fallback;
}

function parseNullableString(value: unknown) {
  if (value === null) {
    return null;
  }

  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function parseNumber(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return null;
}

function normalizeResult(raw: unknown): AiCalculatorResult {
  if (!raw || typeof raw !== 'object') {
    throw new Error('OpenAI returned malformed calculator content.');
  }

  const parsed = raw as Record<string, unknown>;
  const monthlyRevenue = Math.max(0, Math.round(parseNumber(parsed.monthlyRevenue) ?? 0));
  const commissionRate = Math.min(100, Math.max(0, parseNumber(parsed.commissionRate) ?? 0));
  const businessType = parseString(parsed.businessType);
  const insight = parseString(parsed.insight);

  if (!businessType || !insight) {
    throw new Error('OpenAI returned incomplete calculator content.');
  }

  const marketplaceLossMonthly = Math.round((monthlyRevenue * commissionRate) / 100);
  const trayLoopCost = 49;
  const monthlySavings = marketplaceLossMonthly - trayLoopCost;
  const annualSavings = monthlySavings * 12;

  return {
    monthlyRevenue,
    commissionRate,
    businessType,
    location: parseNullableString(parsed.location),
    marketplace: parseNullableString(parsed.marketplace),
    marketplaceLossMonthly,
    trayLoopCost,
    monthlySavings,
    annualSavings,
    insight,
  };
}

function parseCalculatorContent(content: string): AiCalculatorResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(content) as unknown;
  } catch {
    throw new Error('OpenAI returned malformed calculator content.');
  }

  return normalizeResult(parsed);
}

async function requestResponsesApi(apiKey: string, prompt: ReturnType<typeof buildCalculatorPrompt>) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      instructions:
        'You analyze restaurant catering businesses to estimate marketplace losses. Return only valid JSON that matches the provided schema.',
      input: JSON.stringify(prompt),
      text: {
        format: {
          type: 'json_schema',
          name: AI_CALCULATOR_RESPONSE_SCHEMA.name,
          strict: AI_CALCULATOR_RESPONSE_SCHEMA.strict,
          schema: AI_CALCULATOR_RESPONSE_SCHEMA.schema,
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
    throw new Error('OpenAI returned an empty calculator response.');
  }

  return parseCalculatorContent(content);
}

async function requestChatCompletionsApi(
  apiKey: string,
  prompt: ReturnType<typeof buildCalculatorPrompt>,
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: getModel(),
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You analyze restaurant catering businesses to estimate marketplace losses. Return only valid JSON.',
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
    throw new Error('OpenAI returned an invalid calculator response.');
  }

  return parseCalculatorContent(content);
}

async function generateCalculatorResult(prompt: string) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY to enable AI calculator analysis.');
  }

  const promptPayload = buildCalculatorPrompt(prompt);

  try {
    return await requestResponsesApi(apiKey, promptPayload);
  } catch (error) {
    if (!shouldFallbackToChat(error)) {
      throw error;
    }

    console.warn('Responses API calculator generation failed, falling back to chat completions', {
      model: getModel(),
      message: error instanceof Error ? error.message : 'Unknown error',
    });

    return requestChatCompletionsApi(apiKey, promptPayload);
  }
}

export async function POST(request: Request) {
  let body: AiCalculatorRequestBody;

  try {
    body = (await request.json()) as AiCalculatorRequestBody;
  } catch {
    return NextResponse.json({ error: 'Please describe your business so we can analyze it.' }, { status: 400 });
  }

  const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
  if (!prompt) {
    return NextResponse.json({ error: 'Please describe your business so we can analyze it.' }, { status: 400 });
  }

  try {
    const result = await generateCalculatorResult(prompt);

    if (result.monthlyRevenue <= 0) {
      return NextResponse.json(
        { error: 'Please include your monthly catering revenue so we can calculate your savings.' },
        { status: 400 },
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI calculator failed', error);

    return NextResponse.json(
      { error: 'We hit a temporary issue analyzing your business. Please try again or use manual mode.' },
      { status: 500 },
    );
  }
}
