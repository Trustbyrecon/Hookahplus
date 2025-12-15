# Email Alias Inventory

## Overview

This document catalogs all email addresses and aliases used across the Hookah+ codebase (site, guest, and app builds) for email forwarding configuration.

## Production Email Addresses (hookahplus.net domain)

### 1. founder@hookahplus.net ✅ (Already Configured)

**Status:** Forwarding rule already exists

**Locations in Codebase:**
- `apps/site/app/investors/page.tsx` (lines 191, 664, 700)
  - Used in mailto links for investor deck requests

**Purpose:** 
- Primary contact for investor inquiries
- Investor deck requests

**Forwarding Recommendation:**
- ✅ Already configured to forward to `clark.dwayne@gmail.com`
- Should also forward to `hookahplusconnector@gmail.com` (dual delivery)

---

### 2. noreply@hookahplus.net

**Status:** Sender address (not a recipient)

**Locations in Codebase:**
- `apps/site/lib/email.ts` (line 13)
- `apps/app/lib/email.ts` (line 13)
- `apps/site/lib/campaigns/worldShisha2026.ts` (line 65)
- `apps/site/env.template` (line 80)
- `apps/app/env.template` (line 87)
- `apps/app/RESEND_SETUP.md` (line 22, 30)
- `apps/site/RESEND_EMAIL_SETUP.md` (line 47)

**Purpose:**
- FROM address for transactional emails sent via Resend
- Used for automated emails (confirmations, notifications, newsletters)

**Forwarding Recommendation:**
- ⚠️ **Typically does NOT need forwarding** - this is a sender address
- Consider forwarding only if you want to receive:
  - Bounce notifications
  - Reply notifications (if users reply to automated emails)
  - Delivery failure reports

**Configuration:**
- Set via `RESEND_FROM_EMAIL` environment variable
- Format: `Hookah+ <noreply@hookahplus.net>`

---

### 3. legal@hookahplus.net

**Status:** Needs forwarding configuration

**Locations in Codebase:**
- `apps/site/app/terms/page.tsx` (lines 86-87)
  - Contact link in Terms of Service page

**Purpose:**
- Legal inquiries and questions about Terms of Service
- Compliance and legal matters

**Forwarding Recommendation:**
- ✅ **Should forward to both:**
  - `clark.dwayne@gmail.com`
  - `hookahplusconnector@gmail.com`

---

### 4. privacy@hookahplus.net

**Status:** Needs forwarding configuration

**Locations in Codebase:**
- `apps/site/app/privacy/page.tsx` (lines 85-86)
  - Contact link in Privacy Policy page

**Purpose:**
- Privacy policy inquiries
- Data protection and GDPR-related questions
- Privacy concerns and requests

**Forwarding Recommendation:**
- ✅ **Should forward to both:**
  - `clark.dwayne@gmail.com`
  - `hookahplusconnector@gmail.com`

---

### 5. support@hookahplus.net

**Status:** Needs forwarding configuration

**Locations in Codebase:**
- `apps/site/app/thank-you/preorder/page.tsx` (line 95)
  - Support contact in preorder thank you page
- `apps/web/app/success/page.tsx` (lines 78-79)
  - Support contact in success page

**Purpose:**
- Customer support inquiries
- General customer service questions
- Post-purchase support

**Forwarding Recommendation:**
- ✅ **Should forward to both:**
  - `clark.dwayne@gmail.com`
  - `hookahplusconnector@gmail.com`

---

### 6. pos-integration@hookahplus.net

**Status:** Needs forwarding configuration

**Locations in Codebase:**
- `apps/site/app/pos-waitlist/page.tsx` (line 454)
  - Contact email displayed on POS waitlist page

**Purpose:**
- POS (Point of Sale) integration inquiries
- POS waitlist signups and questions
- Payment system integration requests

**Forwarding Recommendation:**
- ✅ **Should forward to both:**
  - `clark.dwayne@gmail.com`
  - `hookahplusconnector@gmail.com`

---

## External Email Addresses (Referenced but not hookahplus.net)

These are Gmail addresses used for notifications and should NOT be configured as forwarding rules (they are destinations, not sources):

### hookahplusconnector@gmail.com
- **Purpose:** Primary notification and contact email
- **Used in:**
  - `apps/site/lib/email.ts` (multiple locations)
  - `apps/app/app/api/admin/operator-onboarding/route.ts` (line 1088)
  - `apps/site/lib/campaigns/worldShisha2026.ts` (line 63)
  - Various contact pages and email templates
- **Note:** This is a destination email, not an alias that needs forwarding

### clark.dwayne@gmail.com
- **Purpose:** Admin notification email (default recipient)
- **Used in:**
  - `apps/app/lib/email.ts` (line 32)
  - `apps/site/lib/email.ts` (line 176)
  - Default value for `ADMIN_NOTIFICATION_EMAIL` environment variable
- **Note:** This is a destination email, not an alias that needs forwarding

---

## Test/Demo Emails (Should NOT be configured)

These are placeholder or demo data used in development/testing and should be excluded from forwarding configuration:

- `admin@hookahplus.com` - Placeholder in admin login form (`apps/app/app/admin/login/page.tsx`)
- `support@hookahplus.com` - App internal placeholder (different from `.net` version)
- Staff demo emails (used in mock data):
  - `mike@hookahplus.com`
  - `sarah@hookahplus.com`
  - `alex@hookahplus.com`
  - `maria@hookahplus.com`
  - `john@hookahplus.com`
  - `emily@hookahplus.com`
- Customer demo emails:
  - `customer@hookahplus.com`
  - `member@hookahplus.com`
  - `reservation@hookahplus.com`
  - `walkin@hookahplus.com`

**Note:** These are all `.com` domain addresses used for demo purposes and should not be configured for forwarding.

---

## Summary

### Email Aliases Requiring Forwarding Configuration

1. ✅ **founder@hookahplus.net** - Already configured (add dual delivery)
2. ⚠️ **noreply@hookahplus.net** - Optional (sender address, may not need forwarding)
3. ❌ **legal@hookahplus.net** - **Needs configuration**
4. ❌ **privacy@hookahplus.net** - **Needs configuration**
5. ❌ **support@hookahplus.net** - **Needs configuration**
6. ❌ **pos-integration@hookahplus.net** - **Needs configuration**

### Forwarding Destination

All aliases should forward to:
- `clark.dwayne@gmail.com`
- `hookahplusconnector@gmail.com`

(Configure dual delivery/forwarding to both addresses)

---

## Last Updated

Generated: December 2024
Codebase Scan: Complete
Status: Ready for email forwarding configuration

