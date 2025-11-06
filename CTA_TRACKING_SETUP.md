# CTA Tracking System Setup Guide

## Overview

The CTA tracking system has been implemented to capture leads from multiple sources (website, Instagram, LinkedIn, email) and route them in real-time to the Operator Onboarding Management system.

## What's Been Implemented

### 1. Demo Carousel Updated ✅
- **File**: `apps/site/components/Demo.tsx`
- **Status**: Updated with 8 new promotional images
- **Note**: Image files need to be added to `apps/site/public/images/demo/` directory:
  - `automate-operations.jpg`
  - `operational-flow-simplified.jpg`
  - `maximize-lounge-performance.jpg`
  - `master-lounge-operations.jpg`
  - `boost-profitability.jpg`
  - `coordinate-staff-seamlessly.jpg`
  - `take-control-lounge.jpg`
  - `reduce-management-friction.jpg`

### 2. Database Schema Enhanced ✅
- **File**: `apps/app/prisma/schema.prisma`
- **Changes**: Added CTA tracking fields to `ReflexEvent` model:
  - `ctaSource` - Source of CTA (website, instagram, linkedin, email, calendly)
  - `ctaType` - Type of CTA (demo_request, onboarding_signup, contact_form, social_click)
  - `referrer` - HTTP referrer or social media referrer
  - `campaignId` - Marketing campaign identifier
  - `metadata` - Additional JSON metadata

### 3. Database Migration Created ✅
- **File**: `supabase/migrations/20251106114220_enhance_cta_tracking.sql`
- **Status**: Ready to run
- **Action Required**: Run migration in Supabase to add new columns

### 4. CTA Tracking API Created ✅
- **File**: `apps/app/app/api/cta/track/route.ts`
- **Endpoints**:
  - `POST /api/cta/track` - Track CTA events
  - `GET /api/cta/track` - Get CTA statistics
- **Status**: Fully functional

### 5. Website CTAs Updated ✅
- **Files Updated**:
  - `apps/site/components/Hero.tsx` - "Book 15-min Demo" button
  - `apps/site/components/StickyCTA.tsx` - Sticky CTA button
  - `apps/site/components/PricingTeaser.tsx` - "Start 30-day Pilot" button
  - `apps/site/components/Demo.tsx` - Contact form link
  - `apps/site/app/onboarding/page.tsx` - Onboarding form submission
- **Status**: All CTAs now track events

### 6. Social Media Webhooks Created ✅
- **Instagram**: `apps/app/app/api/webhooks/instagram/route.ts`
- **LinkedIn**: `apps/app/app/api/webhooks/linkedin/route.ts`
- **Status**: Endpoints ready, need API credentials to activate

### 7. Email Integration Created ✅
- **File**: `apps/app/app/api/webhooks/email/route.ts`
- **Status**: Endpoint ready, supports SendGrid, Mailgun, and generic formats
- **Action Required**: Set up email forwarding or Gmail API

### 8. Operator Onboarding Enhanced ✅
- **File**: `apps/app/app/api/admin/operator-onboarding/route.ts`
- **Changes**: 
  - Now includes CTA events in queries
  - Added CTA source filtering
  - Added CTA source breakdown in statistics
- **Status**: Fully functional

## Setup Instructions

### Step 1: Run Database Migration

```bash
# In Supabase dashboard or via CLI
# Run the migration: supabase/migrations/20251106114220_enhance_cta_tracking.sql
```

Or apply via Supabase SQL Editor:
```sql
-- Copy contents from supabase/migrations/20251106114220_enhance_cta_tracking.sql
```

### Step 2: Add Demo Images

Place the 8 promotional images in:
```
apps/site/public/images/demo/
```

Image filenames:
- `automate-operations.jpg`
- `operational-flow-simplified.jpg`
- `maximize-lounge-performance.jpg`
- `master-lounge-operations.jpg`
- `boost-profitability.jpg`
- `coordinate-staff-seamlessly.jpg`
- `take-control-lounge.jpg`
- `reduce-management-friction.jpg`

### Step 3: Configure Environment Variables

Add to your `.env` files (site and app builds):

```env
# App Build URL (for CTA tracking API)
NEXT_PUBLIC_APP_URL=http://localhost:3002  # or your production URL

# Instagram Webhook (optional)
INSTAGRAM_WEBHOOK_SECRET=your_instagram_webhook_secret
INSTAGRAM_VERIFY_TOKEN=hookahplus_webhook_verify

# LinkedIn Webhook (optional)
LINKEDIN_WEBHOOK_SECRET=your_linkedin_webhook_secret

# Email Webhook (optional - if using email forwarding service)
EMAIL_WEBHOOK_SECRET=your_email_service_webhook_secret
```

