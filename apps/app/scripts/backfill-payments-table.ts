#!/usr/bin/env tsx

/**
 * Migration Script: Backfill Payments Table
 * 
 * This script:
 * 1. Queries Session records with paymentIntent populated
 * 2. Creates Payment records from session payment data
 * 3. Handles edge cases (missing data, failed payments)
 * 
 * Run with: npx tsx scripts/backfill-payments-table.ts
 */

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(process.cwd(), '.env.local');
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in environment variables');
  process.exit(1);
}

const prisma = new PrismaClient();

async function backfillPaymentsTable() {
  try {
    console.log('🔄 Starting payments table backfill...\n');

    // Step 1: Find all sessions with paymentIntent
    console.log('📊 Step 1: Finding sessions with payment data...');
    const sessionsWithPayments = await prisma.session.findMany({
      where: {
        paymentIntent: { not: null },
        tenantId: { not: null }, // Only process sessions with tenant_id
      },
      select: {
        id: true,
        tenantId: true,
        paymentIntent: true,
        paymentStatus: true,
        priceCents: true,
        createdAt: true,
        updatedAt: true,
      },
      take: 10000, // Process in batches if needed
    });

    console.log(`   Found ${sessionsWithPayments.length} sessions with payment data`);

    if (sessionsWithPayments.length === 0) {
      console.log('⚠️  No sessions with payment data found. Exiting.');
      process.exit(0);
    }

    // Step 2: Create Payment records
    console.log('\n📦 Step 2: Creating Payment records...');
    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const session of sessionsWithPayments) {
      try {
        // Check if payment already exists for this session
        const existingPayment = await prisma.payment.findFirst({
          where: {
            OR: [
              { sessionId: session.id },
              { stripeChargeId: session.paymentIntent },
            ],
          },
        });

        if (existingPayment) {
          skipped++;
          continue;
        }

        // Determine payment status
        let status = 'pending';
        if (session.paymentStatus === 'succeeded') {
          status = 'succeeded';
        } else if (session.paymentStatus === 'failed' || session.paymentStatus === 'canceled') {
          status = 'failed';
        }

        // Determine paid_at timestamp
        let paidAt: Date | null = null;
        if (status === 'succeeded') {
          // Use updatedAt if paymentStatus is succeeded, otherwise use createdAt
          paidAt = session.paymentStatus === 'succeeded' ? session.updatedAt : session.createdAt;
        }

        // Create payment record
        await prisma.payment.create({
          data: {
            tenantId: session.tenantId!,
            sessionId: session.id,
            stripeChargeId: session.paymentIntent,
            amountCents: session.priceCents,
            status: status,
            paidAt: paidAt,
          },
        });

        created++;
        if (created % 100 === 0) {
          console.log(`   Processed ${created} payments...`);
        }
      } catch (error: any) {
        errors++;
        console.error(`   ❌ Error processing session ${session.id}:`, error.message);
        // Continue with next session
      }
    }

    console.log(`\n✅ Payment records created: ${created}`);
    console.log(`   Skipped (already exists): ${skipped}`);
    console.log(`   Errors: ${errors}`);

    // Step 3: Verify backfill
    console.log('\n✅ Step 3: Verifying backfill...');
    const totalPayments = await prisma.payment.count();
    const paymentsByStatus = await prisma.payment.groupBy({
      by: ['status'],
      _count: true,
    });

    console.log(`   Total payments in table: ${totalPayments}`);
    console.log('   Payments by status:');
    paymentsByStatus.forEach(({ status, _count }) => {
      console.log(`     ${status}: ${_count}`);
    });

    // Summary
    console.log('\n📊 Backfill Summary:');
    console.log(`   Sessions processed: ${sessionsWithPayments.length}`);
    console.log(`   Payments created: ${created}`);
    console.log(`   Payments skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);
    console.log(`   Total payments in table: ${totalPayments}`);

    console.log('\n✅ Backfill completed successfully!');
    process.exit(0);

  } catch (error: any) {
    console.error('❌ Backfill failed:', error);
    console.error('   Error details:', error.message);
    if (error.stack) {
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run backfill
backfillPaymentsTable();

