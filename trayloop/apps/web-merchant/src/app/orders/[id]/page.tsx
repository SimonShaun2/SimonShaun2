'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { hasMerchantSession } from '../../../lib/session';

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  serviceType: string;
  depositRequired: boolean;
  allowedTransitions: string[];
  eventDate: string;
  headCount: number;
  notes: string | null;
  pricing: { packageSubtotal: number; addOnSubtotal: number; total: number; currency: string };
  location: { name: string; address: string; city: string; state: string; zipCode: string; country: string; phone: string | null; email: string | null } | null;
  customer: { id: string; name: string; email: string; phone: string | null; company: string | null };
  deliveryAddress: { address: string; city: string; state: string; zipCode: string; country?: string } | null;
  deposit: {
    id: string; amount: number; currency: string; status: string;
    paidAt: string | null; hasStripeSession: boolean; stripePaymentIntentId: string | null;
  } | null;
  items: {
    packages: Array<{ name: string; description: string | null; quantity: number; unitPrice: number; totalPrice: number }>;
    addOns: Array<{ name: string; description: string | null; quantity: number; unitPrice: number; totalPrice: number }>;
  };
  timeline: Array<{ id: string; type: string; description: string; metadata: Record<string, unknown> | null; createdAt: string }>;
  timestamps: { created: string; updated: string; completed: string | null };
}

const SC: Record<string, { bg: string; color: string; label: string }> = {
  submitted: { bg: '#FEF3C7', color: '#92400E', label: 'New' },
  awaiting_deposit: { bg: '#DBEAFE', color: '#1E40AF', label: 'Awaiting Deposit' },
  confirmed: { bg: '#DCFCE7', color: '#166534', label: 'Confirmed' },
  completed: { bg: '#F3F4F6', color: '#374151', label: 'Completed' },
  cancelled: { bg: '#FEE2E2', color: '#991B1B', label: 'Cancelled' },
};

