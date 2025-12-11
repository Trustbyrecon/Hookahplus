import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * PATCH /api/orders/[id]
 * Update order status
 * 
 * Body: {
 *   status: "PENDING" | "IN_PROGRESS" | "READY" | "SERVED" | "CANCELLED"
 *   staffId?: string (for tracking who made the change)
 * }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, staffId } = body;

    if (!status || !['PENDING', 'IN_PROGRESS', 'READY', 'SERVED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PENDING, IN_PROGRESS, READY, SERVED, or CANCELLED' },
        { status: 400 }
      );
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: { session: true }
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(status === 'SERVED' && { servedAt: new Date() })
      }
    });

    // Create order event
    await prisma.orderEvent.create({
      data: {
        orderId: id,
        eventType: `STATUS_${status}`,
        staffId: staffId || null,
        metadata: JSON.stringify({
          previousStatus: order.status,
          newStatus: status
        })
      }
    });

    // If order is SERVED, update session status to ACTIVE and start timer
    if (status === 'SERVED' && order.session) {
      await prisma.session.update({
        where: { id: order.sessionId },
        data: {
          state: 'ACTIVE',
          startedAt: order.session.startedAt || new Date()
        }
      });
    }

    // Log audit
    await prisma.auditLog.create({
      data: {
        loungeId: order.session.loungeId,
        userId: staffId,
        action: 'ORDER_STATUS_UPDATED',
        entityType: 'Order',
        entityId: id,
        changes: JSON.stringify({
          previousStatus: order.status,
          newStatus: status
        })
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        id: updated.id,
        status: updated.status,
        servedAt: updated.servedAt?.toISOString() || null,
        updatedAt: updated.updatedAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

