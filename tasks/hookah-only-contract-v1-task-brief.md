# Agent Task Brief: Hookah-only Contract v1

**What:** Implement the checklist in `docs/HOOKAH_ONLY_CONTRACT_V1.md`: Stripe 0.7% take on Checkout Session and PaymentIntent create, fix session checkout metadata to `h_session`, and Square hookah-only v1 (prefix-based GMV).

**Why:** Single source of truth for hookah GMV and platform take; prefix-first keeps Square scope to hookah without Catalog dependency.

**Contract reference:** `docs/HOOKAH_ONLY_CONTRACT_V1.md` (definitions, item rules, webhook rules, GMV formula, exact file locations).

---

## Scope (from contract §6)

### Stripe spine (0.7% path)

1. **Checkout Session create** — `apps/app/app/api/checkout-session/route.ts`
   - `metadata.h_session` already present.
   - Add `payment_intent_data.application_fee_amount: Math.round(amountInCents * 0.007)` when using Stripe Connect (gate by env to avoid errors on direct account).

2. **PaymentIntent create (session checkout)** — `apps/app/app/api/sessions/[id]/checkout/route.ts`
   - Set `metadata.h_session` (not `sessionId`); webhook expects `h_session`.
   - Add `application_fee_amount: Math.round(total * 0.007)` when using Connect.

3. **Webhook** — No code change; fee is set at create.

### Square hookah-only (v1 prefix)

4. **Config** — `HOOKAH_ITEM_NAME_PREFIX = "H+ "` (e.g. in `apps/app/lib/square/processor.ts` or env).

5. **Square processor** — `apps/app/lib/square/processor.ts`
   - From order `line_items`, compute `hookah_amount_cents` = sum of line item totals where `(name || variation_name || '').trim().startsWith(HOOKAH_ITEM_NAME_PREFIX)`.
   - When `hookah_amount_cents > 0`: create/update Session and set session amount to `hookah_amount_cents` (not full order total).
   - When `hookah_amount_cents === 0`: do not create Session for GMV; optionally attach to existing by `reference_id` only.

### Optional (not in scope for this brief)

- Reporting (GMV_hookah_stripe / GMV_hookah_square) — separate task.
- Stripe `h_hookah_only: "true"` metadata — when mixing non-hookah products.
- Square v2 category-based — when Catalog sync exists.

---

## Completion criteria

- [x] Checkout Session create includes 0.7% application_fee_amount when Connect enabled (`STRIPE_APPLICATION_FEE_ENABLED=true`).
- [x] Session checkout PaymentIntent uses `metadata.h_session` and 0.7% when Connect enabled.
- [x] Square processor defines HOOKAH_ITEM_NAME_PREFIX and uses hookah_amount_cents for session create/update when payment completed; skips session create when hookah_amount_cents === 0 and no existing ref.
- [x] Contract doc §6 checklist ticked off for implemented items.

---

## Files to touch

| File | Change |
|------|--------|
| `apps/app/app/api/checkout-session/route.ts` | Add `application_fee_amount` in `payment_intent_data` (Connect-gated). |
| `apps/app/app/api/sessions/[id]/checkout/route.ts` | `metadata.h_session`; add `application_fee_amount` (Connect-gated). |
| `apps/app/lib/square/processor.ts` | Add prefix constant; compute hookah_amount_cents; use it for session amount. |
| `docs/HOOKAH_ONLY_CONTRACT_V1.md` | Tick off implemented checklist items. |

---

## Signals

- **Stripe:** Application fee only applied when `STRIPE_APPLICATION_FEE_ENABLED=true` (Stripe Connect). Direct accounts leave fee unset.
- **Square:** Session `priceCents` and GMV = hookah-only line item total when prefix matches; otherwise no new Session for that payment (or attach to existing by reference_id).
