# Task Brief: Agent Coordination Infrastructure

**What:** Verify and enhance agent coordination infrastructure to ensure agent lanes are properly documented, status tracking works, and agents can collaborate effectively. This enables task briefs to work properly across multiple agents.

**Why:** Without proper agent coordination, task briefs cannot be effectively executed across multiple agents. This infrastructure enables agents to share context, track status, and hand off work seamlessly.

**Who needs what:**
- **Inputs:** Agent lane definitions, status tracking documents, handoff protocols
- **Dependencies:** `AGENT_LANES.md`, `AGENT_EXECUTION_SUMMARY.md`, `COMMANDER.md` (all exist)
- **Integrations:** Agent coordination system (if exists), documentation system

**How it will be verified:**
- ✅ `AGENT_LANES.md` exists and documents all agent responsibilities clearly
- ✅ `AGENT_EXECUTION_SUMMARY.md` exists and tracks agent status
- ✅ `COMMANDER.md` exists and defines orchestration rules
- ✅ Agent status can be queried/updated programmatically (if API exists)
- ✅ Agent handoff protocols are documented and working
- ✅ Agent coordination dashboard or status page exists (if applicable)
- ✅ All agents can access shared context and status information

**When:** P1 - Enabler (Can be done in parallel with other tasks)

---

## Signals to Instrument

### Telemetry

**Sentry Events:**
- `agent.coordination.status_update` - When agent status is updated (tags: `agentName`, `status`, `task`, `component: agent_coordination`)
- `agent.coordination.handoff` - When work is handed off between agents (tags: `fromAgent`, `toAgent`, `task`, `component: agent_coordination`)
- `agent.coordination.error` - When coordination fails (tags: `agentName`, `errorType`, `component: agent_coordination`)

**Pino Log Keys:**
- `{ component: "agent_coordination", action: "status_update", agentName, status, task }`
- `{ component: "agent_coordination", action: "handoff", fromAgent, toAgent, task }`
- `{ component: "agent_coordination", action: "error", agentName, error, errorType }`

**Reflex Scoring:**
- `reflexScoreAudit.recordScore("agent_coordination", "status_update", score, 100, { agentName, status }, { task })`

### Metrics

- **Agent status update latency:** <100ms P95
- **Agent coordination success rate:** >99% (target: 100%)
- **Agent handoff success rate:** >95% (target: >98%)
- **Reflex score:** ≥0.92 for `agent_coordination.status_update`

### Failure Modes

**Primary Failure:**
- **What breaks first:** Agent lane documentation is missing or outdated
- **Alert fires:** Pino warn log with `component: "agent_coordination"`, `action: "status_update"`, `warning: "lane_documentation_missing"`
- **Recovery:**
  1. Verify `AGENT_LANES.md` exists and is up-to-date
  2. Update agent responsibilities if needed
  3. Document missing lanes
  4. Verify all agents have clear responsibilities

**Secondary Failure:**
- **What breaks first:** Agent status tracking system unavailable or corrupted
- **Alert fires:** Pino error log with `component: "agent_coordination"`, `action: "status_update_error"`
- **Recovery:**
  1. Check `AGENT_EXECUTION_SUMMARY.md` file exists
  2. Verify file is readable and not corrupted
  3. Restore from backup if needed
  4. Re-initialize status tracking if necessary

**Tertiary Failure:**
- **What breaks first:** Agent handoff protocol not followed or missing
- **Alert fires:** Pino warn log with `component: "agent_coordination"`, `action: "handoff"`, `warning: "protocol_not_followed"`
- **Recovery:**
  1. Review handoff protocol in `COMMANDER.md`
  2. Document missing handoff steps
  3. Update protocol if needed
  4. Verify agents understand handoff process

### Evidence Location

- **Sentry dashboard:** Filter by tag `component:agent_coordination` or search `agent.*`
- **Pino logs:** `grep "component.*agent_coordination" logs.json | jq '.component == "agent_coordination"'`
- **Documentation:** `AGENT_LANES.md`, `AGENT_EXECUTION_SUMMARY.md`, `COMMANDER.md`
- **Dashboards:** Agent coordination dashboard (if exists)

---

## Definition of Done (DoD)

### Functionality ✅
- [x] Agent lane documentation exists (`AGENT_LANES.md`)
- [x] Agent status tracking exists (`AGENT_EXECUTION_SUMMARY.md`)
- [x] Orchestration rules exist (`COMMANDER.md`)
- [ ] Agent coordination API or dashboard exists (if applicable) - **TODO: Verify or create**

### Observability ✅
- [ ] **Telemetry evidence attached:**
  - [ ] Sentry links (or screenshots if no errors yet)
  - [ ] Pino log samples (JSON structure validated)
  - [ ] Documentation screenshots
- [ ] **Failure mode documented:**
  - [x] What breaks first (primary failure point) - Missing documentation
  - [ ] What alert fires (Sentry alert name, Pino log level) - **TODO: Add Sentry instrumentation**
  - [x] Recovery procedure (rollback steps, manual fix) - Documented above
- [ ] **Signals verified:**
  - [ ] All planned telemetry events fire correctly - **TODO: Add Sentry/Pino instrumentation**
  - [ ] Log keys match schema - **TODO: Verify**
  - [ ] Metrics within thresholds - **TODO: Measure**

