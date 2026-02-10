# 🔄 Restart Server for Test Mode

## ⚠️ Critical: Server Must Be Restarted

The Stripe checkout is still using **LIVE mode** because the server was started **before** you updated `.env.local`.

### Why This Happens

The Stripe instance is created at **module load time** (when the server starts):

```typescript
// This runs ONCE when the module loads (server startup)
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {...})
  : null;
```

**Problem:** If the server was running when you updated `.env.local`, it's still using the old environment variable from when it started.

---

## ✅ Solution: Restart Dev Server

### Step 1: Stop Current Server

**Option A: If running in terminal:**
- Press `Ctrl + C` in the terminal where `npm run dev` is running

**Option B: If running in background:**
```bash
# Find and kill the process
pkill -f "next dev"  # Linux/Mac
# OR
taskkill /F /IM node.exe  # Windows (kills all Node processes)
```

### Step 2: Verify Environment Variable

```bash
cd apps/app
cat .env.local | grep STRIPE_SECRET_KEY
```

Should show:
```
STRIPE_SECRET_KEY=sk_test_***REDACTED***
```
(Use your key from Stripe Dashboard; never commit.)

### Step 3: Start Server Fresh

```bash
cd apps/app
npm run dev
```

### Step 4: Verify Test Mode in Logs

When you click "Checkout" now, check the server logs. You should see:

```
[Checkout API] Stripe Mode: {
  isTestMode: true,
  keyPrefix: 'sk_test_51',
  mode: 'TEST (Sandbox)',
  warning: '✅ Using TEST mode - safe for testing'
}
```

### Step 5: Test Checkout

1. Go to Pre-Order page
2. Enable "$1 Test Mode" toggle
3. Click "Checkout"
4. **Check the URL** - should show `cs_test_...` (NOT `cs_live_...`)
5. Use test card: `4242 4242 4242 4242`

---

## 🔍 How to Verify It's Working

### Check 1: Server Logs
When creating checkout, logs should show:
```
✅ Using TEST mode - safe for testing
```

### Check 2: Stripe Checkout URL
- ✅ Test mode: `checkout.stripe.com/c/pay/cs_test_...`
- ❌ Live mode: `checkout.stripe.com/c/pay/cs_live_...`

### Check 3: Test Card Works
- ✅ Test mode: Test card `4242 4242 4242 4242` is accepted
- ❌ Live mode: Test card is declined with "test card in live mode" error

---

## 🐛 If Still Not Working

### Check 1: Environment Variable Loading
```bash
cd apps/app
node -e "require('dotenv').config({ path: '.env.local' }); console.log('Key:', process.env.STRIPE_SECRET_KEY?.substring(0, 15));"
```

Should show: `Key: sk_test_51RZ0cp`

### Check 2: Next.js Environment Loading
Next.js might cache environment variables. Try:
1. Stop server
2. Delete `.next` folder: `rm -rf .next` (or `rmdir /s .next` on Windows)
3. Restart server: `npm run dev`

### Check 3: Multiple Environment Files
Check if there are other `.env` files that might override:
```bash
ls -la .env*  # Linux/Mac
dir .env*     # Windows
```

Only `.env.local` should have the test key.

---

## 📝 Quick Reference

**Before restart:**
- ❌ Checkout URL: `cs_live_...`
- ❌ Test cards declined
- ❌ Server logs show: `LIVE (Production)`

**After restart:**
- ✅ Checkout URL: `cs_test_...`
- ✅ Test cards accepted
- ✅ Server logs show: `TEST (Sandbox)`

---

**Last Updated:** 2025-01-16  
**Status:** Action Required - Restart Server ⚠️

