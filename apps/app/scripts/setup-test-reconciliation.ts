/**
 * Stripe Test Mode Reconciliation Setup Script
 * 
 * Agent: Noor
 * 
 * This script helps set up Stripe test mode for reconciliation testing
 * Creates test charges and corresponding POS tickets for realistic testing
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { join } from 'path';

// Set default DATABASE_URL for local development if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${join(process.cwd(), 'prisma/dev.db')}`;
}

const prisma = new PrismaClient();

/**
 * Check if Stripe is configured
 */
function checkStripeConfig(): Stripe | null {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  
  if (!stripeKey) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.log('\n📝 Setup Instructions:');
    console.log('1. Get your Stripe test key from: https://dashboard.stripe.com/apikeys');
    console.log('2. Make sure you\'re in "Test mode" (toggle in top right)');
    console.log('3. Copy your "Secret key" (starts with sk_test_)');
    console.log('4. Set it: export STRIPE_SECRET_KEY="sk_test_..."');
    console.log('5. Run this script again\n');
    return null;
  }

  if (!stripeKey.startsWith('sk_test_')) {
    console.warn('⚠️  Warning: Key does not start with "sk_test_"');
    console.warn('   This might be a live key. Test mode recommended for testing.\n');
  }

  try {
    const stripe = new Stripe(stripeKey, {
      apiVersion: '2025-08-27.basil' as any,
    });
    return stripe;
  } catch (error) {
    console.error('❌ Failed to initialize Stripe:', error);
    return null;
  }
}

/**
 * Create a test Stripe charge
 */
async function createTestCharge(
  stripe: Stripe,
  amountCents: number,
  sessionId: string,
  description: string
): Promise<Stripe.Charge> {
  // Create a payment intent first (required for charges)
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    description: description,
    metadata: {
      sessionId,
      testType: 'reconciliation_test',
    },
  });

  // Confirm the payment intent with a test card
  const confirmed = await stripe.paymentIntents.confirm(paymentIntent.id, {
    payment_method_data: {
      type: 'card',
      card: {
        number: '4242424242424242',
        exp_month: 12,
        exp_year: 2025,
        cvc: '123',
      },
    },
  });

  // Retrieve the charge
  const charges = await stripe.charges.list({
    payment_intent: confirmed.id,
    limit: 1,
  });

  if (charges.data.length === 0) {
    throw new Error('Failed to create charge');
  }

  return charges.data[0];
}

/**
 * Create test POS ticket
 */
async function createTestPosTicket(
  ticketId: string,
  sessionId: string,
  amountCents: number,
  posSystem: 'square' | 'toast' | 'clover',
  items: any[]
): Promise<any> {
  return await prisma.posTicket.create({
    data: {
      ticketId,
      sessionId,
      amountCents,
      status: 'paid',
      posSystem,
      items: JSON.stringify(items),
    },
  });
}

/**
 * Setup test reconciliation data
 */
async function setupTestReconciliation() {
  console.log('🔧 Setting up Stripe Test Mode Reconciliation\n');

  // Check Stripe configuration
  const stripe = checkStripeConfig();
  if (!stripe) {
    process.exit(1);
  }

  // Verify Stripe connection
  console.log('📡 Verifying Stripe connection...');
  try {
    const account = await stripe.accounts.retrieve();
    console.log(`✅ Connected to Stripe account: ${account.id}`);
    console.log(`   Mode: ${account.type === 'standard' ? 'Standard' : 'Custom'}\n`);
  } catch (error) {
    console.error('❌ Failed to connect to Stripe:', error);
    process.exit(1);
  }

  try {
    // Create test scenario 1: Perfect match
    console.log('📝 Creating test scenario 1: Perfect match...');
    const charge1 = await createTestCharge(
      stripe,
      3500, // $35.00
      'test-session-001',
      'Test Hookah Session - Match Test'
    );
    console.log(`✅ Created Stripe charge: ${charge1.id} ($${(charge1.amount / 100).toFixed(2)})`);

    const ticket1 = await createTestPosTicket(
      `TEST-POS-${Date.now()}-1`,
      'test-session-001',
      3500,
      'square',
      [
        { name: 'Hookah Session', price: 3000 },
        { name: 'Mint Flavor', price: 500 },
      ]
    );
    console.log(`✅ Created POS ticket: ${ticket1.ticketId}\n`);

    // Create test scenario 2: Another perfect match
    console.log('📝 Creating test scenario 2: Another perfect match...');
    const charge2 = await createTestCharge(
      stripe,
      4200, // $42.00
      'test-session-002',
      'Test Hookah Session - Match Test 2'
    );
    console.log(`✅ Created Stripe charge: ${charge2.id} ($${(charge2.amount / 100).toFixed(2)})`);

    const ticket2 = await createTestPosTicket(
      `TEST-POS-${Date.now()}-2`,
      'test-session-002',
      4200,
      'toast',
      [
        { name: 'Hookah Session', price: 3000 },
        { name: 'Watermelon Flavor', price: 500 },
        { name: 'Extra Coals', price: 700 },
      ]
    );
    console.log(`✅ Created POS ticket: ${ticket2.ticketId}\n`);

    // Create test scenario 3: Orphaned charge (no POS ticket)
    console.log('📝 Creating test scenario 3: Orphaned charge (no POS ticket)...');
    const charge3 = await createTestCharge(
      stripe,
      5000, // $50.00
      'test-session-003',
      'Test Hookah Session - Orphaned Test'
    );
    console.log(`✅ Created Stripe charge: ${charge3.id} ($${(charge3.amount / 100).toFixed(2)})`);
    console.log(`   (No POS ticket created - will be orphaned)\n`);

    console.log('✅ Test data setup complete!\n');
    console.log('📊 Summary:');
    console.log(`   - Stripe charges created: 3`);
    console.log(`   - POS tickets created: 2`);
    console.log(`   - Expected matches: 2`);
    console.log(`   - Expected orphaned charges: 1`);
    console.log(`   - Expected reconciliation rate: 66.67% (2/3)\n`);

    console.log('🚀 Next steps:');
    console.log('1. Run reconciliation job:');
    console.log('   npx tsx jobs/settle.ts');
    console.log('2. Or use the API endpoint:');
    console.log('   curl -X POST http://localhost:3002/api/pos/reconcile');
    console.log('3. View dashboard:');
    console.log('   http://localhost:3002/reconciliation\n');

    return {
      charges: [charge1, charge2, charge3],
      tickets: [ticket1, ticket2],
    };
  } catch (error) {
    console.error('❌ Error setting up test data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Cleanup test data
 */
async function cleanupTestData() {
  console.log('🧹 Cleaning up test reconciliation data...\n');

  try {
    // Delete test POS tickets
    const deletedTickets = await prisma.posTicket.deleteMany({
      where: {
        ticketId: {
          startsWith: 'TEST-POS-',
        },
      },
    });
    console.log(`✅ Deleted ${deletedTickets.count} test POS tickets`);

    // Delete test reconciliation records
    const deletedReconciliations = await prisma.settlementReconciliation.deleteMany({
      where: {
        sessionId: {
          startsWith: 'test-session-',
        },
      },
    });
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
  setupTestReconciliation()
    .then(() => {
      console.log('✅ Setup completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error);
      process.exit(1);
    });
}

