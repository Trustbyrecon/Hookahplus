import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint for site build to forward session actions to app build
 * Handles CORS, authentication, and error handling
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, action, userRole, operatorId, notes, edgeCase, edgeNote } = body;

    // Validate required fields
    if (!sessionId || !action || !userRole) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, action, and userRole are required' },
        { status: 400 }
      );
    }

    // Get app build URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002';
    
    console.log('[Site Build Proxy] Forwarding session action to app build:', {
      sessionId,
      action,
      userRole,
      appUrl: `${appUrl}/api/sessions`
    });

    // Forward request to app build API
    const appResponse = await fetch(`${appUrl}/api/sessions`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        action,
        userRole,
        operatorId,
        notes,
        edgeCase,
        edgeNote
      }),
    });

    // Get response text first (might not be JSON)
    const responseText = await appResponse.text();
    
    // Try to parse as JSON, fallback to text
    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch {
      responseData = { 
        success: appResponse.ok,
        message: responseText || `HTTP ${appResponse.status}`,
        rawResponse: responseText
      };
    }

    // Forward status code and response from app build
    return NextResponse.json(responseData, { 
      status: appResponse.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error) {
    console.error('[Site Build Proxy] Error forwarding request:', error);
    return NextResponse.json(
      {
        error: 'Proxy error',
        details: error instanceof Error ? error.message : 'Unknown error',
        hint: 'Check if app build is running and NEXT_PUBLIC_APP_URL is configured'
      },
      { status: 500 }
    );
  }
}

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

