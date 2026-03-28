'use client';

import { useState, useCallback } from 'react';
import type { StorefrontData, OrderSubmission, OrderConfirmation } from '../lib/api';
import { submitOrder, OrderError } from '../lib/api';

interface Props {
  data: StorefrontData;
}

/* ── Design tokens ── */
const T = {
  pageBg: '#FAF9F7',
  cardBg: '#FFFFFF',
  cardBorder: '#E7E5E4',
  selectedBorder: '#1C1917',
  selectedBg: '#FAFAF9',
  gold: '#D4A853',
  textPrimary: '#1C1917',
  textMuted: '#78716C',
  textPlaceholder: '#A8A29E',
  borderInput: '#D6D3D1',
  toggleSelectedBg: '#FEF3C7',
  toggleSelectedBorder: '#D4A853',
  errorBg: '#FEF2F2',
  errorBorder: '#FECACA',
  errorText: '#DC2626',
  successBorder: '#10B981',
} as const;

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '1.5px',
  color: T.textMuted,
  marginBottom: 6,
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 44,
  padding: '0 14px',
  border: `1px solid ${T.borderInput}`,
  borderRadius: 8,
  fontSize: 14,
  color: T.textPrimary,
  background: T.cardBg,
  boxSizing: 'border-box',
  outline: 'none',
};

const cardStyle: React.CSSProperties = {
  background: T.cardBg,
  border: `1px solid ${T.cardBorder}`,
  borderRadius: 12,
  padding: 32,
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 700,
  color: T.textPrimary,
  margin: 0,
};

const sectionSubtitleStyle: React.CSSProperties = {
  fontSize: 14,
  color: T.textMuted,
  margin: '4px 0 0',
};

