/**
 * Direct API Test - Noor (session_agent)
 * Tests the app build API directly to diagnose 500 error
 */

import 'dotenv/config';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

async function testDirectAPI() {
  console.log('🧪 [Noor] Testing App Build API Directly\n');
  console.log(`App Build URL: ${APP_URL}\n`);

  // Test 1: GET sessions
  console.log('📋 Test 1: GET /api/sessions');
  try {
    const getResponse = await fetch(`${APP_URL}/api/sessions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const getText = await getResponse.text();
    console.log(`Status: ${getResponse.status}`);
    
    if (getResponse.ok) {
      try {
        const getData = JSON.parse(getText);
        console.log(`✅ GET successful:`, JSON.stringify(getData, null, 2).substring(0, 200));
      } catch {
        console.log(`✅ GET successful (non-JSON):`, getText.substring(0, 200));
      }
    } else {
      console.log(`❌ GET failed:`, getText.substring(0, 500));
    }
  } catch (error) {
    console.error(`❌ GET error:`, error);
  }

  // Test 2: POST session
  console.log('\n📋 Test 2: POST /api/sessions');
  try {
    const postResponse = await fetch(`${APP_URL}/api/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tableId: `T-TEST-${Date.now() % 1000}`,
        customerName: 'Test Customer Direct',
        flavor: 'Test Flavor',
        amount: 3000,
        source: 'WALK_IN',
        loungeId: 'test-lounge',
      }),
    });

    const postText = await postResponse.text();
    console.log(`Status: ${postResponse.status}`);
    
    if (postResponse.ok) {
      try {
        const postData = JSON.parse(postText);
        console.log(`✅ POST successful:`, JSON.stringify(postData, null, 2).substring(0, 300));
      } catch {
        console.log(`✅ POST successful (non-JSON):`, postText.substring(0, 300));
      }
    } else {
      console.log(`❌ POST failed:`, postText.substring(0, 500));
    }
  } catch (error) {
    console.error(`❌ POST error:`, error);
  }
}

testDirectAPI().catch(console.error);

