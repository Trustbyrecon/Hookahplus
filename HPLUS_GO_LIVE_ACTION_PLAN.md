# Hookah+ Go-Live Action Plan

**Target:** 8-12 weeks to go-live  
**Principle:** System must earn belief before it earns scale

---

## Phase 1: Make Value Visible (Weeks 1-3)
**Goal:** Business owners can see and feel value immediately

### 1.1 Owner Dashboard MVP 🔴 CRITICAL

#### 1.1.1 Real-Time Session Overview
**Priority:** P0  
**Estimated Time:** 3-4 days  
**Owner:** TBD

**Tasks:**
- [ ] Create `/app/dashboard/sessions/page.tsx` with real-time session list
- [ ] Connect to `/api/sessions` endpoint
- [ ] Display active sessions with:
  - Table number
  - Flavor mix
  - Start time
  - Duration timer
  - Staff assigned
  - Trust score
- [ ] Add session status indicators (active, pending, completed)
- [ ] Implement auto-refresh (every 30 seconds)
- [ ] Add session detail modal

**Components Needed:**
- `components/SessionList.tsx` - Real implementation (not placeholder)
- `components/SessionCard.tsx` - Enhance existing
- `components/SessionTimer.tsx` - Real implementation

**API Requirements:**
- Enhance `/api/sessions` to return real-time status
- Add `/api/sessions/active` endpoint for active sessions only
- Add WebSocket support for real-time updates (optional but recommended)

---

#### 1.1.2 Revenue Metrics Dashboard
**Priority:** P0  
**Estimated Time:** 2-3 days  
**Owner:** TBD

**Tasks:**
- [ ] Create `/app/dashboard/revenue/page.tsx`
- [ ] Connect to Stripe API to fetch payment data
- [ ] Display metrics:
  - Today's revenue
  - Week revenue
  - Month revenue
  - Revenue trend chart (last 7 days)
  - Average session value
  - Session count
- [ ] Add date range selector
- [ ] Implement revenue breakdown by:
  - Flavor mix
  - Table/section
  - Time of day
- [ ] Add export functionality (CSV download)

**Components Needed:**
- `components/RevenueMetrics.tsx` - New component
- `components/RevenueChart.tsx` - Use Chart.js or Recharts
- `components/MetricCard.tsx` - Reusable metric display

**API Requirements:**
- Create `/api/revenue` endpoint
- Aggregate Stripe payment data
- Return time-series data for charts

**Data Sources:**
- Stripe payments (via webhook logs or Stripe API)
- Session data from PostgreSQL
- Map `hp_session_id` from Stripe metadata to sessions

---

#### 1.1.3 Flavor Performance Analytics
**Priority:** P0  
**Estimated Time:** 2 days  
**Owner:** TBD

**Tasks:**
- [ ] Add flavor performance section to dashboard
- [ ] Display:
  - Top flavors by revenue
  - Top flavor mixes
  - Flavor popularity trends
  - Revenue per flavor
- [ ] Create flavor leaderboard component
- [ ] Add flavor mix recommendations

**Components Needed:**
- `components/FlavorLeaderboard.tsx` - Enhance existing
- `components/FlavorPerformanceChart.tsx` - New component

**Data Sources:**
- Aggregate from sessions table (`flavors` array)
- Join with revenue data from Stripe

---

#### 1.1.4 Trust Score Visualization
**Priority:** P1  
**Estimated Time:** 2 days  
**Owner:** TBD

**Tasks:**
- [ ] Display trust score trends
- [ ] Show trust score over time (chart)
- [ ] Display current trust score prominently
- [ ] Show trust score breakdown by:
  - Session
  - Staff member
  - Table/section
  - Time of day
- [ ] Add trust score alerts/thresholds

**Components Needed:**
- `components/TrustScoreChart.tsx` - New component
- `components/TrustArcDisplay.tsx` - Enhance existing
- `components/TrustScoreBreakdown.tsx` - New component

