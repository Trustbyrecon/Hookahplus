import { reflexScoreAudit, scoreActions } from './reflexScoreAudit';
import { getRequestId } from './requestContext';

// Conditionally import Sentry only if DSN is configured
let Sentry: typeof import('@sentry/nextjs') | null = null;
try {
  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry = require('@sentry/nextjs');
  }
} catch (e) {
  // Sentry not installed or not configured
  console.warn('[TelemetryService] Sentry not available:', e);
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  type: 'performance' | 'error' | 'user_action' | 'system_event' | 'api_call';
  component: string;
  action: string;
  data: Record<string, any>;
  metadata: {
    requestId?: string;
    userId?: string;
    sessionId?: string;
    tableId?: string;
    userRole?: string;
    environment: string;
    version: string;
  };
}

export class TelemetryService {
  private static instance: TelemetryService;
  private events: TelemetryEvent[] = [];
  private maxEvents = 5000;

  static getInstance(): TelemetryService {
    if (!TelemetryService.instance) {
      TelemetryService.instance = new TelemetryService();
    }
    return TelemetryService.instance;
  }

  /**
   * Track a telemetry event
   */
  track(
    type: TelemetryEvent['type'],
    component: string,
    action: string,
    data: Record<string, any> = {},
    metadata: Partial<TelemetryEvent['metadata']> = {}
  ): void {
    // Get request ID from context if available
    const requestId = getRequestId();
    
    const event: TelemetryEvent = {
      id: `telemetry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      type,
      component,
      action,
      data,
      metadata: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        ...(requestId && { requestId }),
        ...metadata
      }
    };

    this.events.push(event);
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log to GhostLog
    this.logToGhostLog(event);

    console.log(`[Telemetry] 📊 ${type}:${component}:${action}`, data);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(
    component: string,
    action: string,
    responseTime: number,
    success: boolean,
    additionalData: Record<string, any> = {},
    metadata: Partial<TelemetryEvent['metadata']> = {}
  ): void {
    this.track('performance', component, action, {
      responseTime,
      success,
      ...additionalData
    }, metadata);

    // Calculate and record Reflex score
    const scores = this.calculatePerformanceScore(component, action, responseTime, success, additionalData);
    reflexScoreAudit.recordScore(component, action, scores.overall, 100, scores, metadata);
  }

  /**
   * Track user actions
   */
  trackUserAction(
    component: string,
    action: string,
    data: Record<string, any> = {},
    metadata: Partial<TelemetryEvent['metadata']> = {}
  ): void {
    this.track('user_action', component, action, data, metadata);
  }

  /**
   * Track errors
   */
  trackError(
    component: string,
    action: string,
    error: Error | string,
    additionalData: Record<string, any> = {},
    metadata: Partial<TelemetryEvent['metadata']> = {}
  ): void {
    const errorData = {
      message: typeof error === 'string' ? error : error.message,
      stack: typeof error === 'string' ? undefined : error.stack,
      name: typeof error === 'string' ? 'Error' : error.name,
      ...additionalData
    };

    this.track('error', component, action, errorData, metadata);

    // Record low score for errors
    reflexScoreAudit.recordScore(component, action, 0, 100, {
      error: true,
      errorMessage: errorData.message,
      ...additionalData
    }, metadata);

    // Send to Sentry if configured
    if (Sentry && typeof error !== 'string') {
      try {
        Sentry.captureException(error, {
          tags: {
            component,
            action,
            environment: metadata.environment || process.env.NODE_ENV || 'development',
          },
          extra: {
            ...additionalData,
            requestId: metadata.requestId,
            userId: metadata.userId,
            sessionId: metadata.sessionId,
            tableId: metadata.tableId,
            userRole: metadata.userRole,
          },
          contexts: {
            request: {
              requestId: metadata.requestId,
            },
          },
        });
      } catch (sentryError) {
        console.warn('[TelemetryService] Failed to send error to Sentry:', sentryError);
      }
    }
  }

  /**
   * Track API calls
   */
  trackApiCall(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    success: boolean,
    additionalData: Record<string, any> = {},
    metadata: Partial<TelemetryEvent['metadata']> = {}
  ): void {
    this.track('api_call', 'api', `${method} ${endpoint}`, {
      endpoint,
      method,
      responseTime,
      statusCode,
      success,
      ...additionalData
    }, metadata);

    // Calculate and record Reflex score for API calls
    const scores = this.calculateApiScore(endpoint, method, responseTime, statusCode, success);
    reflexScoreAudit.recordScore('api', `${method} ${endpoint}`, scores.overall, 100, scores, metadata);
  }

  /**
   * Track system events
   */
  trackSystemEvent(
    component: string,
    event: string,
    data: Record<string, any> = {},
    metadata: Partial<TelemetryEvent['metadata']> = {}
  ): void {
    this.track('system_event', component, event, data, metadata);
  }

  /**
   * Get events by type
   */
  getEventsByType(type: TelemetryEvent['type'], limit: number = 100): TelemetryEvent[] {
    return this.events
      .filter(event => event.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get events by component
   */
  getEventsByComponent(component: string, limit: number = 100): TelemetryEvent[] {
    return this.events
      .filter(event => event.component === component)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get all events
   */
  getAllEvents(limit: number = 100): TelemetryEvent[] {
    return this.events
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Calculate performance score
   */
  private calculatePerformanceScore(
    component: string,
    action: string,
    responseTime: number,
    success: boolean,
    additionalData: Record<string, any>
  ): Record<string, number> {
    // Use predefined scoring functions if available
    const scoreKey = `${component}${action.charAt(0).toUpperCase() + action.slice(1)}`;
    if (scoreActions[scoreKey as keyof typeof scoreActions]) {
      const scoreFunction = scoreActions[scoreKey as keyof typeof scoreActions];
      // Check if function takes 3 parameters
      if (scoreFunction.length === 3) {
        // Extract appropriate number from additionalData based on action type
        let thirdParam = 0;
        if (action.includes('payment') || action.includes('amount')) {
          thirdParam = additionalData.amount || additionalData.total || 0;
        } else if (action.includes('menu') || action.includes('item')) {
          thirdParam = additionalData.itemCount || additionalData.count || 0;
        } else if (action.includes('health') || action.includes('uptime')) {
          thirdParam = additionalData.uptime || additionalData.uptimePercent || 0;
        }
        return (scoreFunction as any)(responseTime, success, thirdParam);
      } else {
        return (scoreFunction as any)(responseTime, success);
      }
    }

    // Default scoring
    const performance = Math.max(0, 100 - (responseTime / 10));
    const reliability = success ? 100 : 0;
    const userExperience = success ? 100 : 50;

    return {
      performance,
      reliability,
      userExperience,
      overall: (performance + reliability + userExperience) / 3
    };
  }

  /**
   * Calculate API score
   */
  private calculateApiScore(
    endpoint: string,
    method: string,
    responseTime: number,
    statusCode: number,
    success: boolean
  ): Record<string, number> {
    const performance = Math.max(0, 100 - (responseTime / 20));
    const reliability = success ? 100 : 0;
    const userExperience = success ? 100 : 50;
    const errorRate = success ? 0 : 100;

    return {
      performance,
      reliability,
      userExperience,
      errorRate,
      responseTime,
      overall: (performance + reliability + userExperience) / 3
    };
  }

  /**
   * Log to GhostLog
   */
  private async logToGhostLog(event: TelemetryEvent): Promise<void> {
    try {
      await fetch('/api/ghost-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: event.timestamp,
          kind: 'telemetry',
          type: event.type,
          component: event.component,
          action: event.action,
          data: event.data,
          metadata: event.metadata
        })
      });
    } catch (error) {
      console.warn('[TelemetryService] Failed to log to GhostLog:', error);
    }
  }

  /**
   * Clear all events
   */
  clear(): void {
    this.events = [];
    console.log('[TelemetryService] 🗑️ Cleared all events');
  }

  /**
   * Export all data
   */
  exportData(): {
    events: TelemetryEvent[];
    reflexScores: ReturnType<typeof reflexScoreAudit.exportAuditData>;
  } {
    return {
      events: this.events,
      reflexScores: reflexScoreAudit.exportAuditData()
    };
  }
}

// Export singleton instance
export const telemetryService = TelemetryService.getInstance();
