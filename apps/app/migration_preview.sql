npm warn config ignoring workspace config at C:\Users\Dwayne Clark\Projects\Hookahplus\apps\app/.npmrc
-- CreateEnum
CREATE TYPE "SessionSource" AS ENUM ('QR', 'RESERVE', 'WALK_IN', 'LEGACY_POS');

-- CreateEnum
CREATE TYPE "SessionState" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'CLOSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('owner', 'admin', 'staff', 'viewer');

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "externalRef" TEXT,
    "source" "SessionSource" NOT NULL,
    "trustSignature" TEXT NOT NULL,
    "tableId" TEXT NOT NULL,
    "customerRef" TEXT,
    "customerPhone" TEXT,
    "flavor" TEXT,
    "flavorMix" TEXT,
    "loungeId" TEXT NOT NULL DEFAULT 'default-lounge',
    "priceCents" INTEGER NOT NULL,
    "session_type" TEXT,
    "had_refill" BOOLEAN NOT NULL DEFAULT false,
    "refill_count" INTEGER NOT NULL DEFAULT 0,
    "state" "SessionState" NOT NULL DEFAULT 'PENDING',
    "edgeCase" TEXT,
    "edgeNote" TEXT,
    "assignedBOHId" TEXT,
    "assignedFOHId" TEXT,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "durationSecs" INTEGER,
    "paymentIntent" TEXT,
    "paymentStatus" TEXT,
    "orderItems" TEXT,
    "posMode" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "timerDuration" INTEGER,
    "timerStartedAt" TIMESTAMP(3),
    "timerPausedAt" TIMESTAMP(3),
    "timerPausedDuration" INTEGER,
    "timerStatus" TEXT,
    "zone" TEXT,
    "fohUserId" TEXT,
    "specialRequests" TEXT,
    "tableNotes" TEXT,
    "qrCodeUrl" TEXT,
    "session_state_v1" TEXT,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "tenant_id" UUID,
    "preorder_id" TEXT,
    "lounge_config_version" INTEGER,
    "seat_id" TEXT,
    "zone_id" TEXT,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

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
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "user_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "role" "Role" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("user_id","tenant_id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenant_id" UUID NOT NULL,
    "session_id" TEXT,
    "stripe_charge_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paid_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "reflex_events" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ui',
    "sessionId" TEXT,
    "paymentIntent" TEXT,
    "payload" TEXT,
    "payloadHash" TEXT,
    "userAgent" TEXT,
    "ip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ctaSource" TEXT,
    "ctaType" TEXT,
    "referrer" TEXT,
    "campaignId" TEXT,
    "metadata" TEXT,
    "trustEventTypeV1" TEXT,
    "tenant_id" UUID,

    CONSTRAINT "reflex_events_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "menu_files" (
    "id" TEXT NOT NULL,
    "lead_id" TEXT,
    "file_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'pending',
    "extracted_data" JSONB,
    "tenant_id" UUID,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "menu_files_pkey" PRIMARY KEY ("id")
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

