import {
  aiCampaignRecipients,
  aiCampaigns,
  customers,
  orders,
  organizations,
} from '@trayloop/database';
import { db } from '@trayloop/database';
import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { sendEmail, isEmailEnabled } from '../../lib/email.js';
import {
  OpenAIRequestError,
  generateCampaignMessage,
  isOpenAIEnabled,
} from '../../lib/openai.js';
import {
  assertOrganizationFeatureAccess,
  assertOrganizationHasAnyFeature,
} from '../../lib/feature-access.js';
import { ValidationError } from '../../lib/errors.js';
import type {
  CreateCampaignInput,
  GenerateCampaignMessageInput,
  ListCampaignsQuery,
  ReorderOpportunitiesQuery,
  ReactivationTargetsQuery,
} from './ai-sales.schema.js';

const FINAL_ORDER_STATUSES = ['confirmed', 'completed'] as const;
const FREQUENT_DAYS = 14;
const DORMANT_DAYS = 30;

type Segment = 'all' | 'frequent' | 'at_risk' | 'dormant';

interface RepeatCustomerProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  orderCount: number;
  averageOrderValueCents: number;
  totalRevenueCents: number;
  lastOrderAt: string;
  daysSinceLastOrder: number;
  segment: Segment;
}

interface SelectedTarget {
  targets: RepeatCustomerProfile[];
}

interface ReorderOpportunity {
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
  segment: Segment;
}

function nowUtc() {
  return new Date();
}

function getDaysSince(dateString: string) {
  const diff = nowUtc().getTime() - new Date(dateString).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

function getDaysUntil(dateString: string) {
  const diff = new Date(dateString).getTime() - nowUtc().getTime();
  return Math.ceil(diff / 86400000);
}

function addDays(dateString: string, days: number) {
  return new Date(new Date(dateString).getTime() + days * 86400000).toISOString();
}

function resolveSegment(daysSinceLastOrder: number): Segment {
  if (daysSinceLastOrder < FREQUENT_DAYS) return 'frequent';
  if (daysSinceLastOrder < DORMANT_DAYS) return 'at_risk';
  return 'dormant';
}

function formatCampaignHtml(body: string) {
  const htmlBody = body
    .split('\n')
    .map((line) => (line.trim() === '' ? '<br>' : `<p style="margin:0 0 8px">${line}</p>`))
    .join('\n');

  return `<div style="font-family:Inter,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#1C1917">
  <div style="background:#1C1917;padding:20px 24px;border-radius:8px 8px 0 0">
    <span style="color:#FFFFFF;font-size:16px;font-weight:700">TrayLoop</span>
  </div>
  <div style="padding:32px 24px;background:#FFFFFF;border:1px solid #E7E5E4;border-top:none;border-radius:0 0 8px 8px">
    ${htmlBody}
  </div>
  <p style="text-align:center;font-size:12px;color:#9CA3AF;margin-top:16px">Powered by TrayLoop</p>
</div>`;
}

async function getOrganization(orgId: string) {
  const [organization] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
    })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!organization) {
    throw new ValidationError('Organization not found');
  }

  return organization;
}

async function getRepeatCustomerProfiles(orgId: string): Promise<RepeatCustomerProfile[]> {
  const rows = await db
    .select({
      id: customers.id,
      email: customers.email,
      firstName: customers.firstName,
      lastName: customers.lastName,
      phone: customers.phone,
      company: customers.companyName,
      orderCount: sql<number>`count(${orders.id})::int`,
      averageOrderValueCents: sql<number>`coalesce(avg(${orders.totalAmount}), 0)::int`,
      totalRevenueCents: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
      lastOrderAt: sql<string>`max(coalesce(${orders.completedAt}, ${orders.createdAt}))`,
    })
    .from(customers)
    .innerJoin(
      orders,
      and(eq(orders.customerId, customers.id), eq(orders.organizationId, orgId)),
    )
    .where(
      and(
        eq(customers.organizationId, orgId),
        eq(customers.isActive, true),
        inArray(orders.status, [...FINAL_ORDER_STATUSES]),
      ),
    )
    .groupBy(
      customers.id,
      customers.email,
      customers.firstName,
      customers.lastName,
      customers.phone,
      customers.companyName,
    )
    .having(sql`count(${orders.id}) >= 2`)
    .orderBy(desc(sql`max(coalesce(${orders.completedAt}, ${orders.createdAt}))`));

  return rows.map((row) => {
    const daysSinceLastOrder = getDaysSince(row.lastOrderAt);
    return {
      id: row.id,
      name: `${row.firstName} ${row.lastName}`.trim(),
      email: row.email,
      phone: row.phone,
      company: row.company,
      orderCount: row.orderCount,
      averageOrderValueCents: row.averageOrderValueCents,
      totalRevenueCents: row.totalRevenueCents,
      lastOrderAt: row.lastOrderAt,
      daysSinceLastOrder,
      segment: resolveSegment(daysSinceLastOrder),
    };
  });
}

