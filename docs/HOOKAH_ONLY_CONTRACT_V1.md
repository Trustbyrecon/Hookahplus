# Hookah-only Contract v1

Single source of truth for **hookah GMV** (Stripe + Square), **0.7% take** on the Stripe path, and **prefix-first / category-later** item rules. Use this doc to tick off implementation.

---

## 1. Approach: prefix first, category later

| Phase | Rule | Notes |
|-------|------|--------|
| **v1 (now)** | **Prefix-based** | Line item `name` or `variation_name` starts with config prefix (e.g. `"H+ "`). No Square Catalog API. One config constant. |
| **v2 (later)** | **Category-based** | Line item `catalog_object_id` resolves to category in `HOOKAH_CATEGORY_IDS`. Add when Catalog sync exists. |

**Recommendation:** Ship prefix first; add category when you have Square Catalog in place. Support both (prefix OR category) so existing venues don’t have to rename.

---

## 2. Definitions

- **Hookah session** = One H+ `Session` (the anchor).
- **Hookah GMV (Stripe)** = Sum of successful Stripe charges where Checkout Session or PaymentIntent has `metadata.h_session` set (and optionally `metadata.h_hookah_only = "true"`).
- **Hookah GMV (Square)** = Sum of amounts from Square payments where the linked order’s **hookah-eligible line items** (prefix or category) total ≥ 1¢.
- **GMV_hookah** = GMV_hookah_stripe + GMV_hookah_square.

---

## 3. Item rules (what counts as hookah)

### v1 — Prefix (no Catalog)

- **Stripe:** All payments created from the app for a Session are hookah by definition. Optional: set `metadata.h_hookah_only = "true"` on Checkout/PaymentIntent for future mixed-product flows.
- **Square:** A line item counts as hookah **iff** its display name starts with the configured prefix (e.g. `"H+"` or `"H+ "`). Use `line_item.name` or `line_item.variation_name` (or both), trimmed.
- **Config:** `HOOKAH_ITEM_NAME_PREFIX = "H+ "` (single constant).

### v2 (later) — Category

- **Square:** Line item’s `catalog_object_id` resolves to a category in `HOOKAH_CATEGORY_IDS`. Hookah amount = sum of line item totals for those items (optionally still require name prefix for safety).

---

## 4. Webhook / event rules

### Stripe

- **checkout.session.completed** / **payment_intent.succeeded**
  - Require `metadata.h_session` present.
  - Look up Session by id; if not found, log and do not count toward GMV_hookah.
  - Amount = `amount_paid` (or equivalent). Count 100% toward GMV_hookah (Stripe path is session-based and hookah-only today).
- **0.7% fee:** On every **Checkout Session** and **PaymentIntent** create, set `application_fee_amount = Math.round(amount * 0.007)` (or Connect equivalent).

### Square

- **payment.completed** (or your order + payment flow):
  - Resolve order → line_items.
  - **Hookah-eligible line items** = items matching prefix (v1) or category (v2).
  - **hookah_amount_cents** = sum of `total_money.amount` for those line items only.
  - If `hookah_amount_cents === 0`, do **not** create/update a Session for GMV; optionally attach to existing Session by `reference_id` if you have one.
  - If `hookah_amount_cents > 0`, create/update Session, set `priceCents` (or GMV field) = `hookah_amount_cents`, and feed only this amount into GMV_hookah_square.
- Do **not** include non-hookah line items in GMV_hookah or in session amount.

---

## 5. GMV_hookah formula (baseline)

- **Per Session (Stripe path):** `GMV_hookah += amount_paid` for that Session’s Stripe payment(s).
- **Per Square payment:** `GMV_hookah += hookah_amount_cents` (sum of hookah-eligible line items only).
- **Per venue per period:** `GMV_hookah_venue = sum(GMV_hookah over all sessions/payments for that venue in period)`.
- **0.7% take (Stripe-only):** `revenue_0.7 = 0.007 * GMV_hookah_stripe` (via application_fee).
- **Square path (no automatic fee):** Invoice `0.007 * GMV_hookah_square` (or your rate) monthly.

---

## 6. Implementation checklist

### Stripe spine (0.7% path)

- [x] **Checkout Session create** — `apps/app/app/api/checkout-session/route.ts`
  - Set `metadata.h_session = sessionId` (already present).
  - Add `payment_intent_data.application_fee_amount: Math.round(amountInCents * 0.007)` when `STRIPE_APPLICATION_FEE_ENABLED=true` (Connect).
