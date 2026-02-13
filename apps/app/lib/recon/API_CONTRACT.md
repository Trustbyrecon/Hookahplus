# Recon Decision API — Contract

## Method and path

- **Method:** `POST`
- **Path:** `/api/recon/decision` (or configured Recon base URL + `/decision`)

## Authentication

- Recon does not accept unauthenticated requests. **Implemented scheme: HMAC.**
  - **Header:** `X-Recon-Signature` = HMAC-SHA256(shared_secret, raw request body), hex-encoded.
  - **Secret:** Set `RECON_SHARED_SECRET` in both H+ and Recon environments. Recon verifies with same secret; H+ client (`lib/recon/client.ts`) signs outgoing requests when the secret is set.
  - **Validation:** Request body is read as raw text before parsing; signature is verified first. Invalid or missing signature → 401.

## Request body (ActionIntent)

- **Content-Type:** `application/json`
- **Schema:** See `lib/recon/contract.ts` and `lib/recon/validator.ts`.
- **Required fields:** `action_type`, `amount`, `session_id`, `lounge_id`, `initiator_type`, `initiator_id`, `session_total`, `session_duration_min`, `timestamp`, `idempotency_key`. Amount and session_total are in **cents**.
- **Allowlist:** Only `action_type: "refund.request"` is supported in v1.

## Idempotency

- Client sends `idempotency_key` in the body. Recon and H+ use it to avoid double-execution: same key returns same decision/result.

## Response (ReconDecisionResponse)

- **200:** `{ decision, signed_artifact_id [, execution_metadata [, adjusted_amount ]] }`
- **400:** Invalid body (validation errors).
- **401:** Missing or invalid auth.
- **500:** Server error.

When `REFUND_EXECUTOR=recon`, response may include `execution_metadata: { execution_status, stripe_refund_id?, error? }`. When `REFUND_EXECUTOR=hookahplus`, Recon does not execute; no `execution_metadata`.

## Action type allowlist

- v1: `refund.request` only. Other action types return 400.
