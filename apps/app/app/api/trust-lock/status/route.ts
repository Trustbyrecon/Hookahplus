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

    // Calculate verification rate
    const verificationRate = totalSessions > 0 
      ? Math.round((verifiedSessions / totalSessions) * 100) 
      : 100;

    // Determine status
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

