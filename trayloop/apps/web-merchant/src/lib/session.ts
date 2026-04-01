export function clearMerchantSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('orgId');
  localStorage.removeItem('orgSlug');
}

export function merchantResetHref() {
  return 'mailto:admin@trayloophq.com?subject=TrayLoop%20merchant%20password%20reset';
}
