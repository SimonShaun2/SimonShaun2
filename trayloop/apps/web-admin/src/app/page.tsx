'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface Stats {
  organizations: number;
  users: number;
  orders: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/api/admin/stats')
      .then((res) => setStats(res.data))
      .catch(() => setStats({ organizations: 0, users: 0, orders: 0, revenue: 0 }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Overview</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 28 }}>
        Every restaurant, every dollar — your TrayLoop business at a glance
      </p>

      {loading ? (
        <p style={{ color: '#78716C', fontSize: 14 }}>Loading platform data...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <KpiCard label="ACTIVE RESTAURANTS" value={stats?.organizations ?? 0} />
          <KpiCard label="USERS" value={stats?.users ?? 0} />
          <KpiCard label="ORDERS" value={stats?.orders ?? 0} />
          <KpiCard label="GMV" value={`$${((stats?.revenue ?? 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
        </div>
      )}

      <div style={{
        marginTop: 40, padding: 32, border: '1px solid #E7E5E4', borderRadius: 10,
        background: '#FFFFFF', textAlign: 'center',
      }}>
        <p style={{ fontSize: 14, color: '#78716C', margin: 0 }}>
          Platform analytics, MRR tracking, and restaurant health views are coming in the next sprint.
        </p>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{
      border: '1px solid #E7E5E4', borderRadius: 10, padding: '20px 24px',
      background: '#FFFFFF',
    }}>
      <p style={{ fontSize: 10, fontWeight: 600, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.04em', marginTop: 0, marginBottom: 8 }}>{label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, margin: 0, color: '#1C1917' }}>{value}</p>
    </div>
  );
}
