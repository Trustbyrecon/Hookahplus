#!/bin/bash
# Vercel Ignored Build Step: only build on main branch
# Exit 0 = skip build, Exit 1 = run build
if [ "$VERCEL_GIT_COMMIT_REF" = "main" ]; then
  exit 1
fi
exit 0
