import { NextRequest, NextResponse } from 'next/server';
import { createSetupSession, loadSetupSession, saveProgress } from '../../../../lib/launchpad/session-manager';
import { LaunchPadProgress } from '../../../../types/launchpad';

/**
 * POST /api/launchpad/session
 * Create a new anonymous setup session
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { source = 'web', prefillData } = body;

    const session = await createSetupSession(source, prefillData);

    return NextResponse.json({
      success: true,
      ...session,
    });
  } catch (error: any) {
    console.error('[LaunchPad Session] Error creating session:', error);
    
    // Check if it's a database migration issue
    const errorMessage = error.message || '';
    if (errorMessage.includes('migration required') || 
        errorMessage.includes('does not exist') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('table') ||
        error.code === 'P2001' ||
        error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: 'Database migration required',
          details: 'Please run: npx prisma migrate dev --name add_setup_session',
          migrationRequired: true,
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create setup session',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/launchpad/session?token=xxx
 * Load an existing setup session
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          error: 'Token is required',
        },
        { status: 400 }
      );
    }

    const progress = await loadSetupSession(token);

    if (!progress) {
      return NextResponse.json(
        {
          success: false,
          error: 'Session not found or expired',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      progress,
    });
  } catch (error: any) {
    console.error('[LaunchPad Session] Error loading session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load setup session',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

