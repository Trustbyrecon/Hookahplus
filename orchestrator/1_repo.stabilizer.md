# Task 1 — repo.stabilizer
**Role:** Stabilize `main` to last-good while preserving detour work.

## Objective
Return `main` to a known-good state (Netlify builds green). Back up the current branch. Prefer non-destructive revert; allow reset+force-with-lease if approved.

## Inputs
- Branch: `main`
- Undo depth: ~12 commits (fire-session detour)
- Optional branches: `fire-session`, `stripe-integration`

## Deliverables
- `main` clean and deployable
- Backups: `backup/main-fire-session-YYYY-MM-DD`, optional `archive/stripe-integration-YYYY-MM-DD` tag
- Log: `orchestrator/logs/repo_stabilizer.md`

## Checklist
- [ ] Fetch/prune remotes
- [ ] Backup current `main`
- [ ] Revert last N commits (default) **or** reset to GOOD_SHA (if approved)
- [ ] Push & confirm Netlify build green
- [ ] Record actions in log

## Commands (SAFE Revert — default)
```bash
git fetch --all --prune
git switch main && git pull --ff-only
git switch -c backup/main-fire-session-$(date +%F)
git log --oneline -n 20 > orchestrator/logs/repo_stabilizer_commits.txt
git revert --no-commit HEAD~12..HEAD
git commit -m "Revert: remove accidental fire-session commits (batch revert)"
git push
```

**Option B (CLEAN history) — requires approval**
```bash
git switch main && git pull --ff-only
git reset --hard <GOOD_SHA>
git push --force-with-lease
```

## Acceptance
- `git status` clean on main
- Netlify build passes
- Backups/tags present

## Guardrails
- Abort on merge conflicts and write file list to log
- Never force-push unless explicitly using Option B with confirmation

## Reflex Score (0–1)
- +0.4 revert/reset correctness
- +0.3 deploy green
- +0.2 backups present
- +0.1 log quality
