import { db } from '@trayloop/database';
import { users, organizationMemberships, organizations, customers, orders, passwordResetTokens } from '@trayloop/database';
import { hashPassword, comparePassword, createToken, verifyToken } from '@trayloop/auth';
import { and, desc, eq, gt, inArray, isNull } from 'drizzle-orm';
import { ValidationError, UnauthorizedError, NotFoundError } from '../../lib/errors.js';
import type { EventBus } from '../../lib/event-bus/index.js';
import { sendEmail } from '../../lib/email.js';
import type {
  RegisterInput,
  LoginInput,
  CustomerRegisterInput,
  PasswordResetRequestInput,
  PasswordResetConfirmInput,
} from './auth.schema.js';
import { createHash, randomBytes } from 'node:crypto';

type ResetApp = 'merchant' | 'admin' | 'customer';

export async function register(input: RegisterInput, eventBus: EventBus) {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing) {
    throw new ValidationError('Email already registered');
  }

  const passwordHash = await hashPassword(input.password);

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      name: input.name,
      passwordHash,
      role: 'merchant',
      emailVerified: false,
      isActive: true,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    });

  const token = await createToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  await eventBus.emit('user.registered', { userId: user.id, email: user.email });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  };
}

async function linkCustomersByEmailToUser(userId: string, email: string) {
  await db
    .update(customers)
    .set({
      userId,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.email, email), isNull(customers.userId)));
}

export async function registerCustomer(input: CustomerRegisterInput, eventBus: EventBus) {
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (existing) {
    throw new ValidationError('Email already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const displayName = `${input.firstName} ${input.lastName}`.trim();

  const [user] = await db
    .insert(users)
    .values({
      email: input.email,
      name: displayName,
      passwordHash,
      role: 'customer',
      emailVerified: false,
      isActive: true,
    })
    .returning({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
    });

  await linkCustomersByEmailToUser(user.id, user.email);

  const token = await createToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  await eventBus.emit('user.registered', { userId: user.id, email: user.email });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  };
}

export async function login(input: LoginInput) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      passwordHash: users.passwordHash,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, input.email))
    .limit(1);

  if (!user) {
    throw new ValidationError('Invalid email or password');
  }

  if (!user.isActive) {
    throw new UnauthorizedError('Account is deactivated');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new ValidationError('Invalid email or password');
  }

  // Update last login timestamp
  await db
    .update(users)
    .set({ lastLoginAt: new Date() })
    .where(eq(users.id, user.id));

  const token = await createToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  // Fetch user's organization memberships
  const memberships = await db
    .select({
      organizationId: organizationMemberships.organizationId,
      role: organizationMemberships.role,
      orgName: organizations.name,
      orgSlug: organizations.slug,
    })
    .from(organizationMemberships)
    .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(eq(organizationMemberships.userId, user.id));

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
    organizations: memberships.map((m) => ({
      id: m.organizationId,
      name: m.orgName,
      slug: m.orgSlug,
      role: m.role,
    })),
  };
}

export async function refreshToken(token: string) {
  const payload = await verifyToken(token);

  const [user] = await db
    .select({ id: users.id, email: users.email, role: users.role, isActive: users.isActive })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!user || !user.isActive) {
    throw new UnauthorizedError('User not found or deactivated');
  }

  const newToken = await createToken({
    sub: user.id,
    email: user.email,
    role: user.role,
  });

  return { token: newToken };
}

export async function getMe(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      avatarUrl: users.avatarUrl,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User');
  }

  const memberships = await db
    .select({
      organizationId: organizationMemberships.organizationId,
      role: organizationMemberships.role,
      orgName: organizations.name,
      orgSlug: organizations.slug,
    })
    .from(organizationMemberships)
    .innerJoin(organizations, eq(organizations.id, organizationMemberships.organizationId))
    .where(eq(organizationMemberships.userId, userId));

  return {
    ...user,
    organizations: memberships.map((m) => ({
      id: m.organizationId,
      name: m.orgName,
      slug: m.orgSlug,
      role: m.role,
    })),
  };
}

