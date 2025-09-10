# Stripe Webhook Setup for Vercel

This guide covers setting up Stripe webhooks for your HookahPlus app deployed on Vercel, with sandbox mode to reduce costly errors.

## 🚀 Quick Setup

### 1. Webhook URL
Your webhook URL will be:
```
https://your-domain.vercel.app/api/webhooks/stripe
```

### 2. Environment Variables (Vercel)
Set these in Vercel → Settings → Environment Variables:

```bash
# Stripe Configuration (SANDBOX MODE)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

### 3. Stripe Dashboard Setup
1. Go to Stripe Dashboard → Webhooks
2. Click "Add endpoint"
3. Enter your webhook URL: `https://your-domain.vercel.app/api/webhooks/stripe`
4. Select these events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `charge.dispute.created`
5. Copy the webhook secret and add it to Vercel environment variables

## 🔧 Webhook Implementation

The webhook handler is located at `app/api/webhooks/stripe/route.ts` and handles:

### Flow A — Deposit Reservation
- **Event**: `checkout.session.completed`
- **Action**: Confirms reservation, stores deposit credit
- **Metadata**: `hp_reservation_id`, `hp_venue_id`, `hp_table`, `hp_party_size`

### Flow B — Prepaid Package/Experience
- **Event**: `checkout.session.completed`
- **Action**: Sets package as prepaid, mints entitlements
- **Metadata**: `hp_reservation_id`, `hp_package`

### Flow C — Terminal (card_present)
- **Event**: `payment_intent.succeeded`
- **Action**: Finalizes check, generates receipt
- **Metadata**: `hp_reservation_id`, `hp_table`, `hp_items`

## 🧪 Local Testing

### 1. Start Vercel Dev Server
```bash
vercel dev
# Runs on http://localhost:3000
```

### 2. Forward Webhooks with Stripe CLI
```bash
# Install Stripe CLI if not already installed
# https://stripe.com/docs/stripe-cli

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# This will output a webhook secret like: whsec_1234...
# Add this to your .env.local file
```

### 3. Test Webhook Events
```bash
# Test deposit reservation
stripe trigger checkout.session.completed

# Test terminal payment
stripe trigger payment_intent.succeeded

# Test dispute
stripe trigger charge.dispute.created
```

### 4. Environment Variables for Local Testing
Create `.env.local`:
```bash
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_from_stripe_cli_output
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 📋 Curl Examples

### Deposit Reservation
```bash
curl https://api.stripe.com/v1/checkout/sessions \
  -u $STRIPE_SECRET_KEY: \
  -H "Idempotency-Key: hp_dep_r_2025_09_10_1830_07" \
  -d mode=payment \
  -d success_url="https://your-domain.vercel.app/confirm?r=r_2025_09_10_1830_07" \
  -d cancel_url="https://your-domain.vercel.app/cancel?r=r_2025_09_10_1830_07" \
  -d "line_items[0][price]"="PRICE_ID_DEPOSIT_10" \
  -d "line_items[0][quantity]"="4" \
  -d "metadata[hp_venue_id]"="v_001" \
  -d "metadata[hp_reservation_id]"="r_2025_09_10_1830_07" \
  -d "metadata[hp_table]"="T12" \
  -d "metadata[hp_party_size]"="4" \
  -d "metadata[hp_slot_start_iso]"="2025-09-10T18:30:00-04:00" \
  -d "metadata[hp_slot_end_iso]"="2025-09-10T20:00:00-04:00" \
  -d "metadata[hp_policy_version]"="dep_v1.2" \
  -d "metadata[hp_terms_url]"="https://hookahplus.net/policy/deposits"
```

### Bronze Package + Add-on
```bash
curl https://api.stripe.com/v1/checkout/sessions \
  -u $STRIPE_SECRET_KEY: \
  -H "Idempotency-Key: hp_pkg_r_2025_09_10_1830_07" \
  -d mode=payment \
  -d ui_mode=embedded \
  -d success_url="https://your-domain.vercel.app/confirm?r=r_2025_09_10_1830_07" \
  -d cancel_url="https://your-domain.vercel.app/cancel?r=r_2025_09_10_1830_07" \
  -d "line_items[0][price]"="PRICE_ID_BRONZE_200" \
  -d "line_items[0][quantity]"="1" \
  -d "line_items[1][price]"="PRICE_ID_EXTRA_HOOKAH_30" \
  -d "line_items[1][quantity]"="1" \
  -d "metadata[hp_reservation_id]"="r_2025_09_10_1830_07" \
  -d "metadata[hp_package]"="bronze_v1"
```

### Terminal Payment
```bash
curl https://api.stripe.com/v1/payment_intents \
  -u $STRIPE_SECRET_KEY: \
  -H "Idempotency-Key: hp_terminal_close_sess_ABC123" \
  -d amount=8450 \
  -d currency=usd \
  -d capture_method=automatic \
  -d "payment_method_types[]"=card_present \
  -d "metadata[hp_reservation_id]"="r_2025_09_10_1830_07" \
  -d "metadata[hp_table]"="T12" \
  -d "metadata[hp_items]"='[{"name":"Hookah Mint","qty":1,"unit":3000},{"name":"Coal Refresh","qty":2,"unit":500},{"name":"Water","qty":2,"unit":200}]'
```

## 🛡️ Security & Compliance

### Sandbox Mode Benefits
- **Reduced Errors**: Test keys prevent accidental live charges
- **Cost Control**: No real money transactions during development
- **Safe Testing**: Full webhook functionality without financial risk

### Production Checklist
- [ ] Switch to live keys (`sk_live_...`, `pk_live_...`)
- [ ] Update webhook secret to live endpoint
- [ ] Test with small amounts first
- [ ] Monitor webhook logs in Stripe Dashboard
- [ ] Set up proper error handling and retries

### Compliance Notes
- Operating Stripe-first for on-premise services
- Avoid online tobacco product sales without Stripe approval
- Keep deposit/experience language clear
- Log terms and attach evidence in disputes

## 🔍 Troubleshooting

### Common Issues

1. **Webhook signature verification failed**
   - Check that `STRIPE_WEBHOOK_SECRET` matches the one from Stripe Dashboard
   - Ensure webhook URL is correct

2. **Webhook not receiving events**
   - Verify webhook is enabled in Stripe Dashboard
   - Check Vercel function logs
   - Test with Stripe CLI locally first

3. **Environment variables not loading**
   - Redeploy after adding environment variables
   - Check variable names match exactly
   - Verify they're set for the correct environment (Production/Preview)

### Debug Commands
```bash
# Check webhook events in Stripe Dashboard
# View Vercel function logs
vercel logs

# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhooks/stripe --print-secret
```

## 📊 Monitoring

### Webhook Logs
- Stripe Dashboard → Webhooks → [Your endpoint] → Logs
- Vercel Dashboard → Functions → [Your function] → Logs

### Key Metrics
- Webhook delivery success rate
- Response time
- Error rate
- Event processing time

## 🚀 Deployment

1. **Deploy to Vercel**
   ```bash
   vercel --prod
   ```

2. **Update Stripe Webhook URL**
   - Go to Stripe Dashboard → Webhooks
   - Update endpoint URL to your production domain

3. **Test Production Webhook**
   ```bash
   stripe trigger checkout.session.completed
   ```

4. **Monitor**
   - Check Vercel function logs
   - Verify webhook events are being processed
   - Test with real (small) transactions

---

**Next Steps**: Implement the database operations in the webhook helper functions (`upsertHookahPlusPayment`, `closeHookahPlusCheck`, `flagReservationUnderReview`) based on your data model.
