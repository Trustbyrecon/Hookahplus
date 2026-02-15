# Git Hooks Setup

This repo includes local hooks to block commits/pushes that contain potential secrets.

## One-time setup

Run this command in the repo root:

```bash
git config core.hooksPath .githooks
```

## What runs

- `pre-commit` -> `node scripts/secret-guard.mjs --staged`
- `pre-push` -> `node scripts/secret-guard.mjs --range`

## Manual scan commands

- `npm run security:scan:staged`
- `npm run security:scan:range`
- `npm run security:scan:all`
