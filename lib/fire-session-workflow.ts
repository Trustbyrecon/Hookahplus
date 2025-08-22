import { EventEmitter } from 'events';

// 🔑 Core Workflow Button Language Types
export type WorkflowButton = 
  // Prep Room → Front Staff
  | 'prep_started'      // signals staff that hookah is in assembly
  | 'flavor_locked'     // confirms chosen flavor/mix is final and logged
  | 'session_timer_armed' // back staff sets session start (not yet delivered)
  | 'ready_for_delivery'  // triggers notification to front staff
  
  // Front Staff → Delivery/Customer
  | 'picked_up'         // floor staff acknowledges taking hookah from prep
  | 'delivered'          // hookah placed at table, session officially started
  | 'customer_confirmed' // optional button if customer verifies order
  
  // ⚠️ Edge Case Buttons (Rescue & Recovery)
  | 'hold'               // prep paused (e.g., customer changes mind or delay)
  | 'redo_remix'         // flavor or equipment error requires remake
  | 'swap_charcoal'      // mid-session service handoff
  | 'cancel'             // order dropped before delivery
  | 'return_to_prep'     // hookah sent back after delivery issue
  
  // 🔥 New Refill & Coal Management Buttons
  | 'refill_requested'   // customer requests refill
  | 'refill_delivered'   // staff delivers refill
  | 'coals_burned_out'   // coals need replacement
  | 'coals_delivered'    // staff delivers new coals
  | 'session_complete';  // session finished

export type StaffRole = 'prep' | 'front' | 'customer' | 'hookah_room';
export type SessionStatus = 'prep' | 'delivery' | 'service' | 'refill' | 'coals_needed' | 'recovery' | 'completed' | 'cancelled';

// 🔄 Cursor / Agent Event Interface
export interface WorkflowEvent {
  sessionId: string;
  staffRole: StaffRole;
  timestamp: Date;
  statusTag: SessionStatus;
  buttonPressed: WorkflowButton;
  metadata?: Record<string, any>;
  previousState?: SessionState;
  newState: SessionState;
}

// Session State Interface
export interface SessionState {
  sessionId: string;
  currentStatus: SessionStatus;
  prepStage: PrepStage;
  deliveryStage: DeliveryStage;
  serviceStage: ServiceStage;
  refillStage: RefillStage;
  coalStage: CoalStage;
  recoveryStage?: RecoveryStage;
  createdAt: Date;
  updatedAt: Date;
  staffAssigned: {
    prep?: string;
    front?: string;
    hookah_room?: string;
  };
  flavorMix: string;
  tableId: string;
  sessionTimer?: {
    armedAt?: Date;
    startedAt?: Date;
    duration?: number; // in minutes
    currentCycle?: number;
    lastRefillAt?: Date;
    lastCoalSwapAt?: Date;
  };
  // Demo timing controls
  demoMode: boolean;
  cycleTimer?: NodeJS.Timeout;
  refillTimer?: NodeJS.Timeout;
  coalTimer?: NodeJS.Timeout;
}

export interface PrepStage {
  isStarted: boolean;
  isFlavorLocked: boolean;
  isTimerArmed: boolean;
  isReadyForDelivery: boolean;
  startedAt?: Date;
  flavorLockedAt?: Date;
  timerArmedAt?: Date;
  readyForDeliveryAt?: Date;
}

export interface DeliveryStage {
  isPickedUp: boolean;
  isDelivered: boolean;
  isCustomerConfirmed: boolean;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  customerConfirmedAt?: Date;
}

export interface ServiceStage {
  isActive: boolean;
  startedAt?: Date;
  duration: number; // in minutes
  charcoalSwaps: number;
  lastCharcoalSwap?: Date;
  refillCount: number;
  coalBurnoutCount: number;
}

export interface RefillStage {
  isRequested: boolean;
  isDelivered: boolean;
  requestedAt?: Date;
  deliveredAt?: Date;
  deliveredBy?: string;
  refillType: 'flavor' | 'water' | 'both';
}

export interface CoalStage {
  needsReplacement: boolean;
  isDelivered: boolean;
  requestedAt?: Date;
  deliveredAt?: Date;
  deliveredBy?: string;
  coalType: 'quick_light' | 'natural' | 'coconut';
}

