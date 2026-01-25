-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "categoryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isPopular" BOOLEAN NOT NULL DEFAULT false,
    "prepTime" INTEGER NOT NULL DEFAULT 0,
    "allergens" TEXT NOT NULL DEFAULT '',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Item_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrgSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "venueId" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 100,
    "awardedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awardedBy" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Award_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ts" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "venueId" TEXT,
    "comboHash" TEXT,
    "staffId" TEXT
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalRef" TEXT,
    "source" TEXT NOT NULL,
    "trustSignature" TEXT NOT NULL,
    "state" TEXT NOT NULL DEFAULT 'PENDING',
    "customerPhone" TEXT,
    "flavorMix" TEXT,
    "loungeId" TEXT NOT NULL,
    "tableId" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "edgeCase" TEXT,
    "edgeNote" TEXT,
    "priceCents" INTEGER,
    "orderItems" TEXT,
    "posMode" TEXT,
    "durationSecs" INTEGER,
    "startedAt" DATETIME,
    "endedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "customerId" TEXT,
    CONSTRAINT "Session_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT,
    "type" TEXT NOT NULL,
    "payload" TEXT DEFAULT '{}',
    "payloadSeal" TEXT NOT NULL,
    "data" TEXT NOT NULL DEFAULT '{}',
    "idempotencyKey" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SessionTransition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "fromState" TEXT NOT NULL,
    "toState" TEXT NOT NULL,
    "transition" TEXT NOT NULL,
    "userId" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionTransition_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReflexEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ui',
    "sessionId" TEXT,
    "paymentIntent" TEXT,
    "payload" TEXT,
    "payloadHash" TEXT,
    "userAgent" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SettlementReconciliation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stripeChargeId" TEXT,
    "posTicketId" TEXT,
    "sessionId" TEXT,
    "amount" INTEGER,
    "currency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "matchedAt" DATETIME,
    "reconciledAt" DATETIME,
    "repairRunId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PosTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ticketId" TEXT NOT NULL,
    "stripeChargeId" TEXT,
    "sessionId" TEXT,
    "amountCents" INTEGER,
    "currency" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "posSystem" TEXT,
    "items" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Ktl4HealthCheck" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flowName" TEXT NOT NULL,
    "checkType" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "threshold" REAL,
    "actualValue" REAL,
    "operatorId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SessionHeartbeat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "lastPing" DATETIME NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'bronze',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PartnerStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "activeLounges" INTEGER NOT NULL DEFAULT 0,
    "referralsLast30d" INTEGER NOT NULL DEFAULT 0,
    "qualityScore" REAL NOT NULL DEFAULT 0.0,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "loungeId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Payout" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "partnerId" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "gross" REAL NOT NULL,
    "revSharePct" REAL NOT NULL,
    "net" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paidAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "phone" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CustomerWallet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "walletQrToken" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerWallet_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CustomerStats" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "visitCount" INTEGER NOT NULL DEFAULT 0,
    "lastVisitAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CustomerStats_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RewardToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customerId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME,
    "redeemedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RewardToken_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlavorPopularity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "flavorId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "period" TEXT NOT NULL,
    "lastUpdated" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE INDEX "Category_isActive_idx" ON "Category"("isActive");

-- CreateIndex
CREATE INDEX "Category_displayOrder_idx" ON "Category"("displayOrder");

-- CreateIndex
CREATE INDEX "Item_categoryId_idx" ON "Item"("categoryId");

-- CreateIndex
CREATE INDEX "Item_isActive_idx" ON "Item"("isActive");

-- CreateIndex
CREATE INDEX "Item_displayOrder_idx" ON "Item"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "OrgSetting_key_key" ON "OrgSetting"("key");

-- CreateIndex
CREATE INDEX "OrgSetting_key_idx" ON "OrgSetting"("key");

-- CreateIndex
CREATE INDEX "OrgSetting_category_idx" ON "OrgSetting"("category");

-- CreateIndex
CREATE INDEX "OrgSetting_isActive_idx" ON "OrgSetting"("isActive");

-- CreateIndex
CREATE INDEX "Award_profileId_badgeId_venueId_revoked_idx" ON "Award"("profileId", "badgeId", "venueId", "revoked");

-- CreateIndex
CREATE INDEX "Event_profileId_idx" ON "Event"("profileId");

-- CreateIndex
CREATE INDEX "Event_profileId_venueId_idx" ON "Event"("profileId", "venueId");

-- CreateIndex
CREATE INDEX "Session_loungeId_state_idx" ON "Session"("loungeId", "state");

-- CreateIndex
CREATE INDEX "Session_loungeId_tableId_idx" ON "Session"("loungeId", "tableId");

-- CreateIndex
CREATE INDEX "Session_customerId_idx" ON "Session"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_loungeId_externalRef_key" ON "Session"("loungeId", "externalRef");

-- CreateIndex
CREATE UNIQUE INDEX "SessionEvent_idempotencyKey_key" ON "SessionEvent"("idempotencyKey");

-- CreateIndex
CREATE INDEX "SessionEvent_sessionId_createdAt_idx" ON "SessionEvent"("sessionId", "createdAt");

-- CreateIndex
CREATE INDEX "SessionEvent_createdAt_idx" ON "SessionEvent"("createdAt");

-- CreateIndex
CREATE INDEX "SessionTransition_sessionId_idx" ON "SessionTransition"("sessionId");

