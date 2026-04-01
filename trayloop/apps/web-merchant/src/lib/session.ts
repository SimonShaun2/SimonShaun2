export function clearMerchantSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('orgId');
  localStorage.removeItem('orgSlug');
  localStorage.removeItem('orgName');
}

export function merchantResetHref() {
  return '/reset-password';
}
