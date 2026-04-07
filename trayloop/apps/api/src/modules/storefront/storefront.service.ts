import { db } from '@trayloop/database';
import {
  organizations,
  locations,
  locationSettings,
  catalogs,
  catalogCategories,
  packages,
  packageItems,
  addOns,
  customers,
  deposits,
  payments,
  orders,
  upsellEvents,
} from '@trayloop/database';
import { eq, and, desc } from 'drizzle-orm';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import { getStripe, isStripeEnabled } from '../../lib/stripe.js';
import { buildUpsellRecommendations } from '../../lib/upsells.js';
import { create as createOrder, createDepositCheckoutForOrder } from '../orders/orders.service.js';
import type { CreateOrderInput } from '../orders/orders.schema.js';
import type { EventBus } from '../../lib/event-bus/index.js';

function normalizeLocationServiceTypes(
  serviceTypes: string[] | null | undefined,
  deliveryEnabled: boolean | null | undefined,
  pickupEnabled: boolean | null | undefined,
) {
  const next = new Set(serviceTypes ?? []);

  if (deliveryEnabled ?? true) {
    next.add('delivery');
  } else {
    next.delete('delivery');
  }

  if (pickupEnabled ?? false) {
    next.add('pickup');
  } else {
    next.delete('pickup');
  }

  return next.size > 0 ? Array.from(next) : ['delivery'];
}

interface FullOrderCheckoutContext {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  merchantAmount: number;
  customerId: string;
}

async function createFullOrderCheckoutForOrder(
  order: FullOrderCheckoutContext,
  org: {
    id: string;
    stripeAccountId: string | null;
    stripeOnboardingComplete: boolean | null;
  },
  customerEmail: string,
  options: {
    successUrl: string;
    cancelUrl: string;
  },
) {
  if (!isStripeEnabled() || !org.stripeAccountId || !org.stripeOnboardingComplete) {
    throw new NotFoundError('Stripe checkout');
  }

  const platformFeeAmount = Math.max(order.totalAmount - order.merchantAmount, 0);
  const stripe = getStripe();
  const previousPendingPayments = await db
    .select({
      id: payments.id,
      stripeCheckoutSessionId: payments.stripeCheckoutSessionId,
    })
    .from(payments)
    .where(and(eq(payments.orderId, order.id), eq(payments.status, 'pending')));

  for (const previousPayment of previousPendingPayments) {
    if (!previousPayment.stripeCheckoutSessionId) {
      continue;
    }

    try {
      await stripe.checkout.sessions.expire(previousPayment.stripeCheckoutSessionId);
    } catch {
      // Best effort: the session may already be expired or completed.
    }
  }

  const now = new Date();
  const [payment] = await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({
        status: 'failed',
        failureReason: 'Superseded by a newer checkout session',
        updatedAt: now,
      })
      .where(and(eq(payments.orderId, order.id), eq(payments.status, 'pending')));

    return tx
      .insert(payments)
      .values({
        orderId: order.id,
        amount: order.totalAmount,
        currency: 'USD',
        status: 'pending',
        method: 'card',
      })
      .returning();
  });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          unit_amount: order.totalAmount,
          product_data: {
            name: `Order ${order.orderNumber}`,
            description: 'TrayLoop catering order',
          },
        },
        quantity: 1,
      }],
      payment_intent_data: {
        application_fee_amount: platformFeeAmount,
        transfer_data: {
          destination: org.stripeAccountId,
        },
      },
      customer_email: customerEmail,
      metadata: {
        trayloop_order_id: order.id,
        trayloop_order_number: order.orderNumber,
        trayloop_org_id: org.id,
        trayloop_payment_id: payment.id,
        trayloop_full_payment: 'true',
        trayloop_merchant_amount: String(order.merchantAmount),
        trayloop_platform_fee_amount: String(platformFeeAmount),
        trayloop_customer_charge_amount: String(order.totalAmount),
      },
      success_url: options.successUrl,
      cancel_url: options.cancelUrl,
    });

    await db
      .update(payments)
      .set({
        stripeCheckoutSessionId: session.id,
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    return {
      paymentId: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      paymentLink: session.url!,
      stripeCheckoutSessionId: session.id,
    };
  } catch (error) {
    await db
      .update(payments)
      .set({
        status: 'failed',
        failureReason: error instanceof Error ? error.message : 'Failed to create Stripe checkout session',
        updatedAt: new Date(),
      })
      .where(eq(payments.id, payment.id));

    throw error;
  }
}

