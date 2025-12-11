# Night After Night Engine - Complete Implementation Plan

## Overview

Build the complete plumbing infrastructure for Hookah+'s "night after night engine" - the system that reliably handles every session from pre-order through delivery, refills, and checkout. This plan covers database models, API endpoints, event routing, and reliability features.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────┐
│ Edge & API Layer                                        │
│ - Operator Dashboard, Station UI, QR/Mobile, POS       │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ Routing & Service Layer                                 │
│ - Request Routing (API Gateway)                         │
│ - Event Routing (Message Queue)                         │
└─────────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────────┐
│ Database & Events Layer                                 │
│ - Core Models (Sessions, Orders, PreOrders)             │
│ - Event Store (SessionEvents, AuditLogs)               │
│ - Memory Layer (SessionNotes, LoyaltyProfiles)         │
└─────────────────────────────────────────────────────────┘
```

---

## Phase 1: Database Models

### 1.1 Core Session & Order Models

**File:** `apps/app/prisma/schema.prisma`

Add new models:

#### Order Model
```prisma
model Order {
  id              String   @id @default(cuid())
  sessionId       String
  type            String   // "HOOKAH" | "FOOD" | "DRINK" | "ADDON"
  status          String   @default("PENDING") // PENDING | IN_PROGRESS | READY | SERVED | CANCELLED
  priceSnapshot   String?  // JSON: pricing at time of order
  specialInstructions String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  servedAt        DateTime?
  
  // Relations
  session         Session  @relation(fields: [sessionId], references: [id])
  items           OrderItem[]
  events          OrderEvent[]
  delivery        Delivery?
  
  @@index([sessionId])
  @@index([status, createdAt])
  @@map("orders")
}

model OrderItem {
  id          String   @id @default(cuid())
  orderId     String
  itemType    String   // "FLAVOR" | "BASE" | "ADDON" | "COAL_REFILL"
  itemId      String?  // Reference to menu item or flavor
  name        String
  quantity    Int      @default(1)
  priceCents  Int
  metadata    String?  // JSON: additional item details
  
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@index([orderId])
  @@map("order_items")
}

model OrderEvent {
  id          String   @id @default(cuid())
  orderId     String
  eventType   String   // "CREATED" | "PREP_STARTED" | "COAL_CHANGED" | "READY" | "SERVED"
  staffId     String?
  metadata    String?  // JSON: event details
  createdAt   DateTime @default(now())
  
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  
  @@index([orderId, createdAt])
  @@map("order_events")
}
```

#### PreOrder Model
```prisma
model PreOrder {
  id              String   @id @default(cuid())
  loungeId        String
  guestHandle     String?  // Phone, email, or anonymous token
  qrCode          String?  @unique
  status          String   @default("PENDING") // PENDING | CONVERTED | EXPIRED | CANCELLED
  scheduledTime   DateTime?
  partySize       Int
  flavorMixJson   String?  // JSON: selected flavors
  basePrice       Int
  lockedPrice     Int?    // Price locked at pre-order time
  metadata        String?  // JSON: special requests, notes
  sessionId       String?  // Linked session when converted
  createdAt       DateTime @default(now())
  convertedAt    DateTime?
  expiresAt       DateTime?
  
  @@index([loungeId, status])
  @@index([qrCode])
  @@index([sessionId])
  @@map("preorders")
}
```

#### Delivery Model
```prisma
model Delivery {
  id          String   @id @default(cuid())
  sessionId   String
  orderId     String   @unique
  deliveredBy String   // Staff ID
  deliveredAt DateTime @default(now())
  notes       String?
  
  session     Session  @relation(fields: [sessionId], references: [id])
  order       Order    @relation(fields: [orderId], references: [id])
  
  @@index([sessionId])
  @@index([deliveredBy, deliveredAt])
  @@map("deliveries")
}
```

### 1.2 SessionNotes & Memory Layer

**File:** `apps/app/prisma/schema.prisma`

```prisma
model SessionNote {
  id              String   @id @default(cuid())
  sessionId       String
  noteType        String   // "PREFERENCE" | "BEHAVIOR" | "ISSUE" | "STAFF_OBSERVATION"
  text            String
  sentiment       String?  // "POSITIVE" | "NEUTRAL" | "NEGATIVE"
  loyaltyImpact   Int?     // 0-100 impact on loyalty score
  behavioralTags  String?  // JSON: array of tags
  createdBy       String   // Staff ID
  createdAt       DateTime @default(now())
  
  // Relations
  session         Session  @relation(fields: [sessionId], references: [id])
  loyaltyBindings LoyaltyNoteBinding[]
  
  @@index([sessionId])
  @@index([noteType, createdAt])
  @@map("session_notes")
}

