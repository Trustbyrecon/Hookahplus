-- MigrateGuard trust ledger (optional manual apply; prefer `npx prisma db push` / migrate)

CREATE TABLE IF NOT EXISTS "migrate_guard_runs" (
  "id" TEXT NOT NULL,
  "intent_id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "actor_user_id" TEXT,
  "ok" BOOLEAN NOT NULL,
  "phase" TEXT NOT NULL,
  "audit_line" TEXT,
  "stdout" TEXT,
  "stderr" TEXT,
  "started_at" TIMESTAMPTZ(6) NOT NULL,
  "finished_at" TIMESTAMPTZ(6) NOT NULL,
  CONSTRAINT "migrate_guard_runs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "idx_migrate_guard_run_intent" ON "migrate_guard_runs"("intent_id");
CREATE INDEX IF NOT EXISTS "idx_migrate_guard_run_finished" ON "migrate_guard_runs"("finished_at");
