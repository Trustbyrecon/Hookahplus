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
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SessionEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payloadSeal" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SquareConnection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loungeId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "scopes" TEXT NOT NULL,
    "accessTokenEnc" TEXT NOT NULL,
    "refreshTokenEnc" TEXT,
    "tokenExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SquareOrderLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "loungeId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "squareOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "squarePaymentId" TEXT,
    "squareRefundId" TEXT,
    "receiptUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SquareOrderLink_loungeId_fkey" FOREIGN KEY ("loungeId") REFERENCES "SquareConnection" ("loungeId") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SquareWebhookEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventId" TEXT NOT NULL,
    "eventType" TEXT,
    "merchantId" TEXT,
    "body" TEXT NOT NULL,
    "receivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processedAt" DATETIME
);

-- CreateIndex
CREATE INDEX "Award_profileId_badgeId_venueId_revoked_idx" ON "Award"("profileId", "badgeId", "venueId", "revoked");

-- CreateIndex
CREATE INDEX "Event_profileId_idx" ON "Event"("profileId");

-- CreateIndex
CREATE INDEX "Event_profileId_venueId_idx" ON "Event"("profileId", "venueId");

-- CreateIndex
CREATE INDEX "Session_loungeId_state_idx" ON "Session"("loungeId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "Session_loungeId_externalRef_key" ON "Session"("loungeId", "externalRef");

-- CreateIndex
CREATE INDEX "SessionEvent_sessionId_idx" ON "SessionEvent"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SquareConnection_loungeId_key" ON "SquareConnection"("loungeId");

-- CreateIndex
CREATE INDEX "SquareConnection_merchantId_idx" ON "SquareConnection"("merchantId");

-- CreateIndex
CREATE UNIQUE INDEX "SquareOrderLink_squareOrderId_key" ON "SquareOrderLink"("squareOrderId");

-- CreateIndex
CREATE INDEX "SquareOrderLink_loungeId_status_idx" ON "SquareOrderLink"("loungeId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "SquareOrderLink_loungeId_sessionId_key" ON "SquareOrderLink"("loungeId", "sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "SquareWebhookEvent_eventId_key" ON "SquareWebhookEvent"("eventId");
