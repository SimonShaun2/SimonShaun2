export function getCustomerToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('customer_token');
}

export function setCustomerSession(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('customer_token', token);
}

export function clearCustomerSession() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('customer_token');
}

export function customerResetHref() {
  return '/reset-password';
}
