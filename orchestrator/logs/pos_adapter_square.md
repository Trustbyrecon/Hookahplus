# Task 3 — pos.adapter.square
**Date**: 2026-02-01

## Goal
Provide a typed POS adapter interface and a Square implementation stub with a passing unit test.

## Actions
- Confirmed adapter scaffold exists:
  - `integrations/square/adapter.ts`
  - `integrations/square/squareAdapter.ts`
  - `integrations/square/README.md`
- Enabled Jest unit tests:
  - Added `integrations/square/__tests__/squareAdapter.test.ts`
  - Removed disabled test file
- Installed deps + ran tests in `integrations/`:
  - `npm ci --no-audit --no-fund`
  - `npm test`

## Results
- ✅ Jest test suite passes for `SquareAdapter`
- ✅ Stub remains “no live payments / no live calls”

