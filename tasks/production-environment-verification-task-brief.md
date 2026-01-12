# Task Brief: Production Environment Verification

**What:** Verify all production environment variables in Vercel, test Stripe webhook setup, verify database connection, test $1 live transaction flow, and validate production deployment health. This ensures task briefs can be executed in production.

**Why:** Without verified production environment, task briefs are theoretical only. Production verification ensures all systems are properly configured and working, enabling real-world task execution.

**Who needs what:**
- **Inputs:** Vercel dashboard access, Stripe dashboard access, Supabase dashboard access, environment variable list
- **Dependencies:** Production deployment, Stripe account, Supabase database, Vercel project
- **Integrations:** Vercel, Stripe, Supabase, production application

**How it will be verified:**
- ✅ All required environment variables are set in Vercel production environment
- ✅ Stripe webhook endpoint exists and is configured correctly
- ✅ Stripe webhook secret matches Vercel environment variable
- ✅ Database connection works in production (DATABASE_URL configured)
- ✅ $1 live transaction test completes successfully
- ✅ Production deployment is healthy (builds succeed, no critical errors)
- ✅ All API endpoints respond correctly in production

**When:** P1 - Readiness (Can be done in parallel with other tasks)

---

## Signals to Instrument

### Telemetry

**Sentry Events:**
- `production.verification.start` - When production verification starts (tags: `environment`, `component: production`)
- `production.verification.env_vars` - When environment variables are verified (tags: `missingVars`, `component: production`)
- `production.verification.stripe_webhook` - When Stripe webhook is verified (tags: `webhookUrl`, `exists: boolean`, `component: production`)
- `production.verification.database` - When database connection is verified (tags: `connected: boolean`, `component: production`)
- `production.verification.transaction` - When $1 transaction test runs (tags: `success: boolean`, `transactionId`, `component: production`)
- `production.verification.complete` - When verification completes (tags: `success: boolean`, `failures`, `component: production`)

**Pino Log Keys:**
- `{ component: "production", action: "verification_start", environment }`
- `{ component: "production", action: "verification_env_vars", missingVars, totalVars }`
- `{ component: "production", action: "verification_stripe_webhook", webhookUrl, exists }`
- `{ component: "production", action: "verification_database", connected, latency }`
- `{ component: "production", action: "verification_transaction", success, transactionId }`
- `{ component: "production", action: "verification_complete", success, failures }`

**Reflex Scoring:**
- `reflexScoreAudit.recordScore("production", "verification", score, 100, { success, failures }, { environment })`

### Metrics

- **Verification completion time:** <5 minutes (target: <2 minutes)
- **Environment variable completeness:** 100% (target: 100%)
- **Stripe webhook configuration success:** 100% (target: 100%)
- **Database connection success:** 100% (target: 100%)
- **Transaction test success:** 100% (target: 100%)
- **Reflex score:** ≥0.92 for `production.verification`

### Failure Modes

**Primary Failure:**
- **What breaks first:** Missing critical environment variables (DATABASE_URL, STRIPE_SECRET_KEY, etc.)
- **Alert fires:** Sentry alert `PRODUCTION_ENV_VARS_MISSING` + Pino error log with `component: "production"`, `action: "verification_env_vars"`, `errorType: "missing_vars"`
- **Recovery:**
  1. Review `.env.example` or environment variable template
  2. Add missing variables to Vercel production environment
  3. Redeploy application to pick up new variables
  4. Re-run verification

**Secondary Failure:**
- **What breaks first:** Stripe webhook not configured or webhook secret mismatch
- **Alert fires:** Sentry alert `STRIPE_WEBHOOK_MISCONFIGURED` + Pino error log
- **Recovery:**
  1. Go to Stripe dashboard → Webhooks
  2. Verify webhook endpoint exists: `https://hookahplus.net/api/webhooks/stripe`
  3. Verify webhook secret matches Vercel `STRIPE_WEBHOOK_SECRET`
  4. Update webhook secret in Vercel if mismatch
  5. Test webhook with Stripe CLI or dashboard

**Tertiary Failure:**
- **What breaks first:** Database connection fails in production
- **Alert fires:** Sentry alert `PRODUCTION_DATABASE_CONNECTION_FAILED` + Pino error log
- **Recovery:**
  1. Check `DATABASE_URL` in Vercel environment variables
  2. Verify Supabase database is running and accessible
  3. Check database connection pool settings
  4. Test connection from Vercel deployment
  5. Update `DATABASE_URL` if incorrect

### Evidence Location

