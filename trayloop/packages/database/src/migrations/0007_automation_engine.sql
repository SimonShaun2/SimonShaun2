BEGIN;

CREATE TABLE IF NOT EXISTS automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name varchar(120) NOT NULL,
  rule_type varchar(32) NOT NULL,
  segment varchar(32) NOT NULL,
  status varchar(16) NOT NULL DEFAULT 'active',
  approval_mode varchar(24) NOT NULL DEFAULT 'approval_required',
  email_enabled boolean NOT NULL DEFAULT true,
  sms_mode varchar(24) NOT NULL DEFAULT 'copy_only',
  timing_window_days integer NOT NULL DEFAULT 7,
  throttle_days integer NOT NULL DEFAULT 7,
  max_targets integer NOT NULL DEFAULT 25,
  goal_notes text,
  tone_notes text,
  last_evaluated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  automation_rule_id uuid NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
  created_by_user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ai_campaign_id uuid REFERENCES ai_campaigns(id) ON DELETE SET NULL,
  rule_type varchar(32) NOT NULL,
  segment varchar(32) NOT NULL,
  execution_mode varchar(24) NOT NULL DEFAULT 'scheduled',
  status varchar(24) NOT NULL DEFAULT 'pending_approval',
  reason_summary text NOT NULL,
  generated_subject text,
  generated_email_body text,
  generated_sms_body text,
  selected_target_count integer NOT NULL DEFAULT 0,
  estimated_revenue_cents integer NOT NULL DEFAULT 0,
  scheduled_for timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_run_recipients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_run_id uuid NOT NULL REFERENCES automation_runs(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  channel varchar(24) NOT NULL DEFAULT 'email',
  delivery_status varchar(24) NOT NULL DEFAULT 'pending',
  skip_reason text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS automation_rules_org_status_idx
  ON automation_rules (organization_id, status, rule_type);

CREATE INDEX IF NOT EXISTS automation_runs_org_status_schedule_idx
  ON automation_runs (organization_id, status, scheduled_for DESC);

CREATE INDEX IF NOT EXISTS automation_runs_rule_created_idx
  ON automation_runs (automation_rule_id, created_at DESC);

CREATE INDEX IF NOT EXISTS automation_run_recipients_run_customer_idx
  ON automation_run_recipients (automation_run_id, customer_id);

CREATE INDEX IF NOT EXISTS automation_run_recipients_customer_idx
  ON automation_run_recipients (customer_id, created_at DESC);

COMMIT;
