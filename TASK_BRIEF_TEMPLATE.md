# Task Brief Template (Moat Spark Doctrine v2)

**Copy this template for every new task. Fill in the sections below.**

---

## Task: [Task Name]

**What:** [Clear description of what needs to be done - 1-2 sentences]

**Why:** [Outcome/impact - why this matters - 1-2 sentences]

**Who needs what:**
- **Inputs:** [What data/components are needed as input]
- **Dependencies:** [What systems/components must exist first]
- **Integrations:** [External systems or services that need to connect]

**How it will be verified:**
- ✅ [Acceptance criterion 1 - specific and testable]
- ✅ [Acceptance criterion 2 - specific and testable]
- ✅ [Acceptance criterion 3 - specific and testable]
- ✅ [Add more as needed]
- ✅ Reflex score ≥0.92 for [component/action]

**When:** [Cadence/deadline - e.g., "End of sprint", "This week", "P0 - Critical Path"]

---

## Signals to Instrument

### Telemetry

**Sentry Events:**
- `[component].[action]` - [When this fires] (tags: `[tag1]`, `[tag2]`, `[tag3]`)
- `[component].[action]_failed` - [When this fires] (tags: `[tag1]`, `[tag2]`, `errorType`)
- [Add more events as needed]

**Pino Log Keys:**
- `{ component: "[component]", action: "[action]", [contextKey1], [contextKey2], latency }`
- `{ component: "[component]", action: "[action]_error", error, [contextKey1] }`
- [Add more log keys as needed]

**Reflex Scoring:**
- `reflexScoreAudit.recordScore("[component]", "[action]", score, 100, { [additionalData] }, { [metadata] })`
- [Add more scoring points as needed]

### Metrics

- **[Metric name]:** [Target threshold] (e.g., <500ms P95, <1% error rate, ≥0.92 Reflex score)
- **[Metric name]:** [Target threshold]
- [Add more metrics as needed]

### Failure Modes

**Primary Failure:**
- **What breaks first:** [Description of primary failure point]
- **Alert fires:** Sentry alert `[ALERT_NAME]` + Pino error log
- **Recovery:** [Step-by-step recovery procedure]

**Secondary Failure:**
- **What breaks first:** [Description of secondary failure point]
- **Alert fires:** [Alert name or Pino warn log]
- **Recovery:** [Step-by-step recovery procedure]

**Tertiary Failure:**
- **What breaks first:** [Description of tertiary failure point]
- **Alert fires:** [Alert name or log level]
- **Recovery:** [Step-by-step recovery procedure]

### Evidence Location

- **Sentry dashboard:** Filter by tag `component:[component]` or search `[component].*`
- **Pino logs:** `grep "component.*[component]" logs.json | jq '[query]'`
- **TrustGraph:** Query edges `[edge1] → [edge2]` in `reflex_memory/TrustGraph.yaml`
- **Database:** Query `[TableName]` table where `[condition]`
- **Dashboards:** [Link to monitoring dashboard, e.g., Vercel Analytics, Supabase Dashboard]
- [Add more evidence locations as needed]

---

## Definition of Done (DoD)

### Functionality ✅
- [ ] Code runs without errors
- [ ] Basic flow works end-to-end
- [ ] Edge cases handled
- [ ] Tests pass (unit + integration)

### Observability ✅
- [ ] **Telemetry evidence attached:**
  - [ ] Sentry links (or screenshots if no errors yet)
  - [ ] Pino log samples (JSON structure validated)
  - [ ] Trace IDs captured (for distributed tracing)
  - [ ] Dashboard screenshots (if applicable)
- [ ] **Failure mode documented:**
  - [ ] What breaks first (primary failure point)
  - [ ] What alert fires (Sentry alert name, Pino log level)
  - [ ] Recovery procedure (rollback steps, manual fix)
- [ ] **Signals verified:**
  - [ ] All planned telemetry events fire correctly
  - [ ] Log keys match schema
  - [ ] Metrics within thresholds

### Recovery ✅
- [ ] Rollback procedure documented
- [ ] Rollback tested (or verified safe)
- [ ] Known risks acknowledged
- [ ] Moat value preserved (doesn't degrade trust observability)

---

## Handoff Summary

### What Changed
- [List of changes: files, features, configurations]

### What to Test
- [Manual testing steps, if any]

### Known Risks
- [Potential issues, edge cases, limitations]

### Next Actions
- [Follow-up tasks, dependencies, next steps]

### Evidence: Proof It's Working
- **Sentry Issues:** [Links to relevant Sentry issues/dashboards]
- **Log Excerpts:** [Sample Pino logs showing expected behavior]
- **Dashboards:** [Links to monitoring dashboards, screenshots]
- **Trace IDs:** [Example trace IDs for distributed tracing]

### Expected Alerts
- **If it breaks, you'll see:**
  - `[ALERT_NAME]`: [What it means] → [Where to look] → [How to fix]
  - `[ALERT_NAME]`: [What it means] → [Where to look] → [How to fix]
  - [Add more alerts as needed]

---

## Review Gate Status

### Gate 1: Draft Complete ✅
- [ ] Code compiles/runs without errors
- [ ] Basic happy path works
- [ ] Tests pass (if applicable)
- [ ] No obvious bugs

**Gate Keeper:** Developer  
**Status:** [ ] Pending | [ ] Complete

---

### Gate 2: Observable ✅
- [ ] **Telemetry instrumented:**
  - [ ] Sentry events fire (or test error captured)
  - [ ] Pino logs structured (JSON format, correct keys)
  - [ ] Trace IDs captured (if applicable)
- [ ] **Failure modes documented:**
  - [ ] Primary failure point identified
  - [ ] Alert name defined
  - [ ] Recovery procedure written
- [ ] **Evidence attached:**
  - [ ] Sentry links/screenshots
  - [ ] Pino log samples
  - [ ] Dashboard screenshots (if applicable)

**Gate Keeper:** Tech Lead / Senior Developer  
**Status:** [ ] Pending | [ ] Complete

---

### Gate 3: Ship ✅
- [ ] **Rollback verified:**
  - [ ] Rollback procedure documented
  - [ ] Rollback tested (or verified safe)
  - [ ] Previous version still works
- [ ] **Risks acknowledged:**
  - [ ] Known risks documented in handoff
  - [ ] Edge cases handled
  - [ ] Failure modes have recovery paths
- [ ] **Moat value preserved:**
  - [ ] Doesn't degrade trust observability
  - [ ] TelemetryService integration maintained
  - [ ] Reflex scoring still works (if applicable)

**Gate Keeper:** Product Owner / Engineering Manager  
**Status:** [ ] Pending | [ ] Complete | [ ] **APPROVED FOR SHIP**

---

## Implementation Notes

[Optional: Add implementation details, code snippets, architecture decisions, etc.]

---

## Related Tasks

- [Link to related tasks or dependencies]

---

## References

- [Links to relevant documentation, code files, design docs, etc.]

---

**Created:** [Date]  
**Owner:** [Name]  
**Status:** [ ] Draft | [ ] In Progress | [ ] Complete

---

## Quick Reference

**Need help?** See:
- Cheat Sheet: `MOAT_SPARK_CHEATSHEET.md`
- Full Doctrine: `MOAT_SPARK_DOCTRINE.md`
- Examples: `MOAT_SPARK_EXAMPLES.md`

