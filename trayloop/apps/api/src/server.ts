import { buildApp } from './index.js';
import { logger } from '@trayloop/utils';
import { initStripe } from './lib/stripe.js';
import { initEmail } from './lib/email.js';
import { initSms } from './lib/sms.js';
import { getAllowedOrigins } from './lib/security.js';

function validateEnv() {
  const required = ['DATABASE_URL', 'JWT_SECRET'];
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0 && process.env.NODE_ENV === 'production') {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (!process.env.JWT_SECRET) {
    console.warn('JWT_SECRET not set - using insecure default for development');
  }

  if (process.env.NODE_ENV === 'production') {
    if ((process.env.JWT_SECRET?.length ?? 0) < 32) {
      console.error('JWT_SECRET must be at least 32 characters in production');
      process.exit(1);
    }

    if (getAllowedOrigins().length === 0) {
      console.error(
        'Configure at least one production origin via MERCHANT_URL, ADMIN_URL, STOREFRONT_URL, or CORS_ALLOWED_ORIGINS',
      );
      process.exit(1);
    }
  }
}

const start = async () => {
  validateEnv();

  initStripe();
  initEmail();
  initSms();

  const app = await buildApp();
  const port = parseInt(process.env.PORT || process.env.API_PORT || '3001', 10);

  try {
    await app.listen({ port, host: '0.0.0.0' });
    logger.info(`API server running on port ${port}`);
  } catch (err) {
    logger.error('Failed to start server', { error: (err as Error).message });
    process.exit(1);
  }
};

const shutdown = async () => {
  logger.info('Shutting down gracefully...');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

start();
