"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import type { OnboardingWorkflow } from "../../types/onboarding";
import { OnboardingSidebar } from "./OnboardingSidebar";
import { ProgressHeader } from "./ProgressHeader";
import { BlockerBanner } from "./BlockerBanner";
import { StepRenderer } from "./StepRenderer";
import { StepActionBar } from "./StepActionBar";
import { OnboardingSupportRail } from "./OnboardingSupportRail";
import { WorkflowSetupStep } from "./WorkflowSetupStep";

export type OnboardingShellProps = {
  loungeId: string;
  demoMode?: boolean;
};

function apiUrl(path: string, params: Record<string, string> = {}): string {
  const search = new URLSearchParams(params).toString();
  return `${path}${search ? `?${search}` : ""}`;
}

export function OnboardingShell({ loungeId, demoMode }: OnboardingShellProps) {
  const [workflow, setWorkflow] = useState<OnboardingWorkflow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkflow = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: Record<string, string> = { loungeId };
      if (demoMode) params.mode = "demo";
      const res = await fetch(apiUrl("/api/onboarding/workflow", params));
      const data = await res.json();
      if (!res.ok) {
        const msg = [data.error, data.details, data.hint].filter(Boolean).join(" — ");
        throw new Error(msg || "Failed to load workflow");
      }
      setWorkflow(data.workflow ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load workflow");
      setWorkflow(null);
    } finally {
      setIsLoading(false);
    }
  }, [loungeId, demoMode]);

  useEffect(() => {
    fetchWorkflow();
  }, [fetchWorkflow]);

  const createWorkflow = useCallback(
    async (workflowType: string) => {
      try {
        const params: Record<string, string> = {};
        if (demoMode) params.mode = "demo";
        const url = apiUrl("/api/onboarding/workflow", params);
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ loungeId, workflowType }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create workflow");
        setWorkflow(data.workflow);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create workflow");
      }
    },
    [loungeId, demoMode]
  );

  const saveStepDraft = useCallback(
    async (stepKey: string, data: Record<string, unknown>) => {
      if (!workflow) return;
      try {
        const url = apiUrl("/api/onboarding/step", demoMode ? { mode: "demo" } : {});
        const res = await fetch(url, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workflowId: workflow.workflowId, stepKey, data }),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || "Failed to save");
        await fetchWorkflow();
      } catch (err) {
        console.error("[OnboardingShell] saveStepDraft", err);
        throw err;
      }
    },
    [workflow, fetchWorkflow, demoMode]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-xl">
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <WorkflowSetupStep
        loungeId={loungeId}
        onWorkflowCreated={createWorkflow}
      />
    );
  }

  if (workflow.overallStatus === "complete") {
    return (
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-3">
          <OnboardingSidebar workflow={workflow} />
        </aside>
        <main className="col-span-6 space-y-6">
          <div className="p-8 bg-green-900/20 border border-green-600/40 rounded-xl text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Onboarding complete</h2>
            <p className="text-zinc-400 mb-6">
              {workflow.loungeId} is ready. Head to your dashboard to start managing sessions.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={`/fire-session-dashboard?lounge=${workflow.loungeId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 rounded-lg text-white font-semibold transition-colors"
              >
                Open Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href={`/dashboard?lounge=${workflow.loungeId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-zinc-700 hover:bg-zinc-600 rounded-lg text-white font-medium transition-colors"
              >
                Lounge Settings
              </Link>
            </div>
          </div>
        </main>
        <section className="col-span-3">
          <OnboardingSupportRail workflow={workflow} />
        </section>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      <aside className="col-span-3">
        <OnboardingSidebar workflow={workflow} />
      </aside>

      <main className="col-span-6 space-y-4">
        <ProgressHeader workflow={workflow} />
        <BlockerBanner workflow={workflow} />
        <StepRenderer
          workflow={workflow}
          onSaveDraft={saveStepDraft}
        />
        <StepActionBar
          workflow={workflow}
          onRefresh={fetchWorkflow}
          demoMode={demoMode}
        />
      </main>

      <section className="col-span-3">
        <OnboardingSupportRail workflow={workflow} />
      </section>
    </div>
  );
}
