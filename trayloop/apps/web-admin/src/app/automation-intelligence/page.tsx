'use client';

import { useEffect, useMemo, useState } from 'react';
import { automationsEnabled } from '../../lib/features';
import { fetchAdminAutomationIntelligence, type AdminAutomationIntelligence } from '../../lib/api';

function money(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function AdminAutomationIntelligencePage() {
  const [data, setData] = useState<AdminAutomationIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!automationsEnabled) {
      setLoading(false);
      return;
    }

    fetchAdminAutomationIntelligence()
      .then((next) => setData(next))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load automation intelligence'))
      .finally(() => setLoading(false));
  }, []);

  const topOperators = useMemo(() => {
    if (!data) return [];
    return [...data.organizations]
      .sort((a, b) => b.revenueInfluencedCents - a.revenueInfluencedCents)
      .slice(0, 4);
  }, [data]);

  if (!automationsEnabled) {
    return (
      <div style={{ padding: 18, borderRadius: 12, border: '1px solid #DBEAFE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 13 }}>
        Automation intelligence is disabled in live production. Turn on
        <code style={{ marginLeft: 6, marginRight: 6 }}>NEXT_PUBLIC_AUTOMATIONS_ENABLED=true</code>
        in staging to review this surface.
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <section
        style={{
          borderRadius: 22,
          padding: 24,
          background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
          color: '#F9FAFB',
          display: 'grid',
          gap: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' }}>
          <div style={{ maxWidth: 760 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 8 }}>
              AI Campaign Engine
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>Measure where automation is actually creating repeat revenue.</h1>
            <p style={{ fontSize: 14, color: '#D1D5DB', lineHeight: 1.7, margin: '10px 0 0' }}>
              This is the internal operating view for campaign adoption, autopilot readiness, approval queues, and the revenue influenced by AI-led outreach.
            </p>
          </div>
          <div
            style={{
              minWidth: 260,
              borderRadius: 18,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: 18,
              alignSelf: 'flex-start',
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 8 }}>
              Operator focus
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, lineHeight: 1.35 }}>
              Keep approval-first merchants moving toward autopilot without losing trust.
            </div>
            <div style={{ fontSize: 13, color: '#D1D5DB', lineHeight: 1.6, marginTop: 10 }}>
              The strongest Tier 3 merchants should graduate from assisted campaigns into recurring automation with clear influenced revenue.
            </div>
          </div>
        </div>

        {loading ? (
          <div style={{ fontSize: 13, color: '#D1D5DB' }}>Loading automation intelligence...</div>
        ) : error || !data ? (
          <div style={{ padding: 18, borderRadius: 14, border: '1px solid rgba(248,113,113,0.35)', background: 'rgba(127,29,29,0.22)', color: '#FCA5A5', fontSize: 13 }}>
            {error || 'Unable to load automation intelligence.'}
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12 }}>
              <MetricCard label="Merchants using automation" value={String(data.summary.merchantsUsingAutomation)} sub="At least one live retention rule" />
              <MetricCard label="Autopilot merchants" value={String(data.summary.autopilotMerchants)} sub="Running without approval hold" />
              <MetricCard label="Pending approvals" value={String(data.summary.pendingApprovalRuns)} sub="Operator review still required" />
              <MetricCard label="Sent runs" value={String(data.summary.sentRuns)} sub={`${data.summary.failedRuns} failed`} />
              <MetricCard label="Revenue influenced" value={money(data.summary.revenueInfluencedCents)} sub="Estimated from campaign-linked results" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: 18 }}>
              <Panel title="Merchant automation table" eyebrow="Who is driving repeat revenue now">
                <div style={{ display: 'grid', gap: 10 }}>
                  {data.organizations.map((organization) => (
                    <div
                      key={organization.id}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1.2fr repeat(5, minmax(0, 0.6fr)) 0.9fr',
                        gap: 12,
                        alignItems: 'center',
                        padding: '12px 14px',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{organization.name}</div>
                        <div style={{ fontSize: 12, color: '#D1D5DB' }}>{organization.slug}</div>
                      </div>
                      <MiniMetric value={String(organization.activeRules)} label="rules" />
                      <MiniMetric value={String(organization.autopilotRules)} label="autopilot" />
                      <MiniMetric value={String(organization.pendingApprovalRuns)} label="queue" />
                      <MiniMetric value={String(organization.sentRuns)} label="sent" />
                      <MiniMetric value={String(organization.failedRuns)} label="failed" accent={organization.failedRuns > 0 ? 'danger' : 'neutral'} />
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#F9FAFB' }}>{money(organization.revenueInfluencedCents)}</div>
                        <div style={{ fontSize: 11, color: '#D1D5DB' }}>
                          {organization.lastRunAt ? new Date(organization.lastRunAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'No runs'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Top operators" eyebrow="Merchants proving the moat">
                <div style={{ display: 'grid', gap: 10 }}>
                  {topOperators.map((organization, index) => (
                    <div key={organization.id} style={{ borderRadius: 14, padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 6 }}>
                        #{index + 1} influenced revenue
                      </div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: '#FFFFFF' }}>{organization.name}</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: '#FFFFFF', marginTop: 8 }}>{money(organization.revenueInfluencedCents)}</div>
                      <div style={{ fontSize: 12, color: '#D1D5DB', marginTop: 6, lineHeight: 1.55 }}>
                        {organization.activeRules} live rules • {organization.autopilotRules} autopilot • {organization.pendingApprovalRuns} waiting review
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Panel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, background: 'rgba(255,255,255,0.03)', padding: '20px 22px' }}>
      {eyebrow ? (
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 8 }}>
          {eyebrow}
        </div>
      ) : null}
      <h2 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 16px', color: '#FFFFFF' }}>{title}</h2>
      {children}
    </section>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.04)' }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#D4A853', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: '#FFFFFF' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#D1D5DB', marginTop: 4, lineHeight: 1.5 }}>{sub}</div>
    </div>
  );
}

function MiniMetric({ value, label, accent = 'neutral' }: { value: string; label: string; accent?: 'neutral' | 'danger' }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: accent === 'danger' ? '#FCA5A5' : '#FFFFFF' }}>{value}</div>
      <div style={{ fontSize: 11, color: '#D1D5DB', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
    </div>
  );
}
