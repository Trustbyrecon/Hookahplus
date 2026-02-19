# District Hookah — Frictionless Onboarding Runbook (3-location / 30-day pilot → 13 rollout)

This runbook is the **operator-facing** and **internal ops** checklist to onboard District Hookah with minimal friction using existing Hookah+ flows (Operator Onboarding + LaunchPad multi-location provisioning).

## The one sentence to keep everything aligned
**We don’t replace the venue POS. We run above it** to standardize sessions, memory, upsell, and reconciliation across all venues.

## Roles (who does what)
- **DistrictSponsor (Operator leadership)**: final decisions, confirms pilot anchors + rollout trigger\n- **DistrictOpsLead**: day-to-day pilot execution, staff adoption\n- **VenuePartnerContact (per anchor)**: where permitted, provides constraints and feedback\n- **HookahPlusPilotLead (you)**: onboarding, training, metrics, weekly exec readout\n- **HookahPlusSupport**: rapid fixes, reconciliation / drift triage

## Pilot anchors (Triple-Anchor)
Use these as the default 3-location pilot set:\n- Casino anchor: **Diablo’s Cantina (MGM)**\n- Surge anchor: **The Bullpen DC**\n- Urban nightclub anchor: **Opera Ultra Lounge**

## Pre-work (Week 0)
Collect these before LaunchPad Day:\n- table/section counts per pilot location (estimate is fine)\n- operating hours and peak windows\n- standard + premium menu tiers and top 5 flavors\n- staff roles and headcount per shift\n- POS vendor per venue (Square/Toast/Clover/Other/None) and whether exports are possible\n\nUse the discovery checklist in `DISTRICT_HOOKAH_OUTREACH_AND_DISCOVERY.md`.

## Path A — Operator Onboarding (lead + pilot skeleton)
1. Navigate to **Admin → Operator Onboarding** and create a lead:\n   - `businessName`: District Hookah\n   - `operatorGroupName`: District Hookah (or “District Hookah DMV” if you prefer)\n   - `locationCount`: 13\n   - `locationNamesCsv`: include all 13 venue partners (or at minimum the 3 anchors)\n   - store links: website + Instagram\n\nImplementation surface: the UI supports multi-location lead fields (`locationCount`, `locationNamesCsv`) in [apps/app/app/admin/operator-onboarding/page.tsx](../../apps/app/app/admin/operator-onboarding/page.tsx).

2. Set the lead stage to **onboarding** once kickoff is scheduled.

## Path B — LaunchPad (multi-location provisioning)
LaunchPad is the **single path** that provisions:\n- one or more lounges (tenants)\n- lounge config + pricing rules\n- QR code packs\n- staff playbooks

LaunchPad entry: [apps/app/app/launchpad/page.tsx](../../apps/app/app/launchpad/page.tsx)

### LaunchPad Step 1 — Venue Snapshot (multi-location)
Step 1 supports multi-location capture:\n- `multiLocationEnabled`: true\n- `organizationName`: District Hookah\n- `locations`: list of venues with table counts\n\nUI logic enforces:\n- organizationName required\n- at least **2 locations**\n- each location must have a name and table count\n\nSee: [apps/app/components/launchpad/VenueSnapshotStep.tsx](../../apps/app/components/launchpad/VenueSnapshotStep.tsx)

**Pilot-friendly default**:\n- Enter all 13 locations if you have table estimates; otherwise enter the 3 anchors + 1 placeholder “Location 4” to keep multi-location enabled.\n- For Bullpen (surge), treat “tablesCount” as “active session capacity” during a peak window.

### LaunchPad Step 2 — Flavors & Mixes
Enter:\n- top 5 baseline flavors\n- premium tier candidates\n- any signature mixes (venue-specific)\n\nGoal: enable upsell attachment measurement even if POS is not integrated.

