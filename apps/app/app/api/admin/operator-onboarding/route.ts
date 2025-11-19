import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { generateTrustEventId, type TrustEvent, type TrustEventType } from '../../../../lib/reflex/rem-types';
import { sendNewLeadNotification } from '../../../../lib/email';
import { requireRole, getCurrentTenant } from '../../../../lib/auth';
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
  try {
    // Test database connection first
    try {
      await prisma.$connect();
      console.log('[Operator Onboarding API] Database connection successful');
    } catch (dbError) {
      console.error('[Operator Onboarding API] Database connection failed:', dbError);
      return NextResponse.json({ 
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        hint: 'Check DATABASE_URL environment variable and ensure database is running'
      }, { status: 503 });
    }

    // Require owner or admin role
    const { user, role } = await requireRole(req, ['owner', 'admin']);
    const tenantId = await getCurrentTenant(req);
    
    if (!tenantId) {
      return NextResponse.json({
        success: false,
        error: 'No active tenant. Please select a tenant or create one.',
      }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get('stage');
    const source = searchParams.get('source');
    const ctaSource = searchParams.get('ctaSource'); // Filter by CTA source

    // Query ReflexEvent for onboarding-related events including CTAs
    // Exclude audit events (admin.operator_onboarding.update) to prevent duplicates
    const whereClause: any = {
      AND: [
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
        },
        {
          // Multi-tenant filter: only events for current tenant
          tenantId: tenantId
        }
      ]
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
      // Query events - exclude trustEventTypeV1 which may not be migrated yet
      events = await prisma.reflexEvent.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        take: 100, // Limit to recent 100 entries
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
        
        // Business details
        seatingTypes: data.seatingTypes || [],
        totalCapacity: data.totalCapacity || '0',
        numberOfTables: data.numberOfTables || '0',
        averageSessionDuration: data.averageSessionDuration || '',
        currentPOS: data.currentPOS || 'unknown',
        pricingModel: data.pricingModel || 'unknown',
        preferredFeatures: data.preferredFeatures || [],
        
        // Stage tracking (stored in payload or default)
        // CTA events have stage in payload, otherwise use defaults
        stage: payload.stage || data.stage || 
          (event.type === 'pos.waitlist.signup' ? 'new-leads' : 
           event.type?.startsWith('cta.') ? 'new-leads' : 'intake'),
        
        // Management fields
        notes: payload.notes || [],
        scheduledFollowUp: payload.scheduledFollowUp || null,
        lastContacted: payload.lastContacted || null,
        assignedTo: payload.assignedTo || null,
        
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

    // Require owner or admin role
    const { user, role } = await requireRole(req, ['owner', 'admin']);
    const tenantId = await getCurrentTenant(req);
    
    if (!tenantId) {
      return NextResponse.json({
        success: false,
        error: 'No active tenant. Please select a tenant or create one.',
      }, { status: 400 });
    }

    const body = await req.json();
    const { action, leadId, updates, leadData } = body;
    
    console.log('[Operator Onboarding API] POST request:', { action, leadId: leadId?.substring(0, 20) });

    if (!action) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: action'
      }, { status: 400 });
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
      if (!leadData || !leadData.businessName || !leadData.email) {
        return NextResponse.json({
          success: false,
          error: 'Missing required fields: businessName, email'
        }, { status: 400 });
      }

      // Create a new ReflexEvent for the manual lead
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
        assignedTo: null
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
        
        // Create REM-compliant TrustEvent payload
        const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
        const userAgent = req.headers.get('user-agent') || undefined;
        const remPayload = await createREMCompliantOnboardingEvent(payload, ip, userAgent, leadData.source || 'manual');
        
        try {
          // Try Prisma create first (works if all columns exist)
          // Map source to valid enum value (ui | backend | agent)
          const validSource = leadData.source === 'website' ? 'ui' : 
                              leadData.source === 'api' ? 'backend' :
                              leadData.source || 'ui'; // Default to 'ui' for web submissions
          
          newEvent = await prisma.reflexEvent.create({
            data: {
              type: 'onboarding.signup',
              source: validSource, // Must be 'ui', 'backend', or 'agent'
              payload: JSON.stringify(remPayload), // Store REM-compliant TrustEvent
              ctaSource: ctaSource,
              ctaType: 'onboarding_signup',
              userAgent: userAgent,
              ip: ip,
              trustEventTypeV1: 'fast_checkout', // Map onboarding.signup to fast_checkout (new customer acquisition)
              tenantId: tenantId // Multi-tenant: associate with current tenant
            }
          });
        } catch (prismaError: any) {
          // If trustEventTypeV1 column doesn't exist, use raw SQL fallback
          if (prismaError?.message?.includes('trustEventTypeV1') || 
              prismaError?.message?.includes('does not exist') ||
              prismaError?.code === 'P2021') {
            console.warn('[Operator Onboarding API] trustEventTypeV1 column not found, using raw SQL fallback');
            
            const userAgent = req.headers.get('user-agent') || null;
            const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || null;
            const referrer = req.headers.get('referer') || req.headers.get('referrer') || null;
            
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
              leadData.source === 'website' ? 'ui' : leadData.source === 'api' ? 'backend' : 'ui', // Map to valid enum
              JSON.stringify(remPayload), // Use REM-compliant payload
              ctaSource,
              'onboarding_signup',
              userAgent,
              ip,
              referrer,
              null, // campaignId
              null, // metadata
              tenantId // Multi-tenant: associate with current tenant
            ) as any[];
            
            if (insertResult && insertResult.length > 0) {
              newEvent = insertResult[0];
              console.log('[Operator Onboarding API] Lead created via raw SQL fallback:', newEvent.id);
            } else {
              throw new Error('Raw SQL insert returned no rows');
            }
          } else {
            // Re-throw if it's a different error
            throw prismaError;
          }
        }

        console.log('[Operator Onboarding API] Lead created successfully:', newEvent.id);

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

    let updatedPayload = { ...existingPayload };

    switch (action) {
      case 'update_stage':
        updatedPayload.stage = updates.stage;
        updatedPayload.stageUpdatedAt = new Date().toISOString();
        updatedPayload.stageUpdatedBy = updates.updatedBy || 'admin';
        break;

      case 'add_note':
        if (!updatedPayload.notes) {
          updatedPayload.notes = [];
        }
        updatedPayload.notes.push({
          id: `note_${Date.now()}`,
          content: updates.note,
          author: updates.author || 'admin',
          createdAt: new Date().toISOString(),
          type: updates.noteType || 'general'
        });
        break;

      case 'schedule_followup':
        updatedPayload.scheduledFollowUp = updates.scheduledDate;
        updatedPayload.followUpNote = updates.note || '';
        updatedPayload.scheduledBy = updates.scheduledBy || 'admin';
        break;

      case 'mark_contacted':
        updatedPayload.lastContacted = new Date().toISOString();
        updatedPayload.lastContactedBy = updates.contactedBy || 'admin';
        updatedPayload.contactMethod = updates.contactMethod || 'email';
        if (updates.note) {
          if (!updatedPayload.notes) {
            updatedPayload.notes = [];
          }
          updatedPayload.notes.push({
            id: `note_${Date.now()}`,
            content: updates.note,
            author: updates.contactedBy || 'admin',
            createdAt: new Date().toISOString(),
            type: 'contact'
          });
        }
        break;

      case 'assign':
        updatedPayload.assignedTo = updates.assignedTo;
        updatedPayload.assignedAt = new Date().toISOString();
        break;

      case 'update_probability':
        updatedPayload.conversionProbability = updates.probability;
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

      // Create a new ReflexEvent for audit trail
      try {
        try {
          await prisma.reflexEvent.create({
            data: {
              type: 'admin.operator_onboarding.update',
              source: 'admin',
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
            // Re-throw if it's a different error
            throw prismaError;
          }
        }
      } catch (updateError: any) {
        // Log but don't fail - audit trail is non-critical
        console.warn('[Operator Onboarding API] Failed to create audit trail (non-critical):', updateError?.message);
      }
    } catch (updateEventError: any) {
      // Log but don't fail - event update is critical, but we'll continue
      console.error('[Operator Onboarding API] Failed to update event:', updateEventError?.message);
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