model LoyaltyProfile {
  id                  String   @id @default(cuid())
  loungeId            String
  guestKey            String   // Hashed phone/email or anonymous token
  cumulativeSpend     Int      @default(0) // Total spend in cents
  visitCount          Int      @default(0)
  lastVisitAt         DateTime?
  preferenceSummary   String?  // JSON: favorite flavors, time slots, etc.
  trustScore          Int      @default(50) // 0-100
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
  
  noteBindings        LoyaltyNoteBinding[]
  
  @@unique([loungeId, guestKey])
  @@index([loungeId])
  @@map("loyalty_profiles")
}

model LoyaltyNoteBinding {
  id              String   @id @default(cuid())
  loyaltyProfileId String
  sessionNoteId   String
  
  loyaltyProfile  LoyaltyProfile @relation(fields: [loyaltyProfileId], references: [id])
  sessionNote     SessionNote     @relation(fields: [sessionNoteId], references: [id])
  
  @@unique([loyaltyProfileId, sessionNoteId])
  @@map("loyalty_note_bindings")
}
```

### 1.3 Lounge Layout Models

**File:** `apps/app/prisma/schema.prisma`

```prisma
model Zone {
  id          String   @id @default(cuid())
  loungeId    String
  name        String   // "VIP", "Main Floor", "Patio"
  zoneType    String   // "VIP" | "STANDARD" | "OUTDOOR" | "PRIVATE"
  displayOrder Int     @default(0)
  metadata    String?  // JSON: bounds, color, etc.
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  seats       Seat[]
  
  @@index([loungeId])
  @@map("zones")
}

