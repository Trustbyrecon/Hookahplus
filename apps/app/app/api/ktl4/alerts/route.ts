/**
 * KTL-4 Alerts API Endpoint
 * 
 * Manages alerts for KTL-4 flows with priority levels and status tracking
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { ktl4GhostLog } from '@/lib/ktl4-ghostlog';

const AlertSchema = z.object({
  priority: z.enum(['P1', 'P2', 'P3']),
  flowName: z.enum(['payment_settlement', 'session_lifecycle', 'order_intake', 'pos_sync']),
  alertType: z.string().min(1),
  message: z.string().min(1),
  details: z.record(z.any()).optional(),
  operatorId: z.string().optional(),
});

const AlertActionSchema = z.object({
  action: z.enum(['acknowledge', 'resolve', 'escalate']),
  alertId: z.string(),
  operatorId: z.string(),
  note: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Check if it's an alert action or new alert
    if (body.action) {
      const parse = AlertActionSchema.safeParse(body);
      if (!parse.success) {
        return NextResponse.json({ 
          success: false, 
          error: parse.error.flatten() 
        }, { status: 400 });
      }

      const { action, alertId, operatorId, note } = parse.data;
      return await handleAlertAction(action, alertId, operatorId, note);
    } else {
      const parse = AlertSchema.safeParse(body);
      if (!parse.success) {
        return NextResponse.json({ 
          success: false, 
          error: parse.error.flatten() 
        }, { status: 400 });
      }

      const { priority, flowName, alertType, message, details, operatorId } = parse.data;
      return await createAlert(priority, flowName, alertType, message, details, operatorId);
    }

  } catch (error) {
    console.error('[KTL-4 Alerts API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action') || 'list';
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const flowName = searchParams.get('flowName');
    const limit = parseInt(searchParams.get('limit') || '50');

    switch (action) {
      case 'list':
        // Get alerts with filters
        const where: any = {};
        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (flowName) where.flowName = flowName;

        const alerts = await prisma.ktl4Alert.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: limit
        });

        return NextResponse.json({
          success: true,
          alerts
        });

      case 'active':
        // Get only active alerts
        const activeAlerts = await prisma.ktl4Alert.findMany({
          where: { status: 'active' },
          orderBy: [
            { priority: 'asc' }, // P1 first
            { createdAt: 'desc' }
          ],
          take: limit
        });

        return NextResponse.json({
          success: true,
          alerts: activeAlerts
        });

      case 'stats':
        // Get alert statistics
        const stats = await prisma.ktl4Alert.groupBy({
          by: ['priority', 'status'],
          _count: true
        });

        const alertStats = {
          total: await prisma.ktl4Alert.count(),
          active: await prisma.ktl4Alert.count({ where: { status: 'active' } }),
          acknowledged: await prisma.ktl4Alert.count({ where: { status: 'acknowledged' } }),
          resolved: await prisma.ktl4Alert.count({ where: { status: 'resolved' } }),
          byPriority: {
            P1: await prisma.ktl4Alert.count({ where: { priority: 'P1' } }),
            P2: await prisma.ktl4Alert.count({ where: { priority: 'P2' } }),
            P3: await prisma.ktl4Alert.count({ where: { priority: 'P3' } })
          },
          byFlow: {
            payment_settlement: await prisma.ktl4Alert.count({ where: { flowName: 'payment_settlement' } }),
            session_lifecycle: await prisma.ktl4Alert.count({ where: { flowName: 'session_lifecycle' } }),
            order_intake: await prisma.ktl4Alert.count({ where: { flowName: 'order_intake' } }),
            pos_sync: await prisma.ktl4Alert.count({ where: { flowName: 'pos_sync' } })
          }
        };

        return NextResponse.json({
          success: true,
          stats: alertStats
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[KTL-4 Alerts API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

/**
 * Create a new alert
 */
async function createAlert(
  priority: string,
  flowName: string,
  alertType: string,
  message: string,
  details: any,
  operatorId?: string
) {
  const alert = await prisma.ktl4Alert.create({
    data: {
      priority,
      flowName,
      alertType,
      message,
      details: details ? JSON.stringify(details) : null,
      status: 'active'
    }
  });

  // Log alert creation
  await ktl4GhostLog.logEvent({
    flowName: flowName as any,
    eventType: `alert.${alertType}`,
    status: priority === 'P1' ? 'critical' : priority === 'P2' ? 'error' : 'warning',
    details: {
      alertId: alert.id,
      priority,
      message,
      ...details
    },
    operatorId
  });

  // Send notifications based on priority
  if (priority === 'P1') {
    // Immediate notification for P1 alerts
    console.log(`🚨 P1 ALERT: ${message}`);
    // In production, send SMS/email/Slack notifications
  }

  return NextResponse.json({
    success: true,
    alert
  });
}

/**
 * Handle alert actions (acknowledge, resolve, escalate)
 */
async function handleAlertAction(
  action: string,
  alertId: string,
  operatorId: string,
  note?: string
) {
  const alert = await prisma.ktl4Alert.findUnique({
    where: { id: alertId }
  });

  if (!alert) {
    return NextResponse.json({ 
      success: false, 
      error: 'Alert not found' 
    }, { status: 404 });
  }

  let updateData: any = {};
  let newStatus: string = alert.status;

  switch (action) {
    case 'acknowledge':
      updateData = {
        status: 'acknowledged',
        acknowledgedBy: operatorId
      };
      newStatus = 'acknowledged';
      break;

    case 'resolve':
      updateData = {
        status: 'resolved',
        resolvedAt: new Date()
      };
      newStatus = 'resolved';
      break;

    case 'escalate':
      // Escalate to higher priority
      const newPriority = alert.priority === 'P3' ? 'P2' : 'P1';
      updateData = {
        priority: newPriority,
        acknowledgedBy: operatorId
      };
      break;

    default:
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid action' 
      }, { status: 400 });
  }

  const updatedAlert = await prisma.ktl4Alert.update({
    where: { id: alertId },
    data: updateData
  });

  // Log alert action
  await ktl4GhostLog.logEvent({
    flowName: alert.flowName as any,
    eventType: `alert.${action}`,
    status: 'success',
    details: {
      alertId,
      action,
      note,
      previousStatus: alert.status,
      newStatus
    },
    operatorId
  });

  return NextResponse.json({
    success: true,
    alert: updatedAlert
  });
}

/**
 * Auto-create alerts based on health check results
 */
async function createAlertFromHealthCheck(
  healthResult: any,
  operatorId?: string
) {
  if (healthResult.status === 'healthy') return;

  const priority = healthResult.status === 'critical' ? 'P1' : 
                  healthResult.status === 'failed' ? 'P1' : 'P2';

  const message = `${healthResult.flowName} ${healthResult.checkType} check ${healthResult.status}`;
  
  return createAlert(
    priority,
    healthResult.flowName,
    healthResult.checkType,
    message,
    healthResult.details,
    operatorId
  );
}
