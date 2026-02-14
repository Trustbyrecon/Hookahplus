import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getCurrentTenant } from '../../../../lib/auth';

/**
 * GET /api/loyalty/account
 * Get or create loyalty account for a customer
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const customerPhone = searchParams.get('customerPhone');
    const loungeId = searchParams.get('loungeId');
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!customerId && !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing customerId or customerPhone' },
        { status: 400 }
      );
    }

    let tenantId: string | undefined;
    if (!isDevelopment || !loungeId) {
      tenantId = (await getCurrentTenant()) || undefined;
    }

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (customerPhone) where.customerPhone = customerPhone;
    if (loungeId) where.loungeId = loungeId;
    if (tenantId) where.tenantId = tenantId;

    let account = await prisma.loyaltyAccount.findFirst({
      where,
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    // If account doesn't exist, create it
    if (!account) {
      account = await prisma.loyaltyAccount.create({
        data: {
          loungeId: loungeId || null,
          tenantId: tenantId || null,
          customerId: customerId || null,
          customerPhone: customerPhone || null,
          currentTier: 'bronze'
        },
        include: {
          transactions: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    }

    // Calculate current tier based on points
    const tiers = await prisma.loyaltyTier.findMany({
      where: {
        isActive: true,
        ...(loungeId ? { loungeId } : {}),
        ...(tenantId ? { tenantId } : {})
      },
      orderBy: { minPoints: 'desc' }
    });

    let currentTier = 'bronze';
    for (const tier of tiers) {
      if (account.pointsBalance >= tier.minPoints) {
        currentTier = tier.tierName;
        break;
      }
    }

    // Update tier if it changed
    if (account.currentTier !== currentTier) {
      account = await prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { currentTier: currentTier },
        include: {
          transactions: {
            take: 10,
            orderBy: { createdAt: 'desc' }
          }
        }
      });
    }

    // Get available rewards for current tier
    const availableRewards = await prisma.loyaltyReward.findMany({
      where: {
        isActive: true,
        pointsCost: { lte: account.pointsBalance },
        OR: [
          { tierId: null },
          { tier: { tierName: currentTier } }
        ],
        ...(loungeId ? { loungeId } : {}),
        ...(tenantId ? { tenantId } : {})
      },
      include: {
        tier: true
      },
      orderBy: { pointsCost: 'asc' }
    });

    return NextResponse.json({
      success: true,
      account: {
        ...account,
        currentTier
      },
      availableRewards
    });
  } catch (error) {
    console.error('Error fetching loyalty account:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loyalty account' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/loyalty/account/earn
 * Earn points for a customer
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customerId, customerPhone, loungeId, points, sessionId, source = 'purchase' } = body;
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!customerId && !customerPhone) {
      return NextResponse.json(
        { success: false, error: 'Missing customerId or customerPhone' },
        { status: 400 }
      );
    }

    if (!points || points <= 0) {
      return NextResponse.json(
        { success: false, error: 'Points must be a positive number' },
        { status: 400 }
      );
    }

    let tenantId: string | undefined;
    if (!isDevelopment || !loungeId) {
      tenantId = (await getCurrentTenant()) || undefined;
    }

    // Find or create account
    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (customerPhone) where.customerPhone = customerPhone;
    if (loungeId) where.loungeId = loungeId;
    if (tenantId) where.tenantId = tenantId;

    let account = await prisma.loyaltyAccount.findFirst({ where });

    if (!account) {
      account = await prisma.loyaltyAccount.create({
        data: {
          loungeId: loungeId || null,
          tenantId: tenantId || null,
          customerId: customerId || null,
          customerPhone: customerPhone || null,
          currentTier: 'bronze'
        }
      });
    }

    // Update account with new points
    const updatedAccount = await prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: { increment: points },
        totalPointsEarned: { increment: points },
        visitCount: { increment: 1 },
        lastVisitAt: new Date()
      }
    });

    // Create transaction record
    await prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: 'EARN',
        amountCents: 0, // Points are separate from cents
        balanceBeforeCents: account.pointsBalance,
        balanceAfterCents: updatedAccount.pointsBalance,
        source,
        sessionId: sessionId || null
      }
    });

    // Check and update tier
    const tiers = await prisma.loyaltyTier.findMany({
      where: {
        isActive: true,
        ...(loungeId ? { loungeId } : {}),
        ...(tenantId ? { tenantId } : {})
      },
      orderBy: { minPoints: 'desc' }
    });

    let newTier = 'bronze';
    for (const tier of tiers) {
      if (updatedAccount.pointsBalance >= tier.minPoints) {
        newTier = tier.tierName;
        break;
      }
    }

    if (updatedAccount.currentTier !== newTier) {
      await prisma.loyaltyAccount.update({
        where: { id: account.id },
        data: { currentTier: newTier }
      });
    }

    return NextResponse.json({
      success: true,
      account: {
        ...updatedAccount,
        currentTier: newTier
      },
      pointsEarned: points
    });
  } catch (error) {
    console.error('Error earning points:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to earn points' },
      { status: 500 }
    );
  }
}

