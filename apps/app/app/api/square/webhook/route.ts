import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { processWebhookWithIdempotency } from '../../../../lib/pos/webhook-framework';

/** Square Webhook Handler
 * 
 * Handles webhook events from Square Point of Sale API:
 * - Payment completed
 * - Refund processed
 * - Payment status changes
 * - Other POS events
 */
export async function POST(req: NextRequest) {
  try {
    const signature = req.headers.get('x-square-signature') || '';
    const body = await req.text();
    let event: any;

    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error('[Square Webhook] Invalid JSON payload:', error);
      return new NextResponse('Invalid JSON payload', { status: 400 });
    }

    // Verify webhook signature
    const webhookSecret = process.env.SQUARE_WEBHOOK_SECRET;
    if (webhookSecret && !verifySquareSignature(body, signature, webhookSecret)) {
      console.error('[Square Webhook] Invalid signature');
      return new NextResponse('Invalid signature', { status: 401 });
    }

    // Route webhook events with idempotency
    const eventType = event.type || event.event_type;
    const externalEventId = event.id || event.event_id || `${eventType}_${Date.now()}`;
    
    console.log(`[Square Webhook] Received event: ${eventType}`, event);

    // Process with idempotency and retry logic
    const result = await processWebhookWithIdempotency(
      {
        integrationType: 'square',
        externalEventId,
        eventType,
        payload: event,
      },
      async (webhookEvent) => {
        // Process the event
        switch (webhookEvent.eventType) {
          case 'payment.updated':
            console.log('[Square Webhook] Payment updated:', webhookEvent.payload.data);
            // TODO: Update Hookah+ session with payment status
            break;
          case 'payment.created':
            console.log('[Square Webhook] Payment created:', webhookEvent.payload.data);
            // TODO: Link payment to Hookah+ session
            break;
          case 'refund.updated':
            console.log('[Square Webhook] Refund updated:', webhookEvent.payload.data);
            // TODO: Update Hookah+ session with refund status
            break;
          default:
            console.log('[Square Webhook] Unhandled event type:', webhookEvent.eventType);
            break;
        }
      }
    );

    return NextResponse.json({ 
      received: true,
      eventId: result.id,
      status: result.status,
    });
  } catch (error) {
    console.error('[Square Webhook] Handler error:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}

/** Verify Square webhook signature */
function verifySquareSignature(payload: string, signature: string, secret: string): boolean {
  try {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const computedSignature = hmac.digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(computedSignature)
    );
  } catch (error) {
    console.error('[Square Webhook] Signature verification failed:', error);
    return false;
  }
}
