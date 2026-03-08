"use client";

import React from "react";
import type { OnboardingWorkflow } from "../../types/onboarding";

type ProgressHeaderProps = {
  workflow: OnboardingWorkflow;
};

export function ProgressHeader({ workflow }: ProgressHeaderProps) {
  const currentStep = workflow.steps.find((s) => s.stepKey === workflow.currentStepKey);

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold text-white">
          {workflow.loungeId} Onboarding
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          {workflow.workflowType.replace(/_/g, " ")} · {workflow.overallStatus.replace(/_/g, " ")}
        </p>
      </div>
      <div className="text-right">
        <p className="text-sm text-zinc-400">Current step</p>
        <p className="text-teal-400 font-medium">{currentStep?.title ?? workflow.currentStepKey}</p>
      </div>
    </div>
  );
}
