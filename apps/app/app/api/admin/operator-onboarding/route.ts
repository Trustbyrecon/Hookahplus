import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { generateTrustEventId, type TrustEvent, type TrustEventType } from '../../../../lib/reflex/rem-types';
import { sendNewLeadNotification, sendTestLinkEmail } from '../../../../lib/email';
import { requireRole, getCurrentTenant } from '../../../../lib/auth';
import { generateSlug, generateDemoLink, findOrCreateDemoTenant } from '../../../../lib/demo';
import crypto from 'crypto';

/**
 * Create REM-compliant TrustEvent from onboarding payload
 */
async function createREMCompliantOnboardingEvent(
  payload: any,
  ip: string,
  userAgent?: string,
  source: string = 'manual'
): Promise<TrustEvent> {
  const sequence = Date.now() % 1000000; // Simple sequence for now
  const now = new Date();
  
  // Hash email/IP for PII minimal actor
  const emailHash = payload.email ? 
    `sha256:${crypto.createHash('sha256').update(payload.email).digest('hex')}` :
    `sha256:${crypto.createHash('sha256').update(ip).digest('hex')}`;
  
  // Hash IP for security
  const ipHash = `sha256:${crypto.createHash('sha256').update(ip).digest('hex')}`;
  
  // Create signature from payload
  const signaturePayload = JSON.stringify(payload);
  const signature = `ed25519:${crypto.createHash('sha256').update(signaturePayload).digest('hex')}`;
  
  // Map onboarding.signup to fast_checkout (new customer acquisition)
  const trustEventType: TrustEventType = 'fast_checkout';
  
  const trustEvent: TrustEvent = {
    id: generateTrustEventId(sequence),
    ts_utc: now.toISOString(),
    type: trustEventType,
    actor: {
      anon_hash: emailHash,
      device_id: userAgent || source,
    },
    context: {
      vertical: 'hookah',
      time_local: now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    },
    behavior: {
      action: 'onboarding.signup',
      payload: {
        // Include all lead data in behavior.payload for GET endpoint extraction
        businessName: payload.businessName,
        ownerName: payload.ownerName,
        email: payload.email, // Include email for lead matching
        phone: payload.phone, // Include phone
        location: payload.location,
        stage: payload.stage || 'intake',
        source: payload.source || 'website',
        // Include all other fields from original payload for complete lead data
        seatingTypes: payload.seatingTypes,
        totalCapacity: payload.totalCapacity,
        numberOfTables: payload.numberOfTables,
        averageSessionDuration: payload.averageSessionDuration,
        currentPOS: payload.currentPOS,
        pricingModel: payload.pricingModel,
        preferredFeatures: payload.preferredFeatures,
        createdAt: payload.createdAt,
        notes: payload.notes || [],
        // Menu & pricing
        menuLink: payload.menuLink,
        baseHookahPrice: payload.baseHookahPrice,
        refillPrice: payload.refillPrice,
        menuFiles: payload.menuFiles || [], // Array of uploaded file metadata
        // Social media links
        instagramUrl: payload.instagramUrl,
        facebookUrl: payload.facebookUrl,
        websiteUrl: payload.websiteUrl,
        // Instagram scraped data
        instagramScrapedData: payload.instagramScrapedData,
      },
    },
    effect: {
      loyalty_delta: 0, // No loyalty issued on signup
      credit_type: 'HPLUS_CREDIT',
    },
    security: {
      signature: signature,
      device_id: userAgent || source,
      ip_hash: ipHash,
    },
  };
  
  return trustEvent;
}

/**
 * GET /api/admin/operator-onboarding
 * 
 * Fetches all onboarding leads from ReflexEvent table
 * Only accessible to ADMIN role
 */
