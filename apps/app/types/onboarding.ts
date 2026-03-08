/**
 * H+ Onboarding Engine Types
 * Composable operator onboarding with unified workflow state
 */

export type StepStatus =
  | "not_started"
  | "in_progress"
  | "needs_input"
  | "needs_review"
  | "blocked"
  | "complete"
  | "skipped"
  | "live";

export type WorkflowStatus =
  | "not_started"
  | "in_progress"
  | "blocked"
  | "needs_review"
  | "complete"
  | "live";

export type OnboardingStep = {
  stepKey: string;
  title: string;
  status: StepStatus;
  order: number;
  required: boolean;
  data: Record<string, unknown>;
  errors: string[];
  warnings: string[];
  blockingReason?: string;
  updatedAt?: string;
};

export type OnboardingWorkflow = {
  workflowId: string;
  loungeId: string;
  tenantId?: string | null;
  workflowType: string;
  overallStatus: WorkflowStatus;
  currentStepKey: string;
  steps: OnboardingStep[];
  percentComplete: number;
  createdAt: string;
  updatedAt: string;
};

/** Operator inputs for workflow type inference (WorkflowSetupStep) */
export type WorkflowSetupAnswers = {
  posType: "square" | "clover" | "toast" | "manual";
  qrPreordersEnabled?: boolean;
  stripeCheckoutEnabled?: boolean;
  multiLocation?: boolean;
};