/**
 * Get ALL customers with at least 1 completed/confirmed order.
 * Used for the "all" segment so merchants can target any customer.
 */
async function getAllCustomerProfiles(orgId: string): Promise<RepeatCustomerProfile[]> {
  const rows = await db
    .select({
      id: customers.id,
      email: customers.email,
      firstName: customers.firstName,
      lastName: customers.lastName,
      phone: customers.phone,
      company: customers.companyName,
      orderCount: sql<number>`count(${orders.id})::int`,
      averageOrderValueCents: sql<number>`coalesce(avg(${orders.totalAmount}), 0)::int`,
      totalRevenueCents: sql<number>`coalesce(sum(${orders.totalAmount}), 0)::int`,
      lastOrderAt: sql<string>`max(coalesce(${orders.completedAt}, ${orders.createdAt}))`,
    })
    .from(customers)
    .innerJoin(
      orders,
      and(eq(orders.customerId, customers.id), eq(orders.organizationId, orgId)),
    )
    .where(
      and(
        eq(customers.organizationId, orgId),
        eq(customers.isActive, true),
        inArray(orders.status, [...FINAL_ORDER_STATUSES]),
      ),
    )
    .groupBy(
      customers.id,
      customers.email,
      customers.firstName,
      customers.lastName,
      customers.phone,
      customers.companyName,
    )
    .having(sql`count(${orders.id}) >= 1`)
    .orderBy(desc(sql`max(coalesce(${orders.completedAt}, ${orders.createdAt}))`));

  return rows.map((row) => {
    const daysSinceLastOrder = getDaysSince(row.lastOrderAt);
    return {
      id: row.id,
      name: `${row.firstName} ${row.lastName}`.trim(),
      email: row.email,
      phone: row.phone,
      company: row.company,
      orderCount: row.orderCount,
      averageOrderValueCents: row.averageOrderValueCents,
      totalRevenueCents: row.totalRevenueCents,
      lastOrderAt: row.lastOrderAt,
      daysSinceLastOrder,
      segment: resolveSegment(daysSinceLastOrder),
    };
  });
}

async function getCustomerProfilesForSegment(orgId: string, segment: Segment): Promise<RepeatCustomerProfile[]> {
  if (segment === 'all') {
    return getAllCustomerProfiles(orgId);
  }
  const profiles = await getRepeatCustomerProfiles(orgId);
  return profiles.filter((p) => p.segment === segment);
}

