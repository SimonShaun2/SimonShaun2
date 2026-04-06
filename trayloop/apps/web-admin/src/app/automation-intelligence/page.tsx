'use client';

import { useEffect, useState } from 'react';
import { fetchAdminAutomationIntelligence, type AdminAutomationIntelligence } from '../../lib/api';

function money(cents: number) {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

export default function AdminAutomationIntelligencePage() {
  const [data, setData] = useState<AdminAutomationIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAdminAutomationIntelligence()
      .then((next) => setData(next))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load automation intelligence'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Automation Intelligence</h1>
        <p style={{ fontSize: 13, color: '#78716C', marginTop: 0 }}>
          Track automation adoption, approval-first workflows, autopilot usage, and influenced revenue across merchants.
        </p>
      </div>

      {loading ? (
        <div style={{ fontSize: 13, color: '#78716C' }}>Loading automation intelligence...</div>
      ) : error || !data ? (
        <div style={{ padding: 18, borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', color: '#B91C1C', fontSize: 13 }}>
          {error || 'Unable to load automation intelligence.'}
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 12, marginBottom: 24 }}>
            <MetricCard label="Merchants using automation" value={String(data.summary.merchantsUsingAutomation)} sub="At least one active rule" />
            <MetricCard label="Autopilot merchants" value={String(data.summary.autopilotMerchants)} sub="Explicit opt-in only" />
            <MetricCard label="Active rules" value={String(data.summary.activeRules)} sub={`${data.summary.pendingApprovalRuns} waiting approval`} />
            <MetricCard label="Sent runs" value={String(data.summary.sentRuns)} sub={`${data.summary.failedRuns} failed`} />
            <MetricCard label="Revenue influenced" value={money(data.summary.revenueInfluencedCents)} sub="Estimated from sent runs" />
          </div>

          <section style={{ border: '1px solid #E7E5E4', borderRadius: 12, background: '#FFFFFF', padding: '20px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12, flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Merchant automation table</h2>
              <span style={{ fontSize: 12, color: '#78716C' }}>{data.organizations.length} organizations</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 760, borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E7E5E4' }}>
                    <Th>Merchant</Th>
                    <Th>Active Rules</Th>
                    <Th>Autopilot</Th>
                    <Th>Pending Queue</Th>
                    <Th>Sent Runs</Th>
                    <Th>Failed</Th>
                    <Th>Revenue Influenced</Th>
                    <Th>Last Run</Th>
                  </tr>
                </thead>
                <tbody>
                  {data.organizations.map((organization) => (
                    <tr key={organization.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                      <td style={{ padding: '10px 0' }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{organization.name}</div>
                        <div style={{ fontSize: 12, color: '#78716C' }}>{organization.slug}</div>
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13 }}>{organization.activeRules}</td>
                      <td style={{ padding: '10px 0', fontSize: 13 }}>{organization.autopilotRules}</td>
                      <td style={{ padding: '10px 0', fontSize: 13 }}>{organization.pendingApprovalRuns}</td>
                      <td style={{ padding: '10px 0', fontSize: 13 }}>{organization.sentRuns}</td>
                      <td style={{ padding: '10px 0', fontSize: 13, color: organization.failedRuns > 0 ? '#B91C1C' : '#1C1917' }}>
                        {organization.failedRuns}
                      </td>
                      <td style={{ padding: '10px 0', fontSize: 13 }}>{money(organization.revenueInfluencedCents)}</td>
                      <td style={{ padding: '10px 0', fontSize: 12, color: '#78716C' }}>
                        {organization.lastRunAt ? new Date(organization.lastRunAt).toLocaleString() : 'No runs yet'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ borderRadius: 10, padding: '16px 18px', background: '#FFFFFF', border: '1px solid #E7E5E4' }}>
      <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#78716C', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#78716C', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ padding: '8px 0', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
      {children}
    </th>
  );
}
