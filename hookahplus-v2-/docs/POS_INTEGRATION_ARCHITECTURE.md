# POS Integration Architecture

This document outlines the comprehensive POS adapter system for Hookah+, providing a clean, scalable path from MVP to production with support for multiple POS providers.

## 🏗️ Architecture Overview

The system implements a **Pattern B (fast path)** approach for MVP with **Pattern A (upgrade path)** capabilities for future enhancement:

- **Pattern B**: External Tender Reconciliation - Fast MVP implementation
- **Pattern A**: True Ticket/Item Injection - Full integration when supported

## 🔌 Supported POS Providers

### 1. **Square** (Phase 1 - MVP Target)
- **Status**: ✅ Production Ready
- **Auth**: OAuth 2 (merchant access token) + Sandbox support
- **API**: Orders API, Payments API
- **Features**: Order injection, external tender, idempotency

### 2. **Toast** (Phase 2 - Partner API)
- **Status**: 🚧 Implementation Ready
- **Auth**: Partner APIs (requires onboarding/certification)
- **API**: Orders, Checks, Payments
- **Features**: Check-based workflow, external payment support

### 3. **Clover** (Phase 3 - OAuth Integration)
- **Status**: 🚧 Implementation Ready
- **Auth**: OAuth 2 (merchant/employee token)
- **API**: Orders API, Payments, Inventory
- **Features**: Android-based devices, custom line items

## 📁 File Structure

```
/lib/pos/
├── types.ts          # Domain types and interfaces
├── factory.ts        # Adapter factory (choose POS per venue)
├── square.ts         # Square POS adapter (Phase 1)
├── toast.ts          # Toast POS adapter (Phase 2)
└── clover.ts         # Clover POS adapter (Phase 3)

/app/api/pos/
├── attach/route.ts   # Create/attach orders
├── upsert/route.ts   # Update order items
└── close/route.ts    # Close/settle orders

/lib/
└── trustlock.ts      # Security signature helpers

/scripts/
└── test-pos.ts       # Local test harness
```

## 🚀 Quick Start

### 1. **Environment Setup**
```bash
# Copy environment template
cp env.square.example .env.local

# Configure your POS credentials
SQUARE_ACCESS_TOKEN=your_token_here
SQUARE_LOCATION_ID=your_location_here
TRUSTLOCK_SECRET=your_secret_here
```

### 2. **Test Integration**
```bash
# Test Square adapter
npm run test:pos square venue_demo

# Test Toast adapter
npm run test:pos toast venue_toast

# Test Clover adapter
npm run test:pos clover venue_clover
```

### 3. **API Usage**
```typescript
// Attach order to POS
const response = await fetch('/api/pos/attach', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'square',
    venue_id: 'venue_001',
    hp_order: {
      hp_order_id: 'hp_ord_123',
      venue_id: 'venue_001',
      table: 'A1',
      items: [...],
      trust_lock: { sig: '...' }
    }
  })
});

// Upsert items
await fetch('/api/pos/upsert', {
  method: 'POST',
  body: JSON.stringify({
    provider: 'square',
    venue_id: 'venue_001',
    pos_order_id: 'pos_123',
    items: [...]
  })
});

// Close order with external tender
await fetch('/api/pos/close', {
  method: 'POST',
  body: JSON.stringify({
    provider: 'square',
    venue_id: 'venue_001',
    pos_order_id: 'pos_123',
    tender: {
      provider: 'stripe',
      reference: 'pi_1234567890',
      amount: 2500,
      currency: 'USD'
    }
  })
});
```

## 🔐 Security Features

### **Trust-Lock System**
- HMAC-SHA256 signatures for all orders
- Prevents unauthorized order injection
- Idempotency key protection

### **Environment Isolation**
- Separate sandbox/production credentials
- No risk of mixing test and live data
- Venue-level access control

## 📊 Data Flow

### **Order Lifecycle**
```
1. Hookah+ Order Created
   ↓
2. Trust-Lock Signature Generated
   ↓
3. POS Adapter Selected (Square/Toast/Clover)
   ↓
4. Order Attached to POS Ticket
   ↓
5. Items Upserted (if needed)
   ↓
6. Stripe Payment Processed
   ↓
7. Order Closed with External Tender Reference
   ↓
8. Audit Trail Complete
```

### **Idempotency**
- Uses `hp_order_id` as unique identifier
- Prevents duplicate orders across retries
- Maintains consistency in distributed systems

## 🎯 Implementation Phases

### **Phase 1: Square MVP** ✅
- [x] Basic order creation
- [x] Item management
- [x] External tender support
- [x] Sandbox testing
- [x] Production deployment

### **Phase 2: Toast Integration** 🚧
- [ ] Partner API onboarding
- [ ] Check-based workflow
- [ ] Batch item operations
- [ ] External payment support

