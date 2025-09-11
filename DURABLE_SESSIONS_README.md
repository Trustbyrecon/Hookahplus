# Durable Sessions Implementation

This implementation replaces the in-memory session system with a durable, database-backed solution using Vercel Postgres (Neon) and Prisma.

## 🎯 Key Features

- **Idempotent Session Creation**: Never create duplicate sessions for the same `(loungeId, externalRef)` pair
- **Optimistic Concurrency Control**: Version-based updates prevent race conditions
- **Multi-Source Support**: QR codes, reservations, and walk-ins all use the same anchor system
- **Event Sourcing**: All session changes are tracked with cryptographic seals
- **Vercel-Optimized**: Uses Node.js runtime and proper caching headers

## 🚀 Quick Setup

### 1. Database Setup

1. In Vercel Dashboard → **Storage → Postgres** (creates a Neon DB)
2. Set environment variables:
   ```bash
   DATABASE_URL="postgresql://..."
   SHADOW_DATABASE_URL="postgresql://..." # for Prisma migrations
   STRIPE_SECRET_KEY="sk_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

### 2. Install Dependencies

```bash
npm install prisma @prisma/client stripe
```

### 3. Database Migration

```bash
npx prisma generate
npx prisma migrate dev --name init
# For production: npx prisma migrate deploy
```

### 4. Test the Implementation

```bash
# Start your Next.js app
npm run dev

# In another terminal, run smoke tests
npx ts-node scripts/smokeSessions.ts
```

## 📁 File Structure

```
├── prisma/
│   └── schema.prisma              # Database schema with Session/SessionEvent models
├── lib/
│   └── prisma.ts                  # Prisma client singleton for serverless
├── app/api/
│   ├── sessions/
│   │   ├── route.ts              # GET/POST /api/sessions
│   │   └── [id]/route.ts         # GET/PATCH /api/sessions/[id]
│   └── webhooks/
│       └── stripe/route.ts       # Stripe webhook handler
└── scripts/
    └── smokeSessions.ts          # Test script for idempotency & concurrency
```

## 🔧 API Usage

### Create Session (Idempotent)

```typescript
// QR Code
await fetch("/api/sessions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-idempotency-key": crypto.randomUUID(),
  },
  body: JSON.stringify({
    loungeId: "lounge-123",
    source: "QR",
    externalRef: "qr:token-abc123",
    customerPhone: "+1234567890",
    flavorMix: { flavors: ["mint", "blueberry"] }
  })
});

// Reservation
await fetch("/api/sessions", {
  method: "POST",
  headers: { /* same headers */ },
  body: JSON.stringify({
    loungeId: "lounge-123",
    source: "RESERVE", 
    externalRef: "res:reservation-456",
    customerPhone: "+1234567890"
  })
});

// Walk-in
await fetch("/api/sessions", {
  method: "POST",
  headers: { /* same headers */ },
  body: JSON.stringify({
    loungeId: "lounge-123",
    source: "WALK_IN",
    externalRef: "walkin:uuid-789",
    customerPhone: "+1234567890"
  })
});
```

### Update Session (Optimistic Concurrency)

```typescript
// Get current session
const session = await fetch("/api/sessions/session-id").then(r => r.json());

// Update with version check
await fetch("/api/sessions/session-id", {
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    expectedVersion: session.session.version, // Required!
    state: "ACTIVE",
    flavorMix: { flavors: ["mint", "strawberry"] },
    note: "Customer requested flavor change"
  })
});
```

### Query Sessions

```typescript
// Get all sessions for a lounge
const sessions = await fetch("/api/sessions?loungeId=lounge-123").then(r => r.json());

// Get sessions by state
const activeSessions = await fetch("/api/sessions?state=ACTIVE").then(r => r.json());

// Get sessions by customer phone
const customerSessions = await fetch("/api/sessions?customerPhone=+1234567890").then(r => r.json());
```

## 🔒 Security Features

### Trust Signatures
Every session has a `trustSignature` that's a SHA-256 hash of the creation payload. This ensures data integrity and prevents tampering.

### Idempotency Keys
Client-provided `x-idempotency-key` headers prevent duplicate operations from network retries.

### Version Conflicts
Optimistic concurrency control prevents race conditions during updates.

## 🧪 Testing

The smoke test script verifies:

1. **Idempotency**: Creating the same session twice returns the existing session
2. **Version Conflicts**: Concurrent updates with the same version cause conflicts
3. **Multi-Source**: QR, reservation, and walk-in sessions all work
4. **Lounge Isolation**: Same external ref in different lounges creates separate sessions

Run tests:
```bash
npx ts-node scripts/smokeSessions.ts
```

## 🚨 Vercel Gotchas

- **Runtime**: All API routes use `export const runtime = "nodejs"` (Prisma doesn't work on Edge)
- **Caching**: All routes have `export const dynamic = "force-dynamic"` and `Cache-Control: no-store`
- **Connection Pooling**: Prisma client singleton prevents connection storms
- **Webhooks**: Stripe webhook uses raw body parsing for signature verification

## 🔄 Migration from In-Memory

The old in-memory system in `lib/sessionState.ts` can be gradually replaced:

1. **Phase 1**: New sessions use the durable API
2. **Phase 2**: Update existing UI components to use the new API
3. **Phase 3**: Remove old in-memory system

## 📊 Monitoring

- **Vercel Analytics**: Monitor API response times and errors
- **Database Logs**: Watch for version conflicts and duplicate attempts
- **Event Tracking**: All session changes are logged in `SessionEvent` table

## 🔮 Future Enhancements

- **Row-Level Security**: Multi-tenant isolation at the database level
- **Cron Jobs**: Daily trust signature validation
- **Real-time Updates**: WebSocket integration for live session updates
- **Analytics**: Session duration, popular flavors, peak hours analysis
