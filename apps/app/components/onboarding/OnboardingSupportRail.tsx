"use client";

import React from "react";
import { HelpCircle, Lightbulb } from "lucide-react";
import type { OnboardingWorkflow } from "../../types/onboarding";
import { getRecommendedStep } from "../../lib/onboarding/orchestrator";

type OnboardingSupportRailProps = {
  workflow: OnboardingWorkflow;
};

export function OnboardingSupportRail({ workflow }: OnboardingSupportRailProps) {
  const nextStepKey = getRecommendedStep(workflow);
  const nextStep = nextStepKey
    ? workflow.steps.find((s) => s.stepKey === nextStepKey)
    : null;

  return (
    <div className="space-y-4">
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-2">
          <Lightbulb className="w-4 h-4" />
          Next step
        </h3>
        <p className="text-sm text-zinc-400">
          {nextStep
            ? `Complete ${nextStep.title} to continue.`
            : workflow.overallStatus === "complete" || workflow.overallStatus === "live"
              ? "You're all set!"
              : "Continue through the steps above."}
        </p>
      </div>
      <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-4">
        <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2 mb-2">
          <HelpCircle className="w-4 h-4" />
          Need help?
        </h3>
        <p className="text-sm text-zinc-400">
          Contact support or check the documentation for guidance.
        </p>
      </div>
    </div>
  );
}
