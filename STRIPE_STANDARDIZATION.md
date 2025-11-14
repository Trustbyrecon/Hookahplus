# Stripe Checkout Standardization

**Date:** Current  
**Status:** ✅ Complete

---

## Overview

Standardized Stripe checkout functionality across all three entry points:
1. **Pre-order** (app build) - ✅ Already working
2. **FSD New Session** (app build) - ✅ Now standardized
3. **Guest Build Fire Session** - ✅ Now standardized

All three now use the **same pattern** for consistency and reliability.

---

## Standard Pattern

### 1. Create Session First
```typescript
// Create session via /api/sessions
const sessionResponse = await fetch('/api/sessions', {
  method: 'POST',
  body: JSON.stringify({
    tableId,
    customerName,
    flavor,
    amount: totalAmountCents, // Amount in cents
    // ... other fields
  })
});

const sessionData = await sessionResponse.json();
const sessionId = sessionData.session?.id || sessionData.id;
```

### 2. Create Stripe Checkout with Session ID
```typescript
// Calculate amounts (same as pre-order)
const totalAmountCents = Math.round(amount * 100); // Amount in cents
const totalAmountDollars = amount; // Amount in dollars

// Create checkout session
const checkoutResponse = await fetch('/api/checkout-session', {
  method: 'POST',
  body: JSON.stringify({
    sessionId: sessionId, // SECURITY: Only send opaque session ID
    flavors: flavorArray,
    tableId: tableId,
    amount: totalAmountCents, // Amount in cents
    total: totalAmountDollars, // Total in dollars for display
    loungeId: loungeId
  })
});
```

### 3. Redirect to Stripe Checkout
```typescript
const checkoutData = await checkoutResponse.json();

if (checkoutData.success && checkoutData.url) {
  // Redirect to Stripe checkout (same pattern as pre-order)
  window.location.href = checkoutData.url;
}
```

---

## Changes Made

### 1. FSD New Session (`CreateSessionModal.tsx`)
**Before:**
- Opened Stripe checkout in new window (`window.open()`)
- Used `data.sessionUrl` instead of `data.url`
- Amount handling was inconsistent

**After:**
- ✅ Redirects to Stripe checkout (`window.location.href`)
- ✅ Uses `data.url` (consistent with pre-order)
- ✅ Amount in cents (`totalAmountCents`) and dollars (`totalAmountDollars`)
- ✅ Same error handling pattern as pre-order

### 2. Guest Build Fire Session (`apps/guest/app/page.tsx`)
**Before:**
- Amount was being converted incorrectly (`subtotal / 100` sent as `amount`)
- Missing `flavors` and `tableId` in checkout request

**After:**
- ✅ Amount in cents (`totalAmountCents = subtotal`)
- ✅ Amount in dollars (`totalAmountDollars = subtotal / 100`)
- ✅ Includes `flavors` and `tableId` in checkout request
- ✅ Same error handling pattern as pre-order

---

## Security

All three flows maintain the **"Stripe Moat Protection"** strategy:
- ✅ Only opaque `sessionId` is sent to Stripe
- ✅ No sensitive business logic (flavorMix, tableId, loungeId) in Stripe metadata
- ✅ Webhook looks up session details from H+ database using `h_session` ID

---

## API Response Format

The `/api/checkout-session` endpoint returns:
```json
{
  "success": true,
  "url": "https://checkout.stripe.com/...",
  "sessionId": "cs_test_...",
  "expiresAt": 1234567890,
  "mode": "test"
}
```

All three flows now expect `data.url` (not `data.sessionUrl`).

---

## Error Handling

All three flows now have consistent error handling:
1. **Stripe Not Configured:**
   - Returns `503` status with `isConfigurationError: true`
   - Shows helpful setup instructions
   - Session is still created (can be manually confirmed)

2. **Checkout Creation Failed:**
   - Shows user-friendly error message
   - Session is still created
   - Provides session ID for manual confirmation

3. **Network Errors:**
   - Graceful fallback
   - Session creation is not blocked

---

## Testing Checklist

- [ ] Pre-order: Create session → Stripe checkout → Payment success
- [ ] FSD New Session: Create session → Stripe checkout → Payment success
- [ ] Guest Fire Session: Create session → Stripe checkout → Payment success
- [ ] All three: Verify session appears in FSD after payment
- [ ] All three: Verify session status is `PAID_CONFIRMED` after payment
- [ ] Error handling: Test with Stripe key missing
- [ ] Error handling: Test with invalid session ID

---

## Files Modified

1. ✅ `apps/app/components/CreateSessionModal.tsx` - Standardized to pre-order pattern
2. ✅ `apps/guest/app/page.tsx` - Standardized to pre-order pattern
3. ✅ `apps/app/components/PreorderEntry.tsx` - Already using correct pattern (reference)

---

## Status

✅ **All three entry points now use the same Stripe checkout pattern**

**Next:** Test all three flows end-to-end to verify consistency.

