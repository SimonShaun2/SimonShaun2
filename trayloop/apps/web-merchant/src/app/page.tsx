'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../lib/api';
import SetupChecklist from '../components/setup-checklist';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  eventDate: string;
  headCount: number;
  itemCount: number;
  pricing: { total: number; currency: string };
  location: { name: string; city: string } | null;
  customer: { name: string; email: string; phone: string | null; company: string | null };
  deposit: { status: string; amount: number } | null;
  timestamps: { created: string; updated: string; completed: string | null };
}

interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  submitted: { bg: '#FEF3C7', color: '#92400E', label: 'New' },
  awaiting_deposit: { bg: '#DBEAFE', color: '#1E40AF', label: 'Awaiting Deposit' },
  confirmed: { bg: '#DCFCE7', color: '#166534', label: 'Confirmed' },
  completed: { bg: '#F3F4F6', color: '#374151', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
};

const DEPOSIT_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  pending: { bg: '#FEF3C7', color: '#92400E', label: 'Deposit pending' },
  paid: { bg: '#DCFCE7', color: '#166534', label: 'Paid' },
  refunded: { bg: '#F3F4F6', color: '#6B7280', label: 'Expired' },
};

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'submitted', label: 'New' },
  { value: 'awaiting_deposit', label: 'Awaiting Deposit' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  last7DaysRevenue: number;
  last30DaysRevenue: number;
  completedOrders: number;
  activeOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  repeatCustomers: number;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    fetchOrders();
    fetchStats();
  }, [statusFilter, page]);

  async function fetchStats() {
    try {
      const res = await apiFetch('/api/orders/stats');
      setStats(res.data);
    } catch {}
  }

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

  return (
    <div>
      <SetupChecklist />

      {/* Page header */}
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px', color: '#1C1917' }}>Dashboard</h1>

      {/* KPI cards - Row 1: Revenue */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        <KpiCard
          label="Revenue (7d)"
          value={stats ? `$${(stats.last7DaysRevenue / 100).toFixed(0)}` : '...'}
          sub="Last 7 days"
          accent="#10B981"
        />
        <KpiCard
          label="Revenue (30d)"
          value={stats ? `$${(stats.last30DaysRevenue / 100).toFixed(0)}` : '...'}
          sub="Last 30 days"
          accent="#3B82F6"
        />
        <KpiCard
          label="Avg Order Value"
          value={stats ? `$${(stats.avgOrderValue / 100).toFixed(0)}` : '...'}
          sub="Across all orders"
          accent="#1C1917"
        />
      </div>

      {/* KPI cards - Row 2: Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 28 }}>
        <KpiCard
          label="Active Orders"
          value={stats?.activeOrders ?? '...'}
          sub="Submitted, awaiting, or confirmed"
          accent="#F59E0B"
        />
        <KpiCard
          label="Repeat Customers"
          value={stats?.repeatCustomers ?? '...'}
          sub={stats ? `${stats.totalCustomers} total customers` : ''}
          accent="#8B5CF6"
        />
        <KpiCard
          label="Total Orders"
          value={stats?.totalOrders ?? '...'}
          sub={stats ? `${stats.completedOrders} completed` : ''}
          accent="#6B7280"
        />
      </div>

      {/* Orders section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1C1917' }}>Orders</h2>
        {pagination && (
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{pagination.total} total</span>
        )}
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => {
          const isActive = statusFilter === f.value;
          return (
            <button
              key={f.value}
              onClick={() => { setStatusFilter(f.value); setPage(1); }}
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
        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Loading orders...</div>
      )}

      {!loading && orders.length === 0 && (
        <div style={{ border: '1px dashed #D6D3D1', borderRadius: 10, padding: 40, textAlign: 'center', color: '#78716C' }}>
          {statusFilter ? `No ${FILTERS.find((f) => f.value === statusFilter)?.label.toLowerCase()} orders` : 'No orders yet'}
        </div>
      )}

      {/* Order rows */}
      {!loading && orders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {orders.map((order) => {
            const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.submitted;
            const dc = order.deposit ? (DEPOSIT_CONFIG[order.deposit.status] ?? DEPOSIT_CONFIG.pending) : null;

            return (
              <a key={order.id} href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div style={{
                  border: '1px solid #E7E5E4', borderRadius: 10, padding: '14px 18px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer', transition: 'border-color 0.15s, box-shadow 0.15s',
                  background: '#FFFFFF',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A8A29E'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E7E5E4'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  {/* Left: info */}
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace', fontWeight: 500 }}>{order.orderNumber}</span>
                      <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1917' }}>{order.customer.name}</span>
                      <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 10, background: sc.bg, color: sc.color, fontWeight: 600 }}>{sc.label}</span>
                      {dc && (
                        <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: dc.bg, color: dc.color, fontWeight: 600 }}>{dc.label}</span>
                      )}
                    </div>
                    <div style={{ fontSize: 13, color: '#78716C', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 500, color: '#57534E' }}>{new Date(order.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span style={{ color: '#D6D3D1' }}>·</span>
                      <span>{order.headCount} guests</span>
                      <span style={{ color: '#D6D3D1' }}>·</span>
                      <span>{order.itemCount} items</span>
                      {order.customer.company && (
                        <>
                          <span style={{ color: '#D6D3D1' }}>·</span>
                          <span>{order.customer.company}</span>
                        </>
                      )}
                      {order.location && (
                        <>
                          <span style={{ color: '#D6D3D1' }}>·</span>
                          <span>{order.location.name}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Right: price + arrow */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, marginLeft: 16 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1917' }}>${(order.pricing.total / 100).toFixed(2)}</div>
                    </div>
                    <span style={{ color: '#D6D3D1', fontSize: 16 }}>›</span>
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            style={{
              padding: '6px 14px', border: '1px solid #E7E5E4', borderRadius: 8,
              background: '#FFFFFF', cursor: page === 1 ? 'not-allowed' : 'pointer',
              fontSize: 13, color: page === 1 ? '#D6D3D1' : '#57534E',
            }}
          >
            Previous
          </button>
          <span style={{ fontSize: 13, color: '#78716C' }}>
            {pagination.page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(pagination.totalPages, page + 1))}
            disabled={page === pagination.totalPages}
            style={{
              padding: '6px 14px', border: '1px solid #E7E5E4', borderRadius: 8,
              background: '#FFFFFF', cursor: page === pagination.totalPages ? 'not-allowed' : 'pointer',
              fontSize: 13, color: page === pagination.totalPages ? '#D6D3D1' : '#57534E',
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent: string }) {
  return (
    <div style={{
      border: '1px solid #E7E5E4', borderRadius: 10, padding: '16px 18px',
      background: '#FFFFFF', borderLeft: `3px solid ${accent}`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.5px', color: '#78716C', marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color: '#1C1917', lineHeight: 1.2 }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#A8A29E', marginTop: 2 }}>{sub}</div>
    </div>
  );
}
