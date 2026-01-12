# Task Brief: Test Link Email Integration

**What:** Enhance the existing `send_test_link` action to automatically generate demo links if not provided, send personalized test link emails to leads, and track email delivery status. This completes the "15-minute onboarding" automation loop.

**Why:** Without automated email delivery, demo links must be manually shared, breaking the automation promise. This feature enables one-click test link delivery to leads, completing the onboarding workflow.

**Who needs what:**
- **Inputs:** Lead data (email, businessName, ownerName), demo link (auto-generated if not provided), email service configuration
- **Dependencies:** `sendTestLinkEmail()` function in `lib/email.ts`, `create_demo_session` action (Priority 1), Resend API key
- **Integrations:** Resend email service, Next.js API routes, Prisma ORM

**How it will be verified:**
- ✅ `send_test_link` action accepts `leadId` and optional `testLink` parameter
- ✅ If `testLink` not provided, automatically calls `create_demo_session` internally to generate link
- ✅ Email is sent via `sendTestLinkEmail()` with personalized content (business name, owner name, demo link)
- ✅ Lead payload is updated with `emailSentAt` timestamp after successful email delivery
- ✅ Email delivery failures are handled gracefully (demo link still stored, error returned)
- ✅ Localhost URLs are rejected and production URL is used for email links
- ✅ Leads without email addresses return success with demo link (for Instagram DM workflow)
- ✅ Reflex score ≥0.92 for `email.send_test_link` action

**When:** P0 - Critical Path (Already implemented, verification needed)

---

## Signals to Instrument

### Telemetry

**Sentry Events:**
- `email.send_test_link` - When test link email is successfully sent (tags: `leadId`, `email`, `businessName`, `demoLink`, `component: email`)
- `email.send_test_link_failed` - When email sending fails (tags: `leadId`, `email`, `errorType`, `component: email`, `action: send_test_link`)
- `email.demo_link_auto_generated` - When demo link is auto-generated during email send (tags: `leadId`, `slug`, `component: email`)
- `email.test_link_skipped_no_email` - When email skipped due to missing email address (tags: `leadId`, `component: email`)

**Pino Log Keys:**
- `{ component: "email", action: "send_test_link", leadId, email, businessName, demoLink, latency }`
- `{ component: "email", action: "send_test_link_error", leadId, email, error, errorType }`
- `{ component: "email", action: "demo_link_auto_generated", leadId, slug, demoLink }`
- `{ component: "email", action: "test_link_skipped", leadId, reason: "no_email" }`

**Reflex Scoring:**
- `reflexScoreAudit.recordScore("email", "send_test_link", score, 100, { latency, email, demoLink }, { leadId, businessName })`
- `reflexScoreAudit.recordScore("email", "demo_link_auto_generate", score, 100, { slug, latency }, { leadId })`

### Metrics

- **Email send latency:** <1s P95 (target: <500ms)
- **Email delivery success rate:** >95% (target: >98%)
- **Demo link auto-generation rate:** Track percentage of emails that require auto-generation
- **Email bounce rate:** <2% (target: <1%)
- **Reflex score:** ≥0.92 for `email.send_test_link`

### Failure Modes

**Primary Failure:**
- **What breaks first:** Resend API key not configured or email service unavailable
- **Alert fires:** Sentry alert `EMAIL_SERVICE_UNAVAILABLE` + Pino error log with `component: "email"`, `action: "send_test_link_error"`, `errorType: "service_unavailable"`
- **Recovery:**
  1. Check `RESEND_API_KEY` environment variable is set
  2. Verify Resend service status
  3. Return partial success response (demo link stored, email failed)
  4. Log error for manual follow-up
  5. Provide helpful error message to user

**Secondary Failure:**
- **What breaks first:** Invalid email address format or email address missing
- **Alert fires:** Sentry alert `EMAIL_INVALID_ADDRESS` + Pino warn log
- **Recovery:**
  1. Validate email format before sending
  2. Return success with demo link if email missing (Instagram DM workflow)
  3. Return 400 Bad Request if email format invalid
  4. Log warning for data quality review

**Tertiary Failure:**
- **What breaks first:** Demo link auto-generation fails during email send
- **Alert fires:** Sentry alert `DEMO_LINK_GENERATION_FAILED` + Pino error log
- **Recovery:**
  1. Retry demo link generation with exponential backoff
  2. Return error if retries fail
  3. Log error for manual intervention
  4. Provide fallback: return demo link generation error, allow manual link entry

### Evidence Location

- **Sentry dashboard:** Filter by tag `component:email` or search `email.*`
- **Pino logs:** `grep "component.*email" logs.json | jq '.component == "email"'`
- **Database:** Query `ReflexEvent` table where `id = {leadId}` to verify `emailSentAt` timestamp in payload
- **Resend dashboard:** Check email delivery status, bounce rate, open rate
- **Dashboards:** Vercel Analytics for API endpoint performance, Resend dashboard for email metrics

---

## Definition of Done (DoD)

### Functionality ✅
- [x] Code runs without errors (Already implemented in `apps/app/app/api/admin/operator-onboarding/route.ts` lines 490-639)
- [x] Basic flow works end-to-end (send_test_link action exists with auto-generation)
- [x] Edge cases handled (no email, localhost rejection, email service unavailable)
- [ ] Tests pass (unit + integration) - **TODO: Add tests**

### Observability ✅
- [ ] **Telemetry evidence attached:**
  - [ ] Sentry links (or screenshots if no errors yet)
  - [ ] Pino log samples (JSON structure validated)
  - [ ] Trace IDs captured (for distributed tracing)
  - [ ] Dashboard screenshots (if applicable)
