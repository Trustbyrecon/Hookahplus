/**
 * Test Script for POS Reconciliation
 * 
 * Agent: Noor
 * 
 * This script tests the reconciliation job with sample data
 */

import { PrismaClient } from '@prisma/client';
import { runReconciliationJob } from '../jobs/settle';

const prisma = new PrismaClient();

async function testReconciliation() {
  console.log('🧪 [Noor] Testing POS Reconciliation Job\n');

  try {
    // Create test POS tickets
    console.log('Step 1: Creating test POS tickets...');
    const testTickets = await Promise.all([
      prisma.posTicket.create({
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
      }),
      prisma.posTicket.create({
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
      }),
    ]);

    console.log(`✅ Created ${testTickets.length} test POS tickets`);

    // Run reconciliation job
    console.log('\nStep 2: Running reconciliation job...');
    const result = await runReconciliationJob();

    console.log('\n📊 Reconciliation Results:');
    console.log(`  Total Stripe Charges: ${result.totalStripeCharges}`);
    console.log(`  Total POS Tickets: ${result.totalPosTickets}`);
    console.log(`  Matched: ${result.matched}`);
    console.log(`  Orphaned Stripe Charges: ${result.orphanedStripeCharges}`);
    console.log(`  Orphaned POS Tickets: ${result.orphanedPosTickets}`);
    console.log(`  Reconciliation Rate: ${(result.reconciliationRate * 100).toFixed(2)}%`);
    console.log(`  Pricing Parity: ${(result.pricingParity * 100).toFixed(2)}%`);

    if (result.matchedPairs.length > 0) {
      console.log('\n✅ Matched Pairs:');
      result.matchedPairs.forEach((pair, idx) => {
        console.log(`  ${idx + 1}. ${pair.stripeChargeId} ↔ ${pair.posTicketId} (${pair.matchConfidence})`);
      });
    }

    if (result.orphanedCharges.length > 0) {
      console.log('\n⚠️  Orphaned Charges:');
      result.orphanedCharges.slice(0, 5).forEach((charge, idx) => {
        console.log(`  ${idx + 1}. ${charge.chargeId}: $${(charge.amount / 100).toFixed(2)} - ${charge.reason}`);
      });
    }

    // Check if reconciliation rate meets target
    console.log('\n🎯 Target Check:');
    const meetsTarget = result.reconciliationRate >= 0.95;
    console.log(`  Target: ≥95%`);
    console.log(`  Current: ${(result.reconciliationRate * 100).toFixed(2)}%`);
    console.log(`  Status: ${meetsTarget ? '✅ PASS' : '❌ FAIL'}`);

    // Cleanup test data
    console.log('\n🧹 Cleaning up test data...');
    await Promise.all(
      testTickets.map((ticket) => prisma.posTicket.delete({ where: { id: ticket.id } }))
    );
    console.log('✅ Test data cleaned up');

    return result;
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testReconciliation()
  .then((result) => {
    console.log('\n✅ Reconciliation test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Reconciliation test failed:', error);
    process.exit(1);
  });

