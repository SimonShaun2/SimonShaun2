BEGIN;

ALTER TABLE packages
  ADD COLUMN IF NOT EXISTS upsell_eligible boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS upsell_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS upsell_priority integer NOT NULL DEFAULT 0;

ALTER TABLE add_ons
  ADD COLUMN IF NOT EXISTS upsell_eligible boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS upsell_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS upsell_priority integer NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS upsell_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  location_id uuid REFERENCES locations(id) ON DELETE SET NULL,
  order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  add_on_id uuid NOT NULL REFERENCES add_ons(id) ON DELETE CASCADE,
  session_key varchar(64) NOT NULL,
  event_type varchar(20) NOT NULL,
  recommendation_type varchar(50) NOT NULL,
  suggested_quantity integer NOT NULL DEFAULT 1,
  revenue_cents integer NOT NULL DEFAULT 0,
  headline text,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS upsell_events_org_event_idx
  ON upsell_events (organization_id, event_type, created_at DESC);

CREATE INDEX IF NOT EXISTS upsell_events_order_idx
  ON upsell_events (order_id);

CREATE INDEX IF NOT EXISTS upsell_events_session_idx
  ON upsell_events (session_key, created_at DESC);

COMMIT;
