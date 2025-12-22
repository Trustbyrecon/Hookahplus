import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { posSyncService } from '../../../../../lib/pos/sync-service';

/**
 * POST /api/webhooks/pos/square
 * Handle Square POS webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    // Verify webhook signature (in production)
    // const signature = request.headers.get('x-square-signature');
    // if (!verifySquareSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    switch (type) {
      case 'order.updated':
      case 'payment.updated':
        // Handle order/payment updates
        await handleSquareWebhook(data);
        break;
      default:
        console.log(`[Square Webhook] Unhandled event type: ${type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Square Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleSquareWebhook(data: any) {
  try {
    const orderId = data.object?.id || data.id;
    const amountCents = data.object?.net_amounts?.total_money?.amount || 0;
    const sessionId = data.object?.reference_id;

    if (!orderId) {
      console.warn('[Square Webhook] Missing order ID');
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
        posSystem: 'square',
        items: JSON.stringify(data.object?.line_items || [])
      },
      update: {
        amountCents,
        status: 'paid',
        items: JSON.stringify(data.object?.line_items || [])
      }
    });

    // Auto-reconcile if session ID exists
    if (sessionId) {
      await posSyncService.reconcileSession(sessionId, orderId, 'square');
    }

    console.log(`[Square Webhook] Processed order ${orderId}`);
  } catch (error) {
    console.error('[Square Webhook] Error processing:', error);
  }
}

