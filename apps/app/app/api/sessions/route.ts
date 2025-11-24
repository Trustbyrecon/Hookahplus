import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { SessionSource, SessionState } from '@prisma/client';
import { getCurrentUser, getCurrentTenant } from '../../../lib/auth';
import crypto from 'crypto';
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
import { logKtl4Event, updateKtl4Health, getKtl4HealthStatus } from '../../../lib/ktl4-ghostlog';
import { mapSessionState } from '../../../lib/taxonomy/enums-v1';
import { trackUnknown } from '../../../lib/taxonomy/unknown-tracker';
import { convertPrismaSessionToFireSession } from '../../../lib/session-utils-prisma';

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
function mapPrismaStateToFireSession(state: string | SessionState, paymentStatus?: string | null): SessionStatus {
  // Convert enum to string if needed
  const stateStr = typeof state === 'string' ? state : String(state);
  
  // Special handling: PENDING + paymentStatus 'succeeded' = PAID_CONFIRMED
  // This is the key fix: after Stripe payment, sessions should show as PAID_CONFIRMED
  if (stateStr === 'PENDING' && paymentStatus === 'succeeded') {
    return 'PAID_CONFIRMED';
  }
  
  const stateMap: Record<string, SessionStatus> = {
    // Database enum values (SessionState)
    'PENDING': 'NEW', // PENDING without payment = NEW (unpaid)
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

// convertPrismaSessionToFireSession is now imported from lib/session-utils-prisma.ts

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
      let session;
      try {
        session = await prisma.session.findFirst({
          where: {
            OR: [
              { id: sessionId },
              { externalRef: sessionId },
              { tableId: sessionId }
            ]
          }
        });
      } catch (dbError: any) {
        // If sessionStateV1 column doesn't exist, use raw SQL
        // If Prisma query fails, log and return null (no raw SQL fallback)
        console.error('[Sessions API] Failed to fetch session:', dbError?.message);
        throw dbError;
      }
      
      if (!session) {
        return NextResponse.json({ error: 'Session not found' }, { 
          status: 404,
          headers: getCorsHeaders(req),
        });
      }
      
      const fireSession = convertPrismaSessionToFireSession(session);
      return NextResponse.json({ success: true, session: fireSession }, {
        headers: getCorsHeaders(req),
      });
    }

    // Fetch all sessions from database
    // Filter by tenant_id if user is authenticated (RLS will also enforce this)
    const user = await getCurrentUser(req);
    const tenantId = user ? await getCurrentTenant(req) : null;
    
    let dbSessions;
    try {
      const whereClause: any = {};
      
      // If authenticated, filter by tenant_id (RLS will also enforce)
      if (tenantId) {
        whereClause.tenantId = tenantId;
      }
      // If not authenticated, this is a public route - RLS will handle filtering
      
      dbSessions = await prisma.session.findMany({
        where: whereClause,
        orderBy: {
          createdAt: 'desc'
        }
      });
    } catch (dbError: any) {
      // If sessionStateV1 column doesn't exist, use raw SQL to select only existing columns
      // If Prisma query fails, log and return empty array (no raw SQL fallback)
      console.error('[Sessions API] Failed to fetch sessions:', dbError?.message);
      throw dbError;
    }

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

  } catch (error: any) {
    console.error('[Sessions API] Error retrieving sessions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    // Check for database connection errors
    if (errorMessage.includes('Can\'t reach database') || 
        errorMessage.includes('connection') ||
        error?.code === 'P1001') {
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: errorMessage,
        hint: 'Check DATABASE_URL and ensure database is running'
      }, { 
        status: 503,
        headers: getCorsHeaders(req),
      });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { 
      status: 500,
      headers: getCorsHeaders(req),
    });
  }
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    console.log('[Sessions API] POST request received');
    
    // Parse body with better error handling
    try {
      body = await req.json();
      console.log('[Sessions API] Body parsed:', { 
        hasTableId: !!body.tableId, 
        hasCustomerName: !!body.customerName,
        tableId: body.tableId,
        customerName: body.customerName
      });
    } catch (parseError: any) {
      console.error('[Sessions API] Failed to parse JSON body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid JSON in request body',
        details: parseError?.message || 'Could not parse request body as JSON'
      }, { 
        status: 400,
        headers: getCorsHeaders(req),
      });
    }
    
    // Check if body is empty or null
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return NextResponse.json({ 
        error: 'Request body is required and must be a JSON object',
        received: body,
        receivedType: typeof body,
        isArray: Array.isArray(body)
      }, { 
        status: 400,
        headers: getCorsHeaders(req),
      });
    }
    
    // P0: Debug - log all body keys to see what's actually being received
    console.log('[Sessions API] Body keys:', Object.keys(body || {}));
    console.log('[Sessions API] Body values:', {
      tableId: body.tableId,
      customerName: body.customerName,
      flavor: body.flavor,
      source: body.source,
      loungeId: body.loungeId,
      allKeys: Object.keys(body)
    });
    
    // P0: Harden input coercion - normalize all inputs to safe types
    // Normalize flavor: handle array, string, or comma-separated
    const flavorArr = Array.isArray(body.flavor)
      ? body.flavor.map((f: any) => String(f).trim()).filter(Boolean)
      : body.flavor
      ? String(body.flavor).split(',').map((s: string) => s.trim()).filter(Boolean)
      : ['Custom Mix'];
    
    // Normalize source with validation
    const validSources = ['QR', 'RESERVE', 'WALK_IN', 'LEGACY_POS'];
    const sourceValue = validSources.includes(body.source) ? body.source : 'WALK_IN';
    
    // Check for demo mode flag
    const isDemoMode = body.isDemo === true || body.isDemo === 'true';
    
    // Normalize all fields with safe defaults
    // P0: Debug normalization - log raw values before processing
    console.log('[Sessions API] Raw body values:', {
      tableId: body.tableId,
      tableIdType: typeof body.tableId,
      customerName: body.customerName,
      customerNameType: typeof body.customerName,
      isDemoMode
    });
    
    // P0: Normalize with better handling of undefined/null/empty values
    // Ensure we preserve non-empty values and handle edge cases
    const normalizeString = (val: any): string => {
      if (val === null || val === undefined) return '';
      const str = String(val).trim();
      return str;
    };
    
    const data = {
      tableId: normalizeString(body.tableId),
      customerName: normalizeString(body.customerName),
      customerPhone: body.customerPhone ? String(body.customerPhone).trim() : null,
      source: sourceValue,
      flavorMix: flavorArr,
      notes: body.notes ? String(body.notes).trim() : null,
      amount: Number.isFinite(body.amount) ? Number(body.amount) : null,
      externalRef: body.externalRef ? String(body.externalRef).trim() : null,
      loungeId: body.loungeId ? String(body.loungeId).trim() : 'default-lounge',
      assignedBoh: body.assignedStaff?.boh ? String(body.assignedStaff.boh).trim() : null,
      assignedFoh: body.assignedStaff?.foh ? String(body.assignedStaff.foh).trim() : null,
      sessionDuration: Number.isFinite(body.sessionDuration) ? Number(body.sessionDuration) : 45 * 60,
      pricingModel: body.pricingModel ? String(body.pricingModel).toLowerCase() : 'flat', // 'flat' | 'time-based'
    };
    
    // Validate required fields - check for non-empty strings
    console.log('[Sessions API] Normalized data:', {
      tableId: data.tableId,
      tableIdLength: data.tableId?.length,
      customerName: data.customerName,
      customerNameLength: data.customerName?.length,
      tableIdTruthy: !!data.tableId,
      customerNameTruthy: !!data.customerName
    });
    
    // P0: More robust validation - check for non-empty strings after normalization
    // Also check if values were actually provided in the request (not just empty after normalization)
    const hasTableId = body.tableId !== undefined && body.tableId !== null && String(body.tableId).trim().length > 0;
    const hasCustomerName = body.customerName !== undefined && body.customerName !== null && String(body.customerName).trim().length > 0;
    
    // P0: Debug - log validation checks
    console.log('[Sessions API] Validation checks:', {
      hasTableId,
      hasCustomerName,
      dataTableId: data.tableId,
      dataTableIdLength: data.tableId?.length,
      dataCustomerName: data.customerName,
      dataCustomerNameLength: data.customerName?.length,
      willFail: !hasTableId || !hasCustomerName || !data.tableId || data.tableId.length === 0 || !data.customerName || data.customerName.length === 0
    });
    
    // P0: Simplified validation - only check normalized data (hasTableId/hasCustomerName already validated the raw input)
    if (!data.tableId || data.tableId.length === 0 || !data.customerName || data.customerName.length === 0) {
      const errorResponse = { 
        error: 'Missing required fields: tableId and customerName are required',
        details: {
          tableId: {
            provided: body.tableId !== undefined && body.tableId !== null,
            value: body.tableId,
            valueType: typeof body.tableId,
            normalized: data.tableId,
            normalizedLength: data.tableId?.length || 0,
            isEmpty: !data.tableId || data.tableId.length === 0,
            hasValue: hasTableId
          },
          customerName: {
            provided: body.customerName !== undefined && body.customerName !== null,
            value: body.customerName,
            valueType: typeof body.customerName,
            normalized: data.customerName,
            normalizedLength: data.customerName?.length || 0,
            isEmpty: !data.customerName || data.customerName.length === 0,
            hasValue: hasCustomerName
          }
        },
        received: { 
          tableId: !!data.tableId, 
          customerName: !!data.customerName,
          tableIdValue: data.tableId || '(empty)',
          customerNameValue: data.customerName || '(empty)',
          rawBody: process.env.NODE_ENV === 'development' ? {
            tableId: body.tableId,
            customerName: body.customerName,
            flavor: body.flavor,
            source: body.source,
            loungeId: body.loungeId,
            allKeys: Object.keys(body || {})
          } : undefined
        }
      };
      console.error('[Sessions API] Validation failed:', JSON.stringify(errorResponse, null, 2));
      
      // P0: Ensure we return proper JSON - explicitly stringify to avoid serialization issues
      try {
        const jsonResponse = NextResponse.json(errorResponse, { 
          status: 400,
          headers: {
            ...getCorsHeaders(req),
            'Content-Type': 'application/json'
          },
        });
        return jsonResponse;
      } catch (jsonError: any) {
        // Fallback if JSON serialization fails
        console.error('[Sessions API] Failed to serialize error response:', jsonError);
        return NextResponse.json({ 
          error: 'Missing required fields: tableId and customerName are required',
          details: 'Validation failed - check server logs for details'
        }, { 
          status: 400,
          headers: getCorsHeaders(req),
        });
      }
    }

    // Generate externalRef for idempotency
    const finalExternalRef = data.externalRef || `${data.source.toLowerCase()}-${Date.now()}`;
    const finalLoungeId = data.loungeId;
    
    // Get tenant_id for multi-tenant support
    // For public QR code access, try to get tenant_id from:
    // 1. Request body (if provided)
    // 2. loungeId mapping (lookup tenant by loungeId)
    // 3. Authenticated user's tenant (if user is logged in)
    let finalTenantId: string | null = null;
    
    if (body.tenantId) {
      finalTenantId = String(body.tenantId).trim();
    } else {
      // Try to get from authenticated user
      const user = await getCurrentUser(req);
      if (user) {
        finalTenantId = await getCurrentTenant(req);
      }
      
      // If still no tenant_id, try to lookup by loungeId
      if (!finalTenantId && finalLoungeId) {
        try {
          const tenant = await prisma.tenant.findFirst({
            where: {
              name: finalLoungeId,
            },
          });
          if (tenant) {
            finalTenantId = tenant.id;
          }
        } catch (error) {
          console.warn('[Sessions API] Could not lookup tenant by loungeId:', error);
        }
      }
    }

    // Check if session already exists for this table (simplified duplicate check)
    // Use raw SQL to avoid Prisma trying to select sessionStateV1 if column doesn't exist
    let existingSession: any = null;
    // Use Prisma Client only - no raw SQL
    try {
      existingSession = await prisma.session.findFirst({
        where: {
          tableId: data.tableId,
          state: { notIn: ['CLOSED', 'CANCELED'] as any }
        }
      });
    } catch (prismaError: any) {
      console.warn('[Sessions API] Could not check for existing session:', prismaError.message);
      existingSession = null;
    }

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
      source: data.source,
      externalRef: finalExternalRef,
      customerPhone: data.customerPhone,
      flavor: data.flavorMix
    });

    // Normalize price: if amount < 100, assume dollars; if >= 100, assume cents
    const priceCents = data.amount 
      ? (data.amount < 100 ? Math.round(data.amount * 100) : Math.round(data.amount))
      : 3000;

    // Determine session pricing type for MOAT metrics
    const sessionPricingType: 'TIME_BASED' | 'FLAT' =
      data.pricingModel === 'time-based' ? 'TIME_BASED' : 'FLAT';

    // Create session in database with normalized data
    // In demo mode, skip payment requirement and set state to PAID_CONFIRMED directly
    const sessionData: any = {
      loungeId: finalLoungeId,
      externalRef: finalExternalRef,
      trustSignature,
      tableId: data.tableId,
      customerRef: data.customerName,
      customerPhone: data.customerPhone, // null is fine
      flavor: data.flavorMix[0] || 'Custom Mix', // First flavor for single flavor field
      flavorMix: JSON.stringify(data.flavorMix), // Store as JSON string
      priceCents,
      sessionType: sessionPricingType,
      assignedBOHId: data.assignedBoh, // null is fine
      assignedFOHId: data.assignedFoh, // null is fine
      tableNotes: data.notes, // null is fine
      durationSecs: data.sessionDuration,
      source: data.source, // Already validated
      state: isDemoMode ? 'PENDING' : 'PENDING', // Start as PENDING, but in demo mode we'll auto-confirm payment
      paymentStatus: isDemoMode ? 'succeeded' : null, // Demo mode: auto-confirm payment
    };

    // Log the data being sent for debugging
    console.log('[Sessions API] Creating session with data:', {
      source: sessionData.source,
      sourceType: typeof sessionData.source,
      state: sessionData.state,
      stateType: typeof sessionData.state,
      tableId: sessionData.tableId,
      customerRef: sessionData.customerRef
    });

    // Use Prisma Client only - no raw SQL (PgBouncer transaction mode compatible)
    console.log('[Sessions API] Creating session via Prisma Client (PgBouncer-friendly)');
    
    // Use normalized data from above
    const finalFlavor = data.flavorMix[0] || 'Custom Mix';
    const finalFlavorMix = JSON.stringify(data.flavorMix);
    const finalPriceCents = priceCents;
    
    // Generate UUID
    const sessionId = crypto.randomUUID();
    
    // Create session using Prisma Client only
    let newSession: any;
    try {
      newSession = await prisma.session.create({
        data: {
          id: sessionId,
          externalRef: finalExternalRef,
          source: data.source as SessionSource,
          state: 'PENDING' as SessionState,
          trustSignature,
          tableId: data.tableId,
          customerRef: data.customerName,
          customerPhone: data.customerPhone,
          flavor: finalFlavor,
          flavorMix: finalFlavorMix,
          loungeId: finalLoungeId,
          priceCents: finalPriceCents,
          sessionType: sessionPricingType,
          assignedBOHId: data.assignedBoh,
          assignedFOHId: data.assignedFoh,
          tableNotes: data.notes,
          durationSecs: data.sessionDuration,
          tenantId: finalTenantId, // Multi-tenant: associate with tenant
          paymentStatus: isDemoMode ? 'succeeded' : null, // Demo mode: auto-confirm payment
          // Note: sessionStateV1 and paused columns skipped - migration may not be run yet
        }
      });
      
      // In demo mode, log that this is a demo session
      if (isDemoMode) {
        console.log('[Sessions API] ✅ Demo session created (payment auto-confirmed):', newSession.id);
      }
      console.log('[Sessions API] ✅ Session created successfully:', newSession.id);
      
      if (newSession) {
        // Log KTL-4 event for successful session creation
        try {
          await logKtl4Event({
            flowName: 'session_lifecycle',
            eventType: 'session_created',
            sessionId: newSession.id,
            status: 'success',
            details: {
              tableId: data.tableId,
              source: data.source,
              loungeId: finalLoungeId,
              customerName: data.customerName,
              customerPhone: data.customerPhone,
              flavor: finalFlavor,
              priceCents: finalPriceCents,
              method: 'prisma_client'
            }
          });
        } catch (ktl4Error) {
          // Log but don't fail the request if KTL-4 logging fails
          console.error('[Sessions API] Failed to log KTL-4 event:', ktl4Error);
        }
      
        // Session created successfully - create analytics event and initialize Reflex Chain
        // Create ReflexEvent for analytics tracking
        try {
          await prisma.reflexEvent.create({
            data: {
              type: 'session.created',
              source: isDemoMode ? 'demo' : 'api', // Tag demo sessions
              sessionId: newSession.id,
              payload: JSON.stringify({
                action: 'create-session',
                tableId: data.tableId,
                customerName: data.customerName,
                source: sourceValue,
                isDemo: isDemoMode, // Tag as demo
                businessLogic: isDemoMode 
                  ? 'Demo session created - payment auto-confirmed, BOH can claim prep'
                  : 'New session created - BOH can claim prep or put on hold'
              }),
              payloadHash: seal({
                action: 'create-session',
                tableId: data.tableId,
                customerName: data.customerName,
                source: sourceValue,
                isDemo: isDemoMode
              }),
              tenantId: finalTenantId // Multi-tenant: associate with tenant
            }
          });
        } catch (eventError) {
          // Log but don't fail the request if event creation fails
          console.error('[Sessions API] Failed to create analytics event:', eventError);
        }
        
        // In demo mode, update session to PAID_CONFIRMED state immediately
        if (isDemoMode && newSession.paymentStatus === 'succeeded') {
          try {
            // Update session state to reflect payment confirmation
            // The session will show as PAID_CONFIRMED in the UI
            console.log('[Sessions API] Demo mode: Session payment auto-confirmed');
          } catch (updateError) {
            console.warn('[Sessions API] Failed to update demo session state:', updateError);
          }
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
      }
    } catch (createError: any) {
      // Log Prisma create error
      console.error('[Sessions API] ❌ Session creation failed:', {
        message: createError?.message,
        code: createError?.code,
        meta: createError?.meta
      });
      
      // Log KTL-4 event for session creation failure
      try {
        const errorType = createError?.code || 'unknown_error';
        await logKtl4Event({
          flowName: 'session_lifecycle',
          eventType: 'session_creation_failed',
          status: 'error',
          details: {
            error: createError?.message || 'Unknown error',
            errorType,
            tableId: data.tableId,
            source: sourceValue,
            loungeId: finalLoungeId,
            customerName: data.customerName,
            method: 'prisma_client'
          }
        });
      } catch (ktl4Error) {
        console.error('[Sessions API] Failed to log KTL-4 failure event:', ktl4Error);
      }
      
      // Return appropriate error response
      return NextResponse.json({
        error: 'Failed to create session',
        details: createError?.message || 'Unknown error',
        code: createError?.code
      }, {
        status: createError?.code === 'P2002' ? 409 : 500, // 409 for unique constraint violations
        headers: getCorsHeaders(req),
      });
    }
  } catch (error) {
      console.error('[Sessions API] Error creating session:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Log KTL-4 event for session creation failure (outer catch - validation/other errors)
      try {
        const errorType = errorMessage.includes('P2002') ? 'duplicate_entry' :
                         errorMessage.includes('expected value') ? 'enum_serialization' :
                         'validation_error';
        
        // Note: body may not be defined if error occurred during parsing
        // Use optional chaining to safely access body properties
        await logKtl4Event({
          flowName: 'session_lifecycle',
          eventType: 'session_creation_failed',
          status: 'error',
          details: {
            error: errorMessage,
            errorType,
            // body may be undefined if parsing failed
            tableId: body?.tableId,
            source: body?.source,
            loungeId: body?.loungeId,
            method: 'validation'
          }
        });
        
        // Check if we need to update health status (calculate success rate)
        const { ktl4GhostLog } = await import('../../../lib/ktl4-ghostlog');
        const recentEvents = ktl4GhostLog.getFlowEvents('session_lifecycle', 100);
        const creationEvents = recentEvents.filter(e => 
          e.eventType === 'session_created' || e.eventType === 'session_creation_failed'
        );
        
        if (creationEvents.length >= 10) {
          const successCount = creationEvents.filter(e => e.eventType === 'session_created').length;
          const successRate = (successCount / creationEvents.length) * 100;
          
          if (successRate < 80) {
            // Critical: success rate below 80%
            await updateKtl4Health('session_lifecycle', {
              flowName: 'session_lifecycle',
              status: 'critical',
              lastCheck: new Date().toISOString(),
              issues: [`Session creation success rate ${successRate.toFixed(1)}% (critical threshold: 80%)`],
              metrics: { successRate, totalAttempts: creationEvents.length, failures: creationEvents.length - successCount }
            });
          } else if (successRate < 95) {
            // Degraded: success rate below 95%
            await updateKtl4Health('session_lifecycle', {
              flowName: 'session_lifecycle',
              status: 'degraded',
              lastCheck: new Date().toISOString(),
              issues: [`Session creation success rate ${successRate.toFixed(1)}% (degraded threshold: 95%)`],
              metrics: { successRate, totalAttempts: creationEvents.length, failures: creationEvents.length - successCount }
            });
          }
        }
        
        // Create alert for enum serialization errors (critical)
        if (errorType === 'enum_serialization') {
          try {
            // Try to create alert via API or direct database insert
            await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'}/api/ktl4/alerts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                flowName: 'session_lifecycle',
                alertType: 'session_creation_enum_error',
                priority: 'P1',
                message: 'Prisma enum serialization failing, using raw SQL fallback',
                details: { error: errorMessage, errorType }
              })
            }).catch(() => {
              // API endpoint might not exist yet, log to console
              console.error('[KTL-4 Alert] Critical enum serialization error detected');
            });
          } catch (alertError) {
            console.error('[Sessions API] Failed to create KTL-4 alert:', alertError);
          }
        }
      } catch (ktl4Error) {
        // Log but don't fail the request if KTL-4 logging fails
        console.error('[Sessions API] Failed to log KTL-4 failure event:', ktl4Error);
      }
      
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
      
      // P0: Emit error bodies so test runner shows real causes
      // Check if this is a validation error that was already handled
      if (errorMessage.includes('Missing required fields')) {
        // This error was already handled by validation - don't override it
        // The validation error response should have already been returned
        console.error('[Sessions API] Validation error caught in outer catch - this should not happen');
        // Return a generic error to avoid double-handling
        return NextResponse.json({ 
          error: 'Validation error occurred',
          details: 'Check server logs for detailed validation error'
        }, {
          status: 400,
          headers: getCorsHeaders(req),
        });
      }
      
      const errorResponse: any = {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: errorMessage,
      };
      
      // Include stack in development
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error instanceof Error ? error.stack : undefined;
      }
      
      // Include request context for debugging
      if (body) {
        errorResponse.requestContext = {
          tableId: body.tableId,
          customerName: body.customerName,
          source: body.source,
        };
      }
      
      return NextResponse.json(errorResponse, {
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
      // ADMIN bypass: Allow ADMIN to bypass state machine for destructive actions
      let updatedSession: FireSession;
      if (userRole === 'ADMIN' && action === 'VOID_SESSION') {
        // ADMIN can actually DELETE sessions (not just mark as canceled)
        console.log(`[Sessions API] ADMIN delete: Deleting session ${dbSession.id} from database`);
        
        // Actually delete the session from the database
        await prisma.session.delete({
          where: { id: dbSession.id }
        });
        
        // Also delete related ReflexEvents if they exist
        try {
          await prisma.reflexEvent.deleteMany({
            where: { sessionId: dbSession.id }
          });
        } catch (reflexError) {
          // Log but don't fail if reflex events deletion fails
          console.warn('[Sessions API] Failed to delete related ReflexEvents:', reflexError);
        }
        
        console.log(`[Sessions API] ✅ Session ${dbSession.id} deleted successfully`);
        
        return NextResponse.json({
          success: true,
          message: 'Session deleted successfully',
          deleted: true,
          sessionId: dbSession.id,
          businessLogic: 'ADMIN deleted session from database'
        }, {
          headers: getCorsHeaders(req),
        });
      } else if (userRole === 'ADMIN' && action === 'PROCESS_REFUND') {
        // ADMIN can refund from any state - bypass state machine validation
        const targetStatus = 'REFUNDED';
        updatedSession = {
          ...currentSession,
          status: targetStatus as SessionStatus,
          currentStage: STATUS_TO_STAGE[targetStatus as SessionStatus],
          updatedAt: Date.now()
        };
        console.log(`[Sessions API] ADMIN bypass: ${action} from ${currentSession.status} to ${targetStatus}`);
      } else {
        // Use the state machine to transition the session for all other cases
        updatedSession = nextStateWithTrust(
          currentSession,
          { 
            type: action as SessionAction, 
            operatorId: operatorId || 'system',
            timestamp: Date.now()
          },
          userRole as UserRole
        );
      }

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