async function getReorderOpportunitiesForOrganization(orgId: string): Promise<ReorderOpportunity[]> {
  const profiles = await getRepeatCustomerProfiles(orgId);

  if (profiles.length === 0) {
    return [];
  }

  const profileByCustomerId = new Map(profiles.map((profile) => [profile.id, profile]));

  const orderRows = await db
    .select({
      customerId: orders.customerId,
      occurredAt: sql<string>`coalesce(${orders.completedAt}, ${orders.createdAt})`,
    })
    .from(orders)
    .innerJoin(
      customers,
      and(eq(customers.id, orders.customerId), eq(customers.organizationId, orgId)),
    )
    .where(
      and(
        eq(orders.organizationId, orgId),
        eq(customers.isActive, true),
        inArray(orders.status, [...FINAL_ORDER_STATUSES]),
        inArray(orders.customerId, profiles.map((profile) => profile.id)),
      ),
    )
    .orderBy(asc(orders.customerId), asc(sql`coalesce(${orders.completedAt}, ${orders.createdAt})`));

  const ordersByCustomerId = new Map<string, string[]>();

  for (const row of orderRows) {
    const current = ordersByCustomerId.get(row.customerId) ?? [];
    current.push(row.occurredAt);
    ordersByCustomerId.set(row.customerId, current);
  }

  const opportunities: ReorderOpportunity[] = [];

  for (const profile of profiles) {
    if (profile.segment === 'dormant') {
      continue;
    }

    const customerOrderDates = ordersByCustomerId.get(profile.id) ?? [];
    if (customerOrderDates.length < 2) {
      continue;
    }

    const intervals: number[] = [];
    for (let index = 1; index < customerOrderDates.length; index += 1) {
      const currentTime = new Date(customerOrderDates[index]!).getTime();
      const previousTime = new Date(customerOrderDates[index - 1]!).getTime();
      intervals.push(Math.max(1, Math.round((currentTime - previousTime) / 86400000)));
    }

    const cadenceDays = Math.max(
      1,
      Math.round(intervals.reduce((total, value) => total + value, 0) / intervals.length),
    );
    const expectedNextOrderAt = addDays(profile.lastOrderAt, cadenceDays);
    const daysUntilExpectedOrder = getDaysUntil(expectedNextOrderAt);
    const overdueDays = profile.daysSinceLastOrder - cadenceDays;

    const isDueSoon = daysUntilExpectedOrder <= 7;
    const isNotTooLate = overdueDays <= Math.max(7, cadenceDays);

    if (!isDueSoon || !isNotTooLate) {
      continue;
    }

    opportunities.push({
      customerId: profile.id,
      name: profile.name,
      email: profile.email,
      phone: profile.phone,
      company: profile.company,
      orderCount: profile.orderCount,
      averageOrderValueCents: profile.averageOrderValueCents,
      lastOrderAt: profile.lastOrderAt,
      daysSinceLastOrder: profile.daysSinceLastOrder,
      cadenceDays,
      expectedNextOrderAt,
      daysUntilExpectedOrder,
      overdueDays,
      confidence:
        overdueDays >= 0 && overdueDays <= Math.max(3, Math.round(cadenceDays * 0.35))
          ? 'high'
          : 'medium',
      segment: profile.segment,
    });
  }

  return opportunities.sort((left, right) => {
    if (left.confidence !== right.confidence) {
      return left.confidence === 'high' ? -1 : 1;
    }

    if (left.daysUntilExpectedOrder !== right.daysUntilExpectedOrder) {
      return left.daysUntilExpectedOrder - right.daysUntilExpectedOrder;
    }

    return right.averageOrderValueCents - left.averageOrderValueCents;
  });
}

function toSummary(profiles: RepeatCustomerProfile[]) {
  const grouped = {
    frequent: profiles.filter((profile) => profile.segment === 'frequent'),
    at_risk: profiles.filter((profile) => profile.segment === 'at_risk'),
    dormant: profiles.filter((profile) => profile.segment === 'dormant'),
  };

  const sumRevenue = (items: RepeatCustomerProfile[]) =>
    items.reduce((total, item) => total + item.averageOrderValueCents, 0);

  return {
    repeatCustomerCount: profiles.length,
    segments: {
      frequent: {
        count: grouped.frequent.length,
        potentialRevenueCents: sumRevenue(grouped.frequent),
      },
      at_risk: {
        count: grouped.at_risk.length,
        potentialRevenueCents: sumRevenue(grouped.at_risk),
      },
      dormant: {
        count: grouped.dormant.length,
        potentialRevenueCents: sumRevenue(grouped.dormant),
      },
    },
    actionableTargets: grouped.at_risk.length + grouped.dormant.length,
    actionablePotentialRevenueCents: sumRevenue(grouped.at_risk) + sumRevenue(grouped.dormant),
  };
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const offset = (page - 1) * pageSize;
  return items.slice(offset, offset + pageSize);
}

