import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/orders
 * Prep bar view of orders
 * 
 * Query params:
 *   - loungeId: Filter by lounge
 *   - status: Filter by status (PENDING, IN_PROGRESS, READY, SERVED, CANCELLED)
 *   - type: Filter by order type (HOOKAH, FOOD, DRINK, ADDON)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const loungeId = searchParams.get('loungeId');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: any = {};
    
    if (status) {
      where.status = status.toUpperCase();
    } else {
      // Default: show pending and in-progress orders for prep bar
      where.status = { in: ['PENDING', 'IN_PROGRESS'] };
    }

    if (type) {
      where.type = type.toUpperCase();
    }

    // If loungeId provided, filter by session's loungeId
    if (loungeId) {
      where.session = {
        loungeId
      };
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        session: {
          select: {
            id: true,
            tableId: true,
            loungeId: true,
            flavor: true
          }
        },
        items: true,
        events: {
          orderBy: { createdAt: 'desc' },
          take: 5 // Latest 5 events
        }
      },
      orderBy: { createdAt: 'asc' }, // Oldest first for prep bar
      take: 50 // Limit results
    });

    return NextResponse.json({
      success: true,
      orders: orders.map(order => ({
        id: order.id,
        sessionId: order.sessionId,
        type: order.type,
        status: order.status,
        tableId: order.session.tableId,
        loungeId: order.session.loungeId,
        items: order.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity,
          priceCents: item.priceCents
        })),
        specialInstructions: order.specialInstructions,
        priceSnapshot: order.priceSnapshot ? JSON.parse(order.priceSnapshot) : null,
        events: order.events.map(e => ({
          eventType: e.eventType,
          staffId: e.staffId,
          createdAt: e.createdAt.toISOString()
        })),
        createdAt: order.createdAt.toISOString(),
        updatedAt: order.updatedAt.toISOString()
      })),
      total: orders.length
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
