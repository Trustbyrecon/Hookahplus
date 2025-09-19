#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Starting Vercel build process...');

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' });

  // Generate Prisma client
  console.log('🗄️ Generating Prisma client...');
  execSync('cd apps/web && npx prisma generate', { stdio: 'inherit' });

  // Build the web app
  console.log('🏗️ Building web application...');
  execSync('cd apps/web && pnpm build', { stdio: 'inherit' });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
