# T6 — Admin CODIGO KPI view

## Goal
Provide a minimal admin page that renders the CODIGO KPI summary for a selected date range. Must be usable on desktop and Toast handheld browser.

## Scope
- Add `/admin/codigo-kpis` page.
- Date range selector (simple inputs).
- KPI cards (no charts for MVP).
- Calls `GET /api/codigo/kpis/summary`.

## Acceptance criteria
- Page loads quickly and is readable on small screens.
- No admin navigation refactor required.

## File touch list (target)
- `apps/app/app/admin/codigo-kpis/page.tsx`
- `apps/app/components/ui/card.tsx` (reuse only)
- `apps/app/components/ui/button.tsx` (reuse only)