- [ ] **Failure mode documented:**
  - [x] What breaks first (primary failure point) - Email service unavailable
  - [ ] What alert fires (Sentry alert name, Pino log level) - **TODO: Add Sentry instrumentation**
  - [x] Recovery procedure (rollback steps, manual fix) - Documented above
- [ ] **Signals verified:**
  - [ ] All planned telemetry events fire correctly - **TODO: Add Sentry/Pino instrumentation**
  - [ ] Log keys match schema - **TODO: Verify**
  - [ ] Metrics within thresholds - **TODO: Measure**

### Recovery ✅
- [x] Rollback procedure documented (Error handling in code, partial success responses)
- [ ] Rollback tested (or verified safe) - **TODO: Test error scenarios**
- [x] Known risks acknowledged (Email service dependency, invalid email addresses)
- [x] Moat value preserved (doesn't degrade trust observability)

---

## Handoff Summary

### What Changed
- Enhanced `send_test_link` action in `apps/app/app/api/admin/operator-onboarding/route.ts` (lines 490-639)
- Auto-generates demo link if not provided (calls `create_demo_session` internally)
- Rejects localhost URLs and forces production URL for email links
- Handles leads without email addresses (returns demo link for Instagram DM workflow)
- Updates lead payload with `emailSentAt` timestamp after successful email send
- Returns partial success if email fails but demo link is stored

### What to Test
1. **Happy Path:**
   - POST to `/api/admin/operator-onboarding` with `action: "send_test_link"`, `leadId: "{valid_lead_id}"`
   - Verify email is sent to lead's email address
   - Verify email contains personalized content (business name, owner name, demo link)
   - Verify lead payload updated with `emailSentAt` timestamp
   - Verify demo link uses production URL (not localhost)

2. **Auto-Generation:**
   - POST without `testLink` parameter
   - Verify demo link is auto-generated
   - Verify demo link is stored in lead payload
   - Verify email contains generated demo link

3. **Error Cases:**
   - Test with missing `RESEND_API_KEY` (should return partial success with demo link)
   - Test with invalid email address (should return 400 or skip email)
   - Test with missing email address (should return success with demo link for DM workflow)
   - Test with localhost URL (should be rejected and production URL used)

4. **Edge Cases:**
   - Test with very long business names (should truncate in email)
   - Test with special characters in business/owner names (should escape properly)
   - Test email delivery failure (should still store demo link)

### Known Risks
- Email service (Resend) dependency - if unavailable, emails fail but demo links still work
- Invalid email addresses in lead data - mitigated by validation and graceful handling
- Email deliverability issues (spam, bounces) - monitor Resend dashboard
- Production URL hardcoded fallback may need environment-specific configuration

### Next Actions
- Add Sentry instrumentation for error tracking
- Add Pino structured logging throughout email send flow
- Add unit tests for email template rendering
- Add integration test for `send_test_link` API endpoint
- Verify Reflex scoring integration
- Monitor Resend dashboard for delivery metrics

### Evidence: Proof It's Working
- **Sentry Issues:** [To be added after instrumentation]
- **Log Excerpts:** [To be added after Pino logging]
- **Dashboards:** Vercel Analytics for `/api/admin/operator-onboarding` endpoint, Resend dashboard for email metrics
- **Trace IDs:** [To be added after distributed tracing setup]

### Expected Alerts
- **If it breaks, you'll see:**
  - `EMAIL_SERVICE_UNAVAILABLE`: Resend API key missing or service down → Check RESEND_API_KEY → Verify Resend status
  - `EMAIL_INVALID_ADDRESS`: Invalid email format → Check lead data quality → Validate email addresses
  - `DEMO_LINK_GENERATION_FAILED`: Demo link generation failed during email send → Check database connection → Verify create_demo_session action
  - Pino error log with `component: "email"`, `action: "send_test_link_error"`: General error → Check Sentry for full stack trace

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
- `send_test_link` action is already implemented in `apps/app/app/api/admin/operator-onboarding/route.ts` (lines 490-639)
- `sendTestLinkEmail()` function exists in `apps/app/lib/email.ts`
- Auto-generation of demo links is integrated
- Localhost URL rejection is implemented
- Partial success handling for email failures is implemented

**What's Missing:**
- Sentry error tracking instrumentation
- Pino structured logging
- Unit and integration tests
- Reflex scoring integration
- Sentry alert configuration
- Email delivery metrics tracking

**Next Steps:**
1. Add Sentry `captureException()` calls for error cases
2. Add Pino logger calls throughout the email send flow
3. Write unit tests for email template rendering
4. Write integration test for API endpoint
5. Configure Sentry alerts for failure modes
6. Set up Resend dashboard monitoring

---

## Related Tasks

- [Demo Session/Test Link Generator](./demo-session-test-link-generator-task-brief.md) - Depends on this task
- [Production Environment Verification](./production-environment-verification-task-brief.md) - Email service configuration

---

## References

- Implementation: `apps/app/app/api/admin/operator-onboarding/route.ts` (lines 490-639)
- Email function: `apps/app/lib/email.ts`
- Documentation: `apps/app/ONBOARDING_NEXT_STEPS.md`
- Template: `TASK_BRIEF_TEMPLATE.md`

---

**Created:** 2025-01-27  
**Owner:** Development Team  
**Status:** [x] Draft | [ ] In Progress | [ ] Complete
