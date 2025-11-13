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

// CORS headers helper - accepts request to get origin
function getCorsHeaders(req?: NextRequest) {
  // Allow requests from site build, app build, or guest build
  const origin = req?.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3001', // Guest build
  ];
  
  // If origin matches allowed list, use it; otherwise use default
  const allowedOrigin = origin && allowedOrigins.includes(origin) 
    ? origin 
    : allowedOrigins[0];
    
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
    headers: getCorsHeaders(req),
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
  const stateStr = typeof state === 'string' ? state : String(state);
  
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
  // Diagnostic: Check if DATABASE_URL is loaded
  if (!process.env.DATABASE_URL) {
    console.error('[Sessions API] ❌ DATABASE_URL is not set!');
    console.error('[Sessions API] NODE_ENV:', process.env.NODE_ENV);
    console.error('[Sessions API] process.cwd():', process.cwd());
    return NextResponse.json(
      {
        success: false,
        error: 'Database configuration error: DATABASE_URL is not set',
        diagnostic: {
          nodeEnv: process.env.NODE_ENV,
          cwd: process.cwd(),
          hint: 'Check if .env.local exists in apps/app directory'
        }
      },
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
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
      headers: getCorsHeaders(req),
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
    
    const body = await req.json();
    const { 
      tableId,
      customerName,
      customerPhone,
      flavor,
      amount,
      assignedStaff,
      notes,
      sessionDuration = 45 * 60,
      loungeId = 'default-lounge',
      source = 'WALK_IN',
      externalRef
    } = body;

    // Simple validation - only required fields
    if (!tableId || !customerName) {
      return NextResponse.json({ 
        error: 'Missing required fields: tableId and customerName are required' 
      }, { 
        status: 400,
        headers: getCorsHeaders(req),
      });
    }

    // Generate externalRef for idempotency
    const finalExternalRef = externalRef || `walk-in-${Date.now()}`;
    const finalLoungeId = loungeId || 'default-lounge';

    // Check if session already exists for this table (simplified duplicate check)
    // Use string literals to avoid runtime enum issues
    const existingSession = await prisma.session.findFirst({
      where: {
        tableId: tableId,
        state: {
          notIn: ['CLOSED', 'CANCELED'] as any // Cast to any to avoid enum type issues
        }
      }
    });

    if (existingSession) {
      const fireSession = convertPrismaSessionToFireSession(existingSession);
      return NextResponse.json({ 
        success: true, // Idempotent - return existing session
        session: fireSession,
        message: 'Session already exists',
        nextActions: ['CLAIM_PREP', 'PUT_ON_HOLD'],
        businessLogic: 'Existing session found - BOH can claim prep or put on hold'
      }, { 
        status: 200, // 200 instead of 409 for idempotency
        headers: getCorsHeaders(req),
      });
    }

    // Create trust signature
    const crypto = await import('crypto');
    const seal = (o: unknown) =>
      crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

    const trustSignature = seal({
      loungeId: finalLoungeId,
      source,
      externalRef: finalExternalRef,
      customerPhone,
      flavor
    });

    // Map source string to enum value - ensure it's a valid enum value
    const sourceValue = (source === 'QR' || source === 'RESERVE' || source === 'WALK_IN' || source === 'LEGACY_POS')
      ? source
      : 'WALK_IN';

    // Create session in database
    // Use explicit string casting to avoid enum serialization issues
    // This works whether columns are enum or text type
    const sessionData: any = {
      loungeId: finalLoungeId,
      externalRef: finalExternalRef,
      trustSignature,
      tableId,
      customerRef: customerName,
      customerPhone: customerPhone || undefined,
      flavor: typeof flavor === 'string' ? flavor : (Array.isArray(flavor) ? flavor[0] : 'Custom Mix'),
      flavorMix: typeof flavor === 'string' ? flavor : JSON.stringify(flavor),
      priceCents: amount ? (amount < 1000 ? Math.round(amount * 100) : Math.round(amount)) : 3000,
      assignedBOHId: assignedStaff?.boh || undefined,
      assignedFOHId: assignedStaff?.foh || undefined,
      tableNotes: notes || undefined,
      durationSecs: sessionDuration,
    };

    // Handle enum fields - use string literals for reliable PostgreSQL enum casting
    // PostgreSQL automatically casts strings to enum types, avoiding Prisma serialization issues
    // This is the most reliable approach used by many production teams
    sessionData.source = sourceValue; // String literal: 'QR', 'WALK_IN', etc.
    sessionData.state = 'PENDING';    // String literal - PostgreSQL will cast to SessionState enum

    // Log the data being sent for debugging
    console.log('[Sessions API] Creating session with data:', {
      source: sessionData.source,
      sourceType: typeof sessionData.source,
      state: sessionData.state,
      stateType: typeof sessionData.state,
      tableId: sessionData.tableId,
      customerRef: sessionData.customerRef
    });

    let newSession: any;
    try {
      newSession = await prisma.session.create({
        data: sessionData as any, // Use 'as any' to bypass strict type checking for enum fields
      });
      
      console.log('[Sessions API] Session created successfully:', newSession.id);
    } catch (createError: any) {
      console.error('[Sessions API] Prisma create error:', createError);
      console.error('[Sessions API] Error message:', createError?.message);
      console.error('[Sessions API] Error code:', createError?.code);
      console.error('[Sessions API] Error meta:', createError?.meta);
      
      // If enum serialization fails, try using raw SQL as fallback
      if (createError?.message?.includes('expected value') || createError?.code === 'P2002') {
        console.log('[Sessions API] Attempting fallback: using raw SQL for enum values');
        
        // Fallback: Use $queryRaw to insert with explicit enum casting
        const insertQuery = `
          INSERT INTO "Session" (
            "id", "externalRef", "source", "state", "trustSignature", 
            "tableId", "customerRef", "customerPhone", "flavor", "flavorMix",
            "loungeId", "priceCents", "assignedBOHId", "assignedFOHId", 
            "tableNotes", "durationSecs", "createdAt", "updatedAt"
          ) VALUES (
            gen_random_uuid()::text,
            $1::text,
            $2::"SessionSource",
            $3::"SessionState",
            $4::text,
            $5::text,
            $6::text,
            $7::text,
            $8::text,
            $9::text,
            $10::text,
            $11::integer,
            $12::text,
            $13::text,
            $14::text,
            $15::integer,
            NOW(),
            NOW()
          ) RETURNING *
        `;
        
        try {
          const result = await prisma.$queryRawUnsafe(
            insertQuery,
            finalExternalRef || null,
            sourceValue, // Use string value, PostgreSQL will cast to enum
            'PENDING', // Use string value, PostgreSQL will cast to enum
            trustSignature,
            tableId,
            customerName || null,
            customerPhone || null,
            typeof flavor === 'string' ? flavor : (Array.isArray(flavor) ? flavor[0] : 'Custom Mix') || null,
            typeof flavor === 'string' ? flavor : JSON.stringify(flavor) || null,
            finalLoungeId,
            amount ? (amount < 1000 ? Math.round(amount * 100) : Math.round(amount)) : 3000,
            assignedStaff?.boh || null,
            assignedStaff?.foh || null,
            notes || null,
            sessionDuration
          ) as any[];
          
          if (result && result.length > 0) {
            newSession = result[0];
            console.log('[Sessions API] Session created via raw SQL:', newSession.id);
            // Continue to analytics/reflex chain initialization below
          } else {
            throw new Error('Raw SQL insert returned no rows');
          }
        } catch (rawError: any) {
          console.error('[Sessions API] Raw SQL fallback also failed:', rawError);
          throw createError; // Re-throw original error
        }
      }
      
      throw createError; // Re-throw if not an enum serialization error
    }

    // Session created successfully - create analytics event and initialize Reflex Chain
    // Create ReflexEvent for analytics tracking
    try {
      await prisma.reflexEvent.create({
        data: {
          type: 'session.created',
          source: 'api',
          sessionId: newSession.id,
          payload: JSON.stringify({
            action: 'create-session',
            tableId,
            customerName,
            source,
            businessLogic: 'New session created - BOH can claim prep or put on hold'
          }),
          payloadHash: seal({
            action: 'create-session',
            tableId,
            customerName,
            source
          })
        }
      });
    } catch (eventError) {
      // Log but don't fail the request if event creation fails
      console.error('[Sessions API] Failed to create analytics event:', eventError);
    }

    // Initialize Reflex Chain (preserve existing logic)
    const fireSession = convertPrismaSessionToFireSession(newSession);
    try {
      await initializeReflexChain(fireSession);
    } catch (reflexError) {
      // Log but don't fail the request if Reflex Chain initialization fails
      console.error('[Sessions API] Failed to initialize Reflex Chain:', reflexError);
    }

    // Return with business logic metadata (preserve existing format)
    return NextResponse.json({ 
      success: true, 
      session: fireSession,
      message: 'Session created successfully',
      nextActions: ['CLAIM_PREP', 'PUT_ON_HOLD'],
      businessLogic: 'New session created - BOH can claim prep or put on hold'
    }, {
      headers: getCorsHeaders(req),
    });

  } catch (error) {
    console.error('[Sessions API] Error creating session:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Simple error handling
    if (errorMessage.includes('P2002')) {
      return NextResponse.json({ 
        error: 'Duplicate entry',
        details: 'A session with this identifier already exists'
      }, { 
        status: 409,
        headers: getCorsHeaders(req),
      });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorMessage,
      ...(process.env.NODE_ENV === 'development' ? { 
        stack: error instanceof Error ? error.stack : undefined 
      } : {})
    }, { 
      status: 500,
      headers: getCorsHeaders(req),
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
      edgeCase,
      edgeNote 
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
      // Note: Database stores detailed statuses as strings for business logic
      // while Prisma enum (SessionState) is used for high-level state tracking
      const stateMap: Partial<Record<SessionStatus, string>> = {
        'NEW': 'NEW',
        'ACTIVE': 'ACTIVE',
        'PREP_IN_PROGRESS': 'PREP_IN_PROGRESS',
        'HEAT_UP': 'HEAT_UP', // BOH action: transitions from PREP_IN_PROGRESS
        'READY_FOR_DELIVERY': 'READY_FOR_DELIVERY',
        'OUT_FOR_DELIVERY': 'OUT_FOR_DELIVERY',
        'DELIVERED': 'DELIVERED',
        'STAFF_HOLD': 'PAUSED', // PAUSE_SESSION action results in STAFF_HOLD status
        'CLOSED': 'CLOSED', // CLOSE_SESSION action results in CLOSED status
        'VOIDED': 'CANCELED',
        'FAILED_PAYMENT': 'FAILED_PAYMENT',
        'PAID_CONFIRMED': 'NEW', // Maps to NEW as payment is confirmed
        'CLOSE_PENDING': 'NEW', // Maps to NEW for pending close
        'STOCK_BLOCKED': 'NEW', // Maps to NEW for stock issues
        'REMAKE': 'NEW', // Maps to NEW for remake
        'REFUND_REQUESTED': 'NEW', // Maps to NEW for refund requests
        'REFUNDED': 'CANCELED', // Maps to CANCELED for refunded
      };

      const newState = stateMap[updatedSession.status] || dbSession.state;
      
      // Ensure HEAT_UP properly transitions from PREP_IN_PROGRESS
      // Ensure PAUSE_SESSION properly pauses active sessions
      // Ensure CLOSE_SESSION properly closes sessions

      // Update session in database
      const updateData: any = {
        state: newState,
        tableNotes: notes !== undefined ? notes : dbSession.tableNotes,
        edgeCase: edgeCase !== undefined ? edgeCase : dbSession.edgeCase,
        edgeNote: edgeNote !== undefined ? edgeNote : dbSession.edgeNote,
      };

      // Update startedAt if transitioning to ACTIVE
      if (updatedSession.status === 'ACTIVE' && !dbSession.startedAt) {
        updateData.startedAt = new Date();
      }

      // Update endedAt if transitioning to CLOSED/CANCELED
      // Use string comparison to avoid runtime enum issues
      const finalState = String(newState);
      if ((finalState === 'CLOSED' || finalState === 'CANCELED') && !dbSession.endedAt) {
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
      }, {
        headers: getCorsHeaders(req),
      });

    } catch (stateMachineError) {
      return NextResponse.json({ 
        error: 'State transition failed',
        details: stateMachineError instanceof Error ? stateMachineError.message : 'Unknown error',
        currentStatus: currentSession.status,
        requestedAction: action,
        userRole
      }, { 
        status: 400,
        headers: getCorsHeaders(req),
      });
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
    }, { 
      status: 500,
      headers: getCorsHeaders(req),
    });
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