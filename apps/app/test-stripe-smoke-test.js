#!/usr/bin/env node

/**
 * $1 Stripe Smoke Test Script
 * 
 * This script tests the $1 Stripe smoke test functionality to ensure
 * payment processing is working correctly and the PaymentIntent warning is resolved.
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3002';

async function testStripeSmokeTest() {
  console.log('🔥 Starting $1 Stripe Smoke Test...\n');

  const results = {
    tests: [],
    passed: 0,
    failed: 0,
    warnings: []
  };

  // Helper function to add test result
  function addTest(name, passed, message, details = null) {
    results.tests.push({ name, passed, message, details });
    if (passed) {
      results.passed++;
      console.log(`✅ ${name}: ${message}`);
    } else {
      results.failed++;
      console.log(`❌ ${name}: ${message}`);
    }
  }

  // Helper function to add warning
  function addWarning(message) {
    results.warnings.push(message);
    console.log(`⚠️  WARNING: ${message}`);
  }

  try {
    // Test 1: Check if the API endpoint is accessible
    console.log('1️⃣ Testing API endpoint accessibility...');
    try {
      const response = await fetch(`${BASE_URL}/api/payments/live-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartTotal: 0,
          itemsCount: 0
        })
      });

      const data = await response.json();
      
      if (response.ok && data.ok) {
        addTest('API Endpoint', true, 'Live test API is accessible and responding');
        console.log(`   Payment Intent ID: ${data.intentId}`);
        console.log(`   Amount: $${(data.amount / 100).toFixed(2)}`);
        console.log(`   Status: ${data.status}`);
      } else {
        addTest('API Endpoint', false, `API returned error: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      addTest('API Endpoint', false, `Failed to reach API: ${error.message}`);
    }

    // Test 2: Check simple Stripe test endpoint
    console.log('\n2️⃣ Testing simple Stripe test endpoint...');
    try {
      const response = await fetch(`${BASE_URL}/api/simple-stripe-test`);
      const data = await response.json();
      
      if (response.ok && data.ok) {
        addTest('Simple Stripe Test', true, 'Simple Stripe test is working');
        console.log(`   Payment Intent ID: ${data.paymentIntent.id}`);
        console.log(`   Status: ${data.paymentIntent.status}`);
      } else {
        addTest('Simple Stripe Test', false, `Simple test failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      addTest('Simple Stripe Test', false, `Simple test error: ${error.message}`);
    }

    // Test 3: Check test session creation endpoint
    console.log('\n3️⃣ Testing test session creation endpoint...');
    try {
      const response = await fetch(`${BASE_URL}/api/test-session/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId: 'T-TEST',
          customerInfo: {
            name: 'Test Customer',
            phone: '+1 (555) 123-4567'
          }
        })
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        addTest('Test Session Creation', true, 'Test session creation is working');
        console.log(`   Payment Intent ID: ${data.paymentIntentId}`);
        console.log(`   Client Secret: ${data.clientSecret ? 'Present' : 'Missing'}`);
        console.log(`   Real Stripe: ${data.realStripe ? 'Yes' : 'No'}`);
      } else {
        addTest('Test Session Creation', false, `Test session creation failed: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      addTest('Test Session Creation', false, `Test session creation error: ${error.message}`);
    }

    // Test 4: Check if PaymentIntent configuration is correct
    console.log('\n4️⃣ Testing PaymentIntent configuration...');
    try {
      const response = await fetch(`${BASE_URL}/api/payments/live-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartTotal: 0,
          itemsCount: 0
        })
      });

      const data = await response.json();
      
      if (response.ok && data.ok) {
        // Check if the response includes proper configuration indicators
        const hasReturnUrl = data.returnUrl || data.return_url;
        const hasAutomaticPaymentMethods = data.automaticPaymentMethods || data.automatic_payment_methods;
        
        if (hasReturnUrl) {
          addTest('Return URL Configuration', true, 'Return URL is properly configured');
        } else {
          addTest('Return URL Configuration', false, 'Return URL is missing from PaymentIntent');
          addWarning('PaymentIntent may show warning about missing return_url');
        }

        if (hasAutomaticPaymentMethods) {
          addTest('Automatic Payment Methods', true, 'Automatic payment methods are configured');
        } else {
          addTest('Automatic Payment Methods', false, 'Automatic payment methods configuration is missing');
        }

        // Check metadata
        if (data.metadata && data.metadata.test_type === 'smoke_test') {
          addTest('Test Metadata', true, 'Proper test metadata is included');
        } else {
          addTest('Test Metadata', false, 'Test metadata is missing or incorrect');
        }
      } else {
        addTest('PaymentIntent Configuration', false, 'Cannot test configuration due to API error');
      }
    } catch (error) {
      addTest('PaymentIntent Configuration', false, `Configuration test error: ${error.message}`);
    }

    // Test 5: Check payment return page
    console.log('\n5️⃣ Testing payment return page...');
    try {
      const response = await fetch(`${BASE_URL}/payment/return?session_id=test_123&amount=100`);
      
      if (response.ok) {
        addTest('Payment Return Page', true, 'Payment return page is accessible');
      } else {
        addTest('Payment Return Page', false, `Return page returned status: ${response.status}`);
      }
    } catch (error) {
      addTest('Payment Return Page', false, `Return page error: ${error.message}`);
    }

    // Test 6: Environment variables check
    console.log('\n6️⃣ Testing environment configuration...');
    try {
      const response = await fetch(`${BASE_URL}/api/payments/live-test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartTotal: 0,
          itemsCount: 0
        })
      });

      const data = await response.json();
      
      if (response.ok && data.ok) {
        addTest('Environment Variables', true, 'Stripe environment variables are properly configured');
      } else if (data.error && data.error.includes('STRIPE_SECRET_KEY')) {
        addTest('Environment Variables', false, 'STRIPE_SECRET_KEY is not configured');
        addWarning('Stripe secret key is missing - tests will use fallback mode');
      } else {
        addTest('Environment Variables', false, `Environment configuration issue: ${data.error}`);
      }
    } catch (error) {
      addTest('Environment Variables', false, `Environment test error: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Test suite failed:', error);
    addTest('Test Suite', false, `Test suite execution failed: ${error.message}`);
  }

  // Generate summary report
  console.log('\n' + '='.repeat(60));
  console.log('🔥 $1 STRIPE SMOKE TEST SUMMARY');
  console.log('='.repeat(60));
  
  console.log(`\n📊 Test Results:`);
  console.log(`   ✅ Passed: ${results.passed}`);
  console.log(`   ❌ Failed: ${results.failed}`);
  console.log(`   ⚠️  Warnings: ${results.warnings.length}`);
  
  console.log(`\n📋 Detailed Results:`);
  results.tests.forEach(test => {
    const status = test.passed ? '✅' : '❌';
    console.log(`   ${status} ${test.name}: ${test.message}`);
    if (test.details) {
      console.log(`      Details: ${test.details}`);
    }
  });

  if (results.warnings.length > 0) {
    console.log(`\n⚠️  Warnings:`);
    results.warnings.forEach(warning => {
      console.log(`   • ${warning}`);
    });
  }

  // Overall status
  const overallSuccess = results.failed === 0;
  console.log(`\n🎯 Overall Status: ${overallSuccess ? '✅ PASSED' : '❌ FAILED'}`);
  
  if (overallSuccess) {
    console.log('\n🎉 All tests passed! The $1 Stripe smoke test is working correctly.');
    console.log('   The PaymentIntent warning should now be resolved.');
  } else {
    console.log('\n💥 Some tests failed. Please check the issues above.');
    console.log('   The PaymentIntent warning may still be present.');
  }

  console.log('\n📱 Next Steps:');
  console.log('   1. Test the $1 button on the Fire Session Dashboard');
  console.log('   2. Verify no PaymentIntent warnings appear');
  console.log('   3. Check Stripe Dashboard for test transactions');
  console.log('   4. Test with different payment methods if available');

  return overallSuccess;
}

// Run the test
if (require.main === module) {
  testStripeSmokeTest()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error('💥 Test execution failed:', error);
      process.exit(1);
    });
}

module.exports = { testStripeSmokeTest };
