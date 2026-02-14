import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { posSyncService } from '../../../../../lib/pos/sync-service';

/**
 * POST /api/webhooks/pos/clover
 * Handle Clover POS webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, object } = body;

    // Verify webhook signature (in production)
    // const signature = request.headers.get('x-clover-signature');
    // if (!verifyCloverSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    switch (type) {
      case 'ORDER_UPDATED':
      case 'PAYMENT_ADDED':
        await handleCloverWebhook(object);
        break;
      default:
        console.log(`[Clover Webhook] Unhandled event type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Clover Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleCloverWebhook(object: any) {
  try {
    const orderId = object.id;
    const amountCents = object.total || 0;
    const sessionId = object.note; // Clover uses note field for reference

    if (!orderId) {
      console.warn('[Clover Webhook] Missing order ID');
      return;
    }

    // Create or update POS ticket
    await prisma.posTicket.upsert({
      where: { ticketId: orderId },
      create: {
        ticketId: orderId,
        sessionId: sessionId || null,
        amountCents,
        status: 'paid',
        posSystem: 'clover',
        items: JSON.stringify(object.lineItems || [])
      },
      update: {
        amountCents,
        status: 'paid',
        items: JSON.stringify(object.lineItems || [])
      }
    });

    // Auto-reconcile if session ID exists
    if (sessionId) {
      await posSyncService.reconcileSession(sessionId, orderId, 'clover');
    }

    console.log(`[Clover Webhook] Processed order ${orderId}`);
  } catch (error) {
    console.error('[Clover Webhook] Error processing:', error);
  }
}

