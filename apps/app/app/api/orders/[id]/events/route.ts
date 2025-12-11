import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/orders/[id]/events
 * Log granular order events (coal changed, flavor adjusted, etc.)
 * 
 * Body: {
 *   eventType: string (e.g., "COAL_CHANGED", "FLAVOR_ADJUSTED", "NOTE_ADDED")
 *   staffId?: string
 *   metadata?: object
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: orderId } = params;
    const body = await req.json();
    const { eventType, staffId, metadata } = body;

    if (!eventType) {
      return NextResponse.json(
        { error: 'eventType is required' },
        { status: 400 }
      );
    }

    // Verify order exists
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { session: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Create order event
    const event = await prisma.orderEvent.create({
      data: {
        orderId,
        eventType,
        staffId: staffId || null,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    return NextResponse.json({
      success: true,
      event: {
        id: event.id,
        orderId: event.orderId,
        eventType: event.eventType,
        staffId: event.staffId,
        metadata: event.metadata ? JSON.parse(event.metadata) : null,
        createdAt: event.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating order event:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

