import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route to handle demo requests from guest build
 * Routes to site build's demo-requests API
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, data } = body;

    if (!action) {
      return NextResponse.json(
        { error: 'Missing action parameter' },
        { status: 400 }
      );
    }

    // Get site build URL from env or default
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hookahplus.net';
    
    // Call site build API
    const apiUrl = `${siteUrl}/api/demo-requests`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, data }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`[Guest Demo Requests API] Site build API error: ${response.status}`, errorData);
      return NextResponse.json(
        { 
          success: false,
          error: errorData.error || 'Failed to process demo request', 
          details: errorData.details || `Site build API returned ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data_result = await response.json();
    
    return NextResponse.json(data_result, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Guest Demo Requests API] Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process demo request', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
