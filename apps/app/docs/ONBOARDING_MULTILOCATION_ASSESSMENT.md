# Onboarding Multi-Location Assessment

## Current single-location assumptions

- LaunchPad stores one venue in `progress.data.step1`.
- `SetupSession` links to one lounge via `loungeId`.
- Go-live provisioning creates one `Tenant`, one `LoungeConfig`, and one asset pack.
- Operator onboarding leads capture one `location` string only.
- Week-1 wins endpoint reports per-lounge only.

## Required multi-location capabilities

- One operator/org can own multiple lounges.
- LaunchPad can collect a list of locations while preserving single-location default.
- Go-live can provision one-or-many lounges in one submission.
- Operator onboarding can track location count and location names.
- Metrics can aggregate week-1 wins across all lounges in an org.

## Backward compatibility policy

- Existing single-location LaunchPad behavior remains default.
- Multi-location behavior is opt-in via step-1 data (`multiLocationEnabled`).
- Existing API contracts keep current fields; multi-location fields are additive.

## Initial rollout

1. Add additive schema fields (`Organization`, org links, setup session multi-location metadata).
2. Add LaunchPad step-1 multi-location capture.
3. Update go-live route to provision multiple lounges when enabled.
4. Add onboarding lead multi-location fields.
5. Add org-level week-1 wins aggregation endpoint.
