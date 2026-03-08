"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import type { OnboardingWorkflow } from "../../types/onboarding";

type BlockerBannerProps = {
  workflow: OnboardingWorkflow;
};

export function BlockerBanner({ workflow }: BlockerBannerProps) {
  const blockedSteps = workflow.steps.filter(
    (s) => s.status === "blocked" && s.blockingReason
  );
  const needsReview = workflow.steps.filter((s) => s.status === "needs_review");
  const needsInput = workflow.steps.filter((s) => s.status === "needs_input");
  const allErrors = workflow.steps.flatMap((s) => s.errors);

  if (blockedSteps.length === 0 && needsReview.length === 0 && needsInput.length === 0 && allErrors.length === 0) {
    return null;
  }

  const messages: string[] = [];
  if (blockedSteps.length > 0) {
    messages.push(...blockedSteps.map((s) => `${s.title}: ${s.blockingReason}`));
  }
  if (needsReview.length > 0) {
    messages.push(`${needsReview.length} step(s) need review`);
  }
  if (needsInput.length > 0) {
    messages.push(`${needsInput.length} step(s) need input`);
  }
  if (allErrors.length > 0) {
    messages.push(...allErrors.slice(0, 3));
  }

  return (
    <div className="flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
      <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-medium text-amber-300">Attention needed</p>
        <ul className="mt-1 text-sm text-amber-200/90 list-disc list-inside space-y-1">
          {messages.map((msg, i) => (
            <li key={i}>{msg}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
