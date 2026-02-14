# Operator Onboarding - Next Steps & Priorities

## ✅ Completed Fixes

1. **Data Sync Gap Fixed**
   - `totalCapacity`, `numberOfTables`, `baseHookahPrice` now extracted from all payload locations
   - Site API now forwards all fields including capacity, tables, and social media links

2. **Social Media Links**
   - Added Instagram, Facebook, Website URL fields to Lead interface
   - Displayed in Contact Information section with clickable links

3. **Notes Saving**
   - Fixed to work with REM TrustEvent payload structure
   - Notes now save correctly in `behavior.payload.notes`

4. **Mark Contacted Documentation**
   - Always creates a note when marking as contacted
   - Documents the contact method (email/phone) automatically

## 🎯 Top Priority: Next 2 Steps

### 1. **Create Demo Session/Test Link Generator** (HIGH VALUE)
**Why:** This is the core value proposition - "one test link your staff can click through in 15 minutes"

**What to build:**
- API endpoint: `POST /api/admin/operator-onboarding` with action `create_demo_session`
- Generate a unique demo link: `/demo/{loungeSlug}`
- Create a demo tenant/lounge configuration with:
  - Business name as lounge name
  - Base hookah price from lead data
  - Refill price (if provided)
  - Pricing model (time-based/flat-rate)
  - Seating types → table configuration
- Store the demo link in the lead's payload
- Return the link for email sending

**Implementation:**
```typescript
// In route.ts
case 'create_demo_session':
  // 1. Generate slug from businessName
  // 2. Create tenant (if doesn't exist)
  // 3. Create demo configuration
  // 4. Generate link: `${process.env.NEXT_PUBLIC_APP_URL}/demo/${slug}`
  // 5. Store in lead payload
  // 6. Return link
```

**Files to modify:**
- `apps/app/app/api/admin/operator-onboarding/route.ts` - Add `create_demo_session` action
- `apps/app/app/demo/[slug]/route.ts` - Already exists, verify it works
- `apps/app/lib/demo.ts` - Create helper functions for demo session setup

### 2. **Test Link Email Integration** (HIGH VALUE)
**Why:** Completes the "15-minute onboarding" promise - automated email delivery

**What to build:**
- Enhance existing `send_test_link` action to:
  - Auto-generate demo link if not provided
  - Use lead's business name, owner name, email
  - Send via `sendTestLinkEmail()` (already exists in `lib/email.ts`)
  - Update lead with sent timestamp

**Implementation:**
```typescript
// Enhance existing send_test_link action
if (action === 'send_test_link') {
  // If testLink not provided, generate it first
  if (!testLink) {
    // Call create_demo_session internally
    // Get generated link
  }
  // Send email with link
  // Update lead with emailSentAt timestamp
}
```

**Files to modify:**
- `apps/app/app/api/admin/operator-onboarding/route.ts` - Enhance `send_test_link`
- `apps/app/lib/email.ts` - Verify `sendTestLinkEmail` works correctly

## 📋 Additional High-Value Items (Priority 3-4)

### 3. **Instagram URL Auto-Detection** (MEDIUM VALUE)
**Why:** User mentioned Instagram URL was provided but not captured

**What to build:**
- When lead comes from Instagram CTA, extract Instagram URL from referrer
- Or add manual Instagram URL field in admin UI
- Store in `instagramUrl` field

### 4. **Lead Activity Timeline** (MEDIUM VALUE)
**Why:** Better visibility into lead engagement

**What to build:**
- Display chronological timeline of:
  - Lead created
  - Notes added
  - Contacted (email/phone)
  - Stage changes
  - Test link sent
  - Demo session accessed (future)

## 🚀 Implementation Order

1. **Create Demo Session** (1-2 hours)
   - Most critical for value delivery
   - Enables the "test link" promise

2. **Test Link Email** (30 minutes)
   - Quick win after demo session exists
   - Completes the automation loop

3. **Instagram URL Detection** (30 minutes)
   - Nice-to-have enhancement
   - Can be done in parallel with testing

4. **Activity Timeline** (1 hour)
   - Enhancement for better UX
   - Can be added after core flow works

## 📝 Notes

- The `demo/[slug]` route already exists - just needs to be connected to lead data
- Email sending infrastructure (`sendTestLinkEmail`) already exists
- Focus on getting the demo session creation working first - that's the blocker

