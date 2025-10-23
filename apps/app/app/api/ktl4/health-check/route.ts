/**
 * KTL-4 Health Check API Endpoint
 * 
 * Provides REST API for running health checks and retrieving status
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { ktl4HealthChecker, runKtl4HealthCheck, runAllKtl4HealthChecks } from '../../../../lib/ktl4-health-checker';
import { getKtl4HealthStatus, getKtl4CriticalEvents } from '../../../../lib/ktl4-ghostlog';

const HealthCheckSchema = z.object({
  flowName: z.enum(['payment_settlement', 'session_lifecycle', 'order_intake', 'pos_sync']),
  checkType: z.string().min(1),
  operatorId: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parse = HealthCheckSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ 
        success: false, 
        error: parse.error.flatten() 
      }, { status: 400 });
    }

    const { flowName, checkType, operatorId } = parse.data;

    // Run specific health check
    const result = await runKtl4HealthCheck(flowName, checkType, operatorId);

    return NextResponse.json({
      success: true,
      result
    });

  } catch (error) {
    console.error('[KTL-4 Health Check API] Error:', error);
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
        // Get current health status for all flows
        const healthStatus = getKtl4HealthStatus();
        return NextResponse.json({
          success: true,
          healthStatus
        });

      case 'run-all':
        // Run all health checks
        const operatorId = searchParams.get('operatorId');
        const results = await runAllKtl4HealthChecks(operatorId || undefined);
        return NextResponse.json({
          success: true,
          results
        });

      case 'critical':
        // Get critical events
        const limit = parseInt(searchParams.get('limit') || '50');
        const criticalEvents = getKtl4CriticalEvents(limit);
        return NextResponse.json({
          success: true,
          criticalEvents
        });

      case 'config':
        // Get health check configuration
        const flowName = searchParams.get('flowName');
        const checkType = searchParams.get('checkType');
        
        if (flowName && checkType) {
          const config = ktl4HealthChecker.getConfig(flowName, checkType);
          return NextResponse.json({
            success: true,
            config
          });
        } else {
          // Get all configurations
          const allConfigs = ktl4HealthChecker.getAllConfigs();
          return NextResponse.json({
            success: true,
            configs: allConfigs
          });
        }

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('[KTL-4 Health Check API] Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
