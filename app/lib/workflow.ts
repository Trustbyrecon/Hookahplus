// app/lib/workflow.ts
export interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  data?: any;
}

export interface Workflow {
  id: string;
  name: string;
  steps: WorkflowStep[];
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export function createWorkflow(name: string, steps: Omit<WorkflowStep, 'status'>[]): Workflow {
  return {
    id: `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name,
    steps: steps.map(step => ({ ...step, status: 'pending' as const })),
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

export function updateWorkflowStep(workflow: Workflow, stepId: string, status: WorkflowStep['status'], data?: any): Workflow {
  return {
    ...workflow,
    steps: workflow.steps.map(step => 
      step.id === stepId 
        ? { ...step, status, data: data || step.data }
        : step
    ),
    updatedAt: new Date(),
  };
}

export function getWorkflowStatus(workflow: Workflow): Workflow['status'] {
  const hasFailed = workflow.steps.some(step => step.status === 'failed');
  if (hasFailed) return 'failed';
  
  const allCompleted = workflow.steps.every(step => step.status === 'completed');
  if (allCompleted) return 'completed';
  
  const hasInProgress = workflow.steps.some(step => step.status === 'in_progress');
  if (hasInProgress) return 'in_progress';
  
  return 'pending';
}

// Trust-related workflow functions
export function nextStateWithTrust(currentState: string, action: string, trustLevel: number): string {
  if (trustLevel < 0.5) {
    throw new TrustError('Insufficient trust level for this action');
  }
  
  // Simple state machine logic
  const stateTransitions: Record<string, Record<string, string>> = {
    'pending': { 'start': 'in_progress', 'cancel': 'cancelled' },
    'in_progress': { 'complete': 'completed', 'pause': 'paused' },
    'paused': { 'resume': 'in_progress', 'cancel': 'cancelled' },
    'completed': {},
    'cancelled': {},
    'failed': { 'retry': 'pending' }
  };
  
  const nextState = stateTransitions[currentState]?.[action];
  if (!nextState) {
    throw new TrustError(`Invalid transition from ${currentState} with action ${action}`);
  }
  
  return nextState;
}

export class TrustError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TrustError';
  }
}
