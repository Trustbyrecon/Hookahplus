# Hookah+ Stripe Full Bundle (Env-based PIN)
This bundle includes serverless functions, a test checkout button, staff notes UI, and a mini dashboard.

## Files
- netlify/functions/createCheckout.js
- netlify/functions/stripeWebhook.js
- netlify/functions/sessionNotes.js
- netlify/functions/getSessionNotes.js
- app/page.tsx (Test Checkout button)
- app/checkout/success/page.tsx, app/checkout/cancel/page.tsx
- app/staff/notes/page.tsx (PIN-gated write)
- app/dashboard/notes/page.tsx (PIN-gated read)
- netlify.toml (+ @netlify/plugin-nextjs)
- _headers (security/cache)
- cmd/run.sh (deploy + fireSession)
- .env.example (placeholders; set these in Netlify env)

## Netlify Env (UI → Site settings → Build & deploy → Environment)
STRIPE_SECRET_KEY=sk_test_…
APP_BASE_URL=https://hookahplus.net
STRIPE_WEBHOOK_SECRET=whsec_…
NEXT_PUBLIC_STAFF_DEMO_PIN=735911

## Ship
1) New branch (e.g., feat/stripe-full-bundle) → upload these files preserving folders.
2) Ensure package.json has "stripe": "^14.x" in dependencies.
3) Merge → Trigger build (clear cache recommended).
4) Test:
   - / (Test Checkout button)
   - /.netlify/functions/createCheckout (405 expected for GET)
   - Add webhook endpoint → see logs for completed sessions
   - /staff/notes and /dashboard/notes (PIN from env)
