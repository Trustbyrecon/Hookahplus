// lib/demoDataGenerator.ts
// Real-time data generator for end-to-end testing and demo purposes

import { SessionState } from './sessionState';
import { WorkflowButton, StaffRole } from './fire-session-workflow';

export type SessionStatus = 'prep' | 'delivery' | 'service' | 'refill' | 'coals_needed' | 'completed';

export interface DemoSessionData {
  id: string;
  tableId: string;
  flavor: string;
  status: SessionStatus;
  staffAssigned: {
    prep: string;
    front: string;
    hookah_room: string;
  };
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  timing: {
    createdAt: Date;
    estimatedPrepTime: number;
    estimatedSessionTime: number;
  };
  metadata: {
    source: 'demo' | 'live' | 'qr_checkin' | 'layout_preview';
    zone: string;
    partySize: number;
    specialRequests?: string;
  };
}

export interface DemoBOHOperation {
  id: string;
  sessionId: string;
  operationType: 'prep_start' | 'prep_complete' | 'delivery_start' | 'delivery_complete' | 'service_start' | 'service_end' | 'refill_request' | 'coal_swap' | 'session_pause' | 'session_resume';
  staffId: string;
  staffName: string;
  timestamp: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  notes?: string;
  metadata?: Record<string, any>;
}

export interface DemoFOHAlert {
  id: string;
  sessionId: string;
  alertType: 'ready_for_delivery' | 'refill_requested' | 'coals_needed' | 'session_complete' | 'customer_request';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedBy?: string;
  metadata?: Record<string, any>;
}

export class DemoDataGenerator {
  private sessions: Map<string, DemoSessionData> = new Map();
  private bohOperations: Map<string, DemoBOHOperation[]> = new Map();
  private fohAlerts: DemoFOHAlert[] = [];
  private isRunning = false;
  private intervalId?: NodeJS.Timeout;

  // Demo staff members
  private staffMembers = {
    prep: ['Alex Chen', 'Maria Rodriguez', 'David Kim', 'Sarah Johnson'],
    front: ['Emma Wilson', 'James Brown', 'Lisa Garcia', 'Michael Davis'],
    hookah_room: ['Chris Taylor', 'Anna Martinez', 'Ryan Lee', 'Sophie White']
  };

  // Demo flavors and tables
  private flavors = [
    'Blue Mist + Mint',
    'Strawberry + Vanilla', 
    'Grape + Mint',
    'Rose + Cardamom',
    'Coconut + Pineapple',
    'Lavender + Honey',
    'Double Apple',
    'Mint Fresh',
    'Watermelon + Mint',
    'Peach + Vanilla'
  ];

  private tables = [
    'T-001', 'T-002', 'T-003', 'T-004', 'T-005',
    'T-006', 'T-007', 'T-008', 'T-009', 'T-010',
    'B-001', 'B-002', 'B-003', 'B-004', // Booths
    'L-001', 'L-002', 'L-003', 'L-004', // Lounge chairs
    'S-001', 'S-002', 'S-003', 'S-004'  // Stools
  ];

  private zones = ['BAR A', 'BOOTHS W', 'LOUNGE NE', 'STOOLS S'];

  // Start real-time demo data generation
  startDemoMode(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    console.log('🚀 Starting Hookah+ Demo Data Generator...');
    
    // Generate initial demo sessions
    this.generateInitialSessions();
    
    // Start real-time simulation
    this.intervalId = setInterval(() => {
      this.simulateRealTimeActivity();
    }, 5000); // Update every 5 seconds
    
    console.log('✅ Demo mode active - Real-time data flowing');
  }

  // Stop demo mode
  stopDemoMode(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.isRunning = false;
    console.log('⏹️ Demo mode stopped');
  }

  // Generate initial demo sessions
  private generateInitialSessions(): void {
    const sessionCount = Math.floor(Math.random() * 8) + 3; // 3-10 sessions
    
    for (let i = 0; i < sessionCount; i++) {
      const session = this.createDemoSession();
      this.sessions.set(session.id, session);
      
      // Generate BOH operations for this session
      this.generateBOHOperations(session.id);
    }
    
    console.log(`📊 Generated ${sessionCount} demo sessions`);
  }

