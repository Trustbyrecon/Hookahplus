"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { Button } from "../ui/button";
import type { OnboardingWorkflow } from "../../types/onboarding";
import { getStepsForWorkflow } from "../../lib/onboarding/workflow-config";

function apiUrl(path: string, params: Record<string, string> = {}): string {
  const search = new URLSearchParams(params).toString();
  return `${path}${search ? `?${search}` : ""}`;
}

type StepActionBarProps = {
  workflow: OnboardingWorkflow;
  onRefresh: () => Promise<void>;
  demoMode?: boolean;
};

export function StepActionBar({ workflow, onRefresh, demoMode }: StepActionBarProps) {
  const demoParams: Record<string, string> = demoMode ? { mode: "demo" } : {};
  const [isSaving, setIsSaving] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const stepOrder = getStepsForWorkflow(workflow.workflowType);
  const currentIndex = stepOrder.indexOf(workflow.currentStepKey);
  const prevStep = currentIndex > 0 ? stepOrder[currentIndex - 1] : null;
  const nextStep = currentIndex >= 0 && currentIndex < stepOrder.length - 1 ? stepOrder[currentIndex + 1] : null;
  const isLastStep = currentIndex >= 0 && currentIndex === stepOrder.length - 1;

  const handleBack = async () => {
    if (prevStep) {
      try {
        const res = await fetch(apiUrl("/api/onboarding/workflow", demoParams), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            workflowId: workflow.workflowId,
            currentStepKey: prevStep,
          }),
        });
        if (res.ok) await onRefresh();
      } catch (err) {
        console.error("[StepActionBar] back", err);
      }
    }
  };

  const handleContinue = async () => {
    if (!nextStep && !isLastStep) return;
    setCompleteError(null);
    setIsCompleting(true);
    try {
      const validateRes = await fetch(apiUrl("/api/onboarding/validate", demoParams), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: workflow.workflowId,
          stepKey: workflow.currentStepKey,
        }),
      });
      const validateData = await validateRes.json();
      if (validateData.status !== "complete") {
        const msg = Array.isArray(validateData.errors) && validateData.errors.length > 0
          ? validateData.errors.join(". ")
          : "Save draft first, then complete all checklist items.";
        setCompleteError(msg);
        await onRefresh();
        return;
      }
      const res = await fetch(apiUrl("/api/onboarding/transition", demoParams), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: workflow.workflowId,
          currentStepKey: workflow.currentStepKey,
        }),
      });
      const transitionData = await res.json();
      if (!res.ok) {
        setCompleteError(transitionData.error || transitionData.details || "Failed to complete");
        return;
      }
      await onRefresh();
    } catch (err) {
      console.error("[StepActionBar] transition", err);
      setCompleteError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="space-y-3 pt-4 border-t border-zinc-700">
      {completeError && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-sm text-amber-200">
          {completeError}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {prevStep && (
            <Button variant="outline" size="sm" onClick={handleBack} disabled={isCompleting}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={isSaving || isCompleting}
            onClick={async () => {
              setIsSaving(true);
              setCompleteError(null);
              try {
                await onRefresh();
              } finally {
                setIsSaving(false);
              }
            }}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? "Refreshing..." : "Refresh"}
          </Button>
          {(nextStep || isLastStep) && (
            <Button size="sm" onClick={handleContinue} disabled={isCompleting}>
              {isCompleting ? "Completing..." : isLastStep ? "Complete" : "Continue"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
