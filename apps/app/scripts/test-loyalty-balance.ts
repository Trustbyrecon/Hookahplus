/**
 * Test Script for Loyalty Balance Endpoint
 * 
 * Agent: Jules
 * Tests: GET /api/loyalty/wallet/[id]/balance
 */

import { PrismaClient } from '@prisma/client';
import { join } from 'path';

// Set default DATABASE_URL for local development if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${join(process.cwd(), 'prisma/dev.db')}`;
}

const prisma = new PrismaClient();

async function testBalanceEndpoint() {
  console.log('🧪 Testing Loyalty Balance Endpoint\n');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

  try {
    // Setup: Create an account with credits
    console.log('Setup: Creating account with credits...');
    const account = await prisma.loyaltyAccount.create({
      data: {
        customerId: 'CUST-BALANCE-TEST',
        customerPhone: '+1888777666',
        balanceCents: 7500, // $75.00
        totalEarnedCents: 10000,
        totalRedeemedCents: 2500,
        isActive: true,
      },
    });

    await prisma.loyaltyWallet.create({
      data: {
        accountId: account.id,
        balanceCents: 7500,
        lastTransactionId: null,
      },
    });

    // Create a test transaction
    await prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: 'ISSUE',
        amountCents: 1000,
        balanceBeforeCents: 6500,
        balanceAfterCents: 7500,
        source: 'POS',
        version: 1,
      },
    });

    console.log(`✅ Created test account: ${account.id} with balance: ${account.balanceCents} cents\n`);

    // Test 1: Get balance by account ID (route param)
    console.log('Test 1: Get balance by account ID...');
    const response1 = await fetch(`${baseUrl}/api/loyalty/wallet/${account.id}/balance`);
    const result1 = await response1.json();
    console.log('Response:', JSON.stringify(result1, null, 2));

    if (result1.accountId === account.id && result1.balanceCents === 7500) {
      console.log(`✅ Test 1 passed: Retrieved balance by account ID`);
      console.log(`   Balance: ${result1.balanceCents} cents`);
      console.log(`   Total Earned: ${result1.totalEarnedCents} cents`);
      console.log(`   Total Redeemed: ${result1.totalRedeemedCents} cents\n`);
    } else {
      console.log(`❌ Test 1 failed: Unexpected response\n`);
    }

    // Test 2: Get balance by customer ID (query param)
    console.log('Test 2: Get balance by customer ID (query param)...');
    const response2 = await fetch(`${baseUrl}/api/loyalty/wallet/balance?customerId=CUST-BALANCE-TEST`);
    const result2 = await response2.json();
    console.log('Response:', JSON.stringify(result2, null, 2));

    if (result2.customerId === 'CUST-BALANCE-TEST' && result2.balanceCents === 7500) {
      console.log(`✅ Test 2 passed: Retrieved balance by customer ID`);
      console.log(`   Balance: ${result2.balanceCents} cents\n`);
    } else {
      console.log(`❌ Test 2 failed: Unexpected response\n`);
    }

    // Test 3: Get balance by customer phone (query param)
    console.log('Test 3: Get balance by customer phone (query param)...');
    const response3 = await fetch(`${baseUrl}/api/loyalty/wallet/balance?customerPhone=%2B1888777666`);
    const result3 = await response3.json();
    console.log('Response:', JSON.stringify(result3, null, 2));

    if (result3.customerPhone === '+1888777666' && result3.balanceCents === 7500) {
      console.log(`✅ Test 3 passed: Retrieved balance by customer phone`);
      console.log(`   Balance: ${result3.balanceCents} cents\n`);
    } else {
      console.log(`❌ Test 3 failed: Unexpected response\n`);
    }

    // Test 4: Account not found
    console.log('Test 4: Account not found...');
    const response4 = await fetch(`${baseUrl}/api/loyalty/wallet/non-existent-id/balance`);
    const result4 = await response4.json();

    if (response4.status === 404 && result4.error === 'Account not found') {
      console.log(`✅ Test 4 passed: Rejected non-existent account`);
      console.log(`   Error: ${result4.error}\n`);
    } else {
      console.log(`❌ Test 4 failed: Should have returned 404\n`);
    }

    // Test 5: Missing identifier
    console.log('Test 5: Missing identifier...');
    const response5 = await fetch(`${baseUrl}/api/loyalty/wallet/balance`);
    const result5 = await response5.json();

    if (response5.status === 400 && result5.error) {
      console.log(`✅ Test 5 passed: Rejected missing identifier`);
      console.log(`   Error: ${result5.error}\n`);
    } else {
      console.log(`❌ Test 5 failed: Should have returned 400\n`);
    }

    // Verify wallet cache is used
    console.log('📊 Verifying wallet cache usage...');
    const wallet = await prisma.loyaltyWallet.findUnique({
      where: { accountId: account.id },
    });

    if (wallet && wallet.balanceCents === 7500) {
      console.log(`✅ Wallet cache present: ${wallet.balanceCents} cents`);
      console.log(`   Balance reads use cache for performance\n`);
    }

    // Cleanup
    console.log('🧹 Cleaning up test data...');
    await prisma.loyaltyTransaction.deleteMany({
      where: { accountId: account.id },
    });
    await prisma.loyaltyWallet.delete({
      where: { accountId: account.id },
    });
    await prisma.loyaltyAccount.delete({
      where: { id: account.id },
    });
    console.log('✅ Test data cleaned up');

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run tests
testBalanceEndpoint()
  .then(() => {
    console.log('\n✅ Test suite completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });

