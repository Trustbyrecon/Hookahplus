// hookahplus-v2-/lib/flag-manager.ts
import { EventEmitter } from 'events';

export interface Flag {
  id: string;
  sessionId: string;
  tableId: string;
  flagType: 'equipment_issue' | 'customer_complaint' | 'staff_issue' | 'payment_issue' | 'safety_concern' | 'quality_issue';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedBy: string;
  reportedAt: number;
  status: 'open' | 'acknowledged' | 'in_progress' | 'resolved' | 'escalated';
  assignedTo?: string;
  resolvedAt?: number;
  resolution?: string;
  escalatedTo?: string;
  escalatedAt?: number;
  metadata?: any;
}

export interface EdgeCase {
  id: string;
  flagId: string;
  sessionId: string;
  tableId: string;
  caseType: 'equipment_failure' | 'customer_dispute' | 'staff_conflict' | 'payment_dispute' | 'safety_incident' | 'quality_control';
  priority: 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  description: string;
  createdBy: string;
  createdAt: number;
  status: 'new' | 'assigned' | 'investigating' | 'resolved' | 'escalated';
  assignedTo?: string;
  assignedAt?: number;
  resolution?: string;
  resolvedAt?: number;
  escalatedTo?: string;
  escalatedAt?: number;
  adminAlerts: AdminAlert[];
  metadata?: any;
}

export interface AdminAlert {
  id: string;
  edgeCaseId: string;
  alertType: 'flag_escalated' | 'edge_case_created' | 'critical_issue' | 'staff_escalation' | 'customer_escalation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  createdBy: string;
  createdAt: number;
  status: 'new' | 'acknowledged' | 'resolved';
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  resolvedBy?: string;
  resolvedAt?: number;
  metadata?: any;
}

export class FlagManager extends EventEmitter {
  private flags: Map<string, Flag> = new Map();
  private edgeCases: Map<string, EdgeCase> = new Map();
  private adminAlerts: Map<string, AdminAlert> = new Map();
  private isRunning = false;

  // Start flag manager system
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    console.log('🚩 Flag Manager System Started');
    
