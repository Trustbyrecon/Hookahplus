# Session Notes Patch (No-DB, Stripe metadata)

This adds:
- `netlify/functions/sessionNotes.js` — POST to store private notes in Stripe PaymentIntent metadata.
- `app/staff/notes/page.tsx` — PIN-gated UI to submit notes.

## Requirements
- Netlify env:
  - `STRIPE_SECRET_KEY` = your test secret (sk_test_…)
  - *(optional)* `NEXT_PUBLIC_STAFF_DEMO_PIN` to change default (735911)

## API
`POST /.netlify/functions/sessionNotes`
```json
{
  "sessionId": "hp_...",
  "checkoutSessionId": "cs_test_...", // optional, preferred if available
  "loungeId": "demo-lounge-001",
  "notes": "VIP booth, prefers mint low heat"
}
```
Response:
```json
{ "ok": true, "payment_intent": "pi_...", "notes_length": 27 }
```

If only `sessionId` is provided, the function will try Stripe Search:
`metadata['hp_session_id']:'<sessionId>'` (Stripe Search API must be enabled).

## Deploy
1) Add files in a branch, open PR, merge.
2) Trigger Netlify build.
3) Visit `/staff/notes` and enter the staff PIN to add notes.
