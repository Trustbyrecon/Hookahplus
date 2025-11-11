import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { SessionSource, SessionState } from '@prisma/client';
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
import {
  initializeReflexChain,
  processBOHLayer,
  processFOHLayer,
  processDeliveryLayer,
} from '../../../lib/reflex-chain/integration';

// CORS headers helper
function getCorsHeaders() {
  const allowedOrigin = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

// Handle CORS preflight requests
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(),
  });
}

// Helper function to map Prisma session state (enum) to FireSession status
function mapPrismaStateToFireSession(state: string | SessionState): SessionStatus {
  // Convert enum to string if needed
  const stateStr = typeof state === 'string' ? state : String(state);
  
  const stateMap: Record<string, SessionStatus> = {
    // Database enum values (SessionState)
    'PENDING': 'NEW', // Map PENDING to NEW for FireSession
    'ACTIVE': 'ACTIVE',
    'PAUSED': 'STAFF_HOLD', // Map PAUSED to STAFF_HOLD
    'CLOSED': 'CLOSED',
    'CANCELED': 'VOIDED', // Map CANCELED to VOIDED
    
    // Legacy string values (for backward compatibility)
    'NEW': 'NEW',
    'PREP_IN_PROGRESS': 'PREP_IN_PROGRESS',
    'HEAT_UP': 'HEAT_UP',
    'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
    'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
    'DELIVERED': 'DELIVERED',
    'COMPLETED': 'CLOSED',
    'CANCELLED': 'VOIDED',
    'FAILED_PAYMENT': 'FAILED_PAYMENT',
    'PAID_CONFIRMED': 'PAID_CONFIRMED',
    'CLOSE_PENDING': 'CLOSE_PENDING',
    'STOCK_BLOCKED': 'STOCK_BLOCKED',
    'REMAKE': 'REMAKE',
    'REFUND_REQUESTED': 'REFUND_REQUESTED',
    'REFUNDED': 'REFUNDED',
  };
  return stateMap[stateStr] || 'NEW';
}

