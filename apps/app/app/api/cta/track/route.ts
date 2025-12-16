import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import crypto from 'crypto';

// CORS headers helper - accepts request to get origin
function getCorsHeaders(req?: NextRequest) {
  // Allow requests from site build, app build, or guest build
  const origin = req?.headers.get('origin');
  const allowedOrigins = [
    // Production domains
    'https://hookahplus.net',
    'https://www.hookahplus.net',
    'https://app.hookahplus.net',
    'https://guest.hookahplus.net',
    // Environment variable (can override)
    process.env.NEXT_PUBLIC_SITE_URL,
    // Local development
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3001', // Guest build
  ].filter(Boolean); // Remove undefined values
  
  // If origin matches allowed list, use it; otherwise check if it's a hookahplus.net domain
  let allowedOrigin: string = allowedOrigins[0] || 'https://hookahplus.net'; // Default fallback
  
  if (origin) {
    // Exact match
    if (allowedOrigins.includes(origin)) {
      allowedOrigin = origin;
    } 
    // Allow any hookahplus.net subdomain in production
    else if (origin.includes('hookahplus.net') && process.env.NODE_ENV === 'production') {
      allowedOrigin = origin;
    }
    // Allow localhost in development
    else if (origin.includes('localhost') && process.env.NODE_ENV === 'development') {
      allowedOrigin = origin;
    }
  }
    
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(req),
  });
}

/**
 * POST /api/cta/track
 * 
 * Centralized endpoint for tracking CTAs from all sources
 * Creates ReflexEvent entries with CTA-specific metadata
 * Automatically routes to Operator Onboarding if applicable
 */
