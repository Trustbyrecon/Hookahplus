import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/db';

/**
 * GET /api/trust-lock/status
 * 
 * Returns Trust-Lock system status and verification metrics
 */
export async function GET(req: NextRequest) {
  try {
    // Count sessions with trust signatures
    const totalSessions = await prisma.session.count();
    const verifiedSessions = await prisma.session.count({
      where: {
        trustSignature: {
          not: {
            equals: null
          }
        }
      }
    });

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

