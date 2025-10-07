export type SessionState = 
  | 'NEW'
  | 'PREP_IN_PROGRESS'
  | 'READY_FOR_DELIVERY'
  | 'OUT_FOR_DELIVERY'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED';

export type SessionTransition = 
  | 'start_prep'
  | 'prep_complete'
  | 'start_delivery'
  | 'delivery_complete'
  | 'activate_session'
  | 'pause_session'
  | 'resume_session'
  | 'complete_session'
  | 'cancel_session'
  | 'extend_session';

export interface StateTransition {
  from: SessionState;
  to: SessionState;
  transition: SessionTransition;
  description: string;
  allowedRoles: string[];
  requiresConfirmation?: boolean;
}

export class SessionStateMachine {
  private static instance: SessionStateMachine;
  private transitions: StateTransition[] = [];

  static getInstance(): SessionStateMachine {
    if (!SessionStateMachine.instance) {
      SessionStateMachine.instance = new SessionStateMachine();
    }
    return SessionStateMachine.instance;
  }

  constructor() {
    this.initializeTransitions();
  }

  private initializeTransitions(): void {
    this.transitions = [
      // NEW state transitions
      {
        from: 'NEW',
        to: 'PREP_IN_PROGRESS',
        transition: 'start_prep',
        description: 'Start preparing the hookah',
        allowedRoles: ['BOH', 'MANAGER', 'ADMIN']
      },
      {
        from: 'NEW',
        to: 'CANCELLED',
        transition: 'cancel_session',
        description: 'Cancel the session',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN'],
        requiresConfirmation: true
      },

      // PREP_IN_PROGRESS state transitions
      {
        from: 'PREP_IN_PROGRESS',
        to: 'READY_FOR_DELIVERY',
        transition: 'prep_complete',
        description: 'Hookah preparation complete',
        allowedRoles: ['BOH', 'MANAGER', 'ADMIN']
      },
      {
        from: 'PREP_IN_PROGRESS',
        to: 'CANCELLED',
        transition: 'cancel_session',
        description: 'Cancel during preparation',
        allowedRoles: ['BOH', 'MANAGER', 'ADMIN'],
        requiresConfirmation: true
      },

      // READY_FOR_DELIVERY state transitions
      {
        from: 'READY_FOR_DELIVERY',
        to: 'OUT_FOR_DELIVERY',
        transition: 'start_delivery',
        description: 'Start delivering to table',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN']
      },
      {
        from: 'READY_FOR_DELIVERY',
        to: 'CANCELLED',
        transition: 'cancel_session',
        description: 'Cancel before delivery',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN'],
        requiresConfirmation: true
      },

      // OUT_FOR_DELIVERY state transitions
      {
        from: 'OUT_FOR_DELIVERY',
        to: 'ACTIVE',
        transition: 'activate_session',
        description: 'Session delivered and active',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN']
      },
      {
        from: 'OUT_FOR_DELIVERY',
        to: 'CANCELLED',
        transition: 'cancel_session',
        description: 'Cancel during delivery',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN'],
        requiresConfirmation: true
      },

      // ACTIVE state transitions
      {
        from: 'ACTIVE',
        to: 'PAUSED',
        transition: 'pause_session',
        description: 'Pause the session',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN']
      },
      {
        from: 'ACTIVE',
        to: 'COMPLETED',
        transition: 'complete_session',
        description: 'Complete the session',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN']
      },
      {
        from: 'ACTIVE',
        to: 'CANCELLED',
        transition: 'cancel_session',
        description: 'Cancel active session',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN'],
        requiresConfirmation: true
      },

      // PAUSED state transitions
      {
        from: 'PAUSED',
        to: 'ACTIVE',
        transition: 'resume_session',
        description: 'Resume the session',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN']
      },
      {
        from: 'PAUSED',
        to: 'COMPLETED',
        transition: 'complete_session',
        description: 'Complete paused session',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN']
      },
      {
        from: 'PAUSED',
        to: 'CANCELLED',
        transition: 'cancel_session',
        description: 'Cancel paused session',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN'],
        requiresConfirmation: true
      },

      // Session extension (can happen from ACTIVE or PAUSED)
      {
        from: 'ACTIVE',
        to: 'ACTIVE',
        transition: 'extend_session',
        description: 'Extend session duration',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN']
      },
      {
        from: 'PAUSED',
        to: 'PAUSED',
        transition: 'extend_session',
        description: 'Extend paused session duration',
        allowedRoles: ['FOH', 'MANAGER', 'ADMIN']
      }
    ];
  }