export interface RecoveryStage {
  reason: string;
  initiatedAt: Date;
  resolvedAt?: Date;
  actionTaken: string;
}

// 🔄 Workflow State Machine
export class FireSessionWorkflow extends EventEmitter {
  private sessions: Map<string, SessionState> = new Map();
  private eventHistory: WorkflowEvent[] = [];
  private demoTimers: Map<string, { cycle: NodeJS.Timeout; refill: NodeJS.Timeout; coal: NodeJS.Timeout }> = new Map();

  constructor() {
    super();
    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    // Emit events for cursor/agent consumption
    this.on('workflowEvent', (event: WorkflowEvent) => {
      this.eventHistory.push(event);
      this.emit('cursorEvent', event);
      this.emit('agentEvent', event);
    });
  }

  // 🚀 Create New Fire Session
  createSession(sessionId: string, tableId: string, flavorMix: string, prepStaffId: string, demoMode: boolean = true): SessionState {
    const session: SessionState = {
      sessionId,
      currentStatus: 'prep',
      prepStage: {
        isStarted: false,
        isFlavorLocked: false,
        isTimerArmed: false,
        isReadyForDelivery: false
      },
      deliveryStage: {
        isPickedUp: false,
        isDelivered: false,
        isCustomerConfirmed: false
      },
      serviceStage: {
        isActive: false,
        duration: 0,
        charcoalSwaps: 0,
        refillCount: 0,
        coalBurnoutCount: 0
      },
      refillStage: {
        isRequested: false,
        isDelivered: false,
        refillType: 'both'
      },
      coalStage: {
        needsReplacement: false,
        isDelivered: false,
        coalType: 'quick_light'
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      staffAssigned: { prep: prepStaffId },
      flavorMix,
      tableId,
      demoMode
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  // 🔑 Button Press Handlers
  pressButton(
    sessionId: string, 
    button: WorkflowButton, 
    staffRole: StaffRole, 
    staffId: string,
    metadata?: Record<string, any>
  ): WorkflowEvent | null {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const previousState = { ...session };
    const event = this.processButtonPress(session, button, staffRole, staffId, metadata);
    
    if (event) {
      this.emit('workflowEvent', event);
      return event;
    }

    return null;
  }

  private processButtonPress(
    session: SessionState, 
    button: WorkflowButton, 
    staffRole: StaffRole, 
    staffId: string,
    metadata?: Record<string, any>
  ): WorkflowEvent | null {
    const timestamp = new Date();
    session.updatedAt = timestamp;

    switch (button) {
      // 🔧 Prep Room Buttons
      case 'prep_started':
        if (staffRole !== 'prep') return null;
        session.prepStage.isStarted = true;
        session.prepStage.startedAt = timestamp;
        break;

      case 'flavor_locked':
        if (staffRole !== 'prep') return null;
        session.prepStage.isFlavorLocked = true;
        session.prepStage.flavorLockedAt = timestamp;
        break;

      case 'session_timer_armed':
        if (staffRole !== 'prep') return null;
        session.prepStage.isTimerArmed = true;
        session.prepStage.timerArmedAt = timestamp;
        session.sessionTimer = {
          armedAt: timestamp,
          duration: metadata?.duration || 60,
          currentCycle: 0
        };
        break;

      case 'ready_for_delivery':
        if (staffRole !== 'prep') return null;
        session.prepStage.isReadyForDelivery = true;
        session.prepStage.readyForDeliveryAt = timestamp;
        session.currentStatus = 'delivery';
        // Emit special event for dashboard visibility
        this.emit('readyForDelivery', { sessionId: session.sessionId, tableId: session.tableId });
        break;

      // 🚚 Front Staff Buttons
      case 'picked_up':
        if (staffRole !== 'front') return null;
        session.deliveryStage.isPickedUp = true;
        session.deliveryStage.pickedUpAt = timestamp;
        session.staffAssigned.front = staffId;
        break;

      case 'delivered':
        if (staffRole !== 'front') return null;
        session.deliveryStage.isDelivered = true;
        session.deliveryStage.deliveredAt = timestamp;
        session.currentStatus = 'service';
        session.serviceStage.isActive = true;
        session.serviceStage.startedAt = timestamp;
        if (session.sessionTimer?.armedAt) {
          session.sessionTimer.startedAt = timestamp;
        }
        
        // Start demo cycle if enabled
        if (session.demoMode) {
          this.startDemoCycle(session.sessionId);
        }
        break;

      case 'customer_confirmed':
        if (staffRole !== 'customer') return null;
        session.deliveryStage.isCustomerConfirmed = true;
        session.deliveryStage.customerConfirmedAt = timestamp;
        break;

      // 🔥 New Refill & Coal Management Buttons
      case 'refill_requested':
        if (staffRole !== 'customer') return null;
        session.refillStage.isRequested = true;
        session.refillStage.requestedAt = timestamp;
        session.currentStatus = 'refill';
        session.serviceStage.refillCount++;
        // Emit event for hookah room dashboard
        this.emit('refillRequested', { 
          sessionId: session.sessionId, 
          tableId: session.tableId,
          refillType: metadata?.refillType || 'both'
        });
        break;

      case 'refill_delivered':
        if (staffRole !== 'front') return null;
        session.refillStage.isDelivered = true;
        session.refillStage.deliveredAt = timestamp;
        session.refillStage.deliveredBy = staffId;
        session.currentStatus = 'service';
        // Resume demo cycle
        if (session.demoMode) {
          this.resumeDemoCycle(session.sessionId);
        }
        break;

      case 'coals_burned_out':
        if (staffRole !== 'customer') return null;
        session.coalStage.needsReplacement = true;
        session.coalStage.requestedAt = timestamp;
        session.currentStatus = 'coals_needed';
        session.serviceStage.coalBurnoutCount++;
        // Emit event for hookah room dashboard
        this.emit('coalsNeeded', { 
          sessionId: session.sessionId, 
          tableId: session.tableId,
          coalType: metadata?.coalType || 'quick_light'
        });
        break;

      case 'coals_delivered':
        if (staffRole !== 'hookah_room') return null;
        session.coalStage.isDelivered = true;
        session.coalStage.deliveredAt = timestamp;
        session.coalStage.deliveredBy = staffId;
        session.currentStatus = 'service';
        // Resume demo cycle
        if (session.demoMode) {
          this.resumeDemoCycle(session.sessionId);
        }
        break;

      case 'session_complete':
        if (staffRole !== 'front') return null;
        session.currentStatus = 'completed';
        session.serviceStage.isActive = false;
        // Stop demo timers
        if (session.demoMode) {
          this.stopDemoTimers(session.sessionId);
        }
        break;

      // ⚠️ Edge Case Buttons
      case 'hold':
        session.currentStatus = 'recovery';
        session.recoveryStage = {
          reason: metadata?.reason || 'Session paused',
          initiatedAt: timestamp,
          actionTaken: 'Session placed on hold'
        };
        break;

      case 'redo_remix':
        session.currentStatus = 'recovery';
        session.recoveryStage = {
          reason: metadata?.reason || 'Flavor or equipment error',
          initiatedAt: timestamp,
          actionTaken: 'Hookah remake required'
        };
        // Reset prep stage
        session.prepStage = {
          isStarted: false,
          isFlavorLocked: false,
          isTimerArmed: false,
          isReadyForDelivery: false
        };
        break;

      case 'swap_charcoal':
        if (session.currentStatus === 'service') {
          session.serviceStage.charcoalSwaps++;
          session.serviceStage.lastCharcoalSwap = timestamp;
        }
        break;

      case 'cancel':
        session.currentStatus = 'cancelled';
        if (session.demoMode) {
          this.stopDemoTimers(session.sessionId);
        }
        break;

      case 'return_to_prep':
        session.currentStatus = 'recovery';
        session.recoveryStage = {
          reason: metadata?.reason || 'Delivery issue',
          initiatedAt: timestamp,
          actionTaken: 'Hookah returned to prep room'
        };
        // Reset delivery stage
        session.deliveryStage = {
          isPickedUp: false,
          isDelivered: false,
          isCustomerConfirmed: false
        };
        session.currentStatus = 'prep';
        break;

      default:
        return null;
    }

    // Create and return event
    const event: WorkflowEvent = {
      sessionId: session.sessionId,
      staffRole,
      timestamp,
      statusTag: session.currentStatus,
      buttonPressed: button,
      metadata,
      previousState: previousState,
      newState: { ...session }
    };

    return event;
  }

  // 🔥 Demo Cycle Management
  private startDemoCycle(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.demoMode) return;

    // Clear any existing timers
    this.stopDemoTimers(sessionId);

    // 30-second service cycle
    const cycleTimer = setTimeout(() => {
      this.triggerRefillRequest(sessionId);
    }, 30000); // 30 seconds

    // Store timer reference
    this.demoTimers.set(sessionId, {
      cycle: cycleTimer,
      refill: null as any,
      coal: null as any
    });
  }

  private triggerRefillRequest(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Auto-trigger refill request
    this.pressButton(sessionId, 'refill_requested', 'customer', 'demo_customer', {
      refillType: 'both'
    });

    // 15-second refill period
    const refillTimer = setTimeout(() => {
      this.triggerCoalBurnout(sessionId);
    }, 15000); // 15 seconds

    // Update timer reference
    const timers = this.demoTimers.get(sessionId);
    if (timers) {
      timers.refill = refillTimer;
    }
  }

  private triggerCoalBurnout(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Auto-trigger coal burnout
    this.pressButton(sessionId, 'coals_burned_out', 'customer', 'demo_customer', {
      coalType: 'quick_light'
    });

    // 10-second coal replacement period
    const coalTimer = setTimeout(() => {
      this.autoResolveCoals(sessionId);
    }, 10000); // 10 seconds

    // Update timer reference
    const timers = this.demoTimers.get(sessionId);
    if (timers) {
      timers.coal = coalTimer;
    }
  }

  private autoResolveCoals(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Auto-resolve coal delivery (for demo purposes)
    this.pressButton(sessionId, 'coals_delivered', 'hookah_room', 'demo_staff', {
      coalType: 'quick_light'
    });

    // Restart cycle
    setTimeout(() => {
      this.startDemoCycle(sessionId);
    }, 5000); // 5 second delay before restart
  }

  private resumeDemoCycle(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.demoMode) return;

    // Restart the cycle
    this.startDemoCycle(sessionId);
  }

  private stopDemoTimers(sessionId: string) {
    const timers = this.demoTimers.get(sessionId);
    if (timers) {
      if (timers.cycle) clearTimeout(timers.cycle);
      if (timers.refill) clearTimeout(timers.refill);
      if (timers.coal) clearTimeout(timers.coal);
      this.demoTimers.delete(sessionId);
    }
  }

  // 📊 Query Methods for Agents/Dashboards
  getSession(sessionId: string): SessionState | undefined {
    return this.sessions.get(sessionId);
  }

  getSessionsByStatus(status: SessionStatus): SessionState[] {
    return Array.from(this.sessions.values()).filter(s => s.currentStatus === status);
  }

  getSessionsByStaff(staffId: string): SessionState[] {
    return Array.from(this.sessions.values()).filter(s => 
      s.staffAssigned.prep === staffId || 
      s.staffAssigned.front === staffId || 
      s.staffAssigned.hookah_room === staffId
    );
  }

  // Special queries for dashboard integration
  getReadyForDeliverySessions(): SessionState[] {
    return Array.from(this.sessions.values()).filter(s => 
      s.prepStage.isReadyForDelivery && s.currentStatus === 'delivery'
    );
  }

  getRefillRequests(): SessionState[] {
    return Array.from(this.sessions.values()).filter(s => 
      s.currentStatus === 'refill' && s.refillStage.isRequested
    );
  }

  getCoalRequests(): SessionState[] {
    return Array.from(this.sessions.values()).filter(s => 
      s.currentStatus === 'coals_needed' && s.coalStage.needsReplacement
    );
  }

  getEventHistory(sessionId?: string): WorkflowEvent[] {
    if (sessionId) {
      return this.eventHistory.filter(e => e.sessionId === sessionId);
    }
    return this.eventHistory;
  }

  // 🔄 Cursor/Agent Event Subscription
  subscribeToCursorEvents(callback: (event: WorkflowEvent) => void): () => void {
    this.on('cursorEvent', callback);
    return () => this.off('cursorEvent', callback);
  }

  subscribeToAgentEvents(callback: (event: WorkflowEvent) => void): () => void {
    this.on('agentEvent', callback);
    return () => this.off('agentEvent', callback);
  }

  // Special event subscriptions for dashboard integration
  subscribeToReadyForDelivery(callback: (data: { sessionId: string; tableId: string }) => void): () => void {
    this.on('readyForDelivery', callback);
    return () => this.off('readyForDelivery', callback);
  }

  subscribeToRefillRequests(callback: (data: { sessionId: string; tableId: string; refillType: string }) => void): () => void {
    this.on('refillRequested', callback);
    return () => this.off('refillRequested', callback);
  }

  subscribeToCoalRequests(callback: (data: { sessionId: string; tableId: string; coalType: string }) => void): () => void {
    this.on('coalsNeeded', callback);
    return () => this.off('coalsNeeded', callback);
  }

  // 📈 Analytics and Pattern Analysis
  getSessionMetrics(): {
    totalSessions: number;
    sessionsByStatus: Record<SessionStatus, number>;
    averagePrepTime: number;
    averageDeliveryTime: number;
    recoveryRate: number;
    refillRate: number;
    coalBurnoutRate: number;
    frequentIssues: Array<{ issue: string; count: number }>;
  } {
    const sessions = Array.from(this.sessions.values());
    const totalSessions = sessions.length;
    
    const sessionsByStatus = sessions.reduce((acc, s) => {
      acc[s.currentStatus] = (acc[s.currentStatus] || 0) + 1;
      return acc;
    }, {} as Record<SessionStatus, number>);

    // Calculate average prep time
    const prepTimes = sessions
      .filter(s => s.prepStage.startedAt && s.prepStage.readyForDeliveryAt)
      .map(s => s.prepStage.readyForDeliveryAt!.getTime() - s.prepStage.startedAt!.getTime());
    
    const averagePrepTime = prepTimes.length > 0 
      ? prepTimes.reduce((a, b) => a + b, 0) / prepTimes.length 
      : 0;

    // Calculate average delivery time
    const deliveryTimes = sessions
      .filter(s => s.deliveryStage.pickedUpAt && s.deliveryStage.deliveredAt)
      .map(s => s.deliveryStage.deliveredAt!.getTime() - s.deliveryStage.pickedUpAt!.getTime());
    
    const averageDeliveryTime = deliveryTimes.length > 0 
      ? deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length 
      : 0;

    // Calculate recovery rate
    const recoveryRate = totalSessions > 0 
      ? (sessionsByStatus.recovery || 0) / totalSessions 
      : 0;

    // Calculate refill and coal rates
    const refillRate = totalSessions > 0 
      ? sessions.filter(s => s.serviceStage.refillCount > 0).length / totalSessions 
      : 0;

    const coalBurnoutRate = totalSessions > 0 
      ? sessions.filter(s => s.serviceStage.coalBurnoutCount > 0).length / totalSessions 
      : 0;

    // Find frequent issues
    const issueCounts = this.eventHistory
      .filter(e => ['redo_remix', 'return_to_prep', 'hold', 'refill_requested', 'coals_burned_out'].includes(e.buttonPressed))
      .reduce((acc, e) => {
        acc[e.buttonPressed] = (acc[e.buttonPressed] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const frequentIssues = Object.entries(issueCounts)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalSessions,
      sessionsByStatus,
      averagePrepTime,
      averageDeliveryTime,
      recoveryRate,
      refillRate,
      coalBurnoutRate,
      frequentIssues
    };
  }

  // Cleanup on destroy
  destroy() {
    // Clear all demo timers
    for (const [sessionId] of this.demoTimers) {
      this.stopDemoTimers(sessionId);
    }
    this.demoTimers.clear();
  }
}

// 🎯 Singleton Instance for Global Access
export const fireSessionWorkflow = new FireSessionWorkflow();
