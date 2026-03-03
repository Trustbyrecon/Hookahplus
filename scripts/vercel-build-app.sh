#!/usr/bin/env bash
set -euo pipefail

# Vercel "Ignored Build Step" helper for the Hookahplus monorepo app.
#
# Exit codes (Vercel semantics):
# - 0 => ignore build (skip)
# - 1 => do NOT ignore (proceed with build)
#
# This script is invoked from the Vercel Project Settings as:
#   bash ../../scripts/vercel-build-app.sh
# when the Root Directory is set to `apps/app`.

SHA="${VERCEL_GIT_COMMIT_SHA:-}"
PREV_SHA="${VERCEL_GIT_PREVIOUS_SHA:-}"
REF="${VERCEL_GIT_COMMIT_REF:-}"

echo "[vercel-build-app] ref=${REF:-unknown} sha=${SHA:-unknown} prev=${PREV_SHA:-unknown}"

# If we can't reliably diff, build.
if [[ -z "${SHA}" || -z "${PREV_SHA}" || "${SHA}" == "${PREV_SHA}" ]]; then
  echo "[vercel-build-app] missing/invalid SHAs; proceeding with build."
  exit 1
fi

# Paths that should trigger an app rebuild.
# Note: `scripts/vercel-build-app.sh` is included so changes to this logic also trigger a build.
CHANGED="$(git diff --name-only "${PREV_SHA}" "${SHA}" -- \
  apps/app/ \
  scripts/vercel-build-app.sh \
  package.json \
  package-lock.json \
  .npmrc \
  postcss.config.js \
  prisma/ \
  || true)"

if [[ -n "${CHANGED}" ]]; then
  echo "[vercel-build-app] relevant changes detected; proceeding with build."
  echo "${CHANGED}"
  exit 1
fi

echo "[vercel-build-app] no relevant changes; skipping build."
exit 0
