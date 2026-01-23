# Flow 1: New feature on the operator golden path

Example: “Add customer notes to session close, still no PII leakage.”

This flow is for any change that touches the **staff/operator rail** (create session → pay → run session → close) where we must preserve invariants, degrade safely on failure, and ship with gates + observability + enablement.

## Engagement order (default lane + interrupts)

1) **Astra.SessionOS** (contract first)
2) **Lumen.Design** (rail + recovery states)
3) **Care.DPO** (data boundaries + retention + logging rules)
4) **Kestrel.QA** (tests + CI gate: “golden path cannot break”)
5) **Atlas.Platform** (metrics + alerts + dashboards + SLO notes)
6) **Bridge.SupportOps** (macros + runbooks + escalation triggers)
7) **Harbor.LoungeSuccess** (training + onboarding/pilot checklist)

## Flow 1 task card (copy/paste)

Fill this out before implementation. Keep it short; link to deeper docs as needed.

```yaml
flow: 1
title: ""
summary: ""
surfaces:
  ui:
    - ""
  api:
    - ""
  db:
    - ""
flags:
  - name: ""
    default: off

invariants:
  - ""

data_classification:
  fields_added:
    - field: ""
      pii: false
      allowed_values: ""
      storage: ""
      retention: ""
      export_delete_implications: ""
logging_rules:
  never_log:
    - ""
  safe_identifiers:
    - ""

failure_modes:
  - mode: ""
    operator_message: ""
    primary_cta: ""
    secondary_cta: ""
    invariant_protected: ""

rollback_plan:
  strategy: ""
  data_migration_rollback: ""

tests_and_gates:
  unit:
    - ""
  e2e:
    - ""
  ci_gate:
    - "golden path cannot break"

observability:
  metrics:
    - ""
  alerts:
    - ""
  dashboards:
    - ""
  slo_notes:
    - ""

support_enablement:
  macros:
    - ""
  runbooks:
    - ""
  escalation_triggers:
    - ""

training_enablement:
  staff_training_updates:
    - ""
  pilot_checklist_updates:
    - ""

signoff:
  astra_sessionos: ""
  lumen_design: ""
  care_dpo: ""
  kestrel_qa: ""
  atlas_platform: ""
  bridge_supportops: ""
  harbor_loungesuccess: ""
```

## Definition of done (Flow 1)

- **Contract**: invariants + failure modes + rollback plan exist and are linked in the PR.
- **UX**: rail spec includes empty/error/offline/sync-fail states with operator-visible behavior.
- **Privacy**: new/changed fields are classified; logging rules are explicit; retention stance is stated.
- **Gates**: unit + E2E cover the golden path; CI blocks regressions (“golden path cannot break”).
- **Observability**: at least 1 metric + 1 alert + dashboard link (or existing dashboard updated).
- **Support**: macro + runbook exist for top likely failure; escalation triggers are documented.
- **Enablement**: staff training/pilot checklist updated (what changed, what to do when it fails).

## Worked example (customer notes on session close, no PII leakage)

- **Invariant**: notes must never contain raw PII; notes are optional; note capture must not block close.
- **Data boundaries**:
  - allow: short, staff-entered “service notes” (no phone/email, no addresses, no birthdays)
  - store: DB as `sessionNote` (bounded length); reject/strip patterns if needed
  - retention: align to session retention policy; include in export/delete posture if linked to profile
- **Failure mode**: network sync fails → operator sees “Saved locally / Sync pending” with “Retry sync” + “Continue”.
- **Gates**:
  - unit: note validation + redaction rules (if any)
  - e2e: add note → close session → verify note persisted and UI confirms status
- **Observability**:
  - metric: `session_note.save.success|failure` with reason codes (no content logged)
  - alert: failure spike or elevated sync-pending backlog

