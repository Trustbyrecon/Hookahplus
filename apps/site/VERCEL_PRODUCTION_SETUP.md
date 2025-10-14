# Hookah+ Site - Vercel Production Setup Guide

## Overview
This guide documents the Vercel deployment configuration for the Hookah+ Site build within the monorepo structure.

## Project Configuration

### Vercel Project Settings
**Project Name:** `hookahplus-site`

### Root Directory
```
apps/site
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
- **Target Domain:** `hookahplus.net`
- **Vercel URL:** `hookahplus-site.vercel.app` (fallback)

### Domain Configuration
1. Go to Vercel Dashboard → Project: `hookahplus-site` → Settings → Domains
2. Add domain: `hookahplus.net`
3. Configure DNS A/CNAME records as instructed by Vercel
4. Enable "Protect" to prevent accidental deletions

## Environment Variables

### Required Environment Variables

#### Public URLs
```env
NEXT_PUBLIC_SITE_URL=https://hookahplus.net
NEXT_PUBLIC_APP_URL=https://app.hookahplus.net
NEXT_PUBLIC_GUEST_URL=https://guest.hookahplus.net
```

#### Analytics (GA4)
```env
NEXT_PUBLIC_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
```

#### Stripe (for pre-orders)
```env
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
```

#### Optional Features
```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_LEAD_CAPTURE=true
```

## DNS Configuration

### Required DNS Records
```
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### Subdomain Configuration
```
Type: CNAME
Name: app
Value: cname.vercel-dns.com

Type: CNAME
Name: guest
Value: cname.vercel-dns.com
```

## Build Configuration

### Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev --port 3003",
    "build": "next build && node scripts/generate-sitemap.js",
    "start": "next start",
    "lint": "next lint"
  }
}
```

### Next.js Configuration
The site uses Next.js 14.2.7 with:
- App Router
- TypeScript
- Tailwind CSS
- Framer Motion

## Deployment Process

### 1. Initial Setup
1. Import repository to Vercel
2. Select `apps/site` as root directory
3. Configure build settings as specified above
4. Set environment variables
5. Configure custom domain

### 2. DNS Setup
1. Add DNS records as specified above
2. Wait for DNS propagation (up to 48 hours)
3. Verify SSL certificate is active
4. Test domain resolution

### 3. Post-Deployment
1. Test all marketing pages
2. Verify CTA buttons work correctly
3. Test responsive design
4. Verify analytics tracking
5. Test lead capture forms

## Monitoring

### Health Checks
- **Homepage:** `https://hookahplus.net/`
- **Flavor Demo:** `https://hookahplus.net/flavor-demo`
- **POS Waitlist:** `https://hookahplus.net/pos-waitlist`
- **Pre-orders:** `https://hookahplus.net/pre-order`

### Performance Monitoring
- Core Web Vitals
- Page load times
- Mobile responsiveness
- SEO metrics

## Troubleshooting

### Common Issues
1. **Build Failures:** Check Node.js version (18+)
2. **Environment Variables:** Verify all required vars are set
3. **DNS Issues:** Check A/CNAME records
4. **SSL Problems:** Vercel handles automatically

### Rollback Procedure
1. Go to Vercel Dashboard → Deployments
2. Select previous working deployment
3. Click "Promote to Production"
4. Verify site functionality

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
- [ ] Site loads at hookahplus.net
- [ ] All pages render correctly
- [ ] Mobile responsive design
- [ ] Fast loading times (<3s)
- [ ] SSL certificate active

### Business
- [ ] Marketing content displays correctly
- [ ] CTA buttons route to correct destinations
- [ ] Lead capture forms functional
- [ ] Analytics tracking active
- [ ] SEO meta tags present
