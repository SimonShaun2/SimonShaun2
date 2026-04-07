function parseEnvBoolean(value: string | undefined, fallback: boolean) {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized === '1' || normalized === 'true' || normalized === 'yes' || normalized === 'on';
}

export function isAutomationsEnabled() {
  return parseEnvBoolean(process.env.AUTOMATIONS_ENABLED, process.env.NODE_ENV !== 'production');
}
