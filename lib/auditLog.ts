/**
 * Audit Log (GhostLog) for Hookah+ Production
 * Immutable history of who did what, when, with outcomes
 */

export interface AuditEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userRole: string;
  action: string;
  resource: string;
  resourceId: string;
  outcome: 'success' | 'failure' | 'denied';
  details: Record<string, any>;
  trustLevel: number;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  tableId?: string;
  amount?: number;
  metadata: Record<string, any>;
}

export interface AuditQuery {
  userId?: string;
  action?: string;
  resource?: string;
  outcome?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export class AuditLog {
  private entries: AuditEntry[] = [];
  private maxEntries: number = 10000; // Configurable limit

  /**
   * Log an action with full context
   */
  log(
    userId: string,
    userRole: string,
    action: string,
    resource: string,
    resourceId: string,
    outcome: 'success' | 'failure' | 'denied',
    details: Record<string, any> = {},
    context?: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      tableId?: string;
      amount?: number;
      trustLevel?: number;
    }
  ): string {
    const entry: AuditEntry = {
      id: this.generateId(),
      timestamp: new Date(),
      userId,
      userRole,
      action,
      resource,
      resourceId,
      outcome,
      details,
      trustLevel: context?.trustLevel || 50,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
      sessionId: context?.sessionId,
      tableId: context?.tableId,
      amount: context?.amount,
      metadata: {
        version: '1.0',
        source: 'hookahplus',
        environment: process.env.NODE_ENV || 'development'
      }
    };

    this.entries.push(entry);

    // Maintain max entries limit
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries.slice(-this.maxEntries);
    }

    // In production, this would be stored in a database
    console.log('AUDIT LOG ENTRY:', entry);

    return entry.id;
  }

  /**
   * Query audit entries with filters
   */
  query(query: AuditQuery): AuditEntry[] {
    let results = [...this.entries];

    // Apply filters
    if (query.userId) {
      results = results.filter(entry => entry.userId === query.userId);
    }

    if (query.action) {
      results = results.filter(entry => entry.action === query.action);
    }

    if (query.resource) {
      results = results.filter(entry => entry.resource === query.resource);
    }

    if (query.outcome) {
      results = results.filter(entry => entry.outcome === query.outcome);
    }

    if (query.startDate) {
      results = results.filter(entry => entry.timestamp >= query.startDate!);
    }

    if (query.endDate) {
      results = results.filter(entry => entry.timestamp <= query.endDate!);
    }

    // Sort by timestamp (newest first)
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || 100;

    return results.slice(offset, offset + limit);
  }

  /**
   * Get audit summary for a user
   */
  getUserSummary(userId: string, days: number = 30): {
    totalActions: number;
    successRate: number;
    commonActions: Array<{ action: string; count: number }>;
    trustLevel: number;
    lastActive: Date | null;
  } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const userEntries = this.entries.filter(
      entry => entry.userId === userId && entry.timestamp >= cutoffDate
    );

    const totalActions = userEntries.length;
    const successfulActions = userEntries.filter(entry => entry.outcome === 'success').length;
    const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;

    // Count common actions
    const actionCounts: Record<string, number> = {};
    userEntries.forEach(entry => {
      actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
    });

    const commonActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const lastActive = userEntries.length > 0 
      ? userEntries[userEntries.length - 1].timestamp 
      : null;

    const trustLevel = userEntries.length > 0 
      ? userEntries[userEntries.length - 1].trustLevel 
      : 50;

    return {
      totalActions,
      successRate,
      commonActions,
      trustLevel,
      lastActive
    };
  }

  /**
   * Get system-wide audit summary
   */
  getSystemSummary(days: number = 7): {
    totalActions: number;
    successRate: number;
    topUsers: Array<{ userId: string; actionCount: number }>;
    topActions: Array<{ action: string; count: number }>;
    errorRate: number;
  } {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const recentEntries = this.entries.filter(entry => entry.timestamp >= cutoffDate);

    const totalActions = recentEntries.length;
    const successfulActions = recentEntries.filter(entry => entry.outcome === 'success').length;
    const successRate = totalActions > 0 ? (successfulActions / totalActions) * 100 : 0;
    const errorRate = 100 - successRate;

    // Count actions by user
    const userCounts: Record<string, number> = {};
    recentEntries.forEach(entry => {
      userCounts[entry.userId] = (userCounts[entry.userId] || 0) + 1;
    });

    const topUsers = Object.entries(userCounts)
      .map(([userId, actionCount]) => ({ userId, actionCount }))
      .sort((a, b) => b.actionCount - a.actionCount)
      .slice(0, 10);

    // Count actions by type
    const actionCounts: Record<string, number> = {};
    recentEntries.forEach(entry => {
      actionCounts[entry.action] = (actionCounts[entry.action] || 0) + 1;
    });

    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalActions,
      successRate,
      topUsers,
      topActions,
      errorRate
    };
  }

  /**
   * Generate unique ID for audit entry
   */
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Export audit data for compliance
   */
  exportAuditData(startDate: Date, endDate: Date): AuditEntry[] {
    return this.entries.filter(
      entry => entry.timestamp >= startDate && entry.timestamp <= endDate
    );
  }

  /**
   * Get audit entries for a specific session
   */
  getSessionAudit(sessionId: string): AuditEntry[] {
    return this.entries
      .filter(entry => entry.sessionId === sessionId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  /**
   * Get audit entries for a specific table
   */
  getTableAudit(tableId: string): AuditEntry[] {
    return this.entries
      .filter(entry => entry.tableId === tableId)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}

// Export singleton instance
export const auditLog = new AuditLog();
