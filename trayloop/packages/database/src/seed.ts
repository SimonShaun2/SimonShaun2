import 'dotenv/config';
import { db } from './client.js';
import { hashPassword } from '@trayloop/auth';
import {
  users,
  organizations,
  organizationMemberships,
  locations,
  locationSettings,
  catalogs,
  catalogCategories,
  packages,
  packageItems,
  addOns,
  customers,
  customerAddresses,
  orders,
  orderItems,
  payments,
} from './schema/index.js';

const SEED_PASSWORD = 'password123';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // Hash a real password for all seed users
  const hashedPassword = await hashPassword(SEED_PASSWORD);
  console.log(`  Using password "${SEED_PASSWORD}" for all seed users\n`);

  // --- Users ---
  console.log('Creating users...');
  const [ownerUser] = await db.insert(users).values({
    email: 'owner@trayloop.dev',
    name: 'Alex Rivera',
    passwordHash: hashedPassword,
    role: 'merchant',
    emailVerified: true,
    isActive: true,
  }).returning();

  const [staffUser] = await db.insert(users).values({
    email: 'staff@trayloop.dev',
    name: 'Jordan Lee',
    passwordHash: hashedPassword,
    role: 'merchant',
    emailVerified: true,
    isActive: true,
  }).returning();

  const [customerUser] = await db.insert(users).values({
    email: 'customer@trayloop.dev',
    name: 'Sam Chen',
    passwordHash: hashedPassword,
    role: 'customer',
    emailVerified: true,
    isActive: true,
  }).returning();

  console.log(`  ✓ Created ${ownerUser.name}, ${staffUser.name}, ${customerUser.name}`);

  // --- Organization ---
  console.log('Creating organization...');
  const [org] = await db.insert(organizations).values({
    name: 'TrayLoop Catering Co.',
    slug: 'trayloop-catering',
    description: 'Premium corporate catering and event services',
    website: 'https://trayloop-catering.dev',
    phone: '(555) 123-4567',
    ownerId: ownerUser.id,
    isActive: true,
  }).returning();

  console.log(`  ✓ Created org: ${org.name}`);

  // --- Memberships ---
  console.log('Creating memberships...');
  await db.insert(organizationMemberships).values([
    {
      userId: ownerUser.id,
      organizationId: org.id,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
    },
    {
      userId: staffUser.id,
      organizationId: org.id,
      role: 'manager',
      status: 'active',
      joinedAt: new Date(),
    },
  ]);

  console.log('  ✓ Added owner and manager memberships');

  // --- Location ---
  console.log('Creating location...');
  const [location] = await db.insert(locations).values({
    organizationId: org.id,
    name: 'Downtown Kitchen',
    address: '123 Main Street, Suite 100',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701',
    country: 'US',
    phone: '(555) 123-4567',
    email: 'downtown@trayloop-catering.dev',
    isActive: true,
  }).returning();

  await db.insert(locationSettings).values({
    locationId: location.id,
    leadTimeDays: 2,
    minOrderAmount: 5000,
    maxOrderAmount: 500000,
    serviceTypes: ['delivery', 'pickup', 'full_service'],
    deliveryEnabled: true,
    pickupEnabled: true,
    deliveryRadius: 25,
    operatingHours: {
      monday: { open: '06:00', close: '20:00' },
      tuesday: { open: '06:00', close: '20:00' },
      wednesday: { open: '06:00', close: '20:00' },
      thursday: { open: '06:00', close: '20:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '08:00', close: '22:00' },
      sunday: { open: '08:00', close: '18:00' },
    },
  });

  console.log(`  ✓ Created location: ${location.name} with settings`);

  // --- Catalog ---
  console.log('Creating catalog...');
  const [catalog] = await db.insert(catalogs).values({
    organizationId: org.id,
    name: 'Main Menu',
    description: 'Our full catering menu',
    isActive: true,
  }).returning();

  const [lunchCategory] = await db.insert(catalogCategories).values({
    catalogId: catalog.id,
    name: 'Lunch Packages',
    description: 'Perfect for corporate lunch meetings',
    sortOrder: 1,
  }).returning();

  const [eventCategory] = await db.insert(catalogCategories).values({
    catalogId: catalog.id,
    name: 'Event Packages',
    description: 'Full-service event catering',
    sortOrder: 2,
  }).returning();

  console.log(`  ✓ Created catalog: ${catalog.name} with 2 categories`);

  // --- Packages ---
  console.log('Creating packages...');
  const [basicLunch] = await db.insert(packages).values({
    catalogId: catalog.id,
    categoryId: lunchCategory.id,
    name: 'Basic Lunch Box',
    description: 'Individual boxed lunch with sandwich, side, cookie, and drink',
    pricing: 'per_head',
    price: 1495,
    currency: 'USD',
    minHeadCount: 10,
    maxHeadCount: 200,
    sortOrder: 1,
  }).returning();

  const [premiumLunch] = await db.insert(packages).values({
    catalogId: catalog.id,
    categoryId: lunchCategory.id,
    name: 'Premium Lunch Buffet',
    description: 'Buffet-style lunch with salad bar, two entrees, sides, and dessert',
    pricing: 'per_head',
    price: 2995,
    currency: 'USD',
    minHeadCount: 20,
    maxHeadCount: 500,
    sortOrder: 2,
  }).returning();

  const [eventPackage] = await db.insert(packages).values({
    catalogId: catalog.id,
    categoryId: eventCategory.id,
    name: 'Corporate Event Package',
    description: 'Full-service catering for corporate events including setup and teardown',
    pricing: 'per_head',
    price: 7500,
    currency: 'USD',
    minHeadCount: 50,
    maxHeadCount: 1000,
    sortOrder: 1,
  }).returning();

  console.log(`  ✓ Created 3 packages: ${basicLunch.name}, ${premiumLunch.name}, ${eventPackage.name}`);

  // --- Package Items ---
  await db.insert(packageItems).values([
    { packageId: basicLunch.id, name: 'Artisan Sandwich', type: 'service', sortOrder: 1 },
    { packageId: basicLunch.id, name: 'Seasonal Side Salad', type: 'service', sortOrder: 2 },
    { packageId: basicLunch.id, name: 'Fresh-Baked Cookie', type: 'service', sortOrder: 3 },
    { packageId: basicLunch.id, name: 'Bottled Water or Soda', type: 'service', sortOrder: 4 },
    { packageId: premiumLunch.id, name: 'Garden Salad Bar', type: 'service', sortOrder: 1 },
    { packageId: premiumLunch.id, name: 'Choice of Two Entrees', type: 'service', sortOrder: 2 },
    { packageId: premiumLunch.id, name: 'Two Side Dishes', type: 'service', sortOrder: 3 },
    { packageId: premiumLunch.id, name: 'Dessert Station', type: 'service', sortOrder: 4 },
    { packageId: premiumLunch.id, name: 'Beverage Service', type: 'service', sortOrder: 5 },
    { packageId: eventPackage.id, name: 'Full Buffet Service', type: 'service', sortOrder: 1 },
    { packageId: eventPackage.id, name: 'Appetizer Station', type: 'service', sortOrder: 2 },
    { packageId: eventPackage.id, name: 'Bar Service', type: 'service', isOptional: true, sortOrder: 3 },
    { packageId: eventPackage.id, name: 'Setup & Teardown', type: 'service', sortOrder: 4 },
    { packageId: eventPackage.id, name: 'Wait Staff (4 hours)', type: 'service', sortOrder: 5 },
  ]);

  console.log('  ✓ Created package items');

  // --- Add-ons ---
  await db.insert(addOns).values([
    { catalogId: catalog.id, name: 'Extra Dessert Tray', price: 4500, sortOrder: 1 },
    { catalogId: catalog.id, name: 'Charcuterie Board', price: 6500, sortOrder: 2 },
    { catalogId: catalog.id, name: 'Fresh Fruit Platter', price: 3500, sortOrder: 3 },
    { catalogId: catalog.id, name: 'Coffee & Tea Service', price: 300, description: 'Per person', sortOrder: 4 },
    { catalogId: catalog.id, name: 'Linen Upgrade', price: 15000, description: 'Premium tablecloths and napkins', sortOrder: 5 },
  ]);

  console.log('  ✓ Created 5 add-ons');

  // --- Customers ---
  console.log('Creating customers...');
  const [customer1] = await db.insert(customers).values({
    organizationId: org.id,
    userId: customerUser.id,
    email: 'sam.chen@acmecorp.dev',
    firstName: 'Sam',
    lastName: 'Chen',
    phone: '(555) 987-6543',
    companyName: 'Acme Corp',
    notes: 'Prefers vegetarian options. Frequent corporate lunch orders.',
  }).returning();

  const [customer2] = await db.insert(customers).values({
    organizationId: org.id,
    email: 'maria.garcia@techstart.dev',
    firstName: 'Maria',
    lastName: 'Garcia',
    phone: '(555) 456-7890',
    companyName: 'TechStart Inc.',
    notes: 'Monthly team lunch orders. Nut allergy on team.',
  }).returning();

  console.log(`  ✓ Created customers: ${customer1.firstName} ${customer1.lastName}, ${customer2.firstName} ${customer2.lastName}`);

  // --- Customer Addresses ---
  await db.insert(customerAddresses).values([
    {
      customerId: customer1.id,
      label: 'Office',
      address: '456 Corporate Blvd, Floor 3',
      city: 'Austin',
      state: 'TX',
      zipCode: '78702',
      isDefault: true,
    },
    {
      customerId: customer2.id,
      label: 'Main Office',
      address: '789 Innovation Way',
      city: 'Austin',
      state: 'TX',
      zipCode: '78703',
      isDefault: true,
    },
  ]);

  console.log('  ✓ Created customer addresses');

  // --- Sample Order ---
  console.log('Creating sample order...');
  const [order] = await db.insert(orders).values({
    orderNumber: 'TL-000001',
    organizationId: org.id,
    locationId: location.id,
    customerId: customer1.id,
    status: 'confirmed',
    totalAmount: 74750,
    currency: 'USD',
    headCount: 50,
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    notes: 'Corporate lunch for quarterly all-hands meeting',
  }).returning();

  await db.insert(orderItems).values([
    {
      orderId: order.id,
      packageId: basicLunch.id,
      name: 'Basic Lunch Box x50',
      quantity: 50,
      unitPrice: 1495,
      totalPrice: 74750,
    },
  ]);

  console.log(`  ✓ Created order #${order.id.slice(0, 8)}... ($747.50)`);

  // --- Sample Payment ---
  await db.insert(payments).values({
    orderId: order.id,
    amount: 74750,
    currency: 'USD',
    status: 'succeeded',
    method: 'card',
    paidAt: new Date(),
  });

  console.log('  ✓ Created payment record');

  console.log('\n✅ Seed complete!\n');
  console.log('Summary:');
  console.log('  • 3 users (owner, staff, customer)');
  console.log('  • 1 organization with 2 memberships');
  console.log('  • 1 location with settings');
  console.log('  • 1 catalog, 2 categories, 3 packages, 14 package items, 5 add-ons');
  console.log('  • 2 customers with addresses');
  console.log('  • 1 sample order with payment');

  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
