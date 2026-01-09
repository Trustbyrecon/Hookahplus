import { NextRequest, NextResponse } from 'next/server';
import { createSetupSession } from '../../../../lib/launchpad/session-manager';
import { generateLoungeOpsConfig } from '../../../../lib/launchpad/config-generator';
import { formatManyChatAPIResponse, formatManyChatErrorResponse } from '../../../../lib/launchpad/manychat-response-formatter';

/**
 * Get CORS headers for ManyChat requests
 */
function getCorsHeaders(req: NextRequest) {
  const origin = req.headers.get('origin');
  
  // Allow ManyChat domains and your app domains
  const allowedOrigins = [
    'https://manychat.com',
    'https://app.manychat.com',
    'https://hookahplus.net',
    'https://app.hookahplus.net',
    process.env.NEXT_PUBLIC_APP_URL,
  ].filter(Boolean);
  
  // In development, allow any origin; in production, check against allowed list
  const allowedOrigin = 
    process.env.NODE_ENV === 'development' 
      ? origin || '*'
      : origin && allowedOrigins.some(allowed => origin.includes(allowed))
        ? origin
        : allowedOrigins[0] || '*';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Handle CORS preflight requests
 * ManyChat sends OPTIONS request before POST
 */
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(req),
  });
}

/**
 * POST /api/launchpad/manychat-setup
 * 
 * ManyChat External Request endpoint for LaunchPad Concierge
 * Receives ManyChat data, creates SetupSession, returns completion link
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract ManyChat data
    const {
      subscriber_id,
      instagram_username,
      custom_fields = {},
    } = body;

    // Validate required fields
    if (!custom_fields.lounge_name) {
      return NextResponse.json(
        {
          success: false,
          error: 'lounge_name is required',
        },
        { 
          status: 400,
          headers: getCorsHeaders(req),
        }
      );
    }

    // Prepare prefill data from ManyChat
    // Normalize session_type values to match expected format
    let normalizedSessionType = custom_fields.session_type;
    if (custom_fields.session_type?.includes('Flat fee')) {
      normalizedSessionType = 'Flat fee';
    } else if (custom_fields.session_type?.includes('Timed')) {
      normalizedSessionType = 'Timed';
    }

    const prefillData = {
      subscriber_id,
      instagram_username,
      lounge_name: custom_fields.lounge_name,
      city: custom_fields.city,
      seats_tables: custom_fields.seats_tables || custom_fields.tables_count,
      pos_used: custom_fields.pos_used || custom_fields.pos_type,
      session_type: normalizedSessionType,
      price_range: custom_fields.price_range,
      top_5_flavors: custom_fields.top_5_flavors,
    };

    // Create SetupSession with ManyChat source
    const session = await createSetupSession('manychat', prefillData);

    // Generate preliminary config (if we have enough data)
    let preliminaryConfig = null;
    try {
      const { loadSetupSession } = await import('../../../../lib/launchpad/session-manager');
      const progress = await loadSetupSession(session.token);
      if (progress && progress.data.step1) {
        preliminaryConfig = generateLoungeOpsConfig(progress);
      }
    } catch (error) {
      // Config generation is optional at this stage
      console.warn('[ManyChat Setup] Could not generate preliminary config:', error);
    }

    // Build completion link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://hookahplus.net';
    const completionLink = `${baseUrl}/launchpad?token=${session.token}&source=manychat`;

    // Build preview asset links (will be generated at Go Live)
    // IMPORTANT: All values must be STRINGS (URLs) for ManyChat JSONPath parsing
    const previewAssets = {
      qrCodes: `${baseUrl}/api/launchpad/preview/qr?token=${session.token}`, // String URL
      posGuide: `${baseUrl}/api/launchpad/preview/pos-guide?token=${session.token}`, // String URL
      checklist: `${baseUrl}/api/launchpad/preview/checklist?token=${session.token}`, // String URL
    };

    // Ensure all values are strings (sanity check)
    const completionLinkStr = String(completionLink);
    const qrCodesStr = String(previewAssets.qrCodes);
    const posGuideStr = String(previewAssets.posGuide);
    const checklistStr = String(previewAssets.checklist);

    // Format response for ManyChat
    const formattedResponse = formatManyChatAPIResponse(
      session.token,
      completionLink,
      previewAssets,
      prefillData.lounge_name
    );

    return NextResponse.json({
      success: true,
      setupSessionToken: session.token,
      // Primary fields for ManyChat JSONPath: $.completionLink, $.previewAssets.*
      completionLink: completionLinkStr, // String URL - required for $.completionLink
      previewAssets: {
        qrCodes: qrCodesStr, // String URL - required for $.previewAssets.qrCodes
        posGuide: posGuideStr, // String URL - required for $.previewAssets.posGuide
        checklist: checklistStr, // String URL - required for $.previewAssets.checklist
      },
      // Top-level aliases for easier ManyChat JSONPath parsing (alternative mapping)
      launchpad_completion_link: completionLinkStr,
      launchpad_qr_codes: qrCodesStr,
      launchpad_pos_guide: posGuideStr,
      launchpad_checklist: checklistStr,
      preliminaryConfig,
      message: formattedResponse.message, // Formatted for ManyChat DM
      // Also include raw data for ManyChat to parse if needed
      raw: {
        token: session.token,
        completionLink: completionLinkStr,
        previewAssets: {
          qrCodes: qrCodesStr,
          posGuide: posGuideStr,
          checklist: checklistStr,
        },
      },
    }, {
      headers: getCorsHeaders(req),
    });
  } catch (error: any) {
    console.error('[ManyChat Setup] Error:', error);
    const errorMessage = formatManyChatErrorResponse(
      'Failed to create setup session. Please try again.'
    );
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create setup session',
        message: errorMessage, // Formatted for ManyChat DM
        fallbackMessage: "Quick update: I couldn't generate your kit automatically. Reply 'LAUNCHPAD' again in 2 minutes, or type 'HELP' to get support.",
        details: error.message,
      },
      { 
        status: 500,
        headers: getCorsHeaders(req),
      }
    );
  }
}

