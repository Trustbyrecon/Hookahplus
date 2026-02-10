# Task 2 — billing.catalog.seed
**Date**: 2026-02-01

## Goal
Seed Stripe **TEST mode** catalog and wire resulting price IDs to app env.

## Current state (repo)
- `stripe-seed/` exists with `products.json`, `seed.js`, and setup scripts.
- `stripe_ids.out.json` exists at repo root with product + price IDs.

## Env wiring
- Added non-secret placeholders to `apps/app/env.template`:
  - `PRICE_SESSION`
  - `PRICE_FLAVOR_ADDON`
  - `PRICE_TIER_PRO`

## Notes
- Do **not** commit Stripe secret keys. Keep them in `.env` / `.env.local` only.
- To re-seed: run `npm install` and `npm run seed` inside `stripe-seed/`, then copy price IDs into `apps/app/.env.local` or Vercel env vars.

