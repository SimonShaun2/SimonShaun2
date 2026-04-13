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
type RecurringPresetId = 'weekly' | 'biweekly' | 'monthly';
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
type StorefrontPlanKey = 'starter' | 'pro' | 'growth' | 'launch' | 'momentum' | 'engine';
type ItemModalState =
  | { type: 'package'; id: string }
  | { type: 'addon'; id: string }
  | null;

const SERVICE_MODE_LABELS: Record<StorefrontServiceMode, string> = {
  delivery: 'Delivery',
  pickup: 'Pickup',
  full_service: 'Full Service',
  on_site: 'On-Site',
  food_truck: 'Food Truck',
};
const PAGE_MAX_WIDTH = 1180;
const BRAND_FALLBACK = '#E85618';
const INK = '#1A1612';
const CREAM = '#F9F5EF';
const BORDER = '#E7E5E4';
const MUTED = '#78716C';
const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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
function hexToSoftBackground(hex: string) {
  const normalized = hex.replace('#', '').trim();
  if (normalized.length !== 6) return 'rgba(232, 86, 24, 0.12)';
  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, 0.12)`;
}
function getInitialDate() {
  const next = new Date();
  next.setDate(next.getDate() + 2);
  return formatDateInput(next);
}
function getInitialTime() {
  return '11:30';
}
function getWeekdayIndex(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return new Date().getDay();
  return date.getDay();
}
function getAvailableTimeOptions() {
  const options: Array<{ value: string; label: string }> = [];
  for (let hour = 6; hour <= 22; hour += 1) {
    for (let minute = 0; minute < 60; minute += 15) {
      const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
      options.push({ value, label: formatDisplayTime(value) });
    }
  }
  return options;
}
function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}
function addMonths(date: Date, offset: number) {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}
function buildCalendarDays(dateString: string) {
  const selectedDate = new Date(`${dateString}T12:00:00`);
  const monthStart = startOfMonth(Number.isNaN(selectedDate.getTime()) ? new Date() : selectedDate);
  const firstWeekday = monthStart.getDay();
  const gridStart = new Date(monthStart);
  gridStart.setDate(monthStart.getDate() - firstWeekday);

  return Array.from({ length: 35 }, (_, index) => {
    const day = new Date(gridStart);
    day.setDate(gridStart.getDate() + index);
    return {
      key: day.toISOString(),
      date: day,
      value: formatDateInput(day),
      isCurrentMonth: day.getMonth() === monthStart.getMonth(),
    };
  });
}
function getRecurringPresets(): RecurringPreset[] {
  return [
    { id: 'weekly', label: 'Repeat every week', deliveriesPerMonth: 4, apiInterval: 'weekly' },
    {
      id: 'biweekly',
      label: 'Repeat every 2 weeks',
      deliveriesPerMonth: 2,
      apiInterval: 'biweekly',
    },
    { id: 'monthly', label: 'Repeat every month', deliveriesPerMonth: 1, apiInterval: 'monthly' },
  ];
}
function getWeekdayName(dateString: string) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toLocaleDateString('en-US', { weekday: 'long' });
}
function buildUpcomingRecurringDates(startDate: string, preset: RecurringPreset, weekdays: number[]) {
  const start = new Date(`${startDate}T12:00:00`);
  if (Number.isNaN(start.getTime())) return [] as Array<{ date: Date }>;
  if (preset.apiInterval === 'monthly') {
    return Array.from({ length: 3 }, (_, index) => {
      const next = new Date(start);
      next.setMonth(start.getMonth() + index);
      return { date: next };
    });
  }

  const activeWeekdays = weekdays.length > 0 ? [...weekdays].sort((a, b) => a - b) : [start.getDay()];
  const deliveries: Array<{ date: Date }> = [];
  const cursor = new Date(start);

  while (deliveries.length < 3) {
    const diffDays = Math.floor((cursor.getTime() - start.getTime()) / 86_400_000);
    const weekOffset = Math.floor(diffDays / 7);
    const intervalMatches = preset.apiInterval === 'weekly' ? true : weekOffset % 2 === 0;

    if (cursor >= start && activeWeekdays.includes(cursor.getDay()) && intervalMatches) {
      deliveries.push({ date: new Date(cursor) });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  return deliveries;
}
function getDisplayFontFamily(displayFont: DisplayFontKey | null | undefined) {
  if (displayFont === 'fraunces') return 'var(--font-display-fraunces), Georgia, serif';
  if (displayFont === 'inter') return 'var(--font-body), Inter, sans-serif';
  return 'var(--font-display-bricolage), var(--font-body), sans-serif';
}
function buildAddressSummary(address: string, city: string, state: string, zipCode: string) {
  return [address, city, state, zipCode].filter(Boolean).join(', ');
}
function normalizeStorefrontPlan(plan: string | null | undefined): StorefrontPlanKey {
  const normalized = (plan ?? '').trim().toLowerCase();
  if (normalized === 'momentum') return 'momentum';
  if (normalized === 'engine') return 'engine';
  if (normalized === 'launch') return 'launch';
  if (normalized === 'pro') return 'pro';
  if (normalized === 'growth') return 'growth';
  return 'starter';
}
function getPackageSubline(pkg: StorefrontPackage) {
  const includeCount = pkg.includes.length;
  if (includeCount === 0) return pkg.description ?? 'Built for premium catering orders.';
  const previewItems = pkg.includes
    .slice(0, 3)
    .map((item) => item.name)
    .join(' · ');
  return includeCount > 3 ? `${previewItems} + more` : previewItems;
}
function pickFeaturedPackage(sections: MenuSection[], headcount: number) {
  const packages = sections.flatMap((section) => section.packages);
  return (
    packages.find((pkg) => pkg.upsellFeatured) ??
    packages.find((pkg) => {
      const minimum = pkg.minimumHeadcount ?? 1;
      const maximum = pkg.maximumHeadcount ?? 1000;
      return headcount >= minimum && headcount <= maximum;
    }) ??
    packages[0] ??
    null
  );
}
function getRecommendedAddOns(addOns: StorefrontAddOn[]) {
  return [...addOns]
    .sort((a, b) => {
      const featuredDiff = Number(Boolean(b.upsellFeatured)) - Number(Boolean(a.upsellFeatured));
      if (featuredDiff !== 0) return featuredDiff;
      return (b.upsellPriority ?? 0) - (a.upsellPriority ?? 0);
    })
    .slice(0, 3);
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
  const recurringCalendarRef = useRef<HTMLDivElement | null>(null);

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
  const [headcountInput, setHeadcountInput] = useState('10');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [selectedPkgs, setSelectedPkgs] = useState<Record<string, number>>({});
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<Record<string, number>>({});
  const [checkoutStep, setCheckoutStep] = useState<'menu' | 'details'>('menu');
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
  const [itemModal, setItemModal] = useState<ItemModalState>(null);
  const [modalDraftQuantity, setModalDraftQuantity] = useState(1);
  const recurringPresets = useMemo(() => getRecurringPresets(), []);
  const availableTimeOptions = useMemo(() => getAvailableTimeOptions(), []);
  const [recurringEnabled, setRecurringEnabled] = useState(false);
  const [recurringPreset, setRecurringPreset] = useState<RecurringPresetId>(
    recurringPresets[0]?.id ?? 'weekly',
  );
  const [recurringWeekdays, setRecurringWeekdays] = useState<number[]>([getWeekdayIndex(getInitialDate())]);
  const [recurringCalendarOpen, setRecurringCalendarOpen] = useState(false);
  const [recurringCalendarMonth, setRecurringCalendarMonth] = useState(() =>
    startOfMonth(new Date(`${getInitialDate()}T12:00:00`)),
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
  const hasPublishedLocation = data.locations.length > 0;
  const selectedLocation =
    data.locations.find((location) => location.slug === selectedLocationSlug) ?? data.locations[0];
  const brandColor = merchant.brandColor || BRAND_FALLBACK;
  const displayFontFamily = getDisplayFontFamily(
    (merchant.displayFont ?? 'bricolage') as DisplayFontKey,
  );
  const currentPlan = normalizeStorefrontPlan(merchant.currentPlan);
  const recurringFeatureAvailable =
    currentPlan === 'pro' ||
    currentPlan === 'growth' ||
    currentPlan === 'momentum' ||
    currentPlan === 'engine';
  const recurringActive = recurringFeatureAvailable && recurringEnabled;
  if (!hasPublishedLocation || !selectedLocation) {
    return (
      <section
        style={{
          maxWidth: PAGE_MAX_WIDTH,
          margin: '0 auto',
          padding: isMobile ? '32px 20px 56px' : '48px 24px 72px',
        }}
      >
        <div
          style={{
            borderRadius: 32,
            border: `1px solid ${BORDER}`,
            background: '#FFFFFF',
            boxShadow: '0 24px 80px rgba(26,22,18,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: isMobile ? 24 : 32,
              background: `linear-gradient(135deg, ${hexToSoftBackground(brandColor)} 0%, rgba(249,245,239,0.92) 100%)`,
              borderBottom: `1px solid ${BORDER}`,
              display: 'grid',
              gap: 14,
            }}
          >
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: brandColor,
              }}
            >
              Storefront unavailable
            </div>
            <div
              style={{
                fontFamily: displayFontFamily,
                fontSize: isMobile ? 34 : 44,
                lineHeight: 0.96,
                fontWeight: 900,
                maxWidth: 620,
              }}
            >
              {merchant.name} needs one published location before ordering can open.
            </div>
            <div style={{ maxWidth: 640, fontSize: 16, lineHeight: 1.6, color: MUTED }}>
              This storefront menu is live, but the merchant has not attached a pickup or delivery
              location yet. Once a location is published, this page will open for ordering
              automatically.
            </div>
          </div>
          <div
            style={{
              padding: isMobile ? 24 : 32,
              display: 'grid',
              gap: 18,
            }}
          >
            <div
              style={{
                borderRadius: 24,
                border: `1px solid ${BORDER}`,
                background: CREAM,
                padding: isMobile ? 18 : 22,
                display: 'grid',
                gap: 10,
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 900, color: INK }}>What’s missing</div>
              <div style={{ display: 'grid', gap: 8, fontSize: 14, color: MUTED }}>
                <div>1. Add at least one live location in the merchant dashboard.</div>
                <div>2. Enable pickup, delivery, or another service mode for that location.</div>
                <div>3. Refresh this storefront and ordering will be available.</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
              <Link
                href="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minHeight: 46,
                  padding: '0 18px',
                  borderRadius: 999,
                  background: INK,
                  color: '#FFFFFF',
                  textDecoration: 'none',
                  fontSize: 14,
                  fontWeight: 800,
                }}
              >
                Browse another storefront
              </Link>
              {merchant.website ? (
                <a
                  href={merchant.website}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 46,
                    padding: '0 18px',
                    borderRadius: 999,
                    border: `1px solid ${BORDER}`,
                    background: '#FFFFFF',
                    color: INK,
                    textDecoration: 'none',
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  Visit merchant website
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    );
  }
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
  const featuredPackage = useMemo(() => pickFeaturedPackage(menuSections, headcount), [headcount, menuSections]);
  const recommendedAddOns = useMemo(() => getRecommendedAddOns(allAddOns), [allAddOns]);
  const primaryUpsell = upsellRecommendations[0] ?? null;
  const modalPackage =
    itemModal?.type === 'package'
      ? allPackages.find((pkg) => pkg.id === itemModal.id) ?? null
      : null;
  const modalAddOn =
    itemModal?.type === 'addon'
      ? allAddOns.find((addOn) => addOn.id === itemModal.id) ?? null
      : null;
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
  const recurringDiscountCents = recurringActive ? Math.round(subtotalCents * 0.05) : 0;
  const coordinationFeeCents = subtotalCents > 0 ? Math.round(subtotalCents * 0.035) : 0;
  const displayTotalCents = Math.max(
    subtotalCents + coordinationFeeCents - recurringDiscountCents,
    0,
  );
  const projectedRecurringSavingsThreeMonths =
    (recurringActive ? recurringDiscountCents : Math.round(subtotalCents * 0.05)) *
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
  const recurringCalendarDays = useMemo(
    () => buildCalendarDays(formatDateInput(recurringCalendarMonth)),
    [recurringCalendarMonth],
  );
  const suggestedOftenAdded = useMemo(
    () => oftenAdded.filter((addOn) => (selectedAddOnIds[addOn.id] ?? 0) === 0).slice(0, 3),
    [oftenAdded, selectedAddOnIds],
  );
  const fallbackUpsell =
    primaryUpsell ??
    (suggestedOftenAdded[0]
      ? {
          addOnId: suggestedOftenAdded[0].id,
          headline: `Add ${suggestedOftenAdded[0].name} to this order?`,
          reason: 'Popular with similar catering orders.',
          recommendationType: 'often_added',
          suggestedQuantity: 1,
          totalPrice: suggestedOftenAdded[0].price,
        }
      : null);
  const modalSuggestedAddOns = useMemo(() => {
    const excludeId = itemModal?.type === 'addon' ? itemModal.id : null;
    const base = suggestedOftenAdded.length > 0 ? suggestedOftenAdded : filteredAddOns;
    return base.filter((addOn) => addOn.id !== excludeId).slice(0, 3);
  }, [filteredAddOns, itemModal, suggestedOftenAdded]);
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
    serviceType === 'pickup'
      ? [selectedLocation.name, selectedLocation.address, selectedLocation.city, selectedLocation.state]
          .filter(Boolean)
          .join(', ')
      : buildAddressSummary(address, city, state, zipCode) || 'Add the event location on the checkout step.';
  const requiresEventAddress = serviceType !== 'pickup';
  const eventLocationLabel =
    serviceType === 'delivery'
      ? 'Delivery address'
      : serviceType === 'food_truck'
        ? 'Food truck location'
        : 'Event location';
  const canProceedToCheckout = Boolean(selectedLocation && itemsInCart > 0);
  const canSubmit = Boolean(
    selectedLocation &&
    itemsInCart > 0 &&
    firstName &&
    lastName &&
    email &&
    (!requiresEventAddress || (address && city && state && zipCode)),
  );
  const showDesktopSidebar = false;
  const showDesktopCart = !isTablet;
  const showCategoryChips = true;
  const showBottomCartBar = !showDesktopCart;
  const layoutColumns = isMobile
    ? '1fr'
    : showDesktopCart
      ? 'minmax(0, 1fr) 320px'
      : '1fr';
  const stackDesktopControls = !isMobile && isCompactDesktop;
  const controlBarTop = isMobile ? 60 : 76;
  const sidebarTop = isMobile ? 110 : stackDesktopControls ? 188 : 154;
  const showBrowseSidebar = checkoutStep === 'menu' && showDesktopSidebar;
  const activeLayoutColumns =
    checkoutStep === 'details'
      ? showDesktopCart
        ? 'minmax(0, 1fr) 320px'
        : '1fr'
      : layoutColumns;
  const stepLabel = checkoutStep === 'menu' ? 'Step 1 of 2' : 'Step 2 of 2';
  const stepTitle = checkoutStep === 'menu' ? 'Build your order' : 'Review and place your order';
  const stepSubtitle =
    checkoutStep === 'menu'
      ? 'Browse the menu, add items, and head to checkout when the order feels right.'
      : 'Finalize the schedule, recurring plan, recommendations, and event details before submitting.';

  useEffect(() => {
    setHeadcountInput(String(headcount));
  }, [headcount]);

  useEffect(() => {
    if (!recurringFeatureAvailable && recurringEnabled) {
      setRecurringEnabled(false);
    }
  }, [recurringEnabled, recurringFeatureAvailable]);

  useEffect(() => {
    if (recurringPreset === 'monthly') return;
    if (recurringWeekdays.length === 0) {
      setRecurringWeekdays([getWeekdayIndex(eventDate)]);
    }
  }, [eventDate, recurringPreset, recurringWeekdays.length]);

  useEffect(() => {
    const selectedDate = new Date(`${eventDate}T12:00:00`);
    if (!Number.isNaN(selectedDate.getTime())) {
      setRecurringCalendarMonth(startOfMonth(selectedDate));
    }
  }, [eventDate]);

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
    if (!recurringCalendarOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        recurringCalendarRef.current &&
        !recurringCalendarRef.current.contains(event.target as Node)
      ) {
        setRecurringCalendarOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setRecurringCalendarOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
    };
  }, [recurringCalendarOpen]);
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
    if (!itemModal) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setItemModal(null);
    };
    const nextQuantity =
      itemModal.type === 'package'
        ? selectedPkgs[itemModal.id] ?? 1
        : selectedAddOnIds[itemModal.id] ?? 1;
    setModalDraftQuantity(Math.max(nextQuantity, 1));
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleEscape);
    };
  }, [itemModal, selectedAddOnIds, selectedPkgs]);
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
    if (!fallbackUpsell) return;
    const currentQuantity = selectedAddOnIds[fallbackUpsell.addOnId] ?? 0;
    updateAddOnQuantity(
      fallbackUpsell.addOnId,
      currentQuantity === 0 ? Math.max(fallbackUpsell.suggestedQuantity, 1) : currentQuantity + 1,
    );
    if (!primaryUpsell) {
      trackEvent('storefront_upsell_added', {
        merchantSlug: merchant.slug,
        addOnId: fallbackUpsell.addOnId,
      });
      return;
    }
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
      addOnId: fallbackUpsell.addOnId,
    });
  }, [
    fallbackUpsell,
    primaryUpsell,
    updateAddOnQuantity,
    selectedAddOnIds,
    headcount,
    selectedLocationSlug,
    merchant.slug,
    upsellSessionKey,
  ]);
  const commitModalSelection = useCallback(() => {
    if (modalPackage) updatePackageQuantity(modalPackage.id, modalDraftQuantity);
    if (modalAddOn) updateAddOnQuantity(modalAddOn.id, modalDraftQuantity);
    setItemModal(null);
  }, [modalAddOn, modalDraftQuantity, modalPackage, updateAddOnQuantity, updatePackageQuantity]);
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
    const selectedPreset =
      recurringPresets.find((preset) => preset.id === recurringPreset) ?? recurringPresets[0];
    return buildUpcomingRecurringDates(eventDate, selectedPreset, recurringWeekdays);
  }, [eventDate, recurringPreset, recurringPresets, recurringWeekdays]);

  const smartUpsellCard = fallbackUpsell ? (
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
          Live AI recommendation
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
        {fallbackUpsell.headline}
      </div>
      {primaryUpsell && showSocialProof ? (
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
          {socialProofAverageLabel ?? formatCurrencyAmount(fallbackUpsell.totalPrice)}
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
            {formatCurrencyAmount(fallbackUpsell.totalPrice)}
          </div>
          <div style={{ fontSize: 11, color: MUTED }}>
            {fallbackUpsell.suggestedQuantity} suggested
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
          Add to this order
        </button>
      </div>
      <div style={{ fontSize: 11, color: MUTED }}>Why this rec? Updated moments ago.</div>
    </div>
  ) : null;
  const recurringCard =
    recurringFeatureAvailable && recurringPresets.length > 0 ? (
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
                Recurring is {recurringActive ? 'on' : 'available'}
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
          {subtotalCents === 0 ? (
            <div style={{ fontSize: 11, color: MUTED }}>
              Add your first item to preview recurring savings on this order.
            </div>
          ) : null}
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
        <div style={{ fontSize: 11, color: MUTED }}>
          Choose your repeat cadence, then pick a start date and time. The next 3 deliveries update below.
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) minmax(170px, 0.8fr)',
            gap: 10,
          }}
        >
          <div style={{ display: 'grid', gap: 6, position: 'relative' }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: MUTED,
              }}
            >
              Repeat starting
            </span>
            <button
              type="button"
              onClick={() => setRecurringCalendarOpen((current) => !current)}
              style={{
                height: 42,
                borderRadius: 14,
                border: `1px solid ${BORDER}`,
                padding: '0 12px',
                background: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              <span>{formatDisplayDate(eventDate)}</span>
              <span style={{ color: MUTED, fontSize: 16, lineHeight: 1 }}>▾</span>
            </button>
            {recurringCalendarOpen ? (
              <div
                ref={recurringCalendarRef}
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  zIndex: 30,
                  width: isMobile ? '100%' : 286,
                  borderRadius: 18,
                  border: `1px solid ${BORDER}`,
                  background: '#FFFFFF',
                  boxShadow: '0 18px 40px rgba(26,22,18,0.12)',
                  padding: 14,
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
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setRecurringCalendarMonth((current) => addMonths(current, -1))}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      border: `1px solid ${BORDER}`,
                      background: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    ‹
                  </button>
                  <div style={{ fontSize: 13, fontWeight: 900 }}>
                    {recurringCalendarMonth.toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => setRecurringCalendarMonth((current) => addMonths(current, 1))}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 999,
                      border: `1px solid ${BORDER}`,
                      background: '#FFFFFF',
                      fontSize: 16,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    ›
                  </button>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    gap: 6,
                    textAlign: 'center',
                    fontSize: 10,
                    fontWeight: 800,
                    color: MUTED,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
                    <span key={label}>{label}</span>
                  ))}
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                    gap: 6,
                  }}
                >
                  {recurringCalendarDays.map((day) => {
                    const active = eventDate === day.value;
                    return (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => {
                          setRecurringEnabled(true);
                          setEventDate(day.value);
                          setRecurringCalendarOpen(false);
                        }}
                        style={{
                          height: 34,
                          borderRadius: 12,
                          border: active ? 'none' : `1px solid ${BORDER}`,
                          background: active ? '#E85618' : '#FFFFFF',
                          color: active ? '#FFFFFF' : day.isCurrentMonth ? INK : '#A8A29E',
                          fontSize: 12,
                          fontWeight: 800,
                          cursor: 'pointer',
                        }}
                      >
                        {day.date.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
          <label style={{ display: 'grid', gap: 6 }}>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: MUTED,
              }}
            >
              At time
            </span>
            <select
              className="storefront-field"
              value={eventTime}
              onChange={(event) => {
                setRecurringEnabled(true);
                setEventTime(event.target.value);
              }}
              style={{
                height: 42,
                borderRadius: 14,
                border: `1px solid ${BORDER}`,
                padding: '0 12px',
                background: '#FFFFFF',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {availableTimeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        {recurringPreset !== 'monthly' ? (
          <div style={{ display: 'grid', gap: 8 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                color: MUTED,
              }}
            >
              Delivery days
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {WEEKDAY_SHORT.map((label, index) => {
                const active = recurringWeekdays.includes(index);
                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setRecurringEnabled(true);
                      setRecurringWeekdays((current) => {
                        if (active) {
                          return current.length > 1 ? current.filter((day) => day !== index) : current;
                        }
                        return [...current, index].sort((a, b) => a - b);
                      });
                    }}
                    style={{
                      height: 34,
                      borderRadius: 999,
                      border: active ? 'none' : `1px solid ${BORDER}`,
                      background: active ? '#1C1917' : '#FFFFFF',
                      color: active ? '#FFFFFF' : INK,
                      padding: '0 12px',
                      fontSize: 11,
                      fontWeight: 800,
                      cursor: 'pointer',
                    }}
                    title={WEEKDAY_LABELS[index]}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 11, color: MUTED }}>
            Monthly repeats use the selected calendar date each month.
          </div>
        )}
        <div style={{ display: 'grid', gap: 8 }}>
          {upcomingDeliveries.map((delivery, index) => (
            <button
              key={delivery.date.toISOString()}
              type="button"
              onClick={() => {
                setRecurringEnabled(true);
                setEventDate(formatDateInput(delivery.date));
              }}
              style={{
                borderRadius: 14,
                background: eventDate === formatDateInput(delivery.date) ? '#FFF7ED' : '#FFFFFF',
                border:
                  eventDate === formatDateInput(delivery.date)
                    ? '1px solid #FDBA74'
                    : `1px solid ${BORDER}`,
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
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
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: MUTED }}>
          ✓ Skip any week · ✓ Edit anytime · ✓ Cancel anytime
        </div>
        {recurringActive ? (
          <div style={{ display: 'grid', gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#C2410C' }}>
              Recurring plan: {recurringPresetDetails?.label ?? 'Repeat weekly'}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                width: 'fit-content',
                borderRadius: 999,
                background: '#FFF7ED',
                border: '1px solid #FB923C',
                color: '#9A3412',
                padding: '7px 12px',
                fontSize: 11,
                fontWeight: 800,
              }}
            >
              Selected start: {formatDisplayDate(eventDate)} at {formatDisplayTime(eventTime)}
            </div>
            {recurringPreset !== 'monthly' ? (
              <div style={{ fontSize: 11, color: MUTED }}>
                Delivery days: {recurringWeekdays.map((day) => WEEKDAY_LABELS[day]).join(', ')}
              </div>
            ) : null}
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
        requiresEventAddress && address && city && state && zipCode
          ? { address, city, state, zipCode, country: 'US' }
          : undefined,
      recurring: recurringActive
        ? {
            interval:
              recurringPresets.find((preset) => preset.id === recurringPreset)?.apiInterval ??
              'weekly',
            preferredDay:
              recurringPreset === 'monthly'
                ? getWeekdayName(eventDate)
                : recurringWeekdays.join(','),
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
                onClick={() => {
                  if (itemsInCart > 0) {
                    setCheckoutStep('details');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    return;
                  }
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
                }}
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
          padding: isMobile ? '8px 14px 0' : '8px 24px 0',
        }}
      >
        <div
          style={{
            borderRadius: isMobile ? 14 : 18,
            background: `linear-gradient(135deg, ${brandColor} 0%, ${INK} 100%)`,
            color: '#FFFFFF',
            padding: isMobile ? '9px 14px' : '10px 16px',
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
                  fontSize: isMobile ? 17 : 18,
                  fontWeight: 900,
                  lineHeight: 1,
                }}
            >
              {merchant.name}
            </div>
            <div style={{ marginTop: 3, fontSize: 10, color: 'rgba(255,255,255,0.82)' }}>
              {merchant.tagline || merchant.description || 'Catering & events, direct from the merchant.'}
            </div>
          </div>
          <div
            style={{
              flexShrink: 0,
              borderRadius: 999,
              background: '#EAF8EF',
              color: '#166534',
              padding: '5px 10px',
              fontSize: 10,
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
            padding: isMobile ? '6px 14px' : '0 24px',
          }}
        >
          <div
            style={{
              minHeight: isMobile ? 38 : 44,
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 10 : 14,
              overflowX: 'auto',
            }}
            className="storefront-scrollbar"
          >
            {trustItems.map((item) => (
              <div key={item.label} style={{ minWidth: 'fit-content', display: 'grid', gap: 2 }}>
                <span
                  style={{
                    fontSize: 8,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    fontWeight: 800,
                    color: MUTED,
                  }}
                >
                  {item.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 800 }}>{item.value}</span>
              </div>
            ))}
            <div
              style={{
                marginLeft: 'auto',
                whiteSpace: 'nowrap',
                borderRadius: 999,
                background: `${brandColor}18`,
                color: brandColor,
                padding: '6px 10px',
                fontSize: 10,
                fontWeight: 900,
              }}
            >
              TrayLoop
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
                : isCompactDesktop
                  ? 'minmax(0,1fr) minmax(170px,0.8fr) minmax(132px,0.7fr) minmax(148px,0.78fr)'
                  : 'minmax(0,1.15fr) minmax(190px,0.85fr) minmax(138px,0.72fr) minmax(156px,0.8fr)',
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
            {!isMobile ? (
              <input
                className="storefront-field"
                type="date"
                value={eventDate}
                onChange={(event) => setEventDate(event.target.value)}
                style={{
                  height: 44,
                  borderRadius: 14,
                  border: `1px solid ${BORDER}`,
                  padding: '0 14px',
                  background: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              />
            ) : null}
            {!isMobile ? (
              <select
                className="storefront-field"
                value={eventTime}
                onChange={(event) => setEventTime(event.target.value)}
                style={{
                  height: 44,
                  borderRadius: 14,
                  border: `1px solid ${BORDER}`,
                  padding: '0 14px',
                  background: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {availableTimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : null}
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
                onClick={() => setHeadcount((current) => clampHeadcount(current - 1))}
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
              <div style={{ textAlign: 'center', minWidth: 84 }}>
                <input
                  value={headcountInput}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  onChange={(event) => {
                    const next = event.target.value.replace(/\D/g, '');
                    setHeadcountInput(next);
                    if (!next) return;
                    setHeadcount(clampHeadcount(Number(next)));
                  }}
                  onBlur={() => {
                    if (!headcountInput) {
                      setHeadcount(1);
                      setHeadcountInput('1');
                      return;
                    }
                    const normalized = clampHeadcount(Number(headcountInput));
                    setHeadcount(normalized);
                    setHeadcountInput(String(normalized));
                  }}
                  style={{
                    width: '100%',
                    border: 'none',
                    background: 'transparent',
                    textAlign: 'center',
                    fontSize: 13,
                    fontWeight: 900,
                    color: INK,
                    outline: 'none',
                  }}
                />
                </div>
              <button
                type="button"
                onClick={() => setHeadcount((current) => clampHeadcount(current + 1))}
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
          </div>
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
              <select
                className="storefront-field"
                value={eventTime}
                onChange={(event) => setEventTime(event.target.value)}
                style={{
                  height: 40,
                  borderRadius: 12,
                  border: `1px solid ${BORDER}`,
                  padding: '0 12px',
                  background: '#FFFFFF',
                }}
              >
                {availableTimeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
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
            marginBottom: isMobile ? 16 : 18,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'grid', gap: 6 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: brandColor,
              }}
            >
              {stepLabel}
            </div>
            <h1
              style={{
                margin: 0,
                fontFamily: displayFontFamily,
                fontSize: isMobile ? 28 : 34,
                lineHeight: 0.98,
              }}
            >
              {stepTitle}
            </h1>
            <p style={{ margin: 0, maxWidth: 560, fontSize: 13, lineHeight: 1.6, color: MUTED }}>
              {stepSubtitle}
            </p>
          </div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 10px',
              borderRadius: 999,
              border: `1px solid ${BORDER}`,
              background: '#FFFFFF',
            }}
          >
            {(['menu', 'details'] as const).map((step, index) => {
              const active = checkoutStep === step;
              const complete = checkoutStep === 'details' && step === 'menu';
              return (
                <div
                  key={step}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                >
                  <div
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 999,
                      display: 'grid',
                      placeItems: 'center',
                      background: active || complete ? INK : '#F5F5F4',
                      color: active || complete ? '#FFFFFF' : MUTED,
                      fontSize: 11,
                      fontWeight: 900,
                    }}
                  >
                    {index + 1}
                  </div>
                  <span style={{ fontSize: 12, fontWeight: active ? 900 : 700, color: INK }}>
                    {step === 'menu' ? 'Menu' : 'Checkout'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: activeLayoutColumns,
            gap: isMobile ? 18 : 20,
            alignItems: 'start',
            minWidth: 0,
          }}
        >
          {showBrowseSidebar ? (
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
            {checkoutStep === 'menu' && featuredPackage ? (
              <section
                style={{
                  marginBottom: 18,
                  borderRadius: 28,
                  border: `1px solid ${BORDER}`,
                  background: '#FFFFFF',
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px rgba(26,22,18,0.06)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.1fr) 280px',
                    gap: 0,
                  }}
                >
                  <div style={{ padding: isMobile ? 18 : 24, display: 'grid', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ borderRadius: 999, background: hexToSoftBackground(brandColor), color: brandColor, padding: '6px 10px', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                        Featured for this event
                      </span>
                      <span style={{ borderRadius: 999, background: '#F5F5F4', color: MUTED, padding: '6px 10px', fontSize: 11, fontWeight: 800 }}>
                        Best for {headcount} guests
                      </span>
                    </div>
                    <div style={{ fontFamily: displayFontFamily, fontSize: isMobile ? 30 : 36, lineHeight: 0.96, fontWeight: 900, color: INK }}>
                      {featuredPackage.name}
                    </div>
                    <div style={{ fontSize: 14, lineHeight: 1.7, color: MUTED, maxWidth: 560 }}>
                      {featuredPackage.description || getPackageSubline(featuredPackage)}
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                      <span style={{ borderRadius: 999, background: '#FFF7ED', color: '#C2410C', padding: '6px 10px', fontSize: 11, fontWeight: 900 }}>
                        Serves {featuredPackage.minimumHeadcount ?? headcount}
                      </span>
                      {featuredPackage.maximumHeadcount ? (
                        <span style={{ borderRadius: 999, background: '#F5F5F4', color: INK, padding: '6px 10px', fontSize: 11, fontWeight: 800 }}>
                          Up to {featuredPackage.maximumHeadcount} guests
                        </span>
                      ) : null}
                      {featuredPackage.includes.length > 0 ? (
                        <span style={{ borderRadius: 999, background: '#F5F5F4', color: INK, padding: '6px 10px', fontSize: 11, fontWeight: 800 }}>
                          {featuredPackage.includes.length} inclusions
                        </span>
                      ) : null}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginTop: 4 }}>
                      <div>
                        <div style={{ fontSize: 28, fontWeight: 900, color: INK }}>
                          {formatCurrencyAmount(featuredPackage.pricePerHead * headcount)}
                        </div>
                        <div style={{ fontSize: 12, color: MUTED }}>
                          {formatCurrencyAmount(featuredPackage.pricePerHead)} per guest
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          onClick={() => setItemModal({ type: 'package', id: featuredPackage.id })}
                          style={{ height: 44, borderRadius: 14, border: `1px solid ${BORDER}`, background: '#FFFFFF', color: INK, padding: '0 16px', fontSize: 13, fontWeight: 800 }}
                        >
                          Open details
                        </button>
                        <button
                          type="button"
                          onClick={() => updatePackageQuantity(featuredPackage.id, (selectedPkgs[featuredPackage.id] ?? 0) + 1)}
                          style={{ height: 44, borderRadius: 14, border: 'none', background: brandColor, color: '#FFFFFF', padding: '0 16px', fontSize: 13, fontWeight: 900 }}
                        >
                          Add featured package
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: isMobile ? 18 : 24, background: '#FCFBF8', borderLeft: isMobile ? 'none' : `1px solid ${BORDER}`, display: 'grid', gap: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
                      Recommended extras
                    </div>
                    {recommendedAddOns.map((addOn) => (
                      <div key={addOn.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 12, alignItems: 'center', padding: '12px 0', borderBottom: `1px solid ${BORDER}` }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: INK }}>{addOn.name}</div>
                          <div style={{ marginTop: 4, fontSize: 12, color: MUTED, lineHeight: 1.5 }}>
                            {addOn.description || 'An easy add-on to increase value without slowing checkout.'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateAddOnQuantity(addOn.id, (selectedAddOnIds[addOn.id] ?? 0) + 1)}
                          style={{ height: 38, borderRadius: 999, border: `1px solid ${BORDER}`, background: '#FFFFFF', padding: '0 12px', fontSize: 12, fontWeight: 900, color: INK }}
                        >
                          Add {formatCurrencyAmount(addOn.price)}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ) : null}
            <div style={{ display: 'grid', gap: isMobile ? 28 : 40 }}>
              {checkoutStep === 'menu'
                ? menuSections.map((section) => (
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
                          onClick={() => setItemModal({ type: 'package', id: pkg.id })}
                          style={{
                            flex: '0 0 auto',
                            width: isMobile ? 184 : isLaptop ? 216 : 224,
                            minHeight: isMobile ? 232 : isLaptop ? 252 : 260,
                            borderRadius: 22,
                            border: `1px solid ${BORDER}`,
                            background: '#FFFFFF',
                            overflow: 'hidden',
                            display: 'grid',
                            gridTemplateRows: isMobile ? '108px 1fr' : isLaptop ? '148px 1fr' : '154px 1fr',
                            scrollSnapAlign: 'start',
                            cursor: 'pointer',
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
                              gap: 6,
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
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    updatePackageQuantity(pkg.id, 1);
                                  }}
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
                  ))
                : null}
              {checkoutStep === 'menu' && filteredAddOns.length > 0 ? (
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
                          onClick={() => setItemModal({ type: 'addon', id: addOn.id })}
                          style={{
                            flex: '0 0 auto',
                            width: isMobile ? 184 : isLaptop ? 216 : 224,
                            minHeight: isMobile ? 232 : isLaptop ? 252 : 260,
                            borderRadius: 22,
                            border: `1px solid ${BORDER}`,
                            background: '#FFFFFF',
                            overflow: 'hidden',
                            display: 'grid',
                            gridTemplateRows: isMobile ? '108px 1fr' : isLaptop ? '148px 1fr' : '154px 1fr',
                            scrollSnapAlign: 'start',
                            cursor: 'pointer',
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
                          <div style={{ minWidth: 0, display: 'grid', gap: 6, padding: isMobile ? 12 : 14 }}>
                            <div>
                              <div style={{ fontSize: isMobile ? 16 : 18, fontWeight: 900 }}>{addOn.name}</div>
                              <div style={{ marginTop: 6, fontSize: 10, color: MUTED }}>Add-on</div>
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
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    updateAddOnQuantity(addOn.id, 1);
                                  }}
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
              {checkoutStep === 'details' ? (
                <>
                  <section
                    style={{
                      borderRadius: 24,
                      border: `1px solid ${BORDER}`,
                      background: '#FFFFFF',
                      padding: isMobile ? 18 : 22,
                      display: 'grid',
                      gap: 16,
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
                      <div style={{ display: 'grid', gap: 6 }}>
                        <h2
                          style={{
                            margin: 0,
                            fontFamily: displayFontFamily,
                            fontSize: isMobile ? 24 : 28,
                            lineHeight: 1,
                          }}
                        >
                          Complete your order
                        </h2>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: MUTED }}>
                          Confirm the event details and contact info on this step, then place the
                          order from the checkout panel.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCheckoutStep('menu');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        style={{
                          height: 40,
                          padding: '0 14px',
                          borderRadius: 14,
                          border: `1px solid ${BORDER}`,
                          background: '#FFFFFF',
                          color: INK,
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        Back to menu
                      </button>
                    </div>
                    <div
                      style={{
                        borderRadius: 18,
                        border: `1px solid ${BORDER}`,
                        background: CREAM,
                        padding: 16,
                        display: 'grid',
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 900,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: MUTED,
                        }}
                      >
                        Review lane
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.6, color: MUTED }}>
                        Finalize timing, location, and contact details here. The right rail stays focused on totals and placement.
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, minmax(0, 1fr))',
                          gap: 10,
                          fontSize: 13,
                        }}
                      >
                        <div>
                          <strong>Service:</strong> {SERVICE_MODE_LABELS[serviceType]}
                        </div>
                        <div>
                          <strong>When:</strong> {formatDisplayDate(eventDate)} ·{' '}
                          {formatDisplayTime(eventTime)}
                        </div>
                        <div>
                          <strong>Guests:</strong> {headcount}
                        </div>
                        <div>
                          <strong>
                            {serviceType === 'pickup' ? 'Pickup location:' : `${eventLocationLabel}:`}
                          </strong>{' '}
                          {deliverySummary}
                        </div>
                      </div>
                    </div>
                  </section>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {recurringCard}
                    {smartUpsellCard}
                  </div>
                  {!showDesktopCart ? (
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div
                        style={{
                          borderRadius: 18,
                          border: `1px solid ${BORDER}`,
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
                            color: MUTED,
                          }}
                        >
                          Your order
                        </div>
                        {selectedPkgList.map((item) => (
                          <div
                            key={`mobile-summary-${item.packageId}`}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0,1fr) auto',
                              gap: 12,
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800 }}>{item.name}</div>
                              <div style={{ marginTop: 4, fontSize: 11, color: MUTED }}>
                                {item.quantity} x package
                              </div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 900 }}>
                              {formatCurrencyAmount(item.total)}
                            </div>
                          </div>
                        ))}
                        {selectedAddOnList.map((item) => (
                          <div
                            key={`mobile-summary-addon-${item.addOnId}`}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0,1fr) auto',
                              gap: 12,
                              alignItems: 'center',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 800 }}>{item.name}</div>
                              <div style={{ marginTop: 4, fontSize: 11, color: MUTED }}>
                                {item.quantity} x add-on
                              </div>
                            </div>
                            <div style={{ fontSize: 13, fontWeight: 900 }}>
                              {formatCurrencyAmount(item.total)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
                        These details stay inside the cart so the merchant can confirm timing,
                        location, and any recurring schedule.
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
                      {requiresEventAddress ? (
                        <>
                          <input
                            className="storefront-field"
                            value={address}
                            onChange={(event) => setAddress(event.target.value)}
                            placeholder={eventLocationLabel}
                            style={{
                              height: 46,
                              borderRadius: 14,
                              border: `1px solid ${BORDER}`,
                              padding: '0 14px',
                              fontSize: 13,
                              gridColumn: isMobile ? 'auto' : '1 / span 2',
                            }}
                          />
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
                      ) : (
                        <div
                          style={{
                            borderRadius: 14,
                            border: `1px solid ${BORDER}`,
                            background: CREAM,
                            padding: '12px 14px',
                            fontSize: 13,
                            color: MUTED,
                            gridColumn: isMobile ? 'auto' : '1 / span 2',
                          }}
                        >
                          Pickup will happen at {deliverySummary}.
                        </div>
                      )}
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
                </>
              ) : null}
            </div>
          </div>
          {showDesktopCart ? (
            <aside
              style={{
                position: 'sticky',
                top: sidebarTop,
                display: 'grid',
                gap: 14,
                alignSelf: 'start',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  maxHeight:
                    checkoutStep === 'details'
                      ? 'none'
                      : `calc(100vh - ${sidebarTop + 20}px)`,
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
                <div
                  style={{
                    flex: checkoutStep === 'details' ? '0 0 auto' : 1,
                    minHeight: 0,
                    overflowY: checkoutStep === 'details' ? 'visible' : 'auto',
                    overscrollBehavior: checkoutStep === 'details' ? 'auto' : 'contain',
                    padding: isTablet ? 16 : 18,
                    display: 'grid',
                    gap: 14,
                  }}
                  className="storefront-scrollbar"
                >
                  {checkoutStep === 'menu' ? (
                    <div
                      style={{
                        borderRadius: 18,
                        border: `1px solid ${BORDER}`,
                        background: CREAM,
                        padding: 14,
                        display: 'grid',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: brandColor,
                        }}
                      >
                        Next up
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.6, color: INK }}>
                        Review recurring savings, smart recommendations, and event details on the
                        checkout step after the cart is built.
                      </div>
                    </div>
                  ) : null}
                  <div style={{ display: 'grid', gap: 10 }}>
                    {selectedPkgList.length === 0 && selectedAddOnList.length === 0 ? (
                      <div
                        style={{
                          borderRadius: 18,
                          border: `1px dashed ${BORDER}`,
                          padding: 14,
                          fontSize: 13,
                          lineHeight: 1.6,
                          color: MUTED,
                        }}
                      >
                          Add a package to start building the order. You’ll review recurring
                          savings and final recommendations on the checkout step.
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
                  {checkoutStep === 'menu' ? (
                    <div
                      style={{
                        borderRadius: 18,
                        border: `1px solid ${BORDER}`,
                        background: CREAM,
                        padding: 14,
                        display: 'grid',
                        gap: 8,
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
                        Checkout step preview
                      </div>
                      <div style={{ fontSize: 13, lineHeight: 1.6, color: INK }}>
                        We’ll surface recurring savings, smart upsells, and the full checkout form
                        on the next step after the cart is built.
                      </div>
                    </div>
                  ) : null}
                  {checkoutStep === 'details' ? (
                    <div
                      style={{
                        borderRadius: 18,
                        border: `1px solid ${BORDER}`,
                        background: CREAM,
                        padding: 14,
                        display: 'grid',
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 900,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          color: MUTED,
                        }}
                      >
                        Checkout details
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.6, color: INK }}>
                        {formatDisplayDate(eventDate)} · {formatDisplayTime(eventTime)}
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.6, color: INK }}>
                        {SERVICE_MODE_LABELS[serviceType]} · {headcount} guests
                      </div>
                      <div style={{ fontSize: 12, lineHeight: 1.6, color: MUTED }}>
                        {deliverySummary}
                      </div>
                    </div>
                  ) : null}
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
                  recurringActive ? `-${formatCurrencyAmount(recurringDiscountCents)}` : '-'
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
                    type={checkoutStep === 'details' ? 'submit' : 'button'}
                    onClick={
                      checkoutStep === 'menu'
                        ? () => {
                            if (!canProceedToCheckout) return;
                            setCheckoutStep('details');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }
                        : undefined
                    }
                    disabled={
                      checkoutStep === 'details'
                        ? !canSubmit || submitting
                        : !canProceedToCheckout
                    }
                    style={{
                      height: 50,
                      borderRadius: 16,
                      border: 'none',
                      background:
                        checkoutStep === 'details'
                          ? canSubmit && !submitting
                            ? '#E85618'
                            : '#FDBA74'
                          : canProceedToCheckout
                            ? '#E85618'
                            : '#FDBA74',
                      color: '#FFFFFF',
                      fontSize: 15,
                      fontWeight: 900,
                    }}
                  >
                    {checkoutStep === 'details'
                      ? submitting
                        ? 'Preparing order...'
                        : 'Place Order ->'
                      : 'Continue to checkout ->'}
                  </button>
                  {checkoutStep === 'details' ? (
                    <button
                      type="button"
                      onClick={() => {
                        setCheckoutStep('menu');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      style={{
                        height: 42,
                        borderRadius: 14,
                        border: `1px solid ${BORDER}`,
                        background: '#FFFFFF',
                        color: INK,
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      Back to menu
                    </button>
                  ) : null}
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
                  {recurringActive ? (
                <div
                  style={{ fontSize: 11, fontWeight: 800, color: '#FCD34D', textAlign: 'right' }}
                >
                  Save {formatCurrencyAmount(projectedRecurringSavingsThreeMonths)} in 3 months
                </div>
              ) : null}
            </div>
            <button
              type={checkoutStep === 'details' ? 'submit' : 'button'}
              onClick={
                checkoutStep === 'menu'
                  ? () => {
                      if (!canProceedToCheckout) return;
                      setCheckoutStep('details');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  : undefined
              }
              disabled={
                checkoutStep === 'details' ? !canSubmit || submitting : !canProceedToCheckout
              }
              style={{
                height: 48,
                borderRadius: 16,
                border: 'none',
                background:
                  checkoutStep === 'details'
                    ? canSubmit && !submitting
                      ? '#E85618'
                      : '#FDBA74'
                    : canProceedToCheckout
                      ? '#E85618'
                      : '#FDBA74',
                color: '#FFFFFF',
                fontSize: 15,
                fontWeight: 900,
              }}
            >
              {checkoutStep === 'details'
                ? submitting
                  ? 'Preparing order...'
                  : 'Place Order ->'
                : 'Continue to checkout ->'}
            </button>
          </div>
        </div>
      ) : null}
      {itemModal && (modalPackage || modalAddOn) ? (
        <div
          onClick={() => setItemModal(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 80,
            background: 'rgba(26,22,18,0.48)',
            display: 'grid',
            placeItems: 'center',
            padding: isMobile ? '16px' : '28px',
          }}
        >
          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: isMobile ? 420 : 920,
              maxHeight: '86vh',
              overflow: 'hidden',
              borderRadius: isMobile ? 24 : 28,
              background: '#FFFFFF',
              boxShadow: '0 30px 80px rgba(26,22,18,0.28)',
              display: 'grid',
              gridTemplateRows: 'minmax(0, 1fr) auto',
            }}
          >
            {(() => {
              const activePackage = modalPackage;
              const activeAddOn = modalAddOn;
              const activeName = activePackage?.name ?? activeAddOn?.name ?? '';
              const activeDescription =
                activePackage?.description ??
                activeAddOn?.description ??
                'Prepared fresh by the merchant.';
              const activeImage = activePackage?.imageUrl ?? activeAddOn?.imageUrl ?? null;
              const activeQuantity =
                activePackage
                  ? selectedPkgs[activePackage.id] ?? 0
                  : activeAddOn
                    ? selectedAddOnIds[activeAddOn.id] ?? 0
                    : 0;
              const unitPrice = activePackage
                ? activePackage.pricePerHead
                : activeAddOn
                  ? activeAddOn.price
                  : 0;
              const activePrice = activePackage ? unitPrice * headcount : unitPrice;
              const modalTotal = activePrice * modalDraftQuantity;
              const modalBadge = activePackage ? 'Package' : 'Add-on';
              const modalMeta = activePackage
                ? [`Built for ${headcount} guests`, `Serves ${activePackage.minimumHeadcount ?? headcount}`]
                : ['Quick add-on', 'Adds straight to this order'];
              return (
                <>
                  <div
                    className="storefront-scrollbar"
                    style={{
                      overflowY: 'auto',
                      display: 'grid',
                      gap: 0,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1.05fr) minmax(320px, 0.95fr)',
                        minHeight: isMobile ? undefined : 360,
                      }}
                    >
                    <div style={{ position: 'relative', minHeight: isMobile ? 220 : 360 }}>
                    <div style={{ height: '100%', background: activeImage ? '#F5F5F4' : undefined }}>
                      {activeImage ? (
                        <img
                          src={activeImage}
                          alt={activeName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        placeholderCardImage(activeName, brandColor)
                      )}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        top: 18,
                        left: 18,
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.94)',
                        padding: '7px 12px',
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {modalBadge}
                    </div>
                    <button
                      type="button"
                      onClick={() => setItemModal(null)}
                      style={{
                        position: 'absolute',
                        top: 14,
                        right: 14,
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        border: 'none',
                        background: 'rgba(255,255,255,0.96)',
                        color: INK,
                        fontSize: 0,
                        lineHeight: 1,
                        fontWeight: 900,
                        display: 'grid',
                        placeItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <span style={{ fontSize: 18, lineHeight: 1, color: INK }}>x</span>
                      ×
                    </button>
                  </div>
                  <div style={{ padding: isMobile ? 18 : 24, display: 'grid', gap: 18, alignContent: 'start' }}>
                    <div style={{ display: 'grid', gap: 12 }}>
                      <div
                        style={{
                          fontFamily: displayFontFamily,
                          fontSize: isMobile ? 28 : 36,
                          lineHeight: 0.95,
                          fontWeight: 900,
                        }}
                      >
                        {activeName}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {modalMeta.map((label) => (
                          <span
                            key={label}
                            style={{
                              borderRadius: 999,
                              background: '#F5F5F4',
                              color: INK,
                              padding: '6px 10px',
                              fontSize: 11,
                              fontWeight: 800,
                            }}
                          >
                            {label}
                          </span>
                        ))}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.7, color: MUTED }}>{activeDescription}</div>
                      <div style={{ display: 'grid', gap: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 24, fontWeight: 900 }}>{formatCurrencyAmount(activePrice)}</span>
                        {activePackage ? (
                          <span style={{ fontSize: 12, fontWeight: 800, color: MUTED }}>
                            {formatCurrencyAmount(unitPrice)} per guest
                          </span>
                        ) : null}
                      </div>
                      <div style={{ fontSize: 12, color: MUTED }}>
                        {activePackage
                          ? 'Adjust quantity here, then add the full package when you are ready.'
                          : 'Add this extra to the order without leaving the menu.'}
                      </div>
                      </div>
                    </div>
                    {activePackage?.includes.length ? (
                      <div
                        style={{
                          borderTop: `1px solid ${BORDER}`,
                          paddingTop: 18,
                          display: 'grid',
                          gap: 12,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
                          Included in this package
                        </div>
                        <div style={{ display: 'grid', gap: 10 }}>
                          {activePackage.includes.slice(0, 4).map((item) => (
                            <div key={item.name} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                              <div style={{ width: 22, height: 22, borderRadius: 999, background: '#F5F5F4', color: INK, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 900, flexShrink: 0 }}>
                                +
                              </div>
                              <div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: INK }}>{item.name}</div>
                                {item.description ? (
                                  <div style={{ marginTop: 3, fontSize: 12, color: MUTED, lineHeight: 1.55 }}>
                                    {item.description}
                                  </div>
                                ) : null}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    {modalSuggestedAddOns.length > 0 ? (
                      <div
                        style={{
                          borderTop: `1px solid ${BORDER}`,
                          paddingTop: 18,
                          display: 'grid',
                          gap: 12,
                        }}
                      >
                        <div style={{ fontSize: 12, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: MUTED }}>
                          Goes well with
                        </div>
                        <div style={{ display: 'grid', gap: 10 }}>
                          {modalSuggestedAddOns.map((addOn) => (
                            <div
                              key={addOn.id}
                              style={{
                                display: 'grid',
                                gridTemplateColumns: '56px minmax(0,1fr) auto',
                                gap: 12,
                                alignItems: 'center',
                              }}
                            >
                              <div
                                style={{
                                  width: 56,
                                  height: 56,
                                  borderRadius: 16,
                                  overflow: 'hidden',
                                  background: addOn.imageUrl ? '#F5F5F4' : undefined,
                                }}
                              >
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
                              <div style={{ minWidth: 0 }}>
                                <div style={{ fontSize: 15, fontWeight: 800 }}>{addOn.name}</div>
                                <div style={{ marginTop: 3, fontSize: 12, color: MUTED }}>
                                  {formatCurrencyAmount(addOn.price)} - quick add-on for this order
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => updateAddOnQuantity(addOn.id, (selectedAddOnIds[addOn.id] ?? 0) + 1)}
                                style={{
                                  height: 38,
                                  borderRadius: 999,
                                  border: `1px solid ${BORDER}`,
                                  background: '#FFFFFF',
                                  color: INK,
                                  fontSize: 12,
                                  fontWeight: 900,
                                  lineHeight: 1,
                                  padding: '0 12px',
                                  cursor: 'pointer',
                                }}
                              >
                                Add {formatCurrencyAmount(addOn.price)}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                  </div>
                  <div
                    style={{
                      background: '#FFFFFF',
                      padding: isMobile ? 16 : 18,
                      display: 'grid',
                      gap: 12,
                      borderTop: `1px solid ${BORDER}`,
                      boxShadow: '0 -10px 30px rgba(26,22,18,0.06)',
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
                      <QuantityStepper
                        quantity={modalDraftQuantity}
                        onDecrease={() => setModalDraftQuantity((current) => Math.max(current - 1, 1))}
                        onIncrease={() => setModalDraftQuantity((current) => current + 1)}
                      />
                      <div style={{ fontSize: 11, color: MUTED }}>
                        {activeQuantity > 0
                          ? `${activeQuantity} already in your order`
                          : 'Not in your order yet'}
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          isMobile && activeQuantity === 0
                            ? 'minmax(0, 1fr) auto'
                            : isMobile
                              ? 'minmax(0, 1fr)'
                              : activeQuantity > 0
                                ? 'auto minmax(0, 1fr) auto'
                                : 'minmax(0, 1fr) auto',
                        gap: 12,
                        alignItems: 'center',
                      }}
                    >
                      {activeQuantity > 0 ? (
                        <button
                          type="button"
                          onClick={() => {
                            if (activePackage) updatePackageQuantity(activePackage.id, 0);
                            if (activeAddOn) updateAddOnQuantity(activeAddOn.id, 0);
                            setItemModal(null);
                          }}
                          style={{
                            height: 48,
                            borderRadius: 16,
                            border: `1px solid ${BORDER}`,
                            background: '#FFFFFF',
                            color: INK,
                            fontSize: 14,
                            fontWeight: 800,
                            padding: '0 16px',
                            cursor: 'pointer',
                          }}
                        >
                          Remove
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={commitModalSelection}
                        style={{
                          height: 50,
                          borderRadius: 16,
                          border: 'none',
                          background: brandColor,
                          color: '#FFFFFF',
                          fontSize: 15,
                          fontWeight: 900,
                          padding: '0 18px',
                          cursor: 'pointer',
                        }}
                      >
                        {activeQuantity > 0 ? 'Update item' : 'Add item'}
                      </button>
                      <div style={{ fontSize: 22, fontWeight: 900, whiteSpace: 'nowrap', textAlign: 'right' }}>
                        {formatCurrencyAmount(modalTotal)}
                      </div>
                    </div>
                  </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : null}
    </form>
  );
}
