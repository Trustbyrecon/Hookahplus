# 🎯 Jules Mission Brief - Loyalty Ledger

**Agent:** Jules  
**Priority:** P1 (Now Unblocked!)  
**Status:** ✅ Ready to start  
**G1 Status:** 🟢 UNLOCKED

---

## 🎯 Mission Overview

Build a **non-crypto loyalty ledger** that:
- Issues credits when POS tickets are reconciled
- Redeems credits for discounts/rewards
- Maintains ACID compliance for transaction integrity
- Integrates seamlessly with POS reconciliation (Noor)
- Achieves <60s round-trip performance

---

## 📋 Objectives (In Order)

### O1.1: Ledger Schema Design
**File:** `apps/app/prisma/schema.prisma`

**Create tables:**
- `LoyaltyAccount` - Customer loyalty accounts
  - `id` (String, primary key)
  - `customerId` (String, indexed)
  - `customerPhone` (String, indexed)
  - `balanceCents` (Int, default 0)
  - `totalEarnedCents` (Int, default 0)
  - `totalRedeemedCents` (Int, default 0)
  - `createdAt` (DateTime)
  - `updatedAt` (DateTime)

- `LoyaltyTransaction` - ACID transaction log
  - `id` (String, primary key)
  - `accountId` (String, foreign key → LoyaltyAccount)
  - `type` (String: 'ISSUE' | 'REDEEM' | 'ADJUST')
  - `amountCents` (Int)
  - `balanceBeforeCents` (Int)
  - `balanceAfterCents` (Int)
  - `source` (String: 'POS' | 'MANUAL' | 'REFUND')
  - `sessionId` (String, nullable)
  - `posTicketId` (String, nullable)
  - `metadata` (String, JSON)
  - `createdAt` (DateTime)
  - `version` (Int, default 1) - For optimistic locking

- `LoyaltyWallet` - Wallet view (optional, for performance)
  - `accountId` (String, primary key)
  - `balanceCents` (Int)
  - `lastTransactionId` (String)
  - `updatedAt` (DateTime)

**Relationships:**
- `LoyaltyAccount` → `LoyaltyTransaction[]` (1:many)
- `LoyaltyAccount` → `LoyaltyWallet` (1:1)

---

### O1.2: Issue Credits Endpoint
**File:** `apps/app/app/api/loyalty/issue/route.ts`

**POST `/api/loyalty/issue`**

**Request:**
```json
{
  "customerId": "CUST-123",
  "customerPhone": "+1234567890",
  "amountCents": 1000,
  "source": "POS",
  "sessionId": "session-123",
  "posTicketId": "ticket-456",
  "metadata": {}
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "txn-789",
  "accountId": "acc-123",
  "balanceBeforeCents": 5000,
  "balanceAfterCents": 6000,
  "amountCents": 1000
}
```

**Logic:**
1. Find or create `LoyaltyAccount` for customer
2. Start transaction (ACID)
3. Create `LoyaltyTransaction` with type 'ISSUE'
4. Update `LoyaltyAccount.balanceCents`
5. Update `LoyaltyAccount.totalEarnedCents`
6. Update `LoyaltyWallet` (if exists)
7. Commit transaction
8. Return new balance

**Error Handling:**
- Invalid customer ID → 400
- Negative amount → 400
- Database transaction failure → 500
- Optimistic locking conflict → 409 (retry)

---

### O1.3: Redeem Credits Endpoint
**File:** `apps/app/app/api/loyalty/redeem/route.ts`

**POST `/api/loyalty/redeem`**

**Request:**
```json
{
  "customerId": "CUST-123",
  "customerPhone": "+1234567890",
  "amountCents": 500,
  "metadata": {
    "discountCode": "LOYALTY10",
    "sessionId": "session-789"
  }
}
```

**Response:**
```json
{
  "success": true,
  "transactionId": "txn-790",
  "accountId": "acc-123",
  "balanceBeforeCents": 6000,
  "balanceAfterCents": 5500,
  "amountCents": 500
}
```

