import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    // Find session by ID or externalRef (Stripe checkout session ID)
    const session = await prisma.session.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { externalRef: sessionId },
        ],
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Parse flavorMix if it's a JSON string
    let flavorMix = session.flavorMix;
    if (flavorMix) {
      try {
        const parsed = JSON.parse(flavorMix);
        flavorMix = typeof parsed === 'string' ? parsed : parsed.join(' + ');
      } catch {
        // Keep as is if not valid JSON
      }
    }

    return NextResponse.json({
      id: session.id,
      tableId: session.tableId,
      table_id: session.tableId,
      customerName: session.customerRef,
      customer_name: session.customerRef,
      customerPhone: session.customerPhone,
      flavorMix: flavorMix,
      flavor: session.flavor,
      priceCents: session.priceCents,
      price_cents: session.priceCents,
      state: session.state,
      status: session.state,
      source: session.source,
      createdAt: session.createdAt,
      startedAt: session.startedAt,
      qrCodeUrl: session.qrCodeUrl,
      paymentStatus: session.paymentStatus,
      paymentIntent: session.paymentIntent,
    });
  } catch (error) {
    console.error('[Session API] Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

