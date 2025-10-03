// Simple script to verify build output
const fs = require('fs');
const path = require('path');

console.log('🔍 Checking build output...');

const nextDir = path.join(__dirname, '.next');
const routesManifest = path.join(nextDir, 'routes-manifest.json');

if (fs.existsSync(nextDir)) {
  console.log('✅ .next directory exists');
  
  if (fs.existsSync(routesManifest)) {
    console.log('✅ routes-manifest.json exists');
    const manifest = JSON.parse(fs.readFileSync(routesManifest, 'utf8'));
    console.log('📋 Routes found:', Object.keys(manifest.routes || {}).length);
  } else {
    console.log('❌ routes-manifest.json missing');
  }
} else {
  console.log('❌ .next directory missing');
}

console.log('🏁 Build check complete');
