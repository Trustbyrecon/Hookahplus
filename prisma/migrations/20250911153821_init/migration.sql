-- CreateEnum
CREATE TYPE "SessionSource" AS ENUM ('QR', 'RESERVE', 'WALK_IN');

-- CreateEnum
CREATE TYPE "SessionState" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'CLOSED', 'CANCELED');

-- CreateTable
CREATE TABLE "Badge" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "rule" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Badge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Award" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "badgeId" TEXT NOT NULL,
    "venueId" TEXT,
    "progress" INTEGER NOT NULL DEFAULT 100,
    "awardedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "awardedBy" TEXT,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Award_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "ts" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "venueId" TEXT,
    "comboHash" TEXT,
    "staffId" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "externalRef" TEXT,
    "source" "SessionSource" NOT NULL,
    "trustSignature" TEXT NOT NULL,
    "state" "SessionState" NOT NULL DEFAULT 'PENDING',
    "customerPhone" TEXT,
    "flavorMix" JSONB,
    "loungeId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionEvent" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payloadSeal" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionEvent_pkey" PRIMARY KEY ("id")
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

-- AddForeignKey
ALTER TABLE "Award" ADD CONSTRAINT "Award_badgeId_fkey" FOREIGN KEY ("badgeId") REFERENCES "Badge"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionEvent" ADD CONSTRAINT "SessionEvent_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