### Recovery ✅
- [x] Rollback procedure documented (Documentation can be restored from git)
- [ ] Rollback tested (or verified safe) - **TODO: Verify git history**
- [x] Known risks acknowledged (Documentation drift, status tracking gaps)
- [x] Moat value preserved (doesn't degrade trust observability)

---

## Handoff Summary

### What Changed
- Verified `AGENT_LANES.md` exists and documents agent responsibilities
- Verified `AGENT_EXECUTION_SUMMARY.md` exists and tracks agent status
- Verified `COMMANDER.md` exists and defines orchestration rules
- Created task brief for agent coordination infrastructure

### What to Test
1. **Documentation Verification:**
   - Verify `AGENT_LANES.md` exists and is readable
   - Verify all agents have documented responsibilities
   - Verify `AGENT_EXECUTION_SUMMARY.md` exists and tracks status
   - Verify `COMMANDER.md` exists and defines rules

2. **Status Tracking:**
   - Verify agent status can be queried (if API exists)
   - Verify agent status updates work (if API exists)
   - Verify status tracking is accurate

3. **Handoff Protocols:**
   - Verify handoff protocols are documented
   - Verify agents can follow handoff process
   - Test agent handoff workflow (if applicable)

### Known Risks
- Documentation may drift over time (mitigated by git version control)
- Status tracking may become outdated (mitigated by regular updates)
- Agent coordination API may not exist (documentation-only coordination)

### Next Actions
1. Verify all documentation files exist and are up-to-date
2. Create agent coordination API or dashboard (if needed)
3. Add Sentry instrumentation for agent coordination events
4. Add Pino structured logging for agent coordination
5. Set up monitoring for agent coordination health

### Evidence: Proof It's Working
- **Sentry Issues:** [To be added after instrumentation]
- **Log Excerpts:** [To be added after Pino logging]
- **Dashboards:** Agent coordination dashboard (if exists)
- **Documentation:** Links to `AGENT_LANES.md`, `AGENT_EXECUTION_SUMMARY.md`, `COMMANDER.md`

### Expected Alerts
- **If it breaks, you'll see:**
  - Pino warn log with `component: "agent_coordination"`, `warning: "lane_documentation_missing"`: Missing documentation → Check git history → Restore documentation
  - Pino error log with `component: "agent_coordination"`, `action: "status_update_error"`: Status tracking error → Check file permissions → Verify file exists

---

## Review Gate Status

### Gate 1: Draft Complete ✅
- [x] Documentation verified
- [x] Status tracking verified
- [x] Orchestration rules verified
- [x] No obvious issues

**Gate Keeper:** Developer  
**Status:** [x] Complete

---

### Gate 2: Observable ✅
- [ ] **Telemetry instrumented:**
  - [ ] Sentry events fire (or test error captured) - **TODO: Add Sentry**
  - [ ] Pino logs structured (JSON format, correct keys) - **TODO: Add Pino**
  - [ ] Documentation screenshots - **TODO: Add screenshots**
- [ ] **Failure modes documented:**
  - [x] Primary failure point identified
  - [ ] Alert name defined - **TODO: Configure Sentry alerts**
  - [x] Recovery procedure written
- [ ] **Evidence attached:**
  - [ ] Sentry links/screenshots - **TODO: After instrumentation**
  - [ ] Pino log samples - **TODO: After logging**
  - [ ] Documentation links - **TODO: Add links**

**Gate Keeper:** Tech Lead / Senior Developer  
**Status:** [ ] Pending | [ ] Complete

---

### Gate 3: Ship ✅
- [ ] **Rollback verified:**
  - [x] Rollback procedure documented (Git restore)
  - [ ] Rollback tested (or verified safe) - **TODO: Test git restore**
  - [x] Previous version still works
- [ ] **Risks acknowledged:**
  - [x] Known risks documented in handoff
  - [x] Edge cases handled
  - [x] Failure modes have recovery paths
- [ ] **Moat value preserved:**
  - [ ] Doesn't degrade trust observability - **TODO: Add telemetry**
  - [ ] Agent coordination maintained - **TODO: Verify**
  - [ ] Documentation accuracy preserved - **TODO: Verify**

**Gate Keeper:** Product Owner / Engineering Manager  
**Status:** [ ] Pending | [ ] Complete | [ ] **APPROVED FOR SHIP**

---

## Implementation Notes

**Current State:**
- `AGENT_LANES.md` exists and documents agent responsibilities
- `AGENT_EXECUTION_SUMMARY.md` exists and tracks agent status
- `COMMANDER.md` exists and defines orchestration rules

**What's Missing:**
- Agent coordination API or dashboard (may not be needed if documentation-only)
- Sentry instrumentation for agent coordination
- Pino structured logging for agent coordination
- Automated status tracking updates

**Next Steps:**
1. Verify all documentation files are up-to-date
2. Create agent coordination API or dashboard (if needed)
3. Add Sentry instrumentation
4. Add Pino structured logging
5. Set up monitoring

---

## Related Tasks

- [Database Migration Execution](./database-migration-execution-task-brief.md) - May need database access
- [Production Environment Verification](./production-environment-verification-task-brief.md) - Environment verification

---

## References

- Agent lanes: `AGENT_LANES.md`
- Status tracking: `AGENT_EXECUTION_SUMMARY.md`
- Orchestration: `COMMANDER.md`
- Template: `TASK_BRIEF_TEMPLATE.md`

---

**Created:** 2025-01-27  
**Owner:** Development Team  
**Status:** [x] Draft | [ ] In Progress | [ ] Complete
