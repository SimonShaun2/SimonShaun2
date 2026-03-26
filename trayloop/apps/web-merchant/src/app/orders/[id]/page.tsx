'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  depositRequired: boolean;
  allowedTransitions: string[];
  eventDate: string;
  headCount: number;
  notes: string | null;
  pricing: { packageSubtotal: number; addOnSubtotal: number; total: number; currency: string };
  location: { name: string; address: string; city: string; state: string; zipCode: string } | null;
  customer: { id: string; name: string; email: string; phone: string | null; company: string | null };
  deliveryAddress: { address: string; city: string; state: string; zipCode: string } | null;
  items: {
    packages: Array<{ name: string; description: string | null; quantity: number; unitPrice: number; totalPrice: number }>;
    addOns: Array<{ name: string; description: string | null; quantity: number; unitPrice: number; totalPrice: number }>;
  };
  timestamps: { created: string; updated: string; completed: string | null };
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { window.location.href = '/login'; return; }
    fetchOrder();
  }, [id]);

  async function fetchOrder() {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(newStatus: string) {
    setActionLoading(true);
    setError('');
    try {
      const body: Record<string, string> = { status: newStatus };
      if (newStatus === 'cancelled') {
        const reason = prompt('Cancellation reason:');
        if (!reason) { setActionLoading(false); return; }
        body.reason = reason;
      }
      await apiFetch(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) });
      await fetchOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendDeposit() {
    setActionLoading(true);
    setError('');
    try {
      await apiFetch(`/api/orders/${id}/send-deposit-link`, { method: 'POST', body: JSON.stringify({}) });
      await fetchOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send deposit link');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkPaid() {
    setActionLoading(true);
    setError('');
    try {
      await apiFetch(`/api/orders/${id}/mark-paid`, { method: 'PATCH' });
      await fetchOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as paid');
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <p style={{ color: '#6b7280' }}>Loading order...</p>;
  if (error && !order) return <p style={{ color: '#dc2626' }}>{error}</p>;
  if (!order) return null;

  const statusColors: Record<string, string> = {
    submitted: '#f59e0b', awaiting_deposit: '#3b82f6', confirmed: '#10b981',
    completed: '#6b7280', cancelled: '#ef4444',
  };

  return (
    <div>
      <a href="/" style={{ color: '#6b7280', fontSize: '0.875rem', textDecoration: 'none' }}>← Back to orders</a>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            {order.orderNumber} — {order.customer.name}
          </h1>
          <span style={{
            fontSize: '0.8rem', padding: '0.15rem 0.6rem', borderRadius: '9999px',
            background: statusColors[order.status] ?? '#6b7280', color: 'white', fontWeight: 500,
          }}>{order.status.replace('_', ' ')}</span>
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700 }}>
          ${(order.pricing.total / 100).toFixed(2)}
        </div>
      </div>

      {error && <p style={{ color: '#dc2626', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}

      {/* Actions */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
        {order.status === 'submitted' && order.depositRequired && (
          <button onClick={handleSendDeposit} disabled={actionLoading}
            style={{ padding: '0.5rem 1rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}>
            Send Deposit Link
          </button>
        )}
        {order.status === 'awaiting_deposit' && (
          <button onClick={handleMarkPaid} disabled={actionLoading}
            style={{ padding: '0.5rem 1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}>
            Mark Deposit Paid
          </button>
        )}
        {order.allowedTransitions.filter(t => t !== 'cancelled').map((t) => (
          <button key={t} onClick={() => handleStatusChange(t)} disabled={actionLoading}
            style={{ padding: '0.5rem 1rem', background: '#111827', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}>
            {t === 'confirmed' ? 'Confirm Order' : t === 'completed' ? 'Mark Complete' : t.replace('_', ' ')}
          </button>
        ))}
        {order.allowedTransitions.includes('cancelled') && (
          <button onClick={() => handleStatusChange('cancelled')} disabled={actionLoading}
            style={{ padding: '0.5rem 1rem', background: 'white', color: '#dc2626', border: '1px solid #dc2626', borderRadius: '0.375rem', cursor: 'pointer', fontWeight: 500 }}>
            Cancel Order
          </button>
        )}
      </div>

      {/* Details grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Customer */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>Customer</h3>
          <p style={{ fontWeight: 600 }}>{order.customer.name}</p>
          <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{order.customer.email}</p>
          {order.customer.phone && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{order.customer.phone}</p>}
          {order.customer.company && <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>{order.customer.company}</p>}
        </div>

        {/* Event Details */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>Event Details</h3>
          <p><strong>Date:</strong> {new Date(order.eventDate).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> {order.headCount}</p>
          {order.location && <p><strong>Location:</strong> {order.location.name}</p>}
          {order.notes && <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{order.notes}</p>}
        </div>

        {/* Delivery Address */}
        {order.deliveryAddress && (
          <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>Delivery Address</h3>
            <p>{order.deliveryAddress.address}</p>
            <p>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
          </div>
        )}

        {/* Pricing */}
        <div style={{ border: '1px solid #e5e7eb', borderRadius: '0.5rem', padding: '1rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '0.5rem', fontSize: '0.9rem', color: '#6b7280' }}>Pricing</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Packages</span><span>${(order.pricing.packageSubtotal / 100).toFixed(2)}</span></div>
          {order.pricing.addOnSubtotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Add-ons</span><span>${(order.pricing.addOnSubtotal / 100).toFixed(2)}</span></div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
            <span>Total</span><span>${(order.pricing.total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Items</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
              <th style={{ padding: '0.5rem' }}>Item</th>
              <th style={{ padding: '0.5rem' }}>Qty</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Unit</th>
              <th style={{ padding: '0.5rem', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.packages.map((item, i) => (
              <tr key={`pkg-${i}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.5rem' }}>{item.name}</td>
                <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>${(item.unitPrice / 100).toFixed(2)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>${(item.totalPrice / 100).toFixed(2)}</td>
              </tr>
            ))}
            {order.items.addOns.map((item, i) => (
              <tr key={`addon-${i}`} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '0.5rem' }}>{item.name} <span style={{ color: '#9ca3af', fontSize: '0.75rem' }}>(add-on)</span></td>
                <td style={{ padding: '0.5rem' }}>{item.quantity}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>${(item.unitPrice / 100).toFixed(2)}</td>
                <td style={{ padding: '0.5rem', textAlign: 'right' }}>${(item.totalPrice / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
