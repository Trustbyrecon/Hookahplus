/**
 * Redeem Loyalty Credits Endpoint
 * 
 * Agent: Jules
 * Objective: O1.3 - Redeem Credits Endpoint
 * 
 * POST /api/loyalty/redeem
 * 
 * Redeems loyalty credits from a customer account with ACID compliance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

interface RedeemRequest {
  customerId?: string;
  customerPhone?: string;
  amountCents: number;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: RedeemRequest = await request.json();

    // Validate required fields
    if (!body.amountCents) {
      return NextResponse.json(
        { success: false, error: 'amountCents is required' },
        { status: 400 }
      );
    }

    // Validate amount is positive
    if (body.amountCents <= 0) {
      return NextResponse.json(
        { success: false, error: 'amountCents must be positive' },
        { status: 400 }
      );
    }

    // Validate at least one customer identifier
    if (!body.customerId && !body.customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Either customerId or customerPhone is required' },
        { status: 400 }
      );
    }

    // Use Prisma transaction for ACID compliance
    const result = await prisma.$transaction(async (tx) => {
      // Find LoyaltyAccount
      const account = await tx.loyaltyAccount.findFirst({
        where: {
          OR: [
            body.customerId ? { customerId: body.customerId } : {},
            body.customerPhone ? { customerPhone: body.customerPhone } : {},
          ].filter(condition => Object.keys(condition).length > 0),
        },
      });

      // Account not found
      if (!account) {
        throw new Error('Account not found');
      }

      // Check if account is active
      if (!account.isActive) {
        throw new Error('Account is not active');
      }

      // Validate sufficient balance
      if (account.balanceCents < body.amountCents) {
        throw new Error(`Insufficient balance. Available: ${account.balanceCents} cents, Requested: ${body.amountCents} cents`);
      }

      // Get current balance
      const balanceBeforeCents = account.balanceCents;
      const balanceAfterCents = balanceBeforeCents - body.amountCents;

      // Create transaction record
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: 'REDEEM',
          amountCents: -body.amountCents, // Negative for REDEEM
          balanceBeforeCents,
          balanceAfterCents,
          source: 'MANUAL', // Default to MANUAL for redemption
          sessionId: body.metadata?.sessionId || null,
          metadata: body.metadata ? JSON.stringify(body.metadata) : null,
          version: 1,
        },
      });

      // Update account balance atomically
      const updatedAccount = await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          balanceCents: balanceAfterCents,
          totalRedeemedCents: account.totalRedeemedCents + body.amountCents,
        },
      });

      // Update wallet cache
      await tx.loyaltyWallet.update({
        where: { accountId: account.id },
        data: {
          balanceCents: balanceAfterCents,
          lastTransactionId: transaction.id,
        },
      });

      return {
        success: true,
        transactionId: transaction.id,
        accountId: account.id,
        balanceBeforeCents,
        balanceAfterCents,
        amountCents: body.amountCents,
        totalRedeemedCents: updatedAccount.totalRedeemedCents,
      };
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('[Loyalty Redeem] Error:', error);

    // Handle account not found
    if (error instanceof Error && error.message === 'Account not found') {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    // Handle inactive account
    if (error instanceof Error && error.message === 'Account is not active') {
      return NextResponse.json(
        { success: false, error: 'Account is not active' },
        { status: 403 }
      );
    }

    // Handle insufficient balance
    if (error instanceof Error && error.message.includes('Insufficient balance')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    // Handle optimistic locking conflict
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { success: false, error: 'Transaction conflict. Please retry.' },
        { status: 409 }
      );
    }

    // Handle database errors
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

