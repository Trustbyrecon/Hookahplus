import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '../../../../lib/db';

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
    const body = await req.text();
    let event: any;

    try {
      event = JSON.parse(body);
    } catch (error) {
      console.error('[Square Webhook] Invalid JSON payload:', error);
      return new NextResponse('Invalid JSON payload', { status: 400 });
    }

    // Verify webhook signature (Square uses x-square-hmacsha256-signature).
    // Docs: https://developer.squareup.com/docs/webhooks/step3validate
    //
    // NOTE: If the public webhook URL is on the marketing domain (hookahplus.net) and is
    // proxied to this app, the computed signature MUST use the configured notification URL
    // (not necessarily the runtime host seen by this app). To avoid mismatch, set:
    // - SQUARE_WEBHOOK_NOTIFICATION_URL=https://hookahplus.net/api/webhooks/square
    // - SQUARE_WEBHOOK_SIGNATURE_KEY=<Square webhook signature key>
    const signatureHeader =
      req.headers.get('x-square-hmacsha256-signature') ||
      req.headers.get('x-square-signature') || // legacy fallback
      '';

    const signatureKey =
      process.env.SQUARE_WEBHOOK_SIGNATURE_KEY ||
      process.env.SQUARE_WEBHOOK_SECRET || // legacy name fallback
      '';

    const notificationUrl =
      process.env.SQUARE_WEBHOOK_NOTIFICATION_URL ||
      derivePublicUrl(req); // best-effort fallback

    if (signatureKey) {
      const ok = verifySquareWebhookSignature({
        signatureHeader,
        rawBody: body,
        notificationUrl,
        signatureKey,
      });
      if (!ok) {
        console.error('[Square Webhook] Invalid signature', {
          notificationUrl,
          hasSignatureHeader: Boolean(signatureHeader),
        });
        return new NextResponse('Invalid signature', { status: 401 });
      }
    } else {
      // If key is not configured, accept but warn (dev convenience; configure for production).
      console.warn('[Square Webhook] Signature key not configured; skipping verification');
    }

    // Raw ingest into square_events_raw (idempotent by event_id)
    const eventType = event.type || event.event_type || 'unknown';
    const eventId = event.id || event.event_id || `${eventType}_${Date.now()}`;
    const merchantId = event.merchant_id || event.merchantId || null;

    const payloadObj = event?.data?.object || {};
    const locationId =
      payloadObj?.location_id ||
      payloadObj?.payment?.location_id ||
      payloadObj?.order?.location_id ||
      payloadObj?.refund?.location_id ||
      null;

    try {
      await prisma.squareEventRaw.create({
        data: {
          eventId,
          eventType,
          merchantId,
          locationId,
          payload: event,
        },
      });
    } catch (error: any) {
      // Unique violation => already ingested
      const code = error?.code || error?.meta?.code;
      if (code !== 'P2002') {
        console.error('[Square Webhook] Failed to store raw event:', error);
        return new NextResponse('Failed to store event', { status: 500 });
      }
    }

    console.log(`[Square Webhook] Ingested raw event: ${eventType}`, eventId);
    return NextResponse.json({
      received: true,
      eventId,
      status: 'ingested',
    });
  } catch (error) {
    console.error('[Square Webhook] Handler error:', error);
    return new NextResponse('Server error', { status: 500 });
  }
}

function derivePublicUrl(req: NextRequest): string {
  // Best-effort to reconstruct the public URL Square called.
  // Prefer forwarded headers if present (proxy/cdn), else fall back to request URL.
  const proto = req.headers.get('x-forwarded-proto') || 'https';
  const host =
    req.headers.get('x-forwarded-host') ||
    req.headers.get('host') ||
    (() => {
      try {
        return new URL(req.url).host;
      } catch {
        return '';
      }
    })();

  // Use only pathname (no query) for signature calculation.
  let pathname = '';
  try {
    pathname = new URL(req.url).pathname;
  } catch {
    pathname = '/api/square/webhook';
  }
  return host ? `${proto}://${host}${pathname}` : pathname;
}

function base64HmacSha256(key: string, message: string) {
  return crypto.createHmac('sha256', key).update(message, 'utf8').digest('base64');
}

function timingSafeEqualStr(a: string, b: string) {
  const ab = Buffer.from(a, 'utf8');
  const bb = Buffer.from(b, 'utf8');
  if (ab.length !== bb.length) return false;
  return crypto.timingSafeEqual(ab, bb);
}

function verifySquareWebhookSignature(params: {
  signatureHeader: string;
  rawBody: string;
  notificationUrl: string;
  signatureKey: string;
}) {
  if (!params.signatureHeader) return false;
  // Square expects message = notification_url + request_body
  const message = `${params.notificationUrl}${params.rawBody}`;
  const expected = base64HmacSha256(params.signatureKey, message);
  return timingSafeEqualStr(params.signatureHeader, expected);
}