### LaunchPad Step 3 — Session Rules
Configure per the pilot location archetype:\n- **Casino/VIP (Diablo’s @ MGM)**: prioritize premium upsell prompts + controlled extensions\n- **Surge/Outdoor (Bullpen)**: prioritize speed, reduced turnaround, and rapid close-out\n- **Nightclub (Opera)**: prioritize “low-visibility” workflows and quick re-order prompts\n+\nAt minimum set:\n- pricing model: timed vs flat\n- base session price\n- grace period and extension policy\n\n### LaunchPad Step 4 — Staff Roles
Add the minimum staff cohort for each pilot location:\n- Owner/Operator\n- Manager/Ops lead\n- FOH (session creation + guest comms)\n- BOH/Runner (prep + coal refresh + delivery)\n\nGoal: reduce tribal knowledge by encoding responsibilities into the system.\n\n### LaunchPad Step 5 — POS Bridge (vendor discovery + operating mode)\nThis step records the POS posture without blocking go-live.\n\nSupported selections include `square | toast | clover | stripe | none` (see [apps/app/components/launchpad/POSBridgeStep.tsx](../../apps/app/components/launchpad/POSBridgeStep.tsx)).\n\n**Pilot default if POS vendor is unknown**:\n- choose `none` (runs above POS)\n- use the reconciliation checklist in `DISTRICT_HOOKAH_POS_DISCOVERY_AND_MATRIX.md`\n\n### LaunchPad Step 6 — Go Live\nGo Live provisions the operator group’s locations.\n\nProvisioning logic can create one lounge or many depending on multi-location settings (see [apps/app/app/api/launchpad/create-lounge/route.ts](../../apps/app/app/api/launchpad/create-lounge/route.ts)).\n\nOutputs to distribute to each pilot location:\n- dashboard URL\n- QR code pack (tables + kiosk)\n- staff playbook\n\n## Training plan (pilot week 1)\nRun two trainings per location (15–30 minutes each):\n\n### Training A — FOH session lifecycle\n- QR scan → create session\n- assign staff\n- track status changes\n- capture upsells (premium flavor, coal refresh)\n- close-out workflow\n\n### Training B — BOH/Runner execution\n- prep workflow\n- delivery workflow\n- coal refresh cadence\n- surge handling (Bullpen-specific)\n\n## Daily ops cadence (pilot weeks 2–4)\n\n### Shift start (5 minutes)\n- confirm tablets/devices are charged\n- confirm QR codes visible and working\n- confirm staff logins/roles\n- confirm “today’s premium focus” (1–2 high-margin mixes)\n\n### During shift\n- treat Hookah+ as the session truth layer\n- keep POS as payment/ticket truth layer until integrated\n- log exceptions in Ghost Log (refunds, disputes, outages)\n\n### Shift close (10 minutes)\n- confirm sessions closed\n- capture notable drift events\n- note staffing constraints and queue failures\n\n## Metrics capture (minimal friction)\nUse the KPI definitions in `DISTRICT_HOOKAH_PILOT_METRICS.md`.\n\nMinimum daily capture per pilot location:\n- sessions served\n- ASV proxy (average `priceCents` or menu tier counts)\n- top 3 upsell events\n- drift count (if any)\n\n## Troubleshooting surfaces\n- LaunchPad readiness: `GET /api/launchpad/readiness?loungeId=...&token=...`\n- Setup session inspector: Admin → onboarding inspector (if enabled)\n- Drift summary: `GET /api/recon/drift-summary?action_type=...&hours=24`\n- Ghost Log viewer: `/admin/ghost-log`\n\n## Rollout to all 13 (after pilot “yes”)\n- Roll out by archetype clusters:\n  1) MGM/casino\n  2) nightclub core\n  3) outdoor surge\n  4) suburban rooftops/dining\n- Apply the same LaunchPad location template and update table counts/hours.\n- Only deepen POS integration after the “runs above POS” workflow is stable.\n+
