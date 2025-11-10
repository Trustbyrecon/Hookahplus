import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

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

    // TODO: Add role-based authentication check
    // const userRole = await getCurrentUserRole(req);
    // if (userRole !== 'ADMIN') {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    // }

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
      events = await prisma.reflexEvent.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        take: 100 // Limit to recent 100 entries
      });
      console.log(`[Operator Onboarding API] Found ${events.length} events`);
    } catch (queryError) {
      console.error('[Operator Onboarding API] Query error:', queryError);
      // Check if it's a table doesn't exist error
      if (queryError instanceof Error && queryError.message.includes('does not exist')) {
        return NextResponse.json({
          success: false,
          error: 'Database table not found',
          details: 'The reflex_events table does not exist. Please run database migrations.',
          hint: 'Run: npx prisma migrate deploy'
        }, { status: 500 });
      }
      throw queryError; // Re-throw other errors
    }

    // Parse and format lead data
    const leads = events.map(event => {
      const payload = event.payload ? JSON.parse(event.payload) : {};
      const data = payload.data || payload;

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
        
        // Lead details from payload (prioritize payload.lead for CTA events)
        businessName: payload.lead?.businessName || data.businessName || data.loungeName || 'Unknown',
        ownerName: payload.lead?.name || data.ownerName || data.name || 'Unknown',
        email: payload.lead?.email || data.email || 'No email',
        phone: payload.lead?.phone || data.phone || 'No phone',
        location: payload.lead?.location || data.location || data.city || 'Unknown',
        
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

    // TODO: Add role-based authentication check
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
        source: 'manual',
        createdAt: leadData.createdAt || new Date().toISOString(),
        notes: [],
        scheduledFollowUp: null,
        lastContacted: null,
        assignedTo: null
      };

      console.log('[Operator Onboarding API] Creating lead with data:', {
        businessName: leadData.businessName,
        email: leadData.email,
        stage: leadData.stage
      });

      const newEvent = await prisma.reflexEvent.create({
        data: {
          type: 'onboarding.signup',
          source: 'manual',
          payload: JSON.stringify(payload),
          ctaSource: 'manual',
          ctaType: 'onboarding_signup',
          userAgent: req.headers.get('user-agent') || undefined,
          ip: req.headers.get('x-forwarded-for')?.split(',')[0] || undefined
        }
      });

      console.log('[Operator Onboarding API] Lead created successfully:', newEvent.id);

      return NextResponse.json({
        success: true,
        leadId: newEvent.id,
        message: 'Lead created successfully'
      });
    }

    // For other actions, require leadId
    if (!leadId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required field: leadId'
      }, { status: 400 });
    }

    // Get existing event
    const event = await prisma.reflexEvent.findUnique({
      where: { id: leadId }
    });

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
    await prisma.reflexEvent.update({
      where: { id: leadId },
      data: {
        payload: JSON.stringify(updatedPayload)
      }
    });

    // Create a new ReflexEvent for audit trail
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

