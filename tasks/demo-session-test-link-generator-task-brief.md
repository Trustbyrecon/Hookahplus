# Task Brief: Demo Session/Test Link Generator

**What:** Implement API endpoint and helper functions to generate unique demo session links for operator onboarding leads. This enables the core value proposition of "one test link your staff can click through in 15 minutes."

**Why:** This is the foundation of the operator onboarding automation flow. Without demo link generation, leads cannot be provided with a personalized test experience, blocking the entire onboarding promise.

**Who needs what:**
- **Inputs:** Lead data (businessName, baseHookahPrice, refillPrice, pricingModel, seatingTypes), tenant database
- **Dependencies:** `apps/app/app/demo/[slug]/route.ts` (demo route), `apps/app/lib/demo.ts` (helper functions), Prisma client, Tenant model
- **Integrations:** Next.js API routes, Prisma ORM, Supabase database

**How it will be verified:**
- ✅ API endpoint `POST /api/admin/operator-onboarding` with action `create_demo_session` accepts leadId and returns demoLink
- ✅ Demo link format: `{NEXT_PUBLIC_APP_URL}/demo/{slug}` where slug is URL-safe business name
- ✅ Demo tenant is created or found in database with business name
- ✅ Demo link is stored in lead payload at `behavior.payload.demoLink` (REM TrustEvent format)
- ✅ Demo link uses production URL (never localhost) when `forceProduction=true`
- ✅ Slug generation handles special characters, spaces, and length limits correctly
- ✅ Reflex score ≥0.92 for `demo.create_session` action

**When:** P0 - Critical Path (Already implemented, verification needed)

---

## Signals to Instrument

### Telemetry

**Sentry Events:**
- `demo.create_session` - When demo session is successfully created (tags: `leadId`, `businessName`, `slug`, `tenantId`, `component: demo`)
- `demo.create_session_failed` - When demo session creation fails (tags: `leadId`, `errorType`, `component: demo`, `action: create_session`)
- `demo.tenant_created` - When new demo tenant is created (tags: `tenantId`, `businessName`, `component: demo`)
- `demo.tenant_found` - When existing demo tenant is found (tags: `tenantId`, `businessName`, `component: demo`)

**Pino Log Keys:**
- `{ component: "demo", action: "create_session", leadId, businessName, slug, tenantId, latency }`
- `{ component: "demo", action: "create_session_error", leadId, error, errorType }`
- `{ component: "demo", action: "generate_slug", businessName, slug }`
- `{ component: "demo", action: "find_or_create_tenant", businessName, tenantId, created: boolean }`

**Reflex Scoring:**
- `reflexScoreAudit.recordScore("demo", "create_session", score, 100, { latency, tenantId, slug }, { leadId, businessName })`
- `reflexScoreAudit.recordScore("demo", "generate_slug", score, 100, { businessName, slug }, {})`
- `reflexScoreAudit.recordScore("demo", "find_or_create_tenant", score, 100, { tenantId, created }, { businessName })`

### Metrics

- **Demo session creation latency:** <500ms P95 (target: <300ms)
- **Demo session creation success rate:** >99% (target: 100%)
- **Slug generation uniqueness:** 100% (no collisions)
- **Tenant lookup/creation latency:** <200ms P95
- **Reflex score:** ≥0.92 for `demo.create_session`

### Failure Modes

**Primary Failure:**
- **What breaks first:** Database connection failure when creating/finding tenant
- **Alert fires:** Sentry alert `DEMO_TENANT_CREATION_FAILED` + Pino error log with `component: "demo"`, `action: "create_session_error"`
- **Recovery:** 
  1. Check DATABASE_URL environment variable
  2. Verify Supabase connection is active
  3. Check Prisma client is properly initialized
  4. Retry with exponential backoff (max 3 attempts)
  5. Return error response with helpful message

**Secondary Failure:**
- **What breaks first:** Lead payload parsing fails (invalid JSON or missing businessName)
- **Alert fires:** Sentry alert `DEMO_INVALID_LEAD_PAYLOAD` + Pino warn log
- **Recovery:**
  1. Validate lead payload structure before processing
  2. Return 400 Bad Request with specific error message
  3. Log payload structure for debugging
  4. Provide fallback businessName if missing

