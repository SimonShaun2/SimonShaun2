'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { StorefrontData, OrderSubmission, OrderConfirmation } from '../lib/api';
import { fetchCustomerAccount, submitOrder, OrderError } from '../lib/api';
import { useMobile } from '../lib/use-mobile';

interface Props {
  data: StorefrontData;
  initialLocationSlug?: string | null;
}

type StorefrontServiceMode = OrderSubmission['serviceType'];

const SERVICE_MODE_LABELS: Record<StorefrontServiceMode, string> = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  full_service: 'Full Service',
  on_site: 'On-Site',
  food_truck: 'Food Truck',
};

function formatLocationSummary(location: StorefrontData['locations'][number]) {
  return `${location.city}, ${location.state}`;
}

function formatLocationAddress(location: StorefrontData['locations'][number]) {
  return [location.address, `${location.city}, ${location.state} ${location.zipCode}`]
    .filter(Boolean)
    .join(' • ');
}

function formatServiceModeList(modes: string[]) {
  return modes.map((mode) => SERVICE_MODE_LABELS[mode as StorefrontServiceMode] ?? mode).join(' • ');
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
  letterSpacing: '1.2px',
  color: T.textMuted,
  marginBottom: 5,
  display: 'block',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 42,
  padding: '0 12px',
  border: `1px solid ${T.borderInput}`,
  borderRadius: 8,
  fontSize: 14,
  color: T.textPrimary,
  background: T.cardBg,
  boxSizing: 'border-box',
  outline: 'none',
  transition: 'border-color 0.15s',
};

const cardStyle: React.CSSProperties = {
  background: T.cardBg,
  border: `1px solid ${T.cardBorder}`,
  borderRadius: 12,
  padding: '28px 28px',
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 700,
  color: T.textPrimary,
  margin: 0,
  lineHeight: 1.3,
};

const sectionSubtitleStyle: React.CSSProperties = {
  fontSize: 13,
  color: T.textMuted,
  margin: '3px 0 0',
  lineHeight: 1.5,
};

const locationMetaChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '6px 10px',
  borderRadius: 999,
  background: '#FFFFFF',
  border: `1px solid ${T.cardBorder}`,
  fontSize: 12,
  color: T.textMuted,
};

