const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const LEGACY_TOKEN_KEY = 'admin_token';
const SESSION_MARKER_KEY = 'admin_session_present';

export function hasAdminSession() {
  if (typeof window === 'undefined') return false;
  return Boolean(localStorage.getItem(SESSION_MARKER_KEY) || localStorage.getItem(LEGACY_TOKEN_KEY));
}

export function markAdminSession() {
  if (typeof window === 'undefined') return;
  localStorage.setItem(SESSION_MARKER_KEY, '1');
  localStorage.removeItem(LEGACY_TOKEN_KEY);
}

export async function ensureAdminSession() {
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
    clearAdminSession();
    return;
  }

  markAdminSession();
}

export function clearAdminSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LEGACY_TOKEN_KEY);
  localStorage.removeItem(SESSION_MARKER_KEY);
}
