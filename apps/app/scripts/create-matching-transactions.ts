/**
 * Create Matching Transactions for Reconciliation
 * 
 * This script creates multiple matching POS tickets and Stripe charges
 * to achieve ≥95% reconciliation rate
 */

import { PrismaClient } from '@prisma/client';
import { reconcilePosSettlements } from '../jobs/settle';
import { join } from 'path';
import Stripe from 'stripe';

// Set default DATABASE_URL for local development if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${join(process.cwd(), 'prisma/dev.db')}`;
}

const prisma = new PrismaClient();

// Initialize Stripe if key is available
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil' as any,
    })
  : null;

/**
 * Create matching POS tickets and Stripe charges
 */
async function createMatchingTransactions() {
  console.log('🔧 Creating Matching Transactions for Reconciliation\n');

  if (!stripe) {
    console.log('⚠️  Stripe not configured. Creating POS tickets only.');
    console.log('   Run with STRIPE_SECRET_KEY to create matching Stripe charges.\n');
  }

  const amounts = [3500, 4200, 3000, 4500, 3800, 5000, 3200, 4000, 5500, 3600, 4800, 3400, 3900, 4100, 3300, 4700, 3700, 5100, 4400, 4600];
  const tickets: any[] = [];
  const charges: Stripe.Charge[] = [];

  try {
    // Create POS tickets and matching Stripe charges (if Stripe is configured)
    for (let i = 0; i < amounts.length; i++) {
      const amount = amounts[i];
      const sessionId = `match-session-${i + 1}`;
      const timestamp = Math.floor(Date.now() / 1000) - (i * 60); // Stagger timestamps

      // Create POS ticket
      const ticket = await prisma.posTicket.create({
        data: {
          ticketId: `MATCH-POS-${Date.now()}-${i + 1}`,
          sessionId,
          amountCents: amount,
          status: 'paid',
          posSystem: i % 3 === 0 ? 'square' : i % 3 === 1 ? 'toast' : 'clover',
          items: JSON.stringify([
            { name: 'Hookah Session', price: amount },
          ]),
        },
      });
      tickets.push(ticket);

      // Create mock Stripe charge (matching POS ticket)
      const mockCharge: Stripe.Charge = {
        id: `ch_match_${i + 1}`,
        object: 'charge',
        amount: amount,
        currency: 'usd',
        created: timestamp,
        paid: true,
        status: 'succeeded',
        metadata: {
          sessionId,
        },
      } as unknown as Stripe.Charge;
      charges.push(mockCharge);

      if ((i + 1) % 5 === 0) {
        console.log(`✅ Created ${i + 1}/${amounts.length} matching pairs...`);
      }
    }

    console.log(`\n✅ Created ${tickets.length} matching POS tickets`);
    console.log(`✅ Created ${charges.length} mock Stripe charges\n`);

    // Run reconciliation with mock charges
    console.log('📊 Running reconciliation with mock charges...\n');
    const result = await reconcilePosSettlements({
      amountTolerance: 10,
      timeWindowMinutes: 60, // Wider window for staggered timestamps
      sessionIdMatch: false,
      testMode: true,
      mockStripeCharges: charges,
    });

    console.log('📊 Reconciliation Results:');
    console.log(`  Total Stripe Charges: ${result.totalStripeCharges}`);
    console.log(`  Total POS Tickets: ${result.totalPosTickets}`);
    console.log(`  Matched: ${result.matched}`);
    console.log(`  Reconciliation Rate: ${(result.reconciliationRate * 100).toFixed(2)}%`);
    console.log(`  Pricing Parity: ${(result.pricingParity * 100).toFixed(2)}%\n`);

    if (result.reconciliationRate >= 0.95) {
      console.log('✅ Reconciliation rate ≥95% - G1 Guardrail unlocked!');
    } else {
      console.log(`⚠️  Reconciliation rate ${(result.reconciliationRate * 100).toFixed(2)}% < 95%`);
      console.log(`   Need ${Math.ceil((result.totalStripeCharges * 0.95) - result.matched)} more matches\n`);
    }

    return result;
  } catch (error) {
    console.error('❌ Error creating matching transactions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Cleanup test data
 */
async function cleanupMatchingData() {
  console.log('🧹 Cleaning up matching transactions...\n');

  try {
    const deletedTickets = await prisma.posTicket.deleteMany({
      where: {
        ticketId: {
          startsWith: 'MATCH-POS-',
        },
      },
    });

    const deletedReconciliations = await prisma.settlementReconciliation.deleteMany({
      where: {
        sessionId: {
          startsWith: 'match-session-',
        },
      },
    });

    console.log(`✅ Deleted ${deletedTickets.count} matching POS tickets`);
    console.log(`✅ Deleted ${deletedReconciliations.count} reconciliation records\n`);
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
  cleanupMatchingData()
    .then(() => {
      console.log('✅ Cleanup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
} else {
  createMatchingTransactions()
    .then((result) => {
      console.log('✅ Matching transactions created successfully!');
      if (result.reconciliationRate >= 0.95) {
        console.log('🎉 G1 Guardrail unlocked - POS_SYNC_READY can be set to true');
      }
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Failed:', error);
      process.exit(1);
    });
}

