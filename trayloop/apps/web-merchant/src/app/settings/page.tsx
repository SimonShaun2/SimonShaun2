'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiFetch } from '../../lib/api';
import { clearMerchantSession, merchantResetHref } from '../../lib/session';
import { getStorefrontUrl } from '../../lib/storefront';

interface PaymentStatus {
  stripeAccountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  onboardingComplete: boolean;
  status: 'not_started' | 'in_progress' | 'action_required' | 'ready';
  disabledReason: string | null;
  requirementsCurrentlyDue: string[];
  requirementsPastDue: string[];
  requirementsEventuallyDue: string[];
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface SetupStep {
  done: boolean;
  label: string;
  count?: number;
}

interface SetupStatus {
  isComplete: boolean;
  slug: string;
  completedSteps: number;
  totalSteps: number;
  steps: {
    offering: SetupStep;
    location: SetupStep;
    payments: SetupStep;
  };
}

interface OrderStats {
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
}

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  email: string | null;
  serviceTypes: string[];
  leadTimeHours: number;
  minimumOrderAmount: number;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryRadiusMiles: number | null;
  depositRequired: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationFormState {
  name: string;
  slug: string;
  website: string;
  phone: string;
  description: string;
}

interface LocationFormState {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  leadTimeHours: string;
  minimumOrderAmount: string;
  deliveryRadiusMiles: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  depositRequired: boolean;
  isActive: boolean;
  serviceTypes: string[];
}

type SetupState = 'loading' | 'not_started' | 'in_progress' | 'action_required' | 'active';

const DEFAULTS: PaymentStatus = {
  stripeAccountId: null,
  chargesEnabled: false,
  payoutsEnabled: false,
  detailsSubmitted: false,
  onboardingComplete: false,
  status: 'not_started',
  disabledReason: null,
  requirementsCurrentlyDue: [],
  requirementsPastDue: [],
  requirementsEventuallyDue: [],
};

const SECTION_LINKS = [
  { id: 'profile', label: 'Profile' },
  { id: 'storefront', label: 'Storefront' },
  { id: 'operations', label: 'Operations' },
  { id: 'payments', label: 'Payments' },
  { id: 'team', label: 'Team & Access' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'billing', label: 'Billing & Security' },
];

const EMPTY_LOCATION_FORM: LocationFormState = {
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  country: 'US',
  phone: '',
  email: '',
  leadTimeHours: '72',
  minimumOrderAmount: '0',
  deliveryRadiusMiles: '',
  deliveryEnabled: true,
  pickupEnabled: false,
  depositRequired: true,
  isActive: true,
  serviceTypes: ['delivery'],
};

export default function SettingsPage() {
  return (
    <Suspense fallback={<p style={{ color: '#6b7280' }}>Loading settings...</p>}>
      <SettingsContent />
    </Suspense>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const stripeParam = searchParams.get('stripe');

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(DEFAULTS);
  const [setupStatus, setSetupStatus] = useState<SetupStatus | null>(null);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationId, setSelectedLocationId] = useState<string | 'new'>('new');
  const [organizationForm, setOrganizationForm] = useState<OrganizationFormState>({
    name: '',
    slug: '',
    website: '',
    phone: '',
    description: '',
  });
  const [locationForm, setLocationForm] = useState<LocationFormState>(EMPTY_LOCATION_FORM);
  const [setupState, setSetupState] = useState<SetupState>('loading');
  const [loading, setLoading] = useState(true);
  const [paymentActionLoading, setPaymentActionLoading] = useState(false);
  const [bannerMessage, setBannerMessage] = useState('');
  const [bannerTone, setBannerTone] = useState<'success' | 'warning' | 'error'>('success');
  const [profileSaving, setProfileSaving] = useState(false);
  const [locationSaving, setLocationSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [locationMessage, setLocationMessage] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    loadSettings();
  }, []);

  useEffect(() => {
    if (stripeParam === 'complete' || stripeParam === 'refresh') {
      syncStatus();
    }
  }, [stripeParam]);

  const storefrontUrl = useMemo(() => {
    const slug = organization?.slug || setupStatus?.slug;
    return slug ? getStorefrontUrl(slug) : null;
  }, [organization?.slug, setupStatus?.slug]);

  const selectedLocation = useMemo(
    () => locations.find((location) => location.id === selectedLocationId) ?? null,
    [locations, selectedLocationId],
  );

