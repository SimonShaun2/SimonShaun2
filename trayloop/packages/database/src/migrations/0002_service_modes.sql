BEGIN;

DO $$ BEGIN
  CREATE TYPE service_mode AS ENUM ('delivery', 'pickup', 'full_service', 'on_site', 'food_truck');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS service_type service_mode NOT NULL DEFAULT 'delivery';

ALTER TABLE recurring_orders
  ADD COLUMN IF NOT EXISTS service_type service_mode NOT NULL DEFAULT 'delivery';

UPDATE orders
SET service_type = 'delivery'
WHERE service_type IS NULL;

UPDATE recurring_orders
SET service_type = 'delivery'
WHERE service_type IS NULL;

COMMIT;
