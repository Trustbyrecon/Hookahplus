# Git Secret Resolution Guide

## Problem
GitHub push protection is blocking pushes because commit `f69f0ee` contains a Stripe test API secret key in `apps/app/STRIPE_KEY_ADDED.md:11`.

## What We've Done
1. ✅ Updated `.gitignore` to exclude `STRIPE_KEY_ADDED.md` and related Stripe key files
2. ✅ Removed `STRIPE_KEY_ADDED.md` from current git tracking
3. ✅ Fixed the file to remove the actual key (replaced with placeholder)
4. ✅ Added commits to prevent future secrets

## Remaining Issue
The secret is still in commit history (`f69f0ee`). GitHub scans all commits being pushed, not just the current state.

## Solutions

### Option 1: Allow Test Secret (Recommended - Quickest)
Since this is a **test key** (starts with `sk_test_`), you can allow it via GitHub:

**Visit this URL:**
https://github.com/Trustbyrecon/Hookahplus/security/secret-scanning/unblock-secret/35UMDjM9XisUmuxfELc1QYI8Ebh

This will allow this specific test secret to be pushed. After allowing, try pushing again:
```bash
git push origin stable-production
```

### Option 2: Rewrite History (More Complex)
If you want to completely remove the secret from history:

1. Install `git-filter-repo`:
   ```bash
   pip install git-filter-repo
   ```

2. Remove the file from all commits:
   ```bash
   git filter-repo --path apps/app/STRIPE_KEY_ADDED.md --invert-paths
   ```

3. Force push:
   ```bash
   git push --force origin stable-production
   ```

**Warning:** This rewrites history and requires force push. Coordinate with your team first.

## Current Status
- ✅ `.gitignore` updated
- ✅ File removed from current tracking
- ✅ File fixed (no actual key)
- ⚠️ Old commit still contains secret (needs Option 1 or 2 above)

## Next Steps
1. **Quick fix:** Use Option 1 (GitHub allow-secret URL) - recommended for test keys
2. **Complete fix:** Use Option 2 (rewrite history) - if you want to completely remove it

After resolving, you should be able to push successfully.

