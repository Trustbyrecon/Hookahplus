#!/usr/bin/env tsx

/**
 * Verify Square OAuth Setup
 * Checks all configuration needed for Square OAuth to work
 */

import { SquareOAuth } from '../lib/square/oauth';

async function verifySetup() {
  console.log('🔍 Square OAuth Setup Verification\n');

  // Check environment variables
  console.log('1️⃣ Checking Environment Variables...\n');
  
  const appId = process.env.SQUARE_APPLICATION_ID?.trim();
  const appSecret = process.env.SQUARE_APPLICATION_SECRET?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
  const redirectUri = `${appUrl}/api/square/oauth/callback`;

  console.log(`   SQUARE_APPLICATION_ID: ${appId ? `✅ SET` : '❌ NOT SET'}`);
  if (appId) {
    console.log(`      Length: ${appId.length} chars`);
    console.log(`      Format: ${appId.startsWith('sandbox-sq0idb-') ? '✅ Sandbox' : appId.startsWith('sq0idb-') ? '✅ Production' : '❌ Invalid format'}`);
    console.log(`      Has newlines: ${appId.includes('\n') || appId.includes('\r') ? '❌ YES (BAD!)' : '✅ No'}`);
    console.log(`      Value: ${appId.substring(0, 20)}...`);
  }

  console.log(`\n   SQUARE_APPLICATION_SECRET: ${appSecret ? `✅ SET` : '❌ NOT SET'}`);
  if (appSecret) {
    console.log(`      Length: ${appSecret.length} chars`);
    console.log(`      Format: ${appSecret.startsWith('sandbox-sq0csb-') ? '✅ Sandbox' : appSecret.startsWith('sq0csb-') ? '✅ Production' : '❌ Invalid format'}`);
  }

  console.log(`\n   NEXT_PUBLIC_APP_URL: ${appUrl}`);
  console.log(`   Redirect URI: ${redirectUri}\n`);

  if (!appId || !appSecret) {
    console.log('❌ Missing required environment variables!');
    console.log('   Add to apps/app/.env.local:');
    console.log('   SQUARE_APPLICATION_ID=sandbox-sq0idb-...');
    console.log('   SQUARE_APPLICATION_SECRET format: sandbox-sq0csb-...');
    process.exit(1);
  }

  // Validate format
  console.log('2️⃣ Validating Configuration...\n');
  
  const issues: string[] = [];
  
  if (!appId.startsWith('sandbox-sq0idb-') && !appId.startsWith('sq0idb-')) {
    issues.push('SQUARE_APPLICATION_ID format is incorrect (should start with sandbox-sq0idb- or sq0idb-)');
  }
  
  if (!appSecret.startsWith('sandbox-sq0csb-') && !appSecret.startsWith('sq0csb-')) {
    issues.push('SQUARE_APPLICATION_SECRET format is incorrect (should start with sandbox-sq0csb- or sq0csb-)');
  }

  if (appId.includes('\n') || appId.includes('\r')) {
    issues.push('SQUARE_APPLICATION_ID contains newline characters (remove them!)');
  }

  if (appSecret.includes('\n') || appSecret.includes('\r')) {
    issues.push('SQUARE_APPLICATION_SECRET contains newline characters (remove them!)');
  }

  if (issues.length > 0) {
    console.log('❌ Configuration Issues Found:\n');
    issues.forEach(issue => console.log(`   - ${issue}`));
    console.log('\n');
    process.exit(1);
  }

  console.log('   ✅ All format validations passed\n');

  // Test URL generation
  console.log('3️⃣ Testing OAuth URL Generation...\n');
  
  try {
    const testState = 'test-state-123';
    const authUrl = SquareOAuth.getAuthorizationUrl(testState);
    
    console.log(`   ✅ URL generated successfully`);
    console.log(`   📋 URL: ${authUrl.substring(0, 80)}...`);
    
    // Validate URL
    const url = new URL(authUrl);
    console.log(`   🌐 Domain: ${url.hostname}`);
    console.log(`   📍 Path: ${url.pathname}`);
    
    if (url.hostname !== 'connect.squareup.com') {
      console.log(`   ⚠️  WARNING: Expected 'connect.squareup.com', got '${url.hostname}'`);
    }
    
    const clientIdParam = url.searchParams.get('client_id');
    if (clientIdParam !== appId) {
      console.log(`   ⚠️  WARNING: client_id in URL doesn't match environment variable`);
      console.log(`      Env: ${appId.substring(0, 20)}...`);
      console.log(`      URL: ${clientIdParam?.substring(0, 20)}...`);
    }
    
    const redirectParam = url.searchParams.get('redirect_uri');
    if (redirectParam !== redirectUri) {
      console.log(`   ⚠️  WARNING: redirect_uri mismatch`);
      console.log(`      Expected: ${redirectUri}`);
      console.log(`      Got: ${redirectParam}`);
    }
    
    console.log('\n   ✅ URL validation passed\n');

  } catch (error) {
    console.log(`   ❌ Error generating URL: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }

  // Final checklist
  console.log('4️⃣ Setup Checklist:\n');
  console.log('   ☐ Application ID is correct format');
  console.log('   ☐ Application Secret is correct format');
  console.log('   ☐ No newlines in environment variables');
  console.log('   ☐ Redirect URL registered in Square Developer Console');
  console.log('   ☐ Redirect URL matches exactly: ' + redirectUri);
  console.log('   ☐ App is Active (not Draft) in Square Developer Console');
  console.log('   ☐ OAuth is enabled for the app');
  console.log('   ☐ Using Sandbox credentials (if testing)\n');

  console.log('✅ Setup verification complete!');
  console.log('\n📝 Next Steps:');
  console.log('   1. Verify redirect URL in Square Developer Console matches exactly');
  console.log('   2. Ensure app is Active (not Draft)');
  console.log('   3. Try connecting: http://localhost:3002/square/connect?loungeId=test_venue');
}

verifySetup().catch(console.error);

