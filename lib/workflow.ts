export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  dependencies: string[];
  estimatedDuration: number; // in minutes
  assignedTo?: string;
  completedAt?: Date;
  notes?: string;
}

export interface FireSession {
  id: string;
  table: string;
  customerLabel: string;
  durationMin: number;
  bufferSec: number;
  zone: string;
  items: number;
  etaMin: number;
  position: string;
  state: 'NEW' | 'PAID_CONFIRMED' | 'PREP_IN_PROGRESS' | 'ACTIVE' | 'CLOSED';
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryZone {
  id: string;
  name: string;
  capacity: number;
  currentLoad: number;
  status: 'available' | 'busy' | 'full';
}

export interface Action {
  id: string;
  type: string;
  sessionId: string;
  userId: string;
  timestamp: Date;
  details: Record<string, any>;
}

export interface User {
  id: string;
  name: string;
  role: 'owner' | 'admin' | 'foh' | 'boh' | 'customer';
  trustLevel: TrustLevel;
}

export type TrustLevel = 'low' | 'medium' | 'high';

export class TrustError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrustError';
  }
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// Mock workflow data
export const mockWorkflows: Workflow[] = [
  {
    id: 'wf-001',
    name: 'Hookah Session Setup',
    description: 'Complete workflow for setting up a new hookah session',
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
    startedAt: new Date(),
    steps: [
      {
        id: 'step-001',
        name: 'Customer Check-in',
        description: 'Welcome customer and confirm reservation',
        status: 'completed',
        dependencies: [],
        estimatedDuration: 5,
        assignedTo: 'foh-staff',
        completedAt: new Date(Date.now() - 10 * 60 * 1000) // 10 minutes ago
      },
      {
        id: 'step-002',
        name: 'Table Assignment',
        description: 'Assign table and prepare seating area',
        status: 'completed',
        dependencies: ['step-001'],
        estimatedDuration: 3,
        assignedTo: 'foh-staff',
        completedAt: new Date(Date.now() - 8 * 60 * 1000) // 8 minutes ago
      },
      {
        id: 'step-003',
        name: 'Hookah Preparation',
        description: 'Prepare hookah with selected flavor',
        status: 'in_progress',
        dependencies: ['step-002'],
        estimatedDuration: 10,
        assignedTo: 'boh-staff',
        notes: 'Blueberry mint flavor requested'
      },
      {
        id: 'step-004',
        name: 'Quality Check',
        description: 'Verify hookah setup and test functionality',
        status: 'pending',
        dependencies: ['step-003'],
        estimatedDuration: 5,
        assignedTo: 'boh-staff'
      },
      {
        id: 'step-005',
        name: 'Delivery to Table',
        description: 'Deliver prepared hookah to customer table',
        status: 'pending',
        dependencies: ['step-004'],
        estimatedDuration: 3,
        assignedTo: 'foh-staff'
      }
    ]
  }
];

export const getWorkflowById = (id: string): Workflow | undefined => {
  return mockWorkflows.find(workflow => workflow.id === id);
};

export const getActiveWorkflows = (): Workflow[] => {
  return mockWorkflows.filter(workflow => workflow.status === 'active');
};

export const updateWorkflowStep = async (workflowId: string, stepId: string, updates: Partial<WorkflowStep>): Promise<void> => {
  const workflow = getWorkflowById(workflowId);
  if (workflow) {
    const step = workflow.steps.find(s => s.id === stepId);
    if (step) {
      Object.assign(step, updates);
      workflow.updatedAt = new Date();
    }
  }
};

export const getNextSteps = (workflowId: string): WorkflowStep[] => {
  const workflow = getWorkflowById(workflowId);
  if (!workflow) return [];

  return workflow.steps.filter(step => {
    if (step.status !== 'pending') return false;
    
    // Check if all dependencies are completed
    return step.dependencies.every(depId => {
      const depStep = workflow.steps.find(s => s.id === depId);
      return depStep?.status === 'completed';
    });
  });
};

export const nextStateWithTrust = async (
  currentState: FireSession['state'],
  action: string,
  trustLevel: TrustLevel,
  sessionId: string
): Promise<FireSession['state']> => {
  // Mock state transition logic with trust verification
  const transitions: Record<string, Record<string, FireSession['state']>> = {
    'NEW': {
      'confirm_payment': 'PAID_CONFIRMED',
      'cancel': 'CLOSED'
    },
    'PAID_CONFIRMED': {
      'start_prep': 'PREP_IN_PROGRESS',
      'cancel': 'CLOSED'
    },
    'PREP_IN_PROGRESS': {
      'complete_prep': 'ACTIVE',
      'cancel': 'CLOSED'
    },
    'ACTIVE': {
      'close': 'CLOSED',
      'extend': 'ACTIVE'
    },
    'CLOSED': {}
  };

  const validTransitions = transitions[currentState];
  if (!validTransitions || !validTransitions[action]) {
    throw new TrustError(`Invalid transition from ${currentState} with action ${action}`);
  }

  // Trust level validation
  if (trustLevel === 'low' && ['cancel', 'close'].includes(action)) {
    throw new TrustError('Insufficient trust level for this action');
  }

  return validTransitions[action];
};
