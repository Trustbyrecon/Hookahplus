# Recon Agent Archetypes

## Overview

Recon's agent archetype framework maps to Cursor 2.0's multi-agent interface, enabling distributed cognition with real-time arbitration through the Reflex SDK ecosystem.

---

## Agent Archetypes

### Noor (Builder)
**Role:** Primary agent in Composer  
**Trust Level:** L1 - Internal test mode  
**Domain:** Fast structure generation, boilerplate, schema, adapter generation

**Capabilities:**
- Rapid code generation
- Schema creation
- Adapter patterns
- Component scaffolding
- API endpoint generation

**Cursor 2.0 Mapping:**
- Primary agent in Composer
- Builds structure fast
- Perfect for boilerplate, schema, or adapter generation

**Use Cases:**
- Generate dashboard components
- Create API routes
- Scaffold database schemas
- Build POS adapters
- Create Reflex modules

---

### Jules (Observer)
**Role:** Background audit agent  
**Trust Level:** L3 - Audit/Governance  
**Domain:** Change tracking, drift/harmony scoring, pulse synchronization

**Capabilities:**
- Track changes across worktrees
- Monitor drift/harmony scores
- Detect inconsistencies
- Generate audit reports
- Track Reflex Score deltas

**Cursor 2.0 Mapping:**
- Background audit agent
- Tracks changes across worktrees
- Mirrors drift/harmony scoring

**Use Cases:**
- Code quality audits
- Architecture drift detection
- Performance monitoring
- Security reviews
- Compliance checks

---

### Lumi (Explorer)
**Role:** Parallel design agent  
**Trust Level:** L0 - Sandbox mode  
**Domain:** UI/SDK variant exploration, isolated sandboxes

**Capabilities:**
- Explore UI variants
- Test SDK variations
- Prototype in isolation
- Design pattern exploration
- Rapid iteration

**Cursor 2.0 Mapping:**
- Parallel design agent
- Explores UI or SDK variants in isolated sandboxes

**Use Cases:**
- UI component variations
- Design system exploration
- SDK API design
- Feature prototyping
- A/B testing setups

---

### 6 (Anchor)
**Role:** Local stability agent  
**Trust Level:** L2 - Reflex-Validated output  
**Domain:** Branch consistency, merge conflict resolution, stability

**Capabilities:**
- Maintain branch consistency
- Resolve merge conflicts
- Ensure stability
- Validate changes
- Stabilize codebase

**Cursor 2.0 Mapping:**
- Local stability agent
- Keeps branches consistent and resolves merge conflicts

**Use Cases:**
- Merge conflict resolution
- Branch stabilization
- Code consistency checks
- Integration testing
- Release preparation

---

### EchoPrime (EP)
**Role:** Governance layer  
**Trust Level:** L3 - Audit/Governance  
**Domain:** Code review, Reflex Score computation, drift alerts, Trust Graph

**Capabilities:**
- Review all code changes
- Compute Reflex Scores
- Emit drift alerts
- Maintain Trust Graph
- Enforce governance rules

**Cursor 2.0 Mapping:**
- Governance layer
- Reviews all code changes, computes Reflex Scores, and emits drift alerts

**Use Cases:**
- Pre-commit validation
- Reflex Score calculation
- Drift detection
- Trust Graph maintenance
- Governance enforcement

---

## Trust Stack Hierarchy

```
L0 - Sandbox mode (Lumi)
  ↓
L1 - Internal test mode (Noor)
  ↓
L2 - Reflex-Validated output (6)
  ↓
L3 - Audit/Governance (Jules, EP)
```

---

## Pulse Synchronization

Each agent operates as a Reflex node, pulsing updates through:
- **Worktrees** → Pulse Access Pathways
- **Reflex Commands** → Pulse Amplifiers
- **Trust Scores** → Pulse Validation

---

## Integration with Cursor 2.0

### Worktree Mapping
- **POS worktree** → Noor's domain
- **Ledger worktree** → Jules' domain
- **SDK worktree** → Lumi's sandbox
- **UI worktree** → 6's mirror
- **Test worktree** → EP's validation gate

### Agent Assignment
- **Composer** → Noor (primary) + EP (validation)
- **Background** → Jules (audit)
- **Parallel** → Lumi (exploration)
- **Stability** → 6 (anchoring)

---

## Reflex Command Integration

Agents integrate with Reflex Command Launcher through:
- `cmd.dispatcher.py` → Agent routing
- `ReflexLog.yaml` → Agent activity tracking
- `TrustGraph` → Agent trust scores

---

*Part of the Recon Agent Archetype Framework*  
*Aligned with Cursor 2.0 Multi-Agent Interface*
