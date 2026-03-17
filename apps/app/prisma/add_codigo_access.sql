-- CODIGO access entitlement: time-boxed access that auto-expires after 14 days.
-- Run: npx prisma db execute --file prisma/add_codigo_access.sql

CREATE TABLE IF NOT EXISTS "codigo_access" (
  "id" TEXT NOT NULL,
  "user_id" UUID NOT NULL,
  "granted_at" TIMESTAMPTZ(6) NOT NULL,
  "expires_at" TIMESTAMPTZ(6) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "granted_by" UUID,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "codigo_access_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "codigo_access_user_id_key" ON "codigo_access"("user_id");
CREATE INDEX IF NOT EXISTS "codigo_access_user_id_idx" ON "codigo_access"("user_id");
CREATE INDEX IF NOT EXISTS "codigo_access_expires_at_idx" ON "codigo_access"("expires_at");
CREATE INDEX IF NOT EXISTS "codigo_access_status_idx" ON "codigo_access"("status");
