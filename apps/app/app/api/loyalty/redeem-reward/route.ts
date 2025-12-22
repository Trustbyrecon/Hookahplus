import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getCurrentTenant } from '../../../../lib/auth';

/**
 * POST /api/loyalty/redeem-reward
 * Redeem a reward using points
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accountId, rewardId, sessionId } = body;
    const isDevelopment = process.env.NODE_ENV === 'development';

    if (!accountId || !rewardId) {
      return NextResponse.json(
        { success: false, error: 'Missing accountId or rewardId' },
        { status: 400 }
      );
    }

    // Get account and reward
    const account = await prisma.loyaltyAccount.findUnique({
      where: { id: accountId }
    });

    if (!account) {
      return NextResponse.json(
        { success: false, error: 'Account not found' },
        { status: 404 }
      );
    }

    if (!account.isActive) {
      return NextResponse.json(
        { success: false, error: 'Account is not active' },
        { status: 403 }
      );
    }

    const reward = await prisma.loyaltyReward.findUnique({
      where: { id: rewardId },
      include: { tier: true }
    });

    if (!reward) {
      return NextResponse.json(
        { success: false, error: 'Reward not found' },
        { status: 404 }
      );
    }

    if (!reward.isActive) {
      return NextResponse.json(
        { success: false, error: 'Reward is not active' },
        { status: 403 }
      );
    }

    // Check if reward is valid (date range)
    const now = new Date();
    if (reward.validFrom && reward.validFrom > now) {
      return NextResponse.json(
        { success: false, error: 'Reward is not yet valid' },
        { status: 403 }
      );
    }
    if (reward.validUntil && reward.validUntil < now) {
      return NextResponse.json(
        { success: false, error: 'Reward has expired' },
        { status: 403 }
      );
    }

    // Check if max redemptions reached
    if (reward.maxRedemptions && reward.redemptionCount >= reward.maxRedemptions) {
      return NextResponse.json(
        { success: false, error: 'Reward redemption limit reached' },
        { status: 403 }
      );
    }

    // Check if customer has enough points
    if (account.pointsBalance < reward.pointsCost) {
      return NextResponse.json(
        { success: false, error: 'Insufficient points' },
        { status: 400 }
      );
    }

    // Check tier requirement
    if (reward.tier && account.currentTier !== reward.tier.tierName) {
      return NextResponse.json(
        { success: false, error: `This reward requires ${reward.tier.tierName} tier` },
        { status: 403 }
      );
    }

    // Create redemption and update account in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update account points
      const updatedAccount = await tx.loyaltyAccount.update({
        where: { id: accountId },
        data: {
          pointsBalance: { decrement: reward.pointsCost },
          totalPointsRedeemed: { increment: reward.pointsCost }
        }
      });

      // Update reward redemption count
      await tx.loyaltyReward.update({
        where: { id: rewardId },
        data: {
          redemptionCount: { increment: 1 }
        }
      });

      // Create redemption record
      const redemption = await tx.loyaltyRedemption.create({
        data: {
          accountId,
          rewardId,
          sessionId: sessionId || null,
          pointsSpent: reward.pointsCost,
          discountCents: reward.discountAmountCents || null,
          status: 'pending',
          expiresAt: reward.validUntil || (() => {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 30); // Default 30 days expiry
            return expiry;
          })()
        },
        include: {
          reward: {
            include: { tier: true }
          }
        }
      });

      return { account: updatedAccount, redemption };
    });

    return NextResponse.json({
      success: true,
      redemption: result.redemption,
      account: result.account,
      discountCents: reward.discountAmountCents,
      discountPercent: reward.discountPercent
    });
  } catch (error) {
    console.error('Error redeeming reward:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to redeem reward' },
      { status: 500 }
    );
  }
}

