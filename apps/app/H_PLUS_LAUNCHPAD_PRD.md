# H+ LaunchPad Product Requirements Document

**Version:** 1.0  
**Status:** Ready for Implementation  
**Target Launch:** January 2026

---

## 🎯 Product Vision

**H+ LaunchPad** is a self-serve onboarding product that turns a new lounge into an operating-ready deployment in 25-35 minutes, without requiring implementation consultants.

**Tagline:** "From zero to live sessions in under an hour."

**Core Promise:** "You're not buying software. You're buying a live operating system by tonight."

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Flows](#user-flows)
3. [Feature Specifications](#feature-specifications)
4. [Technical Requirements](#technical-requirements)
5. [Success Metrics](#success-metrics)
6. [Phase 2 Considerations](#phase-2-considerations)

---

## Overview

### Product Goals

1. **Reduce onboarding time** from days/weeks to 25-35 minutes
2. **Eliminate manual configuration** by operators
3. **Enable same-day go-live** for new lounges
4. **Prove ROI within 7 days** through embedded tracking

### Architecture: LaunchPad Concierge + Core

**ManyChat + Instagram = LaunchPad Concierge (60-80% of onboarding)**
- Top-of-funnel entry (comment keywords, story replies, IG ads)
- Qualification & routing (lounge details, POS, pricing model)
- Config capture via DM (5-8 questions)
- Deliverables in DM (go-live kit links, QR codes, guides)

**Web App = LaunchPad Core (final 20% + operations)**
- True activation (account creation, billing, subscription)
- Running sessions (timers, staff workflows, shift handoff)
- Week-1 Wins dashboard (embedded metrics, retention loops)
- Persistent operational UI (table management, analytics)

**Why this split:**
- IG DM = low friction, instant gratification, perfect for qualification
- Web app = reliable ops UI, persistent state, billing compliance
- 24-hour messaging constraint requires web handoff for long-term engagement

### Key Decisions (Locked)

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Authentication** | Anonymous start → account at Go Live | Preserve momentum, reduce friction |
| **Pricing Model** | Free to complete → subscription to activate | Aha moment before payment |
| **POS Integration** | Static guide now → real-time later | Faster onboarding, less complexity |
| **Week-1 Wins** | Embedded card + detail view | Visibility drives engagement |
| **Entry Point** | ManyChat + IG (60-80%) → Web (20%) | Low friction start, reliable finish |

---

## User Flows

### Primary Flow: Anonymous Setup → Account Creation

```
1. User lands on /launchpad
   → No authentication required
   → Generate temporary "Setup Session" token
   → Save state to localStorage + server session

2. User completes Steps 1-5
   → Progress saved after each step
   → Can resume if browser closes
   → Preview available at any time

3. User reaches Step 6 (Go Live)
   → Preview shows: "Your lounge is ready"
   → Requires: email + phone (optional) + password/magic link
   → Account created + lounge activated (if subscription active)
   → OR: Account created + lounge in "preview mode" (if no subscription)

4. Post-Go-Live
   → Redirect to main dashboard
   → Week-1 Wins card visible immediately
   → QR codes generated and downloadable
```

### Secondary Flow: Returning User (Resume Setup)

```
1. User returns to /launchpad with existing session token
   → Load saved progress
   → Resume from last completed step
   → Show progress indicator: "Step 3 of 6"

2. If session expired (>7 days)
   → Show "Start Fresh" or "Contact Support" options
```

### Activation Flow: Preview → Live

```
1. User completes LaunchPad (preview mode)
   → Can view all generated assets
   → Can test dashboard in preview mode
   → Cannot process real sessions

2. User subscribes (Starter/Pro/Trust+)
   → Lounge automatically activated
   → QR codes become functional
   → Week-1 Wins tracker starts counting
   → Staff roles become active
```

### ManyChat + Instagram Entry Flow (LaunchPad Concierge)

```
1. User triggers via IG:
   → Comment keyword ("LAUNCHPAD") → DM
   → Story reply → DM
   → IG ad click → DM

2. ManyChat DM collects (5-8 questions):
   → Lounge name, city, seats/tables
   → POS used (Square/Clover/Toast/other)
   → Session type (flat vs timed)
   → Price range
   → Top 5 flavors

3. ManyChat External Request → H+ API:
   → Creates SetupSession with collected data
   → Generates preliminary config
   → Returns LaunchPad completion link

4. ManyChat DM delivers:
   → "Your Go-Live Kit is ready"
   → Link to complete LaunchPad (web)
   → Link to download QR codes (preview)
   → Link to "Run Above POS" guide
   → First-week checklist

5. User clicks link → Web LaunchPad:
   → Pre-filled with ManyChat data
   → Complete remaining steps (if any)
   → Account creation + activation
   → Full go-live

6. ManyChat follow-up (same day):
   → "Your Week-1 Wins tracker is live"
   → Link to dashboard
   → Daily summaries (within 24-hour window)
```

**What ManyChat Handles (60-80%):**
- ✅ Entry triggers (comment, story, ad)
- ✅ Qualification questions
- ✅ Config capture (via custom fields)
- ✅ Deliverable links (QR codes, guides)
- ✅ Same-day follow-up

**What Web App Handles (20%):**
- ✅ Account creation + billing
- ✅ True activation (subscription required)
- ✅ Running sessions (operational UI)
- ✅ Week-1 Wins dashboard (persistent)
- ✅ Long-term engagement (beyond 24-hour window)

---

## Feature Specifications

### Step 1: Venue Snapshot (3 minutes)

**Purpose:** Capture basic lounge information and primary goal.

**Fields:**
- Lounge name (required, text)
- Operating hours (required, time pickers for each day)
- Tables/sections count (required, number)
- Base session price (required, currency)
- Primary goal (required, radio):
  - Reduce comped sessions
  - Speed up checkout
  - Capture repeat guest preferences
  - All of the above

**Acceptance Criteria:**
- [ ] Form validates all required fields before proceeding
- [ ] Operating hours use time pickers (12-hour or 24-hour based on locale)
- [ ] Base price accepts currency input (defaults to USD)
- [ ] Primary goal selection influences default settings in later steps
- [ ] Progress saved to localStorage + server session after completion
- [ ] User can go back and edit before proceeding

**UI Copy:**
- Header: "Set the rules once. We'll run them every night."
- Helper text: "Rough count is fine. You can adjust later."

---

### Step 2: Flavors & Mixes (7 minutes)

**Purpose:** Build flavor memory foundation and identify premium add-ons.

**Fields:**
- Top flavors (required, multi-select with autocomplete)
- Premium flavors (optional, multi-select, marked with $)
- Common mixes (optional, text area or structured input)

**Features:**
- Autocomplete from existing flavor database
- "Most popular" dropdown defaults (pre-populated suggestions)
- Visual distinction for premium flavors (badge/icon)

**Acceptance Criteria:**
- [ ] Autocomplete suggests flavors as user types
- [ ] Premium flavors show pricing indicator ($)
- [ ] User can add custom flavors not in database
- [ ] Common mixes can be entered as free text or structured
- [ ] "Don't overthink this" helper text visible
- [ ] Progress saved after completion
- [ ] Minimum 3 flavors required to proceed

**UI Copy:**
- Header: "Memory starts here."
- Helper text: "Don't overthink this. You can refine it after day one."

---

### Step 3: Session Rules (5 minutes)

**Purpose:** Configure session pricing model and policies to prevent revenue leakage.

**Fields:**
- Session type (required, radio):
  - Flat session
  - Timed session
- Grace period (required, select):
  - None
  - 5 minutes
  - 10 minutes
- Extensions (required, radio):
  - Manual only
  - Auto-extend with prompt
- Comp policy (required, toggle):
  - Disabled (recommended)
  - Manager approval required

**Acceptance Criteria:**
- [ ] Session type selection updates pricing preview
- [ ] Grace period selection shows impact message
- [ ] Comp policy toggle shows warning if enabled
- [ ] "These rules protect your staff" helper text visible
- [ ] All selections saved to lounge config
- [ ] Preview shows how rules will work in practice

**UI Copy:**
- Header: "This is where money stops leaking."
- Helper text: "These rules protect your staff from awkward conversations."

---

### Step 4: Staff & Roles (5 minutes)

**Purpose:** Set up staff accounts and enable shift handoff.

**Fields:**
- Add staff (email, required)
- Role selection (required, select):
  - Owner
  - Manager
  - Staff
- Shift handoff (toggle, enabled by default)

**Features:**
- Email validation
- Invite sent immediately (or queued for account creation)
- Role permissions preview

**Acceptance Criteria:**
- [ ] Email validation before adding staff
- [ ] At least one Owner role required
- [ ] Shift handoff enabled by default (can be disabled)
- [ ] Invite emails sent (or queued) when account is created
- [ ] Role permissions clearly explained
- [ ] User can add multiple staff members
- [ ] Progress saved after completion

**UI Copy:**
- Header: "Everyone sees what they need. Nothing more."
- Helper text: "Notes carry forward so nothing gets lost between shifts."

---

### Step 5: POS Bridge (5 minutes)

**Purpose:** Document POS integration approach and generate mapping guide.

**Fields:**
- POS selection (required, select):
  - Square
  - Clover
  - Toast
  - None yet

**Output:**
- POS-specific 1-page guide (PDF/HTML)
- Mapping checklist (what goes in H+, what stays in POS)
- Optional: "receipt note" convention for reconciliation

**Acceptance Criteria:**
- [ ] POS selection generates appropriate guide
- [ ] Guide explains "H+ runs above POS" concept
- [ ] Mapping checklist is downloadable
- [ ] Guide includes reconciliation tips
- [ ] "None yet" option doesn't block progress
- [ ] Progress saved after completion

**UI Copy:**
- Header: "We don't replace your POS. We run above it."
- Helper text: "H+ tracks sessions, memory, and loyalty. Your POS handles payment."

---

### Step 6: Go Live (Instant)

**Purpose:** Finalize setup, create account, and activate lounge.

**Pre-Account Fields:**
- Email (required)
- Phone (optional)
- Password OR magic link option

**Post-Account Actions:**
- Generate QR codes (table + kiosk)
- Create Staff Playbook (1-page PDF)
- Activate lounge (if subscription active)
- OR: Set lounge to "preview mode" (if no subscription)
- Redirect to dashboard

**Acceptance Criteria:**
- [ ] Email validation before account creation
- [ ] Password strength indicator (if password chosen)
- [ ] Magic link option available
- [ ] Account created successfully
- [ ] QR codes generated immediately
- [ ] Staff Playbook generated and downloadable
- [ ] Lounge activated OR set to preview mode based on subscription
- [ ] Redirect to dashboard with success message
- [ ] Week-1 Wins card visible on dashboard

**UI Copy:**
- Header: "You're ready. Let's turn it on."
- Success message: "Your lounge is live. Start tracking sessions tonight."

---

## Technical Requirements

### Authentication & Session Management

**Anonymous Setup Session:**
- Generate unique session token (UUID)
- Store in localStorage: `launchpad_session_token`
- Store on server: `SetupSession` table with:
  - `token` (UUID, primary key)
  - `progress` (JSON, step data)
  - `createdAt` (timestamp)
  - `expiresAt` (timestamp, 7 days)
  - `loungeId` (nullable, set at Go Live)

**Account Creation at Go Live:**
- Validate email uniqueness
- Create user account (email + password OR magic link)
- Link SetupSession to user account
- Create lounge record
- Transfer all progress data to lounge config

**Acceptance Criteria:**
- [ ] Session token generated on first visit
- [ ] Progress saved after each step
- [ ] Session persists across browser refreshes
- [ ] Session expires after 7 days of inactivity
- [ ] Account creation requires email verification
- [ ] Magic link option works correctly
- [ ] Lounge linked to user account on creation

---

### Progress Persistence

**Storage Strategy:**
- **Client-side:** localStorage for immediate persistence
- **Server-side:** SetupSession table for cross-device access
- **Sync:** Save to server after each step completion

**Data Structure:**
```typescript
interface LaunchPadProgress {
  currentStep: number;
  completedSteps: number[];
  data: {
    step1?: VenueSnapshotData;
    step2?: FlavorsMixesData;
    step3?: SessionRulesData;
    step4?: StaffRolesData;
    step5?: POSBridgeData;
  };
  sessionToken: string;
  createdAt: string;
  lastUpdated: string;
}
```

**Acceptance Criteria:**
- [ ] Progress saved to localStorage immediately
- [ ] Progress synced to server after each step
- [ ] User can resume from last completed step
- [ ] Progress visible in progress indicator
- [ ] Data persists across browser sessions

---

### Lounge Configuration Generation

**Output Format:**
- **LoungeOps Config:** YAML/JSON file
- **Database Records:**
  - `Lounge` record
  - `LoungeConfig` record (version 1)
  - `PricingRule` records (base session + add-ons)
  - `Flavor` records
  - `User` records (staff)
  - `Table` records (if layout provided)

**Config Structure:**
```yaml
lounge_name: "{loungeName}"
slug: "{slug}"
session_type: "{flat|timed}"
base_session_price: {price}
grace_period_minutes: {minutes}
extension_policy: "{manual|auto}"
comp_policy_enabled: {boolean}
flavors:
  standard: [...]
  premium: [...]
staff:
  - email: "..."
    role: "..."
pos_bridge:
  pos_type: "{square|clover|toast|none}"
  integration_guide_url: "..."
```

**Acceptance Criteria:**
- [ ] Config generated in correct format
- [ ] All database records created successfully
- [ ] Config versioned (starts at v1)
- [ ] Config downloadable as YAML/JSON
- [ ] Config can be imported/exported later

---

### QR Code Generation

**Requirements:**
- Generate QR codes for:
  - Each table (if table layout provided)
  - Kiosk/checkout station
- QR codes link to guest session interface
- QR codes include lounge identifier

**Acceptance Criteria:**
- [ ] QR codes generated immediately at Go Live
- [ ] QR codes downloadable as PNG/PDF
- [ ] QR codes include table identifier
- [ ] QR codes link to correct guest interface
- [ ] QR codes work in preview mode (test links)
- [ ] QR codes become functional when lounge activated

---

### Staff Playbook Generation

**Content:**
- 1-page PDF/HTML document
- Quick start guide
- Key features overview
- Common workflows
- Support contact info

**Acceptance Criteria:**
- [ ] Playbook generated at Go Live
- [ ] Playbook downloadable as PDF
- [ ] Playbook includes lounge-specific info
- [ ] Playbook is mobile-friendly
- [ ] Playbook can be printed

---

### Week-1 Wins Tracker

**Metrics Tracked:**
1. **Comped sessions avoided**
   - Count: Sessions that would have been comped but weren't
   - Calculation: Sessions with `compRequested = true` but `compApproved = false`

2. **Add-ons captured**
   - Count: Premium flavors added to sessions
   - Calculation: Sessions with premium flavors in `selectedFlavors`

3. **Repeat guests recognized**
   - Count: Guests recognized by memory layer
   - Calculation: Sessions where `guestMemoryHit = true`

4. **Time saved per shift**
   - Metric: Average checkout time reduction
   - Calculation: Compare checkout times vs. baseline (if available)

**Dashboard Integration:**
- **Main Dashboard Card:**
  - Big number: Total wins (sum of all metrics)
  - Progress bar: Days active (1-7)
  - CTA: "View Details"

- **Detail View:**
  - Breakdown by metric
  - Daily trends
  - Comparison to industry benchmarks (if available)

**Acceptance Criteria:**
- [ ] Week-1 Wins card visible on main dashboard
- [ ] Card shows accurate counts
- [ ] Card updates in real-time
- [ ] Detail view accessible from card
- [ ] Metrics calculated correctly
- [ ] After Day 7, transitions to "Monthly Wins"
- [ ] Data persists beyond 7 days

---

### Preview Mode vs. Live Mode

**Preview Mode (No Subscription):**
- User can view all generated assets
- Dashboard accessible in read-only mode
- QR codes generate test links (non-functional)
- Week-1 Wins tracker shows "Activate to start tracking"
- Cannot process real sessions

**Live Mode (With Subscription):**
- All features functional
- QR codes link to real guest interface
- Sessions can be created and processed
- Week-1 Wins tracker active
- Staff roles active

**Acceptance Criteria:**
- [ ] Preview mode clearly indicated in UI
- [ ] Preview mode allows asset viewing
- [ ] Preview mode blocks session processing
- [ ] Activation prompt visible in preview mode
- [ ] Live mode activates on subscription
- [ ] Mode transition is seamless

---

## Success Metrics

### LaunchPad Completion Metrics

- **Completion Rate:** % of users who complete all 6 steps
- **Time to Complete:** Average time from start to Go Live
- **Drop-off Points:** Which step has highest abandonment
- **Resume Rate:** % of users who return to complete setup

### Activation Metrics

- **Preview → Live Conversion:** % of preview users who subscribe
- **Time to Activation:** Days between preview and subscription
- **Activation by Plan:** Distribution across Starter/Pro/Trust+

### Week-1 Wins Metrics

- **Engagement:** % of activated lounges that view Week-1 Wins
- **Value Realization:** Average wins per lounge in first 7 days
- **Retention Impact:** Correlation between Week-1 Wins and churn

### Target Benchmarks (18 months)

- **Completion Rate:** >60%
- **Time to Complete:** <35 minutes (median)
- **Preview → Live Conversion:** >40%
- **Week-1 Wins Engagement:** >70% of activated lounges

---

## Phase 2 Considerations

### Real-Time POS Integration

**Future Enhancement:**
- OAuth flow for Square/Clover/Toast
- Real-time sync of transactions
- Automated reconciliation
- Two-way data flow

**Not in LaunchPad v1:**
- Keep static guide approach
- Focus on same-day go-live
- Reduce complexity and support burden

### Advanced Onboarding Features

**Future Enhancements:**
- AI-powered menu extraction from photos
- Automated table layout generation
- Smart defaults based on lounge type
- Multi-location setup wizard

### ManyChat Integration Enhancements

**Future Enhancements:**
- Real-time config sync (ManyChat → H+ API)
- Automated tier routing (Starter/Pro/Trust+)
- Smart qualification scoring
- Re-engagement triggers (beyond 24-hour window)

**Current Constraints:**
- 24-hour messaging window requires web handoff
- Platform volatility requires graceful fallback
- Meta compliance requires approved automation paths

---

## Implementation Checklist

### Phase 1: Core LaunchPad Flow

- [ ] Create `/launchpad` route
- [ ] Implement anonymous session management
- [ ] Build Step 1: Venue Snapshot
- [ ] Build Step 2: Flavors & Mixes
- [ ] Build Step 3: Session Rules
- [ ] Build Step 4: Staff & Roles
- [ ] Build Step 5: POS Bridge
- [ ] Build Step 6: Go Live
- [ ] Implement progress persistence
- [ ] Add account creation at Go Live

### Phase 2: Asset Generation

- [ ] Generate LoungeOps Config (YAML/JSON)
- [ ] Generate QR codes
- [ ] Generate Staff Playbook
- [ ] Create preview mode system

### Phase 3: Week-1 Wins Tracker

- [ ] Build metrics calculation logic
- [ ] Create dashboard card component
- [ ] Create detail view page
- [ ] Implement real-time updates
- [ ] Add transition to Monthly Wins

### Phase 4: Activation & Subscription

- [ ] Integrate subscription check
- [ ] Implement preview → live transition
- [ ] Add activation prompts
- [ ] Test subscription flows

### Phase 5: Testing & Polish

- [ ] End-to-end testing
- [ ] Mobile responsiveness
- [ ] Error handling
- [ ] Performance optimization
- [ ] Analytics instrumentation

---

## Open Questions

1. **Flavor Database:** Do we have a pre-populated flavor database, or start empty?
2. **Table Layout:** Should LaunchPad include table layout setup, or defer to post-activation?
3. **Multi-Location:** How should LaunchPad handle multi-location operators?
4. **Support:** What support channels are available during LaunchPad (chat, email, phone)?

---

**Document Status:** ✅ Ready for Implementation  
**Last Updated:** 2025-01-XX  
**Next Review:** After Phase 1 completion