    // Process flags every 30 seconds
    setInterval(() => {
      this.processFlags();
    }, 30000);
  }

  // Stop flag manager system
  stop() {
    this.isRunning = false;
    console.log('⏹️ Flag Manager System Stopped');
  }

  // Create a flag
  createFlag(data: {
    sessionId: string;
    tableId: string;
    flagType: Flag['flagType'];
    severity: Flag['severity'];
    description: string;
    reportedBy: string;
    metadata?: any;
  }): Flag {
    const flag: Flag = {
      id: `flag_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: data.sessionId,
      tableId: data.tableId,
      flagType: data.flagType,
      severity: data.severity,
      description: data.description,
      reportedBy: data.reportedBy,
      reportedAt: Date.now(),
      status: 'open',
      metadata: data.metadata
    };

    this.flags.set(flag.id, flag);
    
    this.emit('flag_created', {
      type: 'flag_created',
      flagId: flag.id,
      sessionId: flag.sessionId,
      tableId: flag.tableId,
      timestamp: Date.now(),
      data: flag
    });

    console.log(`🚩 Flag created: ${flag.id} (${flag.flagType}, ${flag.severity})`);
    return flag;
  }

  // Acknowledge flag
  acknowledgeFlag(flagId: string, acknowledgedBy: string): boolean {
    const flag = this.flags.get(flagId);
    if (!flag || flag.status !== 'open') return false;

    flag.status = 'acknowledged';
    flag.assignedTo = acknowledgedBy;

    this.emit('flag_acknowledged', {
      type: 'flag_acknowledged',
      flagId,
      acknowledgedBy,
      timestamp: Date.now(),
      data: flag
    });

    console.log(`✅ Flag acknowledged: ${flagId} by ${acknowledgedBy}`);
    return true;
  }

  // Escalate flag to edge case
  escalateToEdgeCase(flagId: string, escalatedBy: string): EdgeCase | null {
    const flag = this.flags.get(flagId);
    if (!flag || flag.status === 'escalated') return null;

    const edgeCase: EdgeCase = {
      id: `edge_case_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      flagId,
      sessionId: flag.sessionId,
      tableId: flag.tableId,
      caseType: this.mapFlagTypeToCaseType(flag.flagType),
      priority: this.mapSeverityToPriority(flag.severity),
      description: `Escalated from flag: ${flag.description}`,
      createdBy: escalatedBy,
      createdAt: Date.now(),
      status: 'new',
      adminAlerts: [],
      metadata: {
        originalFlag: flag,
        escalatedBy,
        escalatedAt: Date.now()
      }
    };

    this.edgeCases.set(edgeCase.id, edgeCase);
    flag.status = 'escalated';
    flag.escalatedTo = edgeCase.id;
    flag.escalatedAt = Date.now();

    // Create admin alert
    this.createAdminAlert({
      edgeCaseId: edgeCase.id,
      alertType: 'flag_escalated',
      severity: edgeCase.priority === 'critical' ? 'critical' : 'high',
      title: `Flag Escalated to Edge Case`,
      description: `Flag ${flag.id} has been escalated to edge case ${edgeCase.id}`,
      createdBy: escalatedBy,
      metadata: { flagId, edgeCaseId: edgeCase.id }
    });

    this.emit('flag_escalated', {
      type: 'flag_escalated',
      flagId,
      edgeCaseId: edgeCase.id,
      escalatedBy,
      timestamp: Date.now(),
      data: { flag, edgeCase }
    });

    console.log(`🚨 Flag escalated to edge case: ${flagId} → ${edgeCase.id}`);
    return edgeCase;
  }

  // Create admin alert
  createAdminAlert(data: {
    edgeCaseId: string;
    alertType: AdminAlert['alertType'];
    severity: AdminAlert['severity'];
    title: string;
    description: string;
    createdBy: string;
    metadata?: any;
  }): AdminAlert {
    const alert: AdminAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      edgeCaseId: data.edgeCaseId,
      alertType: data.alertType,
      severity: data.severity,
      title: data.title,
      description: data.description,
      createdBy: data.createdBy,
      createdAt: Date.now(),
      status: 'new',
      metadata: data.metadata
    };

    this.adminAlerts.set(alert.id, alert);
    
    // Add to edge case
    const edgeCase = this.edgeCases.get(data.edgeCaseId);
    if (edgeCase) {
      edgeCase.adminAlerts.push(alert);
    }

    this.emit('admin_alert_created', {
      type: 'admin_alert_created',
      alertId: alert.id,
      edgeCaseId: data.edgeCaseId,
      timestamp: Date.now(),
      data: alert
    });

    console.log(`🚨 Admin alert created: ${alert.id} (${alert.alertType}, ${alert.severity})`);
    return alert;
  }

  // Acknowledge admin alert
  acknowledgeAdminAlert(alertId: string, acknowledgedBy: string): boolean {
    const alert = this.adminAlerts.get(alertId);
    if (!alert || alert.status !== 'new') return false;

    alert.status = 'acknowledged';
    alert.acknowledgedBy = acknowledgedBy;
    alert.acknowledgedAt = Date.now();

    this.emit('admin_alert_acknowledged', {
      type: 'admin_alert_acknowledged',
      alertId,
      acknowledgedBy,
      timestamp: Date.now(),
      data: alert
    });

    console.log(`✅ Admin alert acknowledged: ${alertId} by ${acknowledgedBy}`);
    return true;
  }

  // Resolve admin alert
  resolveAdminAlert(alertId: string, resolvedBy: string, resolution?: string): boolean {
    const alert = this.adminAlerts.get(alertId);
    if (!alert || alert.status === 'resolved') return false;

    alert.status = 'resolved';
    alert.resolvedBy = resolvedBy;
    alert.resolvedAt = Date.now();
    if (resolution) {
      alert.metadata = { ...alert.metadata, resolution };
    }

    this.emit('admin_alert_resolved', {
      type: 'admin_alert_resolved',
      alertId,
      resolvedBy,
      timestamp: Date.now(),
      data: alert
    });

    console.log(`✅ Admin alert resolved: ${alertId} by ${resolvedBy}`);
    return true;
  }

  // Get flags by status
  getFlagsByStatus(status: Flag['status']): Flag[] {
    return Array.from(this.flags.values()).filter(f => f.status === status);
  }

  // Get edge cases by status
  getEdgeCasesByStatus(status: EdgeCase['status']): EdgeCase[] {
    return Array.from(this.edgeCases.values()).filter(e => e.status === status);
  }

  // Get admin alerts by status
  getAdminAlertsByStatus(status: AdminAlert['status']): AdminAlert[] {
    return Array.from(this.adminAlerts.values()).filter(a => a.status === status);
  }

  // Get critical alerts for admin dashboard
  getCriticalAlerts(): AdminAlert[] {
    return Array.from(this.adminAlerts.values())
      .filter(a => a.severity === 'critical' && a.status !== 'resolved')
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  // Process flags for auto-escalation
  private processFlags() {
    const openFlags = this.getFlagsByStatus('open');
    const now = Date.now();
    
    openFlags.forEach(flag => {
      const timeOpen = now - flag.reportedAt;
      const escalationThreshold = this.getEscalationThreshold(flag.severity);
      
      if (timeOpen > escalationThreshold) {
        console.log(`⏰ Auto-escalating flag ${flag.id} (open for ${Math.round(timeOpen / 60000)} minutes)`);
        this.escalateToEdgeCase(flag.id, 'system');
      }
    });
  }

  // Get escalation threshold based on severity
  private getEscalationThreshold(severity: Flag['severity']): number {
    const thresholds = {
      low: 30 * 60000, // 30 minutes
      medium: 15 * 60000, // 15 minutes
      high: 5 * 60000, // 5 minutes
      critical: 2 * 60000 // 2 minutes
    };
    return thresholds[severity];
  }

  // Map flag type to edge case type
  private mapFlagTypeToCaseType(flagType: Flag['flagType']): EdgeCase['caseType'] {
    const mapping = {
      equipment_issue: 'equipment_failure',
      customer_complaint: 'customer_dispute',
      staff_issue: 'staff_conflict',
      payment_issue: 'payment_dispute',
      safety_concern: 'safety_incident',
      quality_issue: 'quality_control'
    };
    return mapping[flagType] as EdgeCase['caseType'];
  }

  // Map severity to priority
  private mapSeverityToPriority(severity: Flag['severity']): EdgeCase['priority'] {
    const mapping = {
      low: 'low',
      medium: 'medium',
      high: 'high',
      critical: 'critical'
    };
    return mapping[severity] as EdgeCase['priority'];
  }

  // Get analytics
  getAnalytics(): {
    totalFlags: number;
    openFlags: number;
    escalatedFlags: number;
    totalEdgeCases: number;
    openEdgeCases: number;
    totalAdminAlerts: number;
    criticalAlerts: number;
    averageResolutionTime: number;
  } {
    const flags = Array.from(this.flags.values());
    const edgeCases = Array.from(this.edgeCases.values());
    const alerts = Array.from(this.adminAlerts.values());
    
    const totalFlags = flags.length;
    const openFlags = flags.filter(f => f.status === 'open').length;
    const escalatedFlags = flags.filter(f => f.status === 'escalated').length;
    const totalEdgeCases = edgeCases.length;
    const openEdgeCases = edgeCases.filter(e => e.status === 'new' || e.status === 'assigned').length;
    const totalAdminAlerts = alerts.length;
    const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.status !== 'resolved').length;
    
    const resolvedAlerts = alerts.filter(a => a.status === 'resolved' && a.resolvedAt);
    const averageResolutionTime = resolvedAlerts.length > 0 ? 
      resolvedAlerts.reduce((sum, a) => sum + (a.resolvedAt! - a.createdAt), 0) / resolvedAlerts.length : 0;

    return {
      totalFlags,
      openFlags,
      escalatedFlags,
      totalEdgeCases,
      openEdgeCases,
      totalAdminAlerts,
      criticalAlerts,
      averageResolutionTime
    };
  }
}

// Export singleton instance
export const flagManager = new FlagManager();