**Tertiary Failure:**
- **What breaks first:** Slug generation produces duplicate or invalid slug
- **Alert fires:** Pino warn log with `component: "demo"`, `action: "generate_slug"`, `warning: "duplicate_slug"`
- **Recovery:**
  1. Append timestamp or random suffix to slug if duplicate detected
  2. Validate slug format (URL-safe, length limits)
  3. Retry with modified slug

### Evidence Location

- **Sentry dashboard:** Filter by tag `component:demo` or search `demo.*`
- **Pino logs:** `grep "component.*demo" logs.json | jq '.component == "demo"'`
- **Database:** Query `Tenant` table where `name = {businessName}` to verify tenant creation
- **Database:** Query `ReflexEvent` table where `id = {leadId}` to verify `demoLink` stored in payload
- **Dashboards:** Vercel Analytics for API endpoint performance, Supabase Dashboard for database queries

---

## Definition of Done (DoD)

### Functionality ✅
- [x] Code runs without errors (Already implemented in `apps/app/app/api/admin/operator-onboarding/route.ts` lines 642-738)
- [x] Basic flow works end-to-end (create_demo_session action exists)
- [x] Edge cases handled (localhost rejection, production URL fallback)
- [ ] Tests pass (unit + integration) - **TODO: Add tests**

### Observability ✅
- [ ] **Telemetry evidence attached:**
  - [ ] Sentry links (or screenshots if no errors yet)
  - [ ] Pino log samples (JSON structure validated)
  - [ ] Trace IDs captured (for distributed tracing)
  - [ ] Dashboard screenshots (if applicable)
- [ ] **Failure mode documented:**
  - [x] What breaks first (primary failure point) - Database connection
  - [ ] What alert fires (Sentry alert name, Pino log level) - **TODO: Add Sentry instrumentation**
  - [x] Recovery procedure (rollback steps, manual fix) - Documented above
- [ ] **Signals verified:**
  - [ ] All planned telemetry events fire correctly - **TODO: Add Sentry/Pino instrumentation**
  - [ ] Log keys match schema - **TODO: Verify**
  - [ ] Metrics within thresholds - **TODO: Measure**

