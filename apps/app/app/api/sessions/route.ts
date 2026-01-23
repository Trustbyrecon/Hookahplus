import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../lib/db';
import { SessionSource, SessionState } from '@prisma/client';
import { getCurrentUser, getCurrentTenant } from '../../../lib/auth';
import crypto from 'crypto';
import { withRequestContext, logWithRequestId, getRequestIdForLogging } from '../../../lib/api-helpers';
import { cache, CacheService } from '../../../lib/cache';
import { invalidateSessionCaches } from '../../../lib/cache-invalidation';
import { logger } from '../../../lib/logger';
import { 
  FireSession, 
  SessionStatus, 
  SessionAction, 
  UserRole,
  STATUS_TO_STAGE,
  STATUS_TO_TRACKER_STAGE,
  ACTION_TO_STATUS,
  VALID_TRANSITIONS
} from '../../../types/enhancedSession';
import { 
  canPerformAction, 
  isValidTransition, 
  nextStateWithTrust,
  calculateRemainingTime,
  ACTION_DESCRIPTIONS
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
import { withQueryTimeout, QUERY_TIMEOUTS } from '../../../lib/db-helpers';
import { resolveHID } from '../../../lib/hid/resolver';
import { syncSessionToNetwork } from '../../../lib/profiles/network';

/**
 * Handle session settlement when closing
 * Calculates final charges, reconciles payments, and triggers post-close workflows
 */
async function handleSessionSettlement(sessionId: string, session: any) {
  console.log(`[Settlement] Processing settlement for session ${sessionId}`);
  
  try {
    // Fetch full session with orders
    const fullSession = await prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        orders: {
          include: {
            items: true
          }
        }
      }
    });

    if (!fullSession) {
      throw new Error('Session not found for settlement');
    }

    // Calculate base session price
    let basePrice = fullSession.priceCents || 0;

    // Calculate order items total
    let ordersTotal = 0;
    const orderItems: any[] = [];
    for (const order of fullSession.orders || []) {
      for (const item of order.items || []) {
        const itemTotal = item.priceCents * item.quantity;
        ordersTotal += itemTotal;
        orderItems.push({
          description: item.name,
          quantity: item.quantity,
          priceCents: item.priceCents,
          subtotal: itemTotal,
        });
      }
    }

    // Calculate time-based charges if timer was running
    let timeCharge = 0;
    if (fullSession.timerStartedAt && fullSession.timerStatus === 'running') {
      const now = new Date();
      const startedAt = fullSession.timerStartedAt;
      const elapsedMinutes = Math.floor((now.getTime() - startedAt.getTime()) / (1000 * 60));
      const timerDuration = (fullSession.timerDuration || 45 * 60) / 60; // Convert to minutes
      
      // If over time, calculate overage
      if (elapsedMinutes > timerDuration) {
        const overageMinutes = elapsedMinutes - timerDuration;
        // Simple overage calculation: $1 per minute over
        timeCharge = overageMinutes * 100; // 100 cents = $1
      }
    }

    // Calculate taxes (simplified - 8% sales tax)
    const subtotal = basePrice + ordersTotal + timeCharge;
    const taxes = Math.round(subtotal * 0.08);
    const finalTotal = subtotal + taxes;

    // Log settlement calculation
    console.log(`[Settlement] Session ${sessionId} settlement:`, {
      basePrice,
      ordersTotal,
      timeCharge,
      taxes,
      finalTotal,
      orderItemsCount: orderItems.length
    });

    // Update session with final settlement amount if different from base price
    if (finalTotal !== basePrice) {
      await prisma.session.update({
        where: { id: sessionId },
        data: {
          priceCents: finalTotal,
          tableNotes: `${fullSession.tableNotes || ''}\n[${new Date().toISOString()}] Settlement completed: Base $${(basePrice/100).toFixed(2)} + Orders $${(ordersTotal/100).toFixed(2)} + Overtime $${(timeCharge/100).toFixed(2)} + Tax $${(taxes/100).toFixed(2)} = Total $${(finalTotal/100).toFixed(2)}`.trim()
        }
      });
    }

    // Trigger reconciliation if payment exists
    if (fullSession.paymentIntent || fullSession.paymentStatus === 'succeeded') {
      try {
        const { reconcilePosSettlements } = await import('../../../jobs/settle');
        await reconcilePosSettlements({
          sessionIdMatch: true,
          timeWindowMinutes: 60, // Match within 1 hour
        });
        console.log(`[Settlement] Reconciliation triggered for session ${sessionId}`);
      } catch (reconcileError) {
        console.error(`[Settlement] Reconciliation failed for session ${sessionId}:`, reconcileError);
        // Non-blocking - reconciliation can be retried later
      }
    }

    // Award loyalty points if customer phone exists and payment was successful
    // Only award if payment was already completed (to avoid double-awarding)
    if (fullSession.customerPhone && fullSession.paymentStatus === 'succeeded') {
      try {
        // Check if points were already awarded (by checking for existing transaction)
        const existingTransaction = await prisma.loyaltyTransaction.findFirst({
          where: {
            sessionId: sessionId,
            type: 'EARN',
            source: 'purchase'
          }
        });

        // Only award additional points if final amount is higher than what was paid initially
        // and no transaction exists yet (points not awarded on payment)
        if (!existingTransaction) {
          const { awardLoyaltyPoints } = await import('../../../core/handlePaymentCompleted');
          await awardLoyaltyPoints({
            customerPhone: fullSession.customerPhone,
            loungeId: fullSession.loungeId,
            sessionId: sessionId,
            amountCents: finalTotal,
            tenantId: fullSession.tenantId || null
          });
          console.log(`[Settlement] Loyalty points awarded for session ${sessionId}`);
        } else if (finalTotal > (fullSession.priceCents || 0)) {
          // Award additional points for the difference
          const differenceCents = finalTotal - (fullSession.priceCents || 0);
          if (differenceCents > 0) {
            const { awardLoyaltyPoints: awardAdditionalPoints } = await import('../../../core/handlePaymentCompleted');
            await awardAdditionalPoints({
              customerPhone: fullSession.customerPhone,
              loungeId: fullSession.loungeId,
              sessionId: sessionId,
              amountCents: differenceCents,
              tenantId: fullSession.tenantId || null
            });
            console.log(`[Settlement] Additional loyalty points awarded for settlement difference: ${differenceCents} cents`);
          }
        }
      } catch (loyaltyError) {
        console.error(`[Settlement] Failed to award loyalty points (non-blocking):`, loyaltyError);
      }
    }

    // Publish SessionClosed event for post-close workflows
    try {
      const { eventQueue } = await import('../../../lib/events/queue');
      await eventQueue.publish({
        id: `evt_${Date.now()}_${sessionId}`,
        type: 'SessionClosed',
        sessionId: sessionId,
        loungeId: fullSession.loungeId,
        payload: {
          reason: 'manual_close',
          autoClosed: false,
          finalAmount: finalTotal,
          settlementCompleted: true,
        },
        timestamp: new Date()
      });
      console.log(`[Settlement] SessionClosed event published for session ${sessionId}`);
    } catch (eventError) {
      console.error(`[Settlement] Failed to publish SessionClosed event:`, eventError);
      // Non-blocking
    }

    return {
      success: true,
      basePrice,
      ordersTotal,
      timeCharge,
      taxes,
      finalTotal,
      orderItems
    };
  } catch (error) {
    console.error(`[Settlement] Error processing settlement for session ${sessionId}:`, error);
    throw error;
  }
}

