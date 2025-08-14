#!/usr/bin/env node

// scripts/generate-secrets.js
// Run this script to generate strong cryptographic secrets for your environment variables

const crypto = require('crypto');

console.log('🔐 Generating strong cryptographic secrets for Hookah+ environment...\n');

const secrets = [
  'TRUST_SIGNATURE_SALT',
  'TRUST_CURSOR_SALT', 
  'TRUST_PAYLOAD_SEAL_SECRET',
  'SESSION_NOTES_KEY',
  'JWT_SECRET',
  'COOKIE_SECRET'
];

console.log('Generated secrets (copy these to your .env files):\n');

secrets.forEach(secret => {
  const value = crypto.randomBytes(32).toString('base64');
  console.log(`${secret}=${value}`);
});

console.log('\n📝 Next steps:');
console.log('1. Copy these values to your .env.local file');
console.log('2. Set the same values in Netlify environment variables');
console.log('3. Add .env.local to your .gitignore (if not already there)');
console.log('4. Test with: npm run test:env');
console.log('\n⚠️  Keep these secrets secure and never commit them to version control!');
