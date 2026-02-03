# Daily Pulse Briefings & Staff Value — Assessment

## Daily Pulse Briefings — Are we stubbed out?

**Yes, in the right places.**

### Implemented (not stubbed)

| Feature | Location | Notes |
|--------|----------|--------|
| **Daily Pulse Briefings** | `/pulse` page + Fire Session Dashboard (compact card when not demo) | Full page with headline "Daily Pulse Briefings", subhead "Real-time insights into your lounge operations and performance". |
| **Morning & 3PM briefings** | `PulseCard` + `/api/pulse` | Window toggle: **Morning Briefing (24h)** and **3PM Briefing (12h)**. API `GET /api/pulse?window=24h|pm&loungeId=`; `lib/pulse-generator.ts` uses 24h or 12h window. |
| **Comprehensive summaries** | `generateDailyPulse()` | Summary text, sessions, revenue, avg duration, edge cases, top flavors, recommendations. |
| **Updated every 5 minutes** | `PulseCard` | `refreshInterval = 5 * 60 * 1000` when `autoRefresh={true}`. |
| **Data-driven insights** | PageHero trust indicator | Shown on `/pulse` as "Data-driven insights". |

**Files:**  
- `apps/app/app/pulse/page.tsx` — Full pulse page (hero, window toggle, PulseCard, Historical section).  
- `apps/app/components/PulseCard.tsx` — Fetches `/api/pulse`, compact + full view, 5‑min refresh.  
- `apps/app/app/api/pulse/route.ts` — GET pulse; uses `generateDailyPulse(window, loungeId)` or demo fallback.  
- `apps/app/lib/pulse-generator.ts` — `generateDailyPulse()`, `generateDemoPulse()`.

### Stubbed (future)

| Feature | Location | Copy |
|--------|----------|------|
| **Historical View** | `/pulse` page, bottom section | "Historical View" heading + "Historical pulse data (last 7 days) will be available in a future update." |

So: **Daily Pulse (Morning / 3PM, 5‑min refresh, summaries)** is implemented; **Historical pulse (last 7 days)** is explicitly stubbed with future-update copy.

---

## Staff value / usage — How much have we been focusing on it?

**Heavy focus.** Here’s what’s in place for staff value and usage:

| Area | What’s in place |
|------|------------------|
| **Workflow & reduce clicks** | Square↔Session link only by `externalRef` (no guessing). Penetration = one headline "reached guest" (Deliver or Light). |
| **Habit** | Shift start/end guide (checklist + closeout). Timer nudges when session ≤ 5 min (staff FSD, lounge Control Panel, guest SessionTimer). |
| **Money motivation** | Tip goal (set/edit during shift). Closeout flow in End shift (tip goal + tips entered + progress). |
| **Visibility** | Penetration API (`reachedGuest`, byStage, bucket). GMV API (Stripe/Square/total). Daily Pulse (Morning 24h, 3PM 12h, 5‑min refresh). |
| **Control Panel / guest experience** | Nudge in lounge-layout Mini Session Control Panel and in customer SessionTimer. |

So we’ve been deliberately investing in: **fewer clicks**, **clear one-number metrics**, **shift ritual + timer nudges**, **tip goal + closeout**, and **pulse briefings** — all aimed at staff value and usage. Historical Pulse (7 days) is the main thing left stubbed for a future update.
