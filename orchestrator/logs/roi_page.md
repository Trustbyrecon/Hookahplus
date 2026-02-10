# Task 5 — roi.page.deploy (apps/app)
**Date**: 2026-02-01

## Goal
Publish ROI calculator page and wire analytics events on CTAs.

## Actions
- Added ROI calculator page: `apps/app/app/roi-calculator/page.tsx`
- Added analytics helper: `apps/app/lib/analytics.ts`
- Linked ROI from home page: `apps/app/app/page.tsx`
- Linked ROI from pricing via board control: `apps/app/components/PricingIntelligenceBoard.tsx`
- Added ROI to primary navigation: `apps/app/components/GlobalNavigation.tsx`

## Analytics events
- `roi_view` (on page mount)
- `roi_calculate_click` (hero + recalc)
- `roi_pricing_click` (pricing links)
- `roi_signup_click` (setup/signup links)

## Results
- ✅ Page is accessible at `/roi-calculator`
- ✅ Build succeeds for `apps/app`

