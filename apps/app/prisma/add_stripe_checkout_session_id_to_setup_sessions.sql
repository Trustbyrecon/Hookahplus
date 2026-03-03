-- Adds an idempotency anchor for Stripe paid-tier provisioning
-- Table: setup_sessions (Prisma model: SetupSession)

ALTER TABLE "setup_sessions"
  ADD COLUMN IF NOT EXISTS "stripe_checkout_session_id" TEXT;

-- Unique index for idempotency (one SetupSession per Stripe checkout session)
CREATE UNIQUE INDEX IF NOT EXISTS "setup_sessions_stripe_checkout_session_id_key"
  ON "setup_sessions" ("stripe_checkout_session_id");

CREATE INDEX IF NOT EXISTS "idx_setup_session_stripe_checkout_session_id"
  ON "setup_sessions" ("stripe_checkout_session_id");

