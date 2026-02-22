import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/sessions/[id]/upsell
 * Add premium flavor, extra base, dessert, or other upsell items
 * 
 * Body: {
 *   type: "PREMIUM_FLAVOR" | "EXTRA_BASE" | "DESSERT" | "DRINK" | "OTHER"
 *   itemId?: string (flavor ID, menu item ID, etc.)
 *   name: string
 *   priceCents: number
 *   quantity?: number (default: 1)
 *   staffId?: string
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await req.json();
    const { type, itemId, name, priceCents, quantity = 1, staffId } = body;

    if (!type || !name || priceCents === undefined) {
      return NextResponse.json(
        { error: 'type, name, and priceCents are required' },
        { status: 400 }
      );
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Create order for upsell item
    const order = await prisma.order.create({
      data: {
        sessionId,
        type: type === 'PREMIUM_FLAVOR' ? 'HOOKAH' : type === 'DRINK' ? 'DRINK' : 'ADDON',
        status: 'PENDING',
        priceSnapshot: JSON.stringify({
          totalCents: priceCents * quantity,
          upsellType: type
        }),
        specialInstructions: `Upsell: ${name}`
      }
    });

    // Create order item
    const orderItem = await prisma.orderItem.create({
      data: {
        orderId: order.id,
        itemType: type,
        itemId: itemId || null,
        name,
        quantity,
        priceCents,
        metadata: JSON.stringify({
          upsell: true,
          type
        })
      }
    });

    // Update session price
    const newPrice = (session.priceCents || 0) + (priceCents * quantity);
    await prisma.session.update({
      where: { id: sessionId },
      data: {
        priceCents: newPrice
      }
    });

    // Create order event
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        eventType: 'UPSELL_ADDED',
        staffId: staffId || null,
        metadata: JSON.stringify({
          type,
          name,
          priceCents,
          quantity
        })
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        loungeId: session.loungeId,
        userId: staffId,
        action: 'UPSELL_ADDED',
        entityType: 'Order',
        entityId: order.id,
        changes: JSON.stringify({
          type,
          name,
          priceCents,
          quantity,
          newSessionTotal: newPrice
        })
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        type: order.type,
        status: order.status
      },
      item: {
        id: orderItem.id,
        name: orderItem.name,
        quantity: orderItem.quantity,
        priceCents: orderItem.priceCents
      },
      session: {
        id: sessionId,
        newTotalCents: newPrice
      }
    });

  } catch (error) {
    console.error('Error adding upsell:', error);
    return NextResponse.json(
      {
        error: 'Failed to add upsell',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

