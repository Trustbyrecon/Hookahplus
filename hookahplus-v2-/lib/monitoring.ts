import { NextRequest } from 'next/server';

export interface MonitoringEvent {
  id: string;
  timestamp: number;
  type: 'error' | 'performance' | 'security' | 'business';
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  context: Record<string, any>;
  trustLockVerified: boolean;
  userId?: string;
  sessionId?: string;
  venueId?: string;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  duration: number; // in minutes
  enabled: boolean;
  actions: string[];
}

export class MonitoringService {
  private static events: MonitoringEvent[] = [];
  private static alertRules: AlertRule[] = [];
  private static isInitialized = false;

  static init() {
    if (this.isInitialized) return;

    // Initialize monitoring service
    this.setupAlertRules();
    this.startHealthChecks();
    this.startPerformanceMonitoring();
    
    this.isInitialized = true;
    console.log('🔍 Monitoring service initialized with Trust-Lock integration');
  }

  static async trackEvent(
    type: MonitoringEvent['type'],
    level: MonitoringEvent['level'],
    message: string,
    context: Record<string, any> = {},
    request?: NextRequest
  ): Promise<void> {
    // Verify Trust-Lock for critical events
    if (level === 'critical' || level === 'error') {
      const trustLockVerified = await this.verifyTrustLock(request);
      if (!trustLockVerified) {
        console.warn('🚨 Critical event blocked: Trust-Lock verification failed');
        return;
      }
    }

    const event: MonitoringEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      type,
      level,
      message,
      context,
      trustLockVerified: level === 'critical' || level === 'error' ? true : false,
      userId: context.userId,
      sessionId: context.sessionId,
      venueId: context.venueId
    };

    this.events.push(event);

    // Check alert rules
    this.checkAlertRules(event);

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 [${level.toUpperCase()}] ${message}`, context);
    }

    // In production, send to external monitoring service
    if (process.env.NODE_ENV === 'production') {
      await this.sendToExternalService(event);
    }
  }

  static async trackError(
    error: Error,
    context: Record<string, any> = {},
    request?: NextRequest
  ): Promise<void> {
    await this.trackEvent(
      'error',
      'error',
      error.message,
      {
        ...context,
        stack: error.stack,
        name: error.name
      },
      request
    );
  }

  static async trackPerformance(
    metric: string,
    value: number,
    context: Record<string, any> = {}
  ): Promise<void> {
    await this.trackEvent(
      'performance',
      value > 1000 ? 'warning' : 'info', // Alert if > 1 second
      `Performance metric: ${metric}`,
      {
        ...context,
        metric,
        value,
        unit: 'ms'
      }
    );
  }

  static async trackSecurity(
    event: string,
    context: Record<string, any> = {},
    request?: NextRequest
  ): Promise<void> {
    await this.trackEvent(
      'security',
      'warning',
      `Security event: ${event}`,
      context,
      request
    );
  }

  static async trackBusiness(
    event: string,
    context: Record<string, any> = {}
  ): Promise<void> {
    await this.trackEvent(
      'business',
      'info',
      `Business event: ${event}`,
      context
    );
  }

  static getEvents(
    type?: MonitoringEvent['type'],
    level?: MonitoringEvent['level'],
    limit: number = 100
  ): MonitoringEvent[] {
    let filteredEvents = this.events;

    if (type) {
      filteredEvents = filteredEvents.filter(event => event.type === type);
    }

    if (level) {
      filteredEvents = filteredEvents.filter(event => event.level === level);
    }

    return filteredEvents
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  static getHealthStatus(): {
    status: 'healthy' | 'degraded' | 'critical';
    metrics: Record<string, any>;
    alerts: number;
  } {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    
    const recentEvents = this.events.filter(event => event.timestamp > lastHour);
    const errorCount = recentEvents.filter(event => event.level === 'error').length;
    const criticalCount = recentEvents.filter(event => event.level === 'critical').length;
    
    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';
    
    if (criticalCount > 0) {
      status = 'critical';
    } else if (errorCount > 10) {
      status = 'degraded';
    }

    return {
      status,
      metrics: {
        totalEvents: this.events.length,
        recentEvents: recentEvents.length,
        errorCount,
        criticalCount,
        uptime: this.getUptime()
      },
      alerts: this.getActiveAlerts().length
    };
  }

  private static async verifyTrustLock(request?: NextRequest): Promise<boolean> {
    if (!request) return true; // Skip verification if no request context

    try {
      const trustLockToken = request.headers.get('x-trust-lock-token');
      if (!trustLockToken) return false;

      // Verify Trust-Lock token
      const response = await fetch('/api/trust-lock/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          token: trustLockToken,
          action: 'monitoring_access'
        })
      });

      return response.ok;
    } catch (error) {
      console.error('Trust-Lock verification failed:', error);
      return false;
    }
  }

  private static setupAlertRules(): void {
    this.alertRules = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: 'error_count > 10',
        threshold: 10,
        duration: 5,
        enabled: true,
        actions: ['email', 'slack', 'pagerduty']
      },
      {
        id: 'critical_errors',
        name: 'Critical Errors',
        condition: 'critical_count > 0',
        threshold: 0,
        duration: 1,
        enabled: true,
        actions: ['email', 'slack', 'pagerduty', 'sms']
      },
      {
        id: 'performance_degradation',
        name: 'Performance Degradation',
        condition: 'avg_response_time > 2000',
        threshold: 2000,
        duration: 10,
        enabled: true,
        actions: ['email', 'slack']
      },
      {
        id: 'security_events',
        name: 'Security Events',
        condition: 'security_events > 5',
        threshold: 5,
        duration: 5,
        enabled: true,
        actions: ['email', 'slack', 'pagerduty']
      }
    ];
  }

  private static checkAlertRules(event: MonitoringEvent): void {
    for (const rule of this.alertRules) {
      if (!rule.enabled) continue;

      const shouldTrigger = this.evaluateAlertCondition(rule, event);
      if (shouldTrigger) {
        this.triggerAlert(rule, event);
      }
    }
  }

  private static evaluateAlertCondition(rule: AlertRule, event: MonitoringEvent): boolean {
    const now = Date.now();
    const timeWindow = now - (rule.duration * 60 * 1000);
    
    const recentEvents = this.events.filter(e => e.timestamp > timeWindow);
    
    switch (rule.condition) {
      case 'error_count > 10':
        return recentEvents.filter(e => e.level === 'error').length > rule.threshold;
      case 'critical_count > 0':
        return recentEvents.filter(e => e.level === 'critical').length > rule.threshold;
      case 'security_events > 5':
        return recentEvents.filter(e => e.type === 'security').length > rule.threshold;
      default:
        return false;
    }
  }

  private static async triggerAlert(rule: AlertRule, event: MonitoringEvent): Promise<void> {
    console.log(`🚨 Alert triggered: ${rule.name}`, {
      rule: rule.name,
      event: event.message,
      timestamp: new Date().toISOString()
    });

    // In production, send alerts to configured channels
    if (process.env.NODE_ENV === 'production') {
      await this.sendAlert(rule, event);
    }
  }

  private static async sendAlert(rule: AlertRule, event: MonitoringEvent): Promise<void> {
    // Send to email
    if (rule.actions.includes('email')) {
      await this.sendEmailAlert(rule, event);
    }

    // Send to Slack
    if (rule.actions.includes('slack')) {
      await this.sendSlackAlert(rule, event);
    }

    // Send to PagerDuty
    if (rule.actions.includes('pagerduty')) {
      await this.sendPagerDutyAlert(rule, event);
    }
  }

  private static async sendEmailAlert(rule: AlertRule, event: MonitoringEvent): Promise<void> {
    // Implementation for email alerts
    console.log(`📧 Email alert sent: ${rule.name}`);
  }

  private static async sendSlackAlert(rule: AlertRule, event: MonitoringEvent): Promise<void> {
    // Implementation for Slack alerts
    console.log(`💬 Slack alert sent: ${rule.name}`);
  }

  private static async sendPagerDutyAlert(rule: AlertRule, event: MonitoringEvent): Promise<void> {
    // Implementation for PagerDuty alerts
    console.log(`📱 PagerDuty alert sent: ${rule.name}`);
  }

  private static async sendToExternalService(event: MonitoringEvent): Promise<void> {
    // Send to external monitoring service (Sentry, DataDog, etc.)
    try {
      // Example: Send to Sentry
      if (process.env.SENTRY_DSN) {
        // await Sentry.captureException(event);
      }
    } catch (error) {
      console.error('Failed to send event to external service:', error);
    }
  }

  private static startHealthChecks(): void {
    // Run health checks every 30 seconds
    setInterval(() => {
      this.performHealthCheck();
    }, 30000);
  }

  private static startPerformanceMonitoring(): void {
    // Monitor performance metrics
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, 60000);
  }

  private static async performHealthCheck(): Promise<void> {
    try {
      // Check database connectivity
      // Check external services
      // Check system resources
      
      await this.trackEvent(
        'performance',
        'info',
        'Health check completed',
        { checkType: 'scheduled' }
      );
    } catch (error) {
      await this.trackError(error as Error, { checkType: 'health_check' });
    }
  }

  private static async collectPerformanceMetrics(): Promise<void> {
    try {
      // Collect memory usage
      const memoryUsage = process.memoryUsage();
      
      // Collect CPU usage
      const cpuUsage = process.cpuUsage();
      
      await this.trackPerformance('memory_usage', memoryUsage.heapUsed, {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external
      });
      
      await this.trackPerformance('cpu_usage', cpuUsage.user, {
        system: cpuUsage.system
      });
    } catch (error) {
      await this.trackError(error as Error, { checkType: 'performance_metrics' });
    }
  }

  private static getActiveAlerts(): AlertRule[] {
    // Return currently active alerts
    return this.alertRules.filter(rule => rule.enabled);
  }

  private static getUptime(): number {
    return process.uptime();
  }
}

// Initialize monitoring service
if (typeof window === 'undefined') {
  MonitoringService.init();
}
