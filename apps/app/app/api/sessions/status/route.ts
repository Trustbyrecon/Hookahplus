import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { convertPrismaSessionToFireSession } from "../../../../lib/session-utils-prisma";
import { SessionState } from "@prisma/client";

// CORS headers helper
function getCorsHeaders(req?: NextRequest) {
  const origin = req?.headers.get('origin');
  const allowedOrigins = [
    'https://hookahplus.net',
    'https://www.hookahplus.net',
    'https://app.hookahplus.net',
    'https://guest.hookahplus.net',
    process.env.NEXT_PUBLIC_SITE_URL,
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3001',
  ].filter(Boolean);
  
  let allowedOrigin: string = allowedOrigins[0] || 'https://hookahplus.net';
  
  if (origin) {
    if (allowedOrigins.includes(origin)) {
      allowedOrigin = origin;
    } else if (origin.includes('hookahplus.net') && process.env.NODE_ENV === 'production') {
      allowedOrigin = origin;
    } else if (origin.includes('localhost') && process.env.NODE_ENV === 'development') {
      allowedOrigin = origin;
    }
  }
    
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(req),
  });
}

// GET session status - for guest tracker integration
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const tableId = searchParams.get('tableId');
    const isDemo = searchParams.get('demo') === 'true' || searchParams.get('mode') === 'demo';

    if (!sessionId && !tableId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing sessionId or tableId parameter'
      }, { 
        status: 400,
        headers: getCorsHeaders(req),
      });
    }

    // Demo mode: return demo session data
    // Handle both demo_ (underscore) and demo- (hyphen) patterns
    const isDemoSession = isDemo || 
                          (sessionId && (sessionId.startsWith('demo_') || sessionId.startsWith('demo-')));
    
    if (isDemoSession) {
      const demoSession = {
        id: sessionId || 'demo_session_001',
        tableId: tableId || 'T-001',
        status: 'PAID_CONFIRMED',
        state: 'PAID_CONFIRMED',
        startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        duration: 60,
        sessionDuration: 60 * 60, // 60 minutes in seconds
        timeRemaining: 55,
        items: [
          {
            name: 'Blue Mist + Mint Fresh',
            quantity: 1,
            price: 3500
          }
        ],
        totalAmount: 3500,
        staffAssigned: {
          foh: null,
          boh: null
        },
        flavorMix: ['Blue Mist', 'Mint Fresh'],
        success: true,
      };

      return NextResponse.json({
        ok: true,
        ...demoSession,
        session: demoSession,
      }, {
        headers: getCorsHeaders(req),
      });
    }

    // Query real database session
    let session: any;
    try {
      session = await prisma.session.findFirst({
        where: {
          OR: [
            sessionId ? { id: sessionId } : {},
            sessionId ? { externalRef: sessionId } : {},
            tableId ? { tableId: tableId, state: { in: [SessionState.ACTIVE, SessionState.PENDING, SessionState.PAUSED] } } : {},
          ].filter(condition => Object.keys(condition).length > 0),
        },
        select: {
          id: true,
          externalRef: true,
          tableId: true,
          customerRef: true,
          customerPhone: true,
          flavor: true,
          flavorMix: true,
          state: true,
          priceCents: true,
          paymentStatus: true,
          assignedBOHId: true,
          assignedFOHId: true,
          startedAt: true,
          createdAt: true,
          durationSecs: true,
          timerDuration: true,
          timerStartedAt: true,
          timerStatus: true,
        },
      });
    } catch (dbError: any) {
      console.error('[Session Status API] Database query error:', dbError);
      // Fallback to minimal query
      try {
        session = await prisma.session.findFirst({
          where: {
            OR: [
              sessionId ? { id: sessionId } : {},
              sessionId ? { externalRef: sessionId } : {},
            ].filter(condition => Object.keys(condition).length > 0),
          },
          select: {
            id: true,
            tableId: true,
            state: true,
            priceCents: true,
            createdAt: true,
          },
        });
      } catch (fallbackError) {
        console.error('[Session Status API] Fallback query failed:', fallbackError);
        throw fallbackError;
      }
    }

    if (!session) {
      return NextResponse.json({
        ok: false,
        error: 'Session not found'
      }, { 
        status: 404,
        headers: getCorsHeaders(req),
      });
    }

    // Convert to FireSession format
    const fireSession = convertPrismaSessionToFireSession(session);

    // Calculate time remaining
    let timeRemaining = 0;
    const durationMinutes = session.timerDuration || session.durationSecs ? Math.floor((session.timerDuration || session.durationSecs || 3600) / 60) : 60;
    
    if (session.timerStartedAt && session.timerDuration) {
      const startTime = new Date(session.timerStartedAt).getTime();
      const currentTime = Date.now();
      const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
      timeRemaining = Math.max(0, durationMinutes - elapsedMinutes);
    } else if (session.startedAt && session.durationSecs) {
      const startTime = new Date(session.startedAt).getTime();
      const currentTime = Date.now();
      const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60));
      timeRemaining = Math.max(0, durationMinutes - elapsedMinutes);
    } else {
      timeRemaining = durationMinutes;
    }

    // Parse flavor mix
    let flavorMixArray: string[] = [];
    if (session.flavorMix) {
      try {
        const parsed = JSON.parse(session.flavorMix);
        flavorMixArray = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        flavorMixArray = session.flavor ? [session.flavor] : ['Custom Mix'];
      }
    } else if (session.flavor) {
      flavorMixArray = [session.flavor];
    }

    // Format session data for guest tracker
    const sessionData = {
      id: session.id,
      tableId: session.tableId,
      status: fireSession.status,
      state: session.state,
      startedAt: session.startedAt ? new Date(session.startedAt).toISOString() : session.createdAt ? new Date(session.createdAt).toISOString() : new Date().toISOString(),
      createdAt: session.createdAt ? new Date(session.createdAt).toISOString() : new Date().toISOString(),
      duration: durationMinutes,
      sessionDuration: session.durationSecs || session.timerDuration ? (session.durationSecs || session.timerDuration) : 3600,
      timeRemaining,
      items: [
        {
          name: flavorMixArray.length > 0 ? flavorMixArray.join(' + ') : 'Hookah Session',
          quantity: 1,
          price: session.priceCents || 0
        }
      ],
      totalAmount: session.priceCents || 0,
      staffAssigned: {
        foh: session.assignedFOHId || null,
        boh: session.assignedBOHId || null
      },
      flavorMix: flavorMixArray,
      success: true,
    };

    return NextResponse.json({
      ok: true,
      ...sessionData,
      session: sessionData, // Also include as 'session' for backward compatibility
    }, {
      headers: getCorsHeaders(req),
    });
  } catch (error: any) {
    console.error("[Session Status API] Error:", error);
    return NextResponse.json(
      { 
        ok: false,
        error: error.message || "Internal server error" 
      },
      { 
        status: 500,
        headers: getCorsHeaders(req),
      }
    );
  }
}