- [x] **PaymentIntent create (session checkout)** — `apps/app/app/api/sessions/[id]/checkout/route.ts`
  - Set `metadata.h_session: sessionId` (not `sessionId` key; webhook expects `h_session`).
  - Add `application_fee_amount: Math.round(total * 0.007)` when `STRIPE_APPLICATION_FEE_ENABLED=true`.
- [x] **Webhook** — `apps/app/app/api/webhooks/stripe/route.ts` already uses `metadata.h_session`; no change required for GMV counting once fee is set at create.

### Square hookah-only (v1 prefix)

- [x] **Config** — Add `HOOKAH_ITEM_NAME_PREFIX = "H+ "` (e.g. in `apps/app/lib/square/` or env). Implemented in `processor.ts` with env override `HOOKAH_ITEM_NAME_PREFIX`.
- [x] **Square webhook/processor** — `apps/app/lib/square/processor.ts`
  - From each order’s `line_items`, compute `hookah_amount_cents` = sum of line item totals where `(name || variation_name || '').trim().startsWith(HOOKAH_ITEM_NAME_PREFIX)`.
  - Create/update Session and GMV only when `hookah_amount_cents > 0`; set session amount to `hookah_amount_cents` (not full order total).
  - When `hookah_amount_cents === 0`: attach to existing session by reference only; do not create new session for GMV.
- [x] **Reporting** — Expose `GMV_hookah_stripe` and `GMV_hookah_square` (and total) for the period for billing/analytics. Implemented: `GET /api/analytics/gmv?windowDays=30&loungeId=&tenantId=`; uses `Session.paymentGateway` and `Payment` table. Run migration for `payment_gateway` on `Session` (see §9).

### Optional

- [ ] **Stripe metadata** — Add `h_hookah_only: "true"` on Checkout/PaymentIntent create if you later mix non-hookah products.
- [ ] **v2 Square category** — When Catalog sync exists, add `HOOKAH_CATEGORY_IDS` and include line items by category; keep prefix as fallback.

---

## 7. Exact file locations (0.7% Stripe path)

| What | File | Change |
|------|------|--------|
| Checkout Session (main guest checkout) | `apps/app/app/api/checkout-session/route.ts` | Inside `stripe.checkout.sessions.create`, under `payment_intent_data`, add `application_fee_amount: Math.round(amountInCents * 0.007)`. Use Connect if venue is connected account. |
| Session checkout (PaymentIntent) | `apps/app/app/api/sessions/[id]/checkout/route.ts` | (1) In `stripe.paymentIntents.create`, set `metadata: { h_session: sessionId, loungeId: session.loungeId, tableId: session.tableId || '' }` (webhook expects `h_session`). (2) Add `application_fee_amount: Math.round(total * 0.007)`. |
| Stripe webhook (read fee) | `apps/app/app/api/webhooks/stripe/route.ts` | No code change for 0.7%; fee is set at create. Ensure all create paths above set `h_session` and fee. |

---

## 8. Quick reference

- **Prefix v1:** `HOOKAH_ITEM_NAME_PREFIX = "H+ "` → Square line item included if name/variation_name starts with prefix.
- **0.7%:** Applied only on Stripe path at Checkout Session and PaymentIntent create; Square path invoiced separately.
- **GMV_hookah:** Stripe = sum of payments with `h_session`; Square = sum of hookah_amount_cents from processor.

Tick off checklist items as you implement; update this doc when you add category-based rules (v2).

---

## 9. GMV reporting and migration

- **Endpoint:** `GET /api/analytics/gmv?windowDays=30&loungeId=&tenantId=`
- **Response:** `gmv_hookah_stripe_cents`, `gmv_hookah_square_cents`, `gmv_hookah_total_cents` (and dollar equivalents), plus `count_stripe`, `count_square`, `period`, `filter`.
- **Source:** Stripe GMV from `Payment` (status succeeded, paidAt in period); Square GMV from `Session` where `paymentGateway = 'square'`, `paymentStatus = 'succeeded'`, `updatedAt` in period.
- **Migration:** Add column `payment_gateway` (nullable string) to `Session`. Set `paymentGateway: 'stripe'` in Stripe webhook when confirming payment; set `paymentGateway: 'square'` in Square processor when creating/updating session. Then run: `npx prisma migrate dev --name add_session_payment_gateway` (or `prisma db push`).
