# Campaign Manager Backend Integration - Complete

**Date:** January 2025  
**Status:** ✅ Backend Complete, Ready for Migration

---

## ✅ Completed Components

### 1. Database Schema
- **Campaign Model** - Full campaign management with:
  - Multiple campaign types (percentage_off, buy_x_get_y, first_x_customers, time_limited, loyalty, email, sms, social)
  - Status tracking (draft, active, paused, completed, scheduled)
  - Budget and spending tracking
  - Performance metrics (reach, engagement, conversions, ROI)
  - Campaign-specific configuration (JSON field)
  - QR code prefix for tracking
  - Tenant and lounge association

- **CampaignUsage Model** - Tracks campaign applications:
  - Links campaigns to sessions
  - Records discount amounts
  - Tracks customer references
  - Stores metadata for analytics

**File:** `apps/app/prisma/schema.prisma`

### 2. API Endpoints

#### GET `/api/campaigns`
- List all campaigns with filtering (status, type, loungeId)
- Returns formatted campaign data with usage counts

#### POST `/api/campaigns`
- Create new campaigns
- Validates campaign type and required fields
- Stores campaign configuration based on type

#### GET `/api/campaigns/[id]`
- Get specific campaign details
- Includes recent usage history

#### PUT `/api/campaigns/[id]`
- Update campaign (name, status, dates, budget, config, etc.)
- Supports partial updates

#### DELETE `/api/campaigns/[id]`
- Delete campaign (cascades to usages)

#### POST `/api/campaigns/[id]/apply`
- Apply campaign to a session/checkout
- Calculates discount based on campaign type
- Records usage and updates metrics
- Returns discount amount and final price

**Files:**
- `apps/app/app/api/campaigns/route.ts`
- `apps/app/app/api/campaigns/[id]/route.ts`
- `apps/app/app/api/campaigns/[id]/apply/route.ts`

### 3. Frontend Integration
- **Campaigns Page** - Fully connected to backend:
  - Loads campaigns from API on mount
  - Creates campaigns via API
  - Updates campaign status via API
  - Loading and error states
  - Real-time data refresh

**File:** `apps/app/app/campaigns/page.tsx`

---

## 🔄 Next Steps (Pending)

### 1. Database Migration
Run Prisma migration to create Campaign tables:
```bash
cd apps/app
npx prisma migrate dev --name add_campaigns
npx prisma generate
```

### 2. Checkout Integration
Integrate campaigns into checkout flow:
- Update `apps/guest/app/api/guest/price/quote/route.ts` to:
  - Accept `campaignId` parameter
  - Check for active campaigns matching session criteria
  - Apply campaign discounts via `/api/campaigns/[id]/apply`
  - Return campaign discount in price breakdown

### 3. QR Code Integration
- Update QR code generation to include `campaignRef`
- Link QR codes to campaigns for tracking
- Update session creation to capture campaign source

### 4. Analytics Dashboard
- Add campaign performance metrics to analytics page
- Show campaign ROI and conversion rates
- Display campaign usage trends

### 5. Campaign Auto-Activation
- Auto-activate scheduled campaigns on start date
- Auto-pause/complete campaigns on end date
- Background job for campaign status management

---

## 📊 Campaign Types Supported

1. **percentage_off** - Percentage discount with optional minimum spend
2. **buy_x_get_y** - Buy X items, get Y free (needs item-level tracking)
3. **first_x_customers** - Discount for first X customers
4. **time_limited** - Time-based discount campaigns
5. **loyalty** - Loyalty program campaigns (for future integration)
6. **email** - Email marketing campaigns (tracking only)
7. **sms** - SMS campaigns (tracking only)
8. **social** - Social media campaigns (tracking only)

---

## 🎯 Usage Example

### Creating a Campaign
```typescript
POST /api/campaigns
{
  "name": "Summer Special",
  "type": "percentage_off",
  "description": "20% off all sessions",
  "startDate": "2025-06-01T00:00:00Z",
  "endDate": "2025-08-31T23:59:59Z",
  "budget": 5000,
  "loungeId": "HOPE_GLOBAL_FORUM",
  "campaignConfig": {
    "percentageOff": 20,
    "minimumSpend": 25
  }
}
```

### Applying a Campaign
```typescript
POST /api/campaigns/{campaignId}/apply
{
  "sessionId": "session_123",
  "customerRef": "customer_456",
  "subtotalCents": 5000
}

Response:
{
  "success": true,
  "discountCents": 1000,
  "discountAmount": 10.00,
  "finalAmount": 40.00
}
```

---

## 🔗 Integration Points

1. **Checkout Flow** - Apply campaigns during price calculation
2. **QR Codes** - Track campaign source via `campaignRef`
3. **Analytics** - Report on campaign performance
4. **Loyalty** - Link campaigns to loyalty program
5. **Post-Checkout** - Show active campaigns in engagement hub

---

## 📝 Notes

- Campaign discounts are calculated server-side for security
- Campaign usage is tracked for analytics and ROI calculation
- Campaign status validation ensures only active campaigns can be applied
- Multi-tenant support via `tenantId` association
- Campaign configuration is flexible JSON for type-specific rules

---

**Ready for:** Database migration and checkout integration! 🚀

