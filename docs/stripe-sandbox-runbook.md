# Stripe Sandbox $1 Test – Runbook

This documents the canonical way we verify payments end‑to‑end in Sandbox.

## Environments and vars

Set in Vercel for Preview (and Dev locally via .env.local):

- STRIPE_SECRET_KEY = sk_test_...
- ADMIN_TEST_TOKEN = preview-admin-secret (or any secret you choose)
- NEXT_PUBLIC_APP_URL = https://app-<preview>.vercel.app
- NEXT_PUBLIC_GUEST_URL = https://guest-<preview>.vercel.app
- (optional) STRIPE_API_VERSION = 2025-08-27.basil

## Endpoints

- App route (authoritative): `POST /api/payments/live-test`
  - Guarded by header `x-admin-token: ${ADMIN_TEST_TOKEN}`
  - Creates and confirms a $1 PaymentIntent in Stripe TEST mode with `pm_card_visa`
  - Response: `{ ok, id, status }`

- Guests proxy: `POST /api/payments/live-test`
  - Proxies to App using `NEXT_PUBLIC_APP_URL` + admin token
  - Falls back to a local Stripe charge in TEST mode if the proxy fails and a test key is present

## How to run (curl)

```
# App (preferred)
curl -sS -X POST "$NEXT_PUBLIC_APP_URL/api/payments/live-test" \
  -H "x-admin-token: $ADMIN_TEST_TOKEN" | jq .

# Guests (proxy)
curl -sS -X POST "$NEXT_PUBLIC_GUEST_URL/api/payments/live-test" | jq .
```

## Expected outcome

- HTTP 200 and `{ ok: true, status: "succeeded" }`
- Stripe Dashboard (Test mode) shows a $1.00 payment.
- Webhook (App) receives `payment_intent.succeeded` (if configured in test mode).

## Troubleshooting

- `NEXT_PUBLIC_APP_URL missing` → Set env on guests; redeploy.
- 401 Unauthorized → Provide the correct `x-admin-token` header to the App route.
- Proxy fails → Guests will attempt local Stripe fallback if `STRIPE_SECRET_KEY` (test) is present.
- Webhook invalid signature → Ensure `STRIPE_WEBHOOK_SECRET` is set on the App project (test mode secret).

## CI Gate (optional)

Add a CI step that runs the App curl with the admin token and fails the job if `{ ok: true }` is not returned.
