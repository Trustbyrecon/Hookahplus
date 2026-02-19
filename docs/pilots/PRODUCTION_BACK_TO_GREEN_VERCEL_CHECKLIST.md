# Back to Green — GitHub ↔ Vercel Reconnection + Production Validation Checklist

This checklist is the exact execution path to restore **GitHub → Vercel** validation (Preview + Production) after the GitHub account flag is cleared.

## Current blocker (known)
GitHub is showing: **“This account is flagged, and therefore cannot authorize a third party application.”**\n\nWhile that banner is present, Vercel cannot be authorized/installed as a GitHub App/OAuth integration, and deploy validations won’t run.

### GitHub Support ticket payload (copy/paste)
- Include the banner screenshot.\n- State that the flag prevents authorizing the Vercel GitHub App and blocks deployments.\n- Request: **remove flagged status / restore ability to authorize third-party applications**.\n- Include affected repo/org: `Trustbyrecon/Hookahplus`.\n
## Step 1 — Restore the GitHub ↔ Vercel connection (after unflag)
1. In GitHub:\n   - Confirm you can authorize third-party apps again.\n   - If Vercel was previously installed: uninstall/reinstall the **Vercel** GitHub App (org scope if repo is org-owned).\n2. In Vercel:\n   - Reconnect Git provider.\n   - Re-import or relink the repo to the correct Vercel project(s).\n   - Ensure the GitHub App has access to the org + repo.

## Step 2 — Confirm project scope in a monorepo (what “green” means here)
This repo is a monorepo with multiple Next apps.\n\nYou should have **a distinct Vercel project per deploy target** (e.g., `apps/app`, `apps/site`, etc.), each with:\n- correct root directory\n- correct build command\n- correct environment variable set

### Relevant repo config
- Root `vercel.json` defines secret bindings for core env vars.\n- `apps/app/vercel.json` specifies framework/build output and cron.\n\n```verbatim
apps/app/vercel.json: cron → /api/square/process?limit=250 every 5 minutes
```\n\nSee:\n- `vercel.json`\n- `apps/app/vercel.json`

## Step 3 — Environment variables (Preview + Production)
Before you judge a deployment as “failed,” verify env parity:

### Required env (typical)
- `DATABASE_URL`\n- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`\n- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PUBLISHABLE_KEY`\n- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`\n\nRoot `vercel.json` expects these to be bound as Vercel “Secrets”:\n- `@database_url`, `@supabase_url`, etc.\n\nIf Preview is missing a secret but Production has it, you’ll see “works in prod, fails in preview” behavior.

## Step 4 — Preview deployment validation (the “green” gate)
Run this as the standard acceptance checklist for each target project:

1. **Build succeeds** (no lint/type failures)\n2. **Health checks succeed**\n   - `GET /api/health/live`\n   - `GET /api/health/ready`\n3. **Public routes still work**\n   - `/launchpad`\n   - key public APIs (webhooks, checkout-session)\n   - Public route allowlist is enforced in `apps/app/middleware.ts` (LaunchPad + webhooks + Square webhooks/crons).\n4. **Stripe webhooks configured** (if the environment processes payments)\n   - Follow `docs/STRIPE_WEBHOOK_VERCEL_SETUP.md` for Vercel-specific guidance.\n5. **Cron route reachable** (apps/app)\n   - `/api/square/process?limit=250` is scheduled by Vercel cron and must remain public.\n
## Step 5 — Production deployment validation
After Preview is green:
1. Promote/merge to the production branch.\n2. Confirm production deploy.\n3. Verify webhooks in Stripe Dashboard:\n   - deliveries are succeeding\n   - signatures verify\n\nSee:\n- `docs/STRIPE_WEBHOOK_VERCEL_SETUP.md`\n- `docs/WEBHOOK_SETUP.md`

## Step 6 — Operational validation (post-green)
These are “silent failure” checks that matter in production:
- Square OAuth callback works (if Square is used)\n- Square webhook deliveries are received\n- Square cron runs are visible (function logs)\n- Drift summary endpoint returns reasonable counts (`/api/recon/drift-summary?...`)\n- LaunchPad provisioning works end-to-end for a test lounge/operator

## If it still isn’t green: fastest triage order
1. GitHub App authorization scope (org/repo access)\n2. Vercel project root directory + build command\n3. Missing env vars in Preview environment\n4. Node/runtime mismatch between local and Vercel\n5. Webhook endpoints blocked by auth middleware\n6. Cron route blocked or returning non-200

