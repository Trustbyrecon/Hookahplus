/**
 * Stripe Test Mode Reconciliation Setup Script (Simplified)
 * 
 * Agent: Noor
 * 
 * This script creates POS tickets for reconciliation testing.
 * 
 * IMPORTANT: Stripe doesn't allow creating charges with raw card data.
 * Use one of these approaches to create matching Stripe charges:
 * 
 * 1. RECOMMENDED: Use your app to create checkout sessions
 *    - Start app: npm run dev
 *    - Navigate to: http://localhost:3002/preorder/[tableId]
 *    - Complete checkout with test card: 4242 4242 4242 4242
 *    - This creates real Stripe charges automatically
 * 
 * 2. Use test-reconciliation.ts with mock charges
 *    - npx tsx scripts/test-reconciliation.ts
 *    - Uses mock Stripe charges (no real Stripe API needed)
 * 
 * 3. Use existing Stripe charges from your dashboard
 *    - Visit: https://dashboard.stripe.com/test/payments
 *    - Create POS tickets matching existing charges
 */

import { PrismaClient } from '@prisma/client';
import { join } from 'path';

// Set default DATABASE_URL for local development if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${join(process.cwd(), 'prisma/dev.db')}`;
}

const prisma = new PrismaClient();

/**
 * Create test POS tickets
 */
async function createTestPosTickets(): Promise<void> {
  console.log('🔧 Setting up Test POS Tickets for Reconciliation\n');

  try {
    // Create test scenario 1: Perfect match ($35.00)
    console.log('📝 Creating test scenario 1: $35.00 ticket...');
    const ticket1 = await prisma.posTicket.create({
      data: {
        ticketId: `TEST-POS-${Date.now()}-1`,
        sessionId: 'test-session-001',
        amountCents: 3500,
        status: 'paid',
        posSystem: 'square',
        items: JSON.stringify([
          { name: 'Hookah Session', price: 3000 },
          { name: 'Mint Flavor', price: 500 },
        ]),
      },
    });
    console.log(`✅ Created POS ticket: ${ticket1.ticketId}\n`);

    // Create test scenario 2: Another perfect match ($42.00)
    console.log('📝 Creating test scenario 2: $42.00 ticket...');
    const ticket2 = await prisma.posTicket.create({
      data: {
        ticketId: `TEST-POS-${Date.now()}-2`,
        sessionId: 'test-session-002',
        amountCents: 4200,
        status: 'paid',
        posSystem: 'toast',
        items: JSON.stringify([
          { name: 'Hookah Session', price: 3000 },
          { name: 'Watermelon Flavor', price: 500 },
          { name: 'Extra Coals', price: 700 },
        ]),
      },
    });
    console.log(`✅ Created POS ticket: ${ticket2.ticketId}\n`);

    // Create test scenario 3: Another ticket ($30.00)
    console.log('📝 Creating test scenario 3: $30.00 ticket...');
    const ticket3 = await prisma.posTicket.create({
      data: {
        ticketId: `TEST-POS-${Date.now()}-3`,
        sessionId: 'test-session-003',
        amountCents: 3000,
        status: 'paid',
        posSystem: 'clover',
        items: JSON.stringify([
          { name: 'Hookah Session', price: 3000 },
        ]),
      },
    });
    console.log(`✅ Created POS ticket: ${ticket3.ticketId}\n`);

    console.log('✅ POS tickets created successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - POS tickets created: 3`);
    console.log(`   - Ticket 1: $35.00 (session: test-session-001)`);
    console.log(`   - Ticket 2: $42.00 (session: test-session-002)`);
    console.log(`   - Ticket 3: $30.00 (session: test-session-003)\n`);

    console.log('🚀 Next Steps:\n');
    console.log('OPTION 1: Use your app to create matching Stripe charges (RECOMMENDED)');
    console.log('   1. Start app: npm run dev');
    console.log('   2. Navigate to: http://localhost:3002/preorder/[tableId]');
    console.log('   3. Create checkout sessions for $35.00, $42.00, $30.00');
    console.log('   4. Complete with test card: 4242 4242 4242 4242');
    console.log('   5. Run reconciliation: npx tsx jobs/settle.ts\n');

    console.log('OPTION 2: Use mock charges (no Stripe API needed)');
    console.log('   npx tsx scripts/test-reconciliation.ts\n');

    console.log('OPTION 3: Use existing Stripe charges');
    console.log('   Visit: https://dashboard.stripe.com/test/payments');
    console.log('   Create POS tickets matching existing charges\n');

  } catch (error) {
    console.error('❌ Error creating POS tickets:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Cleanup test data
 */
async function cleanupTestData(): Promise<void> {
  console.log('🧹 Cleaning up test POS tickets...\n');

  try {
    const deletedTickets = await prisma.posTicket.deleteMany({
      where: {
        ticketId: {
          startsWith: 'TEST-POS-',
        },
      },
    });

    const deletedReconciliations = await prisma.settlementReconciliation.deleteMany({
      where: {
        sessionId: {
          startsWith: 'test-session-',
        },
      },
    });

    console.log(`✅ Deleted ${deletedTickets.count} test POS tickets`);
    console.log(`✅ Deleted ${deletedReconciliations.count} test reconciliation records`);
    console.log('\n✅ Cleanup complete');
    console.log('   Note: Stripe charges cannot be deleted via API');
    console.log('   They will remain in your Stripe dashboard but won\'t affect future tests\n');
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// CLI execution
const args = process.argv.slice(2);

if (args.includes('--cleanup')) {
  cleanupTestData()
    .then(() => {
      console.log('✅ Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
} else {
  createTestPosTickets()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}
