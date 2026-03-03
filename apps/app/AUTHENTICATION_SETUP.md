# 🔐 Authentication & Authorization Setup

**Status:** ✅ Implemented - Ready for Configuration

---

## What Was Implemented

### 1. ✅ Middleware Protection (`apps/app/middleware.ts`)
- **Admin Routes:** `/admin/*` and `/api/admin/*` require authentication
- **App Routes:** `/api/*` (except public routes) require authentication
- **Public Routes:** `/api/health`, `/api/sessions` (QR codes), `/api/webhooks`, etc.

### 2. ✅ Email Notifications (`apps/app/lib/email.ts`)
- New lead notifications sent to admin email
- Uses Resend API (same as site build)
- Non-blocking (doesn't fail lead creation if email fails)

### 3. ✅ Contact Form Redirect Fixed
- Users stay on site build
- Show success message
- Redirect to home page

---

## Environment Variables Required

Add to `apps/app/.env.local`:

```bash
# ===========================================
# ADMIN AUTHENTICATION
# ===========================================
ADMIN_API_KEY=your-secure-api-key-here
ADMIN_SESSION_SECRET=your-secure-session-secret-here

# Development bypass (optional - for local dev)
ADMIN_BYPASS=true  # Only works in development mode

# ===========================================
# EMAIL NOTIFICATIONS
# ===========================================
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=Hookah+ <noreply@hookahplus.net>

# Admin notification recipient
ADMIN_NOTIFICATION_EMAIL=clark.dwayne@gmail.com
ADMIN_NOTIFICATION_PHONE=470-2269219

# ===========================================
# APP URL
# ===========================================
NEXT_PUBLIC_APP_URL=http://localhost:3002
```

---

## Authentication Methods

### Method 1: API Key (Programmatic Access)
```bash
curl -H "x-api-key: your-secure-api-key-here" \
  http://localhost:3002/api/admin/operator-onboarding
```

### Method 2: Session Cookie (Browser Access)
1. Set cookie: `admin_session=your-secure-session-secret-here`
2. Browser will automatically send cookie with requests

### Method 3: Development Bypass
- Set `ADMIN_BYPASS=true` in `.env.local`
- Only works when `NODE_ENV=development`
- **⚠️ Never use in production!**

---

## Protected Routes

### Admin Routes (Require Admin Access)
- `/admin/*` - All admin pages
- `/api/admin/*` - All admin API endpoints

### App Routes (Require Authentication)
- `/api/*` - Most API endpoints
- Exceptions (public):
  - `/api/health` - Health check
  - `/api/sessions` - QR code access
  - `/api/checkout-session` - Stripe checkout
  - `/api/webhooks/*` - Webhook endpoints

---

## Email Notifications

### New Lead Notification
When a new lead is created:
- Email sent to: `ADMIN_NOTIFICATION_EMAIL` (default: `clark.dwayne@gmail.com`)
- Subject: `🎯 New Lead: {Business Name}`
- Includes: Business name, owner, email, phone, location, source, stage
- Link to view lead in dashboard

### Configuration
- Uses Resend API (same as site build)
- Configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL`
- Set `ADMIN_NOTIFICATION_EMAIL` for recipient

---

## Next Steps

### 1. Install Resend Package (if not already installed)
```bash
cd apps/app
npm install resend
```

### 2. Generate Secure Secrets
```bash
# Generate API key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate session secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3. Add to `.env.local`
Copy the generated secrets to `.env.local`:
```bash
ADMIN_API_KEY=<generated-api-key>
ADMIN_SESSION_SECRET=<generated-session-secret>
```

### 4. Configure Email
- Get Resend API key from [resend.com](https://resend.com)
- Add to `.env.local`:
```bash
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=Hookah+ <noreply@hookahplus.net>
ADMIN_NOTIFICATION_EMAIL=clark.dwayne@gmail.com
```

### 5. Test Authentication
```bash
# Should return 401 Unauthorized
curl http://localhost:3002/api/admin/operator-onboarding

# Should return 200 OK (with API key)
curl -H "x-api-key: your-api-key" \
  http://localhost:3002/api/admin/operator-onboarding
```

---

## Production Setup

### Vercel Environment Variables
Add to Vercel Dashboard → Project Settings → Environment Variables:

**Production:**
```bash
ADMIN_API_KEY=<production-api-key>
ADMIN_SESSION_SECRET=<production-session-secret>
RESEND_API_KEY=<production-resend-key>
RESEND_FROM_EMAIL=Hookah+ <noreply@hookahplus.net>
ADMIN_NOTIFICATION_EMAIL=clark.dwayne@gmail.com
NEXT_PUBLIC_APP_URL=https://app.hookahplus.net
```

**⚠️ Important:**
- Do NOT set `ADMIN_BYPASS` in production
- Use strong, unique secrets for production
- Rotate secrets periodically

---

## Security Notes

✅ **DO:**
- Use strong, random secrets (32+ bytes)
- Rotate secrets periodically
- Use HTTPS in production
- Keep secrets in environment variables (never commit)

❌ **DON'T:**
- Use `ADMIN_BYPASS` in production
- Commit secrets to git
- Share API keys publicly
- Use weak passwords/secrets

---

## Files Created/Modified

### Created:
- `apps/app/middleware.ts` - Route protection middleware
- `apps/app/lib/email.ts` - Email notification functions
- `apps/app/AUTHENTICATION_SETUP.md` - This file

### Modified:
- `apps/app/app/api/admin/operator-onboarding/route.ts` - Added email notifications
- `apps/site/app/contact/page.tsx` - Fixed redirect (users stay on site)

---

## Testing Checklist

- [ ] Install Resend package: `npm install resend`
- [ ] Add environment variables to `.env.local`
- [ ] Test admin route protection (should return 401 without auth)
- [ ] Test with API key (should return 200)
- [ ] Test email notification (create a lead, check email)
- [ ] Test contact form redirect (should stay on site)
- [ ] Verify production environment variables in Vercel

---

**Status:** ✅ Ready for Configuration

