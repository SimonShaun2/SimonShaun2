import type { FastifyReply, FastifyRequest } from 'fastify';
import { TooManyRequestsError } from './errors.js';

const DEFAULT_LOCAL_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'http://127.0.0.1:3003',
];

type RateLimitPolicy = {
  key: string;
  max: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const rateLimitBuckets = new Map<string, Bucket>();
let cleanupHandle: NodeJS.Timeout | null = null;

function normalizeOrigin(value: string): string | null {
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function parseOrigins(value?: string): string[] {
  if (!value) return [];
  return value
    .split(',')
    .map((part) => normalizeOrigin(part.trim()))
    .filter((origin): origin is string => Boolean(origin));
}

export function getAllowedOrigins(): string[] {
  const explicitOrigins = parseOrigins(process.env.CORS_ALLOWED_ORIGINS);

  const derivedOrigins = [
    process.env.MERCHANT_URL,
    process.env.ADMIN_URL,
    process.env.STOREFRONT_URL,
  ]
    .map((value) => (value ? normalizeOrigin(value) : null))
    .filter((origin): origin is string => Boolean(origin));

  const localOrigins = process.env.NODE_ENV === 'production' ? [] : DEFAULT_LOCAL_ORIGINS;

  return Array.from(new Set([...explicitOrigins, ...derivedOrigins, ...localOrigins]));
}

export function assertProductionOrigins(allowedOrigins: string[]) {
  if (process.env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
    throw new Error('CORS allowed origins must be configured in production');
  }
}

function getSecurityHeaders() {
  const headers: Record<string, string> = {
    'content-security-policy': "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
    'cross-origin-opener-policy': 'same-origin',
    'cross-origin-resource-policy': 'cross-origin',
    'permissions-policy': 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'x-content-type-options': 'nosniff',
    'x-dns-prefetch-control': 'off',
    'x-frame-options': 'DENY',
    'x-permitted-cross-domain-policies': 'none',
  };

  if (process.env.NODE_ENV === 'production') {
    headers['strict-transport-security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}

export function applySecurityHeaders(_request: FastifyRequest, reply: FastifyReply, done: () => void) {
  const headers = getSecurityHeaders();
  for (const [key, value] of Object.entries(headers)) {
    reply.header(key, value);
  }

  done();
}

function getRateLimitPolicy(request: FastifyRequest): RateLimitPolicy | null {
  const path = request.url.split('?')[0];

  if (path === '/health') return null;

  if (path === '/api/auth/login') {
    return { key: 'auth-login', max: 5, windowMs: 15 * 60 * 1000 };
  }

  if (path === '/api/auth/register') {
    return { key: 'auth-register', max: 10, windowMs: 60 * 60 * 1000 };
  }

  if (path === '/api/auth/refresh') {
    return { key: 'auth-refresh', max: 20, windowMs: 15 * 60 * 1000 };
  }

  if (path === '/api/auth/password-reset/request') {
    return { key: 'auth-password-reset-request', max: 5, windowMs: 60 * 60 * 1000 };
  }

  if (path === '/api/auth/password-reset/confirm') {
    return { key: 'auth-password-reset-confirm', max: 10, windowMs: 15 * 60 * 1000 };
  }

  if (path.startsWith('/api/billing')) {
    return { key: 'billing', max: 30, windowMs: 10 * 60 * 1000 };
  }

  if (path === '/api/storefront/pricing') {
    return { key: 'storefront-pricing', max: 90, windowMs: 5 * 60 * 1000 };
  }

  if (/^\/api\/storefront\/[^/]+\/order$/.test(path)) {
    return { key: 'storefront-order', max: 20, windowMs: 10 * 60 * 1000 };
  }

  if (/^\/api\/storefront\/[^/]+\/orders\/[^/]+\/deposit-checkout$/.test(path)) {
    return { key: 'storefront-deposit-restart', max: 20, windowMs: 10 * 60 * 1000 };
  }

  if (path === '/api/webhooks/stripe') {
    return { key: 'stripe-webhook', max: 180, windowMs: 60 * 1000 };
  }

  return { key: 'global', max: 300, windowMs: 60 * 1000 };
}

function getClientKey(request: FastifyRequest, policyKey: string) {
  const forwardedFor = request.headers['x-forwarded-for'];
  const forwardedIp =
    typeof forwardedFor === 'string'
      ? forwardedFor.split(',')[0]?.trim()
      : Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : undefined;

  const ip = forwardedIp || request.ip || request.socket.remoteAddress || 'unknown';
  return `${policyKey}:${ip}`;
}

function ensureCleanupLoop() {
  if (cleanupHandle) return;

  cleanupHandle = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of rateLimitBuckets.entries()) {
      if (bucket.resetAt <= now) {
        rateLimitBuckets.delete(key);
      }
    }
  }, 60 * 1000);

  cleanupHandle.unref();
}

export function enforceRateLimit(request: FastifyRequest, reply: FastifyReply, done: () => void) {
  if (request.method === 'OPTIONS') {
    done();
    return;
  }

  const policy = getRateLimitPolicy(request);
  if (!policy) {
    done();
    return;
  }

  ensureCleanupLoop();

  const bucketKey = getClientKey(request, policy.key);
  const now = Date.now();
  const existingBucket = rateLimitBuckets.get(bucketKey);

  let bucket = existingBucket;
  if (!bucket || bucket.resetAt <= now) {
    bucket = {
      count: 0,
      resetAt: now + policy.windowMs,
    };
  }

  bucket.count += 1;
  rateLimitBuckets.set(bucketKey, bucket);

  reply.header('x-ratelimit-limit', policy.max.toString());
  reply.header('x-ratelimit-remaining', Math.max(policy.max - bucket.count, 0).toString());
  reply.header('x-ratelimit-reset', Math.ceil(bucket.resetAt / 1000).toString());

  if (bucket.count > policy.max) {
    throw new TooManyRequestsError('Too many requests. Please try again in a moment.');
  }

  done();
}