-- CreateTable
CREATE TABLE "DriftEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT,
    "driftReasonV1" TEXT,
    "severity" TEXT,
    "details" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DriftEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TaxonomyUnknown" (
    "id" TEXT NOT NULL,
    "enumType" TEXT NOT NULL,
    "rawLabel" TEXT NOT NULL,
    "suggestedMapping" TEXT,
    "count" INTEGER NOT NULL DEFAULT 1,
    "exampleEventId" TEXT,
    "examplePayload" TEXT,
    "firstSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TaxonomyUnknown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "price_snapshot" TEXT,
    "special_instructions" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "served_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "item_id" TEXT,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price_cents" INTEGER NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_events" (
    "id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "staff_id" TEXT,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "order_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "preorders" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "guest_handle" TEXT,
    "qr_code" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduled_time" TIMESTAMP(3),
    "party_size" INTEGER NOT NULL,
    "flavor_mix_json" TEXT,
    "base_price" INTEGER NOT NULL,
    "locked_price" INTEGER,
    "metadata" TEXT,
    "session_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "converted_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "preorders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deliveries" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "order_id" TEXT NOT NULL,
    "delivered_by" TEXT NOT NULL,
    "delivered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_notes" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "note_type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sentiment" TEXT,
    "loyalty_impact" INTEGER,
    "behavioral_tags" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "session_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_profiles" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "guest_key" TEXT NOT NULL,
    "cumulative_spend" INTEGER NOT NULL DEFAULT 0,
    "visit_count" INTEGER NOT NULL DEFAULT 0,
    "last_visit_at" TIMESTAMP(3),
    "preference_summary" TEXT,
    "trust_score" INTEGER NOT NULL DEFAULT 50,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loyalty_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loyalty_note_bindings" (
    "id" TEXT NOT NULL,
    "loyalty_profile_id" TEXT NOT NULL,
    "session_note_id" TEXT NOT NULL,

    CONSTRAINT "loyalty_note_bindings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "zones" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zone_type" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "metadata" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seats" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "zone_id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "name" TEXT,
    "capacity" INTEGER NOT NULL,
    "coordinates" TEXT,
    "qr_enabled" BOOLEAN NOT NULL DEFAULT true,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "price_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stations" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "station_type" TEXT NOT NULL,
    "zone_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flavors" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "tags" TEXT,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flavors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mix_templates" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "flavor_ids" TEXT NOT NULL,
    "price_cents" INTEGER,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mix_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_rules" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "rule_type" TEXT NOT NULL,
    "rule_config" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "effective_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lounge_configs" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "config_data" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "effective_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lounge_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_backlog" (
    "id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "lounge_id" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "last_attempt" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced_at" TIMESTAMP(3),

    CONSTRAINT "sync_backlog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "lounge_id" TEXT,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "changes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Session_tenant_id_idx" ON "Session"("tenant_id");

-- CreateIndex
CREATE INDEX "Session_preorder_id_idx" ON "Session"("preorder_id");

-- CreateIndex
CREATE INDEX "Session_seat_id_idx" ON "Session"("seat_id");

-- CreateIndex
CREATE INDEX "Session_zone_id_idx" ON "Session"("zone_id");

-- CreateIndex
CREATE INDEX "Session_lounge_config_version_idx" ON "Session"("lounge_config_version");

-- CreateIndex
CREATE UNIQUE INDEX "partners_email_key" ON "partners"("email");

-- CreateIndex
CREATE UNIQUE INDEX "partner_stats_partnerId_key" ON "partner_stats"("partnerId");

-- CreateIndex
CREATE UNIQUE INDEX "referrals_code_key" ON "referrals"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "memberships_user_id_idx" ON "memberships"("user_id");

-- CreateIndex
CREATE INDEX "memberships_tenant_id_idx" ON "memberships"("tenant_id");

-- CreateIndex
CREATE INDEX "memberships_role_idx" ON "memberships"("role");

-- CreateIndex
CREATE UNIQUE INDEX "payments_stripe_charge_id_key" ON "payments"("stripe_charge_id");

-- CreateIndex
CREATE INDEX "payments_tenant_id_idx" ON "payments"("tenant_id");

-- CreateIndex
CREATE INDEX "payments_session_id_idx" ON "payments"("session_id");

-- CreateIndex
CREATE INDEX "payments_stripe_charge_id_idx" ON "payments"("stripe_charge_id");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- CreateIndex
CREATE INDEX "payments_paid_at_idx" ON "payments"("paid_at");

-- CreateIndex
CREATE INDEX "payments_created_at_idx" ON "payments"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "org_settings_key_key" ON "org_settings"("key");

-- CreateIndex
CREATE INDEX "reflex_events_type_createdAt_idx" ON "reflex_events"("type", "createdAt");

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
CREATE INDEX "menu_files_lead_id_idx" ON "menu_files"("lead_id");

-- CreateIndex
CREATE INDEX "menu_files_status_idx" ON "menu_files"("status");

-- CreateIndex
CREATE INDEX "menu_files_tenant_id_idx" ON "menu_files"("tenant_id");

-- CreateIndex
CREATE INDEX "menu_files_uploaded_at_idx" ON "menu_files"("uploaded_at");

-- CreateIndex
CREATE INDEX "session_heartbeats_sessionId_lastPing_idx" ON "session_heartbeats"("sessionId", "lastPing");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_locks_sessionId_key" ON "pricing_locks"("sessionId");

-- CreateIndex
CREATE INDEX "pricing_locks_sessionId_idx" ON "pricing_locks"("sessionId");

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
CREATE INDEX "TaxonomyUnknown_enumType_idx" ON "TaxonomyUnknown"("enumType");

-- CreateIndex
CREATE INDEX "TaxonomyUnknown_count_idx" ON "TaxonomyUnknown"("count");

-- CreateIndex
CREATE INDEX "TaxonomyUnknown_lastSeen_idx" ON "TaxonomyUnknown"("lastSeen");

-- CreateIndex
CREATE UNIQUE INDEX "TaxonomyUnknown_enumType_rawLabel_key" ON "TaxonomyUnknown"("enumType", "rawLabel");

-- CreateIndex
CREATE INDEX "orders_session_id_idx" ON "orders"("session_id");

-- CreateIndex
CREATE INDEX "orders_status_created_at_idx" ON "orders"("status", "created_at");

-- CreateIndex
CREATE INDEX "order_items_order_id_idx" ON "order_items"("order_id");

-- CreateIndex
CREATE INDEX "order_events_order_id_created_at_idx" ON "order_events"("order_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "preorders_qr_code_key" ON "preorders"("qr_code");

-- CreateIndex
CREATE UNIQUE INDEX "preorders_session_id_key" ON "preorders"("session_id");

-- CreateIndex
CREATE INDEX "preorders_lounge_id_status_idx" ON "preorders"("lounge_id", "status");

-- CreateIndex
CREATE INDEX "preorders_qr_code_idx" ON "preorders"("qr_code");

-- CreateIndex
CREATE INDEX "preorders_session_id_idx" ON "preorders"("session_id");

-- CreateIndex
CREATE UNIQUE INDEX "deliveries_order_id_key" ON "deliveries"("order_id");

-- CreateIndex
CREATE INDEX "deliveries_session_id_idx" ON "deliveries"("session_id");

-- CreateIndex
CREATE INDEX "deliveries_delivered_by_delivered_at_idx" ON "deliveries"("delivered_by", "delivered_at");

-- CreateIndex
CREATE INDEX "session_notes_session_id_idx" ON "session_notes"("session_id");

-- CreateIndex
CREATE INDEX "session_notes_note_type_created_at_idx" ON "session_notes"("note_type", "created_at");

-- CreateIndex
CREATE INDEX "loyalty_profiles_lounge_id_idx" ON "loyalty_profiles"("lounge_id");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_profiles_lounge_id_guest_key_key" ON "loyalty_profiles"("lounge_id", "guest_key");

-- CreateIndex
CREATE UNIQUE INDEX "loyalty_note_bindings_loyalty_profile_id_session_note_id_key" ON "loyalty_note_bindings"("loyalty_profile_id", "session_note_id");

-- CreateIndex
CREATE INDEX "zones_lounge_id_idx" ON "zones"("lounge_id");

-- CreateIndex
CREATE UNIQUE INDEX "seats_table_id_key" ON "seats"("table_id");

-- CreateIndex
CREATE INDEX "seats_lounge_id_zone_id_idx" ON "seats"("lounge_id", "zone_id");

-- CreateIndex
CREATE INDEX "seats_table_id_idx" ON "seats"("table_id");

-- CreateIndex
CREATE INDEX "stations_lounge_id_idx" ON "stations"("lounge_id");

-- CreateIndex
CREATE INDEX "flavors_lounge_id_idx" ON "flavors"("lounge_id");

-- CreateIndex
CREATE INDEX "mix_templates_lounge_id_idx" ON "mix_templates"("lounge_id");

-- CreateIndex
CREATE INDEX "pricing_rules_lounge_id_is_active_effective_at_idx" ON "pricing_rules"("lounge_id", "is_active", "effective_at");

-- CreateIndex
CREATE UNIQUE INDEX "lounge_configs_lounge_id_key" ON "lounge_configs"("lounge_id");

-- CreateIndex
CREATE INDEX "lounge_configs_lounge_id_version_idx" ON "lounge_configs"("lounge_id", "version");

-- CreateIndex
CREATE INDEX "sync_backlog_device_id_status_idx" ON "sync_backlog"("device_id", "status");

-- CreateIndex
CREATE INDEX "sync_backlog_lounge_id_status_created_at_idx" ON "sync_backlog"("lounge_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_lounge_id_created_at_idx" ON "audit_logs"("lounge_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_preorder_id_fkey" FOREIGN KEY ("preorder_id") REFERENCES "preorders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

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
ALTER TABLE "loyalty_transactions" ADD CONSTRAINT "loyalty_transactions_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_wallets" ADD CONSTRAINT "loyalty_wallets_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "loyalty_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_events" ADD CONSTRAINT "order_events_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deliveries" ADD CONSTRAINT "deliveries_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_notes" ADD CONSTRAINT "session_notes_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_note_bindings" ADD CONSTRAINT "loyalty_note_bindings_loyalty_profile_id_fkey" FOREIGN KEY ("loyalty_profile_id") REFERENCES "loyalty_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loyalty_note_bindings" ADD CONSTRAINT "loyalty_note_bindings_session_note_id_fkey" FOREIGN KEY ("session_note_id") REFERENCES "session_notes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE CASCADE ON UPDATE CASCADE;

┌─────────────────────────────────────────────────────────┐
│  Update available 5.22.0 -> 7.1.0                       │
│                                                         │
│  This is a major update - please follow the guide at    │
│  https://pris.ly/d/major-version-upgrade                │
│                                                         │
│  Run the following to update                            │
│    npm i --save-dev prisma@latest                       │
│    npm i @prisma/client@latest                          │
└─────────────────────────────────────────────────────────┘
