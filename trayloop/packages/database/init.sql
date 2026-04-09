-- =============================================================================
-- TrayLoop Database Initialization Script
-- Generated from Drizzle ORM schema definitions
-- =============================================================================

BEGIN;

-- =============================================================================
-- DROP TABLES (reverse dependency order)
-- =============================================================================
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS idempotency_keys CASCADE;
DROP TABLE IF EXISTS order_events CASCADE;
DROP TABLE IF EXISTS follow_ups CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS deposits CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS recurring_orders CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS customer_addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS add_ons CASCADE;
DROP TABLE IF EXISTS package_items CASCADE;
DROP TABLE IF EXISTS packages CASCADE;
DROP TABLE IF EXISTS catalog_categories CASCADE;
DROP TABLE IF EXISTS catalogs CASCADE;
DROP TABLE IF EXISTS location_settings CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS organization_memberships CASCADE;
DROP TABLE IF EXISTS organization_features CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================================================
-- DROP ENUM TYPES
-- =============================================================================
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS member_role CASCADE;
DROP TYPE IF EXISTS member_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS service_mode CASCADE;
DROP TYPE IF EXISTS subscription_status CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS payment_method CASCADE;
DROP TYPE IF EXISTS deposit_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS notification_status CASCADE;
DROP TYPE IF EXISTS catalog_item_type CASCADE;
DROP TYPE IF EXISTS package_pricing CASCADE;
DROP TYPE IF EXISTS recurrence_interval CASCADE;
DROP TYPE IF EXISTS follow_up_status CASCADE;
DROP TYPE IF EXISTS audit_action CASCADE;
DROP TYPE IF EXISTS organization_feature_key CASCADE;

-- =============================================================================
-- CREATE ENUM TYPES
-- =============================================================================
CREATE TYPE user_role AS ENUM ('customer', 'merchant', 'admin');
CREATE TYPE member_role AS ENUM ('owner', 'admin', 'manager', 'staff');
CREATE TYPE member_status AS ENUM ('invited', 'active', 'suspended', 'removed');
CREATE TYPE order_status AS ENUM ('submitted', 'awaiting_deposit', 'confirmed', 'completed', 'cancelled');
CREATE TYPE service_mode AS ENUM ('delivery', 'pickup', 'full_service', 'on_site', 'food_truck');
CREATE TYPE subscription_status AS ENUM ('trialing', 'active', 'past_due', 'canceled', 'unpaid');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'succeeded', 'failed', 'refunded', 'partially_refunded');
CREATE TYPE payment_method AS ENUM ('card', 'ach', 'cash', 'check', 'other');
CREATE TYPE deposit_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE notification_type AS ENUM ('email', 'in_app', 'push', 'sms');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'read', 'failed');
CREATE TYPE catalog_item_type AS ENUM ('service', 'physical_good', 'digital_good', 'bundle');
CREATE TYPE package_pricing AS ENUM ('per_head', 'flat');
CREATE TYPE recurrence_interval AS ENUM ('weekly', 'biweekly', 'monthly', 'quarterly');
CREATE TYPE follow_up_status AS ENUM ('pending', 'completed');
CREATE TYPE audit_action AS ENUM ('create', 'update', 'delete', 'login', 'logout', 'status_change');
CREATE TYPE organization_feature_key AS ENUM ('growth_advisor');

-- =============================================================================
-- CREATE TABLES (dependency order)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  avatar_url TEXT,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- password_reset_tokens
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  app VARCHAR(32) NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- organizations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  website TEXT,
  phone VARCHAR(50),
  logo_url TEXT,
  brand_color VARCHAR(7),
  display_font TEXT,
  owner_id UUID NOT NULL REFERENCES users(id),
  stripe_account_id TEXT,
  stripe_charges_enabled BOOLEAN NOT NULL DEFAULT false,
  stripe_payouts_enabled BOOLEAN NOT NULL DEFAULT false,
  stripe_details_submitted BOOLEAN NOT NULL DEFAULT false,
  stripe_onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- subscriptions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT NOT NULL UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status subscription_status NOT NULL DEFAULT 'trialing',
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- organization_features
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  feature_key organization_feature_key NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'subscription',
  stripe_price_id TEXT,
  stripe_subscription_item_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS organization_features_org_feature_key_idx
  ON organization_features (organization_id, feature_key);