export async function getStorefront(slug: string) {
  // 1. Resolve organization by slug
  const [org] = await db
    .select({
      id: organizations.id,
      name: organizations.name,
      slug: organizations.slug,
      description: organizations.description,
      website: organizations.website,
      phone: organizations.phone,
      logoUrl: organizations.logoUrl,
    })
    .from(organizations)
    .where(and(eq(organizations.slug, slug), eq(organizations.isActive, true)))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Storefront');
  }

  const orgId = org.id;

  // 2. Fetch locations with explicit columns (avoids schema drift issues)
  const locationRows = await db
    .select({
      id: locations.id,
      name: locations.name,
      address: locations.address,
      city: locations.city,
      state: locations.state,
      zipCode: locations.zipCode,
      country: locations.country,
      phone: locations.phone,
      leadTimeDays: locationSettings.leadTimeDays,
      minOrderAmount: locationSettings.minOrderAmount,
      serviceTypes: locationSettings.serviceTypes,
      deliveryEnabled: locationSettings.deliveryEnabled,
      pickupEnabled: locationSettings.pickupEnabled,
      deliveryRadius: locationSettings.deliveryRadius,
      operatingHours: locationSettings.operatingHours,
      depositRequired: locationSettings.depositRequired,
    })
    .from(locations)
    .leftJoin(locationSettings, eq(locationSettings.locationId, locations.id))
    .where(and(eq(locations.organizationId, orgId), eq(locations.isActive, true)));

  const locationDtos = locationRows.map((row) => ({
    slug: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zipCode,
    country: row.country,
    phone: row.phone,
    serviceTypes: normalizeLocationServiceTypes(
      row.serviceTypes,
      row.deliveryEnabled,
      row.pickupEnabled,
    ),
    leadTimeHours: (row.leadTimeDays ?? 3) * 24,
    minimumOrderAmount: row.minOrderAmount ?? 0,
    deliveryEnabled: row.deliveryEnabled ?? true,
    pickupEnabled: row.pickupEnabled ?? false,
    deliveryRadiusMiles: row.deliveryRadius ?? null,
    operatingHours: row.operatingHours ?? null,
    depositRequired: row.depositRequired ?? true,
  }));

  // 3. Fetch active catalogs
  const catalogRows = await db
    .select({
      id: catalogs.id,
      name: catalogs.name,
      description: catalogs.description,
    })
    .from(catalogs)
    .where(and(eq(catalogs.organizationId, orgId), eq(catalogs.isActive, true)));

  if (catalogRows.length === 0) {
    return {
      merchant: {
        name: org.name,
        slug: org.slug,
        description: org.description,
        website: org.website,
        phone: org.phone,
        logoUrl: org.logoUrl,
      },
      locations: locationDtos,
      menu: [],
    };
  }

  const catalogIds = catalogRows.map((c) => c.id);

  // 4. Fetch categories, packages, package items, and add-ons in parallel
  const [categoryRows, packageRows, packageItemRows, addOnRows] = await Promise.all([
    db
      .select({
        id: catalogCategories.id,
        catalogId: catalogCategories.catalogId,
        name: catalogCategories.name,
        description: catalogCategories.description,
        sortOrder: catalogCategories.sortOrder,
      })
      .from(catalogCategories)
      .where(eq(catalogCategories.isActive, true))
      .then((rows) => rows.filter((r) => catalogIds.includes(r.catalogId))),
    db
      .select({
        id: packages.id,
        catalogId: packages.catalogId,
        categoryId: packages.categoryId,
        name: packages.name,
        description: packages.description,
        pricing: packages.pricing,
        price: packages.price,
        currency: packages.currency,
        minHeadCount: packages.minHeadCount,
        maxHeadCount: packages.maxHeadCount,
        imageUrl: packages.imageUrl,
        upsellEligible: packages.upsellEligible,
        upsellFeatured: packages.upsellFeatured,
        upsellPriority: packages.upsellPriority,
        sortOrder: packages.sortOrder,
      })
      .from(packages)
      .where(eq(packages.isActive, true))
      .then((rows) => rows.filter((r) => catalogIds.includes(r.catalogId))),
    db
      .select({
        id: packageItems.id,
        packageId: packageItems.packageId,
        name: packageItems.name,
        description: packageItems.description,
        isOptional: packageItems.isOptional,
        sortOrder: packageItems.sortOrder,
      })
      .from(packageItems),
    db
      .select({
        id: addOns.id,
        catalogId: addOns.catalogId,
        name: addOns.name,
        description: addOns.description,
        price: addOns.price,
        currency: addOns.currency,
        upsellEligible: addOns.upsellEligible,
        upsellFeatured: addOns.upsellFeatured,
        upsellPriority: addOns.upsellPriority,
        sortOrder: addOns.sortOrder,
      })
      .from(addOns)
      .where(eq(addOns.isActive, true))
      .then((rows) => rows.filter((r) => catalogIds.includes(r.catalogId))),
  ]);

  // 5. Build package items lookup
  const itemsByPackageId = new Map<string, typeof packageItemRows>();
  for (const item of packageItemRows) {
    const existing = itemsByPackageId.get(item.packageId) ?? [];
    existing.push(item);
    itemsByPackageId.set(item.packageId, existing);
  }

  // 6. Build packages
  const packageDtos = packageRows
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((pkg) => {
      const items = (itemsByPackageId.get(pkg.id) ?? [])
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => ({
          name: item.name,
          description: item.description,
          isOptional: item.isOptional,
        }));

      return {
        id: pkg.id,
        categoryId: pkg.categoryId,
        name: pkg.name,
        description: pkg.description,
        pricePerHead: pkg.price,
        currency: pkg.currency,
        minimumHeadcount: pkg.minHeadCount,
        maximumHeadcount: pkg.maxHeadCount,
        imageUrl: pkg.imageUrl,
        upsellEligible: pkg.upsellEligible,
        upsellFeatured: pkg.upsellFeatured,
        upsellPriority: pkg.upsellPriority,
        includes: items,
      };
    });

  // 7. Build categories with nested packages
  const categoryDtos = categoryRows
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((cat) => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      packages: packageDtos.filter((p) => p.categoryId === cat.id),
    }));

  const uncategorized = packageDtos.filter((p) => !p.categoryId);

  // 8. Build add-ons
  const addOnDtos = addOnRows
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((a) => ({
      id: a.id,
      name: a.name,
      description: a.description,
      price: a.price,
      currency: a.currency,
      upsellEligible: a.upsellEligible,
      upsellFeatured: a.upsellFeatured,
      upsellPriority: a.upsellPriority,
    }));

  // 9. Assemble menu per catalog
  const menu = catalogRows.map((catalog) => ({
    name: catalog.name,
    description: catalog.description,
    categories: categoryDtos.filter((c) =>
      c.packages.some((p) => packageRows.find((pr) => pr.id === p.id && pr.catalogId === catalog.id)),
    ).map((c) => ({
      ...c,
      packages: c.packages.filter((p) => {
        const row = packageRows.find((pr) => pr.id === p.id);
        return row?.catalogId === catalog.id;
      }),
    })),
    uncategorizedPackages: uncategorized.filter((p) => {
      const row = packageRows.find((pr) => pr.id === p.id);
      return row?.catalogId === catalog.id;
    }),
    addOns: addOnDtos.filter((a) => {
      const row = addOnRows.find((ar) => ar.id === a.id);
      return row?.catalogId === catalog.id;
    }),
  }));

  return {
    merchant: {
      name: org.name,
      slug: org.slug,
      description: org.description,
      website: org.website,
      phone: org.phone,
      logoUrl: org.logoUrl,
    },
    locations: locationDtos,
    menu,
  };
}

