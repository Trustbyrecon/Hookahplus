/**
 * Verify externalRef Column Exists
 * Agent: Noor (session_agent) + database_agent
 * 
 * This script verifies that the externalRef column exists in the Session table
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

// Load .env.local explicitly
config({ path: resolve(__dirname, '../.env.local') });

const prisma = new PrismaClient();

async function verifyExternalRefColumn() {
  console.log('🔍 [Noor + database_agent] Verifying externalRef column exists...\n');

  try {
    // Try to query the externalRef column
    const testSession = await prisma.session.findFirst({
      select: {
        id: true,
        externalRef: true,
        tableId: true,
        customerRef: true,
      },
      take: 1,
    });

    if (testSession) {
      console.log('✅ externalRef column exists and is queryable!');
      console.log(`   Sample session: ${testSession.id}`);
      console.log(`   externalRef: ${testSession.externalRef || '(null)'}`);
      console.log(`   tableId: ${testSession.tableId || '(null)'}`);
    } else {
      console.log('✅ externalRef column exists (no sessions in database yet)');
    }

    // Try to create a test session with externalRef
    console.log('\n📋 Testing session creation with externalRef...');
    const testSessionData = {
      loungeId: 'test-lounge',
      source: 'WALK_IN' as const,
      externalRef: `test-verify-${Date.now()}`,
      trustSignature: 'test-signature',
      tableId: `T-VERIFY-${Date.now() % 1000}`,
      customerRef: 'Verification Test',
      flavor: 'Test Flavor',
      priceCents: 3000,
      state: 'PENDING' as const,
    };

    const newSession = await prisma.session.create({
      data: testSessionData,
    });

    console.log('✅ Session created successfully with externalRef!');
    console.log(`   Session ID: ${newSession.id}`);
    console.log(`   externalRef: ${newSession.externalRef}`);
    console.log(`   tableId: ${newSession.tableId}`);

    // Clean up test session
    await prisma.session.delete({
      where: { id: newSession.id },
    });
    console.log('✅ Test session cleaned up');

    console.log('\n✅ Verification complete: externalRef column is working correctly!');
    return true;
  } catch (error: any) {
    if (error.message?.includes('externalRef') || error.message?.includes('does not exist')) {
      console.error('❌ externalRef column does not exist in database');
      console.error('   Error:', error.message);
      console.error('\n💡 Action required: Run the migration in Supabase SQL Editor');
      return false;
    } else {
      console.error('❌ Error verifying externalRef column:', error);
      throw error;
    }
  } finally {
    await prisma.$disconnect();
  }
}

verifyExternalRefColumn()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });

