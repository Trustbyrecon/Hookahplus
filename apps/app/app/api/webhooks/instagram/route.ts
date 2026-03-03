import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import crypto from 'crypto';

/**
 * POST /api/webhooks/instagram
 * 
 * Webhook endpoint for Instagram CTA tracking
 * Receives webhook events from Instagram Business API
 * 
 * Setup Requirements:
 * - Instagram Business API access
 * - Webhook subscription in Facebook Developer Console
 * - Webhook verification token in environment variables
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (Instagram uses HMAC SHA256)
    const signature = req.headers.get('x-hub-signature-256');
    const webhookSecret = process.env.INSTAGRAM_WEBHOOK_SECRET;
    
    let payload: any;
    
    if (webhookSecret && signature) {
      const body = await req.text();
      const expectedSignature = `sha256=${crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')}`;
      
      if (signature !== expectedSignature) {
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      
      // Parse verified body
      payload = JSON.parse(body);
    } else {
      // In development, allow without signature verification
      payload = await req.json();
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || 'instagram-webhook';

    // Instagram webhook structure
    // See: https://developers.facebook.com/docs/instagram-api/webhooks
    const entries = payload.entry || [];
    
    for (const entry of entries) {
      const changes = entry.changes || [];
      
      for (const change of changes) {
        // Track CTA clicks from Instagram
        if (change.field === 'mentions' || change.field === 'story_mentions') {
          // User mentioned your account or clicked CTA in story
          const value = change.value;
          
          // Extract lead information if available
          const leadData = {
            instagramId: value?.from?.id || null,
            instagramUsername: value?.from?.username || null,
            mediaId: value?.media?.id || null,
            mediaType: value?.media?.media_type || null
          };

          // Create CTA event
          const eventPayload = {
            ctaSource: 'instagram',
            ctaType: 'social_click',
            data: leadData,
            metadata: {
              changeField: change.field,
              timestamp: value?.timestamp || new Date().toISOString(),
              webhookPayload: change
            },
            timestamp: new Date().toISOString()
          };

          const payloadStr = JSON.stringify(eventPayload);
          const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex').slice(0, 64);

          // Check for duplicates
          const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
          const duplicate = await prisma.reflexEvent.findFirst({
            where: {
              type: 'cta.social_click',
              ctaSource: 'instagram',
              payloadHash,
              createdAt: { gt: fiveMinAgo }
            }
          });

          if (!duplicate) {
            await prisma.reflexEvent.create({
              data: {
                type: 'cta.social_click',
                source: 'instagram',
                payload: payloadStr,
                payloadHash,
                ctaSource: 'instagram',
                ctaType: 'social_click',
                metadata: JSON.stringify(eventPayload.metadata),
                userAgent,
                ip
              }
            });
          }
        }
      }
    }

    // Instagram requires 200 OK response
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Instagram Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/instagram
 * 
 * Webhook verification (required by Instagram/Facebook)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.INSTAGRAM_VERIFY_TOKEN || 'hookahplus_webhook_verify';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[Instagram Webhook] Verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

