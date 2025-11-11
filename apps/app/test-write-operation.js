require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');

async function testWrite() {
  const prisma = new PrismaClient({
    log: ['query', 'error', 'warn'],
  });
  
  try {
    await prisma.$connect();
    console.log('✅ Connected\n');
    
    // Try minimal session creation - test each field
    console.log('Testing minimal session creation...');
    const { SessionSource, SessionState } = require('@prisma/client');
    
    // Test 1: Try with just required fields
    console.log('\n📋 Test 1: Required fields only...');
    try {
      const test1 = await prisma.session.create({
        data: {
          source: SessionSource.WALK_IN,
          trustSignature: 'test-' + Date.now(),
          tableId: 'TEST-1',
          priceCents: 3000,
          state: SessionState.PENDING,
        }
      });
      console.log('✅ Test 1 passed:', test1.id);
      await prisma.session.delete({ where: { id: test1.id } });
    } catch (e) {
      console.error('❌ Test 1 failed:', e.message);
    }
    
    // Test 2: Add optional fields
    console.log('\n📋 Test 2: With optional fields...');
    try {
      const test2 = await prisma.session.create({
        data: {
          source: SessionSource.WALK_IN,
          trustSignature: 'test-' + Date.now(),
          tableId: 'TEST-2',
          priceCents: 3000,
          state: SessionState.PENDING,
          customerRef: 'Test User',
          flavor: 'Test Flavor',
          flavorMix: JSON.stringify(['Test Flavor']), // JSONB needs JSON string
          loungeId: 'test-lounge',
          durationSecs: 45 * 60,
        }
      });
      console.log('✅ Test 2 passed:', test2.id);
      await prisma.session.delete({ where: { id: test2.id } });
    } catch (e) {
      console.error('❌ Test 2 failed:', e.message);
      if (e.meta) {
        console.error('Meta:', JSON.stringify(e.meta, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.meta) {
      console.error('Meta:', JSON.stringify(error.meta, null, 2));
    }
  } finally {
    await prisma.$disconnect();
  }
}

testWrite();

