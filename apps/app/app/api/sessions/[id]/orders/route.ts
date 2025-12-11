import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * POST /api/sessions/[id]/orders
 * Create hookah order ticket for prep bar
 * 
 * Body: {
 *   type: "HOOKAH" | "FOOD" | "DRINK" | "ADDON"
 *   flavorMix?: string[] (for HOOKAH type)
 *   items: Array<{ itemType, itemId?, name, quantity, priceCents, metadata? }>
 *   specialInstructions?: string
 * }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id: sessionId } = params;
    const body = await req.json();
    const { type, flavorMix, items, specialInstructions } = body;

    // Validate session exists
    const session = await prisma.session.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!type || !['HOOKAH', 'FOOD', 'DRINK', 'ADDON'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid order type. Must be HOOKAH, FOOD, DRINK, or ADDON' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Calculate total price
    const totalPrice = items.reduce((sum, item) => {
      return sum + (item.priceCents * (item.quantity || 1));
    }, 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        sessionId,
        type,
        status: 'PENDING',
        priceSnapshot: JSON.stringify({
          totalCents: totalPrice,
          items: items.map(item => ({
            name: item.name,
            quantity: item.quantity || 1,
            priceCents: item.priceCents,
            subtotal: item.priceCents * (item.quantity || 1)
          }))
        }),
        specialInstructions: specialInstructions || null
      }
    });

    // Create order items
    const orderItems = await Promise.all(
      items.map(item =>
        prisma.orderItem.create({
          data: {
            orderId: order.id,
            itemType: item.itemType || type,
            itemId: item.itemId || null,
            name: item.name,
            quantity: item.quantity || 1,
            priceCents: item.priceCents,
            metadata: item.metadata ? JSON.stringify(item.metadata) : null
          }
        })
      )
    );

    // Create initial order event
    await prisma.orderEvent.create({
      data: {
        orderId: order.id,
        eventType: 'CREATED',
        metadata: JSON.stringify({
          flavorMix: flavorMix || null,
          itemCount: items.length
        })
      }
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        loungeId: session.loungeId,
        action: 'ORDER_CREATED',
        entityType: 'Order',
        entityId: order.id,
        changes: JSON.stringify({
          sessionId,
          type,
          itemCount: items.length,
          totalCents: totalPrice
        })
      }
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        sessionId: order.sessionId,
        type: order.type,
        status: order.status,
        totalPriceCents: totalPrice,
        items: orderItems.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          priceCents: item.priceCents
        })),
        createdAt: order.createdAt.toISOString()
      }
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      {
        error: 'Failed to create order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

