# District Hookah — 30-Day Pilot Metrics (3 locations)

This defines the **3–5 board-ready KPIs** for the Triple-Anchor Pilot and exactly how we capture baseline and pilot deltas using existing Hookah+ data surfaces.

## Metric 0: Baseline window (required)
- **Baseline window**: minimum **7 days** immediately before pilot go-live (preferred 14).\n- **Pilot window**: day 1–30.\n- **Reporting cadence**: daily ops + weekly exec rollup + week-4 closeout report.

## KPI 1 — Throughput / Utilization (table-hours monetized)
**Goal**: prove Hookah+ increases the number of sessions served per capacity unit without harming experience.

- **Definition** (per location):\n  - \(SessionsPerTableHour = \\frac{TotalSessions}{TablesCount \\times OperatingHours}\)\n  - \(UtilizationPercent\\) (if you use layout analytics) as a primary “speed + occupancy” signal.\n- **Primary data source**:\n  - Lounge analytics summary includes `totalSessions`, `averageUtilization`, `averageSessionValue`.\n  - Implementation surface: `GET /api/lounges/analytics?loungeId=...&timeRange=7d|30d&metric=sessions|utilization`.\n    - See [apps/app/app/api/lounges/analytics/route.ts](../../apps/app/app/api/lounges/analytics/route.ts).\n- **Backup data source** (no layout dependency):\n  - Session rows with `startedAt`, `endedAt`, `durationSecs`, `tableId`.\n  - Schema: [apps/app/prisma/schema.prisma](../../apps/app/prisma/schema.prisma) `Session` model fields `startedAt`, `endedAt`, `durationSecs`, `tableId`, `loungeId`.\n\n**Target**: +5% to +10% improvement within 30 days on the 3 pilot anchors.

## KPI 2 — Average Session Value (ASV) + Upsell Attachment
**Goal**: prove premium flavor/mix and add-ons are being captured, not left to memory.

- **Definition**:\n  - \(ASV = \\frac{TotalRevenue}{TotalSessions}\\)\n  - Upsell attachment: % sessions with premium-tier flavor/mix or add-on events.\n- **Primary data source**:\n  - Analytics summary `averageSessionValue` (table metrics rolled up).\n  - Sessions API includes `priceCents` and settlement updates can roll base + orders into final `priceCents`.\n    - See settlement logic updating `priceCents` in [apps/app/app/api/sessions/route.ts](../../apps/app/app/api/sessions/route.ts).\n- **Operational instrumentation** (recommended during pilot):\n  - Log a GhostLog entry for each of these events:\n    - `upsell.premium_flavor`\n    - `upsell.coal_refresh`\n    - `upsell.second_hookah`\n    - `session.refill`\n  - These are “no-POS-required” proof points (tie to sessionId/tableId + timestamp).

**Target**: +$2–$5 ASV improvement in pilot locations (venue-specific; nightclubs differ from outdoor surge).

## KPI 3 — Turnaround Time (dead real estate recovered)
**Goal**: reduce time between a session ending and the next session starting at the same table/section.

- **Definition**:\n  - \(TurnaroundMinutes = Avg(startedAt_{next} - endedAt_{prev})\\) for the same `tableId`.\n- **Data source**:\n  - Session rows (`tableId`, `startedAt`, `endedAt`).\n- **Notes**:\n  - In surge venues (Bullpen), use **section-level** or “queue time” proxy if tables are non-stationary.

**Target**: -10% to -20% turnaround time reduction at pilot anchors.

## KPI 4 — Labor Efficiency Proxy (minutes saved per shift)
**Goal**: demonstrate staff time is being redirected from “status hunting” to revenue work.

- **Definition options**:\n  - **Proxy A (Week-1 Wins)**: `timeSavedPerShift` (minutes)\n  - **Proxy B**: “touches” per session via logged GhostLog/Telemetry events.\n- **Existing metric shape**:\n  - `WeekOneWins` includes `timeSavedPerShift` and `totalWins`.\n  - Type is defined in [apps/app/types/launchpad.ts](../../apps/app/types/launchpad.ts) (`WeekOneWins`).\n  - There is an API surface for rollups: `GET /api/launchpad/week1-wins?...` (org or lounge scope).\n\n**Target**: 10–20 minutes saved per shift per pilot location by week 2.

## KPI 5 — Reconciliation Drift Rate (immune system queue)
**Goal**: prove the system reduces charge/ticket mismatches and multi-active session anomalies.

- **Definition**:\n  - Drift rate per day: count of DriftEvents by `action_type` per location.\n  - Primary drift types to monitor:\n    - `recon.session.multi_active` (multiple active sessions on same table)\n    - `recon.square.unassigned_ticket`\n    - `recon.square.reconciliation_drop`\n    - `recon.square.payment_mismatch`\n- **Data source**:\n  - `DriftEvent` model exists in Prisma and is indexed by `created_at`, `action_type`, `lounge_id`.\n  - Read-only summary endpoint exists: `GET /api/recon/drift-summary?action_type=...&hours=24`.\n    - See [apps/app/app/api/recon/drift-summary/route.ts](../../apps/app/app/api/recon/drift-summary/route.ts).\n\n**Target**: measurable reduction (or at minimum, rapid detection + resolution SLA improvement). For pilot, we track:\n- drift count/day\n- time-to-resolution (manual in pilot report; later can be automated)

## Baseline capture checklist (Week 0)
For each pilot location:\n- tables/sections count + operating hours\n- current average session price tiers (standard/premium)\n- typical session duration range\n- any existing POS exports available (orders/payments)\n- staff schedule/headcount per peak window

## Pilot closeout report (Week 4)
Deliver a single “Valuation Impact” page that ties deltas to EBITDA lift:\n- Throughput delta → revenue uplift\n- ASV delta → margin uplift\n- Turnaround delta → “capacity created”\n- Labor proxy delta → cost reduction\n- Drift delta → dispute reduction + partner trust