- **Sentry dashboard:** Filter by tag `component:production` or search `production.*`
- **Pino logs:** `grep "component.*production" logs.json | jq '.component == "production"'`
- **Vercel Dashboard:** Environment variables, deployment logs, function logs
- **Stripe Dashboard:** Webhooks configuration, transaction history
- **Supabase Dashboard:** Database connection status, query logs
- **Dashboards:** Vercel Analytics, production application health checks

---

## Definition of Done (DoD)

### Functionality ✅
- [ ] All environment variables verified in Vercel
- [ ] Stripe webhook configured and tested
- [ ] Database connection verified
- [ ] $1 transaction test passes
- [ ] Production deployment healthy

### Observability ✅
- [ ] **Telemetry evidence attached:**
  - [ ] Sentry links (or screenshots if no errors yet)
  - [ ] Pino log samples (JSON structure validated)
  - [ ] Vercel dashboard screenshots
  - [ ] Stripe dashboard screenshots
- [ ] **Failure mode documented:**
  - [x] What breaks first (primary failure point) - Missing environment variables
  - [ ] What alert fires (Sentry alert name, Pino log level) - **TODO: Add Sentry instrumentation**
  - [x] Recovery procedure (rollback steps, manual fix) - Documented above
- [ ] **Signals verified:**
  - [ ] All planned telemetry events fire correctly - **TODO: Add Sentry/Pino instrumentation**
  - [ ] Log keys match schema - **TODO: Verify**
  - [ ] Metrics within thresholds - **TODO: Measure**

