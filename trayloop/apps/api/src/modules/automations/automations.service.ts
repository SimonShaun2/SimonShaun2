import {
  aiCampaignRecipients,
  aiCampaigns,
  automationRunRecipients,
  automationRuns,
  automationRules,
  customers,
  organizations,
} from '@trayloop/database';
import { db } from '@trayloop/database';
import { and, desc, eq, gte, inArray, sql } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import { isEmailEnabled } from '../../lib/email.js';
import * as aiSalesService from '../ai-sales/ai-sales.service.js';
import {
  automationRuleUpdateSchema,
  type AutomationEvaluateInput,
  type AutomationProcessInput,
  type AutomationRuleUpdateInput,
  type AutomationRunsQuery,
  type AutomationRunUpdateInput,
} from './automations.schema.js';

const DEFAULT_RULES = [
  {
    name: 'At-risk reactivation',
    ruleType: 'reactivation',
    segment: 'at_risk',
    status: 'active',
    approvalMode: 'approval_required',
    timingWindowDays: 7,
    throttleDays: 7,
    maxTargets: 20,
    goalNotes: 'Reach out before repeat catering demand slips any further.',
    toneNotes: 'Warm, concise, useful, and operator-friendly.',
  },
  {
    name: 'Dormant reactivation',
    ruleType: 'reactivation',
    segment: 'dormant',
    status: 'active',
    approvalMode: 'approval_required',
    timingWindowDays: 7,
    throttleDays: 14,
    maxTargets: 20,
    goalNotes: 'Bring back valuable dormant catering accounts.',
    toneNotes: 'Direct, helpful, and grounded in repeat business.',
  },
  {
    name: 'Reorder reminders',
    ruleType: 'reorder_reminder',
    segment: 'frequent',
    status: 'active',
    approvalMode: 'approval_required',
    timingWindowDays: 7,
    throttleDays: 7,
    maxTargets: 15,
    goalNotes: 'Catch regular catering buyers near their usual reorder window.',
    toneNotes: 'Timely, confident, concise, and service-oriented.',
  },
] as const;

type RuleRow = typeof automationRules.$inferSelect;
type RunRow = typeof automationRuns.$inferSelect;

type CandidateTarget = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  orderCount: number;
  averageOrderValueCents: number;
  daysSinceLastOrder: number;
};

function isDue(status: string, scheduledFor: Date) {
  return (status === 'approved' || status === 'queued') && scheduledFor.getTime() <= Date.now();
}

function summarizeRule(rule: RuleRow) {
  return {
    id: rule.id,
    name: rule.name,
    ruleType: rule.ruleType,
    segment: rule.segment,
    status: rule.status,
    approvalMode: rule.approvalMode,
    emailEnabled: rule.emailEnabled,
    smsMode: rule.smsMode,
    timingWindowDays: rule.timingWindowDays,
    throttleDays: rule.throttleDays,
    maxTargets: rule.maxTargets,
    goalNotes: rule.goalNotes,
    toneNotes: rule.toneNotes,
    lastEvaluatedAt: rule.lastEvaluatedAt,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
  };
}

async function getOrganization(orgId: string) {
  const [organization] = await db
    .select({ id: organizations.id, name: organizations.name })
    .from(organizations)
    .where(eq(organizations.id, orgId))
    .limit(1);

  if (!organization) {
    throw new ValidationError('Organization not found');
  }

  return organization;
}

async function ensureDefaultRules(orgId: string, userId: string) {
  const existing = await db
    .select()
    .from(automationRules)
    .where(eq(automationRules.organizationId, orgId));

  const existingKey = new Set(existing.map((rule) => `${rule.ruleType}:${rule.segment}`));
  const missing = DEFAULT_RULES.filter((rule) => !existingKey.has(`${rule.ruleType}:${rule.segment}`));

  if (missing.length > 0) {
    await db.insert(automationRules).values(
      missing.map((rule) => ({
        organizationId: orgId,
        createdByUserId: userId,
        ...rule,
      })),
    );
  }

  return db
    .select()
    .from(automationRules)
    .where(eq(automationRules.organizationId, orgId))
    .orderBy(automationRules.ruleType, automationRules.segment);
}