**Data Sources:**
- Trust scores from `/api/live/trust`
- Store trust scores in database (new table needed)

**Database Schema:**
```sql
CREATE TABLE trust_scores (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id),
  staff_id TEXT,
  trust_score DECIMAL(3,1),
  timestamp TIMESTAMP DEFAULT NOW(),
  events JSONB
);
```

---

### 1.2 Complete Preorder → Checkout Flow 🔴 CRITICAL

#### 1.2.1 Preorder Form Implementation
**Priority:** P0  
**Estimated Time:** 3-4 days  
**Owner:** TBD

**Tasks:**
- [ ] Implement `components/PreorderEntry.tsx` fully
- [ ] Add flavor selection (multi-select)
- [ ] Add add-ons selection
- [ ] Add table selection (if available)
- [ ] Calculate total price:
  - Base session price
  - Flavor add-ons
  - Surge pricing (if weekend/top flavors)
- [ ] Add validation
- [ ] Connect to Stripe checkout creation

**Components Needed:**
- `components/PreorderEntry.tsx` - Complete implementation
- `components/FlavorSelector.tsx` - Enhance existing
- `components/PriceCalculator.tsx` - New component
- `components/TableSelector.tsx` - New component (if needed)

**Pricing Logic:**
- Base price: $30 (configurable)
- Add-on flavors: $5 each
- Surge pricing: +$3 on weekends for top flavors
- See `cmd/modules/stripe_integration.py` for logic

**API Requirements:**
- Create `/api/preorder/calculate-price` endpoint
- Return calculated price breakdown
- Include surge pricing logic

---

#### 1.2.2 Stripe Checkout Integration
**Priority:** P0  
**Estimated Time:** 2 days  
**Owner:** TBD

**Tasks:**
- [ ] Connect preorder form to `/api/createCheckout` Netlify function
- [ ] Pass session metadata:
  - Flavor mix
  - Table number
  - Lounge ID
  - Guest notes
- [ ] Handle checkout session creation
- [ ] Redirect to Stripe Checkout
- [ ] Handle checkout success/cancel

**Integration Points:**
- Use existing `netlify/functions/createCheckout.js`
- Enhance to accept flavor mix and other metadata
- Ensure metadata is passed to Stripe session

**Flow:**
1. User selects flavors → Calculate price
2. User clicks "Checkout" → Call `/api/createCheckout`
3. Redirect to Stripe Checkout URL
4. On success → Redirect to `/checkout/success`
5. On cancel → Redirect to `/checkout/cancel`

---

#### 1.2.3 Session Creation on Payment Success
**Priority:** P0  
**Estimated Time:** 2 days  
**Owner:** TBD

**Tasks:**
- [ ] Enhance `/app/checkout/success/page.tsx`
- [ ] Extract session ID from Stripe checkout session
- [ ] Create session in database via `/api/sessions`
- [ ] Generate QR code for table
- [ ] Display session confirmation
- [ ] Show QR code for staff scanning

**Components Needed:**
- `components/SessionConfirmation.tsx` - Enhance existing
- `components/QRCodeDisplay.tsx` - New component (use `qrcode` library)

**API Requirements:**
- Enhance `/api/sessions` POST endpoint
- Add session creation from Stripe webhook (alternative approach)
- Store Stripe checkout session ID in sessions table

**Database Schema:**
```sql
ALTER TABLE sessions ADD COLUMN stripe_checkout_session_id TEXT;
ALTER TABLE sessions ADD COLUMN stripe_payment_intent_id TEXT;
ALTER TABLE sessions ADD COLUMN qr_code_url TEXT;
```

---

#### 1.2.4 QR Code Generation
**Priority:** P0  
**Estimated Time:** 1 day  
**Owner:** TBD

**Tasks:**
- [ ] Implement QR code generation using `qrcode` library
- [ ] Generate QR code with session ID
- [ ] Store QR code image in S3 or public folder
- [ ] Display QR code on:
  - Checkout success page
  - Session detail page
  - Operator dashboard

