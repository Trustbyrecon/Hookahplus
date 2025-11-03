/**
 * Issue Loyalty Credits Endpoint
 * 
 * Agent: Jules
 * Objective: O1.2 - Issue Credits Endpoint
 * 
 * POST /api/loyalty/issue
 * 
 * Issues loyalty credits to a customer account with ACID compliance.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

interface IssueRequest {
  customerId?: string;
  customerPhone?: string;
  amountCents: number;
  source?: 'POS' | 'MANUAL' | 'REFUND' | 'ADJUSTMENT';
  sessionId?: string;
  posTicketId?: string;
  stripeChargeId?: string;
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    const body: IssueRequest = await request.json();

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

    // Default source to POS if not specified
    const source = body.source || 'POS';

    // Use Prisma transaction for ACID compliance
    const result = await prisma.$transaction(async (tx) => {
      // Find or create LoyaltyAccount
      let account = await tx.loyaltyAccount.findFirst({
        where: {
          OR: [
            body.customerId ? { customerId: body.customerId } : {},
            body.customerPhone ? { customerPhone: body.customerPhone } : {},
          ].filter(condition => Object.keys(condition).length > 0),
        },
      });

      // Create account if not found
      if (!account) {
        account = await tx.loyaltyAccount.create({
          data: {
            customerId: body.customerId || null,
            customerPhone: body.customerPhone || null,
            balanceCents: 0,
            totalEarnedCents: 0,
            totalRedeemedCents: 0,
            isActive: true,
          },
        });

        // Create wallet cache
        await tx.loyaltyWallet.create({
          data: {
            accountId: account.id,
            balanceCents: 0,
            lastTransactionId: null,
          },
        });
      }

      // Get current balance
      const balanceBeforeCents = account.balanceCents;
      const balanceAfterCents = balanceBeforeCents + body.amountCents;

      // Create transaction record
      const transaction = await tx.loyaltyTransaction.create({
        data: {
          accountId: account.id,
          type: 'ISSUE',
          amountCents: body.amountCents,
          balanceBeforeCents,
          balanceAfterCents,
          source,
          sessionId: body.sessionId || null,
          posTicketId: body.posTicketId || null,
          stripeChargeId: body.stripeChargeId || null,
          metadata: body.metadata ? JSON.stringify(body.metadata) : null,
          version: 1,
        },
      });

      // Update account balance atomically
      const updatedAccount = await tx.loyaltyAccount.update({
        where: { id: account.id },
        data: {
          balanceCents: balanceAfterCents,
          totalEarnedCents: account.totalEarnedCents + body.amountCents,
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
        totalEarnedCents: updatedAccount.totalEarnedCents,
      };
    });

    return NextResponse.json(result, { status: 200 });

  } catch (error) {
    console.error('[Loyalty Issue] Error:', error);

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

