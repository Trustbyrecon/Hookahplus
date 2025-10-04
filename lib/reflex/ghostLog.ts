// lib/reflex/ghostLog.ts
// GhostLog - Reflexive memory system for AI agents

import type { 
  GhostLogEntry, 
  EnrichmentFingerprint, 
  ReflexScore, 
  FailureAnalysis,
  TrustGraphNode 
} from '../../types/reflex';

export class GhostLog {
  private static entries: GhostLogEntry[] = [];
  private static maxEntries = 1000;
  private static trustGraph: Map<string, TrustGraphNode> = new Map();

  /**
   * Log a reflex operation with full context
   */
  static log(
    agentId: string,
    operationId: string,
    route: string,
    action: string,
    score: ReflexScore,
    failures: FailureAnalysis[] = [],
    context: Record<string, any> = {}
  ): GhostLogEntry {
    const entry: GhostLogEntry = {
      id: `ghost_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      agentId,
      operationId,
      route,
      action,
      score: score.value,
      failureType: failures.length > 0 ? failures[0].type : undefined,
      patch: failures.find(f => f.suggestedPatch)?.suggestedPatch,
      outcome: this.determineOutcome(score, failures),
      fingerprint: this.generateFingerprint(agentId, operationId, score),
      context,
      escalationReason: failures.some(f => f.escalationRequired) ? 
        "Critical failures detected" : undefined,
      recoveryActions: failures.flatMap(f => f.recoveryPotential === "auto" ? 
        [f.suggestedPatch || "auto_recovery"] : [])
    };

    this.entries.push(entry);
    this.maintainSize();
    this.updateTrustGraph(entry);

    // Emit to console for development
    this.emitToConsole(entry);

    return entry;
  }

  /**
   * Log a simple event (backward compatibility)
   */
  static logEvent(event: Record<string, unknown>): void {
    try {
      console.info("[GhostLog]", JSON.stringify(event));
    } catch (error) {
      console.error("[GhostLog] Failed to log event:", error);
    }
  }

  /**
   * Get recent entries with optional filtering
   */
  static getEntries(options: {
    agentId?: string;
    route?: string;
    outcome?: string;
    limit?: number;
    since?: number;
  } = {}): GhostLogEntry[] {
    let filtered = [...this.entries];

    if (options.agentId) {
      filtered = filtered.filter(entry => entry.agentId === options.agentId);
    }
    if (options.route) {
      filtered = filtered.filter(entry => entry.route === options.route);
    }
    if (options.outcome) {
      filtered = filtered.filter(entry => entry.outcome === options.outcome);
    }
    if (options.since) {
      filtered = filtered.filter(entry => entry.timestamp >= options.since!);
    }

    return filtered
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, options.limit || 100);
  }

  /**
   * Get agent performance statistics
   */
  static getAgentStats(agentId: string, timeWindow: number = 24 * 60 * 60 * 1000): {
    totalOperations: number;
    successRate: number;
    averageScore: number;
    failureRate: number;
    commonFailures: { type: string; count: number }[];
    trustScore: number;
  } {
    const since = Date.now() - timeWindow;
    const entries = this.getEntries({ agentId, since });
    
    const totalOperations = entries.length;
    const successfulOps = entries.filter(e => e.outcome === "success").length;
    const failedOps = entries.filter(e => e.outcome === "failure").length;
    const successRate = totalOperations > 0 ? successfulOps / totalOperations : 0;
    const averageScore = totalOperations > 0 ? 
      entries.reduce((sum, e) => sum + e.score, 0) / totalOperations : 0;
    const failureRate = totalOperations > 0 ? failedOps / totalOperations : 0;

    // Count failure types
    const failureCounts = new Map<string, number>();
    entries.forEach(entry => {
      if (entry.failureType) {
        failureCounts.set(entry.failureType, (failureCounts.get(entry.failureType) || 0) + 1);
      }
    });
    const commonFailures = Array.from(failureCounts.entries())
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count);

    const trustNode = this.trustGraph.get(agentId);
    const trustScore = trustNode?.trustScore || 0;

    return {
      totalOperations,
      successRate,
      averageScore,
      failureRate,
      commonFailures,
      trustScore
    };
  }

  /**
   * Get system health overview
   */
  static getSystemHealth(): {
    overallHealth: number;
    activeAgents: number;
    criticalIssues: number;
    recentFailures: GhostLogEntry[];
    trustGraphHealth: number;
  } {
    const recentEntries = this.getEntries({ limit: 100 });
    const recentFailures = recentEntries.filter(e => e.outcome === "failure");
    const criticalIssues = recentFailures.filter(e => e.escalationReason).length;
    
    const activeAgents = new Set(recentEntries.map(e => e.agentId)).size;
    const averageScore = recentEntries.length > 0 ? 
      recentEntries.reduce((sum, e) => sum + e.score, 0) / recentEntries.length : 0;
    
    const trustScores = Array.from(this.trustGraph.values()).map(n => n.trustScore);
    const trustGraphHealth = trustScores.length > 0 ? 
      trustScores.reduce((sum, score) => sum + score, 0) / trustScores.length : 0;

    return {
      overallHealth: averageScore,
      activeAgents,
      criticalIssues,
      recentFailures: recentFailures.slice(0, 10),
      trustGraphHealth
    };
  }

  /**
   * Export all entries for external analysis
   */
  static exportEntries(): string {
    return JSON.stringify({
      entries: this.entries,
      trustGraph: Object.fromEntries(this.trustGraph),
      exportedAt: new Date().toISOString(),
      version: "1.0"
    }, null, 2);
  }

  /**
   * Clear all entries (use with caution)
   */
  static clear(): void {
    this.entries = [];
    this.trustGraph.clear();
  }

  /**
   * Generate enrichment fingerprint for an operation
   */
  private static generateFingerprint(
    agentId: string, 
    operationId: string, 
    score: ReflexScore
  ): EnrichmentFingerprint {
    return {
      outputType: "json", // Default for badge operations
      signal: score.components.accuracy,
      domainMatch: score.components.completeness,
      reliability: score.components.consistency,
      timestamp: Date.now(),
      agentId,
      operationId
    };
  }

  /**
   * Determine operation outcome based on score and failures
   */
  private static determineOutcome(score: ReflexScore, failures: FailureAnalysis[]): 
    "success" | "failure" | "recovery" | "escalation" {
    if (failures.some(f => f.escalationRequired)) return "escalation";
    if (failures.length > 0) return "recovery";
    if (score.value >= 0.92) return "success";
    return "failure";
  }

  /**
   * Update trust graph based on operation outcome
   */
  private static updateTrustGraph(entry: GhostLogEntry): void {
    const existing = this.trustGraph.get(entry.agentId);
    const trustAdjustment = this.calculateTrustAdjustment(entry);
    
    if (existing) {
      existing.trustScore = Math.max(0, Math.min(1, existing.trustScore + trustAdjustment));
      existing.lastInteraction = entry.timestamp;
      existing.successRate = this.calculateSuccessRate(entry.agentId);
    } else {
      this.trustGraph.set(entry.agentId, {
        agentId: entry.agentId,
        trustScore: 0.5 + trustAdjustment, // Start at neutral
        lastInteraction: entry.timestamp,
        successRate: entry.outcome === "success" ? 1 : 0,
        failurePatterns: entry.failureType ? [entry.failureType] : [],
        capabilities: [], // Will be populated by specific agents
        connections: []
      });
    }
  }

  /**
   * Calculate trust adjustment based on operation outcome
   */
  private static calculateTrustAdjustment(entry: GhostLogEntry): number {
    const baseAdjustment = 0.01;
    
    switch (entry.outcome) {
      case "success":
        return baseAdjustment * entry.score; // Higher score = more trust
      case "recovery":
        return baseAdjustment * 0.5; // Partial trust for recovery
      case "failure":
        return -baseAdjustment * 0.5; // Reduce trust for failures
      case "escalation":
        return -baseAdjustment; // Reduce trust for escalations
      default:
        return 0;
    }
  }

  /**
   * Calculate success rate for an agent
   */
  private static calculateSuccessRate(agentId: string): number {
    const entries = this.getEntries({ agentId, limit: 100 });
    const successful = entries.filter(e => e.outcome === "success").length;
    return entries.length > 0 ? successful / entries.length : 0;
  }

  /**
   * Maintain maximum entry count
   */
  private static maintainSize(): void {
    if (this.entries.length > this.maxEntries) {
      this.entries = this.entries
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, this.maxEntries);
    }
  }

  /**
   * Emit entry to console for development
   */
  private static emitToConsole(entry: GhostLogEntry): void {
    const logLevel = entry.outcome === "escalation" ? "error" : 
                    entry.outcome === "failure" ? "warn" : "info";
    
    console[logLevel](`[GhostLog] ${entry.agentId}: ${entry.action} - Score: ${entry.score.toFixed(2)} (${entry.outcome})`);
    
    if (entry.failureType) {
      console.warn(`[GhostLog] Failure: ${entry.failureType} - ${entry.escalationReason || "Recovery needed"}`);
    }
  }
}

// Export convenience functions
export const ghostLog = GhostLog.log;
export const logEvent = GhostLog.logEvent;
export const getEntries = GhostLog.getEntries;
export const getAgentStats = GhostLog.getAgentStats;
export const getSystemHealth = GhostLog.getSystemHealth;
export const exportEntries = GhostLog.exportEntries;
