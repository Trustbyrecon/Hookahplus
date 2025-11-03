# Quick Reference: Agent Alignment for H+ Go-Live

**For immediate use with Cursor 2.0 Multi-Agent Interface**

---

## Agent Roles Quick Map

| Agent | Cursor 2.0 Role | Trust Level | Primary Use |
|-------|----------------|------------|-------------|
| **Noor** | Primary in Composer | L1 | Fast code generation |
| **Jules** | Background audit | L3 | Track changes, detect drift |
| **Lumi** | Parallel design | L0 | Explore UI/SDK variants |
| **6** | Local stability | L2 | Resolve conflicts, stabilize |
| **EP** | Governance layer | L3 | Review, score, govern |

---

## Week 1 Quick Start (Owner Dashboard)

### Noor Tasks (Primary Agent)
```bash
# Generate dashboard components
- /app/dashboard/sessions/page.tsx
- components/SessionList.tsx
- components/RevenueMetrics.tsx
- /api/revenue endpoint
```

### Lumi Tasks (Parallel Exploration)
```bash
# Test UI variants
- Dashboard layout options
- Chart library comparison (Chart.js vs Recharts)
- Revenue visualization patterns
```

### Jules Tasks (Background Audit)
```bash
# Monitor and track
- Code quality metrics
- Component consistency
- API endpoint drift
```

### EP Tasks (Governance)
```bash
# Validate and score
- Review all generated code
- Compute Reflex Scores (target ≥ 7.0)
- Validate dashboard requirements
```

---

## Agent Collaboration Patterns

### Pattern 1: Build → Validate
```
Noor generates → EP validates → Reflex Score ≥ 7.0? → Proceed/Iterate
```

### Pattern 2: Explore → Stabilize
```
Lumi explores → 6 validates → 6 selects best → 6 stabilizes branch
```

### Pattern 3: Build → Track
```
Noor generates → Jules tracks → Jules detects drift → Alert if exceeded
```

---

## Reflex Score Thresholds

- **L0 (Lumi):** 0.0-5.0 (Sandbox exploration)
- **L1 (Noor):** 5.0-7.0 (Internal test mode)
- **L2 (6):** 7.0-8.5 (Reflex-validated output)
- **L3 (Jules/EP):** 8.5-10.0 (Audit/Governance)

---

## Worktree Structure

```
pos/      → Noor (APIs, adapters)
ledger/   → Jules (audit, tracking)
sdk/       → Lumi (exploration, prototypes)
ui/        → 6 (stability, integration)
test/      → EP (validation, governance)
```

---

## Daily Pulse Schedule

- **Morning:** Noor plans → EP validates
- **Midday:** Jules audits → 6 stabilizes
- **Evening:** All sync → EP scores

---

## Success Metrics

- **Noor:** 100+ components/week, 4× faster generation
- **Jules:** Real-time drift detection, daily audits
- **Lumi:** 5+ variants per task, 10+ prototypes/week
- **6:** < 1hr conflict resolution, > 95% stability
- **EP:** 100% code review, real-time scoring

---

## Immediate Actions

1. Set up Cursor 2.0 worktrees
2. Load `config/trustops/agents/agents.yaml`
3. Assign Noor to Week 1 dashboard tasks
4. Activate Lumi for UI exploration
5. Enable Jules for background audit
6. Configure EP for governance

---

**See:** `HPLUS_AGENT_ALIGNED_EXECUTION.md` for full details
