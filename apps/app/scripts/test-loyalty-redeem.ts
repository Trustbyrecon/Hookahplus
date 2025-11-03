/**
 * Test Script for Loyalty Redeem Endpoint
 * 
 * Agent: Jules
 * Tests: POST /api/loyalty/redeem
 */

import { PrismaClient } from '@prisma/client';
import { join } from 'path';

// Set default DATABASE_URL for local development if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${join(process.cwd(), 'prisma/dev.db')}`;
}

const prisma = new PrismaClient();

async function testRedeemEndpoint() {
  console.log('🧪 Testing Loyalty Redeem Endpoint\n');

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';

  try {
    // Setup: Create an account with credits first
    console.log('Setup: Creating account with credits...');
    const account = await prisma.loyaltyAccount.create({
      data: {
        customerId: 'CUST-REDEEM-TEST',
        customerPhone: '+1999888777',
        balanceCents: 5000, // $50.00
        totalEarnedCents: 5000,
        totalRedeemedCents: 0,
        isActive: true,
      },
    });

    await prisma.loyaltyWallet.create({
      data: {
        accountId: account.id,
        balanceCents: 5000,
        lastTransactionId: null,
      },
    });

    console.log(`✅ Created test account: ${account.id} with balance: ${account.balanceCents} cents\n`);

    // Test 1: Redeem credits successfully
    console.log('Test 1: Redeem credits successfully...');
    const response1 = await fetch(`${baseUrl}/api/loyalty/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-REDEEM-TEST',
        amountCents: 2000, // $20.00
        metadata: {
          discountCode: 'LOYALTY10',
          sessionId: 'session-redeem-001',
        },
      }),
    });

    const result1 = await response1.json();
    console.log('Response:', JSON.stringify(result1, null, 2));

    if (result1.success) {
      console.log(`✅ Test 1 passed: Redeemed ${result1.amountCents} cents`);
      console.log(`   Transaction ID: ${result1.transactionId}`);
      console.log(`   Balance: ${result1.balanceBeforeCents} → ${result1.balanceAfterCents}`);
      console.log(`   Total Redeemed: ${result1.totalRedeemedCents} cents\n`);
    } else {
      console.log(`❌ Test 1 failed: ${result1.error}\n`);
    }

    // Test 2: Redeem more credits
    console.log('Test 2: Redeem more credits...');
    const response2 = await fetch(`${baseUrl}/api/loyalty/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-REDEEM-TEST',
        amountCents: 1500, // $15.00
      }),
    });

    const result2 = await response2.json();
    console.log('Response:', JSON.stringify(result2, null, 2));

    if (result2.success) {
      console.log(`✅ Test 2 passed: Redeemed ${result2.amountCents} cents`);
      console.log(`   Balance: ${result2.balanceBeforeCents} → ${result2.balanceAfterCents}\n`);
    } else {
      console.log(`❌ Test 2 failed: ${result2.error}\n`);
    }

    // Test 3: Insufficient balance
    console.log('Test 3: Insufficient balance...');
    const response3 = await fetch(`${baseUrl}/api/loyalty/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-REDEEM-TEST',
        amountCents: 2000, // More than remaining balance
      }),
    });

    const result3 = await response3.json();
    if (result3.success === false && result3.error?.includes('Insufficient balance')) {
      console.log(`✅ Test 3 passed: Rejected insufficient balance`);
      console.log(`   Error: ${result3.error}\n`);
    } else {
      console.log(`❌ Test 3 failed: Should have rejected insufficient balance\n`);
    }

    // Test 4: Account not found
    console.log('Test 4: Account not found...');
    const response4 = await fetch(`${baseUrl}/api/loyalty/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-NOT-FOUND',
        amountCents: 1000,
      }),
    });

    const result4 = await response4.json();
    if (result4.success === false && result4.error === 'Account not found') {
      console.log(`✅ Test 4 passed: Rejected non-existent account`);
      console.log(`   Error: ${result4.error}\n`);
    } else {
      console.log(`❌ Test 4 failed: Should have rejected non-existent account\n`);
    }

    // Test 5: Invalid amount (negative)
    console.log('Test 5: Invalid amount (negative)...');
    const response5 = await fetch(`${baseUrl}/api/loyalty/redeem`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: 'CUST-REDEEM-TEST',
        amountCents: -100,
      }),
    });

    const result5 = await response5.json();
    if (result5.success === false && result5.error) {
      console.log(`✅ Test 5 passed: Rejected negative amount`);
      console.log(`   Error: ${result5.error}\n`);
    } else {
      console.log(`❌ Test 5 failed: Should have rejected negative amount\n`);
    }

    // Verify database state
    console.log('📊 Verifying database state...');
    const finalAccount = await prisma.loyaltyAccount.findFirst({
      where: { customerId: 'CUST-REDEEM-TEST' },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        wallet: true,
      },
    });

    if (finalAccount) {
      console.log(`✅ Account found: ${finalAccount.id}`);
      console.log(`   Balance: ${finalAccount.balanceCents} cents`);
      console.log(`   Total Earned: ${finalAccount.totalEarnedCents} cents`);
      console.log(`   Total Redeemed: ${finalAccount.totalRedeemedCents} cents`);
      console.log(`   Transactions: ${finalAccount.transactions.length}`);
      
      const redeemTransactions = finalAccount.transactions.filter(t => t.type === 'REDEEM');
      console.log(`   Redeem Transactions: ${redeemTransactions.length}`);
      
      if (finalAccount.wallet) {
        console.log(`   Wallet Balance: ${finalAccount.wallet.balanceCents} cents`);
      }
    }

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
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
testRedeemEndpoint()
  .then(() => {
    console.log('\n✅ Test suite completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Test suite failed:', error);
    process.exit(1);
  });