async function getSuppressedCustomerIds(orgId: string, customerIds: string[], throttleDays: number) {
  if (customerIds.length === 0) {
    return new Set<string>();
  }

  const since = new Date(Date.now() - throttleDays * 86400000);

  const [campaignTouches, automationTouches] = await Promise.all([
    db
      .select({ customerId: aiCampaignRecipients.customerId })
      .from(aiCampaignRecipients)
      .innerJoin(aiCampaigns, eq(aiCampaigns.id, aiCampaignRecipients.campaignId))
      .where(
        and(
          eq(aiCampaigns.organizationId, orgId),
          inArray(aiCampaignRecipients.customerId, customerIds),
          inArray(aiCampaigns.status, ['sent', 'copied']),
          gte(aiCampaigns.createdAt, since),
        ),
      ),
    db
      .select({ customerId: automationRunRecipients.customerId })
      .from(automationRunRecipients)
      .innerJoin(automationRuns, eq(automationRuns.id, automationRunRecipients.automationRunId))
      .where(
        and(
          eq(automationRuns.organizationId, orgId),
          inArray(automationRunRecipients.customerId, customerIds),
          inArray(automationRuns.status, ['pending_approval', 'approved', 'queued', 'sent', 'copied']),
          gte(automationRuns.createdAt, since),
        ),
      ),
  ]);

  return new Set([
    ...campaignTouches.map((row) => row.customerId),
    ...automationTouches.map((row) => row.customerId),
  ]);
}

async function getRuleTargets(orgId: string, rule: RuleRow): Promise<{
  targets: CandidateTarget[];
  estimatedRevenueCents: number;
  reasonSummary: string;
  campaignKind: 'reactivation' | 'reorder_reminder';
}> {
  if (rule.ruleType === 'reorder_reminder') {
    const result = await aiSalesService.getReorderOpportunities(orgId, {
      limit: Math.min(rule.maxTargets * 2, 50),
    });
    const opportunities = result.data.filter((opportunity) => opportunity.daysUntilExpectedOrder <= rule.timingWindowDays);
    const suppressed = await getSuppressedCustomerIds(
      orgId,
      opportunities.map((opportunity) => opportunity.customerId),
      rule.throttleDays,
    );
    const targets = opportunities
      .filter((opportunity) => !suppressed.has(opportunity.customerId))
      .slice(0, rule.maxTargets)
      .map((opportunity) => ({
        id: opportunity.customerId,
        name: opportunity.name,
        email: opportunity.email,
        phone: opportunity.phone,
        company: opportunity.company,
        orderCount: opportunity.orderCount,
        averageOrderValueCents: opportunity.averageOrderValueCents,
        daysSinceLastOrder: opportunity.daysSinceLastOrder,
      }));

    return {
      targets,
      estimatedRevenueCents: targets.reduce((sum, target) => sum + target.averageOrderValueCents, 0),
      reasonSummary:
        targets.length > 0
          ? `${targets.length} likely reorder customers are within ${rule.timingWindowDays} days of their expected reorder window.`
          : 'No likely reorder customers are ready right now.',
      campaignKind: 'reorder_reminder',
    };
  }

  const result = await aiSalesService.getReactivationTargets(orgId, {
    segment: rule.segment as 'at_risk' | 'dormant',
    page: 1,
    pageSize: Math.min(rule.maxTargets * 2, 100),
  });

  const suppressed = await getSuppressedCustomerIds(
    orgId,
    result.targets.map((target) => target.id),
    rule.throttleDays,
  );

  const targets = result.targets
    .filter((target) => !suppressed.has(target.id))
    .slice(0, rule.maxTargets)
    .map((target) => ({
      id: target.id,
      name: target.name,
      email: target.email,
      phone: target.phone,
      company: target.company,
      orderCount: target.orderCount,
      averageOrderValueCents: target.averageOrderValueCents,
      daysSinceLastOrder: target.daysSinceLastOrder,
    }));

  return {
    targets,
    estimatedRevenueCents: targets.reduce((sum, target) => sum + target.averageOrderValueCents, 0),
    reasonSummary:
      rule.segment === 'dormant'
        ? `${targets.length} dormant repeat customers still represent recoverable catering demand.`
        : `${targets.length} at-risk repeat customers are reachable before they go cold.`,
    campaignKind: 'reactivation',
  };
}

