"use client";

import React from "react";
import type { OnboardingWorkflow } from "../../types/onboarding";
import { LoungeIdentityStep } from "./steps/LoungeIdentityStep";
import { PricingLockStep } from "./steps/PricingLockStep";
import { POSConnectionStep } from "./steps/POSConnectionStep";
import { QRPaymentsStep } from "./steps/QRPaymentsStep";
import { GoLiveCheckStep } from "./steps/GoLiveCheckStep";

const stepComponentMap: Record<
  string,
  React.ComponentType<{
    workflow: OnboardingWorkflow;
    stepData: Record<string, unknown>;
    onSaveDraft: (stepKey: string, data: Record<string, unknown>) => Promise<void>;
  }>
> = {
  lounge_identity: LoungeIdentityStep,
  pricing_lock: PricingLockStep,
  pos_connection: POSConnectionStep,
  qr_payments: QRPaymentsStep,
  go_live_check: GoLiveCheckStep,
};

type StepRendererProps = {
  workflow: OnboardingWorkflow;
  onSaveDraft: (stepKey: string, data: Record<string, unknown>) => Promise<void>;
};

export function StepRenderer({ workflow, onSaveDraft }: StepRendererProps) {
  const StepComponent = stepComponentMap[workflow.currentStepKey];
  const currentStep = workflow.steps.find((s) => s.stepKey === workflow.currentStepKey);
  const stepData = (currentStep?.data ?? {}) as Record<string, unknown>;

  if (!StepComponent) {
    return (
      <div className="p-6 bg-zinc-800/50 border border-zinc-700 rounded-xl">
        <p className="text-zinc-400">
          Unknown step: {workflow.currentStepKey}
        </p>
      </div>
    );
  }

  return (
    <div id={`step-${workflow.currentStepKey}`} className="bg-zinc-800/50 border border-zinc-700 rounded-xl overflow-hidden">
      <StepComponent
        workflow={workflow}
        stepData={stepData}
        onSaveDraft={onSaveDraft}
      />
    </div>
  );
}
