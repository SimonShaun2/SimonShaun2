import { db } from '@trayloop/database';
import { users } from '@trayloop/database';
import { hashPassword, comparePassword, createToken } from '@trayloop/auth';
import { generateId } from '@trayloop/utils';
import { NotFoundError, ValidationError } from '../../lib/errors.js';
import type { EventBus } from '../../lib/event-bus/index.js';
import type { RegisterInput, LoginInput } from './users.schema.js';
import { eq } from 'drizzle-orm';

export async function register(input: RegisterInput, eventBus: EventBus) {
  const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (existing.length > 0) {
    throw new ValidationError('Email already registered');
  }

  const id = generateId();
  const passwordHash = await hashPassword(input.password);

  await db.insert(users).values({
    id,
    email: input.email,
    name: input.name,
    passwordHash,
    role: input.role || 'customer',
  });

  const token = await createToken({ sub: id, email: input.email, role: input.role || 'customer' });

  await eventBus.emit('user.registered', { userId: id, email: input.email });

  return { id, email: input.email, name: input.name, token };
}

export async function login(input: LoginInput) {
  const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (!user) {
    throw new ValidationError('Invalid email or password');
  }

  const valid = await comparePassword(input.password, user.passwordHash);
  if (!valid) {
    throw new ValidationError('Invalid email or password');
  }

  const token = await createToken({ sub: user.id, email: user.email, role: user.role });

  return { id: user.id, email: user.email, name: user.name, token };
}

export async function getProfile(userId: string) {
  const [user] = await db.select({ id: users.id, email: users.email, name: users.name, role: users.role, createdAt: users.createdAt }).from(users).where(eq(users.id, userId)).limit(1);
  if (!user) {
    throw new NotFoundError('User');
  }
  return user;
}