export async function GET(req: NextRequest) {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:102',message:'GET /api/admin/operator-onboarding entry',data:{hasDatabaseUrl:!!process.env.DATABASE_URL,dbUrlPrefix:process.env.DATABASE_URL?.substring(0,20)||'NOT_SET',nodeEnv:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    // Test database connection first
    try {
      await prisma.$connect();
      console.log('[Operator Onboarding API] Database connection successful');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:107',message:'Database connection successful',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (dbError) {
      console.error('[Operator Onboarding API] Database connection failed:', dbError);
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:110',message:'Database connection failed',data:{error:dbError instanceof Error?dbError.message:'Unknown',code:(dbError as any)?.code},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return NextResponse.json({ 
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        hint: 'Check DATABASE_URL environment variable and ensure database is running'
      }, { status: 503 });
    }

    // Auth + tenant selection
    let tenantId: string | null = null;
    if (process.env.NODE_ENV === 'production') {
      // In production: enforce owner/admin and require an active tenant
      const { user, role } = await requireRole(req, ['owner', 'admin']);
      tenantId = await getCurrentTenant(req);
      
      if (!tenantId) {
        return NextResponse.json({
          success: false,
          error: 'No active tenant. Please select a tenant or create one.',
        }, { status: 400 });
      }
    } else {
      // In development: allow access without auth/tenant, to unblock local testing
      console.log('[Operator Onboarding API] DEV mode - skipping auth and tenant checks for GET');
    }

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage');
    const source = searchParams.get('source');
    const ctaSource = searchParams.get('ctaSource'); // Filter by CTA source

    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:136',message:'Query parameters',data:{stage,source,ctaSource,nodeEnv:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Query ReflexEvent for onboarding-related events including CTAs
    // Exclude audit events (admin.operator_onboarding.update) to prevent duplicates
    const andConditions: any[] = [
      {
        OR: [
          { type: 'pos.waitlist.signup' },
          { type: 'sync.optimize.onboarding' },
          { type: 'onboarding.signup' }, // Manual leads
          { type: { contains: 'onboarding' } },
          { type: { contains: 'demo' } },
          // Include CTA events
          { type: 'cta.demo_request' },
          { type: 'cta.onboarding_signup' },
          { type: 'cta.contact_form' },
          { type: 'cta.social_click' },
          { type: 'cta.email' },
          { type: { startsWith: 'cta.' } } // Catch-all for any CTA type
        ]
      },
      {
        // Exclude audit trail events
        NOT: {
          type: 'admin.operator_onboarding.update'
        }
      }
    ];
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:166',message:'Query conditions built',data:{andConditionsCount:andConditions.length,orConditionsCount:andConditions[0]?.OR?.length||0},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
    // #endregion

    // Multi-tenant filter in production only (or when tenantId is available)
    // In dev mode, show all leads regardless of tenantId to help with debugging
    if (tenantId && process.env.NODE_ENV === 'production') {
      andConditions.push({
        tenantId: tenantId
      });
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:170',message:'Tenant filter added',data:{tenantId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    } else {
      // In dev mode, include leads with null tenantId OR any tenantId
      // This ensures we don't miss leads that were created before tenantId was set
      console.log('[Operator Onboarding API] DEV mode - showing all leads (no tenantId filter)');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:177',message:'No tenant filter (dev mode)',data:{tenantId,nodeEnv:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
      // #endregion
    }

    const whereClause: any = {
      AND: andConditions
    };

    if (source) {
      whereClause.source = source;
    }

    // Filter by CTA source if provided
    if (ctaSource) {
      whereClause.ctaSource = ctaSource;
    }

    let events;
    try {
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:194',message:'Before query execution',data:{whereClause:JSON.stringify(whereClause).substring(0,200)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      // Query events - exclude trustEventTypeV1 which may not be migrated yet
      events = await prisma.reflexEvent.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        take: 1000, // Increased limit to show more leads (was 100)
        select: {
          id: true,
          type: true,
          source: true,
          sessionId: true,
          paymentIntent: true,
          payload: true,
          payloadHash: true,
          userAgent: true,
          ip: true,
          createdAt: true,
          ctaSource: true,
          ctaType: true,
          referrer: true,
          campaignId: true,
          metadata: true,
          // trustEventTypeV1 excluded - column may not exist if migration not fully applied
        },
      });
      console.log(`[Operator Onboarding API] Found ${events.length} events`);
      // #region agent log
      const eventTypes = [...new Set(events.map(e=>e.type))];
      fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:221',message:'After query execution',data:{eventCount:events.length,eventTypes,hasPayload:events.filter(e=>e.payload).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
    } catch (queryError: any) {
      console.error('[Operator Onboarding API] Query error:', queryError);
      // Check if it's a table doesn't exist error
      const isTableMissing = queryError?.message?.includes('does not exist') || 
                            queryError?.code === '42P01' || // PostgreSQL: relation does not exist
                            queryError?.message?.includes('reflex_events') ||
                            queryError?.message?.includes('ReflexEvent');
      
      if (isTableMissing) {
        console.warn('[Operator Onboarding API] ReflexEvent table not found - returning empty list');
        // Return empty list instead of error - allows page to load
        return NextResponse.json({
          success: true,
          leads: [],
          stats: {
            total: 0,
            byStage: {
              'new-leads': 0,
              'intake': 0,
              'follow-up': 0,
              'scheduled': 0,
              'onboarding': 0,
              'complete': 0
            },
            bySource: {},
            byCtaSource: {}
          },
          message: 'ReflexEvent table not found. Run migrations to enable lead tracking.',
          hint: 'Run: npx prisma migrate deploy'
        }, { status: 200 });
      }
      throw queryError; // Re-throw other errors
    }

    // Parse and format lead data
    const leads = events.map(event => {
      const payload = event.payload ? JSON.parse(event.payload) : {};
      
      // Handle REM TrustEvent format: data is in behavior.payload
      // Also handle legacy format: data is directly in payload or payload.data
      let data: any;
      if (payload.behavior && payload.behavior.payload) {
        // REM TrustEvent format - extract from behavior.payload
        data = payload.behavior.payload;
        // Also merge top-level payload fields for backward compatibility
        data = { ...payload, ...data };
      } else {
        // Legacy format
        data = payload.data || payload;
      }

      // Extract lead information
      const lead = {
        id: event.id,
        createdAt: event.createdAt,
        source: event.source,
        type: event.type,
        
        // CTA tracking fields
        ctaSource: event.ctaSource || null,
        ctaType: event.ctaType || null,
        referrer: event.referrer || null,
        campaignId: event.campaignId || null,
        
        // Lead details from payload
        // Priority: payload.lead (CTA events) > behavior.payload (REM TrustEvent) > data (legacy)
        businessName: payload.lead?.businessName || 
                     data.businessName || 
                     data.loungeName || 
                     'Unknown',
        ownerName: payload.lead?.name || 
                   data.ownerName || 
                   data.name || 
                   'Unknown',
        email: payload.lead?.email || 
               data.email || 
               'No email',
        phone: payload.lead?.phone || 
               data.phone || 
               'No phone',
        location: payload.lead?.location || 
                  data.location || 
                  data.city || 
                  'Unknown',
        
        // Business details - check multiple locations for data
        seatingTypes: payload.lead?.seatingTypes || data.seatingTypes || [],
        totalCapacity: payload.lead?.totalCapacity || data.totalCapacity || '0',
        numberOfTables: payload.lead?.numberOfTables || data.numberOfTables || '0',
        averageSessionDuration: payload.lead?.averageSessionDuration || data.averageSessionDuration || '',
        currentPOS: payload.lead?.currentPOS || data.currentPOS || 'unknown',
        pricingModel: payload.lead?.pricingModel || data.pricingModel || 'unknown',
        preferredFeatures: payload.lead?.preferredFeatures || data.preferredFeatures || [],
        menuLink: payload.lead?.menuLink || data.menuLink || null,
        baseHookahPrice: payload.lead?.baseHookahPrice || data.baseHookahPrice || null,
        refillPrice: payload.lead?.refillPrice || data.refillPrice || null,
        // Social media links
        instagramUrl: payload.lead?.instagramUrl || data.instagramUrl || data.instagram || null,
        facebookUrl: payload.lead?.facebookUrl || data.facebookUrl || data.facebook || null,
        websiteUrl: payload.lead?.websiteUrl || data.websiteUrl || data.website || null,
        // Demo link (for leads without email - IG DM workflow)
        demoLink: payload.lead?.demoLink || data.demoLink || payload.demoLink || null,
        // Instagram scraped data (for agent review)
        instagramScrapedData: payload.lead?.instagramScrapedData || data.instagramScrapedData || null,
        // Menu files (uploaded files)
        menuFiles: payload.lead?.menuFiles || data.menuFiles || null,
        // Extracted menu data (from MenuExtractor)
        extractedMenuData: payload.lead?.extractedMenuData || data.extractedMenuData || null,
        
        // Stage tracking (stored in payload or default)
        // CTA events have stage in payload, otherwise use defaults
        stage: payload.stage || data.stage || 
          (event.type === 'pos.waitlist.signup' ? 'new-leads' : 
           event.type?.startsWith('cta.') ? 'new-leads' : 'intake'),
        
        // Management fields - check both payload locations
        notes: payload.notes || (payload.behavior?.payload?.notes) || data.notes || [],
        scheduledFollowUp: payload.scheduledFollowUp || (payload.behavior?.payload?.scheduledFollowUp) || data.scheduledFollowUp || null,
        lastContacted: payload.lastContacted || (payload.behavior?.payload?.lastContacted) || data.lastContacted || null,
        assignedTo: payload.assignedTo || (payload.behavior?.payload?.assignedTo) || data.assignedTo || null,
        
        // Metadata
        selectedTier: payload.selectedTier || data.selectedTier || null,
        conversionProbability: payload.conversionProbability || null,
        
        // Raw payload for reference
        rawPayload: payload
      };

      return lead;
    });

    // Filter by stage if provided
    let filteredLeads = leads;
    if (stage && stage !== 'all') {
      filteredLeads = leads.filter(lead => lead.stage === stage);
    }

    // Calculate statistics
    const stats = {
      total: leads.length,
      newLeads: leads.filter(l => l.stage === 'new-leads').length,
      intake: leads.filter(l => l.stage === 'intake').length,
      followUp: leads.filter(l => l.stage === 'follow-up').length,
      scheduled: leads.filter(l => l.stage === 'scheduled').length,
      onboarding: leads.filter(l => l.stage === 'onboarding').length,
      complete: leads.filter(l => l.stage === 'complete').length,
      // CTA source breakdown
      byCtaSource: {
        website: leads.filter(l => l.ctaSource === 'website').length,
        instagram: leads.filter(l => l.ctaSource === 'instagram').length,
        linkedin: leads.filter(l => l.ctaSource === 'linkedin').length,
        email: leads.filter(l => l.ctaSource === 'email').length,
        calendly: leads.filter(l => l.ctaSource === 'calendly').length
      }
    };

    return NextResponse.json({
      success: true,
      leads: filteredLeads,
      stats,
      total: filteredLeads.length
    });

  } catch (error) {
    console.error('[Operator Onboarding] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch onboarding data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * POST /api/admin/operator-onboarding
 * 
 * Updates lead stage, adds notes, schedules follow-ups
 * Only accessible to ADMIN role
 */
export async function POST(req: NextRequest) {
  try {
    // Test database connection first
    try {
      await prisma.$connect();
      console.log('[Operator Onboarding API] POST - Database connection successful');
    } catch (dbError) {
      console.error('[Operator Onboarding API] POST - Database connection failed:', dbError);
      return NextResponse.json({ 
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        hint: 'Check DATABASE_URL environment variable and ensure database is running'
      }, { status: 503 });
    }

    // Auth + tenant selection
    // Allow webhook calls with API key to bypass auth (for ManyChat, etc.)
    const webhookApiKey = req.headers.get('x-webhook-api-key');
    const validWebhookKey = process.env.WEBHOOK_API_KEY;
    const isWebhookCall = webhookApiKey && validWebhookKey && webhookApiKey === validWebhookKey;
    
    let tenantId: string | null = null;
    if (process.env.NODE_ENV === 'production' && !isWebhookCall) {
      // In production: enforce owner/admin and require an active tenant
      // Skip if this is a valid webhook call
      const { user, role } = await requireRole(req, ['owner', 'admin']);
      tenantId = await getCurrentTenant(req);
      
      if (!tenantId) {
        return NextResponse.json({
          success: false,
          error: 'No active tenant. Please select a tenant or create one.',
        }, { status: 400 });
      }
    } else {
      // In development or webhook call: allow access without auth/tenant
      if (isWebhookCall) {
        console.log('[Operator Onboarding API] Webhook call detected - skipping auth and tenant checks');
      } else {
        console.log('[Operator Onboarding API] DEV mode - skipping auth and tenant checks for POST');
      }
    }

    const body = await req.json();
    const { action, leadId, updates, leadData, testLink } = body;
    
    console.log('[Operator Onboarding API] POST request:', { action, leadId: leadId?.substring(0, 20) });

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: action'
      }, { status: 400 });
    }

    // Handle send_test_link action (email only, no payload mutation)
    // If testLink not provided, auto-generate demo session first
    if (action === 'send_test_link') {
      if (!leadId) {
        return NextResponse.json({
          success: false,
          error: 'Missing required field: leadId',
        }, { status: 400 });
      }

      // Get the lead event once (avoid duplicate lookup)
        const event = await prisma.reflexEvent.findUnique({
          where: { id: leadId }
        });

        if (!event || !event.payload) {
          return NextResponse.json({
            success: false,
            error: 'Lead not found or has no payload'
          }, { status: 404 });
        }

      // Parse payload once
        let payload: any;
        try {
          payload = JSON.parse(event.payload);
        } catch (parseError) {
        console.error('[Operator Onboarding API] Failed to parse lead payload for send_test_link:', parseError);
          return NextResponse.json({
            success: false,
          error: 'Failed to parse lead payload',
          }, { status: 500 });
        }

      // Extract lead data
        let data: any;
        if (payload.behavior && payload.behavior.payload) {
          data = { ...payload, ...payload.behavior.payload };
        } else {
          data = payload.data || payload;
        }

      // If testLink not provided, create demo session first
      let finalTestLink = testLink;
      
      // CRITICAL: Never use localhost for email links - always use production URL
      if (finalTestLink && finalTestLink.includes('localhost')) {
        console.warn('[Operator Onboarding API] Rejecting localhost testLink, will auto-generate production URL');
        finalTestLink = undefined; // Force auto-generation with production URL
      }
      
      if (!finalTestLink) {
        if (data.demoLink && !data.demoLink.includes('localhost')) {
          finalTestLink = data.demoLink;
        } else {
          // Create demo session
          const businessName = data.businessName || data.loungeName || 'Demo Lounge';
          const slug = generateSlug(businessName);
          // Always use production URL for email links - never localhost
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                        'https://app.hookahplus.net'; // Production fallback
          finalTestLink = generateDemoLink(slug, appUrl, true); // Force production URL for emails

          // Find or create tenant
          const demoTenantId = await findOrCreateDemoTenant(businessName, prisma);

          // Update lead payload with demo link
          // Store demo link in both locations for easy access
          const targetPayload = payload.behavior?.payload || payload;
          targetPayload.demoLink = finalTestLink;
          targetPayload.demoSlug = slug;
          targetPayload.demoTenantId = demoTenantId;
          targetPayload.demoCreatedAt = new Date().toISOString();
          
          // Also store in behavior.payload if it exists (for REM TrustEvent format)
          if (payload.behavior) {
            payload.behavior.payload.demoLink = finalTestLink;
            payload.behavior.payload.demoSlug = slug;
            payload.behavior.payload.demoTenantId = demoTenantId;
            payload.behavior.payload.demoCreatedAt = new Date().toISOString();
          }
          
          await prisma.reflexEvent.update({
            where: { id: leadId },
            data: {
              payload: JSON.stringify(payload),
              tenantId: demoTenantId
            }
          });

          console.log(`[Operator Onboarding API] Auto-generated demo link: ${finalTestLink}`);
        }
      }

      const email = data.email;
      const businessName = data.businessName || data.loungeName || '';
      const ownerName = data.ownerName || '';

      // If no email, just store the demo link and return success (for IG DM workflow)
      if (!email || email === 'No email') {
        return NextResponse.json({
          success: true,
          message: 'Demo link generated and stored. No email to send to.',
          demoLink: finalTestLink,
          note: 'Use this link to DM via Instagram or ManyChat'
        });
      }

      // Send email if email is available
      try {
        const result = await sendTestLinkEmail({
          email,
          businessName,
          ownerName,
          testLink: finalTestLink,
        });

        if (!result.success) {
          // Provide more helpful error message
          const errorMessage = result.error || 'Unknown error';
          const isConfigError = errorMessage.includes('not configured') || errorMessage.includes('RESEND_API_KEY');
          
          // Even if email fails, demo link is stored, so return partial success
          return NextResponse.json({
            success: true,
            warning: 'Demo link stored but email failed to send',
            demoLink: finalTestLink,
            error: isConfigError 
              ? 'Email service not configured. Please set RESEND_API_KEY environment variable.'
              : 'Failed to send test link email',
            details: errorMessage,
            hint: isConfigError 
              ? 'To enable email sending, configure RESEND_API_KEY in your environment variables. Demo link is available for manual sharing.'
              : 'Demo link is available for manual sharing via Instagram DM or ManyChat.'
          }, { status: 200 }); // Return 200 since demo link was stored
        }

        return NextResponse.json({
          success: true,
          message: 'Test link email sent successfully',
          leadId,
          demoLink: finalTestLink,
        });
      } catch (emailError: any) {
        console.error('[Operator Onboarding API] Error sending test link email:', emailError);
        return NextResponse.json({
          success: false,
          error: 'Error sending test link email',
          details: emailError instanceof Error ? emailError.message : 'Unknown error',
        }, { status: 500 });
      }
    }

    // Handle create_demo_session action
    if (action === 'create_demo_session') {
      if (!leadId) {
        return NextResponse.json({
          success: false,
          error: 'Missing required field: leadId'
        }, { status: 400 });
      }

      // Get the lead event
      const event = await prisma.reflexEvent.findUnique({
        where: { id: leadId }
      });

      if (!event || !event.payload) {
        return NextResponse.json({
          success: false,
          error: 'Lead not found or has no payload'
        }, { status: 404 });
      }

      // Parse payload to extract business details
      let payload: any;
      try {
        payload = JSON.parse(event.payload);
      } catch (parseError) {
        return NextResponse.json({
          success: false,
          error: 'Failed to parse lead payload'
        }, { status: 500 });
      }

      // Extract lead data
      let data: any;
      if (payload.behavior && payload.behavior.payload) {
        data = { ...payload, ...payload.behavior.payload };
      } else {
        data = payload.data || payload;
      }

      const businessName = data.businessName || data.loungeName || 'Demo Lounge';
      
      if (!businessName) {
        return NextResponse.json({
          success: false,
          error: 'Business name not found in lead data'
        }, { status: 400 });
      }

      try {
        // Generate slug from business name
        const slug = generateSlug(businessName);
        
        // Find or create tenant
        const demoTenantId = await findOrCreateDemoTenant(businessName, prisma);
        console.log(`[Operator Onboarding API] Demo tenant ID: ${demoTenantId} for "${businessName}"`);

        // Generate demo link - always use production URL for emails
        // Never use localhost for email links - recipients can't access localhost
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 
                      'https://app.hookahplus.net'; // Production fallback
        const demoLink = generateDemoLink(slug, appUrl, true); // Force production URL for emails

        // Update lead payload with demo link and tenant info
        const targetPayload = payload.behavior?.payload || payload;
        targetPayload.demoLink = demoLink;
        targetPayload.demoSlug = slug;
        targetPayload.demoTenantId = demoTenantId;
        targetPayload.demoCreatedAt = new Date().toISOString();

        // Update the event
        await prisma.reflexEvent.update({
          where: { id: leadId },
          data: {
            payload: JSON.stringify(payload),
            tenantId: demoTenantId // Associate lead with demo tenant
          }
        });

        console.log(`[Operator Onboarding API] Demo session created: ${demoLink}`);

        return NextResponse.json({
          success: true,
          message: 'Demo session created successfully',
          demoLink,
          slug,
          tenantId: demoTenantId
        });

      } catch (demoError: any) {
        console.error('[Operator Onboarding API] Error creating demo session:', demoError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create demo session',
          details: demoError instanceof Error ? demoError.message : 'Unknown error'
        }, { status: 500 });
      }
    }

    // Handle bulk_delete action
    if (action === 'bulk_delete') {
      const { leadIds } = body;
      
      if (!leadIds || !Array.isArray(leadIds) || leadIds.length === 0) {
        return NextResponse.json({
          success: false,
          error: 'Missing or invalid leadIds array'
        }, { status: 400 });
      }

      console.log(`[Operator Onboarding API] Bulk deleting ${leadIds.length} leads`);

      const deleteResult = await prisma.reflexEvent.deleteMany({
        where: {
          id: {
            in: leadIds
          }
        }
      });

      console.log(`[Operator Onboarding API] Deleted ${deleteResult.count} leads`);

      return NextResponse.json({
        success: true,
        message: `Successfully deleted ${deleteResult.count} lead(s)`,
        deletedCount: deleteResult.count
      });
    }

    // Handle create_lead action
    if (action === 'create_lead') {
      if (!leadData || !leadData.businessName) {
        return NextResponse.json({
          success: false,
          error: 'Missing required field: businessName'
        }, { status: 400 });
      }
      
      // Email is optional - use placeholder if not provided (for IG DM workflow)
      if (!leadData.email) {
        leadData.email = 'No email'; // Placeholder for leads without email
        console.log('[Operator Onboarding API] Creating lead without email - will use IG DM workflow');
      }

      // Process Instagram URL if provided - scrape for menu data
      let instagramMenuData: any = {};
      if (leadData.instagramUrl) {
        try {
          const { processInstagramLead } = await import('../../../../lib/instagram-scraper');
          instagramMenuData = await processInstagramLead(leadData.instagramUrl);
          console.log('[Operator Onboarding API] Instagram scraping result:', {
            hasMenuData: !!instagramMenuData.menuItems,
            hasFlavors: !!instagramMenuData.flavors,
            hasPrices: !!(instagramMenuData.basePrice || instagramMenuData.refillPrice)
          });
        } catch (scrapeError) {
          console.error('[Operator Onboarding API] Instagram scraping error:', scrapeError);
          // Continue without scraping data - don't fail the lead creation
        }
      }

      // Create a new ReflexEvent for the manual lead
      // Include ALL fields from leadData to preserve business details
      // Merge Instagram scraped data with form data (form data takes precedence)
      const payload = {
        businessName: leadData.businessName,
        ownerName: leadData.ownerName || '',
        email: leadData.email,
        phone: leadData.phone || '',
        location: leadData.location || '',
        stage: leadData.stage || 'new-leads',
        source: leadData.source || 'manual', // Allow source to be passed (e.g., 'website')
        createdAt: leadData.createdAt || new Date().toISOString(),
        notes: [],
        scheduledFollowUp: null,
        lastContacted: null,
        assignedTo: null,
        // Business details from form
        seatingTypes: leadData.seatingTypes || [],
        totalCapacity: leadData.totalCapacity || '',
        numberOfTables: leadData.numberOfTables || '',
        averageSessionDuration: leadData.averageSessionDuration || '',
        currentPOS: leadData.currentPOS || '',
        pricingModel: leadData.pricingModel || 'time-based',
        preferredFeatures: leadData.preferredFeatures || [],
        integrationNeeds: leadData.integrationNeeds || '',
        // Menu & pricing - merge Instagram data with form data (form data takes precedence)
        menuLink: leadData.menuLink || instagramMenuData.menuLink || '',
        baseHookahPrice: leadData.baseHookahPrice || instagramMenuData.basePrice?.toString() || '',
        refillPrice: leadData.refillPrice || instagramMenuData.refillPrice?.toString() || '',
        menuFiles: leadData.menuFiles || [], // Array of uploaded file metadata
        // Social media links
        instagramUrl: leadData.instagramUrl || '',
        facebookUrl: leadData.facebookUrl || '',
        websiteUrl: leadData.websiteUrl || '',
        // Instagram scraped data (for agent review)
        instagramScrapedData: instagramMenuData.menuItems ? {
          menuItems: instagramMenuData.menuItems,
          flavors: instagramMenuData.flavors || [],
          extractedAt: instagramMenuData.extractedAt,
          source: instagramMenuData.source
        } : null
      };

      console.log('[Operator Onboarding API] Creating lead with data:', {
        businessName: leadData.businessName,
        email: leadData.email,
        stage: leadData.stage,
        source: leadData.source || 'manual'
      });

      // Determine CTA source from leadData.source
      const ctaSource = leadData.source === 'website' ? 'website' : 
                        leadData.source?.includes('instagram') ? 'instagram' :
                        leadData.source?.includes('linkedin') ? 'linkedin' :
                        leadData.source?.includes('email') ? 'email' :
                        leadData.source?.includes('calendly') ? 'calendly' : 'manual';

      try {
        let newEvent: any;
        
        // Get IP and user agent first (needed for both REM payload and database insert)
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
        const userAgent = req.headers.get('user-agent') || undefined;
        
        // Create REM-compliant TrustEvent payload
        let remPayload: TrustEvent;
        try {
          console.log('[Operator Onboarding API] Creating REM payload with:', {
            email: payload.email,
            businessName: payload.businessName,
            ip,
            hasUserAgent: !!userAgent
          });
          remPayload = await createREMCompliantOnboardingEvent(payload, ip, userAgent, leadData.source || 'manual');
          console.log('[Operator Onboarding API] REM payload created successfully');
        } catch (remError) {
          console.error('[Operator Onboarding API] Failed to create REM payload:', remError);
          throw new Error(`Failed to create REM-compliant payload: ${remError instanceof Error ? remError.message : 'Unknown error'}`);
        }
        
        // Create MenuFile records for uploaded files
        let createdEventId: string | null = null;
        
        // Map source to valid enum value (ui | server | cron | webhook | backend | agent)
        // Database CHECK constraint only allows these values
        // Define outside try-catch so it's accessible in both Prisma create and raw SQL fallback
        const sourceMapping: Record<string, string> = {
          'website': 'ui',
          'manual': 'ui',      // Manual entry is UI action
          'admin': 'ui',       // Admin panel is UI action
          'api': 'backend',
          'server': 'server',
          'cron': 'cron',
          'webhook': 'webhook',
          'agent': 'agent'
        };
        const validSource = sourceMapping[leadData.source || ''] || 'ui'; // Default to 'ui' for unknown sources
        
        try {
          // Try Prisma create first (works if all columns exist)
          
          // Ensure userAgent and ip are never undefined (use empty string or default)
          const safeUserAgent = userAgent || 'manual-entry';
          const safeIp = ip || '0.0.0.0';
          
          console.log('[Operator Onboarding API] Attempting Prisma create with:', {
            type: 'onboarding.signup',
            source: validSource,
            ctaSource,
            tenantId: tenantId || 'null',
            userAgent: safeUserAgent,
            ip: safeIp
          });
          
          newEvent = await prisma.reflexEvent.create({
            data: {
              type: 'onboarding.signup',
              source: validSource, // Must be 'ui', 'backend', or 'agent'
              payload: JSON.stringify(remPayload), // Store REM-compliant TrustEvent
              ctaSource: ctaSource,
              ctaType: 'onboarding_signup',
              userAgent: safeUserAgent, // Ensure it's never undefined
              ip: safeIp, // Ensure it's never undefined
              trustEventTypeV1: 'fast_checkout', // Map onboarding.signup to fast_checkout (new customer acquisition)
              tenantId: tenantId // Multi-tenant: associate with current tenant (can be null in dev)
            }
          });
          
          console.log('[Operator Onboarding API] Prisma create successful:', newEvent.id);
        } catch (prismaError: any) {
          console.error('[Operator Onboarding API] Prisma create error:', {
            message: prismaError?.message,
            code: prismaError?.code,
            meta: prismaError?.meta
          });
          
          // If trustEventTypeV1 column doesn't exist, use raw SQL fallback
          if (prismaError?.message?.includes('trustEventTypeV1') || 
              prismaError?.message?.includes('does not exist') ||
              prismaError?.code === 'P2021') {
            console.warn('[Operator Onboarding API] trustEventTypeV1 column not found, using raw SQL fallback');
            
            const fallbackUserAgent = req.headers.get('user-agent') || 'manual-entry';
            const fallbackIp = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
            const referrer = req.headers.get('referer') || req.headers.get('referrer') || null;
            
            try {
              // Use raw SQL to insert without trustEventTypeV1 column
              // Store REM-compliant payload
              // Note: This fallback should be removed once migration is complete
              const insertResult = await prisma.$queryRawUnsafe(`
                INSERT INTO reflex_events (
                  id, type, source, payload, "ctaSource", "ctaType", 
                  "userAgent", ip, referrer, "campaignId", metadata, tenant_id, "createdAt"
                )
                VALUES (
                  gen_random_uuid()::text,
                  $1,
                  $2,
                  $3,
                  $4,
                  $5,
                  $6,
                  $7,
                  $8,
                  $9,
                  $10,
                  $11,
                  NOW()
                )
                RETURNING id, type, source, "createdAt"
              `,
                'onboarding.signup',
                validSource, // Use same mapping as Prisma create (handles 'manual', 'admin', etc.)
                JSON.stringify(remPayload), // Use REM-compliant payload
                ctaSource,
                'onboarding_signup',
                fallbackUserAgent, // Use safe default
                fallbackIp, // Use safe default
                referrer,
                null, // campaignId
                null, // metadata
                tenantId // Multi-tenant: associate with current tenant (can be null in dev)
              ) as any[];
              
              if (insertResult && insertResult.length > 0) {
                newEvent = insertResult[0];
                console.log('[Operator Onboarding API] Lead created via raw SQL fallback:', newEvent.id);
              } else {
                throw new Error('Raw SQL insert returned no rows');
              }
            } catch (sqlError: any) {
              console.error('[Operator Onboarding API] Raw SQL fallback also failed:', {
                message: sqlError?.message,
                code: sqlError?.code
              });
              throw sqlError;
            }
          } else {
            // Re-throw if it's a different error
            console.error('[Operator Onboarding API] Unexpected Prisma error, re-throwing:', prismaError);
            throw prismaError;
          }
        }

        console.log('[Operator Onboarding API] Lead created successfully:', newEvent.id);
        createdEventId = newEvent.id;

        // Create MenuFile records for uploaded files
        if (leadData.menuFiles && Array.isArray(leadData.menuFiles) && leadData.menuFiles.length > 0) {
          try {
            const menuFileRecords = leadData.menuFiles.map((file: any) => ({
              leadId: newEvent.id,
              fileName: file.fileName,
              fileUrl: file.fileUrl,
              fileType: file.fileType,
              fileSize: file.fileSize,
              status: 'pending',
              tenantId: tenantId
            }));

            // Insert menu files using raw SQL (MenuFile model may not be migrated yet)
            for (const fileRecord of menuFileRecords) {
              try {
                await prisma.$executeRawUnsafe(`
                  INSERT INTO public.menu_files (
                    id, lead_id, file_name, file_url, file_type, file_size, 
                    status, tenant_id, uploaded_at
                  )
                  VALUES (
                    gen_random_uuid()::text,
                    $1, $2, $3, $4, $5, $6, $7, NOW()
                  )
                `,
                  fileRecord.leadId,
                  fileRecord.fileName,
                  fileRecord.fileUrl,
                  fileRecord.fileType,
                  fileRecord.fileSize,
                  fileRecord.status,
                  fileRecord.tenantId
                );
                console.log(`[Operator Onboarding API] Created MenuFile record for: ${fileRecord.fileName}`);
              } catch (fileError: any) {
                // If menu_files table doesn't exist yet, log and continue
                if (fileError?.message?.includes('does not exist') || fileError?.code === '42P01') {
                  console.warn('[Operator Onboarding API] menu_files table not found, skipping file record creation');
                } else {
                  console.error('[Operator Onboarding API] Error creating MenuFile record:', fileError);
                }
              }
            }
          } catch (fileError) {
            console.error('[Operator Onboarding API] Error creating menu file records (non-blocking):', fileError);
            // Continue anyway - file records are non-critical
          }
        }

        // Only send email notifications for non-manual leads (skip for manual entries)
        if (leadData.source !== 'manual') {
          // Send email notification to admin (non-blocking)
          try {
            await sendNewLeadNotification({
              businessName: leadData.businessName,
              ownerName: leadData.ownerName,
              email: leadData.email,
              phone: leadData.phone,
              location: leadData.location,
              source: leadData.source || 'website',
              stage: leadData.stage || 'intake',
            });
            console.log('[Operator Onboarding API] Lead notification email sent');
          } catch (emailError) {
            console.error('[Operator Onboarding API] Failed to send lead notification email (non-blocking):', emailError);
            // Continue anyway - email failure shouldn't block lead creation
          }

          // Also send email notification to hookahplusconnector@gmail.com (non-blocking)
          try {
            await sendNewLeadNotification({
              businessName: leadData.businessName,
              ownerName: leadData.ownerName,
              email: leadData.email,
              phone: leadData.phone,
              location: leadData.location,
              source: leadData.source || 'website',
              stage: leadData.stage || 'intake',
            }, 'hookahplusconnector@gmail.com');
            console.log('[Operator Onboarding API] Lead notification email sent to hookahplusconnector@gmail.com');
          } catch (connectorEmailError) {
            console.error('[Operator Onboarding API] Failed to send notification to hookahplusconnector@gmail.com (non-blocking):', connectorEmailError);
            // Continue anyway - email failure shouldn't block lead creation
          }
        } else {
          console.log('[Operator Onboarding API] Skipping email notifications for manual lead creation');
        }

        // Auto-generate test link and DM message if Instagram URL is provided
        if (leadData.instagramUrl && instagramMenuData) {
          try {
            // Generate test link
            const businessName = leadData.businessName || 'Demo Lounge';
            const slug = generateSlug(businessName);
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.hookahplus.net';
            const demoLink = generateDemoLink(slug, appUrl, true);
            const demoTenantId = await findOrCreateDemoTenant(businessName, prisma);

            // Update lead payload with demo link
            const updatedPayload = JSON.parse(newEvent.payload);
            const targetPayload = updatedPayload.behavior?.payload || updatedPayload;
            targetPayload.demoLink = demoLink;
            targetPayload.demoSlug = slug;
            targetPayload.demoTenantId = demoTenantId;
            targetPayload.demoCreatedAt = new Date().toISOString();
            
            if (updatedPayload.behavior) {
              updatedPayload.behavior.payload.demoLink = demoLink;
              updatedPayload.behavior.payload.demoSlug = slug;
              updatedPayload.behavior.payload.demoTenantId = demoTenantId;
              updatedPayload.behavior.payload.demoCreatedAt = new Date().toISOString();
            }

            await prisma.reflexEvent.update({
              where: { id: newEvent.id },
              data: {
                payload: JSON.stringify(updatedPayload),
                tenantId: demoTenantId
              }
            });

            // Generate and save DM message as note
            const generateWarmDM = (data: any, instaData: any, link: string): string => {
              const businessName = data.businessName || 'your lounge';
              const ownerName = data.ownerName || 'there';
              const demoLink = link || '';
              
              let message = `Hey ${ownerName}! 👋\n\n`;
              
              if (instaData) {
                if (instaData.flavors && instaData.flavors.length > 0) {
                  const topFlavors = instaData.flavors.slice(0, 3).join(', ');
                  message += `I noticed ${businessName} offers ${topFlavors}${instaData.flavors.length > 3 ? ' and more' : ''} - great selection! 🍃\n\n`;
                }
                
                if (instaData.basePrice) {
                  message += `I see your base price is around $${instaData.basePrice}. `;
                }
                
                if (instaData.menuItems && instaData.menuItems.length > 0) {
                  message += `Your menu looks solid!\n\n`;
                }
              }
              
              message += `I'd love to show you how Hookah+ can help ${businessName}:\n\n`;
              message += `✨ Increase table turnover\n`;
              message += `📊 Track session times & revenue\n`;
              message += `💳 Accept payments seamlessly\n`;
              message += `📱 Give guests a modern ordering experience\n\n`;
              
              if (demoLink) {
                message += `I've set up a personalized demo for you:\n${demoLink}\n\n`;
                message += `Check it out when you have a moment - it's customized for ${businessName}!\n\n`;
              } else {
                message += `Would you be open to a quick 15-min demo? I can show you exactly how it works for your setup.\n\n`;
              }
              
              message += `Let me know what works best for you! 🙌`;
              
              return message;
            };

            const dmMessage = generateWarmDM(leadData, instagramMenuData, demoLink);
            
            // Save DM message as note
            const targetPayloadForNote = updatedPayload.behavior?.payload || updatedPayload;
            if (!targetPayloadForNote.notes) {
              targetPayloadForNote.notes = [];
            }
            targetPayloadForNote.notes.push({
              id: `note_${Date.now()}`,
              content: `📱 Instagram DM Message:\n\n${dmMessage}`,
              author: 'system',
              createdAt: new Date().toISOString(),
              noteType: 'dm_template'
            });

            if (updatedPayload.behavior) {
              updatedPayload.behavior.payload.notes = targetPayloadForNote.notes;
            }

            await prisma.reflexEvent.update({
              where: { id: newEvent.id },
              data: {
                payload: JSON.stringify(updatedPayload)
              }
            });

            console.log('[Operator Onboarding API] Auto-generated test link and DM message for Instagram lead');
          } catch (autoGenError) {
            console.error('[Operator Onboarding API] Error auto-generating test link/DM (non-blocking):', autoGenError);
            // Continue anyway - this is non-blocking
          }
        }

        return NextResponse.json({
          success: true,
          leadId: newEvent.id,
          message: 'Lead created successfully',
          lead: {
            id: newEvent.id,
            businessName: leadData.businessName,
            email: leadData.email,
            stage: leadData.stage || 'new-leads',
            source: leadData.source || 'manual'
          }
        });
      } catch (createError) {
        console.error('[Operator Onboarding API] Lead creation error:', createError);
        console.error('[Operator Onboarding API] Error details:', {
          message: createError instanceof Error ? createError.message : 'Unknown error',
          stack: createError instanceof Error ? createError.stack : undefined,
          leadData: {
            businessName: leadData.businessName,
            email: leadData.email,
            stage: leadData.stage
          }
        });
        
        // Provide specific error messages
        let errorMessage = 'Failed to create lead';
        let errorDetails = createError instanceof Error ? createError.message : 'Unknown error';
        
        if (createError instanceof Error) {
          if (createError.message.includes('does not exist')) {
            errorMessage = 'Database table not found';
            errorDetails = 'The reflex_events table does not exist. Please run database migrations.';
          } else if (createError.message.includes('Unique constraint')) {
            errorMessage = 'Duplicate entry';
            errorDetails = 'A lead with this information already exists.';
          } else if (createError.message.includes('Foreign key constraint')) {
            errorMessage = 'Invalid reference';
            errorDetails = 'Referenced record does not exist.';
          } else if (createError.message.includes('connection') || createError.message.includes('timeout')) {
            errorMessage = 'Database connection failed';
            errorDetails = 'Unable to connect to database. Please check DATABASE_URL environment variable.';
          }
        }
        
        return NextResponse.json({
          success: false,
          error: errorMessage,
          details: errorDetails,
          hint: 'Check database connection and ensure reflex_events table exists',
          stack: process.env.NODE_ENV === 'development' ? (createError instanceof Error ? createError.stack : undefined) : undefined
        }, { status: 500 });
      }
    }

    // For other actions, require leadId
    if (!leadId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: leadId'
      }, { status: 400 });
    }

    // Get existing event
    let event;
    try {
      event = await prisma.reflexEvent.findUnique({
        where: { id: leadId }
      });
    } catch (queryError: any) {
      // Check if it's a table doesn't exist error
      const isTableMissing = queryError?.message?.includes('does not exist') || 
                            queryError?.code === '42P01' || // PostgreSQL: relation does not exist
                            queryError?.message?.includes('reflex_events') ||
                            queryError?.message?.includes('ReflexEvent');
      
      if (isTableMissing) {
        console.warn('[Operator Onboarding API] ReflexEvent table not found - cannot update lead');
        return NextResponse.json({
          success: false,
          error: 'Database table not found',
          details: 'The reflex_events table does not exist. Please run database migrations.',
          hint: 'Run: npx prisma migrate deploy'
        }, { status: 503 });
      }
      throw queryError; // Re-throw other errors
    }

    if (!event) {
      return NextResponse.json({
        success: false,
        error: 'Lead not found'
      }, { status: 404 });
    }

    // Parse existing payload
    const existingPayload = event.payload ? JSON.parse(event.payload) : {};

    // Preserve REM TrustEvent structure if it exists
    let updatedPayload: any;
    if (existingPayload.behavior && existingPayload.behavior.payload) {
      // REM TrustEvent format - update behavior.payload
      updatedPayload = { ...existingPayload };
      updatedPayload.behavior.payload = { ...existingPayload.behavior.payload };
    } else {
      // Legacy format - update top level
      updatedPayload = { ...existingPayload };
    }

    switch (action) {
      case 'update_stage':
        if (updatedPayload.behavior && updatedPayload.behavior.payload) {
          updatedPayload.behavior.payload.stage = updates.stage;
          updatedPayload.behavior.payload.stageUpdatedAt = new Date().toISOString();
          updatedPayload.behavior.payload.stageUpdatedBy = updates.updatedBy || 'admin';
        } else {
          updatedPayload.stage = updates.stage;
          updatedPayload.stageUpdatedAt = new Date().toISOString();
          updatedPayload.stageUpdatedBy = updates.updatedBy || 'admin';
        }
        break;

      case 'add_note':
        const targetPayload = updatedPayload.behavior?.payload || updatedPayload;
        if (!targetPayload.notes) {
          targetPayload.notes = [];
        }
        targetPayload.notes.push({
          id: `note_${Date.now()}`,
          content: updates.note,
          author: updates.author || 'admin',
          createdAt: new Date().toISOString(),
          type: updates.noteType || 'general'
        });
        break;

      case 'schedule_followup':
        const scheduleTarget = updatedPayload.behavior?.payload || updatedPayload;
        scheduleTarget.scheduledFollowUp = updates.scheduledDate;
        scheduleTarget.followUpNote = updates.note || '';
        scheduleTarget.scheduledBy = updates.scheduledBy || 'admin';
        break;

      case 'mark_contacted':
        const contactTarget = updatedPayload.behavior?.payload || updatedPayload;
        contactTarget.lastContacted = new Date().toISOString();
        contactTarget.lastContactedBy = updates.contactedBy || 'admin';
        contactTarget.contactMethod = updates.contactMethod || 'email';
        // Always create a note for mark_contacted to document the interaction
        if (!contactTarget.notes) {
          contactTarget.notes = [];
        }
        const contactNote = updates.note || `Contacted via ${updates.contactMethod || 'email'}`;
        contactTarget.notes.push({
          id: `note_${Date.now()}`,
          content: contactNote,
          author: updates.contactedBy || 'admin',
          createdAt: new Date().toISOString(),
          type: 'contact'
        });
        break;

      case 'assign':
        const assignTarget = updatedPayload.behavior?.payload || updatedPayload;
        assignTarget.assignedTo = updates.assignedTo;
        assignTarget.assignedAt = new Date().toISOString();
        break;

      case 'update_probability':
        const probTarget = updatedPayload.behavior?.payload || updatedPayload;
        probTarget.conversionProbability = updates.probability;
        break;

      case 'extract_menu_data':
        const extractTarget = updatedPayload.behavior?.payload || updatedPayload;
        extractTarget.extractedMenuData = updates.extractedData;
        extractTarget.menuExtractedAt = new Date().toISOString();
        extractTarget.menuExtractedBy = updates.extractedBy || 'admin';
        
        // Update menu file statuses to 'extracted'
        // This will be handled by the file deletion workflow
        break;

      case 'delete_lead':
        // Delete the lead event
        await prisma.reflexEvent.delete({
          where: { id: leadId }
        });
        
        return NextResponse.json({
          success: true,
          message: 'Lead deleted successfully',
          leadId
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action'
        }, { status: 400 });
    }

    // Update the event
    try {
      await prisma.reflexEvent.update({
        where: { id: leadId },
        data: {
          payload: JSON.stringify(updatedPayload)
        }
      });

      // Create a new ReflexEvent for audit trail (non-critical, don't fail if this errors)
      try {
        try {
          await prisma.reflexEvent.create({
            data: {
              type: 'admin.operator_onboarding.update',
              source: 'ui', // Map 'admin' to 'ui' (admin panel is UI action) - database constraint requires valid enum
              payload: JSON.stringify({
                leadId,
                action,
                updates,
                timestamp: new Date().toISOString()
              }),
              userAgent: req.headers.get('user-agent') || '',
              ip: req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0'
            }
          });
        } catch (prismaError: any) {
          // If trustEventTypeV1 column doesn't exist, use raw SQL fallback
          if (prismaError?.message?.includes('trustEventTypeV1') || 
              prismaError?.message?.includes('does not exist') ||
              prismaError?.code === 'P2021') {
            console.warn('[Operator Onboarding API] trustEventTypeV1 column not found for audit trail, using raw SQL fallback');
            
            const userAgent = req.headers.get('user-agent') || null;
            const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
            
            await prisma.$executeRawUnsafe(`
              INSERT INTO reflex_events (
                id, type, source, payload, "userAgent", ip, "createdAt"
              )
              VALUES (
                gen_random_uuid()::text,
                $1,
                $2,
                $3,
                $4,
                $5,
                NOW()
              )
            `,
              'admin.operator_onboarding.update',
              'admin',
              JSON.stringify({
                leadId,
                action,
                updates,
                timestamp: new Date().toISOString()
              }),
              userAgent,
              ip
            );
          } else {
            // Log but don't fail - audit trail is non-critical
            console.warn('[Operator Onboarding API] Failed to create audit trail (non-critical):', prismaError?.message);
          }
        }
      } catch (updateError: any) {
        // Log but don't fail - audit trail is non-critical
        console.warn('[Operator Onboarding API] Failed to create audit trail (non-critical):', updateError?.message);
      }
    } catch (updateEventError: any) {
      // Event update is critical - re-throw the error so it's properly handled
      console.error('[Operator Onboarding API] Failed to update event:', updateEventError?.message);
      throw updateEventError;
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      leadId
    });

  } catch (error) {
    console.error('[Operator Onboarding] POST Error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to update lead';
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    
    if (error instanceof Error) {
      // Check for common Prisma errors
      if (error.message.includes('does not exist')) {
        errorMessage = 'Database table not found';
        errorDetails = 'The reflex_events table does not exist. Please run database migrations.';
      } else if (error.message.includes('Unique constraint')) {
        errorMessage = 'Duplicate entry';
        errorDetails = 'A lead with this information already exists.';
      } else if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Invalid reference';
        errorDetails = 'Referenced record does not exist.';
      }
    }
    
    return NextResponse.json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    }, { status: 500 });
  }
}

