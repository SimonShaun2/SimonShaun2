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
    const token = localStorage.getItem('admin_token');
    if (!token) { window.location.href = '/login'; return; }

    // The admin stats endpoint may not return these yet; we show what we can
    setLoading(true);
    Promise.resolve().then(async () => {
      try {
        const res = await apiFetch('/api/admin/stats');
        setStats(res.data);
      } catch {
        // Stats endpoint may not be fully implemented yet
        setStats({ organizations: 0, users: 0, orders: 0, revenue: 0 });
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (loading) return <p style={{ color: '#6b7280' }}>Loading...</p>;

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Platform Overview</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <StatCard label="Organizations" value={stats?.organizations ?? 0} />
        <StatCard label="Users" value={stats?.users ?? 0} />
        <StatCard label="Orders" value={stats?.orders ?? 0} />
        <StatCard label="Revenue" value={`$${((stats?.revenue ?? 0) / 100).toFixed(2)}`} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1.5rem', textAlign: 'center' }}>
      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>{label}</p>
      <p style={{ fontSize: '2rem', fontWeight: 700 }}>{value}</p>
    </div>
  );
}