### Step 4: Set Up Instagram Webhook (Optional)

1. Go to [Facebook Developer Console](https://developers.facebook.com/)
2. Create/select your app
3. Navigate to Webhooks section
4. Add webhook URL: `https://your-domain.com/api/webhooks/instagram`
5. Set verify token: `hookahplus_webhook_verify` (or your custom token)
6. Subscribe to Instagram events: `mentions`, `story_mentions`

### Step 5: Set Up LinkedIn Webhook (Optional)

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create/select your app
3. Navigate to Webhooks section
4. Add webhook URL: `https://your-domain.com/api/webhooks/linkedin`
5. Subscribe to ad click events

### Step 6: Set Up Email Integration

**Option A: Email Forwarding Service (Recommended)**

1. Sign up for SendGrid or Mailgun
2. Configure email forwarding from `hookahplusconnector@gmail.com`
3. Set webhook URL: `https://your-domain.com/api/webhooks/email`
4. Configure webhook to forward emails as JSON

**Option B: Gmail API (Advanced)**

1. Create Google Cloud Project
2. Enable Gmail API
3. Create Service Account
4. Set up OAuth for `hookahplusconnector@gmail.com`
5. Implement polling service (not included, requires additional code)

**Option C: Manual Import**

- Forward emails manually to a parsing service
- Or use the webhook endpoint with manual email forwarding

## Testing

### Test Website CTAs

1. Visit `http://localhost:3000`
2. Click any CTA button (Hero, StickyCTA, PricingTeaser, etc.)
3. Check Operator Onboarding Management: `http://localhost:3002/admin/operator-onboarding`
4. Verify new lead appears with `ctaSource: 'website'`

### Test CTA Tracking API Directly

```bash
curl -X POST http://localhost:3002/api/cta/track \
  -H "Content-Type: application/json" \
  -d '{
    "ctaSource": "website",
    "ctaType": "demo_request",
    "data": {
      "name": "Test User",
      "email": "test@example.com"
    },
    "component": "Test"
  }'
```

### Test Social Media Webhooks

**Instagram:**
```bash
# Verification (GET)
curl "http://localhost:3002/api/webhooks/instagram?hub.mode=subscribe&hub.verify_token=hookahplus_webhook_verify&hub.challenge=test123"

# Webhook (POST) - Use Facebook webhook tester
```

**LinkedIn:**
```bash
# Verification (GET)
curl "http://localhost:3002/api/webhooks/linkedin?challenge=test123"

# Webhook (POST) - Use LinkedIn webhook tester
```

### Test Email Webhook

```bash
curl -X POST http://localhost:3002/api/webhooks/email \
  -H "Content-Type: application/json" \
  -d '{
    "from": "test@example.com",
    "to": "hookahplusconnector@gmail.com",
    "subject": "Demo Request",
    "text": "Hi, I would like to request a demo. Name: John Doe, Phone: 555-1234"
  }'
```

## Monitoring & Verification

### Check CTA Statistics

Visit: `http://localhost:3002/api/cta/track?days=30`

Returns:
- Total CTAs
- Breakdown by source (website, instagram, linkedin, email)
- Breakdown by type (demo_request, onboarding_signup, etc.)
- Daily trends

### Check Operator Onboarding Management

Visit: `http://localhost:3002/admin/operator-onboarding`

- All CTA events appear as leads
- Filter by `ctaSource` using query parameter: `?ctaSource=website`
- Statistics include CTA source breakdown

## Next Steps

1. **Add Images**: Place the 8 demo images in `apps/site/public/images/demo/`
2. **Run Migration**: Apply database migration in Supabase
3. **Configure Webhooks**: Set up Instagram/LinkedIn webhooks if needed
4. **Set Up Email**: Choose email integration method and configure
5. **Test**: Verify CTAs are being tracked correctly
6. **Monitor**: Check Operator Onboarding Management regularly

## Support

If you need help with:
- **Email Setup**: Choose Option A (email forwarding) for easiest setup
- **Social Media APIs**: Requires business accounts and API access
- **Database Issues**: Check Supabase logs and migration status

## Notes

- All CTA tracking is non-blocking (fails silently if API is unavailable)
- Duplicate detection prevents spam (5-minute window for website, 24-hour for email)
- CTA events automatically route to Operator Onboarding with appropriate stage
- Real-time updates: Currently using polling, can be enhanced with WebSockets if needed

