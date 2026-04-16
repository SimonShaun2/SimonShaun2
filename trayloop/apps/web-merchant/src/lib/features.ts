import { parseEnvBoolean } from '@trayloop/config';

export const appEnvironment = (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
export const showStagingBanner = appEnvironment === 'staging';
export const automationsEnabled = parseEnvBoolean(
  process.env.NEXT_PUBLIC_AUTOMATIONS_ENABLED,
  process.env.NODE_ENV !== 'production',
);
export const growthAdvisorEnabled = parseEnvBoolean(
  process.env.NEXT_PUBLIC_GROWTH_ADVISOR_ENABLED,
  false,
);
