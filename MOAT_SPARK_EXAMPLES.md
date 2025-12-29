# Moat Spark Doctrine: Example Task Briefs

**Date:** 2025-01-27  
**Purpose:** Real-world examples of Task Brief v2 format for Hookah+ tasks

---

## Example 1: Guest Refill Flow Integration

### Task: Guest Refill Request → BOH/FOH NAN Workflow

**What:** Integrate guest refill requests into the BOH/FOH Night After Night workflow so refill requests appear in staff queues and can be processed end-to-end.

**Why:** Currently, guests can request refills but staff don't see them in their dashboards. This breaks the workflow and creates manual coordination overhead. Completing this enables seamless refill handling without staff needing to check multiple systems.

**Who needs what:**
- **Inputs:** Guest refill request from `SessionControls.tsx` → `POST /api/sessions/[id]/refill`
- **Dependencies:** 
  - Session state machine (must support refill status)
  - BOH dashboard (must filter/display refill requests)
  - FOH dashboard (must show refill ready for delivery)
  - WebSocket service (for real-time updates)
- **Integrations:** POS system (if refills affect billing)

**How it will be verified:**
- ✅ Guest requests refill → Session state updates to show refill request
- ✅ BOH dashboard shows refill request in queue within 2s
- ✅ BOH can mark refill as "ready" → FOH dashboard updates
- ✅ FOH can deliver refill → Session returns to ACTIVE state
- ✅ Guest tracker shows refill status updates in real-time
- ✅ No errors in console or Sentry
- ✅ Reflex score ≥0.92 for refill workflow

**When:** End of current sprint (2 weeks)

### Signals to Instrument

- **Telemetry:**
  - **Sentry events:**
    - `refill.requested` - When guest requests refill (tags: `sessionId`, `tableId`, `userId`)
    - `refill.prep_started` - When BOH claims refill prep (tags: `sessionId`, `staffId`, `role: "BOH"`)
    - `refill.ready` - When BOH marks refill ready (tags: `sessionId`, `staffId`)
    - `refill.delivered` - When FOH delivers refill (tags: `sessionId`, `staffId`, `role: "FOH"`)
    - `refill.failed` - If refill workflow breaks (tags: `sessionId`, `errorType`, `stage`)
  - **Pino log keys:**
    - `{ component: "refill", action: "request", sessionId, userId, latency }`
    - `{ component: "refill", action: "prep_claimed", sessionId, staffId, role: "BOH" }`
    - `{ component: "refill", action: "ready", sessionId, staffId }`
    - `{ component: "refill", action: "delivered", sessionId, staffId, role: "FOH" }`
  - **Reflex scoring:**
    - `reflexScoreAudit.recordScore("refill", "request", score, 100, { stage: "request" })`
    - `reflexScoreAudit.recordScore("refill", "prep", score, 100, { stage: "prep" })`
    - `reflexScoreAudit.recordScore("refill", "delivery", score, 100, { stage: "delivery" })`

- **Metrics:**
  - **Refill request latency:** <500ms (P95) from guest click to BOH queue update
  - **Refill completion time:** <15 minutes (average) from request to delivery
  - **Refill error rate:** <1% (Sentry error rate for refill events)
  - **Refill workflow completion rate:** >95% (refills that complete vs. abandoned)
  - **Reflex score:** ≥0.92 for each refill stage

- **Failure modes:**
  - **Primary failure:** WebSocket disconnection → Refill request doesn't appear in BOH queue
    - **Alert fires:** Sentry alert `REFILL_WEBSOCKET_FAILED` + Pino error log
    - **Recovery:** Fallback to polling (refresh dashboard) or manual notification
  - **Secondary failure:** Session state machine rejects refill state transition
    - **Alert fires:** Sentry alert `REFILL_STATE_TRANSITION_FAILED` + Pino error log
    - **Recovery:** Log current state, allow manual override, escalate to manager
  - **Tertiary failure:** BOH/FOH dashboard doesn't update in real-time
    - **Alert fires:** Pino warn log (no Sentry) - non-critical, user can refresh
    - **Recovery:** Auto-refresh dashboard every 5s if WebSocket disconnected

- **Evidence location:**
  - **Sentry dashboard:** Filter by tag `component:refill` or search `refill.*`
  - **Pino logs:** `grep "component.*refill" logs.json | jq '.action'`
  - **TrustGraph:** Query edges `refill_requested → refill_prep → refill_delivered`
  - **Vercel Analytics:** Track refill request → completion funnel
  - **Database:** Query `Session` table where `refillStatus IS NOT NULL`

---

## Example 2: Webhook Replay System

### Task: Create Webhook Replay Tool for POS Reconciliation Testing

**What:** Build a tool (`apps/app/tools/replayFixtures.ts`) that can replay POS webhook fixtures to test reconciliation logic, validate idempotency, and report reconciliation rates.