  async function loadSettings(showLoader = true) {
    if (showLoader) setLoading(true);
    setBannerMessage('');

    try {
      const [orgRes, setupRes, initialPaymentRes, statsRes, locationsRes] = await Promise.all([
        apiFetch('/api/organizations/current'),
        apiFetch('/api/organizations/current/setup-status'),
        apiFetch('/api/organizations/current/payment-status').catch(() => ({ data: DEFAULTS })),
        apiFetch('/api/orders/stats').catch(() => ({ data: null })),
        apiFetch('/api/locations').catch(() => ({ data: [] })),
      ]);

      const paymentRes =
        initialPaymentRes.data?.stripeAccountId && !initialPaymentRes.data?.onboardingComplete
          ? await apiFetch('/api/organizations/current/payment-status/sync', { method: 'POST' }).catch(() => initialPaymentRes)
          : initialPaymentRes;

      const nextOrganization = orgRes.data as Organization;
      const nextLocations = (locationsRes.data ?? []) as Location[];

      setOrganization(nextOrganization);
      setOrganizationForm(toOrganizationForm(nextOrganization));
      setSetupStatus(setupRes.data);
      setStats(statsRes.data);
      setLocations(nextLocations);
      applyStatus(paymentRes.data ?? DEFAULTS);

      localStorage.setItem('orgSlug', setupRes.data?.slug ?? nextOrganization.slug);
      localStorage.setItem('orgName', nextOrganization.name);

      if (nextLocations.length > 0) {
        const locationToUse =
          nextLocations.find((location) => location.id === selectedLocationId) ?? nextLocations[0];
        setSelectedLocationId(locationToUse.id);
        setLocationForm(toLocationForm(locationToUse));
      } else {
        setSelectedLocationId('new');
        setLocationForm(EMPTY_LOCATION_FORM);
      }
    } catch (err) {
      setBannerTone('error');
      setBannerMessage(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      if (showLoader) setLoading(false);
    }
  }

  async function syncStatus() {
    try {
      const res = await apiFetch('/api/organizations/current/payment-status/sync', { method: 'POST' });
      applyStatus(res.data);
      setBannerTone('success');
      setBannerMessage('Stripe status refreshed.');
    } catch {
      try {
        const res = await apiFetch('/api/organizations/current/payment-status');
        applyStatus(res.data);
      } catch {
        applyStatus(DEFAULTS);
      }
    }
  }

  function selectLocation(locationId: string | 'new') {
    setLocationMessage('');
    setSelectedLocationId(locationId);
    if (locationId === 'new') {
      setLocationForm(EMPTY_LOCATION_FORM);
      return;
    }

    const location = locations.find((item) => item.id === locationId);
    if (location) {
      setLocationForm(toLocationForm(location));
    }
  }

  function applyStatus(status: PaymentStatus) {
    setPaymentStatus(status);
    if (status.status === 'ready' || status.onboardingComplete) {
      setSetupState('active');
    } else if (status.status === 'action_required') {
      setSetupState('action_required');
    } else if (status.status === 'in_progress' || status.stripeAccountId) {
      setSetupState('in_progress');
    } else {
      setSetupState('not_started');
    }
  }

  async function handleSetupPayments() {
    setPaymentActionLoading(true);
    setBannerMessage('');
    try {
      const res = await apiFetch('/api/organizations/current/payment-onboarding-link', {
        method: 'POST',
        body: JSON.stringify({ returnUrl: `${window.location.origin}/settings` }),
      });
      window.location.href = res.data.url;
    } catch (err) {
      setBannerTone('error');
      setBannerMessage(err instanceof Error ? err.message : 'Failed to start payment setup');
    } finally {
      setPaymentActionLoading(false);
    }
  }

  async function handleProfileSave(event: React.FormEvent) {
    event.preventDefault();
    setProfileSaving(true);
    setProfileMessage('');
    try {
      const payload = {
        name: organizationForm.name.trim(),
        slug: organizationForm.slug.trim().toLowerCase(),
        website: optionalTrimmed(organizationForm.website),
        phone: optionalTrimmed(organizationForm.phone),
        description: optionalTrimmed(organizationForm.description),
      };

      if (!payload.name || !payload.slug) {
        throw new Error('Business name and slug are required');
      }

      await apiFetch('/api/organizations/current', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      setBannerTone('success');
      setBannerMessage('Business profile updated.');
      setProfileMessage('Saved');
      await loadSettings(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save business profile';
      setBannerTone('error');
      setBannerMessage(message);
      setProfileMessage(message);
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleLocationSave(event: React.FormEvent) {
    event.preventDefault();
    setLocationSaving(true);
    setLocationMessage('');
    try {
      const payload = buildLocationPayload(locationForm);
      const path = selectedLocationId === 'new' ? '/api/locations' : `/api/locations/${selectedLocationId}`;
      const method = selectedLocationId === 'new' ? 'POST' : 'PATCH';

      const response = await apiFetch(path, {
        method,
        body: JSON.stringify(payload),
      });

      const savedLocation = response.data as Location;
      setBannerTone('success');
      setBannerMessage(selectedLocationId === 'new' ? 'Location created.' : 'Location settings updated.');
      setLocationMessage('Saved');
      setSelectedLocationId(savedLocation.id);
      await loadSettings(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save location settings';
      setBannerTone('error');
      setBannerMessage(message);
      setLocationMessage(message);
    } finally {
      setLocationSaving(false);
    }
  }

  function handleMerchantSignOut() {
    clearMerchantSession();
    window.location.href = '/login';
  }

  const paymentCard = {
    loading: { title: 'Checking payment setup', badge: '', cta: null as string | null, body: 'Verifying your current Stripe connection.' },
    not_started: {
      title: 'Payments not started',
      badge: 'Not Started',
      cta: 'Set Up Payments',
      body: 'Connect Stripe to collect deposits and move from setup to taking live orders.',
    },
    in_progress: {
      title: 'Stripe onboarding incomplete',
      badge: 'In Progress',
      cta: 'Continue Stripe Onboarding',
      body: 'Your account exists, but Stripe still needs more information before charges and payouts are fully enabled.',
    },
    action_required: {
      title: 'Action required in Stripe',
      badge: 'Action Required',
      cta: 'Fix Stripe Requirements',
      body: 'Stripe flagged outstanding requirements that must be completed before you can take live payments.',
    },
    active: {
      title: 'Payments connected',
      badge: 'Active',
      cta: null,
      body: 'Stripe is connected and your merchant account is ready for live payment activity.',
    },
  }[setupState];

  if (loading && !organization) {
    return <p style={{ color: '#6b7280' }}>Loading settings...</p>;
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px' }}>Settings</h1>
        <p style={{ fontSize: 14, color: '#78716C', margin: 0 }}>
          Manage your merchant profile, storefront, operations, payments, and team access from one place.
        </p>
      </div>

      {stripeParam === 'complete' ? (
        <Banner bg="#F0FDF4" border="#BBF7D0" color="#166534" text="Stripe onboarding updated." />
      ) : null}
      {stripeParam === 'refresh' ? (
        <Banner bg="#FEF3C7" border="#FDE68A" color="#92400E" text="Your Stripe session expired. Continue below to finish setup." />
      ) : null}
      {bannerMessage ? (
        <Banner
          bg={bannerTone === 'success' ? '#F0FDF4' : bannerTone === 'warning' ? '#FFFBEB' : '#FEF2F2'}
          border={bannerTone === 'success' ? '#BBF7D0' : bannerTone === 'warning' ? '#FDE68A' : '#FECACA'}
          color={bannerTone === 'success' ? '#166534' : bannerTone === 'warning' ? '#92400E' : '#DC2626'}
          text={bannerMessage}
        />
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 12, marginBottom: 24 }}>
        <SummaryCard
          label="Storefront"
          value={setupStatus?.isComplete ? 'Live' : 'In Setup'}
          sub={storefrontUrl ?? 'Finish setup to publish your storefront'}
          accent={setupStatus?.isComplete ? '#22C55E' : '#D4A853'}
        />
        <SummaryCard
          label="Payments"
          value={paymentStatus.status === 'ready' ? 'Connected' : paymentStatus.status === 'action_required' ? 'Action Required' : paymentStatus.status === 'in_progress' ? 'In Progress' : 'Not Started'}
          sub={paymentStatus.chargesEnabled ? 'Charges enabled' : paymentStatus.stripeAccountId ? 'Still needs Stripe approval' : 'Connect Stripe to accept payments'}
          accent={paymentStatus.status === 'ready' ? '#22C55E' : paymentStatus.status === 'action_required' ? '#DC2626' : '#D97706'}
        />
        <SummaryCard
          label="Active Orders"
          value={stats?.activeOrders ?? 0}
          sub={stats ? `${stats.totalOrders} total orders tracked` : 'Orders will appear after activity'}
          accent="#3B82F6"
        />
        <SummaryCard
          label="Average Order"
          value={stats ? `$${(stats.avgOrderValue / 100).toFixed(0)}` : '$0'}
          sub={stats ? `${stats.totalCustomers} customers in this workspace` : 'No customer history yet'}
          accent="#1C1917"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px minmax(0, 1fr)', gap: 20, alignItems: 'start' }}>
        <aside
          style={{
            position: 'sticky',
            top: 24,
            border: '1px solid #E7E5E4',
            borderRadius: 12,
            padding: 14,
            background: '#FFFFFF',
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Settings Sections
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {SECTION_LINKS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                style={{
                  padding: '8px 10px',
                  borderRadius: 8,
                  textDecoration: 'none',
                  color: '#44403C',
                  fontSize: 13,
                  fontWeight: 600,
                  background: '#FAFAF9',
                }}
              >
                {section.label}
              </a>
            ))}
          </div>
        </aside>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <SectionCard id="profile" title="Business Profile" subtitle="Update the core information customers and your team use to identify this merchant account.">
            <form onSubmit={handleProfileSave}>
              <div style={formGridStyle}>
                <Field label="Business Name">
                  <input
                    value={organizationForm.name}
                    onChange={(event) => setOrganizationForm((current) => ({ ...current, name: event.target.value }))}
                    style={inputStyle}
                    placeholder="TrayLoop Catering Co."
                    required
                  />
                </Field>
                <Field label="Store Slug">
                  <input
                    value={organizationForm.slug}
                    onChange={(event) =>
                      setOrganizationForm((current) => ({
                        ...current,
                        slug: event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                      }))
                    }
                    style={inputStyle}
                    placeholder="trayloop-catering"
                    required
                  />
                </Field>
                <Field label="Website">
                  <input
                    value={organizationForm.website}
                    onChange={(event) => setOrganizationForm((current) => ({ ...current, website: event.target.value }))}
                    style={inputStyle}
                    placeholder="https://example.com"
                  />
                </Field>
                <Field label="Phone">
                  <input
                    value={organizationForm.phone}
                    onChange={(event) => setOrganizationForm((current) => ({ ...current, phone: event.target.value }))}
                    style={inputStyle}
                    placeholder="(555) 000-0000"
                  />
                </Field>
              </div>

              <Field label="Business Description" style={{ marginTop: 14 }}>
                <textarea
                  value={organizationForm.description}
                  onChange={(event) => setOrganizationForm((current) => ({ ...current, description: event.target.value }))}
                  style={textareaStyle}
                  rows={4}
                  placeholder="Premium corporate catering, private events, and recurring office meals."
                />
              </Field>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: profileMessage === 'Saved' ? '#166534' : '#78716C' }}>
                  {profileMessage || 'Changes here update your merchant profile and storefront identity.'}
                </span>
                <button type="submit" disabled={profileSaving} style={primaryButtonStyle}>
                  {profileSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard id="storefront" title="Storefront" subtitle="Preview and share the public ordering page tied to your merchant slug.">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                  Live URL
                </div>
                <div style={{ padding: '12px 14px', borderRadius: 10, background: '#FAFAF9', border: '1px solid #E7E5E4', fontFamily: 'monospace', fontSize: 12, color: '#44403C', wordBreak: 'break-all' }}>
                  {storefrontUrl ?? 'Complete your setup to generate a live storefront link.'}
                </div>
              </div>
              {storefrontUrl ? (
                <div style={{ display: 'flex', gap: 8 }}>
                  <a
                    href={storefrontUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={primaryButtonStyle}
                  >
                    View Storefront
                  </a>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard.writeText(storefrontUrl)}
                    style={secondaryButtonStyle}
                  >
                    Copy Link
                  </button>
                </div>
              ) : null}
            </div>
            <div style={{ marginTop: 14, fontSize: 13, color: '#78716C' }}>
              {setupStatus?.isComplete
                ? 'Your storefront is ready to accept orders. Test it before sharing it broadly.'
                : `Setup progress: ${setupStatus?.completedSteps ?? 0} of ${setupStatus?.totalSteps ?? 3} steps complete.`}
            </div>
          </SectionCard>

          <SectionCard id="operations" title="Operations" subtitle="Manage the locations, service settings, and order requirements that power your storefront.">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#78716C', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                  Active Location
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {locations.map((location) => (
                    <button
                      key={location.id}
                      type="button"
                      onClick={() => selectLocation(location.id)}
                      style={{
                        ...secondaryButtonStyle,
                        background: selectedLocationId === location.id ? '#1C1917' : '#FFFFFF',
                        color: selectedLocationId === location.id ? '#FFFFFF' : '#57534E',
                        borderColor: selectedLocationId === location.id ? '#1C1917' : '#D6D3D1',
                      }}
                    >
                      {location.name}
                    </button>
                  ))}
                  <button type="button" onClick={() => selectLocation('new')} style={secondaryButtonStyle}>
                    {locations.length > 0 ? 'Add Location' : 'Create Location'}
                  </button>
                </div>
              </div>
              {selectedLocation ? (
                <div style={{ fontSize: 12, color: '#78716C' }}>Editing {selectedLocation.name}</div>
              ) : (
                <div style={{ fontSize: 12, color: '#78716C' }}>
                  {locations.length > 0 ? 'Create a new location or choose one to edit.' : 'No locations yet. Create your first one now.'}
                </div>
              )}
            </div>

            <form onSubmit={handleLocationSave}>
              <div style={formGridStyle}>
                <Field label="Location Name">
                  <input value={locationForm.name} onChange={(event) => setLocationForm((current) => ({ ...current, name: event.target.value }))} style={inputStyle} placeholder="Downtown Kitchen" required />
                </Field>
                <Field label="Phone">
                  <input value={locationForm.phone} onChange={(event) => setLocationForm((current) => ({ ...current, phone: event.target.value }))} style={inputStyle} placeholder="(555) 111-2222" />
                </Field>
                <Field label="Street Address">
                  <input value={locationForm.address} onChange={(event) => setLocationForm((current) => ({ ...current, address: event.target.value }))} style={inputStyle} placeholder="123 Main Street" required />
                </Field>
                <Field label="Support Email">
                  <input value={locationForm.email} onChange={(event) => setLocationForm((current) => ({ ...current, email: event.target.value }))} style={inputStyle} placeholder="events@example.com" />
                </Field>
                <Field label="City">
                  <input value={locationForm.city} onChange={(event) => setLocationForm((current) => ({ ...current, city: event.target.value }))} style={inputStyle} required />
                </Field>
                <Field label="State">
                  <input value={locationForm.state} onChange={(event) => setLocationForm((current) => ({ ...current, state: event.target.value }))} style={inputStyle} required />
                </Field>
                <Field label="ZIP Code">
                  <input value={locationForm.zipCode} onChange={(event) => setLocationForm((current) => ({ ...current, zipCode: event.target.value }))} style={inputStyle} required />
                </Field>
                <Field label="Country">
                  <input value={locationForm.country} onChange={(event) => setLocationForm((current) => ({ ...current, country: event.target.value.toUpperCase().slice(0, 2) }))} style={inputStyle} placeholder="US" required />
                </Field>
                <Field label="Lead Time (Hours)">
                  <input value={locationForm.leadTimeHours} onChange={(event) => setLocationForm((current) => ({ ...current, leadTimeHours: event.target.value }))} style={inputStyle} inputMode="numeric" required />
                </Field>
                <Field label="Minimum Order ($)">
                  <input value={locationForm.minimumOrderAmount} onChange={(event) => setLocationForm((current) => ({ ...current, minimumOrderAmount: event.target.value }))} style={inputStyle} inputMode="decimal" required />
                </Field>
                <Field label="Delivery Radius (Miles)">
                  <input value={locationForm.deliveryRadiusMiles} onChange={(event) => setLocationForm((current) => ({ ...current, deliveryRadiusMiles: event.target.value }))} style={inputStyle} inputMode="numeric" placeholder="25" />
                </Field>
              </div>

              <div style={{ marginTop: 16 }}>
                <div style={fieldLabelStyle}>Service Types</div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { value: 'delivery', label: 'Delivery' },
                    { value: 'pickup', label: 'Pickup' },
                    { value: 'full_service', label: 'Full Service' },
                  ].map((option) => {
                    const checked = locationForm.serviceTypes.includes(option.value);
                    return (
                      <label key={option.value} style={toggleChipStyle}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() =>
                            setLocationForm((current) => ({
                              ...current,
                              serviceTypes: checked
                                ? current.serviceTypes.filter((item) => item !== option.value)
                                : [...current.serviceTypes, option.value],
                              deliveryEnabled: option.value === 'delivery' ? !checked : current.deliveryEnabled,
                              pickupEnabled: option.value === 'pickup' ? !checked : current.pickupEnabled,
                            }))
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
                <ToggleRow
                  title="Delivery enabled"
                  checked={locationForm.deliveryEnabled}
                  onChange={(checked) =>
                    setLocationForm((current) => ({
                      ...current,
                      deliveryEnabled: checked,
                      serviceTypes: checked
                        ? Array.from(new Set([...current.serviceTypes, 'delivery']))
                        : current.serviceTypes.filter((item) => item !== 'delivery'),
                    }))
                  }
                />
                <ToggleRow
                  title="Pickup enabled"
                  checked={locationForm.pickupEnabled}
                  onChange={(checked) =>
                    setLocationForm((current) => ({
                      ...current,
                      pickupEnabled: checked,
                      serviceTypes: checked
                        ? Array.from(new Set([...current.serviceTypes, 'pickup']))
                        : current.serviceTypes.filter((item) => item !== 'pickup'),
                    }))
                  }
                />
                <ToggleRow title="Deposit required" checked={locationForm.depositRequired} onChange={(checked) => setLocationForm((current) => ({ ...current, depositRequired: checked }))} />
                <ToggleRow title="Location active" checked={locationForm.isActive} onChange={(checked) => setLocationForm((current) => ({ ...current, isActive: checked }))} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: locationMessage === 'Saved' ? '#166534' : '#78716C' }}>
                  {locationMessage ||
                    (selectedLocationId === 'new'
                      ? 'Create a location to make your storefront multi-location ready.'
                      : 'Save to update how this location appears on the storefront.')}
                </span>
                <button type="submit" disabled={locationSaving} style={primaryButtonStyle}>
                  {locationSaving ? 'Saving...' : selectedLocationId === 'new' ? 'Create Location' : 'Save Operations'}
                </button>
              </div>
            </form>
          </SectionCard>

          <SectionCard id="payments" title="Payments" subtitle="Stripe connection status, onboarding progress, and live payment readiness.">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 260 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: 999,
                      background:
                        setupState === 'active'
                          ? '#DCFCE7'
                          : setupState === 'action_required'
                            ? '#FEE2E2'
                            : setupState === 'in_progress'
                              ? '#FFF7ED'
                              : '#FEF3C7',
                      color:
                        setupState === 'active'
                          ? '#166534'
                          : setupState === 'action_required'
                            ? '#B91C1C'
                            : setupState === 'in_progress'
                              ? '#C2410C'
                              : '#92400E',
                    }}
                  >
                    {paymentCard.badge || 'Checking'}
                  </span>
                  <strong style={{ fontSize: 16, color: '#1C1917' }}>{paymentCard.title}</strong>
                </div>
                <p style={{ fontSize: 14, color: '#57534E', margin: '0 0 14px', lineHeight: 1.6 }}>{paymentCard.body}</p>
                <KeyValueGrid
                  items={[
                    ['Stripe account', paymentStatus.stripeAccountId ?? 'Not connected'],
                    ['Charges', paymentStatus.chargesEnabled ? 'Enabled' : 'Disabled'],
                    ['Payouts', paymentStatus.payoutsEnabled ? 'Enabled' : 'Disabled'],
                    ['Details submitted', paymentStatus.detailsSubmitted ? 'Yes' : 'No'],
                  ]}
                />
                {paymentStatus.disabledReason || paymentStatus.requirementsPastDue.length > 0 || paymentStatus.requirementsCurrentlyDue.length > 0 ? (
                  <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 10, background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 6 }}>
                      Outstanding Stripe requirements
                    </div>
                    {paymentStatus.disabledReason ? (
                      <div style={{ fontSize: 13, color: '#78350F', marginBottom: 6 }}>
                        Reason: {paymentStatus.disabledReason.replaceAll('_', ' ')}
                      </div>
                    ) : null}
                    {paymentStatus.requirementsPastDue.length > 0 ? (
                      <div style={{ fontSize: 13, color: '#78350F', marginBottom: 4 }}>
                        Past due: {paymentStatus.requirementsPastDue.join(', ')}
                      </div>
                    ) : null}
                    {paymentStatus.requirementsCurrentlyDue.length > 0 ? (
                      <div style={{ fontSize: 13, color: '#78350F' }}>
                        Currently due: {paymentStatus.requirementsCurrentlyDue.join(', ')}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {paymentCard.cta ? (
                  <button type="button" onClick={handleSetupPayments} disabled={paymentActionLoading} style={primaryButtonStyle}>
                    {paymentActionLoading ? 'Redirecting...' : paymentCard.cta}
                  </button>
                ) : null}
                <button type="button" onClick={syncStatus} style={secondaryButtonStyle}>
                  Refresh Status
                </button>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="team" title="Team & Access" subtitle="Who can access the merchant dashboard and how sessions are managed right now.">
            <KeyValueGrid
              items={[
                ['Current access model', 'Owner / admin membership via the merchant account'],
                ['Reset password flow', 'Available from the sign-in page'],
                ['Sign out support', 'Available from the sidebar and sign-in page'],
                ['Team invitations', 'Coming soon'],
              ]}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              <a href={merchantResetHref()} style={secondaryButtonStyle}>
                Reset Password
              </a>
              <button type="button" onClick={handleMerchantSignOut} style={secondaryButtonStyle}>
                Sign Out
              </button>
            </div>
          </SectionCard>

          <SectionCard id="notifications" title="Notifications" subtitle="What the merchant experience supports today and what’s planned next.">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
              <InfoTile title="In-app notifications" body="Notification bell is live in the merchant sidebar." />
              <InfoTile title="Follow-up workflow" body="Follow-ups are created from order activity and managed in the dashboard." />
              <InfoTile title="Email alerts" body="Merchant-level notification preferences are not configurable yet." muted />
              <InfoTile title="Reminder rules" body="Custom notification rules and delivery settings are planned next." muted />
            </div>
          </SectionCard>

          <SectionCard id="billing" title="Billing & Security" subtitle="Billing visibility is tied to Stripe setup today; deeper subscription controls can follow later.">
            <KeyValueGrid
              items={[
                ['Merchant billing state', paymentStatus.onboardingComplete ? 'Payment-ready' : 'Setup in progress'],
                ['Storefront readiness', setupStatus?.isComplete ? 'Live' : 'Incomplete'],
                ['Security basics', 'Password reset and sign-out are live'],
                ['Advanced billing tools', 'Coming soon'],
              ]}
            />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
              <a href={merchantResetHref()} style={secondaryButtonStyle}>
                Reset Password
              </a>
              {storefrontUrl ? (
                <a href={storefrontUrl} target="_blank" rel="noopener noreferrer" style={primaryButtonStyle}>
                  Open Storefront
                </a>
              ) : null}
            </div>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

function Banner({ bg, border, color, text }: { bg: string; border: string; color: string; text: string }) {
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 10, padding: '12px 16px', marginBottom: 16 }}>
      <p style={{ color, fontWeight: 600, margin: 0, fontSize: 14 }}>{text}</p>
    </div>
  );
}

function toOrganizationForm(org: Organization): OrganizationFormState {
  return {
    name: org.name,
    slug: org.slug,
    website: org.website ?? '',
    phone: org.phone ?? '',
    description: org.description ?? '',
  };
}

function toLocationForm(location: Location): LocationFormState {
  return {
    name: location.name,
    address: location.address,
    city: location.city,
    state: location.state,
    zipCode: location.zipCode,
    country: location.country,
    phone: location.phone ?? '',
    email: location.email ?? '',
    leadTimeHours: String(location.leadTimeHours),
    minimumOrderAmount: String(location.minimumOrderAmount / 100),
    deliveryRadiusMiles: location.deliveryRadiusMiles ? String(location.deliveryRadiusMiles) : '',
    deliveryEnabled: location.deliveryEnabled,
    pickupEnabled: location.pickupEnabled,
    depositRequired: location.depositRequired,
    isActive: location.isActive,
    serviceTypes: location.serviceTypes,
  };
}

function buildLocationPayload(form: LocationFormState) {
  const serviceTypes = Array.from(
    new Set(
      form.serviceTypes
        .filter(Boolean)
        .concat(form.deliveryEnabled ? ['delivery'] : [])
        .concat(form.pickupEnabled ? ['pickup'] : []),
    ),
  );

  if (serviceTypes.length === 0) {
    throw new Error('Select at least one service type');
  }

  return {
    name: requiredTrimmed(form.name, 'Location name'),
    address: requiredTrimmed(form.address, 'Address'),
    city: requiredTrimmed(form.city, 'City'),
    state: requiredTrimmed(form.state, 'State'),
    zipCode: requiredTrimmed(form.zipCode, 'ZIP code'),
    country: requiredTrimmed(form.country, 'Country').toUpperCase(),
    phone: optionalTrimmed(form.phone),
    email: optionalTrimmed(form.email),
    leadTimeHours: parseInteger(form.leadTimeHours, 'Lead time'),
    minimumOrderAmount: dollarsToCents(form.minimumOrderAmount),
    deliveryRadiusMiles: form.deliveryRadiusMiles ? parseInteger(form.deliveryRadiusMiles, 'Delivery radius') : undefined,
    deliveryEnabled: form.deliveryEnabled,
    pickupEnabled: form.pickupEnabled,
    depositRequired: form.depositRequired,
    isActive: form.isActive,
    serviceTypes,
  };
}

function requiredTrimmed(value: string, label: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error(`${label} is required`);
  }
  return trimmed;
}

function optionalTrimmed(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseInteger(value: string, label: string) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error(`${label} must be a valid number`);
  }
  return parsed;
}

function dollarsToCents(value: string) {
  const parsed = Number.parseFloat(value);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error('Minimum order must be a valid amount');
  }
  return Math.round(parsed * 100);
}

function SectionCard({
  id,
  title,
  subtitle,
  children,
}: {
  id: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} style={{ border: '1px solid #E7E5E4', borderRadius: 14, background: '#FFFFFF', padding: 20 }}>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{title}</h2>
        <p style={{ fontSize: 13, color: '#78716C', margin: 0 }}>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function SummaryCard({ label, value, sub, accent }: { label: string; value: string | number; sub: string; accent: string }) {
  return (
    <div style={{ border: '1px solid #E7E5E4', borderRadius: 12, padding: '16px 18px', background: '#FFFFFF', borderTop: `3px solid ${accent}` }}>
      <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: '#1C1917' }}>{value}</div>
      <div style={{ fontSize: 12, color: '#A8A29E', marginTop: 3 }}>{sub}</div>
    </div>
  );
}

function KeyValueGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
      {items.map(([label, value]) => (
        <div key={label} style={{ padding: '12px 14px', borderRadius: 10, background: '#FAFAF9', border: '1px solid #E7E5E4' }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#78716C', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 14, color: '#1C1917', lineHeight: 1.5 }}>{value}</div>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  children,
  style,
}: {
  label: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <label style={{ display: 'block', ...style }}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

function ToggleRow({
  title,
  checked,
  onChange,
}: {
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        border: '1px solid #E7E5E4',
        borderRadius: 10,
        background: '#FAFAF9',
        padding: '12px 14px',
        cursor: 'pointer',
      }}
    >
      <span style={{ fontSize: 13, fontWeight: 600, color: '#1C1917' }}>{title}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
    </label>
  );
}

function InfoTile({ title, body, muted }: { title: string; body: string; muted?: boolean }) {
  return (
    <div style={{ padding: '14px 16px', borderRadius: 10, border: '1px solid #E7E5E4', background: muted ? '#FAFAF9' : '#FFFFFF' }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: muted ? '#57534E' : '#1C1917', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13, color: '#78716C', lineHeight: 1.6 }}>{body}</div>
    </div>
  );
}

const formGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  gap: 14,
};

const fieldLabelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: '#78716C',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  borderRadius: 10,
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  padding: '10px 12px',
  fontSize: 14,
  color: '#1C1917',
  boxSizing: 'border-box',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  minHeight: 120,
  resize: 'vertical',
};

const primaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: 10,
  background: '#1C1917',
  color: '#FFFFFF',
  border: 'none',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 700,
  textDecoration: 'none',
};

const secondaryButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: 10,
  background: '#FFFFFF',
  color: '#57534E',
  border: '1px solid #D6D3D1',
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
};

const toggleChipStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 8,
  padding: '8px 10px',
  borderRadius: 999,
  border: '1px solid #D6D3D1',
  background: '#FFFFFF',
  fontSize: 13,
  color: '#44403C',
};