**Implementation:**
- Use existing `cmd/modules/stripe_integration.py` function `generate_stripe_qr`
- Create React component to display QR code
- Store QR code URL in database

---

### 1.3 Operator Dashboard MVP 🔴 CRITICAL

#### 1.3.1 Active Session List
**Priority:** P0  
**Estimated Time:** 3 days  
**Owner:** TBD

**Tasks:**
- [ ] Create `/app/operator/sessions/page.tsx`
- [ ] Display active sessions:
  - Table number
  - Flavor mix
  - Start time
  - Duration timer
  - Staff assigned
  - Status (active, needs refill, completed)
- [ ] Add filters:
  - By table
  - By staff
  - By status
- [ ] Add actions:
  - Mark as refilled
  - Add notes
  - End session
- [ ] Real-time updates

**Components Needed:**
- `components/OperatorSessionList.tsx` - New component
- `components/SessionTimer.tsx` - Real implementation
- `components/SessionActions.tsx` - New component

**API Requirements:**
- Enhance `/api/sessions` to support status updates
- Add `/api/sessions/:id/refill` endpoint
- Add `/api/sessions/:id/end` endpoint

---

#### 1.3.2 Table Status View
**Priority:** P0  
**Estimated Time:** 2-3 days  
**Owner:** TBD

**Tasks:**
- [ ] Create visual table map/status view
- [ ] Show all tables with status:
  - Available (green)
  - Active session (yellow)
  - Needs attention (red)
  - Reserved (gray)
- [ ] Click table to see session details
- [ ] Drag-and-drop session assignment (optional)

**Components Needed:**
- `components/TableMap.tsx` - New component
- `components/TableStatusCard.tsx` - New component
- `components/SeatMapEditor.tsx` - Complete implementation (currently placeholder)

**Data Requirements:**
- Table configuration from onboarding
- Current session status per table
- Staff assignments

---

#### 1.3.3 Refill Tracking Workflow
**Priority:** P0  
**Estimated Time:** 2 days  
**Owner:** TBD

**Tasks:**
- [ ] Add refill button to session card
- [ ] Track refill count
- [ ] Update session refills field
- [ ] Show refill history
- [ ] Add refill alerts (if session running long)

**Components Needed:**
- `components/RefillTracker.tsx` - New component
- Enhance `components/SessionCard.tsx`

**API Requirements:**
- Add `/api/sessions/:id/refill` endpoint
- Update refills count in database

---

#### 1.3.4 Session Notes Integration
**Priority:** P0  
**Estimated Time:** 1-2 days  
**Owner:** TBD

**Tasks:**
- [ ] Integrate session notes into operator dashboard
- [ ] Allow staff to add notes during session
- [ ] Display notes on session card
- [ ] Add notes categories:
  - Guest preferences
  - Burnout alerts
  - Special requests
  - Staff reminders

**Components Needed:**
- `components/SessionNotesPanel.tsx` - Complete implementation (currently placeholder)
- Enhance existing session notes API

**API Requirements:**
- Use existing `/api/sessions` PUT endpoint for notes
- Or create dedicated `/api/sessions/:id/notes` endpoint

---

## Phase 2: Make Value Feelable (Weeks 4-6)

### 2.1 Reflex Loop Activation 🟠 HIGH

#### 2.1.1 Real-Time Trust Score Calculation Engine
**Priority:** P1  
**Estimated Time:** 4-5 days  
**Owner:** TBD

**Tasks:**
- [ ] Create trust score calculation service
- [ ] Implement scoring algorithm:
  - Base score: 7.0
  - Positive events: +0.1 to +0.5
  - Negative events: -0.1 to -0.5
  - Staff responsiveness: +0.2
  - Session duration: +0.1 per 30 min
  - Refill timing: +0.3 if timely
