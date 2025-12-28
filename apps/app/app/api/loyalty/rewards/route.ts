import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getCurrentTenant } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loungeId = searchParams.get('loungeId');
    const tierId = searchParams.get('tierId');
    const isDevelopment = process.env.NODE_ENV === 'development';

    let tenantId: string | undefined;
    if (!isDevelopment || !loungeId) {
      tenantId = (await getCurrentTenant()) || undefined;
    }

    const where: any = { isActive: true };
    if (loungeId) where.loungeId = loungeId;
    if (tierId) where.tierId = tierId;
    if (tenantId) where.tenantId = tenantId;

    // Check if rewards are still valid (date range)
    const now = new Date();
    where.OR = [
      { validFrom: null, validUntil: null },
      { validFrom: { lte: now }, validUntil: null },
      { validFrom: null, validUntil: { gte: now } },
      { validFrom: { lte: now }, validUntil: { gte: now } }
    ];

    const rewards = await prisma.loyaltyReward.findMany({
      where,
      include: {
        tier: true
      },
      orderBy: { displayOrder: 'asc' }
    });

    return NextResponse.json({
      success: true,
      rewards
    });
  } catch (error) {
    console.error('Error fetching loyalty rewards:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loyalty rewards' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      loungeId,
      tierId,
      name,
      description,
      pointsCost,
      discountPercent,
      discountAmountCents,
      rewardType,
      maxRedemptions,
      validFrom,
      validUntil,
      displayOrder
    } = body;
    const isDevelopment = process.env.NODE_ENV === 'development';

    let tenantId: string | undefined;
    if (!isDevelopment || !loungeId) {
      tenantId = (await getCurrentTenant()) || undefined;
    }

    if (!name || !pointsCost || !rewardType) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, pointsCost, rewardType' },
        { status: 400 }
      );
    }

    const reward = await prisma.loyaltyReward.create({
      data: {
        loungeId: loungeId || null,
        tenantId: tenantId || null,
        tierId: tierId || null,
        name,
        description: description || null,
        pointsCost: parseInt(pointsCost),
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        discountAmountCents: discountAmountCents ? parseInt(discountAmountCents) : null,
        rewardType,
        maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : null,
        validFrom: validFrom ? new Date(validFrom) : null,
        validUntil: validUntil ? new Date(validUntil) : null,
        displayOrder: parseInt(displayOrder) || 0
      },
      include: {
        tier: true
      }
    });

    return NextResponse.json({
      success: true,
      reward
    });
  } catch (error) {
    console.error('Error creating loyalty reward:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create loyalty reward' },
      { status: 500 }
    );
  }
}