export async function submitPublicOrder(slug: string, input: CreateOrderInput, eventBus: EventBus, customerUserId?: string) {
  // Resolve org from slug
  const [org] = await db
    .select({
      id: organizations.id,
      stripeAccountId: organizations.stripeAccountId,
      stripeOnboardingComplete: organizations.stripeOnboardingComplete,
    })
    .from(organizations)
    .where(and(eq(organizations.slug, slug), eq(organizations.isActive, true)))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Storefront');
  }

  const order = await createOrder(org.id, input, eventBus, customerUserId);
  const selectedLocation = input.locationId
    ? (await db
        .select({ depositRequired: locationSettings.depositRequired })
        .from(locationSettings)
        .where(eq(locationSettings.locationId, input.locationId))
        .limit(1))[0]
    : null;

  const depositRequired = selectedLocation?.depositRequired ?? true;
  const stripeReady = Boolean(isStripeEnabled() && org.stripeAccountId && org.stripeOnboardingComplete);

  if (!depositRequired && !stripeReady) {
    return {
      mode: 'order_received' as const,
      order: {
        ...order,
        depositRequired: false,
      },
    };
  }

  if (!depositRequired) {
    const storefrontBaseUrl =
      process.env.STOREFRONT_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://order.trayloophq.com'
        : 'http://localhost:3002');

    try {
      const checkout = await createFullOrderCheckoutForOrder(
        {
          id: order.id,
          orderNumber: order.orderNumber,
          status: order.status,
          totalAmount: order.pricing.total,
          merchantAmount: order.pricing.packageSubtotal + order.pricing.addOnSubtotal,
          customerId: order.customerId,
        },
        org,
        order.customer.email,
        {
          successUrl:
            `${storefrontBaseUrl}/${slug}?checkout=success&orderId=${encodeURIComponent(order.id)}` +
            `&orderNumber=${encodeURIComponent(order.orderNumber)}`,
          cancelUrl:
            `${storefrontBaseUrl}/${slug}?checkout=cancelled&orderId=${encodeURIComponent(order.id)}` +
            `&orderNumber=${encodeURIComponent(order.orderNumber)}`,
        },
      );

      return {
        mode: 'full_checkout' as const,
        order: {
          ...order,
          depositRequired: false,
        },
        checkout: {
          kind: 'order' as const,
          url: checkout.paymentLink,
          amount: checkout.amount,
          currency: checkout.currency,
          stripeCheckoutSessionId: checkout.stripeCheckoutSessionId,
        },
      };
    } catch (err) {
      console.error('[storefront] Stripe full-order checkout failed, returning order without payment link', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        error: err instanceof Error ? err.message : String(err),
      });

      return {
        mode: 'order_received' as const,
        order: {
          ...order,
          depositRequired: false,
        },
      };
    }
  }

  if (!stripeReady) {
    return {
      mode: 'deposit_pending' as const,
      order: {
        ...order,
        depositRequired: true,
      },
    };
  }

  const storefrontBaseUrl =
    process.env.STOREFRONT_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://order.trayloophq.com'
      : 'http://localhost:3002');

  try {
    const checkout = await createDepositCheckoutForOrder(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.pricing.total,
        customerId: order.customerId,
        locationId: input.locationId,
      },
      org.id,
      eventBus,
      {
        successUrl:
          `${storefrontBaseUrl}/${slug}?checkout=success&orderId=${encodeURIComponent(order.id)}` +
          `&orderNumber=${encodeURIComponent(order.orderNumber)}`,
        cancelUrl:
          `${storefrontBaseUrl}/${slug}?checkout=cancelled&orderId=${encodeURIComponent(order.id)}` +
          `&orderNumber=${encodeURIComponent(order.orderNumber)}`,
      },
    );

    return {
      mode: 'deposit_checkout' as const,
      order: {
        ...order,
        status: checkout.status,
        depositRequired: true,
      },
      checkout: {
        kind: 'deposit' as const,
        url: checkout.paymentLink,
        amount: checkout.depositAmount,
        currency: checkout.currency,
        stripeCheckoutSessionId: checkout.stripeCheckoutSessionId,
      },
    };
  } catch (err) {
    console.error('[storefront] Stripe deposit checkout failed, returning order as deposit-pending', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      error: err instanceof Error ? err.message : String(err),
    });

    return {
      mode: 'deposit_pending' as const,
      order: {
        ...order,
        depositRequired: true,
      },
    };
  }
}