async function loadSelectedTargets(
  orgId: string,
  segment: Segment,
  selectedCustomerIds: string[],
): Promise<SelectedTarget> {
  const uniqueIds = [...new Set(selectedCustomerIds)];
  const profiles = segment === 'all'
    ? await getAllCustomerProfiles(orgId)
    : await getRepeatCustomerProfiles(orgId);
  const targets = profiles.filter(
    (profile) => (segment === 'all' || profile.segment === segment) && uniqueIds.includes(profile.id),
  );

  if (targets.length === 0) {
    throw new ValidationError('No eligible repeat customers were selected for this campaign.');
  }

  if (targets.length !== uniqueIds.length) {
    throw new ValidationError('Some selected customers are no longer eligible for this campaign.');
  }

  return { targets };
}

async function sendCampaignEmails(
  subject: string,
  body: string,
  recipients: RepeatCustomerProfile[],
) {
  const sentAt = new Date();
  const results: Array<{ customerId: string; status: 'sent' | 'failed'; errorMessage: string | null }> = [];

  for (const recipient of recipients) {
    try {
      const delivered = await sendEmail({
        to: recipient.email,
        subject,
        text: body,
        html: formatCampaignHtml(body),
      });

      results.push({
        customerId: recipient.id,
        status: delivered ? 'sent' : 'failed',
        errorMessage: delivered ? null : 'Email provider rejected the message.',
      });
    } catch (error) {
      results.push({
        customerId: recipient.id,
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Email delivery failed.',
      });
    }
  }

  return { sentAt, results };
}

export async function getReactivationSummary(orgId: string) {
  await assertOrganizationFeatureAccess(orgId, 'campaigns.reactivation');
  const [repeatProfiles, allProfiles] = await Promise.all([
    getRepeatCustomerProfiles(orgId),
    getAllCustomerProfiles(orgId),
  ]);
  const summary = toSummary(repeatProfiles);
  return {
    ...summary,
    allCustomers: allProfiles.length,
    allRevenueCents: allProfiles.reduce((s, p) => s + p.averageOrderValueCents, 0),
  };
}

export async function getReactivationTargets(orgId: string, query: ReactivationTargetsQuery) {
  await assertOrganizationFeatureAccess(orgId, 'campaigns.reactivation');
  const profiles = await getCustomerProfilesForSegment(orgId, query.segment as Segment);
  const pageItems = paginate(profiles, query.page, query.pageSize);

  return {
    targets: pageItems,
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      total: profiles.length,
      totalPages: Math.max(1, Math.ceil(profiles.length / query.pageSize)),
    },
  };
}

export async function getReorderOpportunities(orgId: string, query: ReorderOpportunitiesQuery) {
  await assertOrganizationFeatureAccess(orgId, 'reorder.basic');
  const opportunities = await getReorderOpportunitiesForOrganization(orgId);

  return {
    data: opportunities.slice(0, query.limit),
    meta: {
      total: opportunities.length,
      limit: query.limit,
      totalPotentialRevenueCents: opportunities.reduce(
        (total, opportunity) => total + opportunity.averageOrderValueCents,
        0,
      ),
    },
  };
}

