import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/trust-lock/status
 * 
 * Returns Trust-Lock system status and verification metrics
 * In First Light mode, bypasses auth and returns basic status
 */
export async function GET(req: NextRequest) {
  // In First Light mode, return simple status without auth
  if (process.env.FIRST_LIGHT_MODE === 'true') {
    return NextResponse.json({
      success: true,
      status: 'active',
      metrics: {
        totalSessions: 0,
        verifiedSessions: 0,
        verificationRate: 100,
        unverifiedSessions: 0
      },
      firstLightMode: true,
      message: 'Trust-Lock status simplified for First Light mode'
    });
  }

  try {
    // Count sessions with trust signatures
    // Use raw SQL to avoid sessionStateV1 column issues
    let totalSessions: number;
    let verifiedSessions: number;
    
    try {
      totalSessions = await prisma.session.count();
      verifiedSessions = await prisma.session.count({
        where: {
          trustSignature: {
            not: ''
          }
        }
      });
    } catch (dbError: any) {
      // If sessionStateV1 column doesn't exist, use raw SQL
      if (dbError?.message?.includes('sessionStateV1') || dbError?.code === 'P2021') {
        console.warn('[Trust-Lock Status] sessionStateV1 column not found, using raw SQL fallback');
        const totalResult = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count FROM "Session"
        `) as any[];
        totalSessions = Number(totalResult[0]?.count || 0);
        
        const verifiedResult = await prisma.$queryRawUnsafe(`
          SELECT COUNT(*) as count FROM "Session" WHERE "trustSignature" != ''
        `) as any[];
        verifiedSessions = Number(verifiedResult[0]?.count || 0);
      } else {
        throw dbError;
      }
    }

    // Count sessions that have progressed through Night After Night workflow
    // Sessions in PREP_IN_PROGRESS, HEAT_UP, READY_FOR_DELIVERY, OUT_FOR_DELIVERY, DELIVERED, or ACTIVE
    // are considered "verified" (workflow in progress)
    // Also count sessions with assignedBOHId (CLAIM_PREP executed) or tableNotes containing workflow actions
    let workflowProgressSessions: number;
    try {
      workflowProgressSessions = await prisma.session.count({
        where: {
          OR: [
            { state: 'ACTIVE' }, // Maps to PREP_IN_PROGRESS, HEAT_UP, READY_FOR_DELIVERY, etc.
            { paymentStatus: 'succeeded' }, // Paid sessions are in workflow
            { externalRef: { startsWith: 'cs_' } }, // Stripe checkout sessions
            { externalRef: { startsWith: 'test_cs_' } }, // Test paid sessions
            { assignedBOHId: { not: null } }, // Sessions with BOH assigned (CLAIM_PREP executed)
            { tableNotes: { contains: 'Action CLAIM_PREP' } }, // Explicit workflow action markers
            { tableNotes: { contains: 'Action HEAT_UP' } },
            { tableNotes: { contains: 'Action READY_FOR_DELIVERY' } },
            { tableNotes: { contains: 'Action DELIVER_NOW' } },
            { tableNotes: { contains: 'Action MARK_DELIVERED' } },
            { tableNotes: { contains: 'Action START_ACTIVE' } },
          ]
        }
      });
    } catch (dbError: any) {
      // Fallback to raw SQL if needed
      if (dbError?.message?.includes('sessionStateV1') || dbError?.code === 'P2021') {
        const workflowResult = await prisma.$queryRawUnsafe(`
          SELECT COUNT(DISTINCT id) as count FROM "Session" 
          WHERE state = 'ACTIVE' 
          OR "paymentStatus" = 'succeeded' 
          OR "externalRef" LIKE 'cs_%' 
          OR "externalRef" LIKE 'test_cs_%'
          OR "assignedBOHId" IS NOT NULL
          OR "tableNotes" LIKE '%Action CLAIM_PREP%'
          OR "tableNotes" LIKE '%Action HEAT_UP%'
          OR "tableNotes" LIKE '%Action READY_FOR_DELIVERY%'
          OR "tableNotes" LIKE '%Action DELIVER_NOW%'
          OR "tableNotes" LIKE '%Action MARK_DELIVERED%'
          OR "tableNotes" LIKE '%Action START_ACTIVE%'
        `) as any[];
        workflowProgressSessions = Number(workflowResult[0]?.count || 0);
      } else {
        workflowProgressSessions = verifiedSessions; // Fallback to trust signature count
      }
    }

    // Calculate verification rate based on both trust signatures AND workflow progress
    // Weight: 50% trust signatures, 50% workflow progress
    const trustSignatureRate = totalSessions > 0 
      ? (verifiedSessions / totalSessions) * 100 
      : 100;
    
    const workflowProgressRate = totalSessions > 0
      ? (workflowProgressSessions / totalSessions) * 100
      : 100;
    
    // Combined verification rate (weighted average)
    const verificationRate = Math.round((trustSignatureRate * 0.5) + (workflowProgressRate * 0.5));

    // Determine status based on combined verification rate
    let status: 'active' | 'pending' | 'verified' = 'active';
    if (verificationRate >= 95) {
      status = 'verified';
    } else if (verificationRate >= 80) {
      status = 'active';
    } else {
      status = 'pending';
    }

    return NextResponse.json({
      success: true,
      status,
      metrics: {
        totalSessions,
        verifiedSessions,
        verificationRate,
        unverifiedSessions: totalSessions - verifiedSessions
      }
    });
  } catch (error) {
    console.error('[Trust-Lock Status] Error:', error);
    return NextResponse.json({
      success: false,
      status: 'pending',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

