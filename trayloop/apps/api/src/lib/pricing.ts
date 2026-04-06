import { db } from '@trayloop/database';
import { packages, addOns, locationSettings } from '@trayloop/database';
import { eq } from 'drizzle-orm';
import { ValidationError, NotFoundError } from './errors.js';

// --- Types ---

export interface PackageSelection {
  packageId: string;
  quantity: number;
}

export interface AddOnSelection {
  addOnId: string;
  quantity: number;
}

export interface PricingInput {
  headcount: number;
  packages: PackageSelection[];
  addOns?: AddOnSelection[];
  locationId?: string;
}

export interface LineItem {
  type: 'package' | 'add_on';
  referenceId: string;
  name: string;
  description: string | null;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
}

export interface PricingResult {
  lineItems: LineItem[];
  packageSubtotal: number;
  addOnSubtotal: number;
  subtotal: number;
  platformFee: number;
  platformFeePercent: number;
  total: number;
  currency: string;
  headcount: number;
}

// --- Service ---

export async function calculatePricing(input: PricingInput): Promise<PricingResult> {
  // 1. Fetch and validate all selected packages from DB
  const packageIds = input.packages.map((p) => p.packageId);
  const packageRows = await db
    .select()
    .from(packages)
    .where(eq(packages.isActive, true));

  const selectedPackages = packageRows.filter((p) => packageIds.includes(p.id));

  if (selectedPackages.length !== packageIds.length) {
    const foundIds = new Set(selectedPackages.map((p) => p.id));
    const missing = packageIds.filter((id) => !foundIds.has(id));
    throw new ValidationError(`Packages not found or inactive: ${missing.join(', ')}`);
  }

  // 2. Validate headcount constraints per package
  for (const pkg of selectedPackages) {
    if (pkg.minHeadCount && input.headcount < pkg.minHeadCount) {
      throw new ValidationError(
        `Package "${pkg.name}" requires minimum ${pkg.minHeadCount} headcount (got ${input.headcount})`,
      );
    }
    if (pkg.maxHeadCount && input.headcount > pkg.maxHeadCount) {
      throw new ValidationError(
        `Package "${pkg.name}" allows maximum ${pkg.maxHeadCount} headcount (got ${input.headcount})`,
      );
    }
  }

  // 3. Calculate package line items — price comes from DB, never frontend
  const packageLineItems: LineItem[] = input.packages.map((selection) => {
    const pkg = selectedPackages.find((p) => p.id === selection.packageId)!;
    const unitPrice = pkg.price;
    const quantity = pkg.pricing === 'per_head'
      ? input.headcount * selection.quantity
      : selection.quantity;
    const totalPrice = unitPrice * quantity;

    return {
      type: 'package' as const,
      referenceId: pkg.id,
      name: pkg.name,
      description: pkg.description,
      unitPrice,
      quantity,
      totalPrice,
    };
  });

  // 4. Calculate add-on line items
  let addOnLineItems: LineItem[] = [];
  if (input.addOns && input.addOns.length > 0) {
    const addOnIds = input.addOns.map((a) => a.addOnId);
    const addOnRows = await db
      .select()
      .from(addOns)
      .where(eq(addOns.isActive, true));

    const selectedAddOns = addOnRows.filter((a) => addOnIds.includes(a.id));

    if (selectedAddOns.length !== addOnIds.length) {
      const foundIds = new Set(selectedAddOns.map((a) => a.id));
      const missing = addOnIds.filter((id) => !foundIds.has(id));
      throw new ValidationError(`Add-ons not found or inactive: ${missing.join(', ')}`);
    }

    addOnLineItems = input.addOns.map((selection) => {
      const addOn = selectedAddOns.find((a) => a.id === selection.addOnId)!;
      return {
        type: 'add_on' as const,
        referenceId: addOn.id,
        name: addOn.name,
        description: addOn.description,
        unitPrice: addOn.price,
        quantity: selection.quantity,
        totalPrice: addOn.price * selection.quantity,
      };
    });
  }

  // 5. Compute subtotals + 5% platform coordination fee
  const PLATFORM_FEE_PERCENT = 5;
  const packageSubtotal = packageLineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const addOnSubtotal = addOnLineItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const subtotal = packageSubtotal + addOnSubtotal;
  const platformFee = Math.round(subtotal * (PLATFORM_FEE_PERCENT / 100));
  const total = subtotal + platformFee;

  // 6. Enforce minimum order amount if location provided
  if (input.locationId) {
    const [settings] = await db
      .select({ minOrderAmount: locationSettings.minOrderAmount })
      .from(locationSettings)
      .where(eq(locationSettings.locationId, input.locationId))
      .limit(1);

    if (settings?.minOrderAmount && total < settings.minOrderAmount) {
      throw new ValidationError(
        `Order total ($${(total / 100).toFixed(2)}) is below the minimum order amount ($${(settings.minOrderAmount / 100).toFixed(2)})`,
      );
    }
  }

  return {
    lineItems: [...packageLineItems, ...addOnLineItems],
    packageSubtotal,
    addOnSubtotal,
    subtotal,
    platformFee,
    platformFeePercent: PLATFORM_FEE_PERCENT,
    total,
    currency: 'USD',
    headcount: input.headcount,
  };
}
