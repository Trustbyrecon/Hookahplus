import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy route to fetch sessions from the app build API
 * Supports querying by tableId, customerPhone, or sessionId
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');
    const customerPhone = searchParams.get('customerPhone');
    const sessionId = searchParams.get('sessionId');
    const status = searchParams.get('status');

    // Get app build URL from env or default
    const appBuildUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    
    // Build query params for app build API
    const params = new URLSearchParams();
    if (tableId) params.append('tableId', tableId);
    if (customerPhone) params.append('customerPhone', customerPhone);
    if (sessionId) params.append('sessionId', sessionId);
    if (status) params.append('status', status);

    // Call app build API
    const apiUrl = `${appBuildUrl}/api/sessions${params.toString() ? `?${params.toString()}` : ''}`;
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // In production, you might want to add authentication headers here
    });

    if (!response.ok) {
      console.error(`[Guest Sessions API] App build API error: ${response.status}`);
      return NextResponse.json(
        { error: 'Failed to fetch sessions', details: `App build API returned ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Return sessions in consistent format
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[Guest Sessions API] Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch sessions', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

