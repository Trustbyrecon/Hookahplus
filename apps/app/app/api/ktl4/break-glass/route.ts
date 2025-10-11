/**
 * KTL-4 Break-Glass Emergency Controls API
 * 
 * Provides emergency procedures and manual overrides for critical situations
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { ktl4GhostLog, createKtl4RepairRun } from '@/lib/ktl4-ghostlog';

const BreakGlassSchema = z.object({
  actionType: z.enum(['freeze_station', 'degraded_mode', 'manual_override', 'emergency_stop']),
  targetId: z.string().optional(),
  operatorId: z.string(),
  reason: z.string().min(1),
  details: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = BreakGlassSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ 
        success: false, 
        error: parse.error.flatten() 
      }, { status: 400 });
    }

    const { actionType, targetId, operatorId, reason, details } = parse.data;

    // Create break-glass action record
    const breakGlassAction = await prisma.breakGlassAction.create({
      data: {
        actionType,
        targetId,
        operatorId,
        reason,
        details: details ? JSON.stringify(details) : null
      }
    });

    // Execute break-glass action
    let result: any = {};

    switch (actionType) {
      case 'freeze_station':
        result = await freezeStation(targetId, operatorId, reason);
        break;

      case 'degraded_mode':
        result = await enableDegradedMode(operatorId, reason);
        break;

      case 'manual_override':
        result = await manualOverride(targetId, operatorId, reason, details);
        break;

      case 'emergency_stop':
        result = await emergencyStop(operatorId, reason);
        break;

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action type' 
        }, { status: 400 });
    }

    // Log break-glass action
    await ktl4GhostLog.logEvent({
      flowName: 'payment_settlement', // Use appropriate flow
      eventType: `break_glass.${actionType}`,
      status: 'critical',
      details: {
        actionId: breakGlassAction.id,
        targetId,
        reason,
        ...result
      },
      operatorId
    });

    return NextResponse.json({
      success: true,
      result: {
        actionId: breakGlassAction.id,
        actionType,
        targetId,
        ...result
      }
    });

  } catch (error) {
    console.error('[KTL-4 Break-Glass API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'status';

    switch (action) {
      case 'status':
        // Get current break-glass status
        const activeActions = await prisma.breakGlassAction.findMany({
          where: { resolvedAt: null },
          orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
          success: true,
          activeActions
        });

      case 'history':
        // Get break-glass action history
        const limit = parseInt(searchParams.get('limit') || '50');
        const history = await prisma.breakGlassAction.findMany({
          orderBy: { createdAt: 'desc' },
          take: limit
        });

        return NextResponse.json({
          success: true,
          history
        });

      case 'resolve':
        // Resolve a break-glass action
        const actionId = searchParams.get('actionId');
        if (!actionId) {
          return NextResponse.json({ 
            success: false, 
            error: 'actionId required' 
          }, { status: 400 });
        }

        await prisma.breakGlassAction.update({
          where: { id: actionId },
          data: { resolvedAt: new Date() }
        });

        return NextResponse.json({
          success: true,
          message: 'Break-glass action resolved'
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[KTL-4 Break-Glass API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Freeze a specific station/table
 */
async function freezeStation(targetId: string | undefined, operatorId: string, reason: string) {
  if (!targetId) {
    throw new Error('targetId required for freeze_station');
  }

  // Update session status to frozen
  await prisma.session.updateMany({
    where: { 
      tableId: targetId,
      state: { in: ['ACTIVE', 'NEW'] }
    },
    data: { 
      state: 'CANCELLED',
      edgeCase: 'EMERGENCY_FREEZE',
      edgeNote: `Station frozen by ${operatorId}: ${reason}`
    }
  });

  return {
    frozenStation: targetId,
    affectedSessions: await prisma.session.count({
      where: { 
        tableId: targetId,
        state: 'CANCELLED',
        edgeCase: 'EMERGENCY_FREEZE'
      }
    })
  };
}

/**
 * Enable degraded mode for the entire system
 */
async function enableDegradedMode(operatorId: string, reason: string) {
  // In a real implementation, this would:
  // 1. Disable automated processes
  // 2. Switch to manual mode
  // 3. Display degraded mode banner
  // 4. Notify all operators

  return {
    degradedMode: true,
    enabledBy: operatorId,
    reason
  };
}

/**
 * Manual override for specific operations
 */
async function manualOverride(targetId: string | undefined, operatorId: string, reason: string, details: any) {
  if (!targetId) {
    throw new Error('targetId required for manual_override');
  }

  // Create manual override record
  const override = await prisma.sessionTransition.create({
    data: {
      sessionId: targetId,
      fromState: 'UNKNOWN',
      toState: 'MANUAL_OVERRIDE',
      transition: 'manual_override',
      userId: operatorId,
      note: `Manual override: ${reason}`
    }
  });

  return {
    overrideId: override.id,
    targetId,
    details
  };
}

/**
 * Emergency stop for the entire system
 */
async function emergencyStop(operatorId: string, reason: string) {
  // Stop all active sessions
  const activeSessions = await prisma.session.findMany({
    where: { state: 'ACTIVE' }
  });

  for (const session of activeSessions) {
    await prisma.session.update({
      where: { id: session.id },
      data: {
        state: 'CANCELLED',
        edgeCase: 'EMERGENCY_STOP',
        edgeNote: `Emergency stop by ${operatorId}: ${reason}`,
        endedAt: new Date()
      }
    });
  }

  return {
    emergencyStop: true,
    stoppedSessions: activeSessions.length,
    reason
  };
}
