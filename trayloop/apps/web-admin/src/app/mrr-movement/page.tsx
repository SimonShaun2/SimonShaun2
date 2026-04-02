'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface MrrData {
  summary: { currentMrr: number; newMrr: number; churnedMrr: number; netChange: number };
  restaurants: Array<{
    id: string; name: string; slug: string; ownerName: string | null;
    isActive: boolean; isPaid: boolean;
    status: 'paid' | 'trial' | 'churned' | 'inactive';
    mrr: number; label: string; createdAt: string;
  }>;
}

function cents(n: number): string {
  const abs = Math.abs(n);
  const formatted = `$${(abs / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  if (n < 0) return `-${formatted}`;
  return formatted;
}

function centsWithSign(n: number): string {
  if (n > 0) return `+${cents(n)}`;
  if (n < 0) return cents(n);
  return '$0';
}

export default function MrrMovementPage() {
  const [data, setData] = useState<MrrData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/mrr-movement')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div><h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>MRR Movement</h1><p style={{ color: '#78716C', fontSize: 14 }}>Loading...</p></div>;
  if (error || !data) return <div><h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>MRR Movement</h1><div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 14, color: '#DC2626' }}>{error || 'Failed to load'}</div></div>;

  const { summary, restaurants } = data;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>MRR Movement</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 28 }}>
        New MRR, churn, and net change this month
      </p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <Card label="CURRENT MRR" value={cents(summary.currentMrr)} />
        <Card label="NEW MRR THIS MONTH" value={centsWithSign(summary.newMrr)} color={summary.newMrr > 0 ? '#166534' : undefined} />
        <Card label="CHURNED MRR" value={cents(summary.churnedMrr)} color={summary.churnedMrr > 0 ? '#DC2626' : undefined} />
        <Card label="NET MRR CHANGE" value={centsWithSign(summary.netChange)} color={summary.netChange > 0 ? '#166534' : summary.netChange < 0 ? '#DC2626' : undefined} />
      </div>

      {/* Per-restaurant MRR table */}
      <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', padding: '20px 24px' }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 0, marginBottom: 16 }}>
          Per-Restaurant MRR
        </h2>

        {restaurants.length === 0 ? (
          <p style={{ fontSize: 13, color: '#A8A29E', textAlign: 'center', padding: 20, margin: 0 }}>No restaurants yet</p>
        ) : (
          restaurants.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '12px 0', borderBottom: '1px solid #F5F5F4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                <div style={{ fontSize: 13 }}>
                  <span style={{ fontWeight: 500, color: r.status === 'churned' || r.status === 'inactive' ? '#A8A29E' : '#1C1917' }}>
                    {r.name}
                  </span>
                  {r.ownerName && (
                    <span style={{ color: '#A8A29E', marginLeft: 8, fontSize: 12 }}>
                      {r.ownerName} · since {new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <StatusBadge status={r.status} />
                <span style={{
                  fontSize: 14, fontWeight: 600, minWidth: 70, textAlign: 'right',
                  color: r.status === 'paid' ? '#166534'
                    : r.status === 'churned' ? '#DC2626'
                    : '#78716C',
                }}>
                  {r.label}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Card({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, padding: '18px 20px', background: '#FFFFFF' }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 0, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, margin: 0, color: color ?? '#1C1917' }}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; color: string; label: string }> = {
    paid: { bg: '#DCFCE7', color: '#166534', label: 'Paid' },
    trial: { bg: '#FEF3C7', color: '#92400E', label: 'Trial' },
    churned: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
    inactive: { bg: '#F3F4F6', color: '#6B7280', label: 'Inactive' },
  };
  const c = config[status] ?? config.inactive;
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 9999,
      fontSize: 11, fontWeight: 600, background: c.bg, color: c.color,
    }}>{c.label}</span>
  );
}
