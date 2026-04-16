/**
 * Shared formatting helpers for the merchant dashboard.
 *
 * Centralised here to avoid identical copies across pages and components.
 */

/** Format cents as a whole-dollar USD string (e.g. "$1,250"). */
export function formatCurrency(cents: number | null): string {
  if (cents == null) return '--';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

/** Compact money display without Intl overhead (e.g. "$1,250"). */
export function formatMoney(cents: number): string {
  return `$${(cents / 100).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

/** Days elapsed since a date string. Returns `null` when input is missing. */
export function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

/** Format a date string as "Jan 5, 2025". */
export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/** Format a date string as "Jan 5" (no year). */
export function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}
