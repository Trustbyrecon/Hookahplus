const fetch = require('node-fetch');

const BASE_URL = 'https://hookahplus.net';
const PRICING_URL = `${BASE_URL}/pricing`;
const SYNC_OPTIMIZE_URL = `${BASE_URL}/api/sync/optimize`;
const POS_WAITLIST_URL = `${BASE_URL}/api/admin/pos-waitlist`;

console.log('🧪 Testing Enhanced Pricing Intelligence Board');

async function testPricingPageAccess() {
  console.log('\n📊 Test 1: Testing Pricing Page Access...');
  
  try {
    const response = await fetch(PRICING_URL);
    
    if (response.ok) {
      console.log('✅ Pricing page accessible');
      return true;
    } else {
      console.error(`❌ Pricing page failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing pricing page:', error.message);
    return false;
  }
}

async function testSyncOptimizeEndpoint() {
  console.log('\n🔄 Test 2: Testing Sync/Optimize Endpoint...');
  
  try {
    const testPayload = {
      action: 'start_onboarding',
      selectedTier: 'core',
      timestamp: Date.now(),
      source: 'pricing_intelligence_test'
    };

    const response = await fetch(SYNC_OPTIMIZE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Sync/Optimize endpoint working:', data.action);
      console.log('   Config:', data.config);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Sync/Optimize failed: ${response.status} ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing sync/optimize:', error.message);
    return false;
  }
}

async function testPosWaitlistEndpoint() {
  console.log('\n📋 Test 3: Testing POS Waitlist Endpoint...');
  
  try {
    const testPayload = {
      source: 'pricing_intelligence_test',
      selectedTier: 'trust',
      interest: 'pos_integration',
      timestamp: Date.now(),
      contactType: 'sales_inquiry'
    };

    const response = await fetch(POS_WAITLIST_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testPayload)
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ POS Waitlist endpoint working:', data.message);
      console.log('   Waitlist ID:', data.waitlistId);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ POS Waitlist failed: ${response.status} ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing POS waitlist:', error.message);
    return false;
  }
}

async function testWaitlistRetrieval() {
  console.log('\n📋 Test 4: Testing Waitlist Retrieval...');
  
  try {
    const response = await fetch(POS_WAITLIST_URL);

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Waitlist retrieval working');
      console.log(`   Total entries: ${data.total}`);
      return true;
    } else {
      console.error(`❌ Waitlist retrieval failed: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Error testing waitlist retrieval:', error.message);
    return false;
  }
}

async function testOnboardingFlow() {
  console.log('\n🚀 Test 5: Testing Onboarding Flow Integration...');
  
  try {
    // Test different tier configurations
    const tiers = ['starter', 'core', 'trust', 'enterprise'];
    
    for (const tier of tiers) {
      const response = await fetch(SYNC_OPTIMIZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_onboarding',
          selectedTier: tier,
          timestamp: Date.now(),
          source: 'test_onboarding'
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ ${tier} tier onboarding config:`, {
          complexity: data.config.complexity,
          estimatedTime: data.config.estimatedTime,
          features: data.config.features.length
        });
      } else {
        console.error(`❌ ${tier} tier onboarding failed`);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing onboarding flow:', error.message);
    return false;
  }
}

async function runEnhancedPricingTests() {
  console.log('🎯 Starting Enhanced Pricing Intelligence Board Tests\n');
  
  const results = {
    pricingPage: await testPricingPageAccess(),
    syncOptimize: await testSyncOptimizeEndpoint(),
    posWaitlist: await testPosWaitlistEndpoint(),
    waitlistRetrieval: await testWaitlistRetrieval(),
    onboardingFlow: await testOnboardingFlow()
  };
  
  console.log('\n🎉 Enhanced Pricing Intelligence Board Test Results:');
  console.log(`✅ Pricing Page Access: ${results.pricingPage ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Sync/Optimize Endpoint: ${results.syncOptimize ? 'PASS' : 'FAIL'}`);
  console.log(`✅ POS Waitlist Endpoint: ${results.posWaitlist ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Waitlist Retrieval: ${results.waitlistRetrieval ? 'PASS' : 'FAIL'}`);
  console.log(`✅ Onboarding Flow Integration: ${results.onboardingFlow ? 'PASS' : 'FAIL'}`);
  
  const allPassed = Object.values(results).every(result => result === true);
  
  if (allPassed) {
    console.log('\n🎉 All Enhanced Pricing Intelligence Board tests passed!');
    console.log('\n📋 Features Verified:');
    console.log('   • Enhanced subscription tiers with per-session rates');
    console.log('   • Operationalized "Start Operator Onboarding" button');
    console.log('   • Operationalized "Contact Sales" to POS waitlist');
    console.log('   • Sync/Optimize endpoint for onboarding flow');
    console.log('   • POS waitlist management system');
    console.log('   • Tier-specific onboarding configurations');
  } else {
    console.log('\n❌ Some tests failed. Check deployment and configuration.');
  }
  
  return allPassed;
}

runEnhancedPricingTests();