// CORS headers helper - accepts request to get origin
function getCorsHeaders(req?: NextRequest) {
  // Allow requests from site build, app build, or guest build
  const origin = req?.headers.get('origin');
  const allowedOrigins = [
    // Production domains
    'https://hookahplus.net',
    'https://www.hookahplus.net',
    'https://app.hookahplus.net',
    'https://guest.hookahplus.net',
    // Environment variable (can override)
    process.env.NEXT_PUBLIC_SITE_URL,
    // Local development
    'http://localhost:3000',
    'http://localhost:3002',
    'http://localhost:3001', // Guest build
  ].filter(Boolean); // Remove undefined values
  
  // If origin matches allowed list, use it; otherwise check if it's a hookahplus.net domain
  let allowedOrigin: string = allowedOrigins[0] || 'https://hookahplus.net'; // Default fallback
  
  if (origin) {
    // Exact match
    if (allowedOrigins.includes(origin)) {
      allowedOrigin = origin;
    } 
    // Allow any hookahplus.net subdomain in production
    else if (origin.includes('hookahplus.net') && process.env.NODE_ENV === 'production') {
      allowedOrigin = origin;
    }
    // Allow localhost in development
    else if (origin.includes('localhost') && process.env.NODE_ENV === 'development') {
      allowedOrigin = origin;
    }
  }
    
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
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
// NOTE: This is a duplicate - the real function is in lib/session-utils-prisma.ts
// Keeping for backward compatibility but should use convertPrismaSessionToFireSession instead
function mapPrismaStateToFireSession(state: string | SessionState, paymentStatus?: string | null, externalRef?: string | null): SessionStatus {
  // Convert enum to string if needed
  const stateStr = typeof state === 'string' ? state : String(state);
  
  // Special handling: PENDING + paymentStatus 'succeeded' = PAID_CONFIRMED
  // OR: PENDING + externalRef (Stripe checkout session ID) = PAID_CONFIRMED (payment confirmed via Stripe)
  // This is the key fix: after Stripe payment, sessions should show as PAID_CONFIRMED
  if (stateStr === 'PENDING' && (paymentStatus === 'succeeded' || (externalRef && externalRef.startsWith('cs_')))) {
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

export const GET = withRequestContext(async (req: NextRequest): Promise<NextResponse> => {
  // Graceful fallback: Check if DATABASE_URL is loaded
  const isDevelopment = process.env.NODE_ENV === 'development';
  const allowFallback = isDevelopment || process.env.ALLOW_DB_FALLBACK === 'true';
  
  if (!process.env.DATABASE_URL) {
    logWithRequestId('[Sessions API] ⚠️ DATABASE_URL is not set!');
    logWithRequestId('[Sessions API] NODE_ENV:', process.env.NODE_ENV);
    logWithRequestId('[Sessions API] process.cwd():', process.cwd());
    
    // In development or when fallback is explicitly allowed, return empty results gracefully
    if (allowFallback) {
      console.warn('[Sessions API] Using graceful fallback mode - returning empty results');
      return NextResponse.json(
        {
          success: true,
          sessions: [],
          total: 0,
          stages: {
            BOH: 0,
            FOH: 0,
            CUSTOMER: 0
          },
          fallbackMode: true,
          message: 'Database not configured. Sessions will not persist. Set DATABASE_URL to enable database features.',
          diagnostic: {
            nodeEnv: process.env.NODE_ENV,
            cwd: process.cwd(),
            hint: 'Check if .env.local exists in apps/app directory with DATABASE_URL=file:./prisma/dev.db'
          }
        },
        { status: 200, headers: getCorsHeaders(req) }
      );
    }
    
    // In production without fallback, return error
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

    // Check for demo mode from query params or First Light mode from env
    const isDemoMode = searchParams.get('mode') === 'demo' || searchParams.get('isDemo') === 'true';
    const firstLightMode = process.env.FIRST_LIGHT_MODE === 'true';
    const firstLightFocus = searchParams.get('firstLightFocus') === 'true';
    
    // In demo mode or First Light mode, bypass auth/tenant checks
    let user = null;
    let tenantId: string | null = null;
    
    if (!isDemoMode && !firstLightMode) {
      // Fetch all sessions from database
      // Filter by tenant_id if user is authenticated (RLS will also enforce this)
      user = await getCurrentUser(req);
      tenantId = user ? await getCurrentTenant(req) : null;
    } else {
      if (firstLightMode) {
        console.log('[Sessions API] First Light mode: Bypassing auth/tenant checks');
      } else {
        console.log('[Sessions API] Demo mode: Bypassing auth/tenant checks');
      }
    }
    
    // Build where clause outside try block so it's available in catch
    const whereClause: any = {};
    
    // If authenticated, filter by tenant_id (RLS will also enforce)
    if (tenantId) {
      whereClause.tenantId = tenantId;
    }
    
    // CRITICAL: Exclude voided/canceled sessions - they are no longer viable transactions
    whereClause.state = { notIn: ['CANCELED'] as any };
    
    // CRITICAL: Only show sessions with payment confirmed
    // Sessions should only appear after payment is verified
    whereClause.OR = [
      { paymentStatus: 'succeeded' },
      { externalRef: { not: null } } // Has Stripe checkout session ID
    ];
    console.log('[Sessions API] Filtering: Only showing sessions with payment confirmed');
    
    // First Light Focus: Only show sessions from the last hour
    if (firstLightMode && firstLightFocus) {
      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      whereClause.createdAt = {
        gte: oneHourAgo,
      };
      console.log('[Sessions API] First Light Focus: Showing only sessions from the last hour');
    }
    // If not authenticated, this is a public route - RLS will handle filtering
    
    let dbSessions;
    try {
      // Use select to only query columns that definitely exist
      // This prevents errors if optional columns like session_type don't exist yet
      dbSessions = await withQueryTimeout(
        prisma.session.findMany({
        where: whereClause,
        select: {
          id: true,
          externalRef: true,
          source: true,
          trustSignature: true,
          tableId: true,
          customerRef: true,
          customerPhone: true,
          flavor: true,
          flavorMix: true,
          loungeId: true,
          priceCents: true,
          // sessionType: true, // Commented out - column may not exist
          // hadRefill: true, // Commented out - column may not exist
          // refillCount: true, // Commented out - column may not exist
          state: true,
          edgeCase: true,
          edgeNote: true,
          assignedBOHId: true,
          assignedFOHId: true,
          startedAt: true,
          endedAt: true,
          durationSecs: true,
          paymentIntent: true,
          paymentStatus: true,
          orderItems: true,
          posMode: true,
          version: true,
          createdAt: true,
          updatedAt: true,
          timerDuration: true,
          timerStartedAt: true,
          timerPausedAt: true,
          timerPausedDuration: true,
          timerStatus: true,
          zone: true,
          fohUserId: true,
          specialRequests: true,
          tableNotes: true,
          qrCodeUrl: true,
          sessionStateV1: true,
          paused: true,
          tenantId: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    );
    } catch (dbError: any) {
      // If query fails due to missing columns, try with minimal select
      if (dbError?.code === 'P2022' || dbError?.message?.includes('does not exist')) {
        console.warn('[Sessions API] Column missing, trying minimal query:', dbError?.message);
        try {
          // Fallback: query only essential columns
          dbSessions = await withQueryTimeout(
            prisma.session.findMany({
              where: whereClause,
              select: {
                id: true,
                tableId: true,
                customerRef: true,
                customerPhone: true,
                flavor: true,
                flavorMix: true,
                priceCents: true,
                state: true,
                assignedBOHId: true,
                assignedFOHId: true,
                startedAt: true,
                endedAt: true,
                durationSecs: true,
                paymentStatus: true,
                externalRef: true, // Required for payment detection
                createdAt: true,
                updatedAt: true,
                timerDuration: true,
                timerStartedAt: true,
                timerStatus: true,
              },
              orderBy: {
                createdAt: 'desc'
              }
            })
          );
        } catch (fallbackError: any) {
          console.error('[Sessions API] Fallback query also failed:', fallbackError?.message);
          throw fallbackError;
        }
      } else {
        console.error('[Sessions API] Failed to fetch sessions:', dbError?.message);
        throw dbError;
      }
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
    const isDbConnectionError = errorMessage.includes('Can\'t reach database') || 
                                errorMessage.includes('connection') ||
                                errorMessage.includes('the URL must start with the protocol') ||
                                error?.code === 'P1001' ||
                                error?.code === 'P1012';
    
    // Graceful fallback in development mode
    const isDevelopment = process.env.NODE_ENV === 'development';
    const allowFallback = isDevelopment || process.env.ALLOW_DB_FALLBACK === 'true';
    
    if (isDbConnectionError && allowFallback) {
      console.warn('[Sessions API] Database connection error in fallback mode - returning empty results');
      return NextResponse.json({ 
        success: true,
        sessions: [],
        total: 0,
        stages: {
          BOH: 0,
          FOH: 0,
          CUSTOMER: 0
        },
        fallbackMode: true,
        message: 'Database connection unavailable. Sessions will not persist. Configure DATABASE_URL to enable database features.',
        error: 'Database connection failed (fallback mode active)',
        details: isDevelopment ? errorMessage : undefined,
        diagnostic: {
          errorCode: error?.code,
          hint: 'Set DATABASE_URL=file:./prisma/dev.db in .env.local for SQLite, or configure PostgreSQL connection string'
        }
      }, { 
        status: 200,
        headers: getCorsHeaders(req),
      });
    }
    
    if (isDbConnectionError) {
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: errorMessage,
        hint: 'Check DATABASE_URL and ensure database is running'
      }, { 
        status: 503,
        headers: getCorsHeaders(req),
      });
    }
    
    // Provide user-friendly error message (First Light: no demo data fallback)
    const userMessage = isDbConnectionError
      ? 'Database connection failed. Check DATABASE_URL and ensure database is running.'
      : 'Internal server error';
    
    return NextResponse.json({ 
      error: userMessage,
      details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined,
      diagnostic: {
        errorCode: error?.code,
        hint: 'First Light mode: Demo data is disabled. Database connection is required.'
      }
    }, { 
      status: 500,
      headers: getCorsHeaders(req),
    });
  }
});

export const POST = withRequestContext(async (req: NextRequest): Promise<NextResponse> => {
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
    
    // Auto-assign staff based on zone routing (if not already assigned)
    if (!data.assignedFoh && data.tableId) {
      try {
        // Use internal API call for zone routing
        const { ZoneRoutingService } = await import('../../../lib/services/ZoneRoutingService');
        const { TableLayoutService } = await import('../../../lib/services/TableLayoutService');
        
        // Get table zone
        const tableZone = await ZoneRoutingService.getTableZone(data.tableId) || 'Main';
        
        // Get active sessions to calculate staff load
        const activeSessionsForRouting = await prisma.session.findMany({
          where: {
            state: { notIn: ['CLOSED', 'CANCELED'] as any }
          },
          select: {
            id: true,
            tableId: true,
            assignedBOHId: true,
            assignedFOHId: true
          }
        });
        
        // Build staff map
        const staffMap = new Map<string, { id: string; name: string; role: string; currentLoad: number }>();
        activeSessionsForRouting.forEach(session => {
          if (session.assignedFOHId) {
            const existing = staffMap.get(session.assignedFOHId);
            if (existing) {
              existing.currentLoad++;
            } else {
              staffMap.set(session.assignedFOHId, {
                id: session.assignedFOHId,
                name: session.assignedFOHId,
                role: 'FOH',
                currentLoad: 1
              });
            }
          }
        });
        
        const availableStaff = Array.from(staffMap.values());
        
        // Get routing decision
        const routing = ZoneRoutingService.routeSessionToStaff(
          data.tableId,
          tableZone,
          availableStaff,
          activeSessionsForRouting.map(s => ({
            tableId: s.tableId || '',
            assignedStaff: {
              foh: s.assignedFOHId || undefined,
              boh: s.assignedBOHId || undefined
            }
          }))
        );
        
        if (routing.recommendedStaffId) {
          data.assignedFoh = routing.recommendedStaffId;
          console.log('[Sessions API] Auto-assigned FOH staff:', routing.recommendedStaffName, 'for zone:', tableZone);
        }
      } catch (error) {
        console.warn('[Sessions API] Zone routing failed (non-blocking):', error);
        // Continue without auto-assignment
      }
    }
    
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

    // Validate tableId against saved layout
    // First check Seat table (new system), then fallback to orgSetting (legacy)
    try {
      let tableExists = false;
      let tables: any[] = [];

      // Check Seat table first (new system)
      if (finalLoungeId) {
        const seats = await prisma.seat.findMany({
          where: { 
            loungeId: finalLoungeId,
            status: 'ACTIVE'
          },
          include: {
            zone: true
          }
        });

        if (seats.length > 0) {
          tables = seats.map(seat => ({
            id: seat.tableId,
            name: seat.name || seat.tableId,
            capacity: seat.capacity,
            zone: seat.zone?.name || 'Main Floor'
          }));

          tableExists = seats.some(seat => 
            seat.tableId === data.tableId ||
            seat.name === data.tableId ||
            seat.name?.toLowerCase() === data.tableId.toLowerCase() ||
            seat.tableId?.toLowerCase() === data.tableId.toLowerCase()
          );
        }
      }

      // Fallback to orgSetting if no seats found
      if (!tableExists && tables.length === 0) {
      const layoutSetting = await prisma.orgSetting.findUnique({
        where: { key: 'lounge_layout' }
      });

      if (layoutSetting) {
        const layoutData = JSON.parse(layoutSetting.value);
          tables = layoutData.tables || [];
        
          tableExists = tables.some((t: any) => 
          t.id === data.tableId || 
          t.name === data.tableId ||
          t.name?.toLowerCase() === data.tableId.toLowerCase()
        );
        }
      }

        if (!tableExists) {
          // Graceful fallback: Use demo table data for demo/onboarding flows
          const demoTables = [
            { id: 'table-001', name: 'T-001', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
            { id: 'table-002', name: 'T-002', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
            { id: 'table-003', name: 'T-003', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
            { id: 'table-004', name: 'T-004', capacity: 2, seatingType: 'Bar Seating', zone: 'Main Floor' },
            { id: 'table-005', name: 'T-005', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
            { id: 'table-006', name: 'T-006', capacity: 8, seatingType: 'Outdoor', zone: 'Main Floor' },
            { id: 'table-007', name: 'T-007', capacity: 4, seatingType: 'Booth', zone: 'Main Floor' },
            { id: 'table-008', name: 'T-008', capacity: 10, seatingType: 'VIP', zone: 'VIP Section' },
            { id: 'table-009', name: 'T-009', capacity: 6, seatingType: 'Couch', zone: 'Main Floor' },
            { id: 'table-010', name: 'T-010', capacity: 8, seatingType: 'Private Room', zone: 'Private Section' }
          ];

          // Try to find in demo tables
          const demoTable = demoTables.find(t => 
            t.id === data.tableId || 
            t.name === data.tableId ||
            t.id.toLowerCase() === data.tableId.toLowerCase() ||
            t.name.toLowerCase() === data.tableId.toLowerCase()
          );

          if (demoTable) {
            // Use demo table (graceful fallback for demo/onboarding)
            console.log(`[Sessions API] Using demo table fallback for: ${data.tableId}`);
            tableExists = true;
            // Continue with session creation using demo table
          } else {
            // In demo/onboarding mode, allow any table ID and create session anyway
            // This enables guest sync and demo flows to work without pre-configured tables
            console.log(`[Sessions API] Table "${data.tableId}" not found, but allowing in demo mode - session will be created`);
            tableExists = true; // Allow session creation even if table doesn't exist
            // Log warning but don't block
            console.warn(`[Sessions API] Demo mode: Creating session with non-existent table "${data.tableId}". For production, configure tables in Lounge Layout Manager.`);
          }
        }

        // Validate capacity if party size provided (could be in metadata or calculated)
        // For now, we'll validate basic capacity - can be enhanced later
        const table = tables.find((t: any) => 
          t.id === data.tableId || 
          t.name === data.tableId ||
          t.name?.toLowerCase() === data.tableId.toLowerCase()
        );

        if (table && table.capacity) {
          // Note: Party size validation would require additional data
          // This is a foundation - can be enhanced with party size from request
      }
    } catch (layoutError: any) {
      // Don't block session creation if layout check fails (graceful degradation)
      console.warn('[Sessions API] Layout validation error (non-blocking):', layoutError.message);
    }

    // Check if session already exists (idempotency check)
    // First check by externalRef if provided, then by tableId
    // Use minimal select to avoid columns that don't exist
    let existingSession: any = null;
    try {
      // If externalRef is provided, check by externalRef first (more specific)
      if (finalExternalRef) {
        existingSession = await prisma.session.findFirst({
          where: {
            externalRef: finalExternalRef,
            state: { notIn: ['CLOSED', 'CANCELED'] as any }
          },
          select: {
            id: true,
            tableId: true,
            state: true,
            customerRef: true,
            externalRef: true,
          }
        });
      }
      
      // If not found by externalRef, check by tableId (fallback)
      if (!existingSession) {
        existingSession = await prisma.session.findFirst({
          where: {
            tableId: data.tableId,
            state: { notIn: ['CLOSED', 'CANCELED'] as any }
          },
          select: {
            id: true,
            tableId: true,
            state: true,
            customerRef: true,
            externalRef: true,
          }
        });
      }
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
    // Only include columns that exist in the database (First Light: handle missing columns gracefully)
    let newSession: any;
    try {
      // Build minimal create data with only essential columns that definitely exist
      const createData: any = {
        id: sessionId,
        externalRef: finalExternalRef,
        source: data.source as SessionSource,
        state: 'PENDING' as SessionState,
        trustSignature,
        tableId: data.tableId,
        customerRef: data.customerName,
        customerPhone: data.customerPhone || null,
        flavor: finalFlavor,
        flavorMix: finalFlavorMix,
        loungeId: finalLoungeId,
        priceCents: finalPriceCents,
        // sessionType: sessionPricingType, // Commented out - column may not exist
        assignedBOHId: data.assignedBoh || null,
        assignedFOHId: data.assignedFoh || null,
        tableNotes: data.notes || null,
        durationSecs: data.sessionDuration || null,
        // tenantId: finalTenantId || null, // Commented out - column doesn't exist in database
        paymentStatus: isDemoMode ? 'succeeded' : null,
        // Note: hadRefill, refillCount, sessionType, sessionStateV1, paused columns skipped
        // These may not exist in the database yet - migrations may not be run
      };

      try {
        newSession = await prisma.session.create({
          data: createData
        });
      } catch (createError: any) {
        // If creation fails due to missing columns, use raw SQL to insert only existing columns
        if (createError?.code === 'P2022' || createError?.message?.includes('does not exist')) {
          console.warn('[Sessions API] Column missing, using raw SQL fallback:', createError?.message);
          try {
            // Use raw SQL to insert only columns that exist (bypasses Prisma defaults)
            // Escape values for SQL injection safety
            const escapeSql = (val: any) => {
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'number') return String(val);
              return `'${String(val).replace(/'/g, "''")}'`;
            };
            
            // Only include columns that exist in the database
            // tenantId column doesn't exist - removed from INSERT
            const insertResult = await prisma.$queryRawUnsafe(`
              INSERT INTO "Session" (
                id, "externalRef", source, "trustSignature", "tableId", 
                "customerRef", "customerPhone", flavor, "flavorMix", 
                "loungeId", "priceCents", state, 
                "assignedBOHId", "assignedFOHId", "tableNotes", 
                "durationSecs", "paymentStatus", 
                "createdAt", "updatedAt"
              )
              VALUES (
                ${escapeSql(sessionId)},
                ${escapeSql(finalExternalRef)},
                ${escapeSql(data.source)},
                ${escapeSql(trustSignature)},
                ${escapeSql(data.tableId)},
                ${escapeSql(data.customerName)},
                ${escapeSql(data.customerPhone || null)},
                ${escapeSql(finalFlavor || 'Custom Mix')},
                ${escapeSql(finalFlavorMix || null)},
                ${escapeSql(finalLoungeId)},
                ${escapeSql(finalPriceCents)},
                ${escapeSql('PENDING')},
                ${escapeSql(data.assignedBoh || null)},
                ${escapeSql(data.assignedFoh || null)},
                ${escapeSql(data.notes || null)},
                ${escapeSql(data.sessionDuration || null)},
                ${escapeSql(isDemoMode ? 'succeeded' : null)},
                NOW(),
                NOW()
              )
              RETURNING id, "externalRef", source, state, "tableId", "customerRef", "customerPhone", 
                        flavor, "flavorMix", "loungeId", "priceCents", "assignedBOHId", "assignedFOHId", 
                        "tableNotes", "durationSecs", "paymentStatus", "createdAt", "updatedAt"
            `) as any[];
            
            if (insertResult && insertResult.length > 0) {
              newSession = insertResult[0];
              console.log('[Sessions API] ✅ Session created via raw SQL fallback:', newSession.id);
            } else {
              throw new Error('Raw SQL insert returned no rows');
            }
          } catch (sqlError: any) {
            console.error('[Sessions API] Raw SQL fallback also failed:', sqlError?.message);
            throw sqlError;
          }
        } else {
          throw createError;
        }
      }
      
      // Invalidate cache since new session affects availability and analytics
      try {
        invalidateSessionCaches();
      } catch (cacheError) {
        console.error('[Sessions API] Cache invalidation error (non-fatal):', cacheError);
      }

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

        // Moat: best-effort HID resolution + network session sync (non-blocking)
        // Never log raw PII here. HID itself is safe; phone/email are not.
        if (!isDemoMode && (data.customerPhone || body?.customerEmail)) {
          try {
            const customerEmail =
              body?.customerEmail && typeof body.customerEmail === 'string'
                ? body.customerEmail.trim()
                : undefined;

            const hidResult = await resolveHID({
              phone: data.customerPhone || undefined,
              email: customerEmail || undefined,
            });

            if (hidResult?.hid) {
              await syncSessionToNetwork(
                newSession.id,
                hidResult.hid,
                finalLoungeId,
                Array.isArray(data.flavorMix) ? data.flavorMix : undefined,
                finalPriceCents || undefined,
                data.externalRef || undefined
              );

              logger.info('Network session sync completed', {
                component: 'network',
                action: 'sync_session',
                sessionId: newSession.id,
                loungeId: finalLoungeId,
                hidPrefix: String(hidResult.hid).slice(0, 8),
              });
            }
          } catch (networkError) {
            logger.warn(
              'Network session sync failed (non-blocking)',
              {
                component: 'network',
                action: 'sync_session_failed',
                sessionId: newSession.id,
                loungeId: finalLoungeId,
                error: networkError instanceof Error ? networkError.message : String(networkError),
              },
              networkError instanceof Error ? networkError : new Error(String(networkError))
            );
          }
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
        // Include session ID at top level for easier extraction by clients
        return NextResponse.json({ 
          success: true, 
          id: fireSession.id, // Top-level ID for easy extraction
          sessionId: fireSession.id, // Alternative key for compatibility
          session: fireSession,
          message: 'Session created successfully',
          nextActions: ['CLAIM_PREP', 'PUT_ON_HOLD'],
          businessLogic: 'New session created - BOH can claim prep or put on hold'
        }, {
          headers: getCorsHeaders(req),
        });
      }
      
      // Fallback: If newSession is somehow not set, return error
      return NextResponse.json({ 
        error: 'Session creation failed',
        details: 'Session was not created successfully'
      }, {
        status: 500,
        headers: getCorsHeaders(req),
      });
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
      const createErrorMessage = createError instanceof Error ? createError.message : String(createError);
      const isDbConnectionError =
        createErrorMessage.includes("Can't reach database") ||
        createErrorMessage.toLowerCase().includes('connection') ||
        createErrorMessage.includes('the URL must start with the protocol') ||
        createError?.code === 'P1001' ||
        createError?.code === 'P1012' ||
        createError?.name === 'PrismaClientInitializationError';

      const isDevelopment = process.env.NODE_ENV === 'development';
      const allowFallback = isDevelopment || process.env.ALLOW_DB_FALLBACK === 'true';

      // Graceful fallback: allow creating an ephemeral session when DB is unavailable
      // This keeps onboarding/testing unblocked (session will not persist).
      if (isDbConnectionError && allowFallback) {
        console.warn('[Sessions API] Database unavailable - returning ephemeral session (fallback mode)');

        const priceCentsFallback = data.amount
          ? (data.amount < 100 ? Math.round(data.amount * 100) : Math.round(data.amount))
          : 3000;

        const fallbackSession: FireSession = {
          id: sessionId,
          tableId: data.tableId,
          customerName: data.customerName,
          customerPhone: data.customerPhone || '',
          flavor: (data.flavorMix && data.flavorMix.length > 0 ? data.flavorMix.join(' + ') : 'Custom Mix') as any,
          amount: priceCentsFallback,
          status: 'PAID_CONFIRMED' as any,
          state: 'PENDING' as any,
          paymentStatus: 'succeeded' as any,
          externalRef: data.externalRef || `fallback_${sessionId}`,
          currentStage: 'BOH' as any,
          assignedStaff: { boh: data.assignedBoh || undefined, foh: data.assignedFoh || undefined } as any,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          sessionStartTime: undefined,
          sessionDuration: data.sessionDuration || 45 * 60,
          coalStatus: 'active' as any,
          refillStatus: 'none' as any,
          notes: data.notes || 'Ephemeral session (DB not configured)',
          edgeCase: null,
          bohState: 'PREPARING' as any,
          guestTimerDisplay: false,
        };

        return NextResponse.json(
          {
            success: true,
            fallbackMode: true,
            ephemeral: true,
            id: fallbackSession.id,
            sessionId: fallbackSession.id,
            session: fallbackSession,
            message: 'Database unavailable. Created an ephemeral session for testing (will not persist).',
            nextActions: ['CLAIM_PREP', 'PUT_ON_HOLD'],
            businessLogic: 'Ephemeral session created so you can keep testing without database setup.'
          },
          {
            status: 200,
            headers: getCorsHeaders(req),
          }
        );
      }

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
      
      // Log full error details for debugging
      console.error('[Sessions API] ❌ Session creation failed:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        code: (error as any)?.code,
        meta: (error as any)?.meta,
        stack: error instanceof Error ? error.stack : undefined,
        body: body ? {
          tableId: body.tableId,
          customerName: body.customerName,
          source: body.source,
        } : null,
      });
      
      const errorResponse: any = {
        error: error instanceof Error ? error.message : 'Internal server error',
        details: errorMessage,
        code: (error as any)?.code,
      };
      
      // Include stack in development
      if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error instanceof Error ? error.stack : undefined;
        errorResponse.meta = (error as any)?.meta;
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
});

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
    
    // Log the incoming request for debugging
    console.log('[Sessions API] PATCH request received:', {
      sessionId,
      action,
      userRole,
      hasOperatorId: !!body.operatorId,
      hasNotes: !!body.notes
    });
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

    // Check for demo mode from query params or session ID pattern
    const { searchParams } = new URL(req.url);
    const isDemo = searchParams.get('mode') === 'demo' || 
                   searchParams.get('demo') === 'true' ||
                   sessionId.startsWith('demo-') ||
                   sessionId.startsWith('demo_');

    // Demo mode: return demo session data (read-only for now)
    if (isDemo) {
      const demoSession = {
        id: sessionId,
        tableId: 'T-005',
        customerRef: 'Sarah & Friends',
        customerPhone: '+1 (555) 234-5678',
        flavor: 'Blue Mist + Mint Fresh',
        flavorMix: ['Blue Mist', 'Mint Fresh'],
        priceCents: 3500,
        state: 'PAID_CONFIRMED',
        paymentStatus: 'succeeded',
        assignedBOHId: null,
        assignedFOHId: null,
        startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        durationSecs: 60 * 60,
        edgeCase: null,
        edgeNote: 'Demo session - ready to test night after night flow',
        source: 'demo',
        loungeId: 'demo-lounge',
        tableNotes: notes || 'Demo session - ready to test night after night flow',
      };

      const fireSession = convertPrismaSessionToFireSession(demoSession);
      return NextResponse.json({ 
        success: true, 
        session: fireSession,
        message: 'Demo mode: Session data returned (no database updates in demo)',
        businessLogic: 'Demo sessions are read-only'
      });
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
    // Use explicit select to avoid querying non-existent columns like session_type
    let dbSession: any;
    try {
      dbSession = await prisma.session.findFirst({
        where: {
          OR: [
            { id: sessionId },
            { externalRef: sessionId },
            { tableId: sessionId }
          ]
        },
        select: {
          id: true,
          state: true,
          tableId: true,
          customerRef: true,
          externalRef: true,
          paymentStatus: true,
          assignedBOHId: true,
          assignedFOHId: true,
          tableNotes: true,
          edgeCase: true,
          edgeNote: true,
          startedAt: true,
          endedAt: true,
          createdAt: true,
          updatedAt: true,
          flavor: true,
          flavorMix: true,
          priceCents: true,
          loungeId: true,
          source: true,
          trustSignature: true,
          durationSecs: true,
          customerPhone: true,
          // Explicitly exclude session_type and other columns that might not exist
        }
      });
    } catch (findError: any) {
      // If findFirst fails due to missing columns, use raw SQL
      if (findError?.code === 'P2022' || findError?.message?.includes('does not exist')) {
        console.warn('[Sessions API] Column missing in findFirst, using raw SQL fallback:', findError?.message);
        
        const escapeSql = (val: any) => {
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (typeof val === 'number') return String(val);
          return `'${String(val).replace(/'/g, "''")}'`;
        };
        
        const result = await prisma.$queryRawUnsafe(`
          SELECT 
            id, state, "tableId", "customerRef", "externalRef", "paymentStatus",
            "assignedBOHId", "assignedFOHId", "tableNotes", "edgeCase", "edgeNote",
            "startedAt", "endedAt", "createdAt", "updatedAt", flavor, "flavorMix",
            "priceCents", "loungeId", source, "trustSignature", "durationSecs", "customerPhone"
          FROM "Session"
          WHERE id = ${escapeSql(sessionId)}
             OR "externalRef" = ${escapeSql(sessionId)}
             OR "tableId" = ${escapeSql(sessionId)}
          LIMIT 1
        `) as any[];
        
        dbSession = result && result.length > 0 ? result[0] : null;
      } else {
        throw findError;
      }
    }

    if (!dbSession) {
      // Log what we searched for to help debug
      console.error('[Sessions API] Session not found:', {
        sessionId,
        searchedFields: ['id', 'externalRef', 'tableId'],
        note: 'Session may have been deleted or sessionId format is incorrect'
      });
      
      return NextResponse.json({ 
        error: 'Session not found',
        details: `No session found with id/externalRef/tableId: ${sessionId}. The session may have been deleted or the ID format is incorrect.`,
        sessionId,
        searchedFields: ['id', 'externalRef', 'tableId']
      }, { 
        status: 404,
        headers: getCorsHeaders(req),
      });
    }

    // Convert to FireSession format for state machine
    const currentSession = convertPrismaSessionToFireSession(dbSession);
    
    console.log('[Sessions API] PATCH request:', {
      sessionId,
      action,
      userRole,
      currentStatus: currentSession.status,
      currentState: dbSession.state,
      paymentStatus: dbSession.paymentStatus,
      externalRef: dbSession.externalRef,
      assignedBOHId: dbSession.assignedBOHId,
      sessionIdFromDb: dbSession.id,
      // Debug: Check if status mapping is correct
      dbStateString: String(dbSession.state),
      isPaid: dbSession.paymentStatus === 'succeeded' || (dbSession.externalRef && (dbSession.externalRef.startsWith('cs_') || dbSession.externalRef.startsWith('test_cs_')))
    });
    
    // Validate that session is in a valid state for the requested action
    if (!currentSession || !currentSession.status) {
      console.error('[Sessions API] Invalid session conversion:', {
        dbSession: {
          id: dbSession.id,
          state: dbSession.state,
          paymentStatus: dbSession.paymentStatus,
          externalRef: dbSession.externalRef
        },
        convertedSession: currentSession
      });
      return NextResponse.json({ 
        error: 'Invalid session state',
        details: 'Session could not be converted to valid state. Check server logs.',
        sessionId,
        dbState: dbSession.state,
        paymentStatus: dbSession.paymentStatus
      }, { 
        status: 400,
        headers: getCorsHeaders(req),
      });
    }

    try {
      // ADMIN bypass: Allow ADMIN to bypass state machine for destructive actions
      let updatedSession: FireSession;
      if (userRole === 'ADMIN' && action === 'VOID_SESSION') {
        // ADMIN can actually DELETE sessions (not just mark as canceled)
        console.log(`[Sessions API] ADMIN delete: Deleting session ${dbSession.id} from database`);
        
        // Delete related records first (in correct order to avoid foreign key violations)
        // Note: Order, Delivery, and SessionNote have onDelete: Cascade, so they auto-delete
        try {
          // Delete SessionEvent records (no cascade delete)
          await prisma.sessionEvent.deleteMany({
            where: { sessionId: dbSession.id }
          });
          console.log(`[Sessions API] Deleted SessionEvent records for session ${dbSession.id}`);
        } catch (sessionEventError) {
          console.warn('[Sessions API] Failed to delete SessionEvent records:', sessionEventError);
          // Continue anyway - might not exist
        }
        
        try {
          // Delete ReflexEvent records (no cascade delete)
          await prisma.reflexEvent.deleteMany({
            where: { sessionId: dbSession.id }
          });
          console.log(`[Sessions API] Deleted ReflexEvent records for session ${dbSession.id}`);
        } catch (reflexError) {
          console.warn('[Sessions API] Failed to delete ReflexEvent records:', reflexError);
          // Continue anyway - might not exist
        }
        
        try {
          // Delete Payment records (no cascade delete)
          await prisma.payment.deleteMany({
            where: { sessionId: dbSession.id }
          });
          console.log(`[Sessions API] Deleted Payment records for session ${dbSession.id}`);
        } catch (paymentError) {
          console.warn('[Sessions API] Failed to delete Payment records:', paymentError);
          // Continue anyway - might not exist
        }
        
        try {
          // Delete CampaignUsage records (no cascade delete)
          await prisma.campaignUsage.deleteMany({
            where: { sessionId: dbSession.id }
          });
          console.log(`[Sessions API] Deleted CampaignUsage records for session ${dbSession.id}`);
        } catch (campaignError) {
          console.warn('[Sessions API] Failed to delete CampaignUsage records:', campaignError);
          // Continue anyway - might not exist
        }
        
        try {
          // Delete SettlementReconciliation records (no cascade delete)
          await prisma.settlementReconciliation.deleteMany({
            where: { sessionId: dbSession.id }
          });
          console.log(`[Sessions API] Deleted SettlementReconciliation records for session ${dbSession.id}`);
        } catch (settlementError) {
          console.warn('[Sessions API] Failed to delete SettlementReconciliation records:', settlementError);
          // Continue anyway - might not exist
        }
        
        try {
          // Delete PosTicket records (no cascade delete)
          await prisma.posTicket.deleteMany({
            where: { sessionId: dbSession.id }
          });
          console.log(`[Sessions API] Deleted PosTicket records for session ${dbSession.id}`);
        } catch (posTicketError) {
          console.warn('[Sessions API] Failed to delete PosTicket records:', posTicketError);
          // Continue anyway - might not exist
        }
        
        try {
          // Delete LoyaltyTransaction records (no cascade delete)
          await prisma.loyaltyTransaction.deleteMany({
            where: { sessionId: dbSession.id }
          });
          console.log(`[Sessions API] Deleted LoyaltyTransaction records for session ${dbSession.id}`);
        } catch (loyaltyError) {
          console.warn('[Sessions API] Failed to delete LoyaltyTransaction records:', loyaltyError);
          // Continue anyway - might not exist
        }
        
        try {
          // Delete LoyaltyRedemption records (no cascade delete)
          await prisma.loyaltyRedemption.deleteMany({
            where: { sessionId: dbSession.id }
          });
          console.log(`[Sessions API] Deleted LoyaltyRedemption records for session ${dbSession.id}`);
        } catch (redemptionError) {
          console.warn('[Sessions API] Failed to delete LoyaltyRedemption records:', redemptionError);
          // Continue anyway - might not exist
        }
        
        // Now delete the session itself
        // Order, Delivery, and SessionNote will cascade delete automatically
        await prisma.session.delete({
          where: { id: dbSession.id }
        });
        
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
      } else if (userRole === 'ADMIN' && action === 'VOID_SESSION') {
        // ADMIN can void from any state - bypass state machine validation
        // Note: This is different from the delete path above - this marks as VOIDED instead of deleting
        const targetStatus = 'VOIDED';
        updatedSession = {
          ...currentSession,
          status: targetStatus as SessionStatus,
          currentStage: STATUS_TO_STAGE[targetStatus as SessionStatus],
          updatedAt: Date.now()
        };
        console.log(`[Sessions API] ADMIN bypass: ${action} from ${currentSession.status} to ${targetStatus}`);
      } else {
        // Use the state machine to transition the session for all other cases
        try {
          updatedSession = nextStateWithTrust(
            currentSession,
            { 
              type: action as SessionAction, 
              operatorId: operatorId || 'system',
              timestamp: Date.now()
            },
            userRole as UserRole
          );
        } catch (stateMachineError: any) {
          // Get valid transitions for current status to help debug
          const validTransitions = VALID_TRANSITIONS[currentSession.status] || [];
          const targetStatus = ACTION_TO_STATUS[action as SessionAction];
          
          console.error('[Sessions API] State machine validation failed:', {
            action,
            currentStatus: currentSession.status,
            targetStatus,
            validTransitions,
            error: stateMachineError.message,
            dbState: dbSession.state,
            paymentStatus: dbSession.paymentStatus,
            externalRef: dbSession.externalRef,
            isPaid: dbSession.paymentStatus === 'succeeded' || (dbSession.externalRef && (dbSession.externalRef.startsWith('cs_') || dbSession.externalRef.startsWith('test_cs_')))
          });
          
          return NextResponse.json({ 
            error: 'State transition failed',
            details: `Cannot perform ${action} on session with status ${currentSession.status}. ` +
                     `Valid transitions from ${currentSession.status}: ${validTransitions.join(', ')}. ` +
                     `Target status: ${targetStatus}. ` +
                     `Error: ${stateMachineError.message}`,
            currentStatus: currentSession.status,
            targetStatus,
            validTransitions,
            requestedAction: action,
            userRole
          }, { 
            status: 400,
            headers: getCorsHeaders(req),
          });
        }
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
        'PAID_CONFIRMED': 'PENDING', // PAID_CONFIRMED maps to PENDING (payment confirmed, ready for prep)
        'CLOSE_PENDING': 'NEW', // Maps to NEW for pending close
        'STOCK_BLOCKED': 'NEW', // Maps to NEW for stock issues
        'REMAKE': 'NEW', // Maps to NEW for remake
        'REFUND_REQUESTED': 'NEW', // Maps to NEW for refund requests
        'REFUNDED': 'CANCELED', // Maps to CANCELED for refunded
      };

      // Map FireSession status to Prisma SessionState enum
      // Handle CLAIM_PREP action specifically
      let newState: SessionState = dbSession.state;
      
      if (action === 'CLAIM_PREP') {
        // CLAIM_PREP transitions from PAID_CONFIRMED to PREP_IN_PROGRESS
        // Since Prisma doesn't have PREP_IN_PROGRESS enum, we store it as ACTIVE
        // The UI will map ACTIVE + assignedBOHId + payment confirmed back to PREP_IN_PROGRESS
        newState = SessionState.ACTIVE;
        console.log(`[Sessions API] CLAIM_PREP: Transitioning from ${currentSession.status} to PREP_IN_PROGRESS (stored as ACTIVE in Prisma)`);
      } else {
        // Use state map for other actions
        const mappedState = stateMap[updatedSession.status];
        if (mappedState) {
          // Map string status to SessionState enum
          if (mappedState === 'ACTIVE') newState = SessionState.ACTIVE;
          else if (mappedState === 'PAUSED') newState = SessionState.PAUSED;
          else if (mappedState === 'CLOSED') newState = SessionState.CLOSED;
          else if (mappedState === 'CANCELED') newState = SessionState.CANCELED;
          else if (mappedState === 'NEW') newState = SessionState.PENDING;
          else if (mappedState === 'PREP_IN_PROGRESS') newState = SessionState.ACTIVE; // Map PREP_IN_PROGRESS to ACTIVE
          else if (mappedState === 'HEAT_UP') newState = SessionState.ACTIVE; // Map HEAT_UP to ACTIVE
          else if (mappedState === 'READY_FOR_DELIVERY') newState = SessionState.ACTIVE; // Map READY_FOR_DELIVERY to ACTIVE
          else if (mappedState === 'OUT_FOR_DELIVERY') newState = SessionState.ACTIVE; // Map OUT_FOR_DELIVERY to ACTIVE
          else if (mappedState === 'DELIVERED') newState = SessionState.ACTIVE; // Map DELIVERED to ACTIVE
          // For other statuses, keep current state or use PENDING as default
          else newState = SessionState.PENDING;
        }
      }

      // Update session in database
      // Store workflow stage in tableNotes for transparency (since database only stores ACTIVE)
      let updatedNotes = notes !== undefined ? notes : dbSession.tableNotes || '';
      
      // Append workflow stage to notes for actions that change workflow stage
      const workflowActions = ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE'];
      if (workflowActions.includes(action)) {
        const stageNote = `Action ${action} executed by ${userRole}`;
        if (updatedNotes && !updatedNotes.includes(`Action ${action}`)) {
          updatedNotes = `${updatedNotes}\n${stageNote}`;
        } else if (!updatedNotes) {
          updatedNotes = stageNote;
        }
      }
      
      // Update trust signature as session progresses through workflow
      // This increases the verification rate for Reflex Score calculation
      let updatedTrustSignature = dbSession.trustSignature;
      const seal = (o: unknown) => {
        const crypto = require('crypto');
        return crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");
      };
      
      // Enhance trust signature with workflow progress
      if (workflowActions.includes(action) && dbSession.trustSignature) {
        // Add workflow stage to trust signature data
        const trustData = {
          originalSignature: dbSession.trustSignature,
          workflowStage: action,
          timestamp: new Date().toISOString(),
          operatorId: operatorId || userRole,
        };
        // Create enhanced trust signature that includes workflow progress
        updatedTrustSignature = seal(trustData);
      }
      
      const updateData: any = {
        state: newState,
        tableNotes: updatedNotes,
        edgeCase: edgeCase !== undefined ? edgeCase : dbSession.edgeCase,
        edgeNote: edgeNote !== undefined ? edgeNote : dbSession.edgeNote,
      };

      // Canonical NAN stage/action persistence
      const trackerStage = STATUS_TO_TRACKER_STAGE[updatedSession.status as SessionStatus];
      if (trackerStage) {
        updateData.stage = trackerStage;
      }
      if (workflowActions.includes(action)) {
        updateData.action = action;
      }
      
      // Update trust signature if it was enhanced
      if (updatedTrustSignature !== dbSession.trustSignature) {
        updateData.trustSignature = updatedTrustSignature;
      }
      
      // For CLAIM_PREP, also update assignedBOHId if provided
      if (action === 'CLAIM_PREP' && operatorId) {
        updateData.assignedBOHId = operatorId;
      }

      // Update startedAt if transitioning to ACTIVE
      if (updatedSession.status === 'ACTIVE' && !dbSession.startedAt) {
        updateData.startedAt = new Date();
      }

      // Update endedAt if transitioning to CLOSED/CANCELED
      // Use string comparison to avoid runtime enum issues
      const finalState = String(newState);
      const isClosing = (finalState === 'CLOSED' || finalState === 'CANCELED') && !dbSession.endedAt;
      if (isClosing) {
        updateData.endedAt = new Date();
      }

      // Log session event before state update (append-only ledger)
      try {
        const { logSessionEvent } = await import('@/lib/session-events');
        const eventTypeMap: Record<string, string> = {
          'CLAIM_PREP': 'claimed',
          'HEAT_UP': 'claimed',
          'READY_FOR_DELIVERY': 'claimed',
          'DELIVER_NOW': 'delivered',
          'MARK_DELIVERED': 'delivered',
          'START_ACTIVE': 'started',
          'PAUSE': 'paused',
          'RESUME': 'resumed',
          'END': 'ended',
          'CANCEL': 'canceled',
        };
        const eventType = eventTypeMap[action] || 'adjusted';
        await logSessionEvent({
          eventType: eventType as any,
          sessionId: dbSession.id,
          eventData: {
            action,
            previousState: dbSession.state,
            newState: String(newState),
            userRole,
            operatorId,
          },
          actorId: operatorId,
          actorRole: userRole,
        });
      } catch (eventError) {
        console.warn('[Sessions API] Failed to log session event:', eventError);
        // Don't fail the request if event logging fails
      }

      // Try to update session, with fallback for missing columns
      let updatedDbSession: any;
      try {
        // Log what we're trying to update for debugging
        console.log('[Sessions API] Attempting to update session:', {
          sessionId: dbSession.id,
          updateData: Object.keys(updateData),
          action
        });
        
        updatedDbSession = await prisma.session.update({
          where: { id: dbSession.id },
          data: updateData
        });
      } catch (updateError: any) {
        // If update fails, try raw SQL fallback
        // Check for any Prisma error that might indicate schema issues
        const isColumnError = updateError?.code === 'P2022' || 
                              updateError?.code === 'P2021' ||
                              updateError?.code === 'P2010' ||
                              updateError?.message?.includes('does not exist') ||
                              updateError?.message?.includes('column') ||
                              updateError?.message?.includes('Column') ||
                              updateError?.message?.includes('Unknown column') ||
                              updateError?.message?.includes('schema mismatch');
        
        // Always try raw SQL fallback if Prisma update fails (more robust)
        // This handles cases where error codes might not match exactly
        console.warn('[Sessions API] Prisma update failed, attempting raw SQL fallback:', {
          code: updateError?.code,
          message: updateError?.message,
          meta: updateError?.meta,
          isColumnError
        });
        
        if (isColumnError) {
          console.warn('[Sessions API] Column missing in update, using raw SQL fallback:', {
            code: updateError?.code,
            message: updateError?.message,
            meta: updateError?.meta
          });
          
          const escapeSql = (val: any) => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'number') return String(val);
            if (val instanceof Date) return `'${val.toISOString()}'`;
            return `'${String(val).replace(/'/g, "''")}'`;
          };
          
          // Build UPDATE statement with only columns that likely exist
          // We'll try to update only the essential columns and skip problematic ones
          const setClauses: string[] = [];
          
          // Always update state and updatedAt
          // CRITICAL: Ensure newState is converted to string correctly (ACTIVE, not NEW)
          // newState is a SessionState enum, convert to string properly
          const stateValue = String(newState) === 'ACTIVE' ? 'ACTIVE' : String(newState);
          console.log('[Sessions API] Raw SQL update: Setting state to', stateValue, 'from newState', newState);
          setClauses.push(`state = ${escapeSql(stateValue)}`);
          setClauses.push(`"updatedAt" = NOW()`);
          
          // Update trust signature if enhanced
          if (updateData.trustSignature && updateData.trustSignature !== dbSession.trustSignature) {
            try {
              setClauses.push(`"trustSignature" = ${escapeSql(updateData.trustSignature)}`);
            } catch (e) {
              console.warn('[Sessions API] Skipping trustSignature update (column may not exist)');
            }
          }
          
          // Conditionally add other columns (only if they have values)
          // Skip columns that might not exist in the schema
          if (updateData.assignedBOHId !== undefined && updateData.assignedBOHId !== null) {
            try {
              setClauses.push(`"assignedBOHId" = ${escapeSql(updateData.assignedBOHId)}`);
            } catch (e) {
              console.warn('[Sessions API] Skipping assignedBOHId update (column may not exist)');
            }
          }
          
          if (updateData.tableNotes !== undefined && updateData.tableNotes !== null) {
            try {
              setClauses.push(`"tableNotes" = ${escapeSql(updateData.tableNotes)}`);
            } catch (e) {
              console.warn('[Sessions API] Skipping tableNotes update (column may not exist)');
            }
          }
          
          if (updateData.edgeCase !== undefined && updateData.edgeCase !== null) {
            try {
              setClauses.push(`"edgeCase" = ${escapeSql(updateData.edgeCase)}`);
            } catch (e) {
              console.warn('[Sessions API] Skipping edgeCase update (column may not exist)');
            }
          }
          
          if (updateData.edgeNote !== undefined && updateData.edgeNote !== null) {
            try {
              setClauses.push(`"edgeNote" = ${escapeSql(updateData.edgeNote)}`);
            } catch (e) {
              console.warn('[Sessions API] Skipping edgeNote update (column may not exist)');
            }
          }
          
          // Only add startedAt/endedAt if they're being set (these columns might not exist)
          // Skip them for now to avoid errors
          
          try {
            await prisma.$queryRawUnsafe(`
              UPDATE "Session"
              SET ${setClauses.join(', ')}
              WHERE id = ${escapeSql(dbSession.id)}
            `);
            
            console.log('[Sessions API] ✅ Raw SQL update successful');
            
            // Fetch updated session with explicit select to avoid session_type column
            updatedDbSession = await prisma.session.findUnique({
              where: { id: dbSession.id },
              select: {
                id: true,
                state: true,
                tableId: true,
                customerRef: true,
                externalRef: true,
                paymentStatus: true,
                assignedBOHId: true,
                assignedFOHId: true,
                tableNotes: true,
                edgeCase: true,
                edgeNote: true,
                startedAt: true,
                endedAt: true,
                createdAt: true,
                updatedAt: true,
                flavor: true,
                flavorMix: true,
                priceCents: true,
                loungeId: true,
                source: true,
                trustSignature: true,
                durationSecs: true,
                customerPhone: true,
                // Explicitly exclude session_type and other columns that might not exist
              }
            });
            
            if (!updatedDbSession) {
              throw new Error('Failed to fetch updated session after raw SQL update');
            }
          } catch (rawSqlError: any) {
            console.error('[Sessions API] Raw SQL update also failed:', rawSqlError);
            // If raw SQL also fails, try a minimal update (just state)
            try {
              console.warn('[Sessions API] Attempting minimal update (state only)');
              const escapeSql = (val: any) => {
                if (val === null || val === undefined) return 'NULL';
                if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                if (typeof val === 'number') return String(val);
                if (val instanceof Date) return `'${val.toISOString()}'`;
                return `'${String(val).replace(/'/g, "''")}'`;
              };
              
              await prisma.$queryRawUnsafe(`
                UPDATE "Session"
                SET state = ${escapeSql(String(newState))}, "updatedAt" = NOW()
                WHERE id = ${escapeSql(dbSession.id)}
              `);
              
              // Fetch updated session with explicit select to avoid session_type column
              updatedDbSession = await prisma.session.findUnique({
                where: { id: dbSession.id },
                select: {
                  id: true,
                  state: true,
                  tableId: true,
                  customerRef: true,
                  externalRef: true,
                  paymentStatus: true,
                  assignedBOHId: true,
                  assignedFOHId: true,
                  tableNotes: true,
                  edgeCase: true,
                  edgeNote: true,
                  startedAt: true,
                  endedAt: true,
                  createdAt: true,
                  updatedAt: true,
                  flavor: true,
                  flavorMix: true,
                  priceCents: true,
                  loungeId: true,
                  source: true,
                  trustSignature: true,
                  durationSecs: true,
                  customerPhone: true,
                  // Explicitly exclude session_type and other columns that might not exist
                }
              });
              
              if (!updatedDbSession) {
                throw new Error('Failed to fetch updated session after minimal update');
              }
              
              console.log('[Sessions API] ✅ Minimal update successful (state only)');
            } catch (minimalError: any) {
              // If even minimal update fails, throw with full context
              throw new Error(
                `Database update failed: ${updateError.message}. ` +
                `Raw SQL fallback failed: ${rawSqlError.message}. ` +
                `Minimal update also failed: ${minimalError.message}. ` +
                `This indicates a critical schema mismatch. Check which columns exist in the Session table.`
              );
            }
          }
        } else {
          // For non-column errors, still try raw SQL as a last resort (minimal update)
          console.warn('[Sessions API] Non-column error, but attempting minimal raw SQL fallback');
          try {
            const escapeSql = (val: any) => {
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
              if (typeof val === 'number') return String(val);
              if (val instanceof Date) return `'${val.toISOString()}'`;
              return `'${String(val).replace(/'/g, "''")}'`;
            };
            
            await prisma.$queryRawUnsafe(`
              UPDATE "Session"
              SET state = ${escapeSql(String(newState))}, "updatedAt" = NOW()
              WHERE id = ${escapeSql(dbSession.id)}
            `);
            
            updatedDbSession = await prisma.session.findUnique({
              where: { id: dbSession.id }
            });
            
            if (!updatedDbSession) {
              throw new Error('Failed to fetch updated session');
            }
            
            console.log('[Sessions API] ✅ Minimal raw SQL fallback successful for non-column error');
          } catch (fallbackError: any) {
            // If all fallbacks fail, throw original error
            throw updateError;
          }
        }
      }

      const fireSession = convertPrismaSessionToFireSession(updatedDbSession);

      // Invalidate cache when session state changes significantly
      // Only invalidate for state changes that affect availability/analytics
      const stateChangingActions = ['CLOSE_SESSION', 'CANCEL_SESSION', 'START_ACTIVE', 'MARK_DELIVERED'];
      if (stateChangingActions.includes(action)) {
        try {
          invalidateSessionCaches();
        } catch (cacheError) {
          console.error('[Sessions API] Cache invalidation error (non-fatal):', cacheError);
        }
      }

      // Process settlement when session is closed
      if (isClosing && action === 'CLOSE_SESSION') {
        try {
          await handleSessionSettlement(dbSession.id, updatedDbSession);
        } catch (settlementError) {
          // Log but don't fail the request if settlement fails
          console.error('[Sessions API] Settlement error:', settlementError);
          // Add note about settlement failure
          try {
            await prisma.session.update({
              where: { id: dbSession.id },
              data: {
                tableNotes: `${updatedDbSession.tableNotes || ''}\n[${new Date().toISOString()}] Settlement processing failed: ${settlementError instanceof Error ? settlementError.message : 'Unknown error'}`.trim()
              }
            });
          } catch (noteError) {
            console.error('[Sessions API] Failed to add settlement error note:', noteError);
          }
        }
      }

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

      // Get available actions and prioritize by workflow sequence
      const allNextActions = getAvailableActions(fireSession);
      const primaryActions = ['CLAIM_PREP', 'HEAT_UP', 'READY_FOR_DELIVERY', 'DELIVER_NOW', 'MARK_DELIVERED', 'START_ACTIVE'];
      const primaryNextAction = allNextActions.find(a => primaryActions.includes(a));
      const secondaryActions = allNextActions.filter(a => !primaryActions.includes(a));
      
      // Prioritize actions: primary first, then secondary
      const prioritizedActions = primaryNextAction 
        ? [primaryNextAction, ...secondaryActions]
        : allNextActions;

      const responseStage = trackerStage || STATUS_TO_TRACKER_STAGE[updatedSession.status as SessionStatus];
      // Telemetry: log canonical stage/action updates for observability
      try {
        console.log('[Sessions API] Stage update', {
          sessionId: dbSession.id,
          action,
          status: updatedSession.status,
          stage: responseStage,
          primaryNextAction
        });
      } catch (e) {
        // non-blocking
      }
      
      return NextResponse.json({ 
        success: true, 
        session: fireSession,
        message: `Session ${action} successful`,
        businessLogic: `Session transitioned from ${currentSession.status} to ${updatedSession.status}`,
        nextActions: prioritizedActions,
        primaryNextAction: primaryNextAction || null,
        nextActionDescription: primaryNextAction ? ACTION_DESCRIPTIONS[primaryNextAction] : null,
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
      errorName: error instanceof Error ? error.name : 'Unknown',
      errorCode: (error as any)?.code,
      errorMeta: (error as any)?.meta,
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Provide more detailed error message
    let errorDetails = error instanceof Error ? error.message : 'Unknown error';
    let errorCode = (error as any)?.code;
    
    // Handle Prisma errors
    if (errorCode === 'P2025') {
      errorDetails = 'Session not found in database';
    } else if (errorCode === 'P2002') {
      errorDetails = 'Database constraint violation (duplicate entry)';
    } else if (errorCode === 'P2022') {
      errorDetails = 'Database column does not exist - schema mismatch';
    } else if (error instanceof Error && error.message.includes('Invalid transition')) {
      errorDetails = `Invalid state transition: ${error.message}`;
    } else if (error instanceof Error && error.message.includes('Insufficient permissions')) {
      errorDetails = `Permission denied: ${error.message}`;
    }
    
    return NextResponse.json({ 
      error: 'Internal server error',
      details: errorDetails,
      errorCode,
      sessionId,
      action,
      userRole,
      timestamp: new Date().toISOString()
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
    case 'PAID_CONFIRMED':
      // Payment confirmed - ready for BOH to claim prep
      actions.push('CLAIM_PREP', 'PUT_ON_HOLD');
      break;
    case 'PREP_IN_PROGRESS':
      actions.push('HEAT_UP', 'READY_FOR_DELIVERY', 'START_ACTIVE', 'PUT_ON_HOLD', 'REQUEST_REMAKE');
      break;
    case 'HEAT_UP':
      actions.push('READY_FOR_DELIVERY', 'START_ACTIVE', 'PUT_ON_HOLD');
      break;
    case 'READY_FOR_DELIVERY':
      actions.push('DELIVER_NOW', 'START_ACTIVE', 'PUT_ON_HOLD');
      break;
    case 'OUT_FOR_DELIVERY':
      actions.push('MARK_DELIVERED', 'START_ACTIVE', 'PUT_ON_HOLD');
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