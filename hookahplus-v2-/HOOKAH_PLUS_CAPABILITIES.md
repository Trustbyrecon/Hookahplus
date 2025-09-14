# Hookah+ Capabilities (Agent-Ready View)

## 🚀 Quick Start

```bash
# 1. Seed Stripe catalog
node scripts/seed-stripe-catalog.js

# 2. Test practical capabilities
curl -X POST https://hookahplus.net/api/sessions/extend \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"test_123","tableId":"T-001","extensionMinutes":20}'

# 3. Check floor health
curl https://hookahplus.net/api/analytics/floor-health
```

---

## 1. Practical (What Works Today)

### ⏱️ **Timed Hookah Sessions**
```typescript
// Start a session
POST /api/sessions
{
  "tableId": "T-001",
  "flavor": "Double Apple",
  "duration": 30,
  "amount": 3000
}

// Extend session
POST /api/sessions/extend
{
  "sessionId": "session_123",
  "tableId": "T-001", 
  "extensionMinutes": 20
}
```

### 🍃 **Flavor Add-Ons & Metadata**
```typescript
// Add flavor to existing session
POST /api/sessions/[id]/add-flavor
{
  "flavor": "Mint",
  "amount": 1500
}
```

### 🔄 **Refill Requests**
```typescript
// Customer requests refill
POST /api/refill/request
{
  "sessionId": "session_123",
  "tableId": "T-001",
  "notes": "Need more coals"
}

// Staff updates refill status
PATCH /api/refill/request
{
  "refillId": "refill_456",
  "status": "completed",
  "assignedTo": "staff_member_1"
}
```

### 📅 **Basic Reservations**
```typescript
// Create table reservation
POST /api/reservations/create
{
  "tableId": "T-001",
  "customerName": "John Doe",
  "customerPhone": "+1234567890",
  "reservationTime": "2024-01-15T19:00:00Z",
  "partySize": 4
}
```

---

## 2. Near-Term Production (Hardening with Trust)

### 🔐 **Role-Based Controls**
```typescript
// FOH Staff permissions
const fohPermissions = {
  canViewSessions: true,
  canUpdateStatus: ['delivered', 'active'],
  canProcessRefills: true,
  canViewReservations: true
};

// BOH Staff permissions  
const bohPermissions = {
  canViewPrepQueue: true,
  canUpdatePrepStatus: true,
  canProcessRefills: true,
  canViewInventory: true
};

// Manager permissions
const managerPermissions = {
  canViewAnalytics: true,
  canOverridePricing: true,
  canProcessRefunds: true,
  canManageStaff: true
};
```

### 🔄 **Idempotency & Retry Safety**
```typescript
// All actions include idempotency keys
POST /api/sessions/extend
{
  "sessionId": "session_123",
  "extensionMinutes": 20,
  "idempotencyKey": "ext_123_20240115_190000"
}
```

### 📊 **Audit Log (GhostLog)**
```typescript
// Every action is logged
interface AuditLogEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: number;
  sessionId?: string;
  tableId?: string;
  amount?: number;
  outcome: 'success' | 'failure';
  metadata: Record<string, any>;
}
```

### 📈 **Observability**
```typescript
// SLA tracking
interface SLAMetrics {
  refillResponseTime: number; // minutes
  extensionAcceptanceRate: number; // percentage
  sessionTurnoverSpeed: number; // minutes
  customerSatisfactionScore: number; // 1-100
}
```

---

## 3. High-Value Use Cases (The Moat)

### ⚡ **Dynamic Session Extensions**
```typescript
// Auto-offer extension at T-5 minutes
const autoExtensionOffer = {
  triggerTime: 'T-5', // 5 minutes before session ends
  offerAmount: 1000, // $10 for 20 minutes
  maxOffers: 3,
  acceptanceWindow: 300000 // 5 minutes to accept
};
```

