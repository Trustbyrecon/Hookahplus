import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/db';
import { requireRole, getCurrentTenant } from '../../../../../lib/auth';

/**
 * GET /api/admin/operator-onboarding/debug
 * 
 * Diagnostic endpoint to find ALL leads in the database
 * Bypasses all filters (type, tenantId, stage, source, etc.)
 * Use this to find missing leads
 */
export async function GET(req: NextRequest) {
  // Auth + tenant selection (same as main endpoint - bypass in dev mode)
  let tenantId: string | null = null;
  if (process.env.NODE_ENV === 'production') {
    // In production: enforce owner/admin and require an active tenant
    try {
      const { user, role } = await requireRole(req, ['owner', 'admin']);
      tenantId = await getCurrentTenant(req);
      
      if (!tenantId) {
        return NextResponse.json({
          success: false,
          error: 'No active tenant. Please select a tenant or create one.',
        }, { status: 400 });
      }
    } catch (authError) {
      console.error('[Operator Onboarding Debug] Auth error:', authError);
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
        details: authError instanceof Error ? authError.message : 'Unknown auth error',
        hint: 'This endpoint requires admin/owner role in production mode'
      }, { status: 401 });
    }
  } else {
    // In development: allow access without auth/tenant, to unblock local testing
    console.log('[Operator Onboarding Debug] DEV mode - skipping auth and tenant checks');
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'debug/route.ts:12',message:'Debug endpoint entry',data:{hasDatabaseUrl:!!process.env.DATABASE_URL,dbUrlPrefix:process.env.DATABASE_URL?.substring(0,20)||'NOT_SET',nodeEnv:process.env.NODE_ENV},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
  // #endregion
  try {
    // Test database connection by attempting a simple query
    // Use findFirst instead of $queryRaw to avoid prepared statement issues with poolers
    // If this fails, we'll catch it and return a helpful error
    try {
      await prisma.reflexEvent.findFirst({ take: 1 });
      console.log('[Operator Onboarding Debug] Database connection successful');
      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'debug/route.ts:46',message:'Database connection test successful',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
    } catch (dbError: any) {
      console.error('[Operator Onboarding Debug] Database connection test failed:', {
        message: dbError?.message,
        code: dbError?.code,
        meta: dbError?.meta
      });
      return NextResponse.json({ 
        success: false,
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        errorCode: dbError?.code,
        hint: 'Check DATABASE_URL environment variable and ensure database is running. If using Supabase, ensure the connection string is correct and the database is accessible.'
      }, { status: 503 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get('limit') || '1000', 10);
    const includeAudit = searchParams.get('includeAudit') === 'true';

    // Query ALL ReflexEvent records (no filters)
    let events;
    try {
      const whereClause: any = {};
      
      // Optionally exclude audit events (default behavior)
      if (!includeAudit) {
        whereClause.NOT = {
          type: 'admin.operator_onboarding.update'
        };
      }

      // #region agent log
      fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'debug/route.ts:80',message:'Before debug query',data:{whereClause:JSON.stringify(whereClause).substring(0,200),limit},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      events = await prisma.reflexEvent.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        },
        take: limit,
        select: {
          id: true,
          type: true,
          source: true,
          ctaSource: true,
          ctaType: true,
          payload: true,
          createdAt: true,
          tenantId: true,
          userAgent: true,
          ip: true,
        },
      });
      
      console.log(`[Operator Onboarding Debug] Found ${events.length} total events`);
      // #region agent log
      const allEventTypes = [...new Set(events.map(e=>e.type))];
      const allSources = [...new Set(events.map(e=>e.source).filter(Boolean))];
      fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'debug/route.ts:100',message:'After debug query',data:{eventCount:events.length,eventTypes:allEventTypes,eventTypesCount:allEventTypes.length,sources:allSources,hasPayload:events.filter(e=>e.payload).length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
    } catch (queryError: any) {
      console.error('[Operator Onboarding Debug] Query error:', {
        message: queryError?.message,
        code: queryError?.code,
        meta: queryError?.meta,
        stack: queryError?.stack
      });
      
      // Check if it's a table doesn't exist error
      const isTableMissing = queryError?.message?.includes('does not exist') || 
                            queryError?.code === '42P01' ||
                            queryError?.message?.includes('reflex_events') ||
                            queryError?.message?.includes('ReflexEvent');
      
      if (isTableMissing) {
        return NextResponse.json({
          success: false,
          error: 'ReflexEvent table not found',
          details: queryError?.message,
          hint: 'Run: npx prisma migrate deploy'
        }, { status: 503 });
      }
      
      // Return detailed error for debugging
      return NextResponse.json({
        success: false,
        error: 'Database query failed',
        details: queryError?.message || 'Unknown query error',
        errorCode: queryError?.code,
        hint: 'Check server logs for more details. This might be a database connection issue or schema mismatch.'
      }, { status: 503 });
    }

    // Parse and format all events as potential leads
    const allLeads = events.map(event => {
      let payload: any = {};
      try {
        payload = event.payload ? JSON.parse(event.payload) : {};
        // #region agent log
        if(events.indexOf(event) < 5) { // Log first 5 for payload structure
          fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'debug/route.ts:138',message:'Payload parsed',data:{eventId:event.id,eventType:event.type,payloadKeys:Object.keys(payload),hasBehavior:!!payload.behavior,hasLead:!!payload.lead},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        }
        // #endregion
      } catch (e) {
        console.warn(`[Operator Onboarding Debug] Failed to parse payload for event ${event.id}`);
        // #region agent log
        fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'debug/route.ts:141',message:'Payload parse failed',data:{eventId:event.id,eventType:event.type,error:e instanceof Error?e.message:'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
      }

      // Extract lead information from various payload formats
      let data: any = {};
      if (payload.behavior && payload.behavior.payload) {
        // REM TrustEvent format
        data = { ...payload, ...payload.behavior.payload };
      } else if (payload.lead) {
        // CTA event format
        data = { ...payload, ...payload.lead };
      } else {
        // Legacy format
        data = payload.data || payload;
      }

      return {
        id: event.id,
        type: event.type,
        source: event.source,
        ctaSource: event.ctaSource,
        ctaType: event.ctaType,
        tenantId: event.tenantId,
        createdAt: event.createdAt,
        
        // Lead details
        businessName: data.businessName || data.loungeName || 'Unknown',
        ownerName: data.ownerName || data.name || 'Unknown',
        email: data.email || 'No email',
        phone: data.phone || 'No phone',
        location: data.location || data.city || 'Unknown',
        stage: data.stage || 'unknown',
        
        // Raw payload for debugging
        hasPayload: !!event.payload,
        payloadKeys: payload ? Object.keys(payload) : [],
      };
    });

    // Group by type for easier analysis
    const byType: Record<string, number> = {};
    events.forEach(event => {
      byType[event.type] = (byType[event.type] || 0) + 1;
    });

    // Group by source
    const bySource: Record<string, number> = {};
    events.forEach(event => {
      const source = event.source || 'unknown';
      bySource[source] = (bySource[source] || 0) + 1;
    });

    // Find potential onboarding leads (any event that might be a lead)
    const potentialLeads = allLeads.filter(lead => {
      // Include if it has business/contact info
      const hasBusinessInfo = lead.businessName !== 'Unknown' || lead.email !== 'No email';
      // Or if it's an onboarding-related type
      const isOnboardingType = lead.type?.includes('onboarding') || 
                               lead.type?.includes('demo') ||
                               lead.type?.startsWith('cta.') ||
                               lead.type === 'pos.waitlist.signup' ||
                               lead.type === 'sync.optimize.onboarding';
      return hasBusinessInfo || isOnboardingType;
    });

    return NextResponse.json({
      success: true,
      message: 'Diagnostic query completed',
      summary: {
        totalEvents: events.length,
        potentialLeads: potentialLeads.length,
        byType,
        bySource,
      },
      allLeads: allLeads,
      potentialLeads: potentialLeads,
      filters: {
        limit,
        includeAudit,
        note: 'This endpoint bypasses all filters. Use ?limit=5000 to see more results.'
      }
    });

  } catch (error) {
    console.error('[Operator Onboarding Debug] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to query leads',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

