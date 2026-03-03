# H+ QR UX Ease Scorecard (Toast/Clover Benchmark)

## Objective
Rank H+ QR workflow ease against Toast/Clover-like industry patterns, with a strict focus on low staff mental transition cost.

## Scope
- Guest flow first: scan to session/order.
- Staff QR ops second: generate/manage/act from QR context.
- Output is scorecard-only (no implementation plan in this document).

## Weighted Rubric
- Entry Simplicity: 25%
- Operational Mapping: 20%
- Recovery and Error Clarity: 15%
- Staff Action Continuity: 20%
- Lifecycle Operations: 20%

Scoring scale: 0 (missing) to 5 (best-in-class).

## Score Summary
| Dimension | Weight | H+ Score (0-5) | Weighted |
|---|---:|---:|---:|
| Entry Simplicity | 25% | 2.0 → **3.0** | 0.50 → **0.75** |
| Operational Mapping | 20% | 2.2 → **3.0** | 0.44 → **0.60** |
| Recovery and Error Clarity | 15% | 2.4 → **3.2** | 0.36 → **0.48** |
| Staff Action Continuity | 20% | 2.1 → **3.0** | 0.42 → **0.60** |
| Lifecycle Operations | 20% | 1.9 → **3.0** | 0.38 → **0.60** |
| **Total** | **100%** |  | **2.10 → 3.03 / 5.00** |

Overall normalized score: **42 → ~61/100** (post-PR #191 + UX iteration).

## Overall Rank vs Toast/Clover-Like Baseline
- **Current rank: Behind on operational polish and continuity**.
- **Strength**: broad capability coverage and flexible architecture.
- **Gap**: more context switching, more mock/in-memory behavior, and less deterministic table/QR lifecycle than mainstream workflows staff already know.

## Evidence-Based Findings

### 1) Entry Simplicity (2.0/5)
Why this score:
- Guest flow contains multiple steps and branches before order completion, including optional registration and separate session start handling.
- QR start logic varies by whether table context exists.

Repo evidence:
- Multi-step guest page workflow and conditional branching: `apps/guest/app/guest/[loungeId]/page.tsx`
- Gate behavior requiring/handling table context: `apps/guest/components/guest/QRGate.tsx`
- Separate guest session start endpoint and logic: `apps/guest/app/api/guest/session/start/route.ts`
- Additional session-start forwarding path to app build: `apps/guest/app/api/session/start/route.ts`

Industry contrast:
- Toast/Clover norms favor fewer obvious steps from scan to menu/order and minimal branch complexity for frontline execution.

### 2) Operational Mapping (2.2/5)
Why this score:
- Table/lobby context exists, but guest-side table sync is simulated/mock and not consistently authoritative.
- QR generation and table mapping exist, but canonical pathing and persistence are mixed.

Repo evidence:
- Mock/simulated table data and pseudo real-time sync: `apps/guest/lib/tableDataSync.ts`
- Auto table and QR pack generation during launch flow: `apps/app/app/api/launchpad/create-lounge/route.ts`
- Admin QR URL generation endpoint: `apps/app/app/api/admin/qr/route.ts`
- Secondary QR generation endpoint with in-memory store: `apps/app/app/api/qr-generator/route.ts`

Industry contrast:
- Toast/Clover-like experience typically relies on deterministic, real table state and a single source of truth for table routing.

### 3) Recovery and Error Clarity (2.4/5)
Why this score:
- There are useful fallback responses and warnings, but recovery is often technical and less staff-oriented.
- Some failure handling is "continue anyway" (good for uptime), but can mask operational certainty.

Repo evidence:
- Guest session start fallback when app sync fails: `apps/guest/app/api/session/start/route.ts`
- Guest initialization timeout and generic retry handling: `apps/guest/app/guest/[loungeId]/page.tsx`
- Staff scan page "session not found" handling: `apps/app/app/staff/scan/[sessionId]/page.tsx`

Industry contrast:
- Mainstream systems typically provide direct, action-oriented recovery prompts tied to staff tasks.

### 4) Staff Action Continuity (2.1/5)
Why this score:
- Staff scan experience shows session details, but key actions route staff into separate surfaces.
- Context handoff exists but is not yet a true scan-to-act-in-one-flow pattern.

Repo evidence:
- Staff scan details and limited direct actions: `apps/app/app/staff/scan/[sessionId]/page.tsx`
- Separate admin QR operation page in app: `apps/app/app/admin/qr/page.tsx`
- Separate and richer QR tool in site app: `apps/site/app/admin/qr-generator/page.tsx`

Industry contrast:
- Toast/Clover-like operations favor direct action from the same interaction context with less navigation switching.

### 5) Lifecycle Operations (1.9/5)
Why this score:
- Bulk generation exists, but lifecycle persistence/analytics/state management are partially TODO or in-memory.
- Regeneration and long-lived lifecycle controls are present in UI shape but not fully operationalized end-to-end.

Repo evidence:
- QR service TODOs for persistence and analytics: `apps/app/lib/services/QRCodeService.ts`
- QR storage module explicitly marked TODO with no DB persistence yet: `apps/app/lib/launchpad/qr-storage.ts`
- In-memory QR code collection in API route: `apps/app/app/api/qr-generator/route.ts`

Industry contrast:
- Mainstream staff workflows expect durable inventory-like QR lifecycle: create, print, reprint, rotate, retire, audit.

## Mental Transition Cost Themes (Top Friction)
- Split surfaces for similar QR jobs increase "where do I go?" overhead.
- Mixed in-memory and persistent behaviors reduce predictability during operations.
- Multi-step and branch-heavy guest flow raises coaching burden for staff.
- Staff scan context is informative, but not yet a complete action cockpit.

## Do-Not-Reinvent Guardrails
Adopt these known-good patterns directly:
- Single canonical QR entry and routing path.
- Deterministic table validation and occupancy awareness at scan time.
- Unified staff surface for scan context and immediate next actions.
- Durable QR lifecycle operations (bulk print/reprint/retire with audit trail).

## Next-Level Opportunities (Without Added Cognitive Load)
- Keep baseline UX familiar to Toast/Clover operators, then add "assistive intelligence" only where it removes clicks.
- Make advanced capabilities progressive, not mandatory, so standard shift flows remain simple.
- Use one consistent language model in UI for table/session/QR states across guest and staff surfaces.