### 📊 **Refill SLA Analytics**
```typescript
// Get refill performance metrics
GET /api/analytics/refill-sla
{
  "timeRange": "7d",
  "staffMember": "staff_123",
  "metrics": {
    "averageResponseTime": 4.2,
    "slaCompliance": 95.5,
    "totalRequests": 127,
    "overdueRequests": 6
  }
}
```

### 🎯 **Upsell Bundles**
```typescript
// Pre-configured bundles
const bundles = {
  "premium_session": {
    price: 8000, // $80
    includes: ["60min_session", "2x_flavor", "premium_coals"],
    usageMetrics: {
      totalSold: 45,
      conversionRate: 23.5,
      averageUpsell: 12.50
    }
  }
};
```

### 💓 **Floor Health Pulse**
```typescript
// Real-time floor status
GET /api/analytics/floor-health
{
  "activeSessions": 8,
  "averageRemainingTime": 23,
  "refillRequestsPending": 2,
  "revenueRunRate": 45.50,
  "tableUtilization": 80.0,
  "staffEfficiency": 92.5,
  "customerSatisfaction": 88.3,
  "alerts": ["High refill queue: 3 pending requests"]
}
```

### 🛡️ **Trust-Based Recovery**
```typescript
// Auto-trigger recovery actions
const recoveryActions = {
  "refill_late": {
    threshold: 7, // minutes
    action: "auto_discount",
    amount: 500, // $5 off
    reason: "Refill delay compensation"
  },
  "session_ended_prematurely": {
    threshold: 15, // minutes early
    action: "loyalty_boost",
    points: 100,
    reason: "Session cut short compensation"
  }
};
```

---

## 📋 **Example Scenarios**

### Customer Side
```typescript
// "I want to extend 20 minutes"
1. Customer scans QR code
2. App shows extension offer: +20 min for $10
3. Customer accepts → Stripe checkout
4. Timer updates instantly
5. Staff notified of extension
```

### Staff Side (BOH)
```typescript
// New refill request with SLA countdown
1. Refill request appears on dashboard
2. SLA countdown starts (5 minutes)
3. Staff accepts: "I'll handle T-003"
4. If >7 minutes: escalates to manager
5. Completion logged for analytics
```

### Owner Side
```typescript
// Weekly analytics report
{
  "period": "2024-01-08 to 2024-01-14",
  "metrics": {
    "avgRefillTime": 4.2,
    "tableTurnoverImprovement": 12,
    "extensionRevenue": 320.00,
    "customerSatisfaction": 88.3,
    "staffEfficiency": 92.5
  },
  "insights": [
    "Fridays running 2× slower on refills",
    "Table T-005 has highest extension rate",
    "Staff member 'Sarah' has 98% SLA compliance"
  ]
}
```

---

## 🔧 **Implementation Status**

| Capability | Status | API Endpoint | Notes |
|------------|--------|--------------|-------|
| Timed Sessions | ✅ Ready | `/api/sessions` | Basic session management |
| Flavor Add-ons | ✅ Ready | `/api/sessions/[id]/add-flavor` | Stripe metadata integration |
| Refill Requests | ✅ Ready | `/api/refill/request` | SLA tracking included |
| Reservations | ✅ Ready | `/api/reservations/create` | $10 hold with auth-only |
| Session Extensions | ✅ Ready | `/api/sessions/extend` | Dynamic pricing |
| Floor Health | ✅ Ready | `/api/analytics/floor-health` | Real-time metrics |
| Role Controls | 🚧 In Progress | `/api/auth/roles` | Permission system |
| Audit Logging | 🚧 In Progress | `/api/audit` | GhostLog implementation |
| Recovery Actions | 📋 Planned | `/api/recovery` | Auto-compensation |

---

## 💡 **Why This Framing Matters**

By treating these as **Hookah+ core capabilities** instead of abstract commands:

- **Lounge owners** see **direct business outcomes** (profitability, turnover, loyalty)
- **Staff experience** is frictionless with clear workflows
- **Customers** feel trust through transparency and fairness
- **System** becomes a competitive moat, not just digital POS

**Ready to implement?** Start with the practical capabilities and build toward the high-value moat features! 🚀
