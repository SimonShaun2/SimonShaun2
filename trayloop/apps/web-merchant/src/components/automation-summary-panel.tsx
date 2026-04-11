'use client';

import { useEffect, useState } from 'react';
import { evaluateAutomationRules, fetchAutomationOverview, type AutomationOverview } from '../lib/api';
import LockedFeatureCard from './locked-feature-card';
import { useFeatureAccess } from './plan-access-provider';

function money(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function AutomationSummaryPanel() {
  const automationAccess = useFeatureAccess('campaigns.reactivation');
  const [data, setData] = useState<AutomationOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const next = await fetchAutomationOverview();
      setData(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load automations');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (automationAccess.loading || !automationAccess.enabled) {
      setLoading(false);
      return;
    }
    load();
  }, [automationAccess.enabled, automationAccess.loading]);

  async function handleEvaluate() {
    setBusy(true);
    setError('');
    try {
      await evaluateAutomationRules();
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to evaluate automations');
    } finally {
      setBusy(false);
    }
  }

  if (!automationAccess.loading && !automationAccess.enabled) {
    return (
      <div style={{ marginBottom: 20 }}>
        <LockedFeatureCard
          compact
          featureKey="campaigns.reactivation"
          title="Automation is part of the Growth plan"
          description="Autopilot campaign approvals, queued reactivation runs, and repeat-order automation live behind the Growth tier."
          bullets={[
            'Queue reactivation campaigns for review',
            'Graduate proven flows into autopilot',
            'Track approval rate and revenue influenced',
          ]}
        />
      </div>
    );
  }

  return (
    <section style={{ border: '1px solid #E7E5E4', borderRadius: 14, background: '#FFFFFF', padding: 18, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 6 }}>
            Automation
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1C1917' }}>Approval-first autopilot</div>
          <div style={{ fontSize: 13, color: '#78716C', marginTop: 4, maxWidth: 560 }}>
            Let TrayLoop queue reorder and reactivation campaigns, review them safely, and optionally graduate your strongest rules into autopilot.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={handleEvaluate}
            disabled={busy || loading}
            style={{
              borderRadius: 999,
              padding: '9px 14px',
              border: '1px solid rgba(212,168,83,0.35)',
              background: busy ? '#F5F5F4' : 'rgba(212,168,83,0.1)',
              color: '#A16207',
              fontSize: 12,
              fontWeight: 700,
              cursor: busy || loading ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? 'Evaluating...' : 'Evaluate now'}
          </button>
          <a
            href="/automations"
            style={{
              borderRadius: 999,
              padding: '9px 14px',
              background: '#1C1917',
              color: '#FAFAF9',
              fontSize: 12,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Open automation workspace
          </a>
        </div>
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: '#78716C' }}>Loading automation summary...</div>
      ) : error || !data ? (
        <div style={{ padding: 14, borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', fontSize: 13 }}>
          {error || 'Unable to load automation summary.'}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 14 }}>
            <MetricCard label="Active rules" value={String(data.summary.activeRules)} sub={`${data.summary.autopilotRules} autopilot`} />
            <MetricCard label="Pending approval" value={String(data.summary.pendingApprovalRuns)} sub="Ready for review" />
            <MetricCard label="Sent runs" value={String(data.summary.sentRuns)} sub={`${data.summary.approvalRatePercent}% approval`} />
            <MetricCard label="Revenue influenced" value={money(data.summary.revenueInfluencedCents)} sub="Estimated from sent runs" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div style={{ border: '1px solid #EEEAE4', borderRadius: 12, padding: '12px 14px', background: '#FAFAF9' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>Approval queue</div>
              {data.queue.length === 0 ? (
                <div style={{ fontSize: 12, color: '#78716C' }}>No campaigns waiting for approval right now.</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {data.queue.slice(0, 3).map((run) => (
                    <div key={run.id} style={{ paddingBottom: 8, borderBottom: '1px solid #E7E5E4' }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1917' }}>{run.ruleName}</div>
                      <div style={{ fontSize: 12, color: '#57534E', marginTop: 2 }}>
                        {run.selectedTargetCount} customers · {money(run.estimatedRevenueCents)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ border: '1px solid #EEEAE4', borderRadius: 12, padding: '12px 14px', background: '#FAFAF9' }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#1C1917', marginBottom: 8 }}>Safeguards</div>
              <div style={{ fontSize: 12, color: '#57534E', lineHeight: 1.5 }}>
                TrayLoop suppresses recently contacted customers, keeps autopilot opt-in only, and records every automation run so merchants can audit what happened.
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ border: '1px solid #EEEAE4', borderRadius: 12, background: '#FFFFFF', padding: '12px 14px' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#78716C', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>{sub}</div>
    </div>
  );
}
