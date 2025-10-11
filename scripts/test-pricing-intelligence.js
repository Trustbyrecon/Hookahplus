const fetch = require('node-fetch');

const BASE_URL = 'https://hookahplus.net';
const REFLEX_TRACK_URL = `${BASE_URL}/api/reflex/track`;
const ADMIN_REFLEX_URL = `${BASE_URL}/api/admin/reflex`;

console.log('🧪 Testing Pricing Intelligence Board Reflex Event Tracking');

async function testReflexEventTracking() {
  console.log('\n📡 Test 1: Testing Reflex Event Tracking...');
  
  try {
    // Test event tracking
    const testEvent = {
      type: "ui.pricing.render",
      source: "ui",
      payload: {
        sessionId: "test-session-001",
        pricingTier: "premium",
        annualBilling: true
      }
    };

    const trackResponse = await fetch(REFLEX_TRACK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testEvent),
    });

    if (trackResponse.ok) {
      const trackData = await trackResponse.json();
      console.log('✅ Event tracking successful:', trackData);
    } else {
      const errorText = await trackResponse.text();
      console.error(`❌ Event tracking failed: ${trackResponse.status} ${errorText}`);
      return false;
    }

    // Test admin API
    console.log('\n📊 Test 2: Testing Admin Reflex API...');
    const adminResponse = await fetch(ADMIN_REFLEX_URL);
    
    if (adminResponse.ok) {
      const adminData = await adminResponse.json();
      console.log('✅ Admin API accessible, events count:', adminData.items?.length || 0);
      return true;
    } else {
      const errorText = await adminResponse.text();
      console.error(`❌ Admin API failed: ${adminResponse.status} ${errorText}`);
      return false;
    }

  } catch (error) {
    console.error('❌ Error testing Reflex event tracking:', error.message);
    return false;
  }
}

async function testPricingPageAccess() {
  console.log('\n🎯 Test 3: Testing Pricing Page Access...');
  
  try {
    const pricingResponse = await fetch(`${BASE_URL}/pricing`);
    
    if (pricingResponse.ok) {
      console.log('✅ Pricing page accessible');
      return true;
    } else {
      console.error(`❌ Pricing page failed: ${pricingResponse.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing pricing page:', error.message);
    return false;
  }
}

async function runTests() {
  const reflexTest = await testReflexEventTracking();
  const pricingTest = await testPricingPageAccess();
  
  console.log('\n🎉 Test Results:');
  console.log(`✅ Reflex Event Tracking: ${reflexTest ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Pricing Page Access: ${pricingTest ? 'PASS' : 'FAIL'}`);
  
  if (reflexTest && pricingTest) {
    console.log('\n🎉 All tests passed! Pricing Intelligence Board is ready for production.');
  } else {
    console.log('\n❌ Some tests failed. Check deployment and configuration.');
  }
}

runTests();
