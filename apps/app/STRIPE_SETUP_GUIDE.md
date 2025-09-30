# í´§ Stripe Integration Setup Guide

## Current Status
Your `.env.local` has placeholder Stripe keys. To enable real Stripe integration for test sessions, you need to replace these with your actual Stripe test keys.

## Step 1: Get Your Stripe Test Keys

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/test/apikeys
2. **Copy the following keys**:
   - **Secret Key**: `sk_test_...` (starts with sk_test_)
   - **Publishable Key**: `pk_test_...` (starts with pk_test_)

## Step 2: Update Environment Variables

Replace the placeholder values in `.env.local`:

```bash
# Replace these placeholder values:
STRIPE_SECRET_KEY=sk_test_placeholder
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_placeholder

# With your actual Stripe test keys:
STRIPE_SECRET_KEY=sk_test_51ABC123...your_actual_secret_key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51ABC123...your_actual_public_key
```

## Step 3: Test the Integration

1. **Start your development server**:
   ```bash
   npm run dev
   ```

2. **Navigate to a page with test session button** (e.g., Fire Session Dashboard)

3. **Click "Start $1 Test Session"**

4. **Check Stripe Dashboard**:
   - Go to https://dashboard.stripe.com/test/payments
   - Look for new $1.00 transactions
   - Transaction description: "Test Hookah Session - $1"

## Step 4: Verify in Stripe Dashboard

After running a test session, you should see:
- **Amount**: $1.00 USD
- **Status**: Succeeded
- **Description**: "Test Hookah Session - $1"
- **Metadata**: Contains tableId, customer info, etc.

## Current API Behavior

The updated API will:
1. **Try to create real Stripe payment intent** if keys are configured
2. **Fall back to simulation** if keys are not configured
3. **Log all actions** for debugging
4. **Return proper error handling**

## Troubleshooting

If you see errors:
1. **Check console logs** for detailed error messages
2. **Verify Stripe keys** are correct and active
3. **Ensure you're in test mode** (not live mode)
4. **Check Stripe dashboard** for any account issues

## Security Note

- These are **TEST keys** - safe to use in development
- Never commit real keys to version control
- Use environment variables for all sensitive data
