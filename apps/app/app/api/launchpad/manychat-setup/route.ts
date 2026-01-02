import { NextRequest, NextResponse } from 'next/server';
import { createSetupSession } from '../../../../lib/launchpad/session-manager';
import { generateLoungeOpsConfig } from '../../../../lib/launchpad/config-generator';
import { formatManyChatAPIResponse, formatManyChatErrorResponse } from '../../../../lib/launchpad/manychat-response-formatter';

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
        { status: 400 }
      );
    }

    // Prepare prefill data from ManyChat
    const prefillData = {
      subscriber_id,
      instagram_username,
      lounge_name: custom_fields.lounge_name,
      city: custom_fields.city,
      seats_tables: custom_fields.seats_tables || custom_fields.tables_count,
      pos_used: custom_fields.pos_used || custom_fields.pos_type,
      session_type: custom_fields.session_type,
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
    const previewAssets = {
      qrCodes: `${baseUrl}/api/launchpad/preview/qr?token=${session.token}`,
      posGuide: `${baseUrl}/api/launchpad/preview/pos-guide?token=${session.token}`,
      checklist: `${baseUrl}/api/launchpad/preview/checklist?token=${session.token}`,
    };

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
      completionLink,
      previewAssets,
      preliminaryConfig,
      message: formattedResponse.message, // Formatted for ManyChat DM
      // Also include raw data for ManyChat to parse if needed
      raw: {
        token: session.token,
        completionLink,
        previewAssets,
      },
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
        details: error.message,
      },
      { status: 500 }
    );
  }
}

