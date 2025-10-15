import { NextRequest, NextResponse } from 'next/server';
import { 
  SessionAction, 
  UserRole,
  FireSession 
} from '../../../../types/enhancedSession';
import { 
  canPerformAction, 
  isValidTransition, 
  nextStateWithTrust,
  ACTION_DESCRIPTIONS,
  STATE_DESCRIPTIONS
} from '../../../../lib/sessionStateMachine';

// In-memory storage for sessions (in production, this would be a database)
// This should be the same storage as the main sessions API
let sessions: FireSession[] = [];

// Initialize with sample data (in production, this would come from database)
if (sessions.length === 0) {
  sessions = [
    {
      id: 'session_001',
      tableId: 'T-001',
      customerName: 'Alex Johnson',
      customerPhone: '+1 (555) 123-4567',
      flavor: 'Blue Mist + Mint',
      amount: 3500,
      status: 'ACTIVE',
      currentStage: 'CUSTOMER',
      assignedStaff: {
        boh: 'Mike Rodriguez',
        foh: 'Sarah Chen'
      },
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now(),
      sessionStartTime: Date.now() - 3600000,
      sessionDuration: 45 * 60,
      coalStatus: 'active',
      refillStatus: 'none',
      notes: 'Customer prefers mild flavors',
      edgeCase: null,
      sessionTimer: {
        remaining: 15 * 60, // 15 minutes remaining
        total: 45 * 60,
        isActive: true,
        startedAt: Date.now() - 3600000
      },
      bohState: 'PICKED_UP',
      guestTimerDisplay: true
    }
  ];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      sessionId, 
      action, 
      userRole, 
      operatorId,
      notes,
      edgeCase,
      metadata 
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
      if (metadata) {
        // Add any additional metadata
        Object.assign(updatedSession, metadata);
      }

      // Update the session in storage
      sessions[sessionIndex] = updatedSession;

      // Get available actions for the new state
      const availableActions = getAvailableActions(updatedSession);

      return NextResponse.json({ 
        success: true, 
        session: updatedSession,
        message: `Session ${action} successful`,
        businessLogic: {
          action: ACTION_DESCRIPTIONS[action as SessionAction],
          state: STATE_DESCRIPTIONS[updatedSession.status],
          transition: `${currentSession.status} → ${updatedSession.status}`,
          stage: updatedSession.currentStage
        },
        nextActions: availableActions,
        permissions: {
          canPerform: availableActions.filter(a => canPerformAction(userRole as UserRole, a)),
          role: userRole
        }
      });

    } catch (stateMachineError) {
      return NextResponse.json({ 
        error: 'State transition failed',
        details: stateMachineError instanceof Error ? stateMachineError.message : 'Unknown error',
        currentStatus: currentSession.status,
        requestedAction: action,
        userRole,
        availableActions: getAvailableActions(currentSession)
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error executing session action:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to retrieve available actions for a session
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');
    const userRole = searchParams.get('role') as UserRole;

    if (!sessionId || !userRole) {
      return NextResponse.json({ 
        error: 'Missing required parameters: sessionId and role are required' 
      }, { status: 400 });
    }

    // Find the session
    const session = sessions.find(s => s.id === sessionId || s.tableId === sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Get available actions
    const availableActions = getAvailableActions(session);
    const permittedActions = availableActions.filter(action => 
      canPerformAction(userRole, action)
    );

    return NextResponse.json({ 
      success: true,
      sessionId,
      currentStatus: session.status,
      currentStage: session.currentStage,
      availableActions,
      permittedActions,
      userRole,
      businessLogic: {
        state: STATE_DESCRIPTIONS[session.status],
        stage: session.currentStage
      }
    });

  } catch (error) {
    console.error('Error retrieving session actions:', error);
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
    case 'PAID_CONFIRMED':
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