export async function POST(req: NextRequest) {
  try {
    // #region agent log
    const origin = req.headers.get('origin');
    const logData = { origin, method: req.method, url: req.url, hasOrigin: !!origin };
    fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:12',message:'POST request received',data:logData,timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B,C'})}).catch(()=>{});
    // #endregion
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';
    const userAgent = req.headers.get('user-agent') || '';
    const referrer = req.headers.get('referer') || req.headers.get('referrer') || null;

    const body = await req.json();
    const {
      ctaSource, // 'website' | 'instagram' | 'linkedin' | 'email' | 'calendly'
      ctaType, // 'demo_request' | 'onboarding_signup' | 'contact_form' | 'social_click'
      data, // Lead/contact data
      metadata, // Additional source-specific metadata
      campaignId, // Marketing campaign identifier
      page, // Page/component where CTA was clicked
      component // Component name (e.g., 'Hero', 'StickyCTA')
    } = body;

    // Validation
    if (!ctaSource || !ctaType) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields: ctaSource, ctaType'
      }, { 
        status: 400,
        headers: getCorsHeaders(req)
      });
    }

    // Validate ctaSource
    const validSources = ['website', 'instagram', 'linkedin', 'email', 'calendly'];
    if (!validSources.includes(ctaSource)) {
      return NextResponse.json({
        success: false,
        error: `Invalid ctaSource. Must be one of: ${validSources.join(', ')}`
      }, { 
        status: 400,
        headers: getCorsHeaders(req)
      });
    }

    // Validate ctaType
    const validTypes = ['demo_request', 'onboarding_signup', 'contact_form', 'social_click', 'newsletter_signup', 'lead_magnet_download', 'founder_signup'];
    if (!validTypes.includes(ctaType)) {
      return NextResponse.json({
        success: false,
        error: `Invalid ctaType. Must be one of: ${validTypes.join(', ')}`
      }, { 
        status: 400,
        headers: getCorsHeaders(req)
      });
    }

    // Build event type
    const eventType = `cta.${ctaType}`;

    // Determine initial stage based on CTA type
    let initialStage = 'new-leads';
    if (ctaType === 'onboarding_signup' || ctaType === 'founder_signup') {
      initialStage = 'intake';
    } else if (ctaType === 'demo_request') {
      initialStage = 'scheduled';
    }

    // Build payload with CTA-specific data
    const payload: any = {
      ctaSource,
      ctaType,
      data: data || {},
      metadata: metadata || {},
      page: page || null,
      component: component || null,
      campaignId: campaignId || null,
      referrer: referrer,
      timestamp: new Date().toISOString(),
      stage: initialStage,
      // Include lead information if available
      lead: data ? {
        name: data.name || data.businessName || data.ownerName || null,
        email: data.email || null,
        phone: data.phone || null,
        businessName: data.businessName || data.loungeName || null,
        location: data.location || data.city || null
      } : null
    };

    // Create payload hash for deduplication
    const payloadStr = JSON.stringify(payload);
    const payloadHash = crypto.createHash('sha256').update(payloadStr).digest('hex').slice(0, 64);

    // Check for duplicates (same IP + type + hash in last 5 minutes)
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
    const duplicate = await prisma.reflexEvent.findFirst({
      where: {
        ip,
        type: eventType,
        payloadHash,
        createdAt: { gt: fiveMinAgo }
      },
      select: { id: true }
    });

    if (duplicate) {
      return NextResponse.json({
        success: true,
        id: duplicate.id,
        deduped: true,
        message: 'Duplicate CTA event detected and ignored'
      }, {
        headers: getCorsHeaders(req)
      });
    }

    // Create ReflexEvent
    const event = await prisma.reflexEvent.create({
      data: {
        type: eventType,
        source: ctaSource === 'website' ? 'ui' : ctaSource,
        payload: payloadStr,
        payloadHash,
        ctaSource,
        ctaType,
        referrer,
        campaignId: campaignId || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        userAgent,
        ip
      }
    });

    // Log success
    console.log(`[CTA Track] Created event ${event.id} for ${ctaSource}/${ctaType}`);

    // #region agent log
    const corsHeaders = getCorsHeaders(req);
    fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:133',message:'POST response sending',data:{corsHeaders,eventId:event.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A,D'})}).catch(()=>{});
    // #endregion
    return NextResponse.json({
      success: true,
      id: event.id,
      eventType,
      ctaSource,
      ctaType,
      stage: initialStage,
      message: 'CTA tracked successfully'
    }, {
      headers: getCorsHeaders(req)
    });

  } catch (error) {
    console.error('[CTA Track] Error:', error);
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/3e564bfc-6ffb-442f-a8df-25d3d77bd219',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'route.ts:143',message:'POST error caught',data:{errorMessage:error instanceof Error?error.message:'Unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    return NextResponse.json({
      success: false,
      error: 'Failed to track CTA',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: getCorsHeaders(req)
    });
  }
}

/**
 * GET /api/cta/track
 * 
 * Get CTA statistics (for admin dashboard)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const source = searchParams.get('source');
    const type = searchParams.get('type');
    const days = parseInt(searchParams.get('days') || '30');

    const since = new Date();
    since.setDate(since.getDate() - days);

    const where: any = {
      type: { startsWith: 'cta.' },
      createdAt: { gte: since }
    };

    if (source) {
      where.ctaSource = source;
    }

    if (type) {
      where.ctaType = type;
    }

    const events = await prisma.reflexEvent.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000
    });

    // Aggregate statistics
    const stats = {
      total: events.length,
      bySource: {} as Record<string, number>,
      byType: {} as Record<string, number>,
      byDay: {} as Record<string, number>
    };

    events.forEach(event => {
      // Count by source
      if (event.ctaSource) {
        stats.bySource[event.ctaSource] = (stats.bySource[event.ctaSource] || 0) + 1;
      }

      // Count by type
      if (event.ctaType) {
        stats.byType[event.ctaType] = (stats.byType[event.ctaType] || 0) + 1;
      }

      // Count by day
      const day = event.createdAt.toISOString().split('T')[0];
      stats.byDay[day] = (stats.byDay[day] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats,
      events: events.slice(0, 100) // Return first 100 for preview
    }, {
      headers: getCorsHeaders(req)
    });

  } catch (error) {
    console.error('[CTA Track] GET Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch CTA statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: getCorsHeaders(req)
    });
  }
}