interface StorefrontUpsellRequestInput {
  locationId: string;
  serviceType: 'delivery' | 'pickup' | 'full_service' | 'on_site' | 'food_truck';
  headcount: number;
  packages: Array<{ packageId: string; quantity: number }>;
  addOns?: Array<{ addOnId: string; quantity: number }>;
}

interface StorefrontUpsellTrackInput {
  sessionKey: string;
  locationId?: string;
  addOnId: string;
  eventType: 'shown' | 'clicked';
  recommendationType: string;
  suggestedQuantity: number;
  revenueCents: number;
  headline?: string;
  reason?: string;
}

export async function getStorefrontUpsellRecommendations(
  slug: string,
  input: StorefrontUpsellRequestInput,
) {
  const storefront = await getStorefront(slug);
  const locationExists = storefront.locations.some((location) => location.slug === input.locationId);

  if (!locationExists) {
    throw new NotFoundError('Location');
  }

  const allPackages = storefront.menu.flatMap((section) => [
    ...section.categories.flatMap((category) => category.packages),
    ...section.uncategorizedPackages,
  ]);
  const allAddOns = storefront.menu.flatMap((section) => section.addOns);
  const packageMap = new Map(allPackages.map((pkg) => [pkg.id, pkg]));
  const addOnMap = new Map(allAddOns.map((addOn) => [addOn.id, addOn]));

  const subtotalCents =
    input.packages.reduce((sum, selection) => {
      const pkg = packageMap.get(selection.packageId);
      return sum + (pkg ? pkg.pricePerHead * input.headcount * selection.quantity : 0);
    }, 0) +
    (input.addOns ?? []).reduce((sum, selection) => {
      const addOn = addOnMap.get(selection.addOnId);
      return sum + (addOn ? addOn.price * selection.quantity : 0);
    }, 0);

  return buildUpsellRecommendations({
    merchantName: storefront.merchant.name,
    serviceType: input.serviceType,
    headcount: input.headcount,
    subtotalCents,
    selectedPackages: input.packages
      .map((selection) => {
        const pkg = packageMap.get(selection.packageId);
        return pkg ? { id: pkg.id, name: pkg.name } : null;
      })
      .filter((pkg): pkg is { id: string; name: string } => Boolean(pkg)),
    selectedAddOnIds: (input.addOns ?? []).map((selection) => selection.addOnId),
    candidateAddOns: allAddOns,
  });
}

