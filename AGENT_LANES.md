# Agent Lanes & Responsibilities

**Purpose:** Clear assignment of tasks to agents for $240M valuation validation and launch readiness.

---

## Agent Assignment Matrix

| Agent | Lane | Primary Responsibility | Current Status |
|-------|------|----------------------|----------------|
| **Noor (session_agent)** | Session Lifecycle | Session management, Reflex Ops flow validation | 0% (dormant) → P0 Activate |
| **Lumi (pricing_agent)** | Revenue Optimization | Dynamic pricing, revenue reporting, pricing tiers | ⏳ Needs validation |
| **Jules (loyalty_agent)** | Customer Retention | Loyalty program, retention tracking, tier progression | ⏳ Needs validation |
| **EchoPrime (growth_agent)** | Customer Acquisition | Analytics, conversion tracking, operational metrics, social media content ops | ✅ Framework complete |
| **Aliethia (reflex_agent)** | Reflex Chain | Reflex Chain validation, trust scoring, POS/Loyalty sync | ✅ 100% complete |
| **database_agent** | Database Performance | RLS optimization, connection pooling, performance | ✅ 95% complete |
| **deployment_agent** | Production Deployment | Vercel config, environment variables, deployment | ⚠️ 45% (escalated) |

---

## Noor (session_agent) - P0 Lane

**Lane:** Session Lifecycle & Reflex Ops Flow

### Immediate Tasks (Today)
- [ ] **Activate agent** for session management
- [ ] **Validate Guest → App sync** (after server restart)
- [ ] **Test complete Reflex Ops flow:** QR → Prep → FOH → Delivery → Checkout
- [ ] **Verify session creation** from all sources (QR, Guest, Manual)
- [ ] **Test session state transitions** (all BOH/FOH actions)
- [ ] **Validate edge case resolution** (modal, notes, state updates)

### Short-term Tasks (This Week)
- [ ] **Test extension mechanism** ($8 per 15-min block)
- [ ] **Validate session timer** functionality
- [ ] **Test waitlist** functionality
- [ ] **Verify session analytics** tracking

### Files to Work With
- `apps/app/app/api/sessions/route.ts` - Session API
- `apps/app/app/fire-session-dashboard/page.tsx` - FSD UI
- `apps/app/lib/reflex-chain/integration.ts` - Reflex Chain
- `apps/guest/app/api/session/start/route.ts` - Guest sync
- `apps/app/components/SimpleFSDDesign.tsx` - Dashboard component

### Success Criteria
- ✅ Guest scans QR → Session appears in FSD
- ✅ All BOH/FOH actions work correctly
- ✅ Reflex Ops flow complete end-to-end
- ✅ Edge cases resolve with notes

---

## Lumi (pricing_agent) - P1 Lane

**Lane:** Revenue Optimization & Dynamic Pricing

### Immediate Tasks (This Week)
- [ ] **Validate dynamic pricing engine**
  - [ ] Peak hours pricing (+20%)
  - [ ] Weekend premium (+15%)
  - [ ] Demand-based pricing adjustments
  - [ ] Loyalty discount application
- [ ] **Create revenue reporting dashboard**
  - [ ] MRR per location
  - [ ] ARPU (Average Revenue Per User)
  - [ ] Table turnover rate
  - [ ] Session extension revenue
- [ ] **Test pricing tiers**
  - [ ] Basic ($25)
  - [ ] Premium ($35)
  - [ ] VIP ($50)

### Files to Work With
- `apps/app/lib/pricing/` - Pricing engine
- `apps/guest/components/guest/PriceBreakdown.tsx` - Pricing UI
- Revenue dashboard (to be created)

### Success Criteria
- ✅ Dynamic pricing applies correctly
- ✅ Revenue dashboard shows $50K+ MRR potential
- ✅ Pricing tiers functional

---

## Jules (loyalty_agent) - P1 Lane

**Lane:** Customer Retention & Loyalty Program

### Immediate Tasks (This Week)
- [ ] **Validate loyalty tier system**
  - [ ] Bronze (5+ visits, 10% discount)
  - [ ] Silver (15+ visits, 15% discount)
  - [ ] Gold (30+ visits, 20% discount)
  - [ ] Platinum (50+ visits, 25% discount)
- [ ] **Implement retention tracking**
  - [ ] Monthly retention rate (60%+ target)
  - [ ] Return customer identification
  - [ ] Visit history tracking
- [ ] **Test reward redemption**
  - [ ] Points calculation
  - [ ] Discount application
  - [ ] Tier progression

### Files to Work With
- `apps/app/lib/loyalty/` - Loyalty system
- Loyalty ledger implementation
- Retention metrics (to be created)

### Success Criteria
- ✅ Loyalty tiers work correctly
- ✅ Retention tracking shows 60%+ monthly retention
- ✅ Rewards redeemable

---

## EchoPrime (growth_agent) - P1 Lane

**Lane:** Customer Acquisition & Analytics

