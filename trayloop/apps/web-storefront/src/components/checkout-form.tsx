'use client';

import { useState, useCallback } from 'react';
import type { StorefrontData, StorefrontLocation, StorefrontPackage, StorefrontAddOn, OrderSubmission, OrderConfirmation } from '../lib/api';
import { submitOrder, OrderError } from '../lib/api';

interface Props {
  data: StorefrontData;
}

export default function CheckoutForm({ data }: Props) {
  const { locations, menu } = data;

  // All packages and add-ons flattened
  const allPackages = menu.flatMap((m) => [
    ...m.categories.flatMap((c) => c.packages),
    ...m.uncategorizedPackages,
  ]);
  const allAddOns = menu.flatMap((m) => m.addOns);

  // Form state
  const [selectedLocationSlug, setSelectedLocationSlug] = useState('');
  const [serviceType, setServiceType] = useState<'delivery' | 'pickup'>('delivery');
  const [eventDate, setEventDate] = useState('');
  const [headcount, setHeadcount] = useState(10);
  const [selectedPkgs, setSelectedPkgs] = useState<Record<string, number>>({});
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<Record<string, number>>({});
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);

  const selectedLocation = locations.find((l) => l.slug === selectedLocationSlug) ?? null;

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

    const payload: OrderSubmission = {
      locationId: selectedLocationSlug,
      serviceType,
      eventDate: new Date(eventDate).toISOString(),
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
    };

    if (serviceType === 'delivery') {
      payload.deliveryAddress = { address, city, state, zipCode };
    }

    const idempotencyKey = `order-${email}-${eventDate}-${Date.now()}`;

    try {
      const result = await submitOrder(payload, idempotencyKey);
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
  }, [submitting, selectedLocationSlug, serviceType, eventDate, headcount, selectedPkgs, selectedAddOnIds, firstName, lastName, email, phone, companyName, address, city, state, zipCode, notes]);

  // --- Confirmation state ---
  if (confirmation) {
    return (
      <div style={{ border: '2px solid #10b981', borderRadius: '0.75rem', padding: '2rem', marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginBottom: '0.25rem' }}>Order Submitted!</h2>
        <p style={{ fontSize: '1.1rem', fontWeight: 600, fontFamily: 'monospace', color: '#374151', marginBottom: '1rem' }}>{confirmation.orderNumber}</p>
        <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          <p><strong>Status:</strong> {confirmation.status}</p>
          <p><strong>Event Date:</strong> {new Date(confirmation.scheduledAt).toLocaleDateString()}</p>
          <p><strong>Guests:</strong> {confirmation.headCount}</p>
          <p><strong>Customer:</strong> {confirmation.customer.firstName} {confirmation.customer.lastName} ({confirmation.customer.email})</p>
          {confirmation.depositRequired !== undefined && (
            <p><strong>Deposit Required:</strong> {confirmation.depositRequired ? 'Yes — you will receive a payment link' : 'No'}</p>
          )}
        </div>
        <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Items</h3>
        {confirmation.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', fontSize: '0.875rem' }}>
            <span>{item.name} x{item.quantity}</span>
            <span>${(item.totalPrice / 100).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ borderTop: '2px solid #e5e7eb', marginTop: '0.75rem', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
          <span>Total</span>
          <span>${(confirmation.pricing.total / 100).toFixed(2)}</span>
        </div>
      </div>
    );
  }

  // --- Order form ---
  const hasPackages = Object.keys(selectedPkgs).length > 0;

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem', borderTop: '2px solid #111827', paddingTop: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>Place an Order</h2>

      {error && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ color: '#dc2626', fontWeight: 500 }}>{error}</p>
          {fieldErrors.length > 0 && (
            <ul style={{ margin: '0.5rem 0 0', paddingLeft: '1.25rem', color: '#dc2626', fontSize: '0.85rem' }}>
              {fieldErrors.map((fe, i) => <li key={i}>{fe.field}: {fe.message}</li>)}
            </ul>
          )}
        </div>
      )}

      {/* Location */}
      <fieldset style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>
        <legend style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Select Location *</legend>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {locations.map((loc) => (
            <label key={loc.slug} style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
              border: selectedLocationSlug === loc.slug ? '2px solid #111827' : '1px solid #d1d5db',
              borderRadius: '0.5rem', cursor: 'pointer',
            }}>
              <input type="radio" name="location" value={loc.slug} checked={selectedLocationSlug === loc.slug}
                onChange={(e) => setSelectedLocationSlug(e.target.value)} />
              <div>
                <span style={{ fontWeight: 500 }}>{loc.name}</span>
                <span style={{ color: '#6b7280', fontSize: '0.8rem', marginLeft: '0.5rem' }}>{loc.city}, {loc.state}</span>
              </div>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Service type */}
      {selectedLocation && (
        <fieldset style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>
          <legend style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Service Type *</legend>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {selectedLocation.deliveryEnabled && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="radio" name="serviceType" value="delivery" checked={serviceType === 'delivery'} onChange={() => setServiceType('delivery')} />
                Delivery
              </label>
            )}
            {selectedLocation.pickupEnabled && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input type="radio" name="serviceType" value="pickup" checked={serviceType === 'pickup'} onChange={() => setServiceType('pickup')} />
                Pickup
              </label>
            )}
          </div>
        </fieldset>
      )}

      {/* Event details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <label style={{ display: 'block', fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Event Date *</label>
          <input type="datetime-local" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontWeight: 500, fontSize: '0.875rem', marginBottom: '0.25rem' }}>Headcount *</label>
          <input type="number" min="1" value={headcount} onChange={(e) => setHeadcount(parseInt(e.target.value) || 1)} required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
        </div>
      </div>

      {/* Package selection */}
      <fieldset style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>
        <legend style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Select Packages *</legend>
        <div style={{ display: 'grid', gap: '0.5rem' }}>
          {allPackages.map((pkg) => (
            <label key={pkg.id} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem',
              border: selectedPkgs[pkg.id] ? '2px solid #111827' : '1px solid #d1d5db',
              borderRadius: '0.5rem', cursor: 'pointer',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input type="checkbox" checked={!!selectedPkgs[pkg.id]} onChange={() => togglePkg(pkg.id)} />
                <div>
                  <span style={{ fontWeight: 500 }}>{pkg.name}</span>
                  {pkg.description && <p style={{ fontSize: '0.8rem', color: '#6b7280', margin: '0.15rem 0 0' }}>{pkg.description}</p>}
                </div>
              </div>
              <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>${(pkg.pricePerHead / 100).toFixed(2)}/person</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Add-ons */}
      {allAddOns.length > 0 && (
        <fieldset style={{ border: 'none', padding: 0, marginBottom: '1.5rem' }}>
          <legend style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Add-Ons</legend>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {allAddOns.map((addOn) => (
              <label key={addOn.id} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.75rem',
                border: selectedAddOnIds[addOn.id] ? '2px solid #111827' : '1px solid #d1d5db',
                borderRadius: '0.5rem', cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input type="checkbox" checked={!!selectedAddOnIds[addOn.id]} onChange={() => toggleAddOn(addOn.id)} />
                  <span style={{ fontWeight: 500 }}>{addOn.name}</span>
                </div>
                <span style={{ fontWeight: 700 }}>${(addOn.price / 100).toFixed(2)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {/* Customer info */}
      <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Your Information</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>First Name *</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Last Name *</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Email *</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Phone</label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
        </div>
      </div>
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Company Name</label>
        <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
      </div>

      {/* Delivery address */}
      {serviceType === 'delivery' && (
        <>
          <h3 style={{ fontWeight: 600, marginBottom: '0.75rem' }}>Delivery Address</h3>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Street Address *</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} required
              style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>City *</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>State *</label>
              <input value={state} onChange={(e) => setState(e.target.value)} required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Zip *</label>
              <input value={zipCode} onChange={(e) => setZipCode(e.target.value)} required
                style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
            </div>
          </div>
        </>
      )}

      {/* Notes */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.25rem' }}>Order Notes</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
          style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '0.375rem', boxSizing: 'border-box', resize: 'vertical' }} />
      </div>

      {/* Estimate + Submit */}
      {hasPackages && estimatedTotal > 0 && (
        <div style={{ background: '#f9fafb', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Estimated Total</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700 }}>${(estimatedTotal / 100).toFixed(2)}</span>
        </div>
      )}

      {selectedLocation?.depositRequired && (
        <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
          This location requires a deposit. You will receive a payment link after your order is reviewed.
        </p>
      )}

      <button type="submit" disabled={submitting || !selectedLocationSlug || !hasPackages}
        style={{
          width: '100%', padding: '0.85rem', fontSize: '1.1rem', fontWeight: 700,
          background: submitting || !selectedLocationSlug || !hasPackages ? '#9ca3af' : '#111827',
          color: 'white', border: 'none', borderRadius: '0.5rem',
          cursor: submitting || !selectedLocationSlug || !hasPackages ? 'not-allowed' : 'pointer',
        }}>
        {submitting ? 'Submitting Order...' : 'Submit Order'}
      </button>
    </form>
  );
}
