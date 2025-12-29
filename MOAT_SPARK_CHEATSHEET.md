# Moat Spark Doctrine: Quick Reference Cheat Sheet

**Version:** 1.0  
**Last Updated:** 2025-01-27  
**Purpose:** One-page reference for Trust Observability framework

---

## 🎯 Core Principle

**Moat Spark = "Trust Observability as a portable system."**

Every task ships with **instrumentation → diagnosis → feedback → repair → confidence** built-in.

---

## 📋 The 4 Scaffolds (Quick Reference)

### 1. Task Brief v2: Add "Signals to Instrument"

**Required Section:**
```markdown
### Signals to Instrument
- **Telemetry:** [Sentry events, Pino log keys, Reflex scoring]
- **Metrics:** [Latency, error rate, completion rate, Reflex score thresholds]
- **Failure modes:** [What breaks first + alert name + recovery steps]
- **Evidence location:** [Sentry dashboard, Pino logs, TrustGraph, database queries]
```

**Quick Checklist:**
- [ ] Sentry events defined (with tags)
- [ ] Pino log keys defined (component, action, context)
- [ ] Reflex scoring points identified
- [ ] Metrics thresholds set (<500ms latency, <1% error rate, ≥0.92 Reflex score)
- [ ] Primary failure mode documented
- [ ] Alert names defined
- [ ] Recovery procedure written

---

### 2. DoD v2: Add "Telemetry Evidence" + "Failure Mode"

**Required Sections:**
```markdown
### Observability ✅
- [ ] **Telemetry evidence attached:**
  - [ ] Sentry links/screenshots
  - [ ] Pino log samples (JSON validated)
  - [ ] Trace IDs captured
  - [ ] Dashboard screenshots (if applicable)
- [ ] **Failure mode documented:**
  - [ ] Primary failure point identified
  - [ ] Alert name defined
  - [ ] Recovery procedure written
- [ ] **Signals verified:**
  - [ ] All telemetry events fire correctly
  - [ ] Log keys match schema
  - [ ] Metrics within thresholds
```

**Quick Checklist:**
- [ ] Sentry test error captured (or screenshot if no errors)
- [ ] Pino log sample attached (JSON format)
- [ ] Failure mode documented
- [ ] Recovery procedure tested (or verified safe)

---

### 3. Handoff v2: Add "Evidence" + "Expected Alerts"

**Required Sections:**
```markdown
### Evidence: Proof It's Working
- **Sentry Issues:** [Links to relevant issues/dashboards]
- **Log Excerpts:** [Sample Pino logs]
- **Dashboards:** [Links to monitoring dashboards]
- **Trace IDs:** [Example trace IDs]

### Expected Alerts
- **If it breaks, you'll see:**
  - [Alert name]: [What it means] → [Where to look] → [How to fix]
```

**Quick Checklist:**
- [ ] Sentry links included
- [ ] Pino log samples included
- [ ] Dashboard links included
- [ ] Expected alerts documented (name, meaning, location, fix)

---

### 4. Review Gate v2: 3 Gates

**Gate 1: Draft Complete** (Developer)
- [ ] Code runs
- [ ] Basic flow works
- [ ] Tests pass

**Gate 2: Observable** (Tech Lead)
- [ ] Telemetry instrumented (Sentry, Pino, Reflex)
- [ ] Failure modes documented
- [ ] Evidence attached

**Gate 3: Ship** (Product Owner)
- [ ] Rollback verified
- [ ] Risks acknowledged
- [ ] Moat value preserved

---

## 🔧 Common Telemetry Patterns

### Sentry Event Pattern
```typescript
Sentry.captureException(error, {
  tags: {
    component: "session",      // Component name
    action: "create",          // Action name
    environment: "production",  // Environment
  },
  extra: {
    sessionId: "sess_123",      // Context data
    userId: "user_456",
  },
});
```

### Pino Log Pattern
```typescript
logger.info('Session created', {
  component: "session",
  action: "create",
  sessionId: "sess_123",
  latency: 234,
  requestId: "req_abc",
});
```

### Reflex Score Pattern
```typescript
reflexScoreAudit.recordScore(
  "session",           // Component
  "create",            // Action
  0.94,                // Score (0-1)
  100,                 // Max score
  { latency: 234 },     // Additional data
  { sessionId: "sess_123" } // Metadata
);
```

---

## 📊 Standard Metrics Thresholds

| Metric | Target | Critical |
|--------|--------|----------|
| API Latency (P95) | <500ms | >2s |
| Error Rate | <1% | >5% |
| Reflex Score | ≥0.92 | <0.87 |
| Database Query Time | <200ms | >1s |
| WebSocket Reconnect | <5s | >30s |

---

## 🚨 Common Failure Modes

