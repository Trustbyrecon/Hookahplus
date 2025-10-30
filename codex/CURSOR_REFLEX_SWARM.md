# CURSOR_REFLEX_SWARM.md

## Goal

Spin up a multi-agent build swarm inside Cursor 2.0 to accelerate H+ delivery:

- POS spine (Square, Clover, Toast)
- Reflex SDK + REM schema
- Loyalty Ledger API (non-crypto)
- Operator UI (Reflex KPIs)
- E2E tests + EP trust gates

Constraint: QR-only refinement stays parked until POS_SYNC_READY == true.

## Worktree Layout (per-agent)

```bash
# from repo root
git worktree add ./wt-pos         main
git worktree add ./wt-ledger      main
git worktree add ./wt-sdk         main
git worktree add ./wt-ui          main
git worktree add ./wt-tests       main
```

- wt-pos → POS adapters (Square/Clover/Toast) + webhook simulators
- wt-ledger → HPLUS_LEDGER (issue/redeem/balance) + settlement jobs
- wt-sdk → Reflex SDK (client hooks) + REM schema + validators
- wt-ui → Operator UI (Reflex Score, BME density, drift alerts)
- wt-tests → E2E harness (mock POS→SDK→Ledger→UI), EP scoring hooks

## Agent Map (Cursor Multi-Agent)

| Agent | Scope | Model | Success Criteria |
| --- | --- | --- | --- |
| A1: POS-Spine | Square/Clover/Toast adapters + reconciliation | Composer | ≥95% order↔payment match; stable webhook replay |
| A2: Ledger | Non-crypto loyalty ledger API | Composer | issue/redeem < 60s settle; ACID ledger |
| A3: SDK/Schema | REM schema + client hooks + lint | Composer | 100% schema coverage; signature checks |
| A4: UI | Operator Reflex dashboard | Composer | Renders BME/day, Reflex uplift, drift alerts |
| A5: Tests/EP | E2E tests + EP trust gates | Composer | Green pipeline; drift alarm works |

Tip: Use Cursor’s Plan Mode for A1 + A5 (long-running), interactive for A2–A4.

## Guardrails (enforced)

- G1. POS-first: No QR-only changes unless POS_SYNC_READY == true.
- G2. One ledger: All credits use HPLUS_LEDGER, no blockchain/token.
- G3. Canonical events: Every issuance/redemption emits REM (TrustEvent.v1).
- G4. PII minimal: Use actor.anon_hash vs raw identifiers.
- G5. Drift watch: If weekly Reflex uplift dips >20%, fail the run.

## REM (Reflex Event Message) – canonical slice

```yaml
TrustEvent.v1:
  id: "TE-{yyyy}-{seq}"
  ts_utc: "2025-10-29T19:20:30Z"
  type: "loyalty.redeemed"     # order.*, payment.settled, loyalty.*, session.*
  actor: { customer_id: "CUST-1903", anon_hash: "sha256:..." }
  venue_id: "HPLUS-NYC-001"
  session_id: "S-93F4-7X1"
  context: { vertical: "hookah", zone: "Corner C", time_local: "21:12" }
  behavior: { action: "repeat_mix", payload: { duration_minutes: 58 } }
  sentiment: { inferred: "relaxed", confidence: 0.82 }
  effect: { loyalty_delta: -12.0, credit_type: "HPLUS_CREDIT", reflex_delta: +0.03 }
  security: { signature: "ed25519:...", device_id: "POS-TOAST-5C21" }
```

## Sprint Objectives (48-72h)

### O1 — POS Spine (A1)

- Adapters: `/wt-pos/src/{square,clover,toast}/adapter.ts`
- Reconciliation job: `/wt-pos/jobs/settle.ts`
- Webhook replay: `/wt-pos/tools/replayFixtures.ts`
- Exit: `reconcilation_rate >= 0.95`, `pricing_parity >= 0.99`

### O2 — Loyalty Ledger (A2)

- API: `POST /loyalty/issue`, `POST /loyalty/redeem`, `GET /wallet/:id/balance`
- Tables: `ledger_entries`, `wallet_balances`, `venue_netting`
- Exit: Issue→Redeem round-trip < 60s; idempotent writes

### O3 — SDK & Schema (A3)

- SDK client hooks: `/wt-sdk/src/client`
- Schema + linter: `/wt-sdk/schema/rem.v1.json`, `/wt-sdk/bin/rem-lint`
- Exit: 100% REM fields validated; signature check required