### Recovery ✅
- [x] Rollback procedure documented (Environment variables can be updated, webhooks can be reconfigured)
- [ ] Rollback tested (or verified safe) - **TODO: Test environment variable updates**
- [x] Known risks acknowledged (Missing variables, webhook misconfiguration, database connection)
- [x] Moat value preserved (doesn't degrade trust observability)

---

## Handoff Summary

### What Changed
- Created production environment verification checklist
- Documented verification steps for all critical systems
- Created task brief for production verification

### What to Test
1. **Environment Variables:**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Verify all required variables are set (see checklist below)
   - Verify variables are set for "Production" environment
   - Test that variables are accessible in production code

2. **Stripe Webhook:**
   - Go to Stripe Dashboard → Webhooks
   - Verify webhook endpoint exists: `https://hookahplus.net/api/webhooks/stripe`
   - Verify webhook secret matches Vercel `STRIPE_WEBHOOK_SECRET`
   - Test webhook with Stripe CLI or dashboard test button

3. **Database Connection:**
   - Verify `DATABASE_URL` is set in Vercel
   - Test database connection from production deployment
   - Verify Supabase database is accessible
   - Test a simple query from production

4. **$1 Transaction Test:**
   - Visit production URL: `https://hookahplus.net/preorder/T-001`
   - Complete $1 test transaction
   - Verify payment processes successfully
   - Verify webhook receives payment event

5. **Production Health:**
   - Check Vercel deployment status (should be "Ready")
   - Check for build errors or warnings
   - Test API endpoints in production
   - Check Sentry for production errors

### Known Risks
- Environment variables may be missing or incorrect
- Stripe webhook may not be configured or secret may mismatch
- Database connection may fail if `DATABASE_URL` is incorrect
- Production deployment may have build errors

### Next Actions
1. **Verify Environment Variables:**
   - Check Vercel Dashboard for all required variables
   - Compare with `.env.example` or environment variable template
   - Add missing variables if needed
   - Redeploy if variables were added

2. **Verify Stripe Webhook:**
   - Go to Stripe Dashboard → Webhooks
   - Check if webhook endpoint exists
   - Verify webhook secret matches Vercel
   - Test webhook if needed

3. **Verify Database Connection:**
   - Check `DATABASE_URL` in Vercel
   - Test connection from production
   - Verify Supabase database is accessible

4. **Test $1 Transaction:**
   - Visit production URL
   - Complete test transaction
   - Verify payment and webhook work

5. **Verify Production Health:**
   - Check Vercel deployment status
   - Test API endpoints
   - Check Sentry for errors

### Evidence: Proof It's Working
- **Sentry Issues:** [To be added after instrumentation]
- **Log Excerpts:** [To be added after Pino logging]
- **Dashboards:** Vercel Dashboard screenshots, Stripe Dashboard screenshots, Supabase Dashboard screenshots
- **Trace IDs:** [To be added after distributed tracing setup]

### Expected Alerts
- **If it breaks, you'll see:**
  - `PRODUCTION_ENV_VARS_MISSING`: Missing environment variables → Check Vercel Dashboard → Add missing variables → Redeploy
  - `STRIPE_WEBHOOK_MISCONFIGURED`: Webhook not configured or secret mismatch → Check Stripe Dashboard → Configure webhook → Update secret in Vercel
  - `PRODUCTION_DATABASE_CONNECTION_FAILED`: Database connection fails → Check DATABASE_URL → Verify Supabase → Test connection
  - Pino error log with `component: "production"`, `action: "verification_error"`: General error → Check Sentry for full stack trace

---

## Review Gate Status

### Gate 1: Draft Complete ✅
- [x] Verification checklist prepared
- [ ] Environment variables verified - **TODO: Verify in Vercel**
- [ ] Stripe webhook verified - **TODO: Verify in Stripe**
- [ ] Database connection verified - **TODO: Verify connection**
- [ ] Transaction test passed - **TODO: Test transaction**

**Gate Keeper:** Developer  
**Status:** [ ] Pending | [ ] Complete

---

### Gate 2: Observable ✅
- [ ] **Telemetry instrumented:**
  - [ ] Sentry events fire (or test error captured) - **TODO: Add Sentry**
  - [ ] Pino logs structured (JSON format, correct keys) - **TODO: Add Pino**
  - [ ] Dashboard screenshots - **TODO: Add screenshots**
- [ ] **Failure modes documented:**
  - [x] Primary failure point identified
  - [ ] Alert name defined - **TODO: Configure Sentry alerts**
  - [x] Recovery procedure written
- [ ] **Evidence attached:**
  - [ ] Sentry links/screenshots - **TODO: After instrumentation**
  - [ ] Pino log samples - **TODO: After logging**
  - [ ] Dashboard screenshots - **TODO: After verification**

**Gate Keeper:** Tech Lead / Senior Developer  
**Status:** [ ] Pending | [ ] Complete

---

### Gate 3: Ship ✅
- [ ] **Rollback verified:**
  - [x] Rollback procedure documented (Variables can be updated, webhooks reconfigured)
  - [ ] Rollback tested (or verified safe) - **TODO: Test variable updates**
  - [x] Previous version still works
- [ ] **Risks acknowledged:**
  - [x] Known risks documented in handoff
  - [x] Edge cases handled
  - [x] Failure modes have recovery paths
- [ ] **Moat value preserved:**
  - [ ] Doesn't degrade trust observability - **TODO: Add telemetry**
  - [ ] Production environment maintained - **TODO: Verify**
  - [ ] All systems operational - **TODO: Verify**

**Gate Keeper:** Product Owner / Engineering Manager  
**Status:** [ ] Pending | [ ] Complete | [ ] **APPROVED FOR SHIP**

---

## Implementation Notes

**Required Environment Variables (Checklist):**
- `DATABASE_URL` - Supabase database connection string
- `STRIPE_SECRET_KEY` - Stripe secret key (live)
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Stripe publishable key (live)
- `NEXT_PUBLIC_APP_URL` - Production app URL
- `NEXT_PUBLIC_GUEST_URL` - Guest app URL
- `SUPABASE_URL` - Supabase project URL
- Supabase service role key (environment variable)
- Supabase anonymous key (environment variable)
- `RESEND_API_KEY` - Resend email API key (if email sending enabled)
- `SENTRY_DSN` - Sentry DSN (if error tracking enabled)

**Verification Steps:**
1. Vercel Dashboard → Project → Settings → Environment Variables
2. Stripe Dashboard → Webhooks → Verify endpoint and secret
3. Supabase Dashboard → Database → Test connection
4. Production URL → Test $1 transaction
5. Vercel Dashboard → Deployments → Check build status

**Next Steps:**
1. Create verification script or checklist
2. Add Sentry instrumentation for verification
3. Add Pino structured logging
4. Set up automated verification (if applicable)

---

## Related Tasks

- [Database Migration Execution](./database-migration-execution-task-brief.md) - Database connection verification
- [Agent Coordination Infrastructure](./agent-coordination-infrastructure-task-brief.md) - May need environment access

---

## References

- Environment template: `apps/app/.env.example`
- Webhook handler: `apps/app/app/api/webhooks/stripe/route.ts`
- Documentation: `apps/app/docs/GO_LIVE_READINESS.md`
- Template: `TASK_BRIEF_TEMPLATE.md`

---

**Created:** 2025-01-27  
**Owner:** deployment_agent / Development Team  
**Status:** [x] Draft | [ ] In Progress | [ ] Complete