### Database Connection
- **Alert:** `DB_CONNECTION_TIMEOUT`
- **Location:** Sentry dashboard
- **Fix:** Check connection pool, retry with exponential backoff

### WebSocket Disconnect
- **Alert:** `WEBSOCKET_DISCONNECTED`
- **Location:** Pino logs (warn level)
- **Fix:** Auto-reconnect, fallback to polling

### API Timeout
- **Alert:** `API_TIMEOUT`
- **Location:** Sentry dashboard
- **Fix:** Increase timeout, check upstream service

### State Machine Transition
- **Alert:** `STATE_TRANSITION_FAILED`
- **Location:** Sentry dashboard
- **Fix:** Log current state, allow manual override

---

## 🔍 Evidence Location Quick Reference

| Evidence Type | Where to Find |
|---------------|---------------|
| Sentry Events | `https://sentry.io/projects/[project]/` → Filter by tags |
| Pino Logs | `grep "component.*[name]" logs.json \| jq` |
| TrustGraph | Query edges in `reflex_memory/TrustGraph.yaml` |
| Database | Query relevant tables (Session, Payment, etc.) |
| Dashboards | Vercel Analytics, Supabase Dashboard |
| Trace IDs | Sentry context, Pino logs, request headers |

---

## 📝 Quick Copy-Paste Templates

### Task Brief "Signals" Section
```markdown
### Signals to Instrument
- **Telemetry:**
  - Sentry: `[component].[action]` event (tags: `[tag1]`, `[tag2]`)
  - Pino: `{ component: "[component]", action: "[action]", [context] }`
  - Reflex: `reflexScoreAudit.recordScore("[component]", "[action]", score, 100)`
- **Metrics:**
  - Latency: <[X]ms (P95)
  - Error rate: <[X]%
  - Reflex score: ≥0.92
- **Failure modes:**
  - Primary: [What breaks] → Alert: `[ALERT_NAME]` → Fix: [Steps]
- **Evidence location:**
  - Sentry: Filter by tag `component:[component]`
  - Pino: `grep "component.*[component]" logs.json`
```

### DoD "Observability" Section
```markdown
### Observability ✅
- [x] **Telemetry evidence attached:**
  - [x] Sentry: [Link or screenshot]
  - [x] Pino: [Log sample]
  - [x] Trace ID: [ID]
- [x] **Failure mode documented:**
  - [x] Primary failure: [Description]
  - [x] Alert: `[ALERT_NAME]`
  - [x] Recovery: [Steps]
```

### Handoff "Evidence" Section
```markdown
### Evidence: Proof It's Working
- **Sentry:** [Link to dashboard/issue]
- **Logs:** [Sample Pino log]
- **Dashboard:** [Link to monitoring dashboard]
- **Trace ID:** [Example trace ID]

### Expected Alerts
- `[ALERT_NAME]`: [Meaning] → Sentry dashboard → [Fix steps]
```

---

## 🎯 Delegation Buckets (Quick Reference)

### Bucket A (Prep): "Make it Legible"
- Sentry/Pino instrumentation plans
- Failure-mode catalogs
- QA scripts + bug reproduction packs
- Log schema definitions

### Bucket B (Build): "Make it Repeatable"
- Log schemas + Sentry breadcrumbs
- Smoke tests
- Deploy verification scripts
- TelemetryService integration templates

### Bucket C (Ops): "Make it Durable"
- Moat Pulse evidence gathering
- Release notes with observability deltas
- Backlog grooming (ready-to-run + instrumented)
- Alert runbooks

---

## ✅ Pre-Ship Checklist

Before marking any task as "Done":

- [ ] Task Brief includes "Signals to Instrument"
- [ ] DoD includes "Telemetry Evidence" and "Failure Mode"
- [ ] Handoff includes "Evidence" and "Expected Alerts"
- [ ] All 3 review gates passed (Draft Complete → Observable → Ship)
- [ ] Sentry events fire correctly (or test error captured)
- [ ] Pino logs structured correctly (JSON validated)
- [ ] Reflex score ≥0.92
- [ ] Rollback procedure documented and tested
- [ ] Moat value preserved (doesn't degrade trust observability)

---

## 🔄 Trust Observability Flywheel

```
Instrument → Diagnose → Feedback → Repair → Confidence
     ↑                                              ↓
     └──────────────────────────────────────────────┘
```

**Remember:** Every task ships with observability built-in, not bolted-on.

---

**Quick Links:**
- Full Doctrine: `MOAT_SPARK_DOCTRINE.md`
- Task Template: `TASK_BRIEF_TEMPLATE.md`
- Examples: `MOAT_SPARK_EXAMPLES.md`

**Status:** ✅ Active Reference  
**Last Updated:** 2025-01-27

