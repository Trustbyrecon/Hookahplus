# Recon Security Boundary

**Invariant:** No refund/payout may be executed unless Recon authorizes it and Recon performs the Stripe call.

This document describes who may hold Stripe credentials, how to flip execution to Recon and how to revert, and the related environment variables. The following upgrades make the boundary enforceable (“Trust Lock”), not just documented.

---

## Key naming (checkout vs refund)

To remove ambiguity and prevent accidental reintroduction of refund keys in H+:

| Variable | Where | Scope / Purpose |
|----------|--------|------------------|
| **`HPLUS_STRIPE_CHECKOUT_KEY`** | H+ only | Checkout / payment-intent creation. **Restricted:** no `refunds:write`. Use for Stripe checkout, PaymentIntents, etc. |
| **`RECON_STRIPE_REFUND_KEY`** | Recon only | Refunds only. **Restricted:** `refunds:write`. Used by Recon payment-executor when `REFUND_EXECUTOR=recon`. |

**Rule:** H+ must **never** hold a key with `refunds:write` scope. That prevents accidental reintroductions when adding or rotating keys.

Legacy names (`STRIPE_SECRET_KEY`, `RECON_STRIPE_SECRET_KEY`) may still be supported for backward compatibility, but the canonical production setup is the two keys above.

---

## Environment variables

| Variable | Where | Purpose |
|----------|--------|---------|
| `REFUND_EXECUTOR` | H+ and Recon | `hookahplus` (default) = H+ may call Stripe for refunds when Recon allows (dev/staging only; see Production guardrail). `recon` = Recon holds refund key and executes; H+ only updates from `execution_metadata`. |
| `RECON_MODE` | Recon | `0` = FULL (future: supervisor + micro-policies), `1` = DEGRADED (deterministic only, escalate medium+), `2` = HALT (block money-moving). |
| `RECON_SHARED_SECRET` | H+ and Recon | Shared secret for HMAC-SHA256 request signing. Recon rejects requests without valid `X-Recon-Signature`. |
| `HPLUS_STRIPE_CHECKOUT_KEY` | H+ only | Stripe key for checkout/payment intents; must **not** have `refunds:write`. |
| `RECON_STRIPE_REFUND_KEY` | Recon only | Stripe key for refunds (`refunds:write`). Used when `REFUND_EXECUTOR=recon`. |

---

## Production guardrail

In **`NODE_ENV=production`**, **`REFUND_EXECUTOR` must be `recon`.**

If `REFUND_EXECUTOR=hookahplus` in production, the refund route **refuses** the request (e.g. 403) **unless** **`BREAK_GLASS_REFUND_EXECUTOR=1`** is set.

That turns this doc into an operational contract: production never executes refunds from H+ except under explicit break-glass.

---

## Break-glass (concrete definition)

**Break-glass** means: queue refunds for manual processing, or use Recon’s executor through an admin-only internal tool.

**Break-glass does not mean:** “temporarily add refund keys to H+.”

That single rule prevents future drift. If Recon is down, you do not put a refund key in H+; you queue or use an admin path that still goes through Recon’s credentials.

---

## Stripe key placement

- **When `REFUND_EXECUTOR=hookahplus` (dev/staging only):** H+ may use a key for refunds only in non-production; Recon has no Stripe keys. In production the guardrail above blocks H+ from executing refunds unless break-glass is set.
- **When `REFUND_EXECUTOR=recon`:** Refund key lives **only in the Recon project** (`RECON_STRIPE_REFUND_KEY`). H+ must **not** possess any key with `refunds:write`; H+ uses `execution_metadata` from Recon to update DB/UI.

**Guardrail:** When `REFUND_EXECUTOR=recon`, H+ must not possess refund-capable Stripe keys. If Recon is down, use break-glass (queue or admin tool using Recon’s executor); do not add refund keys to H+.

---

## Policy-core vs payment-executor

- **Policy-core** never holds Stripe keys; it only evaluates ActionIntent and returns decision + signed_artifact_id.
- **Payment-executor** (Recon) holds **only** `RECON_STRIPE_REFUND_KEY` when `REFUND_EXECUTOR=recon`.

---

## How to flip (H+ executes → Recon executes)

1. Deploy Recon (separate service or Vercel project) with:
   - `RECON_MODE` set as desired (e.g. `0` or `1`)
   - `RECON_SHARED_SECRET` same value as H+
   - **`RECON_STRIPE_REFUND_KEY`** set in Recon **only** (refunds:write only).
2. In the **H+ project**:
   - Set `REFUND_EXECUTOR=recon`.
   - Ensure H+ has **no** key with `refunds:write`; use **`HPLUS_STRIPE_CHECKOUT_KEY`** for checkout only.
3. Deploy both. All refund execution goes through Recon; H+ updates from `execution_metadata`.

---

## How to revert (Recon executes → H+ executes)

1. In **H+**: Set `REFUND_EXECUTOR=hookahplus`. (Only valid in non-production or with break-glass in production.)
2. In **Recon**: Remove or rotate `RECON_STRIPE_REFUND_KEY` if Recon is no longer used for refunds.
3. Deploy. Refund path in H+ will call Stripe from H+ only when not in production (or when break-glass is set).

---

## Checklist (env and keys)

- [ ] **Invariant:** No refund runs without Recon authorizing and Recon performing the Stripe call (or break-glass in production).
- [ ] `REFUND_EXECUTOR` is set: `recon` in production; `hookahplus` only in dev/staging or with `BREAK_GLASS_REFUND_EXECUTOR=1` in production.
- [ ] H+ never holds a key with `refunds:write`; H+ uses `HPLUS_STRIPE_CHECKOUT_KEY` for checkout only.
- [ ] Recon holds **only** `RECON_STRIPE_REFUND_KEY` when executing refunds.
- [ ] `RECON_SHARED_SECRET` is set in both H+ and Recon (same value).
- [ ] `RECON_MODE` is set in Recon as desired (`0`, `1`, or `2`).

---

## Hardening (later)

These make “impossible bypass” explicit at the infra level, even if not in place today:

- **Separate Vercel project for Recon executor** so Recon and H+ are different deployments and envs.
- **Deny H+ outbound access to Stripe refund endpoints** (if feasible at network/firewall level) so H+ cannot call refund APIs even if misconfigured.
- **Store refund key only in Recon executor project** (already required; keep as a hardening checklist item).
- **Rotate `RECON_SHARED_SECRET` regularly** and update both H+ and Recon in a single change window.
