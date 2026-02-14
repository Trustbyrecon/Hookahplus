-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'admin', 'staff', 'viewer');

-- DropForeignKey
ALTER TABLE "Award" DROP CONSTRAINT "Award_badgeId_fkey";

-- DropForeignKey
ALTER TABLE "Session" DROP CONSTRAINT "Session_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "SessionEvent" DROP CONSTRAINT "SessionEvent_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "menu_files" DROP CONSTRAINT "menu_files_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_session_id_fkey";

-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "refills" DROP CONSTRAINT "refills_session_id_fkey";

-- DropForeignKey
ALTER TABLE "refills" DROP CONSTRAINT "refills_venue_id_fkey";

-- DropForeignKey
ALTER TABLE "reflex_events" DROP CONSTRAINT "reflex_events_tenant_id_fkey";

-- DropForeignKey
ALTER TABLE "reservations" DROP CONSTRAINT "reservations_venue_id_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_created_by_fkey";

-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_venue_id_fkey";

-- DropForeignKey
ALTER TABLE "staff" DROP CONSTRAINT "staff_venue_id_fkey";

-- DropIndex
DROP INDEX "idx_drift_event_created";

-- DropIndex
DROP INDEX "idx_drift_event_reason_v1";

-- DropIndex
DROP INDEX "idx_drift_event_session";

-- DropIndex
DROP INDEX "Session_loungeId_externalRef_key";

-- DropIndex
DROP INDEX "Session_loungeId_state_idx";

-- DropIndex
DROP INDEX "idx_session_created_at";

-- DropIndex
DROP INDEX "idx_session_created_at_source";

-- DropIndex
DROP INDEX "idx_session_created_at_state";

-- DropIndex
DROP INDEX "idx_session_customer_ref";

-- DropIndex
DROP INDEX "idx_session_external_ref";

-- DropIndex
DROP INDEX "idx_session_lounge_id";

-- DropIndex
DROP INDEX "idx_session_paused";

-- DropIndex
DROP INDEX "idx_session_state";

-- DropIndex
DROP INDEX "idx_session_state_v1";

-- DropIndex
DROP INDEX "idx_session_table_id";

-- DropIndex
DROP INDEX "TaxonomyUnknown_enum_type_raw_label_key";

-- DropIndex
DROP INDEX "idx_taxonomy_unknown_count";

-- DropIndex
DROP INDEX "idx_taxonomy_unknown_last_seen";

-- DropIndex
DROP INDEX "idx_taxonomy_unknown_type";

-- DropIndex
DROP INDEX "idx_memberships_user_tenant";

-- DropIndex
DROP INDEX "idx_orders_created";

-- DropIndex
DROP INDEX "idx_reflex_event_created_at_type";

-- DropIndex
DROP INDEX "idx_reflex_event_trust_type_v1";

-- DropIndex
DROP INDEX "idx_reflex_events_created";

-- DropIndex
DROP INDEX "idx_tenants_created_at";

-- DropIndex
DROP INDEX "idx_tenants_name";

-- AlterTable
ALTER TABLE "DriftEvent" DROP COLUMN "created_at",
DROP COLUMN "drift_reason_v1",
DROP COLUMN "session_id",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "driftReasonV1" TEXT,
ADD COLUMN     "sessionId" TEXT,
ALTER COLUMN "details" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "had_refill" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nan_action" TEXT,
ADD COLUMN     "nan_stage" TEXT,
ADD COLUMN     "refill_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "session_type" TEXT,
ALTER COLUMN "flavorMix" SET DATA TYPE TEXT,
ALTER COLUMN "loungeId" SET DEFAULT 'default-lounge',
ALTER COLUMN "tableId" SET NOT NULL,
ALTER COLUMN "priceCents" SET NOT NULL,
ALTER COLUMN "priceCents" DROP DEFAULT,
ALTER COLUMN "startedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "endedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "timerStartedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "timerPausedAt" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "paused" SET NOT NULL;

-- AlterTable
ALTER TABLE "TaxonomyUnknown" DROP COLUMN "created_at",
DROP COLUMN "enum_type",
DROP COLUMN "example_event_id",
DROP COLUMN "example_payload",
DROP COLUMN "first_seen",
DROP COLUMN "last_seen",
DROP COLUMN "raw_label",
DROP COLUMN "suggested_mapping",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "enumType" TEXT NOT NULL,
ADD COLUMN     "exampleEventId" TEXT,
ADD COLUMN     "examplePayload" TEXT,
ADD COLUMN     "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "rawLabel" TEXT NOT NULL,
ADD COLUMN     "suggestedMapping" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "count" SET NOT NULL;