// Helper function to map state to stage
function mapStateToStage(state: string | SessionState): 'BOH' | 'FOH' | 'CUSTOMER' {
  const stateStr = typeof state === 'string' ? state : state.toString();
  
  switch (stateStr) {
    // Database enum values
    case 'PENDING':
    case 'ACTIVE':
      return 'CUSTOMER';
    case 'PAUSED':
      return 'BOH';
    case 'CLOSED':
    case 'CANCELED':
      return 'FOH';
    
    // Legacy string values
    case 'NEW':
    case 'FAILED_PAYMENT':
      return 'CUSTOMER';
    case 'PREP_IN_PROGRESS':
    case 'HEAT_UP':
    case 'READY_FOR_DELIVERY':
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
    guestTimerDisplay: session.state === 'ACTIVE',
    source: session.source // Include source from Prisma session
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
        return NextResponse.json({ error: 'Session not found' }, { 
          status: 404,
          headers: getCorsHeaders(),
        });
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
    }, {
      headers: getCorsHeaders(),
    });

  } catch (error) {
    console.error('[Sessions API] Error retrieving sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { 
      status: 500,
      headers: getCorsHeaders(),
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log('[Sessions API] POST request received');
    
    // Test database connection first
    try {
      await prisma.$connect();
      console.log('[Sessions API] Database connection successful');
    } catch (dbError) {
      console.error('[Sessions API] Database connection failed:', dbError);
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: dbError instanceof Error ? dbError.message : 'Unknown database error',
        hint: 'Check DATABASE_URL environment variable and ensure database is running'
      }, { status: 503 });
    }
    
    const body = await req.json();
    console.log('[Sessions API] Request body:', JSON.stringify(body, null, 2));
    const { 
      tableId,
      customerName,
      customerPhone,
      flavor,
      amount, // Can be in dollars or cents - will be converted
      assignedStaff,
      notes,
      sessionDuration = 45 * 60, // Default 45 minutes
      loungeId = 'default-lounge',
      source = 'WALK_IN',
      externalRef
    } = body;

    // Validate required fields
    if (!tableId || !customerName || !flavor) {
      return NextResponse.json({ 
        error: 'Missing required fields: tableId, customerName, and flavor are required' 
      }, { 
        status: 400,
        headers: getCorsHeaders(),
      });
    }

    // Check if session already exists for this table
    const existingSession = await prisma.session.findFirst({
      where: {
        tableId: tableId,
        state: {
          notIn: [SessionState.CLOSED, SessionState.CANCELED]
        }
      }
    });

    if (existingSession) {
      const fireSession = convertPrismaSessionToFireSession(existingSession);
      return NextResponse.json({ 
        error: 'Table already has an active session',
        existingSession: fireSession
      }, { status: 409 });
    }

    // Create trust signature
    const crypto = await import('crypto');
    const seal = (o: unknown) =>
      crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

    const trustSignature = seal({
      loungeId,
      source,
      externalRef: externalRef || `walk-in-${Date.now()}`,
      customerPhone,
      flavor
    });

    // Map source string to enum
    let sourceEnum: SessionSource;
    if (source === 'QR' || source === 'RESERVE' || source === 'WALK_IN' || source === 'LEGACY_POS') {
      sourceEnum = source as SessionSource;
    } else {
      // Default to WALK_IN for unknown sources
      sourceEnum = SessionSource.WALK_IN;
    }

    // Create new session in database
    const sessionData = {
      loungeId: loungeId || 'default-lounge',
      source: sourceEnum,
      externalRef: externalRef || `walk-in-${Date.now()}`,
      trustSignature,
      tableId,
      customerRef: customerName,
      customerPhone: customerPhone || undefined,
      flavor: typeof flavor === 'string' ? flavor : (Array.isArray(flavor) ? flavor[0] : 'Custom Mix'),
      flavorMix: typeof flavor === 'string' ? flavor : JSON.stringify(flavor),
      priceCents: amount ? (amount < 1000 ? Math.round(amount * 100) : Math.round(amount)) : 3000, // Convert dollars to cents if needed, default $30.00
      state: SessionState.PENDING, // Use enum - PENDING instead of NEW
      assignedBOHId: assignedStaff?.boh || undefined,
      assignedFOHId: assignedStaff?.foh || undefined,
      tableNotes: notes || undefined,
      durationSecs: sessionDuration,
    };
    
    console.log('[Sessions API] Creating session with data:', JSON.stringify(sessionData, null, 2));
    
    const newSession = await prisma.session.create({
      data: sessionData
    });
    
    console.log('[Sessions API] Session created successfully:', newSession.id);

    const fireSession = convertPrismaSessionToFireSession(newSession);

    return NextResponse.json({ 
      success: true, 
      session: fireSession,
      message: 'Session created successfully',
      nextActions: ['CLAIM_PREP', 'PUT_ON_HOLD'],
      businessLogic: 'New session created - BOH can claim prep or put on hold'
    }, {
      headers: getCorsHeaders(),
    });

  } catch (error) {
    console.error('[Sessions API] Error creating session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    // Enhanced error logging
    console.error('[Sessions API] Error details:', {
      name: errorName,
      message: errorMessage,
      stack: errorStack,
      timestamp: new Date().toISOString(),
      requestBody: body ? JSON.stringify(body, null, 2) : 'No body',
      databaseUrl: process.env.DATABASE_URL ? `${process.env.DATABASE_URL.substring(0, 30)}...` : 'Not set'
    });
    
    // Check for specific Prisma errors
    if (errorMessage.includes('P2002')) {
      return NextResponse.json({ 
        error: 'Duplicate entry',
        details: 'A session with this identifier already exists'
      }, { 
        status: 409,
        headers: getCorsHeaders(),
      });
    }
    
    if (errorMessage.includes('P2003')) {
      return NextResponse.json({ 
        error: 'Foreign key constraint failed',
        details: 'Referenced record does not exist'
      }, { 
        status: 400,
        headers: getCorsHeaders(),
      });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage,
      // Include stack trace in development only
      ...(process.env.NODE_ENV === 'development' && errorStack ? { stack: errorStack } : {})
    }, { 
      status: 500,
      headers: getCorsHeaders(),
    });
  }
}