export async function trackStorefrontUpsellEvent(
  slug: string,
  input: StorefrontUpsellTrackInput,
) {
  const [org] = await db
    .select({ id: organizations.id })
    .from(organizations)
    .where(and(eq(organizations.slug, slug), eq(organizations.isActive, true)))
    .limit(1);

  if (!org) {
    throw new NotFoundError('Storefront');
  }

  const [validAddOn] = await db
    .select({ id: addOns.id })
    .from(addOns)
    .innerJoin(catalogs, eq(catalogs.id, addOns.catalogId))
    .where(and(eq(addOns.id, input.addOnId), eq(catalogs.organizationId, org.id)))
    .limit(1);

  if (!validAddOn) {
    throw new NotFoundError('Add-on');
  }

  if (input.locationId) {
    const [validLocation] = await db
      .select({ id: locations.id })
      .from(locations)
      .where(and(eq(locations.id, input.locationId), eq(locations.organizationId, org.id)))
      .limit(1);

    if (!validLocation) {
      throw new NotFoundError('Location');
    }
  }

  await db.insert(upsellEvents).values({
    organizationId: org.id,
    locationId: input.locationId ?? null,
    orderId: null,
    addOnId: input.addOnId,
    sessionKey: input.sessionKey,
    eventType: input.eventType,
    recommendationType: input.recommendationType,
    suggestedQuantity: input.suggestedQuantity,
    revenueCents: input.revenueCents,
    headline: input.headline ?? null,
    reason: input.reason ?? null,
  });

  return { ok: true };
}

function getStorefrontBaseUrl() {
  return process.env.STOREFRONT_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://order.trayloophq.com'
      : 'http://localhost:3002');
}

async function getPublicOrderPaymentContext(slug: string, orderId: string) {
  const [order] = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      status: orders.status,
      totalAmount: orders.totalAmount,
      currency: orders.currency,
      serviceType: orders.serviceType,
      customerId: orders.customerId,
      locationId: orders.locationId,
      organizationId: orders.organizationId,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
      stripeAccountId: organizations.stripeAccountId,
      stripeOnboardingComplete: organizations.stripeOnboardingComplete,
      customerEmail: customers.email,
      scheduledAt: orders.scheduledAt,
    })
    .from(orders)
    .innerJoin(organizations, eq(organizations.id, orders.organizationId))
    .innerJoin(customers, eq(customers.id, orders.customerId))
    .where(and(eq(orders.id, orderId), eq(organizations.slug, slug), eq(organizations.isActive, true)))
    .limit(1);

  if (!order) {
    throw new NotFoundError('Order');
  }

  const [latestDeposit] = await db
    .select({
      id: deposits.id,
      amount: deposits.amount,
      currency: deposits.currency,
      status: deposits.status,
      paidAt: deposits.paidAt,
      createdAt: deposits.createdAt,
      stripeCheckoutSessionId: deposits.stripeCheckoutSessionId,
    })
    .from(deposits)
    .where(eq(deposits.orderId, order.id))
    .orderBy(desc(deposits.createdAt))
    .limit(1);

  const [latestPayment] = await db
    .select({
      id: payments.id,
      amount: payments.amount,
      currency: payments.currency,
      status: payments.status,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
    })
    .from(payments)
    .where(eq(payments.orderId, order.id))
    .orderBy(desc(payments.createdAt))
    .limit(1);

  const [settings] = order.locationId
    ? await db
        .select({ depositRequired: locationSettings.depositRequired })
        .from(locationSettings)
        .where(eq(locationSettings.locationId, order.locationId))
        .limit(1)
    : [];

  return {
    order,
    deposit: latestDeposit ?? null,
    payment: latestPayment ?? null,
    depositRequired: settings?.depositRequired ?? true,
  };
}

