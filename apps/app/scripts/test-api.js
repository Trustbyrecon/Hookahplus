#!/usr/bin/env node

// Test the test-session API endpoint
async function testAPI() {
  console.log('Ì∑™ Testing Test Session API...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/test-session/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tableId: 'T-TEST-API',
        customerInfo: {
          name: 'API Test Customer',
          phone: '(555) 999-8888'
        }
      }),
    });
    
    const data = await response.json();
    
    console.log('Ì≥ä API Response:');
    console.log(`   Status: ${response.status}`);
    console.log(`   Success: ${data.success}`);
    console.log(`   Payment Intent ID: ${data.paymentIntentId}`);
    console.log(`   Amount: $${(data.amount / 100).toFixed(2)}`);
    console.log(`   Real Stripe: ${data.realStripe || false}`);
    console.log(`   Simulated: ${data.simulated || false}`);
    console.log(`   Message: ${data.message}`);
    
    if (data.metadata) {
      console.log('\nÌ≥ã Metadata:');
      Object.entries(data.metadata).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
    }
    
    if (data.success) {
      console.log('\n‚úÖ Test session API is working!');
      if (data.realStripe) {
        console.log('   Ìæâ Real Stripe integration is active!');
        console.log('   Check your Stripe dashboard for the transaction.');
      } else {
        console.log('   Ì≥ù Using simulation mode (Stripe not configured)');
        console.log('   Update your .env.local with real Stripe keys to enable real transactions.');
      }
    } else {
      console.log('\n‚ùå Test session API failed');
    }
    
  } catch (error) {
    console.log('\n‚ùå API test failed:');
    console.log(`   Error: ${error.message}`);
    console.log('\nÌ≤° Make sure your development server is running:');
    console.log('   npm run dev');
  }
}

testAPI().catch(console.error);
