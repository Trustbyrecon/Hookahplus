/**
 * KTL-4 Health Integration Library
 * 
 * Provides health check integration between payment server and KTL-4 system
 */

export interface HealthCheckResult {
  flowName: string;
  checkType: string;
  status: 'healthy' | 'degraded' | 'critical' | 'failed';
  threshold?: string;
  actualValue?: string | undefined;
  details: Record<string, any>;
  issues: string[];
}

export interface HealthCheckConfig {
  flowName: string;
  checkType: string;
  threshold: string;
  intervalMs: number;
  enabled: boolean;
}

class Ktl4HealthIntegration {
  private static instance: Ktl4HealthIntegration;
  private configs: Map<string, HealthCheckConfig> = new Map();

  static getInstance(): Ktl4HealthIntegration {
    if (!Ktl4HealthIntegration.instance) {
      Ktl4HealthIntegration.instance = new Ktl4HealthIntegration();
    }
    return Ktl4HealthIntegration.instance;
  }

  constructor() {
    this.initializeDefaultConfigs();
  }

  private initializeDefaultConfigs(): void {
    const defaultConfigs: HealthCheckConfig[] = [
      // Payment Settlement Health Checks
      {
        flowName: 'payment_settlement',
        checkType: 'reconciliation',
        threshold: '0',
        intervalMs: 15 * 60 * 1000, // 15 minutes
        enabled: true
      },
      {
        flowName: 'payment_settlement',
        checkType: 'webhook_success',
        threshold: '99',
        intervalMs: 30 * 60 * 1000, // 30 minutes
        enabled: true
      },
      {
        flowName: 'payment_settlement',
        checkType: 'orphaned_charges',
        threshold: '3',
        intervalMs: 15 * 60 * 1000, // 15 minutes
        enabled: true
      },

      // Session Lifecycle Health Checks
      {
        flowName: 'session_lifecycle',
        checkType: 'timer_heartbeat',
        threshold: '120',
        intervalMs: 2 * 60 * 1000, // 2 minutes
        enabled: true
      },
      {
        flowName: 'session_lifecycle',
        checkType: 'pricing_lock_latency',
        threshold: '30',
        intervalMs: 5 * 60 * 1000, // 5 minutes
        enabled: true
      },

      // Order Intake Health Checks
      {
        flowName: 'order_intake',
        checkType: 'confirmation_latency',
        threshold: '3',
        intervalMs: 10 * 60 * 1000, // 10 minutes
        enabled: true
      },
      {
        flowName: 'order_intake',
        checkType: 'unbound_orders',
        threshold: '0',
        intervalMs: 5 * 60 * 1000, // 5 minutes
        enabled: true
      },

      // POS Sync Health Checks
      {
        flowName: 'pos_sync',
        checkType: 'ledger_parity',
        threshold: '0',
        intervalMs: 60 * 60 * 1000, // 1 hour
        enabled: true
      },
      {
        flowName: 'pos_sync',
        checkType: 'unmatched_refunds',
        threshold: '0',
        intervalMs: 5 * 60 * 1000, // 5 minutes
        enabled: true
      }
    ];

    defaultConfigs.forEach(config => {
      this.configs.set(`${config.flowName}.${config.checkType}`, config);
    });
  }

  async runHealthCheck(flowName: string, checkType: string): Promise<HealthCheckResult> {
    const configKey = `${flowName}.${checkType}`;
    const config = this.configs.get(configKey);
    
    if (!config || !config.enabled) {
      throw new Error(`Health check not configured: ${configKey}`);
    }

    let result: HealthCheckResult;

    switch (flowName) {
      case 'payment_settlement':
        result = await this.checkPaymentSettlement(checkType, config);
        break;
      case 'session_lifecycle':
        result = await this.checkSessionLifecycle(checkType, config);
        break;
      case 'order_intake':
        result = await this.checkOrderIntake(checkType, config);
        break;
      case 'pos_sync':
        result = await this.checkPosSync(checkType, config);
        break;
      default:
        throw new Error(`Unknown flow: ${flowName}`);
    }

    console.log(`[KTL-4 Health] ${result.flowName}.${result.checkType}: ${result.status}`);
    
    return result;
  }

  private async checkPaymentSettlement(checkType: string, config: HealthCheckConfig): Promise<HealthCheckResult> {
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' | 'failed' = 'healthy';
    let actualValue: string | undefined;
    const details: Record<string, any> = {};

    switch (checkType) {
      case 'reconciliation':
        // Mock reconciliation check
        const orphanedCharges = 0; // In production, check actual orphaned charges
        actualValue = orphanedCharges.toString();
        details['orphanedCharges'] = orphanedCharges;

        if (orphanedCharges > parseInt(config.threshold)) {
          status = orphanedCharges > 10 ? 'critical' : 'degraded';
          issues.push(`${orphanedCharges} orphaned charges found`);
        }
        break;

      case 'webhook_success':
        // Mock webhook success rate
        const webhookSuccessRate = 99.5;
        actualValue = webhookSuccessRate.toString();
        details['webhookSuccessRate'] = webhookSuccessRate;

        if (webhookSuccessRate < parseInt(config.threshold)) {
          status = webhookSuccessRate < 95 ? 'critical' : 'degraded';
          issues.push(`Webhook success rate ${webhookSuccessRate}% below threshold`);
        }
        break;

      case 'orphaned_charges':
        // Mock orphaned charges check
        const recentOrphaned = 0;
        actualValue = recentOrphaned.toString();
        details['recentOrphaned'] = recentOrphaned;

        if (recentOrphaned > parseInt(config.threshold)) {
          status = recentOrphaned > 5 ? 'critical' : 'degraded';
          issues.push(`${recentOrphaned} charges pending ticket creation`);
        }
        break;
    }

    return {
      flowName: 'payment_settlement',
      checkType,
      status,
      threshold: config.threshold,
      actualValue,
      details,
      issues
    };
  }

