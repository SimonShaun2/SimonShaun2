import type { EventBus } from '../../lib/event-bus/index.js';
import type { RegisterInput, LoginInput } from './auth.schema.js';

export async function register(input: RegisterInput, eventBus: EventBus) {
  // TODO: Create user, hash password, generate token
  // await eventBus.emit('user.registered', { userId, email: input.email });
  throw new Error('Not implemented');
}

export async function login(input: LoginInput) {
  // TODO: Verify credentials, generate token
  throw new Error('Not implemented');
}

export async function refreshToken(token: string) {
  // TODO: Validate and refresh JWT
  throw new Error('Not implemented');
}
