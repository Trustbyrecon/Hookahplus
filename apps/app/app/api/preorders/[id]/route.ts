import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * GET /api/preorders/[id]
 * Get pre-order confirmation details
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const preorder = await prisma.preOrder.findUnique({
      where: { id }
    });

    if (!preorder) {
      return NextResponse.json(
        { error: 'Pre-order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      preorder: {
        id: preorder.id,
        loungeId: preorder.loungeId,
        guestHandle: preorder.guestHandle,
        qrCode: preorder.qrCode,
        status: preorder.status,
        scheduledTime: preorder.scheduledTime?.toISOString() || null,
        partySize: preorder.partySize,
        flavorMix: preorder.flavorMixJson ? JSON.parse(preorder.flavorMixJson) : null,
        basePrice: preorder.basePrice,
        lockedPrice: preorder.lockedPrice,
        metadata: preorder.metadata ? JSON.parse(preorder.metadata) : null,
        sessionId: preorder.sessionId,
        createdAt: preorder.createdAt.toISOString(),
        convertedAt: preorder.convertedAt?.toISOString() || null,
        expiresAt: preorder.expiresAt?.toISOString() || null
      }
    });

  } catch (error) {
    console.error('Error fetching pre-order:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch pre-order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

