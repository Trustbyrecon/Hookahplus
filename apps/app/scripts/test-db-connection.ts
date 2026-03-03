/**
 * Test Database Connection
 * Quick script to verify DATABASE_URL connectivity
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
const result = dotenv.config({ path: envPath });

if (result.error) {
  console.error('❌ Failed to load .env.local:', result.error);
  process.exit(1);
}

console.log('📁 Loaded .env.local from:', envPath);
console.log('🔑 DATABASE_URL:', process.env.DATABASE_URL 
  ? `SET (${process.env.DATABASE_URL.substring(0, 50)}...)` 
  : 'NOT SET');

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment');
  process.exit(1);
}

// Extract connection details for display
const dbUrl = process.env.DATABASE_URL;
const urlMatch = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
if (urlMatch) {
  const [, user, , host, port, database] = urlMatch;
  console.log('\n📊 Connection Details:');
  console.log(`   Host: ${host}`);
  console.log(`   Port: ${port}`);
  console.log(`   Database: ${database}`);
  console.log(`   User: ${user}`);
}

// Test connection
console.log('\n🔌 Testing database connection...');
const prisma = new PrismaClient({
  log: ['error', 'warn', 'info'],
});

async function testConnection() {
  try {
    // Simple query to test connection
    console.log('   → Executing: SELECT 1');
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Connection successful!');
    console.log('   Result:', result);

    // Test a simple table query
    console.log('\n   → Testing Session table access...');
    const sessionCount = await prisma.session.count();
    console.log(`✅ Session table accessible (${sessionCount} sessions)`);

    // Test connection pool settings
    console.log('\n📊 Connection Pool Info:');
    const poolInfo = await prisma.$queryRaw`
      SELECT 
        count(*) as active_connections,
        state
      FROM pg_stat_activity 
      WHERE datname = current_database()
      GROUP BY state
    ` as any[];
    console.log('   Active connections:', poolInfo);

    console.log('\n✅ All database tests passed!');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Database connection failed:');
    console.error('   Error:', error.message);
    console.error('   Code:', error.code);
    console.error('   Meta:', error.meta);
    
    if (error.message.includes("Can't reach database server")) {
      console.error('\n💡 Troubleshooting:');
      console.error('   1. Check if Supabase database is running');
      console.error('   2. Verify network connectivity to database host');
      console.error('   3. Check firewall rules for port 5432');
      console.error('   4. Verify DATABASE_URL is correct in .env.local');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();