-- ---------------------------------------------------------------------------
-- organization_memberships
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS organization_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'staff',
  status member_status NOT NULL DEFAULT 'invited',
  invited_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  joined_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- locations
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'US',
  phone VARCHAR(50),
  email VARCHAR(255),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- location_settings
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS location_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE UNIQUE,
  lead_time_days INTEGER NOT NULL DEFAULT 3,
  min_order_amount INTEGER DEFAULT 0,
  max_order_amount INTEGER,
  service_types JSONB NOT NULL DEFAULT '["delivery"]'::jsonb,
  delivery_enabled BOOLEAN NOT NULL DEFAULT true,
  pickup_enabled BOOLEAN NOT NULL DEFAULT false,
  delivery_radius_miles INTEGER,
  deposit_required BOOLEAN NOT NULL DEFAULT true,
  operating_hours JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- catalogs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- catalog_categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS catalog_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- packages
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  category_id UUID REFERENCES catalog_categories(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  pricing package_pricing NOT NULL DEFAULT 'flat',
  price INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  min_head_count INTEGER,
  max_head_count INTEGER,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- package_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS package_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  package_id UUID NOT NULL REFERENCES packages(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type catalog_item_type NOT NULL DEFAULT 'service',
  is_optional BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- add_ons
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS add_ons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id UUID NOT NULL REFERENCES catalogs(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  price INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- customers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(255) NOT NULL,
  last_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company_name VARCHAR(255),
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- customer_addresses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  label VARCHAR(100) NOT NULL DEFAULT 'default',
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  zip_code VARCHAR(20) NOT NULL,
  country VARCHAR(2) NOT NULL DEFAULT 'US',
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(20) NOT NULL,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  location_id UUID REFERENCES locations(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  status order_status NOT NULL DEFAULT 'submitted',
  service_type service_mode NOT NULL DEFAULT 'delivery',
  total_amount INTEGER NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  head_count INTEGER,
  scheduled_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- order_items
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- recurring_orders
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recurring_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  location_id UUID REFERENCES locations(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  package_id UUID REFERENCES packages(id),
  service_type service_mode NOT NULL DEFAULT 'delivery',
  "interval" recurrence_interval NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  next_occurrence TIMESTAMPTZ,
  preferred_day VARCHAR(20),
  preferred_time VARCHAR(10),
  head_count INTEGER,
  notes TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- payments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status payment_status NOT NULL DEFAULT 'pending',
  method payment_method DEFAULT 'card',
  failure_reason TEXT,
  refunded_amount INTEGER NOT NULL DEFAULT 0,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- deposits
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  amount INTEGER NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status deposit_status NOT NULL DEFAULT 'pending',
  stripe_checkout_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT UNIQUE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'in_app',
  status notification_status NOT NULL DEFAULT 'pending',
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  action_url TEXT,
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- follow_ups
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS follow_ups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id),
  status follow_up_status NOT NULL DEFAULT 'pending',
  due_date TIMESTAMPTZ NOT NULL,
  note TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- order_events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- idempotency_keys
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS idempotency_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key VARCHAR(255) NOT NULL,
  route VARCHAR(255) NOT NULL,
  organization_id UUID NOT NULL,
  status_code VARCHAR(3) NOT NULL,
  response_body JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

-- ---------------------------------------------------------------------------
-- audit_logs
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  organization_id UUID REFERENCES organizations(id),
  action audit_action NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID,
  changes JSONB,
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMIT;
