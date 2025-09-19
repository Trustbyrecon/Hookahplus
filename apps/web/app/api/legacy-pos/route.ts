import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/prisma';

// Create BOH session from legacy POS order
async function createBOHSession(orderData: any) {
  try {
    const session = await prisma.session.upsert({
      where: {
        loungeId_externalRef: {
          loungeId: orderData.loungeId || 'default',
          externalRef: orderData.externalRef
        }
      },
      update: {
        state: "PENDING",
        customerPhone: orderData.customerPhone,
        updatedAt: new Date()
      },
      create: {
        loungeId: orderData.loungeId || 'default',
        source: "LEGACY_POS" as any,
        externalRef: orderData.externalRef,
        trustSignature: orderData.externalRef, // Use externalRef as trust signature for legacy POS
        customerPhone: orderData.customerPhone,
        state: "PENDING",
        flavorMix: orderData.flavorMix,
        events: {
          create: [
            {
              type: "CREATED",
              payloadSeal: orderData.externalRef,
              data: orderData
            }
          ]
        }
      }
    });

    return session;
  } catch (error) {
    console.error('Error creating BOH session:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Extract hookah items from legacy POS order
    const hookahItems = body.items?.filter((item: any) => 
      item.category === 'hookah' || 
      item.name.toLowerCase().includes('hookah') ||
      item.tags?.includes('hookah')
    ) || [];

    if (hookahItems.length === 0) {
      return NextResponse.json({ 
        message: 'No hookah items found in order',
        processed: false 
      });
    }

    // Create BOH session for each hookah item
    const sessions = [];
    for (const item of hookahItems) {
      const sessionData = {
        loungeId: body.loungeId || 'default',
        externalRef: `${body.orderId}_${item.id}`,
        customerPhone: body.customerPhone,
        flavorMix: {
          flavor: item.name,
          addons: item.addons || 0
        }
      };

      const session = await createBOHSession(sessionData);
      sessions.push(session);
    }

    return NextResponse.json({
      message: 'Hookah orders processed successfully',
      processed: true,
      sessions: sessions.length,
      sessionIds: sessions.map(s => s.id)
    });

  } catch (error: any) {
    console.error('Legacy POS processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process legacy POS order', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      where: {
        source: 'LEGACY_POS' as any
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json({ sessions });
  } catch (error: any) {
    console.error('Error fetching legacy POS sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
