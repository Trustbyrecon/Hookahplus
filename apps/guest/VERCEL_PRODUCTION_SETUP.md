# Hookah+ Guest - Vercel Production Setup Guide

## Overview
This guide documents the Vercel deployment configuration for the Hookah+ Guest build within the monorepo structure.

## Project Configuration

### Vercel Project Settings
**Project Name:** `hookahplus-guest`

### Root Directory
```
apps/guest
```

### Build & Output Settings
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Install Command:** `npm install`
- **Output Directory:** `.next`

### Ignored Build Step (Branch Protection)
To prevent building on non-main branches, configure in Vercel Dashboard:
```bash
# Settings → Git → Ignored Build Step
if [ "$VERCEL_GIT_COMMIT_REF" != "main" ]; then exit 0; fi
```

This ensures only the `main` branch triggers production builds.

## Deployment URLs

### Production Deployment
- **Target Domain:** `guest.hookahplus.net`
- **Vercel URL:** `hookahplus-guest.vercel.app` (fallback)

### Domain Configuration
1. Go to Vercel Dashboard → Project: `hookahplus-guest` → Settings → Domains
2. Add domain: `guest.hookahplus.net`
3. Configure DNS CNAME record as instructed by Vercel
4. Enable "Protect" to prevent accidental deletions

## Environment Variables

### Required Environment Variables

#### Public URLs
```env
NEXT_PUBLIC_GUEST_URL=https://guest.hookahplus.net
NEXT_PUBLIC_APP_URL=https://app.hookahplus.net
NEXT_PUBLIC_SITE_URL=https://hookahplus.net
```

#### Analytics (GA4)
```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Stripe (for guest checkout)
```env
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
```

#### Feature Flags (Production)
```env
NEXT_PUBLIC_FEATURE_FLAGS=production
```

#### Optional Features
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_QR_SCANNING=true
NEXT_PUBLIC_ENABLE_FLAVOR_WHEEL=true
```

## DNS Configuration

### Required DNS Records
```
Type: CNAME
Name: guest
Value: cname.vercel-dns.com
```

## Build Configuration

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --port 3001",
    "build": "next build && node scripts/generate-sitemap.js",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Next.js Configuration
The guest build uses Next.js 14.2.7 with:
- App Router
- TypeScript
- Tailwind CSS
- Framer Motion
- QR Code generation
- Feature flags system

## Mobile Optimization

### Critical Mobile Features
- **QR Code Scanning:** Primary entry point for guests
- **Touch-Friendly Interface:** 44px minimum touch targets
- **Responsive Design:** Optimized for mobile screens
- **Flavor Wheel:** Touch-optimized flavor selection
- **Cart Management:** Minimal scrolling, clear CTAs

### Performance Requirements
- **First Contentful Paint:** <1.5s
- **Largest Contentful Paint:** <2.5s
- **Cumulative Layout Shift:** <0.1
- **Bundle Size:** <500KB initial load

## Deployment Process

### 1. Initial Setup
1. Import repository to Vercel
2. Select `apps/guest` as root directory
3. Configure build settings as specified above
4. Set environment variables
5. Configure custom domain

### 2. DNS Setup
1. Add CNAME record as specified above
2. Wait for DNS propagation (up to 48 hours)
3. Verify SSL certificate is active
4. Test domain resolution

### 3. Mobile Testing
1. Test QR code scanning on iOS Safari
2. Test QR code scanning on Android Chrome
3. Verify flavor wheel touch interactions
4. Test cart and checkout flow
5. Verify responsive design breakpoints

### 4. Post-Deployment
1. Test complete guest journey
2. Verify session sync with app.hookahplus.net
3. Test payment processing
4. Verify analytics tracking
5. Test feature flags

## Monitoring

### Health Checks
- **Guest Entry:** `https://guest.hookahplus.net/`
- **QR Scanner:** `https://guest.hookahplus.net/guest/lounge_001`
- **Flavor Demo:** `https://guest.hookahplus.net/flavor-demo`

### Performance Monitoring
- Core Web Vitals (mobile priority)
- QR scan success rate
- Flavor selection completion rate
- Checkout conversion rate
- Session sync success rate

### Error Tracking
- QR scan failures
- Payment processing errors
- Session creation failures
- API communication errors

## Feature Flags

### Production Flags
```typescript
const PRODUCTION_FLAGS = {
  guest: {
    enabled: true,
    qrFirst: true,
    anonymousMode: true,
  },
  rewards: {
    badges: { v1: true },
    points: true,
  },
  referral: {
    qr: { v1: true },
    p2p: true,
    connector: false, // Disabled in production initially
  },
  memory: {
    breadcrumbs: { v1: true },
    timeline: true,
  },
  ghostlog: {
    lite: true,
    full: false,
  },
  pricing: {
    dynamic: false, // Disabled in production initially
    promos: true,
  },
};
```

## Troubleshooting

### Common Issues
1. **QR Code Not Scanning:** Check camera permissions
2. **Flavor Wheel Not Loading:** Check Framer Motion bundle
3. **Session Sync Failures:** Check API connectivity
4. **Payment Errors:** Verify Stripe configuration
5. **Mobile Layout Issues:** Check responsive breakpoints

### Rollback Procedure
1. Go to Vercel Dashboard → Deployments
2. Select previous working deployment
3. Click "Promote to Production"
4. Verify guest functionality

## Security

### Headers Configured
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Referrer-Policy: strict-origin-when-cross-origin

### API Routes
- Cache-Control: no-cache for API routes
- 30-second timeout for API functions

## Success Criteria

### Technical
- [ ] Site loads at guest.hookahplus.net
- [ ] QR code scanning works on mobile
- [ ] Flavor wheel is touch-friendly
- [ ] Mobile responsive design
- [ ] Fast loading times (<3s)

### Business
- [ ] Guest can scan QR and start session
- [ ] Flavor selection works smoothly
- [ ] Cart and checkout flow functional
- [ ] Session syncs with operator dashboard
- [ ] Payment processing works

### Mobile Experience
- [ ] Touch targets are 44px minimum
- [ ] No horizontal scrolling required
- [ ] Flavor wheel is thumb-friendly
- [ ] Cart is easily accessible
- [ ] Checkout flow is streamlined
