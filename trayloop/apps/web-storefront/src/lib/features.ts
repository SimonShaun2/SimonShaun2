export const appEnvironment = (process.env.NEXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'development').toLowerCase();
export const showStagingBanner = appEnvironment === 'staging';
