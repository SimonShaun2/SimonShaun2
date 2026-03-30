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

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Done' },
];

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

  const pendingCount = followUps.filter((f) => f.status === 'pending').length;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#1C1917' }}>Follow-Ups</h1>
          {!loading && pagination && (
            <span style={{ fontSize: 13, color: '#9CA3AF' }}>{pagination.total} total</span>
          )}
        </div>
      </div>

      {/* KPI hint */}
      {!loading && pendingCount > 0 && !statusFilter && (
        <div style={{
          background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontSize: 20 }}>📋</span>
          <span style={{ fontSize: 14, color: '#92400E', fontWeight: 500 }}>
            {pendingCount} follow-up{pendingCount !== 1 ? 's' : ''} pending
          </span>
        </div>
      )}

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {FILTERS.map((f) => {
          const isActive = statusFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              style={{
                padding: '5px 14px',
                border: isActive ? 'none' : '1px solid #E7E5E4',
                borderRadius: 20,
                background: isActive ? '#1C1917' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#57534E',
                cursor: 'pointer',
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {error && <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 12 }}>{error}</p>}

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Loading follow-ups...</div>
      )}

      {!loading && followUps.length === 0 && (
        <div style={{
          border: '1px dashed #D6D3D1', borderRadius: 10,
          padding: '48px 24px', textAlign: 'center',
        }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>✓</p>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#1C1917', marginBottom: 4 }}>
            {statusFilter === 'pending' ? 'No pending follow-ups' : statusFilter === 'completed' ? 'No completed follow-ups' : 'No follow-ups yet'}
          </p>
          <p style={{ fontSize: 13, color: '#78716C' }}>
            Follow-ups are created from order details to track customer outreach.
          </p>
        </div>
      )}

      {/* Follow-up cards */}
      {!loading && followUps.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {followUps.map((f) => {
            const isDone = f.status === 'completed';
            const isOverdue = !isDone && new Date(f.dueDate) < new Date();

            return (
              <div key={f.id} style={{
                border: `1px solid ${isOverdue ? '#FECACA' : '#E7E5E4'}`,
                borderRadius: 10,
                padding: '14px 18px',
                background: isDone ? '#FAFAF9' : '#FFFFFF',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={(e) => { if (!isDone) { e.currentTarget.style.borderColor = '#A8A29E'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; } }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = isOverdue ? '#FECACA' : '#E7E5E4'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {/* Left: info */}
                <div style={{ minWidth: 0, opacity: isDone ? 0.55 : 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    {/* Due date */}
                    <span style={{
                      fontSize: 12, fontWeight: 600,
                      color: isOverdue ? '#DC2626' : isDone ? '#9CA3AF' : '#57534E',
                    }}>
                      {isOverdue ? 'Overdue · ' : ''}{new Date(f.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span style={{ color: '#D6D3D1' }}>·</span>
                    {/* Customer */}
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1917' }}>{f.customer.name}</span>
                    {/* Status chip */}
                    <span style={{
                      fontSize: 11, padding: '1px 8px', borderRadius: 10, fontWeight: 600,
                      background: isDone ? '#F3F4F6' : '#FEF3C7',
                      color: isDone ? '#6B7280' : '#92400E',
                      textDecoration: isDone ? 'line-through' : 'none',
                    }}>
                      {isDone ? 'Done' : 'Pending'}
                    </span>
                    {/* Potential value */}
                    <span style={{ marginLeft: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0 }}>
                      <span style={{ fontSize: 10, color: '#A8A29E', fontWeight: 500, lineHeight: 1 }}>Potential value</span>
                      <span style={{ fontSize: 15, fontWeight: 700, color: '#D97706', lineHeight: 1.3 }}>${(f.order.total / 100).toFixed(2)}</span>
                    </span>
                  </div>
                  {/* Detail line */}
                  <div style={{ fontSize: 13, color: '#78716C', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span>${(f.order.total / 100).toFixed(2)} order</span>
                    <span style={{ color: '#D6D3D1' }}>·</span>
                    <span>Event {new Date(f.order.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    <span style={{ color: '#D6D3D1' }}>·</span>
                    <span>{f.customer.email}</span>
                  </div>
                  {/* Note */}
                  {f.note && (
                    <p style={{
                      fontSize: 13, color: '#57534E', margin: '6px 0 0',
                      padding: '4px 8px', background: '#FAFAF9', borderRadius: 6,
                      borderLeft: '2px solid #E7E5E4',
                    }}>
                      {f.note}
                    </p>
                  )}
                </div>

                {/* Right: actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 16 }}>
                  <button
                    onClick={() => toggleComplete(f.id, f.status)}
                    style={{
                      padding: '6px 14px', fontSize: 13, fontWeight: 600,
                      border: isDone ? '1px solid #D6D3D1' : 'none',
                      borderRadius: 8,
                      background: isDone ? '#FFFFFF' : '#1C1917',
                      color: isDone ? '#57534E' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'opacity 0.15s',
                    }}
                  >
                    {isDone ? 'Reopen' : 'Complete'}
                  </button>
                  <a
                    href={`/orders/${f.order.id}`}
                    style={{
                      padding: '6px 14px', fontSize: 13, fontWeight: 500,
                      border: '1px solid #D6D3D1', borderRadius: 8,
                      background: '#FFFFFF', textDecoration: 'none', color: '#57534E',
                      display: 'flex', alignItems: 'center',
                    }}
                  >
                    View Order
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
