import { NextRequest, NextResponse } from 'next/server';

/**
 * Proxy endpoint for site build to forward session requests to app build
 * Handles CORS, authentication, and error handling
 * Supports GET, POST, and PATCH methods
 */

// Get app build URL - use production URL in production, localhost in dev
function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://app.hookahplus.net' 
      : 'http://localhost:3002');
}

// Forward request to app build with proper error handling
async function forwardRequest(method: string, req: NextRequest, body?: any) {
  try {
    const appUrl = getAppUrl();
    const url = new URL(req.url);
    const path = url.pathname.replace('/api/sessions/proxy', '/api/sessions');
    const targetUrl = `${appUrl}${path}${url.search}`;
    
    console.log(`[Site Build Proxy] Forwarding ${method} to app build:`, targetUrl);
    
    const appResponse = await fetch(targetUrl, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
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
        'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
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

// GET handler - fetch sessions
export async function GET(req: NextRequest) {
  return forwardRequest('GET', req);
}

// POST handler - create session
export async function POST(req: NextRequest) {
  const body = await req.json();
  return forwardRequest('POST', req, body);
}

// PATCH handler - update session
export async function PATCH(req: NextRequest) {
  const body = await req.json();
  return forwardRequest('PATCH', req, body);
}

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

