#!/usr/bin/env tsx

/**
 * Debug Square Access Token
 * Checks if token is valid and has required permissions
 */

import { prisma } from '../lib/db';

async function debugSquareToken() {
  const venueId = process.argv[2] || 'test_venue';
  
  console.log('🔍 Square Token Debug Tool\n');
  console.log(`📍 Venue ID: ${venueId}\n`);

  // Check environment variables
  console.log('1️⃣ Checking Environment Variables...');
  const accessToken = process.env.SQUARE_ACCESS_TOKEN?.trim();
  const locationId = process.env.SQUARE_LOCATION_ID?.trim();
  
  console.log(`   SQUARE_ACCESS_TOKEN: ${accessToken ? `✅ SET (${accessToken.length} chars, starts with: ${accessToken.substring(0, 10)}...)` : '❌ NOT SET'}`);
  console.log(`   SQUARE_LOCATION_ID: ${locationId ? `✅ SET (${locationId})` : '❌ NOT SET'}\n`);

  if (!accessToken) {
    console.log('❌ No access token found. Please set SQUARE_ACCESS_TOKEN in .env.local');
    process.exit(1);
  }

  // Check database for OAuth connection
  console.log('2️⃣ Checking Database for OAuth Connection...');
  const merchant = await prisma.squareMerchant.findUnique({
    where: { loungeId: venueId }
  });

  if (merchant) {
    console.log('   ✅ OAuth merchant found in database');
    console.log(`   📊 Merchant ID: ${merchant.merchantId}`);
    console.log(`   📍 Locations: ${merchant.locationIds.join(', ')}`);
    console.log(`   🔑 Token expires: ${merchant.expiresAt ? merchant.expiresAt.toISOString() : 'Never'}`);
    console.log(`   ⏰ Created: ${merchant.createdAt.toISOString()}\n`);
  } else {
    console.log('   ℹ️  No OAuth merchant found (using legacy env vars)\n');
  }

  // Test token with Square API
  console.log('3️⃣ Testing Token with Square API...');
  try {
    // Test 1: Get merchant info
    const merchantResponse = await fetch('https://connect.squareup.com/v2/merchants', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Square-Version': '2024-01-18'
      }
    });

    if (!merchantResponse.ok) {
      const error = await merchantResponse.json();
      console.log('   ❌ Token validation failed:');
      console.log(`   📋 Status: ${merchantResponse.status} ${merchantResponse.statusText}`);
      console.log(`   📄 Error:`, JSON.stringify(error, null, 2));
      
      if (merchantResponse.status === 401) {
        console.log('\n   💡 Possible issues:');
        console.log('      - Token is expired or invalid');
        console.log('      - Token was revoked');
        console.log('      - Token format is incorrect');
        console.log('      - Token has extra whitespace (try trimming)');
      }
      process.exit(1);
    }

    const merchantData = await merchantResponse.json();
    console.log('   ✅ Token is valid!');
    console.log(`   📊 Merchant: ${merchantData.merchant?.[0]?.business_name || merchantData.merchant?.[0]?.id || 'Unknown'}\n`);

    // Test 2: Get locations
    const locationsResponse = await fetch('https://connect.squareup.com/v2/locations', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Square-Version': '2024-01-18'
      }
    });

    if (locationsResponse.ok) {
      const locationsData = await locationsResponse.json();
      const locations = locationsData.locations || [];
      console.log('4️⃣ Checking Locations...');
      console.log(`   ✅ Found ${locations.length} location(s):`);
      locations.forEach((loc: any) => {
        console.log(`      - ${loc.name || loc.id} (${loc.id})`);
        if (locationId && loc.id === locationId) {
          console.log(`        ✅ Matches SQUARE_LOCATION_ID`);
        }
      });
      
      if (locationId && !locations.find((l: any) => l.id === locationId)) {
        console.log(`\n   ⚠️  WARNING: SQUARE_LOCATION_ID (${locationId}) not found in your locations!`);
      }
    }

    // Test 3: Check Orders API permissions
    console.log('\n5️⃣ Testing Orders API Permissions...');
    const testOrderResponse = await fetch('https://connect.squareup.com/v2/orders/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Square-Version': '2024-01-18'
      },
      body: JSON.stringify({
        location_ids: locationId ? [locationId] : [],
        query: {
          filter: {
            state_filter: {
              states: ['DRAFT']
            }
          }
        },
        limit: 1
      })
    });

    if (testOrderResponse.ok) {
      console.log('   ✅ Orders API access confirmed');
    } else {
      const error = await testOrderResponse.json();
      console.log('   ⚠️  Orders API test failed:');
      console.log(`   📋 Status: ${testOrderResponse.status}`);
      console.log(`   📄 Error:`, JSON.stringify(error, null, 2));
      
      if (testOrderResponse.status === 403) {
        console.log('\n   💡 The token may not have ORDERS_WRITE permission');
        console.log('      - Check your Square app permissions');
        console.log('      - Re-authorize with correct scopes');
      }
    }

    console.log('\n✅ Token debug complete!');
    console.log('\n📝 Summary:');
    console.log('   - Token is valid and can authenticate');
    console.log('   - Check location ID matches your Square account');
    console.log('   - Verify Orders API permissions if order creation fails');

  } catch (error) {
    console.error('   ❌ Error testing token:', error);
    process.exit(1);
  }
}

debugSquareToken().catch(console.error);

