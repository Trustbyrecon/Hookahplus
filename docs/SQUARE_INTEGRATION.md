# Square POS Integration

This document outlines the Square POS adapter integration for Hookah+, providing a clean, shippable path from sandbox to production.

## Overview

The Square adapter implements the `PosAdapter` interface, allowing Hookah+ to:
- Create orders in Square POS
- Update order items
- Close orders with external tender (Stripe payments)
- Maintain idempotency for order operations

## Setup Instructions

### 1. Square Developer Account Setup

1. **Create Square Developer Account**
   - Go to [Square Developer Dashboard](https://developer.squareup.com/)
   - Sign up for a developer account

2. **Create Sandbox App**
   - Navigate to Developer Dashboard → Apps
   - Click "New App"
   - Name: `Hookah+ Integration`
   - Environment: Start with **Sandbox**

3. **Get Credentials**
   - **Sandbox Access Token**: Copy from App → Credentials → Sandbox Access Token
   - **Location ID**: Go to Dashboard → Locations → Copy Location ID

4. **Production Setup** (when ready)
   - Switch to Production environment
   - Generate Production Access Token
   - Note Production Location ID

### 2. Environment Configuration

Copy `env.square.example` to `.env.local` and configure:

```bash
# Square Configuration
SQUARE_ENV=sandbox
SQUARE_ACCESS_TOKEN=EAAA_sandbox_your_actual_token_here
SQUARE_LOCATION_ID=your_actual_location_id_here

# Trust-Lock Security
TRUSTLOCK_SECRET=your_actual_trustlock_secret_here
```

### 3. Testing the Integration

Run the test script to verify everything works:

```bash
node scripts/test-square-integration.js
```

## Architecture

### Core Components

- **`/lib/pos/types.ts`** - Domain types and interfaces
- **`/lib/pos/square.ts`** - Square POS adapter implementation
- **`/scripts/test-square-integration.js`** - Integration test script

### Key Features

1. **Idempotent Order Creation**
   - Uses `hp_order_id` as reference for duplicate prevention
   - Returns existing order if found

2. **External Tender Support**
   - Links Stripe payments to Square orders
   - Maintains audit trail between systems

3. **Environment Switching**
   - Automatic sandbox/production URL switching
   - Environment-specific credentials

4. **Error Handling**
   - Comprehensive error messages
   - Graceful fallbacks for non-critical operations

## Usage Examples

### Basic Order Flow

```typescript
import { createSquareAdapter } from '../lib/pos/square';

const squareAdapter = createSquareAdapter();

// 1. Attach order
const result = await squareAdapter.attachOrder(hpOrder);
console.log(`Order ${result.created ? 'created' : 'found'}: ${result.pos_order_id}`);

// 2. Update items if needed
await squareAdapter.upsertItems(result.pos_order_id, updatedItems);

// 3. Close with external tender
await squareAdapter.closeOrder(result.pos_order_id, {
  provider: 'stripe',
  reference: 'pi_1234567890',
  amount: 2500,
  currency: 'USD'
});
```

### Integration with Existing Systems

```typescript
// In your order processing flow
async function processOrder(orderData: HpOrder) {
  try {
    // Create Square order
    const squareResult = await squareAdapter.attachOrder(orderData);
    
    // Process Stripe payment
    const paymentIntent = await stripe.paymentIntents.create({
      amount: orderData.totals.grand_total,
      currency: 'usd'
    });
    
    // Close Square order with Stripe reference
    await squareAdapter.closeOrder(squareResult.pos_order_id, {
      provider: 'stripe',
      reference: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: 'USD'
    });
    
    return { success: true, squareOrderId: squareResult.pos_order_id };
  } catch (error) {
    console.error('Order processing failed:', error);
    throw error;
  }
}
```

## API Reference

### SquareAdapter Methods

#### `attachOrder(hpOrder: HpOrder): Promise<AttachResult>`
Creates or finds existing order in Square POS.

**Returns:**
```typescript
{
  pos_order_id: string;  // Square order ID
  created: boolean;      // true if new, false if existing
}
```

#### `upsertItems(pos_order_id: string, items: HpItem[]): Promise<void>`
Updates order items in Square POS.

#### `closeOrder(pos_order_id: string, tender?: ExternalTender): Promise<void>`
Closes order, optionally with external tender reference.

#### `capabilities(): Promise<{ orderInjection: boolean; externalTender: boolean }>`
Returns adapter capabilities.

### Data Types

#### `HpOrder`
```typescript
{
  hp_order_id: string;          // Unique identifier
  venue_id: string;            // Venue identifier
  table?: string;              // Table number
  guest_count?: number;        // Number of guests
  items: HpItem[];            // Order items
  totals?: {                   // Order totals
    subtotal: number;
    grand_total: number;
  };
  payment?: {                  // Payment information
    mode: "external" | "pos";
    provider?: "stripe";
    payment_intent?: string;
    status?: "pending" | "succeeded" | "failed";
    amount?: number;
  };
  trust_lock: {                // Security signature
    sig: string;
  };
}
```

## Security Considerations

1. **Trust-Lock Signatures**
   - All orders require valid trust-lock signatures
   - Prevents unauthorized order injection

2. **Environment Isolation**
   - Sandbox and production credentials are separate
   - No risk of mixing test and live data

3. **Access Token Security**
   - Store tokens in environment variables
   - Never commit tokens to version control

## Troubleshooting

### Common Issues

1. **"SQUARE_LOCATION_ID environment variable is required"**
   - Verify `SQUARE_LOCATION_ID` is set in `.env.local`
   - Check that the location ID exists in your Square dashboard

2. **"Square API error: 401 Unauthorized"**
   - Verify `SQUARE_ACCESS_TOKEN` is correct
   - Ensure token hasn't expired
   - Check that token has required permissions

3. **"Failed to attach order"**
   - Verify Square app has Orders API access
   - Check that location ID is accessible with your token
   - Ensure sandbox/production environment matches

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=square:*
```

## Production Deployment

### Checklist

- [ ] Tested in sandbox environment
- [ ] Generated production access token
- [ ] Updated environment variables
- [ ] Verified production location ID
- [ ] Tested with real payment data
- [ ] Monitored error rates
- [ ] Set up alerting for failures

### Monitoring

- Track order creation success rates
- Monitor API response times
- Alert on authentication failures
- Log all order operations for audit

## Support

For Square-specific issues:
- [Square Developer Support](https://developer.squareup.com/support)
- [Square API Documentation](https://developer.squareup.com/reference)

For Hookah+ integration issues:
- Check logs for detailed error messages
- Verify environment configuration
- Run test script to isolate issues
