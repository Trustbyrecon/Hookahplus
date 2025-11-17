# 🧪 Stripe Webhook Testing Guide

## Overview
This guide walks you through testing the Stripe webhook endpoint using the Pre-Order page with $1 test mode in Stripe's sandbox (test mode).

## Prerequisites

### 1. Stripe Test Mode Keys
Ensure you have Stripe test mode keys configured in `.env.local`:

```bash
# Test Mode Keys (for sandbox testing)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...  # Test mode webhook secret
```

### 2. Stripe Test Mode Webhook Setup

#### Step 1: Create Test Webhook in Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"**
3. **Endpoint URL:** `http://localhost:3002/api/webhooks/stripe` (for local testing)
   - OR: `https://app.hookahplus.net/api/webhooks/stripe` (for production testing)
4. **Description:** "Hookah+ Test Webhook"
5. **Events from:** Select **"Your account"** ✅
6. **API version:** `2025-05-28.basil` (or match your code)
7. **Select Events:**
   - ✅ `checkout.session.completed`
   - ✅ `payment_intent.succeeded`
   - ✅ `payment_intent.payment_failed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `customer.subscription.updated`

#### Step 2: Get Test Webhook Secret
1. After creating the webhook, click on it
2. Click **"Reveal"** next to "Signing secret"
3. Copy the `whsec_...` secret
4. **Add to `.env.local`:**
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_your_test_webhook_secret_here
   ```

#### Step 3: For Local Testing (Stripe CLI)
If testing locally, you can use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI if not already installed
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:3002/api/webhooks/stripe
```

This will give you a webhook secret that starts with `whsec_` - use this in your `.env.local`.

---

## Testing Steps

### Step 1: Start the App Server

```bash
cd apps/app
npm run dev
# Server should start on http://localhost:3002
```

### Step 2: Navigate to Pre-Order Page

1. Open browser: `http://localhost:3002/preorder/T-001`
2. You should see the Pre-Order interface with:
   - Session Pricing options (Flat Rate / Time-Based)
   - Flavor selection
   - **$1 Test Mode toggle** (yellow banner at top)

### Step 3: Enable $1 Test Mode

1. **Toggle ON** the "$1 Test Mode" switch (yellow banner)
   - This forces all payments to $1.00 regardless of order total
   - Perfect for testing without real charges

### Step 4: Configure Pre-Order

1. **Select Pricing Model:**
   - Choose "Flat Rate" or "Time-Based"
   - If Time-Based, select duration (30 min, 45 min, etc.)

2. **Select Flavors:**
   - Choose at least one flavor from the flavor wheel
   - Prices will be calculated automatically

3. **Optional: Add Add-ons:**
   - Extra Coals, Premium Coals, Flavor Boost, etc.

### Step 5: Create Checkout Session

1. Click **"Checkout"** button
2. You'll be redirected to Stripe Checkout (test mode)
3. **Use Stripe test card:**
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/34`)
   - CVC: Any 3 digits (e.g., `123`)
   - ZIP: Any 5 digits (e.g., `12345`)

### Step 6: Complete Payment

1. Enter test card details in Stripe Checkout
2. Click **"Pay"**
3. You'll be redirected back to success page

### Step 7: Verify Webhook Delivery

#### Option A: Stripe Dashboard
1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Click **"Events"** tab
4. Look for recent events:
   - `checkout.session.completed` ✅
   - `payment_intent.succeeded` ✅
5. Check event status:
   - **"Succeeded"** = Webhook delivered successfully ✅
   - **"Failed"** = Check error details ❌

#### Option B: Vercel/Server Logs
1. Check your server logs (terminal or Vercel Dashboard)
2. Look for:
   ```
   [Stripe Webhook] Verified event: evt_...
   [Stripe Webhook] Processing checkout.session.completed
   ```
3. Should NOT see:
   - `Webhook Error: Invalid signature`
   - `Webhook secret not configured`

#### Option C: Database Verification
1. Check that session was updated in database:
   ```sql
   SELECT id, "paymentStatus", "paymentIntent", state
   FROM "Session"
   WHERE "externalRef" LIKE 'preorder-%'
   ORDER BY "createdAt" DESC
   LIMIT 1;
   ```
2. Expected:
   - `paymentStatus` = `'succeeded'`
   - `paymentIntent` = `pi_test_...`
   - `state` = `'PAID_CONFIRMED'` or `'ACTIVE'`

---

## Troubleshooting

### Issue: "Webhook secret not configured"
**Solution:**
- Add `STRIPE_WEBHOOK_SECRET=whsec_...` to `.env.local`
- Restart the dev server
- Verify secret matches Stripe Dashboard

### Issue: "Invalid signature"
**Solution:**
- Ensure webhook secret matches Stripe Dashboard
- Check that you're using test mode secret for test mode keys
- Verify endpoint URL matches exactly (no trailing slashes)

### Issue: "Webhook not receiving events"
**Solution:**
- Check Stripe Dashboard → Webhooks → Events tab
- Verify events are selected in webhook configuration
- Check that webhook endpoint URL is accessible
- For local testing, use Stripe CLI: `stripe listen --forward-to localhost:3002/api/webhooks/stripe`

### Issue: "Database not updated after webhook"
**Solution:**
- Check server logs for webhook processing errors
- Verify `DATABASE_URL` is configured in `.env.local`
- Check that session exists in database before webhook fires
- Verify webhook handler is processing the event correctly

---

## Expected Webhook Flow

```
1. User clicks "Checkout" on Pre-Order page
   ↓
2. POST /api/checkout-session creates Stripe Checkout Session
   ↓
3. User redirected to Stripe Checkout (test mode)
   ↓
4. User enters test card and completes payment
   ↓
5. Stripe sends webhook to /api/webhooks/stripe
   ↓
6. Webhook handler verifies signature
   ↓
7. Webhook handler processes checkout.session.completed event
   ↓
8. Session updated in database:
   - paymentStatus = 'succeeded'
   - paymentIntent = pi_test_...
   - state = 'PAID_CONFIRMED'
   ↓
9. User redirected to success page
```

---

## Test Checklist

- [ ] Stripe test keys configured in `.env.local`
- [ ] Test webhook created in Stripe Dashboard
- [ ] Webhook secret added to `.env.local`
- [ ] App server running on `localhost:3002`
- [ ] Pre-Order page accessible
- [ ] $1 Test Mode toggle enabled
- [ ] Checkout session created successfully
- [ ] Payment completed with test card
- [ ] Webhook event received in Stripe Dashboard
- [ ] Webhook event status = "Succeeded"
- [ ] Server logs show webhook processing
- [ ] Database updated with payment info
- [ ] Session state updated correctly

---

## Production Testing

Once test mode is verified, repeat the same steps with:

1. **Live Mode Keys:**
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `STRIPE_WEBHOOK_SECRET=whsec_...` (live webhook secret)

2. **Production Webhook:**
   - Endpoint URL: `https://app.hookahplus.net/api/webhooks/stripe`
   - Created in: https://dashboard.stripe.com/webhooks (LIVE mode)

3. **Test Transaction:**
   - Use a real card with a small amount ($1.00)
   - Monitor webhook delivery in Stripe Dashboard
   - Verify database updates

---

**Last Updated:** 2025-01-16  
**Status:** Ready for Testing ✅

