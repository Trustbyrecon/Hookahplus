"use client";

import React from "react";
import { CheckCircle, Circle, AlertCircle, Lock } from "lucide-react";
import type { OnboardingWorkflow, OnboardingStep } from "../../types/onboarding";
import { cn } from "../../utils/cn";

type OnboardingSidebarProps = {
  workflow: OnboardingWorkflow;
};

function StepIcon({ step }: { step: OnboardingStep }) {
  if (step.status === "complete" || step.status === "skipped") {
    return <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />;
  }
  if (step.status === "blocked") {
    return <Lock className="w-4 h-4 text-amber-500 flex-shrink-0" />;
  }
  if (step.status === "needs_review" || step.status === "needs_input") {
    return <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0" />;
  }
  return <Circle className="w-4 h-4 text-zinc-500 flex-shrink-0" />;
}

export function OnboardingSidebar({ workflow }: OnboardingSidebarProps) {
  return (
    <div className="bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wide mb-4">
        Steps
      </h3>
      <div className="space-y-2">
        {workflow.steps.map((step) => {
          const isActive = step.stepKey === workflow.currentStepKey;
          return (
            <div
              key={step.stepKey}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive && "bg-teal-500/20 border border-teal-500/30",
                !isActive && "border border-transparent"
              )}
            >
              <StepIcon step={step} />
              <span
                className={cn(
                  "text-sm",
                  isActive ? "text-teal-300 font-medium" : "text-zinc-400"
                )}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 pt-4 border-t border-zinc-700">
        <div className="flex justify-between text-xs text-zinc-400">
          <span>Progress</span>
          <span>{workflow.percentComplete}%</span>
        </div>
        <div className="mt-2 h-2 bg-zinc-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-teal-500 rounded-full transition-all duration-300"
            style={{ width: `${workflow.percentComplete}%` }}
          />
        </div>
      </div>
    </div>
  );
}