### Recovery ✅
- [x] Rollback procedure documented (Error handling in code)
- [ ] Rollback tested (or verified safe) - **TODO: Test error scenarios**
- [x] Known risks acknowledged (Database connection, payload parsing)
- [x] Moat value preserved (doesn't degrade trust observability)

---

## Handoff Summary

### What Changed
- Added `create_demo_session` action to `apps/app/app/api/admin/operator-onboarding/route.ts` (lines 642-738)
- Created helper functions in `apps/app/lib/demo.ts`:
  - `generateSlug()` - URL-safe slug generation
  - `generateDemoLink()` - Demo link URL generation with production URL enforcement
  - `findOrCreateDemoTenant()` - Tenant lookup/creation
  - `injectMenuDataIntoDemo()` - Menu data injection (placeholder)

### What to Test
1. **Happy Path:**
   - POST to `/api/admin/operator-onboarding` with `action: "create_demo_session"`, `leadId: "{valid_lead_id}"`
   - Verify response contains `demoLink`, `slug`, `tenantId`
   - Verify demo link format: `https://app.hookahplus.net/demo/{slug}`
   - Verify lead payload updated with `demoLink`

2. **Error Cases:**
   - Test with invalid `leadId` (should return 404)
   - Test with missing `businessName` in payload (should return 400)
   - Test with database connection failure (should return 500 with helpful message)

3. **Edge Cases:**
   - Test slug generation with special characters, long names, unicode
   - Test duplicate tenant creation (should find existing, not create duplicate)
   - Test localhost rejection (should use production URL)

### Known Risks
- Database connection failures could block demo link generation
- Payload parsing errors if lead data structure changes
- Slug collisions if business names are very similar (mitigated by timestamp suffix)
- Production URL hardcoded fallback may need environment-specific configuration

### Next Actions
- Add Sentry instrumentation for error tracking
- Add Pino structured logging throughout demo creation flow
- Add unit tests for `generateSlug()`, `generateDemoLink()`, `findOrCreateDemoTenant()`
- Add integration test for `create_demo_session` API endpoint
- Verify Reflex scoring integration

### Evidence: Proof It's Working
- **Sentry Issues:** [To be added after instrumentation]
- **Log Excerpts:** [To be added after Pino logging]
- **Dashboards:** Vercel Analytics for `/api/admin/operator-onboarding` endpoint
- **Trace IDs:** [To be added after distributed tracing setup]

### Expected Alerts
- **If it breaks, you'll see:**
  - `DEMO_TENANT_CREATION_FAILED`: Database connection error → Check DATABASE_URL → Verify Supabase connection
  - `DEMO_INVALID_LEAD_PAYLOAD`: Payload parsing error → Check lead data structure → Verify REM TrustEvent format
  - Pino error log with `component: "demo"`, `action: "create_session_error"`: General error → Check Sentry for full stack trace

---

## Review Gate Status

### Gate 1: Draft Complete ✅
- [x] Code compiles/runs without errors
- [x] Basic happy path works
- [ ] Tests pass (if applicable) - **TODO: Add tests**
- [x] No obvious bugs

**Gate Keeper:** Developer  
**Status:** [x] Complete

---

### Gate 2: Observable ✅
- [ ] **Telemetry instrumented:**
  - [ ] Sentry events fire (or test error captured) - **TODO: Add Sentry**
  - [ ] Pino logs structured (JSON format, correct keys) - **TODO: Add Pino**
  - [ ] Trace IDs captured (if applicable) - **TODO: Add tracing**
- [ ] **Failure modes documented:**
  - [x] Primary failure point identified
  - [ ] Alert name defined - **TODO: Configure Sentry alerts**
  - [x] Recovery procedure written
- [ ] **Evidence attached:**
  - [ ] Sentry links/screenshots - **TODO: After instrumentation**
  - [ ] Pino log samples - **TODO: After logging**
  - [ ] Dashboard screenshots (if applicable) - **TODO: After deployment**

**Gate Keeper:** Tech Lead / Senior Developer  
**Status:** [ ] Pending | [ ] Complete

---

### Gate 3: Ship ✅
- [ ] **Rollback verified:**
  - [x] Rollback procedure documented
  - [ ] Rollback tested (or verified safe) - **TODO: Test error scenarios**
  - [x] Previous version still works
- [ ] **Risks acknowledged:**
  - [x] Known risks documented in handoff
  - [x] Edge cases handled
  - [x] Failure modes have recovery paths
- [ ] **Moat value preserved:**
  - [ ] Doesn't degrade trust observability - **TODO: Add telemetry**
  - [ ] TelemetryService integration maintained - **TODO: Integrate**
  - [ ] Reflex scoring still works (if applicable) - **TODO: Add scoring**

**Gate Keeper:** Product Owner / Engineering Manager  
**Status:** [ ] Pending | [ ] Complete | [ ] **APPROVED FOR SHIP**

---

## Implementation Notes

**Current Implementation:**
- `create_demo_session` action is already implemented in `apps/app/app/api/admin/operator-onboarding/route.ts` (lines 642-738)
- Helper functions exist in `apps/app/lib/demo.ts`
- Demo route exists at `apps/app/app/demo/[slug]/route.ts`

**What's Missing:**
- Sentry error tracking instrumentation
- Pino structured logging
- Unit and integration tests
- Reflex scoring integration
- Sentry alert configuration

**Next Steps:**
1. Add Sentry `captureException()` calls for error cases
2. Add Pino logger calls throughout the flow
3. Write unit tests for helper functions
4. Write integration test for API endpoint
5. Configure Sentry alerts for failure modes

---

## Related Tasks

- [Test Link Email Integration](./test-link-email-integration-task-brief.md) - Depends on this task
- [Database Migration Execution](./database-migration-execution-task-brief.md) - May affect tenant creation

---

## References

- Implementation: `apps/app/app/api/admin/operator-onboarding/route.ts` (lines 642-738)
- Helper functions: `apps/app/lib/demo.ts`
- Demo route: `apps/app/app/demo/[slug]/route.ts`
- Documentation: `apps/app/ONBOARDING_NEXT_STEPS.md`
- Template: `TASK_BRIEF_TEMPLATE.md`

---

**Created:** 2025-01-27  
**Owner:** Development Team  
**Status:** [x] Draft | [ ] In Progress | [ ] Complete
