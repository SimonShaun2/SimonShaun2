import { db } from '@trayloop/database';
import { users, organizationMemberships, organizations } from '@trayloop/database';
import { hashPassword, comparePassword, createToken, verifyToken } from '@trayloop/auth';
import { eq } from 'drizzle-orm';
import { ValidationError, UnauthorizedError, NotFoundError } from '../../lib/errors.js';
import type { EventBus } from '../../lib/event-bus/index.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';

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
