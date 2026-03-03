import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/preorders/[id]/lock-price
 * Lock today's price for pre-order (prevents price changes)
 * 
 * Body: { priceCents } (optional - will use current base price if not provided)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { priceCents } = body;

    const preorder = await prisma.preOrder.findUnique({
      where: { id }
    });

    if (!preorder) {
      return NextResponse.json(
        { error: 'Pre-order not found' },
        { status: 404 }
      );
    }

    if (preorder.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'Can only lock price for PENDING pre-orders' },
        { status: 400 }
      );
    }

    // Use provided price or current base price
    const lockedPrice = priceCents || preorder.basePrice;

    const updated = await prisma.preOrder.update({
      where: { id },
      data: {
        lockedPrice: lockedPrice
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        loungeId: preorder.loungeId,
        action: 'PREORDER_PRICE_LOCKED',
        entityType: 'PreOrder',
        entityId: id,
        changes: JSON.stringify({
          basePrice: preorder.basePrice,
          lockedPrice: lockedPrice
        })
      }
    });

    return NextResponse.json({
      success: true,
      preorder: {
        id: updated.id,
        basePrice: updated.basePrice,
        lockedPrice: updated.lockedPrice,
        status: updated.status
      }
    });

  } catch (error) {
    console.error('Error locking pre-order price:', error);
    return NextResponse.json(
      {
        error: 'Failed to lock pre-order price',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

