'use client';

import { useEffect, useState, useMemo } from 'react';
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

interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

interface LocationBreakdown {
  locationId: string;
  locationName: string;
  orderCount: number;
  revenue: number;
}

interface Stats {
  totalOrders: number;
  totalRevenue: number;
  last7DaysRevenue: number;
  last7DaysOrders: number;
  last30DaysRevenue: number;
  completedOrders: number;
  activeOrders: number;
  avgOrderValue: number;
  totalCustomers: number;
  repeatCustomers: number;
  dailyRevenue: DailyRevenue[];
  locationBreakdown: LocationBreakdown[];
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

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDayName(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return DAY_NAMES[d.getDay()] || dateStr;
}

function isWithin48Hours(eventDate: string): boolean {
  const now = new Date();
  const event = new Date(eventDate);
  const diff = event.getTime() - now.getTime();
  return diff > 0 && diff <= 48 * 60 * 60 * 1000;
}

function isUpcoming(eventDate: string): boolean {
  return new Date(eventDate) >= new Date();
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
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

  // Client-side location filtering
  const filteredOrders = useMemo(() => {
    if (!locationFilter) return orders;
    return orders.filter((o) => o.location?.name === locationFilter);
  }, [orders, locationFilter]);

  // Split into upcoming and past
  const { upcomingOrders, pastOrders } = useMemo(() => {
    const upcoming: Order[] = [];
    const past: Order[] = [];
    for (const o of filteredOrders) {
      if (isUpcoming(o.eventDate)) {
        upcoming.push(o);
      } else {
        past.push(o);
      }
    }
    return { upcomingOrders: upcoming, pastOrders: past };
  }, [filteredOrders]);

  const hasGroupHeaders = upcomingOrders.length > 0 && pastOrders.length > 0;

  // Revenue trend chart data
  const maxRevenue = useMemo(() => {
    if (!stats?.dailyRevenue?.length) return 0;
    return Math.max(...stats.dailyRevenue.map((d) => d.revenue), 1);
  }, [stats?.dailyRevenue]);

  return (
    <div>
      <SetupChecklist />

      {/* Page header */}
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 20px', color: '#1C1917' }}>Dashboard</h1>

      {/* KPI cards - Row 1: Primary (larger) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 12 }}>
        <KpiCard
          label="Revenue (7d)"
          value={stats ? `$${(stats.last7DaysRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '...'}
          sub={stats ? `${stats.last7DaysOrders} orders` : 'Last 7 days'}
          accent="#D4A853"
          large
        />
        <KpiCard
          label="Revenue (30d)"
          value={stats ? `$${(stats.last30DaysRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '...'}
          sub="Last 30 days"
          accent="#3B82F6"
          large
        />
        <KpiCard
          label="Orders (7d)"
          value={stats?.last7DaysOrders ?? '...'}
          sub="Last 7 days"
          accent="#1C1917"
          large
        />
      </div>

      {/* KPI cards - Row 2: Secondary (smaller) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 28 }}>
        <KpiCard
          label="Avg Order Value"
          value={stats ? `$${(stats.avgOrderValue / 100).toFixed(0)}` : '...'}
          sub="Across all orders"
          accent="#E7E5E4"
        />
        <KpiCard
          label="Active Orders"
          value={stats?.activeOrders ?? '...'}
          sub="In progress"
          accent="#E7E5E4"
        />
        <KpiCard
          label="Repeat Customers"
          value={stats?.repeatCustomers ?? '...'}
          sub={stats ? `of ${stats.totalCustomers} total` : ''}
          accent="#E7E5E4"
        />
        <KpiCard
          label="Total Customers"
          value={stats?.totalCustomers ?? '...'}
          sub={stats ? `${stats.repeatCustomers} returning` : ''}
          accent="#E7E5E4"
        />
      </div>

      {/* Revenue Trend (7 days) */}
      {stats?.dailyRevenue && stats.dailyRevenue.length > 0 && (
        <div style={{
          border: '1px solid #E7E5E4',
          borderRadius: 10,
          background: '#FFFFFF',
          padding: '18px 20px',
          marginBottom: 28,
        }}>
          <div style={{
            fontSize: 13,
            fontWeight: 700,
            color: '#1C1917',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}>
            Revenue Trend (7 days)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.dailyRevenue.map((day) => {
              const pct = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0;
              const dollars = (day.revenue / 100).toFixed(0);
              return (
                <div key={day.date} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: '#78716C',
                    width: 32,
                    flexShrink: 0,
                    textAlign: 'right',
                  }}>
                    {getDayName(day.date)}
                  </span>
                  <div style={{ flex: 1, background: '#F5F5F4', borderRadius: 4, height: 22, position: 'relative', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.max(pct, 2)}%`,
                      background: day.revenue > 0 ? '#D4A853' : '#E7E5E4',
                      borderRadius: 4,
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: day.revenue > 0 ? '#1C1917' : '#A8A29E',
                    width: 60,
                    flexShrink: 0,
                    textAlign: 'right',
                  }}>
                    ${dollars}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Orders section header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: '#1C1917' }}>Orders</h2>
        {pagination && (
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>{pagination.total} total</span>
        )}
      </div>

      {/* Status filter pills */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
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

      {/* Location filter pills */}
      {stats?.locationBreakdown && stats.locationBreakdown.length > 0 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
          <button
            onClick={() => setLocationFilter('')}
            style={{
              padding: '5px 14px',
              border: !locationFilter ? 'none' : '1px solid #E7E5E4',
              borderRadius: 20,
              background: !locationFilter ? '#1C1917' : '#FFFFFF',
              color: !locationFilter ? '#FFFFFF' : '#57534E',
              cursor: 'pointer',
              fontSize: 13,
              fontWeight: !locationFilter ? 600 : 400,
              transition: 'all 0.15s',
            }}
          >
            All Locations
          </button>
          {stats.locationBreakdown.map((loc) => {
            const isActive = locationFilter === loc.locationName;
            return (
              <button
                key={loc.locationId}
                onClick={() => setLocationFilter(isActive ? '' : loc.locationName)}
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
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {loc.locationName}
                <span style={{
                  fontSize: 11,
                  fontWeight: 400,
                  color: isActive ? 'rgba(255,255,255,0.7)' : '#9CA3AF',
                }}>
                  ${(loc.revenue / 100).toFixed(0)}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {error && <p style={{ color: '#DC2626', fontSize: 14, marginBottom: 12 }}>{error}</p>}

      {loading && (
        <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF', fontSize: 14 }}>Loading orders...</div>
      )}

      {!loading && filteredOrders.length === 0 && (
        <div style={{ border: '1px dashed #D6D3D1', borderRadius: 10, padding: 40, textAlign: 'center', color: '#78716C' }}>
          {statusFilter
            ? `No ${FILTERS.find((f) => f.value === statusFilter)?.label.toLowerCase()} orders`
            : locationFilter
              ? `No orders for ${locationFilter}`
              : 'No orders yet'}
        </div>
      )}

      {/* Order rows */}
      {!loading && filteredOrders.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Upcoming section */}
          {upcomingOrders.length > 0 && (
            <>
              {hasGroupHeaders && (
                <div style={{
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'uppercase' as const,
                  letterSpacing: '0.5px',
                  color: '#78716C',
                  padding: '8px 0 4px',
                }}>
                  Upcoming
                </div>
              )}
              {upcomingOrders.map((order) => (
                <OrderRow key={order.id} order={order} />
              ))}
            </>
          )}

          {/* Divider between groups */}
          {hasGroupHeaders && (
            <div style={{
              borderTop: '1px solid #E7E5E4',
              marginTop: 8,
              paddingTop: 12,
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.5px',
              color: '#78716C',
              paddingBottom: 4,
            }}>
              Past
            </div>
          )}

          {/* Past section */}
          {pastOrders.map((order) => (
            <OrderRow key={order.id} order={order} />
          ))}
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

function OrderRow({ order }: { order: Order }) {
  const sc = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.submitted;
  const dc = order.deposit ? (DEPOSIT_CONFIG[order.deposit.status] ?? DEPOSIT_CONFIG.pending) : null;
  const isHighValue = order.pricing.total > 50000; // > $500 in cents
  const isSoon = isWithin48Hours(order.eventDate);

  return (
    <a href={`/orders/${order.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        style={{
          border: '1px solid #E7E5E4',
          borderRadius: 10,
          padding: '14px 18px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          background: '#FFFFFF',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = '#A8A29E';
          e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = '#E7E5E4';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Left: info */}
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontFamily: 'monospace', fontWeight: 500 }}>
              {order.orderNumber}
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#1C1917' }}>
              {order.customer.name}
            </span>
            <span style={{
              fontSize: 11,
              padding: '1px 8px',
              borderRadius: 10,
              background: sc.bg,
              color: sc.color,
              fontWeight: 600,
            }}>
              {sc.label}
            </span>
            {dc && (
              <span style={{
                fontSize: 10,
                padding: '1px 6px',
                borderRadius: 10,
                background: dc.bg,
                color: dc.color,
                fontWeight: 600,
              }}>
                {dc.label}
              </span>
            )}
            {isSoon && (
              <span style={{
                fontSize: 10,
                padding: '1px 7px',
                borderRadius: 10,
                background: '#FEF3C7',
                color: '#92400E',
                fontWeight: 700,
              }}>
                Soon
              </span>
            )}
          </div>
          <div style={{ fontSize: 13, color: '#78716C', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 500, color: '#57534E' }}>
              {new Date(order.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
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

        {/* Right: price + indicators + arrow */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0, marginLeft: 16 }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1C1917' }}>
              {isHighValue && (
                <span style={{ color: '#D4A853', marginRight: 4, fontSize: 14 }} title="High-value order">
                  ★
                </span>
              )}
              ${(order.pricing.total / 100).toFixed(2)}
            </div>
          </div>
          <span style={{ color: '#D6D3D1', fontSize: 16 }}>›</span>
        </div>
      </div>
    </a>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
  large,
}: {
  label: string;
  value: string | number;
  sub: string;
  accent: string;
  large?: boolean;
}) {
  return (
    <div style={{
      border: '1px solid #E7E5E4',
      borderRadius: 10,
      padding: large ? '18px 20px' : '14px 16px',
      background: '#FFFFFF',
      borderLeft: `3px solid ${accent}`,
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase' as const,
        letterSpacing: '0.5px',
        color: '#78716C',
        marginBottom: large ? 6 : 3,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: large ? 28 : 22,
        fontWeight: 700,
        color: '#1C1917',
        lineHeight: 1.2,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 12, color: '#A8A29E', marginTop: 2 }}>{sub}</div>
    </div>
  );
}
