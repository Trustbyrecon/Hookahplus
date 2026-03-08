/**
 * H+ Onboarding Engine - Workflow Type Inference
 * Derives workflowType from operator inputs (ADR-002)
 */

import type { WorkflowSetupAnswers } from "../../types/onboarding";
import { getStepsForWorkflow } from "./workflow-config";

export type InferredWorkflowType =
  | "square_standard"
  | "clover_qr_preorder"
  | "toast_standard"
  | "manual_basic";

export function inferWorkflowType(answers: WorkflowSetupAnswers): InferredWorkflowType {
  const { posType, qrPreordersEnabled, stripeCheckoutEnabled } = answers;

  if (posType === "manual") {
    return "manual_basic";
  }

  if (posType === "square") {
    return "square_standard";
  }

  if (posType === "clover" && (qrPreordersEnabled || stripeCheckoutEnabled)) {
    return "clover_qr_preorder";
  }

  if (posType === "clover") {
    return "clover_qr_preorder"; // Default clover path includes QR
  }

  if (posType === "toast") {
    return "toast_standard";
  }

  return "manual_basic";
}

/** Check if workflow is provisional (no POS selected, may need upgrade) */
export function isProvisionalWorkflow(answers: WorkflowSetupAnswers): boolean {
  return answers.posType === "manual";
}