**Logic:**
1. Find `LoyaltyAccount` for customer
2. Validate sufficient balance
3. Start transaction (ACID)
4. Create `LoyaltyTransaction` with type 'REDEEM'
5. Update `LoyaltyAccount.balanceCents`
6. Update `LoyaltyAccount.totalRedeemedCents`
7. Update `LoyaltyWallet` (if exists)
8. Commit transaction
9. Return new balance

**Error Handling:**
- Account not found → 404
- Insufficient balance → 400
- Invalid amount → 400
- Database transaction failure → 500
- Optimistic locking conflict → 409 (retry)

---

### O1.4: Get Balance Endpoint
**File:** `apps/app/app/api/loyalty/wallet/[id]/balance/route.ts`

**GET `/api/loyalty/wallet/:id/balance`**

**Query Params:**
- `customerId` (optional)
- `customerPhone` (optional)

**Response:**
```json
{
  "accountId": "acc-123",
  "customerId": "CUST-123",
  "balanceCents": 5500,
  "totalEarnedCents": 10000,
  "totalRedeemedCents": 4500,
  "lastTransactionAt": "2025-11-03T19:00:00Z"
}
```

**Logic:**
1. Find `LoyaltyAccount` by customer ID or phone
2. Return balance and summary stats
3. Cache-friendly (can use `LoyaltyWallet` view)

---

### O1.5: POS Integration Hook
**File:** `apps/app/jobs/settle.ts` (modify)

**Integration Point:**
After successful reconciliation match:
```typescript
// In reconcilePosSettlements function
if (matchedPair) {
  // ... existing reconciliation logic ...
  
  // Auto-issue loyalty credits (Jules integration)
  if (matchedPair.matchConfidence === 'high') {
    await issueLoyaltyCredits({
      customerId: matchedPair.customerId,
      amountCents: calculateLoyaltyAmount(matchedPair.amountCents),
      source: 'POS',
      sessionId: matchedPair.sessionId,
      posTicketId: matchedPair.posTicketId,
    });
  }
}
```

**Loyalty Calculation:**
- Issue 1% of transaction amount (or configurable)
- Example: $35.00 transaction → 35 cents loyalty credit
- Minimum: 1 cent per transaction

---

## 🎯 Performance Targets

- **Issue→Redeem Round-Trip:** < 60 seconds
- **API Response Time:** < 200ms (p95)
- **Database Queries:** < 10ms (p95)
- **Transaction Throughput:** > 100 TPS

---

## 🔒 ACID Compliance

**Requirements:**
- All transactions must be atomic (all-or-nothing)
- Consistent balance updates (no double-spending)
- Isolated concurrent transactions (optimistic locking)
- Durable (persisted to database)

**Implementation:**
- Use Prisma transactions (`prisma.$transaction`)
- Use optimistic locking (`version` field)
- Use database constraints (balance >= 0)
- Use idempotency keys (prevent duplicate issues)

---

## 🧪 Testing Checklist

- [ ] Issue credits successfully
- [ ] Redeem credits successfully
- [ ] Handle insufficient balance
- [ ] Handle concurrent transactions (optimistic locking)
- [ ] Handle database failures (rollback)
- [ ] Verify ACID compliance
- [ ] Verify POS integration hook
- [ ] Verify performance targets (<60s round-trip)

---

## 📚 Related Files

- `apps/app/jobs/settle.ts` - POS reconciliation (integration point)
- `apps/app/lib/config.ts` - Feature flags (POS_SYNC_READY)
- `apps/app/app/api/loyalty/issue/route.ts` - Issue endpoint
- `apps/app/app/api/loyalty/redeem/route.ts` - Redeem endpoint
- `apps/app/app/api/loyalty/wallet/[id]/balance/route.ts` - Balance endpoint

---

## 🚀 Quick Start

```bash
# Navigate to worktree
cd wt-ledger

# Create feature branch
git checkout -b feat/loyalty-ledger

# Start with schema
# Edit: apps/app/prisma/schema.prisma
# Add LoyaltyAccount, LoyaltyTransaction, LoyaltyWallet tables

# Run migration
cd apps/app
export DATABASE_URL="file:./prisma/dev.db"
npx prisma db push

# Create API endpoints
# Start with: apps/app/app/api/loyalty/issue/route.ts
```

---

**Status:** ✅ Ready to start - G1 unlocked!

**Next:** O1.1 - Create ledger schema

