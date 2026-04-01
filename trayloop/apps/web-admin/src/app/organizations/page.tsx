'use client';

import { useEffect, useState, useMemo } from 'react';
import { apiFetch } from '../../lib/api';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  isPaid: boolean;
  createdAt: string;
  ownerName: string | null;
  ownerEmail: string | null;
  orderCount: number;
  gmv: number;
  avgOrderValue: number;
  lastOrderAt: string | null;
  health: 'healthy' | 'at_risk' | 'new' | 'inactive';
}

type Filter = 'all' | 'paid' | 'trial' | 'active' | 'inactive' | 'at_risk';
type SortKey = 'gmv' | 'recent' | 'newest';

function cents(amount: number): string {
  return `$${(amount / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function RestaurantsPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [sort, setSort] = useState<SortKey>('gmv');
  const [search, setSearch] = useState('');

  useEffect(() => {
    apiFetch('/api/admin/restaurants')
      .then((res) => setRestaurants(res.data ?? []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = restaurants;

    // Filter
    if (filter === 'paid') result = result.filter((r) => r.isPaid);
    else if (filter === 'trial') result = result.filter((r) => !r.isPaid && r.isActive);
    else if (filter === 'active') result = result.filter((r) => r.isActive);
    else if (filter === 'inactive') result = result.filter((r) => !r.isActive);
    else if (filter === 'at_risk') result = result.filter((r) => r.health === 'at_risk');

    // Search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.slug.toLowerCase().includes(q) ||
        (r.ownerName?.toLowerCase().includes(q)) ||
        (r.ownerEmail?.toLowerCase().includes(q))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      if (sort === 'gmv') return b.gmv - a.gmv;
      if (sort === 'recent') {
        const aDate = a.lastOrderAt ? new Date(a.lastOrderAt).getTime() : 0;
        const bDate = b.lastOrderAt ? new Date(b.lastOrderAt).getTime() : 0;
        return bDate - aDate;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [restaurants, filter, sort, search]);

  const counts = useMemo(() => ({
    all: restaurants.length,
    paid: restaurants.filter((r) => r.isPaid).length,
    trial: restaurants.filter((r) => !r.isPaid && r.isActive).length,
    active: restaurants.filter((r) => r.isActive).length,
    inactive: restaurants.filter((r) => !r.isActive).length,
    at_risk: restaurants.filter((r) => r.health === 'at_risk').length,
  }), [restaurants]);

  if (loading) {
    return (
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Restaurants</h1>
        <p style={{ fontSize: 13, color: '#78716C' }}>Loading directory...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Restaurants</h1>
        <div style={{ padding: 24, background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, fontSize: 14, color: '#DC2626' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginTop: 0, marginBottom: 4 }}>Restaurants</h1>
      <p style={{ fontSize: 13, color: '#78716C', marginTop: 0, marginBottom: 20 }}>
        {restaurants.length} restaurants on the platform
      </p>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
        {/* Filters */}
        <div style={{ display: 'flex', gap: 6 }}>
          {([
            ['all', `All (${counts.all})`],
            ['paid', `Paid (${counts.paid})`],
            ['trial', `Trial (${counts.trial})`],
            ['at_risk', `At Risk (${counts.at_risk})`],
            ['inactive', `Inactive (${counts.inactive})`],
          ] as [Filter, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              style={{
                padding: '5px 12px', borderRadius: 6, fontSize: 12, fontWeight: 500,
                border: filter === key ? '1px solid #1C1917' : '1px solid #E7E5E4',
                background: filter === key ? '#1C1917' : '#FFFFFF',
                color: filter === key ? '#FAFAF9' : '#44403C',
                cursor: 'pointer',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Search + Sort */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search restaurants..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: '6px 12px', border: '1px solid #D6D3D1', borderRadius: 6,
              fontSize: 13, width: 200, outline: 'none', background: '#FFFFFF',
            }}
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            style={{
              padding: '6px 10px', border: '1px solid #D6D3D1', borderRadius: 6,
              fontSize: 12, background: '#FFFFFF', color: '#44403C', cursor: 'pointer',
            }}
          >
            <option value="gmv">Sort: GMV</option>
            <option value="recent">Sort: Recent activity</option>
            <option value="newest">Sort: Newest</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div style={{ padding: 40, border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', textAlign: 'center' }}>
          <p style={{ fontSize: 14, color: '#A8A29E', margin: 0 }}>
            {search ? 'No restaurants match your search' : 'No restaurants in this category'}
          </p>
        </div>
      ) : (
        <div style={{ border: '1px solid #E7E5E4', borderRadius: 10, background: '#FFFFFF', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E7E5E4' }}>
                <Th>Restaurant</Th>
                <Th>Owner</Th>
                <Th>Status</Th>
                <Th>Plan</Th>
                <Th>Health</Th>
                <Th align="right">GMV</Th>
                <Th align="right">Orders</Th>
                <Th align="right">Avg Order</Th>
                <Th>Last Order</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid #F5F5F4' }}>
                  {/* Restaurant */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={r.name} />
                      <div>
                        <div style={{ fontWeight: 500, fontSize: 13 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: '#D4A853', fontFamily: 'monospace' }}>{r.slug}</div>
                      </div>
                    </div>
                  </td>
                  {/* Owner */}
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#78716C' }}>
                    {r.ownerName ?? '—'}
                  </td>
                  {/* Status */}
                  <td style={{ padding: '12px 16px' }}>
                    <Badge
                      label={r.isActive ? 'Active' : 'Inactive'}
                      bg={r.isActive ? '#DCFCE7' : '#FEE2E2'}
                      color={r.isActive ? '#166534' : '#991B1B'}
                    />
                  </td>
                  {/* Plan */}
                  <td style={{ padding: '12px 16px' }}>
                    <Badge
                      label={r.isPaid ? 'Paid' : 'Trial'}
                      bg={r.isPaid ? '#DCFCE7' : '#FEF3C7'}
                      color={r.isPaid ? '#166534' : '#92400E'}
                    />
                  </td>
                  {/* Health */}
                  <td style={{ padding: '12px 16px' }}>
                    <HealthBadge health={r.health} />
                  </td>
                  {/* GMV */}
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600 }}>
                    {cents(r.gmv)}
                  </td>
                  {/* Orders */}
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#44403C' }}>
                    {r.orderCount}
                  </td>
                  {/* Avg Order */}
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: '#78716C' }}>
                    {r.orderCount > 0 ? cents(r.avgOrderValue) : '—'}
                  </td>
                  {/* Last Order */}
                  <td style={{ padding: '12px 16px', fontSize: 12, color: '#78716C' }}>
                    {r.lastOrderAt ? new Date(r.lastOrderAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// --- Components ---

function Th({ children, align }: { children: React.ReactNode; align?: 'right' | 'left' }) {
  return (
    <th style={{
      padding: '10px 16px', textAlign: align ?? 'left',
      fontSize: 11, fontWeight: 600, color: '#78716C',
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>{children}</th>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%', background: '#F5F5F4',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 700, color: '#78716C', flexShrink: 0,
    }}>{initials}</div>
  );
}

function Badge({ label, bg, color }: { label: string; bg: string; color: string }) {
  return (
    <span style={{
      display: 'inline-block', padding: '2px 10px', borderRadius: 9999,
      fontSize: 11, fontWeight: 600, background: bg, color,
    }}>{label}</span>
  );
}

function HealthBadge({ health }: { health: string }) {
  const config: Record<string, { label: string; bg: string; color: string; dot: string }> = {
    healthy: { label: 'Healthy', bg: '#DCFCE7', color: '#166534', dot: '#22C55E' },
    at_risk: { label: 'At Risk', bg: '#FEF2F2', color: '#991B1B', dot: '#EF4444' },
    new: { label: 'New', bg: '#DBEAFE', color: '#1E40AF', dot: '#3B82F6' },
    inactive: { label: 'Inactive', bg: '#F3F4F6', color: '#6B7280', dot: '#9CA3AF' },
  };
  const c = config[health] ?? config.inactive;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 10px', borderRadius: 9999,
      fontSize: 11, fontWeight: 600, background: c.bg, color: c.color,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: c.dot }} />
      {c.label}
    </span>
  );
}
