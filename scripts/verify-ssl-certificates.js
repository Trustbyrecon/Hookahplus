#!/usr/bin/env node

/**
 * SSL Certificate Verification Script
 * Verifies SSL certificates are properly configured for production domains
 */

const https = require('https');
const tls = require('tls');
const dns = require('dns').promises;

// Domains to check
const DOMAINS = [
  'hookahplus.net',
  'www.hookahplus.net',
  'app.hookahplus.net',
  'guest.hookahplus.net',
  'site.hookahplus.net'
];

/**
 * Get SSL certificate information
 */
function getCertificateInfo(hostname) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      rejectUnauthorized: false
    };

    const socket = tls.connect(options, () => {
      const cert = socket.getPeerCertificate();
      const daysUntilExpiry = Math.floor((new Date(cert.valid_to) - new Date()) / (1000 * 60 * 60 * 24));
      
      resolve({
        subject: cert.subject,
        issuer: cert.issuer,
        validFrom: cert.valid_from,
        validTo: cert.valid_to,
        daysUntilExpiry,
        isValid: socket.authorized,
        error: socket.authorizationError
      });
      
      socket.end();
    });

    socket.on('error', reject);
  });
}

/**
 * Check if domain resolves to correct IP
 */
async function checkDNSResolution(hostname) {
  try {
    const addresses = await dns.resolve4(hostname);
    return {
      resolved: true,
      addresses
    };
  } catch (error) {
    return {
      resolved: false,
      error: error.message
    };
  }
}

/**
 * Test HTTPS connection
 */
function testHTTPSConnection(hostname) {
  return new Promise((resolve) => {
    const options = {
      hostname,
      port: 443,
      path: '/',
      method: 'HEAD',
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      resolve({
        success: true,
        statusCode: res.statusCode,
        headers: res.headers
      });
    });

    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        success: false,
        error: 'Connection timeout'
      });
    });

    req.end();
  });
}

/**
 * Check SSL certificate for a domain
 */
async function checkDomain(hostname) {
  console.log(`\n🔍 Checking ${hostname}...`);
  
  // Check DNS resolution
  const dnsResult = await checkDNSResolution(hostname);
  if (!dnsResult.resolved) {
    console.log(`   ❌ DNS Resolution Failed: ${dnsResult.error}`);
    return;
  }
  console.log(`   ✅ DNS Resolution: ${dnsResult.addresses.join(', ')}`);

  // Test HTTPS connection
  const httpsResult = await testHTTPSConnection(hostname);
  if (!httpsResult.success) {
    console.log(`   ❌ HTTPS Connection Failed: ${httpsResult.error}`);
    return;
  }
  console.log(`   ✅ HTTPS Connection: ${httpsResult.statusCode}`);

  // Get certificate info
  try {
    const certInfo = await getCertificateInfo(hostname);
    
    if (certInfo.isValid) {
      console.log(`   ✅ SSL Certificate Valid`);
      console.log(`   📅 Issued: ${certInfo.validFrom}`);
      console.log(`   📅 Expires: ${certInfo.validTo}`);
      console.log(`   ⏰ Days until expiry: ${certInfo.daysUntilExpiry}`);
      
      if (certInfo.daysUntilExpiry < 30) {
        console.log(`   ⚠️  WARNING: Certificate expires in ${certInfo.daysUntilExpiry} days!`);
      }
      
      console.log(`   🏢 Issuer: ${certInfo.issuer.CN}`);
    } else {
      console.log(`   ❌ SSL Certificate Invalid: ${certInfo.error}`);
    }
  } catch (error) {
    console.log(`   ❌ Certificate Check Failed: ${error.message}`);
  }
}

/**
 * Main verification function
 */
async function verifySSLCertificates() {
  console.log('🔒 SSL Certificate Verification');
  console.log('===============================');
  console.log(`Checking ${DOMAINS.length} domains...`);

  for (const domain of DOMAINS) {
    await checkDomain(domain);
  }

  console.log('\n✅ SSL verification complete');
  console.log('\n📋 Next Steps:');
  console.log('1. Verify all domains have valid SSL certificates');
  console.log('2. Set up certificate expiration monitoring');
  console.log('3. Test HTTPS redirects are working');
  console.log('4. Verify HSTS headers are present');
}

// Run verification
if (require.main === module) {
  verifySSLCertificates().catch(console.error);
}

module.exports = {
  checkDomain,
  getCertificateInfo,
  testHTTPSConnection
};