-- AlterTable
ALTER TABLE "memberships" DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "menu_files" DROP CONSTRAINT "menu_files_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "uploaded_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "processed_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "deleted_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "menu_files_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "payments" DROP CONSTRAINT "payments_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "paid_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" SET NOT NULL,
ALTER COLUMN "updated_at" DROP DEFAULT,
ALTER COLUMN "updated_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "payments_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "reflex_events" DROP COLUMN "trust_event_type_v1",
ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "tenants" DROP CONSTRAINT "tenants_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "created_at" SET NOT NULL,
ALTER COLUMN "created_at" SET DATA TYPE TIMESTAMP(3),
ADD CONSTRAINT "tenants_pkey" PRIMARY KEY ("id");

-- DropTable
DROP TABLE "Award";

-- DropTable
DROP TABLE "Badge";

-- DropTable
DROP TABLE "Event";

-- DropTable
DROP TABLE "SessionEvent";

-- DropTable
DROP TABLE "ghostlog";

-- DropTable
DROP TABLE "refills";

-- DropTable
DROP TABLE "reservations";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "staff";

-- DropTable
DROP TABLE "stripe_webhook_events";

-- DropTable
DROP TABLE "venues";

-- DropEnum
DROP TYPE "reservation_status";

-- DropEnum
DROP TYPE "role";

-- DropEnum
DROP TYPE "session_status";

