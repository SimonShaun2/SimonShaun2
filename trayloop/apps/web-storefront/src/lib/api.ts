import { clearCustomerSession, ensureCustomerSession } from './session';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface StorefrontLocation {
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  serviceTypes: string[];
  leadTimeHours: number;
  minimumOrderAmount: number;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  deliveryRadiusMiles: number | null;
  depositRequired: boolean;
  operatingHours: Record<string, { open: string; close: string }> | null;
}

export interface StorefrontPackageItem {
  name: string;
  description: string | null;
  isOptional: boolean;
}

export interface StorefrontPackage {
  id: string;
  categoryId: string | null;
  name: string;
  description: string | null;
  pricePerHead: number;
  currency: string;
  minimumHeadcount: number | null;
  maximumHeadcount: number | null;
  imageUrl: string | null;
  upsellEligible?: boolean;
  upsellFeatured?: boolean;
  upsellPriority?: number;
  includes: StorefrontPackageItem[];
}

export interface StorefrontCategory {
  id: string;
  name: string;
  description: string | null;
  packages: StorefrontPackage[];
}

export interface StorefrontAddOn {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  price: number;
  currency: string;
  upsellEligible?: boolean;
  upsellFeatured?: boolean;
  upsellPriority?: number;
}

export interface StorefrontUpsellRecommendation {
  addOnId: string;
  name: string;
  headline: string;
  reason: string;
  recommendationType: string;
  suggestedQuantity: number;
  unitPrice: number;
  totalPrice: number;
  score: number;
}

export interface StorefrontMenu {
  name: string;
  description: string | null;
  categories: StorefrontCategory[];
  uncategorizedPackages: StorefrontPackage[];
  addOns: StorefrontAddOn[];
}

export interface StorefrontMerchant {
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  phone: string | null;
  logoUrl: string | null;
  brandColor: string | null;
  displayFont: 'bricolage' | 'fraunces' | 'inter' | null;
  rating: number | null;
  reviewCount: number | null;
  heroImageUrl: string | null;
  tagline: string | null;
}

export interface StorefrontData {
  merchant: StorefrontMerchant;
  locations: StorefrontLocation[];
  menu: StorefrontMenu[];
}

export interface StorefrontUpsellSocialProof {
  ordersAnalyzed: number;
  ordersWithAddOn: number;
  similarHeadcount: boolean;
  averageAddOnRevenue: number;
  cuisineTag: string | null;
}

export async function fetchStorefront(slug: string): Promise<StorefrontData> {
  const res = await fetch(`${API_URL}/api/storefront/${slug}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    if (res.status === 404) {
      throw new Error('NOT_FOUND');
    }
    throw new Error(`Failed to load storefront: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

export interface OrderSubmission {
  locationId: string;
  serviceType: 'delivery' | 'pickup' | 'full_service' | 'on_site' | 'food_truck';
  eventDate: string;
  headcount: number;
  packages: Array<{ packageId: string; quantity: number }>;
  addOns?: Array<{ addOnId: string; quantity: number }>;
  upsellAttributions?: Array<{
    addOnId: string;
    sessionKey: string;
    recommendationType: string;
    suggestedQuantity: number;
    revenueCents: number;
    headline?: string;
    reason?: string;
  }>;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    companyName?: string;
  };
  deliveryAddress?: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  };
  notes?: string;
  recurring?: {
    interval: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
    endDate?: string;
    preferredDay?: string;
    preferredTime?: string;
  };
}

export interface OrderConfirmation {
  id: string;
  orderNumber: string;
  status: string;
  serviceType: string;
  customerId: string;
  headCount: number;
  scheduledAt: string;
  notes: string | null;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    company: string | null;
  };
  location: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone: string | null;
    email: string | null;
  } | null;
  deliveryAddress: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country?: string;
  } | null;
  pricing: { packageSubtotal: number; addOnSubtotal: number; total: number; currency: string };
  items: Array<{
    type: string;
    name: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  depositRequired?: boolean;
  createdAt: string;
}

export interface OrderCheckoutPayload {
  kind: 'deposit' | 'order';
  url: string;
  amount: number;
  currency: string;
  stripeCheckoutSessionId: string | null;
}

export interface StorefrontOrderResponse {
  mode: 'order_received' | 'deposit_pending' | 'deposit_checkout' | 'full_checkout';
  order: OrderConfirmation;
  checkout?: OrderCheckoutPayload;
}

export interface PublicOrderPaymentStatus {
  orderId: string;
  orderNumber: string;
  orderStatus: string;
  serviceType: string;
  totalAmount: number;
  currency: string;
  scheduledAt: string;
  depositRequired: boolean;
  checkoutType: 'deposit' | 'order';
  paymentState: 'pending' | 'paid' | 'failed' | 'refunded' | 'not_required';
  deposit: null | {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string | null;
    createdAt: string;
  };
  payment: null | {
    id: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: string | null;
    createdAt: string;
  };
  canRetryCheckout: boolean;
}

