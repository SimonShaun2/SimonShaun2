BEGIN;

DO $$ BEGIN
  CREATE TYPE ai_campaign_segment AS ENUM ('frequent', 'at_risk', 'dormant');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ai_campaign_channel AS ENUM ('email', 'sms_copy');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ai_campaign_status AS ENUM ('draft', 'sent', 'copied');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE ai_campaign_recipient_status AS ENUM ('pending', 'sent', 'copied', 'failed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS ai_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  segment ai_campaign_segment NOT NULL,
  channel ai_campaign_channel NOT NULL,
  status ai_campaign_status NOT NULL DEFAULT 'draft',
  generated_subject TEXT,
  generated_email_body TEXT,
  generated_sms_body TEXT,
  selected_target_count INTEGER NOT NULL DEFAULT 0,
  estimated_revenue_cents INTEGER NOT NULL DEFAULT 0,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS ai_campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES ai_campaigns(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  channel ai_campaign_channel NOT NULL,
  delivery_status ai_campaign_recipient_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_campaigns_org_created_at_idx
  ON ai_campaigns (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS ai_campaign_recipients_campaign_idx
  ON ai_campaign_recipients (campaign_id);

CREATE INDEX IF NOT EXISTS ai_campaign_recipients_customer_idx
  ON ai_campaign_recipients (customer_id);

COMMIT;
