-- H+ Operator v2: CLARK preference rollup (run against Postgres when ready)
-- Apply with: psql $DATABASE_URL -f prisma/add_customer_memory.sql
-- Or: npx prisma db push (schema already includes CustomerMemory)

CREATE TABLE IF NOT EXISTS "customer_memory" (
  "id" TEXT NOT NULL,
  "lounge_id" TEXT NOT NULL,
  "customer_ref" TEXT NOT NULL,
  "customer_name" TEXT,
  "last_seen_at" TIMESTAMPTZ(6),
  "last_session_id" TEXT,
  "recent_flavors" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "note" TEXT,
  "session_count" INTEGER NOT NULL DEFAULT 0,
  "premium_hint" TEXT,
  "preferred_table" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "customer_memory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "customer_memory_lounge_customer_uq"
  ON "customer_memory"("lounge_id", "customer_ref");

CREATE INDEX IF NOT EXISTS "idx_customer_memory_lounge"
  ON "customer_memory"("lounge_id");