const card: React.CSSProperties = { background: '#FFF', border: '1px solid #E7E5E4', borderRadius: 10, padding: '16px 18px' };
const sectionLabel: React.CSSProperties = { fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#78716C', marginBottom: 8, display: 'block' };

function formatServiceType(serviceType: string) {
  switch (serviceType) {
    case 'full_service':
      return 'Full Service';
    case 'on_site':
      return 'On-Site';
    case 'food_truck':
      return 'Food Truck';
    default:
      return serviceType.charAt(0).toUpperCase() + serviceType.slice(1);
  }
}

export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [reorderWarnings, setReorderWarnings] = useState<string[]>([]);
  const [reorderSuccess, setReorderSuccess] = useState<{ orderNumber: string; id: string } | null>(null);

  useEffect(() => {
    if (!hasMerchantSession()) { window.location.href = '/login'; return; }
    fetchOrder();
  }, [id]);

  async function fetchOrder() { setLoading(true); try { const res = await apiFetch(`/api/orders/${id}`); setOrder(res.data); } catch (err) { setError(err instanceof Error ? err.message : 'Failed to load'); } finally { setLoading(false); } }
  async function handleStatusChange(s: string) { setActionLoading(true); setError(''); try { const b: Record<string,string> = { status: s }; if (s === 'cancelled') { const r = prompt('Cancellation reason:'); if (!r) { setActionLoading(false); return; } b.reason = r; } await apiFetch(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(b) }); await fetchOrder(); } catch (err) { setError(err instanceof Error ? err.message : 'Action failed'); } finally { setActionLoading(false); } }
  async function handleSendDeposit() { setActionLoading(true); setError(''); try { await apiFetch(`/api/orders/${id}/send-deposit-link`, { method: 'POST', body: JSON.stringify({}) }); await fetchOrder(); } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); } finally { setActionLoading(false); } }
  async function handleMarkPaid() { setActionLoading(true); setError(''); try { await apiFetch(`/api/orders/${id}/mark-paid`, { method: 'PATCH' }); await fetchOrder(); } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); } finally { setActionLoading(false); } }
  async function handleReorder() { setActionLoading(true); setError(''); setReorderWarnings([]); setReorderSuccess(null); const d = prompt('Event date (YYYY-MM-DD):'); if (!d) { setActionLoading(false); return; } const dt = new Date(d+'T12:00:00.000Z'); if (isNaN(dt.getTime())) { setError('Invalid date'); setActionLoading(false); return; } try { const res = await apiFetch(`/api/orders/${id}/reorder`, { method: 'POST', body: JSON.stringify({ eventDate: dt.toISOString() }) }); setReorderSuccess({ orderNumber: res.data.orderNumber, id: res.data.id }); if (res.data.warnings?.length) setReorderWarnings(res.data.warnings); } catch (err) { setError(err instanceof Error ? err.message : 'Reorder failed'); } finally { setActionLoading(false); } }

  async function handleRefundDeposit() { if (!confirm('Refund this deposit? This will cancel the order.')) return; setActionLoading(true); setError(''); try { await apiFetch(`/api/orders/${id}/refund-deposit`, { method: 'POST' }); await fetchOrder(); } catch (err) { setError(err instanceof Error ? err.message : 'Refund failed'); } finally { setActionLoading(false); } }
  function handlePrint() { window.print(); }

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: '#9CA3AF' }}>Loading order...</div>;
  if (error && !order) return <div style={{ padding: 40, textAlign: 'center', color: '#DC2626' }}>{error}</div>;
  if (!order) return null;

  const sc = SC[order.status] ?? SC.submitted;

  return (
    <div>
      {/* Back link */}
      <a href="/" style={{ fontSize: 13, color: '#78716C', textDecoration: 'none' }}>← Back to orders</a>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 12, marginBottom: 20 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: '#1C1917' }}>{order.orderNumber}</h1>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 10, background: sc.bg, color: sc.color }}>{sc.label}</span>
          </div>
          <p style={{ fontSize: 15, color: '#57534E', margin: 0 }}>{order.customer.name}{order.customer.company ? ` · ${order.customer.company}` : ''}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#1C1917', lineHeight: 1 }}>${(order.pricing.total / 100).toFixed(2)}</div>
          <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{new Date(order.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
        </div>
      </div>

      {/* Banners */}
      {error && <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}><p style={{ color: '#DC2626', fontSize: 13, fontWeight: 500, margin: 0 }}>{error}</p></div>}
      {reorderSuccess && <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}><p style={{ color: '#166534', fontSize: 13, fontWeight: 600, margin: 0 }}>Reorder created: <a href={`/orders/${reorderSuccess.id}`} style={{ color: '#2563EB' }}>{reorderSuccess.orderNumber}</a></p></div>}
      {reorderWarnings.length > 0 && <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 14px', marginBottom: 12 }}><p style={{ color: '#92400E', fontSize: 13, fontWeight: 600, margin: '0 0 4px' }}>Some items were unavailable:</p><ul style={{ margin: 0, paddingLeft: 18, color: '#92400E', fontSize: 13 }}>{reorderWarnings.map((w, i) => <li key={i}>{w}</li>)}</ul></div>}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {order.status === 'submitted' && order.depositRequired && (
          <ActionBtn onClick={handleSendDeposit} disabled={actionLoading} variant="blue">Send Deposit Link</ActionBtn>
        )}
        {order.status === 'awaiting_deposit' && (
          <ActionBtn onClick={handleMarkPaid} disabled={actionLoading} variant="green">Mark Deposit Paid</ActionBtn>
        )}
        {order.allowedTransitions.filter(t => t !== 'cancelled').map((t) => (
          <ActionBtn key={t} onClick={() => handleStatusChange(t)} disabled={actionLoading} variant="dark">
            {t === 'confirmed' ? 'Confirm Order' : t === 'completed' ? 'Mark Complete' : t.replace('_', ' ')}
          </ActionBtn>
        ))}
        <ActionBtn onClick={handlePrint} disabled={false} variant="outline">Print Ticket</ActionBtn>
        <ActionBtn onClick={handleReorder} disabled={actionLoading} variant="outline">Reorder</ActionBtn>
        {order.deposit?.status === 'paid' && order.status !== 'cancelled' && (
          <ActionBtn onClick={handleRefundDeposit} disabled={actionLoading} variant="danger">Refund Deposit</ActionBtn>
        )}
        {order.allowedTransitions.includes('cancelled') && (
          <ActionBtn onClick={() => handleStatusChange('cancelled')} disabled={actionLoading} variant="danger">Cancel</ActionBtn>
        )}
      </div>

      <div style={{ ...card, marginBottom: 18 }}>
        <span style={sectionLabel}>Service Ticket</span>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 14 }}>
          <div>
            <p style={{ fontSize: 12, color: '#78716C', margin: '0 0 6px' }}>Customer</p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{order.customer.name}</p>
            <p style={{ fontSize: 13, color: '#57534E', margin: '4px 0 0' }}>
              <a href={`mailto:${order.customer.email}`} style={{ color: '#2563EB', textDecoration: 'none' }}>{order.customer.email}</a>
            </p>
            {order.customer.phone ? (
              <p style={{ fontSize: 13, color: '#57534E', margin: '4px 0 0' }}>
                <a href={`tel:${order.customer.phone}`} style={{ color: '#2563EB', textDecoration: 'none' }}>{order.customer.phone}</a>
              </p>
            ) : null}
            {order.customer.company ? <p style={{ fontSize: 13, color: '#78716C', margin: '4px 0 0' }}>{order.customer.company}</p> : null}
          </div>
          <div>
            <p style={{ fontSize: 12, color: '#78716C', margin: '0 0 6px' }}>Event</p>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0 }}>{new Date(order.eventDate).toLocaleString()}</p>
            <p style={{ fontSize: 13, color: '#78716C', margin: '4px 0 0' }}>{order.headCount} guests · {formatServiceType(order.serviceType)}</p>
            <p style={{ fontSize: 13, color: '#78716C', margin: '4px 0 0' }}>Created {new Date(order.timestamps.created).toLocaleString()}</p>
          </div>
          {order.location ? (
            <div>
              <p style={{ fontSize: 12, color: '#78716C', margin: '0 0 6px' }}>Merchant Location</p>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{order.location.name}</p>
              <p style={{ fontSize: 13, color: '#78716C', margin: '4px 0 0' }}>{order.location.address}</p>
              <p style={{ fontSize: 13, color: '#78716C', margin: '4px 0 0' }}>{order.location.city}, {order.location.state} {order.location.zipCode}</p>
              {order.location.phone ? <p style={{ fontSize: 13, color: '#78716C', margin: '4px 0 0' }}>{order.location.phone}</p> : null}
            </div>
          ) : null}
          <div>
            <p style={{ fontSize: 12, color: '#78716C', margin: '0 0 6px' }}>{order.deliveryAddress ? 'Delivery Address' : 'Internal Notes'}</p>
            {order.deliveryAddress ? (
              <>
                <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{order.deliveryAddress.address}</p>
                <p style={{ fontSize: 13, color: '#78716C', margin: '4px 0 0' }}>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
              </>
            ) : (
              <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>{order.notes ?? 'No additional notes provided.'}</p>
            )}
          </div>
        </div>
        {order.notes && order.deliveryAddress ? (
          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid #E7E5E4' }}>
            <p style={{ fontSize: 12, color: '#78716C', margin: '0 0 6px' }}>Internal Notes</p>
            <p style={{ fontSize: 13, color: '#57534E', margin: 0 }}>{order.notes}</p>
          </div>
        ) : null}
      </div>

      {/* Detail grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={card}>
          <span style={sectionLabel}>Customer</span>
          <p style={{ fontWeight: 600, fontSize: 15, margin: '0 0 4px' }}>{order.customer.name}</p>
          <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>{order.customer.email}</p>
          {order.customer.phone && <p style={{ fontSize: 13, color: '#78716C', margin: '2px 0 0' }}>{order.customer.phone}</p>}
          {order.customer.company && <p style={{ fontSize: 13, color: '#78716C', margin: '2px 0 0' }}>{order.customer.company}</p>}
        </div>

        <div style={card}>
          <span style={sectionLabel}>Event</span>
          <p style={{ fontSize: 14, margin: '0 0 4px' }}><strong>{new Date(order.eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</strong></p>
          <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>{order.headCount} guests{order.location ? ` · ${order.location.name}` : ''}</p>
          <p style={{ fontSize: 13, color: '#78716C', margin: '4px 0 0' }}>Service mode: {formatServiceType(order.serviceType)}</p>
          {order.notes && <p style={{ fontSize: 13, color: '#57534E', margin: '8px 0 0', padding: '6px 8px', background: '#FAFAF9', borderRadius: 6 }}>{order.notes}</p>}
        </div>

        {order.deliveryAddress && (
          <div style={card}>
            <span style={sectionLabel}>Delivery Address</span>
            <p style={{ fontSize: 14, margin: 0 }}>{order.deliveryAddress.address}</p>
            <p style={{ fontSize: 13, color: '#78716C', margin: '2px 0 0' }}>{order.deliveryAddress.city}, {order.deliveryAddress.state} {order.deliveryAddress.zipCode}</p>
          </div>
        )}

        <div style={card}>
          <span style={sectionLabel}>Pricing</span>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span style={{ color: '#78716C' }}>Packages</span><span style={{ fontWeight: 500 }}>${(order.pricing.packageSubtotal / 100).toFixed(2)}</span>
          </div>
          {order.pricing.addOnSubtotal > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ color: '#78716C' }}>Add-ons</span><span style={{ fontWeight: 500 }}>${(order.pricing.addOnSubtotal / 100).toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 15, fontWeight: 700, borderTop: '1px solid #E7E5E4', paddingTop: 8, marginTop: 6 }}>
            <span>Total</span><span>${(order.pricing.total / 100).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Payment status */}
      <div style={{ ...card, marginTop: 14 }}>
        <span style={sectionLabel}>Payment</span>
        {!order.depositRequired && !order.deposit ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Dot color="#9CA3AF" /><span style={{ fontSize: 13, color: '#78716C' }}>No deposit required</span>
          </div>
        ) : !order.deposit ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Dot color="#F59E0B" /><span style={{ fontSize: 13, color: '#92400E' }}>Deposit required — not yet sent</span>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Dot color={order.deposit.status === 'paid' ? '#10B981' : order.deposit.status === 'pending' ? '#F59E0B' : '#9CA3AF'} />
              <span style={{ fontSize: 13, fontWeight: 600, color: order.deposit.status === 'paid' ? '#166534' : order.deposit.status === 'pending' ? '#92400E' : '#78716C' }}>
                {order.deposit.status === 'paid' ? 'Deposit paid' : order.deposit.status === 'pending' ? 'Awaiting payment' : 'Expired'}
              </span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1917', marginLeft: 4 }}>${(order.deposit.amount / 100).toFixed(2)}</span>
            </div>
            <div style={{ fontSize: 12, color: '#9CA3AF', paddingLeft: 14, display: 'flex', gap: 12 }}>
              {order.deposit.hasStripeSession && <span>via Stripe</span>}
              {!order.deposit.hasStripeSession && order.deposit.status === 'paid' && <span>Manual</span>}
              {order.deposit.paidAt && <span>{new Date(order.deposit.paidAt).toLocaleString()}</span>}
            </div>
          </div>
        )}
      </div>

      {/* Items table */}
      <div style={{ marginTop: 20 }}>
        <span style={{ ...sectionLabel, marginBottom: 10 }}>Line Items</span>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #E7E5E4' }}>
              <th style={{ padding: '6px 8px 6px 0', textAlign: 'left', fontWeight: 600, color: '#78716C', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Item</th>
              <th style={{ padding: '6px 8px', textAlign: 'center', fontWeight: 600, color: '#78716C', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty</th>
              <th style={{ padding: '6px 8px', textAlign: 'right', fontWeight: 600, color: '#78716C', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Unit</th>
              <th style={{ padding: '6px 0 6px 8px', textAlign: 'right', fontWeight: 600, color: '#78716C', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.packages.map((item, i) => (
              <tr key={`p-${i}`} style={{ borderBottom: '1px solid #F5F5F4' }}>
                <td style={{ padding: '8px 8px 8px 0', fontWeight: 500 }}>{item.name}</td>
                <td style={{ padding: '8px', textAlign: 'center', color: '#78716C' }}>{item.quantity}</td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#78716C' }}>${(item.unitPrice / 100).toFixed(2)}</td>
                <td style={{ padding: '8px 0 8px 8px', textAlign: 'right', fontWeight: 600 }}>${(item.totalPrice / 100).toFixed(2)}</td>
              </tr>
            ))}
            {order.items.addOns.map((item, i) => (
              <tr key={`a-${i}`} style={{ borderBottom: '1px solid #F5F5F4' }}>
                <td style={{ padding: '8px 8px 8px 0' }}>{item.name} <span style={{ color: '#A8A29E', fontSize: 11 }}>add-on</span></td>
                <td style={{ padding: '8px', textAlign: 'center', color: '#78716C' }}>{item.quantity}</td>
                <td style={{ padding: '8px', textAlign: 'right', color: '#78716C' }}>${(item.unitPrice / 100).toFixed(2)}</td>
                <td style={{ padding: '8px 0 8px 8px', textAlign: 'right', fontWeight: 600 }}>${(item.totalPrice / 100).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <span style={{ ...sectionLabel, marginBottom: 12 }}>Activity</span>
          <div style={{ borderLeft: '2px solid #E7E5E4', paddingLeft: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {order.timeline.map((e) => {
              const colors: Record<string, string> = { order_created: '#10B981', status_changed: '#3B82F6', deposit_link_sent: '#F59E0B', deposit_paid: '#10B981', deposit_expired: '#9CA3AF', reorder_created: '#8B5CF6' };
              return (
                <div key={e.id} style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -21, top: 4, width: 8, height: 8, borderRadius: 4, background: colors[e.type] ?? '#9CA3AF' }} />
                  <p style={{ fontSize: 13, margin: 0, color: '#1C1917' }}>{e.description}</p>
                  <p style={{ fontSize: 11, color: '#A8A29E', margin: '1px 0 0' }}>{new Date(e.createdAt).toLocaleString()}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ children, onClick, disabled, variant }: { children: React.ReactNode; onClick: () => void; disabled: boolean; variant: 'dark' | 'blue' | 'green' | 'outline' | 'danger' }) {
  const styles: Record<string, React.CSSProperties> = {
    dark: { background: '#1C1917', color: '#FFF', border: 'none' },
    blue: { background: '#3B82F6', color: '#FFF', border: 'none' },
    green: { background: '#10B981', color: '#FFF', border: 'none' },
    outline: { background: '#FFF', color: '#57534E', border: '1px solid #D6D3D1' },
    danger: { background: '#FFF', color: '#DC2626', border: '1px solid #DC2626' },
  };
  return (
    <button onClick={onClick} disabled={disabled} style={{
      padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600,
      cursor: disabled ? 'wait' : 'pointer', opacity: disabled ? 0.6 : 1,
      transition: 'opacity 0.15s', ...styles[variant],
    }}>{children}</button>
  );
}

function Dot({ color }: { color: string }) {
  return <span style={{ width: 8, height: 8, borderRadius: 4, background: color, display: 'inline-block', flexShrink: 0 }} />;
}
