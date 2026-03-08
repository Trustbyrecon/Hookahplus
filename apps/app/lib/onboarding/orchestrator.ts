/**
 * H+ Onboarding Engine - Orchestrator
 * Decides step sequence and next step based on workflow state
 */

import type { OnboardingWorkflow, OnboardingStep } from "../../types/onboarding";
import { getStepsForWorkflow } from "./workflow-config";

export function getNextStep(workflow: OnboardingWorkflow): string | null {
  const stepMap = Object.fromEntries(
    workflow.steps.map((step) => [step.stepKey, step])
  );
  const stepOrder = getStepsForWorkflow(workflow.workflowType);

  for (const stepKey of stepOrder) {
    const step = stepMap[stepKey];
    if (!step) continue;
    if (step.status !== "complete" && step.status !== "skipped") {
      return stepKey;
    }
  }

  return null;
}

export function getRecommendedStep(workflow: OnboardingWorkflow): string | null {
  return getNextStep(workflow);
}

/** Compute percent complete from step statuses */
export function computePercentComplete(steps: OnboardingStep[]): number {
  if (steps.length === 0) return 0;
  const completeCount = steps.filter(
    (s) => s.status === "complete" || s.status === "skipped"
  ).length;
  return Math.round((completeCount / steps.length) * 100);
}
