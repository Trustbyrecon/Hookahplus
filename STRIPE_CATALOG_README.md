# Hookah+ Stripe Catalog System

This document describes the complete Stripe-ready catalog system for Hookahplus, implementing the ROI story with "Approach 1: Bundled" tiers.

## 🏗️ Architecture Overview

The system includes:
- **Consumer Products**: Hookah sessions ($30) + flavor add-ons ($1.50)
- **SaaS Tiers**: Starter ($99/mo), Pro ($249/mo), Trust+ ($499/mo), Enterprise+ (custom)
- **Stable Product IDs**: All products have predictable, stable IDs for consistent agent/Cursor usage
- **Idempotent Seeding**: Safe to run multiple times without creating duplicates

## 📦 Products & Pricing

### Consumer Products
- `hp_hookah_session` - $30 base session
- `hp_flavor_addon` - $1.50 per additional flavor

### SaaS Tiers
- `hp_tier_starter` - $99/month (1 lounge)
- `hp_tier_pro` - $249/month (up to 3 lounges) 
- `hp_tier_trust_plus` - $499/month (up to 7 lounges)
- `hp_tier_enterprise_plus` - Custom quote (8+ lounges)

## 🚀 Quick Start

### 1. Seed Your Stripe Catalog

```bash
# Ensure you have your Stripe test key in .env.local
npm run seed:stripe
```

This will:
- Create/update all products with stable IDs
- Generate prices for each tier
- Output `stripe_ids.out.json` with all price IDs

### 2. Configure Environment Variables

Copy the price IDs from `stripe_ids.out.json` to your `.env.local`:

```bash
# Stripe Price IDs
PRICE_SESSION_30=price_abc123...
PRICE_FLAVOR_150=price_def456...
PRICE_TIER_STARTER=price_starter...
PRICE_TIER_PRO=price_pro...
PRICE_TIER_TRUST_PLUS=price_trust...
```

### 3. Test the System

- **Consumer Checkout**: POST to `/api/checkout-session` with `addons` count
- **SaaS Signup**: Visit `/signup` to test tier selection
- **Subscription Management**: POST to `/api/subscribe` with tier and email

## 🔧 API Endpoints

### Consumer Checkout
```typescript
POST /api/checkout-session
{
  "tableId": "T-001",
  "flavor": "Blue Mist + Mint", 
  "addons": 2  // Optional: number of extra flavors
}
```

### SaaS Subscription
```typescript
POST /api/subscribe
{
  "tier": "pro",  // "starter", "pro", "trust_plus"
  "email": "owner@lounge.com"
}
```

## 📱 User Flows

### Consumer Session Flow
1. Customer selects table and flavor
2. Optional: Add extra flavors ($1.50 each)
3. Redirected to Stripe checkout
4. Success → `/success` page
5. Cancel → `/cancel` page

### SaaS Owner Flow
1. Visit `/signup` page
2. Select pricing tier
3. Enter email address
4. Redirected to Stripe subscription checkout
5. Success → `/welcome` page with tier-specific onboarding

## 🎯 Integration Points

### ROI Calculator Page
Use `PRICE_SESSION_30` and `PRICE_FLAVOR_150` for "Try a session" CTAs.

### Pricing Page
Use `PRICE_TIER_PRO` for "Start Trust Core ($249/mo)" CTAs.

### Demo/ROI Page
Integrate consumer product prices for session demonstrations.

## 🔒 Security Features

- **Rate Limiting**: 3 requests per IP per 30 seconds
- **Trust-Lock Signing**: Cryptographic order verification
- **Stable IDs**: No guesswork for agents or Cursor
- **Metadata Tracking**: Full audit trail for all transactions

## 📊 Analytics Integration

The system automatically tracks:
- **Plausible**: Signup attempts, successes, errors
- **Google Analytics**: Purchase events, subscription starts
- **Stripe Events**: All payment and subscription lifecycle events

## 🚨 Troubleshooting

### Common Issues

1. **"Invalid tier" error**: Check that tier name matches exactly (`starter`, `pro`, `trust_plus`)
2. **Price not found**: Ensure you've run `npm run seed:stripe` and copied price IDs to `.env.local`
3. **Checkout fails**: Verify `STRIPE_SECRET_KEY` is set and valid

### Debug Mode

Enable detailed logging by setting:
```bash
DEBUG=stripe:*
```

### Verify Products

Check your Stripe Dashboard (Test mode) → Products & Prices to verify all products were created correctly.

## 🔄 Updating Products

To modify the catalog:

1. Edit `products.json`
2. Run `npm run seed:stripe` again
3. The script will update existing products and create new ones
4. Copy new price IDs to your environment variables

## 🌐 Production Deployment

Before going live:

1. **Switch to Live Keys**: Update `STRIPE_SECRET_KEY` to live mode
2. **Seed Live Catalog**: Run the seed script against live Stripe account
3. **Update Environment**: Copy live price IDs to production environment
4. **Test Live Flow**: Verify checkout works with real cards
5. **Monitor Webhooks**: Ensure webhook endpoints are configured

## 📚 Related Files

- `products.json` - Product catalog specification
- `scripts/seed-stripe-products.js` - Seeding script
- `app/api/checkout-session/route.ts` - Consumer checkout API
- `app/api/subscribe/route.ts` - SaaS subscription API
- `app/signup/page.tsx` - Tier selection page
- `app/success/page.tsx` - Checkout success page
- `app/cancel/page.tsx` - Checkout cancel page
- `app/welcome/page.tsx` - Subscription welcome page

## 🤝 Support

For questions about the Stripe integration:
- Check the Stripe Dashboard logs
- Review the `stripe_ids.out.json` output
- Contact the development team

---

**Note**: This system is designed to be agent-friendly and Cursor-compatible. All product IDs are stable and predictable, making it easy for AI assistants to work with the catalog without guesswork.