- [ ] Store trust scores in database
- [ ] Calculate trust scores on:
  - Session start
  - Refill events
  - Session end
  - Staff interactions
- [ ] Aggregate trust scores:
  - Per session
  - Per staff member
  - Per table
  - Per lounge

**Implementation:**
- Create `lib/trustScore.ts` service
- Enhance `/api/live/trust` endpoint
- Store in `trust_scores` table

**Algorithm Reference:**
- See `app/live/page.tsx` for current implementation
- Document scoring rules in codex

---

#### 2.1.2 Trust Visualization
**Priority:** P1  
**Estimated Time:** 3 days  
**Owner:** TBD

**Tasks:**
- [ ] Create trust score heatmap
- [ ] Display trust scores by:
  - Table location
  - Time of day
  - Staff member
  - Flavor mix
- [ ] Show trust score trends over time
- [ ] Add trust score alerts

**Components Needed:**
- `components/ReflexTrustGraph.tsx` - Complete implementation (currently placeholder)
- `components/TrustHeatmap.tsx` - New component
- `components/TrustScoreTrends.tsx` - New component

**Visualization:**
- Use heatmap library (e.g., `react-heatmap-grid`)
- Color coding: Green (9+), Yellow (7-8.9), Red (<7)

---

#### 2.1.3 Behavioral Pattern Detection
**Priority:** P1  
**Estimated Time:** 4-5 days  
**Owner:** TBD

**Tasks:**
- [ ] Detect patterns:
  - Peak hours
  - Popular flavor combinations
  - Staff efficiency patterns
  - Table preferences
  - Session duration patterns
- [ ] Surface insights:
  - "Peak hours: 8-10 PM"
  - "Top flavor mix: Peach + Mint"
  - "Most efficient staff: [Name]"
- [ ] Generate recommendations:
  - Staff scheduling
  - Flavor inventory
  - Table assignments

**Implementation:**
- Create `lib/behavioralPatterns.ts` service
- Analyze session data
- Generate insights dashboard

---

#### 2.1.4 Reflex Loop Status Indicators
**Priority:** P1  
**Estimated Time:** 2 days  
**Owner:** TBD

**Tasks:**
- [ ] Display Reflex Loop activation status
- [ ] Show active Reflex Loops:
  - Trust Loop
  - Loyalty Loop
  - Pricing Loop
  - Staff Flow Loop
- [ ] Indicate when loops are active vs inactive
- [ ] Show loop performance metrics

**Components Needed:**
- `components/ReflexLoopStatus.tsx` - New component
- `components/ReflexLoopCard.tsx` - New component

**Status Indicators:**
- Active: Green indicator
- Inactive: Gray indicator
- Performance: Score/number

---

### 2.2 Enhanced Onboarding 🟠 HIGH

#### 2.2.1 Multi-Step Onboarding Wizard
**Priority:** P1  
**Estimated Time:** 4-5 days  
**Owner:** TBD

**Tasks:**
- [ ] Create onboarding wizard with steps:
  1. Lounge Information (name, address, hours)
  2. Table Configuration (number, layout)
  3. Staff Roster (add staff members)
  4. Pricing Configuration (base price, add-ons)
  5. Stripe Connect Setup
  6. Review & Confirm
- [ ] Save progress between steps
- [ ] Validation at each step
- [ ] Progress indicator

**Components Needed:**
- `components/OnboardingWizard.tsx` - New component
- `components/OnboardingStep.tsx` - New component
- `components/LoungeInfoForm.tsx` - New component
- `components/TableConfigForm.tsx` - New component
- `components/StaffRosterForm.tsx` - New component
- `components/PricingConfigForm.tsx` - New component

**API Requirements:**
- Create `/api/onboarding` endpoints:
  - POST `/api/onboarding/lounge`
  - POST `/api/onboarding/tables`
  - POST `/api/onboarding/staff`
  - POST `/api/onboarding/pricing`
  - POST `/api/onboarding/complete`

