#!/usr/bin/env node

/**
 * Fix deployment issues identified by smoke tests
 */

const https = require('https');

// Test the actual deployment URLs
const DEPLOYMENT_URLS = [
  'https://app-8cm83m8ky-dwaynes-projects-1c5c280a.vercel.app',
  'https://guest-ebnp6ncy9-dwaynes-projects-1c5c280a.vercel.app'
];

async function testDeployment(url) {
  try {
    const response = await fetch(url);
    console.log(`✅ ${url} - Status: ${response.status}`);
    
    if (response.status === 200) {
      const text = await response.text();
      if (text.includes('Next.js') || text.includes('React')) {
        console.log(`   📱 App is running correctly`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.log(`❌ ${url} - Error: ${error.message}`);
    return false;
  }
}

async function testWebhookEndpoints() {
  const webhookUrls = [
    'https://app-8cm83m8ky-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook',
    'https://guest-ebnp6ncy9-dwaynes-projects-1c5c280a.vercel.app/api/stripe/webhook'
  ];
  
  for (const url of webhookUrls) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'webhook' })
      });
      
      console.log(`🔗 ${url} - Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`   📊 Response: ${JSON.stringify(data)}`);
      }
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`);
    }
  }
}

async function testStripeCatalog() {
  const catalogUrls = [
    'https://app-8cm83m8ky-dwaynes-projects-1c5c280a.vercel.app/stripe_ids.json',
    'https://guest-ebnp6ncy9-dwaynes-projects-1c5c280a.vercel.app/stripe_ids.json'
  ];
  
  for (const url of catalogUrls) {
    try {
      const response = await fetch(url);
      console.log(`💳 ${url} - Status: ${response.status}`);
      
      if (response.status === 200) {
        const data = await response.json();
        console.log(`   📦 Products: ${Object.keys(data.products || {}).length}`);
      }
    } catch (error) {
      console.log(`❌ ${url} - Error: ${error.message}`);
    }
  }
}

async function main() {
  console.log('🔧 Fixing deployment issues...\n');
  
  console.log('📱 Testing deployments:');
  for (const url of DEPLOYMENT_URLS) {
    await testDeployment(url);
  }
  
  console.log('\n🔗 Testing webhook endpoints:');
  await testWebhookEndpoints();
  
  console.log('\n💳 Testing Stripe catalog:');
  await testStripeCatalog();
  
  console.log('\n✅ Deployment testing complete!');
}

main().catch(console.error);
