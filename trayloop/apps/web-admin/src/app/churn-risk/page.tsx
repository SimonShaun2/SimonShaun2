'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface ChurnData {
  summary: { atRiskRestaurants: number; mrrAtRisk: number; atRiskCustomers: number };
  restaurants: Array<{
    id: string; name: string; isPaid: boolean; ownerName: string | null;
    ordersThisMonth: number; lastOrderAt: string | null; daysSinceLastOrder: number | null;
    risk: 'high' | 'medium';
  }>;
  customers: Array<{
    customerId: string; name: string; company: string | null; orgName: string;
    orderCount: number; avgOrderValue: number; lastOrderAt: string;
    daysSinceLastOrder: number;
  }>;
}

function cents(n: number): string { return `$${(n / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }

export default function ChurnRiskPage() {
  const [data, setData] = useState<ChurnData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/churn-risk')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div><h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>Churn Risk</h1><p style={{ color: '#78716C', fontSize: 14 }}>Loading...</p></div>;
  if (error || !data) return <div><h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>Churn Risk</h1><div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 14, color: '#DC2626' }}>{error || 'Failed to load'}</div></div>;

  const { summary, restaurants, customers } = data;

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Churn Risk</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 28 }}>Restaurants and customers that need attention before revenue is lost</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        <Card label="AT-RISK RESTAURANTS" value={summary.atRiskRestaurants} color={summary.atRiskRestaurants > 0 ? '#DC2626' : undefined} />
        <Card label="MRR AT RISK" value={cents(summary.mrrAtRisk)} color={summary.mrrAtRisk > 0 ? '#DC2626' : undefined} />
        <Card label="LAPSED CUSTOMERS" value={summary.atRiskCustomers} color={summary.atRiskCustomers > 0 ? '#DC2626' : undefined} />
      </div>

      {/* At-risk restaurants */}
      <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', padding: '20px 24px', marginBottom: 28 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>At-Risk Restaurants</h2>
        {restaurants.length === 0 ? (
          <p style={{ fontSize: 13, color: '#A8A29E', textAlign: 'center', padding: 20, margin: 0 }}>No restaurants at risk right now</p>
        ) : (
          restaurants.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F5F5F4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  fontSize: 13, fontWeight: 700, borderRadius: 6, padding: '4px 8px', minWidth: 36, textAlign: 'center',
                  background: r.risk === 'high' ? '#FEF2F2' : '#FEF3C7',
                  color: r.risk === 'high' ? '#DC2626' : '#92400E',
                }}>{r.daysSinceLastOrder ?? '?'}d</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</div>
                  <div style={{ fontSize: 11, color: '#78716C' }}>
                    {r.ownerName ?? 'No owner'} · {r.ordersThisMonth} orders this month ·{' '}
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '1px 6px', borderRadius: 4, background: r.isPaid ? '#DCFCE7' : '#FEF3C7', color: r.isPaid ? '#166534' : '#92400E' }}>{r.isPaid ? 'Paid' : 'Trial'}</span>
                  </div>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 9999,
                background: r.risk === 'high' ? '#FEE2E2' : '#FEF3C7',
                color: r.risk === 'high' ? '#991B1B' : '#92400E',
              }}>{r.risk === 'high' ? 'High Risk' : 'Medium Risk'}</span>
            </div>
          ))
        )}
      </div>

      {/* Lapsed customers */}
      <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', padding: '20px 24px' }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Lapsed Recurring Customers</h2>
        {customers.length === 0 ? (
          <p style={{ fontSize: 13, color: '#A8A29E', textAlign: 'center', padding: 20, margin: 0 }}>No lapsed customers detected</p>
        ) : (
          customers.map((c) => (
            <div key={c.customerId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F5F5F4' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626', background: '#FEF2F2', borderRadius: 6, padding: '4px 8px', minWidth: 36, textAlign: 'center' }}>{c.daysSinceLastOrder}d</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: '#78716C' }}>{c.orgName} · avg {cents(c.avgOrderValue)}/order · {c.orderCount} total orders</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Card({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, padding: '18px 20px', background: '#FFFFFF' }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 0, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 26, fontWeight: 700, margin: 0, color: color ?? '#1C1917' }}>{value}</p>
    </div>
  );
}
