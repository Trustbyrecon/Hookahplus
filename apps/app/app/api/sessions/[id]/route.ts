import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { convertPrismaSessionToFireSession } from '../../../../lib/session-utils-prisma';

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
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;
    
    // Check for demo mode from query params or session ID pattern
    const { searchParams } = new URL(request.url);
    const isDemo = searchParams.get('mode') === 'demo' || 
                   searchParams.get('demo') === 'true' ||
                   sessionId.startsWith('demo-') ||
                   sessionId.startsWith('demo_');

    // Demo mode: return demo session data
    if (isDemo) {
      // Match demo session ID from in-memory data
      const demoSession = {
        id: sessionId,
        tableId: 'T-005',
        customerRef: 'Sarah & Friends',
        customerPhone: '+1 (555) 234-5678',
        flavor: 'Blue Mist + Mint Fresh',
        flavorMix: ['Blue Mist', 'Mint Fresh'],
        priceCents: 3500,
        state: 'PAID_CONFIRMED',
        paymentStatus: 'succeeded',
        paymentIntent: 'demo_payment_intent_' + Date.now(),
        assignedBOHId: null,
        assignedFOHId: null,
        startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        durationSecs: 60 * 60, // 60 minutes
        edgeCase: null,
        edgeNote: 'Demo session - ready to test night after night flow',
        source: 'demo',
        loungeId: 'demo-lounge',
        tenantId: null,
      };

      const fireSession = convertPrismaSessionToFireSession(demoSession);
      return NextResponse.json({
        success: true,
        ...fireSession,
        table_id: demoSession.tableId,
        customer_name: demoSession.customerRef,
        price_cents: demoSession.priceCents,
        status: fireSession.status,
      }, {
        headers: getCorsHeaders(request),
      });
    }

    // Find session by ID or externalRef (Stripe checkout session ID)
    // Use select to avoid querying columns that don't exist
    let session: any;
    try {
      session = await prisma.session.findFirst({
        where: {
          OR: [
            { id: sessionId },
            { externalRef: sessionId },
          ],
        },
        select: {
          id: true,
          externalRef: true,
          source: true,
          trustSignature: true,
          tableId: true,
          customerRef: true,
          customerPhone: true,
          flavor: true,
          flavorMix: true,
          loungeId: true,
          priceCents: true,
          state: true,
          edgeCase: true,
          edgeNote: true,
          assignedBOHId: true,
          assignedFOHId: true,
          startedAt: true,
          endedAt: true,
          durationSecs: true,
          paymentIntent: true,
          paymentStatus: true,
          orderItems: true,
          posMode: true,
          version: true,
          createdAt: true,
          updatedAt: true,
          timerDuration: true,
          timerStartedAt: true,
          timerPausedAt: true,
          timerPausedDuration: true,
          timerStatus: true,
          zone: true,
          fohUserId: true,
          specialRequests: true,
          tableNotes: true,
          qrCodeUrl: true,
          sessionStateV1: true,
          paused: true,
          tenantId: true,
        },
      });
    } catch (dbError: any) {
      // If query fails due to missing columns, try with minimal select
      if (dbError?.code === 'P2022' || dbError?.message?.includes('does not exist')) {
        console.warn('[Session API] Column missing, trying minimal query:', dbError?.message);
        try {
          session = await prisma.session.findFirst({
            where: {
              OR: [
                { id: sessionId },
                { externalRef: sessionId },
              ],
            },
            select: {
              id: true,
              externalRef: true,
              source: true,
              trustSignature: true,
              tableId: true,
              customerRef: true,
              customerPhone: true,
              flavor: true,
              flavorMix: true,
              loungeId: true,
              priceCents: true,
              state: true,
              paymentIntent: true,
              paymentStatus: true,
              createdAt: true,
              updatedAt: true,
              tenantId: true,
            },
          });
        } catch (fallbackError: any) {
          console.error('[Session API] Fallback query also failed:', fallbackError?.message);
          throw fallbackError;
        }
      } else {
        throw dbError;
      }
    }

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { 
          status: 404,
          headers: getCorsHeaders(request),
        }
      );
    }

      // Use the same conversion function as the main sessions route
      const fireSession = convertPrismaSessionToFireSession(session);

      // SECURITY: Ensure notes are never included in customer-facing responses
      // The session query already excludes notes relation, but we double-check here
      const { notes, ...sessionWithoutNotes } = fireSession as any;

      return NextResponse.json({
        success: true,
        ...sessionWithoutNotes, // fireSession already includes 'id', but excludes notes
        // Also include raw fields for backward compatibility
        table_id: session.tableId,
        customer_name: session.customerRef,
        price_cents: session.priceCents,
        status: fireSession.status,
      }, {
        headers: getCorsHeaders(request),
      });
  } catch (error: any) {
    console.error('[Session API] Error fetching session:', error?.message || error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch session',
        details: error?.message || 'Unknown error',
        code: error?.code
      },
      { 
        status: 500,
        headers: getCorsHeaders(request),
      }
    );
  }
}

