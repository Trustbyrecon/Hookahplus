import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { posSyncService } from '../../../../../lib/pos/sync-service';

/**
 * POST /api/webhooks/pos/toast
 * Handle Toast POS webhooks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, payload } = body;

    // Verify webhook signature (in production)
    // const signature = request.headers.get('x-toast-signature');
    // if (!verifyToastSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    switch (eventType) {
      case 'CHECK_CLOSED':
      case 'PAYMENT_ADDED':
        await handleToastWebhook(payload);
        break;
      default:
        console.log(`[Toast Webhook] Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[Toast Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handleToastWebhook(payload: any) {
  try {
    const checkGuid = payload.checkGuid || payload.guid;
    const amountCents = Math.round((payload.amount || 0) * 100);
    const sessionId = payload.externalReferenceId;

    if (!checkGuid) {
      console.warn('[Toast Webhook] Missing check GUID');
      return;
    }

    // Create or update POS ticket
    await prisma.posTicket.upsert({
      where: { ticketId: checkGuid },
      create: {
        ticketId: checkGuid,
        sessionId: sessionId || null,
        amountCents,
        status: 'paid',
        posSystem: 'toast',
        items: JSON.stringify(payload.items || [])
      },
      update: {
        amountCents,
        status: 'paid',
        items: JSON.stringify(payload.items || [])
      }
    });

    // Auto-reconcile if session ID exists
    if (sessionId) {
      await posSyncService.reconcileSession(sessionId, checkGuid, 'toast');
    }

    console.log(`[Toast Webhook] Processed check ${checkGuid}`);
  } catch (error) {
    console.error('[Toast Webhook] Error processing:', error);
  }
}

