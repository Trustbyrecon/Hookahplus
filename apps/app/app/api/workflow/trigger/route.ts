import { NextRequest, NextResponse } from 'next/server';

// Mock workflow state storage (in production, this would be a database)
let workflowSessions: any[] = [];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, tableId, loungeId, campaign, workflowType, metadata } = body;

    // Validate required fields
    if (!sessionId || !tableId || !loungeId || !workflowType) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, tableId, loungeId, workflowType' },
        { status: 400 }
      );
    }

    // Create workflow session
    const workflowSession = {
      id: Date.now(),
      sessionId,
      tableId,
      loungeId,
      campaign: campaign || 'none',
      workflowType,
      status: 'active',
      currentState: 'new',
      states: {
        new: { status: 'completed', timestamp: new Date().toISOString() },
        paid_confirmed: { status: 'pending', timestamp: null },
        prep_in_progress: { status: 'pending', timestamp: null },
        ready_for_delivery: { status: 'pending', timestamp: null },
        out_for_delivery: { status: 'pending', timestamp: null },
        delivered: { status: 'pending', timestamp: null },
        close_pending: { status: 'pending', timestamp: null },
        closed: { status: 'pending', timestamp: null }
      },
      metadata: {
        ...metadata,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      },
      staffAlerts: [],
      notes: []
    };

    // Store workflow session
    workflowSessions.unshift(workflowSession);
    
    // Keep only last 100 sessions
    if (workflowSessions.length > 100) {
      workflowSessions = workflowSessions.slice(0, 100);
    }

    // In production, you would:
    // 1. Save to database
    // 2. Trigger real-time notifications to BOH/FOH staff
    // 3. Update dashboard displays
    // 4. Send push notifications to staff devices
    // 5. Log to monitoring system

    console.log('Workflow Session Created:', workflowSession);

    return NextResponse.json({
      success: true,
      workflowSession,
      message: 'Workflow triggered successfully'
    });

  } catch (error) {
    console.error('Error triggering workflow:', error);
    return NextResponse.json(
      { error: 'Failed to trigger workflow' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tableId = searchParams.get('tableId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');

    let filteredSessions = workflowSessions;

    // Filter by tableId if provided
    if (tableId) {
      filteredSessions = workflowSessions.filter(session => session.tableId === tableId);
    }

    // Filter by status if provided
    if (status) {
      filteredSessions = filteredSessions.filter(session => session.status === status);
    }

    // Limit results
    filteredSessions = filteredSessions.slice(0, limit);

    return NextResponse.json({
      success: true,
      sessions: filteredSessions,
      total: filteredSessions.length
    });

  } catch (error) {
    console.error('Error fetching workflow sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workflow sessions' },
      { status: 500 }
    );
  }
}
