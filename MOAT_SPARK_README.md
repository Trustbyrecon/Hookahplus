# Moat Spark Doctrine: Complete System

**Version:** 1.0  
**Last Updated:** 2025-01-27  
**Purpose:** Trust Observability as a portable system

---

## 🎯 What is Moat Spark?

**Moat Spark = "Trust Observability as a portable system."**

Not "AI" vs "Hookah lounges." The common layer is: **instrumentation → diagnosis → feedback → repair → confidence.**

You're building the *immune system pattern* across domains:
- **Recon.AI** watches **model/agent integrity** (Reflex scoring, TrustGraph, GhostLog)
- **Hookah+** watches **app reliability and operator flow integrity** (Sentry, Pino, TelemetryService)

Same founder fingerprint: **make drift visible, measurable, fixable.**

---

## 📚 Documentation Structure

### Core Documents

1. **`MOAT_SPARK_DOCTRINE.md`** - Complete framework (4 Scaffolds, Delegation Buckets, Flywheel)
2. **`MOAT_SPARK_CHEATSHEET.md`** - One-page quick reference
3. **`TASK_BRIEF_TEMPLATE.md`** - Reusable template for new tasks
4. **`MOAT_SPARK_EXAMPLES.md`** - Real-world examples from Hookah+ codebase

### Agent Integration

5. **`reflex/aliethia_task_brief_directive.md`** - Aliethia's directive for generating task briefs
6. **`.cursor/rules/aliethia-task-brief-generation.md`** - Cursor rule for activation

### Tools

7. **`scripts/generate-task-brief.ts`** - Script to generate task briefs from template

---

## 🚀 Quick Start

### For New Tasks

**Option 1: Ask Aliethia (Recommended)**
```
User: "I need to implement guest refill requests"

Aliethia: [Generates complete Task Brief v2 with full observability signals]

User: [Reviews, approves, or modifies]
```

**Option 2: Use Template**
1. Copy `TASK_BRIEF_TEMPLATE.md`
2. Fill in all sections
3. Use `MOAT_SPARK_CHEATSHEET.md` for quick reference
4. Reference `MOAT_SPARK_EXAMPLES.md` for patterns

**Option 3: Use Script**
```bash
# Interactive mode
npx tsx scripts/generate-task-brief.ts --interactive

# Simple mode (basic structure, then ask Aliethia for signals)
npx tsx scripts/generate-task-brief.ts "Task description"
```

---

## 🎯 The 4 Scaffolds

### 1. Task Brief v2: "Ready-to-Run + Instrumented"

Every task must include **"Signals to Instrument"** section:
- Telemetry (Sentry, Pino, Reflex)
- Metrics (latency, error rate, Reflex score)
- Failure modes (what breaks + alerts + recovery)
- Evidence location (where to find proof)

### 2. DoD v2: "Works + Observable + Recoverable"

Definition of Done includes:
- Functionality ✅
- Observability ✅ (telemetry evidence, failure modes, signals verified)
- Recovery ✅ (rollback, risks, Moat value)

### 3. Handoff v2: "What Changed + Proof It's Behaving"

