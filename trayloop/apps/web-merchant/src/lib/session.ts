export function clearMerchantSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('orgId');
  localStorage.removeItem('orgSlug');
}

export function merchantResetHref() {
  return '/reset-password';
}