### Immediate Tasks (This Week)
- [ ] **Implement conversion tracking**
  - [ ] Site app conversion rate (15% target)
  - [ ] Guest app adoption (80% target)
  - [ ] A/B testing framework
- [ ] **Create analytics dashboard**
  - [ ] Table turnover (4+ sessions per table per day)
  - [ ] AOV (Average Order Value - $45+ target)
  - [ ] Staff efficiency (15+ orders per staff per shift)
  - [ ] Customer satisfaction (4.5+ stars)
- [ ] **Track operational metrics**
  - [ ] Session creation sources
  - [ ] Extension rates
  - [ ] Revenue by source
- [ ] **Social Media Content Operations**
  - [ ] Execute weekly content cadence (5 posts/week: Mon, Tue, Thu, Fri, Sat)
  - [ ] Generate Operator POV series (20-30s clips)
  - [ ] Track content KPIs (save rate, operator comments, partner inquiries)
  - [ ] Maintain Trust Triad filter (staff ease, owner confidence, customer vibe)
  - [ ] Follow monthly workflow (Week 1: Identity, Week 2: Pain to relief, Week 3: Feature trust, Week 4: Launch runway)

### Files to Work With
- Analytics implementation
- Conversion tracking
- `apps/app/components/AnalyticsScript.tsx`
- Analytics dashboard (to be created)
- `docs/CONTENT_OPS_MONTHLY_LOOP_V1.md` - Content operations playbook

### Success Criteria
- ✅ Conversion tracking shows 15%+ rate
- ✅ Analytics dashboard functional
- ✅ Operational metrics tracked
- ✅ Weekly content cadence maintained (5 posts/week)
- ✅ At least 1 operator-comment per week
- ✅ At least 1 partner inquiry per month

---

## Aliethia (reflex_agent) - P0 Lane

**Lane:** Reflex Chain Validation & Trust Scoring

### Immediate Tasks (Today)
- [ ] **Validate Reflex Chain layers**
  - [ ] BOH layer processes correctly
  - [ ] FOH layer processes correctly
  - [ ] Delivery layer processes correctly
  - [ ] Customer layer processes correctly
- [ ] **Test adapter sync**
  - [ ] POS adapter syncs data
  - [ ] Loyalty adapter tracks points
  - [ ] Session Replay adapter records events
- [ ] **Verify trust scoring**
  - [ ] Trust score calculation
  - [ ] Score updates correctly
  - [ ] Trust data recorded

### Files to Work With
- `apps/app/lib/reflex-chain/integration.ts` - Reflex Chain
- `apps/app/lib/trustScoring.ts` - Trust scoring
- Adapter implementations

### Success Criteria
- ✅ All Reflex Chain layers process
- ✅ Adapters sync correctly
- ✅ Trust scoring accurate

---

## database_agent - P0 Lane

**Lane:** Database Performance & RLS Optimization

### Immediate Tasks (Today)
- [ ] **Verify externalRef column** migration applied
- [ ] **Test connection pooling** performance
- [ ] **Validate RLS policy optimizations** (50 issues fixed)
- [ ] **Performance test**
  - [ ] <100ms average query time
  - [ ] 1000+ concurrent sessions
  - [ ] Connection pool efficiency

### Files to Work With
- `supabase/migrations/` - Database migrations
- RLS policies
- Connection pooler configuration

### Success Criteria
- ✅ Database queries <100ms
- ✅ Handles 1000+ concurrent sessions
- ✅ RLS policies optimized

---

## deployment_agent - P0 Lane

**Lane:** Production Deployment & Environment Configuration

### Immediate Tasks (Today)
- [ ] **Restart app build server** (pick up new Prisma client)
- [ ] **Verify DATABASE_URL** in production (if deploying)
- [ ] **Test production deployment**
- [ ] **Validate all environment variables**
- [ ] **Fix Vercel configuration** issues

### Files to Work With
- Vercel configuration
- Environment variables
- Build scripts

### Success Criteria
- ✅ App build server running with new Prisma client
- ✅ Production deployment successful
- ✅ All environment variables configured

---

## Coordination Points

### Cross-Agent Dependencies
- **Noor + Aliethia:** Reflex Ops flow validation requires both
- **Lumi + EchoPrime:** Revenue dashboard needs both pricing and analytics
- **Jules + EchoPrime:** Retention tracking needs both loyalty and analytics
- **database_agent + All:** Database performance affects all agents

### Communication Protocol
- Update status in `GO_LIVE_STATUS_REPORT.md`
- Report gaps in `AGENT_LANES.md`
- Document validation results in agent-specific files

---

## Success Metrics

### Launch Readiness: 100%
- [ ] All P0 tasks complete
- [ ] All P1 tasks complete
- [ ] Investor demo ready
- [ ] Revenue model validated
- [ ] Technical scalability proven

### Valuation Readiness: $240M 2028
- [ ] Core functionality works
- [ ] Business model validated
- [ ] Market validation possible
- [ ] Scalability proven

