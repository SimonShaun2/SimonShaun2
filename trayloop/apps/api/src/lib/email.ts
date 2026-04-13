import { logger } from '@trayloop/utils';

interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailConfig {
  provider: 'smtp' | 'resend';
  from: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
  resendApiKey?: string;
}

let config: EmailConfig | null = null;

function getEmailProvider(): EmailConfig['provider'] | null {
  const explicitProvider = process.env.EMAIL_PROVIDER as EmailConfig['provider'] | undefined;
  if (explicitProvider === 'resend' || explicitProvider === 'smtp') {
    return explicitProvider;
  }

  if (process.env.RESEND_API_KEY) {
    return 'resend';
  }

  if (process.env.SMTP_HOST) {
    return 'smtp';
  }

  return null;
}

function loadConfig(): EmailConfig | null {
  const provider = getEmailProvider();
  const from =
    process.env.EMAIL_FROM ??
    process.env.RESEND_FROM_EMAIL ??
    process.env.SMTP_FROM_EMAIL ??
    null;

  if (!provider || !from) {
    return null;
  }

  if (provider === 'resend') {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return null;
    }

    return { provider, from, resendApiKey };
  }

  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (!smtpHost) {
    return null;
  }

  return { provider, from, smtpHost, smtpPort, smtpUser, smtpPass };
}

export function initEmail(): boolean {
  config = loadConfig();
  if (!config) {
    logger.warn('Email not configured - notifications will be logged only', {
      hint: 'Set EMAIL_FROM plus either RESEND_API_KEY or SMTP_HOST. EMAIL_PROVIDER is optional.',
    });
    return false;
  }

  logger.info('Email configured', { provider: config.provider, from: config.from });
  return true;
}

export function isEmailEnabled(): boolean {
  return config !== null;
}

export async function sendEmail(message: EmailMessage): Promise<boolean> {
  if (!config) {
    logger.info('Email skipped (not configured)', { to: message.to, subject: message.subject });
    return false;
  }

  try {
    if (config.provider === 'resend') {
      return await sendViaResend(message);
    }

    if (config.provider === 'smtp') {
      return await sendViaSmtp(message);
    }

    return false;
  } catch (err) {
    logger.error('Email delivery failed', {
      to: message.to,
      subject: message.subject,
      error: (err as Error).message,
    });
    return false;
  }
}

async function sendViaResend(message: EmailMessage): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config!.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: config!.from,
      to: [message.to],
      subject: message.subject,
      text: message.text,
      html: message.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }

  logger.info('Email sent via Resend', { to: message.to, subject: message.subject });
  return true;
}

async function sendViaSmtp(message: EmailMessage): Promise<boolean> {
  let nodemailer: any;
  try {
    nodemailer = await import('nodemailer');
  } catch {
    logger.error('nodemailer not installed - run: npm install nodemailer');
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: config!.smtpHost,
    port: config!.smtpPort,
    secure: config!.smtpPort === 465,
    auth: config!.smtpUser ? { user: config!.smtpUser, pass: config!.smtpPass } : undefined,
  });

  await transporter.sendMail({
    from: config!.from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });

  logger.info('Email sent via SMTP', { to: message.to, subject: message.subject });
  return true;
}