  // Create a single demo session
  private createDemoSession(): DemoSessionData {
    const id = `demo_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const tableId = this.tables[Math.floor(Math.random() * this.tables.length)];
    const flavor = this.flavors[Math.floor(Math.random() * this.flavors.length)];
    const zone = this.zones[Math.floor(Math.random() * this.zones.length)];
    
    const statuses: SessionStatus[] = ['prep', 'delivery', 'service', 'refill', 'coals_needed', 'completed'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    return {
      id,
      tableId,
      flavor,
      status,
      staffAssigned: {
        prep: this.staffMembers.prep[Math.floor(Math.random() * this.staffMembers.prep.length)],
        front: this.staffMembers.front[Math.floor(Math.random() * this.staffMembers.front.length)],
        hookah_room: this.staffMembers.hookah_room[Math.floor(Math.random() * this.staffMembers.hookah_room.length)]
      },
      customerInfo: {
        name: this.generateCustomerName(),
        phone: this.generatePhoneNumber(),
        email: Math.random() > 0.3 ? this.generateEmail() : undefined
      },
      timing: {
        createdAt: new Date(Date.now() - Math.random() * 3600000), // Random time within last hour
        estimatedPrepTime: 5 + Math.random() * 10, // 5-15 minutes
        estimatedSessionTime: 60 + Math.random() * 120 // 1-3 hours
      },
      metadata: {
        source: 'demo',
        zone,
        partySize: Math.floor(Math.random() * 6) + 1, // 1-6 people
        specialRequests: Math.random() > 0.7 ? this.generateSpecialRequest() : undefined
      }
    };
  }

  // Generate BOH operations for a session
  private generateBOHOperations(sessionId: string): void {
    const operations: DemoBOHOperation[] = [];
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Base operations based on session status
    if (['prep', 'delivery', 'service', 'refill', 'coals_needed'].includes(session.status)) {
      operations.push({
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        operationType: 'prep_start',
        staffId: session.staffAssigned.prep,
        staffName: session.staffAssigned.prep,
        timestamp: new Date(session.timing.createdAt.getTime() + Math.random() * 300000), // Within 5 minutes
        status: 'completed',
        notes: `Started prep for ${session.flavor} at ${session.tableId}`
      });
    }

    if (['delivery', 'service', 'refill', 'coals_needed'].includes(session.status)) {
      operations.push({
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        operationType: 'prep_complete',
        staffId: session.staffAssigned.prep,
        staffName: session.staffAssigned.prep,
        timestamp: new Date(session.timing.createdAt.getTime() + 300000 + Math.random() * 600000), // 5-15 minutes later
        status: 'completed',
        notes: `Completed prep for ${session.flavor} - ready for delivery`
      });
    }

    if (['service', 'refill', 'coals_needed'].includes(session.status)) {
      operations.push({
        id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        sessionId,
        operationType: 'delivery_complete',
        staffId: session.staffAssigned.front,
        staffName: session.staffAssigned.front,
        timestamp: new Date(session.timing.createdAt.getTime() + 600000 + Math.random() * 300000), // 10-15 minutes later
        status: 'completed',
        notes: `Delivered ${session.flavor} to ${session.tableId}`
      });
    }

    this.bohOperations.set(sessionId, operations);
  }

  // Simulate real-time activity
  private simulateRealTimeActivity(): void {
    // Randomly update session statuses
    this.updateSessionStatuses();
    
    // Generate new sessions occasionally
    if (Math.random() < 0.1) { // 10% chance every 5 seconds
      this.addNewSession();
    }
    
    // Generate FOH alerts
    this.generateFOHAlerts();
    
    // Update BOH operations
    this.updateBOHOperations();
  }

  // Update session statuses
  private updateSessionStatuses(): void {
    for (const [sessionId, session] of this.sessions) {
      if (Math.random() < 0.05) { // 5% chance to change status
        const currentIndex = ['prep', 'delivery', 'service', 'refill', 'coals_needed', 'completed'].indexOf(session.status);
        if (currentIndex < 5) { // Not completed
          session.status = ['prep', 'delivery', 'service', 'refill', 'coals_needed', 'completed'][currentIndex + 1] as SessionStatus;
          
          // Generate corresponding BOH operation
          this.generateStatusChangeOperation(sessionId, session.status);
        }
      }
    }
  }

  // Add new session
  private addNewSession(): void {
    const session = this.createDemoSession();
    this.sessions.set(session.id, session);
    this.generateBOHOperations(session.id);
    
    console.log(`🆕 New demo session created: ${session.tableId} - ${session.flavor}`);
  }

  // Generate FOH alerts
  private generateFOHAlerts(): void {
    if (Math.random() < 0.15) { // 15% chance every 5 seconds
      const activeSessions = Array.from(this.sessions.values()).filter(s => 
        ['delivery', 'service', 'refill', 'coals_needed'].includes(s.status)
      );
      
      if (activeSessions.length > 0) {
        const session = activeSessions[Math.floor(Math.random() * activeSessions.length)];
        const alertTypes: DemoFOHAlert['alertType'][] = ['ready_for_delivery', 'refill_requested', 'coals_needed', 'customer_request'];
        const alertType = alertTypes[Math.floor(Math.random() * alertTypes.length)];
        
        const alert: DemoFOHAlert = {
          id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          sessionId: session.id,
          alertType,
          priority: Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'medium' : 'low',
          message: this.generateAlertMessage(alertType, session),
          timestamp: new Date(),
          acknowledged: false
        };
        
        this.fohAlerts.push(alert);
        console.log(`🚨 FOH Alert: ${alert.message}`);
      }
    }
  }

  // Update BOH operations
  private updateBOHOperations(): void {
    for (const [sessionId, operations] of this.bohOperations) {
      for (const operation of operations) {
        if (operation.status === 'pending' && Math.random() < 0.3) { // 30% chance to start
          operation.status = 'in_progress';
        } else if (operation.status === 'in_progress' && Math.random() < 0.4) { // 40% chance to complete
          operation.status = 'completed';
        }
      }
    }
  }

  // Generate status change operation
  private generateStatusChangeOperation(sessionId: string, newStatus: SessionStatus): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    let operationType: DemoBOHOperation['operationType'];
    let staffId: string;
    let staffName: string;

    switch (newStatus) {
      case 'delivery':
        operationType = 'delivery_start';
        staffId = session.staffAssigned.front;
        staffName = session.staffAssigned.front;
        break;
      case 'service':
        operationType = 'service_start';
        staffId = session.staffAssigned.hookah_room;
        staffName = session.staffAssigned.hookah_room;
        break;
      case 'refill':
        operationType = 'refill_request';
        staffId = session.staffAssigned.hookah_room;
        staffName = session.staffAssigned.hookah_room;
        break;
      case 'coals_needed':
        operationType = 'coal_swap';
        staffId = session.staffAssigned.hookah_room;
        staffName = session.staffAssigned.hookah_room;
        break;
      case 'completed':
        operationType = 'service_end';
        staffId = session.staffAssigned.hookah_room;
        staffName = session.staffAssigned.hookah_room;
        break;
      default:
        return;
    }

    const operation: DemoBOHOperation = {
      id: `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId,
      operationType,
      staffId,
      staffName,
      timestamp: new Date(),
      status: 'pending',
      notes: `Status changed to ${newStatus} for ${session.tableId}`
    };

