# Square POS Integration Testing Guide

## Quick Start

Run the comprehensive Square POS integration test:

```bash
# From apps/app directory
npm run test:square [venueId]

# Or directly with tsx
tsx scripts/test-square-integration.ts [venueId]
```

## Prerequisites

### 1. Square OAuth Connection (Recommended)

Connect Square via OAuth for the venue:
1. Navigate to `/square/connect` in your app
2. Complete the OAuth flow
3. Square credentials will be stored encrypted in the database

### 2. Environment Variables (Alternative)

If not using OAuth, set these environment variables:

```bash
# Square API credentials (legacy mode)
SQUARE_ACCESS_TOKEN=your_access_token
SQUARE_LOCATION_ID=your_location_id

# Required for trust lock signatures
# Generate with: openssl rand -hex 32
# Then add: TRUSTLOCK_SECRET=<your_generated_value>

# Optional: For reconciliation tests
# Add: STRIPE_SECRET_KEY=<your_stripe_key>
```

### 3. Database Setup

Ensure your database has:
- `SquareMerchant` table (for OAuth mode)
- `PosTicket` table (for reconciliation)
- Proper Prisma migrations applied

## Test Coverage

The test suite validates:

1. **OAuth Connection Check** - Verifies Square merchant connection
2. **Adapter Initialization** - Tests adapter setup and token loading
3. **Capabilities** - Checks adapter feature support
4. **Order Creation** - Creates a Square order with idempotency
5. **Idempotency Test** - Verifies duplicate order prevention
6. **Item Upsert** - Tests adding/updating order items
7. **Order Closing** - Tests closing order with external tender (Stripe)
8. **Reconciliation** - Tests matching POS tickets with Stripe charges

## Expected Output

```
🚀 Starting Square POS Integration Test Suite

📍 Venue ID: your_venue_id
🆔 Test Order ID: test_sq_1234567890

1️⃣ Testing OAuth Connection Check...
   ✅ Square merchant found in database
   📊 Merchant ID: MERCHANT_123
   📍 Locations: 1
   🔑 Token expires: 2025-02-01T00:00:00.000Z

2️⃣ Testing Adapter Initialization...
   ✅ Adapter initialized successfully

3️⃣ Testing Adapter Capabilities...
   📊 Capabilities: { orderInjection: true, externalTender: true }
   ✅ All required capabilities available

... (more tests)

📊 Test Results Summary
============================================================
✅ 1. OAuth Connection Check
✅ 2. Adapter Initialization
✅ 3. Adapter Capabilities
✅ 4. Order Creation
✅ 5. Idempotency Test
✅ 6. Item Upsert
✅ 7. Order Closing with External Tender
✅ 8. Reconciliation Methods

------------------------------------------------------------
Total: 8 | Passed: 8 | Failed: 0
Success Rate: 100.0%
------------------------------------------------------------

🎉 All tests passed! Square integration is working correctly.
```

## Troubleshooting

### Error: "Square not connected"

**Solution:** Connect Square via OAuth or set `SQUARE_ACCESS_TOKEN` and `SQUARE_LOCATION_ID` environment variables.

### Error: "TRUSTLOCK_SECRET environment variable is required"

**Solution:** Set the `TRUSTLOCK_SECRET` environment variable in your `.env.local` file.

### Error: "Failed to initialize Square adapter"

**Possible causes:**
- Invalid access token
- Token expired (OAuth mode should auto-refresh)
- Missing location ID
- Network connectivity issues

**Solution:** 
- Check Square credentials
- Verify network connection
- Check Square API status

### Error: "Order creation failed"

**Possible causes:**
- Invalid location ID
- Insufficient API permissions
- Square API rate limiting

**Solution:**
- Verify location ID in Square dashboard
- Check API permissions in Square Developer Console
- Wait and retry if rate limited

## Test Data

The test creates:
- A test order with ID: `test_sq_[timestamp]`
- Items: Hookah Session ($25.00) + Flavor Add-on ($2.00)
- External tender reference: `pi_test_[timestamp]`

**Note:** Test orders can be safely deleted from Square dashboard after testing.

## Next Steps After Testing

1. ✅ Verify orders appear in Square dashboard
2. ✅ Test webhook handling with real Square events
3. ✅ Validate reconciliation accuracy with real payments
4. ✅ Monitor error rates in production
5. ✅ Set up alerting for integration failures

## Production Checklist

Before going live:
- [ ] Test with Square sandbox account
- [ ] Verify OAuth flow works end-to-end
- [ ] Test token refresh mechanism
- [ ] Validate webhook signature verification
- [ ] Test reconciliation with real Stripe charges
- [ ] Monitor API rate limits
- [ ] Set up error alerting
- [ ] Document any venue-specific configurations

