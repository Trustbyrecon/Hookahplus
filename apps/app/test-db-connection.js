#!/usr/bin/env node
/**
 * Quick database connection test script
 * Tests if DATABASE_URL is configured and can connect
 */

const { PrismaClient } = require('@prisma/client');

async function testConnection() {
  console.log('🔍 Testing database connection...\n');
  
  // Check if DATABASE_URL is set
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('❌ DATABASE_URL environment variable is not set');
    console.log('\n💡 Make sure .env.local contains:');
    console.log('DATABASE_URL="postgresql://postgres:E1hqrL3FjsWVItZR@hsypmyqtlxjwpnkkacmo.supabase.co:5432/postgres?sslmode=require"');
    process.exit(1);
  }
  
  console.log('✅ DATABASE_URL is set');
  console.log('   Format:', dbUrl.substring(0, 30) + '...' + dbUrl.substring(dbUrl.length - 20));
  console.log('   SSL:', dbUrl.includes('sslmode=require') ? '✅ Required' : '❌ Missing');
  console.log('');
  
  // Test connection
  const prisma = new PrismaClient({
    log: ['error'],
  });
  
  try {
    console.log('🔄 Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Database connection successful!\n');
    
    // Try a simple query
    console.log('🔄 Testing query...');
    const sessionCount = await prisma.session.count();
    console.log(`✅ Query successful! Found ${sessionCount} sessions in database.\n`);
    
    await prisma.$disconnect();
    console.log('✅ Connection test complete - Database is working!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database connection failed!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n💡 Possible issues:');
      console.log('   1. Supabase project might be paused');
      console.log('   2. Network/firewall blocking connection');
      console.log('   3. Database host/port incorrect');
      console.log('   4. SSL connection required but not configured');
    } else if (error.message.includes('authentication')) {
      console.log('\n💡 Authentication failed:');
      console.log('   - Check database password is correct');
      console.log('   - Verify connection string format');
    } else if (error.message.includes('SSL')) {
      console.log('\n💡 SSL error:');
      console.log('   - Add ?sslmode=require to connection string');
    }
    
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

// Load .env.local if available
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not available, rely on environment variables
}

testConnection();

