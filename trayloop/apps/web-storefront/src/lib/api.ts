const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getCustomerToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('customer_token');
}

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
  price: number;
  currency: string;
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
}

export interface StorefrontData {
  merchant: StorefrontMerchant;
  locations: StorefrontLocation[];
  menu: StorefrontMenu[];
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
  customerId: string;
  headCount: number;
  scheduledAt: string;
  customer: { firstName: string; lastName: string; email: string };
  pricing: { packageSubtotal: number; addOnSubtotal: number; total: number; currency: string };
  items: Array<{ type: string; name: string; quantity: number; unitPrice: number; totalPrice: number }>;
  depositRequired?: boolean;
  createdAt: string;
}

export interface DepositCheckoutPayload {
  url: string;
  depositId: string;
  depositAmount: number;
  currency: string;
  stripeCheckoutSessionId: string | null;
}

export interface StorefrontOrderResponse {
  mode: 'order_received' | 'deposit_pending' | 'deposit_checkout';
  order: OrderConfirmation;
  checkout?: DepositCheckoutPayload;
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
  paymentState: 'pending' | 'paid' | 'refunded' | 'not_required';
  deposit: null | {
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
  const token = getCustomerToken();
  const res = await fetch(`${API_URL}/api/storefront/${slug}/order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
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

export async function fetchOrderPaymentStatus(slug: string, orderId: string): Promise<PublicOrderPaymentStatus> {
  const res = await fetch(`${API_URL}/api/storefront/${slug}/orders/${orderId}/payment-status`, {
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Failed to load payment status');
  }

  return json.data;
}

export async function restartDepositCheckout(slug: string, orderId: string): Promise<DepositCheckoutPayload> {
  const res = await fetch(`${API_URL}/api/storefront/${slug}/orders/${orderId}/deposit-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Failed to restart checkout');
  }

  return json.data;
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
    body: JSON.stringify(input),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Account creation failed');
  }

  return json.data;
}

export async function fetchCustomerAccount(): Promise<CustomerAccount> {
  const token = getCustomerToken();
  if (!token) {
    throw new Error('Missing customer session');
  }

  const res = await fetch(`${API_URL}/api/auth/customer/account`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Failed to load account');
  }

  return json.data;
}

export async function fetchCurrentCustomer() {
  const token = getCustomerToken();
  if (!token) return null;

  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  });

  if (res.status === 401 || res.status === 403) {
    return null;
  }

  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.error?.message ?? 'Failed to load session');
  }

  return json.data;
}

export async function logoutCustomer() {
  const token = getCustomerToken();
  await fetch(`${API_URL}/api/auth/logout`, {
    method: 'POST',
    headers: token
      ? {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        }
      : { 'Content-Type': 'application/json' },
  });
}
