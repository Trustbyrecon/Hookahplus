# Git Hooks Setup

This repo includes local hooks to block commits/pushes that contain potential secrets.

## One-time setup

Run this command in the repo root:

```bash
git config core.hooksPath .githooks
```

## What runs

- `pre-commit` -> `node scripts/secret-guard.mjs --staged`
- `pre-push` -> `node scripts/secret-guard.mjs --range` (defaults to scanning diff vs `origin/main`)

You can override the base ref:

```bash
SECRET_GUARD_BASE_REF=origin/master git push
```

## Manual scan commands

- `npm run security:scan:staged`
- `npm run security:scan:range`
- `npm run security:scan:all`

## If a secret is detected (rotate playbook)

1) **Stop the leak**
- Remove the secret from code/config immediately.
- Replace with an env var lookup.

2) **Rotate the secret**
- Rotate at the provider (Stripe/Supabase/AWS/etc).
- Invalidate old tokens/keys (don’t just “delete from repo”).

3) **Purge from git history if it was committed**
- If it landed on a remote branch, treat it as compromised even if removed later.
- Use a history-rewrite tool (e.g. `git filter-repo`) and force-push only if you fully understand the impact.

4) **Add an allowlist rule only for confirmed safe strings**
- Prefer allowlisting by file path or very-specific pattern.
