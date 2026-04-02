import { logger } from '@trayloop/utils';

interface SmsMessage {
  to: string;
  body: string;
}

interface SmsConfig {
  provider: 'twilio';
  accountSid: string;
  authToken: string;
  messagingServiceSid?: string;
  fromNumber?: string;
}

let config: SmsConfig | null = null;

function loadConfig(): SmsConfig | null {
  const provider = process.env.SMS_PROVIDER as 'twilio' | undefined;
  if (!provider) return null;

  if (provider === 'twilio') {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || (!messagingServiceSid && !fromNumber)) {
      return null;
    }

    return {
      provider,
      accountSid,
      authToken,
      messagingServiceSid,
      fromNumber,
    };
  }

  return null;
}

export function initSms(): boolean {
  config = loadConfig();
  if (!config) {
    logger.warn('SMS not configured - text notifications will be logged only', {
      hint: 'Set SMS_PROVIDER=twilio, TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_MESSAGING_SERVICE_SID or TWILIO_FROM_NUMBER',
    });
    return false;
  }

  logger.info('SMS configured', {
    provider: config.provider,
    messagingServiceSid: config.messagingServiceSid ?? null,
    fromNumber: config.fromNumber ?? null,
  });
  return true;
}

export function isSmsEnabled(): boolean {
  return config !== null;
}

export async function sendSms(message: SmsMessage): Promise<boolean> {
  if (!config) {
    logger.info('SMS skipped (not configured)', { to: message.to });
    return false;
  }

  try {
    if (config.provider === 'twilio') {
      return await sendViaTwilio(message);
    }
    return false;
  } catch (err) {
    logger.error('SMS delivery failed', {
      to: message.to,
      error: (err as Error).message,
    });
    return false;
  }
}

async function sendViaTwilio(message: SmsMessage): Promise<boolean> {
  const params = new URLSearchParams({
    To: message.to,
    Body: message.body,
  });

  if (config?.messagingServiceSid) {
    params.set('MessagingServiceSid', config.messagingServiceSid);
  } else if (config?.fromNumber) {
    params.set('From', config.fromNumber);
  }

  const auth = Buffer.from(`${config!.accountSid}:${config!.authToken}`).toString('base64');
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${config!.accountSid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Twilio API error ${res.status}: ${body}`);
  }

  logger.info('SMS sent via Twilio', { to: message.to });
  return true;
}
