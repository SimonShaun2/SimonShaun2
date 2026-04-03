import { logger } from '@trayloop/utils';

export interface GeneratedCampaignMessage {
  subject: string;
  emailBody: string;
  smsBody: string;
}

interface GenerateCampaignMessageInput {
  merchantName: string;
  segment: 'at_risk' | 'dormant';
  targetCount: number;
  estimatedRevenueCents: number;
  customerSummaries: Array<{
    name: string;
    company: string | null;
    daysSinceLastOrder: number;
    avgOrderValueCents: number;
    orderCount: number;
  }>;
  goalNotes?: string;
  toneNotes?: string;
}

interface OpenAIChatCompletionResponse {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
}

function getApiKey() {
  return process.env.OPENAI_API_KEY ?? null;
}

function getModel() {
  return process.env.OPENAI_MODEL || 'gpt-4.1-mini';
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

export async function generateCampaignMessage(
  input: GenerateCampaignMessageInput,
): Promise<GeneratedCampaignMessage> {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('OpenAI is not configured. Set OPENAI_API_KEY to enable AI campaigns.');
  }

  const customerSnapshot = input.customerSummaries
    .slice(0, 8)
    .map((customer) => ({
      name: customer.name,
      company: customer.company,
      daysSinceLastOrder: customer.daysSinceLastOrder,
      averageOrderValue: formatCurrency(customer.avgOrderValueCents),
      completedOrders: customer.orderCount,
    }));

  const segmentDescription =
    input.segment === 'at_risk'
      ? 'repeat customers who have not ordered in 14 to 29 days'
      : 'repeat customers who have not ordered in 30 or more days';

  const prompt = {
    brand: 'TrayLoop',
    positioning:
      'TrayLoop is the system that helps restaurants generate predictable catering revenue. Avoid buzzwords and generic AI language.',
    merchantName: input.merchantName,
    segment: input.segment,
    segmentDescription,
    targetCount: input.targetCount,
    estimatedRevenue: formatCurrency(input.estimatedRevenueCents),
    goalNotes: input.goalNotes?.trim() || null,
    toneNotes: input.toneNotes?.trim() || null,
    customers: customerSnapshot,
    requirements: {
      outputFormat:
        'Return strict JSON with keys subject, emailBody, smsBody. emailBody and smsBody should be plain text.',
      writingStyle:
        'Write concise, warm, operator-friendly outreach that sounds like a real merchant, not a robot. Focus on catering needs, repeat business, and helpful service.',
      constraints: [
        'Do not mention AI.',
        'Do not use emojis.',
        'Do not sound salesy or spammy.',
        'Do not promise discounts unless explicitly told to do so.',
        'Email should be 90-160 words.',
        'SMS should be under 320 characters.',
      ],
    },
  };

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
    const body = await response.text();
    logger.error('OpenAI campaign generation failed', {
      status: response.status,
      body,
    });
    throw new Error('OpenAI could not generate a message right now. Please try again.');
  }

  const data = (await response.json()) as OpenAIChatCompletionResponse;
  const content = data.choices?.[0]?.message?.content;

  if (typeof content !== 'string') {
    throw new Error('OpenAI returned an invalid response.');
  }

  let parsed: Partial<GeneratedCampaignMessage>;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('OpenAI returned malformed campaign content.');
  }

  if (!parsed.subject || !parsed.emailBody || !parsed.smsBody) {
    throw new Error('OpenAI returned incomplete campaign content.');
  }

  return {
    subject: parsed.subject.trim(),
    emailBody: parsed.emailBody.trim(),
    smsBody: parsed.smsBody.trim(),
  };
}