export async function getCustomerAccount(userId: string) {
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) {
    throw new NotFoundError('User');
  }

  if (user.role !== 'customer') {
    throw new UnauthorizedError('Customer account required');
  }

  const linkedCustomers = await db
    .select({
      id: customers.id,
      organizationId: customers.organizationId,
      email: customers.email,
      firstName: customers.firstName,
      lastName: customers.lastName,
      phone: customers.phone,
      companyName: customers.companyName,
      createdAt: customers.createdAt,
      organizationName: organizations.name,
      organizationSlug: organizations.slug,
    })
    .from(customers)
    .innerJoin(organizations, eq(organizations.id, customers.organizationId))
    .where(eq(customers.userId, userId))
    .orderBy(desc(customers.updatedAt), desc(customers.createdAt));

  const customerIds = linkedCustomers.map((customer) => customer.id);
  const orderRows = customerIds.length === 0
    ? []
    : await db
        .select({
          id: orders.id,
          orderNumber: orders.orderNumber,
          status: orders.status,
          totalAmount: orders.totalAmount,
          currency: orders.currency,
          headCount: orders.headCount,
          scheduledAt: orders.scheduledAt,
          createdAt: orders.createdAt,
          customerId: orders.customerId,
          organizationName: organizations.name,
          organizationSlug: organizations.slug,
        })
        .from(orders)
        .innerJoin(organizations, eq(organizations.id, orders.organizationId))
        .where(inArray(orders.customerId, customerIds))
        .orderBy(desc(orders.scheduledAt), desc(orders.createdAt));

  const primaryCustomer = linkedCustomers[0] ?? null;

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
    profile: primaryCustomer
      ? {
          firstName: primaryCustomer.firstName,
          lastName: primaryCustomer.lastName,
          email: primaryCustomer.email,
          phone: primaryCustomer.phone,
          companyName: primaryCustomer.companyName,
        }
      : {
          firstName: user.name.split(' ')[0] ?? '',
          lastName: user.name.split(' ').slice(1).join(' '),
          email: user.email,
          phone: null,
          companyName: null,
        },
    customerRecords: linkedCustomers.map((customer) => ({
      id: customer.id,
      organizationId: customer.organizationId,
      organizationName: customer.organizationName,
      organizationSlug: customer.organizationSlug,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      companyName: customer.companyName,
      createdAt: customer.createdAt,
    })),
    orders: orderRows.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: order.totalAmount,
      currency: order.currency,
      headCount: order.headCount,
      scheduledAt: order.scheduledAt,
      createdAt: order.createdAt,
      organizationName: order.organizationName,
      organizationSlug: order.organizationSlug,
    })),
  };
}

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function resolveResetBaseUrl(app: ResetApp) {
  if (app === 'admin') {
    return process.env.ADMIN_URL || 'https://master.trayloophq.com';
  }

  if (app === 'merchant') {
    const configured = process.env.MERCHANT_URL || 'https://dashboard.trayloophq.com';
    try {
      const url = new URL(configured);
      return url.origin;
    } catch {
      return configured.replace(/\/+$/, '');
    }
  }

  return process.env.STOREFRONT_URL || 'https://order.trayloophq.com';
}

function roleMatchesResetApp(role: string, app: ResetApp) {
  return role === app;
}

function buildResetEmail(userName: string, resetLink: string, app: ResetApp) {
  const subjectPrefix = app === 'admin' ? 'TrayLoop Admin' : app === 'merchant' ? 'TrayLoop Merchant' : 'TrayLoop';
  return {
    subject: `${subjectPrefix} password reset`,
    text: [
      `Hi ${userName || 'there'},`,
      '',
      'We received a request to reset your password.',
      `Reset it here: ${resetLink}`,
      '',
      'This link expires in 2 hours. If you did not request this, you can ignore this email.',
    ].join('\n'),
    html: `
      <p>Hi ${userName || 'there'},</p>
      <p>We received a request to reset your password.</p>
      <p><a href="${resetLink}">Reset your password</a></p>
      <p>This link expires in 2 hours. If you did not request this, you can ignore this email.</p>
    `,
  };
}

export async function requestPasswordReset(input: PasswordResetRequestInput) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      isActive: users.isActive,
    })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1);

  if (!user || !user.isActive || !roleMatchesResetApp(user.role, input.app)) {
    return { success: true };
  }

  const rawToken = randomBytes(32).toString('hex');
  const tokenHash = hashResetToken(rawToken);
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);

  await db.transaction(async (tx) => {
    await tx
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(and(eq(passwordResetTokens.userId, user.id), isNull(passwordResetTokens.usedAt)));

    await tx.insert(passwordResetTokens).values({
      userId: user.id,
      app: input.app,
      tokenHash,
      expiresAt,
    });
  });

  const resetBaseUrl = resolveResetBaseUrl(input.app);
  const resetLink = `${resetBaseUrl}/reset-password?token=${encodeURIComponent(rawToken)}&app=${encodeURIComponent(input.app)}`;
  const message = buildResetEmail(user.name, resetLink, input.app);

  const delivered = await sendEmail({
    to: user.email,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  if (!delivered) {
    console.info('[auth] password reset email not delivered; fallback link', {
      email: user.email,
      app: input.app,
      resetLink,
    });
  }

  return { success: true };
}

export async function confirmPasswordReset(input: PasswordResetConfirmInput) {
  const tokenHash = hashResetToken(input.token);
  const now = new Date();

  const [resetToken] = await db
    .select({
      id: passwordResetTokens.id,
      userId: passwordResetTokens.userId,
      app: passwordResetTokens.app,
      expiresAt: passwordResetTokens.expiresAt,
      usedAt: passwordResetTokens.usedAt,
    })
    .from(passwordResetTokens)
    .where(eq(passwordResetTokens.tokenHash, tokenHash))
    .limit(1);

  if (!resetToken || resetToken.app !== input.app) {
    throw new ValidationError('This reset link is invalid or has already been used');
  }

  if (resetToken.usedAt || resetToken.expiresAt <= now) {
    throw new ValidationError('This reset link has expired. Request a new one.');
  }

  const passwordHash = await hashPassword(input.password);

  await db.transaction(async (tx) => {
    const [updated] = await tx
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(and(
        eq(passwordResetTokens.id, resetToken.id),
        isNull(passwordResetTokens.usedAt),
        gt(passwordResetTokens.expiresAt, now),
      ))
      .returning({ id: passwordResetTokens.id });

    if (!updated) {
      throw new ValidationError('This reset link has expired. Request a new one.');
    }

    await tx
      .update(users)
      .set({
        passwordHash,
        updatedAt: now,
      })
      .where(eq(users.id, resetToken.userId));

    await tx
      .update(passwordResetTokens)
      .set({ usedAt: now })
      .where(and(eq(passwordResetTokens.userId, resetToken.userId), isNull(passwordResetTokens.usedAt)));
  });

  return { success: true };
}
