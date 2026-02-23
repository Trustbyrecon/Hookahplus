import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route to request refills via the app build API
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params;
    const body = await request.json();

    // Get app build URL from env or default
    const appBuildUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    
    // Call app build API
    const apiUrl = `${appBuildUrl}/api/sessions/${sessionId}/refill`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Guest Refill API] App build API error: ${response.status}`, errorData);
      return NextResponse.json(
        { 
          success: false,
          error: errorData.error || 'Failed to request refill', 
          details: errorData.details || `App build API returned ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Guest Refill API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to request refill', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