export default function CheckoutForm({ data, initialLocationSlug }: Props) {
  const isMobile = useMobile();
  const { locations, menu } = data;
  const router = useRouter();
  const pathname = usePathname();

  // All packages and add-ons flattened
  const allPackages = menu.flatMap((m) => [
    ...m.categories.flatMap((c) => c.packages),
    ...m.uncategorizedPackages,
  ]);
  const allAddOns = menu.flatMap((m) => m.addOns);

  // Form state
  const [selectedLocationSlug, setSelectedLocationSlug] = useState(initialLocationSlug ?? locations[0]?.slug ?? '');
  const [serviceType, setServiceType] = useState<StorefrontServiceMode>('delivery');
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
  const [customerSignedIn, setCustomerSignedIn] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Array<{ field: string; message: string }>>([]);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);
  const [confirmationMode, setConfirmationMode] = useState<'order_received' | 'deposit_pending' | null>(null);
  const searchParams = useSearchParams();

  const selectedLocation = locations.find((l) => l.slug === selectedLocationSlug) ?? locations[0] ?? null;
  const availableServiceModes = (() => {
    if (!selectedLocation) return ['delivery'] as StorefrontServiceMode[];
    const next = new Set<StorefrontServiceMode>();

    if (selectedLocation.deliveryEnabled !== false) next.add('delivery');
    if (selectedLocation.pickupEnabled !== false) next.add('pickup');

    for (const mode of selectedLocation.serviceTypes) {
      if (mode in SERVICE_MODE_LABELS) {
        next.add(mode as StorefrontServiceMode);
      }
    }

    return next.size > 0 ? Array.from(next) : (['delivery'] as StorefrontServiceMode[]);
  })();

  useEffect(() => {
    if (!locations.length) {
      return;
    }

    if (initialLocationSlug && locations.some((location) => location.slug === initialLocationSlug)) {
      setSelectedLocationSlug(initialLocationSlug);
      return;
    }

    setSelectedLocationSlug((current) => current || locations[0]?.slug || '');
  }, [initialLocationSlug, locations]);

  useEffect(() => {
    if (!selectedLocation) return;
    if (!availableServiceModes.includes(serviceType)) {
      setServiceType(availableServiceModes[0]);
    }
  }, [availableServiceModes, selectedLocation, serviceType]);

  useEffect(() => {
    if (!selectedLocationSlug || !pathname) {
      return;
    }

    if (searchParams.get('location') === selectedLocationSlug) {
      return;
    }

    const params = new URLSearchParams(searchParams.toString());
    params.set('location', selectedLocationSlug);
    const nextUrl = `${pathname}?${params.toString()}`;
    router.replace(nextUrl, { scroll: false });
  }, [pathname, router, searchParams, selectedLocationSlug]);

  useEffect(() => {
    let cancelled = false;

    async function hydrateCustomer() {
      try {
        const account = await fetchCustomerAccount();
        if (cancelled) return;

        setCustomerSignedIn(true);
        setFirstName((current) => current || account.profile.firstName || '');
        setLastName((current) => current || account.profile.lastName || '');
        setEmail((current) => current || account.profile.email || '');
        setPhone((current) => current || account.profile.phone || '');
        setCompanyName((current) => current || account.profile.companyName || '');
      } catch {
        if (!cancelled) {
          setCustomerSignedIn(false);
        }
      }
    }

    void hydrateCustomer();
    return () => {
      cancelled = true;
    };
  }, []);

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
      if (result.mode === 'deposit_checkout' && result.checkout?.url) {
        window.location.assign(result.checkout.url);
        return;
      }

      setConfirmationMode(result.mode === 'deposit_pending' ? 'deposit_pending' : 'order_received');
      setConfirmation(result.order);
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
  const checkoutState = searchParams.get('checkout');
  const returnedOrderNumber = searchParams.get('orderNumber');
  const confirmationTitle = confirmationMode === 'deposit_pending' ? 'Thank you for your order!' : 'Order received!';
  const confirmationSteps = confirmationMode === 'deposit_pending'
    ? [
        "We'll review your order",
        "You'll receive a confirmation email",
        "If a deposit is required, you'll receive a payment link",
      ]
    : [
        "We'll review your order",
        "You'll receive a confirmation email",
        'No deposit is due right now',
      ];

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
          <h2 style={{ fontSize: 24, fontWeight: 700, color: T.successBorder, margin: '0 0 4px' }}>&#10003; {confirmationTitle}</h2>
          <p style={{ fontSize: 14, color: T.textMuted, margin: '0 0 2px' }}>{data.merchant.name}</p>
          <p style={{ fontSize: 16, fontWeight: 600, fontFamily: 'monospace', color: T.textPrimary, margin: 0 }}>{confirmation.orderNumber}</p>
        </div>
        <div style={{ display: 'grid', gap: 8, fontSize: 14, color: T.textPrimary, marginBottom: 24 }}>
          <p style={{ margin: 0 }}><span style={{ fontSize: 12, color: T.textMuted }}>Status</span><br /><strong>{confirmationMode === 'deposit_pending' ? 'Awaiting review' : 'Submitted'}</strong></p>
          <p style={{ margin: 0 }}><span style={{ fontSize: 12, color: T.textMuted }}>Event Date</span><br /><strong>{new Date(confirmation.scheduledAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
          <p style={{ margin: 0 }}><span style={{ fontSize: 12, color: T.textMuted }}>Guests</span><br /><strong>{confirmation.headCount}</strong></p>
          <p style={{ margin: 0 }}><span style={{ fontSize: 12, color: T.textMuted }}>Customer</span><br /><strong>{confirmation.customer.firstName} {confirmation.customer.lastName}</strong> ({confirmation.customer.email})</p>
          {confirmation.depositRequired !== undefined && (
            <p style={{ margin: 0 }}><span style={{ fontSize: 12, color: T.textMuted }}>Deposit Required</span><br /><strong>{confirmation.depositRequired ? 'Yes' : 'No'}</strong></p>
          )}
        </div>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary, margin: '0 0 12px' }}>Items</h3>
        {confirmation.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', fontSize: 14, borderBottom: `1px solid ${T.cardBorder}` }}>
            <span>{item.name} x{item.quantity}</span>
            <span style={{ fontWeight: 600 }}>${(item.totalPrice / 100).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTop: `2px solid ${T.cardBorder}`, fontWeight: 700, fontSize: 18 }}>
          <span>Total</span>
          <span>${(confirmation.pricing.total / 100).toFixed(2)}</span>
        </div>
        <div style={{ marginTop: 28, background: '#FAFAF9', borderRadius: 10, padding: '20px 24px' }}>
          <h4 style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary, margin: '0 0 12px' }}>What happens next?</h4>
          <ol style={{ margin: 0, paddingLeft: 20, listStyleType: 'decimal', fontSize: 13, color: T.textMuted, lineHeight: 2 }}>
            {confirmationSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    );
  }

  /* ── Helpers ── */
  const hasPackages = Object.keys(selectedPkgs).length > 0;
  const canSubmit = !submitting && hasPackages && eventDate && !!selectedLocationSlug;
  const minOrder = selectedLocation?.minimumOrderAmount ? (selectedLocation.minimumOrderAmount / 100).toFixed(0) : null;
  const leadTime = selectedLocation?.leadTimeHours ?? null;

  const selectedPkgList = allPackages.filter((p) => selectedPkgs[p.id]);
  const selectedAddOnList = allAddOns.filter((a) => selectedAddOnIds[a.id]);

  /* ── Render ── */
  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 32, alignItems: 'flex-start' }}>
      {/* ── LEFT COLUMN: Form sections ── */}
      <div style={{ flex: isMobile ? '1 1 auto' : '0 0 620px', width: isMobile ? '100%' : undefined, display: 'flex', flexDirection: 'column', gap: 24 }}>

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
        {!error && checkoutState === 'success' && (
          <div style={{ background: '#ECFDF5', border: `1px solid ${T.successBorder}`, borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ color: '#047857', fontWeight: 700, fontSize: 14, margin: 0 }}>
              Deposit checkout complete{returnedOrderNumber ? ` for ${returnedOrderNumber}` : ''}.
            </p>
            <p style={{ color: '#065F46', fontSize: 13, margin: '6px 0 0' }}>
              We&apos;re finalizing your confirmation and the merchant will follow up shortly.
            </p>
          </div>
        )}

        {!error && checkoutState === 'cancelled' && (
          <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 12, padding: '16px 20px' }}>
            <p style={{ color: '#92400E', fontWeight: 700, fontSize: 14, margin: 0 }}>
              Checkout was cancelled{returnedOrderNumber ? ` for ${returnedOrderNumber}` : ''}.
            </p>
            <p style={{ color: '#B45309', fontSize: 13, margin: '6px 0 0' }}>
              Your order was saved. You can try checkout again or wait for the merchant to follow up.
            </p>
          </div>
        )}

        <div style={cardStyle}>
          <h2 style={sectionTitleStyle}>When &amp; How</h2>
          {leadTime && (
            <p style={sectionSubtitleStyle}>Please order at least {leadTime} hours in advance</p>
          )}

          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>{locations.length > 1 ? 'Choose a Location' : 'Ordering From'}</label>
            {locations.length > 1 ? (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                {locations.map((location) => {
                  const isSelected = location.slug === selectedLocationSlug;
                  return (
                    <button
                      key={location.slug}
                      type="button"
                      onClick={() => setSelectedLocationSlug(location.slug)}
                      style={{
                        textAlign: 'left',
                        border: isSelected ? `2px solid ${T.toggleSelectedBorder}` : `1px solid ${T.cardBorder}`,
                        borderRadius: 12,
                        background: isSelected ? '#FFFBEB' : '#FFFFFF',
                        padding: '14px 16px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{location.name}</div>
                          <div style={{ fontSize: 12, color: T.textMuted, marginTop: 3 }}>
                            {formatLocationSummary(location)}
                          </div>
                        </div>
                        {isSelected ? (
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '4px 8px',
                              borderRadius: 999,
                              background: '#D4A853',
                              color: '#1C1917',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 10, lineHeight: 1.5 }}>
                        {formatLocationAddress(location)}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                        <span style={locationMetaChipStyle}>Lead time {location.leadTimeHours}h</span>
                        {location.minimumOrderAmount > 0 ? (
                          <span style={locationMetaChipStyle}>Min ${Math.round(location.minimumOrderAmount / 100)}</span>
                        ) : null}
                        {location.deliveryEnabled && location.deliveryRadiusMiles ? (
                          <span style={locationMetaChipStyle}>{location.deliveryRadiusMiles} mi delivery</span>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : selectedLocation ? (
              <div
                style={{
                  border: `1px solid ${T.cardBorder}`,
                  borderRadius: 12,
                  background: '#FFFFFF',
                  padding: '14px 16px',
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, color: T.textPrimary }}>{selectedLocation.name}</div>
                <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
                  {formatLocationAddress(selectedLocation)}
                </div>
              </div>
            ) : null}
          </div>

          {selectedLocation ? (
            <div
              style={{
                marginTop: 16,
                padding: '14px 16px',
                borderRadius: 12,
                background: '#FAFAF9',
                border: `1px solid ${T.cardBorder}`,
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 700, color: T.textMuted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 8 }}>
                Location Snapshot
              </div>
              <div style={{ fontSize: 14, color: T.textPrimary, fontWeight: 600 }}>
                {selectedLocation.name}
              </div>
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4, lineHeight: 1.5 }}>
                {formatLocationAddress(selectedLocation)}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <span style={locationMetaChipStyle}>Modes: {formatServiceModeList(selectedLocation.serviceTypes)}</span>
                <span style={locationMetaChipStyle}>
                  {selectedLocation.depositRequired ? 'Deposit required' : 'No deposit required'}
                </span>
                {selectedLocation.phone ? <span style={locationMetaChipStyle}>{selectedLocation.phone}</span> : null}
              </div>
            </div>
          ) : null}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginTop: 20 }}>
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
          <div style={{ marginTop: 20 }}>
            <label style={labelStyle}>Service Type</label>
            {selectedLocation ? (
              <p style={{ ...sectionSubtitleStyle, marginTop: 0, marginBottom: 10 }}>
                Available at {selectedLocation.name}: {formatServiceModeList(availableServiceModes)}
              </p>
            ) : null}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              {availableServiceModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setServiceType(mode)}
                  style={{
                    flex: 1,
                    height: 42,
                    border: serviceType === mode ? `2px solid ${T.toggleSelectedBorder}` : `1px solid ${T.borderInput}`,
                    borderRadius: 8,
                    background: serviceType === mode ? T.toggleSelectedBg : T.cardBg,
                    color: serviceType === mode ? T.gold : T.textPrimary,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {SERVICE_MODE_LABELS[mode]}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Address */}
          {serviceType === 'delivery' && (
            <div style={{ marginTop: 16 }}>
              <label style={labelStyle}>&#x1F69A; Delivery Address</label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Street address"
                required
                style={{ ...inputStyle, marginBottom: 12 }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 12 }}>
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
          <div style={{
            marginTop: 20, marginBottom: 24,
            background: '#F5F5F4',
            borderRadius: 12,
            padding: '24px 24px 20px',
          }}>
            <label style={{ ...labelStyle, marginBottom: 16 }}>Headcount</label>
            <div style={{ display: 'flex', alignItems: isMobile ? 'flex-start' : 'center', justifyContent: 'space-between', flexDirection: isMobile ? 'column' : 'row', gap: 20 }}>
              {/* Big display number */}
              <div>
                <div style={{
                  fontSize: 56, fontWeight: 700, color: T.textPrimary,
                  lineHeight: 1, letterSpacing: '-2px',
                }}>
                  {headcount}
                </div>
                <div style={{ fontSize: 14, color: T.textMuted, marginTop: 4, fontWeight: 500 }}>guests</div>
              </div>

              {/* Stepper controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setHeadcount(Math.max(1, headcount - 5))}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#E7E5E4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = T.cardBg; }}
                  style={{
                    width: 36, height: 36,
                    border: `1px solid ${T.borderInput}`,
                    borderRadius: 8,
                    background: T.cardBg,
                    fontSize: 11, fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: T.textMuted,
                    transition: 'background 0.1s',
                  }}
                >
                  −5
                </button>
                <button
                  type="button"
                  onClick={() => setHeadcount(Math.max(1, headcount - 1))}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#E7E5E4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = T.cardBg; }}
                  style={{
                    width: 44, height: 44,
                    border: `1px solid ${T.borderInput}`,
                    borderRadius: 10,
                    background: T.cardBg,
                    fontSize: 22, fontWeight: 400,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: T.textPrimary,
                    transition: 'background 0.1s',
                  }}
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  value={headcount}
                  onChange={(e) => setHeadcount(Math.max(1, parseInt(e.target.value) || 1))}
                  style={{
                    width: 64, height: 44,
                    padding: '0 8px',
                    border: `1px solid ${T.borderInput}`,
                    borderRadius: 10,
                    fontSize: 16, fontWeight: 700,
                    color: T.textPrimary,
                    background: T.cardBg,
                    textAlign: 'center' as const,
                    boxSizing: 'border-box' as const,
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={() => setHeadcount(headcount + 1)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#E7E5E4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = T.cardBg; }}
                  style={{
                    width: 44, height: 44,
                    border: `1px solid ${T.borderInput}`,
                    borderRadius: 10,
                    background: T.cardBg,
                    fontSize: 22, fontWeight: 400,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: T.textPrimary,
                    transition: 'background 0.1s',
                  }}
                >
                  +
                </button>
                <button
                  type="button"
                  onClick={() => setHeadcount(headcount + 5)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#E7E5E4'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = T.cardBg; }}
                  style={{
                    width: 36, height: 36,
                    border: `1px solid ${T.borderInput}`,
                    borderRadius: 8,
                    background: T.cardBg,
                    fontSize: 11, fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: T.textMuted,
                    transition: 'background 0.1s',
                  }}
                >
                  +5
                </button>
              </div>
            </div>

            {/* Per-person estimate */}
            {hasPackages && estimatedTotal > 0 && (
              <div style={{
                marginTop: 12, paddingTop: 12,
                borderTop: '1px solid #E7E5E4',
                display: 'flex', justifyContent: 'space-between',
                fontSize: 13, color: T.textMuted,
              }}>
                <span>Estimated per person</span>
                <span style={{ fontWeight: 600, color: T.gold }}>
                  ${(estimatedTotal / headcount / 100).toFixed(2)}
                </span>
              </div>
            )}
          </div>

          {/* Package cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {allPackages.map((pkg) => {
              const isSelected = !!selectedPkgs[pkg.id];
              return (
                <div
                  key={pkg.id}
                  onClick={() => togglePkg(pkg.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); togglePkg(pkg.id); } }}
                  className="pkg-card"
                  style={{
                    padding: '20px 20px',
                    border: isSelected ? `2px solid ${T.selectedBorder}` : `1px solid ${T.cardBorder}`,
                    borderRadius: 12,
                    background: isSelected ? '#F7F6F5' : T.cardBg,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 2px 8px rgba(28,25,23,0.08)' : 'none',
                    outline: 'none',
                    position: 'relative' as const,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = '#A8A29E';
                      e.currentTarget.style.background = '#FAFAF9';
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(28,25,23,0.05)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = T.cardBorder;
                      e.currentTarget.style.background = T.cardBg;
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  {/* Top row: checkbox + name + price */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                    {/* Checkbox */}
                    <div style={{
                      width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 1,
                      border: isSelected ? 'none' : `2px solid ${T.borderInput}`,
                      background: isSelected ? T.selectedBorder : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {isSelected && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                          <path d="M3 7L6 10L11 4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Name + description */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: T.textPrimary, lineHeight: 1.3 }}>{pkg.name}</div>
                      {pkg.description && (
                        <div style={{ fontSize: 13, color: T.textMuted, marginTop: 3, lineHeight: 1.4 }}>{pkg.description}</div>
                      )}
                    </div>

                    {/* Price block */}
                    <div style={{
                      textAlign: 'right', flexShrink: 0,
                      background: isSelected ? 'rgba(212,168,83,0.08)' : 'transparent',
                      padding: '4px 10px', borderRadius: 8,
                      transition: 'background 0.15s',
                    }}>
                      <div>
                        <span style={{ fontSize: 22, fontWeight: 700, color: T.gold, lineHeight: 1 }}>
                          ${(pkg.pricePerHead / 100).toFixed(2)}
                        </span>
                      </div>
                      <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>/person</div>
                    </div>
                  </div>

                  {/* Headcount range */}
                  {(pkg.minimumHeadcount || pkg.maximumHeadcount) && (
                    <div style={{ marginTop: 8, marginLeft: 36, fontSize: 12, color: T.textPlaceholder }}>
                      {pkg.minimumHeadcount && `Min ${pkg.minimumHeadcount}`}
                      {pkg.minimumHeadcount && pkg.maximumHeadcount && ' · '}
                      {pkg.maximumHeadcount && `Max ${pkg.maximumHeadcount}`}
                      {' guests'}
                    </div>
                  )}

                  {/* Includes (shown when selected) */}
                  {isSelected && pkg.includes && pkg.includes.length > 0 && (
                    <div style={{
                      marginTop: 12, marginLeft: 36, paddingTop: 12,
                      borderTop: `1px solid ${T.cardBorder}`,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '1px', color: T.textMuted, marginBottom: 6 }}>
                        Includes
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
                        {pkg.includes.map((item, i) => (
                          <span key={i} style={{ fontSize: 13, color: T.textPrimary, lineHeight: 1.6 }}>
                            {item.isOptional ? '○' : '•'} {item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section: Add-Ons ── */}
        {allAddOns.length > 0 && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <div>
                <h2 style={sectionTitleStyle}>Add-Ons</h2>
                <p style={sectionSubtitleStyle}>Enhance your order with extras</p>
              </div>
              {selectedAddOnList.length > 0 && (
                <span style={{
                  fontSize: 12, fontWeight: 600, color: T.gold,
                  background: 'rgba(212,168,83,0.1)',
                  padding: '3px 10px', borderRadius: 10,
                }}>
                  {selectedAddOnList.length} selected
                </span>
              )}
            </div>
            <div style={{
              display: 'grid',
              gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 220 : 260}px, 1fr))`,
              gap: 10,
              marginTop: 16,
            }}>
              {allAddOns.map((addOn) => {
                const isSelected = !!selectedAddOnIds[addOn.id];
                return (
                  <div
                    key={addOn.id}
                    onClick={() => toggleAddOn(addOn.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleAddOn(addOn.id); } }}
                    style={{
                      padding: '14px 16px',
                      border: isSelected ? `2px solid ${T.gold}` : `1px solid ${T.cardBorder}`,
                      borderRadius: 10,
                      background: isSelected ? 'rgba(212,168,83,0.04)' : T.cardBg,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? '0 1px 6px rgba(212,168,83,0.12)' : 'none',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = T.gold;
                        e.currentTarget.style.background = 'rgba(212,168,83,0.02)';
                        e.currentTarget.style.boxShadow = '0 1px 4px rgba(212,168,83,0.08)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = T.cardBorder;
                        e.currentTarget.style.background = T.cardBg;
                        e.currentTarget.style.boxShadow = 'none';
                      }
                    }}
                  >
                    {/* Checkbox — gold when selected to differentiate from packages */}
                    <div style={{
                      width: 20, height: 20, borderRadius: 10, flexShrink: 0,
                      border: isSelected ? 'none' : `2px solid ${T.borderInput}`,
                      background: isSelected ? T.gold : 'transparent',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.15s',
                    }}>
                      {isSelected && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>

                    {/* Name + description */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{addOn.name}</div>
                      {addOn.description && (
                        <div style={{ fontSize: 12, color: T.textMuted, marginTop: 1 }}>{addOn.description}</div>
                      )}
                    </div>

                    {/* Price — right-aligned, always visible */}
                    <div style={{ flexShrink: 0 }}>
                      <span style={{
                        fontSize: 16, fontWeight: 700,
                        color: isSelected ? T.gold : T.textPrimary,
                        transition: 'color 0.15s',
                      }}>
                        ${(addOn.price / 100).toFixed(2)}
                      </span>
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
          {customerSignedIn && (
            <div style={{
              marginTop: 16,
              background: '#F5F5F4',
              border: `1px solid ${T.cardBorder}`,
              borderRadius: 10,
              padding: '12px 14px',
            }}>
              <p style={{ margin: 0, fontSize: 13, color: T.textPrimary, fontWeight: 600 }}>
                Signed in customer
              </p>
              <p style={{ margin: '4px 0 0', fontSize: 12, color: T.textMuted }}>
                We prefilled your details from your TrayLoop account. You can still edit them for this order.
              </p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginTop: 20 }}>
            <div>
              <label style={labelStyle}>Full Name *</label>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 }}>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  required
                  style={inputStyle}
                />
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
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

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14, marginTop: 14 }}>
            <div>
              <label style={labelStyle}>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                style={inputStyle}
              />
              <p style={{ fontSize: 11, color: T.textPlaceholder, margin: '4px 0 0', lineHeight: 1.4 }}>We'll send your order confirmation here</p>
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

          <div style={{ marginTop: 14 }}>
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
      <div style={{ flex: isMobile ? '1 1 auto' : '0 0 320px', width: isMobile ? '100%' : undefined, position: isMobile ? 'static' : 'sticky', top: isMobile ? undefined : 24 }}>
        <div style={{
          background: T.cardBg,
          border: `1px solid ${T.cardBorder}`,
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(28,25,23,0.06)',
        }}>
          {/* Header band */}
          <div style={{
            padding: '20px 24px 16px',
            borderBottom: `1px solid ${T.cardBorder}`,
          }}>
            <div style={{
              fontSize: 11, fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '1.5px',
              color: T.gold, marginBottom: 4,
            }}>
              Your Order
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: T.textPrimary }}>
              {data.merchant.name}
            </div>
            {selectedLocation && (
              <div style={{ fontSize: 12, color: T.textMuted, marginTop: 4 }}>
                {selectedLocation.name} • {SERVICE_MODE_LABELS[serviceType]}
              </div>
            )}
          </div>

          <div style={{ padding: '20px 24px 24px' }}>
            {/* Empty state */}
            {!hasPackages ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 16px',
              }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 28,
                  background: '#F5F5F4',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  fontSize: 24,
                }}>
                  🍽️
                </div>
                <p style={{ color: T.textMuted, fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
                  Select a package and date<br />to see your summary
                </p>
                <button
                  type="button"
                  disabled
                  style={{
                    width: '100%', height: 52,
                    border: 'none', borderRadius: 10,
                    background: T.textPlaceholder,
                    color: '#FFFFFF', fontSize: 15, fontWeight: 600,
                    cursor: 'not-allowed',
                  }}
                >
                  Select a package first
                </button>
                {selectedLocation && (
                  <p style={{ fontSize: 11, color: T.textPlaceholder, textAlign: 'center', marginTop: 10, marginBottom: 0 }}>
                    No charge now · $0 deposit sent by email after confirmation
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Line items — packages */}
                <div style={{ marginBottom: 16 }}>
                  {selectedPkgList.map((pkg, i) => (
                    <div key={pkg.id} style={{
                      padding: '12px 0',
                      borderBottom: i < selectedPkgList.length - 1 || selectedAddOnList.length > 0
                        ? `1px solid #F5F5F4` : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>{pkg.name}</span>
                        <span style={{ fontSize: 14, fontWeight: 700, color: T.textPrimary }}>
                          ${((pkg.pricePerHead * headcount) / 100).toFixed(2)}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, color: T.textMuted }}>
                        {headcount} guests × ${(pkg.pricePerHead / 100).toFixed(2)}/person
                      </span>
                    </div>
                  ))}

                  {/* Line items — add-ons */}
                  {selectedAddOnList.map((addOn, i) => (
                    <div key={addOn.id} style={{
                      padding: '12px 0',
                      borderBottom: i < selectedAddOnList.length - 1 ? `1px solid #F5F5F4` : 'none',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 14, fontWeight: 500, color: T.textPrimary }}>{addOn.name}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: T.textPrimary }}>
                          ${(addOn.price / 100).toFixed(2)}
                        </span>
                      </div>
                      {addOn.description && (
                        <span style={{ fontSize: 12, color: T.textMuted }}>{addOn.description}</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Subtotals */}
                <div style={{
                  borderTop: `1px solid ${T.cardBorder}`,
                  paddingTop: 14,
                  display: 'flex', flexDirection: 'column', gap: 8,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: T.textMuted }}>Packages ({selectedPkgList.length})</span>
                    <span style={{ color: T.textPrimary, fontWeight: 500 }}>
                      ${(Object.entries(selectedPkgs).reduce((sum, [id, qty]) => {
                        const pkg = allPackages.find((p) => p.id === id);
                        return sum + (pkg ? pkg.pricePerHead * headcount * qty : 0);
                      }, 0) / 100).toFixed(2)}
                    </span>
                  </div>
                  {selectedAddOnList.length > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: T.textMuted }}>Add-ons ({selectedAddOnList.length})</span>
                      <span style={{ color: T.textPrimary, fontWeight: 500 }}>
                        ${(Object.entries(selectedAddOnIds).reduce((sum, [id, qty]) => {
                          const addOn = allAddOns.find((a) => a.id === id);
                          return sum + (addOn ? addOn.price * qty : 0);
                        }, 0) / 100).toFixed(2)}
                      </span>
                    </div>
                  )}
                  {headcount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                      <span style={{ color: T.textPlaceholder }}>{headcount} guests</span>
                      <span style={{ color: T.textPlaceholder }}>
                        ${(estimatedTotal / headcount / 100).toFixed(2)}/person avg
                      </span>
                    </div>
                  )}
                </div>

                {/* Total */}
                <div style={{
                  borderTop: `2px solid ${T.selectedBorder}`,
                  marginTop: 14, paddingTop: 14,
                  display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                }}>
                  <span style={{ fontSize: 16, fontWeight: 700, color: T.textPrimary }}>Total</span>
                  <span style={{ fontSize: 24, fontWeight: 700, color: T.textPrimary }}>
                    ${(estimatedTotal / 100).toFixed(2)}
                  </span>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!canSubmit}
                  style={{
                    width: '100%', height: 52,
                    marginTop: 20,
                    border: 'none', borderRadius: 10,
                    background: canSubmit ? T.selectedBorder : T.textPlaceholder,
                    color: '#FFFFFF', fontSize: 16, fontWeight: 600,
                    cursor: canSubmit ? 'pointer' : 'not-allowed',
                    transition: 'background 0.15s',
                    position: 'relative',
                  }}
                >
                  {submitting ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                      <span style={{
                        width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#fff', borderRadius: '50%',
                        animation: 'spin 0.6s linear infinite',
                        display: 'inline-block',
                      }} />
                      Placing order...
                    </span>
                  ) : canSubmit ? (selectedLocation?.depositRequired ? 'Continue to Payment' : 'Place Order') : !eventDate ? 'Select a date' : 'Select a package'}
                </button>

                {/* Deposit notice */}
                <p style={{
                  fontSize: 11, color: T.textMuted, textAlign: 'center',
                  marginTop: 10, marginBottom: 0, lineHeight: 1.4,
                }}>
                  {selectedLocation?.depositRequired
                    ? 'No charge now · Deposit sent by email after confirmation'
                    : 'No charge now · $0 deposit sent by email after confirmation'}
                </p>

                {/* Recurring badge */}
                {recurringEnabled && (
                  <div style={{
                    marginTop: 12, padding: '8px 12px',
                    background: '#FFFBEB', borderRadius: 8,
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 12, color: '#92400E',
                  }}>
                    <span>↻</span>
                    <span>Repeats {recurringInterval}</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {/* Spinner keyframe (injected once) */}
        <style dangerouslySetInnerHTML={{ __html: `@keyframes spin { to { transform: rotate(360deg); } }` }} />
      </div>
    </form>
  );
}
