'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface ForecastData {
  summary: { projectedGmv30d: number; recurringClients: number; projectedMrr: number };
  recurringCustomers: Array<{
    customerId: string; name: string; company: string | null; orgName: string;
    orderCount: number; avgOrderValue: number; ordersPerMonth: number;
    projectedMonthly: number; nextExpectedOrder: string;
  }>;
}

function cents(n: number): string { return `$${(n / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }

export default function RevenueForecastPage() {
  const [data, setData] = useState<ForecastData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/revenue-forecast')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div><h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>Revenue Forecast</h1><p style={{ color: '#78716C', fontSize: 14 }}>Loading...</p></div>;
  if (error || !data) return <div><h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>Revenue Forecast</h1><div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 14, color: '#DC2626' }}>{error || 'Failed to load'}</div></div>;

  const { summary, recurringCustomers } = data;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Revenue Forecast</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 28 }}>Projected order volume based on recurring clients across all restaurants</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <Card label="PROJECTED GMV (30 DAYS)" value={cents(summary.projectedGmv30d)} sub="Based on recurring orders" accent />
        <Card label="RECURRING CLIENTS" value={summary.recurringClients} sub="Locked in weekly/monthly" />
        <Card label="YOUR PROJECTED MRR" value={cents(summary.projectedMrr)} sub="Current paid subscribers" />
      </div>

      <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', padding: '20px 24px' }}>
        <h2 style={{ fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 0, marginBottom: 16 }}>Recurring Clients Driving Forecast</h2>
        {recurringCustomers.length === 0 ? (
          <p style={{ fontSize: 13, color: '#A8A29E', textAlign: 'center', padding: 20, margin: 0 }}>No recurring clients detected yet</p>
        ) : (
          recurringCustomers.map((c) => (
            <div key={c.customerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F5F5F4' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: 11, color: '#78716C' }}>
                  {c.company ? `${c.company} · ` : ''}{c.orgName} · {c.ordersPerMonth}x/mo · next: {new Date(c.nextExpectedOrder).toLocaleDateString()}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>{cents(c.projectedMonthly)}/mo</div>
                <div style={{ fontSize: 11, color: '#78716C' }}>{cents(c.avgOrderValue)} avg · {c.orderCount}x/mo</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Card({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return (
    <div style={{ borderRadius: 10, padding: '18px 20px', background: accent ? '#292524' : '#FFFFFF', border: accent ? 'none' : '1px solid #E7E5E4' }}>
      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 0, marginBottom: 6, color: accent ? '#D4A853' : '#78716C' }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, margin: 0, color: accent ? '#FAFAF9' : '#1C1917' }}>{value}</p>
      {sub && <p style={{ fontSize: 11, margin: '4px 0 0', color: accent ? '#A8A29E' : '#A8A29E' }}>{sub}</p>}
    </div>
  );
}