export async function generateMessageForTargets(
  orgId: string,
  input: GenerateCampaignMessageInput,
) {
  await assertOrganizationFeatureAccess(
    orgId,
    input.channelIntent === 'sms_copy' ? 'campaigns.ai_sms' : 'campaigns.ai_email',
  );

  if (input.campaignKind === 'reactivation') {
    await assertOrganizationFeatureAccess(orgId, 'campaigns.reactivation');
  }

  if (!isOpenAIEnabled()) {
    throw new ValidationError('OpenAI is not configured yet. Add OPENAI_API_KEY to enable AI message generation.');
  }

  const [organization, targets] = await Promise.all([
    getOrganization(orgId),
    loadSelectedTargets(orgId, input.segment, input.selectedCustomerIds),
  ]);

  const reorderOpportunities = input.campaignKind === 'reorder_reminder'
    ? await getReorderOpportunitiesForOrganization(orgId)
    : [];
  const reorderOpportunityByCustomerId = new Map(
    reorderOpportunities.map((opportunity) => [opportunity.customerId, opportunity]),
  );

  const estimatedRevenueCents = targets.targets.reduce(
    (total, target) => total + target.averageOrderValueCents,
    0,
  );

  // Map 'all' to 'at_risk' for OpenAI prompt context — 'all' is a targeting concept, not a tone
  const promptSegment = input.segment === 'all' ? 'at_risk' : input.segment;
  let generated;
  try {
    generated = await generateCampaignMessage({
      merchantName: organization.name,
      segment: promptSegment,
      campaignKind: input.campaignKind,
      targetCount: targets.targets.length,
      estimatedRevenueCents,
      goalNotes: input.goalNotes,
      toneNotes: input.toneNotes,
      customerSummaries: targets.targets.map((target) => ({
        name: target.name,
        company: target.company,
        daysSinceLastOrder: target.daysSinceLastOrder,
        avgOrderValueCents: target.averageOrderValueCents,
        orderCount: target.orderCount,
        cadenceDays: reorderOpportunityByCustomerId.get(target.id)?.cadenceDays ?? null,
        daysUntilExpectedOrder:
          reorderOpportunityByCustomerId.get(target.id)?.daysUntilExpectedOrder ?? null,
      })),
    });
  } catch (error) {
    if (error instanceof OpenAIRequestError) {
      throw new ValidationError(
        `AI message generation is unavailable right now: ${error.message}`,
      );
    }

    if (error instanceof Error) {
      throw new ValidationError(error.message);
    }

    throw new ValidationError('AI message generation failed. Please try again.');
  }

  return {
    campaignKind: input.campaignKind,
    segment: input.segment,
    channelIntent: input.channelIntent,
    targetCount: targets.targets.length,
    estimatedRevenueCents,
    generated,
    targets: targets.targets.map((target) => ({
      id: target.id,
      name: target.name,
      email: target.email,
      phone: target.phone,
      company: target.company,
      daysSinceLastOrder: target.daysSinceLastOrder,
      averageOrderValueCents: target.averageOrderValueCents,
      orderCount: target.orderCount,
      segment: target.segment,
    })),
  };
}

export async function createCampaign(
  orgId: string,
  userId: string,
  input: CreateCampaignInput,
) {
  await assertOrganizationFeatureAccess(
    orgId,
    input.channel === 'sms_copy' ? 'campaigns.ai_sms' : 'campaigns.ai_email',
  );
  const selection = await loadSelectedTargets(orgId, input.segment, input.selectedCustomerIds);
  const estimatedRevenueCents = selection.targets.reduce(
    (total, target) => total + target.averageOrderValueCents,
    0,
  );

  if (input.status === 'sent' && input.channel === 'email' && !isEmailEnabled()) {
    throw new ValidationError('Email is not configured. Set up your email provider before sending campaigns.');
  }

  const now = new Date();
  const [campaign] = await db
    .insert(aiCampaigns)
    .values({
      organizationId: orgId,
      createdByUserId: userId,
      // 'all' is a query-time targeting concept; store as 'frequent' in the campaign record
      segment: input.segment === 'all' ? 'frequent' : input.segment,
      channel: input.channel,
      status: input.status,
      generatedSubject: input.generatedSubject,
      generatedEmailBody: input.generatedEmailBody,
      generatedSmsBody: input.generatedSmsBody,
      selectedTargetCount: selection.targets.length,
      estimatedRevenueCents,
      sentAt: input.status === 'sent' || input.status === 'copied' ? now : null,
      updatedAt: now,
    })
    .returning({ id: aiCampaigns.id });

  const initialDeliveryStatus: 'pending' | 'copied' =
    input.status === 'copied' ? 'copied' : 'pending';

  await db.insert(aiCampaignRecipients).values(
    selection.targets.map((target) => ({
      campaignId: campaign.id,
      customerId: target.id,
      channel: input.channel,
      deliveryStatus: initialDeliveryStatus,
      sentAt: input.status === 'copied' ? now : null,
      updatedAt: now,
    })),
  );

  if (input.status === 'sent' && input.channel === 'email') {
    const delivery = await sendCampaignEmails(
      input.generatedSubject,
      input.generatedEmailBody,
      selection.targets,
    );

    for (const result of delivery.results) {
      await db
        .update(aiCampaignRecipients)
        .set({
          deliveryStatus: result.status,
          errorMessage: result.errorMessage,
          sentAt: result.status === 'sent' ? delivery.sentAt : null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(aiCampaignRecipients.campaignId, campaign.id),
            eq(aiCampaignRecipients.customerId, result.customerId),
          ),
        );
    }

    await db
      .update(aiCampaigns)
      .set({
        sentAt: delivery.sentAt,
        updatedAt: new Date(),
      })
      .where(eq(aiCampaigns.id, campaign.id));
  }

  return getCampaignById(orgId, campaign.id);
}

