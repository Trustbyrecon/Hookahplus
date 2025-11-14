import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import { convertPrismaSessionToFireSession } from '../../../../lib/session-utils-prisma';

// CORS headers helper - accepts request to get origin
function getCorsHeaders(req?: NextRequest) {
  // Allow requests from site build, app build, or guest build
  const origin = req?.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3001', // Guest build
  ];
  
  // If origin matches allowed list, use it; otherwise use default
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];
    
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

    // Find session by ID or externalRef (Stripe checkout session ID)
    const session = await prisma.session.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { externalRef: sessionId },
        ],
      },
    });

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

      return NextResponse.json({
        success: true,
        ...fireSession, // fireSession already includes 'id'
        // Also include raw fields for backward compatibility
        table_id: session.tableId,
        customer_name: session.customerRef,
        price_cents: session.priceCents,
        status: fireSession.status,
      }, {
        headers: getCorsHeaders(request),
      });
  } catch (error) {
    console.error('[Session API] Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { 
        status: 500,
        headers: getCorsHeaders(request),
      }
    );
  }
}

