# Hookah Plus Data Models Documentation

**Last Updated:** 2025-01-27

## Overview

This document provides a comprehensive overview of all data models used in the Hookah Plus application. The system uses **Prisma ORM** with **SQLite** as the database, along with TypeScript type definitions for application-level data structures.

### Schema Locations

The codebase contains multiple Prisma schema files that define database models:

- **`prisma/schema.prisma`** - Root schema with core models
- **`apps/app/prisma/schema.prisma`** - Most complete schema with all models (recommended reference)
- **`apps/web/prisma/schema.prisma`** - Simplified schema for web application

### Database Technology

- **ORM:** Prisma
- **Database:** SQLite
- **Note:** SQLite compatibility requires JSON data to be stored as strings rather than native JSON types

---

## Table of Contents

1. [Core Session Models](#core-session-models)
2. [Menu & Catalog Models](#menu--catalog-models)
3. [Loyalty & Gamification Models](#loyalty--gamification-models)
4. [Partnership Models](#partnership-models)
5. [Payment & POS Integration Models](#payment--pos-integration-models)
6. [System & Operations Models](#system--operations-models)
7. [TypeScript Type Definitions](#typescript-type-definitions)
8. [Model Relationships](#model-relationships)
9. [Common Patterns & Conventions](#common-patterns--conventions)

---

## Core Session Models

### Session

**Purpose:** Core model representing a hookah session at a lounge. Tracks the entire lifecycle from creation to completion.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma` (most complete)
- `apps/web/prisma/schema.prisma` (simplified)

**Key Fields:**
```prisma
model Session {
  id             String      @id @default(cuid())
  externalRef    String?     // qrToken | reservationId | stripeCheckoutId
  source         String      // QR | RESERVE | WALK_IN | POS
  trustSignature String      // Security signature
  tableId        String      // Table identifier
  customerRef    String?     // Customer reference
  customerPhone  String?     // Customer phone number
  flavor         String?     // Single flavor
  flavorMix      String?     // JSON string: array of flavors
  loungeId       String?     // Lounge identifier
  priceCents     Int         // Price in cents
  state          String      @default("NEW") // NEW | ACTIVE | PAUSED | COMPLETED | CANCELLED
  edgeCase       String?     // EQUIPMENT_ISSUE | CUSTOMER_NOT_FOUND | PAYMENT_FAILED | HEALTH_SAFETY | OTHER
  edgeNote       String?     // Edge case description
  assignedBOHId  String?     // Back of house staff ID
  assignedFOHId  String?     // Front of house staff ID
  startedAt      DateTime?   // When state -> ACTIVE
  endedAt        DateTime?   // When state -> COMPLETED/CANCELLED
  durationSecs   Int?        // Computed duration on complete
  paymentIntent  String?     // Stripe Payment Intent ID
  paymentStatus  String?     // Payment status
  orderItems     String?     // JSON string: order items
  posMode        String?     // POS integration mode
  version        Int         @default(1)
  
  // Timer fields (apps/app only)
  timerDuration      Int?     // in minutes
  timerStartedAt     DateTime?
  timerPausedAt      DateTime?
  timerPausedDuration Int?    // total paused time in seconds
  timerStatus        String?  // 'stopped' | 'running' | 'paused' | 'completed'
  
  // Pre-Order flow fields (apps/app only)
  zone            String?     // 'VIP', 'Standard', 'Patio', etc.
  fohUserId       String?     // FOH staff assigned
  specialRequests String?     // Customer special requests
  tableNotes      String?     // Table-specific notes
  
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt
}
```

**Relations:**
- `events` → `SessionEvent[]`
- `transitions` → `SessionTransition[]` (root schema only)

**State Machine:**
- **NEW** → Initial state
- **ACTIVE** → Session in progress
- **PAUSED** → Temporarily paused
- **COMPLETED** → Successfully finished
- **CANCELLED** → Cancelled before completion

**Indexes:**
- `[loungeId, state]` - Filter active sessions by lounge
- `[loungeId, tableId]` - Find session by table
- `[loungeId, externalRef]` - Unique constraint for idempotency

---

### SessionEvent

**Purpose:** Event log for session lifecycle events. Provides audit trail and debugging capabilities.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/web/prisma/schema.prisma`

**Key Fields:**
```prisma
model SessionEvent {
  id          String   @id @default(cuid())
  sessionId   String
  type        String   // Event type identifier
  payloadSeal String   // Security seal/hash
  data        String   // JSON string: event payload
  createdAt   DateTime @default(now())
  session     Session  @relation(fields: [sessionId], references: [id])
  
  @@index([sessionId])
}
```

**Relations:**
- `session` → `Session`

---

### SessionTransition

**Purpose:** Tracks state transitions for sessions, providing a complete audit trail of how sessions move through their lifecycle.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model SessionTransition {
  id          String   @id @default(cuid())
  sessionId   String
  fromState   String   // Previous state
  toState     String   // New state
  transition  String   // Transition name
  userId      String   // User who triggered transition (optional in root)
  note        String?  // Additional notes
  createdAt   DateTime @default(now())
  session     Session  @relation(fields: [sessionId], references: [id])
  
  @@index([sessionId])
}
```

**Relations:**
- `session` → `Session`

---

### SessionHeartbeat

**Purpose:** Real-time monitoring of active sessions. Tracks session status, elapsed time, and health.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model SessionHeartbeat {
  id          String   @id @default(cuid())
  sessionId   String
  stationId   String?  // Physical station/table ID (apps/app only)
  status      String   // 'active' | 'paused' | 'stalled' | 'completed'
  elapsedSecs Int      // Elapsed time in seconds (apps/app only)
  remainingSecs Int?   // Remaining time in seconds (apps/app only)
  lastPing    DateTime @default(now())
  createdAt   DateTime @default(now())
  
  @@index([sessionId, lastPing])
}
```

**Relations:**
- References `Session` by `sessionId` (no explicit relation)

---

## Menu & Catalog Models

### Category

**Purpose:** Organizes menu items into logical categories for display and management.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model Category {
  id          String   @id @default(cuid())
  name        String
  description String?
  displayOrder Int     @default(0)
  isActive    Boolean  @default(true)
  icon        String?  // Icon name or URL (apps/app only)
  color       String?  // Hex color code (apps/app only)
  createdAt   DateTime @default(now())
  updatedAt    DateTime @updatedAt
  items       Item[]   // Related items
  
  @@index([isActive])
  @@index([displayOrder])
}
```

**Relations:**
- `items` → `Item[]`

---

### Item

**Purpose:** Represents a menu item (flavors, add-ons, food, beverages) available for order.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model Item {
  id          String   @id @default(cuid())
  name        String
  description String?
  priceCents  Int      // Price in cents
  categoryId  String
  isActive    Boolean  @default(true)
  displayOrder Int     @default(0)
  imageUrl    String?  // Item image URL (apps/app only)
  allergens   String   // Comma-separated allergen strings
  isPopular   Boolean  @default(false)
  prepTime    Int?     // Prep time in minutes (apps/app only)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  category    Category @relation(fields: [categoryId], references: [id])
  
  @@index([categoryId])
  @@index([isActive])
  @@index([displayOrder])
}
```

**Relations:**
- `category` → `Category`

---

## Loyalty & Gamification Models

### Badge

**Purpose:** Defines achievement badges that can be awarded to customers based on various criteria.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/web/prisma/schema.prisma`

**Key Fields:**
```prisma
model Badge {
  id     String  @id
  label  String  // Badge display name
  scope  String  // 'lounge' | 'network'
  rule   String  // JSON string: badge award criteria
  active Boolean @default(true)
  awards Award[] // Awarded badges
  
  @@index([active])
}
```

**Relations:**
- `awards` → `Award[]`

**Badge Scopes:**
- **lounge:** Badge specific to a single lounge location
- **network:** Badge valid across all Hookah Plus locations

---

### Award

**Purpose:** Records when a badge has been awarded to a customer profile.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/web/prisma/schema.prisma`

**Key Fields:**
```prisma
model Award {
  id         String   @id
  profileId  String   // Customer profile ID
  badgeId    String
  badge      Badge    @relation(fields: [badgeId], references: [id])
  venueId    String?  // Optional venue-specific award
  progress   Int      @default(100) // Progress percentage
  awardedAt  DateTime @default(now())
  awardedBy  String?  // Staff member who awarded (optional)
  revoked    Boolean  @default(false)
  
  @@index([profileId, badgeId, venueId, revoked])
}
```

**Relations:**
- `badge` → `Badge`

---

### Event

**Purpose:** Tracks customer activity events for loyalty program calculations and analytics.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/web/prisma/schema.prisma`

**Key Fields:**
```prisma
model Event {
  id        String   @id @default(cuid())
  ts        DateTime @default(now())
  type      String   // 'check_in' | 'visit_closed' | 'mix_ordered'
  profileId String   // Customer profile ID
  venueId   String?  // Lounge location
  comboHash String?  // Hash of flavor combination
  staffId   String?  // Staff member ID
  
  @@index([profileId])
  @@index([profileId, venueId])
}
```

**Event Types:**
- **check_in:** Customer checked into lounge
- **visit_closed:** Customer visit completed
- **mix_ordered:** Flavor mix ordered

---

## Partnership Models

### Partner

**Purpose:** Represents a business partner in the Hookah Plus network who can refer customers and earn revenue share.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model Partner {
  id          String   @id @default(cuid())
  name        String
  email       String   @unique
  tier        String   @default("bronze") // bronze | silver | gold | platinum
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relations
  referrals   Referral[]
  payouts     Payout[]
  stats       PartnerStats?
  
  @@index([email])
  @@index([tier])
  @@index([isActive])
}
```

**Relations:**
- `referrals` → `Referral[]`
- `payouts` → `Payout[]`
- `stats` → `PartnerStats?` (one-to-one)

**Partner Tiers:**
- **bronze:** Entry level
- **silver:** Mid tier
- **gold:** High tier
- **platinum:** Premium tier

---

### PartnerStats

**Purpose:** Aggregated statistics for partners, tracking performance metrics for revenue sharing calculations.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model PartnerStats {
  id              String   @id @default(cuid())
  partnerId       String   @unique
  totalReferrals  Int      @default(0)
  activeLounges   Int      @default(0)
  referralsLast30d Int     @default(0)
  qualityScore    Float    @default(0.0)
  lastUpdated     DateTime @default(now())
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  partner         Partner  @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  
  @@index([partnerId])
  @@index([lastUpdated])
}
```

**Relations:**
- `partner` → `Partner` (one-to-one, cascade delete)

---

### Referral

**Purpose:** Represents referral codes that partners can use to refer customers and earn commissions.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model Referral {
  id          String    @id @default(cuid())
  code        String    @unique
  partnerId   String
  loungeId    String?   // Optional lounge-specific referral
  isActive    Boolean   @default(true)
  uses        Int       @default(0)
  maxUses     Int?      // Optional usage limit (apps/app only)
  expiresAt   DateTime? // Optional expiration (apps/app only)
  createdAt   DateTime  @default(now())
  activatedAt DateTime? // When first used (apps/app only)
  
  partner     Partner   @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  
  @@index([code])
  @@index([partnerId])
  @@index([loungeId])
  @@index([isActive])
}
```

**Relations:**
- `partner` → `Partner` (cascade delete)

---

### Payout

**Purpose:** Tracks revenue share payouts to partners for their referrals.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model Payout {
  id           String   @id @default(cuid())
  partnerId    String
  period       String   // YYYY-MM format (e.g., "2025-01")
  gross        Float    // Gross revenue
  revSharePct  Float    // Revenue share percentage
  net          Float    // Net payout amount
  status       String   @default("pending") // pending | paid
  createdAt    DateTime @default(now())
  paidAt       DateTime? // When payment was processed
  updatedAt    DateTime @updatedAt
  
  partner      Partner  @relation(fields: [partnerId], references: [id], onDelete: Cascade)
  
  @@index([partnerId])
  @@index([period])
  @@index([status])
}
```

**Relations:**
- `partner` → `Partner` (cascade delete)

**Payout Status:**
- **pending:** Payout calculated but not yet paid
- **paid:** Payout processed and completed

---

## Payment & POS Integration Models

### SettlementReconciliation

**Purpose:** Reconciles payments between Stripe and POS systems to ensure financial accuracy.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model SettlementReconciliation {
  id              String   @id @default(cuid())
  stripeChargeId  String?  // Stripe charge ID
  posTicketId     String?  // POS ticket ID
  sessionId       String?  // Associated session
  amount          Int?     // Amount in cents
  currency        String?  // Currency code (root schema only)
  status          String   // 'pending' | 'matched' | 'orphaned' | 'reconciled'
  mismatchReason  String?  // Reason for mismatch (apps/app only)
  repairRunId     String?  // ID of repair run that fixed it
  createdAt       DateTime @default(now())
  reconciledAt    DateTime? // When reconciliation completed
  updatedAt       DateTime @updatedAt // Root schema only
  
  @@index([stripeChargeId])
  @@index([posTicketId])
  @@index([sessionId])
  @@index([status, createdAt])
}
```

**Reconciliation Status:**
- **pending:** Initial state, awaiting matching
- **matched:** Successfully matched Stripe and POS records
- **orphaned:** No matching record found
- **reconciled:** Reconciliation process completed

---

### PosTicket

**Purpose:** Represents a ticket/transaction from an external POS system (Square, Clover, Toast, etc.).

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model PosTicket {
  id              String   @id @default(cuid())
  ticketId        String   @unique // External POS ticket ID
  sessionId       String?  // Associated session
  stripeChargeId  String?  // Associated Stripe charge
  amountCents     Int      // Total amount in cents
  items           String?  // JSON string: ticket items
  taxes           Int?     // Tax amount in cents (apps/app only)
  tips            Int?     // Tip amount in cents (apps/app only)
  status          String   // 'pending' | 'paid' | 'refunded' | 'cancelled'
  posSystem       String   // 'square' | 'clover' | 'toast'
  currency        String?  // Currency code (root schema only)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([ticketId])
  @@index([sessionId])
  @@index([stripeChargeId])
  @@index([status])
}
```

**POS Systems:**
- **square:** Square POS
- **clover:** Clover POS
- **toast:** Toast POS

**Ticket Status:**
- **pending:** Ticket created but not yet paid
- **paid:** Payment completed
- **refunded:** Payment refunded
- **cancelled:** Ticket cancelled

---

### PricingLock

**Purpose:** Locks in a final price for a session, preventing price changes during the session lifecycle.

**Schema Locations:**
- `apps/app/prisma/schema.prisma` only

**Key Fields:**
```prisma
model PricingLock {
  id              String   @id @default(cuid())
  sessionId       String   @unique
  finalPriceCents Int      // Final locked price
  priceHash       String   // Hash of pricing components
  components      String?  // JSON string: price components
  lockedAt        DateTime @default(now())
  operatorId      String?  // Operator who locked pricing
  auditNote       String?  // Manual override note if any
  
  @@index([sessionId])
}
```

**Purpose:** Ensures price integrity by locking the final price once calculated, with audit trail for manual overrides.

---

## System & Operations Models

### User

**Purpose:** Represents staff members and system users with role-based access control.

**Schema Locations:**
- `apps/app/prisma/schema.prisma` only

**Key Fields:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  roles     String   // Comma-separated: "BOH,FOH,MANAGER,ADMIN"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**Roles:**
- **BOH:** Back of House staff
- **FOH:** Front of House staff
- **MANAGER:** Management role
- **ADMIN:** Administrative access

---

### OrgSetting

**Purpose:** System-wide configuration settings stored as key-value pairs.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model OrgSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  category    String?  // 'pos' | 'menu' | 'timing' | 'ui' | 'general'
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  @@index([key])
  @@index([category])
  @@index([isActive])
}
```

**Setting Categories:**
- **pos:** POS integration settings
- **menu:** Menu display settings
- **timing:** Timing and duration settings
- **ui:** User interface settings
- **general:** General system settings

---

### ReflexEvent

**Purpose:** Event logging for the Reflex system (quality assurance and error tracking).

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model ReflexEvent {
  id             String   @id @default(cuid())
  type           String
  source         String   @default("ui") // ui | backend | agent
  sessionId      String?  // Lounge session ID if applicable
  paymentIntent  String?  // Stripe Payment Intent if applicable
  payload        String?  // JSON string: event payload
  payloadHash    String?  // SHA256 hash for deduplication
  userAgent      String?
  ip             String?
  createdAt      DateTime @default(now())
  
  @@index([type, createdAt])
}
```

**Event Sources:**
- **ui:** User interface events
- **backend:** Backend system events
- **agent:** Automated agent events

---

### Ktl4HealthCheck

**Purpose:** Health monitoring for KTL-4 (Keep The Lights On) system flows. Tracks system health and performance.

**Schema Locations:**
- `prisma/schema.prisma`
- `apps/app/prisma/schema.prisma`

**Key Fields:**
```prisma
model Ktl4HealthCheck {
  id          String   @id @default(cuid())
  flowName    String   // 'payment_settlement' | 'session_lifecycle' | 'order_intake' | 'pos_sync'
  checkType   String   // 'heartbeat' | 'reconciliation' | 'latency' | 'parity'
  status      String   // 'healthy' | 'degraded' | 'critical' | 'failed'
  details     String?  // JSON string: check details
  threshold   Int?     // Threshold value checked (apps/app) | Float? (root)
  actualValue Int?     // Actual value that triggered status (apps/app) | Float? (root)
  operatorId  String?  // Operator who triggered manual check
  createdAt   DateTime @default(now())
  
  @@index([flowName, createdAt])
  @@index([checkType]) // apps/app only
  @@index([status]) // apps/app only
  @@index([operatorId]) // apps/app only
}
```

**Flow Names:**
- **payment_settlement:** Payment processing flow
- **session_lifecycle:** Session management flow
- **order_intake:** Order processing flow
- **pos_sync:** POS synchronization flow

**Check Types:**
- **heartbeat:** Regular health check
- **reconciliation:** Payment reconciliation check
- **latency:** Performance latency check
- **parity:** Data parity check

**Status Values:**
- **healthy:** System operating normally
- **degraded:** Performance below optimal but functional
- **critical:** Critical issues detected
- **failed:** System failure detected

---

### Ktl4Alert

**Purpose:** Alert system for KTL-4 monitoring. Tracks alerts that require operator attention.

**Schema Locations:**
- `apps/app/prisma/schema.prisma` only

**Key Fields:**
```prisma
model Ktl4Alert {
  id          String   @id @default(cuid())
  priority    String   // 'P1' | 'P2' | 'P3'
  flowName    String   // Which KTL-4 flow
  alertType   String   // Type of alert
  message     String   // Alert message
  details     String?  // JSON string: alert details
  status      String   // 'active' | 'acknowledged' | 'resolved'
  acknowledgedBy String? // Operator who acknowledged
  resolvedAt  DateTime?
  createdAt   DateTime @default(now())
  
  @@index([priority, status, createdAt])
}
```

**Priority Levels:**
- **P1:** Critical - Immediate attention required
- **P2:** High - Attention required soon
- **P3:** Medium - Monitor and address

**Alert Status:**
- **active:** Alert is active and unacknowledged
- **acknowledged:** Alert acknowledged by operator
- **resolved:** Alert resolved and closed

---

### BreakGlassAction

**Purpose:** Tracks emergency "break glass" actions taken by operators to handle critical situations.

**Schema Locations:**
- `apps/app/prisma/schema.prisma` only

**Key Fields:**
```prisma
model BreakGlassAction {
  id          String   @id @default(cuid())
  actionType  String   // 'freeze_station' | 'degraded_mode' | 'manual_override'
  targetId    String?  // Station/session ID affected
  operatorId  String   // Operator who took action
  reason      String   // Reason for break-glass action
  details     String?  // JSON string: action details
  createdAt   DateTime @default(now())
  resolvedAt DateTime?
  
  @@index([actionType, createdAt])
}
```

**Action Types:**
- **freeze_station:** Freeze a station/session
- **degraded_mode:** Enable degraded operation mode
- **manual_override:** Manual system override

---

## TypeScript Type Definitions

The application uses TypeScript types for runtime data structures that complement the Prisma models. These are defined in the `types/` directory.

### Guest Profile Types

**Location:** `types/guest.ts`

#### GuestProfile
```typescript
export type GuestProfile = {
  guestId: string;            // UUID (portable)
  anon: boolean;              // true until opt-in
  phone?: string;             // optional, if user links
  email?: string;             // optional, if user links
  lastLoungeId?: string;
  badges: string[];           // ["Regular","MixMaster","Explorer","Loyalist"]
  sessions: string[];         // sessionIds (recent first)
  points: number;             // loyalty points
  createdAt: string; 
  updatedAt: string;
  deviceId?: string;          // for anonymous tracking
  preferences?: {
    favoriteFlavors: string[];
    savedMixes: MixProfile[];
    notifications: boolean;
  };
}
```

#### MixProfile
```typescript
export type MixProfile = {
  mixId: string;
  name: string;
  flavors: string[];
  notes?: string;
  createdAt: string;
  timesUsed: number;
}
```

#### Session (TypeScript)
```typescript
export type Session = {
  sessionId: string;
  loungeId: string;
  guestId: string;
  mix: { 
    flavors: string[]; 
    notes?: string;
    mixId?: string; // if using saved mix
  };
  price: { 
    base: number; 
    addons: number; 
    total: number; 
    currency: "USD";
    promo?: {
      code: string;
      discount: number;
      type: 'percentage' | 'fixed';
    };
  };
  status: "started"|"in_progress"|"served"|"closed"|"cancelled";
  ts: { 
    startedAt: string; 
    servedAt?: string;
    closedAt?: string;
  };
  trust: { 
    ghostHash: string; 
    signature: string;
  };
  tableId?: string;
  staffAssigned?: {
    foh?: string;
    boh?: string;
  };
}
```

#### LoyaltyEvent
```typescript
export type LoyaltyEvent = {
  eventId: string;
  guestId: string;
  loungeId: string;
  type: "EARN"|"REDEEM"|"BADGE_AWARDED"|"REFERRAL_BONUS"|"MIX_SAVED";
  value: number;              // points or token units
  badgeId?: string;
  sessionId?: string;
  description?: string;
  ts: string;
  ghostHash: string;
}
```

#### ReferralLink
```typescript
export type ReferralLink = {
  code: string;               // short id
  connectorId?: string;       // optional partner
  inviterGuestId?: string;    // P2P referrals
  loungeId: string;
  clicks: number; 
  joins: number;
  rewards: number;            // points earned from referrals
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
}
```

#### BadgeDefinition
```typescript
export type BadgeDefinition = {
  badgeId: string;
  name: string;
  description: string;
  icon: string;
  category: 'loyalty' | 'exploration' | 'social' | 'achievement';
  requirements: {
    type: 'sessions' | 'lounges' | 'mixes' | 'referrals' | 'points';
    count: number;
    timeframe?: number; // days
    conditions?: Record<string, any>;
  };
  rewards: {
    points: number;
    perks?: string[];
  };
}
```

### API Request/Response Types

**Location:** `types/guest.ts`

The file includes comprehensive API type definitions for:
- `GuestEnterRequest` / `GuestEnterResponse`
- `SessionStartRequest` / `SessionStartResponse`
- `MixSaveRequest` / `MixSaveResponse`
- `PriceQuoteRequest` / `PriceQuoteResponse`
- `CheckoutRequest` / `CheckoutResponse`
- `ReferralCreateRequest` / `ReferralCreateResponse`
- `EventLogRequest` / `EventLogResponse`
- `RewardsResponse`
- `FeatureFlags`
- `LoungeData`
- `QRData`
- `GuestError`
- `AnalyticsEvent`

### Customer Journey Types

**Location:** `lib/customer-journey.ts`

#### CustomerBooking
```typescript
export interface CustomerBooking {
  id: string;
  reservationId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  partySize: number;
  tableId: string;
  tableType: string;
  zone: string;
  position: { x: number; y: number };
  flavorMix: string;
  basePrice: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'active' | 'completed' | 'cancelled';
  currentStage: 'booking' | 'payment' | 'prep' | 'delivery' | 'service' | 'completion';
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  prepStaffId?: string;
  deliveryStaffId?: string;
  serviceStaffId?: string;
  estimatedPrepTime: number;
  estimatedSessionTime: number;
  qrCode: string;
  checkInTime?: Date;
  sessionStartTime?: Date;
  sessionEndTime?: Date;
  metadata: {
    source: 'layout_preview' | 'mobile_app' | 'staff_entry' | 'walk_in' | 'reservation_hold' | 'qr_checkin' | 'multi_fire_session';
    [key: string]: any;
  };
}
```

#### BOHOperation
```typescript
export interface BOHOperation {
  id: string;
  bookingId: string;
  operationType: 'prep_start' | 'prep_complete' | 'delivery_start' | 'delivery_complete' | 'service_start' | 'service_end' | 'refill_request' | 'coal_swap' | 'session_pause' | 'session_resume' | 'multi_session_setup' | 'reservation_prep' | 'qr_checkin_prep';
  staffId?: string;
  timestamp: Date;
  notes?: string;
  priority?: 'low' | 'medium' | 'high';
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled';
}
```

### Reflex System Types

**Location:** `types/reflex.ts`

#### ReflexEvent
```typescript
export interface ReflexEvent {
  route: string;
  action: string;
  score: number;
  failureType?: FailureType;
  patch?: string;
  outcome: "proceed" | "recover" | "halt";
  fingerprint: EnrichmentFingerprint;
  timestamp: string;
  severity: "low" | "medium" | "critical";
}
```

#### ReflexScore
```typescript
export interface ReflexScore {
  value: number;         // 0..1 overall confidence
  components: {
    semanticDensity: number;
    relevance: number;
    structure: number;
    memoryConsistency: number;
  };
  failureType?: FailureType;
  confidence: number;
  downstreamRisk: number;
}
```

### Aliethia Reflex Types

**Location:** `types/aliethia_reflex.ts`

#### ClarityFingerprint
```typescript
export interface ClarityFingerprint {
  clarityScore: number;        // 0.0 - 1.0
  resonanceSignal: number;     // 0.0 - 1.0
  trustCompound: number;       // 0.0 - 1.0
  identityAlignment: number;   // 0.0 - 1.0
  belongingMoment: boolean;
  harmonicSignature: string;  // "ΔA7"
  symbolicMark: string;        // "Open Gate Φ"
  resonanceField: string;     // "soft-gold on obsidian"
}
```

#### AliethiaEvent
```typescript
export interface AliethiaEvent {
  id: string;
  timestamp: string;
  operation: string;
  context: Record<string, any>;
  outcome: Record<string, any>;
  clarityFingerprint: ClarityFingerprint;
  aliethiaEcho: string;
  trustBloomRate: number;
  clarityCompoundRate: number;
}
```

### Order Types

**Location:** `lib/orders.ts`

#### Order
```typescript
type Order = {
  id: string;
  tableId?: string;
  flavor?: string;
  amount: number;
  currency: string;
  status: "created" | "paid" | "failed";
  createdAt: number;
  sessionStartTime?: number;
  sessionDuration?: number;
  coalStatus?: "active" | "needs_refill" | "burnt_out" | "paused";
  addOnFlavors?: string[];
  baseRate?: number;
  addOnRate?: number;
  totalRevenue?: number;
  customerName?: string;
  customerId?: string;
  customerPreferences?: {
    favoriteFlavors?: string[];
    sessionDuration?: number;
    addOnPreferences?: string[];
    notes?: string;
  };
  tableType?: "high_boy" | "table" | "2x_booth" | "4x_booth" | "8x_sectional" | "4x_sofa";
  tablePosition?: { x: number; y: number };
}
```

---

## Model Relationships

### Entity Relationship Overview

```
Session (Core)
  ├── SessionEvent[] (1:N)
  ├── SessionTransition[] (1:N)
  ├── SessionHeartbeat (1:1, by sessionId)
  ├── PricingLock (1:1, apps/app only)
  └── Referenced by:
      ├── SettlementReconciliation
      ├── PosTicket
      └── ReflexEvent

Category (Menu)
  └── Item[] (1:N)

Badge (Loyalty)
  └── Award[] (1:N)

Partner (Partnership)
  ├── Referral[] (1:N)
  ├── Payout[] (1:N)
  └── PartnerStats (1:1)

User (System)
  └── Referenced by:
      ├── SessionTransition
      └── BreakGlassAction
```

### Cross-References

**Sessions ↔ Payments:**
- `Session.paymentIntent` → Stripe Payment Intent
- `Session.id` ← `SettlementReconciliation.sessionId`
- `Session.id` ← `PosTicket.sessionId`

**Sessions ↔ Loyalty:**
- `Session.id` → Used in `Event` model for activity tracking
- `Event.profileId` → Customer profile (external)

**Partnerships:**
- `Partner.id` → `Referral.partnerId`
- `Partner.id` → `Payout.partnerId`
- `Partner.id` → `PartnerStats.partnerId` (one-to-one)

---

## Common Patterns & Conventions

### JSON String Storage

Due to SQLite limitations, complex data structures are stored as JSON strings:

- `Session.flavorMix` - Array of flavor strings
- `Session.orderItems` - Order item details
- `Badge.rule` - Badge award criteria
- `Event.data` / `SessionEvent.data` - Event payloads
- `PosTicket.items` - Ticket item details
- `PricingLock.components` - Price component breakdown
- `Ktl4HealthCheck.details` - Health check details
- `Ktl4Alert.details` - Alert details
- `BreakGlassAction.details` - Action details

**Usage Pattern:**
```typescript
// Store
const flavorMix = JSON.stringify(['Mint', 'Grape']);
await prisma.session.update({
  data: { flavorMix }
});

// Retrieve
const session = await prisma.session.findUnique({ where: { id } });
const flavors = JSON.parse(session.flavorMix || '[]');
```

### State Machines

Several models use state machines:

**Session States:**
- `NEW` → `ACTIVE` → `PAUSED` → `ACTIVE` → `COMPLETED`
- `NEW` → `ACTIVE` → `CANCELLED`
- States tracked via `SessionTransition` model

**Payment Status:**
- `pending` → `paid` → `refunded`
- `pending` → `failed`

**Session Timer Status:**
- `stopped` → `running` → `paused` → `running` → `completed`

### Timestamps

All models include:
- `createdAt: DateTime @default(now())` - Record creation time
- `updatedAt: DateTime @updatedAt` - Automatic update on modification

**Usage:**
- Timestamps are in UTC
- Use `@updatedAt` for automatic timestamp updates

### Price Storage

All prices stored in **cents** (integer) to avoid floating-point precision issues:

- `Session.priceCents: Int`
- `Item.priceCents: Int`
- `PosTicket.amountCents: Int`
- `PricingLock.finalPriceCents: Int`

**Conversion:**
```typescript
const priceCents = Math.round(price * 100);
const price = priceCents / 100;
```

### Idempotency

Sessions use unique constraints for idempotency:

```prisma
@@unique([loungeId, externalRef]) // idempotent anchor
```

This ensures the same `externalRef` (QR token, reservation ID, etc.) cannot create duplicate sessions for the same lounge.

### Cascade Deletes

Referential integrity maintained with cascade deletes:

```prisma
partner Partner @relation(..., onDelete: Cascade)
```

When a `Partner` is deleted:
- Related `Referral` records are deleted
- Related `Payout` records are deleted
- Related `PartnerStats` record is deleted

### Indexing Strategy

Common indexing patterns:

**Single Field:**
```prisma
@@index([isActive])
@@index([status])
```

**Composite:**
```prisma
@@index([loungeId, state])
@@index([profileId, badgeId, venueId, revoked])
```

**Time-based Queries:**
```prisma
@@index([type, createdAt])
@@index([priority, status, createdAt])
```

### Version Field

The `Session` model includes a `version` field for optimistic locking:

```prisma
version Int @default(1)
```

**Usage:**
```typescript
const session = await prisma.session.findUnique({ where: { id } });
// ... modify session ...
await prisma.session.update({
  where: { id, version: session.version },
  data: { ...updates, version: { increment: 1 } }
});
```

### Trust & Security

**Trust Signature:**
- `Session.trustSignature` - Cryptographic signature for session integrity
- `SessionEvent.payloadSeal` - Security seal for event data

**Deduplication:**
- `ReflexEvent.payloadHash` - SHA256 hash for event deduplication

---

## Schema Version Differences

### Root Schema (`prisma/schema.prisma`)
- Contains core models
- Missing: `User`, `PricingLock`, `Ktl4Alert`, `BreakGlassAction`
- `Session` model has fewer fields

### App Schema (`apps/app/prisma/schema.prisma`)
- **Most complete** - recommended reference
- Includes all models with extended fields
- `Session` includes timer and pre-order fields
- Additional operational models (`User`, `BreakGlassAction`, etc.)

### Web Schema (`apps/web/prisma/schema.prisma`)
- Simplified version
- Core models only: `Badge`, `Award`, `Event`, `Session`, `SessionEvent`
- No partnership, payment, or system models

### Recommendations

1. **For new development:** Use `apps/app/prisma/schema.prisma` as the reference
2. **For queries:** Be aware of which schema your app is using
3. **For migrations:** Apply to the appropriate schema file
4. **Consider consolidation:** May want to consolidate schemas in future refactoring

---

## Additional Resources

### Related Documentation

- `DATABASE_PRODUCTION_SETUP.md` - Database production setup
- `BADGES_V1_README.md` - Badge system implementation
- `SESSION_TRACKER_README.md` - Session tracking system
- `STRIPE_CATALOG_README.md` - Stripe integration

### Type Definitions

- `types/guest.ts` - Guest and session types
- `types/reflex.ts` - Reflex system types
- `types/aliethia_reflex.ts` - Aliethia clarity system types
- `lib/customer-journey.ts` - Customer journey types
- `lib/orders.ts` - Order management types

---

**Document Version:** 1.0  
**Maintained By:** Development Team  
**Questions or Updates:** Please update this document when models change

