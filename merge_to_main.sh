#!/bin/bash
# Script to merge deploy-orchestration-pack to main

echo "Switching to main branch..."
git checkout main

echo "Pulling latest changes..."
git pull origin main

echo "Merging deploy-orchestration-pack..."
git merge deploy-orchestration-pack --no-edit

echo "Pushing to main..."
git push origin main

echo "Done! Switching back to deploy-orchestration-pack..."
git checkout deploy-orchestration-pack

echo "Merge complete!"
