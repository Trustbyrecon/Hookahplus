// app/api/refill/request/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getSession, putSession } from '@/lib/sessionState';

interface RefillRequest {
  id: string;
  sessionId: string;
  tableId: string;
  requestedAt: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  slaMinutes: number;
  assignedTo?: string;
  completedAt?: number;
  notes?: string;
}

// In-memory refill queue (in production, use Redis or database)
const refillQueue: RefillRequest[] = [];

export async function POST(request: NextRequest) {
  try {
    const { sessionId, tableId, notes } = await request.json();
    
    if (!sessionId || !tableId) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId, tableId' },
        { status: 400 }
      );
    }

    // Get current session
    const currentSession = getSession(sessionId);
    if (!currentSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Create refill request
    const refillRequest: RefillRequest = {
      id: `refill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      tableId,
      requestedAt: Date.now(),
      status: 'pending',
      slaMinutes: 5, // 5-minute SLA
      notes: notes || ''
    };

    // Add to queue
    refillQueue.push(refillRequest);

    // Update session with refill request
    const updatedSession = {
      ...currentSession,
      refillRequests: [
        ...(currentSession.refillRequests || []),
        {
          id: refillRequest.id,
          requestedAt: refillRequest.requestedAt,
          status: refillRequest.status,
          slaMinutes: refillRequest.slaMinutes
        }
      ]
    };
    
    putSession(updatedSession);

    // Log for analytics
    console.log(`Refill request created: ${refillRequest.id} for table ${tableId}`);

    return NextResponse.json({
      success: true,
      refillRequest: {
        id: refillRequest.id,
        tableId,
        slaMinutes: refillRequest.slaMinutes,
        estimatedCompletion: new Date(Date.now() + (refillRequest.slaMinutes * 60 * 1000)).toISOString()
      }
    });

  } catch (error: any) {
    console.error('Refill request error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create refill request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';
    const assignedTo = searchParams.get('assignedTo');

    let filteredQueue = refillQueue.filter(req => req.status === status);
    
    if (assignedTo) {
      filteredQueue = filteredQueue.filter(req => req.assignedTo === assignedTo);
    }

    // Calculate SLA status
    const now = Date.now();
    const queueWithSla = filteredQueue.map(req => ({
      ...req,
      slaStatus: now - req.requestedAt > (req.slaMinutes * 60 * 1000) ? 'overdue' : 'on_time',
      timeRemaining: Math.max(0, (req.slaMinutes * 60 * 1000) - (now - req.requestedAt))
    }));

    return NextResponse.json({
      success: true,
      refillRequests: queueWithSla,
      total: queueWithSla.length,
      overdue: queueWithSla.filter(req => req.slaStatus === 'overdue').length
    });

  } catch (error: any) {
    console.error('Get refill requests error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get refill requests',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { refillId, status, assignedTo, notes } = await request.json();
    
    if (!refillId || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: refillId, status' },
        { status: 400 }
      );
    }

    const refillIndex = refillQueue.findIndex(req => req.id === refillId);
    if (refillIndex === -1) {
      return NextResponse.json(
        { error: 'Refill request not found' },
        { status: 404 }
      );
    }

    // Update refill request
    const updatedRefill = {
      ...refillQueue[refillIndex],
      status,
      assignedTo: assignedTo || refillQueue[refillIndex].assignedTo,
      notes: notes || refillQueue[refillIndex].notes,
      completedAt: status === 'completed' ? Date.now() : refillQueue[refillIndex].completedAt
    };

    refillQueue[refillIndex] = updatedRefill;

    // Update session if completed
    if (status === 'completed') {
      const session = getSession(updatedRefill.sessionId);
      if (session) {
        const updatedSession = {
          ...session,
          refillRequests: session.refillRequests?.map(req => 
            req.id === refillId 
              ? { ...req, status: 'completed', completedAt: Date.now() }
              : req
          ) || []
        };
        putSession(updatedSession);
      }
    }

    return NextResponse.json({
      success: true,
      refillRequest: updatedRefill
    });

  } catch (error: any) {
    console.error('Update refill request error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update refill request',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
