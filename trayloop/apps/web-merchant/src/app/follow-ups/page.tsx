'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface FollowUp {
  id: string;
  status: string;
  dueDate: string;
  note: string | null;
  completedAt: string | null;
  createdAt: string;
  order: { id: string; status: string; eventDate: string; total: number; currency: string };
  customer: { name: string; email: string };
}

interface Pagination { page: number; pageSize: number; total: number; totalPages: number }

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    fetchFollowUps();
  }, [statusFilter]);

  async function fetchFollowUps() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('pageSize', '20');
      const res = await apiFetch(`/api/follow-ups?${params}`);
      setFollowUps(res.data);
      setPagination(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load follow-ups');
    } finally {
      setLoading(false);
    }
  }

  async function toggleComplete(id: string, currentStatus: string) {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      await apiFetch(`/api/follow-ups/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      fetchFollowUps();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Follow-Ups</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['', 'pending', 'completed'].map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              style={{
                padding: '0.3rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '9999px',
                background: statusFilter === s ? '#111827' : 'white',
                color: statusFilter === s ? 'white' : '#374151',
                cursor: 'pointer', fontSize: '0.8rem',
              }}>
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error}</p>}
      {loading && <p style={{ color: '#6b7280' }}>Loading...</p>}

      {!loading && followUps.length === 0 && (
        <div style={{ border: '1px dashed #d1d5db', borderRadius: '0.5rem', padding: '3rem', textAlign: 'center', color: '#6b7280' }}>
          No follow-ups found
        </div>
      )}

      {!loading && followUps.length > 0 && (
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {followUps.map((f) => (
            <div key={f.id} style={{
              border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              opacity: f.status === 'completed' ? 0.6 : 1,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: 600 }}>{f.customer.name}</span>
                  <span style={{
                    fontSize: '0.65rem', padding: '0.1rem 0.4rem', borderRadius: '9999px',
                    background: f.status === 'completed' ? '#DCFCE7' : '#FEF3C7',
                    color: f.status === 'completed' ? '#166534' : '#92400E',
                    fontWeight: 600,
                  }}>{f.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Due: {new Date(f.dueDate).toLocaleDateString()}
                  {' · '}Order: ${(f.order.total / 100).toFixed(2)}
                  {' · '}Event: {new Date(f.order.eventDate).toLocaleDateString()}
                </div>
                {f.note && <p style={{ fontSize: '0.8rem', color: '#78716C', marginTop: '0.25rem' }}>{f.note}</p>}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => toggleComplete(f.id, f.status)}
                  style={{
                    padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 500,
                    border: '1px solid #d1d5db', borderRadius: '0.375rem',
                    background: 'white', cursor: 'pointer',
                  }}>
                  {f.status === 'completed' ? 'Reopen' : 'Complete'}
                </button>
                <a href={`/orders/${f.order.id}`} style={{
                  padding: '0.4rem 0.8rem', fontSize: '0.8rem', fontWeight: 500,
                  border: '1px solid #d1d5db', borderRadius: '0.375rem',
                  background: 'white', textDecoration: 'none', color: '#374151',
                }}>
                  View Order
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
