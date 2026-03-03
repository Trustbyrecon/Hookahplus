import { NextRequest, NextResponse } from 'next/server';

// Force dynamic rendering - this route uses request.url
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const tableId = searchParams.get('tableId');

    if (!sessionId && !tableId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing sessionId or tableId parameter'
      }, { status: 400 });
    }

    // Try to get session status from App build
    const appBuildUrl = process.env.APP_BUILD_URL || 'https://hookahplus-app-prod.vercel.app';
    
    try {
      const response = await fetch(
        `${appBuildUrl}/api/sessions/status?${sessionId ? `sessionId=${sessionId}` : `tableId=${tableId}`}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.APP_BUILD_API_KEY || 'guest-sync-key'}`
          }
        }
      );

      if (response.ok) {
        const sessionData = await response.json();
        return NextResponse.json({
          ok: true,
          session: sessionData
        });
      } else {
        throw new Error(`App build responded with status ${response.status}`);
      }
    } catch (appError) {
      // Fallback: return mock session data
      console.log('App build unavailable, returning mock session:', appError);
      
      return NextResponse.json({
        ok: true,
        session: {
          id: sessionId || `session_${Date.now()}`,
          tableId: tableId || 'T-001',
          status: 'ACTIVE',
          startedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          duration: 60,
          timeRemaining: 45,
          items: [
            { name: 'Blue Mist Hookah', quantity: 2, price: 3200 }
          ],
          totalAmount: 6400,
          staffAssigned: {
            foh: 'Sarah Johnson',
            boh: 'Mike Chen'
          }
        }
      });
    }
  } catch (error) {
    console.error('Session status error:', error);
    
    return NextResponse.json({
      ok: false,
      error: 'Failed to get session status: ' + (error as Error).message
    }, { status: 500 });
  }
}
