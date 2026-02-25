# T5 — CODIGO KPI summary endpoint

## Goal
Expose a lightweight KPI summary endpoint for the CODIGO pilot window that can be consumed by an admin view and weekly reporting.

## Scope
- Add `GET /api/codigo/kpis/summary?start=...&end=...`
- Return:
  - sessions count
  - premium attachment rate (per best measurable definition)
  - avg session duration
  - idle time estimate
  - member capture rate
  - profile completion rate
  - repeat rate (or `null` if identity coverage is insufficient)
- Efficiency: query by `loungeId="CODIGO"` and time window; avoid per-session N+1.

## Acceptance criteria
- Endpoint returns stable JSON with explicit `null` for unavailable KPIs.
- Response includes `coverage` fields where relevant.

## File touch list (target)
- `apps/app/app/api/codigo/kpis/summary/route.ts`
- `apps/app/app/api/sessions/*` (only if needed for shared helpers)
- `apps/app/prisma/schema.prisma` (no changes expected)

