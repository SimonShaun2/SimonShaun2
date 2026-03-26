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
