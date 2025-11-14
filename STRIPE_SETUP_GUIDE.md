# Stripe Setup Guide

**Status:** Required for payment processing  
**Last Updated:** Current

---

## Quick Setup

### 1. Get Stripe Test Key

1. Go to: https://dashboard.stripe.com/apikeys
2. Click "Create test key" (or use existing test key)
3. Copy the **Secret key** (starts with `sk_test_...`)

### 2. Configure Environment Variables

#### Guest Build (`apps/guest/.env.local`):
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_APP_URL=http://localhost:3002
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

#### App Build (`apps/app/.env.local`):
```bash
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
DATABASE_URL=your_database_url
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

### 3. Restart Dev Servers

After adding the environment variables, restart both servers:

```bash
# Terminal 1: Guest build
cd apps/guest
npm run dev

# Terminal 2: App build
cd apps/app
npm run dev
```

---

## Verification

### Test Guest Build Payment:
1. Go to `http://localhost:3001`
2. Add items to cart
3. Click "🔥 Fire Session"
4. Should redirect to Stripe checkout (not show error)

### Test App Build Payment:
1. Go to `http://localhost:3002/fire-session-dashboard`
2. Click "New Session"
3. Fill form and submit
4. Should open Stripe checkout (not show error)

---

## Error Messages

If you see these errors, Stripe is not configured:

### Guest Build:
- `⚠️ Stripe Payment Not Configured`
- `STRIPE_SECRET_KEY environment variable is missing`

### App Build:
- `⚠️ Session created, but payment checkout unavailable`
- `Stripe test key not configured`

**Solution:** Follow steps 1-3 above.

---

## Important Notes

1. **Test Keys Only:** Use `sk_test_...` keys for development
2. **Never Commit Keys:** `.env.local` files are gitignored
3. **Separate Keys:** Guest and App builds can use the same test key
4. **Webhook Setup:** For production, configure Stripe webhooks at:
   - `https://your-domain.com/api/webhooks/stripe`

---

## Troubleshooting

### Error: "Stripe not configured"
- ✅ Check `.env.local` file exists in correct directory
- ✅ Check key starts with `sk_test_`
- ✅ Restart dev server after adding key
- ✅ Check console for exact error message

### Error: "Failed to create checkout session"
- ✅ Verify Stripe key is valid (not expired)
- ✅ Check network connection
- ✅ Verify Stripe account is active

### Payment succeeds but session not updating
- ✅ Check webhook endpoint is configured in Stripe dashboard
- ✅ Verify `NEXT_PUBLIC_APP_URL` is correct
- ✅ Check app build server logs for webhook errors

---

## Production Setup

For production deployment:

1. **Get Live Keys:** Switch to live mode in Stripe dashboard
2. **Set Environment Variables:** Add to Vercel/your hosting platform
3. **Configure Webhooks:** Point to production webhook URL
4. **Test Thoroughly:** Use Stripe test mode first

---

## Support

If issues persist:
1. Check browser console for detailed errors
2. Check server logs for API errors
3. Verify Stripe dashboard shows test transactions
4. Ensure webhook endpoint is accessible

**Status:** ✅ Setup guide complete

