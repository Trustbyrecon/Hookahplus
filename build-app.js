#!/usr/bin/env node
// Build script for Hookah+ app
const { execSync } = require('child_process');
const path = require('path');

console.log('Starting Hookah+ build process...');

try {
  // Install root dependencies
  console.log('Installing root dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Navigate to app directory
  console.log('Navigating to apps/app...');
  process.chdir(path.join(__dirname, 'apps', 'app'));

  // Install app dependencies
  console.log('Installing app dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  // Run the build
  console.log('Running vercel-build...');
  execSync('npm run vercel-build', { stdio: 'inherit' });

  console.log('Build completed successfully!');
} catch (error) {
  console.error('Build failed:', error.message);
  process.exit(1);
}
