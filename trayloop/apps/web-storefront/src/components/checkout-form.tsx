'use client';

import { useState, useCallback, useEffect, useMemo, useRef, type FormEvent } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { trackEvent } from '@trayloop/analytics';
import type {
  OrderConfirmation,
  OrderSubmission,
  PublicOrderPaymentStatus,
  StorefrontAddOn,
  StorefrontData,
  StorefrontPackage,
  StorefrontUpsellRecommendation,
  StorefrontUpsellSocialProof,
} from '../lib/api';
import {
  fetchCustomerAccount,
  fetchOrderPaymentStatus,
  fetchStorefrontOftenAdded,
  fetchStorefrontUpsellSocialProof,
  fetchStorefrontUpsells,
  restartOrderCheckout,
  submitOrder,
  trackStorefrontUpsell,
  OrderError,
} from '../lib/api';
import { useMobile } from '../lib/use-mobile';
import StorefrontAuthNav from './storefront-auth-nav';

interface Props {
  data: StorefrontData;
  initialLocationSlug?: string | null;
}
type StorefrontServiceMode = OrderSubmission['serviceType'];
type RecurringPresetId = 'twice_weekly' | 'weekday_weekly' | 'weekly' | 'biweekly';
type DisplayFontKey = 'bricolage' | 'fraunces' | 'inter';
interface MenuSection {
  id: string;
  name: string;
  description: string | null;
  packages: StorefrontPackage[];
  count: number;
}
interface RecurringPreset {
  id: RecurringPresetId;
  label: string;
  deliveriesPerMonth: number;
  apiInterval: 'weekly' | 'biweekly' | 'monthly';
}

const SERVICE_MODE_LABELS: Record<StorefrontServiceMode, string> = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  full_service: 'Full Service',
  on_site: 'On-Site',
  food_truck: 'Food Truck',
};
const PAGE_MAX_WIDTH = 1260;
const BRAND_FALLBACK = '#E85618';
const INK = '#1A1612';
const CREAM = '#F9F5EF';
const BORDER = '#E7E5E4';
const MUTED = '#78716C';

function clampHeadcount(value: number) {
  return Math.max(1, Math.min(1000, value));
}
function formatCurrencyAmount(cents: number) {
  const hasCents = cents % 100 !== 0;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}
