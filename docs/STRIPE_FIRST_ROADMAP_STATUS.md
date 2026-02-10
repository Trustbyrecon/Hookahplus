# Stripe-first roadmap — implementation status

Status of the "practical next step" items (smallest to biggest). **Did we implement?**

---

## P0: Square↔Session linking via externalRef (no guessing)

**Status: Implemented**

- Square processor links only by `externalRef` (referenceId || orderId || payment.id). The `recentSession` fallback was removed in `apps/app/lib/square/processor.ts` (`findOrCreateSessionForPayment`). When no session matches `externalRef`, a new session is created with `externalRef` set.

---

## P0: Penetration off stage/action + SessionEvent (<30 / 50–60 / 70+)

**Status: Implemented**

- **API:** `GET /api/analytics/penetration?windowDays=30&loungeId=` in `apps/app/app/api/analytics/penetration/route.ts`. Returns `totalSessions`, `byStage` (Payment, Prep, Ready, Deliver, Light), `reachedGuest` (same as `reachedDeliverOrLight`), `penetrationPct`, and `bucket`.
- **Streamline / reduce clicks:** Deliver and Light = one outcome ("guest has session" / NAN). One headline number (`reachedGuest`); `byStage` gives the split when needed. No need to separate for the main metric.

---

## P1: Shift start/end guide + timer nudges (habit)

**Status: Implemented**

- **Shift guide:** `apps/app/components/ShiftGuide.tsx` — Start shift (checklist: prep station, review sessions, confirm device) and End shift (closeout). State in localStorage (`h+_shift_started_at`, `h+_shift_ended_at`). Rendered on fire-session-dashboard above session list.
- **Timer nudge:** (1) Staff: `SimpleFSDDesign` — "Session ending soon — offer extension or close." (2) Guest experience > Control Panel: lounge-layout sidebar (Mini Session Control Panel) and customer `SessionTimer` — same nudge when timer remaining ≤ 5 min ("Session ending soon — offer extension or close." / "ask staff to extend or close.").

---

## P1: Tip goal mechanic + closeout flow (money motivation)

**Status: Implemented**

- **Tip goal:** In `ShiftGuide` — "Set tip goal" during shift (or "Edit" on existing goal); goal and "tips so far" stored in localStorage. Inline display: "Tip goal: $X — $Y so far."
- **Closeout flow:** End shift modal includes tip goal ($), tips entered ($), progress, and "End shift" confirmation. Clears tips on shift end; new shift can set a new goal.

---

## Summary

| Item | Status |
|------|--------|
| **P0 Square↔Session externalRef (no guessing)** | Done — `recentSession` fallback removed; link only by `externalRef` or create new session. |
| **P0 Penetration (stage/action + SessionEvent)** | Done — `GET /api/analytics/penetration` with byStage, penetrationPct, bucket. |
| **P1 Shift guide + timer nudges** | Done — ShiftGuide (start/end checklist + closeout); timer nudge when ≤ 5 min. |
| **P1 Tip goal + closeout flow** | Done — Tip goal + progress in ShiftGuide; closeout in End shift modal. |
