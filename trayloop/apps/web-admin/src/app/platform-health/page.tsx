'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface HealthData {
  summary: { totalOrders30d: number; avgOrderValue: number; lastOrderAt: string | null; depositsCount30d: number };
  systems: Array<{ name: string; status: string; detail: string }>;
  restaurantHealth: Array<{
    id: string; name: string; isActive: boolean; isPaid: boolean;
    ordersThisMonth: number; avgOrderValue: number; lastOrderAt: string | null;
    health: 'healthy' | 'at_risk' | 'new' | 'inactive';
  }>;
}

function cents(n: number): string { return `$${(n / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`; }

export default function PlatformHealthPage() {
  const [data, setData] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/platform-health')
      .then((res) => setData(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div><h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>Platform Health</h1><p style={{ color: '#78716C', fontSize: 14 }}>Loading...</p></div>;
  if (error || !data) return <div><h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0 }}>Platform Health</h1><div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 14, color: '#DC2626' }}>{error || 'Failed to load'}</div></div>;

  const { summary, systems, restaurantHealth } = data;
  const statusColors: Record<string, { bg: string; color: string; dot: string }> = {
    healthy: { bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
    active: { bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
    inactive: { bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
    not_connected: { bg: '#FEF3C7', color: '#92400E', dot: '#F59E0B' },
    at_risk: { bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
    new: { bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
  };

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Platform Health</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 28 }}>Order flow, system status, and per-restaurant health</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 28 }}>
        {/* System Status */}
        <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>System Status</h2>
            <span style={{ fontSize: 12, color: '#166534' }}>All systems OK</span>
          </div>
          {systems.map((s) => {
            const sc = statusColors[s.status] ?? statusColors.inactive;
            return (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F5F4' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: sc.dot }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: 11, color: '#78716C' }}>{s.detail}</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 500, color: sc.color }}>{s.status.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}</span>
              </div>
            );
          })}
        </div>

        {/* Order Activity */}
        <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', padding: '20px 24px' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>Order Activity <span style={{ fontSize: 12, color: '#78716C', fontWeight: 400 }}>Last 30 days</span></h2>
          {[
            { label: 'Total Orders Processed', value: summary.totalOrders30d },
            { label: 'Avg Order Value', value: cents(summary.avgOrderValue) },
            { label: 'Deposit Links Sent', value: summary.depositsCount30d },
            { label: 'Last Order Received', value: summary.lastOrderAt ? new Date(summary.lastOrderAt).toLocaleString() : 'Never' },
          ].map((row) => (
            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F5F5F4' }}>
              <span style={{ fontSize: 13, color: '#44403C' }}>{row.label}</span>
              <span style={{ fontSize: 14, fontWeight: 600 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Per-Restaurant Health */}
      <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid #E7E5E4' }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>Per-Restaurant Health</h2>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 700, borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ borderBottom: '1px solid #E7E5E4' }}>
              <Th>Restaurant</Th><Th align="right">Orders (Month)</Th><Th>Last Order</Th><Th align="right">Avg Value</Th><Th>Plan</Th><Th>Health</Th>
            </tr></thead>
            <tbody>
              {restaurantHealth.map((r) => {
                const hc = statusColors[r.health] ?? statusColors.inactive;
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 500 }}>{r.name}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>{r.ordersThisMonth}</td>
                    <td style={{ padding: '12px 16px', color: '#78716C', fontSize: 12 }}>{r.lastOrderAt ? new Date(r.lastOrderAt).toLocaleDateString() : '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>{r.ordersThisMonth > 0 ? cents(r.avgOrderValue) : '—'}</td>
                    <td style={{ padding: '12px 16px' }}><span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: r.isPaid ? '#DCFCE7' : '#FEF3C7', color: r.isPaid ? '#166534' : '#92400E' }}>{r.isPaid ? 'Paid' : 'Trial'}</span></td>
                    <td style={{ padding: '12px 16px' }}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 9999, background: hc.bg, color: hc.color }}><span style={{ width: 6, height: 6, borderRadius: '50%', background: hc.dot }} />{r.health.replace('_', ' ').replace(/^\w/, (c) => c.toUpperCase())}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Th({ children, align }: { children: React.ReactNode; align?: 'right' }) {
  return <th style={{ padding: '10px 16px', textAlign: align ?? 'left', fontSize: 11, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{children}</th>;
}
