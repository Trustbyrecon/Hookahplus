/**
 * Test Script for Loyalty Issue Endpoint
 * 
 * Agent: Jules
 * Tests: POST /api/loyalty/issue
 */

import { PrismaClient } from '@prisma/client';
import { join } from 'path';

// Set default DATABASE_URL for local development if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${join(process.cwd(), 'prisma/dev.db')}`;
}

const prisma = new PrismaClient();

async function testIssueEndpoint() {
  console.log('🧪 Testing Loyalty Issue Endpoint\n');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

  try {
    // Test 1: Issue credits to new customer
    console.log('Test 1: Issue credits to new customer...');
    const response1 = await fetch(`${baseUrl}/api/loyalty/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-TEST-001',
        customerPhone: '+1234567890',
        amountCents: 1000, // $10.00
        source: 'POS',
        sessionId: 'session-test-001',
        posTicketId: 'ticket-test-001',
        metadata: { test: true },
      }),
    });

    const result1 = await response1.json();
    console.log('Response:', JSON.stringify(result1, null, 2));

    if (result1.success) {
      console.log(`✅ Test 1 passed: Issued ${result1.amountCents} cents`);
      console.log(`   Transaction ID: ${result1.transactionId}`);
      console.log(`   Balance: ${result1.balanceBeforeCents} → ${result1.balanceAfterCents}\n`);
    } else {
      console.log(`❌ Test 1 failed: ${result1.error}\n`);
    }

    // Test 2: Issue more credits to same customer
    console.log('Test 2: Issue more credits to same customer...');
    const response2 = await fetch(`${baseUrl}/api/loyalty/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-TEST-001',
        amountCents: 500, // $5.00
        source: 'POS',
      }),
    });

    const result2 = await response2.json();
    console.log('Response:', JSON.stringify(result2, null, 2));

    if (result2.success) {
      console.log(`✅ Test 2 passed: Issued ${result2.amountCents} cents`);
      console.log(`   Balance: ${result2.balanceBeforeCents} → ${result2.balanceAfterCents}`);
      console.log(`   Total Earned: ${result2.totalEarnedCents} cents\n`);
    } else {
      console.log(`❌ Test 2 failed: ${result2.error}\n`);
    }

    // Test 3: Invalid amount (negative)
    console.log('Test 3: Invalid amount (negative)...');
    const response3 = await fetch(`${baseUrl}/api/loyalty/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-TEST-002',
        amountCents: -100,
      }),
    });

    const result3 = await response3.json();
    if (result3.success === false && result3.error) {
      console.log(`✅ Test 3 passed: Rejected negative amount`);
      console.log(`   Error: ${result3.error}\n`);
    } else {
      console.log(`❌ Test 3 failed: Should have rejected negative amount\n`);
    }

    // Test 4: Missing customer identifier
    console.log('Test 4: Missing customer identifier...');
    const response4 = await fetch(`${baseUrl}/api/loyalty/issue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountCents: 1000,
      }),
    });

    const result4 = await response4.json();
    if (result4.success === false && result4.error) {
      console.log(`✅ Test 4 passed: Rejected missing customer identifier`);
      console.log(`   Error: ${result4.error}\n`);
    } else {
      console.log(`❌ Test 4 failed: Should have rejected missing customer\n`);
    }

    // Verify database state
    console.log('📊 Verifying database state...');
    const account = await prisma.loyaltyAccount.findFirst({
      where: { customerId: 'CUST-TEST-001' },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        wallet: true,
      },
    });

    if (account) {
      console.log(`✅ Account found: ${account.id}`);
      console.log(`   Balance: ${account.balanceCents} cents`);
      console.log(`   Total Earned: ${account.totalEarnedCents} cents`);
      console.log(`   Transactions: ${account.transactions.length}`);
      console.log(`   Wallet Cache: ${account.wallet ? 'Present' : 'Missing'}`);
      if (account.wallet) {
        console.log(`   Wallet Balance: ${account.wallet.balanceCents} cents`);
      }
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testIssueEndpoint()
  .then(() => {
    console.log('\n✅ Test suite completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });

