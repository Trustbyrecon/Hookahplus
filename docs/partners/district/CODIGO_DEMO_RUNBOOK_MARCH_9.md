# Demo RunbookCODIGO Pilot  — Monday March 9, 11am

**Meeting:** Mo (District Hookah) — CODIGO pilot alignment  
**Scope:** Production, app-only (no guest app)

---

## Pre-Meeting Status

- **CODIGO pilot data seeded** — PilotConfig + FloorplanLayout for lounge CODIGO
- **Core APIs verified** — Health, layout, join return 200
- **Join flow working** — H+ Passport enrollment returns memberId
- **Config layoutMode** — Production must run the latest app build. If verify shows `layoutMode=undefined`, redeploy so the config route includes `layoutMode` (required for FSD Floor tab).

### FSD 500 Troubleshooting

If `GET /fire-session-dashboard?lounge=CODIGO` returns 500:

1. **Check server logs** — The terminal running the app will show the error stack trace.
2. **Verify config API** — `curl http://localhost:3002/api/lounges/CODIGO/config` (or production URL). If this returns 500, the config route is failing.
3. **Verify floorplan** — After calibrating and saving floor JSON, ensure `FloorplanLayout` exists for CODIGO. Run `npx tsx scripts/verify-codigo-pilot.ts`.
4. **Redeploy** — Ensure the latest app build is deployed (includes layoutMode + defensive config handling).

---

## Production Deployment Checklist

Before the meeting, ensure:

1. **Database** — CODIGO seed has been run against production DB:
   ```bash
   cd apps/app
   npx tsx scripts/seed-codigo-pilot.ts
   ```

2. **Deploy** — App deployed to production (e.g. `app.hookahplus.net`)

3. **Verify** (after deploy):
   ```bash
   NEXT_PUBLIC_APP_URL=https://app.hookahplus.net npx tsx scripts/verify-codigo-pilot.ts
   ```

---

## Demo Flow for Mo (11am)

| Step | URL | Action |
|------|-----|--------|
| 1 | `https://app.hookahplus.net/fire-session-dashboard?lounge=CODIGO` | Show Floor tab, seat layout |
| 2 | Create Session (modal) | Pick table 301 → customer + flavor → submit |
| 3 | `https://app.hookahplus.net/codigo/join` | First name → Join → "You're in" → Add to Wallet |
| 4 | `https://app.hookahplus.net/admin/qr?mode=demo` | Lounge: CODIGO, Table: 301, Demo mode on → generate QR |
| 5 | `https://app.hookahplus.net/admin/codigo-kpis` | Date range, KPI cards |

**Note:** Use `?mode=demo` on Admin QR so the route is accessible without auth.

---

## Talking Points (from task brief)

- **Pilot goals:** Align on goals, confirm scope, answer questions
- **Feedback categories:** Staff friction, owner visibility, customer flow, setup confusion, missing features, unexpected value
- **Positioning:** "Pilot to learn fast — capture what works, what slows the team down, what creates immediate value"
- **Low-risk:** Not irreversible; validate fit in real environment; feedback shapes the product
- **Decision path:** "At the end of the pilot, we'll review results together, identify what delivered value, what needs refinement, and decide the right path for broader rollout or deeper integration"

---

## Quick Reference URLs

| Page | URL |
|------|-----|
| Fire Session Dashboard | `/fire-session-dashboard?lounge=CODIGO` |
| H+ Passport Join | `/codigo/join` |
| Admin QR (demo mode) | `/admin/qr?mode=demo` |
| KPI View | `/admin/codigo-kpis` |