async function createRunForRule(orgId: string, userId: string, rule: RuleRow) {
  const ruleTargets = await getRuleTargets(orgId, rule);

  if (ruleTargets.targets.length === 0) {
    await db
      .update(automationRules)
      .set({ lastEvaluatedAt: new Date(), updatedAt: new Date() })
      .where(eq(automationRules.id, rule.id));
    return null;
  }

  const generated = await aiSalesService.generateMessageForTargets(orgId, {
    segment: rule.segment as 'at_risk' | 'dormant' | 'frequent',
    selectedCustomerIds: ruleTargets.targets.map((target) => target.id),
    channelIntent: rule.emailEnabled ? 'email' : 'sms_copy',
    campaignKind: ruleTargets.campaignKind,
    goalNotes: rule.goalNotes ?? undefined,
    toneNotes: rule.toneNotes ?? undefined,
  });

  const now = new Date();
  const initialStatus = rule.approvalMode === 'autopilot' ? 'queued' : 'pending_approval';
  const executionMode = rule.approvalMode === 'autopilot' ? 'autopilot' : 'scheduled';

  const [run] = await db
    .insert(automationRuns)
    .values({
      organizationId: orgId,
      automationRuleId: rule.id,
      createdByUserId: userId,
      ruleType: rule.ruleType,
      segment: rule.segment,
      executionMode,
      status: initialStatus,
      reasonSummary: ruleTargets.reasonSummary,
      generatedSubject: generated.generated.subject,
      generatedEmailBody: generated.generated.emailBody,
      generatedSmsBody: generated.generated.smsBody,
      selectedTargetCount: ruleTargets.targets.length,
      estimatedRevenueCents: ruleTargets.estimatedRevenueCents,
      scheduledFor: now,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await db.insert(automationRunRecipients).values(
    ruleTargets.targets.map((target) => ({
      automationRunId: run.id,
      customerId: target.id,
      channel: rule.emailEnabled ? 'email' : 'sms_copy',
      deliveryStatus: initialStatus === 'pending_approval' ? 'pending' : 'pending',
      createdAt: now,
      updatedAt: now,
    })),
  );

  await db
    .update(automationRules)
    .set({ lastEvaluatedAt: now, updatedAt: now })
    .where(eq(automationRules.id, rule.id));

  return run;
}

async function getRunRecipients(runIds: string[]) {
  if (runIds.length === 0) {
    return new Map<string, Array<{ customerId: string; name: string; email: string; company: string | null; deliveryStatus: string; channel: string }>>();
  }

  const rows = await db
    .select({
      automationRunId: automationRunRecipients.automationRunId,
      customerId: automationRunRecipients.customerId,
      deliveryStatus: automationRunRecipients.deliveryStatus,
      channel: automationRunRecipients.channel,
      firstName: customers.firstName,
      lastName: customers.lastName,
      email: customers.email,
      company: customers.companyName,
    })
    .from(automationRunRecipients)
    .innerJoin(customers, eq(customers.id, automationRunRecipients.customerId))
    .where(inArray(automationRunRecipients.automationRunId, runIds));

  const map = new Map<string, Array<{ customerId: string; name: string; email: string; company: string | null; deliveryStatus: string; channel: string }>>();
  for (const row of rows) {
    const current = map.get(row.automationRunId) ?? [];
    current.push({
      customerId: row.customerId,
      name: `${row.firstName} ${row.lastName}`.trim(),
      email: row.email,
      company: row.company,
      deliveryStatus: row.deliveryStatus,
      channel: row.channel,
    });
    map.set(row.automationRunId, current);
  }

  return map;
}

async function getRuleMap(orgId: string) {
  const rules = await db
    .select()
    .from(automationRules)
    .where(eq(automationRules.organizationId, orgId));

  return new Map(rules.map((rule) => [rule.id, rule]));
}

async function loadRuns(orgId: string, query: AutomationRunsQuery) {
  const conditions = [eq(automationRuns.organizationId, orgId)];
  if (query.status) {
    conditions.push(eq(automationRuns.status, query.status));
  }
  if (query.ruleId) {
    conditions.push(eq(automationRuns.automationRuleId, query.ruleId));
  }

  const rows = await db
    .select()
    .from(automationRuns)
    .where(and(...conditions))
    .orderBy(desc(automationRuns.createdAt))
    .limit(query.limit);

  const ruleMap = await getRuleMap(orgId);
  const recipientMap = await getRunRecipients(rows.map((row) => row.id));

  return rows.map((row) => {
    const recipients = recipientMap.get(row.id) ?? [];
    const summary = recipients.reduce(
      (acc, recipient) => {
        if (recipient.deliveryStatus === 'sent') acc.sent += 1;
        else if (recipient.deliveryStatus === 'copied') acc.copied += 1;
        else if (recipient.deliveryStatus === 'failed') acc.failed += 1;
        else if (recipient.deliveryStatus === 'skipped') acc.skipped += 1;
        else acc.pending += 1;
        return acc;
      },
      { pending: 0, sent: 0, copied: 0, skipped: 0, failed: 0 },
    );

    return {
      id: row.id,
      ruleId: row.automationRuleId,
      ruleName: ruleMap.get(row.automationRuleId)?.name ?? 'Automation',
      ruleType: row.ruleType,
      segment: row.segment,
      executionMode: row.executionMode,
      status: row.status,
      reasonSummary: row.reasonSummary,
      generatedSubject: row.generatedSubject,
      generatedEmailBody: row.generatedEmailBody,
      generatedSmsBody: row.generatedSmsBody,
      selectedTargetCount: row.selectedTargetCount,
      estimatedRevenueCents: row.estimatedRevenueCents,
      scheduledFor: row.scheduledFor,
      reviewedAt: row.reviewedAt,
      sentAt: row.sentAt,
      errorMessage: row.errorMessage,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      recipientSummary: summary,
      recipients,
    };
  });
}

async function sendRun(orgId: string, userId: string, run: RunRow) {
  const [rule] = await db
    .select()
    .from(automationRules)
    .where(and(eq(automationRules.organizationId, orgId), eq(automationRules.id, run.automationRuleId)))
    .limit(1);

  if (!rule) {
    throw new ValidationError('Automation rule not found');
  }

  const recipients = await db
    .select({ customerId: automationRunRecipients.customerId })
    .from(automationRunRecipients)
    .where(eq(automationRunRecipients.automationRunId, run.id));

  if (recipients.length === 0) {
    throw new ValidationError('Automation run has no recipients');
  }

  if (!rule.emailEnabled) {
    await db
      .update(automationRuns)
      .set({ status: 'skipped', errorMessage: 'Email sending is disabled for this automation.', updatedAt: new Date() })
      .where(eq(automationRuns.id, run.id));
    await db
      .update(automationRunRecipients)
      .set({ deliveryStatus: 'skipped', skipReason: 'Email disabled', updatedAt: new Date() })
      .where(eq(automationRunRecipients.automationRunId, run.id));
    return;
  }

  if (!isEmailEnabled()) {
    await db
      .update(automationRuns)
      .set({ status: 'failed', errorMessage: 'Email provider is not configured.', updatedAt: new Date() })
      .where(eq(automationRuns.id, run.id));
    return;
  }

  const campaign = await aiSalesService.createCampaign(orgId, userId, {
    segment: run.segment as 'all' | 'frequent' | 'at_risk' | 'dormant',
    channel: 'email',
    status: 'sent',
    selectedCustomerIds: recipients.map((recipient) => recipient.customerId),
    generatedSubject: run.generatedSubject ?? '',
    generatedEmailBody: run.generatedEmailBody ?? '',
    generatedSmsBody: run.generatedSmsBody ?? '',
  });

  const campaignRecipients = await db
    .select({
      customerId: aiCampaignRecipients.customerId,
      deliveryStatus: aiCampaignRecipients.deliveryStatus,
      sentAt: aiCampaignRecipients.sentAt,
      errorMessage: aiCampaignRecipients.errorMessage,
    })
    .from(aiCampaignRecipients)
    .where(eq(aiCampaignRecipients.campaignId, campaign.id));

  const campaignRecipientMap = new Map(campaignRecipients.map((recipient) => [recipient.customerId, recipient]));
  for (const recipient of recipients) {
    const match = campaignRecipientMap.get(recipient.customerId);
    await db
      .update(automationRunRecipients)
      .set({
        deliveryStatus: match?.deliveryStatus ?? 'failed',
        sentAt: match?.sentAt ?? null,
        skipReason: match?.errorMessage ?? null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(automationRunRecipients.automationRunId, run.id),
          eq(automationRunRecipients.customerId, recipient.customerId),
        ),
      );
  }

  await db
    .update(automationRuns)
    .set({
      aiCampaignId: campaign.id,
      status: campaign.recipientSummary.failed > 0 && campaign.recipientSummary.sent === 0 ? 'failed' : 'sent',
      sentAt: new Date(),
      reviewedAt: run.reviewedAt ?? new Date(),
      errorMessage:
        campaign.recipientSummary.failed > 0 && campaign.recipientSummary.sent === 0
          ? 'All automated deliveries failed.'
          : null,
      updatedAt: new Date(),
    })
    .where(eq(automationRuns.id, run.id));
}

export async function listAutomationRules(orgId: string, userId: string) {
  const rules = await ensureDefaultRules(orgId, userId);
  return rules.map(summarizeRule);
}

export async function updateAutomationRule(
  orgId: string,
  _userId: string,
  ruleId: string,
  input: AutomationRuleUpdateInput,
) {
  const [rule] = await db
    .select()
    .from(automationRules)
    .where(and(eq(automationRules.organizationId, orgId), eq(automationRules.id, ruleId)))
    .limit(1);

  if (!rule) {
    throw new NotFoundError('Automation rule');
  }

  if (input.approvalMode === 'autopilot' && input.emailEnabled === false) {
    throw new ValidationError('Autopilot requires email sending to stay enabled.');
  }

  const next = automationRuleUpdateSchema.parse(input);
  const [updated] = await db
    .update(automationRules)
    .set({
      ...next,
      updatedAt: new Date(),
    })
    .where(eq(automationRules.id, ruleId))
    .returning();

  return summarizeRule(updated);
}

export async function evaluateAutomationRules(orgId: string, userId: string, input: AutomationEvaluateInput) {
  const rules = await ensureDefaultRules(orgId, userId);
  const eligibleRules = rules.filter((rule) => rule.status === 'active');
  const filteredRules = input.ruleIds?.length
    ? eligibleRules.filter((rule) => input.ruleIds?.includes(rule.id))
    : eligibleRules;

  const createdRuns: string[] = [];
  const skippedRules: Array<{ ruleId: string; name: string; reason: string }> = [];
  const errors: Array<{ ruleId: string; name: string; error: string }> = [];

  for (const rule of filteredRules) {
    try {
      const run = await createRunForRule(orgId, userId, rule);
      if (!run) {
        skippedRules.push({ ruleId: rule.id, name: rule.name, reason: 'No eligible customers matched this automation.' });
        continue;
      }
      createdRuns.push(run.id);
    } catch (error) {
      errors.push({
        ruleId: rule.id,
        name: rule.name,
        error: error instanceof Error ? error.message : 'Evaluation failed',
      });
    }
  }

  const autopilotRuns = await db
    .select()
    .from(automationRuns)
    .where(and(eq(automationRuns.organizationId, orgId), inArray(automationRuns.id, createdRuns), eq(automationRuns.status, 'queued')));

  for (const run of autopilotRuns) {
    await sendRun(orgId, userId, run);
  }

  const runs = createdRuns.length > 0
    ? await listAutomationRuns(orgId, { limit: 50, ruleId: undefined, status: undefined })
    : [];

  return {
    createdCount: createdRuns.length,
    skippedRules,
    errors,
    runs: runs.filter((run) => createdRuns.includes(run.id)),
  };
}

export async function listAutomationRuns(orgId: string, query: AutomationRunsQuery) {
  return loadRuns(orgId, query);
}

export async function updateAutomationRun(
  orgId: string,
  userId: string,
  runId: string,
  input: AutomationRunUpdateInput,
) {
  const [run] = await db
    .select()
    .from(automationRuns)
    .where(and(eq(automationRuns.organizationId, orgId), eq(automationRuns.id, runId)))
    .limit(1);

  if (!run) {
    throw new NotFoundError('Automation run');
  }

  const now = new Date();

  if (input.action === 'save') {
    await db
      .update(automationRuns)
      .set({
        generatedSubject: input.generatedSubject ?? run.generatedSubject,
        generatedEmailBody: input.generatedEmailBody ?? run.generatedEmailBody,
        generatedSmsBody: input.generatedSmsBody ?? run.generatedSmsBody,
        scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : run.scheduledFor,
        updatedAt: now,
      })
      .where(eq(automationRuns.id, runId));
  } else if (input.action === 'skip') {
    await db
      .update(automationRuns)
      .set({ status: 'skipped', reviewedAt: now, updatedAt: now, errorMessage: input.errorMessage ?? null })
      .where(eq(automationRuns.id, runId));
    await db
      .update(automationRunRecipients)
      .set({ deliveryStatus: 'skipped', skipReason: input.errorMessage ?? 'Skipped by merchant', updatedAt: now })
      .where(eq(automationRunRecipients.automationRunId, runId));
  } else if (input.action === 'cancel') {
    await db
      .update(automationRuns)
      .set({ status: 'canceled', reviewedAt: now, updatedAt: now })
      .where(eq(automationRuns.id, runId));
  } else if (input.action === 'approve') {
    const scheduledFor = input.scheduledFor ? new Date(input.scheduledFor) : run.scheduledFor;
    await db
      .update(automationRuns)
      .set({
        status: scheduledFor.getTime() <= now.getTime() ? 'approved' : 'approved',
        reviewedAt: now,
        scheduledFor,
        generatedSubject: input.generatedSubject ?? run.generatedSubject,
        generatedEmailBody: input.generatedEmailBody ?? run.generatedEmailBody,
        generatedSmsBody: input.generatedSmsBody ?? run.generatedSmsBody,
        updatedAt: now,
      })
      .where(eq(automationRuns.id, runId));

    const [updatedRun] = await db
      .select()
      .from(automationRuns)
      .where(eq(automationRuns.id, runId))
      .limit(1);

    if (updatedRun && isDue(updatedRun.status, updatedRun.scheduledFor)) {
      await sendRun(orgId, userId, updatedRun);
    }
  }

  const [updated] = await loadRuns(orgId, { limit: 1, ruleId: undefined, status: undefined }).then((runs) => runs.filter((item) => item.id === runId));
  if (!updated) {
    throw new NotFoundError('Automation run');
  }
  return updated;
}

export async function processAutomationRuns(
  orgId: string,
  userId: string,
  input: AutomationProcessInput,
) {
  const conditions = [eq(automationRuns.organizationId, orgId), inArray(automationRuns.status, ['approved', 'queued'])];
  if (input.runIds?.length) {
    conditions.push(inArray(automationRuns.id, input.runIds));
  }

  const dueRuns = await db
    .select()
    .from(automationRuns)
    .where(and(...conditions))
    .orderBy(automationRuns.scheduledFor);

  const processed: string[] = [];
  const skipped: string[] = [];
  const failed: Array<{ runId: string; error: string }> = [];

  for (const run of dueRuns) {
    if (!isDue(run.status, run.scheduledFor)) {
      skipped.push(run.id);
      continue;
    }

    try {
      await sendRun(orgId, userId, run);
      processed.push(run.id);
    } catch (error) {
      await db
        .update(automationRuns)
        .set({ status: 'failed', errorMessage: error instanceof Error ? error.message : 'Processing failed', updatedAt: new Date() })
        .where(eq(automationRuns.id, run.id));
      failed.push({ runId: run.id, error: error instanceof Error ? error.message : 'Processing failed' });
    }
  }

  return { processed, skipped, failed };
}

export async function getAutomationOverview(orgId: string, userId: string) {
  const rules = await ensureDefaultRules(orgId, userId);
  const runs = await loadRuns(orgId, { limit: 50 });

  const activeRules = rules.filter((rule) => rule.status === 'active').length;
  const autopilotRules = rules.filter((rule) => rule.approvalMode === 'autopilot' && rule.status === 'active').length;
  const pendingApprovalRuns = runs.filter((run) => run.status === 'pending_approval').length;
  const scheduledRuns = runs.filter((run) => run.status === 'approved' || run.status === 'queued').length;
  const sentRuns = runs.filter((run) => run.status === 'sent' || run.status === 'copied').length;
  const failedRuns = runs.filter((run) => run.status === 'failed').length;
  const skippedRuns = runs.filter((run) => run.status === 'skipped' || run.status === 'canceled').length;
  const revenueInfluencedCents = runs
    .filter((run) => run.status === 'sent' || run.status === 'copied')
    .reduce((sum, run) => sum + run.estimatedRevenueCents, 0);
  const reviewedRuns = runs.filter((run) => ['approved', 'sent', 'copied', 'skipped', 'failed', 'canceled'].includes(run.status)).length;
  const approvalRatePercent = reviewedRuns > 0
    ? Math.round((runs.filter((run) => ['approved', 'sent', 'copied'].includes(run.status)).length / reviewedRuns) * 100)
    : 0;

  return {
    summary: {
      activeRules,
      autopilotRules,
      pendingApprovalRuns,
      scheduledRuns,
      sentRuns,
      failedRuns,
      skippedRuns,
      revenueInfluencedCents,
      approvalRatePercent,
    },
    rules: rules.map(summarizeRule),
    queue: runs.filter((run) => run.status === 'pending_approval').slice(0, 10),
    recentRuns: runs.slice(0, 12),
  };
}

export async function getPlatformAutomationIntelligence() {
  const [orgs, rules, runs] = await Promise.all([
    db.select({ id: organizations.id, name: organizations.name, slug: organizations.slug, isActive: organizations.isActive }).from(organizations),
    db.select().from(automationRules),
    db.select().from(automationRuns),
  ]);

  const orgRows = orgs.map((org) => {
    const orgRules = rules.filter((rule) => rule.organizationId === org.id);
    const orgRuns = runs.filter((run) => run.organizationId === org.id);
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      isActive: org.isActive,
      activeRules: orgRules.filter((rule) => rule.status === 'active').length,
      autopilotRules: orgRules.filter((rule) => rule.status === 'active' && rule.approvalMode === 'autopilot').length,
      pendingApprovalRuns: orgRuns.filter((run) => run.status === 'pending_approval').length,
      sentRuns: orgRuns.filter((run) => run.status === 'sent' || run.status === 'copied').length,
      failedRuns: orgRuns.filter((run) => run.status === 'failed').length,
      revenueInfluencedCents: orgRuns
        .filter((run) => run.status === 'sent' || run.status === 'copied')
        .reduce((sum, run) => sum + run.estimatedRevenueCents, 0),
      lastRunAt: orgRuns.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt ?? null,
    };
  });

  return {
    summary: {
      merchantsUsingAutomation: orgRows.filter((row) => row.activeRules > 0).length,
      autopilotMerchants: orgRows.filter((row) => row.autopilotRules > 0).length,
      activeRules: rules.filter((rule) => rule.status === 'active').length,
      pendingApprovalRuns: runs.filter((run) => run.status === 'pending_approval').length,
      sentRuns: runs.filter((run) => run.status === 'sent' || run.status === 'copied').length,
      failedRuns: runs.filter((run) => run.status === 'failed').length,
      revenueInfluencedCents: runs
        .filter((run) => run.status === 'sent' || run.status === 'copied')
        .reduce((sum, run) => sum + run.estimatedRevenueCents, 0),
    },
    organizations: orgRows.sort((a, b) => b.revenueInfluencedCents - a.revenueInfluencedCents),
  };
}
