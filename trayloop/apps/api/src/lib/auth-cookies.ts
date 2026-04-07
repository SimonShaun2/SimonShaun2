import type { FastifyReply, FastifyRequest } from 'fastify';

export type SessionScope = 'merchant' | 'admin' | 'customer';

const SESSION_SCOPE_HEADER = 'x-trayloop-session-scope';
const SESSION_COOKIES: Record<SessionScope, string> = {
  merchant: 'trayloop_merchant_session',
  admin: 'trayloop_admin_session',
  customer: 'trayloop_customer_session',
};

function normalizeScope(value: string | undefined | null): SessionScope | null {
  if (value === 'merchant' || value === 'admin' || value === 'customer') {
    return value;
  }

  return null;
}

function serializeCookie(name: string, value: string, options: {
  maxAge?: number;
  expires?: Date;
}) {
  const parts = [`${name}=${encodeURIComponent(value)}`, 'Path=/', 'HttpOnly'];

  if (process.env.NODE_ENV === 'production') {
    parts.push('Secure', 'SameSite=None');
  } else {
    parts.push('SameSite=Lax');
  }

  if (typeof options.maxAge === 'number') {
    parts.push(`Max-Age=${options.maxAge}`);
  }

  if (options.expires) {
    parts.push(`Expires=${options.expires.toUTCString()}`);
  }

  return parts.join('; ');
}

function appendSetCookie(reply: FastifyReply, cookie: string) {
  const existing = reply.getHeader('set-cookie');

  if (!existing) {
    reply.header('set-cookie', [cookie]);
    return;
  }

  if (Array.isArray(existing)) {
    reply.header('set-cookie', [...existing, cookie]);
    return;
  }

  reply.header('set-cookie', [String(existing), cookie]);
}

export function getSessionScopeForRole(role: string): SessionScope {
  if (role === 'admin') return 'admin';
  if (role === 'customer') return 'customer';
  return 'merchant';
}

export function setSessionCookie(reply: FastifyReply, token: string, scope: SessionScope) {
  appendSetCookie(reply, serializeCookie(SESSION_COOKIES[scope], token, {
    maxAge: 7 * 24 * 60 * 60,
  }));
}

export function clearSessionCookies(reply: FastifyReply) {
  const expires = new Date(0);
  for (const cookieName of Object.values(SESSION_COOKIES)) {
    appendSetCookie(reply, serializeCookie(cookieName, '', {
      expires,
      maxAge: 0,
    }));
  }
}

function parseCookies(header: FastifyRequest['headers']['cookie']) {
  const source = Array.isArray(header) ? header.join(';') : header ?? '';
  const cookies: Record<string, string> = {};

  for (const part of source.split(';')) {
    const [rawName, ...rawValue] = part.split('=');
    const name = rawName?.trim();
    if (!name) continue;
    cookies[name] = decodeURIComponent(rawValue.join('=').trim());
  }

  return cookies;
}

export function getSessionTokenFromRequest(request: FastifyRequest): string | null {
  const cookies = parseCookies(request.headers.cookie);
  const requestedScope = normalizeScope(
    Array.isArray(request.headers[SESSION_SCOPE_HEADER])
      ? request.headers[SESSION_SCOPE_HEADER][0]
      : request.headers[SESSION_SCOPE_HEADER],
  );

  const cookieNames = requestedScope
    ? [SESSION_COOKIES[requestedScope], ...Object.values(SESSION_COOKIES).filter((name) => name !== SESSION_COOKIES[requestedScope])]
    : Object.values(SESSION_COOKIES);

  for (const cookieName of cookieNames) {
    const token = cookies[cookieName];
    if (token) {
      return token;
    }
  }

  return null;
}
