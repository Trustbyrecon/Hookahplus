#!/usr/bin/env bash

case "$1" in
  cmd.deployToNetlify)
    branch="$2"
    if [ -z "$branch" ]; then
      echo "Usage: $0 cmd.deployToNetlify <branch>"
      exit 1
    fi
    echo "Deploying branch '$branch' to Netlify..."
    netlify deploy --prod --build --branch "$branch"
    ;;
  *)
    echo "Unknown command: $1"
    exit 1
    ;;
esac
