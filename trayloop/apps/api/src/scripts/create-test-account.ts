import { db, organizations, organizationMemberships, users } from '@trayloop/database';
import { hashPassword } from '@trayloop/auth';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { parseArgs } from 'node:util';

const { values } = parseArgs({
  options: {
    email: { type: 'string' },
    password: { type: 'string' },
    org: { type: 'string' },
  },
  strict: true,
});

const email = values.email;
const password = values.password;
const orgName = values.org;

if (!email || !password || !orgName) {
  console.error('Usage: npx tsx src/scripts/create-test-account.ts --email test@example.com --password testpass123 --org "Test Restaurant"');
  process.exit(1);
}

async function main() {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email!))
    .limit(1);

  if (existing) {
    console.error(`A user with email ${email} already exists.`);
    process.exit(1);
  }

  const slug = orgName!
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) + '-' + randomBytes(2).toString('hex');

  const passwordHash = await hashPassword(password!);

  const result = await db.transaction(async (tx) => {
    const [user] = await tx
      .insert(users)
      .values({
        email: email!,
        name: orgName!,
        passwordHash,
        role: 'merchant',
        emailVerified: true,
        isActive: true,
      })
      .returning({ id: users.id, email: users.email, name: users.name });

    const [org] = await tx
      .insert(organizations)
      .values({
        name: orgName!,
        slug,
        ownerId: user.id,
        isTestAccount: true,
      })
      .returning({ id: organizations.id, name: organizations.name, slug: organizations.slug });

    await tx.insert(organizationMemberships).values({
      userId: user.id,
      organizationId: org.id,
      role: 'owner',
      status: 'active',
      joinedAt: new Date(),
    });

    return { user, org };
  });

  const dashboardUrl = process.env.MERCHANT_URL || 'https://dashboard.trayloophq.com';

  console.log('\nTest account created successfully:\n');
  console.log(`  User ID:        ${result.user.id}`);
  console.log(`  Org ID:         ${result.org.id}`);
  console.log(`  Org Slug:       ${result.org.slug}`);
  console.log(`  Email:          ${result.user.email}`);
  console.log(`  Password:       ${password}`);
  console.log(`  is_test_account: true`);
  console.log(`  Login URL:      ${dashboardUrl}/login`);
  console.log();

  process.exit(0);
}

main().catch((err) => {
  console.error('Failed to create test account:', err);
  process.exit(1);
});