  private async checkSessionLifecycle(checkType: string, config: HealthCheckConfig): Promise<HealthCheckResult> {
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' | 'failed' = 'healthy';
    let actualValue: string | undefined;
    const details: Record<string, any> = {};

    switch (checkType) {
      case 'timer_heartbeat':
        // Mock timer heartbeat check
        const staleHeartbeats = 0;
        actualValue = staleHeartbeats.toString();
        details['staleHeartbeats'] = staleHeartbeats;

        if (staleHeartbeats > 0) {
          status = staleHeartbeats > 5 ? 'critical' : 'degraded';
          issues.push(`${staleHeartbeats} sessions with stale heartbeats`);
        }
        break;

      case 'pricing_lock_latency':
        // Mock pricing lock latency check
        const unlockedSessions = 0;
        actualValue = unlockedSessions.toString();
        details['unlockedSessions'] = unlockedSessions;

        if (unlockedSessions > 0) {
          status = unlockedSessions > 3 ? 'critical' : 'degraded';
          issues.push(`${unlockedSessions} completed sessions without pricing locks`);
        }
        break;
    }

    return {
      flowName: 'session_lifecycle',
      checkType,
      status,
      threshold: config.threshold,
      actualValue,
      details,
      issues
    };
  }

  private async checkOrderIntake(checkType: string, config: HealthCheckConfig): Promise<HealthCheckResult> {
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' | 'failed' = 'healthy';
    let actualValue: string | undefined;
    const details: Record<string, any> = {};

    switch (checkType) {
      case 'confirmation_latency':
        // Mock confirmation latency check
        const avgConfirmationLatency = 2.5;
        actualValue = avgConfirmationLatency.toString();
        details['avgConfirmationLatency'] = avgConfirmationLatency;

        if (avgConfirmationLatency > parseInt(config.threshold)) {
          status = avgConfirmationLatency > 5 ? 'critical' : 'degraded';
          issues.push(`Confirmation latency ${avgConfirmationLatency}s exceeds threshold`);
        }
        break;

      case 'unbound_orders':
        // Mock unbound orders check
        const unboundOrders = 0;
        actualValue = unboundOrders.toString();
        details['unboundOrders'] = unboundOrders;

        if (unboundOrders > parseInt(config.threshold)) {
          status = unboundOrders > 1 ? 'critical' : 'degraded';
          issues.push(`${unboundOrders} unbound orders found`);
        }
        break;
    }

    return {
      flowName: 'order_intake',
      checkType,
      status,
      threshold: config.threshold,
      actualValue,
      details,
      issues
    };
  }

  private async checkPosSync(checkType: string, config: HealthCheckConfig): Promise<HealthCheckResult> {
    const issues: string[] = [];
    let status: 'healthy' | 'degraded' | 'critical' | 'failed' = 'healthy';
    let actualValue: string | undefined;
    const details: Record<string, any> = {};

    switch (checkType) {
      case 'ledger_parity':
        // Mock ledger parity check
        const ledgerMismatch = 0;
        actualValue = ledgerMismatch.toString();
        details['ledgerMismatch'] = ledgerMismatch;

        if (ledgerMismatch > parseInt(config.threshold)) {
          status = ledgerMismatch > 100 ? 'critical' : 'degraded';
          issues.push(`Ledger mismatch of $${ledgerMismatch / 100}`);
        }
        break;

      case 'unmatched_refunds':
        // Mock unmatched refunds check
        const unmatchedRefunds = 0;
        actualValue = unmatchedRefunds.toString();
        details['unmatchedRefunds'] = unmatchedRefunds;

        if (unmatchedRefunds > parseInt(config.threshold)) {
          status = unmatchedRefunds > 3 ? 'critical' : 'degraded';
          issues.push(`${unmatchedRefunds} unmatched refunds found`);
        }
        break;
    }

    return {
      flowName: 'pos_sync',
      checkType,
      status,
      threshold: config.threshold,
      actualValue,
      details,
      issues
    };
  }

  getConfig(flowName: string, checkType: string): HealthCheckConfig | undefined {
    return this.configs.get(`${flowName}.${checkType}`);
  }

  updateConfig(flowName: string, checkType: string, config: Partial<HealthCheckConfig>): void {
    const configKey = `${flowName}.${checkType}`;
    const existing = this.configs.get(configKey);
    
    if (existing) {
      this.configs.set(configKey, { ...existing, ...config });
    }
  }

  getAllConfigs(): Array<{ key: string } & HealthCheckConfig> {
    return Array.from(this.configs.entries()).map(([key, config]) => ({
      key,
      ...config
    }));
  }
}

// Export singleton instance
export const ktl4HealthIntegration = Ktl4HealthIntegration.getInstance();

// Export convenience functions
export const runKtl4HealthCheck = (flowName: string, checkType: string) =>
  ktl4HealthIntegration.runHealthCheck(flowName, checkType);

export const updateKtl4HealthConfig = (flowName: string, checkType: string, config: Partial<HealthCheckConfig>) =>
  ktl4HealthIntegration.updateConfig(flowName, checkType, config);

export const getKtl4HealthConfig = (flowName: string, checkType: string) =>
  ktl4HealthIntegration.getConfig(flowName, checkType);

export const getAllKtl4HealthConfigs = () => ktl4HealthIntegration.getAllConfigs();