### **Phase 3: Clover Integration** 🚧
- [ ] OAuth 2.0 setup
- [ ] Custom line items
- [ ] Android device support
- [ ] Inventory integration

## 🔧 Configuration

### **Per-Venue Settings**
```typescript
// Each venue can use different POS providers
const venueConfig = {
  'venue_001': { provider: 'square', config: { /* Square specific */ } },
  'venue_002': { provider: 'toast', config: { /* Toast specific */ } },
  'venue_003': { provider: 'clover', config: { /* Clover specific */ } }
};
```

### **Environment Variables**
```bash
# Square (Phase 1)
SQUARE_ENV=sandbox|production
SQUARE_ACCESS_TOKEN=<token>
SQUARE_LOCATION_ID=<location>

# Toast (Phase 2)
TOAST_BASE_URL=<api_url>
TOAST_API_KEY=<partner_key>

# Clover (Phase 3)
CLOVER_BASE_URL=<api_url>
CLOVER_MERCHANT_ID=<merchant>
CLOVER_ACCESS_TOKEN=<oauth_token>

# Security
TRUSTLOCK_SECRET=<secret>
```

## 🧪 Testing

### **Local Testing**
```bash
# Test without POS credentials
npm run test:pos square venue_demo

# Test specific provider
npm run test:pos toast venue_toast

# Test with custom venue
npm run test:pos clover custom_venue
```

### **Integration Testing**
```bash
# Test Square with real credentials
SQUARE_ACCESS_TOKEN=real_token npm run test:pos square venue_real

# Test Toast with partner API
TOAST_API_KEY=real_key npm run test:pos toast venue_real
```

## 📈 Monitoring & Observability

### **Key Metrics**
- Order creation success rates
- API response times
- Error rates by provider
- External tender reconciliation

### **Logging**
```typescript
// Comprehensive error logging
console.error("POS operation failed:", {
  provider: 'square',
  venue_id: 'venue_001',
  operation: 'attachOrder',
  error: error.message,
  timestamp: new Date().toISOString()
});
```

## 🚨 Error Handling

### **Common Scenarios**
1. **Authentication Failures**: Invalid/expired tokens
2. **Network Issues**: API timeouts, connectivity problems
3. **Data Validation**: Invalid order data, missing fields
4. **POS Limitations**: Unsupported operations, API changes

### **Fallback Strategies**
- Retry with exponential backoff
- Graceful degradation for non-critical operations
- Detailed error reporting for debugging
- Circuit breaker pattern for failing POS systems

## 🔄 Future Enhancements

### **Webhook Support**
- Real-time order updates
- Staff-side modifications
- Payment reconciliation
- Inventory synchronization

### **Advanced Features**
- Multi-location support
- Tax table mapping
- Discount management
- Customer loyalty integration

### **Analytics & Reporting**
- POS performance metrics
- Order flow analysis
- Revenue attribution
- Operational insights

## 📚 API Reference

### **Core Interfaces**
```typescript
interface PosAdapter {
  attachOrder(hpOrder: HpOrder): Promise<AttachResult>;
  upsertItems(pos_order_id: string, items: HpItem[]): Promise<void>;
  closeOrder(pos_order_id: string, tender?: ExternalTender): Promise<void>;
  capabilities(): Promise<{ orderInjection: boolean; externalTender: boolean }>;
}
```

### **Data Types**
```typescript
type HpOrder = {
  hp_order_id: string;          // Idempotency key
  venue_id: string;             // Venue identifier
  table?: string;               // Table number
  items: HpItem[];             // Order items
  service_charge?: Money;       // Service fees
  discounts?: Discount[];       // Applied discounts
  taxes?: Tax[];               // Tax breakdown
  totals?: OrderTotals;        // Order totals
  trust_lock: TrustLock;       // Security signature
};
```

## 🆘 Support & Troubleshooting

### **Getting Help**
- Check logs for detailed error messages
- Verify environment configuration
- Run test scripts to isolate issues
- Review POS API documentation

### **Common Issues**
1. **"Invalid trust signature"**: Check TRUSTLOCK_SECRET
2. **"POS API error"**: Verify credentials and permissions
3. **"Order not found"**: Check idempotency and order state
4. **"Network timeout"**: Verify API endpoints and connectivity

## 🎉 Success Metrics

### **MVP Goals**
- [ ] Square integration working in production
- [ ] External tender reconciliation functional
- [ ] Order audit trail complete
- [ ] Error rate < 1%

### **Phase 2 Goals**
- [ ] Toast integration deployed
- [ ] Multi-POS venue support
- [ ] Real-time order updates
- [ ] Performance monitoring active

### **Phase 3 Goals**
- [ ] Clover integration complete
- [ ] Full POS ecosystem coverage
- [ ] Advanced analytics dashboard
- [ ] Automated reconciliation

This architecture provides a solid foundation for scalable POS integration while maintaining the flexibility to adapt to different venue requirements and POS provider capabilities.
