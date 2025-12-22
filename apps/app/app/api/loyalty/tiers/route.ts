import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { getCurrentTenant } from '../../../../lib/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const loungeId = searchParams.get('loungeId');
    const isDevelopment = process.env.NODE_ENV === 'development';

    let tenantId: string | undefined;
    if (!isDevelopment || !loungeId) {
      const tenant = await getCurrentTenant();
      tenantId = tenant?.id;
    }

    const where: any = { isActive: true };
    if (loungeId) where.loungeId = loungeId;
    if (tenantId) where.tenantId = tenantId;

    const tiers = await prisma.loyaltyTier.findMany({
      where,
      orderBy: { displayOrder: 'asc' },
      include: {
        rewards: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' }
        }
      }
    });

    return NextResponse.json({
      success: true,
      tiers
    });
  } catch (error) {
    console.error('Error fetching loyalty tiers:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loyalty tiers' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { loungeId, tierName, minPoints, maxPoints, discountPercent, benefits, pointsPerDollar, displayOrder } = body;
    const isDevelopment = process.env.NODE_ENV === 'development';

    let tenantId: string | undefined;
    if (!isDevelopment || !loungeId) {
      const tenant = await getCurrentTenant();
      tenantId = tenant?.id;
    }

    if (!tierName || minPoints === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: tierName, minPoints' },
        { status: 400 }
      );
    }

    const tier = await prisma.loyaltyTier.create({
      data: {
        loungeId: loungeId || null,
        tenantId: tenantId || null,
        tierName,
        minPoints: parseInt(minPoints) || 0,
        maxPoints: maxPoints ? parseInt(maxPoints) : null,
        discountPercent: parseFloat(discountPercent) || 0,
        benefits: benefits || [],
        pointsPerDollar: parseFloat(pointsPerDollar) || 1,
        displayOrder: parseInt(displayOrder) || 0
      }
    });

    return NextResponse.json({
      success: true,
      tier
    });
  } catch (error: any) {
    console.error('Error creating loyalty tier:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Tier with this name already exists for this lounge' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to create loyalty tier' },
      { status: 500 }
    );
  }
}

