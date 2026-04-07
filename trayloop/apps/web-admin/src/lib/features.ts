function parseEnvBoolean(value: string | undefined, fallback: boolean) {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

export const appEnvironment = (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
export const showStagingBanner = appEnvironment === 'staging';
export const automationsEnabled = parseEnvBoolean(
  process.env.NEXT_PUBLIC_AUTOMATIONS_ENABLED,
  process.env.NODE_ENV !== 'production',
);
