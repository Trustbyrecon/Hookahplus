export interface ReflexScoreAuditEntry {
  id: string;
  timestamp: string;
  component: string;
  action: string;
  score: number;
  maxScore: number;
  details: {
    performance?: number;
    reliability?: number;
    userExperience?: number;
    errorRate?: number;
    responseTime?: number;
    [key: string]: any;
  };
  metadata: {
    userId?: string;
    sessionId?: string;
    tableId?: string;
    userRole?: string;
    environment: string;
    version: string;
  };
}

export interface ReflexScoreMetrics {
  overall: number;
  performance: number;
  reliability: number;
  userExperience: number;
  errorRate: number;
  responseTime: number;
  lastUpdated: string;
}

export class ReflexScoreAudit {
  private static instance: ReflexScoreAudit;
  private scores: Map<string, number> = new Map();
  private auditLog: ReflexScoreAuditEntry[] = [];
  private maxLogEntries = 1000;

  static getInstance(): ReflexScoreAudit {
    if (!ReflexScoreAudit.instance) {
      ReflexScoreAudit.instance = new ReflexScoreAudit();
    }
    return ReflexScoreAudit.instance;
  }

  /**
   * Record a score for a component/action
   */
  recordScore(
    component: string,
    action: string,
    score: number,
    maxScore: number = 100,
    details: Record<string, any> = {},
    metadata: Partial<ReflexScoreAuditEntry['metadata']> = {}
  ): void {
    const entry: ReflexScoreAuditEntry = {
      id: `reflex_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      component,
      action,
      score,
      maxScore,
      details,
      metadata: {
        environment: process.env.NODE_ENV || 'development',
        version: process.env.npm_package_version || '1.0.0',
        ...metadata
      }
    };

    // Store the score
    const key = `${component}:${action}`;
    this.scores.set(key, score);

    // Add to audit log
    this.auditLog.push(entry);
    if (this.auditLog.length > this.maxLogEntries) {
      this.auditLog = this.auditLog.slice(-this.maxLogEntries);
    }

    // Log to GhostLog
    this.logToGhostLog(entry);

    console.log(`[ReflexScoreAudit] 📊 ${component}:${action} = ${score}/${maxScore}`);
  }

  /**
   * Get current metrics
   */
  getMetrics(): ReflexScoreMetrics {
    const entries = this.auditLog.slice(-100); // Last 100 entries
    if (entries.length === 0) {
      return {
        overall: 0,
        performance: 0,
        reliability: 0,
        userExperience: 0,
        errorRate: 0,
        responseTime: 0,
        lastUpdated: new Date().toISOString()
      };
    }

    const performance = this.calculateAverage(entries, 'performance') || 0;
    const reliability = this.calculateAverage(entries, 'reliability') || 0;
    const userExperience = this.calculateAverage(entries, 'userExperience') || 0;
    const errorRate = this.calculateAverage(entries, 'errorRate') || 0;
    const responseTime = this.calculateAverage(entries, 'responseTime') || 0;

    const overall = (performance + reliability + userExperience) / 3;

    return {
      overall: Math.round(overall),
      performance: Math.round(performance),
      reliability: Math.round(reliability),
      userExperience: Math.round(userExperience),
      errorRate: Math.round(errorRate),
      responseTime: Math.round(responseTime),
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Get audit log entries
   */
  getAuditLog(limit: number = 50): ReflexScoreAuditEntry[] {
    return this.auditLog
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  /**
   * Get scores by component
   */
  getScoresByComponent(component: string): Record<string, number> {
    const componentScores: Record<string, number> = {};
    Array.from(this.scores.entries()).forEach(([key, score]) => {
      if (key.startsWith(`${component}:`)) {
        const action = key.split(':')[1];
        componentScores[action] = score;
      }
    });
    return componentScores;
  }

  /**
   * Calculate average for a specific metric
   */
  private calculateAverage(entries: ReflexScoreAuditEntry[], metric: string): number {
    const values = entries
      .map(entry => entry.details[metric])
      .filter(value => typeof value === 'number' && !isNaN(value));
    
    if (values.length === 0) return 0;
    
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  /**
   * Log to GhostLog
   */
  private async logToGhostLog(entry: ReflexScoreAuditEntry): Promise<void> {
    try {
      await fetch('/api/ghost-log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timestamp: entry.timestamp,
          kind: 'reflex_score_audit',
          component: entry.component,
          action: entry.action,
          score: entry.score,
          maxScore: entry.maxScore,
          details: entry.details,
          metadata: entry.metadata
        })
      });
    } catch (error) {
      console.warn('[ReflexScoreAudit] Failed to log to GhostLog:', error);
    }
  }

  /**
   * Reset all scores and audit log
   */
  reset(): void {
    this.scores.clear();
    this.auditLog = [];
    console.log('[ReflexScoreAudit] 🔄 Reset all scores and audit log');
  }

  /**
   * Export audit data
   */
  exportAuditData(): {
    scores: Record<string, number>;
    auditLog: ReflexScoreAuditEntry[];
    metrics: ReflexScoreMetrics;
  } {
    const scoresObject: Record<string, number> = {};
    Array.from(this.scores.entries()).forEach(([key, score]) => {
      scoresObject[key] = score;
    });

    return {
      scores: scoresObject,
      auditLog: this.auditLog,
      metrics: this.getMetrics()
    };
  }
}

// Export singleton instance
export const reflexScoreAudit = ReflexScoreAudit.getInstance();

// Predefined scoring functions for common actions
export const scoreActions = {
  // Session management
  sessionCreated: (responseTime: number, success: boolean) => {
    const performance = Math.max(0, 100 - (responseTime / 10)); // 100ms = 90 points
    const reliability = success ? 100 : 0;
    return { performance, reliability };
  },

  sessionUpdated: (responseTime: number, success: boolean) => {
    const performance = Math.max(0, 100 - (responseTime / 10));
    const reliability = success ? 100 : 0;
    return { performance, reliability };
  },

  // Payment processing
  paymentProcessed: (responseTime: number, success: boolean, amount: number) => {
    const performance = Math.max(0, 100 - (responseTime / 20)); // 200ms = 90 points
    const reliability = success ? 100 : 0;
    const userExperience = success ? 100 : 50;
    return { performance, reliability, userExperience };
  },

  // Timer operations
  timerStarted: (responseTime: number, success: boolean) => {
    const performance = Math.max(0, 100 - (responseTime / 5)); // 50ms = 90 points
    const reliability = success ? 100 : 0;
    return { performance, reliability };
  },

  timerStopped: (responseTime: number, success: boolean) => {
    const performance = Math.max(0, 100 - (responseTime / 5));
    const reliability = success ? 100 : 0;
    return { performance, reliability };
  },

  // Menu operations
  menuLoaded: (responseTime: number, success: boolean, itemCount: number) => {
    const performance = Math.max(0, 100 - (responseTime / 10));
    const reliability = success ? 100 : 0;
    const userExperience = success && itemCount > 0 ? 100 : 50;
    return { performance, reliability, userExperience };
  },

  // Edge case reporting
  edgeCaseReported: (responseTime: number, success: boolean) => {
    const performance = Math.max(0, 100 - (responseTime / 15));
    const reliability = success ? 100 : 0;
    return { performance, reliability };
  },

  // API health
  apiHealth: (responseTime: number, success: boolean, uptime: number) => {
    const performance = Math.max(0, 100 - (responseTime / 20));
    const reliability = success ? 100 : 0;
    const userExperience = uptime > 99 ? 100 : uptime;
    return { performance, reliability, userExperience };
  }
};