function formatDateInput(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}
function formatDisplayDate(dateString: string) {
  if (!dateString) return 'Select date';
  return new Date(`${dateString}T12:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}
function formatDisplayTime(time: string) {
  if (!time) return 'Select time';
  const [hours = '0', minutes = '0'] = time.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
function getInitialDate() {
  const next = new Date();
  next.setDate(next.getDate() + 2);
  return formatDateInput(next);
}
function getInitialTime() {
  return '11:30';
}
function getRecurringPresets(todayIndex: number): RecurringPreset[] {
  const weekdayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const dayName = weekdayNames[todayIndex];
  if (todayIndex === 2 || todayIndex === 4) {
    return [
      {
        id: 'twice_weekly',
        label: 'Every Tuesday & Thursday',
        deliveriesPerMonth: 8,
        apiInterval: 'weekly',
      },
      { id: 'weekly', label: 'Repeat in 1 week', deliveriesPerMonth: 4, apiInterval: 'weekly' },
      {
        id: 'biweekly',
        label: `Every other ${dayName}`,
        deliveriesPerMonth: 2,
        apiInterval: 'biweekly',
      },
    ];
  }
  return [
    {
      id: 'weekday_weekly',
      label: `Every ${dayName}`,
      deliveriesPerMonth: 4,
      apiInterval: 'weekly',
    },
    { id: 'weekly', label: 'Repeat in 1 week', deliveriesPerMonth: 4, apiInterval: 'weekly' },
    {
      id: 'biweekly',
      label: `Every other ${dayName}`,
      deliveriesPerMonth: 2,
      apiInterval: 'biweekly',
    },
  ];
}
function getDisplayFontFamily(displayFont: DisplayFontKey | null | undefined) {
  if (displayFont === 'fraunces') return 'var(--font-display-fraunces), Georgia, serif';
  if (displayFont === 'inter') return 'var(--font-body), Inter, sans-serif';
  return 'var(--font-display-bricolage), var(--font-body), sans-serif';
}
function buildAddressSummary(address: string, city: string, state: string, zipCode: string) {
  return [address, city, state, zipCode].filter(Boolean).join(', ');
}
function buildSections(data: StorefrontData['menu'], query: string): MenuSection[] {
  const q = query.trim().toLowerCase();
  const sections: MenuSection[] = [];
  data.forEach((menu, menuIndex) => {
    menu.categories.forEach((category) => {
      const packages = category.packages.filter(
        (pkg) =>
          !q ||
          pkg.name.toLowerCase().includes(q) ||
          (pkg.description ?? '').toLowerCase().includes(q),
      );
      if (packages.length > 0)
        sections.push({
          id: category.id,
          name: category.name,
          description: category.description,
          packages,
          count: packages.length,
        });
    });
    const uncategorized = menu.uncategorizedPackages.filter(
      (pkg) =>
        !q ||
        pkg.name.toLowerCase().includes(q) ||
        (pkg.description ?? '').toLowerCase().includes(q),
    );
    if (uncategorized.length > 0)
      sections.push({
        id: `uncategorized-${menuIndex}`,
        name: menu.name,
        description: menu.description,
        packages: uncategorized,
        count: uncategorized.length,
      });
  });
  return sections;
}
function placeholderCardImage(name: string, brandColor: string) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'grid',
        placeItems: 'center',
        background: `linear-gradient(135deg, ${brandColor}28, rgba(26,22,18,0.92))`,
        color: '#FFFFFF',
        fontWeight: 900,
        fontSize: 32,
      }}
    >
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}
function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14 }}
    >
      <span style={{ fontSize: 13, color: MUTED }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 800, color: valueColor || INK }}>{value}</span>
    </div>
  );
}
function QuantityStepper({
  quantity,
  onDecrease,
  onIncrease,
  compact = false,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: compact ? 6 : 8,
        borderRadius: 999,
        border: `2px solid ${INK}`,
        background: '#FFFFFF',
        padding: compact ? '2px 4px' : '3px 5px',
      }}
    >
      <button
        type="button"
        onClick={onDecrease}
        style={{
          width: compact ? 22 : 24,
          height: compact ? 22 : 24,
          borderRadius: 999,
          border: 'none',
          background: '#F5F5F4',
          color: INK,
          fontSize: compact ? 14 : 15,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        -
      </button>
      <span
        style={{
          minWidth: compact ? 14 : 18,
          textAlign: 'center',
          fontSize: compact ? 11 : 12,
          fontWeight: 900,
          color: INK,
        }}
      >
        {quantity}
      </span>
      <button
        type="button"
        onClick={onIncrease}
        style={{
          width: compact ? 22 : 24,
          height: compact ? 22 : 24,
          borderRadius: 999,
          border: 'none',
          background: '#F5F5F4',
          color: INK,
          fontSize: compact ? 14 : 15,
          fontWeight: 900,
          lineHeight: 1,
        }}
      >
        +
      </button>
    </div>
  );
}
function ReturnedCheckoutBanner({
  checkoutState,
  returnedOrderNumber,
  paymentStatus,
  paymentStatusError,
  retryingCheckout,
  onRetry,
}: {
  checkoutState: string;
  returnedOrderNumber: string | null;
  paymentStatus: PublicOrderPaymentStatus | null;
  paymentStatusError: string;
  retryingCheckout: boolean;
  onRetry: () => void;
}) {
  const isSuccess = checkoutState === 'success';
  const palette = isSuccess
    ? { bg: '#ECFDF5', border: '#A7F3D0', title: '#047857', body: '#065F46' }
    : { bg: '#FFFBEB', border: '#FCD34D', title: '#92400E', body: '#B45309' };
  return (
    <div
      style={{
        background: palette.bg,
        border: `1px solid ${palette.border}`,
        borderRadius: 18,
        padding: '16px 18px',
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, color: palette.title }}>
        {isSuccess ? 'Checkout completed' : 'Checkout interrupted'}
        {returnedOrderNumber ? ` - ${returnedOrderNumber}` : ''}
      </div>
      <div style={{ marginTop: 6, fontSize: 13, lineHeight: 1.6, color: palette.body }}>
        {paymentStatus
          ? `Order status: ${paymentStatus.orderStatus.replaceAll('_', ' ')}.`
          : isSuccess
            ? 'We are finalizing your payment details.'
            : 'Your order is saved and you can reopen checkout below.'}
      </div>
      {paymentStatusError ? (
        <div style={{ marginTop: 8, fontSize: 12, color: '#B91C1C' }}>{paymentStatusError}</div>
      ) : null}
      {paymentStatus?.canRetryCheckout ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={retryingCheckout}
          style={{
            marginTop: 12,
            border: 'none',
            borderRadius: 999,
            background: INK,
            color: '#FFFFFF',
            padding: '10px 14px',
            fontSize: 12,
            fontWeight: 800,
          }}
        >
          {retryingCheckout ? 'Redirecting...' : 'Continue to payment'}
        </button>
      ) : null}
    </div>
  );
}
function ConfirmationView({
  confirmation,
  confirmationMode,
  merchantName,
  merchantContact,
}: {
  confirmation: OrderConfirmation;
  confirmationMode: 'order_received' | 'deposit_pending' | null;
  merchantName: string;
  merchantContact: string | null;
}) {
  const confirmationDate = new Date(confirmation.scheduledAt);
  return (
    <div style={{ maxWidth: 900, margin: '32px auto 60px', padding: '0 20px' }}>
      <div
        style={{
          borderRadius: 28,
          border: '2px solid #22C55E',
          background: '#FFFFFF',
          padding: 32,
          boxShadow: '0 20px 70px rgba(26,22,18,0.08)',
        }}
      >
        <div
          style={{
            fontSize: 12,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 800,
            color: '#15803D',
          }}
        >
          Order confirmed
        </div>
        <h2
          style={{
            margin: '10px 0 0',
            fontSize: 40,
            lineHeight: 1,
            fontFamily: 'var(--font-display-bricolage), var(--font-body), sans-serif',
          }}
        >
          {confirmationMode === 'deposit_pending'
            ? 'Order received - deposit pending'
            : 'Order received'}
        </h2>
        <p style={{ margin: '12px 0 0', color: MUTED, fontSize: 15, lineHeight: 1.7 }}>
          {merchantName} has your request. We will email confirmation details and next steps to{' '}
          {confirmation.customer.email}.
        </p>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
            gap: 16,
            marginTop: 24,
          }}
        >
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 18,
              padding: 18,
              background: '#FCFBF8',
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 800,
                color: MUTED,
              }}
            >
              Order
            </div>
            <div style={{ marginTop: 8, fontSize: 18, fontWeight: 800 }}>
              {confirmation.orderNumber}
            </div>
            <div style={{ marginTop: 6, fontSize: 14, color: MUTED }}>
              {confirmationDate.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}{' '}
              - {confirmation.headCount} guests
            </div>
          </div>
          <div
            style={{
              border: `1px solid ${BORDER}`,
              borderRadius: 18,
              padding: 18,
              background: '#FCFBF8',
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                fontWeight: 800,
                color: MUTED,
              }}
            >
              Total
            </div>
            <div style={{ marginTop: 8, fontSize: 30, fontWeight: 800 }}>
              {formatCurrencyAmount(confirmation.pricing.total)}
            </div>
            <div style={{ marginTop: 6, fontSize: 14, color: MUTED }}>
              {confirmationMode === 'deposit_pending'
                ? 'Awaiting payment link or deposit checkout'
                : 'Submitted directly to merchant'}
            </div>
          </div>
        </div>
        <div
          style={{
            marginTop: 24,
            border: `1px solid ${BORDER}`,
            borderRadius: 20,
            overflow: 'hidden',
          }}
        >
          {confirmation.items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 14,
                padding: '16px 18px',
                borderBottom:
                  index === confirmation.items.length - 1 ? 'none' : `1px solid ${BORDER}`,
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>
                  {item.name} x {item.quantity}
                </div>
                {item.description ? (
                  <div style={{ marginTop: 4, fontSize: 13, color: MUTED }}>{item.description}</div>
                ) : null}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800 }}>
                {formatCurrencyAmount(item.totalPrice)}
              </div>
            </div>
          ))}
        </div>
        {merchantContact ? (
          <div style={{ marginTop: 20, fontSize: 13, color: MUTED }}>
            Need to update this order? Reach {merchantName} at {merchantContact}.
          </div>
        ) : null}
      </div>
    </div>
  );
}
export default function CheckoutForm({ data, initialLocationSlug }: Props) {
  const isMobile = useMobile(860);
  const isTablet = useMobile(1080);
  const isLaptop = useMobile(1440);
  const isCompactDesktop = useMobile(1320);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const allPackages = useMemo(
    () =>
      data.menu.flatMap((menu) => [
        ...menu.categories.flatMap((category) => category.packages),
        ...menu.uncategorizedPackages,
      ]),
    [data.menu],
  );
  const allAddOns = useMemo(() => data.menu.flatMap((menu) => menu.addOns), [data.menu]);
  const [selectedLocationSlug] = useState(initialLocationSlug ?? data.locations[0]?.slug ?? '');
  const [serviceType, setServiceType] = useState<StorefrontServiceMode>('delivery');
  const [eventDate, setEventDate] = useState(getInitialDate());
  const [eventTime, setEventTime] = useState(getInitialTime());
  const [headcount, setHeadcount] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
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
  const [confirmationMode, setConfirmationMode] = useState<
    'order_received' | 'deposit_pending' | null
  >(null);
  const [upsellRecommendations, setUpsellRecommendations] = useState<
    StorefrontUpsellRecommendation[]
  >([]);
  const [oftenAdded, setOftenAdded] = useState<StorefrontAddOn[]>([]);
  const [socialProof, setSocialProof] = useState<StorefrontUpsellSocialProof | null>(null);
  const recurringPresets = useMemo(() => getRecurringPresets(new Date().getDay()), []);
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringPreset, setRecurringPreset] = useState<RecurringPresetId>(
    recurringPresets[0]?.id ?? 'weekly',
  );
  const [returnedPaymentStatus, setReturnedPaymentStatus] =
    useState<PublicOrderPaymentStatus | null>(null);
  const [paymentStatusError, setPaymentStatusError] = useState('');
  const [retryingCheckout, setRetryingCheckout] = useState(false);
  const upsellSessionKey = useMemo(
    () => globalThis.crypto?.randomUUID?.() ?? `upsell-${Math.random().toString(36).slice(2, 12)}`,
    [],
  );
  const shownUpsellKeysRef = useRef<Set<string>>(new Set());
  const clickedUpsellKeysRef = useRef<Set<string>>(new Set());

  const merchant = data.merchant;
  const selectedLocation =
    data.locations.find((location) => location.slug === selectedLocationSlug) ?? data.locations[0];
  const brandColor = merchant.brandColor || BRAND_FALLBACK;
  const displayFontFamily = getDisplayFontFamily(
    (merchant.displayFont ?? 'bricolage') as DisplayFontKey,
  );
  const availableServiceModes = useMemo<StorefrontServiceMode[]>(() => {
    const next = new Set<StorefrontServiceMode>();
    if (selectedLocation?.deliveryEnabled) next.add('delivery');
    if (selectedLocation?.pickupEnabled) next.add('pickup');
    selectedLocation?.serviceTypes.forEach((mode) => {
      if (mode in SERVICE_MODE_LABELS) next.add(mode as StorefrontServiceMode);
    });
    return next.size > 0 ? Array.from(next) : (['delivery'] as StorefrontServiceMode[]);
  }, [selectedLocation]);
  const menuSections = useMemo(() => buildSections(data.menu, searchTerm), [data.menu, searchTerm]);
  const filteredAddOns = useMemo(
    () =>
      allAddOns.filter(
        (addOn) =>
          !searchTerm ||
          addOn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (addOn.description ?? '').toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    [allAddOns, searchTerm],
  );
  const primaryUpsell = upsellRecommendations[0] ?? null;
  const showSocialProof = Boolean(socialProof && socialProof.ordersAnalyzed >= 3);
  const socialProofLabel =
    showSocialProof && socialProof
      ? `${socialProof.ordersWithAddOn} of last ${socialProof.ordersAnalyzed} similar orders for ${headcount}+ added this`
      : '';
  const selectedPkgList = allPackages
    .filter((pkg) => (selectedPkgs[pkg.id] ?? 0) > 0)
    .map((pkg) => ({
      packageId: pkg.id,
      name: pkg.name,
      quantity: selectedPkgs[pkg.id],
      total: pkg.pricePerHead * headcount * selectedPkgs[pkg.id],
    }));
  const selectedAddOnList = allAddOns
    .filter((addOn) => (selectedAddOnIds[addOn.id] ?? 0) > 0)
    .map((addOn) => ({
      addOnId: addOn.id,
      name: addOn.name,
      quantity: selectedAddOnIds[addOn.id],
      total: addOn.price * selectedAddOnIds[addOn.id],
    }));
  const subtotalCents =
    selectedPkgList.reduce((sum, item) => sum + item.total, 0) +
    selectedAddOnList.reduce((sum, item) => sum + item.total, 0);
  const recurringDeliveryCount =
    recurringPresets.find((preset) => preset.id === recurringPreset)?.deliveriesPerMonth ?? 4;
  const recurringDiscountCents = recurringEnabled ? Math.round(subtotalCents * 0.05) : 0;
  const coordinationFeeCents = subtotalCents > 0 ? Math.round(subtotalCents * 0.035) : 0;
  const displayTotalCents = Math.max(
    subtotalCents + coordinationFeeCents - recurringDiscountCents,
    0,
  );
  const projectedRecurringSavingsThreeMonths =
    (recurringEnabled ? recurringDiscountCents : Math.round(subtotalCents * 0.05)) *
    recurringDeliveryCount *
    3;
  const recurringBars = [1, 2, 3].map((index) => ({
    label: `M${index}`,
    height: projectedRecurringSavingsThreeMonths > 0 ? 35 + index * 15 : 18,
  }));
  const itemsInCart =
    selectedPkgList.reduce((sum, item) => sum + item.quantity, 0) +
    selectedAddOnList.reduce((sum, item) => sum + item.quantity, 0);
  const recurringPresetDetails =
    recurringPresets.find((preset) => preset.id === recurringPreset) ?? recurringPresets[0];
  const suggestedOftenAdded = useMemo(
    () => oftenAdded.filter((addOn) => (selectedAddOnIds[addOn.id] ?? 0) === 0).slice(0, 3),
    [oftenAdded, selectedAddOnIds],
  );
  const socialProofAverageLabel = socialProof?.averageAddOnRevenue
    ? formatCurrencyAmount(Math.round(socialProof.averageAddOnRevenue))
    : null;
  const trustItems = [
    {
      label: 'Delivery',
      value: selectedLocation.deliveryRadiusMiles
        ? `${selectedLocation.deliveryRadiusMiles} mi radius`
        : 'Pickup only',
    },
    { label: 'Lead time', value: `${selectedLocation.leadTimeHours}h` },
    {
      label: 'Min order',
      value:
        selectedLocation.minimumOrderAmount > 0
          ? formatCurrencyAmount(selectedLocation.minimumOrderAmount)
          : '$0',
    },
    { label: 'Deposit', value: selectedLocation.depositRequired ? 'Required' : 'Not required' },
    { label: 'Verified', value: 'Direct from merchant' },
  ];
  const merchantContact = merchant.phone || selectedLocation?.phone || null;
  const deliverySummary =
    serviceType === 'delivery'
      ? buildAddressSummary(address, city, state, zipCode) ||
        'Add a delivery address to validate the zone.'
      : `Pickup or service at ${selectedLocation.name}`;
  const canSubmit = Boolean(
    selectedLocation &&
    itemsInCart > 0 &&
    firstName &&
    lastName &&
    email &&
    (serviceType !== 'delivery' || (address && city && state && zipCode)),
  );
  const showDesktopSidebar = !isCompactDesktop;
  const showDesktopCart = !isTablet;
  const showCategoryChips = isMobile;
  const showBottomCartBar = !showDesktopCart;
  const layoutColumns = isMobile
    ? '1fr'
    : showDesktopSidebar
      ? '188px minmax(0, 1fr) 316px'
      : showDesktopCart
        ? 'minmax(0, 1fr) 304px'
        : '1fr';
  const stackDesktopControls = !isMobile && isCompactDesktop;
  const controlBarTop = isMobile ? 60 : 76;
  const sidebarTop = isMobile ? 110 : stackDesktopControls ? 196 : 164;

  useEffect(() => {
    if (menuSections.length > 0)
      setActiveCategory((current) =>
        menuSections.some((section) => section.id === current) ? current : menuSections[0].id,
      );
  }, [menuSections]);
  useEffect(() => {
    if (!availableServiceModes.includes(serviceType)) setServiceType(availableServiceModes[0]);
  }, [availableServiceModes, serviceType]);
  useEffect(() => {
    if (!selectedLocationSlug || !pathname) return;
    if (searchParams.get('location') === selectedLocationSlug) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('location', selectedLocationSlug);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [pathname, router, searchParams, selectedLocationSlug]);
  useEffect(() => {
    let cancelled = false;
    fetchCustomerAccount()
      .then((account) => {
        if (cancelled) return;
        setFirstName((current) => current || account.profile.firstName || '');
        setLastName((current) => current || account.profile.lastName || '');
        setEmail((current) => current || account.profile.email || '');
        setPhone((current) => current || account.profile.phone || '');
        setCompanyName((current) => current || account.profile.companyName || '');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  useEffect(() => {
    trackEvent('storefront_view', {
      merchantSlug: merchant.slug,
      locationSlug: selectedLocationSlug || 'unknown',
    });
  }, [merchant.slug, selectedLocationSlug]);
  useEffect(() => {
    let cancelled = false;
    fetchStorefrontOftenAdded(merchant.slug)
      .then((result) => {
        if (!cancelled) setOftenAdded(result);
      })
      .catch(() => {
        if (!cancelled) setOftenAdded([]);
      });
    return () => {
      cancelled = true;
    };
  }, [merchant.slug]);
  useEffect(() => {
    if (!selectedLocation || selectedPkgList.length === 0) {
      setUpsellRecommendations([]);
      return;
    }
    let cancelled = false;
    fetchStorefrontUpsells(merchant.slug, {
      locationId: selectedLocation.slug,
      serviceType,
      headcount,
      packages: selectedPkgList.map((item) => ({
        packageId: item.packageId,
        quantity: item.quantity,
      })),
      addOns: selectedAddOnList.map((item) => ({ addOnId: item.addOnId, quantity: item.quantity })),
    })
      .then((result) => {
        if (!cancelled) setUpsellRecommendations(result);
      })
      .catch(() => {
        if (!cancelled) setUpsellRecommendations([]);
      });
    return () => {
      cancelled = true;
    };
  }, [merchant.slug, selectedLocation, serviceType, headcount, selectedPkgList, selectedAddOnList]);
  useEffect(() => {
    if (!primaryUpsell) {
      setSocialProof(null);
      return;
    }
    let cancelled = false;
    fetchStorefrontUpsellSocialProof(merchant.slug, { addOnId: primaryUpsell.addOnId, headcount })
      .then((result) => {
        if (!cancelled) setSocialProof(result);
      })
      .catch(() => {
        if (!cancelled) setSocialProof(null);
      });
    return () => {
      cancelled = true;
    };
  }, [merchant.slug, primaryUpsell, headcount]);
  useEffect(() => {
    const checkoutState = searchParams.get('checkout');
    const returnedOrderId = searchParams.get('orderId');
    if (!checkoutState || !returnedOrderId) return;
    let cancelled = false;
    fetchOrderPaymentStatus(merchant.slug, returnedOrderId)
      .then((status) => {
        if (!cancelled) {
          setReturnedPaymentStatus(status);
          setPaymentStatusError('');
        }
      })
      .catch((err) => {
        if (!cancelled)
          setPaymentStatusError(
            err instanceof Error ? err.message : 'Could not load payment status.',
          );
      });
    return () => {
      cancelled = true;
    };
  }, [merchant.slug, searchParams]);
  useEffect(() => {
    if (!primaryUpsell) return;
    const trackingKey = `${primaryUpsell.addOnId}:${headcount}:${selectedLocationSlug}`;
    if (shownUpsellKeysRef.current.has(trackingKey)) return;
    shownUpsellKeysRef.current.add(trackingKey);
    void trackStorefrontUpsell(merchant.slug, {
      sessionKey: upsellSessionKey,
      locationId: selectedLocationSlug,
      addOnId: primaryUpsell.addOnId,
      eventType: 'shown',
      recommendationType: primaryUpsell.recommendationType,
      suggestedQuantity: primaryUpsell.suggestedQuantity,
      revenueCents: primaryUpsell.totalPrice,
      headline: primaryUpsell.headline,
      reason: primaryUpsell.reason,
    });
  }, [primaryUpsell, headcount, merchant.slug, selectedLocationSlug, upsellSessionKey]);
  const jumpToSection = useCallback((sectionId: string) => {
    const node = sectionRefs.current[sectionId];
    if (!node) return;
    setActiveCategory(sectionId);
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);
  const scrollMenuRow = useCallback((sectionId: string, direction: 'left' | 'right') => {
    const node = rowRefs.current[sectionId];
    if (!node) return;
    const firstCard = node.firstElementChild as HTMLElement | null;
    const step = (firstCard?.offsetWidth ?? 264) + 16;
    node.scrollBy({ left: direction === 'left' ? -step : step, behavior: 'smooth' });
  }, []);
  const updatePackageQuantity = useCallback(
    (packageId: string, nextQuantity: number) => {
      setSelectedPkgs((current) => {
        const next = { ...current };
        if (nextQuantity <= 0) delete next[packageId];
        else next[packageId] = nextQuantity;
        return next;
      });
      if (nextQuantity > 0)
        trackEvent('storefront_package_selected', {
          merchantSlug: merchant.slug,
          packageId,
          quantity: nextQuantity,
        });
    },
    [merchant.slug],
  );
  const updateAddOnQuantity = useCallback(
    (addOnId: string, nextQuantity: number) => {
      setSelectedAddOnIds((current) => {
        const next = { ...current };
        if (nextQuantity <= 0) delete next[addOnId];
        else next[addOnId] = nextQuantity;
        return next;
      });
      if (nextQuantity > 0)
        trackEvent('storefront_add_on_selected', {
          merchantSlug: merchant.slug,
          addOnId,
          quantity: nextQuantity,
        });
    },
    [merchant.slug],
  );
  const applyUpsellRecommendation = useCallback(() => {
    if (!primaryUpsell) return;
    const currentQuantity = selectedAddOnIds[primaryUpsell.addOnId] ?? 0;
    updateAddOnQuantity(
      primaryUpsell.addOnId,
      currentQuantity === 0 ? Math.max(primaryUpsell.suggestedQuantity, 1) : currentQuantity + 1,
    );
    const trackingKey = `${primaryUpsell.addOnId}:${headcount}:${selectedLocationSlug}`;
    if (!clickedUpsellKeysRef.current.has(trackingKey)) {
      clickedUpsellKeysRef.current.add(trackingKey);
      void trackStorefrontUpsell(merchant.slug, {
        sessionKey: upsellSessionKey,
        locationId: selectedLocationSlug,
        addOnId: primaryUpsell.addOnId,
        eventType: 'clicked',
        recommendationType: primaryUpsell.recommendationType,
        suggestedQuantity: primaryUpsell.suggestedQuantity,
        revenueCents: primaryUpsell.totalPrice,
        headline: primaryUpsell.headline,
        reason: primaryUpsell.reason,
      });
    }
    trackEvent('storefront_upsell_added', {
      merchantSlug: merchant.slug,
      addOnId: primaryUpsell.addOnId,
    });
  }, [
    primaryUpsell,
    updateAddOnQuantity,
    selectedAddOnIds,
    headcount,
    selectedLocationSlug,
    merchant.slug,
    upsellSessionKey,
  ]);
  const handleRetryCheckout = useCallback(async () => {
    const returnedOrderId = searchParams.get('orderId');
    if (!returnedOrderId) return;
    setRetryingCheckout(true);
    try {
      const payload = await restartOrderCheckout(merchant.slug, returnedOrderId);
      window.location.href = payload.url;
    } catch (err) {
      setPaymentStatusError(err instanceof Error ? err.message : 'Could not reopen checkout.');
    } finally {
      setRetryingCheckout(false);
    }
  }, [merchant.slug, searchParams]);
  const upcomingDeliveries = useMemo(() => {
    const deliveries: Array<{ date: Date }> = [];
    const start = new Date(`${eventDate}T12:00:00`);
    if (Number.isNaN(start.getTime())) return deliveries;
    const stepDays =
      recurringPreset === 'twice_weekly' ? 3 : recurringPreset === 'biweekly' ? 14 : 7;
    for (let index = 0; index < 3; index += 1) {
      const next = new Date(start);
      next.setDate(start.getDate() + stepDays * index);
      deliveries.push({ date: next });
    }
    return deliveries;
  }, [eventDate, recurringPreset]);

  const smartUpsellCard = primaryUpsell ? (
    <div
      style={{
        borderRadius: 24,
        border: '2px solid #C4B5FD',
        background: '#FAF5FF',
        padding: isMobile ? 16 : 18,
        display: 'grid',
        gap: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 11,
            fontWeight: 900,
            color: '#6D28D9',
            textTransform: 'uppercase',
          }}
        >
          <span
            className="storefront-pulse-dot"
            style={{ width: 8, height: 8, borderRadius: 999, background: '#7C3AED' }}
          />
          Live - AI recommendation
        </div>
        <span
          style={{
            borderRadius: 999,
            background: '#FFFFFF',
            color: '#7C3AED',
            padding: '4px 10px',
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          NEW
        </span>
      </div>
      <div style={{ fontSize: isMobile ? 18 : 20, fontWeight: 900, lineHeight: 1.2 }}>
        {primaryUpsell.headline}
      </div>
      {showSocialProof ? (
        <div
          style={{
            borderRadius: 16,
            background: '#FFFFFF',
            border: '1px solid rgba(124,58,237,0.16)',
            padding: 12,
            display: 'grid',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: '#DDD6FE',
                  border: '2px solid #FFFFFF',
                }}
              />
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: '#C4B5FD',
                  border: '2px solid #FFFFFF',
                  marginLeft: -8,
                }}
              />
              <span
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 999,
                  background: '#A78BFA',
                  border: '2px solid #FFFFFF',
                  marginLeft: -8,
                }}
              />
            </div>
            <div style={{ minWidth: 0, fontSize: 12, fontWeight: 700, color: '#4C1D95' }}>
              {socialProofLabel}
            </div>
          </div>
          {socialProofAverageLabel ? (
            <div style={{ fontSize: 11, color: MUTED }}>
              Avg uplift on similar orders: {socialProofAverageLabel}
            </div>
          ) : null}
        </div>
      ) : null}
      <div style={{ display: 'grid', gap: 8, fontSize: 12, color: MUTED }}>
        <div>
          📈 Avg uplift on similar orders{' '}
          {socialProofAverageLabel ?? formatCurrencyAmount(primaryUpsell.totalPrice)}
        </div>
        <div>⏱ 60 sec to add</div>
        <div>💸 Goes 100% to the merchant</div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontSize: 28, fontWeight: 900, color: '#6D28D9' }}>
            {formatCurrencyAmount(primaryUpsell.totalPrice)}
          </div>
          <div style={{ fontSize: 11, color: MUTED }}>
            {primaryUpsell.suggestedQuantity} suggested
          </div>
        </div>
        <button
          type="button"
          onClick={applyUpsellRecommendation}
          style={{
            height: 42,
            padding: '0 16px',
            borderRadius: 14,
            border: 'none',
            background: '#6D28D9',
            color: '#FFFFFF',
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          Add to order
        </button>
      </div>
      <div style={{ fontSize: 11, color: MUTED }}>Why this rec? Updated moments ago.</div>
    </div>
  ) : null;
  const oftenAddedRow =
    suggestedOftenAdded.length > 0 ? (
      <div style={{ display: 'grid', gap: 10 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            color: MUTED,
          }}
        >
          Often added
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {suggestedOftenAdded.map((addOn) => (
            <button
              key={addOn.id}
              type="button"
              onClick={() => updateAddOnQuantity(addOn.id, (selectedAddOnIds[addOn.id] ?? 0) + 1)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                height: 34,
                borderRadius: 999,
                border: `1px solid ${BORDER}`,
                background: '#FFFFFF',
                padding: '0 12px',
                fontSize: 12,
                fontWeight: 800,
                color: INK,
              }}
            >
              <span style={{ fontSize: 13 }}>+</span>
              <span>{addOn.name}</span>
              <span style={{ color: MUTED }}>{formatCurrencyAmount(addOn.price)}</span>
            </button>
          ))}
        </div>
      </div>
    ) : null;
  const recurringCard =
    subtotalCents > 0 ? (
      <div
        style={{
          borderRadius: 24,
          border: `1px solid ${BORDER}`,
          background: '#FFF7ED',
          padding: isMobile ? 16 : 18,
          display: 'grid',
          gap: 14,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 999,
                background: '#FED7AA',
                color: '#C2410C',
                display: 'grid',
                placeItems: 'center',
                fontSize: 20,
                boxShadow: '0 10px 20px rgba(232,86,24,0.14)',
              }}
            >
              ↻
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900 }}>
                Recurring is {recurringEnabled ? 'on' : 'available'}
              </div>
              <div style={{ fontSize: 12, color: MUTED }}>Save 5% on repeat catering</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRecurringEnabled((current) => !current)}
            aria-pressed={recurringEnabled}
            style={{
              width: 52,
              height: 30,
              borderRadius: 999,
              border: 'none',
              background: recurringEnabled ? '#E85618' : '#E7E5E4',
              padding: 4,
              position: 'relative',
            }}
          >
            <span
              style={{
                position: 'absolute',
                top: 4,
                left: recurringEnabled ? 26 : 4,
                width: 22,
                height: 22,
                borderRadius: 999,
                background: '#FFFFFF',
                boxShadow: '0 3px 10px rgba(26,22,18,0.16)',
              }}
            />
          </button>
        </div>
        <div
          style={{
            borderRadius: 18,
            border: '2px solid #FDBA74',
            background: '#FFFFFF',
            padding: 14,
            display: 'grid',
            gap: 10,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: '#C2410C',
            }}
          >
            Your projected savings
          </div>
          <div
            style={{
              fontFamily: displayFontFamily,
              fontSize: isMobile ? 26 : 30,
              lineHeight: 1.05,
              fontWeight: 900,
            }}
          >
            {formatCurrencyAmount(projectedRecurringSavingsThreeMonths)} over 3 months
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            {recurringBars.map((bar) => (
              <div key={bar.label} style={{ display: 'grid', gap: 6, justifyItems: 'center' }}>
                <div
                  style={{
                    width: 24,
                    height: bar.height,
                    borderRadius: 999,
                    background: 'linear-gradient(180deg, #FDBA74 0%, #E85618 100%)',
                  }}
                />
                <span style={{ fontSize: 10, color: MUTED }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {recurringPresets.map((preset) => {
            const active = recurringPreset === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setRecurringEnabled(true);
                  setRecurringPreset(preset.id);
                }}
                style={{
                  height: 34,
                  borderRadius: 999,
                  border: active ? 'none' : `1px solid ${BORDER}`,
                  background: active ? '#E85618' : '#FFFFFF',
                  color: active ? '#FFFFFF' : INK,
                  padding: '0 12px',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {preset.label} · -5%
              </button>
            );
          })}
        </div>
        <div style={{ display: 'grid', gap: 8 }}>
          {upcomingDeliveries.map((delivery, index) => (
            <div
              key={delivery.date.toISOString()}
              style={{
                borderRadius: 14,
                background: '#FFFFFF',
                border: `1px solid ${BORDER}`,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, fontWeight: 800 }}>
                  {delivery.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·{' '}
                  {formatDisplayTime(eventTime)}
                </div>
                <div style={{ marginTop: 2, fontSize: 11, color: MUTED }}>
                  {itemsInCart || 1} items · {headcount} guests ·{' '}
                  {formatCurrencyAmount(displayTotalCents)}
                </div>
              </div>
              {index === 0 && delivery.date.toDateString() === new Date().toDateString() ? (
                <span
                  style={{
                    borderRadius: 999,
                    background: '#FEF3C7',
                    color: '#92400E',
                    padding: '4px 8px',
                    fontSize: 10,
                    fontWeight: 900,
                  }}
                >
                  TODAY
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>
          ✓ Skip any week · ✓ Edit anytime · ✓ Cancel anytime
        </div>
        {recurringEnabled ? (
          <div style={{ fontSize: 11, fontWeight: 800, color: '#C2410C' }}>
            Recurring plan: {recurringPresetDetails?.label ?? 'Repeat weekly'}
          </div>
        ) : null}
      </div>
    ) : null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedLocation) return;
    setSubmitting(true);
    setError('');
    setFieldErrors([]);
    trackEvent('begin_checkout', {
      merchantSlug: merchant.slug,
      itemCount: itemsInCart,
      subtotalCents,
    });
    const payload: OrderSubmission = {
      locationId: selectedLocation.slug,
      serviceType,
      eventDate,
      headcount,
      packages: selectedPkgList.map((item) => ({
        packageId: item.packageId,
        quantity: item.quantity,
      })),
      addOns: selectedAddOnList.map((item) => ({ addOnId: item.addOnId, quantity: item.quantity })),
      customer: {
        firstName,
        lastName,
        email,
        phone: phone || undefined,
        companyName: companyName || undefined,
      },
      notes: notes || undefined,
      deliveryAddress:
        serviceType === 'delivery' ? { address, city, state, zipCode, country: 'US' } : undefined,
      recurring: recurringEnabled
        ? {
            interval:
              recurringPresets.find((preset) => preset.id === recurringPreset)?.apiInterval ??
              'weekly',
            preferredTime: eventTime,
          }
        : undefined,
      upsellAttributions:
        primaryUpsell && (selectedAddOnIds[primaryUpsell.addOnId] ?? 0) > 0
          ? [
              {
                addOnId: primaryUpsell.addOnId,
                sessionKey: upsellSessionKey,
                recommendationType: primaryUpsell.recommendationType,
                suggestedQuantity: primaryUpsell.suggestedQuantity,
                revenueCents: primaryUpsell.totalPrice,
                headline: primaryUpsell.headline,
                reason: primaryUpsell.reason,
              },
            ]
          : undefined,
    };
    try {
      const response = await submitOrder(merchant.slug, payload);
      if (
        (response.mode === 'deposit_checkout' || response.mode === 'full_checkout') &&
        response.checkout?.url
      ) {
        trackEvent('checkout_redirected', {
          merchantSlug: merchant.slug,
          checkoutType: response.checkout.kind,
        });
        window.location.href = response.checkout.url;
        return;
      }
      setConfirmation(response.order);
      setConfirmationMode(
        response.mode === 'deposit_pending' ? 'deposit_pending' : 'order_received',
      );
    } catch (err) {
      if (err instanceof OrderError) {
        setError(err.message);
        setFieldErrors(err.details ?? []);
      } else {
        setError(err instanceof Error ? err.message : 'Unable to submit order.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation)
    return (
      <ConfirmationView
        confirmation={confirmation}
        confirmationMode={confirmationMode}
        merchantName={merchant.name}
        merchantContact={merchantContact}
      />
    );

  const searchInput = !isMobile ? (
    <input
      className="storefront-field"
      value={searchTerm}
      onChange={(event) => setSearchTerm(event.target.value)}
      placeholder="Search the menu..."
      style={{
        width: isTablet ? 200 : isCompactDesktop ? 260 : 360,
        minWidth: 0,
        height: 44,
        borderRadius: 14,
        border: `1px solid ${BORDER}`,
        background: '#FAFAF9',
        padding: '0 14px',
        fontSize: 13,
      }}
    />
  ) : null;

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: '#FAF9F7',
        color: INK,
        fontFamily: 'var(--font-body), Inter, sans-serif',
        overflowX: 'clip',
      }}
    >
      <style>{`@keyframes storefrontPulse { 0% { transform: scale(1); opacity: .55; } 70% { transform: scale(1.45); opacity: .05; } 100% { transform: scale(1); opacity: .55; } } .storefront-pulse-dot { animation: storefrontPulse 1.8s infinite; } .storefront-scrollbar { scrollbar-width: none; -ms-overflow-style: none; } .storefront-scrollbar::-webkit-scrollbar { display: none; } .storefront-field { box-sizing: border-box; width: 100%; min-width: 0; }`}</style>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 40,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
            maxWidth: PAGE_MAX_WIDTH,
            margin: '0 auto',
            height: isMobile ? 60 : isLaptop ? 68 : 76,
            display: 'flex',
            alignItems: 'center',
            gap: isMobile ? 10 : isTablet ? 12 : 18,
            padding: isMobile ? '0 14px' : isTablet ? '0 18px' : '0 24px',
          }}
        >
          <div
            style={{
              width: isMobile ? 36 : 44,
              height: isMobile ? 36 : 44,
              borderRadius: 999,
              background: INK,
              color: '#FFFFFF',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 900,
            }}
          >
            {merchant.name.slice(0, 1)}
          </div>
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontFamily: displayFontFamily,
                fontSize: isMobile ? 16 : 18,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {merchant.name}
            </div>
            {merchant.rating && merchant.reviewCount ? (
              <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: MUTED }}>
                {merchant.rating.toFixed(1)} stars - {merchant.reviewCount} reviews
              </div>
            ) : selectedLocation ? (
              <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: MUTED }}>
                {selectedLocation.city}, {selectedLocation.state}
              </div>
            ) : null}
          </div>
          {searchInput}
          <div
            style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 10 : isLaptop ? 10 : 14,
              flexShrink: 0,
            }}
          >
            {!isMobile ? (
              <Link
                href="#"
                style={{ fontSize: 12, fontWeight: 700, color: INK, textDecoration: 'none' }}
              >
                Help
              </Link>
            ) : null}
            {!isMobile ? (
              <StorefrontAuthNav variant="light" />
            ) : (
              <Link
                href="/login"
                style={{ fontSize: 12, fontWeight: 700, color: INK, textDecoration: 'none' }}
              >
                Sign in
              </Link>
            )}
            {!isMobile ? (
              <button
                type="button"
                onClick={() =>
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                }
                style={{
                  height: 40,
                  padding: '0 14px',
                  borderRadius: 14,
                  border: '1px solid rgba(26,22,18,0.08)',
                  background: '#FFFFFF',
                  color: INK,
                  fontSize: 13,
                  fontWeight: 900,
                }}
              >
                Cart {itemsInCart > 0 ? `(${itemsInCart})` : ''}
              </button>
            ) : null}
          </div>
        </div>
      </div>
      <div
        style={{
          maxWidth: PAGE_MAX_WIDTH,
          margin: '0 auto',
          padding: isMobile ? '12px 14px 0' : '12px 24px 0',
        }}
      >
        <div
          style={{
            borderRadius: isMobile ? 18 : 22,
            background: `linear-gradient(135deg, ${brandColor} 0%, ${INK} 100%)`,
            color: '#FFFFFF',
            padding: isMobile ? '12px 14px' : '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 14,
          }}
        >
          <div>
            <div
              style={{
                fontFamily: displayFontFamily,
                fontSize: isMobile ? 18 : 22,
                fontWeight: 900,
                lineHeight: 1,
              }}
            >
              {merchant.name}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: 'rgba(255,255,255,0.82)' }}>
              {merchant.tagline || merchant.description || 'Catering & events, direct from the merchant.'}
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              borderRadius: 999,
              background: '#EAF8EF',
              color: '#166534',
              padding: '6px 10px',
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            Open
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'sticky',
          top: isMobile ? 60 : 76,
          zIndex: 25,
          background: 'rgba(255,255,255,0.96)',
          backdropFilter: 'blur(10px)',
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
            maxWidth: PAGE_MAX_WIDTH,
            margin: '0 auto',
            padding: isMobile ? '8px 14px' : '0 24px',
          }}
        >
          <div
            style={{
              minHeight: isMobile ? 40 : 50,
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 12 : 18,
              overflowX: 'auto',
            }}
            className="storefront-scrollbar"
          >
            {trustItems.map((item) => (
              <div key={item.label} style={{ minWidth: 'fit-content', display: 'grid', gap: 2 }}>
                <span
                  style={{
                    fontSize: 9,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 800,
                    color: MUTED,
                  }}
                >
                  {item.label}
                </span>
                <span style={{ fontSize: 12, fontWeight: 800 }}>{item.value}</span>
              </div>
            ))}
            <div
              style={{
                marginLeft: 'auto',
                whiteSpace: 'nowrap',
                borderRadius: 999,
                background: `${brandColor}18`,
                color: brandColor,
                padding: '7px 10px',
                fontSize: 11,
                fontWeight: 900,
              }}
            >
              TrayLoop - No marketplace fees
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'sticky',
          top: controlBarTop,
          zIndex: 20,
          background: CREAM,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <div
          style={{
            maxWidth: PAGE_MAX_WIDTH,
            margin: '0 auto',
            padding: isMobile ? '10px 14px' : '10px 24px',
            display: 'grid',
            gap: 10,
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile
                ? '1fr'
                : stackDesktopControls
                  ? 'minmax(0,1.15fr) minmax(180px,0.95fr) minmax(140px,0.8fr)'
                  : 'minmax(0,1.1fr) minmax(180px,0.9fr) minmax(140px,0.78fr) minmax(220px,1.25fr) auto',
              gap: 10,
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                borderRadius: 16,
                padding: 4,
                background: '#FFFFFF',
                border: `1px solid ${BORDER}`,
              }}
            >
              {availableServiceModes.map((mode) => {
                const active = serviceType === mode;
                return (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setServiceType(mode)}
                    style={{
                      flex: 1,
                      height: 36,
                      border: 'none',
                      borderRadius: 12,
                      background: active ? INK : 'transparent',
                      color: active ? '#FFFFFF' : INK,
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    {SERVICE_MODE_LABELS[mode]}
                  </button>
                );
              })}
            </div>
            <div
              style={{
                height: 44,
                borderRadius: 14,
                border: `1px solid ${BORDER}`,
                background: '#FFFFFF',
                padding: '0 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              <span>
                {formatDisplayDate(eventDate)}, {formatDisplayTime(eventTime)}
              </span>
              <span style={{ color: MUTED }}>v</span>
            </div>
            <div
              style={{
                height: 44,
                borderRadius: 14,
                border: `1px solid ${BORDER}`,
                background: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 10px',
                gap: 8,
              }}
            >
              <button
                type="button"
                onClick={() => setHeadcount((current) => clampHeadcount(current - 5))}
                style={{
                  width: 26,
                  height: 26,
                  border: 'none',
                  borderRadius: 999,
                  background: '#F5F5F4',
                }}
              >
                -
              </button>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 900 }}>{headcount} guests</div>
              </div>
              <button
                type="button"
                onClick={() => setHeadcount((current) => clampHeadcount(current + 5))}
                style={{
                  width: 26,
                  height: 26,
                  border: 'none',
                  borderRadius: 999,
                  background: '#F5F5F4',
                }}
              >
                +
              </button>
            </div>
            {!stackDesktopControls ? (
              <div style={{ position: 'relative' }}>
                <input
                  className="storefront-field"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder={
                    serviceType === 'delivery' ? 'Address' : 'Optional delivery address'
                  }
                  style={{
                    width: '100%',
                    height: 44,
                    boxSizing: 'border-box',
                    borderRadius: 14,
                    border: `1px solid ${BORDER}`,
                    background: '#FFFFFF',
                    padding: '0 98px 0 14px',
                    fontSize: 12,
                  }}
                />
                {address && serviceType === 'delivery' ? (
                  <span
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 8,
                      borderRadius: 999,
                      background: '#EAF8EF',
                      color: '#166534',
                      padding: '6px 9px',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    In zone
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>
          {stackDesktopControls ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
              <div style={{ position: 'relative' }}>
                <input
                  className="storefront-field"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder={serviceType === 'delivery' ? 'Address' : 'Optional delivery address'}
                  style={{
                    width: '100%',
                    height: 44,
                    boxSizing: 'border-box',
                    borderRadius: 14,
                    border: `1px solid ${BORDER}`,
                    background: '#FFFFFF',
                    padding: '0 98px 0 14px',
                    fontSize: 12,
                  }}
                />
                {address && serviceType === 'delivery' ? (
                  <span
                    style={{
                      position: 'absolute',
                      right: 10,
                      top: 8,
                      borderRadius: 999,
                      background: '#EAF8EF',
                      color: '#166534',
                      padding: '6px 9px',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    In zone
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
          {isMobile ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 10 }}>
              <input
                className="storefront-field"
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                style={{
                  height: 40,
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  padding: '0 12px',
                  background: '#FFFFFF',
                }}
              />
              <input
                className="storefront-field"
                type="time"
                value={eventTime}
                onChange={(event) => setEventTime(event.target.value)}
                style={{
                  height: 40,
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  padding: '0 12px',
                  background: '#FFFFFF',
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
      <div
        style={{
          maxWidth: PAGE_MAX_WIDTH,
          margin: '0 auto',
          padding: isMobile ? '18px 14px 0' : isLaptop ? '20px 18px 0' : '26px 24px 0',
          overflowX: 'clip',
        }}
      >
        {searchParams.get('checkout') && !error ? (
          <div style={{ marginBottom: 18 }}>
            <ReturnedCheckoutBanner
              checkoutState={searchParams.get('checkout')!}
              returnedOrderNumber={searchParams.get('orderNumber')}
              paymentStatus={returnedPaymentStatus}
              paymentStatusError={paymentStatusError}
              retryingCheckout={retryingCheckout}
              onRetry={handleRetryCheckout}
            />
          </div>
        ) : null}
        {error ? (
          <div
            style={{
              marginBottom: 18,
              border: '1px solid #FECACA',
              background: '#FEF2F2',
              color: '#B91C1C',
              borderRadius: 18,
              padding: '14px 16px',
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800 }}>{error}</div>
            {fieldErrors.length > 0 ? (
              <ul style={{ margin: '8px 0 0', paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>
                {fieldErrors.map((fieldError) => (
                  <li key={`${fieldError.field}-${fieldError.message}`}>
                    {fieldError.field}: {fieldError.message}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: layoutColumns,
            gap: isMobile ? 18 : 20,
            alignItems: 'start',
            minWidth: 0,
          }}
        >
          {showDesktopSidebar ? (
            <aside style={{ position: 'sticky', top: sidebarTop, display: 'grid', gap: 18 }}>
              <div
                style={{
                  borderRadius: 22,
                  border: `1px solid ${BORDER}`,
                  background: '#FFFFFF',
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 900,
                    color: MUTED,
                    marginBottom: 12,
                  }}
                >
                  Browse menu
                </div>
                <div style={{ display: 'grid', gap: 8 }}>
                  {menuSections.map((section) => {
                    const active = activeCategory === section.id;
                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => jumpToSection(section.id)}
                        style={{
                          width: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          height: 42,
                          padding: '0 12px',
                          borderRadius: 14,
                          border: active ? 'none' : `1px solid ${BORDER}`,
                          background: active ? INK : '#FFFFFF',
                          color: active ? '#FFFFFF' : INK,
                          fontSize: 13,
                          fontWeight: 800,
                          textAlign: 'left',
                        }}
                      >
                        <span>{section.name}</span>
                        <span style={{ fontSize: 11, opacity: active ? 0.9 : 0.6 }}>
                          {section.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>
          ) : null}
          <div style={{ minWidth: 0, overflow: 'hidden' }}>
            {showCategoryChips ? (
              <div
                style={{
                  marginBottom: 14,
                  display: 'flex',
                  gap: 8,
                  overflowX: 'auto',
                  paddingBottom: 2,
                }}
                className="storefront-scrollbar"
              >
                {menuSections.map((section) => {
                  const active = activeCategory === section.id;
                  return (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => jumpToSection(section.id)}
                      style={{
                        flex: '0 0 auto',
                        height: 38,
                        padding: '0 14px',
                        borderRadius: 999,
                        border: active ? 'none' : `1px solid ${BORDER}`,
                        background: active ? INK : '#FFFFFF',
                        color: active ? '#FFFFFF' : INK,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      {section.name}
                    </button>
                  );
                })}
              </div>
            ) : null}
            <div style={{ display: 'grid', gap: isMobile ? 28 : 40 }}>
              {menuSections.map((section, sectionIndex) => (
                <section
                  key={section.id}
                  ref={(node) => {
                    sectionRefs.current[section.id] = node;
                  }}
                  style={{ scrollMarginTop: isMobile ? 210 : 248, overflow: 'hidden' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      gap: 16,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <div
                        style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}
                      >
                        <h2
                          style={{
                            margin: 0,
                            fontFamily: displayFontFamily,
                            fontSize: isMobile ? 22 : 26,
                            lineHeight: 1,
                          }}
                        >
                          {section.name}
                        </h2>
                        <span style={{ fontSize: 12, fontWeight: 800, color: MUTED }}>
                          {section.count} items
                        </span>
                      </div>
                      {section.description ? (
                        <p
                          style={{
                            margin: '8px 0 0',
                            fontSize: 12,
                            lineHeight: 1.5,
                            color: MUTED,
                          }}
                        >
                          {section.description}
                        </p>
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                      <button
                        type="button"
                        onClick={() => jumpToSection(section.id)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: MUTED,
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        See All
                      </button>
                      {!isMobile ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <button
                            type="button"
                            onClick={() => scrollMenuRow(section.id, 'left')}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              border: `1px solid ${BORDER}`,
                              background: '#FFFFFF',
                              fontSize: 14,
                              fontWeight: 900,
                            }}
                          >
                            ‹
                          </button>
                          <button
                            type="button"
                            onClick={() => scrollMenuRow(section.id, 'right')}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              border: `1px solid ${BORDER}`,
                              background: '#FFFFFF',
                              fontSize: 14,
                              fontWeight: 900,
                            }}
                          >
                            ›
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      ref={(node) => {
                        rowRefs.current[section.id] = node;
                      }}
                      className="storefront-scrollbar"
                      style={{
                        display: 'flex',
                        gap: isMobile ? 12 : 14,
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        paddingRight: isMobile ? 18 : 28,
                        paddingBottom: 4,
                        minWidth: 0,
                      }}
                    >
                    {section.packages.map((pkg) => {
                      const quantity = selectedPkgs[pkg.id] ?? 0;
                      const price = pkg.pricePerHead * headcount;
                      return (
                        <article
                          key={pkg.id}
                          style={{
                            flex: '0 0 auto',
                            width: isMobile ? 184 : isLaptop ? 228 : 244,
                            minHeight: isMobile ? 248 : isLaptop ? 292 : 304,
                            borderRadius: 24,
                            border: `1px solid ${BORDER}`,
                            background: '#FFFFFF',
                            overflow: 'hidden',
                            display: 'grid',
                            gridTemplateRows: isMobile ? '108px 1fr' : isLaptop ? '170px 1fr' : '184px 1fr',
                            scrollSnapAlign: 'start',
                          }}
                        >
                          <div style={{ background: pkg.imageUrl ? '#F5F5F4' : undefined }}>
                            {pkg.imageUrl ? (
                              <img
                                src={pkg.imageUrl}
                                alt={pkg.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              placeholderCardImage(pkg.name, brandColor)
                            )}
                          </div>
                          <div
                            style={{
                              padding: isMobile ? 12 : 14,
                              display: 'grid',
                              gap: 8,
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  flexWrap: 'wrap',
                                }}
                              >
                                <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 900, lineHeight: 1.1 }}>
                                  {pkg.name}
                                </div>
                                {pkg.upsellFeatured ? (
                                  <span
                                    style={{
                                      borderRadius: 999,
                                      background: '#FFF7ED',
                                      color: '#C2410C',
                                      padding: '3px 7px',
                                      fontSize: 8,
                                      fontWeight: 900,
                                    }}
                                  >
                                    Popular
                                  </span>
                                ) : null}
                              </div>
                              <div style={{ marginTop: 6, fontSize: 10, color: MUTED }}>
                                Serves {pkg.minimumHeadcount ?? headcount}
                                {merchant.rating && merchant.reviewCount
                                  ? ` • ${merchant.rating.toFixed(1)}`
                                  : ''}
                              </div>
                              {pkg.description ? (
                                <div
                                  style={{
                                    marginTop: 6,
                                    fontSize: 11,
                                    lineHeight: 1.45,
                                    color: MUTED,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {pkg.description}
                                </div>
                              ) : null}
                            </div>
                            <div
                              style={{
                                marginTop: 'auto',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                              }}
                            >
                              <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 900 }}>
                                {formatCurrencyAmount(price)}
                              </div>
                              {quantity > 0 ? (
                                <QuantityStepper
                                  quantity={quantity}
                                  compact={isMobile}
                                  onDecrease={() => updatePackageQuantity(pkg.id, quantity - 1)}
                                  onIncrease={() => updatePackageQuantity(pkg.id, quantity + 1)}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updatePackageQuantity(pkg.id, 1)}
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 999,
                                    border: `2px solid ${INK}`,
                                    background: '#FFFFFF',
                                    color: INK,
                                    fontSize: 18,
                                    fontWeight: 900,
                                  }}
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    </div>
                  </div>
                  {!showDesktopCart && sectionIndex === 0 ? (
                    <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
                      {smartUpsellCard}
                      {oftenAddedRow}
                      {recurringCard}
                    </div>
                  ) : null}
                </section>
              ))}
              {filteredAddOns.length > 0 ? (
                <section
                  ref={(node) => {
                    sectionRefs.current.extras = node;
                  }}
                  style={{ scrollMarginTop: isMobile ? 210 : 248, overflow: 'hidden' }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 16,
                      marginBottom: 14,
                    }}
                  >
                    <h2
                      style={{
                        margin: 0,
                        fontFamily: displayFontFamily,
                        fontSize: isMobile ? 22 : 26,
                        lineHeight: 1,
                      }}
                    >
                      Extras
                    </h2>
                    {!isMobile ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => scrollMenuRow('extras', 'left')}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 999,
                            border: `1px solid ${BORDER}`,
                            background: '#FFFFFF',
                            fontSize: 14,
                            fontWeight: 900,
                          }}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          onClick={() => scrollMenuRow('extras', 'right')}
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 999,
                            border: `1px solid ${BORDER}`,
                            background: '#FFFFFF',
                            fontSize: 14,
                            fontWeight: 900,
                          }}
                        >
                          ›
                        </button>
                      </div>
                    ) : null}
                  </div>
                  <div style={{ overflow: 'hidden' }}>
                    <div
                      ref={(node) => {
                        rowRefs.current.extras = node;
                      }}
                      className="storefront-scrollbar"
                      style={{
                        display: 'flex',
                        gap: isMobile ? 12 : 14,
                        overflowX: 'auto',
                        scrollSnapType: 'x mandatory',
                        paddingRight: isMobile ? 18 : 28,
                        paddingBottom: 4,
                        minWidth: 0,
                      }}
                    >
                    {filteredAddOns.map((addOn) => {
                      const quantity = selectedAddOnIds[addOn.id] ?? 0;
                      return (
                        <article
                          key={addOn.id}
                          style={{
                            flex: '0 0 auto',
                            width: isMobile ? 184 : isLaptop ? 228 : 244,
                            minHeight: isMobile ? 248 : isLaptop ? 292 : 304,
                            borderRadius: 24,
                            border: `1px solid ${BORDER}`,
                            background: '#FFFFFF',
                            overflow: 'hidden',
                            display: 'grid',
                            gridTemplateRows: isMobile ? '108px 1fr' : isLaptop ? '170px 1fr' : '184px 1fr',
                            scrollSnapAlign: 'start',
                          }}
                        >
                          <div style={{ background: addOn.imageUrl ? '#F5F5F4' : undefined }}>
                            {addOn.imageUrl ? (
                              <img
                                src={addOn.imageUrl}
                                alt={addOn.name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              placeholderCardImage(addOn.name, brandColor)
                            )}
                          </div>
                          <div style={{ minWidth: 0, display: 'grid', gap: 8, padding: isMobile ? 12 : 14 }}>
                            <div>
                              <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 900 }}>{addOn.name}</div>
                              {addOn.description ? (
                                <div
                                  style={{
                                    marginTop: 6,
                                    fontSize: 11,
                                    lineHeight: 1.45,
                                    color: MUTED,
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                    overflow: 'hidden',
                                  }}
                                >
                                  {addOn.description}
                                </div>
                              ) : null}
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 12,
                              }}
                            >
                              <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 900 }}>
                                {formatCurrencyAmount(addOn.price)}
                              </div>
                              {quantity > 0 ? (
                                <QuantityStepper
                                  quantity={quantity}
                                  compact={isMobile}
                                  onDecrease={() => updateAddOnQuantity(addOn.id, quantity - 1)}
                                  onIncrease={() => updateAddOnQuantity(addOn.id, quantity + 1)}
                                />
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => updateAddOnQuantity(addOn.id, 1)}
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 999,
                                    border: `2px solid ${INK}`,
                                    background: '#FFFFFF',
                                    color: INK,
                                    fontSize: 18,
                                    fontWeight: 900,
                                  }}
                                >
                                  +
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      );
                    })}
                    </div>
                  </div>
                </section>
              ) : null}
              <section
                style={{
                  borderRadius: 24,
                  border: `1px solid ${BORDER}`,
                  background: '#FFFFFF',
                  padding: isMobile ? 18 : 22,
                }}
              >
                <div style={{ display: 'grid', gap: 6 }}>
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: displayFontFamily,
                      fontSize: isMobile ? 24 : 28,
                      lineHeight: 1,
                    }}
                  >
                    Tell us about your event
                  </h2>
                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: MUTED }}>
                    These details stay inside the cart so the merchant can confirm timing, delivery,
                    and any recurring schedule.
                  </p>
                </div>
                <div
                  style={{
                    marginTop: 18,
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                    gap: 12,
                  }}
                >
                  <input
                    className="storefront-field"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="First name"
                    style={{
                      height: 46,
                      borderRadius: 14,
                      border: `1px solid ${BORDER}`,
                      padding: '0 14px',
                      fontSize: 13,
                    }}
                  />
                  <input
                    className="storefront-field"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="Last name"
                    style={{
                      height: 46,
                      borderRadius: 14,
                      border: `1px solid ${BORDER}`,
                      padding: '0 14px',
                      fontSize: 13,
                    }}
                  />
                  <input
                    className="storefront-field"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Email"
                    style={{
                      height: 46,
                      borderRadius: 14,
                      border: `1px solid ${BORDER}`,
                      padding: '0 14px',
                      fontSize: 13,
                    }}
                  />
                  <input
                    className="storefront-field"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder="Phone"
                    style={{
                      height: 46,
                      borderRadius: 14,
                      border: `1px solid ${BORDER}`,
                      padding: '0 14px',
                      fontSize: 13,
                    }}
                  />
                  {serviceType === 'delivery' ? (
                    <>
                      <input
                        className="storefront-field"
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        placeholder="City"
                        style={{
                          height: 46,
                          borderRadius: 14,
                          border: `1px solid ${BORDER}`,
                          padding: '0 14px',
                          fontSize: 13,
                        }}
                      />
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                          gap: 12,
                        }}
                      >
                        <input
                          className="storefront-field"
                          value={state}
                          onChange={(event) => setState(event.target.value)}
                          placeholder="State"
                          style={{
                            height: 46,
                            borderRadius: 14,
                            border: `1px solid ${BORDER}`,
                            padding: '0 14px',
                            fontSize: 13,
                          }}
                        />
                        <input
                          className="storefront-field"
                          value={zipCode}
                          onChange={(event) => setZipCode(event.target.value)}
                          placeholder="Zip"
                          style={{
                            height: 46,
                            borderRadius: 14,
                            border: `1px solid ${BORDER}`,
                            padding: '0 14px',
                            fontSize: 13,
                          }}
                        />
                      </div>
                    </>
                  ) : null}
                  <input
                    className="storefront-field"
                    value={companyName}
                    onChange={(event) => setCompanyName(event.target.value)}
                    placeholder="Company / event name (optional)"
                    style={{
                      height: 46,
                      borderRadius: 14,
                      border: `1px solid ${BORDER}`,
                      padding: '0 14px',
                      fontSize: 13,
                      gridColumn: isMobile ? 'auto' : '1 / span 2',
                    }}
                  />
                  <textarea
                    className="storefront-field"
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
                    placeholder="Any setup notes, delivery instructions, or dietary questions?"
                    style={{
                      minHeight: 112,
                      borderRadius: 16,
                      border: `1px solid ${BORDER}`,
                      padding: '14px',
                      fontSize: 13,
                      resize: 'vertical',
                      gridColumn: isMobile ? 'auto' : '1 / span 2',
                    }}
                  />
                </div>
              </section>
            </div>
          </div>
          {showDesktopCart ? (
            <aside style={{ position: 'sticky', top: sidebarTop, display: 'grid', gap: 14 }}>
              <div
                style={{
                  borderRadius: 26,
                  overflow: 'hidden',
                  border: `1px solid ${BORDER}`,
                  background: '#FFFFFF',
                  boxShadow: '0 18px 44px rgba(26,22,18,0.08)',
                }}
              >
                <div style={{ background: INK, color: '#FFFFFF', padding: '18px 18px 16px' }}>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: '#FBBF24',
                    }}
                  >
                    Your order
                  </div>
                  <div
                    style={{
                      marginTop: 8,
                      fontFamily: displayFontFamily,
                      fontSize: 28,
                      lineHeight: 1,
                    }}
                  >
                    {merchant.name}
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      fontSize: 12,
                      lineHeight: 1.6,
                      color: 'rgba(255,255,255,0.8)',
                    }}
                  >
                    {itemsInCart} items - {formatDisplayDate(eventDate)} -{' '}
                    {formatDisplayTime(eventTime)} - {SERVICE_MODE_LABELS[serviceType]} -{' '}
                    {headcount} guests
                  </div>
                </div>
                <div style={{ padding: isTablet ? 16 : 18, display: 'grid', gap: 14 }}>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {selectedPkgList.length === 0 && selectedAddOnList.length === 0 ? (
                      <div
                        style={{
                          borderRadius: 18,
                          border: `1px dashed ${BORDER}`,
                          padding: 16,
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: MUTED,
                        }}
                      >
                        Add a package to start building the order. The cart updates totals, smart
                        upsells, and recurring savings live.
                      </div>
                    ) : (
                      <>
                        {selectedPkgList.map((item) => (
                          <div
                            key={item.packageId}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'auto minmax(0,1fr) auto',
                              gap: 12,
                              alignItems: 'center',
                            }}
                          >
                            <QuantityStepper
                              quantity={item.quantity}
                              compact
                              onDecrease={() => updatePackageQuantity(item.packageId, item.quantity - 1)}
                              onIncrease={() => updatePackageQuantity(item.packageId, item.quantity + 1)}
                            />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800 }}>{item.name}</div>
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: 11,
                                  lineHeight: 1.5,
                                  color: MUTED,
                                }}
                              >
                                {headcount} guests - package
                              </div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 900 }}>
                              {formatCurrencyAmount(item.total)}
                            </div>
                          </div>
                        ))}
                        {selectedAddOnList.map((item) => (
                          <div
                            key={item.addOnId}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'auto minmax(0,1fr) auto',
                              gap: 12,
                              alignItems: 'center',
                            }}
                          >
                            <QuantityStepper
                              quantity={item.quantity}
                              compact
                              onDecrease={() => updateAddOnQuantity(item.addOnId, item.quantity - 1)}
                              onIncrease={() => updateAddOnQuantity(item.addOnId, item.quantity + 1)}
                            />
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800 }}>{item.name}</div>
                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: 11,
                                  lineHeight: 1.5,
                                  color: MUTED,
                                }}
                              >
                                Add-on
                              </div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 900 }}>
                              {formatCurrencyAmount(item.total)}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  {smartUpsellCard}
                  {oftenAddedRow}
                  {recurringCard}
                  <div
                    style={{
                      borderTop: `1px solid ${BORDER}`,
                      paddingTop: 12,
                      display: 'grid',
                      gap: 10,
                    }}
                  >
                    <Row label="Subtotal" value={formatCurrencyAmount(subtotalCents)} />
                    <Row
                      label="Recurring discount"
                      value={
                        recurringEnabled ? `-${formatCurrencyAmount(recurringDiscountCents)}` : '-'
                      }
                      valueColor="#E85618"
                    />
                    <Row
                      label="Coordination & processing"
                      value={
                        coordinationFeeCents > 0 ? formatCurrencyAmount(coordinationFeeCents) : '-'
                      }
                    />
                    <div
                      style={{
                        borderRadius: 18,
                        border: `2px solid ${INK}`,
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 11,
                            fontWeight: 900,
                            textTransform: 'uppercase',
                            letterSpacing: '0.08em',
                            color: MUTED,
                          }}
                        >
                          Total
                        </div>
                        <div style={{ marginTop: 4, fontSize: 14, fontWeight: 800, color: MUTED }}>
                          {itemsInCart} items - {headcount} guests
                        </div>
                      </div>
                      <div style={{ fontSize: isTablet ? 28 : 32, lineHeight: 1, fontWeight: 900 }}>
                        {formatCurrencyAmount(displayTotalCents)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    style={{
                      height: 50,
                      borderRadius: 16,
                      border: 'none',
                      background: canSubmit && !submitting ? '#E85618' : '#FDBA74',
                      color: '#FFFFFF',
                      fontSize: 15,
                      fontWeight: 900,
                    }}
                  >
                    {submitting ? 'Preparing order...' : 'Place Order ->'}
                  </button>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 8,
                      fontSize: 11,
                      color: MUTED,
                    }}
                  >
                    <span>No charge now</span>
                    <span>Secure</span>
                    <span>Replies fast</span>
                  </div>
                  <div
                    style={{
                      borderTop: `1px solid ${BORDER}`,
                      paddingTop: 12,
                      fontSize: 12,
                      lineHeight: 1.7,
                      color: MUTED,
                    }}
                  >
                    <div>{deliverySummary}</div>
                    <div style={{ marginTop: 6 }}>{merchantContact}</div>
                  </div>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
        <div style={{ height: showBottomCartBar ? 112 : 0 }} />
      </div>
      {showBottomCartBar ? (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 40,
            padding: `12px 14px calc(12px + env(safe-area-inset-bottom))`,
            background: 'rgba(255,255,255,0.96)',
            backdropFilter: 'blur(12px)',
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <div
            style={{
              maxWidth: 480,
              margin: '0 auto',
              borderRadius: 22,
              background: INK,
              color: '#FFFFFF',
              padding: 14,
              display: 'grid',
              gap: 12,
              boxShadow: '0 -10px 30px rgba(26,22,18,0.18)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    color: '#FBBF24',
                  }}
                >
                  Total - {itemsInCart} items - {headcount} guests
                </div>
                <div style={{ marginTop: 4, fontSize: 30, lineHeight: 1, fontWeight: 900 }}>
                  {formatCurrencyAmount(displayTotalCents)}
                </div>
              </div>
              {recurringEnabled ? (
                <div
                  style={{ fontSize: 11, fontWeight: 800, color: '#FCD34D', textAlign: 'right' }}
                >
                  Save {formatCurrencyAmount(projectedRecurringSavingsThreeMonths)} in 3 months
                </div>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={!canSubmit || submitting}
              style={{
                height: 48,
                borderRadius: 16,
                border: 'none',
                background: canSubmit && !submitting ? '#E85618' : '#FDBA74',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              {submitting ? 'Preparing order...' : 'Place Order ->'}
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
}