  /**
   * Get all valid transitions from a given state
   */
  getValidTransitions(fromState: SessionState, userRole: string): StateTransition[] {
    return this.transitions.filter(transition => 
      transition.from === fromState && 
      transition.allowedRoles.includes(userRole)
    );
  }

  /**
   * Check if a transition is valid
   */
  isValidTransition(
    fromState: SessionState, 
    toState: SessionState, 
    transition: SessionTransition, 
    userRole: string
  ): boolean {
    return this.transitions.some(t => 
      t.from === fromState && 
      t.to === toState && 
      t.transition === transition && 
      t.allowedRoles.includes(userRole)
    );
  }

  /**
   * Get transition details
   */
  getTransitionDetails(transition: SessionTransition): StateTransition | undefined {
    return this.transitions.find(t => t.transition === transition);
  }

  /**
   * Get all possible states
   */
  getAllStates(): SessionState[] {
    return [
      'NEW',
      'PREP_IN_PROGRESS', 
      'READY_FOR_DELIVERY',
      'OUT_FOR_DELIVERY',
      'ACTIVE',
      'PAUSED',
      'COMPLETED',
      'CANCELLED'
    ];
  }

  /**
   * Get state display information
   */
  getStateInfo(state: SessionState): {
    label: string;
    color: string;
    icon: string;
    description: string;
  } {
    const stateInfo: Record<SessionState, any> = {
      NEW: {
        label: 'New',
        color: 'blue',
        icon: 'Plus',
        description: 'New session created'
      },
      PREP_IN_PROGRESS: {
        label: 'Preparing',
        color: 'yellow',
        icon: 'Clock',
        description: 'Hookah being prepared'
      },
      READY_FOR_DELIVERY: {
        label: 'Ready',
        color: 'green',
        icon: 'CheckCircle',
        description: 'Ready for delivery'
      },
      OUT_FOR_DELIVERY: {
        label: 'Delivering',
        color: 'purple',
        icon: 'Truck',
        description: 'Being delivered to table'
      },
      ACTIVE: {
        label: 'Active',
        color: 'emerald',
        icon: 'Play',
        description: 'Session is active'
      },
      PAUSED: {
        label: 'Paused',
        color: 'orange',
        icon: 'Pause',
        description: 'Session is paused'
      },
      COMPLETED: {
        label: 'Completed',
        color: 'gray',
        icon: 'CheckCircle2',
        description: 'Session completed'
      },
      CANCELLED: {
        label: 'Cancelled',
        color: 'red',
        icon: 'XCircle',
        description: 'Session cancelled'
      }
    };

    return stateInfo[state];
  }

  /**
   * Get next logical state
   */
  getNextState(currentState: SessionState): SessionState | null {
    const stateFlow: Record<SessionState, SessionState | null> = {
      NEW: 'PREP_IN_PROGRESS',
      PREP_IN_PROGRESS: 'READY_FOR_DELIVERY',
      READY_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
      OUT_FOR_DELIVERY: 'ACTIVE',
      ACTIVE: null, // Can go to PAUSED, COMPLETED, or CANCELLED
      PAUSED: 'ACTIVE', // Can resume
      COMPLETED: null, // Terminal state
      CANCELLED: null // Terminal state
    };

    return stateFlow[currentState];
  }
}

// Export singleton instance
export const sessionStateMachine = SessionStateMachine.getInstance();
