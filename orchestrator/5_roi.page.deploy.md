# Task 5 — roi.page.deploy
**Role:** Publish ROI calculator page and wire analytics on CTAs.

## Objective
Create `/app/roi-calculator/page.tsx`, link from home & pricing, and send events (`roi_view`, `roi_calculate_click`, `roi_pricing_click`, `roi_signup_click`).

## Inputs
- Copy from ROI spec (Hookah+ Trust Core Value)

## Deliverables
- `/app/roi-calculator/page.tsx`
- Links from `/app/page.tsx` and `/app/pricing/page.tsx`
- Analytics helper (GA4 or Plausible)

## Checklist
- [ ] Build page with defaults and input controls
- [ ] Fire events on view and CTA clicks
- [ ] Cross-link nav + footer
- [ ] Verify deploy renders

## Snippets

**lib/analytics.ts**
```typescript
export const track = (name: string, data?: any) => {
  if (typeof window === "undefined") return;
  
  (window as any).gtag?.("event", name, data);
  (window as any).plausible?.(name, { props: data });
};
```

**Add link in header nav (example)**
```typescript
<a href="/roi-calculator" className="hover:text-white">ROI</a>
```

**Events**
- On page mount: `track("roi_view")`
- Calculate: `track("roi_calculate_click", { tier })`
- View pricing: `track("roi_pricing_click")`
- Sign up: `track("roi_signup_click")`

## Acceptance
- Page accessible at `/roi-calculator`
- Events visible in analytics
- Links present on home & pricing

## Guardrails
- Never expose secrets on client
- Use `NEXT_PUBLIC_*` vars only

## Reflex Score
- +0.4 page live
- +0.3 events
- +0.2 links
- +0.1 copy QA
