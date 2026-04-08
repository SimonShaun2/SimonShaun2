import { SignJWT, jwtVerify } from 'jose';

function getJwtSecret() {
  const configuredSecret = process.env.JWT_SECRET;

  if (configuredSecret) {
    return new TextEncoder().encode(configuredSecret);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production');
  }

  if (typeof globalThis !== 'undefined') {
    console.warn('[auth] JWT_SECRET not set - using insecure default for development.');
  }

  return new TextEncoder().encode('dev-secret');
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  supportOrganizationId?: string;
  supportMemberRole?: string;
}

export async function createToken(payload: TokenPayload, expiresIn = process.env.JWT_EXPIRES_IN || '7d'): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getJwtSecret());
  return payload as unknown as TokenPayload;
}
