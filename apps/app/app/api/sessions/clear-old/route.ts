import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

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
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(req),
  });
}

/**
 * DELETE /api/sessions/clear-old
 * 
 * Clears old sessions for First Light testing.
 * Only works when FIRST_LIGHT_MODE=true
 * 
 * Query params:
 * - keepRecent: number (hours) - Keep sessions created in the last N hours (default: 1)
 */
export async function DELETE(req: NextRequest) {
  try {
    // Only allow in First Light mode
    if (process.env.FIRST_LIGHT_MODE !== 'true') {
      return NextResponse.json(
        { error: 'This endpoint is only available in First Light mode' },
        { status: 403, headers: getCorsHeaders(req) }
      );
    }

    const { searchParams } = new URL(req.url);
    const keepRecentHours = parseInt(searchParams.get('keepRecent') || '1', 10);
    const cutoffDate = new Date();
    cutoffDate.setHours(cutoffDate.getHours() - keepRecentHours);

    console.log(`[Clear Old Sessions] Deleting sessions older than ${cutoffDate.toISOString()}`);

    // Delete old sessions
    const deleteResult = await prisma.session.deleteMany({
      where: {
        createdAt: {
          lt: cutoffDate,
        },
      },
    });

    // Also clean up related ReflexEvents
    try {
      await prisma.reflexEvent.deleteMany({
        where: {
          createdAt: {
            lt: cutoffDate,
          },
        },
      });
    } catch (reflexError) {
      console.warn('[Clear Old Sessions] Failed to delete related ReflexEvents:', reflexError);
    }

    console.log(`[Clear Old Sessions] ✅ Deleted ${deleteResult.count} old sessions`);

    return NextResponse.json({
      success: true,
      deleted: deleteResult.count,
      cutoffDate: cutoffDate.toISOString(),
      message: `Cleared ${deleteResult.count} old sessions. Kept sessions from the last ${keepRecentHours} hour(s).`,
    }, {
      headers: getCorsHeaders(req),
    });
  } catch (error: any) {
    console.error('[Clear Old Sessions] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to clear old sessions',
        details: error?.message || 'Unknown error',
      },
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
}

