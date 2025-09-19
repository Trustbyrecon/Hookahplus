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
