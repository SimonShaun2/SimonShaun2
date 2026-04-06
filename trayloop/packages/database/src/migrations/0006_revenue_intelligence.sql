BEGIN;

CREATE TABLE IF NOT EXISTS revenue_insight_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type varchar(32) NOT NULL,
  item_type varchar(48) NOT NULL,
  item_key varchar(128) NOT NULL,
  page varchar(32) NOT NULL DEFAULT 'dashboard',
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revenue_insight_events_org_created_idx
  ON revenue_insight_events (organization_id, created_at DESC);

CREATE INDEX IF NOT EXISTS revenue_insight_events_org_type_idx
  ON revenue_insight_events (organization_id, event_type, item_type);

COMMIT;
