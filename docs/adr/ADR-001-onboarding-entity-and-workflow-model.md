# ADR-001: Onboarding Entity and Workflow Model

**Status:** Accepted  
**Date:** 2026-03-08  
**Context:** H+ Onboarding Engine v1

---

## Context

The H+ Onboarding Engine requires clear separation between account scope and venue scope, a system-derived workflow type selection flow, and a defined relationship between LaunchPad (intake) and the Onboarding Engine (workflow execution).

---

## Decision 1: Entity Model (tenantId vs loungeId)

**tenantId** = Account / business owner container. Use for:
- Authentication and authorization
- Billing and subscription
- Account-level scope

**loungeId** = Physical or operational venue instance. Use for:
- Onboarding workflow state
- Layout, pricing, sessions
- Operator UI and venue-specific config

**v1**: Support 1 tenant : 1 lounge by default. Schema keeps both fields; do not encode equality as permanent.

**Future**: `tenantId -> loungeId[]` for multi-location, franchise, district rollups.

### Consequences

- Schema must include both `tenantId` and `loungeId` on `OnboardingWorkflow`
- Auth resolves lounge access via tenant membership
- APIs accept `loungeId` for venue scope; `tenantId` derived from auth when needed

---

## Decision 2: Workflow Type Selection

**Model**: System-derived from operator inputs, then confirmed. Do not expose internal labels (square_standard, manual_basic) as the first UX choice.

**Flow**: On first onboarding entry:
1. Ask operator to select POS type: Square, Clover, Toast, Manual / No POS yet
2. Ask toggles: QR preorders enabled? Stripe checkout enabled? Multi-location?
3. System assigns `workflowType` via `inferWorkflowType(answers)`
4. Show confirmation: "We've selected: clover_qr_preorder. You can change this later."
5. Create workflow with inferred type; proceed to main step flow

**Fallback**: If no POS choice, default to `manual_basic`, mark workflow as provisional, prompt for upgrade later.

### Consequences

- `workflow-inference.ts` implements `inferWorkflowType(answers)`
- WorkflowSetupStep component collects answers before main steps
- Operator chooses business inputs, not system workflow names

---

## Decision 3: LaunchPad vs Onboarding Engine

**LaunchPad** = Intake, creation, bootstrap, first-run setup. Owns:
- Account creation
- Lounge creation
- Initial POS / mode questions
- Starter config generation

**Onboarding Engine** = Structured workflow execution. Owns:
- Step progression
- Validation
- Status map
- Blockers
- Launch readiness

**Short-term**: Parallel is acceptable for speed.

**Long-term**: LaunchPad should redirect into engine with created `tenantId`, `loungeId`, and inferred `workflowType` after create-lounge.

### Consequences

- Clear contract between LaunchPad and Onboarding Engine
- Avoid duplicate setup logic and fragmented progress state
- Onboarding Engine is the operational core; LaunchPad is the front door

---

## Clean Architecture Principles

- **Separate account scope from location scope**: tenantId vs loungeId
- **Separate operator inputs from system workflow logic**: infer workflowType, don't expose internal labels
- **Separate entry experience from workflow execution**: LaunchPad = front door, Onboarding Engine = core
