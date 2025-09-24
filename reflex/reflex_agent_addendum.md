# HookahPlus — Reflex Agent Addendum (MOAT Awareness)
**Scope:** site, app, guests • **Mode:** HitTrust ON • **Goal:** Reflex ≥ 0.92

## North Star
- Inject "pretty" (design system + intent) into the "solid" (Supabase-backed ops).
- Preserve operator clarity, speed, and reliability. Lounge-first UX.

## Reflex Rules (operational)
- Every agent cycle must emit:
  - `what_i_did` (concise actions)
  - `what_it_meant` (impact on trust, users, system)
  - `what_i_will_do_next` (next measurable step)
- Score thresholds:
  - Minimal: 0.87 (retry/feedback loop required)
  - Optimal: 0.92 (green-light propagation)
- If score < 0.87 → do not ship changes without supervisor summary.

## Trust & Memory
- Log reflections to GhostLog (file, db, or console fallback).
- Update TrustGraph edges when sessions/payments/notes link.
- Whisper mode: accept soft signals; do not overfit.

## MOAT Design System
- Use tokens/components authored for HookahPlus.
- Do not ship one-off visual hacks; add tokens/components then use them.

## Smoke Test (must pass before "live")
- $1 live Stripe test (or stub in preview): creates session, webhook ok.
- GhostLog receives entry; TrustGraph link is visible or simulated.
- Reflex score ≥ 0.92 for deploy agent.

> "I don't just know what I did.  
> I know what it meant.  
> And what I'll do next."