export async function submitOrder(slug: string, order: OrderSubmission): Promise<StorefrontOrderResponse> {
  await ensureCustomerSession();
  const res = await fetch(`${API_URL}/api/storefront/${slug}/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-trayloop-session-scope': 'customer',
    },
    credentials: 'include',
    body: JSON.stringify(order),
  });

  const text = await res.text();
  let json: any;
  try {
    json = JSON.parse(text);
  } catch {
    throw new OrderError(`Server returned invalid response: ${text.slice(0, 100)}`);
  }

  if (!res.ok) {
    const msg = json.error?.message ?? json.message ?? 'Order submission failed';
    const details = json.error?.details;
    throw new OrderError(msg, details);
  }

  return json.data;
}

export class OrderError extends Error {
  constructor(message: string, public details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'OrderError';
  }
}

export interface CustomerAuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  token: string;
}

export interface CustomerAccount {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    emailVerified: boolean;
    createdAt: string;
  };
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    companyName: string | null;
  };
  customerRecords: Array<{
    id: string;
    organizationId: string;
    organizationName: string;
    organizationSlug: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    companyName: string | null;
    createdAt: string;
  }>;
  orders: Array<{
    id: string;
    orderNumber: string;
    status: string;
    totalAmount: number;
    currency: string;
    headCount: number;
    scheduledAt: string;
    createdAt: string;
    organizationName: string;
    organizationSlug: string;
  }>;
}

export async function loginCustomer(email: string, password: string): Promise<CustomerAuthResult> {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Sign in failed');
  }

  if (json.data.user.role !== 'customer') {
    throw new Error('This sign-in is only for customer accounts');
  }

  return json.data;
}

export async function fetchStorefrontUpsells(
  slug: string,
  payload: {
    locationId: string;
    serviceType: OrderSubmission['serviceType'];
    headcount: number;
    packages: Array<{ packageId: string; quantity: number }>;
    addOns?: Array<{ addOnId: string; quantity: number }>;
  },
): Promise<StorefrontUpsellRecommendation[]> {
  const res = await fetch(`${API_URL}/api/storefront/${slug}/upsells`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to load upsells: ${res.status}`);
  }

  const json = await res.json();
  return json.data;
}

export async function fetchStorefrontUpsellSocialProof(
  slug: string,
  input: { addOnId: string; headcount: number },
): Promise<StorefrontUpsellSocialProof> {
  const params = new URLSearchParams({
    addOnId: input.addOnId,
    headcount: String(input.headcount),
  });

  const res = await fetch(`${API_URL}/api/storefront/${slug}/upsells/social-proof?${params.toString()}`, {
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Failed to load upsell social proof');
  }

  return json.data;
}

export async function fetchStorefrontOftenAdded(slug: string): Promise<StorefrontAddOn[]> {
  const res = await fetch(`${API_URL}/api/storefront/${slug}/often-added`, {
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Failed to load popular add-ons');
  }

  return json.data;
}

export async function trackStorefrontUpsell(
  slug: string,
  payload: {
    sessionKey: string;
    locationId?: string;
    addOnId: string;
    eventType: 'shown' | 'clicked';
    recommendationType: string;
    suggestedQuantity: number;
    revenueCents: number;
    headline?: string;
    reason?: string;
  },
) {
  await fetch(`${API_URL}/api/storefront/${slug}/upsells/track`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function fetchOrderPaymentStatus(slug: string, orderId: string): Promise<PublicOrderPaymentStatus> {
  const res = await fetch(`${API_URL}/api/storefront/${slug}/orders/${orderId}/payment-status`, {
    cache: 'no-store',
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Failed to load payment status');
  }

  return json.data;
}

export async function restartOrderCheckout(slug: string, orderId: string): Promise<OrderCheckoutPayload> {
  const res = await fetch(`${API_URL}/api/storefront/${slug}/orders/${orderId}/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Failed to restart checkout');
  }

  return json.data;
}

export async function restartDepositCheckout(slug: string, orderId: string): Promise<OrderCheckoutPayload> {
  return restartOrderCheckout(slug, orderId);
}

export async function registerCustomer(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  companyName?: string;
}): Promise<CustomerAuthResult> {
  const res = await fetch(`${API_URL}/api/auth/register/customer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Account creation failed');
  }

  return json.data;
}

export async function fetchCustomerAccount(): Promise<CustomerAccount> {
  await ensureCustomerSession();

  const res = await fetch(`${API_URL}/api/auth/customer/account`, {
    headers: {
      'Content-Type': 'application/json',
      'x-trayloop-session-scope': 'customer',
    },
    credentials: 'include',
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) {
      clearCustomerSession();
    }
    throw new Error(json.error?.message ?? 'Failed to load account');
  }

  return json.data;
}

export async function fetchCurrentCustomer() {
  await ensureCustomerSession();

  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      'x-trayloop-session-scope': 'customer',
    },
    credentials: 'include',
    cache: 'no-store',
  });

  if (res.status === 401 || res.status === 403) {
    clearCustomerSession();
    return null;
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Failed to load session');
  }

  return json.data;
}

export async function logoutCustomer() {
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-trayloop-session-scope': 'customer',
    },
    credentials: 'include',
  });
}
