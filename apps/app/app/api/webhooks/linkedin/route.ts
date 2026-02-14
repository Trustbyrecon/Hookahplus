import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import crypto from 'crypto';

/**
 * POST /api/webhooks/linkedin
 * 
 * Webhook endpoint for LinkedIn CTA tracking
 * Receives webhook events from LinkedIn Marketing API
 * 
 * Setup Requirements:
 * - LinkedIn Marketing API access
 * - Webhook subscription in LinkedIn Developer Portal
 * - Webhook secret in environment variables
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature (LinkedIn uses HMAC SHA256)
    const signature = req.headers.get('x-linkedin-signature');
    const webhookSecret = process.env.LINKEDIN_WEBHOOK_SECRET;
    
    let payload: any;
    
    if (webhookSecret && signature) {
      const body = await req.text();
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('base64');
      
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
    const userAgent = req.headers.get('user-agent') || 'linkedin-webhook';

    // LinkedIn webhook structure
    // See: https://docs.microsoft.com/en-us/linkedin/marketing/integrations/community-management/webhooks
    const events = payload.events || [];
    
    for (const event of events) {
      // Track CTA clicks from LinkedIn ads or posts
      if (event.eventType === 'AD_CLICK' || event.eventType === 'AD_IMPRESSION') {
        const eventData = event.data || {};
        
        // Extract lead information if available
        const leadData = {
          linkedinCampaignId: eventData.campaignId || null,
          linkedinAdId: eventData.adId || null,
          linkedinAccountId: eventData.accountId || null,
          clickUrl: eventData.clickUrl || null,
          userAgent: eventData.userAgent || null
        };

        // Create CTA event
        const eventPayload = {
          ctaSource: 'linkedin',
          ctaType: 'social_click',
          data: leadData,
          metadata: {
            eventType: event.eventType,
            timestamp: event.timestamp || new Date().toISOString(),
            webhookPayload: event
          },
          campaignId: eventData.campaignId || null,
          timestamp: new Date().toISOString()
        };

        const payloadStr = JSON.stringify(eventPayload);
        const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex').slice(0, 64);

        // Check for duplicates
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const duplicate = await prisma.reflexEvent.findFirst({
          where: {
            type: 'cta.social_click',
            ctaSource: 'linkedin',
            payloadHash,
            createdAt: { gt: fiveMinAgo }
          }
        });

        if (!duplicate) {
          await prisma.reflexEvent.create({
            data: {
              type: 'cta.social_click',
              source: 'linkedin',
              payload: payloadStr,
              payloadHash,
              ctaSource: 'linkedin',
              ctaType: 'social_click',
              campaignId: eventData.campaignId || null,
              metadata: JSON.stringify(eventPayload.metadata),
              userAgent,
              ip
            }
          });
        }
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[LinkedIn Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/linkedin
 * 
 * Webhook verification (required by LinkedIn)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challenge = searchParams.get('challenge');

  if (challenge) {
    // LinkedIn webhook verification
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