    const existingOps = this.bohOperations.get(sessionId) || [];
    existingOps.push(operation);
    this.bohOperations.set(sessionId, existingOps);
  }

  // Generate alert message
  private generateAlertMessage(alertType: DemoFOHAlert['alertType'], session: DemoSessionData): string {
    switch (alertType) {
      case 'ready_for_delivery':
        return `${session.flavor} ready for delivery at ${session.tableId}`;
      case 'refill_requested':
        return `Refill requested for ${session.tableId} - ${session.flavor}`;
      case 'coals_needed':
        return `Coals need replacement at ${session.tableId}`;
      case 'customer_request':
        return `Customer at ${session.tableId} needs assistance`;
      default:
        return `Alert for ${session.tableId}`;
    }
  }

  // Utility functions
  private generateCustomerName(): string {
    const firstNames = ['Alex', 'Maria', 'David', 'Sarah', 'Emma', 'James', 'Lisa', 'Michael', 'Chris', 'Anna', 'Ryan', 'Sophie'];
    const lastNames = ['Chen', 'Rodriguez', 'Kim', 'Johnson', 'Wilson', 'Brown', 'Garcia', 'Davis', 'Taylor', 'Martinez', 'Lee', 'White'];
    return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
  }

  private generatePhoneNumber(): string {
    return `+1 (${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`;
  }

  private generateEmail(): string {
    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    const username = Math.random().toString(36).substr(2, 8);
    return `${username}@${domains[Math.floor(Math.random() * domains.length)]}`;
  }

  private generateSpecialRequest(): string {
    const requests = [
      'Extra mint',
      'Light on the flavor',
      'Extra coals',
      'Quick service',
      'Quiet table',
      'Window seat',
      'Extra water',
      'No ice'
    ];
    return requests[Math.floor(Math.random() * requests.length)];
  }

  // Public API for getting data
  getAllSessions(): DemoSessionData[] {
    return Array.from(this.sessions.values());
  }

  getSessionById(id: string): DemoSessionData | undefined {
    return this.sessions.get(id);
  }

  getSessionsByStatus(status: SessionStatus): DemoSessionData[] {
    return Array.from(this.sessions.values()).filter(s => s.status === status);
  }

  getSessionsByTable(tableId: string): DemoSessionData[] {
    return Array.from(this.sessions.values()).filter(s => s.tableId === tableId);
  }

  getBOHOperations(sessionId: string): DemoBOHOperation[] {
    return this.bohOperations.get(sessionId) || [];
  }

  getAllBOHOperations(): DemoBOHOperation[] {
    return Array.from(this.bohOperations.values()).flat();
  }

  getFOHAlerts(): DemoFOHAlert[] {
    return this.fohAlerts.filter(alert => !alert.acknowledged);
  }

  acknowledgeAlert(alertId: string, staffId: string): void {
    const alert = this.fohAlerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedBy = staffId;
    }
  }

  // Fire session trigger (simulates the Fire Session button)
  fireSession(tableId: string, flavor: string, customerInfo: Partial<DemoSessionData['customerInfo']> = {}): DemoSessionData {
    const session = this.createDemoSession();
    session.tableId = tableId;
    session.flavor = flavor;
    session.status = 'prep';
    session.customerInfo = { ...session.customerInfo, ...customerInfo };
    session.metadata.source = 'live';
    
    this.sessions.set(session.id, session);
    this.generateBOHOperations(session.id);
    
    console.log(`🔥 Fire Session triggered: ${tableId} - ${flavor}`);
    return session;
  }

  // Get dashboard statistics
  getDashboardStats() {
    const sessions = this.getAllSessions();
    const activeSessions = sessions.filter(s => ['prep', 'delivery', 'service', 'refill', 'coals_needed'].includes(s.status));
    const pendingAlerts = this.getFOHAlerts();
    const activeOperations = this.getAllBOHOperations().filter(op => op.status === 'in_progress');
    
    return {
      totalSessions: sessions.length,
      activeSessions: activeSessions.length,
      pendingAlerts: pendingAlerts.length,
      activeOperations: activeOperations.length,
      sessionsByStatus: {
        prep: sessions.filter(s => s.status === 'prep').length,
        delivery: sessions.filter(s => s.status === 'delivery').length,
        service: sessions.filter(s => s.status === 'service').length,
        refill: sessions.filter(s => s.status === 'refill').length,
        coals_needed: sessions.filter(s => s.status === 'coals_needed').length,
        completed: sessions.filter(s => s.status === 'completed').length
      },
      topFlavors: this.getTopFlavors(sessions),
      staffUtilization: this.getStaffUtilization(sessions)
    };
  }

  private getTopFlavors(sessions: DemoSessionData[]): Array<{flavor: string, count: number}> {
    const flavorCounts = sessions.reduce((acc, session) => {
      acc[session.flavor] = (acc[session.flavor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(flavorCounts)
      .map(([flavor, count]) => ({ flavor, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getStaffUtilization(sessions: DemoSessionData[]): Record<string, number> {
    const staffCounts: Record<string, number> = {};
    
    sessions.forEach(session => {
      Object.values(session.staffAssigned).forEach(staff => {
        staffCounts[staff] = (staffCounts[staff] || 0) + 1;
      });
    });
    
    return staffCounts;
  }
}

// Export singleton instance
export const demoDataGenerator = new DemoDataGenerator();
