'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface TrialData {
  summary: { activeTrials: number; projectedMrr: number; avgTrialOrders: number };
  restaurants: Array<{
    id: string; name: string; slug: string; ownerName: string | null;
    orderCount: number; gmv: number; lastOrderAt: string | null;
    daysRemaining: number; daysSinceCreation: number;
    heat: 'hot' | 'warm' | 'cold';
  }>;
}

function cents(n: number): string {
  return `$${(n / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function TrialConversionsPage() {
  const [data, setData] = useState<TrialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/trial-conversions')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div><h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>Trial Conversions</h1><p style={{ color: '#78716C', fontSize: 14 }}>Loading...</p></div>;
  if (error || !data) return <div><h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>Trial Conversions</h1><div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 14, color: '#DC2626' }}>{error || 'Failed to load'}</div></div>;

  const { summary, restaurants } = data;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Trial Conversions</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 28 }}>
        Who to close this week — ranked by order activity and days remaining
      </p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <Card label="TRIALS ACTIVE" value={summary.activeTrials} sub="Currently on free plan" />
        <Card label="MRR IF ALL CONVERT" value={cents(summary.projectedMrr)} sub="$99/mo each" />
        <Card label="AVG ORDERS ON TRIAL" value={summary.avgTrialOrders} sub="More orders = hotter lead" />
      </div>

      {/* Ranked list */}
      <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', padding: '20px 24px' }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 0, marginBottom: 16 }}>
          Ranked by Conversion Heat
        </h2>

        {restaurants.length === 0 ? (
          <p style={{ fontSize: 13, color: '#A8A29E', textAlign: 'center', padding: 20, margin: 0 }}>No active trials</p>
        ) : (
          restaurants.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0', borderBottom: '1px solid #F5F5F4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <HeatIcon heat={r.heat} />
                <div>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 12, color: '#78716C' }}>
                    {r.ownerName ?? r.slug} · {r.orderCount} order{r.orderCount !== 1 ? 's' : ''} placed · {r.heat === 'hot' ? 'Hot lead' : r.heat === 'warm' ? 'Warming up' : 'No activity yet'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                {/* Progress indicator */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 80, height: 6, background: '#F5F5F4', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (r.orderCount / 5) * 100)}%`, height: '100%', background: r.heat === 'hot' ? '#22C55E' : r.heat === 'warm' ? '#D4A853' : '#D6D3D1', borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#78716C', whiteSpace: 'nowrap' }}>{r.orderCount}/5 orders</span>
                </div>
                {/* Days */}
                <span style={{ fontSize: 14, fontWeight: 600, color: r.daysRemaining <= 7 ? '#DC2626' : '#44403C', minWidth: 36, textAlign: 'right' }}>
                  {r.daysRemaining}d
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Card({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, padding: '18px 20px', background: '#FFFFFF' }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 0, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, margin: 0, color: '#1C1917' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: '#A8A29E', margin: '4px 0 0' }}>{sub}</p>}
    </div>
  );
}

function HeatIcon({ heat }: { heat: string }) {
  const config: Record<string, { bg: string; icon: string }> = {
    hot: { bg: '#FEF2F2', icon: '🔥' },
    warm: { bg: '#FEF3C7', icon: '✅' },
    cold: { bg: '#F3F4F6', icon: '⏸' },
  };
  const c = config[heat] ?? config.cold;
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', background: c.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0,
    }}>{c.icon}</div>
  );
}