-- CreateTable
CREATE TABLE "partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'bronze',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "partners_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "partner_stats" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "activeLounges" INTEGER NOT NULL DEFAULT 0,
    "referralsLast30d" INTEGER NOT NULL DEFAULT 0,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "partner_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "loungeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "maxUses" INTEGER,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activatedAt" TIMESTAMP(3),

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "gross" DOUBLE PRECISION NOT NULL,
    "revSharePct" DOUBLE PRECISION NOT NULL,
    "net" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "roles" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_transitions" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "fromState" TEXT NOT NULL,
    "toState" TEXT NOT NULL,
    "transition" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_transitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_settings" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "org_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "icon" TEXT,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "categoryId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "imageUrl" TEXT,
    "allergens" TEXT NOT NULL,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "prepTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ktl4_health_checks" (
    "id" TEXT NOT NULL,
    "flowName" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "threshold" INTEGER,
    "actualValue" INTEGER,
    "operatorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ktl4_health_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlement_reconciliation" (
    "id" TEXT NOT NULL,
    "stripeChargeId" TEXT,
    "posTicketId" TEXT,
    "sessionId" TEXT,
    "amount" INTEGER,
    "status" TEXT NOT NULL,
    "mismatchReason" TEXT,
    "repairRunId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reconciledAt" TIMESTAMP(3),

    CONSTRAINT "settlement_reconciliation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pos_tickets" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "sessionId" TEXT,
    "stripeChargeId" TEXT,
    "amountCents" INTEGER NOT NULL,
    "items" TEXT,
    "taxes" INTEGER,
    "tips" INTEGER,
    "status" TEXT NOT NULL,
    "posSystem" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pos_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_heartbeats" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "stationId" TEXT,
    "status" TEXT NOT NULL,
    "elapsedSecs" INTEGER NOT NULL,
    "remainingSecs" INTEGER,
    "lastPing" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_heartbeats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_locks" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "finalPriceCents" INTEGER NOT NULL,
    "priceHash" TEXT NOT NULL,
    "components" TEXT,
    "lockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operatorId" TEXT,
    "auditNote" TEXT,

    CONSTRAINT "pricing_locks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_snapshots" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "config_version" INTEGER NOT NULL,
    "basePriceCents" INTEGER NOT NULL,
    "add_ons_price_cents" INTEGER NOT NULL DEFAULT 0,
    "adjustments_cents" INTEGER NOT NULL DEFAULT 0,
    "finalPriceCents" INTEGER NOT NULL,
    "breakdown" JSONB NOT NULL,
    "mix_items" JSONB,
    "premium_detected" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_events" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "event_data" JSONB,
    "actor_id" TEXT,
    "actor_role" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_adjustments" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "adjustment_type" TEXT NOT NULL,
    "amount_cents" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" TEXT NOT NULL,

    CONSTRAINT "session_adjustments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integration_events" (
    "id" TEXT NOT NULL,
    "integration_type" TEXT NOT NULL,
    "external_event_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ktl4_alerts" (
    "id" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "flowName" TEXT NOT NULL,
    "alertType" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "details" TEXT,
    "status" TEXT NOT NULL,
    "acknowledgedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ktl4_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "break_glass_actions" (
    "id" TEXT NOT NULL,
    "actionType" TEXT NOT NULL,
    "targetId" TEXT,
    "operatorId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),

    CONSTRAINT "break_glass_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_accounts" (
    "id" TEXT NOT NULL,
    "customerId" TEXT,
    "customerPhone" TEXT,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "totalEarnedCents" INTEGER NOT NULL DEFAULT 0,
    "totalRedeemedCents" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_transactions" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "balanceBeforeCents" INTEGER NOT NULL,
    "balanceAfterCents" INTEGER NOT NULL,
    "source" TEXT NOT NULL,
    "sessionId" TEXT,
    "posTicketId" TEXT,
    "stripeChargeId" TEXT,
    "metadata" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "loyalty_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_wallets" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "balanceCents" INTEGER NOT NULL DEFAULT 0,
    "lastTransactionId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_wallets_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "partners_email_key" ON "partners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partner_stats_partnerId_key" ON "partner_stats"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_code_key" ON "referrals"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "org_settings_key_key" ON "org_settings"("key");

-- CreateIndex
CREATE INDEX "ktl4_health_checks_flowName_createdAt_idx" ON "ktl4_health_checks"("flowName", "createdAt");

-- CreateIndex
CREATE INDEX "settlement_reconciliation_stripeChargeId_idx" ON "settlement_reconciliation"("stripeChargeId");

-- CreateIndex
CREATE INDEX "settlement_reconciliation_posTicketId_idx" ON "settlement_reconciliation"("posTicketId");

-- CreateIndex
CREATE INDEX "settlement_reconciliation_status_createdAt_idx" ON "settlement_reconciliation"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "pos_tickets_ticketId_key" ON "pos_tickets"("ticketId");

-- CreateIndex
CREATE INDEX "pos_tickets_ticketId_idx" ON "pos_tickets"("ticketId");

-- CreateIndex
CREATE INDEX "pos_tickets_sessionId_idx" ON "pos_tickets"("sessionId");

-- CreateIndex
CREATE INDEX "pos_tickets_stripeChargeId_idx" ON "pos_tickets"("stripeChargeId");

-- CreateIndex
CREATE INDEX "session_heartbeats_sessionId_lastPing_idx" ON "session_heartbeats"("sessionId", "lastPing");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_locks_sessionId_key" ON "pricing_locks"("sessionId");

-- CreateIndex
CREATE INDEX "pricing_locks_sessionId_idx" ON "pricing_locks"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_snapshots_sessionId_key" ON "pricing_snapshots"("sessionId");

-- CreateIndex
CREATE INDEX "pricing_snapshots_sessionId_idx" ON "pricing_snapshots"("sessionId");

-- CreateIndex
CREATE INDEX "pricing_snapshots_config_version_idx" ON "pricing_snapshots"("config_version");

-- CreateIndex
CREATE INDEX "session_events_session_id_timestamp_idx" ON "session_events"("session_id", "timestamp");

-- CreateIndex
CREATE INDEX "session_events_event_type_timestamp_idx" ON "session_events"("event_type", "timestamp");

-- CreateIndex
CREATE INDEX "session_adjustments_session_id_idx" ON "session_adjustments"("session_id");

-- CreateIndex
CREATE INDEX "session_adjustments_adjustment_type_created_at_idx" ON "session_adjustments"("adjustment_type", "created_at");

-- CreateIndex
CREATE INDEX "integration_events_status_created_at_idx" ON "integration_events"("status", "created_at");

-- CreateIndex
CREATE INDEX "integration_events_integration_type_status_idx" ON "integration_events"("integration_type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "integration_events_integration_type_external_event_id_key" ON "integration_events"("integration_type", "external_event_id");

-- CreateIndex
CREATE INDEX "ktl4_alerts_priority_status_createdAt_idx" ON "ktl4_alerts"("priority", "status", "createdAt");

-- CreateIndex
CREATE INDEX "break_glass_actions_actionType_createdAt_idx" ON "break_glass_actions"("actionType", "createdAt");

-- CreateIndex
CREATE INDEX "loyalty_accounts_customerId_idx" ON "loyalty_accounts"("customerId");

-- CreateIndex
CREATE INDEX "loyalty_accounts_customerPhone_idx" ON "loyalty_accounts"("customerPhone");

-- CreateIndex
CREATE INDEX "loyalty_accounts_isActive_updatedAt_idx" ON "loyalty_accounts"("isActive", "updatedAt");

-- CreateIndex
CREATE INDEX "loyalty_transactions_accountId_createdAt_idx" ON "loyalty_transactions"("accountId", "createdAt");

-- CreateIndex
CREATE INDEX "loyalty_transactions_sessionId_idx" ON "loyalty_transactions"("sessionId");

-- CreateIndex
CREATE INDEX "loyalty_transactions_posTicketId_idx" ON "loyalty_transactions"("posTicketId");

-- CreateIndex
CREATE INDEX "loyalty_transactions_type_createdAt_idx" ON "loyalty_transactions"("type", "createdAt");

-- CreateIndex
CREATE INDEX "loyalty_transactions_source_createdAt_idx" ON "loyalty_transactions"("source", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_wallets_accountId_key" ON "loyalty_wallets"("accountId");

-- CreateIndex
CREATE INDEX "loyalty_wallets_accountId_idx" ON "loyalty_wallets"("accountId");

-- CreateIndex
CREATE INDEX "DriftEvent_driftReasonV1_idx" ON "DriftEvent"("driftReasonV1");

-- CreateIndex
CREATE INDEX "DriftEvent_sessionId_idx" ON "DriftEvent"("sessionId");

-- CreateIndex
CREATE INDEX "DriftEvent_createdAt_idx" ON "DriftEvent"("createdAt");

-- CreateIndex
CREATE INDEX "Session_tenant_id_idx" ON "Session"("tenant_id");

-- CreateIndex
CREATE INDEX "TaxonomyUnknown_enumType_idx" ON "TaxonomyUnknown"("enumType");

-- CreateIndex
CREATE INDEX "TaxonomyUnknown_count_idx" ON "TaxonomyUnknown"("count");

-- CreateIndex
CREATE INDEX "TaxonomyUnknown_lastSeen_idx" ON "TaxonomyUnknown"("lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomyUnknown_enumType_rawLabel_key" ON "TaxonomyUnknown"("enumType", "rawLabel");

-- CreateIndex
CREATE INDEX "memberships_role_idx" ON "memberships"("role");

-- CreateIndex
CREATE INDEX "payments_session_id_idx" ON "payments"("session_id");

-- CreateIndex
CREATE INDEX "payments_stripe_charge_id_idx" ON "payments"("stripe_charge_id");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

-- CreateIndex
CREATE UNIQUE INDEX "preorders_qr_code_key" ON "preorders"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "preorders_session_id_key" ON "preorders"("session_id");

-- CreateIndex
CREATE INDEX "preorders_qr_code_idx" ON "preorders"("qr_code");

-- CreateIndex
CREATE INDEX "preorders_session_id_idx" ON "preorders"("session_id");

-- CreateIndex
CREATE INDEX "reflex_events_ctaSource_idx" ON "reflex_events"("ctaSource");

-- CreateIndex
CREATE INDEX "reflex_events_ctaType_idx" ON "reflex_events"("ctaType");

-- CreateIndex
CREATE INDEX "reflex_events_campaignId_idx" ON "reflex_events"("campaignId");

-- CreateIndex
CREATE INDEX "reflex_events_trustEventTypeV1_idx" ON "reflex_events"("trustEventTypeV1");

-- CreateIndex
CREATE INDEX "reflex_events_tenant_id_idx" ON "reflex_events"("tenant_id");

-- CreateIndex
CREATE INDEX "seats_table_id_idx" ON "seats"("table_id");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "partner_stats" ADD CONSTRAINT "partner_stats_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reflex_events" ADD CONSTRAINT "reflex_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_snapshots" ADD CONSTRAINT "pricing_snapshots_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_events" ADD CONSTRAINT "session_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_adjustments" ADD CONSTRAINT "session_adjustments_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_wallets" ADD CONSTRAINT "loyalty_wallets_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "idx_memberships_role" RENAME TO "memberships_role_idx";

-- RenameIndex
ALTER INDEX "idx_memberships_tenant_id" RENAME TO "memberships_tenant_id_idx";

-- RenameIndex
ALTER INDEX "idx_memberships_user_id" RENAME TO "memberships_user_id_idx";

-- RenameIndex
ALTER INDEX "idx_menu_files_lead_id" RENAME TO "menu_files_lead_id_idx";

-- RenameIndex
ALTER INDEX "idx_menu_files_status" RENAME TO "menu_files_status_idx";

-- RenameIndex
ALTER INDEX "idx_menu_files_tenant_id" RENAME TO "menu_files_tenant_id_idx";

-- RenameIndex
ALTER INDEX "idx_menu_files_uploaded_at" RENAME TO "menu_files_uploaded_at_idx";

-- RenameIndex
ALTER INDEX "idx_payments_created_at" RENAME TO "payments_created_at_idx";

-- RenameIndex
ALTER INDEX "idx_payments_status" RENAME TO "payments_status_idx";

-- RenameIndex
ALTER INDEX "idx_payments_tenant_id" RENAME TO "payments_tenant_id_idx";

-- RenameIndex
ALTER INDEX "idx_reflex_events_type_createdat" RENAME TO "reflex_events_type_createdAt_idx";

