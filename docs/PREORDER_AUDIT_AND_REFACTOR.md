# Pre-Order Experience Audit & Refactor Plan

**Date:** March 19, 2025  
**Scope:** Hookah+ Pre-Order flow (loungeID=CODIGO + default)  
**Goal:** Bring Pre-Order to parity with dashboard, operator flow, and product maturity

---

## Step 1: Audit Summary

### Critical Gaps

| Area | Current State | Gap |
|------|---------------|-----|
| **Lounge context** | Hardcoded `loungeId="default-lounge"` | No CODIGO support; table validation doesn't pass loungeId |
| **Flavor selection** | Generic FlavorWheelSelector | CODIGO uses menu presets (Noor Al Ein, Shah's Eclipse, etc.) |
| **Pricing** | Uses lib/pricing with $30 flat | CODIGO has $60/$30 from PilotConfig; no lounge config fetch |
| **Add-ons** | SAMPLE_ADDONS hardcoded | Not configurable per lounge |
| **Checkout API** | POST /api/checkout-session | **Route missing** in apps/app – flow broken |
| **PreOrder model** | Exists in schema | PreorderEntry creates Session directly, bypasses PreOrder |
| **$1 Test Mode** | Prominent in customer UI | Operator-only; should be hidden or config-based |
| **Customer info** | "Pre-Order Guest" only | No name/phone for handoff, loyalty, or confirmation |
| **Thank-you page** | apps/site/thank-you/preorder | Campaign signup copy; not QR checkout confirmation |

### UI/UX Gaps

| Area | Issue |
|------|-------|
| **Copy** | "Preorder Your Session" generic; no lounge branding |
| **Information architecture** | Test mode above pricing; weak hierarchy |
| **Trust signals** | No security badges, encryption info |
| **Mobile** | Basic responsive; not mobile-first |
| **Confirmation** | No clear pre-order confirmation state before Stripe |
| **Operator handoff** | Session created but metadata shallow (no guest handle, party size) |

### Schema/Data Gaps

| Field | PreOrder model | Session creation | Gap |
|-------|---------------|-----------------|-----|
| guestHandle | ✓ | — | Not collected |
| partySize | ✓ | — | Not collected |
| flavorMixJson | ✓ | flavor (string) | Structure differs |
| loungeId | ✓ | default-lounge | Not contextual |
| metadata | ✓ | — | Minimal |
| qrCode | ✓ | — | Not set |

### Alignment with Mature Parts

**CreateSessionModal (operator flow):**
- Fetches lounge config for CODIGO (menu, pricing, staff)
- Uses CODIGO_MENU presets, flavorAddOnFree
- Shisha Master, table selector, staff assignment
- Toast pilot: Copy for Toast, no Stripe

**Fire Session Dashboard:**
- ThemeProvider, SessionProvider, Breadcrumbs, PageHero
- Layout mode (floor/classic), feature flags
- PostCheckoutEngagement, guest tracker redirect

**Pre-Order currently:** Minimal provider wrappers, no lounge config, no CODIGO path.

---

## Step 2: Target Experience

### Customer Flow (Mobile-First)

1. **Entry** – QR scan → `/preorder/[tableId]?lounge=CODIGO` (or default)
2. **Context** – Lounge name, table, zone; trust badge
3. **Flavor** – Lounge presets (CODIGO) or wheel (default)
4. **Pricing** – Lounge config; $1 test hidden unless enabled
5. **Optional add-ons** – From lounge config
6. **Guest info** – Name (optional), phone (optional, for SMS)
7. **Review** – Clear breakdown, CTA
8. **Checkout** – Stripe redirect
9. **Success** – PostCheckoutEngagement → guest tracker

### Operator Handoff

- Session metadata: `source: 'QR'`, `externalRef`, flavor mix, party size, guest handle
- PreOrder record (optional) for audit trail
- FSD shows session; staff can prep/deliver

### Lounge Configuration Support

- `loungeId` from URL or table validation
- Fetch `/api/lounges/[loungeId]/config` for pricing, menu, add-ons
- CODIGO: flat-only, presets, $60/$30, flavorAddOnFree

---

## Step 3: Refactor Plan

### Phase 1: Fix Critical Path
1. Create `POST /api/checkout-session/route.ts` – Stripe checkout creation
2. Add `loungeId` to preorder page (URL param or default)
3. Pass loungeId to table validation

### Phase 2: Lounge-Aware Pre-Order
4. Fetch lounge config in PreorderEntry
5. CODIGO: use menu presets, flavorAddOnFree, lounge pricing
6. Move $1 test to operator-only or config flag

### Phase 3: UX & Content
7. Add guest name/phone (optional)
8. Improve copy, hierarchy, trust signals
9. Mobile-first layout

### Phase 4: Schema & Handoff
10. Enrich session metadata (party size, guest handle)
11. Optional PreOrder creation for audit
12. Align confirmation flow with PostCheckoutEngagement

---

## Product-language refresh (wizard + schema)

- **Staged flow:** Welcome → Flavors → (Session & add-ons, non-CODIGO) → Guest → Review → Stripe.
- **Session source:** `RESERVE` with full payload (not bare QR resolver) so `flavor`, `flavorMix` (display labels), `priceCents`, `customerRef`, `customerPhone`, `notes` populate for operators.
- **Structured notes:** `tableNotes` includes a `[Hookah+ Pre-Order]` JSON block (`PreorderOperatorMetadata`) for CLARK opt-in, party size, pricing model, add-ons, lounge/table, `schemaVersion: 1`.
- **Stripe metadata:** `hp_preorder`, `hp_party_size` on Checkout Session (no raw PII).
- **Types:** `apps/app/lib/preorder/types.ts`, `flavor-display.ts`, `index.ts`.
- **UI:** `PreorderStepIndicator`, mobile single sticky action bar, premium copy, party size capped by table capacity.

## Step 4: Implementation (Completed)

### Files Created
- **`apps/app/app/api/checkout-session/route.ts`** – POST handler for Stripe Checkout Session creation. Accepts `sessionId`, `flavors`, `tableId`, `loungeId`, `amount`, `dollarTestMode`. Returns `{ success, url }`. Uses `h_session` metadata for webhook linking.

### Files Modified

**`apps/app/app/preorder/[tableId]/page.tsx`**
- Added `loungeId` from URL param `?lounge=CODIGO`
- Pass `loungeId` to table validation API
- QR URL includes `?lounge=` when not default
- Header copy: "Pre-Order Your Session", trust badge (Shield)
- Pass `showTestMode={searchParams.get('test') === '1'}` to PreorderEntry
- Wrapped in Suspense for useSearchParams
- FSD links use `?session=` (not sessionId)

**`apps/app/components/PreorderEntry.tsx`**
- New prop: `showTestMode` – $1 test toggle only when `?test=1`
- CODIGO: Fetch lounge config for menu presets, customFlavors, pricing
- CODIGO: FlavorWheelSelector with `customPresets`, `customFlavors`, `flavorAddOnFree`
- CODIGO: Hide pricing model selector (flat-only)
- Copy: "Choose Your Blend" vs "Pre-Order Your Session" for CODIGO
- Trust copy: "Secure checkout powered by Stripe"

**`apps/app/app/api/preorder/calculate-price/route.ts`**
- CODIGO: Fetch PilotConfig via Prisma for `basePriceCents`, `flavorAddOnFree`
- Pass to `calculatePrice` for lounge-specific pricing

**`apps/app/lib/pricing.ts`**
- New options: `basePriceCents`, `flavorAddOnFree`
- When `flavorAddOnFree`, flavor add-ons = 0