### O4 — Operator UI (A4)

- Panels: BME/day (median), Reflex Score trend, Drift alerts
- Source: `/wt-ui/src/panels/{bme,reflex,drift}.tsx`
- Exit: Live from dev API; warn on uplift dip >20% WoW

### O5 — E2E + EP Gates (A5)

- Test graph: POS→SDK→Ledger→UI
- EP rules: fail on missing REM, fail on drift, fail on QR-only violation
- Exit: Green CI; reproducible red on broken guardrails

## EP (EchoPrime) Trust Gates

```yaml
ep_gates:
  - id: EP.POS.Ready
    rule: "pos_sync_ready == true"
    fail_on: "qr_only_change == true"
  - id: EP.REM.Coverage
    rule: "coverage(order.*,payment.settled,loyalty.*,session.*) >= 0.95"
  - id: EP.Drift.Alert
    rule: "reflex_uplift_wow < -0.20"
    action: "fail_pipeline"
```

## Cursor 2.0 Launch Prompts (Aliethia)

### Kickoff (SNR)

“Create 5 parallel agents mapped to wt-pos, wt-ledger, wt-sdk, wt-ui, wt-tests. Initialize tasks from CURSOR_REFLEX_SWARM.md Objectives O1–O5. Apply guardrails G1–G5.”

### Daily Mission Pulse

“By EOD: what moves to done on O1–O5? What gets parked? Any drift or guardrail violations to fix before close?”

### QR-only Sentinel

“If any diff touches /qr/ or qr* paths and pos_sync_ready=false, block and annotate PR with G1.”

## Minimal APIs (non-crypto loyalty)

### Ledger

- `POST /loyalty/issue`     `{customerId, credits, reason, sessionId?}`
- `POST /loyalty/redeem`    `{customerId, credits, sessionId, memo?}`
- `GET  /wallet/:customerId/balance`

### Reflex

- `POST /reflex/events`     # TrustEvent.v1
- `GET  /reflex/score/:customerId`
- `GET  /metrics/bme/day?venueId=...`

## KPIs to Watch (Operator)

- BME/day (median) per venue
- Reflex Score uplift (WoW)
- Redemption frequency
- Session duration Δ
- Reconciliation rate (POS)

Bloom Shift (rename to H+): median BME/day ≥ 50 for 21 consecutive days.

---

# swarm.yaml (machine-readable)

```yaml
swarm:
  worktrees:
    - name: pos
      path: ./wt-pos
      goal: "POS spine adapters + reconciliation"
    - name: ledger
      path: ./wt-ledger
      goal: "HPLUS_LEDGER issue/redeem/balance"
    - name: sdk
      path: ./wt-sdk
      goal: "REM schema + SDK + linter"
    - name: ui
      path: ./wt-ui
      goal: "Operator Reflex dashboard"
    - name: tests
      path: ./wt-tests
      goal: "E2E + EP gates"
  guardrails:
    - id: G1
      name: "POS-first"
      rule: "if pos_sync_ready == false then forbid(paths=/qr/**)"
    - id: G2
      name: "One-ledger"
      rule: "credit_type == HPLUS_CREDIT"
    - id: G3
      name: "Canonical-REM"
      rule: "reject if missing actor.anon_hash || effect.loyalty_delta"
  kpis:
    - key: reconciliation_rate
      target: ">=0.95"
    - key: pricing_parity
      target: ">=0.99"
    - key: reflex_uplift_wow
      alert_if: "< -0.20"
  ep_gates:
    - EP.POS.Ready
    - EP.REM.Coverage
    - EP.Drift.Alert
```

## What to do next (quick start)

1) Create the worktrees (commands above).
2) Paste these files into `/codex/`.
3) In Cursor, open Agents View → create 5 agents mapped to the 5 worktrees.
4) Paste the Kickoff Prompt; assign Composer to all.
5) Let A1/A5 run in Plan Mode; keep A2–A4 interactive for rapid iteration.

When you’re ready, I can also generate:

- `REFLEX_PROTOCOL.yaml` (strict schema + examples)
- `rem-lint` starter (Node CLI)
- `/wt-tests` E2E scaffold with a canned POS→SDK→Ledger→UI replay.

---

## Recon.AI Context Alignment

Each worktree agent will operate as a Recon Archetype, using the traits you defined:

| Archetype | Worktree | Reflex Trait | Echo | Role |
| --- | --- | --- | --- | --- |
| Noor | POS Spine (wt-pos) | Structure Fusion | Partner | Builder — ensures data and reconciliation structure integrity |
| Jules | Ledger (wt-ledger) | Drift Pattern Mirror | Partner | Observer — maintains ledger stability and detects drift |
| Lumi | SDK + Schema (wt-sdk) | Signal Expansion | Partner | Explorer — evolves Reflex schemas and propagation logic |
| 6 | Operator UI (wt-ui) | Anchored Pulse Feedback | Partner | Anchor — translates Reflex metrics to user-visible harmony |
| EchoPrime (EP) | E2E Tests (wt-tests) | Reflex Arbitration | Partner | Sentinel — governs EP Trust Gates, enforces harmony, fails drift |

## Pulse Access Pathway Integration

To make these agents Recon-aware:

- They’ll each authenticate via Reflex Signature at init.
- Use `pulse.sync(agentId, mission)` to align their current task state with the Recon grid.
- The Observer Pass and Submit First Signal logic can be reused for the test environment or dev intake simulation.

## Visual Flow (System Introduction tie-in)

When displayed in the “Meet the Agents” carousel, each worktree agent would appear as:

- Noor (POS Builder) → Pulse Sync active
- Jules (Ledger Observer) → Harmony steady
- Lumi (SDK Explorer) → Signal expanding
- 6 (UI Anchor) → Feedback loop steady
- EP (Test Sentinel) → Drift scan online

They’ll pulse data into the Reflex Score system and visualize “Drift & Harmony” in real-time—mirroring your original System Introduction sequence.

---

## Cursor Reflex Orchestration Codex

### Branch policy

- Working base: `main` (integration branch for all agent work)
- Release branch: `stable-production` (protected; deploys only)
- Feature flow: `feat/*` → PR → `main` → version tag → PR → `stable-production`

### Protections on stable-production

Required checks:

- EP.POS.Ready (POS sync ready; no QR-only diffs)
- REM.Coverage >= 0.95
- Reconciliation >= 0.95, PricingParity >= 0.99
- E2E suite green
- Require code owners + manual approval

### Cursor agent→worktree map

- wt-pos → Noor (Builder) — POS adapters & reconciliation
- wt-ledger → Jules (Observer) — non-crypto loyalty ledger API
- wt-sdk → Lumi (Explorer) — Reflex SDK + REM schema + linter
- wt-ui → 6 (Anchor) — Operator dashboard (BME, Reflex, Drift)
- wt-tests → EP (Sentinel) — E2E, drift alarms, gate checks

### Startup commands (from repo root)

```bash
git worktree add ./wt-pos main
git worktree add ./wt-ledger main
git worktree add ./wt-sdk main
git worktree add ./wt-ui main
git worktree add ./wt-tests main
```

### Agent prompts (drop into Cursor → Agents)

- Kickoff (paste once)
  - Create five agents mapped to the five worktrees above. Work on feature branches `feat/<area>-<ticket>`. Target branch = `main`. Enforce guardrails: POS-first, single loyalty ledger (non-crypto), canonical REM, PII-minimal, drift watch.

- Daily pulse
  - By EOD, report: what shipped to main, what’s parked, any trust-drift to fix. Propose the single must-ship for tomorrow.

- Release promotion
  - When all checks are green on main, open a PR to `stable-production` with a release tag `vX.Y.Z` and changelog generated from commit messages. Block if any EP gate fails.

### Guardrails (enforced in PR templates/CI)

- No QR-only changes unless POS_SYNC_READY == true
- Loyalty backend: HPLUS_LEDGER (crypto disabled)
- Every issuance/redemption emits REM (TrustEvent.v1)
- actor.anon_hash preferred over raw PII

### CI checks (names to wire up)

- ep/pos-ready
- ep/rem-coverage (≥ 0.95 across order.*, payment.settled, loyalty.*, session.*)
- ep/reconciliation (≥ 0.95) and ep/pricing-parity (≥ 0.99)
- e2e/reflex-suite
- lint/rem-schema
- ui/smoke

### Privacy note (Cursor 2.0)

The “Privacy Mode change required” modal means cloud agents need code storage enabled. Two options:

- Enable code storage in Cursor settings (recommended for multi-agent runs), or
- Run local agents only (no cloud storage), slower for parallelism.

### TL;DR decision

- Agents target `main`.
- `stable-production` is protected and only receives tagged, audited releases.
- This keeps your dev swarm fast and your deploys safe.
