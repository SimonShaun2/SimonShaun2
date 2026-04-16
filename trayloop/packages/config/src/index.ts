/**
 * Parse a string environment variable as a boolean.
 *
 * Recognises "1", "true", "yes", and "on" (case-insensitive) as truthy.
 * Returns `fallback` when the value is undefined or null.
 */
export function parseEnvBoolean(value: string | undefined, fallback: boolean): boolean {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}
