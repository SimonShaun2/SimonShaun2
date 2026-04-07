const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const LEGACY_TOKEN_KEY = 'token';
const SESSION_MARKER_KEY = 'merchant_session_present';

export function hasMerchantSession() {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(SESSION_MARKER_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY));
}

export function markMerchantSession() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_MARKER_KEY, '1');
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export async function ensureMerchantSession() {
  if (typeof window === 'undefined') return;

  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);
  if (!legacyToken || localStorage.getItem(SESSION_MARKER_KEY)) {
    return;
  }

  const response = await fetch(`${API_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ token: legacyToken }),
  });

  if (!response.ok) {
    clearMerchantSession();
    return;
  }

  markMerchantSession();
}

export function clearMerchantSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(SESSION_MARKER_KEY);
  localStorage.removeItem('orgId');
  localStorage.removeItem('orgSlug');
  localStorage.removeItem('orgName');
}

export function merchantResetHref() {
  return '/reset-password';
}