**Database Schema:**
```sql
CREATE TABLE lounges (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  operating_hours JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tables (
  id SERIAL PRIMARY KEY,
  lounge_id INTEGER REFERENCES lounges(id),
  table_number TEXT NOT NULL,
  section TEXT,
  capacity INTEGER,
  layout JSONB
);

CREATE TABLE staff (
  id SERIAL PRIMARY KEY,
  lounge_id INTEGER REFERENCES lounges(id),
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pricing_config (
  id SERIAL PRIMARY KEY,
  lounge_id INTEGER REFERENCES lounges(id),
  base_price DECIMAL(10,2),
  flavor_addon_price DECIMAL(10,2),
  surge_pricing JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

#### 2.2.2 Table/Seat Map Editor
**Priority:** P1  
**Estimated Time:** 3-4 days  
**Owner:** TBD

**Tasks:**
- [ ] Create visual table map editor
- [ ] Allow drag-and-drop table placement
- [ ] Define table properties:
  - Table number
  - Section
  - Capacity
  - Location coordinates
- [ ] Save table configuration
- [ ] Preview table map

**Components Needed:**
- `components/SeatMapEditor.tsx` - Complete implementation (currently placeholder)
- `components/TablePlacement.tsx` - New component
- Use a canvas library (e.g., `react-dnd` or `fabric.js`)

---

#### 2.2.3 Stripe Connect Setup
**Priority:** P1  
**Estimated Time:** 2-3 days  
**Owner:** TBD

**Tasks:**
- [ ] Integrate Stripe Connect onboarding
- [ ] Create Stripe Connect account
- [ ] Handle OAuth callback
- [ ] Store Stripe account ID
- [ ] Test payment flow

**Implementation:**
- Use Stripe Connect API
- Create `/api/stripe/connect` endpoints
- Handle OAuth callback

---

### 2.3 Session Analytics 🟠 HIGH

#### 2.3.1 Session Replay System
**Priority:** P1  
**Estimated Time:** 3-4 days  
**Owner:** TBD

**Tasks:**
- [ ] Record session events:
  - Start time
  - Refill events
  - Staff interactions
  - Trust score changes
  - Notes added
- [ ] Create replay timeline
- [ ] Display session replay UI
- [ ] Allow playback of session

**Components Needed:**
- `components/SessionReplayTimeline.tsx` - Enhance existing
- `components/SessionReplayPlayer.tsx` - New component

**Data Storage:**
- Store events in `session_events` table
- Include timestamp, event type, data

---

## Phase 3: Production Hardening (Weeks 7-9)

### 3.1 Production Infrastructure 🟡 MEDIUM

#### 3.1.1 Environment Configuration
**Priority:** P2  
**Estimated Time:** 1 day  
**Owner:** TBD

**Tasks:**
- [ ] Document all required environment variables
- [ ] Set up production environment:
  - `DATABASE_URL`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `AWS_REGION`
  - `AWS_S3_BUCKET`
  - `SENDGRID_API_KEY`
  - `SENDGRID_FROM_EMAIL`
- [ ] Create `.env.production` template
- [ ] Configure Netlify environment variables

---

#### 3.1.2 Error Monitoring
**Priority:** P2  
**Estimated Time:** 2 days  
**Owner:** TBD

**Tasks:**
- [ ] Set up error tracking (Sentry or LogRocket)
- [ ] Add error boundaries
- [ ] Log errors to monitoring service
- [ ] Set up error alerts

**Implementation:**
- Install Sentry SDK
- Wrap app in error boundary
- Add error logging to API routes

---

#### 3.1.3 Performance Monitoring
**Priority:** P2  
**Estimated Time:** 2 days  
**Owner:** TBD

**Tasks:**
- [ ] Set up performance monitoring
- [ ] Track:
  - Page load times
  - API response times
  - Database query times
- [ ] Set up performance alerts
- [ ] Optimize slow queries

---

#### 3.1.4 Database Backups
**Priority:** P2  
**Estimated Time:** 1 day  
**Owner:** TBD

**Tasks:**
- [ ] Set up automated database backups
- [ ] Configure backup schedule (daily)
- [ ] Test backup restoration
- [ ] Document backup process

---

#### 3.1.5 Security Audit
**Priority:** P2  
**Estimated Time:** 3-4 days  
**Owner:** TBD

**Tasks:**
- [ ] Review security:
  - SQL injection prevention
  - XSS prevention
  - CSRF protection
  - Authentication/authorization
  - API security
- [ ] Fix security issues
- [ ] Add security headers
- [ ] Penetration testing (optional)

---

## Phase 4: Go-Live & Scale (Weeks 10-12)

### 4.1 Beta Testing 🟡 MEDIUM

#### 4.1.1 Pilot Lounge Setup
**Priority:** P2  
**Estimated Time:** 1 week  
**Owner:** TBD

**Tasks:**
- [ ] Identify 1-2 pilot lounges
- [ ] Complete onboarding
- [ ] Train staff
- [ ] Monitor usage
- [ ] Collect feedback

---

#### 4.1.2 Feedback Collection
**Priority:** P2  
**Estimated Time:** Ongoing  
**Owner:** TBD

**Tasks:**
- [ ] Create feedback form
- [ ] Conduct interviews
- [ ] Analyze usage data
- [ ] Prioritize fixes

---

### 4.2 Documentation 🟡 MEDIUM

#### 4.2.1 Owner Onboarding Guide
**Priority:** P2  
**Estimated Time:** 2 days  
**Owner:** TBD

**Tasks:**
- [ ] Create step-by-step guide
- [ ] Add screenshots
- [ ] Create video walkthrough
- [ ] Include troubleshooting

---

#### 4.2.2 Staff Training Materials
**Priority:** P2  
**Estimated Time:** 2 days  
**Owner:** TBD

**Tasks:**
- [ ] Create staff training guide
- [ ] Add video tutorials
- [ ] Create FAQ
- [ ] Include best practices

---

## Success Metrics

### Phase 1 Success Criteria
- [ ] Owner can log in and see real revenue data
- [ ] Owner can see active sessions
- [ ] Owner can export revenue reports
- [ ] Staff can create and track sessions
- [ ] Guests can complete preorders end-to-end

### Phase 2 Success Criteria
- [ ] Trust scores are visible and updating
- [ ] Reflex Loop indicators show system activity
- [ ] Onboarding takes < 30 minutes
- [ ] Session analytics are functional

### Phase 3 Success Criteria
- [ ] System handles 100+ concurrent sessions
- [ ] Error rate < 0.1%
- [ ] 99.9% uptime
- [ ] Security audit passed

### Phase 4 Success Criteria
- [ ] 1-2 lounges successfully onboarded
- [ ] System stable with real traffic
- [ ] Support process established
- [ ] Ready for broader launch

---

## Dependencies & Blockers

### External Dependencies
- Stripe API access
- AWS S3 bucket setup
- SendGrid account
- Database hosting (PostgreSQL)

### Internal Dependencies
- Design system completion
- API endpoint completion
- Database schema finalization

### Potential Blockers
- Stripe Connect approval (if needed)
- Database performance at scale
- Real-time WebSocket implementation
- Complex Reflex Loop algorithms

---

## Resource Requirements

### Team Roles Needed
- **Full-stack Developer** (2-3): Core development
- **Frontend Developer** (1): UI/UX implementation
- **Backend Developer** (1): API and database work
- **DevOps Engineer** (0.5): Infrastructure setup
- **QA Engineer** (0.5): Testing and validation
- **Product Manager** (0.5): Prioritization and coordination

### Timeline Estimate
- **Conservative:** 12 weeks
- **Aggressive:** 8 weeks
- **Realistic:** 10 weeks

---

*Last Updated: January 2025*
