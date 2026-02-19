# District Hookah — POS Discovery + Minimal Integration Matrix

POS vendor is currently **unknown**. This document lets you discover it quickly and choose the lowest-risk integration mode for the 30-day pilot.

## Prime directive
**Hookah+ runs above POS.** The pilot can succeed in **shadow mode** (no integration) as long as we can measure throughput, upsell, and drift, and operate a consistent close-out workflow.

## Fast discovery script (15 minutes)
Ask these questions per pilot venue:

1) **What POS is the venue using today?** (Square / Toast / Clover / other)\n2) **Do you (District Hookah) have access** to venue POS reporting or only your own internal tracking?\n3) **Where does payment happen?**\n   - venue POS only\n   - Stripe terminals / Stripe checkout\n   - mixed\n4) **How do you reconcile hookah sessions to tickets today?**\n   - receipt notes\n   - external tender references\n   - manual spreadsheet\n5) **Do you want POS integration in the pilot**, or do you want to stabilize ops first and integrate after week 2?

## Integration modes (what we can do today)
These align with the product’s existing modes and adapter architecture.

### Mode 1: Shadow (recommended pilot default)
- **What it is**: Hookah+ manages sessions independently; POS remains the payment/ticket source of truth.\n- **Pros**: fastest, lowest risk, no credentials required.\n- **Cons**: manual reconciliation discipline required.\n- **Use when**: POS vendor unknown, venue won’t share credentials, or you want immediate speed wins.\n\nSee `POSModeService` concept (shadow/mirror/ticket) in [apps/app/lib/posModeService.ts](../../apps/app/lib/posModeService.ts).

### Mode 2: Mirror (sync + reconcile)
- **What it is**: Hookah+ syncs paid sessions to POS artifacts for unified reporting.\n- **Pros**: better reporting + reconciliation automation.\n- **Cons**: requires API access; adds operational dependencies.\n\nSee POS sync service: [apps/app/lib/pos/sync-service.ts](../../apps/app/lib/pos/sync-service.ts).

### Mode 3: Ticket (POS-compatible ticket generation)
- **What it is**: Hookah+ generates tickets for the POS system.\n- **Pros**: closer to native POS workflow.\n- **Cons**: highest dependency on POS specifics.\n
## Provider matrix (Square / Toast / Clover / Stripe-only)

### Square
- **Status**: production-ready adapter.\n- **Access needed**:\n  - Square OAuth app (client id/secret) or access token\n  - location id\n- **Best pilot path**:\n  - Week 1: Shadow\n  - Week 2: Mirror + external tender reconciliation\n- **Docs**:\n  - [docs/SQUARE_INTEGRATION.md](../SQUARE_INTEGRATION.md)\n  - [docs/POS_INTEGRATION_ARCHITECTURE.md](../POS_INTEGRATION_ARCHITECTURE.md)

### Toast
- **Status**: “implementation ready” (partner onboarding typically required).\n- **Access needed**: partner API credentials + approval.\n- **Best pilot path**: Shadow for pilot; plan Toast integration post-pilot unless partner access is already in place.\n- **Docs**: [docs/POS_INTEGRATION_ARCHITECTURE.md](../POS_INTEGRATION_ARCHITECTURE.md)

### Clover
- **Status**: “implementation ready.”\n- **Access needed**: OAuth credentials, merchant id, access token.\n- **Best pilot path**: Shadow for pilot; mirror later if credentials available.\n- **Docs**: [docs/POS_INTEGRATION_ARCHITECTURE.md](../POS_INTEGRATION_ARCHITECTURE.md)

### Stripe-only (no venue POS integration)
- **What it means**: Hookah+ uses Stripe payments and keeps POS out of scope.\n- **Best pilot path**: Shadow + Stripe instrumentation.\n- **Docs**:\n  - [docs/STRIPE_WEBHOOK_VERCEL_SETUP.md](../STRIPE_WEBHOOK_VERCEL_SETUP.md)\n  - [apps/app/docs/CHECKOUT_SESSIONS_PRODUCTION.md](../../apps/app/docs/CHECKOUT_SESSIONS_PRODUCTION.md)

## Minimum viable reconciliation checklist (works in Shadow mode)
Per session, ensure one stable join key exists between Hookah+ and the POS receipt/ticket:\n- tableId + timestamp window\n- staff initials\n- a short receipt note convention (e.g., `H+ {sessionIdSuffix}`)\n\nDaily close-out:\n- export / print POS close report\n- compare to Hookah+ closed sessions count\n- log mismatches as DriftEvents or GhostLog entries (so they’re visible and trackable)

## When to integrate (decision gates)
- **Gate A (end of week 1)**: staff adoption ≥ 80% and session close-out stable.\n- **Gate B (end of week 2)**: drift rate stable/declining and reconciliation workflow reliable.\n- **Then**: integrate the POS vendor for automated sync/reconcile if access is granted.

