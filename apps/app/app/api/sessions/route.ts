import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
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

const prisma = new PrismaClient();

// Helper function to map Prisma session state to FireSession status
function mapPrismaStateToFireSession(state: string): SessionStatus {
  const stateMap: Record<string, SessionStatus> = {
    'NEW': 'NEW',
    'ACTIVE': 'ACTIVE',
    'PREP_IN_PROGRESS': 'PREP_IN_PROGRESS',
    'HEAT_UP': 'HEAT_UP',
    'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
    'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
    'DELIVERED': 'DELIVERED',
    'PAUSED': 'STAFF_HOLD',
    'COMPLETED': 'CLOSED',
    'CANCELLED': 'VOIDED',
    'FAILED_PAYMENT': 'FAILED_PAYMENT',
  };
  return stateMap[state] || 'NEW';
}

// Helper function to map state to stage
function mapStateToStage(state: string): 'BOH' | 'FOH' | 'CUSTOMER' {
  switch (state) {
    case 'NEW':
    case 'ACTIVE':
    case 'FAILED_PAYMENT':
      return 'CUSTOMER';
    case 'PREP_IN_PROGRESS':
    case 'HEAT_UP':
    case 'READY_FOR_DELIVERY':
    case 'PAUSED':
      return 'BOH';
    case 'OUT_FOR_DELIVERY':
    case 'DELIVERED':
    case 'COMPLETED':
    case 'CANCELLED':
      return 'FOH';
    default:
      return 'CUSTOMER';
  }
}

// Convert Prisma session to FireSession format
function convertPrismaSessionToFireSession(session: any): FireSession {
  const flavorMix = session.flavorMix ? (() => {
    try {
      const parsed = JSON.parse(session.flavorMix);
      return typeof parsed === 'string' ? parsed : parsed.join(' + ');
    } catch {
      return session.flavorMix;
    }
  })() : (session.flavor || 'Custom Mix');

  return {
    id: session.id,
    tableId: session.tableId || session.externalRef || 'Unknown',
    customerName: session.customerRef || 'Anonymous',
    customerPhone: session.customerPhone || '',
    flavor: flavorMix,
    amount: session.priceCents || 0,
    status: mapPrismaStateToFireSession(session.state),
    currentStage: mapStateToStage(session.state),
    assignedStaff: {
      boh: session.assignedBOHId || '',
      foh: session.assignedFOHId || ''
    },
    createdAt: new Date(session.createdAt).getTime(),
    updatedAt: new Date(session.updatedAt).getTime(),
    sessionStartTime: session.startedAt ? new Date(session.startedAt).getTime() : undefined,
    sessionDuration: session.durationSecs || 45 * 60,
    coalStatus: 'active' as const,
    refillStatus: 'none' as const,
    notes: session.tableNotes || '',
    edgeCase: session.edgeCase || null,
    sessionTimer: session.timerStartedAt ? {
      remaining: calculateRemainingTimeFromPrisma(session),
      total: session.timerDuration || 45 * 60,
      isActive: session.timerStatus === 'running',
      startedAt: new Date(session.timerStartedAt).getTime()
    } : undefined,
    bohState: 'PREPARING' as const,
    guestTimerDisplay: session.state === 'ACTIVE'
  };
}

// Helper function to calculate remaining time from Prisma session
function calculateRemainingTimeFromPrisma(session: any): number {
  if (!session.timerStartedAt || !session.timerDuration) return 0;
  
  const now = Date.now();
  const startedAt = new Date(session.timerStartedAt).getTime();
  const elapsed = Math.floor((now - startedAt) / 1000);
  const pausedTime = session.timerPausedDuration || 0;
  
  return Math.max(0, session.timerDuration - elapsed + pausedTime);
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId') || searchParams.get('id');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const role = searchParams.get('role') as UserRole;

    if (sessionId) {
      const session = await prisma.session.findFirst({
        where: {
          OR: [
            { id: sessionId },
            { externalRef: sessionId },
            { tableId: sessionId }
          ]
        }
      });
      
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { status: 404 });
      }
      
      const fireSession = convertPrismaSessionToFireSession(session);
      return NextResponse.json({ success: true, session: fireSession });
    }

    // Fetch all sessions from database
    let dbSessions = await prisma.session.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Convert to FireSession format
    let sessions = dbSessions.map(convertPrismaSessionToFireSession);

    // Filter by status if specified
    if (status) {
      sessions = sessions.filter(s => s.status === status);
    }

    // Filter by stage if specified
    if (stage) {
      sessions = sessions.filter(s => s.currentStage === stage);
    }

    // Filter by role permissions if specified
    if (role) {
      sessions = sessions.filter(session => {
        return session.currentStage === role || 
               session.currentStage === 'CUSTOMER' || 
               role === 'MANAGER' || 
               role === 'ADMIN';
      });
    }

    // Return filtered sessions with enhanced data
    return NextResponse.json({ 
      success: true, 
      sessions: sessions,
      total: sessions.length,
      stages: {
        BOH: sessions.filter(s => s.currentStage === 'BOH').length,
        FOH: sessions.filter(s => s.currentStage === 'FOH').length,
        CUSTOMER: sessions.filter(s => s.currentStage === 'CUSTOMER').length
      }
    });

  } catch (error) {
    console.error('[Sessions API] Error retrieving sessions:', error);
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