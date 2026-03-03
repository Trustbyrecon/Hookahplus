/**
 * End-to-End Test: Loyalty Integration with POS Reconciliation
 * 
 * Agent: Jules + Noor
 * 
 * This script tests the complete flow:
 * 1. Create test sessions with customer info
 * 2. Create matching POS tickets and Stripe charges
 * 3. Run reconciliation job
 * 4. Verify loyalty credits are issued automatically
 * 5. Check loyalty account balances
 * 6. Generate analytics/metrics
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

interface TestScenario {
  customerId: string;
  customerPhone: string;
  sessionId: string;
  posTicketId: string;
  stripeChargeId: string;
  transactionAmountCents: number;
  expectedLoyaltyCents: number;
}

async function testEndToEndFlow() {
  console.log('🧪 [Jules + Noor] End-to-End Loyalty Integration Test\n');
  console.log('='.repeat(60));

  try {
    // Step 1: Create test sessions with customer info
    console.log('\n📋 Step 1: Creating test sessions with customer info...\n');
    
    const testScenarios: TestScenario[] = [
      {
        customerId: 'CUST-E2E-001',
        customerPhone: '+12345678901',
        sessionId: `e2e-session-${Date.now()}-1`,
        posTicketId: `E2E-POS-${Date.now()}-1`,
        stripeChargeId: `ch_e2e_${Date.now()}_1`,
        transactionAmountCents: 3500, // $35.00
        expectedLoyaltyCents: 35, // 1% = 35 cents
      },
      {
        customerId: 'CUST-E2E-002',
        customerPhone: '+12345678902',
        sessionId: `e2e-session-${Date.now()}-2`,
        posTicketId: `E2E-POS-${Date.now()}-2`,
        stripeChargeId: `ch_e2e_${Date.now()}_2`,
        transactionAmountCents: 4200, // $42.00
        expectedLoyaltyCents: 42, // 1% = 42 cents
      },
      {
        customerId: 'CUST-E2E-003',
        customerPhone: '+12345678903',
        sessionId: `e2e-session-${Date.now()}-3`,
        posTicketId: `E2E-POS-${Date.now()}-3`,
        stripeChargeId: `ch_e2e_${Date.now()}_3`,
        transactionAmountCents: 1200, // $12.00
        expectedLoyaltyCents: 12, // 1% = 12 cents (minimum 1 cent)
      },
    ];

    // Create sessions
    const sessions = await Promise.all(
      testScenarios.map((scenario) =>
        prisma.session.create({
          data: {
            id: scenario.sessionId,
            source: 'QR',
            trustSignature: 'test-trust-signature',
            tableId: `table-${scenario.sessionId}`,
            customerRef: scenario.customerId,
            customerPhone: scenario.customerPhone,
            flavor: 'Mint',
            priceCents: scenario.transactionAmountCents,
            state: 'NEW',
            paymentStatus: 'succeeded',
            paymentIntent: `pi_${scenario.sessionId}`,
          },
        })
      )
    );

    console.log(`✅ Created ${sessions.length} test sessions`);

    // Step 2: Create matching POS tickets
    console.log('\n📋 Step 2: Creating matching POS tickets...\n');

    const posTickets = await Promise.all(
      testScenarios.map((scenario) =>
        prisma.posTicket.create({
          data: {
            ticketId: scenario.posTicketId,
            sessionId: scenario.sessionId,
            amountCents: scenario.transactionAmountCents,
            status: 'paid',
            posSystem: 'square',
            items: JSON.stringify([
              { name: 'Hookah Session', price: scenario.transactionAmountCents },
            ]),
          },
        })
      )
    );

    console.log(`✅ Created ${posTickets.length} POS tickets`);

    // Step 3: Create mock Stripe charges
    console.log('\n📋 Step 3: Creating mock Stripe charges...\n');

    const now = Math.floor(Date.now() / 1000);
    const mockCharges: Stripe.Charge[] = testScenarios.map((scenario) => ({
      id: scenario.stripeChargeId,
      object: 'charge',
      amount: scenario.transactionAmountCents,
      currency: 'usd',
      created: now,
      paid: true,
      status: 'succeeded',
      metadata: {
        sessionId: scenario.sessionId,
        customerId: scenario.customerId,
        customerPhone: scenario.customerPhone,
      },
      billing_details: {
        phone: scenario.customerPhone,
      },
    })) as unknown as Stripe.Charge[];

    console.log(`✅ Created ${mockCharges.length} mock Stripe charges`);

    // Step 4: Run reconciliation job
    console.log('\n📋 Step 4: Running reconciliation job...\n');

    const reconciliationResult = await reconcilePosSettlements({
      amountTolerance: 10,
      timeWindowMinutes: 5,
      sessionIdMatch: false,
      testMode: true,
      mockStripeCharges: mockCharges,
    });

    console.log('📊 Reconciliation Results:');
    console.log(`  Total Stripe Charges: ${reconciliationResult.totalStripeCharges}`);
    console.log(`  Total POS Tickets: ${reconciliationResult.totalPosTickets}`);
    console.log(`  Matched: ${reconciliationResult.matched}`);
    console.log(`  Reconciliation Rate: ${(reconciliationResult.reconciliationRate * 100).toFixed(2)}%`);
    console.log(`  Pricing Parity: ${(reconciliationResult.pricingParity * 100).toFixed(2)}%`);

    // Step 5: Verify loyalty credits were issued
    console.log('\n📋 Step 5: Verifying loyalty credits issuance...\n');

    const loyaltyVerificationResults = await Promise.all(
      testScenarios.map(async (scenario) => {
        // Find loyalty account
        const account = await prisma.loyaltyAccount.findFirst({
          where: {
            OR: [
              { customerId: scenario.customerId },
              { customerPhone: scenario.customerPhone },
            ],
          },
          include: {
            transactions: {
              where: {
                sessionId: scenario.sessionId,
                posTicketId: scenario.posTicketId,
                stripeChargeId: scenario.stripeChargeId,
              },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
            wallet: true,
          },
        });

        return {
          scenario,
          account,
          transaction: account?.transactions[0] || null,
        };
      })
    );

    console.log('✅ Loyalty Credit Verification:');
    let successCount = 0;
    let failureCount = 0;

    loyaltyVerificationResults.forEach((result, idx) => {
      const { scenario, account, transaction } = result;

      if (account && transaction) {
        const actualLoyaltyCents = transaction.amountCents;
        const match = actualLoyaltyCents === scenario.expectedLoyaltyCents;

        if (match) {
          successCount++;
          console.log(`  ✅ Customer ${scenario.customerId}:`);
          console.log(`     Expected: ${scenario.expectedLoyaltyCents} cents`);
          console.log(`     Actual: ${actualLoyaltyCents} cents`);
          console.log(`     Account Balance: ${account.balanceCents} cents`);
          console.log(`     Transaction ID: ${transaction.id}`);
        } else {
          failureCount++;
          console.log(`  ❌ Customer ${scenario.customerId}:`);
          console.log(`     Expected: ${scenario.expectedLoyaltyCents} cents`);
          console.log(`     Actual: ${actualLoyaltyCents} cents`);
          console.log(`     ⚠️  MISMATCH!`);
        }
      } else {
        failureCount++;
        console.log(`  ❌ Customer ${scenario.customerId}:`);
        console.log(`     ⚠️  No loyalty account or transaction found!`);
      }
    });

    // Step 6: Generate analytics/metrics
    console.log('\n📋 Step 6: Generating analytics/metrics...\n');

    const allLoyaltyTransactions = await prisma.loyaltyTransaction.findMany({
      where: {
        source: 'POS',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
        },
      },
      include: {
        account: {
          select: {
            customerId: true,
            customerPhone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalIssuedCents = allLoyaltyTransactions
      .filter((t) => t.type === 'ISSUE')
      .reduce((sum, t) => sum + t.amountCents, 0);

    const totalRedeemedCents = allLoyaltyTransactions
      .filter((t) => t.type === 'REDEEM')
      .reduce((sum, t) => sum + Math.abs(t.amountCents), 0);

    const totalAccounts = await prisma.loyaltyAccount.count({
      where: { isActive: true },
    });

    const totalTransactions = await prisma.loyaltyTransaction.count({
      where: {
        source: 'POS',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    });

    console.log('📊 Loyalty Analytics (Last 24 Hours):');
    console.log(`  Total Accounts: ${totalAccounts}`);
    console.log(`  Total POS Transactions: ${totalTransactions}`);
    console.log(`  Total Credits Issued: ${totalIssuedCents} cents ($${(totalIssuedCents / 100).toFixed(2)})`);
    console.log(`  Total Credits Redeemed: ${totalRedeemedCents} cents ($${(totalRedeemedCents / 100).toFixed(2)})`);
    console.log(`  Net Credits Outstanding: ${totalIssuedCents - totalRedeemedCents} cents ($${((totalIssuedCents - totalRedeemedCents) / 100).toFixed(2)})`);

    // Step 7: Summary
    console.log('\n' + '='.repeat(60));
    console.log('📋 Test Summary:\n');
    console.log(`  ✅ Sessions Created: ${sessions.length}`);
    console.log(`  ✅ POS Tickets Created: ${posTickets.length}`);
    console.log(`  ✅ Stripe Charges Created: ${mockCharges.length}`);
    console.log(`  ✅ Reconciliation Matches: ${reconciliationResult.matched}`);
    console.log(`  ✅ Loyalty Credits Issued: ${successCount}/${testScenarios.length}`);

    if (successCount === testScenarios.length) {
      console.log('\n  🎉 All tests passed! End-to-end flow verified successfully.');
    } else {
      console.log(`\n  ⚠️  ${failureCount} test(s) failed. Check logs above for details.`);
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await Promise.all([
      ...sessions.map((s) => prisma.session.delete({ where: { id: s.id } })),
      ...posTickets.map((t) => prisma.posTicket.delete({ where: { id: t.id } })),
      ...loyaltyVerificationResults.map((r) =>
        r.account ? prisma.loyaltyAccount.delete({ where: { id: r.account.id } }) : Promise.resolve()
      ),
    ]);
    console.log('✅ Test data cleaned up');

    return {
      success: successCount === testScenarios.length,
      reconciliationRate: reconciliationResult.reconciliationRate,
      loyaltyIssued: successCount,
      totalScenarios: testScenarios.length,
      analytics: {
        totalAccounts,
        totalTransactions,
        totalIssuedCents,
        totalRedeemedCents,
      },
    };
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run test
testEndToEndFlow()
  .then((result) => {
    console.log('\n✅ End-to-end test completed!');
    console.log(JSON.stringify(result, null, 2));
    process.exit(result.success ? 0 : 1);
  })
  .catch((error) => {
    console.error('\n❌ End-to-end test failed:', error);
    process.exit(1);
  });

