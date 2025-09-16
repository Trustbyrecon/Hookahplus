// apps/web/app/api/sessions/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId, tableId, state, meta, timers } = body;

    console.log('📝 Creating session:', { sessionId, tableId, state, meta });

    // Create session data
    const session = {
      id: sessionId,
      table: tableId,
      state: state || 'PAID_CONFIRMED',
      meta: {
        customerId: meta?.customerId || 'Customer',
        phone: meta?.phone || '+1 (555) 123-4567',
        email: meta?.email || 'customer@hookahplus.com',
        flavors: meta?.flavors || ['Blue Mist'],
        selectedItems: meta?.selectedItems || [],
        totalAmount: meta?.totalAmount || 0,
        source: meta?.source || 'preorder',
        ...meta
      },
      timers: {
        createdAt: timers?.createdAt || Date.now(),
        paidAt: timers?.paidAt || Date.now(),
        ...timers
      }
    };

    // Store in session state (this would normally go to a database)
    // For now, we'll use a simple in-memory store
    if (typeof global !== 'undefined') {
      if (!global.sessionStore) {
        global.sessionStore = new Map();
      }
      global.sessionStore.set(sessionId, session);
    }

    console.log('✅ Session created and stored:', sessionId);

    return NextResponse.json({ 
      success: true, 
      session,
      message: 'Session created successfully'
    });

  } catch (error: any) {
    console.error('❌ Error creating session:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create session' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      // Get specific session
      if (typeof global !== 'undefined' && global.sessionStore) {
        const session = global.sessionStore.get(sessionId);
        if (session) {
          return NextResponse.json({ success: true, session });
        }
      }
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    } else {
      // Get all sessions
      if (typeof global !== 'undefined' && global.sessionStore) {
        const sessions = Array.from(global.sessionStore.values());
        return NextResponse.json({ success: true, sessions });
      }
      return NextResponse.json({ success: true, sessions: [] });
    }
  } catch (error: any) {
    console.error('❌ Error fetching sessions:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}