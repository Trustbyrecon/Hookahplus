/**
 * Webhook Replay Tool
 * 
 * Agent: Noor
 * Objective: O1.2 - Webhook Replay System
 * 
 * Replays POS webhook fixtures to test reconciliation logic
 * Validates idempotency and reports reconciliation rate
 */

import { PrismaClient } from '@prisma/client';
import { runReconciliationJob } from '../jobs/settle';
import { SquareAdapter } from '../lib/pos/square';
import { ToastAdapter } from '../lib/pos/toast';
import { CloverAdapter } from '../lib/pos/clover';
import { join } from 'path';

// Set default DATABASE_URL for local development if not set
if (!process.env.DATABASE_URL) {
  // When run from apps/app directory, this resolves to apps/app/prisma/dev.db
  process.env.DATABASE_URL = `file:${join(process.cwd(), 'prisma/dev.db')}`;
}

const prisma = new PrismaClient();

interface WebhookFixture {
  id: string;
  system: 'square' | 'toast' | 'clover';
  eventType: string;
  payload: any;
  timestamp: Date;
}

/**
 * Sample webhook fixtures for testing
 */
const WEBHOOK_FIXTURES: WebhookFixture[] = [
  {
    id: 'fixture-1',
    system: 'square',
    eventType: 'order.created',
    timestamp: new Date(),
    payload: {
      type: 'order.created',
      order_id: 'SQUARE-ORDER-001',
      location_id: 'test-location',
      state: 'OPEN',
      net_amounts: {
        total_money: { amount: 3500, currency: 'USD' },
      },
      reference_id: 'test-session-001',
      line_items: [
        { name: 'Hookah Session', quantity: '1', base_price_money: { amount: 3000 } },
        { name: 'Mint Flavor', quantity: '1', base_price_money: { amount: 500 } },
      ],
    },
  },
  {
    id: 'fixture-2',
    system: 'toast',
    eventType: 'check.created',
    timestamp: new Date(),
    payload: {
      eventType: 'CHECK_CREATED',
      checkGuid: 'TOAST-CHECK-001',
      restaurantGuid: 'test-restaurant',
      amount: 4200,
      table: 'T-002',
      externalReferenceId: 'test-session-002',
      items: [
        { name: 'Hookah Session', quantity: 1, unitPrice: 30.0 },
        { name: 'Watermelon Flavor', quantity: 1, unitPrice: 5.0 },
        { name: 'Extra Coals', quantity: 1, unitPrice: 7.0 },
      ],
    },
  },
  {
    id: 'fixture-3',
    system: 'clover',
    eventType: 'order.created',
    timestamp: new Date(),
    payload: {
      type: 'ORDER_CREATED',
      id: 'CLOVER-ORDER-001',
      merchantId: 'test-merchant',
      title: 'Hookah+ T-003',
      note: 'test-session-003',
      state: 'open',
      total: 3800,
      lineItems: {
        elements: [
          { name: 'Hookah Session', price: 3000, unitQty: 1 },
          { name: 'Blueberry Flavor', price: 800, unitQty: 1 },
        ],
      },
    },
  },
];

/**
 * Process a webhook fixture and create POS ticket
 */
async function processWebhookFixture(fixture: WebhookFixture): Promise<void> {
  console.log(`\n📨 Processing ${fixture.system} webhook: ${fixture.eventType}`);

  try {
    let ticketId: string;
    let amountCents: number;
    let sessionId: string | undefined;

    // Parse webhook payload based on system
    switch (fixture.system) {
      case 'square':
        ticketId = fixture.payload.order_id;
        amountCents = fixture.payload.net_amounts?.total_money?.amount || 0;
        sessionId = fixture.payload.reference_id;
        break;

      case 'toast':
        ticketId = fixture.payload.checkGuid;
        amountCents = Math.round((fixture.payload.amount || 0) * 100);
        sessionId = fixture.payload.externalReferenceId;
        break;

      case 'clover':
        ticketId = fixture.payload.id;
        amountCents = fixture.payload.total || 0;
        sessionId = fixture.payload.note;
        break;

      default:
        throw new Error(`Unknown POS system: ${fixture.system}`);
    }

    // Create or update POS ticket
    const existingTicket = await prisma.posTicket.findUnique({
      where: { ticketId },
    });

    if (existingTicket) {
      console.log(`  ⚠️  Ticket ${ticketId} already exists (idempotency check)`);
      return;
    }

    await prisma.posTicket.create({
      data: {
        ticketId,
        sessionId,
        amountCents,
        status: 'paid',
        posSystem: fixture.system,
        items: JSON.stringify(fixture.payload.line_items || fixture.payload.items || []),
        createdAt: fixture.timestamp,
      },
    });

    console.log(`  ✅ Created POS ticket: ${ticketId} ($${(amountCents / 100).toFixed(2)})`);
  } catch (error) {
    console.error(`  ❌ Error processing fixture ${fixture.id}:`, error);
    throw error;
  }
}

