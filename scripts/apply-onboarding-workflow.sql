-- H+ Onboarding Engine - Manual migration
-- Run: psql $DATABASE_URL -f scripts/apply-onboarding-workflow.sql
-- Or from apps/app: npx prisma db execute --file ../../scripts/apply-onboarding-workflow.sql

-- Tables are idempotent (IF NOT EXISTS) - safe to run multiple times

CREATE TABLE IF NOT EXISTS "onboarding_workflows" (
    "id" TEXT NOT NULL,
    "tenant_id" UUID,
    "lounge_id" TEXT NOT NULL,
    "workflow_type" TEXT NOT NULL,
    "overall_status" TEXT NOT NULL,
    "current_step_key" TEXT NOT NULL,
    "percent_complete" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_workflows_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "onboarding_workflows_lounge_id_key" ON "onboarding_workflows"("lounge_id");
CREATE INDEX IF NOT EXISTS "onboarding_workflows_lounge_id_idx" ON "onboarding_workflows"("lounge_id");
CREATE INDEX IF NOT EXISTS "onboarding_workflows_tenant_id_idx" ON "onboarding_workflows"("tenant_id");
CREATE INDEX IF NOT EXISTS "onboarding_workflows_overall_status_idx" ON "onboarding_workflows"("overall_status");

CREATE TABLE IF NOT EXISTS "onboarding_steps" (
    "id" TEXT NOT NULL,
    "workflow_id" TEXT NOT NULL,
    "step_key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "order_index" INTEGER NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "data_json" JSONB,
    "errors_json" JSONB,
    "warnings_json" JSONB,
    "blocking_reason" TEXT,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "onboarding_steps_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "onboarding_steps_workflow_id_step_key_key" ON "onboarding_steps"("workflow_id", "step_key");
CREATE INDEX IF NOT EXISTS "onboarding_steps_workflow_id_idx" ON "onboarding_steps"("workflow_id");

ALTER TABLE "onboarding_steps" DROP CONSTRAINT IF EXISTS "onboarding_steps_workflow_id_fkey";
ALTER TABLE "onboarding_steps" ADD CONSTRAINT "onboarding_steps_workflow_id_fkey" 
    FOREIGN KEY ("workflow_id") REFERENCES "onboarding_workflows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