Handoff includes:
- What changed
- Evidence (Sentry links, Pino logs, dashboards, trace IDs)
- Expected alerts (if it breaks, you'll see...)

### 4. Review Gate v2: 3 Gates

- **Gate 1: Draft Complete** (Developer) - Code runs, basic flow works
- **Gate 2: Observable** (Tech Lead) - Telemetry instrumented, evidence attached
- **Gate 3: Ship** (Product Owner) - Rollback verified, Moat value preserved

---

## 🤖 Using Aliethia for Task Brief Generation

### Activation

Aliethia automatically activates when you:
- Ask "How do I implement [feature]?"
- Request "next steps" for a feature
- Say "I need to build [thing]"
- Provide a task description

### What Aliethia Does

1. **Parses your intent** - Extracts what, why, context
2. **Generates complete Task Brief v2** - All sections filled in
3. **Creates observability signals** - Sentry, Pino, Reflex scoring
4. **Documents failure modes** - Primary, secondary, tertiary
5. **Specifies evidence locations** - Where to find proof
6. **Preserves Moat alignment** - Trust observability built-in

### Review Workflow

After Aliethia generates a task brief:

```
📋 Task Brief Generated

Please review and:
- ✅ Approve if it meets your requirements
- ✏️ Modify any sections that need adjustment
- ➕ Add any missing context or requirements
- 🔄 Regenerate if you want me to refine specific sections

Moat Foundation Preserved: ✅
```

You can then:
- **Approve** → Task brief saved to `tasks/[name]-task-brief.md`
- **Modify** → Tell Aliethia which sections to change
- **Add** → Provide additional context
- **Regenerate** → Ask for refinement

---

## 📋 Task Brief Checklist

Before marking a task as "Done":

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

## 🔧 Common Patterns

### Sentry Event Pattern
```typescript
Sentry.captureException(error, {
  tags: {
    component: "session",
    action: "create",
    environment: "production",
  },
  extra: {
    sessionId: "sess_123",
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
  "session",
  "create",
  0.94,
  100,
  { latency: 234 },
  { sessionId: "sess_123" }
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

## 🔄 Trust Observability Flywheel

```
Instrument → Diagnose → Feedback → Repair → Confidence
     ↑                                              ↓
     └──────────────────────────────────────────────┘
```

**Remember:** Every task ships with observability built-in, not bolted-on.

---

## 📁 File Locations

- **Doctrine:** `MOAT_SPARK_DOCTRINE.md`
- **Cheat Sheet:** `MOAT_SPARK_CHEATSHEET.md`
- **Template:** `TASK_BRIEF_TEMPLATE.md`
- **Examples:** `MOAT_SPARK_EXAMPLES.md`
- **Aliethia Directive:** `reflex/aliethia_task_brief_directive.md`
- **Cursor Rule:** `.cursor/rules/aliethia-task-brief-generation.md`
- **Generator Script:** `scripts/generate-task-brief.ts`
- **Generated Briefs:** `tasks/[name]-task-brief.md`

---

## 🎯 Success Metrics

### Short-term (Week 1)
- [ ] 100% of new tasks include "Signals to Instrument"
- [ ] 100% of DoD checklists include "Telemetry Evidence"
- [ ] All handoffs include "Evidence" section

### Medium-term (Month 1)
- [ ] Average time to diagnose issues: <15 minutes (down from 1+ hour)
- [ ] Rollback success rate: 100% (all rollbacks work)
- [ ] Reflex score trend: ≥0.92 (trust maintained)

### Long-term (Quarter 1)
- [ ] Delegation capacity: 3x (you can delegate 3x more without micromanaging)
- [ ] Incident resolution time: <30 minutes (down from 2+ hours)
- [ ] System confidence: High (team trusts the observability)

---

## 🔗 Related Systems

- **Sentry:** Error tracking (`sentry.client.config.ts`, `sentry.server.config.ts`)
- **Pino:** Structured logging (`lib/logger-pino.ts`)
- **TelemetryService:** Unified telemetry (`lib/telemetryService.ts`)
- **Reflex Scoring:** Trust metrics (`lib/reflexScoreAudit.ts`)
- **TrustGraph:** Agent trust network (`reflex_memory/TrustGraph.yaml`)
- **GhostLog:** Agent memory (`logs/ghostlog.md`)

---

## 💡 Tips

1. **Always ask Aliethia first** - She generates complete, Moat-aligned task briefs
2. **Use the cheat sheet** - Quick reference when writing briefs
3. **Reference examples** - See real patterns from your codebase
4. **Preserve Moat value** - Every task should enhance, not degrade, trust observability
5. **Review before approving** - Task briefs are living documents, refine as needed

---

## 🧬 Moat Spark Mantra

> "I don't just know what I did.  
> I know what it meant.  
> And what I'll do next."

**That's the Moat Spark.**

---

**Status:** ✅ Active System  
**Last Updated:** 2025-01-27