async function getCampaignById(orgId: string, campaignId: string) {
  const [campaign] = await db
    .select({
      id: aiCampaigns.id,
      segment: aiCampaigns.segment,
      channel: aiCampaigns.channel,
      status: aiCampaigns.status,
      generatedSubject: aiCampaigns.generatedSubject,
      generatedEmailBody: aiCampaigns.generatedEmailBody,
      generatedSmsBody: aiCampaigns.generatedSmsBody,
      selectedTargetCount: aiCampaigns.selectedTargetCount,
      estimatedRevenueCents: aiCampaigns.estimatedRevenueCents,
      sentAt: aiCampaigns.sentAt,
      createdAt: aiCampaigns.createdAt,
    })
    .from(aiCampaigns)
    .where(and(eq(aiCampaigns.organizationId, orgId), eq(aiCampaigns.id, campaignId)))
    .limit(1);

  if (!campaign) {
    throw new ValidationError('Campaign not found');
  }

  const recipientRows = await db
    .select({
      deliveryStatus: aiCampaignRecipients.deliveryStatus,
      count: sql<number>`count(*)::int`,
    })
    .from(aiCampaignRecipients)
    .where(eq(aiCampaignRecipients.campaignId, campaignId))
    .groupBy(aiCampaignRecipients.deliveryStatus);

  const summary = {
    pending: 0,
    sent: 0,
    copied: 0,
    failed: 0,
  };

  for (const row of recipientRows) {
    summary[row.deliveryStatus] = row.count;
  }

  return {
    ...campaign,
    recipientSummary: summary,
  };
}

export async function listCampaigns(orgId: string, query: ListCampaignsQuery) {
  await assertOrganizationHasAnyFeature(orgId, [
    'campaigns.ai_email',
    'campaigns.ai_sms',
    'campaigns.reactivation',
  ]);
  const campaigns = await db
    .select({
      id: aiCampaigns.id,
      segment: aiCampaigns.segment,
      channel: aiCampaigns.channel,
      status: aiCampaigns.status,
      generatedSubject: aiCampaigns.generatedSubject,
      selectedTargetCount: aiCampaigns.selectedTargetCount,
      estimatedRevenueCents: aiCampaigns.estimatedRevenueCents,
      sentAt: aiCampaigns.sentAt,
      createdAt: aiCampaigns.createdAt,
    })
    .from(aiCampaigns)
    .where(eq(aiCampaigns.organizationId, orgId))
    .orderBy(desc(aiCampaigns.createdAt))
    .limit(query.limit);

  if (campaigns.length === 0) {
    return [];
  }

  const campaignIds = campaigns.map((campaign) => campaign.id);
  const recipientRows = await db
    .select({
      campaignId: aiCampaignRecipients.campaignId,
      deliveryStatus: aiCampaignRecipients.deliveryStatus,
      count: sql<number>`count(*)::int`,
    })
    .from(aiCampaignRecipients)
    .where(inArray(aiCampaignRecipients.campaignId, campaignIds))
    .groupBy(aiCampaignRecipients.campaignId, aiCampaignRecipients.deliveryStatus);

  const summaries = new Map<
    string,
    { pending: number; sent: number; copied: number; failed: number }
  >();

  for (const row of recipientRows) {
    const current = summaries.get(row.campaignId) ?? {
      pending: 0,
      sent: 0,
      copied: 0,
      failed: 0,
    };
    current[row.deliveryStatus] = row.count;
    summaries.set(row.campaignId, current);
  }

  return campaigns.map((campaign) => ({
    ...campaign,
    recipientSummary:
      summaries.get(campaign.id) ?? {
        pending: 0,
        sent: 0,
        copied: 0,
        failed: 0,
      },
  }));
}