export default function CheckoutForm({ data }: Props) {
  const { locations, menu } = data;

  // All packages and add-ons flattened
  const allPackages = menu.flatMap((m) => [
    ...m.categories.flatMap((c) => c.packages),
    ...m.uncategorizedPackages,
  ]);
  const allAddOns = menu.flatMap((m) => m.addOns);

  // Form state
  const [selectedLocationSlug, setSelectedLocationSlug] = useState(locations.length === 1 ? locations[0].slug : '');
  const [serviceType, setServiceType] = useState<'delivery' | 'pickup'>('delivery');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [headcount, setHeadcount] = useState(10);
  const [selectedPkgs, setSelectedPkgs] = useState<Record<string, number>>({});
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<Record<string, number>>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly');
  const [recurringDays, setRecurringDays] = useState<Set<string>>(new Set());
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);

  const selectedLocation = locations.find((l) => l.slug === selectedLocationSlug) ?? locations[0] ?? null;

  const togglePkg = (id: string) => {
    setSelectedPkgs((prev) => {
      const next = { ...prev };
      if (next[id]) { delete next[id]; } else { next[id] = 1; }
      return next;
    });
  };

  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) => {
      const next = { ...prev };
      if (next[id]) { delete next[id]; } else { next[id] = 1; }
      return next;
    });
  };

  // Estimate (client-side for display only — server recalculates)
  const estimatedTotal = Object.entries(selectedPkgs).reduce((sum, [id, qty]) => {
    const pkg = allPackages.find((p) => p.id === id);
    return sum + (pkg ? pkg.pricePerHead * headcount * qty : 0);
  }, 0) + Object.entries(selectedAddOnIds).reduce((sum, [id, qty]) => {
    const addOn = allAddOns.find((a) => a.id === id);
    return sum + (addOn ? addOn.price * qty : 0);
  }, 0);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError('');
    setFieldErrors([]);
    setSubmitting(true);

    const pkgSelections = Object.entries(selectedPkgs).map(([packageId, quantity]) => ({ packageId, quantity }));
    const addOnSelections = Object.entries(selectedAddOnIds).map(([addOnId, quantity]) => ({ addOnId, quantity }));

    // Combine date + time into a single datetime string for the API
    const combinedDateTime = eventTime ? `${eventDate}T${eventTime}` : eventDate;

    const payload: OrderSubmission = {
      locationId: selectedLocationSlug || (locations[0]?.slug ?? ''),
      serviceType,
      eventDate: new Date(combinedDateTime).toISOString(),
      headcount,
      packages: pkgSelections,
      addOns: addOnSelections.length > 0 ? addOnSelections : undefined,
      customer: {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        companyName: companyName || undefined,
      },
      notes: notes || undefined,
      recurring: recurringEnabled ? {
        interval: recurringInterval,
        preferredDay: recurringDays.size > 0 ? [...recurringDays][0] : undefined,
      } : undefined,
    };

    if (serviceType === 'delivery') {
      payload.deliveryAddress = { address, city, state, zipCode };
    }

    try {
      const result = await submitOrder(data.merchant.slug, payload);
      setConfirmation(result);
    } catch (err) {
      if (err instanceof OrderError) {
        setError(err.message);
        if (err.details) setFieldErrors(err.details);
      } else {
        setError(err instanceof Error ? err.message : 'Order submission failed');
      }
    } finally {
      setSubmitting(false);
    }
  }, [submitting, selectedLocationSlug, serviceType, eventDate, eventTime, headcount, selectedPkgs, selectedAddOnIds, firstName, lastName, email, phone, companyName, address, city, state, zipCode, notes, recurringEnabled, recurringInterval, recurringDays, locations, data.merchant.slug]);

  /* ── Confirmation state ── */
  if (confirmation) {
    return (
      <div style={{
        maxWidth: 620,
        margin: '0 auto',
        background: T.cardBg,
        border: `2px solid ${T.successBorder}`,
        borderRadius: 12,
        padding: 40,
      }}>
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.successBorder, margin: '0 0 4px' }}>Order Submitted!</h2>
          <p style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: T.textPrimary, margin: 0 }}>{confirmation.orderNumber}</p>
        </div>
        <div style={{ display: 'grid', gap: 8, fontSize: 14, color: T.textPrimary, marginBottom: 24 }}>
          <p style={{ margin: 0 }}><strong>Status:</strong> {confirmation.status}</p>
          <p style={{ margin: 0 }}><strong>Event Date:</strong> {new Date(confirmation.scheduledAt).toLocaleDateString()}</p>
          <p style={{ margin: 0 }}><strong>Guests:</strong> {confirmation.headCount}</p>
          <p style={{ margin: 0 }}><strong>Customer:</strong> {confirmation.customer.firstName} {confirmation.customer.lastName} ({confirmation.customer.email})</p>
          {confirmation.depositRequired !== undefined && (
            <p style={{ margin: 0 }}><strong>Deposit Required:</strong> {confirmation.depositRequired ? 'Yes — you will receive a payment link' : 'No'}</p>
          )}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: '0 0 12px' }}>Items</h3>
        {confirmation.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 14, borderBottom: `1px solid ${T.cardBorder}` }}>
            <span>{item.name} x{item.quantity}</span>
            <span style={{ fontWeight: 600 }}>${(item.totalPrice / 100).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: `2px solid ${T.cardBorder}`, fontWeight: 700, fontSize: 18 }}>
          <span>Total</span>
          <span>${(confirmation.pricing.total / 100).toFixed(2)}</span>
        </div>
      </div>
    );
  }

  /* ── Helpers ── */
  const hasPackages = Object.keys(selectedPkgs).length > 0;
  const canSubmit = !submitting && hasPackages && eventDate;
  const minOrder = selectedLocation?.minimumOrderAmount ? (selectedLocation.minimumOrderAmount / 100).toFixed(0) : null;
  const leadTime = selectedLocation?.leadTimeHours ?? null;

  const selectedPkgList = allPackages.filter((p) => selectedPkgs[p.id]);
  const selectedAddOnList = allAddOns.filter((a) => selectedAddOnIds[a.id]);

  /* ── Render ── */
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      {/* ── LEFT COLUMN: Form sections ── */}
      <div style={{ flex: '0 0 620px', display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* Error banner */}
        {error && (
          <div style={{ background: T.errorBg, border: `1px solid ${T.errorBorder}`, borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ color: T.errorText, fontWeight: 600, fontSize: 14, margin: 0 }}>{error}</p>
            {fieldErrors.length > 0 && (
              <ul style={{ margin: '8px 0 0', paddingLeft: 20, color: T.errorText, fontSize: 13 }}>
                {fieldErrors.map((fe, i) => <li key={i}>{fe.field}: {fe.message}</li>)}
              </ul>
            )}
          </div>
        )}

        {/* ── Section: When & How ── */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>When &amp; How</h2>
          {leadTime && (
            <p style={sectionSubtitleStyle}>Please order at least {leadTime} hours in advance</p>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
            <div>
              <label style={labelStyle}>Event Date</label>
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Arrival Time</label>
              <input
                type="time"
                value={eventTime}
                onChange={(e) => setEventTime(e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Service Type Toggle */}
          <div style={{ marginTop: 24 }}>
            <label style={labelStyle}>Service Type</label>
            <div style={{ display: 'flex', gap: 12 }}>
              {selectedLocation?.deliveryEnabled !== false && (
                <button
                  type="button"
                  onClick={() => setServiceType('delivery')}
                  style={{
                    flex: 1,
                    height: 44,
                    border: serviceType === 'delivery' ? `2px solid ${T.toggleSelectedBorder}` : `1px solid ${T.borderInput}`,
                    borderRadius: 8,
                    background: serviceType === 'delivery' ? T.toggleSelectedBg : T.cardBg,
                    color: serviceType === 'delivery' ? T.gold : T.textPrimary,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Delivery
                </button>
              )}
              {selectedLocation?.pickupEnabled !== false && (
                <button
                  type="button"
                  onClick={() => setServiceType('pickup')}
                  style={{
                    flex: 1,
                    height: 44,
                    border: serviceType === 'pickup' ? `2px solid ${T.toggleSelectedBorder}` : `1px solid ${T.borderInput}`,
                    borderRadius: 8,
                    background: serviceType === 'pickup' ? T.toggleSelectedBg : T.cardBg,
                    color: serviceType === 'pickup' ? T.gold : T.textPrimary,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Pickup
                </button>
              )}
            </div>
          </div>

          {/* Delivery Address */}
          {serviceType === 'delivery' && (
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>Delivery Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
                required
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <input
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City"
                  required
                  style={inputStyle}
                />
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="State"
                  required
                  style={inputStyle}
                />
                <input
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Zip"
                  required
                  style={inputStyle}
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Section: Choose a Package ── */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Choose a Package</h2>
          <p style={sectionSubtitleStyle}>
            {minOrder ? `Min. $${minOrder} order · ` : ''}Select one or more · Price adjusts with headcount
          </p>

          {/* Headcount */}
          <div style={{ marginTop: 24, marginBottom: 24 }}>
            <label style={labelStyle}>Headcount</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginTop: 8 }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 700, color: T.textPrimary, lineHeight: 1 }}>{headcount}</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>guests</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setHeadcount(Math.max(1, headcount - 1))}
                  style={{
                    width: 40, height: 40,
                    border: `1px solid ${T.borderInput}`,
                    borderRadius: 8,
                    background: T.cardBg,
                    fontSize: 20,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: T.textPrimary,
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={headcount}
                  onChange={(e) => setHeadcount(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    ...inputStyle,
                    width: 72,
                    textAlign: 'center',
                    fontWeight: 600,
                  }}
                />
                <button
                  type="button"
                  onClick={() => setHeadcount(headcount + 1)}
                  style={{
                    width: 40, height: 40,
                    border: `1px solid ${T.borderInput}`,
                    borderRadius: 8,
                    background: T.cardBg,
                    fontSize: 20,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: T.textPrimary,
                  }}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Package cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allPackages.map((pkg) => {
              const isSelected = !!selectedPkgs[pkg.id];
              return (
                <div
                  key={pkg.id}
                  onClick={() => togglePkg(pkg.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '16px 18px',
                    border: isSelected ? `2px solid ${T.selectedBorder}` : `1px solid ${T.cardBorder}`,
                    borderRadius: 10,
                    background: isSelected ? T.selectedBg : T.cardBg,
                    cursor: 'pointer',
                    transition: 'border-color 0.15s, background 0.15s',
                  }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                    border: isSelected ? `2px solid ${T.selectedBorder}` : `2px solid ${T.borderInput}`,
                    background: isSelected ? T.selectedBorder : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {isSelected && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary }}>{pkg.name}</div>
                    {pkg.description && (
                      <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>{pkg.description}</div>
                    )}
                  </div>
                  {/* Price */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: 20, fontWeight: 700, color: T.gold }}>${(pkg.pricePerHead / 100).toFixed(2)}</span>
                    <span style={{ fontSize: 13, color: T.textMuted }}>/person</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section: Add-Ons ── */}
        {allAddOns.length > 0 && (
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Add-Ons</h2>
            <p style={sectionSubtitleStyle}>Enhance your order with extras</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 20 }}>
              {allAddOns.map((addOn) => {
                const isSelected = !!selectedAddOnIds[addOn.id];
                return (
                  <div
                    key={addOn.id}
                    onClick={() => toggleAddOn(addOn.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 18px',
                      border: isSelected ? `2px solid ${T.selectedBorder}` : `1px solid ${T.cardBorder}`,
                      borderRadius: 10,
                      background: isSelected ? T.selectedBg : T.cardBg,
                      cursor: 'pointer',
                      transition: 'border-color 0.15s, background 0.15s',
                    }}
                  >
                    <div style={{
                      width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                      border: isSelected ? `2px solid ${T.selectedBorder}` : `2px solid ${T.borderInput}`,
                      background: isSelected ? T.selectedBorder : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary }}>{addOn.name}</div>
                      {addOn.description && (
                        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>{addOn.description}</div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <span style={{ fontSize: 16, fontWeight: 700, color: T.gold }}>${(addOn.price / 100).toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Section: Recurring ── */}
        <div style={{
          ...cardStyle,
          padding: 0,
          overflow: 'hidden',
        }}>
          {/* Toggle row */}
          <div
            style={{
              padding: '16px 24px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              background: recurringEnabled ? '#FFFBEB' : T.cardBg,
              borderBottom: recurringEnabled ? `1px solid ${T.cardBorder}` : 'none',
            }}
            onClick={() => setRecurringEnabled(!recurringEnabled)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 20, height: 20, borderRadius: 4,
                border: `2px solid ${recurringEnabled ? T.selectedBorder : T.borderInput}`,
                background: recurringEnabled ? T.selectedBorder : T.cardBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {recurringEnabled && <span style={{ color: '#fff', fontSize: 12, lineHeight: 1 }}>✓</span>}
              </div>
              <div>
                <span style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary }}>Make this recurring</span>
                <p style={{ fontSize: 13, color: T.textMuted, margin: '2px 0 0' }}>Weekly/monthly repeat orders</p>
              </div>
            </div>
            {/* Toggle switch */}
            <div style={{
              width: 44, height: 24, borderRadius: 12,
              background: recurringEnabled ? T.gold : T.borderInput,
              position: 'relative',
              transition: 'background 0.2s',
              flexShrink: 0,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 10,
                background: '#FFFFFF',
                position: 'absolute',
                top: 2,
                left: recurringEnabled ? 22 : 2,
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }} />
            </div>
          </div>

          {/* Expanded recurring options */}
          {recurringEnabled && (
            <div style={{ padding: '20px 24px' }}>
              {/* Day tiles */}
              {eventDate && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                    {(() => {
                      const startDate = new Date(eventDate);
                      if (isNaN(startDate.getTime())) return null;
                      const days = [];
                      for (let i = 0; i < 14; i++) {
                        const d = new Date(startDate);
                        d.setDate(d.getDate() + i);
                        const dayKey = d.toISOString().split('T')[0];
                        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
                        const dayNum = d.getDate();
                        const monthName = d.toLocaleDateString('en-US', { month: 'short' });
                        const isSelected = recurringDays.has(dayKey);
                        days.push(
                          <div
                            key={dayKey}
                            onClick={() => {
                              setRecurringDays(prev => {
                                const next = new Set(prev);
                                if (next.has(dayKey)) next.delete(dayKey); else next.add(dayKey);
                                return next;
                              });
                            }}
                            style={{
                              width: 56, minWidth: 56, height: 68,
                              borderRadius: 10,
                              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer',
                              background: isSelected ? T.gold : '#F5F5F4',
                              color: isSelected ? '#FFFFFF' : '#57534E',
                              transition: 'background 0.15s',
                            }}
                          >
                            <span style={{ fontSize: 11, fontWeight: 600 }}>{dayName}</span>
                            <span style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.2 }}>{dayNum}</span>
                            <span style={{ fontSize: 11 }}>{monthName}</span>
                          </div>
                        );
                      }
                      return days;
                    })()}
                  </div>
                </div>
              )}

              {/* Frequency pills */}
              <div style={{ display: 'flex', gap: 8 }}>
                {(['weekly', 'biweekly', 'monthly'] as const).map((freq) => {
                  const isActive = recurringInterval === freq;
                  const labels: Record<string, string> = { weekly: 'Weekly', biweekly: 'Bi-weekly', monthly: 'Monthly' };
                  return (
                    <button
                      key={freq}
                      type="button"
                      onClick={() => setRecurringInterval(freq)}
                      style={{
                        height: 36, padding: '0 16px',
                        borderRadius: 18,
                        border: isActive ? 'none' : `1px solid ${T.borderInput}`,
                        background: isActive ? T.selectedBorder : T.cardBg,
                        color: isActive ? '#FFFFFF' : '#57534E',
                        fontSize: 13, fontWeight: isActive ? 600 : 400,
                        cursor: 'pointer',
                      }}
                    >
                      {labels[freq]}
                    </button>
                  );
                })}
              </div>

              {!eventDate && (
                <p style={{ fontSize: 13, color: T.textMuted, margin: 0 }}>
                  Select an event date above to see recurring day options
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── Section: Your Details ── */}
        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>Your Details</h2>
          <p style={sectionSubtitleStyle}>We'll send confirmation + payment link here</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 24 }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First"
                  required
                  style={inputStyle}
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last"
                  required
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Company</label>
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Company name"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
            <div>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={inputStyle}
              />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(555) 000-0000"
                style={inputStyle}
              />
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <label style={labelStyle}>Special Instructions</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Allergies, setup requests, dietary needs..."
              style={{
                ...inputStyle,
                height: 'auto',
                padding: '12px 14px',
                resize: 'vertical',
              }}
            />
          </div>
        </div>
      </div>

      {/* ── RIGHT COLUMN: Summary Panel ── */}
      <div style={{ flex: '0 0 320px', position: 'sticky', top: 24 }}>
        <div style={cardStyle}>
          {/* Header */}
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: T.gold,
            marginBottom: 4,
          }}>
            Catering Order
          </div>
          <div style={{ fontSize: 20, fontWeight: 700, color: T.textPrimary, marginBottom: 24 }}>
            {data.merchant.name}
          </div>

          {/* Empty state */}
          {!hasPackages ? (
            <div style={{
              textAlign: 'center',
              padding: '32px 16px',
              color: T.textMuted,
              fontSize: 14,
              lineHeight: 1.5,
            }}>
              Select a package and date to see your summary
            </div>
          ) : (
            <>
              {/* Line items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {selectedPkgList.map((pkg) => (
                  <div key={pkg.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <div>
                      <div style={{ color: T.textPrimary, fontWeight: 500 }}>{pkg.name}</div>
                      <div style={{ color: T.textMuted, fontSize: 12 }}>{headcount} guests x ${(pkg.pricePerHead / 100).toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 600, color: T.textPrimary, whiteSpace: 'nowrap' }}>
                      ${((pkg.pricePerHead * headcount) / 100).toFixed(2)}
                    </div>
                  </div>
                ))}
                {selectedAddOnList.map((addOn) => (
                  <div key={addOn.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                    <div style={{ color: T.textPrimary, fontWeight: 500 }}>{addOn.name}</div>
                    <div style={{ fontWeight: 600, color: T.textPrimary }}>${(addOn.price / 100).toFixed(2)}</div>
                  </div>
                ))}
              </div>

              {/* Separator */}
              <div style={{ borderTop: `1px solid ${T.cardBorder}`, margin: '20px 0' }} />

              {/* Subtotals */}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                <span style={{ color: T.textMuted }}>Package subtotal</span>
                <span style={{ color: T.textPrimary, fontWeight: 500 }}>
                  ${(Object.entries(selectedPkgs).reduce((sum, [id, qty]) => {
                    const pkg = allPackages.find((p) => p.id === id);
                    return sum + (pkg ? pkg.pricePerHead * headcount * qty : 0);
                  }, 0) / 100).toFixed(2)}
                </span>
              </div>
              {selectedAddOnList.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6 }}>
                  <span style={{ color: T.textMuted }}>Add-ons</span>
                  <span style={{ color: T.textPrimary, fontWeight: 500 }}>
                    ${(Object.entries(selectedAddOnIds).reduce((sum, [id, qty]) => {
                      const addOn = allAddOns.find((a) => a.id === id);
                      return sum + (addOn ? addOn.price * qty : 0);
                    }, 0) / 100).toFixed(2)}
                  </span>
                </div>
              )}

              {/* Total */}
              <div style={{ borderTop: `1px solid ${T.cardBorder}`, margin: '12px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary }}>Total</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary }}>${(estimatedTotal / 100).toFixed(2)}</span>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={!canSubmit}
                style={{
                  width: '100%',
                  height: 52,
                  marginTop: 24,
                  border: 'none',
                  borderRadius: 10,
                  background: canSubmit ? T.selectedBorder : T.textPlaceholder,
                  color: '#FFFFFF',
                  fontSize: 16,
                  fontWeight: 600,
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'background 0.15s',
                }}
              >
                {submitting ? 'Placing order...' : 'Place Order'}
              </button>

              {/* Deposit notice */}
              {selectedLocation?.depositRequired && (
                <p style={{ fontSize: 12, color: T.textMuted, textAlign: 'center', marginTop: 12, marginBottom: 0 }}>
                  A deposit is required. You will receive a payment link after your order is reviewed.
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </form>
  );
}
