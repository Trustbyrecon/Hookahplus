#!/usr/bin/env node
// Build script for Hookah+ app
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Hookah+ build process...');

try {
  // Install root dependencies
  console.log('Installing root dependencies...');
  execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' });

  // Run the build using pnpm filter
  console.log('Running build with pnpm filter...');
  execSync('pnpm --filter @hookahplus/app run vercel-build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
