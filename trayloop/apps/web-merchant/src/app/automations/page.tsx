'use client';

import { useEffect, useMemo, useState } from 'react';
import { automationsEnabled } from '../../lib/features';
import {
  evaluateAutomationRules,
  fetchAutomationOverview,
  fetchAutomationRuns,
  processAutomationRuns,
  updateAutomationRule,
  updateAutomationRun,
  type AutomationOverview,
  type AutomationRule,
  type AutomationRun,
} from '../../lib/api';

type RuleDraft = {
  status: AutomationRule['status'];
  approvalMode: AutomationRule['approvalMode'];
  emailEnabled: boolean;
  smsMode: AutomationRule['smsMode'];
  timingWindowDays: number;
  throttleDays: number;
  maxTargets: number;
  goalNotes: string;
  toneNotes: string;
};

type RunDraft = {
  generatedSubject: string;
  generatedEmailBody: string;
  generatedSmsBody: string;
};

function money(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

function toRuleDraft(rule: AutomationRule): RuleDraft {
  return {
    status: rule.status,
    approvalMode: rule.approvalMode,
    emailEnabled: rule.emailEnabled,
    smsMode: rule.smsMode,
    timingWindowDays: rule.timingWindowDays,
    throttleDays: rule.throttleDays,
    maxTargets: rule.maxTargets,
    goalNotes: rule.goalNotes ?? '',
    toneNotes: rule.toneNotes ?? '',
  };
}

function toRunDraft(run: AutomationRun): RunDraft {
  return {
    generatedSubject: run.generatedSubject ?? '',
    generatedEmailBody: run.generatedEmailBody ?? '',
    generatedSmsBody: run.generatedSmsBody ?? '',
  };
}

export default function AutomationsPage() {
  if (!automationsEnabled) {
    return (
      <div style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#FFFFFF', padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 8 }}>
          Staging only
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px', color: '#1C1917' }}>Automation is disabled in live production</h1>
        <p style={{ fontSize: 14, color: '#57534E', margin: 0, maxWidth: 680 }}>
          Automation is reserved for staging while the live launch focuses on checkout, payouts, AI sales, upsells, and revenue intelligence. Enable
          <code style={{ marginLeft: 6, marginRight: 6 }}>NEXT_PUBLIC_AUTOMATIONS_ENABLED=true</code>
          in staging to use this workspace.
        </p>
      </div>
    );
  }

  const [overview, setOverview] = useState<AutomationOverview | null>(null);
  const [runs, setRuns] = useState<AutomationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [ruleDrafts, setRuleDrafts] = useState<Record<string, RuleDraft>>({});
  const [runDrafts, setRunDrafts] = useState<Record<string, RunDraft>>({});

  async function load() {
    setLoading(true);
    setError('');
    try {
      const [nextOverview, nextRuns] = await Promise.all([
        fetchAutomationOverview(),
        fetchAutomationRuns({ limit: 40 }),
      ]);
      setOverview(nextOverview);
      setRuns(nextRuns);
      setRuleDrafts(
        Object.fromEntries(nextOverview.rules.map((rule) => [rule.id, toRuleDraft(rule)])),
      );
      setRunDrafts(
        Object.fromEntries(nextRuns.map((run) => [run.id, toRunDraft(run)])),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    load();
  }, []);

  const pendingRuns = useMemo(
    () => runs.filter((run) => run.status === 'pending_approval'),
    [runs],
  );

  const recentRuns = useMemo(
    () => runs.filter((run) => run.status !== 'pending_approval').slice(0, 20),
    [runs],
  );

  async function handleEvaluate() {
    setBusyAction('evaluate');
    setError('');
    setMessage('');
    try {
      const result = await evaluateAutomationRules();
      setMessage(
        result.createdCount > 0
          ? `Created ${result.createdCount} automation run${result.createdCount === 1 ? '' : 's'}.`
          : 'No new automation runs were created.',
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate automations');
    } finally {
      setBusyAction('');
    }
  }

  async function handleProcessDue() {
    setBusyAction('process');
    setError('');
    setMessage('');
    try {
      const result = await processAutomationRuns();
      setMessage(`Processed ${result.processed.length} due run${result.processed.length === 1 ? '' : 's'}.`);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process queued runs');
    } finally {
      setBusyAction('');
    }
  }

  async function handleSaveRule(ruleId: string) {
    const draft = ruleDrafts[ruleId];
    if (!draft) return;
    setBusyAction(`rule:${ruleId}`);
    setError('');
    setMessage('');
    try {
      await updateAutomationRule(ruleId, {
        ...draft,
        goalNotes: draft.goalNotes || null,
        toneNotes: draft.toneNotes || null,
      });
      setMessage('Automation settings saved.');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save automation rule');
    } finally {
      setBusyAction('');
    }
  }

  async function handleRunAction(runId: string, action: 'save' | 'approve' | 'skip' | 'cancel') {
    const draft = runDrafts[runId];
    setBusyAction(`run:${runId}:${action}`);
    setError('');
    setMessage('');
    try {
      await updateAutomationRun(runId, {
        action,
        generatedSubject: draft?.generatedSubject,
        generatedEmailBody: draft?.generatedEmailBody,
        generatedSmsBody: draft?.generatedSmsBody,
        errorMessage: action === 'skip' ? 'Skipped by merchant' : undefined,
      });
      setMessage(
        action === 'approve'
          ? 'Automation approved.'
          : action === 'skip'
            ? 'Automation skipped.'
            : action === 'cancel'
              ? 'Scheduled automation canceled.'
              : 'Automation draft updated.',
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update automation run');
    } finally {
      setBusyAction('');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 8 }}>
            Automation
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: '#1C1917' }}>Operator autopilot</h1>
          <p style={{ fontSize: 13, color: '#78716C', margin: '6px 0 0', maxWidth: 700 }}>
            Turn repeat-customer reactivation and reorder reminders into an approval-first system. Merchants can keep rules on review mode or promote proven flows into autopilot.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={handleEvaluate} disabled={busyAction !== '' || loading} style={primaryButton(busyAction !== '' || loading)}>
            {busyAction === 'evaluate' ? 'Evaluating...' : 'Evaluate rules'}
          </button>
          <button onClick={handleProcessDue} disabled={busyAction !== '' || loading} style={secondaryButton(busyAction !== '' || loading)}>
            {busyAction === 'process' ? 'Processing...' : 'Process due sends'}
          </button>
        </div>
      </div>

      {message ? (
        <div style={{ marginBottom: 14, padding: 12, borderRadius: 12, border: '1px solid #D1FAE5', background: '#ECFDF5', color: '#166534', fontSize: 13 }}>
          {message}
        </div>
      ) : null}

      {error ? (
        <div style={{ marginBottom: 14, padding: 12, borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', fontSize: 13 }}>
          {error}
        </div>
      ) : null}

      {loading ? (
        <div style={{ fontSize: 13, color: '#78716C' }}>Loading automations...</div>
      ) : !overview ? (
        <div style={{ fontSize: 13, color: '#78716C' }}>Unable to load automation workspace.</div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 20 }}>
            <MetricCard label="Active rules" value={String(overview.summary.activeRules)} sub={`${overview.summary.autopilotRules} autopilot`} />
            <MetricCard label="Pending approval" value={String(overview.summary.pendingApprovalRuns)} sub="Needs merchant review" />
            <MetricCard label="Scheduled sends" value={String(overview.summary.scheduledRuns)} sub="Approved or queued" />
            <MetricCard label="Sent runs" value={String(overview.summary.sentRuns)} sub={`${overview.summary.approvalRatePercent}% approval rate`} />
            <MetricCard label="Skipped / failed" value={String(overview.summary.skippedRuns + overview.summary.failedRuns)} sub={`${overview.summary.failedRuns} failed`} />
            <MetricCard label="Revenue influenced" value={money(overview.summary.revenueInfluencedCents)} sub="Estimated from sent automations" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: 16, marginBottom: 20 }}>
            <Panel title="Rule settings">
              <div style={{ display: 'grid', gap: 14 }}>
                {overview.rules.map((rule) => {
                  const draft = ruleDrafts[rule.id] ?? toRuleDraft(rule);
                  return (
                    <div key={rule.id} style={{ border: '1px solid #EEEAE4', borderRadius: 14, padding: 14, background: '#FAFAF9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>{rule.name}</div>
                          <div style={{ fontSize: 12, color: '#78716C', marginTop: 3 }}>
                            {rule.ruleType === 'reorder_reminder' ? 'Reorder reminder' : 'Reactivation'} · {rule.segment.replace('_', ' ')}
                          </div>
                        </div>
                        <div style={{ fontSize: 12, color: '#78716C' }}>
                          Last evaluated: {rule.lastEvaluatedAt ? new Date(rule.lastEvaluatedAt).toLocaleString() : 'Not yet'}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10, marginBottom: 10 }}>
                        <SelectField
                          label="Status"
                          value={draft.status}
                          onChange={(value) => setRuleDrafts((current) => ({ ...current, [rule.id]: { ...draft, status: value as RuleDraft['status'] } }))}
                          options={[
                            ['active', 'Active'],
                            ['paused', 'Paused'],
                            ['disabled', 'Disabled'],
                            ['draft', 'Draft'],
                          ]}
                        />
                        <SelectField
                          label="Sending mode"
                          value={draft.approvalMode}
                          onChange={(value) => setRuleDrafts((current) => ({ ...current, [rule.id]: { ...draft, approvalMode: value as RuleDraft['approvalMode'] } }))}
                          options={[
                            ['approval_required', 'Approval required'],
                            ['autopilot', 'Autopilot'],
                          ]}
                        />
                        <InputField
                          label="Timing window (days)"
                          type="number"
                          value={String(draft.timingWindowDays)}
                          onChange={(value) => setRuleDrafts((current) => ({ ...current, [rule.id]: { ...draft, timingWindowDays: Number(value) || 1 } }))}
                        />
                        <InputField
                          label="Throttle (days)"
                          type="number"
                          value={String(draft.throttleDays)}
                          onChange={(value) => setRuleDrafts((current) => ({ ...current, [rule.id]: { ...draft, throttleDays: Number(value) || 1 } }))}
                        />
                        <InputField
                          label="Max targets"
                          type="number"
                          value={String(draft.maxTargets)}
                          onChange={(value) => setRuleDrafts((current) => ({ ...current, [rule.id]: { ...draft, maxTargets: Number(value) || 1 } }))}
                        />
                        <SelectField
                          label="SMS mode"
                          value={draft.smsMode}
                          onChange={(value) => setRuleDrafts((current) => ({ ...current, [rule.id]: { ...draft, smsMode: value as RuleDraft['smsMode'] } }))}
                          options={[
                            ['disabled', 'Disabled'],
                            ['copy_only', 'Copy only'],
                          ]}
                        />
                      </div>

                      <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#44403C', marginBottom: 10 }}>
                        <input
                          type="checkbox"
                          checked={draft.emailEnabled}
                          onChange={(event) => setRuleDrafts((current) => ({ ...current, [rule.id]: { ...draft, emailEnabled: event.target.checked } }))}
                        />
                        Email sending enabled
                      </label>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                        <TextAreaField
                          label="Goal notes"
                          value={draft.goalNotes}
                          onChange={(value) => setRuleDrafts((current) => ({ ...current, [rule.id]: { ...draft, goalNotes: value } }))}
                          placeholder="What outcome should this automation drive?"
                        />
                        <TextAreaField
                          label="Tone notes"
                          value={draft.toneNotes}
                          onChange={(value) => setRuleDrafts((current) => ({ ...current, [rule.id]: { ...draft, toneNotes: value } }))}
                          placeholder="How should the message feel?"
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: 12, color: '#78716C' }}>
                          Safeguards suppress recently contacted customers before each run.
                        </div>
                        <button
                          onClick={() => handleSaveRule(rule.id)}
                          disabled={busyAction !== ''}
                          style={secondaryButton(busyAction !== '')}
                        >
                          {busyAction === `rule:${rule.id}` ? 'Saving...' : 'Save settings'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel title="Automation queue">
              {pendingRuns.length === 0 ? (
                <EmptyState text="No campaigns are waiting for approval right now." />
              ) : (
                <div style={{ display: 'grid', gap: 14 }}>
                  {pendingRuns.map((run) => {
                    const draft = runDrafts[run.id] ?? toRunDraft(run);
                    return (
                      <div key={run.id} style={{ border: '1px solid #EEEAE4', borderRadius: 14, background: '#FAFAF9', padding: 14 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 10, flexWrap: 'wrap' }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917' }}>{run.ruleName}</div>
                            <div style={{ fontSize: 12, color: '#78716C', marginTop: 3 }}>
                              {run.selectedTargetCount} customers · {money(run.estimatedRevenueCents)} estimated revenue
                            </div>
                          </div>
                          <div style={{ fontSize: 12, color: '#78716C' }}>{run.reasonSummary}</div>
                        </div>

                        <InputField
                          label="Subject"
                          value={draft.generatedSubject}
                          onChange={(value) => setRunDrafts((current) => ({ ...current, [run.id]: { ...draft, generatedSubject: value } }))}
                        />
                        <div style={{ height: 10 }} />
                        <TextAreaField
                          label="Email body"
                          value={draft.generatedEmailBody}
                          onChange={(value) => setRunDrafts((current) => ({ ...current, [run.id]: { ...draft, generatedEmailBody: value } }))}
                          placeholder="Generated email body"
                          rows={6}
                        />
                        <div style={{ height: 10 }} />
                        <TextAreaField
                          label="SMS copy"
                          value={draft.generatedSmsBody}
                          onChange={(value) => setRunDrafts((current) => ({ ...current, [run.id]: { ...draft, generatedSmsBody: value } }))}
                          placeholder="Generated SMS copy"
                          rows={3}
                        />

                        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                          <div style={{ fontSize: 12, color: '#78716C' }}>
                            Recipients: {run.recipients.map((recipient) => recipient.name).join(', ')}
                          </div>
                          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <button onClick={() => handleRunAction(run.id, 'save')} disabled={busyAction !== ''} style={secondaryButton(busyAction !== '')}>
                              {busyAction === `run:${run.id}:save` ? 'Saving...' : 'Save edits'}
                            </button>
                            <button onClick={() => handleRunAction(run.id, 'skip')} disabled={busyAction !== ''} style={ghostButton(busyAction !== '')}>
                              {busyAction === `run:${run.id}:skip` ? 'Skipping...' : 'Skip'}
                            </button>
                            <button onClick={() => handleRunAction(run.id, 'approve')} disabled={busyAction !== ''} style={primaryButton(busyAction !== '')}>
                              {busyAction === `run:${run.id}:approve` ? 'Approving...' : 'Approve and send'}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Panel>
          </div>

          <Panel title="Run log">
            {recentRuns.length === 0 ? (
              <EmptyState text="No automation runs have been processed yet." />
            ) : (
              <div style={{ display: 'grid', gap: 10 }}>
                {recentRuns.map((run) => (
                  <div key={run.id} style={{ border: '1px solid #EEEAE4', borderRadius: 12, background: '#FFFFFF', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 6 }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1C1917' }}>{run.ruleName}</div>
                        <div style={{ fontSize: 12, color: '#78716C', marginTop: 2 }}>
                          {run.selectedTargetCount} customers · {money(run.estimatedRevenueCents)} · {new Date(run.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <StatusBadge status={run.status} />
                    </div>
                    <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.45, marginBottom: 8 }}>{run.reasonSummary}</div>
                    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: '#78716C' }}>
                      <span>Sent: {run.recipientSummary.sent}</span>
                      <span>Pending: {run.recipientSummary.pending}</span>
                      <span>Skipped: {run.recipientSummary.skipped}</span>
                      <span>Failed: {run.recipientSummary.failed}</span>
                      {run.errorMessage ? <span style={{ color: '#B91C1C' }}>Error: {run.errorMessage}</span> : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ border: '1px solid #EEEAE4', borderRadius: 12, background: '#FFFFFF', padding: '14px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ border: '1px solid #E7E5E4', borderRadius: 16, background: '#FFFFFF', padding: 18 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: '#1C1917', marginBottom: 12 }}>{title}</div>
      {children}
    </section>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#44403C' }}>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ border: '1px solid #D6D3D1', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1C1917', background: '#FFFFFF' }}
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#44403C' }}>{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ border: '1px solid #D6D3D1', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1C1917', background: '#FFFFFF', resize: 'vertical' }}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
}) {
  return (
    <label style={{ display: 'grid', gap: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: '#44403C' }}>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        style={{ border: '1px solid #D6D3D1', borderRadius: 10, padding: '10px 12px', fontSize: 13, color: '#1C1917', background: '#FFFFFF' }}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function StatusBadge({ status }: { status: AutomationRun['status'] }) {
  const config = {
    pending_approval: { bg: '#FEF3C7', color: '#A16207', label: 'Pending approval' },
    approved: { bg: '#DBEAFE', color: '#1D4ED8', label: 'Approved' },
    queued: { bg: '#EDE9FE', color: '#6D28D9', label: 'Queued' },
    sent: { bg: '#DCFCE7', color: '#166534', label: 'Sent' },
    copied: { bg: '#F3F4F6', color: '#374151', label: 'Copied' },
    skipped: { bg: '#F5F5F4', color: '#57534E', label: 'Skipped' },
    failed: { bg: '#FEE2E2', color: '#B91C1C', label: 'Failed' },
    canceled: { bg: '#F5F5F4', color: '#57534E', label: 'Canceled' },
  }[status];

  return (
    <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 999, padding: '5px 8px', background: config.bg, color: config.color }}>
      {config.label}
    </span>
  );
}

function EmptyState({ text }: { text: string }) {
  return <div style={{ fontSize: 13, color: '#78716C' }}>{text}</div>;
}

function primaryButton(disabled: boolean) {
  return {
    borderRadius: 999,
    padding: '9px 14px',
    border: 'none',
    background: disabled ? '#D6D3D1' : '#1C1917',
    color: '#FAFAF9',
    fontSize: 12,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
  } as const;
}

function secondaryButton(disabled: boolean) {
  return {
    borderRadius: 999,
    padding: '9px 14px',
    border: '1px solid #D6D3D1',
    background: '#FFFFFF',
    color: disabled ? '#A8A29E' : '#44403C',
    fontSize: 12,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
  } as const;
}

function ghostButton(disabled: boolean) {
  return {
    borderRadius: 999,
    padding: '9px 14px',
    border: '1px solid #E7E5E4',
    background: '#FAFAF9',
    color: disabled ? '#A8A29E' : '#57534E',
    fontSize: 12,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
  } as const;
}
