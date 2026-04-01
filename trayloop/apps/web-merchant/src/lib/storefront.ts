const STOREFRONT_URL = process.env.NEXT_PUBLIC_STOREFRONT_URL;

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, '');
}

export function getStorefrontBaseUrl() {
  if (STOREFRONT_URL) {
    return trimTrailingSlash(STOREFRONT_URL);
  }

  if (typeof window === 'undefined') {
    return 'https://order.trayloophq.com';
  }

  const origin = trimTrailingSlash(window.location.origin);

  if (origin.includes(':3003')) {
    return origin.replace(':3003', ':3002');
  }

  if (origin.includes('dashboard.trayloophq.com')) {
    return 'https://order.trayloophq.com';
  }

  if (origin.includes('trayloop-merchant.vercel.app')) {
    return 'https://trayloop-storefront.vercel.app';
  }

  return origin;
}

export function getStorefrontUrl(slug: string) {
  return `${getStorefrontBaseUrl()}/${slug}`;
}