// New PATCH endpoint for session actions
// Note: This endpoint is kept for backward compatibility but should use /api/sessions/[id]/transition
export async function PATCH(req: NextRequest) {
  let sessionId: string | undefined;
  let action: string | undefined;
  let userRole: string | undefined;
  
  try {
    const body = await req.json();
    sessionId = body.sessionId;
    action = body.action;
    userRole = body.userRole;
    const { 
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

    // Handle UPDATE_NOTES as a special case (no state transition needed)
    if (action === 'UPDATE_NOTES') {
      const dbSession = await prisma.session.findFirst({
        where: {
          OR: [
            { id: sessionId },
            { externalRef: sessionId },
            { tableId: sessionId }
          ]
        }
      });

      if (!dbSession) {
        return NextResponse.json({ error: 'Session not found' }, { 
          status: 404,
          headers: getCorsHeaders(),
        });
      }

      // Update only notes
      const updatedDbSession = await prisma.session.update({
        where: { id: dbSession.id },
        data: {
          tableNotes: notes !== undefined ? notes : dbSession.tableNotes
        }
      });

      const fireSession = convertPrismaSessionToFireSession(updatedDbSession);
      
      return NextResponse.json({ 
        success: true, 
        session: fireSession,
        message: 'Notes updated successfully',
        businessLogic: 'Session notes updated without state change'
      });
    }

    // Find the session in database
    const dbSession = await prisma.session.findFirst({
      where: {
        OR: [
          { id: sessionId },
          { externalRef: sessionId },
          { tableId: sessionId }
        ]
      }
    });

    if (!dbSession) {
      return NextResponse.json({ error: 'Session not found' }, { 
        status: 404,
        headers: getCorsHeaders(),
      });
    }

    // Convert to FireSession format for state machine
    const currentSession = convertPrismaSessionToFireSession(dbSession);

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

      // Map FireSession status back to Prisma state
      const stateMap: Partial<Record<SessionStatus, string>> = {
        'NEW': 'NEW',
        'ACTIVE': 'ACTIVE',
        'PREP_IN_PROGRESS': 'PREP_IN_PROGRESS',
        'HEAT_UP': 'HEAT_UP',
        'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
        'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
        'DELIVERED': 'DELIVERED',
        'STAFF_HOLD': 'PAUSED',
        'CLOSED': 'COMPLETED',
        'VOIDED': 'CANCELLED',
        'FAILED_PAYMENT': 'FAILED_PAYMENT',
        'PAID_CONFIRMED': 'NEW', // Maps to NEW as payment is confirmed
        'CLOSE_PENDING': 'NEW', // Maps to NEW for pending close
        'STOCK_BLOCKED': 'NEW', // Maps to NEW for stock issues
        'REMAKE': 'NEW', // Maps to NEW for remake
        'REFUND_REQUESTED': 'NEW', // Maps to NEW for refund requests
        'REFUNDED': 'CANCELLED', // Maps to CANCELLED for refunded
      };

      const newState = stateMap[updatedSession.status] || dbSession.state;

      // Update session in database
      const updateData: any = {
        state: newState,
        tableNotes: notes !== undefined ? notes : dbSession.tableNotes,
        edgeCase: edgeCase !== undefined ? edgeCase : dbSession.edgeCase,
      };

      // Update startedAt if transitioning to ACTIVE
      if (updatedSession.status === 'ACTIVE' && !dbSession.startedAt) {
        updateData.startedAt = new Date();
      }

      // Update endedAt if transitioning to CLOSED/CANCELED
      if ([SessionState.CLOSED, SessionState.CANCELED].includes(newState) && !dbSession.endedAt) {
        updateData.endedAt = new Date();
      }

      const updatedDbSession = await prisma.session.update({
        where: { id: dbSession.id },
        data: updateData
      });

      const fireSession = convertPrismaSessionToFireSession(updatedDbSession);

      // Process Reflex Chain layers based on action
      try {
        // Initialize Reflex Chain if session is new
        if (currentSession.status === 'NEW' && updatedSession.status !== 'NEW') {
          await initializeReflexChain(fireSession);
        }

        // Process BoH layer for prep-related actions
        if (['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY'].includes(action)) {
          await processBOHLayer(fireSession, action as SessionAction);
        }

        // Process FoH layer when session becomes active
        if (action === 'START_ACTIVE') {
          await processFOHLayer(fireSession, action as SessionAction, operatorId);
        }

        // Process Delivery layer when session is delivered
        if (action === 'MARK_DELIVERED') {
          await processDeliveryLayer(fireSession, action as SessionAction, operatorId);
        }
      } catch (reflexError) {
        // Log but don't fail the request if Reflex Chain processing fails
        console.error('[Reflex Chain] Error processing layer:', reflexError);
      }

      return NextResponse.json({ 
        success: true, 
        session: fireSession,
        message: `Session ${action} successful`,
        businessLogic: `Session transitioned from ${currentSession.status} to ${updatedSession.status}`,
        nextActions: getAvailableActions(fireSession),
        stage: fireSession.currentStage
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
    console.error('[Sessions API] Error updating session:', error);
    console.error('[Sessions API] Error details:', {
      sessionId,
      action,
      userRole,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
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