model Seat {
  id          String   @id @default(cuid())
  loungeId    String
  zoneId      String
  tableId     String   @unique // e.g., "T-01", "VIP-3"
  name        String?
  capacity    Int
  coordinates String?  // JSON: {x, y, width, height}
  qrEnabled   Boolean  @default(true)
  status      String   @default("ACTIVE") // ACTIVE | RESERVED | MAINTENANCE
  priceMultiplier Float @default(1.0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  zone        Zone     @relation(fields: [zoneId], references: [id])
  
  @@index([loungeId, zoneId])
  @@index([tableId])
  @@map("seats")
}

model Station {
  id          String   @id @default(cuid())
  loungeId    String
  name        String   // "Prep Station 1", "Coal Station"
  stationType String   // "PREP" | "COAL" | "BAR"
  zoneId      String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  @@index([loungeId])
  @@map("stations")
}
```

### 1.4 Menu & Catalog Models

**File:** `apps/app/prisma/schema.prisma`

```prisma
model Flavor {
  id          String   @id @default(cuid())
  loungeId    String?
  name        String
  description String?
  tags        String?  // JSON: ["fruity", "mint", "dark_leaf"]
  isPremium   Boolean  @default(false)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  @@index([loungeId])
  @@map("flavors")
}

model MixTemplate {
  id          String   @id @default(cuid())
  loungeId    String
  name        String   // "House Mix", "Summer Special"
  flavorIds   String   // JSON: array of flavor IDs
  priceCents  Int?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  
  @@index([loungeId])
  @@map("mix_templates")
}

model PricingRule {
  id          String   @id @default(cuid())
  loungeId    String
  ruleType    String   // "BASE_SESSION" | "PREMIUM_ADDON" | "TIME_BASED" | "ZONE_MULTIPLIER"
  ruleConfig  String   // JSON: rule-specific configuration
  version     Int      @default(1)
  isActive    Boolean  @default(true)
  effectiveAt DateTime @default(now())
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  
  @@index([loungeId, isActive, effectiveAt])
  @@map("pricing_rules")
}
```

### 1.5 Config Versioning & Reliability Models

**File:** `apps/app/prisma/schema.prisma`

```prisma
model LoungeConfig {
  id          String   @id @default(cuid())
  loungeId    String   @unique
  configData  String   // JSON: full YAML-derived config
  version     Int      @default(1)
  effectiveAt DateTime @default(now())
  createdAt   DateTime @default(now())
  
  @@index([loungeId, version])
  @@map("lounge_configs")
}

model SyncBacklog {
  id          String   @id @default(cuid())
  deviceId    String   // Tablet/station identifier
  loungeId    String
  operation   String   // "CREATE_SESSION" | "UPDATE_ORDER" | "ADD_NOTE"
  payload     String   // JSON: operation data
  status      String   @default("PENDING") // PENDING | SYNCED | FAILED
  retryCount  Int      @default(0)
  lastAttempt DateTime?
  createdAt   DateTime @default(now())
  syncedAt    DateTime?
  
  @@index([deviceId, status])
  @@index([loungeId, status, createdAt])
  @@map("sync_backlog")
}

model AuditLog {
  id          String   @id @default(cuid())
  loungeId    String?
  userId      String?
  action      String   // "CONFIG_CHANGED" | "PRICING_UPDATED" | "MANUAL_OVERRIDE"
  entityType  String?  // "Session" | "Order" | "Config"
  entityId    String?
  changes     String?  // JSON: before/after
  createdAt   DateTime @default(now())
  
  @@index([loungeId, createdAt])
  @@index([userId, createdAt])
  @@map("audit_logs")
}
```

### 1.6 Update Session Model

**File:** `apps/app/prisma/schema.prisma`

Add to existing Session model:
```prisma
model Session {
  // ... existing fields ...
  
  // New fields for night-after-night engine
  preorderId       String?
  loungeConfigVersion Int?  // Config version used for pricing
  seatId           String?  // Link to Seat model
  zoneId           String?  // Link to Zone model
  
  // Relations
  preorder         PreOrder?  @relation(fields: [preorderId], references: [id])
  seat             Seat?      @relation(fields: [seatId], references: [id])
  zone             Zone?      @relation(fields: [zoneId], references: [id])
  orders           Order[]
  deliveries       Delivery[]
  notes            SessionNote[]
  
  @@index([preorderId])
  @@index([seatId])
  @@index([zoneId])
  @@index([loungeConfigVersion])
}
```

---

## Phase 2: API Endpoints

### 2.1 Lounge Config & Metadata APIs

**File:** `apps/app/app/api/lounges/[loungeId]/config/route.ts`

```typescript
// GET /api/lounges/{loungeId}/config
// Returns current pricing + YAML-derived config with version

// GET /api/lounges/{loungeId}/menu
// Returns flavors, add-ons, hookah types

// GET /api/lounges/{loungeId}/layout
// Returns zones, seats, stations
```

### 2.2 Pre-Order APIs

**File:** `apps/app/app/api/preorders/route.ts`

```typescript
// POST /api/preorders
// Create pre-order with flavor mix, scheduled time
// Body: { loungeId, partySize, plannedTime, flavorMix, specialRequests }

// GET /api/preorders/{id}
// Get pre-order confirmation

// POST /api/preorders/{id}/lock-price
// Lock today's price for pre-order
```

### 2.3 Session Creation & Management APIs

**File:** `apps/app/app/api/sessions/route.ts` (enhance existing)

```typescript
// POST /api/sessions
// Create session from pre-order or walk-in
// Body: { loungeId, table/zone, partySize, staffId, source, flavorMix, notes, preorderId? }

// PATCH /api/sessions/{id}/seat
// Update seat/zone, change status to SEATED

// GET /api/sessions?status=OPEN&loungeId=...
// Active sessions list for staff dashboard
```

### 2.4 Order & Prep Bar APIs

**File:** `apps/app/app/api/sessions/[id]/orders/route.ts`

```typescript
// POST /api/sessions/{id}/orders
// Create hookah order ticket for prep bar
// Body: { flavorMix, bowl type, base, add-ons, special instructions }

// GET /api/orders?loungeId=...&status=PENDING
// Prep bar view of pending orders

// PATCH /api/orders/{id}
// Update order status: IN_PROGRESS | READY | SERVED

// POST /api/orders/{id}/events
// Log granular events: coal changed, flavor adjusted
```

### 2.5 Delivery APIs

**File:** `apps/app/app/api/sessions/[id]/deliveries/route.ts`

```typescript
// POST /api/sessions/{id}/deliveries
// Record delivery and assembly
// Body: { orderId, deliveredBy }
// Auto-updates: order.status='SERVED', session.status='ACTIVE', starts timer
```

### 2.6 Session Lifecycle APIs

**File:** `apps/app/app/api/sessions/[id]/[action]/route.ts`

```typescript
// POST /api/sessions/{id}/startTimer
// Start session timer

// POST /api/sessions/{id}/extend
// Add 15/30 min or upgrade flavor
// Body: { minutes?, flavorUpgrade? }

// POST /api/sessions/{id}/pause
// Pause session (if supported)

// POST /api/sessions/{id}/coal-refill
// Log coal refill event, notify prep bar

// POST /api/sessions/{id}/upsell
// Add premium flavor, extra base, dessert
// Body: { itemType, itemId, quantity }

// GET /api/sessions/{id}
// Full live snapshot: timing, orders, refills, notes
```

### 2.7 SessionNotes APIs

**File:** `apps/app/app/api/sessions/[id]/notes/route.ts` (enhance existing)

```typescript
// POST /api/sessions/{id}/notes
// Add staff note with type, sentiment, loyalty impact
// Body: { noteType, text, sentiment?, behavioralTags? }

// GET /api/sessions/{id}/notes
// Get all notes for session

// POST /api/sessions/{id}/notes/{noteId}/bind-loyalty
// Bind note to loyalty profile
```

### 2.8 Checkout & Payment APIs

**File:** `apps/app/app/api/sessions/[id]/checkout/route.ts`

```typescript
// POST /api/sessions/{id}/checkout
// Calculate final amount: base + time + add-ons + margin
// Returns: { amount, lineItems, taxes }

// POST /api/payments
// Create payment intent
// Body: { sessionId, provider, intentId/chargeId }
// Handles Stripe/Clover/Toast flows
```

### 2.9 Webhook Endpoints

**File:** `apps/app/app/api/webhooks/[provider]/route.ts` (enhance existing)

```typescript
// POST /api/webhooks/stripe
// POST /api/webhooks/clover
// POST /api/webhooks/toast
// Each confirms payment, updates payments and sessions.status='CLOSED'
```

---

## Phase 3: Event Routing with Persistent Queues

### 3.1 Event Types Definition

**File:** `apps/app/lib/events/types.ts`

```typescript
export type SessionEventType =
  | 'SessionCreated'
  | 'SessionSeated'
  | 'OrderPlaced'
  | 'OrderInProgress'
  | 'OrderReady'
  | 'OrderServed'
  | 'TimerStarted'
  | 'TimerExtended'
  | 'TimerExpired'
  | 'CoalRefill'
  | 'UpsellAdded'
  | 'PaymentConfirmed'
  | 'SessionClosed'
  | 'NoteAdded';

export interface EventMessage {
  id: string;
  type: SessionEventType;
  sessionId?: string;
  orderId?: string;
  loungeId: string;
  payload: Record<string, any>;
  timestamp: Date;
  idempotencyKey?: string;
}
```

### 3.2 Message Queue Implementation

**File:** `apps/app/lib/events/queue.ts`

Options (choose one):
- **Option A: Postgres NOTIFY/LISTEN** (simplest, no new dependencies)
- **Option B: Redis Streams** (better for scale, requires Redis)
- **Option C: RabbitMQ** (enterprise-grade, more setup)

**Recommended: Postgres NOTIFY for MVP**

```typescript
// Postgres-based event queue
export class EventQueue {
  // Publish event to queue
  async publish(event: EventMessage): Promise<void>
  
  // Subscribe to event stream
  subscribe(eventType: SessionEventType, handler: (event: EventMessage) => Promise<void>): Unsubscribe
  
  // Worker: Process events
  async processEvents(): Promise<void>
}
```

### 3.3 Event Workers

**File:** `apps/app/lib/events/workers.ts`

```typescript
// Worker functions that consume events:
- closeStaleSessions() // Auto-close at 4am
- sendTimerReminders() // Dashboard alerts
- triggerCoalRefillHints() // Staff notifications
- aggregateNightlyStats() // Revenue, sessions, patterns
- syncLoyaltyProfiles() // Update from SessionNotes
```

### 3.4 Event Store Integration

**File:** `apps/app/lib/events/store.ts`

```typescript
// Store events in SessionEvent table for replay
// Ensure all events are persisted before processing
export async function storeAndPublish(event: EventMessage): Promise<void>
```

---

## Phase 4: Reliability Features

### 4.1 Config Versioning

**File:** `apps/app/lib/config/versioning.ts`

```typescript
// When session created, store config version
// When calculating price, use session's config version
export async function getConfigVersion(loungeId: string): Promise<number>
export async function lockConfigVersion(sessionId: string, loungeId: string): Promise<void>
```

### 4.2 Auto-Cleanup Jobs

**File:** `apps/app/lib/jobs/cleanup.ts`

```typescript
// Scheduled jobs (cron or Vercel Cron):
- autoCloseAbandonedSessions() // At 5am, close sessions > 24h old
- markStaleOrdersExpired() // Orders PENDING > 2 hours
- resyncPaymentPending() // Sessions PAYMENT_PENDING > 30 min
- cleanupExpiredPreOrders() // PreOrders EXPIRED status
```

**File:** `apps/app/app/api/cron/cleanup/route.ts`

```typescript
// Vercel Cron endpoint
// GET /api/cron/cleanup
// Runs daily at 5am
```

### 4.3 Offline Sync Backlog

**File:** `apps/app/lib/sync/backlog.ts`

```typescript
// When tablet offline, queue operations
export async function queueSyncOperation(deviceId: string, operation: string, payload: any): Promise<void>

// When connection restored, sync backlog
export async function syncBacklog(deviceId: string): Promise<void>

// API endpoint for tablets to sync
// POST /api/sync/backlog
```

### 4.4 Audit & Replay

**File:** `apps/app/lib/audit/replay.ts`

```typescript
// Reconstruct session from events
export async function replaySession(sessionId: string): Promise<SessionTimeline>

// Audit log for config changes
export async function auditConfigChange(loungeId: string, userId: string, changes: any): Promise<void>
```

### 4.5 Idempotency Layer

**File:** `apps/app/lib/idempotency/keys.ts`

```typescript
// Ensure all critical operations are idempotent
export async function withIdempotency<T>(
  key: string,
  operation: () => Promise<T>
): Promise<T>
```

---

## Implementation Order

### Week 1: Database Foundation
1. Add all new Prisma models
2. Create and run migrations
3. Update Session model relations
4. Test model relationships

### Week 2: Core APIs
1. PreOrder APIs (create, lock-price, convert)
2. Order APIs (create, update status, events)
3. Delivery APIs
4. Session lifecycle APIs (extend, pause, refill, upsell)

### Week 3: Event Routing
1. Implement Postgres NOTIFY queue
2. Create event workers
3. Integrate with existing SessionEvent store
4. Test event flow end-to-end

### Week 4: Reliability Features
1. Config versioning system
2. Auto-cleanup jobs
3. Offline sync backlog
4. Audit logging

---

## Files to Create/Modify

### Database
- `apps/app/prisma/schema.prisma` - Add all new models
- `apps/app/prisma/migrations/` - Create migration files

### APIs
- `apps/app/app/api/preorders/route.ts` - Pre-order endpoints
- `apps/app/app/api/sessions/[id]/orders/route.ts` - Order management
- `apps/app/app/api/sessions/[id]/deliveries/route.ts` - Delivery tracking
- `apps/app/app/api/sessions/[id]/extend/route.ts` - Session extensions
- `apps/app/app/api/sessions/[id]/refill/route.ts` - Coal refills (enhance existing)
- `apps/app/app/api/sessions/[id]/upsell/route.ts` - Upsells
- `apps/app/app/api/sessions/[id]/notes/route.ts` - SessionNotes (enhance existing)
- `apps/app/app/api/sessions/[id]/checkout/route.ts` - Checkout calculation
- `apps/app/app/api/lounges/[loungeId]/config/route.ts` - Config endpoints
- `apps/app/app/api/lounges/[loungeId]/menu/route.ts` - Menu endpoints
- `apps/app/app/api/lounges/[loungeId]/layout/route.ts` - Layout endpoints

### Event System
- `apps/app/lib/events/types.ts` - Event type definitions
- `apps/app/lib/events/queue.ts` - Message queue implementation
- `apps/app/lib/events/workers.ts` - Event worker functions
- `apps/app/lib/events/store.ts` - Event store integration

### Reliability
- `apps/app/lib/config/versioning.ts` - Config versioning
- `apps/app/lib/jobs/cleanup.ts` - Auto-cleanup jobs
- `apps/app/app/api/cron/cleanup/route.ts` - Cron endpoint
- `apps/app/lib/sync/backlog.ts` - Offline sync
- `apps/app/app/api/sync/backlog/route.ts` - Sync API
- `apps/app/lib/audit/replay.ts` - Audit replay

---

## Testing Strategy

1. **Unit Tests**: Each API endpoint, event handler, worker function
2. **Integration Tests**: Full session lifecycle (pre-order → delivery → checkout)
3. **Event Flow Tests**: Verify events are published, stored, and processed
4. **Reliability Tests**: Config versioning, cleanup jobs, offline sync
5. **Load Tests**: Multiple concurrent sessions, orders, events

---

## Success Criteria

- ✅ All database models created and migrated
- ✅ All API endpoints implemented and tested
- ✅ Event routing working with persistent queue
- ✅ Auto-cleanup jobs running daily
- ✅ Config versioning ensures pricing consistency
- ✅ Offline sync backlog handles tablet disconnections
- ✅ Full session lifecycle replayable from events

