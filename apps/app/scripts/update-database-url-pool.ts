/**
 * Update DATABASE_URL with Connection Pool Limits
 * 
 * This script updates the DATABASE_URL in .env.local to include connection pool parameters.
 * 
 * Usage: npx tsx scripts/update-database-url-pool.ts
 */

import * as fs from 'fs';
import * as path from 'path';

const envPath = path.join(__dirname, '../.env.local');

function updateDatabaseUrl() {
  console.log('🔧 Updating DATABASE_URL with connection pool limits');
  console.log('='.repeat(70));
  
  if (!fs.existsSync(envPath)) {
    console.error(`❌ .env.local not found at: ${envPath}`);
    console.log('\n💡 Create .env.local first with your DATABASE_URL');
    process.exit(1);
  }
  
  // Read current .env.local
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  let updated = false;
  const newLines = lines.map(line => {
    // Match DATABASE_URL line (with or without quotes)
    const match = line.match(/^DATABASE_URL\s*=\s*(.+)$/);
    if (match) {
      let url = match[1].trim();
      
      // Remove quotes if present
      if ((url.startsWith('"') && url.endsWith('"')) || 
          (url.startsWith("'") && url.endsWith("'"))) {
        url = url.slice(1, -1);
      }
      
      // Check if connection pool params already exist
      if (url.includes('connection_limit') || url.includes('pool_timeout')) {
        // Check if it has the old values (15, 5) - if so, update to new values (30, 10)
        const hasOldValues = url.includes('connection_limit=15') || url.includes('pool_timeout=5');
        
        if (hasOldValues) {
          console.log('🔄 Updating existing connection pool parameters from old values (15, 5) to new values (30, 10)');
          
          // Replace old values with new values using regex
          url = url.replace(/connection_limit=\d+/g, 'connection_limit=30');
          url = url.replace(/pool_timeout=\d+/g, 'pool_timeout=10');
          
          updated = true;
          console.log('📝 Updated DATABASE_URL with new pool limits:');
          console.log(`   New: ${url.substring(0, 80)}...`);
          
          // Preserve original quote style
          if (line.includes('"')) {
            return `DATABASE_URL="${url}"`;
          } else if (line.includes("'")) {
            return `DATABASE_URL='${url}'`;
          } else {
            return `DATABASE_URL=${url}`;
          }
        } else {
          // Already has new values or different values - check if they're correct
          const hasNewValues = url.includes('connection_limit=30') && url.includes('pool_timeout=10');
          if (hasNewValues) {
            console.log('✅ DATABASE_URL already has correct connection pool parameters (30, 10)');
          } else {
            console.log('⚠️  DATABASE_URL has connection pool parameters, but with different values');
            console.log('   Current URL:', url.substring(0, 80) + '...');
            console.log('   Expected: connection_limit=30&pool_timeout=10');
          }
          return line; // Keep as-is
        }
      }
      
      // Add connection pool parameters
      const separator = url.includes('?') ? '&' : '?';
      // P0: Increase connection pool for high concurrency (100 concurrent requests)
      // - connection_limit=30: Support up to 30 concurrent connections (was 15)
      // - pool_timeout=10: 10 second timeout (was 5) to handle connection acquisition delays
      const newUrl = `${url}${separator}connection_limit=30&pool_timeout=10`;
      
      updated = true;
      console.log('📝 Updated DATABASE_URL:');
      console.log(`   Old: ${url.substring(0, 50)}...`);
      console.log(`   New: ${newUrl.substring(0, 50)}...`);
      
      // Preserve original quote style
      if (line.includes('"')) {
        return `DATABASE_URL="${newUrl}"`;
      } else if (line.includes("'")) {
        return `DATABASE_URL='${newUrl}'`;
      } else {
        return `DATABASE_URL=${newUrl}`;
      }
    }
    return line;
  });
  
  if (!updated) {
    console.log('⚠️  DATABASE_URL not found in .env.local');
    console.log('\n💡 Add this line to your .env.local:');
    console.log('   DATABASE_URL="postgresql://...?connection_limit=15&pool_timeout=5"');
    process.exit(1);
  }
  
  // Write updated content
  fs.writeFileSync(envPath, newLines.join('\n'), 'utf-8');
  
  console.log('\n✅ .env.local updated successfully!');
  console.log('\n💡 Next steps:');
  console.log('   1. Restart your dev server (Ctrl+C, then npm run dev)');
  console.log('   2. Re-run performance tests to verify improvements');
  console.log('\n📊 Connection Pool Settings:');
    console.log('   - connection_limit=30: Max 30 concurrent connections (increased for load testing)');
    console.log('   - pool_timeout=10: 10 second timeout for getting a connection (increased for reliability)');
}

updateDatabaseUrl();

