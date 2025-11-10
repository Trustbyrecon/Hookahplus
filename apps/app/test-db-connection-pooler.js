#!/usr/bin/env node
/**
 * Test database connection using Supabase connection pooler
 * Connection pooler is more reliable for serverless environments
 */

const { PrismaClient } = require('@prisma/client');

async function testPoolerConnection() {
  console.log('🔍 Testing database connection with pooler...\n');
  
  // Try connection pooler endpoint (port 6543)
  // Format: postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
  const poolerUrl = 'postgresql://postgres.hsypmyqtlxjwpnkkacmo:E1hqrL3FjsWVItZR@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require';
  
  console.log('🔄 Attempting connection with pooler endpoint...');
  console.log('   Host: aws-0-us-east-1.pooler.supabase.com');
  console.log('   Port: 6543 (pooler)');
  console.log('   SSL: Required\n');
  
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: poolerUrl
      }
    },
    log: ['error'],
  });
  
  try {
    await prisma.$connect();
    console.log('✅ Database connection successful with pooler!\n');
    
    // Try a simple query
    const sessionCount = await prisma.session.count();
    console.log(`✅ Query successful! Found ${sessionCount} sessions in database.\n`);
    
    await prisma.$disconnect();
    console.log('✅ Pooler connection test complete - Database is working!');
    console.log('\n💡 Update your .env.local to use pooler endpoint:');
    console.log('DATABASE_URL="postgresql://postgres.hsypmyqtlxjwpnkkacmo:E1hqrL3FjsWVItZR@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require"');
    process.exit(0);
  } catch (error) {
    console.error('❌ Pooler connection also failed!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('Can\'t reach database server')) {
      console.log('\n💡 Possible issues:');
      console.log('   1. Network/firewall blocking connection');
      console.log('   2. Supabase project region might be different');
      console.log('   3. Try checking Supabase Dashboard → Settings → Database → Connection Pooling');
    }
    
    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

testPoolerConnection();

