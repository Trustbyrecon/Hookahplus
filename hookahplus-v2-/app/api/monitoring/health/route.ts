import { NextRequest, NextResponse } from 'next/server';
import { MonitoringService } from '@/lib/monitoring';

export async function GET(request: NextRequest) {
  try {
    // Get health status
    const healthStatus = MonitoringService.getHealthStatus();
    
    // Get recent events
    const recentEvents = MonitoringService.getEvents(undefined, undefined, 20);
    
    // Get error count in last hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentErrors = recentEvents.filter(event => 
      event.timestamp > oneHourAgo && event.level === 'error'
    );
    
    // Get critical events in last hour
    const recentCritical = recentEvents.filter(event => 
      event.timestamp > oneHourAgo && event.level === 'critical'
    );

    return NextResponse.json({
      success: true,
      data: {
        status: healthStatus.status,
        timestamp: new Date().toISOString(),
        metrics: {
          ...healthStatus.metrics,
          recentErrors: recentErrors.length,
          recentCritical: recentCritical.length,
          trustLockVerified: recentEvents.every(event => event.trustLockVerified)
        },
        recentEvents: recentEvents.map(event => ({
          id: event.id,
          type: event.type,
          level: event.level,
          message: event.message,
          timestamp: event.timestamp,
          trustLockVerified: event.trustLockVerified
        })),
        alerts: {
          active: healthStatus.alerts,
          recent: recentCritical.length > 0 ? recentCritical.length : 0
        }
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Health check failed',
        data: {
          status: 'critical',
          timestamp: new Date().toISOString(),
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'track_event':
        await MonitoringService.trackEvent(
          data.type,
          data.level,
          data.message,
          data.context,
          request
        );
        break;

      case 'track_error':
        await MonitoringService.trackError(
          new Error(data.message),
          data.context,
          request
        );
        break;

      case 'track_performance':
        await MonitoringService.trackPerformance(
          data.metric,
          data.value,
          data.context
        );
        break;

      case 'track_security':
        await MonitoringService.trackSecurity(
          data.event,
          data.context,
          request
        );
        break;

      case 'track_business':
        await MonitoringService.trackBusiness(
          data.event,
          data.context
        );
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown action' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Event tracked successfully'
    });

  } catch (error) {
    console.error('Monitoring API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to track event' },
      { status: 500 }
    );
  }
}
