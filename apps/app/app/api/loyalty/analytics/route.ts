/**
 * Loyalty Analytics API Endpoint
 * 
 * Agent: Jules
 * 
 * GET /api/loyalty/analytics
 * 
 * Returns loyalty system metrics and analytics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

interface AnalyticsQuery {
  startDate?: string;
  endDate?: string;
  source?: 'POS' | 'MANUAL' | 'REFUND' | 'ADJUSTMENT';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const source = searchParams.get('source') as AnalyticsQuery['source'] | null;

    // Parse dates or use defaults (last 30 days)
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Build where clause
    const where: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    if (source) {
      where.source = source;
    }

    // Get transaction statistics
    const transactions = await prisma.loyaltyTransaction.findMany({
      where,
      include: {
        account: {
          select: {
            customerId: true,
            customerPhone: true,
          },
        },
      },
    });

    // Calculate metrics
    const issueTransactions = transactions.filter((t) => t.type === 'ISSUE');
    const redeemTransactions = transactions.filter((t) => t.type === 'REDEEM');

    const totalIssuedCents = issueTransactions.reduce((sum, t) => sum + t.amountCents, 0);
    const totalRedeemedCents = redeemTransactions.reduce((sum, t) => sum + Math.abs(t.amountCents), 0);
    const totalTransactions = transactions.length;

    // Get account statistics
    const totalAccounts = await prisma.loyaltyAccount.count({
      where: { isActive: true },
    });

    const activeAccountsWithBalance = await prisma.loyaltyAccount.count({
      where: {
        isActive: true,
        balanceCents: {
          gt: 0,
        },
      },
    });

    // Get top earners (customers who earned the most)
    const topEarners = await prisma.loyaltyAccount.findMany({
      where: { isActive: true },
      orderBy: { totalEarnedCents: 'desc' },
      take: 10,
      select: {
        customerId: true,
        customerPhone: true,
        totalEarnedCents: true,
        totalRedeemedCents: true,
        balanceCents: true,
      },
    });

    // Get recent transactions (last 10)
    const recentTransactions = await prisma.loyaltyTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        amountCents: true,
        source: true,
        createdAt: true,
        account: {
          select: {
            customerId: true,
            customerPhone: true,
          },
        },
      },
    });

    // Calculate average transaction amount
    const avgIssueAmount = issueTransactions.length > 0
      ? issueTransactions.reduce((sum, t) => sum + t.amountCents, 0) / issueTransactions.length
      : 0;

    const avgRedeemAmount = redeemTransactions.length > 0
      ? redeemTransactions.reduce((sum, t) => sum + Math.abs(t.amountCents), 0) / redeemTransactions.length
      : 0;

    // Calculate redemption rate
    const redemptionRate = totalIssuedCents > 0
      ? (totalRedeemedCents / totalIssuedCents) * 100
      : 0;

    return NextResponse.json({
      success: true,
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      },
      summary: {
        totalAccounts,
        activeAccountsWithBalance,
        totalTransactions,
        totalIssuedCents,
        totalIssuedDollars: (totalIssuedCents / 100).toFixed(2),
        totalRedeemedCents,
        totalRedeemedDollars: (totalRedeemedCents / 100).toFixed(2),
        netOutstandingCents: totalIssuedCents - totalRedeemedCents,
        netOutstandingDollars: ((totalIssuedCents - totalRedeemedCents) / 100).toFixed(2),
        redemptionRate: redemptionRate.toFixed(2),
        avgIssueAmountCents: Math.round(avgIssueAmount),
        avgRedeemAmountCents: Math.round(avgRedeemAmount),
      },
      transactions: {
        issued: issueTransactions.length,
        redeemed: redeemTransactions.length,
      },
      topEarners: topEarners.map((account) => ({
        customerId: account.customerId,
        customerPhone: account.customerPhone,
        totalEarnedCents: account.totalEarnedCents,
        totalEarnedDollars: (account.totalEarnedCents / 100).toFixed(2),
        totalRedeemedCents: account.totalRedeemedCents,
        totalRedeemedDollars: (account.totalRedeemedCents / 100).toFixed(2),
        currentBalanceCents: account.balanceCents,
        currentBalanceDollars: (account.balanceCents / 100).toFixed(2),
      })),
      recentTransactions: recentTransactions.map((tx) => ({
        id: tx.id,
        type: tx.type,
        amountCents: tx.amountCents,
        amountDollars: (Math.abs(tx.amountCents) / 100).toFixed(2),
        source: tx.source,
        customerId: tx.account.customerId,
        customerPhone: tx.account.customerPhone,
        createdAt: tx.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('[Loyalty Analytics] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch loyalty analytics',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

