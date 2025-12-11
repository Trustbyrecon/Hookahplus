import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/sessions/[id]/deliveries
 * Record delivery and assembly at guest's table
 * 
 * Body: {
 *   orderId: string (required)
 *   deliveredBy: string (staff ID, required)
 *   notes?: string
 * }
 * 
 * Auto-updates:
 *   - order.status = 'SERVED'
 *   - session.state = 'ACTIVE'
 *   - session.startedAt = now (if not already set)
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const body = await req.json();
    const { orderId, deliveredBy, notes } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId is required' },
        { status: 400 }
      );
    }

    if (!deliveredBy) {
      return NextResponse.json(
        { error: 'deliveredBy (staff ID) is required' },
        { status: 400 }
      );
    }

    // Verify session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify order exists and belongs to this session
    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    if (order.sessionId !== sessionId) {
      return NextResponse.json(
        { error: 'Order does not belong to this session' },
        { status: 400 }
      );
    }

    // Check if delivery already exists for this order
    const existingDelivery = await prisma.delivery.findUnique({
      where: { orderId }
    });

    if (existingDelivery) {
      return NextResponse.json(
        { error: 'Delivery already recorded for this order' },
        { status: 400 }
      );
    }

    // Create delivery record
    const delivery = await prisma.delivery.create({
      data: {
        sessionId,
        orderId,
        deliveredBy,
        notes: notes || null
      }
    });

    // Update order status to SERVED
    await prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'SERVED',
        servedAt: new Date()
      }
    });

    // Create order event
    await prisma.orderEvent.create({
      data: {
        orderId,
        eventType: 'DELIVERED',
        staffId: deliveredBy,
        metadata: JSON.stringify({
          deliveryId: delivery.id,
          notes: notes || null
        })
      }
    });

    // Update session to ACTIVE and start timer if not already started
    const sessionUpdate: any = {
      state: 'ACTIVE'
    };

    if (!session.startedAt) {
      sessionUpdate.startedAt = new Date();
    }

    await prisma.session.update({
      where: { id: sessionId },
      data: sessionUpdate
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        loungeId: session.loungeId,
        userId: deliveredBy,
        action: 'DELIVERY_RECORDED',
        entityType: 'Delivery',
        entityId: delivery.id,
        changes: JSON.stringify({
          orderId,
          sessionId,
          deliveredBy
        })
      }
    });

    return NextResponse.json({
      success: true,
      delivery: {
        id: delivery.id,
        sessionId: delivery.sessionId,
        orderId: delivery.orderId,
        deliveredBy: delivery.deliveredBy,
        deliveredAt: delivery.deliveredAt.toISOString(),
        notes: delivery.notes
      },
      session: {
        id: sessionId,
        state: 'ACTIVE',
        startedAt: sessionUpdate.startedAt?.toISOString() || session.startedAt?.toISOString()
      }
    });

  } catch (error) {
    console.error('Error recording delivery:', error);
    return NextResponse.json(
      {
        error: 'Failed to record delivery',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

