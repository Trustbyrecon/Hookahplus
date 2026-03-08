import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireRole } from "../../../../lib/auth";
import { getNextStep } from "../../../../lib/onboarding/orchestrator";
import { validateStep } from "../../../../lib/onboarding/validators";
import type { OnboardingWorkflow, OnboardingStep } from "../../../../types/onboarding";

function mapDbToWorkflow(
  w: { id: string; loungeId: string; tenantId: string | null; workflowType: string; overallStatus: string; currentStepKey: string; percentComplete: number; createdAt: Date; updatedAt: Date; steps: Array<{ stepKey: string; title: string; status: string; orderIndex: number; required: boolean; dataJson: unknown; errorsJson: unknown; warningsJson: unknown; blockingReason: string | null; updatedAt: Date }> }
): OnboardingWorkflow {
  const steps: OnboardingStep[] = w.steps.map((s) => ({
    stepKey: s.stepKey,
    title: s.title,
    status: s.status as OnboardingStep["status"],
    order: s.orderIndex,
    required: s.required,
    data: (s.dataJson as Record<string, unknown>) ?? {},
    errors: Array.isArray(s.errorsJson) ? (s.errorsJson as string[]) : [],
    warnings: Array.isArray(s.warningsJson) ? (s.warningsJson as string[]) : [],
    blockingReason: s.blockingReason ?? undefined,
    updatedAt: s.updatedAt.toISOString(),
  }));

  return {
    workflowId: w.id,
    loungeId: w.loungeId,
    tenantId: w.tenantId,
    workflowType: w.workflowType,
    overallStatus: w.overallStatus as OnboardingWorkflow["overallStatus"],
    currentStepKey: w.currentStepKey,
    steps,
    percentComplete: w.percentComplete,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  };
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    try {
      await requireRole(req, ["owner", "admin", "staff"]);
    } catch (authError) {
      return NextResponse.json(
        { error: "Authentication required", details: authError instanceof Error ? authError.message : "Unknown" },
        { status: 401 }
      );
    }
  }

  let body: { workflowId?: string; currentStepKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const workflowId = (body.workflowId ?? "").trim();
  const currentStepKey = (body.currentStepKey ?? "").trim();

  if (!workflowId || !currentStepKey) {
    return NextResponse.json({ error: "workflowId and currentStepKey are required" }, { status: 400 });
  }

  try {
    const workflow = await prisma.onboardingWorkflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { orderIndex: "asc" } } },
    });

    if (!workflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
    }

    const currentStep = workflow.steps.find((s) => s.stepKey === currentStepKey);
    if (!currentStep) {
      return NextResponse.json({ error: "Current step not found" }, { status: 404 });
    }

    const data = (currentStep.dataJson as Record<string, unknown>) ?? {};
    const validation = validateStep(currentStepKey, data);

    if (validation.status !== "complete") {
      await prisma.onboardingStep.update({
        where: { workflowId_stepKey: { workflowId, stepKey: currentStepKey } },
        data: {
          status: validation.status,
          errorsJson: validation.errors,
          warningsJson: validation.warnings,
        },
      });
      return NextResponse.json(
        {
          success: false,
          status: validation.status,
          errors: validation.errors,
          warnings: validation.warnings,
        },
        { status: 400 }
      );
    }

    await prisma.onboardingStep.update({
      where: { workflowId_stepKey: { workflowId, stepKey: currentStepKey } },
      data: { status: "complete", errorsJson: [], warningsJson: [] },
    });

    const updatedWorkflow = await prisma.onboardingWorkflow.findUnique({
      where: { id: workflowId },
      include: { steps: { orderBy: { orderIndex: "asc" } } },
    });

    if (!updatedWorkflow) {
      return NextResponse.json({ error: "Workflow not found" }, { status: 500 });
    }

    const workflowForOrchestrator = mapDbToWorkflow({
      ...updatedWorkflow,
      steps: updatedWorkflow.steps.map((s) =>
        s.stepKey === currentStepKey ? { ...s, status: "complete" } : s
      ),
    });
    const nextStepKey = getNextStep(workflowForOrchestrator);

    let overallStatus = workflow.overallStatus;
    if (nextStepKey) {
      await prisma.onboardingWorkflow.update({
        where: { id: workflowId },
        data: { currentStepKey: nextStepKey },
      });
      await prisma.onboardingStep.updateMany({
        where: { workflowId, stepKey: nextStepKey },
        data: { status: "in_progress" },
      });
    } else {
      overallStatus = "complete";
      await prisma.onboardingWorkflow.update({
        where: { id: workflowId },
        data: { overallStatus: "complete", percentComplete: 100 },
      });
    }

    return NextResponse.json({
      nextStepKey,
      overallStatus,
      success: true,
    });
  } catch (err) {
    console.error("[Onboarding POST transition]", err);
    return NextResponse.json(
      { error: "Failed to transition", details: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
