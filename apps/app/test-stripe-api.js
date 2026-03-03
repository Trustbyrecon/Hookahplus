// Test Stripe API directly using built-in fetch
async function testStripeAPI() {
  console.log('Ì∑™ Testing Stripe API with real keys...\n');
  
  try {
    const response = await fetch('http://localhost:3000/api/test-session/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        tableId: 'T-TEST-REAL',
        customerInfo: {
          name: 'Real Test Customer',
          phone: '(555) 123-4567'
        }
      }),
    });
    
    console.log('Ì≥ä Response Status:', response.status);
    
    const text = await response.text();
    console.log('Ì≥ä Response Length:', text.length);
    
    if (response.ok) {
      try {
        const data = JSON.parse(text);
        console.log('\n‚úÖ API Response Parsed:');
        console.log(`   Success: ${data.success}`);
        console.log(`   Payment Intent ID: ${data.paymentIntentId}`);
        console.log(`   Amount: $${(data.amount / 100).toFixed(2)}`);
        console.log(`   Real Stripe: ${data.realStripe || false}`);
        console.log(`   Message: ${data.message}`);
        
        if (data.realStripe) {
          console.log('\nÌæâ REAL STRIPE INTEGRATION WORKING!');
          console.log('   Check your Stripe dashboard for the transaction.');
        } else {
          console.log('\nÌ≥ù Using simulation mode');
        }
      } catch (parseError) {
        console.log('\n‚ùå Failed to parse JSON response');
        console.log('   Raw response (first 200 chars):', text.substring(0, 200));
      }
    } else {
      console.log('\n‚ùå API request failed');
      console.log('   Response:', text.substring(0, 200));
    }
    
  } catch (error) {
    console.log('\n‚ùå Test failed:', error.message);
  }
}

testStripeAPI();
