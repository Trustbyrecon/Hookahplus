/**
 * Get Loyalty Balance Endpoint (Query Parameters)
 * 
 * Agent: Jules
 * Objective: O1.4 - Get Balance Endpoint
 * 
 * GET /api/loyalty/wallet/balance
 * 
 * Retrieves loyalty account balance by customer ID or phone (query params).
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const customerPhone = searchParams.get('customerPhone');

    // Validate at least one identifier
    if (!customerId && !customerPhone) {
      return NextResponse.json(
        { error: 'Either customerId or customerPhone query parameter is required' },
        { status: 400 }
      );
    }

    // Find account by customer ID or phone
    const account = await prisma.loyaltyAccount.findFirst({
      where: {
        OR: [
          customerId ? { customerId } : {},
          customerPhone ? { customerPhone } : {},
        ].filter(condition => Object.keys(condition).length > 0),
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get last transaction for lastTransactionAt
        },
        wallet: true,
      },
    });

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    // Use wallet cache if available, otherwise use account balance
    const balanceCents = account.wallet?.balanceCents ?? account.balanceCents;
    
    // Get last transaction timestamp
    const lastTransactionAt = account.transactions.length > 0
      ? account.transactions[0].createdAt.toISOString()
      : account.createdAt.toISOString();

    return NextResponse.json({
      accountId: account.id,
      customerId: account.customerId,
      customerPhone: account.customerPhone,
      balanceCents,
      totalEarnedCents: account.totalEarnedCents,
      totalRedeemedCents: account.totalRedeemedCents,
      lastTransactionAt,
      isActive: account.isActive,
      createdAt: account.createdAt.toISOString(),
      updatedAt: account.updatedAt.toISOString(),
    }, { status: 200 });

  } catch (error) {
    console.error('[Loyalty Balance] Error:', error);

    return NextResponse.json(
      { error: 'Failed to fetch balance' },
      { status: 500 }
    );
  }
}

