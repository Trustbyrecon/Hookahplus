require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  console.log('🔍 Comprehensive Database Connection Test\n');
  console.log('=' .repeat(60));

  // Step 1: Check environment variable
  console.log('\n📋 Step 1: Checking DATABASE_URL environment variable...');
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set in .env.local');
    console.error('\n💡 Solution:');
    console.error('   1. Create/update apps/app/.env.local');
    console.error('   2. Add: DATABASE_URL="postgresql://..."');
    return;
  }

  console.log('✅ DATABASE_URL is set');
  console.log(`   Format: ${databaseUrl.substring(0, 50)}...`);
  
  // Check SSL
  const hasSSL = databaseUrl.includes('sslmode=require') || databaseUrl.includes('sslmode=prefer');
  console.log(`   SSL Mode: ${hasSSL ? '✅ Required/Preferred' : '⚠️ Not specified'}`);
  
  // Check if it's Supabase
  const isSupabase = databaseUrl.includes('supabase.co');
  console.log(`   Provider: ${isSupabase ? '✅ Supabase' : '⚠️ Unknown'}`);

  // Step 2: Test Prisma connection
  console.log('\n📋 Step 2: Testing Prisma connection...');
  const prisma = new PrismaClient({
    log: ['error', 'warn'],
  });

  try {
    console.log('   Attempting to connect...');
    await prisma.$connect();
    console.log('✅ Prisma connection successful!');
  } catch (connectError) {
    console.error('❌ Prisma connection failed!');
    console.error(`   Error: ${connectError.message}`);
    
    if (connectError.message.includes('P1001')) {
      console.error('\n💡 Solution: Database server is not reachable');
      console.error('   - Check if Supabase project is active (not paused)');
      console.error('   - Verify network connection');
      console.error('   - Check firewall settings');
    } else if (connectError.message.includes('P1000')) {
      console.error('\n💡 Solution: Authentication failed');
      console.error('   - Verify DATABASE_URL password is correct');
      console.error('   - Check Supabase dashboard for correct credentials');
    } else if (connectError.message.includes('SSL')) {
      console.error('\n💡 Solution: SSL connection required');
      console.error('   - Add ?sslmode=require to DATABASE_URL');
    }
    
    await prisma.$disconnect();
    return;
  }

  // Step 3: Test database query
  console.log('\n📋 Step 3: Testing database query...');
  try {
    const sessionCount = await prisma.session.count();
    console.log(`✅ Database query successful!`);
    console.log(`   Current sessions in database: ${sessionCount}`);
  } catch (queryError) {
    console.error('❌ Database query failed!');
    console.error(`   Error: ${queryError.message}`);
    
    if (queryError.message.includes('does not exist')) {
      console.error('\n💡 Solution: Table might not exist');
      console.error('   - Run: npx prisma migrate deploy');
      console.error('   - Or: npx prisma db push');
    } else if (queryError.message.includes('relation') || queryError.message.includes('table')) {
      console.error('\n💡 Solution: Schema mismatch');
      console.error('   - Check Prisma schema matches database');
      console.error('   - Run: npx prisma generate');
      console.error('   - Then: npx prisma migrate deploy');
    }
    
    await prisma.$disconnect();
    return;
  }

  // Step 4: Test table structure
  console.log('\n📋 Step 4: Testing table structure...');
  try {
    const sampleSession = await prisma.session.findFirst({
      select: {
        id: true,
        tableId: true,
        state: true,
        createdAt: true
      }
    });
    
    if (sampleSession) {
      console.log('✅ Table structure is correct');
      console.log(`   Sample session ID: ${sampleSession.id}`);
      console.log(`   Sample table ID: ${sampleSession.tableId}`);
    } else {
      console.log('✅ Table structure is correct (no sessions yet)');
    }
  } catch (structureError) {
    console.error('❌ Table structure check failed!');
    console.error(`   Error: ${structureError.message}`);
  }

  // Step 5: Test write operation
  console.log('\n📋 Step 5: Testing write operation...');
  try {
    const { SessionSource, SessionState } = require('@prisma/client');
    const testSession = await prisma.session.create({
      data: {
        loungeId: 'test-lounge',
        source: SessionSource.WALK_IN, // Use enum
        externalRef: `test-${Date.now()}`,
        trustSignature: 'test-signature',
        tableId: 'TEST-TABLE',
        customerRef: 'Test User',
        flavor: 'Test Flavor',
        flavorMix: JSON.stringify(['Test Flavor']), // JSONB needs JSON string
        priceCents: 3000,
        state: SessionState.PENDING, // Use enum - PENDING instead of NEW
        durationSecs: 45 * 60,
      }
    });
    
    console.log('✅ Write operation successful!');
    console.log(`   Created test session: ${testSession.id}`);
    
    // Clean up test session
    await prisma.session.delete({
      where: { id: testSession.id }
    });
    console.log('   Test session cleaned up');
  } catch (writeError) {
    console.error('❌ Write operation failed!');
    console.error(`   Error: ${writeError.message}`);
    
    if (writeError.message.includes('P2002')) {
      console.error('\n💡 Solution: Duplicate entry (unlikely in test)');
    } else if (writeError.message.includes('P2003')) {
      console.error('\n💡 Solution: Foreign key constraint');
      console.error('   - Check required relationships exist');
    } else if (writeError.message.includes('null') || writeError.message.includes('required')) {
      console.error('\n💡 Solution: Missing required field');
      console.error('   - Check Prisma schema for required fields');
    }
  }

  await prisma.$disconnect();
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ Database connection test complete!');
  console.log('\n💡 If all tests passed, your database is ready to use.');
  console.log('   If any test failed, follow the suggested solutions above.');
}

testDatabaseConnection().catch(console.error);

