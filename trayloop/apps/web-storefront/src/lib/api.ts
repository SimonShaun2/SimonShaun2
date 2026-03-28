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
    next: { revalidate: 60 },
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
  serviceType: 'delivery' | 'pickup';
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
  headCount: number;
  scheduledAt: string;
  customer: { firstName: string; lastName: string; email: string };
  pricing: { packageSubtotal: number; addOnSubtotal: number; total: number; currency: string };
  items: Array<{ type: string; name: string; quantity: number; unitPrice: number; totalPrice: number }>;
  depositRequired?: boolean;
  createdAt: string;
}

export async function submitOrder(slug: string, order: OrderSubmission): Promise<OrderConfirmation> {
  const res = await fetch(`${API_URL}/api/storefront/${slug}/order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
