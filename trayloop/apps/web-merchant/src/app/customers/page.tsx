'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '../../lib/api';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  orderCount: number;
  totalSpend: number;
  lastOrderDate: string | null;
}

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  orderCount: number;
  totalSpend: number;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    total: number;
    eventDate: string | null;
    createdAt: string;
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    fetchCustomers();
  }, []);

  async function fetchCustomers() {
    try {
      const res = await apiFetch('/api/customers');
      setCustomers(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  async function selectCustomer(id: string) {
    setDetailLoading(true);
    setSelected(null);
    try {
      const res = await apiFetch(`/api/customers/${id}`);
      setSelected(res.data);
    } catch {
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  }

  const filtered = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q)
      || c.email.toLowerCase().includes(q)
      || (c.company?.toLowerCase().includes(q) ?? false);
  });

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      {/* Left: customer list */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Customers</h1>
          <span style={{ fontSize: 13, color: '#6b7280' }}>{filtered.length} total</span>
        </div>

        <input
          type="text"
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%', height: 40, padding: '0 12px', marginBottom: 16,
            border: '1px solid #D6D3D1', borderRadius: 8, fontSize: 14,
            boxSizing: 'border-box', outline: 'none',
          }}
        />

        {error && <p style={{ color: '#dc2626', marginBottom: 12 }}>{error}</p>}
        {loading && <p style={{ color: '#6b7280' }}>Loading...</p>}

        {!loading && filtered.length === 0 && (
          <div style={{ border: '1px dashed #d1d5db', borderRadius: 8, padding: 32, textAlign: 'center', color: '#6b7280' }}>
            {search ? 'No customers match your search' : 'No customers yet'}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '8px 8px 8px 0', fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</th>
                <th style={{ padding: 8, fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders</th>
                <th style={{ padding: 8, fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Spend</th>
                <th style={{ padding: 8, fontWeight: 600, color: '#6b7280', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last Order</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => selectCustomer(c.id)}
                  style={{
                    borderBottom: '1px solid #f3f4f6', cursor: 'pointer',
                    background: selected?.id === c.id ? '#F9FAFB' : 'transparent',
                  }}
                  onMouseEnter={(e) => { if (selected?.id !== c.id) e.currentTarget.style.background = '#FAFAF9'; }}
                  onMouseLeave={(e) => { if (selected?.id !== c.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <td style={{ padding: '10px 8px 10px 0' }}>
                    <div style={{ fontWeight: 600 }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#6b7280' }}>
                      {c.company && <span>{c.company} · </span>}
                      {c.email}
                    </div>
                  </td>
                  <td style={{ padding: 8, fontWeight: 500 }}>{c.orderCount}</td>
                  <td style={{ padding: 8, fontWeight: 500 }}>${(c.totalSpend / 100).toFixed(2)}</td>
                  <td style={{ padding: 8, color: '#6b7280', fontSize: 13 }}>
                    {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Right: customer detail panel */}
      {(selected || detailLoading) && (
        <div style={{
          width: 360, flexShrink: 0,
          border: '1px solid #e5e7eb', borderRadius: 10, padding: 20,
          position: 'sticky', top: 24, alignSelf: 'flex-start',
          background: '#fff',
        }}>
          {detailLoading ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: 24 }}>Loading...</p>
          ) : selected && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{selected.name}</h2>
                  {selected.company && <p style={{ fontSize: 13, color: '#6b7280', margin: '2px 0 0' }}>{selected.company}</p>}
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: 18 }}>×</button>
              </div>

              {/* Contact info */}
              <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
                <span>{selected.email}</span>
                {selected.phone && <span>{selected.phone}</span>}
              </div>

              {/* Stats */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
                <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>{selected.orderCount}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Orders</div>
                </div>
                <div style={{ background: '#F9FAFB', borderRadius: 8, padding: 12, textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 700 }}>${(selected.totalSpend / 100).toFixed(2)}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Spend</div>
                </div>
              </div>

              {/* Notes */}
              {selected.notes && (
                <div style={{ background: '#FFFBEB', borderRadius: 8, padding: 10, marginBottom: 16, fontSize: 13, color: '#92400E' }}>
                  {selected.notes}
                </div>
              )}

              {/* Recent orders */}
              <div>
                <h3 style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>Recent Orders</h3>
                {selected.recentOrders.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#9ca3af' }}>No orders yet</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {selected.recentOrders.map((o) => (
                      <a key={o.id} href={`/orders/${o.id}`} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '8px 10px', borderRadius: 6, border: '1px solid #f3f4f6',
                        textDecoration: 'none', color: 'inherit', fontSize: 13,
                      }}>
                        <div>
                          <span style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 12 }}>{o.orderNumber}</span>
                          <span style={{
                            fontSize: 10, padding: '1px 5px', borderRadius: 8, marginLeft: 6,
                            background: o.status === 'completed' ? '#DCFCE7' : o.status === 'confirmed' ? '#DBEAFE' : '#F3F4F6',
                            color: o.status === 'completed' ? '#166534' : o.status === 'confirmed' ? '#1E40AF' : '#6B7280',
                          }}>{o.status}</span>
                        </div>
                        <span style={{ fontWeight: 600 }}>${(o.total / 100).toFixed(2)}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
