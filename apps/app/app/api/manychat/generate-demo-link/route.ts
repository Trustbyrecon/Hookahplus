import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { generateSlug, generateDemoLink, findOrCreateDemoTenant } from '../../../../lib/demo';

/**
 * POST /api/manychat/generate-demo-link
 * 
 * API endpoint for ManyChat to fetch demo links and Calendly URLs for qualified leads
 * 
 * Accepts:
 * - instagramUsername: Instagram username to find lead
 * - leadId: Direct lead ID (alternative to username)
 * - businessName: Optional, for demo tenant creation
 * 
 * Returns:
 * - demoLink: Generated demo URL
 * - calendlyUrl: Calendly booking URL from env
 * - leadId: Lead ID for tracking
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { instagramUsername, leadId, businessName } = body;

    if (!instagramUsername && !leadId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: instagramUsername or leadId'
      }, { status: 400 });
    }

    // Find lead by ID or Instagram username
    let lead: any = null;
    
    if (leadId) {
      // Find by lead ID
      const event = await prisma.reflexEvent.findUnique({
        where: { id: leadId }
      });
      
      if (event && event.payload) {
        try {
          const payload = JSON.parse(event.payload);
          const data = payload.behavior?.payload || payload.data || payload;
          lead = { id: event.id, ...data };
        } catch (parseError) {
          console.error('[ManyChat Demo Link] Failed to parse lead payload:', parseError);
        }
      }
    } else if (instagramUsername) {
      // Find by Instagram username (search in payload)
      const cleanUsername = instagramUsername.replace('@', '').toLowerCase();
      
      // Search for leads with this Instagram username
      const events = await prisma.reflexEvent.findMany({
        where: {
          type: 'onboarding.signup',
          ctaSource: 'instagram',
          payload: {
            contains: cleanUsername
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      });

      if (events.length > 0 && events[0].payload) {
        try {
          const payload = JSON.parse(events[0].payload);
          const data = payload.behavior?.payload || payload.data || payload;
          lead = { id: events[0].id, ...data };
        } catch (parseError) {
          console.error('[ManyChat Demo Link] Failed to parse lead payload:', parseError);
        }
      }
    }

    if (!lead) {
      return NextResponse.json({
        success: false,
        error: 'Lead not found',
        hint: instagramUsername 
          ? `No lead found for Instagram username: ${instagramUsername}`
          : `No lead found with ID: ${leadId}`
      }, { status: 404 });
    }

    // Check if demo link already exists
    let demoLink = lead.demoLink;
    let demoSlug = lead.demoSlug;
    let demoTenantId = lead.demoTenantId;

    // If no demo link exists, create one
    if (!demoLink) {
      const finalBusinessName = businessName || lead.businessName || lead.loungeName || 'Demo Lounge';
      const slug = generateSlug(finalBusinessName);
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                    req.headers.get('origin') || 
                    'http://localhost:3002';
      
      demoLink = generateDemoLink(slug, appUrl);
      demoSlug = slug;

      // Find or create tenant
      try {
        demoTenantId = await findOrCreateDemoTenant(finalBusinessName, prisma);
      } catch (tenantError) {
        console.error('[ManyChat Demo Link] Error creating tenant:', tenantError);
        // Continue without tenant ID - demo link will still work
      }

      // Update lead with demo link via operator-onboarding API
      // Add webhook API key header if configured (for production auth bypass)
      const webhookApiKey = process.env.WEBHOOK_API_KEY;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (webhookApiKey) {
        headers['x-webhook-api-key'] = webhookApiKey;
      }

      try {
        const onboardingResponse = await fetch(`${appUrl}/api/admin/operator-onboarding`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            action: 'create_demo_session',
            leadId: lead.id
          })
        });

        if (onboardingResponse.ok) {
          const result = await onboardingResponse.json();
          if (result.demoLink) {
            demoLink = result.demoLink;
            demoSlug = result.slug;
            demoTenantId = result.tenantId;
          }
        } else {
          console.warn('[ManyChat Demo Link] Failed to create demo session via API, using generated link');
        }
      } catch (apiError) {
        console.error('[ManyChat Demo Link] Error calling create_demo_session:', apiError);
        // Continue with generated link
      }
    }

    // Get Calendly URL from environment
    const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL || 
                       'https://calendly.com/clark-dwayne/new-meeting';

    console.log('[ManyChat Demo Link] Generated demo link:', {
      leadId: lead.id,
      demoLink,
      hasCalendly: !!calendlyUrl
    });

    return NextResponse.json({
      success: true,
      demoLink,
      calendlyUrl,
      leadId: lead.id,
      businessName: lead.businessName || lead.loungeName || 'Demo Lounge'
    });

  } catch (error) {
    console.error('[ManyChat Demo Link] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate demo link',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

