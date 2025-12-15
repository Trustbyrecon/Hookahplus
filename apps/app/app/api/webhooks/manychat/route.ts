import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import crypto from 'crypto';

/**
 * GET /api/webhooks/manychat
 * 
 * Webhook verification endpoint for ManyChat
 * ManyChat sends a GET request with verification parameters
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.MANYCHAT_VERIFY_TOKEN || 'hookahplus_manychat_verify';

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('[ManyChat Webhook] Verified');
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

/**
 * POST /api/webhooks/manychat
 * 
 * Webhook endpoint for ManyChat events
 * Receives events when users interact with Instagram (comments, DMs, story replies)
 * 
 * Setup Requirements:
 * - ManyChat account connected to Instagram
 * - Webhook URL configured in ManyChat: https://your-domain.com/api/webhooks/manychat
 * - MANYCHAT_WEBHOOK_SECRET in environment variables
 */
export async function POST(req: NextRequest) {
  try {
    // Verify webhook signature if secret is configured
    const webhookSecret = process.env.MANYCHAT_WEBHOOK_SECRET;
    const signature = req.headers.get('x-manychat-signature') || req.headers.get('signature');
    
    let payload: any;
    
    if (webhookSecret && signature) {
      const body = await req.text();
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex');
      
      // ManyChat may send signature in different formats
      const receivedSig = signature.replace('sha256=', '').trim();
      
      if (receivedSig !== expectedSignature) {
        console.error('[ManyChat Webhook] Invalid signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 401 }
        );
      }
      
      // Parse verified body
      payload = JSON.parse(body);
    } else {
      // In development, allow without signature verification
      console.warn('[ManyChat Webhook] No webhook secret configured - skipping signature verification');
      payload = await req.json();
    }

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || 'manychat-webhook';

    console.log('[ManyChat Webhook] Received event:', {
      eventType: payload.event_type || payload.type || 'unknown',
      userId: payload.user?.id || payload.subscriber_id,
      hasUser: !!payload.user
    });

    // Extract event type
    const eventType = payload.event_type || payload.type || 'unknown';
    
    // Extract user data from ManyChat payload
    const user = payload.user || payload.subscriber || {};
    const instagramUsername = user.instagram_username || user.username || user.custom_fields?.instagram_username;
    const instagramName = user.name || user.first_name || instagramUsername || 'Unknown';
    const instagramId = user.instagram_id || user.id;
    const email = user.email || user.custom_fields?.email || '';
    const phone = user.phone || user.custom_fields?.phone || '';
    
    // Extract tags from ManyChat user
    const tags = user.tags || [];
    const tagNames = tags.map((tag: any) => typeof tag === 'string' ? tag : tag.name || tag.tag).filter(Boolean);
    
    // Extract custom fields (ManyChat stores qualification answers here)
    const customFields = user.custom_fields || {};
    const orderMethod = customFields.order_method || customFields.how_do_you_take_orders || '';
    
    // Determine if this is a qualified operator lead
    const isOperatorLead = tagNames.some((tag: string) => 
      tag.toLowerCase().includes('operator') || 
      tag.toLowerCase().includes('lead: operator') ||
      tag.toLowerCase().includes('ig hot lead')
    );
    
    // Extract message/comment content if available
    const messageText = payload.message?.text || 
                       payload.comment?.text || 
                       payload.story_reply?.text || 
                       '';
    
    // Extract trigger keywords
    const triggerKeywords = ['DEMO', 'HOOKAH', 'HOOKAHPLUS', 'LOUNGE'];
    const hasTriggerKeyword = triggerKeywords.some(keyword => 
      messageText.toUpperCase().includes(keyword)
    );

    // Only create lead if:
    // 1. User has trigger keyword in message, OR
    // 2. User is tagged as operator lead, OR
    // 3. This is a flow_started event (user entered automation)
    const shouldCreateLead = hasTriggerKeyword || 
                            isOperatorLead || 
                            eventType === 'flow_started' ||
                            eventType === 'message' ||
                            eventType === 'comment' ||
                            eventType === 'story_reply';

    if (!shouldCreateLead) {
      console.log('[ManyChat Webhook] Skipping lead creation - no trigger conditions met');
      return NextResponse.json({ 
        success: true, 
        message: 'Event received but no lead creation needed' 
      });
    }

    // Check for duplicate leads (same Instagram username in last 5 minutes)
    if (instagramUsername) {
      const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
      const existingLead = await prisma.reflexEvent.findFirst({
        where: {
          type: 'onboarding.signup',
          ctaSource: 'instagram',
          createdAt: { gte: fiveMinAgo },
          payload: {
            contains: instagramUsername
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (existingLead) {
        console.log('[ManyChat Webhook] Duplicate lead detected, skipping creation');
        return NextResponse.json({ 
          success: true, 
          message: 'Lead already exists',
          leadId: existingLead.id
        });
      }
    }

    // Construct Instagram URL
    const instagramUrl = instagramUsername 
      ? `https://instagram.com/${instagramUsername.replace('@', '')}`
      : '';

    // Prepare lead data for operator-onboarding API
    const businessName = customFields.business_name || 
                        customFields.lounge_name || 
                        instagramName || 
                        instagramUsername || 
                        'Unknown Business';

    // Parse array fields (comma-separated strings from ManyChat)
    const parseArrayField = (value: string | undefined): string[] => {
      if (!value) return [];
      if (typeof value === 'string') {
        return value.split(',').map(s => s.trim()).filter(Boolean);
      }
      return Array.isArray(value) ? value : [];
    };

    const leadData = {
      businessName,
      ownerName: instagramName,
      email: email || `instagram_${instagramUsername || instagramId}@manychat.placeholder`, // Placeholder if no email
      phone: phone || '',
      location: customFields.location || '',
      // Business details
      seatingTypes: parseArrayField(customFields.seating_types),
      totalCapacity: customFields.total_capacity || '',
      numberOfTables: customFields.number_of_tables || '',
      averageSessionDuration: customFields.average_session_duration || '',
      currentPOS: customFields.current_pos || '',
      pricingModel: customFields.pricing_model || '',
      preferredFeatures: parseArrayField(customFields.preferred_features),
      // Social media links
      facebookUrl: customFields.facebook_url || '',
      websiteUrl: customFields.website_url || '',
      // Menu & pricing
      baseHookahPrice: customFields.base_hookah_price || '',
      refillPrice: customFields.refill_price || '',
      menuLink: customFields.menu_link || '',
      // Lead management
      stage: 'new-leads',
      source: 'instagram-manychat',
      createdAt: new Date().toISOString(),
      instagramUrl,
      // Store ManyChat-specific metadata for inspection and learning
      metadata: {
        manychatUserId: user.id || instagramId,
        manychatTags: tagNames,
        orderMethod,
        eventType,
        messageText,
        customFields, // Store all custom fields for complete metadata
        instagramId,
        // Engagement metadata
        engagementPlatform: 'instagram',
        engagementType: eventType, // comment, message, story_reply
        engagementTimestamp: new Date().toISOString(),
        // All raw custom fields for learning
        rawCustomFields: customFields
      }
    };

    // Create lead via operator-onboarding API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                  req.headers.get('origin') || 
                  'http://localhost:3002';

    // Add webhook API key header if configured (for production auth bypass)
    const webhookApiKey = process.env.WEBHOOK_API_KEY;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': userAgent
    };
    if (webhookApiKey) {
      headers['x-webhook-api-key'] = webhookApiKey;
    }

    try {
      const onboardingResponse = await fetch(`${appUrl}/api/admin/operator-onboarding`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'create_lead',
          leadData
        })
      });

      if (!onboardingResponse.ok) {
        const errorText = await onboardingResponse.text();
        console.error('[ManyChat Webhook] Failed to create lead:', {
          status: onboardingResponse.status,
          error: errorText
        });
        throw new Error(`Failed to create lead: ${errorText}`);
      }

      const result = await onboardingResponse.json();
      console.log('[ManyChat Webhook] Lead created successfully:', {
        leadId: result.leadId,
        businessName: leadData.businessName
      });

      return NextResponse.json({
        success: true,
        message: 'Lead created successfully',
        leadId: result.leadId,
        businessName: leadData.businessName
      });

    } catch (apiError) {
      console.error('[ManyChat Webhook] Error calling operator-onboarding API:', apiError);
      return NextResponse.json({
        success: false,
        error: 'Failed to create lead',
        details: apiError instanceof Error ? apiError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('[ManyChat Webhook] Error:', error);
    return NextResponse.json(
      { 
        error: 'Webhook processing failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

