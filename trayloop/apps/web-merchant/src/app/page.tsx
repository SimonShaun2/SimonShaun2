'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';

interface Order {
  id: string;
  status: string;
  eventDate: string;
  headCount: number;
  itemCount: number;
  pricing: { total: number; currency: string };
  location: { name: string; city: string } | null;
  customer: { name: string; email: string; phone: string | null; company: string | null };
  timestamps: { created: string; updated: string; completed: string | null };
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    fetchOrders();
  }, [statusFilter, page]);

  async function fetchOrders() {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', page.toString());
      params.set('pageSize', '20');
      const res = await apiFetch(`/api/orders?${params}`);
      setOrders(res.data);
      setPagination(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }

  const statusColors: Record<string, string> = {
    submitted: '#f59e0b',
    awaiting_deposit: '#3b82f6',
    confirmed: '#10b981',
    completed: '#6b7280',
    cancelled: '#ef4444',
  };

  const statuses = ['', 'submitted', 'awaiting_deposit', 'confirmed', 'completed', 'cancelled'];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Orders</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {statuses.map((s) => (
            <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }}
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

      {error && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && <p style={{ color: '#6b7280' }}>Loading orders...</p>}

      {!loading && orders.length === 0 && (
        <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280', border: '1px dashed #d1d5db', borderRadius: '0.5rem' }}>
          No orders found
        </div>
      )}

      {!loading && orders.length > 0 && (
        <div style={{ display: 'grid', gap: '0.75rem' }}>
          {orders.map((order) => (
            <a key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600 }}>{order.customer.name}</span>
                    <span style={{
                      fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '9999px',
                      background: statusColors[order.status] ?? '#6b7280', color: 'white', fontWeight: 500,
                    }}>{order.status.replace('_', ' ')}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                    {order.customer.company && <span>{order.customer.company} · </span>}
                    {order.headCount} guests · {order.itemCount} items
                    {order.location && <span> · {order.location.name}</span>}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                    Event: {new Date(order.eventDate).toLocaleDateString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>
                    ${(order.pricing.total / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' }}>
          <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
            style={{ padding: '0.4rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer', background: 'white' }}>
            Previous
          </button>
          <span style={{ padding: '0.4rem 0.8rem', color: '#6b7280', fontSize: '0.875rem' }}>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button onClick={() => setPage(Math.min(pagination.totalPages, page + 1))} disabled={page === pagination.totalPages}
            style={{ padding: '0.4rem 0.8rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', cursor: 'pointer', background: 'white' }}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
