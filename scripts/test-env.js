#!/usr/bin/env node

// scripts/test-env.js
// Test script to verify environment configuration is properly loaded

const path = require('path');
const fs = require('fs');

console.log('🧪 Testing Hookah+ environment configuration...\n');

try {
  // Check if .env.local exists
  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    console.log('✅ .env.local file found');
  } else {
    console.log('⚠️  .env.local file not found - create it from env.example');
  }

  // Check if src/config/env.ts exists
  const envConfigPath = path.join(process.cwd(), 'src/config/env.ts');
  if (fs.existsSync(envConfigPath)) {
    console.log('✅ Environment config file found');
  } else {
    console.log('❌ Environment config file not found');
  }

  // Check if Trust Lock library exists
  const trustLockPath = path.join(process.cwd(), 'src/lib/trustLock.ts');
  if (fs.existsSync(trustLockPath)) {
    console.log('✅ Trust Lock library found');
  } else {
    console.log('❌ Trust Lock library not found');
  }

  // Check package.json for zod dependency
  const packagePath = path.join(process.cwd(), 'package.json');
  if (fs.existsSync(packagePath)) {
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    if (packageJson.dependencies?.zod) {
      console.log('✅ Zod dependency found');
    } else {
      console.log('⚠️  Zod dependency not found - run: npm install zod');
    }
  }

  console.log('\n📋 Environment test completed!');
  console.log('\nNext steps:');
  console.log('1. Run: npm install zod');
  console.log('2. Copy env.example to .env.local and fill in values');
  console.log('3. Run: node scripts/generate-secrets.js for secure keys');
  console.log('4. Test build: npm run build');

} catch (error) {
  console.error('❌ Error testing environment:', error.message);
  process.exit(1);
}
