#!/usr/bin/env node

/**
 * Vercel Deployment Verification Script
 * Tests all three apps to ensure they're working correctly
 */

const https = require('https');
const http = require('http');

// URLs to test
const urls = [
  {
    name: 'Guest App',
    url: 'https://guest.hookahplus.net',
    expected: 'Guest app should load'
  },
  {
    name: 'App Dashboard',
    url: 'https://app.hookahplus.net',
    expected: 'App dashboard should load'
  },
  {
    name: 'Site Landing',
    url: 'https://hookahplus.net',
    expected: 'Site landing page should load'
  }
];

// Test function
function testUrl(urlObj) {
  return new Promise((resolve) => {
    const client = urlObj.url.startsWith('https') ? https : http;
    
    const req = client.get(urlObj.url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const success = res.statusCode === 200;
        resolve({
          name: urlObj.name,
          url: urlObj.url,
          status: res.statusCode,
          success,
          expected: urlObj.expected,
          responseTime: Date.now() - startTime
        });
      });
    });
    
    const startTime = Date.now();
    
    req.on('error', (err) => {
      resolve({
        name: urlObj.name,
        url: urlObj.url,
        status: 'ERROR',
        success: false,
        error: err.message,
        expected: urlObj.expected
      });
    });
    
    req.setTimeout(10000, () => {
      req.destroy();
      resolve({
        name: urlObj.name,
        url: urlObj.url,
        status: 'TIMEOUT',
        success: false,
        error: 'Request timeout',
        expected: urlObj.expected
      });
    });
  });
}

// Main execution
async function main() {
  console.log('🚀 Testing Vercel Deployments...\n');
  
  const results = await Promise.all(urls.map(testUrl));
  
  console.log('📊 Test Results:\n');
  console.log('┌─────────────────┬─────────────────────────────┬─────────┬──────────┬─────────────────┐');
  console.log('│ App Name        │ URL                         │ Status  │ Success  │ Notes           │');
  console.log('├─────────────────┼─────────────────────────────┼─────────┼──────────┼─────────────────┤');
  
  results.forEach(result => {
    const status = result.status === 'ERROR' || result.status === 'TIMEOUT' 
      ? result.status 
      : result.status.toString();
    const success = result.success ? '✅' : '❌';
    const notes = result.error || (result.success ? 'OK' : 'Failed');
    
    console.log(`│ ${result.name.padEnd(15)} │ ${result.url.padEnd(27)} │ ${status.padEnd(7)} │ ${success.padEnd(8)} │ ${notes.padEnd(15)} │`);
  });
  
  console.log('└─────────────────┴─────────────────────────────┴─────────┴──────────┴─────────────────┘');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  console.log(`\n📈 Summary: ${successCount}/${totalCount} apps working correctly`);
  
  if (successCount === totalCount) {
    console.log('🎉 All deployments are working! Recovery successful!');
    process.exit(0);
  } else {
    console.log('⚠️  Some deployments need attention. Check the failed apps above.');
    process.exit(1);
  }
}

// Run the tests
main().catch(console.error);
