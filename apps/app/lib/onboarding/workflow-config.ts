/**
 * H+ Onboarding Engine - Workflow Configuration
 * Defines step sequences per workflow type
 */

export const workflowConfig: Record<string, string[]> = {
  square_standard: [
    "lounge_identity",
    "pricing_lock",
    "pos_connection",
    "qr_payments",
    "go_live_check",
  ],
  clover_qr_preorder: [
    "lounge_identity",
    "pricing_lock",
    "pos_connection",
    "qr_payments",
    "go_live_check",
  ],
  toast_standard: [
    "lounge_identity",
    "pricing_lock",
    "pos_connection",
    "qr_payments",
    "go_live_check",
  ],
  manual_basic: [
    "lounge_identity",
    "pricing_lock",
    "qr_payments",
    "go_live_check",
  ],
};

export type WorkflowType = keyof typeof workflowConfig;

export function getStepsForWorkflow(workflowType: string): string[] {
  return workflowConfig[workflowType] ?? workflowConfig.manual_basic;
}
