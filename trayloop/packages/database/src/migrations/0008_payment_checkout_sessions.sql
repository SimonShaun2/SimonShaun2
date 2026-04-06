ALTER TABLE payments
ADD COLUMN IF NOT EXISTS stripe_checkout_session_id text;

CREATE UNIQUE INDEX IF NOT EXISTS payments_stripe_checkout_session_id_idx
ON payments (stripe_checkout_session_id)
WHERE stripe_checkout_session_id IS NOT NULL;