**Why:** Currently, testing POS reconciliation requires manual webhook triggering or waiting for real POS events. This tool enables rapid testing of reconciliation edge cases (refunds, partial payments, duplicate webhooks) and validates that the reconciliation system works correctly before production deployment.

**Who needs what:**
- **Inputs:** 
  - Webhook fixture files (JSON) in `fixtures/webhooks/`
  - POS adapter instances (Square, Toast, Clover)
- **Dependencies:**
  - POS adapter classes (`lib/pos/square.ts`, `lib/pos/toast.ts`, `lib/pos/clover.ts`)
  - Reconciliation job (`jobs/settle.ts`)
  - Database connection (to verify reconciliation results)
- **Integrations:** None (standalone testing tool)

**How it will be verified:**
- ✅ Tool can load webhook fixtures from filesystem
- ✅ Tool can replay fixtures through POS adapters
- ✅ Tool validates idempotency (replaying same webhook twice doesn't create duplicates)
- ✅ Tool reports reconciliation rate (matched vs. unmatched)
- ✅ Tool handles edge cases (refunds, partial payments, duplicate webhooks)
- ✅ Tool outputs clear test report (JSON or console)
- ✅ All tests pass (unit + integration)
- ✅ Reflex score ≥0.92 for replay tool

**When:** This week (P0 - unlocks G1 guardrail)

### Signals to Instrument

- **Telemetry:**
  - **Sentry events:**
    - `webhook.replay.started` - When replay tool starts (tags: `fixtureCount`, `posAdapter`)
    - `webhook.replay.completed` - When replay finishes (tags: `fixtureCount`, `successCount`, `failureCount`)
    - `webhook.replay.idempotency_violated` - If replay creates duplicates (tags: `webhookId`, `sessionId`)
    - `webhook.replay.reconciliation_failed` - If reconciliation fails (tags: `webhookId`, `reason`)
  - **Pino log keys:**
    - `{ component: "webhook_replay", action: "start", fixtureCount, posAdapter }`
    - `{ component: "webhook_replay", action: "replay", webhookId, sessionId, latency }`
    - `{ component: "webhook_replay", action: "reconcile", webhookId, matched, confidence }`
    - `{ component: "webhook_replay", action: "complete", totalReplayed, successRate }`
  - **Reflex scoring:**
    - `reflexScoreAudit.recordScore("webhook_replay", "idempotency", score, 100)`
    - `reflexScoreAudit.recordScore("webhook_replay", "reconciliation", score, 100)`

- **Metrics:**
  - **Replay success rate:** 100% (all fixtures replay without errors)
  - **Idempotency rate:** 100% (no duplicates created on replay)
  - **Reconciliation rate:** ≥95% (matched webhooks / total webhooks)
  - **Replay latency:** <2s per webhook (P95)
  - **Reflex score:** ≥0.92 for replay tool

- **Failure modes:**
  - **Primary failure:** Fixture file not found or malformed JSON
    - **Alert fires:** Pino error log (no Sentry) - tool should fail fast with clear error
    - **Recovery:** Validate fixtures before replay, provide clear error message
  - **Secondary failure:** POS adapter throws error during replay
    - **Alert fires:** Sentry alert `WEBHOOK_REPLAY_ADAPTER_ERROR` + Pino error log
    - **Recovery:** Skip failed webhook, continue with others, report failures in summary
  - **Tertiary failure:** Reconciliation logic fails (matches wrong session/payment)
    - **Alert fires:** Sentry alert `WEBHOOK_REPLAY_RECONCILIATION_FAILED` + Pino error log
    - **Recovery:** Log mismatch details, allow manual review, don't block other replays

- **Evidence location:**
  - **Sentry dashboard:** Filter by tag `component:webhook_replay`
  - **Pino logs:** `grep "component.*webhook_replay" logs.json`
  - **Test report:** JSON file output (e.g., `replay-report-2025-01-27.json`)
  - **Console output:** Human-readable summary with reconciliation stats
  - **Database:** Query reconciliation results after replay (verify matches)

---

## Example 3: POS Reconciliation Metrics Dashboard

### Task: Create Reconciliation Dashboard with Alerts

**What:** Build a dashboard that tracks POS reconciliation rate over time, alerts when reconciliation rate drops below 95%, and sets `POS_SYNC_READY = true` when rate ≥ 95% (unlocks G1 guardrail).

**Why:** Currently, reconciliation success is only visible through manual testing. This dashboard provides real-time visibility into reconciliation health and automatically unlocks G1 when the system proves reliable. This is critical for production readiness.

**Who needs what:**
- **Inputs:** 
  - Reconciliation job results (`jobs/settle.ts`)
  - POS webhook events (Square, Toast, Clover)
  - Session/payment data from database
- **Dependencies:**
  - Reconciliation job (must emit metrics)
  - Database (to store reconciliation history)
  - Feature flags system (`lib/feature-flags.ts` - to set `POS_SYNC_READY`)
- **Integrations:** 
  - Sentry (for alerts)
  - Pino (for logging)
  - Vercel Analytics (for dashboard views)

**How it will be verified:**
- ✅ Dashboard displays reconciliation rate (current + historical trend)
- ✅ Dashboard shows reconciliation breakdown (matched, unmatched, confidence levels)
- ✅ Alert fires when reconciliation rate < 95% for 5+ minutes
- ✅ `POS_SYNC_READY` flag automatically set to `true` when rate ≥ 95% for 1+ hour
- ✅ Dashboard updates in real-time (WebSocket or polling)
- ✅ Historical data persists (last 30 days minimum)
- ✅ Reflex score ≥0.92 for dashboard

**When:** End of week (P0 - unlocks G1)

### Signals to Instrument

- **Telemetry:**
  - **Sentry events:**
    - `reconciliation.rate.calculated` - When reconciliation rate is calculated (tags: `rate`, `matchedCount`, `totalCount`, `posAdapter`)
    - `reconciliation.rate.low` - When rate drops below 95% (tags: `rate`, `duration`, `posAdapter`)
    - `reconciliation.g1.unlocked` - When `POS_SYNC_READY` is set to `true` (tags: `rate`, `duration`, `posAdapter`)
    - `reconciliation.g1.locked` - When `POS_SYNC_READY` is set to `false` (tags: `rate`, `reason`)
  - **Pino log keys:**
    - `{ component: "reconciliation", action: "calculate_rate", rate, matchedCount, totalCount, posAdapter }`
    - `{ component: "reconciliation", action: "alert_low_rate", rate, threshold: 0.95, duration }`
    - `{ component: "reconciliation", action: "g1_unlock", rate, duration, posAdapter }`
    - `{ component: "reconciliation", action: "g1_lock", rate, reason }`
  - **Reflex scoring:**
    - `reflexScoreAudit.recordScore("reconciliation", "rate_calculation", score, 100, { rate })`
    - `reflexScoreAudit.recordScore("reconciliation", "g1_unlock", score, 100, { rate, duration })`

- **Metrics:**
  - **Reconciliation rate:** ≥95% (target threshold for G1 unlock)
  - **Dashboard load time:** <1s (P95)
  - **Alert latency:** <30s (time from rate drop to alert)
  - **G1 unlock accuracy:** 100% (flag only set when rate truly ≥95% for 1+ hour)
  - **Reflex score:** ≥0.92 for dashboard

- **Failure modes:**
  - **Primary failure:** Reconciliation job doesn't run or fails silently
    - **Alert fires:** Sentry alert `RECONCILIATION_JOB_FAILED` + Pino error log
    - **Recovery:** Retry job, check cron schedule, verify database connection
  - **Secondary failure:** Dashboard shows stale data (not updating)
    - **Alert fires:** Pino warn log (no Sentry) - non-critical, user can refresh
    - **Recovery:** Auto-refresh dashboard, check WebSocket connection, fallback to polling
  - **Tertiary failure:** `POS_SYNC_READY` flag set incorrectly (false positive/negative)
    - **Alert fires:** Sentry alert `RECONCILIATION_G1_FLAG_ERROR` + Pino error log
    - **Recovery:** Manual override via feature flags UI, investigate rate calculation logic

- **Evidence location:**
  - **Sentry dashboard:** Filter by tag `component:reconciliation` or search `reconciliation.*`
  - **Pino logs:** `grep "component.*reconciliation" logs.json | jq '.rate'`
  - **Dashboard UI:** `/dashboard/reconciliation` (real-time metrics)
  - **Database:** Query `ReconciliationHistory` table (if exists) or `Session` table with reconciliation metadata
  - **Feature flags:** Check `POS_SYNC_READY` flag status in `lib/feature-flags.ts`
  - **Vercel Analytics:** Track dashboard page views and user interactions

---

## Example 4: Edge Case Reporting Modal

### Task: Create ReportEdgeCaseModal for Staff Issue Reporting

**What:** Build a modal component (`components/ReportEdgeCaseModal.tsx`) that allows staff (BOH, FOH, MANAGER, ADMIN) to report edge cases from session cards, with severity levels and escalation to managers.

**Why:** Currently, staff encounter issues but have no systematic way to report them. This creates ad-hoc communication and delays resolution. This modal provides a structured way to capture issues, route them to managers, and track resolution.

**Who needs what:**
- **Inputs:** 
  - Session context (from session card)
  - User role (BOH, FOH, MANAGER, ADMIN)
  - Edge case type selection
- **Dependencies:**
  - Edge case API (`/api/edge`)
  - Session state machine (to update `edgeCase` field)
  - Manager dashboard (to display edge cases)
- **Integrations:** 
  - WebSocket service (for real-time manager notifications)
  - Email/SMS (for escalation alerts, if configured)

**How it will be verified:**
- ✅ Modal opens when "Report Issue" button clicked on session card
- ✅ Modal shows edge case type dropdown (EQUIPMENT_ISSUE, CUSTOMER_COMPLAINT, etc.)
- ✅ Modal shows severity selector (LOW, MEDIUM, HIGH, CRITICAL)
- ✅ Modal submits to `/api/edge` and updates session state
- ✅ Manager dashboard shows edge case within 2s
- ✅ Edge case appears in manager queue with correct severity
- ✅ Manager can resolve edge case
- ✅ Reflex score ≥0.92 for edge case reporting

**When:** This sprint (2 weeks)

### Signals to Instrument

- **Telemetry:**
  - **Sentry events:**
    - `edge_case.reported` - When staff reports edge case (tags: `sessionId`, `type`, `severity`, `reporterRole`)
    - `edge_case.escalated` - When edge case escalated to manager (tags: `sessionId`, `type`, `severity`, `escalationReason`)
    - `edge_case.resolved` - When manager resolves edge case (tags: `sessionId`, `type`, `resolutionTime`)
    - `edge_case.failed` - If edge case reporting fails (tags: `sessionId`, `errorType`)
  - **Pino log keys:**
    - `{ component: "edge_case", action: "report", sessionId, type, severity, reporterRole, latency }`
    - `{ component: "edge_case", action: "escalate", sessionId, type, severity, escalationReason }`
    - `{ component: "edge_case", action: "resolve", sessionId, type, resolutionTime, resolverRole }`
  - **Reflex scoring:**
    - `reflexScoreAudit.recordScore("edge_case", "report", score, 100, { type, severity })`
    - `reflexScoreAudit.recordScore("edge_case", "resolution", score, 100, { resolutionTime })`

- **Metrics:**
  - **Edge case report latency:** <500ms (P95) from submit to manager dashboard update
  - **Edge case resolution time:** <30 minutes (average) for HIGH/CRITICAL, <2 hours for LOW/MEDIUM
  - **Edge case error rate:** <1% (Sentry error rate for edge case events)
  - **Manager notification latency:** <5s (time from report to manager dashboard update)
  - **Reflex score:** ≥0.92 for edge case reporting

- **Failure modes:**
  - **Primary failure:** API endpoint `/api/edge` fails or times out
    - **Alert fires:** Sentry alert `EDGE_CASE_API_FAILED` + Pino error log
    - **Recovery:** Retry submission, show error message to user, allow manual escalation
  - **Secondary failure:** Manager dashboard doesn't show edge case (WebSocket/state sync issue)
    - **Alert fires:** Pino warn log (no Sentry) - non-critical, manager can refresh
    - **Recovery:** Auto-refresh manager dashboard, check WebSocket connection, fallback to polling
  - **Tertiary failure:** Edge case type/severity not saved correctly
    - **Alert fires:** Sentry alert `EDGE_CASE_DATA_CORRUPTION` + Pino error log
    - **Recovery:** Validate data before save, log validation errors, allow manual correction

- **Evidence location:**
  - **Sentry dashboard:** Filter by tag `component:edge_case` or search `edge_case.*`
  - **Pino logs:** `grep "component.*edge_case" logs.json | jq '.type, .severity'`
  - **Manager dashboard:** `/dashboard/manager` (edge cases queue)
  - **Database:** Query `Session` table where `edgeCase IS NOT NULL` or `EdgeCase` table (if exists)
  - **TrustGraph:** Query edges `edge_case_reported → edge_case_resolved`

---

## 📊 Comparison: Old vs. New Task Brief Format

### Old Format (Missing Observability)
```markdown
## Task: Guest Refill Flow Integration

**What:** Integrate guest refill requests into BOH/FOH workflow.

**Why:** Staff don't see refill requests in their dashboards.

**How it will be verified:**
- Guest requests refill
- BOH sees refill request
- FOH delivers refill
```

### New Format (v2 - With Observability)
```markdown
## Task: Guest Refill Flow Integration

**What:** [Same]

**Why:** [Same]

**How it will be verified:**
- [Same acceptance criteria]

### Signals to Instrument
- **Telemetry:** Sentry events, Pino log keys, Reflex scoring
- **Metrics:** Latency, error rate, completion rate, Reflex score
- **Failure modes:** What breaks first, what alert fires, how to recover
- **Evidence location:** Where to find proof it's working
```

**Key Difference:** v2 format ensures every task ships with **built-in observability**, not bolted-on later.

---

**Status:** ✅ Ready to Use  
**Last Updated:** 2025-01-27

