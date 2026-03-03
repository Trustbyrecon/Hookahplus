import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';
import type { SessionSource, SessionState } from '@prisma/client';
import crypto from 'crypto';

const seal = (o: unknown) =>
  crypto.createHash("sha256").update(JSON.stringify(o)).digest("hex");

/**
 * POST /api/test-session/create-paid
 * 
 * Creates a test session with payment already confirmed
 * Useful for testing the Night After Night workflow
 * 
 * Body:
 * {
 *   tableId?: string (default: "table-001")
 *   customerName?: string (default: "Test Customer")
 *   flavorMix?: string[] (default: ["Custom Mix"])
 *   amount?: number (default: 3000 cents = $30.00)
 * }
 */
export async function POST(req: NextRequest) {
  try {
    // Test-only route. Block in production unless explicitly enabled.
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_TEST_SESSION !== 'true') {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    
    const tableId = body.tableId || `table-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const customerName = body.customerName || 'Test Customer';
    const flavorMix = body.flavorMix || ['Custom Mix'];
    const amountCents = body.amount || 3000;
    
    // Generate session ID
    const sessionId = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate test external reference (simulates Stripe checkout session)
    const externalRef = `test_cs_${sessionId}`;
    
    // Generate trust signature
    const trustSignature = seal({
      loungeId: 'test-lounge',
      // Avoid runtime enum access in case prisma enums are not present in this build.
      source: 'QR',
      externalRef,
      customerPhone: null,
      flavorMix,
    });
    
    // Create session with payment confirmed
    // Use same pattern as main sessions route to handle missing columns gracefully
    let session: any;
    try {
      const createData: any = {
        id: sessionId,
        externalRef,
        // Avoid runtime enum access (SessionSource/SessionState can be undefined if prisma client differs)
        source: 'QR' as SessionSource,
        state: 'PENDING' as SessionState, // Will show as PAID_CONFIRMED in UI
        trustSignature,
        tableId,
        customerRef: customerName,
        customerPhone: null,
        flavor: Array.isArray(flavorMix) ? flavorMix[0] || 'Custom Mix' : (typeof flavorMix === 'string' ? flavorMix : 'Custom Mix'),
        flavorMix: Array.isArray(flavorMix) ? JSON.stringify(flavorMix) : (typeof flavorMix === 'string' ? flavorMix : JSON.stringify(['Custom Mix'])),
        loungeId: 'test-lounge',
        priceCents: amountCents,
        paymentStatus: 'succeeded', // Payment confirmed
        paymentIntent: `test_pi_${sessionId}`,
        durationSecs: 45 * 60, // 45 minutes
      };

      session = await prisma.session.create({
        data: createData
      });
    } catch (createError: any) {
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

      // Graceful fallback: if DB isn't available, return a non-persistent "paid" test session
      // so the UI can still run the Night After Night workflow demo.
      if (isDbConnectionError && allowFallback) {
        console.warn('[Test Session] Database unavailable - returning ephemeral paid test session (fallback mode)');
        return NextResponse.json({
          success: true,
          fallbackMode: true,
          ephemeral: true,
          session: {
            id: sessionId,
            tableId,
            customerName,
            status: 'PAID_CONFIRMED',
            paymentStatus: 'succeeded',
            externalRef,
            amount: amountCents,
            flavorMix: Array.isArray(flavorMix) ? JSON.stringify(flavorMix) : String(flavorMix || '[]'),
          },
          message: 'Database unavailable. Created an ephemeral paid test session for workflow testing (will not persist).',
        }, { status: 200 });
      }

      // If creation fails due to missing columns, use raw SQL fallback
      if (createError?.code === 'P2022' || createError?.message?.includes('does not exist')) {
        console.warn('[Test Session] Column missing, using raw SQL fallback:', createError?.message);
        
        const escapeSql = (val: any) => {
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          if (typeof val === 'number') return String(val);
          return `'${String(val).replace(/'/g, "''")}'`;
        };
        
        const flavorValue = Array.isArray(flavorMix) ? flavorMix[0] || 'Custom Mix' : (typeof flavorMix === 'string' ? flavorMix : 'Custom Mix');
        const flavorMixValue = Array.isArray(flavorMix) ? JSON.stringify(flavorMix) : (typeof flavorMix === 'string' ? flavorMix : JSON.stringify(['Custom Mix']));
        
        await prisma.$queryRawUnsafe(`
          INSERT INTO "Session" (
            id, "externalRef", source, state, "trustSignature", "tableId", 
            "customerRef", "customerPhone", flavor, "flavorMix", "loungeId", 
            "priceCents", "paymentStatus", "paymentIntent", "durationSecs", 
            "createdAt", "updatedAt"
          ) VALUES (
            ${escapeSql(sessionId)},
            ${escapeSql(externalRef)},
            ${escapeSql('QR')},
            ${escapeSql('PENDING')},
            ${escapeSql(trustSignature)},
            ${escapeSql(tableId)},
            ${escapeSql(customerName)},
            NULL,
            ${escapeSql(flavorValue)},
            ${escapeSql(flavorMixValue)},
            ${escapeSql('test-lounge')},
            ${amountCents},
            ${escapeSql('succeeded')},
            ${escapeSql(`test_pi_${sessionId}`)},
            ${45 * 60},
            NOW(),
            NOW()
          )
        `);
        
        // Fetch without Prisma so we don't require payment_gateway (column may not exist yet)
        const rows = await prisma.$queryRawUnsafe<any[]>(
          `SELECT id, "externalRef", source, state, "tableId", "customerRef", "priceCents", "paymentStatus", "paymentIntent", "durationSecs", "flavorMix" FROM "Session" WHERE id = $1`,
          sessionId
        );
        session = rows?.[0];
        if (!session) {
          throw new Error('Failed to create session via raw SQL');
        }
      } else {
        throw createError;
      }
    }
    
    console.log('[Test Session] Created paid test session:', {
      sessionId: session.id,
      tableId: session.tableId,
      customerName: session.customerRef,
      paymentStatus: session.paymentStatus,
      externalRef: session.externalRef,
    });
    
    return NextResponse.json({
      success: true,
      session: {
        id: session.id,
        tableId: session.tableId,
        customerName: session.customerRef,
        status: 'PAID_CONFIRMED', // Will show as this in UI
        paymentStatus: session.paymentStatus,
        externalRef: session.externalRef,
        amount: session.priceCents,
        flavorMix: session.flavorMix,
      },
      message: 'Test session created with payment confirmed. Ready for workflow!',
      nextSteps: [
        '1. Refresh the dashboard to see the session',
        '2. Click "Claim Prep" to start BOH workflow',
        '3. Continue through: Heat → Ready → Deliver → Light',
      ],
    });
  } catch (error: any) {
    console.error('[Test Session] Error creating paid test session:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create test session',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