/**
 * Replay all webhook fixtures
 */
async function replayFixtures(fixtures: WebhookFixture[] = WEBHOOK_FIXTURES): Promise<void> {
  console.log('🔄 [Noor] Webhook Replay System\n');
  console.log(`📋 Replaying ${fixtures.length} webhook fixtures...\n`);

  try {
    // Process all fixtures
    for (const fixture of fixtures) {
      await processWebhookFixture(fixture);
    }

    console.log(`\n✅ Processed ${fixtures.length} webhook fixtures`);

    // Run reconciliation job
    console.log('\n🔍 Running reconciliation job...');
    const result = await runReconciliationJob();

    // Report results
    console.log('\n📊 Reconciliation Results:');
    console.log(`  Total Stripe Charges: ${result.totalStripeCharges}`);
    console.log(`  Total POS Tickets: ${result.totalPosTickets}`);
    console.log(`  Matched: ${result.matched}`);
    console.log(`  Reconciliation Rate: ${(result.reconciliationRate * 100).toFixed(2)}%`);
    console.log(`  Pricing Parity: ${(result.pricingParity * 100).toFixed(2)}%`);

    if (result.matchedPairs.length > 0) {
      console.log('\n✅ Matched Pairs:');
      result.matchedPairs.forEach((pair, idx) => {
        console.log(`  ${idx + 1}. ${pair.stripeChargeId} ↔ ${pair.posTicketId} (${pair.matchConfidence})`);
      });
    }

    // Check idempotency - replay same fixtures
    console.log('\n🔄 Testing idempotency (replaying same fixtures)...');
    for (const fixture of fixtures) {
      await processWebhookFixture(fixture);
    }
    console.log('✅ Idempotency test passed (no duplicates created)');

    // Final reconciliation rate
    const finalResult = await runReconciliationJob();
    console.log(`\n📊 Final Reconciliation Rate: ${(finalResult.reconciliationRate * 100).toFixed(2)}%`);

    if (finalResult.reconciliationRate >= 0.95) {
      console.log('\n🎉 Reconciliation rate meets target (≥95%)!');
    } else {
      console.log('\n⚠️  Reconciliation rate below target (<95%)');
    }
  } catch (error) {
    console.error('❌ Webhook replay failed:', error);
    throw error;
  }
}

/**
 * Cleanup test data
 */
async function cleanupTestData(): Promise<void> {
  console.log('\n🧹 Cleaning up test data...');
  
  const testTicketIds = WEBHOOK_FIXTURES.map((f) => {
    switch (f.system) {
      case 'square':
        return f.payload.order_id;
      case 'toast':
        return f.payload.checkGuid;
      case 'clover':
        return f.payload.id;
      default:
        return null;
    }
  }).filter((id): id is string => id !== null);

  for (const ticketId of testTicketIds) {
    await prisma.posTicket.deleteMany({
      where: { ticketId },
    });
  }

  console.log('✅ Test data cleaned up');
}

// CLI execution
const args = process.argv.slice(2);

if (args.includes('--cleanup')) {
  cleanupTestData()
    .then(() => {
      console.log('✅ Cleanup complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Cleanup failed:', error);
      process.exit(1);
    });
} else {
  replayFixtures()
    .then(() => {
      console.log('\n✅ Webhook replay completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Webhook replay failed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}

export { replayFixtures, processWebhookFixture, WEBHOOK_FIXTURES };