export async function getPublicOrderPaymentStatus(slug: string, orderId: string) {
  const { order, deposit, payment, depositRequired } = await getPublicOrderPaymentContext(slug, orderId);

  const paymentState = depositRequired
    ? (deposit?.status ?? 'pending')
    : payment
      ? (payment.status === 'succeeded'
          ? 'paid'
          : payment.status === 'refunded' || payment.status === 'partially_refunded'
            ? 'refunded'
            : payment.status === 'failed'
              ? 'failed'
              : 'pending')
      : 'pending';

  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderStatus: order.status,
    serviceType: order.serviceType,
    totalAmount: order.totalAmount,
    currency: order.currency,
    scheduledAt: order.scheduledAt,
    depositRequired,
    checkoutType: depositRequired ? 'deposit' : 'order',
    paymentState,
    deposit: deposit
      ? {
          id: deposit.id,
          amount: deposit.amount,
          currency: deposit.currency,
          status: deposit.status,
          paidAt: deposit.paidAt,
          createdAt: deposit.createdAt,
        }
      : null,
    payment: payment
      ? {
          id: payment.id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          paidAt: payment.paidAt,
          createdAt: payment.createdAt,
        }
      : null,
    canRetryCheckout: Boolean(
      depositRequired
        ? deposit &&
          order.status === 'awaiting_deposit' &&
          deposit.status !== 'paid'
        : payment &&
          order.status === 'submitted' &&
          payment.status !== 'succeeded',
    ),
  };
}

export async function restartPublicOrderCheckout(slug: string, orderId: string, eventBus: EventBus) {
  const { order, depositRequired } = await getPublicOrderPaymentContext(slug, orderId);

  const storefrontBaseUrl = getStorefrontBaseUrl();
  if (depositRequired) {
    const checkout = await createDepositCheckoutForOrder(
      {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        totalAmount: order.totalAmount,
        customerId: order.customerId,
        locationId: order.locationId,
      },
      order.organizationId,
      eventBus,
      {
        successUrl:
          `${storefrontBaseUrl}/${slug}?checkout=success&orderId=${encodeURIComponent(order.id)}` +
          `&orderNumber=${encodeURIComponent(order.orderNumber)}`,
        cancelUrl:
          `${storefrontBaseUrl}/${slug}?checkout=cancelled&orderId=${encodeURIComponent(order.id)}` +
          `&orderNumber=${encodeURIComponent(order.orderNumber)}`,
      },
    );

    return {
      kind: 'deposit' as const,
      url: checkout.paymentLink,
      amount: checkout.depositAmount,
      currency: checkout.currency,
      stripeCheckoutSessionId: checkout.stripeCheckoutSessionId,
    };
  }

  if (order.status !== 'submitted') {
    throw new ValidationError('This order is no longer awaiting customer payment.');
  }

  const checkout = await createFullOrderCheckoutForOrder(
    {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      merchantAmount: Math.round(order.totalAmount / 1.05),
      customerId: order.customerId,
    },
    {
      id: order.organizationId,
      stripeAccountId: order.stripeAccountId,
      stripeOnboardingComplete: order.stripeOnboardingComplete,
    },
    order.customerEmail,
    {
      successUrl:
        `${storefrontBaseUrl}/${slug}?checkout=success&orderId=${encodeURIComponent(order.id)}` +
        `&orderNumber=${encodeURIComponent(order.orderNumber)}`,
      cancelUrl:
        `${storefrontBaseUrl}/${slug}?checkout=cancelled&orderId=${encodeURIComponent(order.id)}` +
        `&orderNumber=${encodeURIComponent(order.orderNumber)}`,
    },
  );

  return {
    kind: 'order' as const,
    url: checkout.paymentLink,
    amount: checkout.amount,
    currency: checkout.currency,
    stripeCheckoutSessionId: checkout.stripeCheckoutSessionId,
  };
}
