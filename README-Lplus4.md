# Hookah+ L+4 Scaffold

This bundle adds **all required routes** and basic nav/footer to complete the public landing shell (L0–L4).

## Install
1. Unzip into your repo root (it won't overwrite existing pages; merge as needed).
2. Ensure your app shell imports `components/NavFooter.tsx` in your layout to show nav + footer.
3. Run `npm i linkinator ts-node --save-dev` in CI (workflow included).

## Scripts
- `scripts/generate-sitemap.ts` builds `public/sitemap.xml` from the route list.
- Netlify forms are wired for `/waitlist` and `/support`.

## Routes added
- /
- /dashboard
- /preorder
- /operator
- /pricing
- /waitlist
- /flavor-mix-history
- /demo/session-replay
- /integrations
- /integrations/clover
- /integrations/toast
- /docs
- /press
- /partners
- /api
- /support
- /status
- /changelog
- /security
- /accessibility
- /terms
- /privacy
- /contact
- /404
- /500

Generated: 2025-08-12T16:35:59.247828Z
