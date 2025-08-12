#!/usr/bin/env bash
set -euo pipefail

BRANCH="feat/landing-Lplus4"
PATCH="hookahplus-Lplus4.patch"
TITLE="L+4 Landing Shell (routes, forms, sitemap, link checks)"
BODY="Adds all required public routes (L0→L4), Nav/Footer, Netlify forms, sitemap generator, and link-integrity CI. No binaries."

git checkout -b "$BRANCH" || git checkout "$BRANCH"
git apply --whitespace=nowarn "$PATCH"
git add .
git commit -m "feat: complete L+4 landing shell (routes, sitemap, link checks, forms)"
git push -u origin "$BRANCH"

if command -v gh >/dev/null 2>&1; then
  gh pr create -B main -t "$TITLE" -b "$BODY"
else
  echo "GitHub CLI (gh) not found. Create PR manually at:"
  echo "https://github.com/<OWNER>/<REPO>/compare/main...$BRANCH?expand=1"
fi