-- CreateIndex
CREATE INDEX "ReflexEvent_type_createdAt_idx" ON "ReflexEvent"("type", "createdAt");

-- CreateIndex
CREATE INDEX "ReflexEvent_ip_type_payloadHash_createdAt_idx" ON "ReflexEvent"("ip", "type", "payloadHash", "createdAt");

-- CreateIndex
CREATE INDEX "SettlementReconciliation_status_idx" ON "SettlementReconciliation"("status");

-- CreateIndex
CREATE INDEX "SettlementReconciliation_stripeChargeId_idx" ON "SettlementReconciliation"("stripeChargeId");

-- CreateIndex
CREATE INDEX "SettlementReconciliation_posTicketId_idx" ON "SettlementReconciliation"("posTicketId");

-- CreateIndex
CREATE INDEX "SettlementReconciliation_sessionId_idx" ON "SettlementReconciliation"("sessionId");

-- CreateIndex
CREATE INDEX "PosTicket_ticketId_idx" ON "PosTicket"("ticketId");

-- CreateIndex
CREATE INDEX "PosTicket_stripeChargeId_idx" ON "PosTicket"("stripeChargeId");

-- CreateIndex
CREATE INDEX "PosTicket_sessionId_idx" ON "PosTicket"("sessionId");

-- CreateIndex
CREATE INDEX "PosTicket_status_idx" ON "PosTicket"("status");

-- CreateIndex
CREATE INDEX "Ktl4HealthCheck_flowName_idx" ON "Ktl4HealthCheck"("flowName");

-- CreateIndex
CREATE INDEX "Ktl4HealthCheck_checkType_idx" ON "Ktl4HealthCheck"("checkType");

-- CreateIndex
CREATE INDEX "Ktl4HealthCheck_status_idx" ON "Ktl4HealthCheck"("status");

-- CreateIndex
CREATE INDEX "Ktl4HealthCheck_operatorId_idx" ON "Ktl4HealthCheck"("operatorId");

-- CreateIndex
CREATE INDEX "SessionHeartbeat_sessionId_idx" ON "SessionHeartbeat"("sessionId");

-- CreateIndex
CREATE INDEX "SessionHeartbeat_lastPing_idx" ON "SessionHeartbeat"("lastPing");

-- CreateIndex
CREATE INDEX "SessionHeartbeat_status_idx" ON "SessionHeartbeat"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Partner_email_key" ON "Partner"("email");

-- CreateIndex
CREATE INDEX "Partner_email_idx" ON "Partner"("email");

-- CreateIndex
CREATE INDEX "Partner_tier_idx" ON "Partner"("tier");

-- CreateIndex
CREATE INDEX "Partner_isActive_idx" ON "Partner"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "PartnerStats_partnerId_key" ON "PartnerStats"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerStats_partnerId_idx" ON "PartnerStats"("partnerId");

-- CreateIndex
CREATE INDEX "PartnerStats_lastUpdated_idx" ON "PartnerStats"("lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");

-- CreateIndex
CREATE INDEX "Referral_code_idx" ON "Referral"("code");

-- CreateIndex
CREATE INDEX "Referral_partnerId_idx" ON "Referral"("partnerId");

-- CreateIndex
CREATE INDEX "Referral_loungeId_idx" ON "Referral"("loungeId");

-- CreateIndex
CREATE INDEX "Referral_isActive_idx" ON "Referral"("isActive");

-- CreateIndex
CREATE INDEX "Payout_partnerId_idx" ON "Payout"("partnerId");

-- CreateIndex
CREATE INDEX "Payout_period_idx" ON "Payout"("period");

-- CreateIndex
CREATE INDEX "Payout_status_idx" ON "Payout"("status");

-- CreateIndex
CREATE INDEX "Customer_phone_idx" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_phone_key" ON "Customer"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerWallet_customerId_key" ON "CustomerWallet"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerWallet_walletQrToken_key" ON "CustomerWallet"("walletQrToken");

-- CreateIndex
CREATE INDEX "CustomerWallet_walletQrToken_idx" ON "CustomerWallet"("walletQrToken");

-- CreateIndex
CREATE INDEX "CustomerWallet_status_idx" ON "CustomerWallet"("status");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerStats_customerId_key" ON "CustomerStats"("customerId");

-- CreateIndex
CREATE INDEX "CustomerStats_visitCount_idx" ON "CustomerStats"("visitCount");

-- CreateIndex
CREATE INDEX "CustomerStats_lastVisitAt_idx" ON "CustomerStats"("lastVisitAt");

-- CreateIndex
CREATE INDEX "RewardToken_customerId_idx" ON "RewardToken"("customerId");

-- CreateIndex
CREATE INDEX "RewardToken_expiresAt_idx" ON "RewardToken"("expiresAt");

-- CreateIndex
CREATE INDEX "RewardToken_redeemedAt_idx" ON "RewardToken"("redeemedAt");

-- CreateIndex
CREATE INDEX "FlavorPopularity_count_idx" ON "FlavorPopularity"("count");

-- CreateIndex
CREATE INDEX "FlavorPopularity_lastUpdated_idx" ON "FlavorPopularity"("lastUpdated");

-- CreateIndex
CREATE UNIQUE INDEX "FlavorPopularity_flavorId_period_key" ON "FlavorPopularity"("flavorId", "period");
