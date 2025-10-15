import { NextRequest, NextResponse } from 'next/server';
import { 
  FireSession, 
  SessionStatus, 
  SessionAction, 
  UserRole,
  STATUS_TO_STAGE 
} from '../../../types/enhancedSession';
import { 
  canPerformAction, 
  isValidTransition, 
  nextStateWithTrust,
  calculateRemainingTime 
} from '../../../lib/sessionStateMachine';

// Enhanced session storage with state machine integration
let sessions: FireSession[] = [
  // Sample sessions for testing
  {
    id: 'session_001',
    tableId: 'T-001',
    customerName: 'Alex Johnson',
    customerPhone: '+1 (555) 123-4567',
    flavor: 'Blue Mist + Mint',
    amount: 3500, // in cents
    status: 'ACTIVE',
    currentStage: 'CUSTOMER',
    assignedStaff: {
      boh: 'Mike Rodriguez',
      foh: 'Sarah Chen'
    },
    createdAt: Date.now() - 3600000, // 1 hour ago
    updatedAt: Date.now(),
    sessionStartTime: Date.now() - 3600000,
    sessionDuration: 45 * 60, // 45 minutes in seconds
    coalStatus: 'active',
    refillStatus: 'none',
    notes: 'Customer prefers mild flavors',
    edgeCase: null,
    sessionTimer: {
      remaining: calculateRemainingTime({
        sessionStartTime: Date.now() - 3600000,
        sessionTimer: {
          total: 45 * 60,
          isActive: true,
          startedAt: Date.now() - 3600000
        }
      } as FireSession),
      total: 45 * 60,
      isActive: true,
      startedAt: Date.now() - 3600000
    },
    bohState: 'PICKED_UP',
    guestTimerDisplay: true
  },
  {
    id: 'session_002',
    tableId: 'T-003',
    customerName: 'Maria Garcia',
    customerPhone: '+1 (555) 234-5678',
    flavor: 'Strawberry + Mint + Lime',
    amount: 2800, // in cents
    status: 'PREP_IN_PROGRESS',
    currentStage: 'BOH',
    assignedStaff: {
      boh: 'David Wilson',
      foh: 'Emily Davis'
    },
    createdAt: Date.now() - 1800000, // 30 minutes ago
    updatedAt: Date.now(),
    sessionDuration: 60 * 60, // 60 minutes in seconds
    coalStatus: 'active',
    refillStatus: 'none',
    notes: 'First-time customer, prefers mild flavors, table near window',
    edgeCase: null,
    bohState: 'PREPARING',
    guestTimerDisplay: false
  },
  {
    id: 'session_003',
    tableId: 'T-005',
    customerName: 'Ahmed Hassan',
    customerPhone: '+1 (555) 345-6789',
    flavor: 'Double Apple + Cardamom',
    amount: 4200, // in cents
    status: 'READY_FOR_DELIVERY',
    currentStage: 'BOH',
    assignedStaff: {
      boh: 'Mike Rodriguez',
      foh: 'James Brown'
    },
    createdAt: Date.now() - 900000, // 15 minutes ago
    updatedAt: Date.now(),
    sessionDuration: 90 * 60, // 90 minutes in seconds
    coalStatus: 'active',
    refillStatus: 'none',
    notes: 'Regular customer, prefers strong flavors',
    edgeCase: null,
    bohState: 'READY_FOR_PICKUP',
    guestTimerDisplay: false
  },
  {
    id: 'session_004',
    tableId: 'T-007',
    customerName: 'Jennifer Lee',
    customerPhone: '+1 (555) 456-7890',
    flavor: 'Watermelon + Mint',
    amount: 3200, // in cents
    status: 'CLOSED',
    currentStage: 'FOH',
    assignedStaff: {
      boh: 'David Wilson',
      foh: 'Sarah Chen'
    },
    createdAt: Date.now() - 7200000, // 2 hours ago
    updatedAt: Date.now() - 3600000, // 1 hour ago
    sessionStartTime: Date.now() - 7200000,
    sessionDuration: 60 * 60, // 60 minutes in seconds
    coalStatus: 'burnt_out',
    refillStatus: 'none',
    notes: 'Completed session successfully',
    edgeCase: null,
    bohState: 'PICKED_UP',
    guestTimerDisplay: false
  },
  {
    id: 'session_005',
    tableId: 'T-009',
    customerName: 'Robert Kim',
    customerPhone: '+1 (555) 567-8901',
    flavor: 'Rose + Lavender',
    amount: 4500, // in cents
    status: 'STAFF_HOLD',
    currentStage: 'BOH',
    assignedStaff: {
      boh: 'Mike Rodriguez',
      foh: 'Emily Davis'
    },
    createdAt: Date.now() - 2700000, // 45 minutes ago
    updatedAt: Date.now(),
    sessionStartTime: Date.now() - 2700000,
    sessionDuration: 90 * 60, // 90 minutes in seconds
    coalStatus: 'needs_refill',
    refillStatus: 'none',
    notes: 'Customer stepped out for phone call, will return in 10 minutes',
    edgeCase: 'Customer stepped out',
    bohState: 'PREPARING',
    guestTimerDisplay: true,
    sessionTimer: {
      remaining: calculateRemainingTime({
        sessionStartTime: Date.now() - 2700000,
        sessionTimer: {
          total: 90 * 60,
          isActive: false,
          startedAt: Date.now() - 2700000,
          pausedAt: Date.now() - 300000 // paused 5 minutes ago
        }
      } as FireSession),
      total: 90 * 60,
      isActive: false,
      startedAt: Date.now() - 2700000,
      pausedAt: Date.now() - 300000
    }
  },
  {
    id: 'session_006',
    tableId: 'T-011',
    customerName: 'Lisa Wang',
    customerPhone: '+1 (555) 678-9012',
    flavor: 'Double Apple',
    amount: 0, // payment failed
    status: 'FAILED_PAYMENT',
    currentStage: 'CUSTOMER',
    assignedStaff: {
      boh: 'David Wilson',
      foh: 'James Brown'
    },
    createdAt: Date.now() - 600000, // 10 minutes ago
    updatedAt: Date.now(),
    sessionDuration: 60 * 60, // 60 minutes in seconds
    coalStatus: 'burnt_out',
    refillStatus: 'none',
    notes: 'Payment declined - card expired, customer needs to update payment method',
    edgeCase: 'Payment failed',
    bohState: 'PREPARING',
    guestTimerDisplay: false
  }
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || searchParams.get('id');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const role = searchParams.get('role') as UserRole;

    if (sessionId) {
      const session = sessions.find(s => s.id === sessionId || s.tableId === sessionId);
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, session });
    }

    // Filter by status if specified
    let filteredSessions = sessions;
    if (status) {
      filteredSessions = sessions.filter(s => s.status === status);
    }

    // Filter by stage if specified
    if (stage) {
      filteredSessions = filteredSessions.filter(s => s.currentStage === stage);
    }

    // Filter by role permissions if specified
    if (role) {
      filteredSessions = filteredSessions.filter(session => {
        // Show sessions that the role can interact with
        return session.currentStage === role || 
               session.currentStage === 'CUSTOMER' || 
               role === 'MANAGER' || 
               role === 'ADMIN';
      });
    }

    // Return filtered sessions with enhanced data
    return NextResponse.json({ 
      success: true, 
      sessions: filteredSessions,
      total: filteredSessions.length,
      stages: {
        BOH: filteredSessions.filter(s => s.currentStage === 'BOH').length,
        FOH: filteredSessions.filter(s => s.currentStage === 'FOH').length,
        CUSTOMER: filteredSessions.filter(s => s.currentStage === 'CUSTOMER').length
      }
    });

  } catch (error) {
    console.error('Error retrieving sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      tableId,
      customerName,
      customerPhone,
      flavor,
      amount,
      assignedStaff,
      notes,
      sessionDuration = 45 * 60 // Default 45 minutes
    } = body;

    // Validate required fields
    if (!tableId || !customerName || !flavor) {
      return NextResponse.json({ 
        error: 'Missing required fields: tableId, customerName, and flavor are required' 
      }, { status: 400 });
    }

    // Check if session already exists for this table
    const existingSession = sessions.find(s => s.tableId === tableId && s.status !== 'CLOSED');
    if (existingSession) {
      return NextResponse.json({ 
        error: 'Table already has an active session',
        existingSession
      }, { status: 409 });
    }

    // Create new session with enhanced state machine
    const session: FireSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tableId,
      customerName,
      customerPhone: customerPhone || '',
      flavor,
      amount: amount || 3000, // Default $30.00 in cents
      status: 'NEW',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: assignedStaff?.boh || '',
        foh: assignedStaff?.foh || ''
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
      sessionDuration,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: notes || '',
      edgeCase: null,
      bohState: 'PREPARING',
      guestTimerDisplay: false
    };

    sessions.push(session);

    return NextResponse.json({ 
      success: true, 
      session,
      message: 'Session created successfully',
      nextActions: ['CLAIM_PREP', 'PUT_ON_HOLD'],
      businessLogic: 'New session created - BOH can claim prep or put on hold'
    });

  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// New PATCH endpoint for session actions
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      sessionId, 
      action, 
      userRole, 
      operatorId,
      notes,
      edgeCase 
    } = body;

    // Validate required fields
    if (!sessionId || !action || !userRole) {
      return NextResponse.json({ 
        error: 'Missing required fields: sessionId, action, and userRole are required' 
      }, { status: 400 });
    }

    // Find the session
    const sessionIndex = sessions.findIndex(s => s.id === sessionId || s.tableId === sessionId);
    if (sessionIndex === -1) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const currentSession = sessions[sessionIndex];

    try {
      // Use the state machine to transition the session
      const updatedSession = nextStateWithTrust(
        currentSession,
        { 
          type: action as SessionAction, 
          operatorId: operatorId || 'system',
          timestamp: Date.now()
        },
        userRole as UserRole
      );

      // Update additional fields if provided
      if (notes !== undefined) {
        updatedSession.notes = notes;
      }
      if (edgeCase !== undefined) {
        updatedSession.edgeCase = edgeCase;
      }

      // Update the session in storage
      sessions[sessionIndex] = updatedSession;

      return NextResponse.json({ 
        success: true, 
        session: updatedSession,
        message: `Session ${action} successful`,
        businessLogic: `Session transitioned from ${currentSession.status} to ${updatedSession.status}`,
        nextActions: getAvailableActions(updatedSession),
        stage: updatedSession.currentStage
      });

    } catch (stateMachineError) {
      return NextResponse.json({ 
        error: 'State transition failed',
        details: stateMachineError instanceof Error ? stateMachineError.message : 'Unknown error',
        currentStatus: currentSession.status,
        requestedAction: action,
        userRole
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get available actions for a session
function getAvailableActions(session: FireSession): SessionAction[] {
  const actions: SessionAction[] = [];
  
  // Add actions based on current status
  switch (session.status) {
    case 'NEW':
      actions.push('CLAIM_PREP', 'PUT_ON_HOLD');
      break;
    case 'PREP_IN_PROGRESS':
      actions.push('HEAT_UP', 'PUT_ON_HOLD', 'REQUEST_REMAKE');
      break;
    case 'HEAT_UP':
      actions.push('READY_FOR_DELIVERY', 'PUT_ON_HOLD');
      break;
    case 'READY_FOR_DELIVERY':
      actions.push('DELIVER_NOW', 'PUT_ON_HOLD');
      break;
    case 'OUT_FOR_DELIVERY':
      actions.push('MARK_DELIVERED', 'PUT_ON_HOLD');
      break;
    case 'DELIVERED':
      actions.push('START_ACTIVE', 'PUT_ON_HOLD');
      break;
    case 'ACTIVE':
      actions.push('PAUSE_SESSION', 'REQUEST_REFILL', 'CLOSE_SESSION');
      break;
    case 'STAFF_HOLD':
      actions.push('RESOLVE_HOLD', 'REQUEST_REMAKE');
      break;
    case 'CLOSE_PENDING':
      actions.push('CLOSE_SESSION', 'START_ACTIVE');
      break;
    case 'REMAKE':
      actions.push('CLAIM_PREP');
      break;
    case 'REFUND_REQUESTED':
      actions.push('PROCESS_REFUND');
      break;
    case 'FAILED_PAYMENT':
      actions.push('VOID_SESSION');
      break;
  }

  return actions;
}