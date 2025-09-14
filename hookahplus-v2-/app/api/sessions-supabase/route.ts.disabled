// hookahplus-v2-/app/api/sessions-supabase/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { SupabaseSessionManager } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      tableId, 
      customerName, 
      customerPhone, 
      customerEmail,
      flavors, 
      totalAmount, 
      source = 'preorder',
      metadata = {},
      specialInstructions,
      estimatedPrepTime
    } = body;

    console.log('🔥 Creating session with Supabase:', {
      tableId,
      customerName,
      flavors,
      totalAmount,
      source
    });

    // Validate required fields
    if (!tableId || !customerName || !customerPhone || !flavors || !totalAmount) {
      return NextResponse.json(
        { error: 'Missing required fields: tableId, customerName, customerPhone, flavors, totalAmount' },
        { status: 400 }
      );
    }

    // Create session in Supabase
    const result = await SupabaseSessionManager.createSession({
      tableId,
      customerName,
      customerPhone,
      customerEmail,
      flavors: Array.isArray(flavors) ? flavors : [flavors],
      totalAmount,
      source,
      metadata,
      specialInstructions,
      estimatedPrepTime
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to create session' },
        { status: 500 }
      );
    }

    console.log('✅ Session created successfully:', result.session?.id);

    return NextResponse.json({ 
      success: true, 
      session: result.session,
      message: 'Session created successfully'
    });

  } catch (error: any) {
    console.error('❌ Session creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tableId = searchParams.get('tableId');
    const sessionId = searchParams.get('sessionId');

    let result;

    if (sessionId) {
      // Get specific session
      result = await SupabaseSessionManager.getSession(sessionId);
    } else if (tableId) {
      // Get sessions by table
      result = await SupabaseSessionManager.getSessionsByTable(tableId);
    } else {
      // Get all active sessions
      result = await SupabaseSessionManager.getActiveSessions();
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch sessions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      sessions: result.sessions || [result.session].filter(Boolean),
      count: result.sessions?.length || (result.session ? 1 : 0)
    });

  } catch (error: any) {
    console.error('❌ Session fetch error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, updates } = body;

    if (!sessionId || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, updates' },
        { status: 400 }
      );
    }

    console.log('🔄 Updating session:', sessionId, updates);

    const result = await SupabaseSessionManager.updateSessionState(sessionId, updates);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to update session' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Session updated successfully'
    });

  } catch (error: any) {
    console.error('❌ Session update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
